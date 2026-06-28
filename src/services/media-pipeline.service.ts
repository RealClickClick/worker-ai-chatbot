import type { Env, TelegramMessage } from '../types/env.d.ts';
import { t } from '../locales.ts';
import { sendMessage, sendChatAction, downloadFile } from '../telegram.ts';
import { downloadImageBytes, readFileContent, readPdfContent } from '../utils/file.ts';
import { runVision, transcribeAudio, runImageGeneration, runTTS } from '../ai.ts';
import { sendPhoto, sendVoice } from '../telegram.ts';
import { saveMediaMetadata, getRecentMedia, clearMediaMetadata } from '../repositories/media.repo.ts';
import { logger } from '../utils/logger.ts';
import { MAX_FILE_SIZE_MB, MAX_PHOTO_SIZE_MB, MAX_WEB_CONTENT } from '../constants.ts';

export interface MediaPipelineResult {
  userMessage: string;
  contextAdditions: string;
  mediaType: string;
  description: string;
}

const URL_REGEX = /https?:\/\/[^\s)}\]"'>]+/g;

function detectMediaType(message: TelegramMessage): string | null {
  if (message.photo) return 'photo';
  if (message.document) return 'document';
  if (message.voice) return 'voice';
  if (message.sticker) return 'sticker';
  if (message.video_note) return 'video_note';
  if (message.location) return 'location';
  if (message.contact) return 'contact';
  return null;
}

function buildMediaSummary(mediaType: string, detail: string): string {
  const ICONS: Record<string, string> = {
    photo: '🖼️', document: '📄', voice: '🎙️',
    sticker: '🃏', video_note: '🎥', location: '📍', contact: '👤',
  };
  return `${ICONS[mediaType] || '📎'} [${mediaType.toUpperCase()}] ${detail}`;
}

async function processPhoto(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<MediaPipelineResult> {
  const largest = message.photo![message.photo!.length - 1];
  if (largest.file_size && largest.file_size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large');
  }
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'processing_image'), env);
  const imgBytes = await downloadImageBytes(largest.file_id, env);
  const desc = await runVision(env, 'Describe this image in high detail, including objects, people, text, colors, and setting.', imgBytes);
  return {
    userMessage: message.caption || t(lang, 'describe_image'),
    contextAdditions: `\n[Image Analysis: ${desc}]`,
    mediaType: 'photo',
    description: desc.slice(0, 500),
  };
}

async function processDocument(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<MediaPipelineResult> {
  if (message.document!.file_size && message.document!.file_size! > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large');
  }
  const mime = message.document!.mime_type || '';
  if (mime.startsWith('image/')) {
    await sendChatAction(chatId, env, 'typing');
    await sendMessage(chatId, t(lang, 'processing_image'), env);
    const imgBytes = await downloadImageBytes(message.document!.file_id, env);
    const desc = await runVision(env, 'Describe this image in high detail.', imgBytes);
    return {
      userMessage: message.caption || t(lang, 'analyze_file'),
      contextAdditions: `\n[Image Analysis: ${desc}]`,
      mediaType: 'document',
      description: `Image document: ${desc.slice(0, 500)}`,
    };
  }
  if (mime === 'application/pdf') {
    await sendChatAction(chatId, env, 'typing');
    await sendMessage(chatId, t(lang, 'processing_file'), env);
    const content = await readPdfContent(message.document!.file_id, env);
    const truncated = content.slice(0, MAX_WEB_CONTENT);
    return {
      userMessage: message.caption || t(lang, 'analyze_file'),
      contextAdditions: `\n[PDF Content:\n${truncated}\n]`,
      mediaType: 'document',
      description: `PDF document (${content.length} chars): ${truncated.slice(0, 200)}`,
    };
  }
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'processing_file'), env);
  const content = await readFileContent(message.document!.file_id, env);
  const truncated = content.slice(0, MAX_WEB_CONTENT);
  return {
    userMessage: message.caption || t(lang, 'analyze_file'),
    contextAdditions: `\n[File Content:\n${truncated}\n]`,
    mediaType: 'document',
    description: `Document (${content.length} chars)`,
  };
}

