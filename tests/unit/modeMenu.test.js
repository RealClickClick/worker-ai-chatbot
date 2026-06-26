import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

describe('Mode Menu', () => {
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

  describe('showModeMenu', () => {
    it('sends mode menu with keyboard', async () => {
      const { showModeMenu } = await import('../../src/menus/modeMenu.js');
      await showModeMenu('123', env, 'en');
      const calls = fetchSpy.mock.calls;
      const sendCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(sendCalls[0][1].body);
      expect(body.reply_markup.inline_keyboard).toBeDefined();
    });

    it('edits message when messageId is provided', async () => {
      const { showModeMenu } = await import('../../src/menus/modeMenu.js');
      await showModeMenu('123', env, 'en', 456);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });

    it('includes standard persona and category buttons', async () => {
      const { showModeMenu } = await import('../../src/menus/modeMenu.js');
      await showModeMenu('123', env, 'en');
      const calls = fetchSpy.mock.calls;
      const body = JSON.parse(calls[0][1].body);
      const buttons = body.reply_markup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'set_mode_standard')).toBe(true);
    });
  });

  describe('showSubMenu', () => {
    it('shows personas for a category', async () => {
      const { showSubMenu } = await import('../../src/menus/modeMenu.js');
      await showSubMenu('123', 'business', env, 'en', 456);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });

    it('shows custom personas for custom category', async () => {
      const { saveCustomPersona } = await import('../../src/db.js');
      await saveCustomPersona(env, '123', 'Yoda', 'You speak backwards');
      const { showSubMenu } = await import('../../src/menus/modeMenu.js');
      await showSubMenu('123', 'custom', env, 'en', 456);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });
  });

  describe('showSettingsMenu', () => {
    it('sends settings menu with toggle options', async () => {
      const { showSettingsMenu } = await import('../../src/menus/modeMenu.js');
      await showSettingsMenu('123', env, 'en');
      const calls = fetchSpy.mock.calls;
      const sendCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(sendCalls[0][1].body);
      const buttons = body.reply_markup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'menu_lang')).toBe(true);
      expect(buttons.some(b => b.callback_data === 'toggle_length')).toBe(true);
      expect(buttons.some(b => b.callback_data === 'toggle_memory')).toBe(true);
    });

    it('edits message when messageId is provided', async () => {
      const { showSettingsMenu } = await import('../../src/menus/modeMenu.js');
      await showSettingsMenu('123', env, 'en', 456);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });
  });

  describe('showProfile', () => {
    it('sends profile information', async () => {
      const { showProfile } = await import('../../src/menus/modeMenu.js');
      await showProfile('123', env, 'en');
      const calls = fetchSpy.mock.calls;
      const sendCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(sendCalls[0][1].body);
      expect(body.text).toContain('Profile');
    });

    it('edits message when messageId is provided', async () => {
      const { showProfile } = await import('../../src/menus/modeMenu.js');
      await showProfile('123', env, 'en', 456);
      const calls = fetchSpy.mock.calls;
      const editCalls = calls.filter(c => c[0].includes('editMessageText'));
      expect(editCalls.length).toBeGreaterThan(0);
    });
  });

  describe('showProgLangMenu', () => {
    it('sends programming language selection menu', async () => {
      const { showProgLangMenu } = await import('../../src/menus/modeMenu.js');
      await showProgLangMenu('123', env, 'en');
      const calls = fetchSpy.mock.calls;
      const sendCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(sendCalls[0][1].body);
      const buttons = body.reply_markup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'set_prog_lang_python')).toBe(true);
    });
  });

  describe('showModelMenu', () => {
    it('sends model selection menu', async () => {
      const { showModelMenu } = await import('../../src/menus/modeMenu.js');
      await showModelMenu('123', env, 'en');
      const calls = fetchSpy.mock.calls;
      const sendCalls = calls.filter(c => c[0].includes('sendMessage'));
      expect(sendCalls.length).toBeGreaterThan(0);
      const body = JSON.parse(sendCalls[0][1].body);
      const buttons = body.reply_markup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'set_model_fast')).toBe(true);
      expect(buttons.some(b => b.callback_data === 'set_model_vision')).toBe(true);
    });
  });
});
