import type { Env } from '../types/env.d.ts';
import { t, getLangName, getLanguageDisplay, getLanguageFlag, isTranslationActive, getEffectiveSource, getEffectiveTarget } from '../locales.ts';
import { editMessage, sendMessage } from '../telegram.ts';
import { PERSONA_CATEGORIES, PERSONA_LABELS } from '../../config/personas.ts';
import { getSettings } from '../services/index.ts';
import { getCustomPersonas } from '../services/index.ts';
import { MODELS, IMAGE_MODELS } from '../ai.ts';
import { COMMON_TIMEZONES } from '../constants.ts';

function getLengthLabel(lang: string, length: string): string {
  return t(lang, `length_${length}`);
}

export async function showModeMenu(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const entries = Object.entries(PERSONA_CATEGORIES);
  const categoryRows: any[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    const row: any[] = [];
    row.push({ text: (entries[i][1] as Record<string, any>)[lang] || (entries[i][1] as Record<string, any>).fa, callback_data: `cat_${entries[i][0]}` });
    if (entries[i + 1]) {
      row.push({ text: (entries[i + 1][1] as Record<string, any>)[lang] || (entries[i + 1][1] as Record<string, any>).fa, callback_data: `cat_${entries[i + 1][0]}` });
    }
    categoryRows.push(row);
  }

  const customPersonas = await getCustomPersonas(env, chatId);
  if (customPersonas.length > 0) {
    categoryRows.push([{ text: t(lang, 'custom_category'), callback_data: 'cat_custom' }]);
  }

  const keyboard = {
    inline_keyboard: [
      [{ text: t(lang, 'mode_standard'), callback_data: 'set_mode_standard' }],
      ...categoryRows,
      [{ text: t(lang, 'back_button'), callback_data: 'back_start' }]
    ]
  };

  const text = t(lang, 'main_menu_title');
  if (messageId) {
    await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, text, env, 'Markdown', keyboard);
  }
}

export async function showSubMenu(chatId: number | string, category: string, env: Env, lang: string, messageId: number): Promise<void> {
  if (category === 'custom') {
    const customPersonas = await getCustomPersonas(env, chatId);
    if (!customPersonas.length) return;
    const keyboard = customPersonas.map(p => [
      { text: `🎨 ${p.name}`, callback_data: `set_custom_${p.name}` }
    ]);
    keyboard.push([{ text: t(lang, 'back_button'), callback_data: 'menu_mode' }]);
    await editMessage(chatId, messageId, t(lang, 'custom_category'), env, 'Markdown', { inline_keyboard: keyboard });
    return;
  }

  const catData = (PERSONA_CATEGORIES as Record<string, any>)[category];
  if (!catData) return;

  const text = catData[lang] || catData.fa;
  const items = catData.items;
  const keyboard: any[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const row: any[] = [];
    row.push({
      text: (PERSONA_LABELS as Record<string, any>)[items[i]]?.[lang] || (PERSONA_LABELS as Record<string, any>)[items[i]]?.fa || items[i],
      callback_data: `set_mode_${items[i]}`
    });
    if (items[i + 1]) {
      row.push({
        text: (PERSONA_LABELS as Record<string, any>)[items[i + 1]]?.[lang] || (PERSONA_LABELS as Record<string, any>)[items[i + 1]]?.fa || items[i + 1],
        callback_data: `set_mode_${items[i + 1]}`
      });
    }
    keyboard.push(row);
  }

  keyboard.push([{ text: t(lang, 'back_button'), callback_data: 'menu_mode' }]);
  await editMessage(chatId, messageId, text, env, 'Markdown', { inline_keyboard: keyboard });
}

