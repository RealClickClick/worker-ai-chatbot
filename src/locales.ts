import en from './locales/en.ts';
import fa from './locales/fa.ts';
import ar from './locales/ar.ts';
import tr from './locales/tr.ts';
import ru from './locales/ru.ts';

const LOCALES = { en, fa, ar, tr, ru };

// Type helper
type LocaleKeys = keyof typeof en;

const FALLBACK_LANG = 'en';
const LANG_NAMES = { en: 'English', fa: 'فارسی', ar: 'العربية', tr: 'Türkçe', ru: 'Русский' };

export function detectLangFromText(text: string): string | null {
  const faPattern = /[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06CC\u0698\u06A9\u06F0-\u06F9]/;
  const arPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const trPattern = /[ığüşöçİĞÜŞÖÇ]/;
  const ruPattern = /[а-яА-ЯёЁ]/;

  if (faPattern.test(text) && !/[a-zA-Z]/.test(text.slice(0, 3))) return 'fa';
  if (arPattern.test(text) && !/[a-zA-Z]/.test(text.slice(0, 3))) return 'ar';
  if (ruPattern.test(text) && !/[a-zA-Z]/.test(text.slice(0, 3))) return 'ru';
  if (trPattern.test(text)) return 'tr';
  return null;
}

export function getLang(user: { language_code?: string } | undefined, storedLang: string | null, messageText?: string): string {
  if (storedLang && storedLang !== 'auto') return storedLang;
  if (messageText) {
    const detected = detectLangFromText(messageText);
    if (detected) return detected;
  }
  const code = user?.language_code || '';
  if (code.startsWith('en')) return 'en';
  if (code.startsWith('fa')) return 'fa';
  if (code.startsWith('ar')) return 'ar';
  if (code.startsWith('tr')) return 'tr';
  if (code.startsWith('ru')) return 'ru';
  return FALLBACK_LANG;
}

export function getLangName(lang: string): string {
  return (LANG_NAMES as Record<string, string>)[lang] || lang;
}

export function t(lang: string, key: string, params: Record<string, string> = {}): string {
  const locale = (LOCALES as Record<string, Record<string, string>>)[lang] || (LOCALES as Record<string, Record<string, string>>)[FALLBACK_LANG];
  let text = locale[key];
  if (!text) {
    const fallback = (LOCALES as Record<string, Record<string, string>>)[FALLBACK_LANG]?.[key];
    if (fallback) text = fallback;
    else return key;
  }
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v as string);
  }
  return text;
}

const LANGUAGE_DATA: Record<string, { flag: string; names: Record<string, string> }> = {
  en: { flag: '🇺🇸', names: { en: 'English', fa: 'انگلیسی', ar: 'الإنجليزية', tr: 'İngilizce', ru: 'Английский' } },
  fa: { flag: '🇮🇷', names: { en: 'Persian', fa: 'فارسی', ar: 'الفارسية', tr: 'Farsça', ru: 'Персидский' } },
  ar: { flag: '🇸🇦', names: { en: 'Arabic', fa: 'عربی', ar: 'العربية', tr: 'Arapça', ru: 'Арабский' } },
  tr: { flag: '🇹🇷', names: { en: 'Turkish', fa: 'ترکی', ar: 'التركية', tr: 'Türkçe', ru: 'Турецкий' } },
  ru: { flag: '🇷🇺', names: { en: 'Russian', fa: 'روسی', ar: 'الروسية', tr: 'Rusça', ru: 'Русский' } },
  fr: { flag: '🇫🇷', names: { en: 'French', fa: 'فرانسوی', ar: 'الفرنسية', tr: 'Fransızca', ru: 'Французский' } },
  de: { flag: '🇩🇪', names: { en: 'German', fa: 'آلمانی', ar: 'الألمانية', tr: 'Almanca', ru: 'Немецкий' } },
  es: { flag: '🇪🇸', names: { en: 'Spanish', fa: 'اسپانیایی', ar: 'الإسبانية', tr: 'İspanyolca', ru: 'Испанский' } },
  it: { flag: '🇮🇹', names: { en: 'Italian', fa: 'ایتالیایی', ar: 'الإيطالية', tr: 'İtalyanca', ru: 'Итальянский' } },
  pt: { flag: '🇧🇷', names: { en: 'Portuguese', fa: 'پرتغالی', ar: 'البرتغالية', tr: 'Portekizce', ru: 'Португальский' } },
  zh: { flag: '🇨🇳', names: { en: 'Chinese', fa: 'چینی', ar: 'الصينية', tr: 'Çince', ru: 'Китайский' } },
  ja: { flag: '🇯🇵', names: { en: 'Japanese', fa: 'ژاپنی', ar: 'اليابانية', tr: 'Japonca', ru: 'Японский' } },
  ko: { flag: '🇰🇷', names: { en: 'Korean', fa: 'کره‌ای', ar: 'الكورية', tr: 'Korece', ru: 'Корейский' } },
  hi: { flag: '🇮🇳', names: { en: 'Hindi', fa: 'هندی', ar: 'الهندية', tr: 'Hintçe', ru: 'Хинди' } },
  ur: { flag: '🇵🇰', names: { en: 'Urdu', fa: 'اردو', ar: 'الأردية', tr: 'Urduca', ru: 'Урду' } },
  nl: { flag: '🇳🇱', names: { en: 'Dutch', fa: 'هلندی', ar: 'الهولندية', tr: 'Hollandaca', ru: 'Голландский' } },
  sv: { flag: '🇸🇪', names: { en: 'Swedish', fa: 'سوئدی', ar: 'السويدية', tr: 'İsveççe', ru: 'Шведский' } },
  pl: { flag: '🇵🇱', names: { en: 'Polish', fa: 'لهستانی', ar: 'البولندية', tr: 'Lehçe', ru: 'Польский' } },
  el: { flag: '🇬🇷', names: { en: 'Greek', fa: 'یونانی', ar: 'اليونانية', tr: 'Yunanca', ru: 'Греческий' } },
  he: { flag: '🇮🇱', names: { en: 'Hebrew', fa: 'عبری', ar: 'العبرية', tr: 'İbranice', ru: 'Иврит' } },
  th: { flag: '🇹🇭', names: { en: 'Thai', fa: 'تایلندی', ar: 'التايلاندية', tr: 'Tayca', ru: 'Тайский' } },
  vi: { flag: '🇻🇳', names: { en: 'Vietnamese', fa: 'ویتنامی', ar: 'الفيتنامية', tr: 'Vietnamca', ru: 'Вьетнамский' } },
};

