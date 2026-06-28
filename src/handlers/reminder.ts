import { sendMessage, editMessage, sendChatAction } from '../telegram.ts';
import { t } from '../locales.ts';
import {
  createReminder, getReminders, deleteReminder, markReminderSent,
  cancelReminder, rescheduleReminder, getReminderCount, getDueReminders,
  getSettings, localToUTC, utcToLocal,
  savePendingReminder, getPendingReminder, deletePendingReminder,
} from '../services/index.ts';
import {
  buildDateKeyboard, buildTimeKeyboard, buildTimeMinuteKeyboard,
  buildRecurrenceKeyboard, buildConfirmKeyboard, buildReminderListKeyboard,
  buildReminderActionKeyboard, buildNotificationKeyboard,
  getRecurrenceLabel, formatReminderDate, formatReminderTime
} from '../menus/reminderMenu.ts';
import { REMINDER_SNOOZE_MINUTES, REMINDER_MAX_PER_USER } from '../constants.ts';
import { logger } from '../utils/logger.ts';
import type { Env } from '../types/env.d.ts';

const STEPS = ['title', 'date', 'time', 'recurrence', 'confirm'] as const;
type Step = typeof STEPS[number];

interface ReminderSession {
  chatId: number | string;
  step: Step;
  title: string;
  year: number;
  month: number;
  selectedDate: string | null;
  selectedHour: string | null;
  selectedMinute: string | null;
  selectedTime: string | null;
  recurrence: string;
  lang: string;
  timezone: string;
  messageId?: number;
}

async function cleanupSession(chatId: number | string, env: Env): Promise<void> {
  await deletePendingReminder(env, chatId);
}

async function loadOrInitSession(chatId: number | string, env: Env, lang: string): Promise<ReminderSession | null> {
  const row = await getPendingReminder(env, chatId);
  if (!row) return null;
  return {
    chatId,
    step: row.step as Step,
    title: row.title,
    year: row.year,
    month: row.month,
    selectedDate: row.selected_date,
    selectedHour: row.selected_hour,
    selectedMinute: row.selected_minute,
    selectedTime: row.selected_time,
    recurrence: row.recurrence,
    lang: row.lang,
    timezone: row.timezone,
  };
}

async function persistSession(chatId: number | string, session: ReminderSession, env: Env): Promise<void> {
  await savePendingReminder(env, chatId, {
    step: session.step, title: session.title, year: session.year, month: session.month,
    selectedDate: session.selectedDate, selectedHour: session.selectedHour,
    selectedMinute: session.selectedMinute, selectedTime: session.selectedTime,
    recurrence: session.recurrence, lang: session.lang, timezone: session.timezone,
  });
}

export async function handleRemindCommand(chatId: number | string, env: Env, lang: string): Promise<void> {
  const count = await getReminderCount(env, chatId);
  if (count >= REMINDER_MAX_PER_USER) {
    await sendMessage(chatId, `🚫 You have reached the maximum of ${REMINDER_MAX_PER_USER} reminders. Delete some first.`, env);
    return;
  }

  const settings: any = await getSettings(env, chatId);
  const now = new Date();
  const session: ReminderSession = {
    chatId,
    step: 'title',
    title: '',
    year: now.getFullYear(),
    month: now.getMonth(),
    selectedDate: null,
    selectedHour: null,
    selectedMinute: null,
    selectedTime: null,
    recurrence: 'none',
    lang,
    timezone: settings.timezone || 'UTC',
  };
  await persistSession(chatId, session, env);

  await sendMessage(chatId, t(lang, 'reminder_new'), env, 'Markdown');
}

export async function handleCancelCommand(chatId: number | string, env: Env, lang: string): Promise<void> {
  await cleanupSession(chatId, env);
  await sendMessage(chatId, t(lang, 'reminder_cancelled'), env);
}

export async function handleRemindersList(chatId: number | string, env: Env, lang: string, page = 0): Promise<void> {
  const reminders = await getReminders(env, chatId);

  if (!reminders.length) {
    await sendMessage(chatId, t(lang, 'reminder_list_empty'), env, 'Markdown');
    return;
  }

  const localReminders = reminders.map((r: any) => {
    const local = utcToLocal(r.timezone || 'UTC', r.reminder_date, r.reminder_time);
    return { ...r, reminder_date: local.date, reminder_time: local.time };
  });

  const text = t(lang, 'reminder_list_title', { count: String(reminders.length) });
  const keyboard = buildReminderListKeyboard(localReminders, lang, page);
  await sendMessage(chatId, text, env, 'Markdown', keyboard);
}

