import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

vi.mock('../../src/menus/modeMenu.js', () => ({
  showModeMenu: vi.fn(),
  showModelMenu: vi.fn(),
  showSettingsMenu: vi.fn(),
  buildModelKeyboard: vi.fn(() => ({ inline_keyboard: [] })),
  buildImageModelKeyboard: vi.fn(() => ({ inline_keyboard: [] })),
}));

describe('Command Handler', () => {
  let env;
  let fetchSpy;
  let handleCommand;

  beforeEach(async () => {
    env = createMockEnv({ ADMIN_IDS: '123' });
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: { message_id: 1 } }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
    const mod = await import('../../src/handlers/command.js');
    handleCommand = mod.handleCommand;
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('/start', () => {
    it('sends welcome message with inline keyboard', async () => {
      await handleCommand('123', '/start', '', env, 'en', 'Ali');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Ali');
      expect(body.reply_markup.inline_keyboard).toBeDefined();
    });
  });

  describe('/help', () => {
    it('sends help message', async () => {
      await handleCommand('123', '/help', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Help');
    });
  });

  describe('/stats', () => {
    it('sends current stats', async () => {
      await handleCommand('123', '/stats', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Status');
    });
  });

  describe('/clear', () => {
    it('clears user data and sends confirmation', async () => {
      await handleCommand('123', '/clear', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('cleared');
    });
  });

  describe('/instructions', () => {
    it('saves custom instructions', async () => {
      await handleCommand('123', '/instructions', 'Be helpful', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('saved');
    });

    it('resets custom instructions', async () => {
      await handleCommand('123', '/instructions', 'reset', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('cleared');
    });

    it('shows usage when no args', async () => {
      await handleCommand('123', '/instructions', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('/instructions');
    });
  });

  describe('/admin', () => {
    it('rejects non-admin users', async () => {
      const userEnv = createMockEnv({ ADMIN_IDS: '999' });
      await handleCommand('123', '/admin', 'stats', userEnv, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('denied');
    });

    it('shows analytics for admin stats', async () => {
      await handleCommand('123', '/admin', 'stats', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Analytics');
    });

    it('shows admin panel for unknown admin command', async () => {
      await handleCommand('123', '/admin', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Admin');
    });
  });

  describe('/image', () => {
    it('requires a prompt', async () => {
      await handleCommand('123', '/image', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Write a description');
    });
  });

  describe('/search', () => {
    it('requires a query', async () => {
      await handleCommand('123', '/search', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('/search');
    });

    it('returns error when no BRAVE_API_KEY', async () => {
      await handleCommand('123', '/search', 'test', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const msgCalls = calls.filter(c => c[0].includes('sendMessage'));
      const lastBody = JSON.parse(msgCalls[msgCalls.length - 1][1].body);
      expect(lastBody.text).toContain('failed');
    });
  });

  describe('/mode', () => {
    it('calls showModeMenu', async () => {
      const { showModeMenu } = await import('../../src/menus/modeMenu.js');
      await handleCommand('123', '/mode', '', env, 'en', 'User');
      expect(showModeMenu).toHaveBeenCalledWith('123', env, 'en');
    });
  });

  describe('/model', () => {
    it('calls showModelMenu', async () => {
      const { showModelMenu } = await import('../../src/menus/modeMenu.js');
      await handleCommand('123', '/model', '', env, 'en', 'User');
      expect(showModelMenu).toHaveBeenCalledWith('123', env, 'en');
    });
  });

  describe('/lang', () => {
    it('sends language selection menu', async () => {
      await handleCommand('123', '/lang', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.reply_markup.inline_keyboard).toBeDefined();
    });
  });

  describe('/newpersona', () => {
    it('shows usage when no args', async () => {
      await handleCommand('123', '/newpersona', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Usage');
    });

    it('creates a custom persona with valid args', async () => {
      await handleCommand('123', '/newpersona', 'Yoda | You speak backwards', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Yoda');
    });

    it('shows list of custom personas', async () => {
      const { saveCustomPersona } = await import('../../src/db.js');
      await saveCustomPersona(env, '123', 'test', 'desc');
      await handleCommand('123', '/newpersona', 'list', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('test');
    });
  });

  describe('/session', () => {
    it('shows usage when no args', async () => {
      await handleCommand('123', '/session', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('Sessions');
    });

    it('creates a new session', async () => {
      await handleCommand('123', '/session', 'new work', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls.find(c => c[0].includes('sendMessage'))[1].body);
      expect(body.text).toContain('created');
    });
  });

  describe('/export', () => {
    it('returns no messages text when history is empty', async () => {
      await handleCommand('123', '/export', '', env, 'en', 'User');
      const calls = fetchSpy.mock.calls;
      const msgCalls = calls.filter(c => c[0].includes('sendMessage'));
      const lastMsg = JSON.parse(msgCalls[msgCalls.length - 1][1].body);
      expect(lastMsg.text).toContain('No messages');
    });
  });

  describe('unknown command', () => {
    it('returns null for unknown commands', async () => {
      const result = await handleCommand('123', '/unknown', '', env, 'en', 'User');
      expect(result).toBeNull();
    });
  });
});
