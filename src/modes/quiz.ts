import type { Mode, ModeContext, ModeResult } from './types.ts';
import type { TelegramMessage } from '../types/env.d.ts';
import { runChat } from '../ai.ts';
import { sendMessage, editMessage } from '../telegram.ts';
import { logger } from '../utils/logger.ts';

interface QuizState {
  step: 'idle' | 'waiting_answer';
  question: string;
  answer: string;
  options: string[];
  explanation: string;
  score: number;
  total: number;
  streak: number;
  bestStreak: number;
  category: string;
}

const CATEGORIES = [
  { id: 'general', label: 'General 🧠' },
  { id: 'science', label: 'Science 🔬' },
  { id: 'history', label: 'History 📜' },
  { id: 'geography', label: 'Geography 🌍' },
  { id: 'tech', label: 'Technology 💻' },
  { id: 'random', label: 'Random 🎲' },
];

const FUN_FEEDBACK = {
  correct: ['🎉 Perfect!', '⭐ Amazing!', '👏 Great job!', '💪 You rock!', '🧠 Brain master!', '🌟 Outstanding!'],
  wrong: ['😅 Not quite!', '💪 Keep trying!', '🤔 Good effort!', '📚 You\'ll get it next time!', '🎯 So close!'],
  streak: ['🔥 On fire!', '🚀 Unstoppable!', '💫 Legendary streak!', '⚡ Lightning mode!'],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const QUESTION_PROMPT = `You are a quiz master. Generate a fun multiple-choice question.

Rules:
- Create ONE question with exactly 4 options labeled A, B, C, D
- Category: {category}
- Difficulty: mix of easy and medium
- Make it interesting and educational
- Respond ONLY in this exact JSON format, no other text:
{"question":"the question text","options":{"A":"option A","B":"option B","C":"option C","D":"option D"},"answer":"A","explanation":"why this answer is correct"}`;

const EVALUATE_PROMPT = `Evaluate this quiz answer:
Question: {question}
Options: {options}
Correct answer: {answer}
Explanation: {explanation}
User's answer: "{userAnswer}"

Respond ONLY in this JSON format:
{"correct":true,"score":1,"feedback":"fun feedback explaining why"}

If partially correct, use "score" between 0 and 1.`;

function parseJSONStrict<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch { return fallback; }
}

function defaultState(): QuizState {
  return {
    step: 'idle', question: '', answer: '', options: [], explanation: '',
    score: 0, total: 0, streak: 0, bestStreak: 0, category: 'general',
  };
}

function loadState(data: string | null): QuizState {
  if (!data) return defaultState();
  try { return { ...defaultState(), ...JSON.parse(data) }; } catch { return defaultState(); }
}

