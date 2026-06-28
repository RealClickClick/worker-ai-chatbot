import { answerCallback, editMessage, sendMessage, sendChatAction, deleteMessage } from '../telegram.ts';
import { handleDebateCallback } from './debate.ts';
import { handleDailyCommand } from './daily.ts';
import { handleReminderCallback } from './reminder.ts';
import { showModeMenu, showSubMenu, showProfile, showProgLangMenu, showTimezoneMenu, showTranslateModeMenu, buildModelKeyboard, buildImageModelKeyboard, buildLanguageKeyboard } from '../menus/modeMenu.ts';
import { showLangMenu, showSettings } from './command.ts';
import { t, getLang, getLanguageDisplay, getLanguageList, matchLanguage, getEffectiveSource, getEffectiveTarget, isTranslationActive } from '../locales.ts';
import { parseMarkdownToTelegramHTML } from '../parsers/htmlParser.ts';
import {
  clearChat, setPersona, toggleResponseLength, getSettings, setAiModel, setImgModel, setLanguage,
  trackFeedback, setCustomInstructions, getCustomPersonas, getChatHistory,
  toggleMemory, toggleFormatting, toggleFeedback, setProgrammingLang, setTimezone,
  setTranslateSource, setTranslateTarget, setTranslatePending, setTranslateEnabled,
  recordFeedback, analyzeFeedback,
} from '../services/index.ts';
import { LANGUAGE_TIMEZONE_MAP } from '../constants.ts';
import { MODELS, IMAGE_MODELS, runChat, getTokenLimit, cleanAIResponseText } from '../ai.ts';

import { logger } from '../utils/logger.ts';
import { handleModeCallbackWithState } from '../modes/registry.ts';
import type { Env, TelegramCallbackQuery } from '../types/env.d.ts';

