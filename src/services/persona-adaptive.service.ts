import type { Env } from '../types/env.d.ts';
import { runChat } from '../ai.ts';
import { getPersonaAdaptation, upsertPersonaAdaptation, getFeedbackLog, getLearnedTraits, clearFeedbackLog } from '../repositories/persona.repo.ts';
import { logger } from '../utils/logger.ts';

const ADAPT_INTERVAL = 15;
const TRAIT_KEYS = ['formality', 'verbosity', 'humor', 'emotion', 'technical'] as const;
export type TraitKey = typeof TRAIT_KEYS[number];

export interface AdaptationProfile {
  traits: Record<TraitKey, number>;
  preferences: string[];
  topTopics: string[];
}

const ANALYSIS_PROMPT = `You are a user behavior analyst. Analyze these recent user messages and infer their communication preferences.

Recent messages (user):
{messages}

Return ONLY this JSON:
{
  "traits": {
    "formality": <0-10, 0=very casual, 10=very formal>,
    "verbosity": <0-10, 0=very brief, 10=very detailed>,
    "humor": <0-10, 0=serious, 10=playful>,
    "emotion": <0-10, 0=neutral, 10=emotional>,
    "technical": <0-10, 0=general, 10=technical>
  },
  "preferences": ["prefer short paragraphs", "like examples", ...],
  "topTopics": ["topic1", "topic2", ...]
}`;

const ADAPT_PROMPT = `You are a user preference analyst. Based on the following feedback log (user liked 👍 or disliked 👎 AI responses), infer the user's communication preferences.

Feedback log:
{log}

Return a concise, single-paragraph description of the user's inferred preferences. Focus on: response style (concise/detailed), tone (formal/casual/humorous), formatting preference, and any specific topics they favor. If the data is insufficient, return "Insufficient data."`;

export function extractTraits(text: string): Partial<Record<TraitKey, number>> {
  const traits: Partial<Record<TraitKey, number>> = {};
  const words = text.split(/\s+/).length;

  traits.verbosity = words > 50 ? 8 : words > 20 ? 5 : 2;

  const emojiCount = (text.match(/[\u{1F000}-\u{1FFFF}]/gu) || []).length;
  traits.emotion = emojiCount > 3 ? 7 : emojiCount > 0 ? 4 : 2;

  const upperFirst = (text.match(/^[A-Z]/m) || []).length;
  traits.formality = upperFirst > text.split('\n').length * 0.5 ? 6 : 3;

  return traits;
}

export async function recordInteraction(env: Env, chatId: number | string, message: string): Promise<void> {
  try {
    const current = await getPersonaAdaptation(env, chatId);
    const count = (current?.interaction_count ?? 0) + 1;

    await upsertPersonaAdaptation(env, chatId, { interaction_count: count });

    if (count % ADAPT_INTERVAL === 0) {
      await analyzeConversationStyle(env, chatId, message);
    }
  } catch (e: any) {
    logger.warn('recordInteraction error', { chatId, error: e.message });
  }
}

