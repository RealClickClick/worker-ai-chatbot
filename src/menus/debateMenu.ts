import { t } from '../locales.ts';
import { PERSONA_CATEGORIES, PERSONA_LABELS } from '../../config/personas.ts';
import { DEBATE_STYLES, MIN_DEBATE_ROUNDS, MAX_DEBATE_ROUNDS } from '../constants.ts';

const STYLE_KEYS: Record<string, string> = {
  debate: 'debate_style_debate',
  panel: 'debate_style_panel',
  collaboration: 'debate_style_collaboration',
  interview: 'debate_style_interview',
};

export function buildStyleKeyboard(lang: string): any {
  return {
    inline_keyboard: [
      ...DEBATE_STYLES.map(s => [{ text: t(lang, STYLE_KEYS[s]), callback_data: `debate_style_${s}` }]),
      [{ text: t(lang, 'debate_end'), callback_data: 'debate_cancel' }]
    ]
  };
}

export function buildRoundsKeyboard(lang: string): any {
  const rows: any[] = [];
  for (let n = MIN_DEBATE_ROUNDS; n <= MAX_DEBATE_ROUNDS; n += 2) {
    const row: any[] = [];
    row.push({ text: `⚪ ${n}`, callback_data: `debate_rounds_${n}` });
    if (n + 1 <= MAX_DEBATE_ROUNDS) {
      row.push({ text: `⚪ ${n + 1}`, callback_data: `debate_rounds_${n + 1}` });
    }
    rows.push(row);
  }
  rows.push([{ text: t(lang, 'debate_end'), callback_data: 'debate_cancel' }]);
  return { inline_keyboard: rows };
}

export function buildPersonaCategoryKeyboard(lang: string, step: string): any {
  const entries = Object.entries(PERSONA_CATEGORIES);
  const rows: any[] = [];
  for (const [key, val] of entries) {
    const label = (val as any)[lang] || (val as any).fa || key;
    rows.push([{ text: label, callback_data: `debate_cat_${step}_${key}` }]);
  }
  rows.push([{ text: t(lang, 'debate_end'), callback_data: 'debate_cancel' }]);
  return { inline_keyboard: rows };
}

export function buildPersonaSubKeyboard(lang: string, category: string, step: string): any {
  const catData = (PERSONA_CATEGORIES as any)[category];
  if (!catData) return null;
  const items = catData.items as string[];
  const rows: any[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const row: any[] = [];
    const labels = PERSONA_LABELS as any;
    row.push({
      text: labels[items[i]]?.[lang] || labels[items[i]]?.fa || items[i],
      callback_data: `debate_${step}_${items[i]}`
    });
    if (items[i + 1]) {
      row.push({
        text: labels[items[i + 1]]?.[lang] || labels[items[i + 1]]?.fa || items[i + 1],
        callback_data: `debate_${step}_${items[i + 1]}`
      });
    }
    rows.push(row);
  }
  rows.push([{ text: t(lang, 'debate_end'), callback_data: 'debate_cancel' }]);
  return { inline_keyboard: rows };
}

const STYLE_ROLE_MAP: Record<string, string> = {
  debate: 'Debater',
  panel: 'Panelist',
  collaboration: 'Collaborator',
  interview: 'Interviewee' as string,
};

const STYLE_ROLE_MAP_2: Record<string, string> = {
  debate: 'Debater',
  panel: 'Panelist',
  collaboration: 'Collaborator',
  interview: 'Interviewer',
};

export function getRoles(style: string): [string, string] {
  return [STYLE_ROLE_MAP[style] || 'Speaker', STYLE_ROLE_MAP_2[style] || 'Speaker'];
}

export function buildDebateContinueKeyboard(lang: string, hasMoreRounds: boolean): any {
  const rows: any[] = [];
  if (hasMoreRounds) {
    rows.push([{ text: t(lang, 'debate_next'), callback_data: 'debate_next' }]);
  }
  rows.push([{ text: t(lang, 'debate_end'), callback_data: 'debate_end' }]);
  return { inline_keyboard: rows };
}

export function buildRetryKeyboard(lang: string, personaIndex: number, round: number): any {
  return {
    inline_keyboard: [
      [{ text: '🔄 Retry', callback_data: `debate_retry_${round}_${personaIndex}` }],
      [{ text: t(lang, 'debate_end'), callback_data: 'debate_end' }],
    ],
  };
}

export function buildJudgeToggleKeyboard(lang: string): any {
  return {
    inline_keyboard: [
      [
        { text: t(lang, 'debate_judge_yes'), callback_data: 'debate_judge_yes' },
        { text: t(lang, 'debate_judge_no'), callback_data: 'debate_judge_no' },
      ],
    ],
  };
}
