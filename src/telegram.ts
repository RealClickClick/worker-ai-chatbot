import type { Env } from './types/env.d.ts';
import { MAX_MESSAGE_LENGTH } from './constants.ts';
import { logger } from './utils/logger.ts';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const TELEGRAM_FILE_API = 'https://api.telegram.org/file/bot';

function getUrl(env: Env): string {
  return `${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}`;
}

async function call(method: string, payload: Record<string, any>, env: Env, retries = 2): Promise<Response> {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${getUrl(env)}/${method}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) return res;
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
        if (attempt < retries) {
          logger.warn('Telegram rate limited, retrying', { method, retryAfter, attempt });
          await new Promise(r => setTimeout(r, retryAfter * 1000));
          continue;
        }
      }
      if (res.status >= 500 && attempt < retries) {
        logger.warn('Telegram server error, retrying', { method, status: res.status, attempt });
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      return res;
    } catch (e: any) {
      lastErr = e;
      if (attempt < retries) {
        logger.warn('Telegram call error, retrying', { method, attempt, error: e.message });
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastErr || new Error(`Telegram call failed: ${method}`);
}

function splitLongText(text: string): string[] {
  const total = text.length;
  if (total <= MAX_MESSAGE_LENGTH) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < total) {
    const remaining = total - start;
    const chunkSize = Math.min(remaining, MAX_MESSAGE_LENGTH - 20);

    if (remaining <= MAX_MESSAGE_LENGTH) {
      chunks.push(text.slice(start));
      break;
    }

    const end = start + chunkSize;
    let splitAt = text.lastIndexOf('\n\n', end);
    if (splitAt <= start) splitAt = text.lastIndexOf('\n', end);
    if (splitAt <= start) splitAt = text.lastIndexOf(' ', end);
    if (splitAt <= start) splitAt = end;

    chunks.push(text.slice(start, splitAt));
    start = splitAt;
  }

  return chunks;
}

export async function sendMessage(chatId: number | string, text: string, env: Env, parseMode: string | null = null, replyMarkup: any = null, replyToMessageId?: number): Promise<void> {
  await sendMessageWithId(chatId, text, env, parseMode, replyMarkup, replyToMessageId);
}

export async function sendMessageWithId(chatId: number | string, text: string, env: Env, parseMode: string | null = null, replyMarkup: any = null, replyToMessageId?: number): Promise<number | null> {
  const str = String(text);
  const chunks = splitLongText(str);

  let lastError;
  let lastMessageId: number | null = null;

  for (let i = 0; i < chunks.length; i++) {
    const isLast = i === chunks.length - 1;
    let chunkText = chunks[i];

    if (chunks.length > 1) {
      chunkText = `(${i + 1}/${chunks.length}) ${chunkText}`;
    }

    const payload: Record<string, any> = { chat_id: chatId, text: chunkText.slice(0, MAX_MESSAGE_LENGTH) };
    if (parseMode) payload.parse_mode = parseMode;
    if (isLast && replyMarkup) payload.reply_markup = replyMarkup;
    if (replyToMessageId) payload.reply_to_message_id = replyToMessageId;

    try {
      const res = await call('sendMessage', payload, env);
      if (!res.ok && parseMode) {
        delete payload.parse_mode;
        payload.text = chunkText.slice(0, MAX_MESSAGE_LENGTH);
        await call('sendMessage', payload, env);
      } else if (res.ok) {
        const data = await res.json() as any;
        if (data?.result?.message_id) {
          lastMessageId = data.result.message_id;
        }
      }
      lastError = null;
    } catch (e: any) {
      logger.error('sendMessage chunk failed', { chatId, chunk: i + 1, total: chunks.length, error: e.message });
      lastError = e;
    }
  }

  if (lastError && chunks.length === 1) throw lastError;
  return lastMessageId;
}

export async function editMessage(chatId: number | string, messageId: number, text: string, env: Env, parseMode: string | null = null, replyMarkup: any = null): Promise<void> {
  const strText = String(text);

  if (strText.length <= MAX_MESSAGE_LENGTH) {
    const payload: Record<string, any> = { chat_id: chatId, message_id: messageId, text: strText };
    if (parseMode) payload.parse_mode = parseMode;
    if (replyMarkup) payload.reply_markup = replyMarkup;

    try {
      const res = await call('editMessageText', payload, env);
      if (!res.ok && parseMode) {
        delete payload.parse_mode;
        delete payload.reply_markup;
        await call('editMessageText', payload, env);
      }
    } catch (e: any) {
      logger.error('editMessage failed', { chatId, messageId, error: e.message });
    }
    return;
  }

  const chunks = splitLongText(strText);
  const firstChunk = chunks[0];
  const firstPayload: Record<string, any> = { chat_id: chatId, message_id: messageId, text: firstChunk };
  if (parseMode) firstPayload.parse_mode = parseMode;
  if (replyMarkup) firstPayload.reply_markup = replyMarkup;

  try {
    const res = await call('editMessageText', firstPayload, env);
    if (!res.ok && parseMode) {
      delete firstPayload.parse_mode;
      delete firstPayload.reply_markup;
      await call('editMessageText', firstPayload, env);
    }
  } catch (e: any) {
    logger.error('editMessage first chunk failed', { chatId, messageId, error: e.message });
  }

  for (let i = 1; i < chunks.length; i++) {
    const chunkText = chunks[i];
    await sendMessage(chatId, chunkText, env, parseMode, i === chunks.length - 1 ? replyMarkup : null).catch((e: any) => {
      logger.error('editMessage continuation chunk failed', { chatId, chunk: i + 1, total: chunks.length, error: e.message });
    });
  }
}

