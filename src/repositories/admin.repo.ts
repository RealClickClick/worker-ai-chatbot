import type { Env } from '../types/env.d.ts';
import type { RateLimitRow, AnalyticsRow, CountRow } from '../types/d1.ts';
import { RATE_LIMIT, RATE_WINDOW_SECONDS, EXPENSIVE_RATE_LIMIT, EXPENSIVE_RATE_WINDOW } from '../constants.ts';
import { logger } from '../utils/logger.ts';
import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from './cache.ts';

// === Advanced Rate Limiting ===

const VIOLATION_COOLDOWNS = [0, 5, 15, 30, 60];
const TIER_LIMITS: Record<string, { limit: number; window: number }> = {
  basic:    { limit: RATE_LIMIT,              window: RATE_WINDOW_SECONDS },
  expensive:{ limit: EXPENSIVE_RATE_LIMIT,     window: EXPENSIVE_RATE_WINDOW },
  burst:    { limit: 15,                       window: 60 },
};

export async function checkRateLimit(env: Env, chatId: number | string, tier = 'basic'): Promise<boolean> {
  if (!env.DB) return true;
  const tierCfg = TIER_LIMITS[tier] || TIER_LIMITS.basic;
  const now = Date.now();
  const chatIdStr = String(chatId);

  try {
    const row = await env.DB.prepare(
      'SELECT count, window_start, violations, last_violation FROM rate_limits WHERE chat_id = ?'
    ).bind(chatIdStr).first<RateLimitRow | null>();

    if (!row) {
      await env.DB.prepare(
        "INSERT INTO rate_limits (chat_id, count, tier, violations, window_start) VALUES (?, 1, ?, 0, datetime('now'))"
      ).bind(chatIdStr, tier).run();
      return true;
    }

    if (row.violations > 0 && row.last_violation) {
      const sinceViolation = (now - new Date(row.last_violation + 'Z').getTime()) / 1000;
      const cooldownIdx = Math.min(row.violations, VIOLATION_COOLDOWNS.length - 1);
      const cooldown = VIOLATION_COOLDOWNS[cooldownIdx];
      if (sinceViolation < cooldown) {
        logger.warn('Rate limit cooldown active', { chatId, violations: row.violations, cooldown, elapsed: Math.round(sinceViolation) });
        return false;
      }
      await env.DB.prepare(
        "UPDATE rate_limits SET violations = 0, last_violation = NULL, count = 1, window_start = datetime('now') WHERE chat_id = ?"
      ).bind(chatIdStr).run();
      return true;
    }

    const elapsed = (now - new Date(row.window_start + 'Z').getTime()) / 1000;
    if (elapsed > tierCfg.window) {
      await env.DB.prepare(
        "UPDATE rate_limits SET count = 1, tier = ?, window_start = datetime('now') WHERE chat_id = ?"
      ).bind(tier, chatIdStr).run();
      return true;
    }

    if (row.count >= tierCfg.limit) {
      const newViolations = (row.violations || 0) + 1;
      await env.DB.prepare(
        "UPDATE rate_limits SET violations = ?, last_violation = datetime('now') WHERE chat_id = ?"
      ).bind(newViolations, chatIdStr).run();
      logger.warn('Rate limit exceeded', { chatId, tier, count: row.count, violations: newViolations });
      return false;
    }

    await env.DB.prepare(
      'UPDATE rate_limits SET count = count + 1, tier = ? WHERE chat_id = ?'
    ).bind(tier, chatIdStr).run();
    return true;
  } catch (e: any) {
    logger.error('Rate limit check error', { chatId, error: e.message });
    return true;
  }
}

export async function getRateLimitStats(env: Env): Promise<RateLimitRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      "SELECT chat_id, count, tier, violations, window_start FROM rate_limits WHERE violations > 0 ORDER BY violations DESC LIMIT 50"
    ).all<RateLimitRow>();
    return rows.results || [];
  } catch (e: any) { return []; }
}

// === Blocked Users ===

export async function isBlocked(env: Env, chatId: number | string): Promise<boolean> {
  if (!env.DB) return false;
  try {
    return !!(await env.DB.prepare('SELECT chat_id FROM blocked_users WHERE chat_id = ?').bind(String(chatId)).first());
  } catch (e: any) { return false; }
}

export async function blockUser(env: Env, chatId: number | string, reason: string | null = null): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare('INSERT OR REPLACE INTO blocked_users (chat_id, reason) VALUES (?, ?)').bind(String(chatId), reason).run();
}

export async function unblockUser(env: Env, chatId: number | string): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM blocked_users WHERE chat_id = ?').bind(String(chatId)).run();
}

export async function getBlockedUsers(env: Env): Promise<Array<{ chat_id: string; reason: string | null }>> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare('SELECT chat_id, reason FROM blocked_users ORDER BY blocked_at DESC').all<{ chat_id: string; reason: string | null }>();
    return rows.results || [];
  } catch (e: any) { return []; }
}

// === Analytics ===

async function incrementAnalytic(env: Env, key: string): Promise<void> {
  if (!env.DB) return;
  try { await env.DB.prepare('UPDATE analytics SET value = value + 1 WHERE key = ?').bind(key).run(); } catch (e: any) { logger.error('DB increment error', { key, error: e.message }); }
  cacheDel('analytics');
}

export async function trackMessage(env: Env): Promise<void> { await incrementAnalytic(env, 'total_messages'); }
export async function trackNewUser(env: Env): Promise<void> { await incrementAnalytic(env, 'total_users'); }
export async function trackImage(env: Env): Promise<void> { await incrementAnalytic(env, 'total_images'); }
export async function trackSearch(env: Env): Promise<void> { await incrementAnalytic(env, 'total_searches'); }
export async function trackFeedback(env: Env, type: string): Promise<void> { await incrementAnalytic(env, type === 'good' ? 'total_feedback_good' : 'total_feedback_bad'); }
export async function trackTiming(env: Env, durationMs: number): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('UPDATE analytics SET value = value + 1 WHERE key = ?').bind('total_response_count').run();
    await env.DB.prepare('UPDATE analytics SET value = value + ? WHERE key = ?').bind(Math.round(durationMs), 'total_response_time_ms').run();
    cacheDel('analytics');
  } catch (e: any) {
    logger.error('DB trackTiming error', { error: e.message });
  }
}

export async function getAnalytics(env: Env): Promise<Record<string, number>> {
  if (!env.DB) return {};
  const cached = cacheGet<Record<string, number>>('analytics');
  if (cached) return cached;
  try {
    const rows = await env.DB.prepare('SELECT key, value FROM analytics').all<AnalyticsRow>();
    const result: Record<string, number> = {};
    for (const row of (rows.results || [])) result[row.key] = row.value;
    cacheSet<Record<string, number>>('analytics', result, CACHE_TTL.analytics);
    return result;
  } catch (e: any) { logger.error('DB getAnalytics error', { error: e.message }); return {}; }
}

// === Admin & Maintenance ===

export async function getAllChatIds(env: Env): Promise<string[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare('SELECT DISTINCT chat_id FROM user_settings').all<{ chat_id: string }>();
    return (rows.results || []).map(r => r.chat_id);
  } catch (e: any) { logger.error('DB getAllChatIds error', { error: e.message }); return []; }
}

export async function getActiveUsersLastDay(env: Env): Promise<number> {
  if (!env.DB) return 0;
  try {
    const row = await env.DB.prepare("SELECT COUNT(DISTINCT chat_id) as cnt FROM chat_history WHERE created_at >= datetime('now', '-1 day')").first<CountRow | null>();
    return row?.cnt || 0;
  } catch (e: any) { return 0; }
}
