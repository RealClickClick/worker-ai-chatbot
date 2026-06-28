import { sendMessage, sendPhoto, sendVoice, sendChatAction, editMessage } from '../telegram.ts';
import { showModeMenu, showModelMenu, showSettingsMenu, showTranslateModeMenu } from '../menus/modeMenu.ts';
import { t, matchLanguage, getLanguageDisplay, getLanguageList, getEffectiveSource, getEffectiveTarget } from '../locales.ts';
import { enhancePrompt, runImageGeneration, runChat, runTTS, MODELS, webSearch } from '../ai.ts';
import { MAX_SEARCH_RESULTS, STATS_TRUNCATE } from '../constants.ts';
import {
  clearChat, getSettings,
  trackImage, trackSearch, setCustomInstructions, setBotName, checkRateLimit,
  getAllChatMessages, getChatHistory, getLastGroupMessages,
  toggleMemory, setTranslateSource, setTranslateTarget, setTranslatePending, setTranslateEnabled,
  indexText, clearKnowledge, getKnowledgeCount,
  executeCode, getSupportedLanguages,
  setToolsEnabled,
} from '../services/index.ts';
import { logger } from '../utils/logger.ts';
import { safe } from '../utils/error.ts';
import { registry } from '../plugins/registry.ts';
import type { PluginContext } from '../plugins/types.ts';
import { validateImagePrompt, validateSearchQuery, validateInstructions, validateFeedbackMessage } from '../utils/validate.ts';
import { handleAdmin } from './admin.ts';
import { handleSession } from './session.ts';
import { handleAdapt } from './adapt.ts';
import { handleWorkflow } from './workflow.ts';
import { handleNewPersona } from './persona.ts';
import { handleDebateCommand, handleDebateHistory, handleDebateSaveTemplate, handleDebateListTemplates, handleDebateExport } from './debate.ts';
import { handleDailyCommand } from './daily.ts';
import { handleRemindCommand, handleRemindersList, handleCancelCommand, handleReminderMessage } from './reminder.ts';
import { activateMode, deactivateMode } from '../modes/registry.ts';
import { setModeData } from '../repositories/settings.repo.ts';
import type { Env } from '../types/env.d.ts';

