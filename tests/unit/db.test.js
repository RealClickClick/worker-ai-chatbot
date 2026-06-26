import { describe, it, expect, beforeEach } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

describe('DB Module', () => {
  let env;

  beforeEach(() => {
    env = createMockEnv();
  });

  describe('getSettings', () => {
    it('returns defaults when DB is missing', async () => {
      const { getSettings } = await import('../../src/db.js');
      const s = await getSettings({}, '123');
      expect(s.persona).toBe('standard');
      expect(s.response_length).toBe('short');
      expect(s.ai_model).toBe('fast');
      expect(s.memory_enabled).toBe(1);
      expect(s.formatting).toBe('markdown');
      expect(s.feedback_enabled).toBe(1);
    });

    it('returns stored settings when they exist', async () => {
      const { getSettings, setPersona } = await import('../../src/db.js');
      await setPersona(env, '123', 'scientist');
      const s = await getSettings(env, '123');
      expect(s.persona).toBe('scientist');
    });

    it('returns defaults when no row exists', async () => {
      const { getSettings } = await import('../../src/db.js');
      const s = await getSettings(env, 'nonexistent');
      expect(s.persona).toBe('standard');
      expect(s.ai_model).toBe('fast');
    });
  });

  describe('setting functions', () => {
    it('setPersona stores and retrieves', async () => {
      const { setPersona, getSettings } = await import('../../src/db.js');
      await setPersona(env, '123', 'teacher');
      const s = await getSettings(env, '123');
      expect(s.persona).toBe('teacher');
    });

    it('setAiModel stores and retrieves', async () => {
      const { setAiModel, getSettings } = await import('../../src/db.js');
      await setAiModel(env, '123', 'powerful');
      const s = await getSettings(env, '123');
      expect(s.ai_model).toBe('powerful');
    });

    it('setLanguage stores and retrieves', async () => {
      const { setLanguage, getSettings } = await import('../../src/db.js');
      await setLanguage(env, '123', 'fa');
      const s = await getSettings(env, '123');
      expect(s.lang).toBe('fa');
    });

    it('setResponseLength stores and retrieves', async () => {
      const { setResponseLength, getSettings } = await import('../../src/db.js');
      await setResponseLength(env, '123', 'long');
      const s = await getSettings(env, '123');
      expect(s.response_length).toBe('long');
    });

    it('setCustomInstructions stores and retrieves', async () => {
      const { setCustomInstructions, getSettings } = await import('../../src/db.js');
      await setCustomInstructions(env, '123', 'Be concise');
      const s = await getSettings(env, '123');
      expect(s.custom_instructions).toBe('Be concise');
    });

    it('setActiveSession stores and retrieves', async () => {
      const { setActiveSession, getSettings } = await import('../../src/db.js');
      await setActiveSession(env, '123', 'work');
      const s = await getSettings(env, '123');
      expect(s.active_session).toBe('work');
    });

    it('setProgrammingLang stores and retrieves', async () => {
      const { setProgrammingLang, getSettings } = await import('../../src/db.js');
      await setProgrammingLang(env, '123', 'Python');
      const s = await getSettings(env, '123');
      expect(s.programming_lang).toBe('Python');
    });

    it('toggleMemory flips memory_enabled', async () => {
      const { toggleMemory, getSettings } = await import('../../src/db.js');
      await toggleMemory(env, '123');
      let s = await getSettings(env, '123');
      expect(s.memory_enabled).toBe(0);
      await toggleMemory(env, '123');
      s = await getSettings(env, '123');
      expect(s.memory_enabled).toBe(1);
    });

    it('toggleFormatting flips between markdown and plain', async () => {
      const { toggleFormatting, getSettings } = await import('../../src/db.js');
      await toggleFormatting(env, '123');
      let s = await getSettings(env, '123');
      expect(s.formatting).toBe('plain');
      await toggleFormatting(env, '123');
      s = await getSettings(env, '123');
      expect(s.formatting).toBe('markdown');
    });

    it('toggleFeedback flips feedback_enabled', async () => {
      const { toggleFeedback, getSettings } = await import('../../src/db.js');
      await toggleFeedback(env, '123');
      let s = await getSettings(env, '123');
      expect(s.feedback_enabled).toBe(0);
      await toggleFeedback(env, '123');
      s = await getSettings(env, '123');
      expect(s.feedback_enabled).toBe(1);
    });
  });

  describe('toggleResponseLength', () => {
    it('cycles through short -> medium -> long -> short', async () => {
      const { toggleResponseLength } = await import('../../src/db.js');
      expect(await toggleResponseLength(env, '123')).toBe('medium');
      expect(await toggleResponseLength(env, '123')).toBe('long');
      expect(await toggleResponseLength(env, '123')).toBe('short');
    });
  });

  describe('Sessions', () => {
    it('creates and lists sessions', async () => {
      const { createSession, getSessions } = await import('../../src/db.js');
      await createSession(env, '123', 'work', 'Work Chat');
      await createSession(env, '123', 'fun', 'Fun Chat');
      const sessions = await getSessions(env, '123');
      expect(sessions).toHaveLength(2);
      expect(sessions.some(s => s.session_id === 'work')).toBe(true);
      expect(sessions.some(s => s.session_id === 'fun')).toBe(true);
    });

    it('returns empty array when no sessions exist', async () => {
      const { getSessions } = await import('../../src/db.js');
      const sessions = await getSessions(env, '123');
      expect(sessions).toEqual([]);
    });
  });

  describe('Rate Limiting', () => {
    it('allows first request', async () => {
      const { checkRateLimit } = await import('../../src/db.js');
      const allowed = await checkRateLimit(env, '123');
      expect(allowed).toBe(true);
    });

    it('blocks after RATE_LIMIT requests within window', async () => {
      const { checkRateLimit } = await import('../../src/db.js');
      for (let i = 0; i < 5; i++) {
        expect(await checkRateLimit(env, '123')).toBe(true);
      }
      expect(await checkRateLimit(env, '123')).toBe(false);
    });
  });

  describe('Blocked Users', () => {
    it('user is not blocked by default', async () => {
      const { isBlocked } = await import('../../src/db.js');
      expect(await isBlocked(env, '123')).toBe(false);
    });

    it('blocked user is detected', async () => {
      const { blockUser, isBlocked } = await import('../../src/db.js');
      await blockUser(env, '123', 'Spam');
      expect(await isBlocked(env, '123')).toBe(true);
    });

    it('unblocked user is not blocked', async () => {
      const { blockUser, unblockUser, isBlocked } = await import('../../src/db.js');
      await blockUser(env, '123', 'Spam');
      await unblockUser(env, '123');
      expect(await isBlocked(env, '123')).toBe(false);
    });

    it('getBlockedUsers returns list', async () => {
      const { blockUser, getBlockedUsers } = await import('../../src/db.js');
      await blockUser(env, '123', 'Spam');
      await blockUser(env, '456', 'Abuse');
      const blocked = await getBlockedUsers(env);
      expect(blocked).toHaveLength(2);
    });
  });

  describe('Analytics', () => {
    it('tracks messages', async () => {
      const { trackMessage, getAnalytics } = await import('../../src/db.js');
      await trackMessage(env);
      const stats = await getAnalytics(env);
      expect(stats.total_messages).toBe(1);
    });

    it('tracks new users', async () => {
      const { trackNewUser, getAnalytics } = await import('../../src/db.js');
      await trackNewUser(env);
      const stats = await getAnalytics(env);
      expect(stats.total_users).toBe(1);
    });

    it('tracks images', async () => {
      const { trackImage, getAnalytics } = await import('../../src/db.js');
      await trackImage(env);
      const stats = await getAnalytics(env);
      expect(stats.total_images).toBe(1);
    });

    it('tracks searches', async () => {
      const { trackSearch, getAnalytics } = await import('../../src/db.js');
      await trackSearch(env);
      const stats = await getAnalytics(env);
      expect(stats.total_searches).toBe(1);
    });

    it('tracks good and bad feedback', async () => {
      const { trackFeedback, getAnalytics } = await import('../../src/db.js');
      await trackFeedback(env, 'good');
      await trackFeedback(env, 'bad');
      const stats = await getAnalytics(env);
      expect(stats.total_feedback_good).toBe(1);
      expect(stats.total_feedback_bad).toBe(1);
    });

    it('returns empty object when DB is missing', async () => {
      const { getAnalytics } = await import('../../src/db.js');
      const stats = await getAnalytics({});
      expect(stats).toEqual({});
    });
  });

  describe('Custom Personas', () => {
    it('saves and retrieves custom personas', async () => {
      const { saveCustomPersona, getCustomPersonas } = await import('../../src/db.js');
      await saveCustomPersona(env, '123', 'yoda', 'You are Yoda');
      const list = await getCustomPersonas(env, '123');
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('yoda');
      expect(list[0].description).toBe('You are Yoda');
    });

    it('deletes custom personas', async () => {
      const { saveCustomPersona, deleteCustomPersona, getCustomPersonas } = await import('../../src/db.js');
      await saveCustomPersona(env, '123', 'yoda', 'You are Yoda');
      await deleteCustomPersona(env, '123', 'yoda');
      const list = await getCustomPersonas(env, '123');
      expect(list).toHaveLength(0);
    });
  });

  describe('Admin', () => {
    it('getAllChatIds returns all users', async () => {
      const { setPersona, getAllChatIds } = await import('../../src/db.js');
      await setPersona(env, '111', 'teacher');
      await setPersona(env, '222', 'scientist');
      const ids = await getAllChatIds(env);
      expect(ids).toContain('111');
      expect(ids).toContain('222');
    });
  });

  describe('Error resilience', () => {
    it('handles null DB gracefully', async () => {
      const { getSettings, setPersona, getAnalytics, isBlocked } = await import('../../src/db.js');
      const noDb = {};
      expect(await getSettings(noDb)).toBeTruthy();
      await expect(setPersona(noDb, '123', 'test')).resolves.not.toThrow();
      expect(await getAnalytics(noDb)).toEqual({});
      expect(await isBlocked(noDb)).toBe(false);
    });
  });
});
