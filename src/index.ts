import type { Env } from './types/env.d.ts';
import { handleTelegramUpdate } from './handlers/message.ts';
import { setWebhook } from './telegram.ts';
import { initDB, cleanupOldData, getAnalytics, getActiveUsersLastDay, getRateLimitStats } from './services/index.ts';
import { runImageGeneration } from './ai.ts';
import { sendDailyTipsToAll } from './handlers/daily.ts';
import { processDueReminders } from './handlers/reminder.ts';
import { logger, resetRequestId } from './utils/logger.ts';
import { registry } from './plugins/registry.ts';
import { examplePlugin } from './plugins/builtins/example.ts';
import { initModes } from './modes/registry.ts';
import { createCache } from './utils/cache.ts';
import { initTools } from './tools/index.ts';
import { initCache } from './repositories/cache.ts';

let dbInitialized = false;
let pluginsInitialized = false;
let envValidated = false;
const workerStartTime = Date.now();
const processedUpdates = createCache('processed_updates', { ttl: 60000, maxSize: 200 });

registry.register(examplePlugin);
initModes();
initTools();

function validateWebhookPayload(body: any): boolean {
  if (!body || typeof body !== 'object') return false;
  if (body.callback_query) return true;
  if (body.inline_query) return true;
  if (!body.message) return false;
  if (!body.message.chat?.id) return false;
  return true;
}

const REQUIRED_ENV_VARS = ['TELEGRAM_BOT_TOKEN', 'WORKER_DOMAIN', 'AI'] as const;

function validateEnv(env: Env): string | null {
  for (const key of REQUIRED_ENV_VARS) {
    if (!env[key]) return `Missing required env var: ${key}`;
  }
  return null;
}

function buildErrorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}

