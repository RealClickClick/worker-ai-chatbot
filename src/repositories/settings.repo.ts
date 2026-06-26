import type { Env } from '../types/env.d.ts';
import type { SettingsRow, SessionRow } from '../types/d1.ts';
import { logger } from '../utils/logger.ts';
import { cacheGet, cacheSet, cacheDel, bumpCacheGen, CACHE_TTL } from './cache.ts';

const DEFAULT: Readonly<SettingsRow> = Object.freeze({ persona: 'standard', response_length: 'short', ai_model: 'fast', lang: null, custom_instructions: null, bot_name: null, active_session: 'default', programming_lang: null, memory_enabled: 1, formatting: 'markdown', feedback_enabled: 1, img_model: 'sdxl', daily_tips_enabled: 0, timezone: 'UTC', translate_source: null, translate_target: null, translate_pending: null, translate_enabled: 0, ensemble_enabled: 0, ensemble_models: null, ensemble_strategy: 'judge' });

const SETTING_COLS: string[] = ['persona', 'response_length', 'ai_model', 'lang', 'custom_instructions', 'bot_name', 'active_session', 'programming_lang', 'memory_enabled', 'formatting', 'feedback_enabled', 'img_model', 'daily_tips_enabled', 'timezone', 'translate_source', 'translate_target', 'translate_pending', 'translate_enabled', 'ensemble_enabled', 'ensemble_models', 'ensemble_strategy'];

// === Init / Migrations ===

