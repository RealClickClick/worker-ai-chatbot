import { sendMessage, sendMessageWithId, editMessage, deleteMessage, sendChatAction } from '../telegram.ts';
import { handleCommand } from './command.ts';
import { handleCallbackQuery } from './callback.ts';
import { handleReminderMessage, handleCancelCommand } from './reminder.ts';
import { handleInlineQuery } from './inline.ts';
import { t, getLang, matchLanguage, getLanguageDisplay, getEffectiveSource, getEffectiveTarget, isTranslationActive } from '../locales.ts';
import { buildSystemPrompt, buildGroupSystemPrompt, getLengthRule, getTokenLimit, runChatStreaming, runChat, cleanAIResponseText, buildReplyMarkup, MODELS, estimateCharLimit } from '../ai.ts';
import { runEnsemble, parseEnsembleModels } from '../services/ensemble.service.ts';
import { routeModel, logRouting } from '../services/router.service.ts';
import { parseMarkdownToTelegramHTML } from '../parsers/htmlParser.ts';
import { MAX_MESSAGE_LENGTH, MAX_HISTORY_MESSAGES, TOKEN_LIMIT_CODE_BOOST, SUMMARY_HISTORY_COUNT, SUMMARY_TRUNCATE, SILENT_MARKER } from '../constants.ts';
import {
  getSettings, getChatHistory, addChatMessage,
  checkRateLimit, trackMessage, trackTiming, isBlocked,
  setTranslatePending, setTranslateSource, setTranslateTarget,
  getAdaptationContext, getRagContext,
  generateAndStoreSummary, getMemoryContext, shouldSummarize, getOldMessages,
  recordInteraction,
} from '../services/index.ts';
import { getToolDescriptions, parseToolCall, executeToolCall, TOOL_CALL_OPEN, MAX_TOOL_TURNS } from '../tools/index.ts';
import { buildGroupContext, storeGroupMessageAndGetInfo, storeBotGroupMessage } from '../group-context.ts';
import { getThinkingEmoji } from '../../config/persona-emojis.ts';
import { logger } from '../utils/logger.ts';
import { getCachedResponse, setCachedResponse } from '../utils/cache.ts';
import { isGroupChat, isBotMentioned, isReplyToBot, isCodeRequest } from '../utils/media.ts';
import { processMedia, processUrlsInMessage, buildMultiModalContext, handleMultiModalOutput } from '../services/media-pipeline.service.ts';
import { handleDebateMessage } from './debate.ts';
import { safe } from '../utils/error.ts';
import { registry } from '../plugins/registry.ts';
import { handleModeMessageWithState } from '../modes/registry.ts';
import type { Env, TelegramUpdate, TelegramMessage, UserSettings } from '../types/env.d.ts';
import type { PluginContext } from '../plugins/types.ts';

function buildSystemContext(settings: UserSettings, userName: string, lang: string, lengthRule: string, isIncognito: boolean, contextAdditions: string, isGroup = false, env?: Env): string {
  const isTranslateMode = contextAdditions.includes('Translation Mode');
  const botName = settings.bot_name || env?.BOT_NAME || undefined;
  let systemContent = isGroup ? buildGroupSystemPrompt(settings.persona, userName, lang, lengthRule, botName) : buildSystemPrompt(settings.persona, userName, lang, lengthRule, botName);
  if (isTranslateMode) {
    systemContent = systemContent.replace(/^\s*(Always respond in\..*|همیشه به فارسی پاسخ دهید\.|تحدث بالعربية دائماً\.|Her zaman Türkçe cevap ver\.|Отвечай всегда на русском\.)\s*$/m, '');
  }
  if (isIncognito) systemContent += `\n\n[${t(lang, 'incognito_badge')}]`;
  if (settings.programming_lang) {
    systemContent += `\n\n[Preferred Programming Language: ${settings.programming_lang}]`;
  }
  if (settings.custom_instructions) {
    systemContent += `\n\n[Custom Instructions: ${settings.custom_instructions}]`;
  }
  if (env?.BOT_DESCRIPTION) {
    systemContent += `\n\n${env.BOT_DESCRIPTION}`;
  }
  if (contextAdditions) systemContent += `\n\n${contextAdditions}`;
  return systemContent;
}

