const store = {
  user_settings: {},
  chat_history: [],
  sessions: [],
  custom_personas: [],
  rate_limits: {},
  migrations: [],
  analytics: { total_messages: 0, total_users: 0, total_images: 0, total_searches: 0, total_feedback_good: 0, total_feedback_bad: 0 },
  blocked_users: {},
  reminders: [],
  reminder_id_seq: 0,
  documents: [],
  doc_id_seq: 0,
  memory_summaries: [],
  mem_summary_id_seq: 0,
};

function matchSql(sql, keyword) {
  return sql.toLowerCase().includes(keyword.toLowerCase());
}

function createStatement(sql, params) {
  const p = params || [];

  return {
    async run() {
      const s = sql;

      if (matchSql(s, 'CREATE TABLE') || matchSql(s, 'ALTER TABLE')) return {};

      if (matchSql(s, 'INSERT INTO _migrations') || matchSql(s, 'INSERT OR IGNORE INTO _migrations')) {
        store.migrations.push({ version: p[0], description: p[1] });
        return {};
      }

      if (matchSql(s, 'INSERT INTO user_settings') || matchSql(s, 'ON CONFLICT(chat_id)')) {
        const existing = store.user_settings[String(p[0])] || {};
        const cols = ['persona', 'response_length', 'ai_model', 'lang', 'custom_instructions', 'bot_name', 'active_session', 'programming_lang', 'memory_enabled', 'formatting', 'feedback_enabled', 'img_model', 'daily_tips_enabled', 'timezone', 'translate_source', 'translate_target', 'translate_pending', 'translate_enabled', 'ensemble_enabled', 'ensemble_models', 'ensemble_strategy'];
        const vals = {};
        cols.forEach((c, i) => vals[c] = p[i + 1]);
        store.user_settings[String(p[0])] = { ...existing, ...vals };
        return {};
      }

      if (matchSql(s, 'INSERT INTO chat_history') && !matchSql(s, 'INSERT IGNORE')) {
        store.chat_history.push({
          id: store.chat_history.length + 1,
          chat_id: String(p[0]),
          session_id: p[1],
          role: p[2],
          content: p[3],
          created_at: new Date().toISOString(),
        });
        return {};
      }

      if (matchSql(s, 'INSERT INTO sessions') || matchSql(s, 'INSERT OR IGNORE INTO sessions')) {
        store.sessions.push({ chat_id: String(p[0]), session_id: p[1], title: p[2] });
        return {};
      }

      if (matchSql(s, 'INSERT INTO custom_personas') || matchSql(s, 'INSERT OR REPLACE INTO custom_personas')) {
        store.custom_personas = store.custom_personas.filter(x => !(x.chat_id === String(p[0]) && x.name === p[1]));
        store.custom_personas.push({ chat_id: String(p[0]), name: p[1], description: p[2] });
        return {};
      }

      if (matchSql(s, 'DELETE FROM custom_personas')) {
        store.custom_personas = store.custom_personas.filter(x => !(x.chat_id === String(p[0]) && x.name === p[1]));
        return {};
      }

      if (matchSql(s, 'INSERT OR IGNORE INTO rate_limits')) {
        const chatId = String(p[0]);
        if (!store.rate_limits[chatId]) {
          store.rate_limits[chatId] = { count: 1, tier: p[1] || 'basic', violations: 0, last_violation: null, window_start: new Date().toISOString() };
        }
        return {};
      }

      if (matchSql(s, 'INSERT INTO rate_limits')) {
        // INSERT INTO rate_limits (chat_id, count, tier, violations, window_start) VALUES (?, 1, ?, 0, datetime('now'))
        const chatId = String(p[0]);
        store.rate_limits[chatId] = { count: 1, tier: p[1] || 'basic', violations: 0, last_violation: null, window_start: new Date().toISOString() };
        return {};
      }

      if (matchSql(s, 'UPDATE rate_limits SET count = 1')) {
        // UPDATE rate_limits SET count = 1, tier = ?, window_start = datetime('now') WHERE chat_id = ?
        // OR: UPDATE rate_limits SET violations = 0, last_violation = NULL, count = 1, window_start = datetime('now') WHERE chat_id = ?
        const chatId = p.length > 1 ? String(p[p.length - 1]) : String(p[0]);
        if (store.rate_limits[chatId]) {
          store.rate_limits[chatId].count = 1;
          store.rate_limits[chatId].window_start = new Date().toISOString();
          if (matchSql(s, 'violations')) {
            store.rate_limits[chatId].violations = 0;
            store.rate_limits[chatId].last_violation = null;
          }
        }
        return {};
      }

      if (matchSql(s, 'UPDATE rate_limits SET violations')) {
        // UPDATE rate_limits SET violations = ?, last_violation = datetime('now') WHERE chat_id = ?
        const chatId = String(p[p.length - 1]);
        if (store.rate_limits[chatId]) {
          store.rate_limits[chatId].violations = p[0];
          store.rate_limits[chatId].last_violation = new Date().toISOString();
        }
        return {};
      }

      if (matchSql(s, 'UPDATE rate_limits SET count = count + 1, tier')) {
        // UPDATE rate_limits SET count = count + 1, tier = ? WHERE chat_id = ?
        const chatId = String(p[p.length - 1]);
        if (store.rate_limits[chatId]) { store.rate_limits[chatId].count += 1; store.rate_limits[chatId].tier = p[0]; }
        return {};
      }

      if (matchSql(s, 'UPDATE rate_limits SET count = count + 1')) {
        const chatId = String(p[0]);
        if (store.rate_limits[chatId]) store.rate_limits[chatId].count += 1;
        return {};
      }

      if (matchSql(s, 'INSERT OR REPLACE INTO blocked_users')) {
        store.blocked_users[String(p[0])] = { chat_id: p[0], reason: p[1] };
        return {};
      }

      if (matchSql(s, 'DELETE FROM blocked_users')) {
        delete store.blocked_users[String(p[0])];
        return {};
      }

      if (matchSql(s, 'UPDATE analytics')) {
        const key = p[0];
        if (store.analytics[key] !== undefined) store.analytics[key] += 1;
        return {};
      }

      if (matchSql(s, 'DELETE FROM chat_history') && matchSql(s, 'created_at <')) {
        const before = new Date();
        const beforeLen = store.chat_history.length;
        store.chat_history = store.chat_history.filter(h => new Date(h.created_at) >= before);
        return { meta: { changes: beforeLen - store.chat_history.length } };
      }

      if (matchSql(s, 'DELETE FROM chat_history') && !matchSql(s, 'WHERE id NOT IN')) {
        store.chat_history = store.chat_history.filter(h => h.chat_id !== String(p[0]));
        return {};
      }

      if (matchSql(s, 'INSERT INTO reminders') && (matchSql(s, 'chat_id') || true)) {
        store.reminder_id_seq += 1;
        store.reminders.push({
          id: store.reminder_id_seq,
          chat_id: String(p[0]),
          title: p[1] || '',
          reminder_date: p[2],
          reminder_time: p[3],
          recurrence: p[4] || 'none',
          timezone: p[5] || 'UTC',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
        return { meta: { last_row_id: store.reminder_id_seq } };
      }

      if (matchSql(s, 'UPDATE reminders SET status')) {
        const id = p[0];
        const reminder = store.reminders.find(r => r.id === id);
        if (reminder) {
          const newStatus = matchSql(s, "'sent'") ? 'sent' : 'cancelled';
          reminder.status = newStatus;
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      }

      if (matchSql(s, 'UPDATE reminders SET reminder_date')) {
        const id = p[p.length - 1];
        const reminder = store.reminders.find(r => r.id === id);
        if (reminder) {
          reminder.reminder_date = p[0];
          reminder.status = 'pending';
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      }

      if (matchSql(s, 'DELETE FROM reminders')) {
        const id = p[0];
        const chatId = p[1];
        const idx = store.reminders.findIndex(r => r.id === id && String(r.chat_id) === String(chatId));
        if (idx !== -1) {
          store.reminders.splice(idx, 1);
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      }

      if (matchSql(s, 'INSERT INTO memory_summaries')) {
        store.mem_summary_id_seq += 1;
        store.memory_summaries.push({
          id: store.mem_summary_id_seq,
          chat_id: String(p[0]),
          session_id: p[1] || 'default',
          summary: p[2],
          created_at: new Date().toISOString(),
        });
        return {};
      }

      if (matchSql(s, 'INSERT INTO documents')) {
        store.doc_id_seq += 1;
        store.documents.push({
          id: store.doc_id_seq,
          chat_id: String(p[0]),
          source: p[1] || 'text',
          title: p[2] || '',
          content: p[3],
          created_at: new Date().toISOString(),
        });
        return {};
      }

      if (matchSql(s, 'DELETE FROM memory_summaries WHERE chat_id') && matchSql(s, 'AND session_id')) {
        store.memory_summaries = store.memory_summaries.filter(m => !(m.chat_id === String(p[0]) && m.session_id === p[1]));
        return {};
      }

      if (matchSql(s, 'DELETE FROM memory_summaries WHERE chat_id')) {
        store.memory_summaries = store.memory_summaries.filter(m => m.chat_id !== String(p[0]));
        return {};
      }

      if (matchSql(s, 'DELETE FROM documents WHERE chat_id')) {
        store.documents = store.documents.filter(d => d.chat_id !== String(p[0]));
        return {};
      }

      if (matchSql(s, 'DELETE FROM user_settings')) {
        delete store.user_settings[String(p[0])];
        return {};
      }

      if (matchSql(s, 'DELETE FROM sessions')) {
        store.sessions = store.sessions.filter(s => s.chat_id !== String(p[0]));
        return {};
      }

      return {};
    },

    async first() {
      const s = sql;

      if (matchSql(s, 'SELECT persona')) {
        const r = store.user_settings[String(p[0])];
        return r ? {
          persona: r.persona || 'standard',
          response_length: r.response_length || 'short',
          ai_model: r.ai_model || 'fast',
          lang: r.lang || null,
          custom_instructions: r.custom_instructions || null,
          bot_name: r.bot_name || null,
          active_session: r.active_session || 'default',
          programming_lang: r.programming_lang || null,
          memory_enabled: r.memory_enabled ?? 1,
          formatting: r.formatting || 'markdown',
          feedback_enabled: r.feedback_enabled ?? 1,
          img_model: r.img_model || 'sdxl',
          daily_tips_enabled: r.daily_tips_enabled ?? 0,
          timezone: r.timezone || 'UTC',
          translate_source: r.translate_source || null,
          translate_target: r.translate_target || null,
          translate_pending: r.translate_pending || null,
          translate_enabled: r.translate_enabled ?? 0,
          ensemble_enabled: r.ensemble_enabled ?? 0,
          ensemble_models: r.ensemble_models ?? null,
          ensemble_strategy: r.ensemble_strategy ?? 'judge',
        } : null;
      }

      if (matchSql(s, 'SELECT count') || matchSql(s, 'SELECT violations')) {
        const r = store.rate_limits[String(p[0])];
        return r ? { count: r.count, window_start: r.window_start, violations: r.violations || 0, last_violation: r.last_violation || null, tier: r.tier || 'basic' } : null;
      }

      if (matchSql(s, 'SELECT chat_id FROM blocked_users')) {
        const r = store.blocked_users[String(p[0])];
        return r ? { chat_id: r.chat_id } : null;
      }

      if (matchSql(s, 'SELECT version FROM _migrations')) {
        const v = store.migrations.find(m => m.version === p[0]);
        return v ? { version: v.version } : null;
      }

      if (matchSql(s, 'SELECT COUNT(*) as cnt FROM documents')) {
        const chatId = String(p[0]);
        const count = store.documents.filter(d => d.chat_id === chatId).length;
        return { cnt: count };
      }

      if (matchSql(s, 'SELECT COUNT')) {
        return { cnt: 0 };
      }

      return null;
    },

    async all() {
      const s = sql;

      if (matchSql(s, 'SELECT session_id, title FROM sessions')) {
        const results = store.sessions.filter(s => s.chat_id === String(p[0]));
        return { results };
      }

      if (matchSql(s, 'SELECT name, description FROM custom_personas')) {
        const results = store.custom_personas.filter(x => x.chat_id === String(p[0]));
        return { results };
      }

      if (matchSql(s, 'SELECT chat_id, reason FROM blocked_users')) {
        return { results: Object.values(store.blocked_users) };
      }

      if (matchSql(s, 'SELECT key, value FROM analytics')) {
        const results = Object.entries(store.analytics).map(([key, value]) => ({ key, value }));
        return { results };
      }

      if (matchSql(s, 'SELECT DISTINCT chat_id FROM user_settings')) {
        const results = Object.keys(store.user_settings).map(chat_id => ({ chat_id }));
        return { results };
      }

      if (matchSql(s, 'SELECT role, content FROM chat_history') && !matchSql(s, 'created_at')) {
        const chatId = String(p[0]);
        const sessionId = p[1];
        const limit = p[2] || 50;
        const results = store.chat_history
          .filter(h => h.chat_id === chatId && h.session_id === sessionId)
          .slice(-limit)
          .map(h => ({ role: h.role, content: h.content }));
        return { results };
      }

      if (matchSql(s, "FROM reminders WHERE chat_id")) {
        const chatId = String(p[0]);
        const results = store.reminders
          .filter(r => r.chat_id === chatId && r.status === 'pending')
          .map(r => ({ id: r.id, title: r.title, reminder_date: r.reminder_date, reminder_time: r.reminder_time, recurrence: r.recurrence, status: r.status, created_at: r.created_at, timezone: r.timezone }));
        return { results };
      }

      if (matchSql(s, "FROM reminders WHERE status = 'pending' AND")) {
        const results = store.reminders
          .filter(r => r.status === 'pending')
          .map(r => ({ id: r.id, chat_id: r.chat_id, title: r.title, reminder_date: r.reminder_date, reminder_time: r.reminder_time, recurrence: r.recurrence, status: r.status, created_at: r.created_at, timezone: r.timezone }));
        return { results };
      }

      if (matchSql(s, 'SELECT COUNT') && matchSql(s, 'reminders')) {
        return { cnt: store.reminders.filter(r => r.status === 'pending').length };
      }

      if (matchSql(s, 'SELECT role, content, created_at')) {
        const chatId = String(p[0]);
        const sessionId = p[1];
        const limit = p[2] || 200;
        const results = store.chat_history
          .filter(h => h.chat_id === chatId && h.session_id === sessionId)
          .slice(-limit)
          .map(h => ({ role: h.role, content: h.content, created_at: h.created_at }));
        return { results };
      }

      if (matchSql(s, 'SELECT chat_id, count, tier, violations')) {
        const results = Object.entries(store.rate_limits)
          .filter(([_, v]) => v.violations > 0)
          .map(([chat_id, v]) => ({ chat_id, count: v.count, tier: v.tier, violations: v.violations }));
        return { results };
      }

      if (matchSql(s, 'FROM memory_summaries WHERE chat_id') && matchSql(s, 'ORDER BY created_at DESC')) {
        const chatId = String(p[0]);
        const sessionId = p[1];
        const limit = p[2];
        const results = store.memory_summaries
          .filter(m => m.chat_id === chatId && m.session_id === sessionId)
          .slice(-limit)
          .reverse()
          .map(m => ({ id: m.id, chat_id: m.chat_id, session_id: m.session_id, summary: m.summary, created_at: m.created_at }));
        return { results };
      }

      if (matchSql(s, 'FROM documents WHERE chat_id') && matchSql(s, 'content LIKE')) {
        const chatId = String(p[0]);
        const terms = [];
        for (let i = 1; i < p.length - 1; i++) terms.push(p[i]);
        const limit = p[p.length - 1];
        let results = store.documents.filter(d => d.chat_id === chatId);
        if (terms.length > 0) {
          results = results.filter(d => terms.some(t => d.content.toLowerCase().includes(t.replace(/%/g, '').toLowerCase())));
        }
        results = results.slice(-limit);
        return { results };
      }

      return { results: [] };
    },
  };
}

export function createMockDb() {
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return createStatement(sql, params);
        },
        run() { return createStatement(sql, []).run(); },
        first() { return createStatement(sql, []).first(); },
        all() { return createStatement(sql, []).all(); },
      };
    },
  };
}

export async function resetMockStore() {
  store.user_settings = {};
  store.chat_history = [];
  store.sessions = [];
  store.custom_personas = [];
  store.rate_limits = {};
  store.migrations = [];
  store.analytics = { total_messages: 0, total_users: 0, total_images: 0, total_searches: 0, total_feedback_good: 0, total_feedback_bad: 0 };
  store.blocked_users = {};
  store.reminders = [];
  store.reminder_id_seq = 0;
  store.documents = [];
  store.doc_id_seq = 0;
  store.memory_summaries = [];
  store.mem_summary_id_seq = 0;
  try {
    const { clearDBCache } = await import('../../src/db.js');
    clearDBCache();
  } catch {}
}

export function createMockEnv(overrides = {}) {
  resetMockStore();
  return {
    DB: createMockDb(),
    AI: {
      async run(modelId, _options) {
        if (modelId.includes('whisper')) {
          return { text: 'This is a transcribed voice message.' };
        }
        if (modelId.includes('vision')) {
          return { description: 'A beautiful sunset over a mountain range.' };
        }
        if (modelId.includes('stable-diffusion')) {
          return { image: 'fake-image-bytes' };
        }
        return {
          response: 'This is a test AI response.',
        };
      },
    },
    TELEGRAM_BOT_TOKEN: 'test:token',
    WORKER_DOMAIN: 'test-worker.workers.dev',
    WEBHOOK_SECRET: 'test-secret',
    BRAVE_API_KEY: '',
    ...overrides,
  };
}
