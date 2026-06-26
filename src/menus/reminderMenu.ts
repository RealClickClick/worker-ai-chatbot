import { t } from '../locales.ts';
import { REMINDER_HOURS, REMINDER_MINUTES } from '../constants.ts';

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FA = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const MONTHS_RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

const DAYS_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const DAYS_FA = ['د','س','چ','پ','ج','ش','ی'];
const DAYS_AR = ['ن','ث','ر','خ','ج','س','ح'];
const DAYS_TR = ['Pt','Sa','Ça','Pe','Cu','Ct','Pz'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function getMonths(lang: string): string[] {
  if (lang === 'fa') return MONTHS_FA;
  if (lang === 'ar') return MONTHS_AR;
  if (lang === 'tr') return MONTHS_TR;
  if (lang === 'ru') return MONTHS_RU;
  return MONTHS_EN;
}

function getDays(lang: string): string[] {
  if (lang === 'fa') return DAYS_FA;
  if (lang === 'ar') return DAYS_AR;
  if (lang === 'tr') return DAYS_TR;
  if (lang === 'ru') return DAYS_RU;
  return DAYS_EN;
}

function isRtl(lang: string): boolean {
  return lang === 'fa' || lang === 'ar';
}

export function buildDateKeyboard(year: number, month: number, lang: string, selectedDate: string | null = null): any {
  const months = getMonths(lang);
  const days = getDays(lang);
  const rtl = isRtl(lang);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const rows: any[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const headerLabel = `${months[month]} ${year}`;
  rows.push([
    { text: t(lang, 'reminder_nav_prev'), callback_data: `rem_date_${prevYear}_${prevMonth}` },
    { text: headerLabel, callback_data: 'rem_noop' },
    { text: t(lang, 'reminder_nav_next'), callback_data: `rem_date_${nextYear}_${nextMonth}` },
  ]);

  const dayRow: any[] = [];
  const sortedDays = rtl ? [...days].reverse() : days;
  for (const d of sortedDays) {
    dayRow.push({ text: d, callback_data: 'rem_noop' });
  }
  rows.push(dayRow);

  let dayCells: any[] = [];
  const startOffset = rtl ? (firstDay === 0 ? 6 : firstDay - 1) : (firstDay === 0 ? 6 : firstDay - 1);

  for (let i = 0; i < startOffset; i++) {
    const prevDay = daysInPrev - startOffset + i + 1;
    dayCells.push({ text: `${prevDay}`, callback_data: `rem_date_${prevYear}_${prevMonth}_${prevDay}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    let label = String(d);
    if (isToday) label = `📍${d}`;
    if (isSelected) label = `✅${d}`;
    dayCells.push({ text: label, callback_data: `rem_date_${year}_${month}_${d}` });
  }

  while (dayCells.length % 7 !== 0) {
    const fillDay = dayCells.length % 7;
    dayCells.push({ text: ' ', callback_data: 'rem_noop' });
  }

  for (let i = 0; i < dayCells.length; i += 7) {
    rows.push(dayCells.slice(i, i + 7));
  }

  rows.push([
    { text: t(lang, 'reminder_today'), callback_data: `rem_date_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}` },
    { text: t(lang, 'reminder_confirm_btn'), callback_data: 'rem_date_confirm' },
  ]);

  rows.push([{ text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_cancel' }]);

  return { inline_keyboard: rows };
}

export function buildTimeKeyboard(lang: string, selectedHour: string | null = null, selectedMinute: string | null = null): any {
  const rows: any[] = [];

  if (selectedHour && selectedMinute) {
    const displayTime = `${selectedHour}:${selectedMinute}`;
    rows.push([{ text: `✅ ${displayTime}`, callback_data: 'rem_noop' }]);
    rows.push([{ text: t(lang, 'reminder_confirm_btn'), callback_data: 'rem_time_confirm' }]);
    rows.push([
      { text: t(lang, 'reminder_back'), callback_data: 'rem_back_hour' },
      { text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_cancel' },
    ]);
  } else if (selectedHour) {
    rows.push([{ text: `🕐 ${selectedHour}:--`, callback_data: 'rem_noop' }]);
    return buildTimeMinuteKeyboard(lang, selectedHour, selectedMinute);
  } else {
    for (let i = 0; i < REMINDER_HOURS.length; i += 6) {
      const row: any[] = [];
      for (let j = 0; j < 6 && i + j < REMINDER_HOURS.length; j++) {
        const h = REMINDER_HOURS[i + j];
        row.push({ text: h, callback_data: `rem_time_hour_${h}` });
      }
      rows.push(row);
    }
    rows.push([
      { text: t(lang, 'reminder_back'), callback_data: 'rem_back_date' },
      { text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_cancel' },
    ]);
  }

  return { inline_keyboard: rows };
}

export function buildTimeMinuteKeyboard(lang: string, hour: string, selectedMinute: string | null = null): any {
  const rows: any[] = [];
  const minuteRow: any[] = [];
  for (const m of REMINDER_MINUTES) {
    const isSelected = m === selectedMinute;
    minuteRow.push({
      text: isSelected ? `✅ ${hour}:${m}` : m,
      callback_data: `rem_time_min_${m}`,
    });
  }
  rows.push(minuteRow);
  rows.push([
    { text: t(lang, 'reminder_back'), callback_data: 'rem_back_hour' },
    { text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_cancel' },
  ]);
  return { inline_keyboard: rows };
}

export function buildRecurrenceKeyboard(lang: string, selected: string | null = null): any {
  const recurrences = ['none', 'daily', 'weekly', 'monthly'];
  const rows: any[] = [];

  for (const r of recurrences) {
    const isSelected = r === selected;
    const labelKey = `reminder_recurrence_${r}`;
    const label = isSelected ? `✅ ${t(lang, labelKey)}` : t(lang, labelKey);
    rows.push([{ text: label, callback_data: `rem_recur_${r}` }]);
  }

  rows.push([{ text: t(lang, 'reminder_confirm_btn'), callback_data: 'rem_recur_confirm' }]);
  rows.push([
    { text: t(lang, 'reminder_back'), callback_data: 'rem_back_time' },
    { text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_cancel' },
  ]);

  return { inline_keyboard: rows };
}

export function buildConfirmKeyboard(lang: string): any {
  return {
    inline_keyboard: [
      [
        { text: t(lang, 'reminder_confirm_btn'), callback_data: 'rem_confirm_create' },
        { text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_cancel' },
      ],
    ],
  };
}

export function buildReminderActionKeyboard(reminder: any, lang: string): any {
  return {
    inline_keyboard: [
      [
        { text: t(lang, 'reminder_done_btn'), callback_data: `rem_done_${reminder.id}` },
        { text: t(lang, 'reminder_delete_btn'), callback_data: `rem_delete_${reminder.id}` },
      ],
      [
        { text: t(lang, 'reminder_back_list'), callback_data: 'rem_list_back' },
        { text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_close_list' },
      ],
    ],
  };
}

export function buildReminderListKeyboard(reminders: any[], lang: string, page = 0, pageSize = 5): any {
  const rows: any[] = [];
  const start = page * pageSize;
  const pageItems = reminders.slice(start, start + pageSize);

  for (const r of pageItems) {
    const dateStr = r.reminder_date;
    const timeStr = r.reminder_time;
    const title = r.title.length > 25 ? r.title.slice(0, 25) + '…' : r.title;
    rows.push([
      { text: `📌 ${title} — ${dateStr} ${timeStr}`, callback_data: `rem_view_${r.id}` },
    ]);
  }

  const navRow: any[] = [];
  if (page > 0) {
    navRow.push({ text: t(lang, 'reminder_nav_prev'), callback_data: `rem_list_page_${page - 1}` });
  }
  navRow.push({ text: `${page + 1}/${Math.ceil(reminders.length / pageSize)}`, callback_data: 'rem_noop' });
  if (start + pageSize < reminders.length) {
    navRow.push({ text: t(lang, 'reminder_nav_next'), callback_data: `rem_list_page_${page + 1}` });
  }
  if (navRow.length > 1) rows.push(navRow);

  rows.push([{ text: t(lang, 'reminder_cancel_btn'), callback_data: 'rem_close_list' }]);

  return { inline_keyboard: rows };
}

export function buildNotificationKeyboard(reminderId: number, lang: string): any {
  return {
    inline_keyboard: [
      [
        { text: t(lang, 'reminder_done_btn'), callback_data: `rem_done_${reminderId}` },
        { text: t(lang, 'reminder_snooze_btn'), callback_data: `rem_snooze_${reminderId}` },
      ],
    ],
  };
}

export function getRecurrenceLabel(lang: string, recurrence: string): string {
  const key = `reminder_recurrence_${recurrence}`;
  const label = t(lang, key);
  return label;
}

export function formatReminderDate(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = getMonths(lang);
  if (lang === 'fa') return `${d} ${months[m - 1]} ${y}`;
  if (lang === 'ar') return `${d} ${months[m - 1]} ${y}`;
  if (lang === 'tr') return `${d} ${months[m - 1]} ${y}`;
  if (lang === 'ru') return `${d} ${months[m - 1]} ${y}`;
  return `${months[m - 1]} ${d}, ${y}`;
}

export function formatReminderTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}