export async function deleteMessage(chatId: number | string, messageId: number, env: Env): Promise<void> {
  try {
    await call('deleteMessage', { chat_id: chatId, message_id: messageId }, env);
  } catch (e: any) {
    logger.warn('deleteMessage failed', { chatId, messageId, error: e.message });
  }
}

export async function sendChatAction(chatId: number | string, env: Env, action = 'typing'): Promise<void> {
  try {
    await call('sendChatAction', { chat_id: chatId, action }, env);
  } catch (e: any) {
    logger.warn('sendChatAction failed', { chatId, action, error: e.message });
  }
}

export async function sendPhoto(chatId: number | string, photoBlob: Blob | any, caption: string, env: Env): Promise<void> {
  const send = async (method: string, extra: Record<string, any> = {}) => {
    const fd = new FormData();
    fd.append('chat_id', String(chatId));
    fd.append(method === 'sendPhoto' ? 'photo' : 'document', photoBlob, 'image.png');
    fd.append('caption', caption.slice(0, 200));
    if (extra.parse_mode) fd.append('parse_mode', extra.parse_mode);
    return fetch(`${getUrl(env)}/${method}`, { method: 'POST', body: fd });
  };

  let res = await send('sendPhoto', { parse_mode: 'Markdown' });
  if (!res.ok) {
    logger.warn('sendPhoto Markdown failed, retrying plain', { error: await res.text().catch(() => 'unknown') });
    res = await send('sendPhoto');
  }
  if (!res.ok) {
    logger.warn('sendPhoto plain failed, retrying as document', { error: await res.text().catch(() => 'unknown') });
    res = await send('sendDocument');
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    logger.error('sendPhoto all attempts failed', { error: errText });
    throw new Error(`Send image failed: ${errText}`);
  }
}

export async function sendVoice(chatId: number | string, audioBytes: Uint8Array, env: Env, caption?: string): Promise<void> {
  try {
    const fd = new FormData();
    fd.append('chat_id', String(chatId));
    fd.append('voice', new Blob([audioBytes], { type: 'audio/ogg' }), 'voice.ogg');
    if (caption) fd.append('caption', caption.slice(0, 200));
    const res = await fetch(`${getUrl(env)}/sendVoice`, { method: 'POST', body: fd });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown');
      logger.warn('sendVoice failed', { chatId, error: errText });
    }
  } catch (e: any) {
    logger.warn('sendVoice failed', { chatId, error: e.message });
  }
}

export async function answerCallback(callbackQueryId: string, env: Env, text: string | null = null, showAlert = false): Promise<void> {
  const payload: Record<string, any> = { callback_query_id: callbackQueryId };
  if (text) payload.text = text;
  if (showAlert) payload.show_alert = true;
  try {
    await call('answerCallbackQuery', payload, env);
  } catch (e: any) {
    logger.warn('answerCallback failed', { error: e.message });
  }
}

export async function answerInlineQuery(inlineQueryId: string, results: any[], env: Env, cacheTime = 300): Promise<void> {
  try {
    await call('answerInlineQuery', { inline_query_id: inlineQueryId, results, cache_time: cacheTime }, env);
  } catch (e: any) {
    logger.warn('answerInlineQuery failed', { error: e.message });
  }
}

export async function downloadFile(fileId: string, env: Env): Promise<Uint8Array> {
  const res = await call('getFile', { file_id: fileId }, env);
  const data: any = await res.json();
  if (!data.ok || !data.result?.file_path) throw new Error('File not found');
  const fileRes = await fetch(`${TELEGRAM_FILE_API}${env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`);
  return new Uint8Array(await fileRes.arrayBuffer());
}