async function processVoice(chatId: number | string, message: TelegramMessage, env: Env, lang: string): Promise<MediaPipelineResult> {
  if (message.voice!.file_size && message.voice!.file_size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error('File too large');
  }
  await sendChatAction(chatId, env, 'typing');
  const dur = message.voice!.duration;
  await sendMessage(chatId, t(lang, 'voice_received', { duration: String(dur) }), env);
  const audioBytes = await downloadFile(message.voice!.file_id, env);
  const transcript = await transcribeAudio(env, audioBytes);
  if (transcript) {
    return {
      userMessage: transcript,
      contextAdditions: `\n[Voice Message (${dur}s): "${transcript.slice(0, 300)}"]`,
      mediaType: 'voice',
      description: `Voice (${dur}s): ${transcript.slice(0, 200)}`,
    };
  }
  return {
    userMessage: t(lang, 'voice_note', { duration: String(dur) }),
    contextAdditions: `\n[Voice: ${dur}s — could not transcribe]`,
    mediaType: 'voice',
    description: `Voice (${dur}s)`,
  };
}

function processSticker(chatId: number | string, message: TelegramMessage, env: Env, lang: string): MediaPipelineResult {
  const sticker = message.sticker!;
  const emoji = sticker.emoji || '';
  const setName = sticker.set_name || '';
  const desc = `Sticker: ${emoji}${setName ? ` from ${setName}` : ''}`;
  return {
    userMessage: desc,
    contextAdditions: `\n[${desc}]`,
    mediaType: 'sticker',
    description: desc,
  };
}

function processVideoNote(chatId: number | string, message: TelegramMessage, lang: string): MediaPipelineResult {
  const dur = message.video_note!.duration;
  return {
    userMessage: t(lang, 'video_note_received', { duration: String(dur) }),
    contextAdditions: `\n[Video Note: ${dur}s]`,
    mediaType: 'video_note',
    description: `Video note (${dur}s)`,
  };
}

function processLocation(chatId: number | string, message: TelegramMessage, lang: string): MediaPipelineResult {
  const loc = message.location!;
  const mapsUrl = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
  return {
    userMessage: t(lang, 'location_received'),
    contextAdditions: `\n[Location: ${loc.latitude}, ${loc.longitude} (${mapsUrl})]`,
    mediaType: 'location',
    description: `Location: ${loc.latitude}, ${loc.longitude}`,
  };
}

function processContact(chatId: number | string, message: TelegramMessage, lang: string): MediaPipelineResult {
  const c = message.contact!;
  const name = `${c.first_name}${c.last_name ? ' ' + c.last_name : ''}`;
  return {
    userMessage: t(lang, 'contact_received', { name }),
    contextAdditions: `\n[Contact: ${name} — ${c.phone_number}]`,
    mediaType: 'contact',
    description: `Contact: ${name}`,
  };
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

export async function processMedia(
  chatId: number | string,
  message: TelegramMessage,
  env: Env,
  lang: string,
  sessionId: string,
): Promise<MediaPipelineResult | null> {
  const mediaType = detectMediaType(message);
  if (!mediaType) return null;

  let result: MediaPipelineResult;

  try {
    switch (mediaType) {
      case 'photo':
        result = await processPhoto(chatId, message, env, lang);
        break;
      case 'document':
        result = await processDocument(chatId, message, env, lang);
        break;
      case 'voice':
        result = await processVoice(chatId, message, env, lang);
        break;
      case 'sticker':
        result = processSticker(chatId, message, env, lang);
        break;
      case 'video_note':
        result = processVideoNote(chatId, message, lang);
        break;
      case 'location':
        result = processLocation(chatId, message, lang);
        break;
      case 'contact':
        result = processContact(chatId, message, lang);
        break;
      default:
        return null;
    }
  } catch (e: any) {
    logger.error('Media pipeline processing error', { chatId, mediaType, error: e.message });
    throw e;
  }

  // Store metadata in DB for cross-modal context
  await saveMediaMetadata(env, {
    chat_id: String(chatId),
    session_id: sessionId,
    media_type: mediaType as any,
    file_id: message.photo?.[0]?.file_id || message.document?.file_id || message.voice?.file_id || null,
    description: result.description,
    caption: message.caption || '',
    mime_type: message.document?.mime_type || message.voice?.mime_type || null,
    file_size: message.photo?.[0]?.file_size || message.document?.file_size || message.voice?.file_size || null,
  }).catch(() => {});

  return result;
}

export async function processUrlsInMessage(
  userMessage: string,
  chatId: number | string,
  env: Env,
  lang: string,
  contextAdditions: string,
): Promise<string> {
  const urls = userMessage.match(URL_REGEX);
  if (!urls?.length) return contextAdditions;
  await sendChatAction(chatId, env, 'typing');
  await sendMessage(chatId, t(lang, 'processing_website'), env);
  try {
    const content = await fetchWebsite(urls[0]);
    return contextAdditions + `\n[Web Content:\n${content}\n]`;
  } catch (e: any) {
    logger.warn('Website fetch failed', { url: urls[0], error: e.message });
    await sendMessage(chatId, t(lang, 'website_error'), env);
    return contextAdditions;
  }
}

export async function buildMultiModalContext(
  env: Env,
  chatId: number | string,
  sessionId: string,
  lang: string,
): Promise<string> {
  try {
    const recentMedia = await getRecentMedia(env, chatId, sessionId, 5);
    if (!recentMedia.length) return '';

    const lines: string[] = ['[Multi-modal Context: Recent media you have processed for this user]'];
    const typeIcons: Record<string, string> = {
      photo: '🖼️', document: '📄', voice: '🎙️',
      sticker: '🃏', video_note: '🎥', location: '📍', contact: '👤',
    };

    for (const media of recentMedia) {
      const icon = typeIcons[media.media_type] || '📎';
      const time = media.created_at ? new Date(media.created_at + 'Z').toLocaleString() : '';
      lines.push(`  ${icon} [${media.media_type}] ${time ? `(${time})` : ''}`);
      if (media.description) {
        const truncated = media.description.length > 200
          ? media.description.slice(0, 200) + '...'
          : media.description;
        lines.push(`    ${truncated}`);
      }
    }
    lines.push('[/Multi-modal Context]');

    return '\n\n' + lines.join('\n');
  } catch (e: any) {
    logger.warn('buildMultiModalContext error', { chatId, error: e.message });
    return '';
  }
}

export async function clearMultiModal(env: Env, chatId: number | string, sessionId?: string): Promise<void> {
  await clearMediaMetadata(env, chatId, sessionId);
}

const GENERATE_IMAGE_RE = /\[GENERATE_IMAGE:\s*([^\]]+)\]\s*/gi;
const GENERATE_SPEECH_RE = /\[GENERATE_SPEECH:\s*([^\]]+)\]\s*/gi;

