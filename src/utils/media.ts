import type { Env, TelegramMessage } from '../types/env.d.ts';
import { t } from '../locales.ts';
import { sendMessage, sendChatAction, downloadFile } from '../telegram.ts';
import { downloadImageBytes, readFileContent, readPdfContent } from './file.ts';
import { runVision, transcribeAudio } from '../ai.ts';
import { logger } from './logger.ts';
import { MAX_WEB_CONTENT, MAX_FILE_SIZE_MB, MAX_PHOTO_SIZE_MB } from '../constants.ts';

export const URL_REGEX = /https?:\/\/[^\s)}\]"'>]+/g;

const CODE_TERMS = [
  /\b(code|function|class|script|algorithm|program|app|source|project|api|endpoint|route|middleware|component|module|library|framework|database|query|schema)\b/i,
  /(?:برنامه|کد|تابع|کلاس|اسکریپت|الگوریتم|اپ|سورس|پروژه|ماژول|کامپوننت|دیتابیس|پایگاه)/u,
  /\b(kod|program|fonksiyon|sınıf|betik|algoritma|uygulama|modül|bileşen)\b/i,
  /(?:كود|برنامج|دالة|صنف|خوارزمية|تطبيق|سكريبت|مصدر|مشروع|وحدة)/u,
  /\b(код|функция|класс|алгоритм|скрипт|программа|приложение|модуль|компонент)\b/i,
];

const ACTION_TERMS = [
  /\b(write|create|build|make|implement|develop|fix|debug|refactor|design|add|need|want|help)\b/i,
  /(?:بنویس|بزن|بده|ساخت|نویس|میخوام|بخوام|لازم|درست|طراحی|اضافه)/u,
  /\b(yaz|oluştur|yap|düzelt|geliştir|kur|tasarla|ekle)\b/i,
  /(?:اكتب|أنشئ|صمم|طور|صحح|برمج|اعمل|صمم|أضف|احتاج)/u,
  /\b(напиши|создай|исправь|сделай|разработай|добавь|нужен|помоги)\b/i,
];

export function isCodeRequest(text: string): boolean {
  if (/```[\s\S]*```/.test(text)) return true;
  const t = text.trim();
  let score = 0;
  for (const re of CODE_TERMS) if (re.test(t)) score++;
  for (const re of ACTION_TERMS) if (re.test(t)) score++;
  return score >= 2;
}

async function fetchWebsite(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const htmlText = await res.text();
    return htmlText.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').slice(0, MAX_WEB_CONTENT);
  } finally {
    clearTimeout(timeout);
  }
}

export function isGroupChat(message: TelegramMessage): boolean {
  return message.chat.type === 'group' || message.chat.type === 'supergroup';
}

export function isBotMentioned(message: TelegramMessage, env: Env): boolean {
  const botName = env.BOT_USERNAME || env.WORKER_DOMAIN?.split('.')[0] || '';
  if (message.entities) {
    const hasMention = message.entities.some(e =>
      e.type === 'mention' &&
      message.text?.slice(e.offset, e.offset + e.length).toLowerCase() === `@${botName.toLowerCase()}`
    );
    if (hasMention) return true;
  }
  if (message.caption_entities) {
    const hasMention = message.caption_entities.some(e =>
      e.type === 'mention' &&
      message.caption?.slice(e.offset, e.offset + e.length).toLowerCase() === `@${botName.toLowerCase()}`
    );
    if (hasMention) return true;
  }
  return false;
}

export function isReplyToBot(message: TelegramMessage): boolean {
  if (!message.reply_to_message) return false;
  return !!message.reply_to_message.from?.is_bot;
}

export async function handlePhoto(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  const largest = message.photo![message.photo!.length - 1];
  if (largest.file_size && largest.file_size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large');
  }
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'processing_image'), env);
  const imgBytes = await downloadImageBytes(largest.file_id, env);
  const desc = await runVision(env, 'Describe this image in high detail.', imgBytes);
  return {
    userMessage: message.caption || t(lang, 'describe_image'),
    contextAdditions: `\n[Image: ${desc}]`
  };
}

