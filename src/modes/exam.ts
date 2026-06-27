import type { Mode, ModeContext, ModeResult } from './types.ts';
import { runChat, runVision } from '../ai.ts';
import { sendMessage, editMessage, downloadFile } from '../telegram.ts';
import { logger } from '../utils/logger.ts';

interface ExamState {
  step: 'idle' | 'waiting_answer';
  question: string;
  answer: string;
  options: string[];
  explanation: string;
  score: number;
  total: number;
  difficulty: string;
}

function getDifficultyLabel(d: string): string {
  return { easy: 'Easy 🟢', medium: 'Medium 🟡', hard: 'Hard 🔴', expert: 'Expert 💀' }[d] || 'Medium 🟡';
}

const QUESTION_PROMPT = `You are an expert exam creator. Generate a multiple-choice question based on the user's topic or image.

Rules:
- Create ONE question with exactly 4 options labeled A, B, C, D
- Difficulty: {difficulty}
- Respond ONLY in this exact JSON format, no other text:
{"question":"the question text","options":{"A":"option A","B":"option B","C":"option C","D":"option D"},"answer":"A","explanation":"why this answer is correct"}`;

const EVALUATE_PROMPT = `You are an exam evaluator. The question was:
{question}
Options:
{options}
Correct answer: {answer}
Explanation: {explanation}

The student answered: "{userAnswer}"

Respond ONLY in this exact JSON format, no other text:
{"correct":true,"score":1,"feedback":"detailed feedback explaining why"}

If partially correct, use a "score" between 0 and 1 (e.g., 0.5 for partially right).`;

function buildOptionsText(options: string[]): string {
  const labels = ['A', 'B', 'C', 'D'];
  return options.map((opt, i) => `${labels[i]}) ${opt}`).join('\n');
}

function parseJSONStrict<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

function defaultState(): ExamState {
  return { step: 'idle', question: '', answer: '', options: [], explanation: '', score: 0, total: 0, difficulty: 'medium' };
}

function loadState(data: string | null): ExamState {
  if (!data) return defaultState();
  try { return { ...defaultState(), ...JSON.parse(data) }; } catch { return defaultState(); }
}

export const examMode: Mode = {
  meta: {
    id: 'exam',
    name: 'Exam',
    icon: '📝',
    description: 'Interactive exam with AI-generated questions from text or images',
  },

  async onActivate(ctx: ModeContext): Promise<string> {
    const msg =
      `📝 *Exam Mode Activated!*\n\n` +
      `I will create multiple-choice questions based on your input.\n\n` +
      `• Send a *topic* → I'll create a question\n` +
      `• Send a *photo* → I'll analyze it and create a question\n` +
      `• Answer the options (A/B/C/D)\n` +
      `• Use /mode_stop to exit Exam Mode\n\n` +
      `_Ready! Send me a topic or a photo to begin._`;

    await sendMessage(ctx.chatId, msg, ctx.env, 'Markdown');
    return '';
  },

  async onDeactivate(ctx: ModeContext): Promise<string> {
    return '📝 *Exam Mode deactivated.* Your score has been reset.';
  },

  async handleMessage(ctx: ModeContext, text: string, message: any): Promise<ModeResult> {
    const photo = message.photo;
    const state = loadState(ctx.modeData);

    if (state.step === 'waiting_answer') {
      return handleAnswer(ctx, text, state);
    }

    return handleNewQuestion(ctx, text, photo, state);
  },

  async handleCallback(ctx: ModeContext, data: string, messageId: number): Promise<ModeResult> {
    const action = data.replace('mode_exam_', '');
    if (!action.startsWith('exam_')) return { consumed: false };
    const state = loadState(ctx.modeData);

    if (action === 'exam_difficulty_easy' || action === 'exam_difficulty_medium' ||
        action === 'exam_difficulty_hard' || action === 'exam_difficulty_expert') {
      const diff = action.replace('exam_difficulty_', '');
      state.difficulty = diff;
      const msg =
        `📝 *Difficulty changed to ${getDifficultyLabel(diff)}*\n\n` +
        `Send a topic or photo for a new question.`;
      await editMessage(ctx.chatId, messageId, msg, ctx.env, 'Markdown');
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action === 'exam_quit') {
      const pct = state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
      const msg =
        `📝 *Exam Mode deactivated.*\n` +
        `📊 Final score: **${state.score}** / **${state.total}** (${pct}%)\n\n` +
        `Use \`/mode_exam\` to start a new session.`;
      await editMessage(ctx.chatId, messageId, msg, ctx.env, 'Markdown');
      return { consumed: true, deactivate: true };
    }

    return { consumed: false };
  },
};