const COMMANDS_BY_LANG = {
  en: [
    { command: 'help', description: 'Show help message' },
    { command: 'mode', description: 'Change AI persona' },
    { command: 'model', description: 'Change AI model' },
    { command: 'lang', description: 'Switch language' },
    { command: 'image', description: 'Generate an image' },
    { command: 'search', description: 'Search the web' },
    { command: 'translate', description: 'Translate text' },
    { command: 'tts', description: 'Text to speech' },
    { command: 'summarize', description: 'Summarize conversation' },
    { command: 'session', description: 'Manage sessions' },
    { command: 'export', description: 'Export conversation' },
    { command: 'clear', description: 'Reset memory' },
    { command: 'remind', description: 'Create a reminder' },
    { command: 'reminders', description: 'List your reminders' },
    { command: 'translatemode', description: 'Translation mode (auto-translate)' },
    { command: 'feedback', description: 'Send feedback' },
    { command: 'stats', description: 'System status' }
  ],
  fa: [
    { command: 'help', description: 'نمایش راهنما' },
    { command: 'mode', description: 'تغییر شخصیت' },
    { command: 'model', description: 'تغییر مدل AI' },
    { command: 'lang', description: 'تغییر زبان' },
    { command: 'image', description: 'تولید تصویر' },
    { command: 'search', description: 'جستجوی وب' },
    { command: 'translate', description: 'ترجمه متن' },
    { command: 'tts', description: 'متن به گفتار' },
    { command: 'summarize', description: 'خلاصه‌سازی مکالمه' },
    { command: 'translatemode', description: 'حالت ترجمه خودکار' },
    { command: 'session', description: 'مدیریت جلسات' },
    { command: 'export', description: 'خروجی مکالمه' },
    { command: 'clear', description: 'پاکسازی حافظه' },
    { command: 'remind', description: 'ساخت یادآور' },
    { command: 'reminders', description: 'لیست یادآورها' },
    { command: 'feedback', description: 'ارسال بازخورد' },
    { command: 'stats', description: 'وضعیت سیستم' }
  ],
  ar: [
    { command: 'help', description: 'عرض المساعدة' },
    { command: 'mode', description: 'تغيير الشخصية' },
    { command: 'model', description: 'تغيير النموذج' },
    { command: 'lang', description: 'تغيير اللغة' },
    { command: 'image', description: 'إنشاء صورة' },
    { command: 'search', description: 'البحث في الويب' },
    { command: 'translate', description: 'ترجمة النص' },
    { command: 'tts', description: 'نص إلى كلام' },
    { command: 'summarize', description: 'تلخيص المحادثة' },
    { command: 'translatemode', description: 'وضع الترجمة التلقائية' },
    { command: 'session', description: 'إدارة الجلسات' },
    { command: 'export', description: 'تصدير المحادثة' },
    { command: 'clear', description: 'مسح الذاكرة' },
    { command: 'remind', description: 'إنشاء تذكير' },
    { command: 'reminders', description: 'قائمة التذكيرات' },
    { command: 'feedback', description: 'إرسال ملاحظات' },
    { command: 'stats', description: 'حالة النظام' }
  ],
  tr: [
    { command: 'help', description: 'Yardım mesajı' },
    { command: 'mode', description: 'Karakter değiştir' },
    { command: 'model', description: 'AI modeli değiştir' },
    { command: 'lang', description: 'Dil değiştir' },
    { command: 'image', description: 'Görsel oluştur' },
    { command: 'search', description: 'Web araması' },
    { command: 'translate', description: 'Metin çevir' },
    { command: 'tts', description: 'Metni sese çevir' },
    { command: 'summarize', description: 'Sohbeti özetle' },
    { command: 'translatemode', description: 'Otomatik çeviri modu' },
    { command: 'session', description: 'Oturumları yönet' },
    { command: 'export', description: 'Sohbeti dışa aktar' },
    { command: 'clear', description: 'Belleği temizle' },
    { command: 'remind', description: 'Hatırlatma oluştur' },
    { command: 'reminders', description: 'Hatırlatmalarım' },
    { command: 'feedback', description: 'Geri bildirim' },
    { command: 'stats', description: 'Sistem durumu' }
  ],
  ru: [
    { command: 'help', description: 'Помощь' },
    { command: 'mode', description: 'Сменить персонажа' },
    { command: 'model', description: 'Сменить модель AI' },
    { command: 'lang', description: 'Сменить язык' },
    { command: 'image', description: 'Создать изображение' },
    { command: 'search', description: 'Поиск в интернете' },
    { command: 'translate', description: 'Перевести текст' },
    { command: 'tts', description: 'Текст в речь' },
    { command: 'summarize', description: 'Краткое содержание' },
    { command: 'translatemode', description: 'Режим автоперевода' },
    { command: 'session', description: 'Управление сессиями' },
    { command: 'export', description: 'Экспорт разговора' },
    { command: 'clear', description: 'Сбросить память' },
    { command: 'remind', description: 'Создать напоминание' },
    { command: 'reminders', description: 'Мои напоминания' },
    { command: 'feedback', description: 'Отправить отзыв' },
    { command: 'stats', description: 'Статус системы' }
  ]
};

async function setBotCommands(env: Env): Promise<void> {
  for (const [lang, commands] of Object.entries(COMMANDS_BY_LANG)) {
    await call('setMyCommands', {
      commands,
      language_code: lang === 'en' ? '' : lang,
      scope: { type: 'all_private_chats' }
    }, env).catch((e: any) => logger.warn('setMyCommands failed', { lang, error: e.message }));
  }
}

export async function setWebhook(env: Env): Promise<Response> {
  const webhookUrl = `https://${env.WORKER_DOMAIN}`;
  const payload: Record<string, any> = { url: webhookUrl };
  if (env.WEBHOOK_SECRET) {
    payload.secret_token = env.WEBHOOK_SECRET;
  }
  const res = await call('setWebhook', payload, env);
  await setBotCommands(env);
  return new Response(JSON.stringify(await res.json()), {
    headers: { 'Content-Type': 'application/json' }
  });
}