export async function handleCommand(chatId: number | string, commandText: string, args: string, env: Env, lang: string, userName: string, settings: any = null, userId?: number): Promise<any> {
  if (commandText === '/image' || commandText === '/search') {
    const allowed = await checkRateLimit(env, chatId, 'expensive');
    if (!allowed) {
      await sendMessage(chatId, t(lang, 'rate_limited'), env);
      return;
    }
  }

  const pluginCtx: PluginContext = { env, chatId, userName, lang };
  const pluginResult = await registry.dispatchOnCommand(commandText, args, pluginCtx);
  if (pluginResult !== null) {
    return await sendMessage(chatId, pluginResult, env, 'Markdown');
  }

  switch (commandText) {
    case '/start': {
      logger.info('Start command', { chatId, userName });
      if (!settings) settings = await getSettings(env, chatId, userId);
      const persona = (settings.persona || 'Standard').toUpperCase();
      const model = t(lang, MODELS[settings.ai_model]?.label || 'model_fast');
      const lengthLabel = t(lang, `length_${settings.response_length || 'short'}`);
      return await sendMessage(chatId, t(lang, 'start_glass', { user: userName, persona, model, length: lengthLabel }), env, 'Markdown', {
        inline_keyboard: [
          [{ text: t(lang, 'btn_personas'), callback_data: 'menu_mode' },
           { text: t(lang, 'btn_model'), callback_data: 'menu_model' }],
          [{ text: t(lang, 'btn_settings_icon'), callback_data: 'menu_settings' },
           { text: t(lang, 'btn_image'), callback_data: 'img_help' }],
          [{ text: t(lang, 'btn_profile'), callback_data: 'profile' },
           { text: t(lang, 'btn_help'), callback_data: 'help' }],
          [{ text: t(lang, 'btn_search'), callback_data: 'search_help' },
           { text: t(lang, 'btn_tts'), callback_data: 'tts_help' }],
          [{ text: t(lang, 'btn_new_chat'), callback_data: 'new_chat' },
           { text: t(lang, 'btn_clear'), callback_data: 'clear_memory' }]
        ]
      });
    }

    case '/help':
      return await sendMessage(chatId, t(lang, 'help_message'), env, 'Markdown');

    case '/image': {
      const validPrompt = validateImagePrompt(args);
      if (!validPrompt) return await sendMessage(chatId, t(lang, 'image_prompt_required'), env);
      if (!settings) settings = await getSettings(env, chatId, userId);
      await sendChatAction(chatId, env, 'typing');
      await sendMessage(chatId, t(lang, 'enhancing_prompt'), env);
      const enhanced = await safe(() => enhancePrompt(env, validPrompt), 'enhancePrompt', validPrompt);
      if (!enhanced) return await sendMessage(chatId, t(lang, 'image_error_short'), env);
      await safe(async () => {
        await sendChatAction(chatId, env, 'upload_photo');
        const imgBytes = await runImageGeneration(env, enhanced, settings.img_model);
        if (!imgBytes) throw new Error('No image bytes');
        await sendPhoto(chatId, new Blob([imgBytes], { type: 'image/png' }), t(lang, 'image_sent', { prompt: validPrompt, enhanced: enhanced.slice(0, 500) }), env);
        await trackImage(env);
      }, 'imageGeneration');
      return;
    }

    case '/search':
      const query = validateSearchQuery(args);
      if (!query) return await sendMessage(chatId, t(lang, 'search_query_required'), env);
      args = query;
      await sendChatAction(chatId, env, 'typing');
      await sendMessage(chatId, t(lang, 'processing_search'), env);
      const results = await webSearch(env, args);
      if (!results) return await sendMessage(chatId, t(lang, 'search_error'), env);
      await trackSearch(env);
      return await sendMessage(chatId, t(lang, 'search_added', { results: results.slice(0, MAX_SEARCH_RESULTS) }), env, 'Markdown');

    case '/translate':
      return await handleTranslate(chatId, args, env, lang, userId);

    case '/translatemode':
      return await handleTranslateMode(chatId, args, env, lang, settings, userId);

    case '/mode':
      return await showModeMenu(chatId, env, lang);

    case '/mode_exam': {
      const msg = await activateMode('exam', env, chatId, 0, '', lang);
      if (msg) await sendMessage(chatId, msg, env, 'Markdown');
      return;
    }

    case '/mode_quiz': {
      const qmsg = await activateMode('quiz', env, chatId, 0, '', lang);
      if (qmsg) await sendMessage(chatId, qmsg, env, 'Markdown');
      return;
    }

    case '/mode_teacher': {
      const tmsg = await activateMode('teacher', env, chatId, 0, '', lang);
      if (tmsg) await sendMessage(chatId, tmsg, env, 'Markdown');
      return;
    }

    case '/mode_brainstorm': {
      const bmsg = await activateMode('brainstorm', env, chatId, 0, '', lang);
      if (bmsg) await sendMessage(chatId, bmsg, env, 'Markdown');
      return;
    }

    case '/mode_stop': {
      if (!settings) settings = await getSettings(env, chatId, userId);
      const activeMode = (settings as any).active_mode;
      if (!activeMode) {
        await sendMessage(chatId, 'No active mode to stop.', env);
        return;
      }
      const deactMsg = await deactivateMode(env, chatId, 0, '', lang, activeMode);
      if (deactMsg) await sendMessage(chatId, deactMsg, env, 'Markdown');
      return;
    }

    case '/adapt': {
      return await handleAdapt(chatId, args, env, lang);
    }

    case '/model':
      return await showModelMenu(chatId, env, lang);

    case '/lang':
      return await showLangMenu(chatId, env, lang);

    case '/instructions':
      return await handleInstructions(chatId, args, env, lang, userId);

    case '/setname':
      return await handleSetName(chatId, args, env, lang, userId);

    case '/newpersona':
      return await handleNewPersona(chatId, args, env, lang);

    case '/session':
      return await handleSession(chatId, args, env, lang);

    case '/export':
      return await handleExport(chatId, env, lang, userId);

    case '/stats':
      return await showStats(chatId, env, lang, userId);

    case '/summarize':
      return await handleSummarize(chatId, env, lang, userId);

    case '/gsum':
      return await handleGroupSummarize(chatId, env, lang, settings);

    case '/topic':
      return await handleTopic(chatId, env, lang, settings);

    case '/feedback':
      return await handleFeedback(chatId, args, env, lang);

    case '/incognito': {
      const s = await getSettings(env, chatId, userId);
      const wasEnabled = s.memory_enabled;
      await toggleMemory(env, chatId, userId);
      const key = wasEnabled ? 'incognito_activated' : 'incognito_deactivated';
      return await sendMessage(chatId, t(lang, key), env, 'Markdown');
    }
    case '/clear':
      return await sendMessage(chatId, t(lang, 'clear_confirm'), env, 'Markdown', {
        inline_keyboard: [[
          { text: t(lang, 'btn_confirm_clear'), callback_data: 'confirm_clear' },
          { text: t(lang, 'btn_cancel'), callback_data: 'cancel_clear' }
        ]]
      });

    case '/admin':
      return await handleAdmin(chatId, args, env, lang);

    case '/tts': {
      if (!args) return await sendMessage(chatId, t(lang, 'tts_usage'), env);
      await sendChatAction(chatId, env, 'typing');
      await sendMessage(chatId, t(lang, 'tts_processing'), env);
      const audioBytes = await runTTS(env, args);
      if (!audioBytes) return await sendMessage(chatId, t(lang, 'tts_error'), env);
      await sendVoice(chatId, audioBytes, env);
      return;
    }

    case '/daily':
      return await handleDailyCommand(chatId, env, lang);

    case '/remind':
      return await handleRemindCommand(chatId, env, lang);

    case '/reminders':
      return await handleRemindersList(chatId, env, lang);

    case '/cancel':
      return await handleCancelCommand(chatId, env, lang);

    case '/debate':
      return await handleDebateCommand(chatId, args, env, lang, userName);

    case '/debate_history':
      return await handleDebateHistory(chatId, env, lang);

    case '/debate_save':
      return await handleDebateSaveTemplate(chatId, args, env, lang);

    case '/debate_templates':
      return await handleDebateListTemplates(chatId, env, lang);

    case '/debate_export':
      return await handleDebateExport(chatId, env, lang);

    case '/learn':
      return await handleLearn(chatId, args, env, lang);

    case '/forget':
      return await handleForget(chatId, env, lang);

    case '/run':
      return await handleRun(chatId, args, env, lang);

    case '/tools': {
      if (!settings) settings = await getSettings(env, chatId, userId);
      const wasEnabled = settings.tools_enabled;
      await setToolsEnabled(env, chatId, wasEnabled ? 0 : 1, userId);
      const key = wasEnabled ? 'tools_deactivated' : 'tools_activated';
      await sendMessage(chatId, t(lang, key), env, 'Markdown');
      const helpText = t(lang, 'tools_usage');
      if (!wasEnabled) {
        await sendMessage(chatId, helpText, env, 'Markdown');
      }
      return;
    }

    case '/workflow': {
      return await handleWorkflow(chatId, args, env, lang);
    }

    default:
      return null;
  }
}