export async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery, env: Env): Promise<void> {
  const msg = callbackQuery.message;
  if (!msg || !callbackQuery.data) return;
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const data = callbackQuery.data;
  const userId = String(chatId).startsWith('-') ? callbackQuery.from?.id : undefined;

  // -- Mode System callbacks --
  if (data.startsWith('mode_')) {
    const settings = await getSettings(env, chatId, userId);
    const lang = getLang(callbackQuery.from, settings.lang);
    const modeCtx = { env, chatId, userId: callbackQuery.from?.id || 0, userName: callbackQuery.from?.first_name || 'User', lang, modeData: settings.mode_data };
    const modeResult = await handleModeCallbackWithState(modeCtx, data, messageId, settings.active_mode);
    if (modeResult?.consumed) {
      await answerCallback(callbackQuery.id, env);
      return;
    }
  }

  if (data.startsWith('debate_')) {
    await answerCallback(callbackQuery.id, env);
    try {
      const settings = await getSettings(env, chatId, userId);
      const lang = getLang(callbackQuery.from, settings.lang);
      await handleDebateCallback(data, chatId, messageId, env, lang);
    } catch (e: any) {
      logger.error('Debate callback error', { chatId, data, error: e.message });
    }
    return;
  }

  if (data.startsWith('rem_')) {
    const settings = await getSettings(env, chatId, userId);
    const lang = getLang(callbackQuery.from, settings.lang);
    await answerCallback(callbackQuery.id, env);
    await handleReminderCallback(data, chatId, messageId, env, lang);
    return;
  }

  const settings = await getSettings(env, chatId, userId);
  const lang = getLang(callbackQuery.from, settings.lang);

  if (data === 'clear_memory') {
    logger.info('Memory cleared', { chatId });
    await clearChat(env, chatId);
    await answerCallback(callbackQuery.id, env);
    return await editMessage(chatId, messageId, t(lang, 'memory_cleared'), env);
  }

  if (data === 'confirm_clear') {
    await clearChat(env, chatId);
    await answerCallback(callbackQuery.id, env, t(lang, 'cleared'));
    await editMessage(chatId, messageId, t(lang, 'cleared'), env);
    return;
  }

  if (data === 'cancel_clear') {
    await answerCallback(callbackQuery.id, env, t(lang, 'cancelled'));
    await editMessage(chatId, messageId, t(lang, 'cancelled'), env);
    return;
  }

  if (data === 'menu_mode') {
    await answerCallback(callbackQuery.id, env);
    return await showModeMenu(chatId, env, lang, messageId as any);
  }

  if (data === 'menu_settings') {
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId as any);
  }

  if (data === 'menu_lang') {
    await answerCallback(callbackQuery.id, env);
    return await showLangMenu(chatId, env, lang, messageId);
  }

  if (data === 'menu_model') {
    await answerCallback(callbackQuery.id, env);
    const hasGeminiKey = !!env.GOOGLE_GEMINI_API_KEY;
    const modelKeyboard = buildModelKeyboard(lang, hasGeminiKey);
    return await editMessage(chatId, messageId, t(lang, 'model_menu_title'), env, 'Markdown', modelKeyboard);
  }

  if (data === 'menu_img_model') {
    await answerCallback(callbackQuery.id, env);
    const imgModelKeyboard = buildImageModelKeyboard(lang);
    return await editMessage(chatId, messageId, t(lang, 'settings_img_model'), env, 'Markdown', imgModelKeyboard);
  }

  if (data.startsWith('cat_')) {
    await answerCallback(callbackQuery.id, env);
    return await showSubMenu(chatId, data.replace('cat_', ''), env, lang, messageId as any);
  }

  if (data.startsWith('set_mode_')) {
    await setPersona(env, chatId, data.replace('set_mode_', ''), userId);
    await answerCallback(callbackQuery.id, env, t(lang, 'persona_updated'));
    return await showModeMenu(chatId, env, lang, messageId);
  }

  if (data.startsWith('set_custom_')) {
    const pName = data.replace('set_custom_', '');
    const personas = await getCustomPersonas(env, chatId);
    const match = personas.find(p => p.name === pName);
    if (match) await setCustomInstructions(env, chatId, match.description, userId);
    await setPersona(env, chatId, 'standard', userId);
    await answerCallback(callbackQuery.id, env, t(lang, 'persona_updated'));
    return await showModeMenu(chatId, env, lang, messageId);
  }

  if (data.startsWith('set_model_')) {
    const mk = data.replace('set_model_', '');
    await setAiModel(env, chatId, mk, userId);
    await answerCallback(callbackQuery.id, env, t(lang, 'model_updated', { model: t(lang, MODELS[mk]?.label || '') }));
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data.startsWith('set_img_model_')) {
    const imk = data.replace('set_img_model_', '');
    await setImgModel(env, chatId, imk, userId);
    await answerCallback(callbackQuery.id, env, t(lang, 'model_updated', { model: t(lang, IMAGE_MODELS[imk]?.label || '') }));
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data.startsWith('set_lang_')) {
    const nl = data.replace('set_lang_', '');
    await setLanguage(env, chatId, nl === 'auto' ? null : nl, userId);
    const newLang = nl === 'auto' ? lang : nl;
    const tz = LANGUAGE_TIMEZONE_MAP[newLang] || 'UTC';
    const s: any = await getSettings(env, chatId, userId);
    if (!s.timezone || s.timezone === 'UTC' || s.timezone === LANGUAGE_TIMEZONE_MAP[lang]) {
      await setTimezone(env, chatId, tz, userId);
    }
    await answerCallback(callbackQuery.id, env, t(lang, 'lang_updated'));
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'gemini_setup_guide') {
    await answerCallback(callbackQuery.id, env);
    return await editMessage(chatId, messageId, t(lang, 'gemini_setup_guide'), env, 'Markdown');
  }

  if (data === 'toggle_length') {
    await toggleResponseLength(env, chatId, userId);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'regen') {
    await answerCallback(callbackQuery.id, env);
    await sendChatAction(chatId, env, 'typing');
    try {
      const sessionId = settings.active_session || 'default';
      let history = settings.memory_enabled ? await getChatHistory(env, chatId, sessionId, 20) : [];
      if (history.length > 0 && history[history.length - 1].role === 'assistant') {
        history = history.slice(0, -1);
      }
      const lastUserIdx = [...history].reverse().findIndex(m => m.role === 'user');
      if (lastUserIdx === -1) {
        return await sendMessage(chatId, t(lang, 'summarize_empty'), env);
      }
      const systemContent = (
        `[System: You are an AI assistant in a Telegram chat. Current date: ${new Date().toISOString().slice(0, 10)}]`
        + (settings.custom_instructions ? `\n\n[Custom Instructions: ${settings.custom_instructions}]` : '')
        + (settings.programming_lang ? `\n\n[Preferred Programming Language: ${settings.programming_lang}]` : '')
      );
      const tokenLimit = getTokenLimit(settings.response_length, { modelKey: settings.ai_model });
      const responseText = await runChat(env, [
        { role: 'system', content: systemContent }, ...history
      ], tokenLimit, settings.ai_model);
      if (!responseText) return await sendMessage(chatId, t(lang, 'server_error'), env);
      const cleanText = cleanAIResponseText(responseText) || t(lang, 'server_error');
      const parseMode = settings.formatting === 'plain' ? null : 'HTML';
      const outputText = settings.formatting === 'plain' ? cleanText : parseMarkdownToTelegramHTML(cleanText);
      return await sendMessage(chatId, outputText, env, parseMode);
    } catch (error: any) {
      logger.error('Regen Error', { error: error.message });
      return await sendMessage(chatId, t(lang, 'server_error'), env);
    }
  }

  if (data === 'feedback_good') {
    await trackFeedback(env, 'good');
    const shouldAdapt = await recordFeedback(env, chatId, 'good');
    if (shouldAdapt) analyzeFeedback(env, chatId).catch(() => {});
    return await answerCallback(callbackQuery.id, env, t(lang, 'feedback_good'));
  }

  if (data === 'feedback_bad') {
    await trackFeedback(env, 'bad');
    const shouldAdapt = await recordFeedback(env, chatId, 'bad');
    if (shouldAdapt) analyzeFeedback(env, chatId).catch(() => {});
    return await answerCallback(callbackQuery.id, env, t(lang, 'feedback_bad'));
  }

  if (data === 'stats') {
    await answerCallback(callbackQuery.id, env);
    const s = await getSettings(env, chatId, userId);
    return await sendMessage(chatId, t(lang, 'stats_title', {
      persona: (s.persona || 'Standard').toUpperCase(),
      model: t(lang, MODELS[s.ai_model]?.label || 'model_fast'),
      length: t(lang, `length_${s.response_length || 'short'}`),
      instructions: s.custom_instructions ? (s.custom_instructions.length > 30 ? s.custom_instructions.slice(0, 30) + '...' : s.custom_instructions) : 'None',
      session: s.active_session || 'default'
    }), env, 'Markdown');
  }

  if (data === 'profile') {
    await answerCallback(callbackQuery.id, env);
    return await showProfile(chatId, env, lang, messageId as any);
  }

  if (data === 'back_start') {
    await answerCallback(callbackQuery.id, env);
    const s = await getSettings(env, chatId, userId);
    const persona = (s.persona || 'Standard').toUpperCase();
    const model = t(lang, MODELS[s.ai_model]?.label || 'model_fast');
    const lengthLabel = t(lang, `length_${s.response_length || 'short'}`);
    return await editMessage(chatId, messageId, t(lang, 'start_glass', { user: callbackQuery.from.first_name || 'User', persona, model, length: lengthLabel }), env, 'Markdown', {
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

  if (data === 'help') {
    await answerCallback(callbackQuery.id, env);
    return await sendMessage(chatId, t(lang, 'help_message'), env, 'Markdown');
  }

  if (data === 'img_help') {
    await answerCallback(callbackQuery.id, env);
    return await sendMessage(chatId, t(lang, 'image_prompt_required'), env);
  }

  if (data === 'search_help') {
    await answerCallback(callbackQuery.id, env);
    return await sendMessage(chatId, t(lang, 'search_query_required'), env);
  }

  if (data === 'tts_help') {
    await answerCallback(callbackQuery.id, env);
    return await sendMessage(chatId, t(lang, 'tts_usage'), env);
  }

  if (data === 'new_chat') {
    await clearChat(env, chatId);
    await answerCallback(callbackQuery.id, env, t(lang, 'cleared'));
    return await sendMessage(chatId, t(lang, 'cleared'), env);
  }

  if (data === 'toggle_memory') {
    await toggleMemory(env, chatId, userId);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'toggle_formatting') {
    await toggleFormatting(env, chatId, userId);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'toggle_feedback') {
    await toggleFeedback(env, chatId, userId);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'toggle_daily') {
    await handleDailyCommand(chatId, env, lang);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'menu_timezone') {
    await answerCallback(callbackQuery.id, env);
    return await showTimezoneMenu(chatId, env, lang, messageId as any);
  }

  if (data.startsWith('set_timezone_')) {
    const tz = data.replace('set_timezone_', '');
    await setTimezone(env, chatId, tz, userId);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  if (data === 'menu_prog_lang') {
    await answerCallback(callbackQuery.id, env);
    return await showProgLangMenu(chatId, env, lang, messageId as any);
  }

  if (data.startsWith('set_prog_lang_')) {
    const pl = data.replace('set_prog_lang_', '');
    await setProgrammingLang(env, chatId, pl === 'none' ? null : pl, userId);
    await answerCallback(callbackQuery.id, env);
    return await showSettings(chatId, env, lang, messageId);
  }

  // --- Translation Mode Callbacks ---

  if (data === 'menu_translate') {
    await setTranslatePending(env, chatId, null, userId);
    await answerCallback(callbackQuery.id, env);
    return await showTranslateModeMenu(chatId, env, lang, messageId);
  }

  if (data === 'translate_source') {
    await setTranslatePending(env, chatId, 'source', userId);
    await answerCallback(callbackQuery.id, env);
    return await editMessage(chatId, messageId, t(lang, 'translate_mode_prompt_source'), env, 'Markdown', buildLanguageKeyboard('source', lang));
  }

  if (data === 'translate_target') {
    await setTranslatePending(env, chatId, 'target', userId);
    await answerCallback(callbackQuery.id, env);
    return await editMessage(chatId, messageId, t(lang, 'translate_mode_prompt_target'), env, 'Markdown', buildLanguageKeyboard('target', lang));
  }

  if (data === 'translate_cancel') {
    await setTranslateEnabled(env, chatId, 0, userId);
    await setTranslatePending(env, chatId, null, userId);
    await answerCallback(callbackQuery.id, env, '❌');
    return await showTranslateModeMenu(chatId, env, lang, messageId);
  }

  if (data === 'translate_activate') {
    await setTranslatePending(env, chatId, null, userId);
    if (!settings.translate_target) {
      const src = getEffectiveSource(settings, lang);
      const tgt = !src || src === lang ? 'en' : lang;
      await setTranslateTarget(env, chatId, tgt, userId);
    }
    await setTranslateEnabled(env, chatId, 1, userId);
    await answerCallback(callbackQuery.id, env);
    return await showTranslateModeMenu(chatId, env, lang, messageId);
  }

  if (data.startsWith('translate_confirm_')) {
    const parts = data.split('_');
    const actionType = parts[2]; // 'source' or 'target'
    const code = parts.slice(3).join('_');
    await setTranslatePending(env, chatId, null, userId);
    if (actionType === 'source') {
      await setTranslateSource(env, chatId, code === 'auto' ? null : code, userId);
    } else {
      await setTranslateTarget(env, chatId, code, userId);
    }
    await answerCallback(callbackQuery.id, env);
    return await showTranslateModeMenu(chatId, env, lang, messageId);
  }
}
