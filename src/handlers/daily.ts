import { sendMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import { runChat, cleanAIResponseText } from '../ai.ts';
import { buildDailyPrompt, getTodayOccasions, getRandomTip, tryFetchExternalHolidays } from '../utils/occasions.ts';
import { toggleDailyTips, getDailyTipsEnabled, getDailyTipsChats, getSettings } from '../services/index.ts';
import { TOKEN_LIMIT_SHORT } from '../constants.ts';
import { logger } from '../utils/logger.ts';
import type { Env } from '../types/env.d.ts';

const AI_MODEL_FOR_DAILY = 'fast';

export async function handleDailyCommand(chatId: number | string, env: Env, lang: string): Promise<void> {
  const enabled = await getDailyTipsEnabled(env, chatId);
  await toggleDailyTips(env, chatId);
  const newStatus = !enabled;
  const key = newStatus ? 'daily_tips_on' : 'daily_tips_off';
  await sendMessage(chatId, t(lang, key), env, 'Markdown');
}

export async function generateDailyMessage(env: Env, chatId: number | string, lang: string): Promise<string> {
  const occasions = getTodayOccasions(lang);

  const externalHolidays = await tryFetchExternalHolidays();
  const allOccasions = [...new Set([...externalHolidays, ...occasions])];

  const prompt = buildDailyPrompt(allOccasions, lang, `Chat ${chatId}`);

  try {
    const response = await runChat(env, [
      { role: 'system', content: `You are a friendly daily assistant. Write warm daily greeting messages. Current date: ${new Date().toISOString().slice(0, 10)}.` },
      { role: 'user', content: prompt }
    ], TOKEN_LIMIT_SHORT, AI_MODEL_FOR_DAILY);

    const clean = cleanAIResponseText(response || '');
    if (clean) return clean;
  } catch (e: any) {
    logger.error('Daily message generation error', { chatId, error: e.message });
  }

  const tip = getRandomTip(lang);
  const date = new Date().toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const greeting = t(lang, 'daily_fallback_greeting', { date });

  if (allOccasions.length > 0) {
    return `${greeting}\n\n🎉 ${t(lang, 'daily_occasion_today', { occasions: allOccasions.join(', ') })}\n\n${tip}`;
  }

  return `${greeting}\n\n${tip}`;
}

export async function sendDailyTipsToAll(env: Env): Promise<number> {
  const chats = await getDailyTipsChats(env);
  let sent = 0;

  for (const chatId of chats) {
    try {
      const settings = await getSettings(env, chatId);
      const lang = settings.lang || 'en';
      const message = await generateDailyMessage(env, chatId, lang);
      await sendMessage(chatId, message, env, 'Markdown');
      sent++;
    } catch (e: any) {
      logger.error('Daily tip send failed', { chatId, error: e.message });
    }
  }

  logger.info('Daily tips sent', { total: chats.length, sent });
  return sent;
}
