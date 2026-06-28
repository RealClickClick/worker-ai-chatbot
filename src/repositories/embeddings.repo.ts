import type { Env } from '../types/env.d.ts';
import { logger } from '../utils/logger.ts';

export interface EmbeddingRow {
  id: number;
  chat_id: string;
  document_id: number;
  chunk_index: number;
  content: string;
  vector: string;
  created_at: string;
}

export async function saveEmbedding(
  env: Env, chatId: number | string, documentId: number, chunkIndex: number, content: string, vector: number[],
): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      'INSERT INTO embeddings (chat_id, document_id, chunk_index, content, vector) VALUES (?, ?, ?, ?, ?)'
    ).bind(String(chatId), documentId, chunkIndex, content, JSON.stringify(vector)).run();
  } catch (e: any) {
    logger.error('saveEmbedding error', { chatId, error: e.message });
  }
}

export async function getEmbeddingsByChat(env: Env, chatId: number | string): Promise<EmbeddingRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, chat_id, document_id, chunk_index, content, vector, created_at FROM embeddings WHERE chat_id = ? ORDER BY id'
    ).bind(String(chatId)).all<EmbeddingRow>();
    return rows.results || [];
  } catch (e: any) {
    logger.error('getEmbeddingsByChat error', { chatId, error: e.message });
    return [];
  }
}

export async function deleteEmbeddingsByChat(env: Env, chatId: number | string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM embeddings WHERE chat_id = ?').bind(String(chatId)).run();
  } catch (e: any) {
    logger.error('deleteEmbeddingsByChat error', { chatId, error: e.message });
  }
}

export async function deleteEmbeddingsByDocument(env: Env, documentId: number): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM embeddings WHERE document_id = ?').bind(documentId).run();
  } catch (e: any) {
    logger.error('deleteEmbeddingsByDocument error', { error: e.message });
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function parseVector(json: string): number[] {
  try { return JSON.parse(json); } catch { return []; }
}
