import type { Env, GroupMessage, TelegramMessage } from './types/env.d.ts';
import { addGroupMessage, getUserWindow, getMessageByMessageId, getAmbientContext } from './services/index.ts';
import { MAX_REPLY_DEPTH, GROUP_MSG_TRUNCATE, GROUP_USER_WINDOW_SIZE, GROUP_AMBIENT_SIZE } from './constants.ts';

function generateThreadId(): string {
  return `thr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

function formatUserName(userName: string, userId: string): string {
  return userName ? `@${userName}` : `User(${userId})`;
}

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^\w]+/).filter(Boolean));
}

function relevanceScore(text: string, queryTokens: Set<string>): number {
  const tokens = tokenize(text);
  let score = 0;
  for (const t of tokens) {
    if (queryTokens.has(t)) score++;
  }
  return score;
}

const POSITIVE_WORDS = new Set([
  'good', 'great', 'awesome', 'thanks', 'perfect', 'love', 'nice', 'excellent',
  'خوب', 'عالی', 'ممنون', 'دقیقا', 'آره', 'perfect', 'best', 'amazing',
  'جيد', 'رائع', 'شكرا', 'ممتاز', 'حلو', 'مثالي',
  'harika', 'güzel', 'teşekkürler', 'mükemmel', 'süper',
  'хорошо', 'отлично', 'спасибо', 'прекрасно', 'супер',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'wrong', 'error', 'bug', 'broken', 'terrible', 'hate', 'awful',
  'بد', 'غلط', 'اشتباه', 'خراب', 'معیوب', 'نقص',
  'سيء', 'خطأ', 'مكسور', 'فظيع', 'مشكلة',
  'kötü', 'yanlış', 'hata', 'bozuk', 'berbat',
  'плохо', 'ошибка', 'сломано', 'ужасно', 'проблема',
]);

function detectSentiment(messages: GroupMessage[]): string {
  let pos = 0;
  let neg = 0;
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const tokens = msg.content.toLowerCase().split(/[^\w]+/);
    for (const t of tokens) {
      if (POSITIVE_WORDS.has(t)) pos++;
      if (NEGATIVE_WORDS.has(t)) neg++;
    }
  }
  if (pos > neg * 2) return 'positive';
  if (neg > pos * 2) return 'negative';
  if (pos > 0 || neg > 0) return 'mixed';
  return 'neutral';
}

function prioritizeMessages(messages: GroupMessage[], query: string, maxCount: number): GroupMessage[] {
  if (!query) return messages.slice(-maxCount);
  const queryTokens = tokenize(query);
  const scored = messages.map(msg => ({ msg, score: relevanceScore(msg.content, queryTokens) }));
  scored.sort((a, b) => b.score - a.score || messages.indexOf(a.msg) - messages.indexOf(b.msg));
  return scored.slice(0, maxCount).sort((a, b) => messages.indexOf(a.msg) - messages.indexOf(b.msg)).map(s => s.msg);
}

export interface ReplyChainEntry {
  userId: string;
  userName: string;
  content: string;
  role: 'user' | 'assistant';
  depth: number;
}

export async function resolveReplyChain(env: Env, chatId: number | string, messageId: number, maxDepth = MAX_REPLY_DEPTH): Promise<ReplyChainEntry[]> {
  const chain: ReplyChainEntry[] = [];
  let currentMsgId: number | null = messageId;
  let depth = 0;

  while (currentMsgId && depth < maxDepth) {
    const msg = await getMessageByMessageId(env, chatId, currentMsgId);
    if (!msg) break;
    chain.unshift({
      userId: msg.user_id,
      userName: msg.user_name,
      content: msg.content,
      role: msg.role,
      depth,
    });
    currentMsgId = msg.reply_to_message_id;
    depth++;
  }

  return chain;
}

export function formatReplyChain(chain: ReplyChainEntry[]): string {
  if (!chain.length) return '';

  const lines: string[] = ['[Reply Chain]'];
  for (const entry of chain) {
    const name = formatUserName(entry.userName, entry.userId);
    const prefix = entry.role === 'assistant' ? 'Bot' : name;
    const truncated = truncate(entry.content, GROUP_MSG_TRUNCATE);
    lines.push(`  ${prefix}: ${truncated}`);
  }
  return lines.join('\n');
}

export function formatUserWindow(messages: GroupMessage[]): string {
  if (!messages.length) return '';

  const lines: string[] = [`[User History (last ${Math.min(messages.length, GROUP_USER_WINDOW_SIZE)} messages)]`];
  for (const msg of messages) {
    const name = formatUserName(msg.user_name, msg.user_id);
    const prefix = msg.role === 'assistant' ? 'Bot' : name;
    const truncated = truncate(msg.content, GROUP_MSG_TRUNCATE);
    lines.push(`  ${prefix}: ${truncated}`);
  }
  return lines.join('\n');
}

export function formatAmbientContext(messages: GroupMessage[]): string {
  if (!messages.length) return '';

  const lines: string[] = ['[Recent Group Activity]'];
  for (const msg of messages) {
    const name = formatUserName(msg.user_name, msg.user_id);
    const prefix = msg.role === 'assistant' ? 'Bot' : name;
    const truncated = truncate(msg.content, GROUP_MSG_TRUNCATE / 2);
    lines.push(`  ${prefix}: ${truncated}`);
  }
  return lines.join('\n');
}

export async function buildGroupContext(
  env: Env,
  chatId: number | string,
  userId: number | string,
  message: TelegramMessage,
): Promise<string> {
  const parts: string[] = [];

  const replyToMsgId = message.reply_to_message?.message_id;
  const replyChain = replyToMsgId
    ? await resolveReplyChain(env, chatId, replyToMsgId)
    : [];

  if (replyChain.length > 0) {
    parts.push(formatReplyChain(replyChain));
  }

  const userMessages = await getUserWindow(env, chatId, userId);
  if (userMessages.length > 0) {
    const userText = message.text || message.caption || '';
    const prioritized = prioritizeMessages(userMessages, userText, 30);
    parts.push(formatUserWindow(prioritized));
  }

  const ambient = await getAmbientContext(env, chatId, GROUP_AMBIENT_SIZE);
  if (ambient.length > 0) {
    const sentiment = detectSentiment(ambient);
    if (sentiment !== 'neutral') {
      parts.push(`[Group Mood: ${sentiment}]`);
    }
    parts.push(formatAmbientContext(ambient));
  }

  return parts.join('\n\n');
}

export async function storeGroupMessageAndGetInfo(
  env: Env,
  chatId: number | string,
  message: TelegramMessage,
  role: 'user' | 'assistant',
  content: string,
): Promise<string | null> {
  if (!message.from) return null;

  const userId = message.from.id;
  const userName = message.from.username || message.from.first_name || '';
  const messageId = message.message_id;
  const replyTo = message.reply_to_message;

  let replyToMessageId: number | null = null;
  let replyToUserId: string | null = null;
  let replyToContent: string | null = null;
  let threadId: string | null = null;

  if (replyTo && replyTo.from) {
    replyToMessageId = replyTo.message_id;
    replyToUserId = String(replyTo.from.id);
    replyToContent = replyTo.text || replyTo.caption || '';

    const parentMsg = await getMessageByMessageId(env, chatId, replyToMessageId);
    if (parentMsg?.thread_id) {
      threadId = parentMsg.thread_id;
    } else {
      threadId = generateThreadId();
    }
  }

  await addGroupMessage(
    env,
    chatId,
    userId,
    messageId,
    role,
    content,
    userName,
    replyToMessageId,
    replyToUserId,
    replyToContent,
    threadId,
  );

  return threadId;
}

export async function storeBotGroupMessage(
  env: Env,
  chatId: number | string,
  userId: number | string,
  userName: string,
  content: string,
  replyToMessageId: number | null,
  replyToUserId: string | null,
  replyToContent: string | null,
  threadId: string | null = null,
): Promise<void> {
  await addGroupMessage(
    env,
    chatId,
    String(userId),
    0,
    'assistant',
    content,
    userName,
    replyToMessageId,
    replyToUserId,
    replyToContent,
    threadId,
  );
}
