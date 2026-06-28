import type { Env } from '../types/env.d.ts';
import type { CustomPersonaRow, PersonaAdaptationRow } from '../types/d1.ts';
import { logger } from '../utils/logger.ts';

export async function saveCustomPersona(env: Env, chatId: number | string, name: string, description: string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      'INSERT OR REPLACE INTO custom_personas (chat_id, name, description) VALUES (?, ?, ?)'
    ).bind(String(chatId), name, description).run();
  } catch (e: any) { logger.error('DB saveCustomPersona error', { chatId, name, error: e.message }); }
}

export async function getCustomPersonas(env: Env, chatId: number | string): Promise<CustomPersonaRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT name, description FROM custom_personas WHERE chat_id = ? ORDER BY created_at DESC'
    ).bind(String(chatId)).all<CustomPersonaRow>();
    return rows.results || [];
  } catch (e: any) { return []; }
}

export async function deleteCustomPersona(env: Env, chatId: number | string, name: string): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(
    'DELETE FROM custom_personas WHERE chat_id = ? AND name = ?'
  ).bind(String(chatId), name).run();
}

// === Persona Adaptation ===

const ADAPTATION_THRESHOLD = 5;

export async function getPersonaAdaptation(env: Env, chatId: number | string): Promise<PersonaAdaptationRow | null> {
  if (!env.DB) return null;
  try {
    return await env.DB.prepare(
      'SELECT chat_id, feedback_log, learned_traits, last_adapted, adaptation_count, interaction_count FROM persona_adaptation WHERE chat_id = ?'
    ).bind(String(chatId)).first<PersonaAdaptationRow | null>();
  } catch (e: any) {
    logger.error('DB getPersonaAdaptation error', { chatId, error: e.message });
    return null;
  }
}

export async function upsertPersonaAdaptation(env: Env, chatId: number | string, data: Partial<PersonaAdaptationRow>): Promise<void> {
  if (!env.DB) return;
  const current = await getPersonaAdaptation(env, chatId);
  const feedbackLog = data.feedback_log ?? current?.feedback_log ?? '[]';
  const learnedTraits = data.learned_traits !== undefined ? data.learned_traits : (current?.learned_traits ?? null);
  const lastAdapted = data.last_adapted !== undefined ? data.last_adapted : (current?.last_adapted ?? null);
  const adaptationCount = data.adaptation_count ?? current?.adaptation_count ?? 0;
  const interactionCount = data.interaction_count ?? current?.interaction_count ?? 0;
  try {
    await env.DB.prepare(
      `INSERT INTO persona_adaptation (chat_id, feedback_log, learned_traits, last_adapted, adaptation_count, interaction_count)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(chat_id) DO UPDATE SET
         feedback_log = excluded.feedback_log,
         learned_traits = excluded.learned_traits,
         last_adapted = excluded.last_adapted,
         adaptation_count = excluded.adaptation_count,
         interaction_count = excluded.interaction_count`
    ).bind(String(chatId), feedbackLog, learnedTraits, lastAdapted, adaptationCount, interactionCount).run();
  } catch (e: any) { logger.error('DB upsertPersonaAdaptation error', { chatId, error: e.message }); }
}

export async function recordFeedback(env: Env, chatId: number | string, category: string): Promise<boolean> {
  const current = await getPersonaAdaptation(env, chatId);
  let log: Array<{ category: string; timestamp: string }> = [];
  if (current?.feedback_log) {
    try { log = JSON.parse(current.feedback_log); } catch { log = []; }
  }
  log.push({ category, timestamp: new Date().toISOString() });
  const shouldAdapt = log.length >= ADAPTATION_THRESHOLD;
  await upsertPersonaAdaptation(env, chatId, {
    feedback_log: JSON.stringify(log),
    adaptation_count: shouldAdapt ? (current?.adaptation_count ?? 0) + 1 : (current?.adaptation_count ?? 0),
    ...(shouldAdapt ? {
      last_adapted: new Date().toISOString(),
      learned_traits: null, // will be filled by service
    } : {}),
  });
  return shouldAdapt;
}

export async function getLearnedTraits(env: Env, chatId: number | string): Promise<string | null> {
  const row = await getPersonaAdaptation(env, chatId);
  return row?.learned_traits ?? null;
}

export async function getFeedbackLog(env: Env, chatId: number | string): Promise<Array<{ category: string; timestamp: string }>> {
  const row = await getPersonaAdaptation(env, chatId);
  if (!row?.feedback_log) return [];
  try { return JSON.parse(row.feedback_log); } catch { return []; }
}

export async function clearFeedbackLog(env: Env, chatId: number | string): Promise<void> {
  await upsertPersonaAdaptation(env, chatId, { feedback_log: '[]' });
}