async function showStats(chatId: number | string, env: Env, lang: string, userId?: number): Promise<void> {
  const s = await getSettings(env, chatId, userId);
  const persona = s.persona || 'Standard';
  const model = t(lang, MODELS[s.ai_model]?.label || 'model_fast');
  const lengthLabel = t(lang, `length_${s.response_length || 'short'}`);
  const instructions = s.custom_instructions ? (s.custom_instructions.length > STATS_TRUNCATE ? s.custom_instructions.slice(0, STATS_TRUNCATE) + '...' : s.custom_instructions) : 'None';
  await sendMessage(chatId, t(lang, 'stats_title', {
    persona: persona.toUpperCase(), model: model, length: lengthLabel,
    instructions, session: s.active_session || 'default'
  }), env, 'Markdown');
}

export async function showSettings(chatId: number | string, env: Env, lang: string, messageId: any = null, userId?: number): Promise<any> {
  return await showSettingsMenu(chatId, env, lang, messageId);
}

export async function showLangMenu(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const keyboard = {
    inline_keyboard: [
      [{ text: t(lang, 'lang_en'), callback_data: 'set_lang_en' }, { text: t(lang, 'lang_fa'), callback_data: 'set_lang_fa' }],
      [{ text: t(lang, 'lang_ar'), callback_data: 'set_lang_ar' }, { text: t(lang, 'lang_tr'), callback_data: 'set_lang_tr' }],
      [{ text: t(lang, 'lang_ru'), callback_data: 'set_lang_ru' }, { text: t(lang, 'lang_auto'), callback_data: 'set_lang_auto' }]
    ]
  };
  keyboard.inline_keyboard.push([{ text: t(lang, 'back_button'), callback_data: 'menu_settings' }]);
  if (messageId) {
    await editMessage(chatId, messageId, t(lang, 'lang_prompt'), env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, t(lang, 'lang_prompt'), env, 'Markdown', keyboard);
  }
}

