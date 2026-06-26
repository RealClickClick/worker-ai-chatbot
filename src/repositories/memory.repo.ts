import type { Env } from '../types/env.d.ts';
import type { MemorySummaryRow } from '../types/d1.ts';
import { logger } from '../utils/logger.ts';

export async function saveMemorySummary(env: Env, chatId: number | string, sessionId: string, summary: string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      'INSERT INTO memory_summaries (chat_id, session_id, summary) VALUES (?, ?, ?)'
    ).bind(String(chatId), sessionId, summary).run();
  } catch (e: any) {
    logger.error('DB saveMemorySummary error', { chatId, error: e.message });
  }
}

export async function getMemorySummaries(env: Env, chatId: number | string, sessionId: string, limit: number = 3): Promise<MemorySummaryRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, chat_id, session_id, summary, created_at FROM memory_summaries WHERE chat_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(String(chatId), sessionId, limit).all<MemorySummaryRow>();
    return rows.results || [];
  } catch (e: any) {
    logger.error('DB getMemorySummaries error', { chatId, error: e.message });
    return [];
  }
}

export async function deleteMemorySummaries(env: Env, chatId: number | string, sessionId?: string): Promise<void> {
  if (!env.DB) return;
  try {
    if (sessionId) {
      await env.DB.prepare('DELETE FROM memory_summaries WHERE chat_id = ? AND session_id = ?').bind(String(chatId), sessionId).run();
    } else {
      await env.DB.prepare('DELETE FROM memory_summaries WHERE chat_id = ?').bind(String(chatId)).run();
    }
  } catch (e: any) {
    logger.error('DB deleteMemorySummaries error', { chatId, error: e.message });
  }
}