async function analyzeConversationStyle(env: Env, chatId: number | string, lastMessage: string): Promise<void> {
  const prompt = ANALYSIS_PROMPT.replace('{messages}', lastMessage.slice(0, 1000));
  try {
    const response = await runChat(env, [{ role: 'user', content: prompt }], 500, 'fast');
    const cleaned = response.replace(/```(?:json)?\s*/g, '').trim();
    const parsed = JSON.parse(cleaned) as AdaptationProfile;

    if (parsed.traits) {
      const profile = parsed;
      const current = await getPersonaAdaptation(env, chatId);
      const existingTraits = current?.learned_traits ? JSON.parse(current.learned_traits) as AdaptationProfile : null;

      if (existingTraits) {
        for (const key of TRAIT_KEYS) {
          if (profile.traits[key] !== undefined && existingTraits.traits[key] !== undefined) {
            profile.traits[key] = Math.round((existingTraits.traits[key] * 2 + profile.traits[key]) / 3);
          }
        }
        const allTopics = new Set([...(existingTraits.topTopics || []), ...(profile.topTopics || [])]);
        profile.topTopics = [...allTopics].slice(0, 8);
        const allPrefs = new Set([...(existingTraits.preferences || []), ...(profile.preferences || [])]);
        profile.preferences = [...allPrefs].slice(0, 8);
      }

      await upsertPersonaAdaptation(env, chatId, {
        learned_traits: JSON.stringify(profile),
        last_adapted: new Date().toISOString(),
        adaptation_count: (current?.adaptation_count ?? 0) + 1,
      });
      logger.info('Persona adapted from conversation', { chatId });
    }
  } catch (e: any) {
    logger.warn('Conversation style analysis failed', { chatId, error: e.message });
  }
}

export async function getAdaptationContext(env: Env, chatId: number | string): Promise<string | null> {
  const row = await getPersonaAdaptation(env, chatId);
  if (!row?.learned_traits) return null;

  try {
    const profile = JSON.parse(row.learned_traits) as AdaptationProfile;
    const traitLines = TRAIT_KEYS.map(k => {
      const val = profile.traits[k] ?? 5;
      const bar = '█'.repeat(Math.round(val / 2)) + '░'.repeat(5 - Math.round(val / 2));
      return `  ${k}: ${bar} (${val}/10)`;
    }).join('\n');
    const prefLine = profile.preferences?.length ? `\n  Preferences: ${profile.preferences.join(', ')}` : '';
    const topicLine = profile.topTopics?.length ? `\n  Frequent topics: ${profile.topTopics.join(', ')}` : '';

    return `[User Adaptation Profile:\n${traitLines}${prefLine}${topicLine}\n  Adaptations: ${row.adaptation_count}\n]`;
  } catch {
    return `[Learned User Preferences: ${row.learned_traits}]`;
  }
}

export async function getAdaptationSummary(env: Env, chatId: number | string): Promise<string> {
  const row = await getPersonaAdaptation(env, chatId);
  if (!row) return 'No adaptation data yet. Keep chatting!';

  let summary = `📊 *Adaptation Stats*\n`;
  summary += `📝 Interactions tracked: *${row.interaction_count}*\n`;
  summary += `🔄 Adaptations performed: *${row.adaptation_count}*\n`;
  summary += `📅 Last adapted: *${row.last_adapted ? new Date(row.last_adapted + 'Z').toLocaleDateString() : 'Never'}*\n`;

  if (row.learned_traits) {
    try {
      const profile = JSON.parse(row.learned_traits) as AdaptationProfile;
      summary += `\n🎭 *Communication Profile:*\n`;
      for (const key of TRAIT_KEYS) {
        const val = profile.traits[key] ?? 5;
        const label = key === 'formality' ? 'Formality' : key === 'verbosity' ? 'Detail' : key === 'humor' ? 'Humor' : key === 'emotion' ? 'Emotion' : 'Technical';
        const bar = '█'.repeat(Math.round(val / 2)) + '░'.repeat(5 - Math.round(val / 2));
        summary += `  ${label}: ${bar} (${val}/10)\n`;
      }
      if (profile.preferences?.length) {
        summary += `\n💡 *Preferences:* ${profile.preferences.slice(0, 4).join(', ')}`;
      }
      if (profile.topTopics?.length) {
        summary += `\n📚 *Topics:* ${profile.topTopics.slice(0, 4).join(', ')}`;
      }
    } catch {
      summary += `\n📋 *Learned:* ${row.learned_traits.slice(0, 300)}`;
    }
  }

  return summary;
}

export async function resetAdaptation(env: Env, chatId: number | string): Promise<void> {
  await upsertPersonaAdaptation(env, chatId, {
    learned_traits: null,
    feedback_log: '[]',
    interaction_count: 0,
    adaptation_count: 0,
    last_adapted: null,
  });
}

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
      logger.info('Persona adapted from feedback', { chatId, traits: traits.slice(0, 100) });
    }
  } catch (e: any) {
    logger.warn('Feedback analysis failed', { chatId, error: e.message });
  }
}

export { getLearnedTraits, recordFeedback } from '../repositories/persona.repo.ts';