const MIGRATIONS = [
  {
    version: 1,
    description: 'Initial schema — all tables',
    statements: [
      `CREATE TABLE IF NOT EXISTS _migrations (
        version INTEGER PRIMARY KEY,
        description TEXT,
        applied_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS user_settings (
        chat_id TEXT PRIMARY KEY,
        persona TEXT NOT NULL DEFAULT 'standard',
        response_length TEXT NOT NULL DEFAULT 'short',
        ai_model TEXT NOT NULL DEFAULT 'fast',
        lang TEXT DEFAULT NULL,
        custom_instructions TEXT DEFAULT NULL,
        active_session TEXT DEFAULT 'default',
        programming_lang TEXT DEFAULT NULL,
        memory_enabled INTEGER DEFAULT 1,
        formatting TEXT DEFAULT 'markdown',
        feedback_enabled INTEGER DEFAULT 1,
        img_model TEXT DEFAULT 'sdxl'
      )`,
      `CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        session_id TEXT NOT NULL DEFAULT 'default',
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_chat_history_lookup ON chat_history(chat_id, session_id, created_at)`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        session_id TEXT NOT NULL DEFAULT 'default',
        title TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(chat_id, session_id)
      )`,
      `CREATE TABLE IF NOT EXISTS custom_personas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(chat_id, name)
      )`,
      `CREATE TABLE IF NOT EXISTS rate_limits (
        chat_id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 1,
        tier TEXT DEFAULT 'basic',
        violations INTEGER DEFAULT 0,
        last_violation TEXT DEFAULT NULL,
        window_start TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS analytics (
        key TEXT PRIMARY KEY,
        value INTEGER DEFAULT 0
      )`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_messages', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_users', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_images', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_searches', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_feedback_good', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_feedback_bad', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_feedback_count', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_response_count', 0)`,
      `INSERT OR IGNORE INTO analytics (key, value) VALUES ('total_response_time_ms', 0)`,
      `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS blocked_users (
        chat_id TEXT PRIMARY KEY,
        reason TEXT DEFAULT NULL,
        blocked_at TEXT DEFAULT (datetime('now'))
      )`,
    ],
  },
  {
    version: 2,
    description: 'Add violations tracking to rate_limits',
    statements: [
      `ALTER TABLE rate_limits ADD COLUMN violations INTEGER DEFAULT 0`,
      `ALTER TABLE rate_limits ADD COLUMN last_violation TEXT DEFAULT NULL`,
      `ALTER TABLE rate_limits ADD COLUMN tier TEXT DEFAULT 'basic'`,
    ],
  },
  {
    version: 3,
    description: 'Add analytics indexes for cleanup and admin queries',
    statements: [
      `CREATE INDEX IF NOT EXISTS idx_chat_history_created ON chat_history(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_rate_limits_violations ON rate_limits(violations DESC)`,
    ],
  },
  {
    version: 4,
    description: 'Add group_messages table for per-user message windows and reply tracking',
    statements: [
      `CREATE TABLE IF NOT EXISTS group_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        reply_to_message_id INTEGER,
        reply_to_user_id TEXT,
        reply_to_content TEXT,
        thread_id TEXT,
        user_name TEXT NOT NULL DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_group_msgs_chat_user ON group_messages(chat_id, user_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_group_msgs_chat_msgid ON group_messages(chat_id, message_id)`,
      `CREATE INDEX IF NOT EXISTS idx_group_msgs_chat_created ON group_messages(chat_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_group_msgs_chat_thread ON group_messages(chat_id, thread_id, created_at)`,
    ],
  },
    {
    version: 5,
    description: 'Add debate_sessions and debate_messages tables for Multi-Agent Collaboration',
    statements: [
      `CREATE TABLE IF NOT EXISTS debate_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        message_id INTEGER,
        user_id INTEGER NOT NULL,
        topic TEXT DEFAULT '',
        style TEXT DEFAULT 'debate',
        max_rounds INTEGER DEFAULT 3,
        current_round INTEGER DEFAULT 0,
        status TEXT DEFAULT 'setup',
        setup_step TEXT DEFAULT 'p1',
        persona_1 TEXT,
        persona_2 TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS debate_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        persona_name TEXT NOT NULL,
        message_text TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (session_id) REFERENCES debate_sessions(id)
      )`,
    ],
  },
  {
    version: 6,
    description: 'Add daily_tips_enabled column to user_settings',
    statements: [
      `ALTER TABLE user_settings ADD COLUMN daily_tips_enabled INTEGER DEFAULT 0`,
    ],
  },
  {
    version: 7,
    description: 'Create reminders table',
    statements: [
      `CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        reminder_date TEXT NOT NULL,
        reminder_time TEXT NOT NULL,
        recurrence TEXT NOT NULL DEFAULT 'none',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(status, reminder_date, reminder_time)`,
    ],
  },
  {
    version: 8,
    description: 'Add timezone column to user_settings and reminders',
    statements: [
      `ALTER TABLE user_settings ADD COLUMN timezone TEXT DEFAULT 'UTC'`,
      `ALTER TABLE reminders ADD COLUMN timezone TEXT DEFAULT 'UTC'`,
    ],
  },
  {
    version: 9,
    description: 'Add translate columns to user_settings for Translation Mode',
    statements: [
      `ALTER TABLE user_settings ADD COLUMN translate_source TEXT DEFAULT NULL`,
      `ALTER TABLE user_settings ADD COLUMN translate_target TEXT DEFAULT NULL`,
      `ALTER TABLE user_settings ADD COLUMN translate_pending TEXT DEFAULT NULL`,
    ],
  },
  {
    version: 10,
    description: 'Add translate_enabled column for independent on/off toggle',
    statements: [
      `ALTER TABLE user_settings ADD COLUMN translate_enabled INTEGER DEFAULT 0`,
    ],
  },
  {
    version: 11,
    description: 'Add bot_name column for custom bot identity name',
    statements: [
      `ALTER TABLE user_settings ADD COLUMN bot_name TEXT DEFAULT NULL`,
    ],
  },
  {
    version: 12,
    description: 'Add ensemble columns for Ensemble Voting',
    statements: [
      `ALTER TABLE user_settings ADD COLUMN ensemble_enabled INTEGER DEFAULT 0`,
      `ALTER TABLE user_settings ADD COLUMN ensemble_models TEXT DEFAULT NULL`,
      `ALTER TABLE user_settings ADD COLUMN ensemble_strategy TEXT DEFAULT 'judge'`,
    ],
  },
  {
    version: 13,
    description: 'Create persona_adaptation table for Adaptive Persona',
    statements: [
      `CREATE TABLE IF NOT EXISTS persona_adaptation (
        chat_id TEXT PRIMARY KEY,
        feedback_log TEXT DEFAULT '[]',
        learned_traits TEXT DEFAULT NULL,
        last_adapted TEXT DEFAULT NULL,
        adaptation_count INTEGER DEFAULT 0
      )`,
    ],
  },
  {
    version: 14,
    description: 'Create documents table for RAG (Retrieval-Augmented Generation)',
    statements: [
      `CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        source TEXT DEFAULT 'text',
        title TEXT DEFAULT '',
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_documents_chat ON documents(chat_id)`,
    ],
  },
  {
    version: 15,
    description: 'Create memory_summaries table for automatic conversation summarization',
    statements: [
      `CREATE TABLE IF NOT EXISTS memory_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        session_id TEXT NOT NULL DEFAULT 'default',
        summary TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_memory_summaries_lookup ON memory_summaries(chat_id, session_id, created_at)`,
    ],
  },
  {
    version: 16,
    description: 'Add judge_enabled and judge_persona columns to debate_sessions',
    statements: [
      `ALTER TABLE debate_sessions ADD COLUMN judge_enabled INTEGER DEFAULT 0`,
      `ALTER TABLE debate_sessions ADD COLUMN judge_persona TEXT`,
    ],
  },
  {
    version: 17,
    description: 'Add participant_persona column to debate_sessions for user participation',
    statements: [
      `ALTER TABLE debate_sessions ADD COLUMN participant_persona TEXT`,
    ],
  },
  {
    version: 18,
    description: 'Add waiting_since column to debate_sessions for user timeout tracking',
    statements: [
      `ALTER TABLE debate_sessions ADD COLUMN waiting_since TEXT`,
    ],
  },
  {
    version: 19,
    description: 'Create debate_templates table for saving favorite debate setups',
    statements: [
      `CREATE TABLE IF NOT EXISTS debate_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        name TEXT NOT NULL,
        persona_1 TEXT NOT NULL,
        persona_2 TEXT NOT NULL,
        style TEXT DEFAULT 'debate',
        created_at TEXT DEFAULT (datetime('now'))
      )`,
    ],
  },
  {
    version: 20,
    description: 'Add roles_swapped column to debate_sessions for asymmetric style roles',
    statements: [
      `ALTER TABLE debate_sessions ADD COLUMN roles_swapped INTEGER DEFAULT 0`,
    ],
  },
];

