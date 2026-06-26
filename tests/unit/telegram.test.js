import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

describe('Telegram Module', () => {
  let env;
  let fetchSpy;

  beforeEach(() => {
    env = createMockEnv();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  function mockFetchResponse(ok = true, data = {}) {
    fetchSpy.mockResolvedValue({
      ok,
      json: () => Promise.resolve({ ok, result: data }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
  }

  describe('sendMessage', () => {
    it('sends a text message to Telegram API', async () => {
      mockFetchResponse(true, { message_id: 1 });
      const { sendMessage } = await import('../../src/telegram.js');
      await sendMessage('123', 'Hello', env);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toContain('sendMessage');
      const body = JSON.parse(options.body);
      expect(body.chat_id).toBe('123');
      expect(body.text).toBe('Hello');
    });

    it('includes parse_mode when provided', async () => {
      mockFetchResponse(true, { message_id: 1 });
      const { sendMessage } = await import('../../src/telegram.js');
      await sendMessage('123', '**bold**', env, 'Markdown');
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.parse_mode).toBe('Markdown');
    });

    it('includes reply_markup when provided', async () => {
      mockFetchResponse(true, { message_id: 1 });
      const { sendMessage } = await import('../../src/telegram.js');
      const markup = { inline_keyboard: [[{ text: 'Click', callback_data: 'test' }]] };
      await sendMessage('123', 'Hello', env, null, markup);
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.reply_markup).toEqual(markup);
    });

    it('splits long messages into multiple chunks', async () => {
      const { sendMessage } = await import('../../src/telegram.js');
      mockFetchResponse(true, { message_id: 1 });
      const longText = 'x'.repeat(5000);
      await sendMessage('123', longText, env);
      expect(fetchSpy.mock.calls.length).toBeGreaterThan(1);
      const bodies = fetchSpy.mock.calls.map(([, o]) => JSON.parse(o.body));
      const combined = bodies.map(b => b.text.replace(/\(\d+\/\d+\) /, '')).join('');
      expect(combined).toBe(longText);
    });

    it('adds chunk headers for long messages', async () => {
      const { sendMessage } = await import('../../src/telegram.js');
      mockFetchResponse(true, { message_id: 1 });
      const longText = 'x'.repeat(5000);
      await sendMessage('123', longText, env);
      const bodies = fetchSpy.mock.calls.map(([, o]) => JSON.parse(o.body));
      expect(bodies[0].text).toMatch(/^\(1\/\d+\) /);
    });

    it('only includes replyMarkup on the last chunk', async () => {
      const { sendMessage } = await import('../../src/telegram.js');
      mockFetchResponse(true, { message_id: 1 });
      const markup = { inline_keyboard: [[{ text: 'Click', callback_data: 'test' }]] };
      const longText = 'x'.repeat(5000);
      await sendMessage('123', longText, env, null, markup);
      const bodies = fetchSpy.mock.calls.map(([, o]) => JSON.parse(o.body));
      const lastIdx = bodies.length - 1;
      bodies.forEach((b, i) => {
        if (i === lastIdx) {
          expect(b.reply_markup).toEqual(markup);
        } else {
          expect(b.reply_markup).toBeUndefined();
        }
      });
    });

    it('falls back to plain text when markdown fails', async () => {
      const { sendMessage } = await import('../../src/telegram.js');
      fetchSpy
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) });
      await sendMessage('123', '**bold**', env, 'Markdown');
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      const firstCall = JSON.parse(fetchSpy.mock.calls[0][1].body);
      const secondCall = JSON.parse(fetchSpy.mock.calls[1][1].body);
      expect(firstCall.parse_mode).toBe('Markdown');
      expect(secondCall.parse_mode).toBeUndefined();
    });
  });

  describe('editMessage', () => {
    it('edits a message with correct params', async () => {
      mockFetchResponse(true, { message_id: 1 });
      const { editMessage } = await import('../../src/telegram.js');
      await editMessage('123', 456, 'Updated', env);
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.chat_id).toBe('123');
      expect(body.message_id).toBe(456);
      expect(body.text).toBe('Updated');
    });

    it('falls back to plain text when parse fails', async () => {
      const { editMessage } = await import('../../src/telegram.js');
      fetchSpy
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: true }) });
      await editMessage('123', 456, '**bold**', env, 'Markdown');
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendChatAction', () => {
    it('sends typing action by default', async () => {
      mockFetchResponse(true);
      const { sendChatAction } = await import('../../src/telegram.js');
      await sendChatAction('123', env);
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.action).toBe('typing');
    });

    it('sends custom action when specified', async () => {
      mockFetchResponse(true);
      const { sendChatAction } = await import('../../src/telegram.js');
      await sendChatAction('123', env, 'upload_photo');
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.action).toBe('upload_photo');
    });
  });

  describe('answerCallback', () => {
    it('answers callback query', async () => {
      mockFetchResponse(true);
      const { answerCallback } = await import('../../src/telegram.js');
      await answerCallback('query-id', env);
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.callback_query_id).toBe('query-id');
    });

    it('includes text and alert flag', async () => {
      mockFetchResponse(true);
      const { answerCallback } = await import('../../src/telegram.js');
      await answerCallback('query-id', env, 'Done!', true);
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.text).toBe('Done!');
      expect(body.show_alert).toBe(true);
    });
  });

  describe('downloadFile', () => {
    it('downloads a file by file_id', async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true, result: { file_path: 'photos/file.jpg' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });
      const { downloadFile } = await import('../../src/telegram.js');
      const result = await downloadFile('file-id', env);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(8);
    });

    it('throws when file not found', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false }),
      });
      const { downloadFile } = await import('../../src/telegram.js');
      await expect(downloadFile('bad-id', env)).rejects.toThrow('File not found');
    });
  });

  describe('setWebhook', () => {
    it('sets webhook with secret token', async () => {
      const { setWebhook } = await import('../../src/telegram.js');
      const response = { ok: true, result: true };
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(response),
      });
      const result = await setWebhook(env);
      const [, options] = fetchSpy.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.url).toContain('test-worker');
      expect(body.secret_token).toBe('test-secret');
      const json = await result.json();
      expect(json.ok).toBe(true);
    });
  });
});
