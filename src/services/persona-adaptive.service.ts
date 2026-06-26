import type { Env } from '../types/env.d.ts';
import { runChat } from '../ai.ts';
import { getFeedbackLog, getLearnedTraits, upsertPersonaAdaptation, clearFeedbackLog } from '../repositories/persona.repo.ts';
import { logger } from '../utils/logger.ts';

const ADAPT_PROMPT = `You are a user preference analyst. Based on the following feedback log (user liked 👍 or disliked 👎 AI responses), infer the user's communication preferences.

Feedback log:
{log}

Return a concise, single-paragraph description of the user's inferred preferences. Focus on: response style (concise/detailed), tone (formal/casual/humorous), formatting preference, and any specific topics they favor. If the data is insufficient, return "Insufficient data."`;

export async function analyzeFeedback(env: Env, chatId: number | string): Promise<void> {
  const log = await getFeedbackLog(env, chatId);
  if (log.length < 5) return;

  const logLines = log.map(e => `[${e.timestamp}] ${e.category === 'good' ? '👍' : '👎'}`).join('\n');
  const prompt = ADAPT_PROMPT.replace('{log}', logLines);

  try {
    const result = await runChat(env, [{ role: 'user', content: prompt }], 300, 'fast');
    const traits = result.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    if (traits && traits !== 'Insufficient data.') {
      await upsertPersonaAdaptation(env, chatId, {
        learned_traits: traits,
        last_adapted: new Date().toISOString(),
      });
      await clearFeedbackLog(env, chatId);
      logger.info('Persona adapted', { chatId, traits: traits.slice(0, 100) });
    }
  } catch (e: any) {
    logger.warn('Feedback analysis failed', { chatId, error: e.message });
  }
}

export async function getAdaptationContext(env: Env, chatId: number | string): Promise<string | null> {
  const traits = await getLearnedTraits(env, chatId);
  if (!traits) return null;
  return `[Learned User Preferences: ${traits}]`;
}

export { getLearnedTraits, recordFeedback } from '../repositories/persona.repo.ts';
