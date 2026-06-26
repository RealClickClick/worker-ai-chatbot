import type { Env, GroupMessage } from '../types/env.d.ts';
import type { ChatHistoryRow, CountRow } from '../types/d1.ts';
import { MAX_HISTORY, GROUP_USER_WINDOW_SIZE } from '../constants.ts';
import { logger } from '../utils/logger.ts';
import { bumpCacheGen } from './cache.ts';

export async function getChatHistory(env: Env, chatId: number | string, sessionId = 'default', limit = 6): Promise<any[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT role, content FROM chat_history WHERE chat_id = ? AND session_id = ? ORDER BY created_at ASC LIMIT ?'
    ).bind(String(chatId), sessionId, limit).all<ChatHistoryRow>();
    return rows.results || [];
  } catch (e: any) {
    logger.error('DB getChatHistory error', { chatId, sessionId, error: e.message });
    return [];
  }
}

export async function addChatMessage(env: Env, chatId: number | string, role: string, content: string, sessionId = 'default'): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      'INSERT INTO chat_history (chat_id, session_id, role, content) VALUES (?, ?, ?, ?)'
    ).bind(String(chatId), sessionId, role, content).run();
    const countRow = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM chat_history WHERE chat_id = ? AND session_id = ?'
    ).bind(String(chatId), sessionId).first<CountRow | null>();
    if (countRow && countRow.cnt > 0 && countRow.cnt % 10 === 0) {
      await trimHistory(env, chatId, sessionId);
    }
  } catch (e: any) {
    logger.error('DB addChatMessage error', { chatId, sessionId, error: e.message });
  }
}

export async function getAllChatMessages(env: Env, chatId: number | string, sessionId = 'default', limit = 200): Promise<ChatHistoryRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT role, content, created_at FROM chat_history WHERE chat_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(String(chatId), sessionId, limit).all<ChatHistoryRow>();
    return (rows.results || []).reverse();
  } catch (e: any) { return []; }
}

async function trimHistory(env: Env, chatId: number | string, sessionId: string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      `DELETE FROM chat_history WHERE chat_id = ? AND session_id = ? AND id NOT IN (
        SELECT id FROM chat_history WHERE chat_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT ?
      )`
    ).bind(String(chatId), sessionId, String(chatId), sessionId, MAX_HISTORY).run();
  } catch (e: any) { logger.error('DB trimHistory error', { chatId, sessionId, error: e.message }); }
}

export async function clearChat(env: Env, chatId: number | string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM chat_history WHERE chat_id = ?').bind(String(chatId)).run();
    await env.DB.prepare('DELETE FROM group_messages WHERE chat_id = ?').bind(String(chatId)).run();
    await env.DB.prepare('DELETE FROM sessions WHERE chat_id = ?').bind(String(chatId)).run();
    await env.DB.prepare('DELETE FROM user_settings WHERE chat_id = ?').bind(String(chatId)).run();
    await env.DB.prepare('DELETE FROM custom_personas WHERE chat_id = ?').bind(String(chatId)).run();
    bumpCacheGen();
  } catch (e: any) { logger.error('DB clearChat error', { chatId, error: e.message }); }
}

