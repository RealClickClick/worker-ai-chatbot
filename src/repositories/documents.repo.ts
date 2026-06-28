import type { Env } from '../types/env.d.ts';
import type { DocumentRow } from '../types/d1.ts';
import { logger } from '../utils/logger.ts';

export async function addDocument(env: Env, chatId: number | string, content: string, source: string = 'text', title: string = ''): Promise<number | null> {
  if (!env.DB) return null;
  try {
    const result = await env.DB.prepare(
      'INSERT INTO documents (chat_id, source, title, content) VALUES (?, ?, ?, ?)'
    ).bind(String(chatId), source, title, content).run();
    return result?.meta?.last_row_id ?? null;
  } catch (e: any) {
    logger.error('DB addDocument error', { chatId, error: e.message });
    return null;
  }
}

export async function searchDocuments(env: Env, chatId: number | string, query: string, limit: number = 5): Promise<DocumentRow[]> {
  if (!env.DB) return [];
  try {
    const terms = query.split(/\s+/).filter(t => t.length > 2).slice(0, 10);
    if (terms.length === 0) return [];
    const conditions = terms.map(() => 'content LIKE ?');
    const sql = `SELECT id, chat_id, source, title, content, created_at FROM documents WHERE chat_id = ? AND (${conditions.join(' OR ')}) ORDER BY created_at DESC LIMIT ?`;
    const params = terms.map(t => `%${t}%`);
    const rows = await env.DB.prepare(sql).bind(String(chatId), ...params, limit).all<DocumentRow>();
    return rows.results || [];
  } catch (e: any) {
    logger.error('DB searchDocuments error', { chatId, error: e.message });
    return [];
  }
}

export async function deleteDocuments(env: Env, chatId: number | string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM documents WHERE chat_id = ?').bind(String(chatId)).run();
  } catch (e: any) {
    logger.error('DB deleteDocuments error', { chatId, error: e.message });
  }
}

export async function getDocumentCount(env: Env, chatId: number | string): Promise<number> {
  if (!env.DB) return 0;
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) as cnt FROM documents WHERE chat_id = ?').bind(String(chatId)).first<{ cnt: number }>();
    return row?.cnt || 0;
  } catch (e: any) {
    return 0;
  }
}
