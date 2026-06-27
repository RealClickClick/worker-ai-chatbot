import type { Env } from '../types/env.d.ts';
import type { DebateSessionRow, DebateMessageRow, DebateTemplateRow } from '../types/d1.ts';
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
  ).bind(sessionId).all<DebateMessageRow>();
  return rows.results || [];
}

export async function getDebateSession(env: Env, sessionId: number): Promise<DebateSessionRow | null> {
  if (!env.DB) return null;
  const row = await env.DB.prepare('SELECT * FROM debate_sessions WHERE id = ?').bind(sessionId).first<DebateSessionRow | null>();
  return row || null;
}

export async function getDebateSessions(env: Env, chatId: number | string, limit = 10, offset = 0): Promise<DebateSessionRow[]> {
  if (!env.DB) return [];
  const rows = await env.DB.prepare(
    'SELECT * FROM debate_sessions WHERE chat_id = ? AND status = ? ORDER BY id DESC LIMIT ? OFFSET ?'
  ).bind(String(chatId), 'finished', limit, offset).all<DebateSessionRow>();
  return rows.results || [];
}

export async function saveDebateTemplate(env: Env, chatId: number | string, name: string, persona1: string, persona2: string, style: string): Promise<number> {
  if (!env.DB) throw new Error('DB not available');
  const result = await env.DB.prepare(
    'INSERT INTO debate_templates (chat_id, name, persona_1, persona_2, style) VALUES (?, ?, ?, ?, ?)'
  ).bind(String(chatId), name, persona1, persona2, style).run();
  return Number(result?.meta?.last_row_id || 0);
}

export async function getDebateTemplates(env: Env, chatId: number | string): Promise<DebateTemplateRow[]> {
  if (!env.DB) return [];
  const rows = await env.DB.prepare(
    'SELECT * FROM debate_templates WHERE chat_id = ? ORDER BY created_at DESC'
  ).bind(String(chatId)).all<DebateTemplateRow>();
  return rows.results || [];
}

export async function deleteDebateTemplate(env: Env, templateId: number, chatId: number | string): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(
    'DELETE FROM debate_templates WHERE id = ? AND chat_id = ?'
  ).bind(templateId, String(chatId)).run();
}

export async function deleteDebateRoundMessages(env: Env, sessionId: number, roundNumber: number): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(
    'DELETE FROM debate_messages WHERE session_id = ? AND round_number = ?'
  ).bind(sessionId, roundNumber).run();
}

export async function deleteDebateRoundPersonaMessage(env: Env, sessionId: number, roundNumber: number, personaName: string): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(
    'DELETE FROM debate_messages WHERE session_id = ? AND round_number = ? AND persona_name = ?'
  ).bind(sessionId, roundNumber, personaName).run();
}
