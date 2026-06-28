import type { Env } from '../types/env.d.ts';
import type { ReminderRow, CountRow, PendingReminderRow } from '../types/d1.ts';
import { logger } from '../utils/logger.ts';

export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  try {
    const localStr = date.toLocaleString('sv-SE', { timeZone: timezone, hour12: false });
    const localMs = new Date(localStr.split(' ').join('T') + 'Z').getTime();
    return (localMs - date.getTime()) / 60000;
  } catch { return 0; }
}

export function localToUTC(timezone: string, dateStr: string, timeStr: string): { date: string; time: string } {
  const naiveUtc = new Date(`${dateStr}T${timeStr}:00Z`);
  const offset = getTimezoneOffset(timezone, naiveUtc);
  const actualUtc = new Date(naiveUtc.getTime() - offset * 60000);
  return {
    date: actualUtc.toISOString().slice(0, 10),
    time: actualUtc.toISOString().slice(11, 16),
  };
}

export function formatDateUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function formatTimeUTC(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

export function utcToLocal(timezone: string, dateStr: string, timeStr: string): { date: string; time: string } {
  const utcDate = new Date(`${dateStr}T${timeStr}:00Z`);
  const offset = getTimezoneOffset(timezone, utcDate);
  const localDate = new Date(utcDate.getTime() + offset * 60000);
  return {
    date: formatDateUTC(localDate),
    time: formatTimeUTC(localDate),
  };
}

export async function createReminder(env: Env, chatId: number | string, title: string, date: string, time: string, recurrence = 'none', timezone = 'UTC'): Promise<number> {
  if (!env.DB) return 0;
  try {
    const result = await env.DB.prepare(
      'INSERT INTO reminders (chat_id, title, reminder_date, reminder_time, recurrence, timezone) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(String(chatId), title, date, time, recurrence, timezone).run();
    return Number(result?.meta?.last_row_id || 0);
  } catch (e: any) { logger.error('DB createReminder error', { chatId, error: e.message }); return 0; }
}

export async function getReminders(env: Env, chatId: number | string): Promise<ReminderRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      "SELECT id, title, reminder_date, reminder_time, recurrence, status, created_at, timezone FROM reminders WHERE chat_id = ? AND status = 'pending' ORDER BY reminder_date ASC, reminder_time ASC"
    ).bind(String(chatId)).all<ReminderRow>();
    return rows.results || [];
  } catch (e: any) { logger.error('DB getReminders error', { chatId, error: e.message }); return []; }
}

export async function getAllReminders(env: Env): Promise<ReminderRow[]> {
  if (!env.DB) return [];
  try {
    const rows = await env.DB.prepare(
      "SELECT id, chat_id, title, reminder_date, reminder_time, recurrence, status, created_at FROM reminders WHERE status = 'pending' AND (reminder_date < date('now') OR (reminder_date = date('now') AND reminder_time <= time('now'))) ORDER BY reminder_date ASC, reminder_time ASC"
    ).all<ReminderRow>();
    return rows.results || [];
  } catch (e: any) { logger.error('DB getAllReminders error', { error: e.message }); return []; }
}

export async function markReminderSent(env: Env, id: number): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare("UPDATE reminders SET status = 'sent' WHERE id = ?").bind(id).run();
  } catch (e: any) { logger.error('DB markReminderSent error', { id, error: e.message }); }
}

export async function cancelReminder(env: Env, id: number, chatId: number | string): Promise<boolean> {
  if (!env.DB) return false;
  try {
    const result = await env.DB.prepare(
      "UPDATE reminders SET status = 'cancelled' WHERE id = ? AND chat_id = ?"
    ).bind(id, String(chatId)).run();
    return (result?.meta?.changes || 0) > 0;
  } catch (e: any) { logger.error('DB cancelReminder error', { id, error: e.message }); return false; }
}

export async function deleteReminder(env: Env, id: number, chatId: number | string): Promise<boolean> {
  if (!env.DB) return false;
  try {
    const result = await env.DB.prepare(
      'DELETE FROM reminders WHERE id = ? AND chat_id = ?'
    ).bind(id, String(chatId)).run();
    return (result?.meta?.changes || 0) > 0;
  } catch (e: any) { logger.error('DB deleteReminder error', { id, error: e.message }); return false; }
}

