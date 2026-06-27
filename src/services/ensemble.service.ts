import type { Env } from '../types/env.d.ts';
import type { EnsembleResponse } from '../types/ai.ts';
import { runChat, getTokenLimit } from '../ai.ts';
import { logger } from '../utils/logger.ts';

const DEFAULT_ENSEMBLE_MODELS = ['fast', 'balanced', 'powerful'];

export function parseEnsembleModels(models: string | null): string[] {
  if (!models) return DEFAULT_ENSEMBLE_MODELS;
  try {
    const parsed = JSON.parse(models);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ENSEMBLE_MODELS;
  } catch {
    return DEFAULT_ENSEMBLE_MODELS;
  }
}

async function judgeBestResponse(
  env: Env,
  userMessages: any[],
  responses: EnsembleResponse[],
  judgeModelKey: string,
): Promise<string> {
  if (responses.length === 1) return responses[0].text;

  const responseBlocks = responses.map((r, i) =>
    `[Response ${i + 1} from model "${r.modelKey}"]\n${r.text}`
  ).join('\n\n---\n\n');

  const judgePrompt = `You are a response quality evaluator. Given the user's query and several AI responses, evaluate each response for accuracy, helpfulness, and quality.

User query:
${userMessages[userMessages.length - 1]?.content || userMessages[0]?.content || ''}

${responseBlocks}

Return ONLY the number of the best response (e.g., "1" or "2" or "3") as a single digit. No other text.`;

  try {
    const result = await runChat(env, [{ role: 'user', content: judgePrompt }], 256, judgeModelKey);
    const trimmed = result.trim();
    const digit = trimmed.match(/\d+/)?.[0];
    const idx = digit ? parseInt(digit, 10) - 1 : -1;
    if (idx >= 0 && idx < responses.length) {
      return responses[idx].text;
    }
  } catch (e: any) {
    logger.warn('Ensemble judge failed, falling back to first response', { error: e.message });
  }

  return responses[0].text;
}

export async function runEnsemble(
  env: Env,
  messages: any[],
  tokenLimit: number,
  modelKeys: string[],
  judgeModelKey: string,
  strategy: string = 'judge',
): Promise<string> {
  if (modelKeys.length === 0) {
    throw new Error('No ensemble models configured');
  }

  const results = await Promise.allSettled(
    modelKeys.map(async (modelKey) => {
      const perModelLimit = getTokenLimit(
        tokenLimit <= 600 ? 'short' : tokenLimit <= 1200 ? 'medium' : 'long',
        { modelKey }
      );
      const text = await runChat(env, messages, perModelLimit, modelKey);
      return { modelKey, text } as EnsembleResponse;
    }),
  );

  const successful: EnsembleResponse[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      logger.warn('Ensemble model failed', { error: result.reason?.message });
    }
  }

  if (successful.length === 0) {
    throw new Error('All ensemble models failed');
  }

  if (strategy === 'random') {
    const idx = Math.floor(Math.random() * successful.length);
    return successful[idx].text;
  }

  return judgeBestResponse(env, messages, successful, judgeModelKey);
}