export async function initDB(env: Env): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      description TEXT,
      applied_at TEXT DEFAULT (datetime('now'))
    )`).run();
  } catch (e: any) {
    logger.warn('Could not create _migrations table', { error: e.message });
  }

  for (const migration of MIGRATIONS) {
    try {
      const row = await env.DB.prepare('SELECT version FROM _migrations WHERE version = ?').bind(migration.version).first();
      if (row) continue;
    } catch (e: any) {
    }

    let success = true;
    for (const sql of migration.statements) {
      try {
        await env.DB.prepare(sql).run();
        logger.info('Migration statement applied', { version: migration.version, sql: sql.slice(0, 80) });
      } catch (e: any) {
        if (sql.trim().toUpperCase().startsWith('ALTER')) {
          logger.warn('Migration ALTER skipped (column may exist)', { version: migration.version, error: e.message });
        } else {
          logger.error('Migration statement failed', { version: migration.version, error: e.message, sql: sql.slice(0, 80) });
          success = false;
        }
      }
    }

    if (success) {
      try {
        await env.DB.prepare('INSERT OR IGNORE INTO _migrations (version, description) VALUES (?, ?)').bind(migration.version, migration.description).run();
        logger.info('Migration applied', { version: migration.version, description: migration.description });
      } catch (e: any) {
        logger.warn('Could not record migration version', { version: migration.version, error: e.message });
      }
    }
  }

  cleanupOldData(env, 30).catch(() => {});
}

// === Settings ===

export async function getSettings(env: Env, chatId: number | string): Promise<SettingsRow> {
  if (!env.DB) return { ...DEFAULT };
  const cacheKey = `settings:${chatId}`;
  const cached = cacheGet<SettingsRow>(cacheKey);
  if (cached) return cached;
  try {
    const row = await env.DB.prepare(
      'SELECT persona, response_length, ai_model, lang, custom_instructions, bot_name, active_session, programming_lang, memory_enabled, formatting, feedback_enabled, img_model, daily_tips_enabled, timezone, translate_source, translate_target, translate_pending, translate_enabled, ensemble_enabled, ensemble_models, ensemble_strategy FROM user_settings WHERE chat_id = ?'
    ).bind(String(chatId)).first<SettingsRow | null>();
    const result: SettingsRow = row ? { ...DEFAULT, ...row } : { ...DEFAULT };
    cacheSet<SettingsRow>(cacheKey, result, CACHE_TTL.settings);
    return result;
  } catch (e: any) {
    logger.error('DB getSettings error', { chatId, error: e.message });
    return { ...DEFAULT };
  }
}

async function upsertSetting(env: Env, chatId: number | string, field: string, value: string | number | null): Promise<void> {
  if (!env.DB) return;
  const current = await getSettings(env, chatId);
  const placeholders = SETTING_COLS.map(() => '?').join(', ');
  const insertCols = SETTING_COLS.join(', ');
  const vals: Record<string, unknown> = { ...current };
  vals[field] = value;
  try {
    await env.DB.prepare(
      `INSERT INTO user_settings (chat_id, ${insertCols})
       VALUES (?, ${placeholders})
       ON CONFLICT(chat_id) DO UPDATE SET ${field} = excluded.${field}`
    ).bind(String(chatId), ...SETTING_COLS.map(c => vals[c])).run();
    cacheDel(`settings:${chatId}`);
    bumpCacheGen();
  } catch (e: any) { logger.error('DB upsertSetting error', { chatId, field, error: e.message }); }
}

export async function setPersona(env: Env, chatId: number | string, persona: string): Promise<void> { await upsertSetting(env, chatId, 'persona', persona); }
export async function setResponseLength(env: Env, chatId: number | string, length: string): Promise<void> { await upsertSetting(env, chatId, 'response_length', length); }
export async function setAiModel(env: Env, chatId: number | string, model: string): Promise<void> { await upsertSetting(env, chatId, 'ai_model', model); }
export async function setImgModel(env: Env, chatId: number | string, model: string): Promise<void> { await upsertSetting(env, chatId, 'img_model', model); }
export async function setLanguage(env: Env, chatId: number | string, lang: string | null): Promise<void> { await upsertSetting(env, chatId, 'lang', lang); }
export async function setTranslateSource(env: Env, chatId: number | string, source: string | null): Promise<void> { await upsertSetting(env, chatId, 'translate_source', source); }
export async function setTranslateTarget(env: Env, chatId: number | string, target: string | null): Promise<void> { await upsertSetting(env, chatId, 'translate_target', target); }
export async function setTranslatePending(env: Env, chatId: number | string, pending: string | null): Promise<void> { await upsertSetting(env, chatId, 'translate_pending', pending); }
export async function setTranslateEnabled(env: Env, chatId: number | string, enabled: number): Promise<void> { await upsertSetting(env, chatId, 'translate_enabled', enabled); }
export async function setCustomInstructions(env: Env, chatId: number | string, instructions: string | null): Promise<void> { await upsertSetting(env, chatId, 'custom_instructions', instructions); }
export async function setBotName(env: Env, chatId: number | string, name: string | null): Promise<void> { await upsertSetting(env, chatId, 'bot_name', name); }
export async function setEnsembleEnabled(env: Env, chatId: number | string, enabled: number): Promise<void> { await upsertSetting(env, chatId, 'ensemble_enabled', enabled); }
export async function setEnsembleModels(env: Env, chatId: number | string, models: string | null): Promise<void> { await upsertSetting(env, chatId, 'ensemble_models', models); }
export async function setEnsembleStrategy(env: Env, chatId: number | string, strategy: string): Promise<void> { await upsertSetting(env, chatId, 'ensemble_strategy', strategy); }
export async function setActiveSession(env: Env, chatId: number | string, sessionId: string): Promise<void> { await upsertSetting(env, chatId, 'active_session', sessionId); }
export async function setProgrammingLang(env: Env, chatId: number | string, lang: string | null): Promise<void> { await upsertSetting(env, chatId, 'programming_lang', lang); }
export async function toggleMemory(env: Env, chatId: number | string): Promise<void> {
  const s = await getSettings(env, chatId);
  await upsertSetting(env, chatId, 'memory_enabled', s.memory_enabled ? 0 : 1);
}
export async function toggleFormatting(env: Env, chatId: number | string): Promise<void> {
  const s = await getSettings(env, chatId);
  await upsertSetting(env, chatId, 'formatting', s.formatting === 'markdown' ? 'plain' : 'markdown');
}
export async function toggleFeedback(env: Env, chatId: number | string): Promise<void> {
  const s = await getSettings(env, chatId);
  await upsertSetting(env, chatId, 'feedback_enabled', s.feedback_enabled ? 0 : 1);
}
export async function toggleResponseLength(env: Env, chatId: number | string): Promise<string> {
  if (!env.DB) return 'short';
  const s = await getSettings(env, chatId);
  const current = s.response_length || 'short';
  const next = current === 'short' ? 'medium' : current === 'medium' ? 'long' : 'short';
  await setResponseLength(env, chatId, next);
  return next;
}

// === Timezone & Daily Tips ===

export async function setTimezone(env: Env, chatId: number | string, timezone: string): Promise<void> {
  await upsertSetting(env, chatId, 'timezone', timezone);
}

export async function toggleDailyTips(env: Env, chatId: number | string): Promise<boolean> {
  const current = await getSettings(env, chatId);
  const newVal = (current as any).daily_tips_enabled ? 0 : 1;
  await upsertSetting(env, chatId, 'daily_tips_enabled', newVal);
  return newVal === 1;
}

export async function getDailyTipsEnabled(env: Env, chatId: number | string): Promise<boolean> {
  const settings = await getSettings(env, chatId);
  return !!(settings as any).daily_tips_enabled;
}

export async function getDailyTipsChats(env: Env): Promise<string[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      "SELECT chat_id FROM user_settings WHERE daily_tips_enabled = 1"
    ).all<{ chat_id: string }>();
    return (rows.results || []).map(r => r.chat_id);
  } catch (e: any) {
    logger.error('DB getDailyTipsChats error', { error: e.message });
    return [];
  }
}

// === Sessions ===

export async function createSession(env: Env, chatId: number | string, sessionId: string, title: string | null = null): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      'INSERT OR IGNORE INTO sessions (chat_id, session_id, title) VALUES (?, ?, ?)'
    ).bind(String(chatId), sessionId, title).run();
  } catch (e: any) { logger.error('DB createSession error', { chatId, sessionId, error: e.message }); }
}

export async function getSessions(env: Env, chatId: number | string): Promise<SessionRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      'SELECT session_id, title FROM sessions WHERE chat_id = ? ORDER BY created_at DESC'
    ).bind(String(chatId)).all<SessionRow>();
    return rows.results || [];
  } catch (e: any) { return []; }
}

// === Cleanup (from initDB call) ===

export async function cleanupOldData(env: Env, daysOld = 30): Promise<number> {
  if (!env.DB) return 0;
  try {
    const result = await env.DB.prepare(
      "DELETE FROM chat_history WHERE created_at < datetime('now', '-' || ? || ' days')"
    ).bind(daysOld).run();
    logger.info('Cleanup completed', { daysOld, deleted: result?.meta?.changes || 0 });
    return result?.meta?.changes || 0;
  } catch (e: any) {
    logger.error('Cleanup failed', { error: e.message });
    return 0;
  }
}