export async function getDueReminders(env: Env): Promise<ReminderRow[]> {
  if (!env.DB) return [];
  try {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toISOString().slice(11, 16);
    const rows = await env.DB.prepare(
      "SELECT id, chat_id, title, reminder_date, reminder_time, recurrence, timezone FROM reminders WHERE status = 'pending' AND (reminder_date < ? OR (reminder_date = ? AND reminder_time <= ?))"
    ).bind(dateStr, dateStr, timeStr).all<ReminderRow>();
    return rows.results || [];
  } catch (e: any) { logger.error('DB getDueReminders error', { error: e.message }); return []; }
}

export async function rescheduleReminder(env: Env, id: number, recurrence: string, currentDate: string): Promise<void> {
  if (!env.DB || recurrence === 'none') return;
  try {
    const dt = new Date(currentDate + 'T12:00:00');
    let nextDate: string;
    if (recurrence === 'daily') {
      dt.setDate(dt.getDate() + 1);
    } else if (recurrence === 'weekly') {
      dt.setDate(dt.getDate() + 7);
    } else if (recurrence === 'monthly') {
      dt.setMonth(dt.getMonth() + 1);
    }
    nextDate = dt.toISOString().slice(0, 10);
    await env.DB.prepare(
      "UPDATE reminders SET reminder_date = ?, status = 'pending' WHERE id = ?"
    ).bind(nextDate, id).run();
  } catch (e: any) { logger.error('DB rescheduleReminder error', { id, error: e.message }); }
}

// === Pending Reminder Wizard Persistence ===

export async function savePendingReminder(env: Env, chatId: number | string, data: {
  step: string; title: string; year: number; month: number;
  selectedDate: string | null; selectedHour: string | null;
  selectedMinute: string | null; selectedTime: string | null;
  recurrence: string; lang: string; timezone: string;
}): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      `INSERT INTO pending_reminders (chat_id, step, title, year, month, selected_date, selected_hour, selected_minute, selected_time, recurrence, lang, timezone, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(chat_id) DO UPDATE SET
         step = excluded.step, title = excluded.title, year = excluded.year,
         month = excluded.month, selected_date = excluded.selected_date,
         selected_hour = excluded.selected_hour, selected_minute = excluded.selected_minute,
         selected_time = excluded.selected_time, recurrence = excluded.recurrence,
         lang = excluded.lang, timezone = excluded.timezone,
         updated_at = datetime('now')`
    ).bind(String(chatId), data.step, data.title, data.year, data.month,
      data.selectedDate, data.selectedHour, data.selectedMinute,
      data.selectedTime, data.recurrence, data.lang, data.timezone).run();
  } catch (e: any) {
    logger.error('DB savePendingReminder error', { chatId, error: e.message });
  }
}

export async function getPendingReminder(env: Env, chatId: number | string): Promise<PendingReminderRow | null> {
  if (!env.DB) return null;
  try {
    const row = await env.DB.prepare(
      'SELECT * FROM pending_reminders WHERE chat_id = ?'
    ).bind(String(chatId)).first<PendingReminderRow | null>();
    return row || null;
  } catch (e: any) {
    logger.error('DB getPendingReminder error', { chatId, error: e.message });
    return null;
  }
}

export async function deletePendingReminder(env: Env, chatId: number | string): Promise<void> {
  if (!env.DB) return;
  try {
    await env.DB.prepare('DELETE FROM pending_reminders WHERE chat_id = ?').bind(String(chatId)).run();
  } catch (e: any) {
    logger.error('DB deletePendingReminder error', { chatId, error: e.message });
  }
}

export async function getReminderCount(env: Env, chatId: number | string): Promise<number> {
  if (!env.DB) return 0;
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM reminders WHERE chat_id = ? AND status = 'pending'"
    ).bind(String(chatId)).first<CountRow | null>();
    return row?.cnt || 0;
  } catch (e: any) { return 0; }
}