async function handleInstructions(chatId: number | string, args: string, env: Env, lang: string, userId?: number): Promise<any> {
  if (!args) return await sendMessage(chatId, t(lang, 'instructions_usage'), env);
  if (args.toLowerCase() === 'reset') {
    await setCustomInstructions(env, chatId, null, userId);
    return await sendMessage(chatId, t(lang, 'instructions_reset'), env);
  }
  const valid = validateInstructions(args);
  if (!valid) return await sendMessage(chatId, t(lang, 'instructions_usage'), env);
  await setCustomInstructions(env, chatId, valid, userId);
  return await sendMessage(chatId, t(lang, 'instructions_set', { text: valid }), env);
}

async function handleSetName(chatId: number | string, args: string, env: Env, lang: string, userId?: number): Promise<any> {
  if (!args) return await sendMessage(chatId, t(lang, 'setname_usage'), env);
  if (args.toLowerCase() === 'reset') {
    await setBotName(env, chatId, null, userId);
    return await sendMessage(chatId, t(lang, 'setname_reset'), env);
  }
  if (args.length > 50) return await sendMessage(chatId, t(lang, 'setname_usage'), env);
  await setBotName(env, chatId, args, userId);
  return await sendMessage(chatId, t(lang, 'setname_set', { name: args }), env);
}

async function handleTranslate(chatId: number | string, args: string, env: Env, lang: string, userId?: number): Promise<any> {
  if (!args) return await sendMessage(chatId, t(lang, 'translate_usage'), env);
  const spaceIdx = args.indexOf(' ');
  if (spaceIdx === -1) return await sendMessage(chatId, t(lang, 'translate_usage'), env);
  const targetLang = args.slice(0, spaceIdx).trim().toLowerCase();
  const text = args.slice(spaceIdx + 1).trim();
  const validLangs = ['en', 'fa', 'ar', 'tr', 'ru'];
  if (!validLangs.includes(targetLang)) return await sendMessage(chatId, t(lang, 'translate_usage'), env);
  if (!text) return await sendMessage(chatId, t(lang, 'translate_usage'), env);
  await sendChatAction(chatId, env, 'typing');
  const langMap: Record<string, string> = { en: 'English', fa: 'Persian', ar: 'Arabic', tr: 'Turkish', ru: 'Russian' };
  const prompt = t(lang, 'translate_prompt', { lang: langMap[targetLang] || targetLang, text });
  const result = await safe(() => runChat(env, [{ role: 'user', content: prompt }], 500, 'fast'), 'translate');
  if (!result) return await sendMessage(chatId, t(lang, 'translate_error'), env);
  return await sendMessage(chatId, t(lang, 'translate_result', { lang: targetLang.toUpperCase(), result }), env, 'Markdown');
}

