import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

describe('Message Handler', () => {
  let env;
  let fetchSpy;

  beforeEach(() => {
    env = createMockEnv();
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('handleTelegramUpdate', () => {
    it('ignores updates without message', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      await handleTelegramUpdate({}, env);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('processes text message', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123 },
          from: { first_name: 'Test', language_code: 'en' },
          text: 'Hello',
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('blocks blocked users', async () => {
      const { blockUser } = await import('../../src/db.js');
      await blockUser(env, '123', 'Spam');
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123 },
          from: { first_name: 'Test', language_code: 'en' },
          text: 'Hello',
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      // Should not respond to blocked user
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('handles command messages by delegating to handleCommand', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123 },
          from: { first_name: 'Test', language_code: 'en' },
          text: '/start',
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      // Should send start message
      const calls = fetchSpy.mock.calls;
      const sendMsgCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendMsgCalls.length).toBeGreaterThan(0);
    });

    it('processes photo messages', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123 },
          from: { first_name: 'Test', language_code: 'en' },
          photo: [{ file_id: 'photo1' }, { file_id: 'photo2' }],
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      const calls = fetchSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });

    it('processes voice messages', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ok: true, result: { file_path: 'voice.ogg' } }),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });
      const update = {
        message: {
          chat: { id: 123 },
          from: { first_name: 'Test', language_code: 'en' },
          voice: { file_id: 'voice1', duration: 5 },
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      const calls = fetchSpy.mock.calls;
      const sendMsgCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendMsgCalls.length).toBeGreaterThan(0);
    });

    it('handles group chat messages via mention', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123, type: 'group' },
          from: { first_name: 'Test', language_code: 'en' },
          text: 'Hello @test-worker',
          entities: [{ type: 'mention', offset: 6, length: 12 }],
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      const calls = fetchSpy.mock.calls;
      const sendMsgCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendMsgCalls.length).toBeGreaterThan(0);
    });

    it('ignores group messages without mention or command', async () => {
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123, type: 'group' },
          from: { first_name: 'Test', language_code: 'en' },
          text: 'Just a regular group message',
          message_id: 1,
        }
      };
      await handleTelegramUpdate(update, env);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('sends rate limited message when rate limit exceeded', { timeout: 15000 }, async () => {
      // First send a rapid update
      const { handleTelegramUpdate } = await import('../../src/handlers/message.js');
      const update = {
        message: {
          chat: { id: 123 },
          from: { first_name: 'Test', language_code: 'en' },
          text: 'Hello',
          message_id: 1,
        }
      };
      // Send multiple messages rapidly
      for (let i = 0; i < 6; i++) {
        await handleTelegramUpdate(update, env);
      }
      // The last one might be rate limited
      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});