async function addAdaptationContext(systemContent: string, env: Env, chatId: number | string): Promise<string> {
  try {
    const adaptationCtx = await getAdaptationContext(env, chatId);
    if (adaptationCtx) systemContent += `\n\n${adaptationCtx}`;
  } catch {}
  return systemContent;
}

export async function handleTelegramUpdate(update: TelegramUpdate, env: Env): Promise<void> {
  if (update.inline_query) {
    await handleInlineQuery(update.inline_query, env);
    return;
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query, env);
    return;
  }

  const isEdit = !!update.edited_message;
  const message = update.edited_message || update.message;
  if (!message) return;

  if (isEdit) {
    logger.info('Edited message received', { chatId: message.chat.id, messageId: message.message_id });
  }

  const chatId = message.chat.id;

  if (await isBlocked(env, chatId)) return;

  const userId = message.from?.id;
  const isGroup = isGroupChat(message);
  const settings = await getSettings(env, chatId, isGroup ? userId : undefined);
  const lang = getLang(message.from, settings.lang, message.text || message.caption);
  const userName = message.from!.first_name || 'User';
  const sessionId = settings.active_session || 'default';

  const pluginCtx: PluginContext = { env, chatId, lang, userName, message, update };
  if (await registry.dispatchOnMessage(pluginCtx)) return;

  if (isGroupChat(message)) {
    const msgText = message.text || message.caption || '';
    const isMention = isBotMentioned(message, env);
    const isReply = isReplyToBot(message);
    if (!isMention && !isReply) return;
    if (isMention && msgText) {
      const cleaned = msgText.replace(/@\w+/g, '').trim();
      if (message.text) message.text = cleaned;
      if (message.caption) message.caption = cleaned;
      if (!cleaned && !message.photo && !message.document && !message.voice) return;
    }
  }

  const msgText = message.text || message.caption || '';

  // --- Translation Mode: handle pending language selection ---
  if (settings.translate_pending && msgText && !msgText.startsWith('/')) {
    const pending = settings.translate_pending; // 'source' or 'target'
    const match = matchLanguage(msgText, lang);
    if (match) {
      await setTranslatePending(env, chatId, null);
      if (pending === 'source') {
        await setTranslateSource(env, chatId, match.code);
      } else {
        await setTranslateTarget(env, chatId, match.code);
      }
      const newSettings = { ...settings, translate_target: pending === 'target' ? match.code : settings.translate_target, translate_source: pending === 'source' ? match.code : settings.translate_source };
      const srcName = getLanguageDisplay(getEffectiveSource(newSettings, lang) || lang, lang);
      const tgtName = getLanguageDisplay(getEffectiveTarget(newSettings, lang) || lang, lang);
      await sendMessage(chatId, t(lang, 'translate_mode_title', { source: srcName, target: tgtName }), env, 'Markdown');
      return;
    } else {
      await setTranslatePending(env, chatId, null);
      await sendMessage(chatId, t(lang, 'translate_mode_unknown_lang', { input: msgText.slice(0, 50) }), env);
      return;
    }
  }

  const consumed = await handleDebateMessage(env, chatId, msgText, lang);
  if (consumed) return;

  const reminderConsumed = await handleReminderMessage(chatId, msgText, env, lang);
  if (reminderConsumed) return;

  const rateTier = message.photo || message.document || message.voice ? 'expensive' : 'basic';
  if (!(await checkRateLimit(env, chatId, rateTier))) {
    return await sendMessage(chatId, t(lang, 'rate_limited'), env);
  }

  // --- Mode System ---
  if (settings.active_mode) {
    const modeCtx = { env, chatId, userId: message.from?.id || 0, userName, lang, modeData: settings.mode_data };
    const modeResult = await handleModeMessageWithState(modeCtx, msgText, message, settings.active_mode);
    if (modeResult?.consumed) {
      if (modeResult.response) {
        await sendMessage(chatId, modeResult.response, env, 'Markdown', modeResult.replyMarkup);
      }
      return;
    }
  }

  let userMessage: string | undefined;
  let contextAdditions = '';

  if (isEdit) {
    contextAdditions += '\n[User edited their previous message. Respond to the new version.]';
  }

  try {
    const sessionId = settings.active_session || 'default';
    const pipelineResult = await processMedia(chatId, message, env, lang, sessionId);
    if (pipelineResult) {
      userMessage = pipelineResult.userMessage;
      contextAdditions = pipelineResult.contextAdditions;
    } else if (message.text) {
      userMessage = message.text;
    } else { return; }

    if (userMessage && userMessage.length > 10000) {
      userMessage = userMessage.slice(0, 10000);
    }
  } catch (e: any) {
    const errMsg = e.message === 'File too large' ? 'file_too_large' : 'server_error';
    logger.error('Message processing error', { chatId, error: e.message });
    return await sendMessage(chatId, t(lang, errMsg), env);
  }

  contextAdditions = await processUrlsInMessage(userMessage || '', chatId, env, lang, contextAdditions);

  // --- Translation Mode: translate user message to target language ---
  const translateActive = isTranslationActive(settings, lang);
  let originalUserMessage = userMessage;
  let detectedSrcLang: string | null = null;
  if (translateActive && userMessage && !userMessage.startsWith('/')) {
    const srcLang = getEffectiveSource(settings, lang);
    const tgtLang = getEffectiveTarget(settings, lang);
    if (tgtLang) {
      await sendChatAction(chatId, env, 'typing');
      const langNameAI = (src: string) => ({ en: 'English', fa: 'Persian', ar: 'Arabic', tr: 'Turkish', ru: 'Russian', fr: 'French', de: 'German', es: 'Spanish', it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi', ur: 'Urdu', nl: 'Dutch', sv: 'Swedish', pl: 'Polish', el: 'Greek', he: 'Hebrew', th: 'Thai', vi: 'Vietnamese' }[src] || src);
      const translatePrompt = srcLang
        ? `Translate the following text from ${langNameAI(srcLang)} to ${langNameAI(tgtLang)}. Return ONLY the translated text, no explanations, no notes:\n\n${userMessage}`
        : `Detect the language of the following text and translate it to ${langNameAI(tgtLang)}. Return ONLY the translated text, no explanations, no notes:\n\n${userMessage}`;
      const translateTokens = getTokenLimit('medium', { modelKey: 'fast' });
      const translated = await safe(() => runChat(env, [{ role: 'user', content: translatePrompt }], translateTokens, 'fast'), 'translateModeMsg');
      if (translated) {
        const actualSrc = srcLang || lang || 'en';
        contextAdditions += `\n[🌐 Translation Mode: User message translated to ${tgtLang.toUpperCase()}. Original: "${userMessage.slice(0, 200)}"]`;
        contextAdditions += `\n[IMPORTANT: Overrides all previous language instructions. The user's language is ${langNameAI(actualSrc)}. Always respond in ${langNameAI(tgtLang)}. The user will see your response translated back to ${langNameAI(actualSrc)}.]`;
        originalUserMessage = userMessage;
        userMessage = translated;
        detectedSrcLang = actualSrc;
      }
    }
  }

  if (!userMessage) return;

  if (env && !isEdit) {
    recordInteraction(env, chatId, userMessage).catch(() => {});
  }

  if (userMessage.startsWith('/')) {
    const cmd = userMessage.split(' ')[0].toLowerCase();
    const args = userMessage.substring(cmd.length).trim();
    if ((await handleCommand(chatId, cmd, args, env, lang, userName, settings, isGroup ? userId : undefined)) !== null) return;
    if (!contextAdditions) return await sendMessage(chatId, t(lang, 'invalid_command'), env);
  }

  const isIncognito = !settings.memory_enabled;
  let tokenLimit = getTokenLimit(settings.response_length, { modelKey: settings.ai_model });
  let lengthRule = getLengthRule(settings.response_length, lang);

  const multiModalCtx = await buildMultiModalContext(env, chatId, sessionId, lang);
  if (multiModalCtx) {
    contextAdditions += `\n${multiModalCtx}`;
  }

  let chatHistory: any[];
  let systemContent = buildSystemContext(settings as UserSettings, userName, lang, lengthRule, isIncognito, contextAdditions, isGroup, env);

  let currentThreadId: string | null = null;
  if (isGroup) {
    try {
      if (!isIncognito && env.DB && message.from) {
        currentThreadId = await storeGroupMessageAndGetInfo(env, chatId, message, 'user', userMessage);
      }
      systemContent = buildSystemContext(settings as UserSettings, userName, lang, lengthRule, isIncognito, contextAdditions, true, env);
      if (isCodeRequest(userMessage) && tokenLimit < TOKEN_LIMIT_CODE_BOOST) {
        tokenLimit = TOKEN_LIMIT_CODE_BOOST;
        lengthRule = getLengthRule('long', lang);
        systemContent = buildSystemContext(settings as UserSettings, userName, lang, lengthRule, isIncognito, contextAdditions, true, env);
        systemContent += `\n[NOTE: Token limit boosted to ${tokenLimit} for this code request.]`;
      }
      if (message.from) {
        const groupContextStr = await buildGroupContext(env, chatId, message.from.id, message);
        if (groupContextStr) systemContent += `\n\n${groupContextStr}`;
      }
    } catch (e: any) {
      logger.error('Group context error, falling back to standard behavior', { chatId, error: e.message });
    }
    chatHistory = [{ role: 'user', content: userMessage }];
  } else {
    chatHistory = isIncognito ? [] : await getChatHistory(env, chatId, sessionId, MAX_HISTORY_MESSAGES);
    systemContent = buildSystemContext(settings as UserSettings, userName, lang, lengthRule, isIncognito, contextAdditions, false, env);

    if (isCodeRequest(userMessage) && tokenLimit < TOKEN_LIMIT_CODE_BOOST) {
      tokenLimit = TOKEN_LIMIT_CODE_BOOST;
      lengthRule = getLengthRule('long', lang);
      systemContent = buildSystemContext(settings as UserSettings, userName, lang, lengthRule, isIncognito, contextAdditions, false, env);
      systemContent += `\n[NOTE: Token limit boosted to ${tokenLimit} for this code request.]`;
    }

    if (shouldSummarize(chatHistory.length)) {
      const oldMessages = getOldMessages(chatHistory, SUMMARY_HISTORY_COUNT);
      const memoryCtx = await getMemoryContext(env, chatId, sessionId);
      if (memoryCtx) {
        systemContent += memoryCtx;
      } else {
        const summary = await generateAndStoreSummary(env, chatId, sessionId, oldMessages, lang);
        if (summary) {
          systemContent += `\n\n[Earlier conversation summary:\n${summary}\n]`;
        }
      }
      chatHistory = chatHistory.slice(SUMMARY_HISTORY_COUNT);
    }

    chatHistory.push({ role: 'user', content: userMessage });
  }

  systemContent = await addAdaptationContext(systemContent, env, chatId);

  const ragCtx = await getRagContext(env, chatId, userMessage || msgText);
  if (ragCtx) systemContent += ragCtx;

  let activeModelKey = settings.ai_model;
  let activeTokenLimit = tokenLimit;
  try {
    const routeResult = routeModel(userMessage || msgText, settings.ai_model, MODELS);
    if (routeResult.routed) {
      activeModelKey = routeResult.modelKey;
      activeTokenLimit = getTokenLimit(settings.response_length, { modelKey: activeModelKey });
      systemContent += `\n\n[Auto-routed to ${routeResult.modelKey} for ${routeResult.type}]`;
      logRouting(env, chatId, userMessage || msgText, settings.ai_model, activeModelKey, routeResult.type, routeResult.confidence).catch(() => {});
    }
  } catch {}

  if (settings.tools_enabled) {
    systemContent += getToolDescriptions();
  }

  const chatMessages = [
    { role: 'system', content: systemContent }, ...chatHistory
  ];

  const replyToMsgId = isGroup ? message.message_id : undefined;
  const thinkingEmoji = getThinkingEmoji(settings.persona, String(chatId));
  let streamMsgId: number | null = null;
  try {
    streamMsgId = await sendMessageWithId(chatId, thinkingEmoji, env, null, null, replyToMsgId);
  } catch (e: any) {
    logger.error('Failed to send thinking message', { chatId, error: e.message });
  }

  let responseText = await getCachedResponse(activeModelKey, systemContent, chatHistory);
  if (!responseText) {
    let accumulatedText = '';

    if (settings.ensemble_enabled) {
      const ensembleModels = parseEnsembleModels(settings.ensemble_models);
      const strategy = settings.ensemble_strategy || 'judge';
      try {
        accumulatedText = await runEnsemble(env, chatMessages, activeTokenLimit, ensembleModels, activeModelKey, strategy);
      } catch (e: any) {
        logger.error('Ensemble error, falling back to single model', { chatId, error: e.message });
      }
    }

    if (!accumulatedText) {
      let lastEditTime = 0;
      const STREAM_INTERVAL = 300;
      const startTs = performance.now();

      try {
        for await (const chunk of runChatStreaming(env, chatMessages, activeTokenLimit, activeModelKey)) {
          accumulatedText += chunk;
          if (streamMsgId && Date.now() - lastEditTime > STREAM_INTERVAL) {
            lastEditTime = Date.now();
            const display = settings.formatting === 'plain' ? accumulatedText : parseMarkdownToTelegramHTML(accumulatedText);
            const truncated = display.length > MAX_MESSAGE_LENGTH ? display.slice(0, MAX_MESSAGE_LENGTH - 50) + '\n\n...' : display;
            await editMessage(chatId, streamMsgId, truncated, env, settings.formatting === 'plain' ? null : 'HTML').catch(() => {});
          }
        }
      } catch (e: any) {
        logger.error('Streaming error', { chatId, error: e.message });
      }

      const elapsed = Math.round(performance.now() - startTs);
      logger.info('Response timing', { chatId, model: activeModelKey, durationMs: elapsed, length: accumulatedText?.length || 0 });
      trackTiming(env, elapsed).catch(() => {});
    }

    if (accumulatedText) {
      responseText = accumulatedText;
      // --- Tool-Use: check for tool calls and cycle ---
      if (settings.tools_enabled) {
        let toolTurnCount = 0;
        let toolCall = parseToolCall(accumulatedText);
        while (toolCall && toolTurnCount < MAX_TOOL_TURNS) {
          toolTurnCount++;
          logger.info('Tool call detected', { tool: toolCall.tool, turn: toolTurnCount });
          const toolMsg = streamMsgId
            ? `🔧 Using *${toolCall.tool}*...`
            : `🔧 Using *${toolCall.tool}*...`;
          if (streamMsgId) {
            await editMessage(chatId, streamMsgId, toolMsg, env, 'Markdown').catch(() => {});
          } else {
            await sendMessage(chatId, toolMsg, env, 'Markdown').catch(() => {});
          }
          const toolResult = await executeToolCall(toolCall, env);
          logger.info('Tool result received', { tool: toolCall.tool, resultLen: toolResult.length });
          const toolMessages = [
            { role: 'system', content: systemContent + `\n\n[TOOL RESULT]\nThe user's request was answered using the tool "${toolCall.tool}". The raw result was:\n${toolResult}\n\nNow provide a natural, conversational answer based on this result. Do NOT mention the raw tool output format. Do NOT include [TOOL_RESULT] markers in your final answer.` },
            ...chatHistory,
            { role: 'assistant', content: accumulatedText },
            { role: 'user', content: 'Based on the tool result above, provide a clear and natural response to the user.' },
          ];
          accumulatedText = '';
          try {
            if (streamMsgId) {
              await editMessage(chatId, streamMsgId, `🔧 *${toolCall.tool}* result received, generating response...`, env, 'Markdown').catch(() => {});
            }
            for await (const chunk of runChatStreaming(env, toolMessages, activeTokenLimit, activeModelKey)) {
              accumulatedText += chunk;
              if (streamMsgId) {
                const display = settings.formatting === 'plain' ? accumulatedText : parseMarkdownToTelegramHTML(accumulatedText);
                const truncated = display.length > MAX_MESSAGE_LENGTH ? display.slice(0, MAX_MESSAGE_LENGTH - 50) + '\n\n...' : display;
                await editMessage(chatId, streamMsgId, truncated, env, settings.formatting === 'plain' ? null : 'HTML').catch(() => {});
              }
            }
          } catch (e: any) {
            logger.error('Tool re-prompt streaming error', { tool: toolCall.tool, error: e.message });
            accumulatedText = `🔧 *${toolCall.tool}* result:\n${toolResult}`;
          }
          responseText = accumulatedText || toolResult;
          toolCall = parseToolCall(accumulatedText);
        }
      }
      await setCachedResponse(activeModelKey, systemContent, chatHistory, responseText);
      const trimmed = responseText.trim();
      const expectedChars = estimateCharLimit(activeTokenLimit, activeModelKey);
      const almostFull = trimmed.length >= expectedChars * 0.85;
      const endsNaturally = /[.!?\n\r}\]"'`]/.test(trimmed.charAt(trimmed.length - 1)) || trimmed.length < 100;
      if (almostFull && !endsNaturally) {
        logger.warn('Response may be truncated', { model: activeModelKey, tokenLimit: activeTokenLimit, expectedChars, responseLength: trimmed.length });
      }
    }
  } else {
    logger.debug('AI response cache hit', { chatId, model: activeModelKey });
  }

  if (!responseText) {
    const errText = t(lang, 'server_error');
    if (streamMsgId) {
      await editMessage(chatId, streamMsgId, errText, env);
    } else {
      await sendMessage(chatId, errText, env, null, null, replyToMsgId);
    }
    return;
  }

  const cleanTextRaw = cleanAIResponseText(responseText) || t(lang, 'server_error');
  let cleanText = await registry.dispatchOnAfterResponse(pluginCtx, cleanTextRaw);

  // --- Multi-modal Output: handle [GENERATE_IMAGE] and [GENERATE_SPEECH] markers ---
  cleanText = await handleMultiModalOutput(env, chatId, cleanText, lang);

  // --- Translation Mode: translate AI response back to user's language ---
  let displayText = cleanText;
  if (translateActive && cleanText !== t(lang, 'server_error')) {
    let srcLang = detectedSrcLang || getEffectiveSource(settings, lang) || lang;
    const tgtLang = getEffectiveTarget(settings, lang);
    if (tgtLang && cleanText) {
      const langNameAI = (src: string) => ({ en: 'English', fa: 'Persian', ar: 'Arabic', tr: 'Turkish', ru: 'Russian', fr: 'French', de: 'German', es: 'Spanish', it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi', ur: 'Urdu', nl: 'Dutch', sv: 'Swedish', pl: 'Polish', el: 'Greek', he: 'Hebrew', th: 'Thai', vi: 'Vietnamese' }[src] || src);
      const backPrompt = `Translate the following text from ${langNameAI(tgtLang)} to ${langNameAI(srcLang)}. Return ONLY the translated text, no explanations, no notes:\n\n${cleanText}`;
      const backTranslateTokens = getTokenLimit('medium', { modelKey: 'fast' });
      const backTranslated = await safe(() => runChat(env, [{ role: 'user', content: backPrompt }], backTranslateTokens, 'fast'), 'translateModeResp');
      if (backTranslated) {
        displayText = `${backTranslated}\n\n_${t(lang, 'translate_mode_response_from', { lang: getLanguageDisplay(tgtLang, lang) })}_`;
      }
    }
  }

  if (isGroup && cleanText === SILENT_MARKER) {
    if (streamMsgId) {
      await deleteMessage(chatId, streamMsgId, env);
    }
    if (env.DB && message.from) {
      await storeBotGroupMessage(
        env, chatId, message.from.id, userName, SILENT_MARKER,
        message.reply_to_message?.message_id ?? null,
        message.reply_to_message?.from ? String(message.reply_to_message.from.id) : null,
        message.reply_to_message?.text || message.reply_to_message?.caption || null,
        currentThreadId,
      );
    }
    return;
  }

  if (env.DB && !isIncognito) {
    if (isGroup && message.from) {
      await storeBotGroupMessage(
        env, chatId, message.from.id, userName, cleanText,
        message.reply_to_message?.message_id ?? null,
        message.reply_to_message?.from ? String(message.reply_to_message.from.id) : null,
        message.reply_to_message?.text || message.reply_to_message?.caption || null,
        currentThreadId,
      );
    } else {
      await addChatMessage(env, chatId, 'user', userMessage, sessionId);
      await addChatMessage(env, chatId, 'assistant', cleanText, sessionId);
    }
  }

  await trackMessage(env);

  const parseMode = settings.formatting === 'plain' ? null : 'HTML';
  const outputText = settings.formatting === 'plain' ? displayText : parseMarkdownToTelegramHTML(displayText);
  if (streamMsgId) {
    if (outputText.length <= MAX_MESSAGE_LENGTH) {
      await editMessage(chatId, streamMsgId, outputText, env, parseMode, buildReplyMarkup(lang, !!settings.feedback_enabled, translateActive));
    } else {
      await deleteMessage(chatId, streamMsgId, env);
      await sendMessage(chatId, outputText, env, parseMode, buildReplyMarkup(lang, !!settings.feedback_enabled, translateActive), replyToMsgId);
    }
  } else {
    await sendMessage(chatId, outputText, env, parseMode, buildReplyMarkup(lang, !!settings.feedback_enabled, translateActive), replyToMsgId);
  }
}