export async function handleDocument(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  if (message.document!.file_size && message.document!.file_size! > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large');
  }
  const mime = message.document!.mime_type || '';
  if (mime.startsWith('image/')) {
    await sendChatAction(chatId, env, 'typing');
    await sendMessage(chatId, t(lang, 'processing_image'), env);
    const imgBytes = await downloadImageBytes(message.document!.file_id, env);
    const desc = await runVision(env, 'Describe this image in high detail.', imgBytes);
    return { userMessage: message.caption || t(lang, 'analyze_file'), contextAdditions: `\n[Image: ${desc}]` };
  }
  if (mime === 'application/pdf') {
    await sendChatAction(chatId, env, 'typing');
    await sendMessage(chatId, t(lang, 'processing_file'), env);
    const content = await readPdfContent(message.document!.file_id, env);
    return { userMessage: message.caption || t(lang, 'analyze_file'), contextAdditions: `\n[PDF:\n${content}\n]` };
  }
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'processing_file'), env);
  const content = await readFileContent(message.document!.file_id, env);
  return { userMessage: message.caption || t(lang, 'analyze_file'), contextAdditions: `\n[File:\n${content}\n]` };
}

export async function handleSticker(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  const sticker = message.sticker!;
  const emoji = sticker.emoji || '';
  const setName = sticker.set_name || '';
  return {
    userMessage: `[Sticker: ${emoji}]${setName ? ` from ${setName}` : ''}`,
    contextAdditions: `\n[Sticker: ${emoji}]`
  };
}

export async function handleVideoNote(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  const dur = message.video_note!.duration;
  return {
    userMessage: t(lang, 'video_note_received', { duration: String(dur) }),
    contextAdditions: `\n[Video Note: ${dur}s]`
  };
}

export async function handleLocation(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  const loc = message.location!;
  const mapsUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
  return {
    userMessage: t(lang, 'location_received'),
    contextAdditions: `\n[Location: ${loc.latitude}, ${loc.longitude} (${mapsUrl})]`
  };
}

export async function handleContact(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  const c = message.contact!;
  return {
    userMessage: t(lang, 'contact_received', { name: `${c.first_name}${c.last_name ? ' ' + c.last_name : ''}` }),
    contextAdditions: `\n[Contact: ${c.first_name}${c.last_name ? ' ' + c.last_name : ''} — ${c.phone_number}]`
  };
}

export async function handleVoice(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<{ userMessage: string; contextAdditions: string }> {
  if (message.voice!.file_size && message.voice!.file_size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large');
  }
  await sendChatAction(chatId, env, 'typing');
  const dur = message.voice!.duration;
  await sendMessage(chatId, t(lang, 'voice_received', { duration: String(dur) }), env);
  const audioBytes = await downloadFile(message.voice!.file_id, env);
  const transcript = await transcribeAudio(env, audioBytes);
  if (transcript) {
    return { userMessage: transcript, contextAdditions: `\n[Voice transcribed: ${dur}s]` };
  }
  return { userMessage: t(lang, 'voice_note', { duration: String(dur) }), contextAdditions: `\n[Voice: ${dur}s]` };
}

export async function processUrls(chatId: number | string, userMessage: string, env: Env, lang: string, contextAdditions: string): Promise<string> {
  const urls = userMessage.match(URL_REGEX);
  if (!urls?.length) return contextAdditions;
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'processing_website'), env);
  try {
    const content = await fetchWebsite(urls[0]);
    return contextAdditions + `\n[Web:\n${content}\n]`;
  } catch (e: any) {
    logger.warn('Website fetch failed', { url: urls[0], error: e.message });
    await sendMessage(chatId, t(lang, 'website_error'), env);
    return contextAdditions;
  }
}
