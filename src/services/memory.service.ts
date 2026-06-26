import { saveMemorySummary, getMemorySummaries, deleteMemorySummaries } from '../repositories/memory.repo.ts';
import { runChat } from '../ai.ts';
import { SUMMARY_TRUNCATE, SUMMARY_HISTORY_COUNT } from '../constants.ts';
import type { Env } from '../types/env.d.ts';
import { logger } from '../utils/logger.ts';
import { safe } from '../utils/error.ts';

export async function generateAndStoreSummary(env: Env, chatId: number | string, sessionId: string, messages: Array<{ role: string; content: string }>, lang: string): Promise<string | null> {
  const convText = messages.map(m =>
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, SUMMARY_TRUNCATE)}`
  ).join('\n');

  const prompt = `Summarize the following conversation concisely in ${lang}. Highlight key topics, decisions, facts, and user preferences. Keep it under 200 words. Return ONLY the summary in ${lang}, no preamble.`;
  const summary = await safe(() => runChat(env, [
    { role: 'system', content: prompt },
    { role: 'user', content: `Conversation:\n${convText}` }
  ], 500, 'fast'), 'memorySummary');

  if (summary) {
    const cleaned = summary.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    await saveMemorySummary(env, chatId, sessionId, cleaned);
    return cleaned;
  }
  return null;
}

export async function getMemoryContext(env: Env, chatId: number | string, sessionId: string): Promise<string | null> {
  try {
    const summaries = await getMemorySummaries(env, chatId, sessionId, 3);
    if (!summaries.length) return null;
    const combined = summaries.map((s, i) => `[Summary ${i + 1}]: ${s.summary}`).join('\n');
    return `\n[Conversation History Summary:\n${combined}\n]`;
  } catch (e: any) {
    logger.error('getMemoryContext error', { chatId, error: e.message });
    return null;
  }
}

export async function clearMemorySummaries(env: Env, chatId: number | string, sessionId?: string): Promise<void> {
  await deleteMemorySummaries(env, chatId, sessionId);
}

export function shouldSummarize(historyLength: number): boolean {
  return historyLength >= SUMMARY_HISTORY_COUNT + 2;
}

export function getOldMessages(messages: Array<{ role: string; content: string }>, keepCount: number): Array<{ role: string; content: string }> {
  return messages.slice(0, messages.length - keepCount);
}