function isAdmin(request: Request, env: Env): boolean {
  const token = request.headers.get('X-Admin-Token');
  return !!env.WEBHOOK_SECRET && token === env.WEBHOOK_SECRET;
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    resetRequestId();
    const cron = controller.cron;
    logger.info('Cron triggered', { cron });

    ctx.waitUntil((async () => {
      try {
        await initDB(env).catch(() => {});
        if (!pluginsInitialized) { await registry.initAll(env); pluginsInitialized = true; }
        await registry.dispatchOnScheduled(env, cron);
        const remindersSent = await processDueReminders(env);
        if (remindersSent > 0) {
          logger.info('Reminders delivered via cron', { cron, count: remindersSent });
        }
      } catch (e: any) {
        logger.error('Cron processDueReminders failed', { cron, error: e.message });
      }
    })());

    if (cron === '0 7 * * *') {
      ctx.waitUntil(sendDailyTipsToAll(env));
    }
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    resetRequestId();
    const url = new URL(request.url);
    const startTime = Date.now();

    if (!envValidated) {
      const err = validateEnv(env);
      if (err) {
        logger.error('Env validation failed', { error: err });
        return buildErrorResponse(err, 500);
      }
      envValidated = true;
    }

    initCache(env);

    if (url.pathname === '/setWebhook') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      return await setWebhook(env);
    }

    if (url.pathname === '/init') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      await initDB(env);
      dbInitialized = true;
      if (!pluginsInitialized) { await registry.initAll(env); pluginsInitialized = true; }
      return new Response('DB initialized!', { status: 200 });
    }

    if (url.pathname === '/test-image-raw') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      const prompt = url.searchParams.get('prompt') || 'a cute cat';
      try {
        const image = await runImageGeneration(env, prompt);
        return new Response(image, {
          headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache' }
        });
      } catch (e: any) {
        return buildErrorResponse(e.message, 500);
      }
    }

    if (url.pathname === '/test-image') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      const prompt = url.searchParams.get('prompt') || 'a cute cat';
      try {
        const image = await runImageGeneration(env, prompt);
        const info = {
          type: typeof image,
          isUint8Array: image instanceof Uint8Array,
          isArray: Array.isArray(image),
          isArrayBuffer: image instanceof ArrayBuffer,
          length: image?.length || image?.byteLength || 'unknown',
          constructor: image?.constructor?.name || 'unknown'
        };
        return new Response(JSON.stringify(info, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e: any) {
        return buildErrorResponse(e.message, 500);
      }
    }

    if (url.pathname === '/health') {
      const info = {
        status: 'ok',
        version: '2.2.0',
        uptime: Math.floor((Date.now() - workerStartTime) / 1000),
        dbInitialized,
        features: [
          '68+ personas', 'custom persona creator', 'web search',
          'image generation', 'file reading', 'web browsing',
          'voice messages', 'group chat', 'multiple sessions',
          'chat export', 'rate limiting', 'admin panel',
          'analytics', 'feedback buttons',
          '5 languages (EN/FA/AR/TR/RU)', '4 AI models',
          'advanced rate limiting', 'D1 caching', 'structured logging',
          'auto migrations', 'inline mode (@bot query)',
          'text-to-speech (/tts)', 'streaming AI responses'
        ],
        timestamp: new Date().toISOString()
      };
      return new Response(JSON.stringify(info, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/daily-cron') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      ctx.waitUntil(sendDailyTipsToAll(env));
      ctx.waitUntil(processDueReminders(env));
      return new Response(JSON.stringify({ status: 'ok', message: 'Daily tips + reminders triggered' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/reminder-cron') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      ctx.waitUntil(processDueReminders(env));
      return new Response(JSON.stringify({ status: 'ok', message: 'Reminders processed' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/cleanup') {
      if (env.WEBHOOK_SECRET && !isAdmin(request, env)) return buildErrorResponse('Unauthorized', 403);
      try {
        const daysOld = parseInt(url.searchParams.get('days') || '30', 10);
        const deleted = await cleanupOldData(env, daysOld);
        const analytics = await getAnalytics(env);
        const active = await getActiveUsersLastDay(env);
        const violators = await getRateLimitStats(env);
        return new Response(JSON.stringify({
          status: 'ok',
          cleaned: { recordsDeleted: deleted, daysOld },
          analytics: {
            totalMessages: analytics.total_messages || 0,
            totalUsers: analytics.total_users || 0,
            totalImages: analytics.total_images || 0,
            totalSearches: analytics.total_searches || 0,
            active24h: active,
          },
          rateLimitViolators: violators.length,
          timestamp: new Date().toISOString()
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e: any) {
        logger.error('Cleanup endpoint error', { error: e.message });
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/debug-ai') {
      const results: any = {};
      results.aiBindingExists = typeof env.AI !== 'undefined';
      results.aiType = typeof env.AI;
      results.aiConstructor = env.AI?.constructor?.name || 'N/A';
      if (env.AI) {
        const { MODELS } = await import('./ai.ts');
        const fastModel = MODELS.fast?.id || '@cf/meta/llama-3.2-3b-instruct';
        results.fastModelId = fastModel;
        try {
          const res = await env.AI.run(fastModel, {
            messages: [{ role: 'user', content: 'Translate hello to Persian. Return only the translated word.' }],
            max_tokens: 50,
          });
          results.nonStreamingType = typeof res;
          results.nonStreamingKeys = res ? Object.keys(res) : [];
          results.nonStreamingSample = JSON.stringify(res).slice(0, 300);
          const text = (res as any)?.response || (res as any)?.result?.response || '(none)';
          results.nonStreamingText = text;
        } catch (e: any) {
          results.nonStreamingError = e.message;
        }
        try {
          const streamRes = await env.AI.run(fastModel, {
            stream: true, messages: [{ role: 'user', content: 'Say hi in one word.' }], max_tokens: 10,
          });
          results.streamType = typeof streamRes;
          results.streamConstructor = streamRes?.constructor?.name;
          results.isReadableStream = streamRes instanceof ReadableStream;
          if (streamRes instanceof ReadableStream) {
            const reader = streamRes.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
            }
            const lines = buf.split('\n').filter(l => l.startsWith('data: '));
            const parsed: string[] = [];
            for (const line of lines) {
              try {
                const d = JSON.parse(line.slice(6));
                const t = d?.response || d?.choices?.[0]?.delta?.content || '';
                if (t) parsed.push(t);
              } catch { }
            }
            results.streamParsedText = parsed.join('');
          }
        } catch (e2: any) {
          results.streamError = e2.message;
        }
      }
      return new Response(JSON.stringify(results, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST') {
      if (env.WEBHOOK_SECRET && request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
        logger.warn('Unauthorized webhook attempt', { ip: request.headers.get('CF-Connecting-IP') });
        return new Response('Unauthorized', { status: 403 });
      }
      try {
        if (!dbInitialized) {
          ctx.waitUntil(initDB(env).then(() => { dbInitialized = true; }));
        }
        if (!pluginsInitialized) {
          ctx.waitUntil(registry.initAll(env).then(() => { pluginsInitialized = true; }));
        }
        const update: any = await request.json();
        if (!validateWebhookPayload(update)) {
          logger.warn('Invalid webhook payload', { hasMessage: !!update?.message, hasCallback: !!update?.callback_query, hasInlineQuery: !!update?.inline_query });
          return new Response('OK');
        }
        // Deduplication: skip if this update_id was already processed within 60s
        if (update.update_id) {
          const key = String(update.update_id);
          if (await processedUpdates.get(key)) {
            logger.info('Duplicate update skipped', { update_id: update.update_id });
            return new Response('OK');
          }
          await processedUpdates.set(key, true);
        }
        ctx.waitUntil(
          handleTelegramUpdate(update, env).catch(err => logger.error('Background Error', { error: err.message }))
        );
        return new Response('OK');
      } catch (error: any) {
        logger.error('Error handling update', { error: error.message });
        return new Response('OK');
      } finally {
        const duration = Date.now() - startTime;
        if (duration > 5000) logger.warn('Slow request', { duration, method: request.method, path: url.pathname });
      }
    }

    return new Response('AI Telegram Bot is running! 🚀', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