export async function addGroupMessage(
  env: Env,
  chatId: number | string,
  userId: number | string,
  messageId: number,
  role: 'user' | 'assistant',
  content: string,
  userName: string,
  replyToMessageId: number | null = null,
  replyToUserId: string | null = null,
  replyToContent: string | null = null,
  threadId: string | null = null,
): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      `INSERT INTO group_messages (chat_id, user_id, message_id, role, content, user_name, reply_to_message_id, reply_to_user_id, reply_to_content, thread_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(String(chatId), String(userId), messageId, role, content, userName, replyToMessageId, replyToUserId, replyToContent, threadId).run();
    const countRow: any = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM group_messages WHERE chat_id = ? AND user_id = ?'
    ).bind(String(chatId), String(userId)).first();
    if (countRow && countRow.cnt > 0 && countRow.cnt % 10 === 0) {
      await trimGroupHistory(env, chatId, String(userId));
    }
  } catch (e: any) {
    logger.error('DB addGroupMessage error', { chatId, userId, error: e.message });
  }
}

export async function getUserWindow(env: Env, chatId: number | string, userId: number | string, limit = GROUP_USER_WINDOW_SIZE): Promise<GroupMessage[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, chat_id, user_id, message_id, role, content, reply_to_message_id, reply_to_user_id, reply_to_content, thread_id, user_name, created_at FROM group_messages WHERE chat_id = ? AND user_id = ? ORDER BY created_at ASC LIMIT ?'
    ).bind(String(chatId), String(userId), limit).all();
    return (rows.results || []) as unknown as GroupMessage[];
  } catch (e: any) {
    logger.error('DB getUserWindow error', { chatId, userId, error: e.message });
    return [];
  }
}

export async function getMessageByMessageId(env: Env, chatId: number | string, messageId: number): Promise<GroupMessage | null> {
  if (!env.DB) return null;
  try {
    const row = await env.DB.prepare(
      'SELECT id, chat_id, user_id, message_id, role, content, reply_to_message_id, reply_to_user_id, reply_to_content, thread_id, user_name, created_at FROM group_messages WHERE chat_id = ? AND message_id = ? LIMIT 1'
    ).bind(String(chatId), messageId).first<GroupMessage | null>();
    return row || null;
  } catch (e: any) {
    logger.error('DB getMessageByMessageId error', { chatId, messageId, error: e.message });
    return null;
  }
}

export async function getAmbientContext(env: Env, chatId: number | string, limit = 5): Promise<GroupMessage[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, chat_id, user_id, message_id, role, content, reply_to_message_id, reply_to_user_id, reply_to_content, thread_id, user_name, created_at FROM group_messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(String(chatId), limit).all();
    return ((rows.results || []) as unknown as GroupMessage[]).reverse();
  } catch (e: any) {
    logger.error('DB getAmbientContext error', { chatId, error: e.message });
    return [];
  }
}

export async function getThreadMessages(env: Env, chatId: number | string, threadId: string): Promise<GroupMessage[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, chat_id, user_id, message_id, role, content, reply_to_message_id, reply_to_user_id, reply_to_content, thread_id, user_name, created_at FROM group_messages WHERE chat_id = ? AND thread_id = ? ORDER BY created_at ASC'
    ).bind(String(chatId), threadId).all();
    return (rows.results || []) as unknown as GroupMessage[];
  } catch (e: any) {
    logger.error('DB getThreadMessages error', { chatId, threadId, error: e.message });
    return [];
  }
}

async function trimGroupHistory(env: Env, chatId: number | string, userId: string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      `DELETE FROM group_messages WHERE chat_id = ? AND user_id = ? AND id NOT IN (
        SELECT id FROM group_messages WHERE chat_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT ?
      )`
    ).bind(String(chatId), userId, String(chatId), userId, GROUP_USER_WINDOW_SIZE).run();
  } catch (e: any) { logger.error('DB trimGroupHistory error', { chatId, userId, error: e.message }); }
}

export async function getLastGroupMessages(env: Env, chatId: number | string, limit = 100): Promise<GroupMessage[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT id, chat_id, user_id, message_id, role, content, reply_to_message_id, reply_to_user_id, reply_to_content, thread_id, user_name, created_at FROM group_messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(String(chatId), limit).all();
    return ((rows.results || []) as unknown as GroupMessage[]).reverse();
  } catch (e: any) {
    logger.error('DB getLastGroupMessages error', { chatId, error: e.message });
    return [];
  }
}

export async function cleanupOldGroupData(env: Env, daysOld = 30): Promise<number> {
  if (!env.DB) return 0;
  try {
    const result = await env.DB.prepare(
      "DELETE FROM group_messages WHERE created_at < datetime('now', '-' || ? || ' days')"
    ).bind(daysOld).run();
    logger.info('Group data cleanup completed', { daysOld, deleted: result?.meta?.changes || 0 });
    return result?.meta?.changes || 0;
  } catch (e: any) {
    logger.error('Group data cleanup failed', { error: e.message });
    return 0;
  }
}
