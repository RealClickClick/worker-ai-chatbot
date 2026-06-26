import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

vi.mock('../../src/menus/modeMenu.js', () => ({
  showModeMenu: vi.fn(),
  showModelMenu: vi.fn(),
  showSettingsMenu: vi.fn(),
  showSubMenu: vi.fn(),
  showProfile: vi.fn(),
  showProgLangMenu: vi.fn(),
  buildModelKeyboard: vi.fn(() => ({ inline_keyboard: [] })),
  buildImageModelKeyboard: vi.fn(() => ({ inline_keyboard: [] })),
}));

describe('Callback Handler', () => {
  let env;
  let fetchSpy;

  function makeCallback(data, userId = '123', userName = 'Test') {
    return {
      id: 'cq-' + Date.now(),
      from: { id: userId, first_name: userName, language_code: 'en' },
      message: {
        chat: { id: 123 },
        message_id: 456,
        text: 'Original',
      },
      data,
    };
  }

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

  describe('handleCallbackQuery', () => {
    it('handles clear_memory', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('clear_memory'), env);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('handles menu_mode', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('menu_mode'), env);
      const { showModeMenu } = await import('../../src/menus/modeMenu.js');
      expect(showModeMenu).toHaveBeenCalled();
    });

    it('handles menu_settings', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('menu_settings'), env);
      const { showSettingsMenu } = await import('../../src/menus/modeMenu.js');
      expect(showSettingsMenu).toHaveBeenCalled();
    });

    it('handles menu_lang', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('menu_lang'), env);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('handles menu_model', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('menu_model'), env);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });

    it('handles set_mode_ callback for persona selection', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('set_mode_scientist'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.persona).toBe('scientist');
    });

    it('handles set_model_ callback for model selection', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('set_model_powerful'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.ai_model).toBe('powerful');
    });

    it('handles set_lang_ callback for language selection', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('set_lang_fa'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.lang).toBe('fa');
    });

    it('handles toggle_length', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('toggle_length'), env);
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('handles feedback_good', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('feedback_good'), env);
      const calls = fetchSpy.mock.calls;
      const answerCalls = calls.filter(c => c[0].includes('answerCallbackQuery'));
      expect(answerCalls.length).toBeGreaterThan(0);
    });

    it('handles feedback_bad', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('feedback_bad'), env);
      const calls = fetchSpy.mock.calls;
      const answerCalls = calls.filter(c => c[0].includes('answerCallbackQuery'));
      expect(answerCalls.length).toBeGreaterThan(0);
    });

    it('handles cat_ callback for persona category', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('cat_business'), env);
      const { showSubMenu } = await import('../../src/menus/modeMenu.js');
      expect(showSubMenu).toHaveBeenCalled();
    });

    it('handles stats callback', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('stats'), env);
      const calls = fetchSpy.mock.calls;
      const sendMsgCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendMsgCalls.length).toBeGreaterThan(0);
    });

    it('handles profile callback', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('profile'), env);
      const { showProfile } = await import('../../src/menus/modeMenu.js');
      expect(showProfile).toHaveBeenCalled();
    });

    it('handles back_start callback', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('back_start'), env);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });

    it('handles toggle_memory', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('toggle_memory'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.memory_enabled).toBe(0);
    });

    it('handles toggle_formatting', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('toggle_formatting'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.formatting).toBe('plain');
    });

    it('handles toggle_feedback', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('toggle_feedback'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.feedback_enabled).toBe(0);
    });

    it('handles menu_prog_lang', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('menu_prog_lang'), env);
      const { showProgLangMenu } = await import('../../src/menus/modeMenu.js');
      expect(showProgLangMenu).toHaveBeenCalled();
    });

    it('handles set_prog_lang_ callback', async () => {
      const { handleCallbackQuery } = await import('../../src/handlers/callback.js');
      await handleCallbackQuery(makeCallback('set_prog_lang_python'), env);
      const { getSettings } = await import('../../src/db.js');
      const settings = await getSettings(env, '123');
      expect(settings.programming_lang).toBe('python');
    });
  });
});
