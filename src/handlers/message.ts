import { sendMessage, sendMessageWithId, editMessage, deleteMessage, sendChatAction } from '../telegram.ts';
import { handleCommand } from './command.ts';
import { handleCallbackQuery } from './callback.ts';
import { handleReminderMessage, handleCancelCommand } from './reminder.ts';
import { handleInlineQuery } from './inline.ts';
import { t, getLang, matchLanguage, getLanguageDisplay, getEffectiveSource, getEffectiveTarget, isTranslationActive } from '../locales.ts';
import { buildSystemPrompt, buildGroupSystemPrompt, getLengthRule, getTokenLimit, runChatStreaming, runChat, cleanAIResponseText, buildReplyMarkup, MODELS } from '../ai.ts';
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
} from '../services/index.ts';
import { buildGroupContext, storeGroupMessageAndGetInfo, storeBotGroupMessage } from '../group-context.ts';
import { getThinkingEmoji } from '../../config/persona-emojis.ts';
import { logger } from '../utils/logger.ts';
import { getCachedResponse, setCachedResponse } from '../utils/cache.ts';
import { isGroupChat, isBotMentioned, isReplyToBot, isCodeRequest, handlePhoto, handleDocument, handleVoice, handleSticker, handleVideoNote, handleLocation, handleContact, processUrls } from '../utils/media.ts';
import { handleDebateMessage } from './debate.ts';
import { safe } from '../utils/error.ts';
import { registry } from '../plugins/registry.ts';
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

  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;

  if (await isBlocked(env, chatId)) return;

  const settings = await getSettings(env, chatId);
  const lang = getLang(message.from, settings.lang, message.text || message.caption);
  const userName = message.from!.first_name || 'User';
  const sessionId = settings.active_session || 'default';

  const pluginCtx: PluginContext = { env, chatId, lang, userName, message, update };
  if (await registry.dispatchOnMessage(pluginCtx)) return;

  if (isGroupChat(message)) {
    const msgText = message.text || message.caption || '';
    const isCmd = msgText.startsWith('/');
    const isMention = isBotMentioned(message, env);
    const isReply = isReplyToBot(message);
    if (!isCmd && !isMention && !isReply) return;
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

  let userMessage;
  let contextAdditions = '';

  try {
    if (message.photo) {
      const result = await handlePhoto(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.document) {
      const result = await handleDocument(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.voice) {
      const result = await handleVoice(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.sticker) {
      const result = await handleSticker(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.video_note) {
      const result = await handleVideoNote(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.location) {
      const result = await handleLocation(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.contact) {
      const result = await handleContact(chatId, message, env, lang);
      userMessage = result.userMessage;
      contextAdditions = result.contextAdditions;
    } else if (message.text) {
      userMessage = message.text;
    } else { return; }

    if (userMessage && userMessage.length > 10000) {
      userMessage = userMessage.slice(0, 10000);
    }
  } catch (e: any) {
    const errMsg = e.message === 'File too large' ? 'file_too_large' : (message.photo ? 'image_error' : message.document ? 'file_error' : 'voice_error');
    logger.error('Message processing error', { chatId, type: message.photo ? 'photo' : message.document ? 'document' : 'voice', error: e.message });
    return await sendMessage(chatId, t(lang, errMsg), env);
  }

  contextAdditions = await processUrls(chatId, userMessage, env, lang, contextAdditions);

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
      const translated = await safe(() => runChat(env, [{ role: 'user', content: translatePrompt }], 500, 'fast'), 'translateModeMsg');
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

  if (userMessage.startsWith('/')) {
    const cmd = userMessage.split(' ')[0].toLowerCase();
    const args = userMessage.substring(cmd.length).trim();
    if ((await handleCommand(chatId, cmd, args, env, lang, userName, settings)) !== null) return;
    if (!contextAdditions) return await sendMessage(chatId, t(lang, 'invalid_command'), env);
  }

  const isIncognito = !settings.memory_enabled;
  const isGroup = isGroupChat(message);
  let tokenLimit = getTokenLimit(settings.response_length, { modelKey: settings.ai_model });
  let lengthRule = getLengthRule(settings.response_length, lang);

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

  let responseText = getCachedResponse(activeModelKey, systemContent, chatHistory);
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
            await editMessage(chatId, streamMsgId, display.slice(0, MAX_MESSAGE_LENGTH), env, settings.formatting === 'plain' ? null : 'HTML').catch(() => {});
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
      setCachedResponse(activeModelKey, systemContent, chatHistory, accumulatedText);
      const trimmed = accumulatedText.trim();
      const lastChar = trimmed.charAt(trimmed.length - 1);
      const endsNaturally = /[.!?\n\r}\]"'`]/.test(lastChar) || trimmed.length < 50;
      if (!endsNaturally && trimmed.length > tokenLimit * 2) {
        logger.warn('Response may be truncated', { model: activeModelKey, tokenLimit, responseLength: trimmed.length, lastChar });
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
  const cleanText = await registry.dispatchOnAfterResponse(pluginCtx, cleanTextRaw);

  // --- Translation Mode: translate AI response back to user's language ---
  let displayText = cleanText;
  if (translateActive && cleanText !== t(lang, 'server_error')) {
    let srcLang = detectedSrcLang || getEffectiveSource(settings, lang) || lang;
    const tgtLang = getEffectiveTarget(settings, lang);
    if (tgtLang && cleanText) {
      const langNameAI = (src: string) => ({ en: 'English', fa: 'Persian', ar: 'Arabic', tr: 'Turkish', ru: 'Russian', fr: 'French', de: 'German', es: 'Spanish', it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', hi: 'Hindi', ur: 'Urdu', nl: 'Dutch', sv: 'Swedish', pl: 'Polish', el: 'Greek', he: 'Hebrew', th: 'Thai', vi: 'Vietnamese' }[src] || src);
      const backPrompt = `Translate the following text from ${langNameAI(tgtLang)} to ${langNameAI(srcLang)}. Return ONLY the translated text, no explanations, no notes:\n\n${cleanText}`;
      const backTranslated = await safe(() => runChat(env, [{ role: 'user', content: backPrompt }], 500, 'fast'), 'translateModeResp');
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
    await editMessage(chatId, streamMsgId, outputText, env, parseMode, buildReplyMarkup(lang, !!settings.feedback_enabled, translateActive));
  } else {
    await sendMessage(chatId, outputText, env, parseMode, buildReplyMarkup(lang, !!settings.feedback_enabled, translateActive), replyToMsgId);
  }
}