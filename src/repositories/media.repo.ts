import type { Env } from '../types/env.d.ts';
import { logger } from '../utils/logger.ts';
import { cacheGet, cacheSet, cacheDel, cacheDelByPrefix, CACHE_TTL } from './cache.ts';

export interface MediaMetadata {
  id?: number;
  chat_id: string;
  session_id: string;
  media_type: 'photo' | 'document' | 'voice' | 'video_note' | 'sticker' | 'location' | 'contact';
  file_id: string | null;
  description: string;
  caption: string;
  mime_type: string | null;
  file_size: number | null;
  created_at?: string;
}

const MEDIA_CACHE_TTL = 300; // 5 min

export async function saveMediaMetadata(env: Env, meta: MediaMetadata): Promise<number | null> {
  if (!env.DB) return null;
  try {
    const result = await env.DB.prepare(
      `INSERT INTO media_metadata (chat_id, session_id, media_type, file_id, description, caption, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      meta.chat_id, meta.session_id, meta.media_type,
      meta.file_id, meta.description, meta.caption,
      meta.mime_type, meta.file_size,
    ).run();
    await cacheDel(`media:${meta.chat_id}:${meta.session_id}`);
    return result?.meta?.last_row_id || null;
  } catch (e: any) {
    logger.error('saveMediaMetadata error', { chatId: meta.chat_id, error: e.message });
    return null;
  }
}

export async function getRecentMedia(
  env: Env,
  chatId: number | string,
  sessionId: string,
  limit = 5,
): Promise<MediaMetadata[]> {
  if (!env.DB) return [];
  const cacheKey = `media:${chatId}:${sessionId}`;
  const cached = await cacheGet<MediaMetadata[]>(cacheKey);
  if (cached) return cached.slice(0, limit);
  try {
    const rows = await env.DB.prepare(
      `SELECT id, chat_id, session_id, media_type, file_id, description, caption, mime_type, file_size, created_at
       FROM media_metadata
       WHERE chat_id = ? AND session_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    ).bind(String(chatId), sessionId, 20).all<MediaMetadata>();
    const result = rows.results || [];
    await cacheSet(cacheKey, result, MEDIA_CACHE_TTL);
    return result.slice(0, limit);
  } catch (e: any) {
    logger.error('getRecentMedia error', { chatId, error: e.message });
    return [];
  }
}

export async function getMediaByType(
  env: Env,
  chatId: number | string,
  mediaType: MediaMetadata['media_type'],
  limit = 5,
): Promise<MediaMetadata[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      `SELECT id, chat_id, session_id, media_type, file_id, description, caption, mime_type, file_size, created_at
       FROM media_metadata
       WHERE chat_id = ? AND media_type = ?
       ORDER BY created_at DESC
       LIMIT ?`
    ).bind(String(chatId), mediaType, limit).all<MediaMetadata>();
    return rows.results || [];
  } catch (e: any) {
    logger.error('getMediaByType error', { chatId, mediaType, error: e.message });
    return [];
  }
}

export async function getMediaCount(env: Env, chatId: number | string): Promise<number> {
  if (!env.DB) return 0;
  try {
    const row = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM media_metadata WHERE chat_id = ?'
    ).bind(String(chatId)).first<{ cnt: number }>();
    return row?.cnt || 0;
  } catch { return 0; }
}

export async function clearMediaMetadata(env: Env, chatId: number | string, sessionId?: string): Promise<void> {
  if (!env.DB) return;
  try {
    if (sessionId) {
      await env.DB.prepare(
        'DELETE FROM media_metadata WHERE chat_id = ? AND session_id = ?'
      ).bind(String(chatId), sessionId).run();
    } else {
      await env.DB.prepare(
        'DELETE FROM media_metadata WHERE chat_id = ?'
      ).bind(String(chatId)).run();
    }
    await cacheDelByPrefix(`media:${chatId}:`);
  } catch (e: any) {
    logger.error('clearMediaMetadata error', { chatId, error: e.message });
  }
}

export async function cleanupOldMedia(env: Env, daysOld = 30): Promise<number> {
  if (!env.DB) return 0;
  try {
    const result = await env.DB.prepare(
      "DELETE FROM media_metadata WHERE created_at < datetime('now', '-' || ? || ' days')"
    ).bind(daysOld).run();
    return result?.meta?.changes || 0;
  } catch { return 0; }
}
