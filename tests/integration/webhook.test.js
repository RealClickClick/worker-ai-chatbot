import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockEnv, resetMockStore } from '../fixtures/env.js';

describe('Webhook Flow (Integration)', () => {
  let env;
  let fetchSpy;
  let worker;
  let ctx;

  beforeEach(async () => {
    env = createMockEnv();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
      text: () => Promise.resolve('ok'),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
    ctx = { waitUntil: vi.fn((p) => p) };
    worker = (await import('../../src/index.ts')).default;
  });

  afterEach(async () => {
    fetchSpy.mockRestore();
    vi.clearAllMocks();
    await resetMockStore();
  });

  it('GET /health returns status info', async () => {
    const request = new Request('https://test-worker.workers.dev/health');
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('2.2.0');
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('GET / returns status message', async () => {
    const request = new Request('https://test-worker.workers.dev/');
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('AI Telegram Bot');
  });

  it('rejects POST with invalid webhook secret', async () => {
    const request = new Request('https://test-worker.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'wrong-secret' },
      body: JSON.stringify({ message: { chat: { id: 123 }, text: 'Hello', message_id: 1 } }),
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('accepts POST with valid webhook secret and processes asynchronously', async () => {
    const request = new Request('https://test-worker.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'test-secret' },
      body: JSON.stringify({
        message: { chat: { id: 123 }, from: { first_name: 'Test' }, text: '/start', message_id: 1 },
      }),
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('OK');
  });

  it('processes text message through full pipeline', async () => {
    const request = new Request('https://test-worker.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'test-secret' },
      body: JSON.stringify({
        message: { chat: { id: 456 }, from: { first_name: 'Ali' }, text: 'Hello!', message_id: 2 },
      }),
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    // ctx.waitUntil was called, ensure the async handler ran
    expect(ctx.waitUntil).toHaveBeenCalled();
    await vi.waitFor(() => expect(fetchSpy.mock.calls.length).toBeGreaterThan(0), { timeout: 3000 });
  });

  it('processes callback query', async () => {
    const request = new Request('https://test-worker.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'test-secret' },
      body: JSON.stringify({
        callback_query: {
          id: 'cb-1',
          data: 'regen',
          message: { chat: { id: 123 }, message_id: 5 },
        },
      }),
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
  });

  it('returns 200 for invalid webhook payload', async () => {
    const request = new Request('https://test-worker.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'test-secret' },
      body: JSON.stringify({ invalid: true }),
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('OK');
  });

  it('handles /setWebhook endpoint', async () => {
    const request = new Request('https://test-worker.workers.dev/setWebhook', {
      headers: { 'X-Admin-Token': 'test-secret' },
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  it('handles /init endpoint', async () => {
    const request = new Request('https://test-worker.workers.dev/init', {
      headers: { 'X-Admin-Token': 'test-secret' },
    });
    const response = await worker.fetch(request, env, ctx);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toBe('DB initialized!');
  });
});