async function handleExport(chatId: number | string, env: Env, lang: string, userId?: number): Promise<void> {
  const settings = await getSettings(env, chatId, userId);
  const sessionId = settings.active_session || 'default';
  await sendMessage(chatId, t(lang, 'export_start'), env);
  const messages = await getAllChatMessages(env, chatId, sessionId);
  if (!messages.length) return await sendMessage(chatId, 'No messages yet.', env);
  const text = messages.map(m => `[${m.created_at}] ${m.role === 'user' ? '👤 User' : '🤖 AI'}:\n${m.content}\n`).join('---\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const formData = new FormData();
  formData.append('chat_id', String(chatId));
  formData.append('document', blob, `chat_export_${sessionId}.txt`);
  formData.append('caption', t(lang, 'export_done'));
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`, { method: 'POST', body: formData });
}

async function handleSummarize(chatId: number | string, env: Env, lang: string, userId?: number): Promise<any> {
  await sendChatAction(chatId, env, 'typing');
  const settings = await getSettings(env, chatId, userId);
  const sessionId = settings.active_session || 'default';
  const history = settings.memory_enabled ? await getChatHistory(env, chatId, sessionId, 40) : [];
  if (history.length === 0) return await sendMessage(chatId, t(lang, 'summarize_empty'), env);
  const convText = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 500)}`).join('\n');
  const systemContent = `Summarize the following conversation concisely in ${lang}. Highlight key topics, decisions, and questions. Return ONLY the summary in ${lang}.`;
  const response = await safe(() => runChat(env, [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Conversation:\n${convText}` }
  ], 1024, settings.ai_model), 'summarize');
  if (!response) return await sendMessage(chatId, t(lang, 'summarize_error'), env);
  const summary = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return await sendMessage(chatId, t(lang, 'summarize_result', { summary }), env, 'Markdown');
}

async function handleFeedback(chatId: number | string, args: string, env: Env, lang: string): Promise<any> {
  const validCategories = ['bug', 'feature', 'speed', 'other'];
  if (!args) return await sendMessage(chatId, t(lang, 'feedback_usage'), env);
  const parts = args.split(' ');
  const category = parts[0].toLowerCase();
  if (!validCategories.includes(category)) return await sendMessage(chatId, t(lang, 'feedback_usage'), env);
  const message = validateFeedbackMessage(parts.slice(1).join(' '));
  if (!message) return await sendMessage(chatId, t(lang, 'feedback_usage'), env);
  const catLocale = t(lang, `feedback_category_${category}`);
  if (env.DB) {
    await env.DB.prepare(
      'INSERT INTO feedback (chat_id, category, message, created_at) VALUES (?, ?, ?, datetime("now"))'
    ).bind(String(chatId), category, message).run();
  }
  return await sendMessage(chatId, t(lang, 'feedback_title', { category: catLocale, message }), env, 'Markdown');
}

async function handleGroupSummarize(chatId: number | string, env: Env, lang: string, settings: any): Promise<any> {
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'gsum_processing'), env);
  const messages = await getLastGroupMessages(env, chatId, 50);
  if (!messages.length) return await sendMessage(chatId, t(lang, 'gsum_empty'), env);
  const convText = messages.map(m =>
    `${m.role === 'user' ? m.user_name || 'User' : 'Bot'}: ${m.content.slice(0, 300)}`
  ).join('\n');
  const systemContent = `Summarize the following group conversation concisely in ${lang}. Highlight key topics, decisions, and who said what. Return ONLY the summary in ${lang}.`;
  const response = await safe(() => runChat(env, [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Conversation:\n${convText}` }
  ], 1024, settings?.ai_model || 'fast'), 'gsum');
  if (!response) return await sendMessage(chatId, t(lang, 'gsum_error'), env);
  const summary = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return await sendMessage(chatId, t(lang, 'gsum_result', { summary }), env, 'Markdown');
}