export async function showSettingsMenu(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const settings = await getSettings(env, chatId);
  const currentLength = settings.response_length || 'short';
  const currentModel = settings.ai_model || 'fast';
  const modelLabel = t(lang, MODELS[currentModel]?.label || 'model_fast');
  const currentImgModel = settings.img_model || 'sdxl';
  const imgModelLabel = t(lang, IMAGE_MODELS[currentImgModel]?.label || 'img_sdxl');
  const langName = getLangName(lang) || lang;
  const incogLabel = settings.memory_enabled ? t(lang, 'incognito_off') : t(lang, 'incognito_on');
  const fmtLabel = settings.formatting === 'markdown' ? t(lang, 'formatting_markdown') : t(lang, 'formatting_plain');
  const fbLabel = settings.feedback_enabled ? t(lang, 'feedback_on') : t(lang, 'feedback_off');
  const dailyLabel = settings.daily_tips_enabled ? t(lang, 'daily_on') : t(lang, 'daily_off');
  const timezone = settings.timezone || 'UTC';

  const translateActive = isTranslationActive(settings, lang);
  let translateLabel: string;
  if (translateActive) {
    const src = getEffectiveSource(settings, lang);
    const tgt = getEffectiveTarget(settings, lang) || src || 'auto';
    const srcDisplay = src ? src.toUpperCase() : t(lang, 'translate_mode_auto');
    translateLabel = `🌐 ${t(lang, 'translate_mode_badge', { source: srcDisplay, target: tgt.toUpperCase() })}`;
  } else {
    translateLabel = `🌐 ${t(lang, 'translate_mode_status_inactive')}`;
  }

  const text = t(lang, 'menu_settings_title');

  const keyboard = {
    inline_keyboard: [
      [{ text: `${t(lang, 'settings_lang')}: ${langName}`, callback_data: 'menu_lang' }],
      [{ text: `${t(lang, 'settings_model')}: ${modelLabel}`, callback_data: 'menu_model' }],
      [{ text: `${t(lang, 'settings_img_model')}: ${imgModelLabel}`, callback_data: 'menu_img_model' }],
      [{ text: `${t(lang, 'settings_length')}: ${getLengthLabel(lang, currentLength)}`, callback_data: 'toggle_length' }],
      [{ text: `${t(lang, 'settings_incognito')}: ${incogLabel}`, callback_data: 'toggle_memory' }],
      [{ text: `${t(lang, 'settings_formatting')}: ${fmtLabel}`, callback_data: 'toggle_formatting' }],
      [{ text: `${t(lang, 'settings_feedback')}: ${fbLabel}`, callback_data: 'toggle_feedback' }],
      [{ text: translateLabel, callback_data: 'menu_translate' }],
      [{ text: `${t(lang, 'settings_daily')}: ${dailyLabel}`, callback_data: 'toggle_daily' }],
      [{ text: `${t(lang, 'settings_timezone')}: ${timezone}`, callback_data: 'menu_timezone' }],
      [{ text: `${t(lang, 'back_button')}`, callback_data: 'back_start' }]
    ]
  };

  if (messageId) {
    await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, text, env, 'Markdown', keyboard);
  }
}

export async function showProfile(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const s = await getSettings(env, chatId);
  const persona = s.persona || 'Standard';
  const model = t(lang, MODELS[s.ai_model]?.label || 'model_fast');
  const lengthLabel = t(lang, `length_${s.response_length || 'short'}`);
  const langName = getLangName(lang) || lang;
  const incogStatus = s.memory_enabled ? t(lang, 'incognito_off') : t(lang, 'incognito_on');
  const fmtLabel = s.formatting === 'markdown' ? t(lang, 'formatting_markdown') : t(lang, 'formatting_plain');
  const fbLabel = s.feedback_enabled ? t(lang, 'feedback_on') : t(lang, 'feedback_off');
  const progLang = s.programming_lang ? t(lang, `prog_lang_${s.programming_lang}`) || s.programming_lang : t(lang, 'prog_lang_none');
  const instructions = s.custom_instructions ? (s.custom_instructions.length > 50 ? s.custom_instructions.slice(0, 50) + '...' : s.custom_instructions) : '—';

  const text = `📊 *Profile*\n` +
    `🎭 Persona: *${persona.toUpperCase()}*\n` +
    `🤖 Model: *${model}*\n` +
    `🌍 Language: *${langName}*\n` +
    `📏 Length: *${lengthLabel}*\n` +
    `🕵️ Incognito: *${incogStatus}*\n` +
    `🎨 Formatting: *${fmtLabel}*\n` +
    `👍 Feedback: *${fbLabel}*\n` +
    `💻 Prog Lang: *${progLang}*\n` +
    `📝 Custom: _${instructions}_\n` +
    `🗂️ Session: *${s.active_session || 'default'}*`;

  const keyboard = {
    inline_keyboard: [
      [{ text: t(lang, 'btn_clear'), callback_data: 'clear_memory' }],
      [{ text: t(lang, 'back_button'), callback_data: 'back_start' }]
    ]
  };

  if (messageId) {
    await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, text, env, 'Markdown', keyboard);
  }
}

export async function showProgLangMenu(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const langs = ['none', 'python', 'javascript', 'typescript', 'rust', 'go', 'java'];
  const keyboard = {
    inline_keyboard: [
      ...langs.map(l => [
        { text: t(lang, `prog_lang_${l}`), callback_data: `set_prog_lang_${l}` }
      ]),
      [{ text: t(lang, 'back_button'), callback_data: 'menu_settings' }]
    ]
  };
  if (messageId) {
    await editMessage(chatId, messageId, t(lang, 'settings_programming'), env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, t(lang, 'settings_programming'), env, 'Markdown', keyboard);
  }
}

export function buildModelKeyboard(lang: string, hasGeminiKey: boolean, backAction = 'menu_settings'): any {
  const modelEntries = Object.entries(MODELS).filter(([_, model]) =>
    model.provider !== 'google_direct' || hasGeminiKey
  );
  const rows: any[] = [];
  for (let i = 0; i < modelEntries.length; i += 2) {
    const row: any[] = [];
    row.push({ text: t(lang, modelEntries[i][1].label), callback_data: `set_model_${modelEntries[i][0]}` });
    if (modelEntries[i + 1]) {
      row.push({ text: t(lang, modelEntries[i + 1][1].label), callback_data: `set_model_${modelEntries[i + 1][0]}` });
    }
    rows.push(row);
  }
  const keyboard: any = { inline_keyboard: rows };
  if (!hasGeminiKey) {
    keyboard.inline_keyboard.push(
      [{ text: t(lang, 'model_gemini_api_guide'), callback_data: 'gemini_setup_guide' }]
    );
  }
  keyboard.inline_keyboard.push([{ text: t(lang, 'back_button'), callback_data: backAction }]);
  return keyboard;
}

