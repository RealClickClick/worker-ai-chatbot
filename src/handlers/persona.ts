import { sendMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import type { Env } from '../types/env.d.ts';
import { getCustomPersonas, saveCustomPersona, deleteCustomPersona } from '../services/index.ts';
import { validatePersonaName } from '../utils/validate.ts';

export async function handleNewPersona(chatId: number | string, args: string, env: Env, lang: string): Promise<any> {
  if (!args) return await sendMessage(chatId, t(lang, 'newpersona_usage'), env, 'Markdown');

  if (args === 'list') {
    const list = await getCustomPersonas(env, chatId);
    if (!list.length) return await sendMessage(chatId, t(lang, 'newpersona_empty'), env, 'Markdown');
    const text = list.map(p => `• *${p.name}* — ${p.description.slice(0, 60)}`).join('\n');
    return await sendMessage(chatId, t(lang, 'newpersona_list_title', { list: text }), env, 'Markdown');
  }

  if (args.startsWith('delete ')) {
    const name = args.slice(7).trim();
    const list = await getCustomPersonas(env, chatId);
    if (!list.find(p => p.name === name)) return await sendMessage(chatId, t(lang, 'newpersona_not_found'), env);
    await deleteCustomPersona(env, chatId, name);
    return await sendMessage(chatId, t(lang, 'newpersona_deleted', { name }), env, 'Markdown');
  }

  const sep = args.indexOf('|');
  if (sep === -1) return await sendMessage(chatId, t(lang, 'newpersona_usage'), env, 'Markdown');
  const name = validatePersonaName(args.slice(0, sep));
  const desc = args.slice(sep + 1).trim();
  if (!name || !desc) return await sendMessage(chatId, t(lang, 'newpersona_usage'), env, 'Markdown');
  await saveCustomPersona(env, chatId, name, desc);
  return await sendMessage(chatId, t(lang, 'newpersona_saved', { name }), env, 'Markdown');
}
