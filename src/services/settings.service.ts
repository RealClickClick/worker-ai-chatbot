import type { Env } from '../types/env.d.ts';
import type { SettingsRow } from '../types/d1.ts';
import {
  getSettings as repoGetSettings,
  setPersona, setResponseLength, setAiModel, setImgModel,
  setLanguage, setTranslateSource, setTranslateTarget,
  setTranslatePending, setTranslateEnabled,
  setCustomInstructions, setBotName, setActiveSession, setProgrammingLang,
  toggleMemory, toggleFormatting, toggleFeedback, toggleResponseLength,
  setTimezone, toggleDailyTips, getDailyTipsEnabled, getDailyTipsChats,
  createSession, getSessions,
  setEnsembleEnabled, setEnsembleModels, setEnsembleStrategy,
} from '../repositories/settings.repo.ts';

export async function getSettings(env: Env, chatId: number | string): Promise<SettingsRow> {
  return repoGetSettings(env, chatId);
}

export async function updateSetting(
  env: Env, chatId: number | string, field: string, value: string | number | null
): Promise<void> {
  const setters: Record<string, (env: Env, chatId: number | string, val: any) => Promise<void>> = {
    persona: setPersona,
    response_length: setResponseLength,
    ai_model: setAiModel,
    img_model: setImgModel,
    lang: setLanguage,
    translate_source: setTranslateSource,
    translate_target: setTranslateTarget,
    translate_pending: setTranslatePending,
    translate_enabled: setTranslateEnabled,
    custom_instructions: setCustomInstructions,
    bot_name: setBotName,
    active_session: setActiveSession,
    programming_lang: setProgrammingLang,
    timezone: setTimezone,
    ensemble_enabled: setEnsembleEnabled,
    ensemble_models: setEnsembleModels,
    ensemble_strategy: setEnsembleStrategy,
  };
  const setter = setters[field];
  if (setter) {
    await setter(env, chatId, value);
  }
}

export {
  setPersona, setResponseLength, setAiModel, setImgModel,
  setLanguage, setTranslateSource, setTranslateTarget,
  setTranslatePending, setTranslateEnabled,
  setCustomInstructions, setBotName, setActiveSession, setProgrammingLang,
  toggleMemory, toggleFormatting, toggleFeedback, toggleResponseLength,
  setTimezone, toggleDailyTips, getDailyTipsEnabled, getDailyTipsChats,
  createSession, getSessions,
  setEnsembleEnabled, setEnsembleModels, setEnsembleStrategy,
};