export function buildImageModelKeyboard(lang: string, backAction = 'menu_settings'): any {
  return {
    inline_keyboard: [
      ...Object.entries(IMAGE_MODELS).map(([key, model]) => [
        { text: t(lang, model.label), callback_data: `set_img_model_${key}` }
      ]),
      [{ text: t(lang, 'back_button'), callback_data: backAction }]
    ]
  };
}

export function buildTimezoneKeyboard(lang: string, currentTz: string): any {
  const rows: any[] = [];
  for (let i = 0; i < COMMON_TIMEZONES.length; i += 3) {
    const row: any[] = [];
    for (let j = 0; j < 3 && i + j < COMMON_TIMEZONES.length; j++) {
      const tz = COMMON_TIMEZONES[i + j];
      const label = tz === currentTz ? `✅ ${tz}` : tz;
      row.push({ text: label, callback_data: `set_timezone_${tz}` });
    }
    rows.push(row);
  }
  rows.push([{ text: t(lang, 'back_button'), callback_data: 'menu_settings' }]);
  return { inline_keyboard: rows };
}

export async function showTimezoneMenu(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const settings = await getSettings(env, chatId);
  const currentTz = settings.timezone || 'UTC';
  const keyboard = buildTimezoneKeyboard(lang, currentTz);
  if (messageId) {
    await editMessage(chatId, messageId, t(lang, 'timezone_prompt'), env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, t(lang, 'timezone_prompt'), env, 'Markdown', keyboard);
  }
}

export async function showModelMenu(chatId: number | string, env: Env, lang: string): Promise<void> {
  const hasGeminiKey = !!env.GOOGLE_GEMINI_API_KEY;
  const keyboard = buildModelKeyboard(lang, hasGeminiKey);
  await sendMessage(chatId, t(lang, 'model_menu_title'), env, 'Markdown', keyboard);
}

export async function showTranslateModeMenu(chatId: number | string, env: Env, lang: string, messageId: number | null = null): Promise<void> {
  const settings = await getSettings(env, chatId);
  const translateActive = isTranslationActive(settings, lang);
  let status: string;
  if (translateActive) {
    const src = getEffectiveSource(settings, lang);
    const tgt = getEffectiveTarget(settings, lang) || src || 'auto';
    const srcDisplay = src ? getLanguageDisplay(src, lang) : t(lang, 'translate_mode_auto');
    status = t(lang, 'translate_mode_badge', { source: srcDisplay, target: getLanguageDisplay(tgt, lang) });
  } else {
    status = t(lang, 'translate_mode_status_inactive');
  }

  const currentSrc = getEffectiveSource(settings, lang);
  const keyboard = {
    inline_keyboard: [
      [{ text: t(lang, 'translate_mode_btn_source', { lang: currentSrc ? getLanguageDisplay(currentSrc, lang) : t(lang, 'translate_mode_auto') }), callback_data: 'translate_source' }],
      [{ text: t(lang, 'translate_mode_btn_target', { lang: getLanguageDisplay(getEffectiveTarget(settings, lang) || currentSrc || 'auto', lang) }), callback_data: 'translate_target' }],
      translateActive
        ? [{ text: t(lang, 'translate_mode_btn_deactivate'), callback_data: 'translate_cancel' }]
        : [{ text: t(lang, 'translate_mode_btn_activate'), callback_data: 'translate_activate' }],
      [{ text: t(lang, 'back_button'), callback_data: 'menu_settings' }]
    ]
  };

  const text = t(lang, 'translate_mode_title', { source: t(lang, 'translate_mode_set_source'), target: t(lang, 'translate_mode_set_target') }) + '\n' + status;

  if (messageId) {
    await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
  } else {
    await sendMessage(chatId, text, env, 'Markdown', keyboard);
  }
}

export function buildLanguageKeyboard(pending: string, lang: string): any {
  const codes = ['en', 'fa', 'ar', 'tr', 'ru', 'fr', 'de', 'es', 'it', 'pt', 'zh', 'ja', 'ko', 'hi', 'ur', 'nl', 'sv', 'pl', 'el', 'he', 'th', 'vi'];
  const rows: any[][] = [];
  if (pending === 'source') {
    rows.push([{ text: `🔄 ${t(lang, 'translate_mode_auto')}`, callback_data: `translate_confirm_source_auto` }]);
  }
  let row: any[] = [];
  for (const code of codes) {
    row.push({ text: `${getLanguageFlag(code)} ${code.toUpperCase()}`, callback_data: `translate_confirm_${pending}_${code}` });
    if (row.length >= 4) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length > 0) rows.push(row);
  rows.push([{ text: t(lang, 'back_button'), callback_data: 'menu_translate' }]);
  return { inline_keyboard: rows };
}
