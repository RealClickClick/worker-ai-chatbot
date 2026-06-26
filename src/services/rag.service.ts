import { addDocument, searchDocuments, deleteDocuments, getDocumentCount } from '../repositories/documents.repo.ts';
import { RAG_MAX_CHUNK_SIZE, RAG_MAX_RESULTS } from '../constants.ts';
import type { Env } from '../types/env.d.ts';
import { logger } from '../utils/logger.ts';

export function chunkText(text: string, maxChunkSize: number = RAG_MAX_CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if ((current + '\n\n' + trimmed).length <= maxChunkSize) {
      current = current ? current + '\n\n' + trimmed : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxChunkSize) {
        current = trimmed;
      } else {
        const sentences = trimmed.match(/[^.!?\n]+[.!?\n]*/g) || [trimmed];
        let buf = '';
        for (const sent of sentences) {
          if ((buf + ' ' + sent).length <= maxChunkSize) {
            buf = buf ? buf + ' ' + sent : sent;
          } else {
            if (buf) chunks.push(buf);
            buf = sent.length <= maxChunkSize ? sent : sent.slice(0, maxChunkSize);
          }
        }
        if (buf) chunks.push(buf);
        current = '';
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function indexText(env: Env, chatId: number | string, text: string, source: string = 'text', title: string = ''): Promise<number> {
  const chunks = chunkText(text);
  for (const chunk of chunks) {
    await addDocument(env, chatId, chunk, source, title);
  }
  logger.info('Text indexed', { chatId, chunks: chunks.length, source, title });
  return chunks.length;
}

export async function getRagContext(env: Env, chatId: number | string, query: string, limit: number = RAG_MAX_RESULTS): Promise<string | null> {
  try {
    const docs = await searchDocuments(env, chatId, query, limit);
    if (!docs.length) return null;
    const formatted = docs.map(d => `[${d.title || 'Knowledge'}] ${d.content}`).join('\n\n');
    return `\n[Retrieved Knowledge:\n${formatted}\n]`;
  } catch (e: any) {
    logger.error('getRagContext error', { chatId, error: e.message });
    return null;
  }
}

export async function clearKnowledge(env: Env, chatId: number | string): Promise<void> {
  await deleteDocuments(env, chatId);
}

export async function getKnowledgeCount(env: Env, chatId: number | string): Promise<number> {
  return await getDocumentCount(env, chatId);
}
