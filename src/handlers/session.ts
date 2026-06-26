import { sendMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import type { Env } from '../types/env.d.ts';
import { getSettings, createSession, getSessions, setActiveSession } from '../services/index.ts';
import { validateSessionName } from '../utils/validate.ts';

export async function handleSession(chatId: number | string, args: string, env: Env, lang: string): Promise<any> {
  const settings = await getSettings(env, chatId);

  if (!args) return await sendMessage(chatId, t(lang, 'session_usage'), env, 'Markdown');

  const parts = args.split(' ');
  const cmd = parts[0].toLowerCase();

  if (cmd === 'new') {
    const name = validateSessionName(parts.slice(1).join('_')) || `session_${Date.now()}`;
    await createSession(env, chatId, name, name);
    await setActiveSession(env, chatId, name);
    return await sendMessage(chatId, t(lang, 'session_created', { name }), env, 'Markdown');
  }

  if (cmd === 'list') {
    const sessions = await getSessions(env, chatId);
    if (!sessions.length) return await sendMessage(chatId, t(lang, 'session_empty'), env);
    const list = sessions.map(s => `• ${s.session_id === settings.active_session ? '👉' : '  '} \`${s.session_id}\`${s.title ? ` — ${s.title}` : ''}`).join('\n');
    return await sendMessage(chatId, t(lang, 'session_list_title', { list, current: settings.active_session || 'default' }), env, 'Markdown');
  }

  const sessionId = validateSessionName(cmd) || cmd;
  await createSession(env, chatId, sessionId, sessionId);
  await setActiveSession(env, chatId, sessionId);
  return await sendMessage(chatId, t(lang, 'session_switched', { name: sessionId }), env, 'Markdown');
}
