import type { Env } from '../types/env.d.ts';
import type { DebateSessionRow, DebateMessageRow } from '../types/d1.ts';
import { logger } from '../utils/logger.ts';

export async function createDebateSession(env: Env, chatId: number | string, userId: number): Promise<number> {
  if (!env.DB) throw new Error('DB not available');
  const result = await env.DB.prepare(
    'INSERT INTO debate_sessions (chat_id, user_id) VALUES (?, ?)'
  ).bind(String(chatId), userId).run();
  return Number(result?.meta?.last_row_id || 0);
}

export async function updateDebateSession(env: Env, sessionId: number, fields: Record<string, unknown>): Promise<void> {
  if (!env.DB) return;
  const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const values: unknown[] = Object.values(fields);
  if (!setClauses) return;
  await env.DB.prepare(`UPDATE debate_sessions SET ${setClauses} WHERE id = ?`).bind(...values as [unknown, ...unknown[]], sessionId).run();
}

export async function getActiveDebateSession(env: Env, chatId: number | string): Promise<DebateSessionRow | null> {
  if (!env.DB) return null;
  const row = await env.DB.prepare(
    'SELECT * FROM debate_sessions WHERE chat_id = ? AND status != ? ORDER BY id DESC LIMIT 1'
  ).bind(String(chatId), 'finished').first<DebateSessionRow | null>();
  return row || null;
}

export async function addDebateMessage(env: Env, sessionId: number, roundNumber: number, personaName: string, messageText: string): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(
    'INSERT INTO debate_messages (session_id, round_number, persona_name, message_text) VALUES (?, ?, ?, ?)'
  ).bind(sessionId, roundNumber, personaName, messageText).run();
}

export async function getDebateMessages(env: Env, sessionId: number): Promise<DebateMessageRow[]> {
  if (!env.DB) return [];
  const rows = await env.DB.prepare(
    'SELECT * FROM debate_messages WHERE session_id = ? ORDER BY id ASC'
  ).all<DebateMessageRow>();
  return rows.results || [];
}

export async function getDebateSession(env: Env, sessionId: number): Promise<DebateSessionRow | null> {
  if (!env.DB) return null;
  const row = await env.DB.prepare('SELECT * FROM debate_sessions WHERE id = ?').bind(sessionId).first<DebateSessionRow | null>();
  return row || null;
}
