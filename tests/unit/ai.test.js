import { describe, it, expect } from 'vitest';
import { createMockEnv } from '../fixtures/env.js';

describe('AI Module', () => {
  describe('getModel', () => {
    it('returns correct model for each key', async () => {
      const { getModel } = await import('../../src/ai.js');
      expect(getModel('fast').id).toContain('llama-3.1-8b');
      expect(getModel('balanced').id).toContain('deepseek');
      expect(getModel('powerful').id).toContain('llama-3.3-70b');
      expect(getModel('vision').id).toContain('vision');
    });

    it('falls back to fast for unknown key', async () => {
      const { getModel } = await import('../../src/ai.js');
      const m = getModel('nonexistent');
      expect(m.id).toContain('llama-3.1-8b');
    });
  });

  describe('buildSystemPrompt', () => {
    it('includes user name in prompt', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      const prompt = buildSystemPrompt('standard', 'Ali', 'en', 'Be short.');
      expect(prompt).toContain('Ali');
    });

    it('uses the correct persona description', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      const prompt = buildSystemPrompt('teacher', 'Ali', 'en', 'Be short.');
      expect(prompt).toContain('CRITICAL RULE');
    });

    it('includes language instruction for Persian', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      const prompt = buildSystemPrompt('standard', 'Ali', 'fa', 'Be short.');
      expect(prompt).toContain('فارسی');
    });

    it('includes language instruction for each supported language', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      const langs = { en: 'English', fa: 'فارسی', ar: 'العربية', tr: 'Türkçe', ru: 'русском' };
      for (const [lang, snippet] of Object.entries(langs)) {
        const prompt = buildSystemPrompt('standard', 'User', lang, 'Be short.');
        expect(prompt).toContain(snippet);
      }
    });

    it('includes the length rule', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      const prompt = buildSystemPrompt('standard', 'User', 'en', 'VERY SHORT');
      expect(prompt).toContain('VERY SHORT');
    });

    it('includes formatting rules', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      const prompt = buildSystemPrompt('standard', 'User', 'en', 'Be short.');
      expect(prompt).toContain('**bold**');
      expect(prompt).toContain('```lang...```');
    });

    it('falls back to standard persona for unknown persona', async () => {
      const { buildSystemPrompt } = await import('../../src/ai.js');
      expect(() => buildSystemPrompt('nonexistent_persona', 'User', 'en', 'Be short.')).not.toThrow();
    });
  });

  describe('getTokenLimit', () => {
    it('returns short limit for short length', async () => {
      const { getTokenLimit } = await import('../../src/ai.js');
      expect(getTokenLimit('short')).toBe(500);
    });

    it('returns medium limit for medium length', async () => {
      const { getTokenLimit } = await import('../../src/ai.js');
      expect(getTokenLimit('medium')).toBe(1000);
    });

    it('returns long limit for long length', async () => {
      const { getTokenLimit } = await import('../../src/ai.js');
      expect(getTokenLimit('long')).toBe(2500);
    });

    it('returns default for unknown length', async () => {
      const { getTokenLimit } = await import('../../src/ai.js');
      expect(getTokenLimit('unknown')).toBe(500);
    });

    it('applies balanced model bonus', async () => {
      const { getTokenLimit } = await import('../../src/ai.js');
      expect(getTokenLimit('short', { modelKey: 'balanced' })).toBe(1300);
    });
  });

  describe('extractText', () => {
    it('returns null for null/undefined', async () => {
      const { extractText } = await import('../../src/ai.js');
      expect(extractText(null)).toBeNull();
      expect(extractText(undefined)).toBeNull();
    });

    it('returns string as-is', async () => {
      const { extractText } = await import('../../src/ai.js');
      expect(extractText('hello')).toBe('hello');
    });

    it('extracts response field', async () => {
      const { extractText } = await import('../../src/ai.js');
      expect(extractText({ response: 'world' })).toBe('world');
    });

    it('extracts from choices array', async () => {
      const { extractText } = await import('../../src/ai.js');
      const input = { choices: [{ message: { content: 'from message' } }] };
      expect(extractText(input)).toBe('from message');
    });

    it('extracts from choices with text field', async () => {
      const { extractText } = await import('../../src/ai.js');
      const input = { choices: [{ text: 'from text' }] };
      expect(extractText(input)).toBe('from text');
    });
  });

  describe('getLengthRule', () => {
    it('returns correct rule for each length in English', async () => {
      const { getLengthRule } = await import('../../src/ai.js');
      expect(getLengthRule('short', 'en')).toContain('concise');
      expect(getLengthRule('medium', 'en')).toContain('moderate');
      expect(getLengthRule('long', 'en')).toContain('comprehensive');
    });

    it('returns rule in the requested language', async () => {
      const { getLengthRule } = await import('../../src/ai.js');
      expect(getLengthRule('short', 'fa')).toContain('مختصر');
    });
  });

  describe('runChat', () => {
    it('returns AI response text', async () => {
      const { runChat } = await import('../../src/ai.js');
      const env = createMockEnv();
      const result = await runChat(env, [{ role: 'user', content: 'Hi' }], 100, 'fast');
      expect(result).toBe('This is a test AI response.');
    });

    it('accepts different model keys', async () => {
      const { runChat } = await import('../../src/ai.js');
      const env = createMockEnv();
      const result = await runChat(env, [{ role: 'user', content: 'Hi' }], 100, 'powerful');
      expect(result).toBeTruthy();
    });
  });

  describe('runVision', () => {
    it('returns vision response', async () => {
      const { runVision } = await import('../../src/ai.js');
      const env = createMockEnv();
      const result = await runVision(env, 'Describe this', new Uint8Array([1, 2, 3]));
      expect(result).toContain('sunset');
    });
  });

  describe('runImageGeneration', () => {
    it('returns image response', async () => {
      const { runImageGeneration } = await import('../../src/ai.js');
      const env = createMockEnv();
      const result = await runImageGeneration(env, 'A cat');
      expect(result).toBeTruthy();
    });
  });

  describe('transcribeAudio', () => {
    it('returns transcribed text from audio bytes', async () => {
      const { transcribeAudio } = await import('../../src/ai.js');
      const env = createMockEnv();
      const result = await transcribeAudio(env, new Uint8Array([1, 2, 3]));
      expect(result).toBe('This is a transcribed voice message.');
    });
  });

  describe('webSearch', () => {
    it('returns null when BRAVE_API_KEY is missing', async () => {
      const { webSearch } = await import('../../src/ai.js');
      const env = createMockEnv({ BRAVE_API_KEY: '' });
      const result = await webSearch(env, 'test query');
      expect(result).toBeNull();
    });
  });
});
