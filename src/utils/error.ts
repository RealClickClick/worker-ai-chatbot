import { logger } from './logger.ts';

export class AppError extends Error {
  code: string;
  status: number;
  retryable: boolean;
  silent: boolean;

  constructor(message: string, { code = 'UNKNOWN', status = 500, retryable = false, silent = false }: { code?: string; status?: number; retryable?: boolean; silent?: boolean } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.silent = silent;
  }
}

export class AIError extends AppError {
  constructor(message: string, options: { code?: string; status?: number; retryable?: boolean; silent?: boolean } = {}) {
    super(message, { code: 'AI_ERROR', retryable: true, ...options });
    this.name = 'AIError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, { code: 'VALIDATION', status: 400, retryable: false });
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, { code: 'RATE_LIMIT', status: 429, retryable: true });
    this.name = 'RateLimitError';
  }
}

export async function safe(fn: () => Promise<any>, ctx: string, fallback: any = null) {
  try {
    return await fn();
  } catch (err: any) {
    if (err instanceof AppError && err.silent) return fallback;
    logger.error(`safe: ${err.message}`, { ctx, code: err.code || err.name, error: err.message });
    return fallback;
  }
}

export async function retry(fn: () => Promise<any>, { maxRetries = 2, baseDelay = 500, ctx = '' }: { maxRetries?: number; baseDelay?: number; ctx?: string } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const canRetry = err instanceof AIError || err?.retryable;
      if (attempt < maxRetries && canRetry) {
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`retry attempt ${attempt + 1}/${maxRetries}`, { ctx, delay, error: err.message });
        await new Promise(r => setTimeout(r, delay));
      } else {
        logger.error(`retry exhausted`, { ctx, attempts: attempt + 1, error: err.message });
        throw err;
      }
    }
  }
  throw lastErr;
}

export function getUserMessage(lang: string, tFn: (lang: string, key: string) => string, error: any) {
  if (error instanceof ValidationError) return tFn(lang, 'invalid_command');
  if (error instanceof RateLimitError) return tFn(lang, 'rate_limited');
  return tFn(lang, 'server_error');
}
