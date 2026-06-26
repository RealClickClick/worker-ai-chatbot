import type { Env } from '../types/env.d.ts';
import { MODELS } from '../ai.ts';
import { logger } from '../utils/logger.ts';

export type RequestType = 'code' | 'translate' | 'creative' | 'analysis' | 'general';

const CODE_PATTERNS = [
  /\b(function|class|const|let|var|import|export|def |lambda|async|await)\b/i,
  /```[\s\S]*```/,
  /\b(code|program|algorithm|debug|implement|refactor|syntax|compile|runtime|error)\b/i,
  /(?:کد|برنامه|نوشتن|بنویس|ساخت|دیباگ|رفع|اشکال|تابع|کلاس)/u,
  /\b(kod|program|fonksiyon|sınıf|hata|debug|yaz)\b/i,
  /(?:كود|برنامج|دالة|صنف|خوارزمية|صحح|اكتب)/u,
  /\b(код|функция|класс|алгоритм|напиши|исправь|ошибка)\b/i,
];

const TRANSLATE_PATTERNS = [
  /^(translate|ترجمه|ترجم|çevir|переведи) /i,
  /\b(translate|ترجمه|ترجمة|çeviri|перевод)\s+(to|into|به|إلى|e|için|на)\b/i,
  /\b(meaning|معنی|معنى|anlamı|значение)\b/i,
];

const CREATIVE_PATTERNS = [
  /\b(poem|شعر|قصيدة|şiir|стихотворение)\b/i,
  /\b(story|داستان|قصة|hikaye|рассказ)\b/i,
  /\b(create|write|make up|imagine|dream|fantasy)\b/i,
  /\b(creative|artistic|novel|fiction)\b/i,
];

const ANALYSIS_PATTERNS = [
  /\b(explain|تحلیل|تحليل|açıkla|объясни)\b/i,
  /\b(analyze|analyse|compare|contrast|evaluate|reason|why|how does|what if)\b/i,
  /\b(summarize|خلاصه|لخص|özetle|резюмируй)\b/i,
  /why\s+(is|are|was|were|does|do|did|can|could|would|should)/i,
];

const ROUTE_MAP: Record<RequestType, string> = {
  code: 'qwen_coder',
  translate: 'gemini_flash',
  creative: 'powerful',
  analysis: 'balanced',
  general: '', // use user's default
};

const CONFIDENCE_SCORES: Record<RequestType, number> = {
  code: 0,
  translate: 0,
  creative: 0,
  analysis: 0,
  general: 5,
};

function classify(text: string): { type: RequestType; confidence: number } {
  if (!text) return { type: 'general', confidence: 5 };

  const scores: Record<string, number> = {};

  scores.code = CODE_PATTERNS.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  scores.translate = TRANSLATE_PATTERNS.reduce((s, p) => s + (p.test(text) ? 2 : 0), 0);
  scores.creative = CREATIVE_PATTERNS.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);
  scores.analysis = ANALYSIS_PATTERNS.reduce((s, p) => s + (p.test(text) ? 1 : 0), 0);

  const entries = Object.entries(scores) as [RequestType, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const best = entries[0];
  const second = entries[1] || [null, 0];

  if (best[1] === 0) return { type: 'general', confidence: 5 };

  const margin = best[1] - second[1];
  const confidence = Math.min(best[1] * 20 + margin * 10, 95);

  return { type: best[0], confidence };
}

export function routeModel(
  userMessage: string,
  currentModelKey: string,
  availableModels: typeof MODELS,
): { modelKey: string; type: RequestType; confidence: number; routed: boolean } {
  const { type, confidence } = classify(userMessage);
  const suggested = ROUTE_MAP[type];

  if (!suggested || type === 'general' || confidence < 40) {
    return { modelKey: currentModelKey, type, confidence, routed: false };
  }

  if (!availableModels[suggested]) {
    return { modelKey: currentModelKey, type, confidence, routed: false };
  }

  if (suggested === currentModelKey) {
    return { modelKey: currentModelKey, type, confidence, routed: false };
  }

  return { modelKey: suggested, type, confidence, routed: true };
}

export async function logRouting(
  env: Env,
  chatId: number | string,
  userMessage: string,
  originalModel: string,
  routedModel: string,
  type: RequestType,
  confidence: number,
): Promise<void> {
  if (originalModel === routedModel) return;
  logger.info('Auto-route', { chatId, type, from: originalModel, to: routedModel, confidence });
}