export interface MultiModalOutput {
  text: string;
  images: string[];
  speeches: string[];
}

export function parseMultiModalOutput(text: string): MultiModalOutput {
  const images: string[] = [];
  const speeches: string[] = [];

  let cleanText = text.replace(GENERATE_IMAGE_RE, (_, prompt) => {
    images.push(prompt.trim());
    return '';
  }).replace(GENERATE_SPEECH_RE, (_, speechText) => {
    speeches.push(speechText.trim());
    return '';
  }).trim();

  return { text: cleanText, images, speeches };
}

export async function handleMultiModalOutput(
  env: Env, chatId: number | string, text: string, lang: string,
): Promise<string> {
  const { text: cleanText, images, speeches } = parseMultiModalOutput(text);

  for (const prompt of images) {
    try {
      const result = await runImageGeneration(env, prompt, 'sdxl');
      if (result instanceof Uint8Array) {
        const blob = new Blob([result], { type: 'image/png' });
        await sendMessage(chatId, t(lang, 'image_generating', { prompt: prompt.slice(0, 100) }), env, 'Markdown');
        await sendPhoto(chatId, blob, prompt.slice(0, 200), env);
      } else if (result?.image) {
        const blob = new Blob([Uint8Array.from(atob(result.image), c => c.charCodeAt(0))], { type: 'image/png' });
        await sendMessage(chatId, t(lang, 'image_generating', { prompt: prompt.slice(0, 100) }), env, 'Markdown');
        await sendPhoto(chatId, blob, prompt.slice(0, 200), env);
      }
    } catch (e: any) {
      logger.error('Multi-modal image generation failed', { prompt, error: e.message });
      await sendMessage(chatId, t(lang, 'image_error'), env);
    }
  }

  for (const speechText of speeches) {
    try {
      const audioBytes = await runTTS(env, speechText);
      if (audioBytes) {
        await sendVoice(chatId, audioBytes, env, speechText.slice(0, 100));
      }
    } catch (e: any) {
      logger.error('Multi-modal speech generation failed', { error: e.message });
      await sendMessage(chatId, t(lang, 'voice_error'), env);
    }
  }

  return cleanText;
}