async function handleNewQuestion(
  ctx: ModeContext,
  text: string,
  photo: any,
  state: ExamState,
): Promise<ModeResult> {
  await sendMessage(ctx.chatId, '🤔 *Generating question...*', ctx.env, 'Markdown');

  let subject = text || 'general knowledge';
  const difficulty = state.difficulty || 'medium';

  if (photo && photo.length > 0) {
    try {
      const largest = photo[photo.length - 1];
      const imageBytes = await downloadFile(largest.file_id, ctx.env);
      const analysis = await runVision(ctx.env, 'Analyze this image and describe what you see in detail for creating an exam question about it.', imageBytes);
      if (analysis) subject = `Image content: ${analysis}\n\nCreate a question based on this image.`;
    } catch (e: any) {
      logger.warn('Vision analysis failed, using text only', { error: e.message });
    }
  }

  const prompt = QUESTION_PROMPT.replace('{difficulty}', getDifficultyLabel(difficulty));
  const messages = [
    { role: 'system', content: prompt },
    { role: 'user', content: `Topic: ${subject}` },
  ];

  try {
    const response = await runChat(ctx.env, messages, 800, 'powerful');
    const parsed = parseJSONStrict<{ question: string; options: Record<string, string>; answer: string; explanation: string } | null>(response, null);

    if (!parsed || !parsed.question || !parsed.options) {
      return { consumed: true, response: '🚫 Failed to generate question. Please try again.' };
    }

    const labels = ['A', 'B', 'C', 'D'];
    const optionsArray = labels.map(l => parsed.options[l]).filter(Boolean);
    if (optionsArray.length < 2) {
      return { consumed: true, response: '🚫 Invalid question format. Please try again.' };
    }

    state.step = 'waiting_answer';
    state.question = parsed.question;
    state.answer = parsed.answer.toUpperCase();
    state.options = optionsArray;
    state.explanation = parsed.explanation;
    state.total += 1;

    const questionText =
      `📝 *Question ${state.total}* (${getDifficultyLabel(difficulty)})\n\n` +
      `${parsed.question}\n\n` +
      `${buildOptionsText(optionsArray)}\n\n` +
      `_Reply with A, B, C, or D_`;

    return {
      consumed: true,
      response: questionText,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '⏹️ Stop Exam', callback_data: 'mode_exam_exam_quit' }],
        ],
      },
    };
  } catch (e: any) {
    logger.error('Exam question generation failed', { error: e.message });
    return { consumed: true, response: '🚫 Error generating question. Please try again.' };
  }
}

async function handleAnswer(
  ctx: ModeContext,
  text: string,
  state: ExamState,
): Promise<ModeResult> {
  const userAnswer = text.trim().toUpperCase();
  const validAnswers = ['A', 'B', 'C', 'D'];

  if (!validAnswers.includes(userAnswer)) {
    return {
      consumed: true,
      response:
        `⚠️ Please answer with *A*, *B*, *C*, or *D*.\n\n` +
        `${state.question}\n\n` +
        `${buildOptionsText(state.options)}`,
    };
  }

  const prompt = EVALUATE_PROMPT
    .replace('{question}', state.question)
    .replace('{options}', buildOptionsText(state.options))
    .replace('{answer}', state.answer)
    .replace('{explanation}', state.explanation)
    .replace('{userAnswer}', userAnswer);

  try {
    const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 500, 'fast');
    const parsed = parseJSONStrict<{ correct: boolean; score: number; feedback: string } | null>(response, null);

    const isCorrect = parsed?.correct ?? (userAnswer === state.answer);
    const earnedScore = parsed?.score ?? (isCorrect ? 1 : 0);
    state.score += earnedScore;

    const percentage = state.total > 0 ? Math.round((state.score / state.total) * 100) : 0;
    const icon = isCorrect ? '✅' : '❌';

    let feedback = parsed?.feedback || '';
    if (!feedback) {
      feedback = isCorrect
        ? `Correct! The answer is **${state.answer}**.`
        : `Incorrect. The correct answer is **${state.answer}**.`;
    }

    const resultMsg =
      `${icon} *Result*\n\n` +
      `${feedback}\n\n` +
      `📊 Score: **${state.score}** / **${state.total}** (${percentage}%)\n\n` +
      `_Send another topic or photo for the next question, or tap Stop to finish._`;

    state.step = 'idle';
    state.question = '';
    state.answer = '';
    state.options = [];
    state.explanation = '';

    return {
      consumed: true,
      response: resultMsg,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '⏹️ Stop Exam', callback_data: 'mode_exam_exam_quit' }],
        ],
      },
    };
  } catch (e: any) {
    logger.error('Exam evaluation failed', { error: e.message });
    state.step = 'idle';
    return {
      consumed: true,
      response: `🚫 Error evaluating answer. The correct answer was **${state.answer}**.\n\nSend another topic to continue.`,
      newModeData: JSON.stringify(state),
    };
  }
}
