import { describe, it, expect } from 'vitest';

describe('Locales Module', () => {
  describe('t()', () => {
    it('returns English text for en locale', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('en', 'start_message', { user: 'Ali' });
      expect(text).toContain('Ali');
      expect(text).toContain('smart AI assistant');
    });

    it('returns Persian text for fa locale', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('fa', 'start_message', { user: 'علی' });
      expect(text).toContain('دستیار هوشمند');
    });

    it('returns Arabic text for ar locale', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('ar', 'start_message', { user: 'احمد' });
      expect(text).toContain('مساعدك الذكي');
    });

    it('returns Turkish text for tr locale', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('tr', 'start_message', { user: 'Mehmet' });
      expect(text).toContain('akıllı asistanınım');
    });

    it('returns Russian text for ru locale', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('ru', 'start_message', { user: 'Иван' });
      expect(text).toContain('умный AI-ассистент');
    });

    it('returns the key itself if translation is missing', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('en', 'nonexistent_key_xyz');
      expect(text).toBe('nonexistent_key_xyz');
    });

    it('returns voice_transcribed in each language', async () => {
      const { t } = await import('../../src/locales.js');
      expect(t('en', 'voice_transcribed', { text: 'hello' })).toContain('hello');
      expect(t('fa', 'voice_transcribed', { text: 'سلام' })).toContain('سلام');
      expect(t('ar', 'voice_transcribed', { text: 'مرحبا' })).toContain('مرحبا');
      expect(t('tr', 'voice_transcribed', { text: 'merhaba' })).toContain('merhaba');
      expect(t('ru', 'voice_transcribed', { text: 'привет' })).toContain('привет');
    });

    it('falls back to English when locale is missing', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('zz', 'start_message', { user: 'Test' });
      expect(text).toContain('smart AI assistant');
    });

    it('replaces multiple parameters', async () => {
      const { t } = await import('../../src/locales.js');
      const text = t('en', 'stats_title', {
        persona: 'Teacher',
        model: 'Fast',
        length: 'Short',
        instructions: 'None',
        session: 'default',
      });
      expect(text).toContain('Teacher');
      expect(text).toContain('Fast');
      expect(text).toContain('Short');
    });
  });

  describe('getLang()', () => {
    it('returns stored language when set', async () => {
      const { getLang } = await import('../../src/locales.js');
      expect(getLang({ language_code: 'en' }, 'fa')).toBe('fa');
    });

    it('ignores stored language when set to auto', async () => {
      const { getLang } = await import('../../src/locales.js');
      expect(getLang({ language_code: 'fa' }, 'auto')).toBe('fa');
    });

    it('detects language from user object', async () => {
      const { getLang } = await import('../../src/locales.js');
      expect(getLang({ language_code: 'en' }, null)).toBe('en');
      expect(getLang({ language_code: 'ar' }, null)).toBe('ar');
      expect(getLang({ language_code: 'tr' }, null)).toBe('tr');
      expect(getLang({ language_code: 'ru' }, null)).toBe('ru');
      expect(getLang({ language_code: 'fa' }, null)).toBe('fa');
    });

    it('falls back to English for unknown language codes', async () => {
      const { getLang } = await import('../../src/locales.js');
      expect(getLang({ language_code: 'de' }, null)).toBe('en');
    });

    it('handles missing user gracefully', async () => {
      const { getLang } = await import('../../src/locales.js');
      expect(getLang(null, null)).toBe('en');
    });
  });

  describe('getLangName()', () => {
    it('returns language name for each code', async () => {
      const { getLangName } = await import('../../src/locales.js');
      expect(getLangName('en')).toBe('English');
      expect(getLangName('fa')).toBe('فارسی');
      expect(getLangName('ar')).toBe('العربية');
      expect(getLangName('tr')).toBe('Türkçe');
      expect(getLangName('ru')).toBe('Русский');
    });

    it('returns code itself for unknown language', async () => {
      const { getLangName } = await import('../../src/locales.js');
      expect(getLangName('de')).toBe('de');
    });
  });
});