export async function handleReminderMessage(chatId: number | string, text: string, env: Env, lang: string): Promise<boolean> {
  const session = await loadOrInitSession(chatId, env, lang);
  if (!session) return false;

  if (text === '/cancel') {
    await cleanupSession(chatId, env);
    await sendMessage(chatId, t(lang, 'reminder_cancelled'), env);
    return true;
  }

  if (session.step === 'title') {
    session.title = text.slice(0, 100);
    session.step = 'date';
    await persistSession(chatId, session, env);
    const keyboard = buildDateKeyboard(session.year, session.month, lang, null);
    await sendMessage(chatId, t(lang, 'reminder_select_date'), env, 'Markdown', keyboard);
    return true;
  }

  return true;
}

export async function handleReminderCallback(data: string, chatId: number | string, messageId: number, env: Env, lang: string): Promise<boolean> {
  let session = await loadOrInitSession(chatId, env, lang);

  if (data === 'rem_cancel') {
    await cleanupSession(chatId, env);
    await editMessage(chatId, messageId, t(lang, 'reminder_cancelled'), env);
    return true;
  }

  if (data === 'rem_close_list') {
    await editMessage(chatId, messageId, '✅', env);
    return true;
  }

  if (data === 'rem_noop') {
    return true;
  }

  if (data === 'rem_list_back') {
    const reminders = (await getReminders(env, chatId)).map(toLocal);
    const text = reminders.length > 0
      ? t(lang, 'reminder_list_title', { count: String(reminders.length) })
      : t(lang, 'reminder_list_empty');
    const keyboard = reminders.length > 0
      ? buildReminderListKeyboard(reminders, lang)
      : undefined;
    await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
    return true;
  }

  function isPastDate(y: number, m: number, d: number): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selected = new Date(y, m, d);
    return selected < today;
  }

  if (data === 'rem_date_confirm') {
    if (!session) return false;
    if (!session.selectedDate) {
      const now = new Date();
      session.selectedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      session.year = now.getFullYear();
      session.month = now.getMonth();
    }
    session.step = 'time';
    await persistSession(chatId, session, env);
    const keyboard = buildTimeKeyboard(lang);
    await editMessage(chatId, messageId, t(lang, 'reminder_select_time'), env, 'Markdown', keyboard);
    return true;
  }

  if (data.startsWith('rem_date_')) {
    if (!session) return false;
    session.lang = lang;

    const parts = data.split('_');
    if (parts.length === 4) {
      const y = parseInt(parts[2]);
      const m = parseInt(parts[3]);
      if (!isNaN(y) && !isNaN(m)) {
        session.year = y;
        session.month = m;
        await persistSession(chatId, session, env);
        const keyboard = buildDateKeyboard(y, m, lang, session.selectedDate);
        await editMessage(chatId, messageId, t(lang, 'reminder_select_date'), env, 'Markdown', keyboard);
      }
    } else if (parts.length === 5) {
      const y = parseInt(parts[2]);
      const m = parseInt(parts[3]);
      const d = parseInt(parts[4]);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        if (isPastDate(y, m, d)) {
          const keyboard = buildDateKeyboard(session.year, session.month, lang, session.selectedDate);
          await editMessage(chatId, messageId, t(lang, 'reminder_past_date'), env, 'Markdown', keyboard);
        } else {
          session.selectedDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          session.year = y;
          session.month = m;
          await persistSession(chatId, session, env);
          const keyboard = buildDateKeyboard(y, m, lang, session.selectedDate);
          await editMessage(chatId, messageId, t(lang, 'reminder_select_date'), env, 'Markdown', keyboard);
        }
      }
    }
    return true;
  }

  if (data.startsWith('rem_time_')) {
    if (!session) return false;
    session.lang = lang;

    if (data === 'rem_time_confirm') {
      if (!session.selectedTime) {
        const nowTz = new Date().toLocaleString('sv-SE', { timeZone: session.timezone, hour12: false });
        session.selectedTime = nowTz.split(' ')[1].slice(0, 5);
      }
      const nowTz = new Date().toLocaleString('sv-SE', { timeZone: session.timezone, hour12: false });
      const [nowDateTz, nowTimeTz] = nowTz.split(' ');
      if (session.selectedDate === nowDateTz) {
        const [h, min] = session.selectedTime.split(':').map(Number);
        const [nowH, nowMin] = nowTimeTz.split(':').map(Number);
        if (h < nowH || (h === nowH && min < nowMin)) {
          const keyboard = buildTimeKeyboard(lang, session.selectedHour, session.selectedMinute);
          await editMessage(chatId, messageId, t(lang, 'reminder_past_time'), env, 'Markdown', keyboard);
          return true;
        }
      }
      session.step = 'recurrence';
      await persistSession(chatId, session, env);
      const keyboard = buildRecurrenceKeyboard(lang, session.recurrence);
      await editMessage(chatId, messageId, t(lang, 'reminder_select_recurrence'), env, 'Markdown', keyboard);
      return true;
    }

    if (data.startsWith('rem_time_hour_')) {
      const hour = data.replace('rem_time_hour_', '');
      if (/^\d{2}$/.test(hour) && parseInt(hour) < 24) {
        const nowTz = new Date().toLocaleString('sv-SE', { timeZone: session.timezone, hour12: false });
        const [nowDateTz, nowTimeTz] = nowTz.split(' ');
        const nowH = parseInt(nowTimeTz.split(':')[0]);
        if (session.selectedDate === nowDateTz && parseInt(hour) < nowH) {
          const keyboard = buildTimeKeyboard(lang, session.selectedHour, null);
          await editMessage(chatId, messageId, t(lang, 'reminder_past_time'), env, 'Markdown', keyboard);
          return true;
        }
        session.selectedHour = hour;
        session.selectedMinute = null;
        session.selectedTime = null;
        await persistSession(chatId, session, env);
        const keyboard = buildTimeMinuteKeyboard(lang, hour, null);
        await editMessage(chatId, messageId, t(lang, 'reminder_select_time'), env, 'Markdown', keyboard);
      }
      return true;
    }

    if (data.startsWith('rem_time_min_')) {
      const minute = data.replace('rem_time_min_', '');
      if (/^\d{2}$/.test(minute) && parseInt(minute) < 60) {
        session.selectedMinute = minute;
        session.selectedTime = `${session.selectedHour}:${minute}`;
        await persistSession(chatId, session, env);
        const keyboard = buildTimeKeyboard(lang, session.selectedHour, minute);
        await editMessage(chatId, messageId, t(lang, 'reminder_select_time'), env, 'Markdown', keyboard);
      }
      return true;
    }

    return true;
  }

  if (data.startsWith('rem_recur_')) {
    if (!session) return false;
    session.lang = lang;

    if (data === 'rem_recur_confirm') {
      const keyboard = buildConfirmKeyboard(lang);
      const formattedDate = formatReminderDate(session.selectedDate!, lang);
      const formattedTime = formatReminderTime(session.selectedTime!);
      const recurrenceLabel = getRecurrenceLabel(lang, session.recurrence);
      const text = t(lang, 'reminder_confirm', {
        title: session.title,
        date: formattedDate,
        time: formattedTime,
        recurrence: recurrenceLabel,
      });
      await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
      return true;
    }

    const rec = data.replace('rem_recur_', '');
    if (['none', 'daily', 'weekly', 'monthly'].includes(rec)) {
      session.recurrence = rec;
      await persistSession(chatId, session, env);
      const keyboard = buildRecurrenceKeyboard(lang, rec);
      await editMessage(chatId, messageId, t(lang, 'reminder_select_recurrence'), env, 'Markdown', keyboard);
    }
    return true;
  }

  if (data === 'rem_back_date') {
    if (!session) return false;
    session.step = 'date';
    await persistSession(chatId, session, env);
    const keyboard = buildDateKeyboard(session.year, session.month, lang, session.selectedDate);
    await editMessage(chatId, messageId, t(lang, 'reminder_select_date'), env, 'Markdown', keyboard);
    return true;
  }

  if (data === 'rem_back_hour') {
    if (!session) return false;
    session.selectedMinute = null;
    session.selectedTime = null;
    await persistSession(chatId, session, env);
    const keyboard = buildTimeKeyboard(lang, session.selectedHour, null);
    await editMessage(chatId, messageId, t(lang, 'reminder_select_time'), env, 'Markdown', keyboard);
    return true;
  }

  if (data === 'rem_back_time') {
    if (!session) return false;
    session.step = 'time';
    session.selectedHour = null;
    session.selectedMinute = null;
    session.selectedTime = null;
    await persistSession(chatId, session, env);
    const keyboard = buildTimeKeyboard(lang, null, null);
    await editMessage(chatId, messageId, t(lang, 'reminder_select_time'), env, 'Markdown', keyboard);
    return true;
  }

  if (data === 'rem_confirm_create') {
    if (!session || !session.selectedDate || !session.selectedTime) return false;
    session.lang = lang;

    const utc = localToUTC(session.timezone, session.selectedDate, session.selectedTime);
    const id = await createReminder(env, chatId, session.title, utc.date, utc.time, session.recurrence, session.timezone);

    const formattedDate = formatReminderDate(session.selectedDate, lang);
    const formattedTime = formatReminderTime(session.selectedTime);
    const recurrenceLabel = getRecurrenceLabel(lang, session.recurrence);
    const text = t(lang, 'reminder_created', {
      title: session.title,
      date: formattedDate,
      time: formattedTime,
      recurrence: recurrenceLabel,
    });

    await cleanupSession(chatId, env);
    await editMessage(chatId, messageId, text, env, 'Markdown');
    return true;
  }

  function toLocal(r: any) {
    const loc = utcToLocal(r.timezone || 'UTC', r.reminder_date, r.reminder_time);
    return { ...r, reminder_date: loc.date, reminder_time: loc.time };
  }

  if (data.startsWith('rem_view_')) {
    const id = parseInt(data.replace('rem_view_', ''));
    if (!isNaN(id)) {
      const reminders = (await getReminders(env, chatId)).map(toLocal);
      const reminder = reminders.find((r: any) => r.id === id);
      if (reminder) {
        const formattedDate = formatReminderDate(reminder.reminder_date, lang);
        const formattedTime = formatReminderTime(reminder.reminder_time);
        const recurrenceLabel = getRecurrenceLabel(lang, reminder.recurrence);
        const text = t(lang, 'reminder_action_title', {
          title: reminder.title,
          date: formattedDate,
          time: formattedTime,
          recurrence: recurrenceLabel,
        });
        const keyboard = buildReminderActionKeyboard(reminder, lang);
        await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
      } else {
        await editMessage(chatId, messageId, t(lang, 'reminder_not_found'), env);
      }
    }
    return true;
  }

  if (data.startsWith('rem_delete_')) {
    const id = parseInt(data.replace('rem_delete_', ''));
    if (!isNaN(id)) {
      const deleted = await deleteReminder(env, id, chatId);
      if (deleted) {
        const reminders = (await getReminders(env, chatId)).map(toLocal);
        if (reminders.length > 0) {
          const text = t(lang, 'reminder_list_title', { count: String(reminders.length) });
          const keyboard = buildReminderListKeyboard(reminders, lang);
          await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
        } else {
          await editMessage(chatId, messageId, t(lang, 'reminder_list_empty'), env, 'Markdown');
        }
      } else {
        await editMessage(chatId, messageId, t(lang, 'reminder_not_found'), env);
      }
    }
    return true;
  }

  if (data.startsWith('rem_list_page_')) {
    const page = parseInt(data.replace('rem_list_page_', ''));
    if (!isNaN(page)) {
      const reminders = (await getReminders(env, chatId)).map(toLocal);
      const text = t(lang, 'reminder_list_title', { count: String(reminders.length) });
      const keyboard = buildReminderListKeyboard(reminders, lang, page);
      await editMessage(chatId, messageId, text, env, 'Markdown', keyboard);
    }
    return true;
  }

  if (data.startsWith('rem_done_')) {
    const id = parseInt(data.replace('rem_done_', ''));
    if (!isNaN(id)) {
      const cancelled = await cancelReminder(env, id, chatId);
      if (cancelled) {
        await editMessage(chatId, messageId, t(lang, 'reminder_done'), env);
      }
    }
    return true;
  }

  if (data.startsWith('rem_snooze_')) {
    const id = parseInt(data.replace('rem_snooze_', ''));
    if (!isNaN(id)) {
      const now = new Date();
      const snoozedTime = new Date(now.getTime() + REMINDER_SNOOZE_MINUTES * 60 * 1000);
      const dateStr = snoozedTime.toISOString().slice(0, 10);
      const timeStr = snoozedTime.toISOString().slice(11, 16);

      await markReminderSent(env, id);
      const newId = await createReminder(env, chatId, t(lang, 'reminder_snoozed'), dateStr, timeStr, 'none');

      await editMessage(chatId, messageId, t(lang, 'reminder_snoozed'), env);
    }
    return true;
  }

  return false;
}

export async function processDueReminders(env: Env): Promise<number> {
  const reminders = await getDueReminders(env);
  let sent = 0;

  for (const r of reminders) {
    try {
      const settings: any = await getSettings(env, r.chat_id);
      const lang = settings.lang || 'en';
      const text = t(lang, 'reminder_notification', { title: r.title });
      const keyboard = buildNotificationKeyboard(r.id, lang);
      await sendMessage(r.chat_id, text, env, 'Markdown', keyboard);

      if (r.recurrence && r.recurrence !== 'none') {
        await rescheduleReminder(env, r.id, r.recurrence, r.reminder_date);
      } else {
        await markReminderSent(env, r.id);
      }
      sent++;
    } catch (e: any) {
      logger.error('Reminder notification failed', { id: r.id, chatId: r.chat_id, error: e.message });
    }
  }

  if (reminders.length > 0) {
    logger.info('Reminders processed', { total: reminders.length, sent });
  }
  return sent;
}
