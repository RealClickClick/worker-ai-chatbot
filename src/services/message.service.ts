import type { Env } from '../types/env.d.ts';
import type { SettingsRow, ChatHistoryRow } from '../types/d1.ts';
import { getSettings } from '../repositories/settings.repo.ts';
import { getChatHistory, addChatMessage } from '../repositories/chat.repo.ts';
import { checkRateLimit, isBlocked, trackMessage } from '../repositories/admin.repo.ts';

export interface MessageContext {
  settings: SettingsRow;
  history: any[];
  lang: string;
  sessionId: string;
}

export async function loadMessageContext(env: Env, chatId: number | string, lang: string): Promise<MessageContext | null> {
  if (await isBlocked(env, chatId)) return null;
  const settings = await getSettings(env, chatId);
  const sessionId = settings.active_session || 'default';
  const history = await getChatHistory(env, chatId, sessionId);
  return { settings, history, lang, sessionId };
}

export async function canProceed(env: Env, chatId: number | string, tier = 'basic'): Promise<boolean> {
  return checkRateLimit(env, chatId, tier);
}

export async function recordMessage(env: Env, chatId: number | string, role: string, content: string, sessionId = 'default'): Promise<void> {
  await addChatMessage(env, chatId, role, content, sessionId);
}

export async function trackUserMessage(env: Env): Promise<void> {
  await trackMessage(env);
}

export { getSettings, getChatHistory, isBlocked, checkRateLimit };