async function handleTopic(chatId: number | string, env: Env, lang: string, settings: any): Promise<any> {
  await sendChatAction(chatId, env, 'typing');
  const messages = await getLastGroupMessages(env, chatId, 20);
  if (!messages.length) return await sendMessage(chatId, t(lang, 'topic_error'), env);
  const convText = messages.map(m =>
    `${m.role === 'user' ? m.user_name || 'User' : 'Bot'}: ${m.content.slice(0, 200)}`
  ).join('\n');
  const systemContent = `Detect the main topic of the following group conversation. Return ONLY the topic name (max 5 words) in ${lang}. No explanations.`;
  const response = await safe(() => runChat(env, [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Conversation:\n${convText}` }
  ], 200, settings?.ai_model || 'fast'), 'topic');
  if (!response) return await sendMessage(chatId, t(lang, 'topic_error'), env);
  const topic = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim().replace(/^["']|["']$/g, '');
  return await sendMessage(chatId, t(lang, 'topic_result', { topic }), env, 'Markdown');
}

async function handleTranslateMode(chatId: number | string, args: string, env: Env, lang: string, settings: any, userId?: number): Promise<any> {
  const trimmed = args.trim().toLowerCase();

  if (!trimmed) {
    return await showTranslateModeMenu(String(chatId), env, lang);
  }

  if (trimmed === 'off') {
    await setTranslatePending(env, chatId, null, userId);
    await setTranslateEnabled(env, chatId, 0, userId);
    return await sendMessage(chatId, t(lang, 'translate_mode_title', { source: '—', target: '—' }), env, 'Markdown');
  }

  if (trimmed === 'on') {
    const src = getEffectiveSource(settings, lang) || lang;
    const tgt = src === lang ? 'en' : lang;
    await setTranslateTarget(env, chatId, tgt, userId);
    await setTranslateEnabled(env, chatId, 1, userId);
    const srcName = getLanguageDisplay(src, lang);
    const tgtName = getLanguageDisplay(tgt, lang);
    return await sendMessage(chatId, t(lang, 'translate_mode_title', { source: srcName, target: tgtName }), env, 'Markdown');
  }

  // Try matching as source > target pattern: "fa > en" or "persian > english"
  const arrowMatch = trimmed.match(/^(.+?)\s*[>»]\s*(.+)$/);
  if (arrowMatch) {
    const srcInput = arrowMatch[1].trim();
    const tgtInput = arrowMatch[2].trim();
    const srcMatch = matchLanguage(srcInput, lang);
    const tgtMatch = matchLanguage(tgtInput, lang);
    if (srcMatch && tgtMatch && srcMatch.code !== tgtMatch.code) {
      await setTranslateSource(env, chatId, srcMatch.code, userId);
      await setTranslateTarget(env, chatId, tgtMatch.code, userId);
      return await sendMessage(chatId, t(lang, 'translate_mode_title', { source: srcMatch.name, target: tgtMatch.name }), env, 'Markdown');
    }
  }

  // Try matching as a single language (sets target, source = user's lang)
  const match = matchLanguage(trimmed, lang);
  if (match) {
    const src = getEffectiveSource(settings, lang) || lang;
    if (match.code === src) {
      return await sendMessage(chatId, t(lang, 'translate_mode_already', { source: match.name, target: match.name }), env, 'Markdown');
    }
    await setTranslateTarget(env, chatId, match.code, userId);
    const srcName = getLanguageDisplay(src, lang);
    return await sendMessage(chatId, t(lang, 'translate_mode_title', { source: srcName, target: match.name }), env, 'Markdown');
  }

  // Unknown input — show usage
  return await sendMessage(chatId, t(lang, 'translate_mode_usage'), env, 'Markdown');
}

async function handleRun(chatId: number | string, args: string, env: Env, lang: string): Promise<void> {
  if (!args) {
    const list = getSupportedLanguages().join(', ');
    return await sendMessage(chatId, t(lang, 'run_usage', { languages: list }), env, 'Markdown');
  }
  const spaceIdx = args.indexOf(' ');
  if (spaceIdx === -1) {
    return await sendMessage(chatId, t(lang, 'run_usage', { languages: getSupportedLanguages().join(', ') }), env, 'Markdown');
  }
  const language = args.slice(0, spaceIdx).trim().toLowerCase();
  const code = args.slice(spaceIdx + 1).trim();
  if (!code) {
    return await sendMessage(chatId, t(lang, 'run_usage', { languages: getSupportedLanguages().join(', ') }), env, 'Markdown');
  }
  await sendChatAction(chatId, env, 'typing');
  const msg = await sendMessage(chatId, t(lang, 'run_processing'), env);
  const result = await executeCode(language, code);
  if (!result.success) {
    const errMsg = result.error || t(lang, 'run_error');
    await sendMessage(chatId, t(lang, 'run_result_error', { error: errMsg.slice(0, 1500) }), env, 'Markdown');
    return;
  }
  const output = result.output.slice(0, 3000);
  await sendMessage(chatId, t(lang, 'run_result', { lang: language, output }), env, 'Markdown');
}

async function handleLearn(chatId: number | string, args: string, env: Env, lang: string): Promise<void> {
  if (!args) {
    const count = await getKnowledgeCount(env, chatId);
    return await sendMessage(chatId, t(lang, 'learn_usage', { count: String(count) }), env, 'Markdown');
  }
  await sendChatAction(chatId, env, 'typing');
  const chunkCount = await indexText(env, chatId, args);
  const newCount = await getKnowledgeCount(env, chatId);
  await sendMessage(chatId, t(lang, 'learn_done', { chunks: String(chunkCount), count: String(newCount) }), env, 'Markdown');
}

async function handleForget(chatId: number | string, env: Env, lang: string): Promise<void> {
  await clearKnowledge(env, chatId);
  await sendMessage(chatId, t(lang, 'forget_done'), env, 'Markdown');
}