export function getLanguageName(code: string, locale: string): string {
  return LANGUAGE_DATA[code]?.names[locale] || LANGUAGE_DATA[code]?.names.en || code;
}

export function getLanguageFlag(code: string): string {
  return LANGUAGE_DATA[code]?.flag || '';
}

export function getLanguageDisplay(code: string, locale: string): string {
  const lang = LANGUAGE_DATA[code];
  if (!lang) return code;
  return `${lang.flag} ${lang.names[locale] || lang.names.en}`;
}

export function matchLanguage(input: string, locale: string): { code: string; name: string; flag: string } | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const byCode = LANGUAGE_DATA[trimmed];
  if (byCode) {
    return { code: trimmed, name: byCode.names[locale] || byCode.names.en, flag: byCode.flag };
  }
  for (const [code, data] of Object.entries(LANGUAGE_DATA)) {
    const name = data.names[locale] || data.names.en;
    const nameLower = name.toLowerCase();
    const enName = data.names.en.toLowerCase();
    const nativeName = data.names[code]?.toLowerCase() || '';
    const parts = nameLower.split('/').map(s => s.trim());
    if (trimmed === enName || trimmed === nameLower || parts.includes(trimmed) || trimmed === nativeName || (trimmed.length >= 2 && (nameLower.startsWith(trimmed) || enName.startsWith(trimmed)))) {
      return { code, name: data.names[locale] || data.names.en, flag: data.flag };
    }
  }
  return null;
}

export function getLanguageList(locale: string, columns = 2): string {
  const codes = Object.keys(LANGUAGE_DATA);
  const rows: string[] = [];
  for (let i = 0; i < codes.length; i += columns) {
    const row: string[] = [];
    for (let j = 0; j < columns && i + j < codes.length; j++) {
      const code = codes[i + j];
      const data = LANGUAGE_DATA[code];
      row.push(`${data.flag} ${code} │ ${data.names[locale] || data.names.en}`);
    }
    rows.push(row.join('    '));
  }
  return '```\n' + rows.join('\n') + '\n```';
}

export function isTranslationActive(settings: Record<string, any>, userLang: string): boolean {
  return !!settings.translate_enabled;
}

export function getEffectiveSource(settings: Record<string, any>, userLang: string): string | null {
  return settings.translate_source || null;
}

export function getEffectiveTarget(settings: Record<string, any>, userLang: string): string | null {
  const source = settings.translate_source;
  const target = settings.translate_target;
  if (!target) return null;
  if (source && target === source) return null;
  return target;
}