export const quizMode: Mode = {
  meta: {
    id: 'quiz',
    name: 'Quiz',
    icon: '🎯',
    description: 'Fun quiz game with categories, streaks, and scoring',
  },

  async onActivate(ctx: ModeContext): Promise<string> {
    const categoryKeyboard = {
      inline_keyboard: [
        CATEGORIES.slice(0, 3).map(c => ({ text: c.label, callback_data: `mode_quiz_cat_${c.id}` })),
        CATEGORIES.slice(3, 6).map(c => ({ text: c.label, callback_data: `mode_quiz_cat_${c.id}` })),
        [{ text: '🎲 Random Quiz', callback_data: 'mode_quiz_start_random' }],
        [{ text: '⏹️ Stop Quiz', callback_data: 'mode_quiz_quit' }],
      ],
    };
    await sendMessage(ctx.chatId,
      '🎯 *Quiz Mode Activated!*\n\nChoose a category or start a random quiz:\n\n' +
      '• Answer 10 questions to complete the round\n' +
      '• Build streaks for bonus points\n' +
      '• Compare your best streak!',
      ctx.env, 'Markdown', categoryKeyboard,
    );
    return '';
  },

  async onDeactivate(ctx: ModeContext): Promise<string> {
    const state = loadState(ctx.modeData);
    const pct = state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
    return `🎯 *Quiz Mode deactivated!*\n\n📊 Final: **${state.score}**/${state.total} (${pct}%)\n🔥 Best streak: **${state.bestStreak}**\n\nCome back anytime!`;
  },

  async handleMessage(ctx: ModeContext, text: string, _message: TelegramMessage): Promise<ModeResult> {
    const state = loadState(ctx.modeData);

    if (state.step === 'waiting_answer') {
      const userAnswer = text.trim().toUpperCase();
      const validAnswers = ['A', 'B', 'C', 'D'];
      if (!validAnswers.includes(userAnswer)) {
        return {
          consumed: true,
          response: `⚠️ Reply with *A*, *B*, *C*, or *D*.\n\n*${state.question}*\n\n${state.options.map((o, i) => `${['A', 'B', 'C', 'D'][i]}) ${o}`).join('\n')}`,
          replyMarkup: { inline_keyboard: [[{ text: '⏹️ Stop Quiz', callback_data: 'mode_quiz_quit' }]] },
        };
      }
      return evaluateAndNext(ctx, state, userAnswer);
    }

    state.category = text.trim().toLowerCase();
    return generateQuestion(ctx, state);
  },

  async handleCallback(ctx: ModeContext, data: string, messageId: number): Promise<ModeResult> {
    const action = data.replace('mode_quiz_', '');
    const state = loadState(ctx.modeData);

    if (action.startsWith('cat_')) {
      state.category = action.replace('cat_', '');
      await editMessage(ctx.chatId, messageId, `🎯 *Category: ${CATEGORIES.find(c => c.id === state.category)?.label || state.category}*\n\nGenerating your first question...`, ctx.env, 'Markdown');
      const result = await generateQuestion(ctx, state);
      if (result.response) {
        await sendMessage(ctx.chatId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action.startsWith('start_random') || action === 'start_random') {
      state.category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id;
      await editMessage(ctx.chatId, messageId, `🎯 *Random Quiz!*\n\nCategory: *${CATEGORIES.find(c => c.id === state.category)?.label}*\n\nGenerating...`, ctx.env, 'Markdown');
      const result = await generateQuestion(ctx, state);
      if (result.response) {
        await sendMessage(ctx.chatId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action.startsWith('ans_')) {
      if (state.step !== 'waiting_answer') return { consumed: false };
      const userAnswer = action.replace('ans_', '').toUpperCase();
      return evaluateAndNext(ctx, state, userAnswer, messageId);
    }

    if (action === 'next') {
      state.step = 'idle';
      const result = await generateQuestion(ctx, state);
      if (result.response) {
        await editMessage(ctx.chatId, messageId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action === 'quit') {
      const pct = state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
      await editMessage(ctx.chatId, messageId,
        `🎯 *Quiz Finished!*\n\n📊 Score: **${state.score}**/${state.total} (${pct}%)\n🔥 Best streak: **${state.bestStreak}**\n\nUse \`/mode_quiz\` to play again!`,
        ctx.env, 'Markdown');
      return { consumed: true, deactivate: true };
    }

    return { consumed: false };
  },
};

async function generateQuestion(ctx: ModeContext, state: QuizState): Promise<ModeResult> {
  const category = state.category || 'general';
  const prompt = QUESTION_PROMPT.replace('{category}', category);
  const messages = [
    { role: 'system', content: prompt },
    { role: 'user', content: `Give me a ${category} quiz question.` },
  ];

  try {
    const response = await runChat(ctx.env, messages, 800, 'powerful');
    const parsed = parseJSONStrict<{ question: string; options: Record<string, string>; answer: string; explanation: string } | null>(response, null);

    if (!parsed?.question || !parsed?.options) {
      return { consumed: true, response: '🚫 Failed to generate question. Try again!', newModeData: JSON.stringify(state) };
    }

    const labels = ['A', 'B', 'C', 'D'];
    const opts = labels.map(l => parsed.options[l]).filter(Boolean);
    if (opts.length < 2) {
      return { consumed: true, response: '🚫 Invalid question format. Try again!', newModeData: JSON.stringify(state) };
    }

    state.step = 'waiting_answer';
    state.question = parsed.question;
    state.answer = parsed.answer.toUpperCase();
    state.options = opts;
    state.explanation = parsed.explanation;
    state.total += 1;

    const optionButtons = opts.map((opt, i) => [
      { text: `${labels[i]}) ${opt.slice(0, 40)}`, callback_data: `mode_quiz_ans_${labels[i]}` },
    ]);

    return {
      consumed: true,
      response:
        `🎯 *Question ${state.total}* — ${CATEGORIES.find(c => c.id === state.category)?.label || state.category}\n\n` +
        `${parsed.question}\n\n` +
        `_Tap an option below or type A/B/C/D:_`,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          ...optionButtons,
          [{ text: '⏹️ Stop Quiz', callback_data: 'mode_quiz_quit' }],
        ],
      },
    };
  } catch (e: any) {
    logger.error('Quiz question generation failed', { error: e.message });
    return { consumed: true, response: '🚫 Error generating question. Try again!', newModeData: JSON.stringify(state) };
  }
}

async function evaluateAndNext(
  ctx: ModeContext, state: QuizState, userAnswer: string, editMsgId?: number,
): Promise<ModeResult> {
  const prompt = EVALUATE_PROMPT
    .replace('{question}', state.question)
    .replace('{options}', state.options.map((o, i) => `${['A', 'B', 'C', 'D'][i]}) ${o}`).join('\n'))
    .replace('{answer}', state.answer)
    .replace('{explanation}', state.explanation)
    .replace('{userAnswer}', userAnswer);

  try {
    const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 500, 'fast');
    const parsed = parseJSONStrict<{ correct: boolean; score: number; feedback: string } | null>(response, null);

    const isCorrect = parsed?.correct ?? (userAnswer === state.answer);
    const earnedScore = parsed?.score ?? (isCorrect ? 1 : 0);

    if (isCorrect) {
      state.streak += 1;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      const bonusPoints = state.streak >= 3 ? Math.floor(state.streak / 3) : 0;
      state.score += earnedScore + bonusPoints;
    } else {
      state.streak = 0;
      state.score += earnedScore;
    }

    const pct = state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
    let feedback = parsed?.feedback || (isCorrect ? `Correct! **${state.answer}**. ${state.explanation}` : `The answer is **${state.answer}**. ${state.explanation}`);
    const cheer = isCorrect
      ? (state.streak >= 5 ? pickRandom(FUN_FEEDBACK.streak) : pickRandom(FUN_FEEDBACK.correct))
      : pickRandom(FUN_FEEDBACK.wrong);

    let streakLine = '';
    if (state.streak >= 3) streakLine = `\n🔥 Streak: **${state.streak}** (+${Math.floor(state.streak / 3)} bonus!)`;
    else if (state.streak > 0) streakLine = `\n🔥 Streak: **${state.streak}**`;

    const resultMsg =
      `${isCorrect ? '✅' : '❌'} *${cheer}*\n\n` +
      `${feedback}\n\n` +
      `📊 Score: **${state.score}**/${state.total} (${pct}%)${streakLine}`;

    state.step = 'idle';

    if (state.total >= 10) {
      state.step = 'idle';
      return {
        consumed: true,
        response: `🎯 *Quiz Complete!*\n\n📊 Final: **${state.score}**/${state.total} (${pct}%)\n🔥 Best streak: **${state.bestStreak}**\n\nUse \`/mode_quiz\` to play again!`,
        newModeData: JSON.stringify(state),
        deactivate: true,
      };
    }

    return {
      consumed: true,
      response: resultMsg,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '➡️ Next Question', callback_data: 'mode_quiz_next' }],
          [{ text: '⏹️ Stop Quiz', callback_data: 'mode_quiz_quit' }],
        ],
      },
    };
  } catch (e: any) {
    logger.error('Quiz evaluation failed', { error: e.message });
    state.step = 'idle';
    return {
      consumed: true,
      response: `🚫 Evaluation error. The answer was **${state.answer}**.\n\n${state.explanation}`,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '➡️ Next Question', callback_data: 'mode_quiz_next' }],
          [{ text: '⏹️ Stop Quiz', callback_data: 'mode_quiz_quit' }],
        ],
      },
    };
  }
}
