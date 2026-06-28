import { sendMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import { getAdaptationSummary, resetAdaptation } from '../services/persona-adaptive.service.ts';
import type { Env } from '../types/env.d.ts';

export async function handleAdapt(chatId: number | string, args: string, env: Env, lang: string): Promise<any> {
  const cmd = args.trim().toLowerCase();

  if (cmd === 'reset') {
    await resetAdaptation(env, chatId);
    return await sendMessage(chatId, t(lang, 'adapt_reset'), env, 'Markdown');
  }

  const summary = await getAdaptationSummary(env, chatId);
  return await sendMessage(chatId, summary, env, 'Markdown');
}
