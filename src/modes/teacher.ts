import type { Mode, ModeContext, ModeResult } from './types.ts';
import type { TelegramMessage } from '../types/env.d.ts';
import { runChat } from '../ai.ts';
import { sendMessage, editMessage } from '../telegram.ts';
import { logger } from '../utils/logger.ts';

interface TeacherState {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessonNumber: number;
  totalLessons: number;
  completedLessons: string[];
}

const LEVELS = [
  { id: 'beginner', label: 'Beginner 🟢' },
  { id: 'intermediate', label: 'Intermediate 🟡' },
  { id: 'advanced', label: 'Advanced 🔴' },
];

const LESSON_PROMPT = `You are a patient and knowledgeable teacher. Teach the user about {topic} at {level} level.

This is lesson {lessonNumber} of {totalLessons}.

Rules:
- Explain concepts clearly with examples
- Break down complex ideas into simple parts
- At the end, ask ONE follow-up question to check understanding
- Respond in a structured format:

📚 *Lesson {lessonNumber}: [Title]*

[Content with examples and explanations]

💡 *Key Takeaway:*
[One sentence summary]

❓ *Check your understanding:*
[One question about this lesson]

Keep the lesson concise but thorough. Use emojis for engagement.`;

const EXERCISE_PROMPT = `You are a teacher. Create a practice exercise about {topic} at {level} level.

Rules:
- Create 3 questions (mix of multiple-choice and short answer)
- Provide answers after the user responds
- Format as JSON:
{"exercises":[{"question":"Q1","type":"mcq","options":["A","B","C","D"],"answer":"A"},{"question":"Q2","type":"short","answer":"expected answer"},{"question":"Q3","type":"mcq","options":["A","B","C","D"],"answer":"C"}]}`;

function parseJSONStrict<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch { return fallback; }
}

function defaultState(): TeacherState {
  return { topic: '', level: 'beginner', lessonNumber: 0, totalLessons: 5, completedLessons: [] };
}

function loadState(data: string | null): TeacherState {
  if (!data) return defaultState();
  try { return { ...defaultState(), ...JSON.parse(data) }; } catch { return defaultState(); }
}

export const teacherMode: Mode = {
  meta: {
    id: 'teacher',
    name: 'Teacher',
    icon: '👨‍🏫',
    description: 'Step-by-step interactive lessons with exercises',
  },

  async onActivate(ctx: ModeContext): Promise<string> {
    const levelKeyboard = {
      inline_keyboard: [
        LEVELS.map(l => ({ text: l.label, callback_data: `mode_teacher_level_${l.id}` })),
        [{ text: '⏹️ Stop', callback_data: 'mode_teacher_quit' }],
      ],
    };
    await sendMessage(ctx.chatId,
      '👨‍🏫 *Teacher Mode Activated!*\n\nI will teach you any topic step by step.\n\n' +
      'First, choose your learning level:',
      ctx.env, 'Markdown', levelKeyboard,
    );
    return '';
  },

  async onDeactivate(ctx: ModeContext): Promise<string> {
    const state = loadState(ctx.modeData);
    if (state.completedLessons.length > 0) {
      return `👨‍🏫 *Teacher Mode deactivated.*\n\n📚 Completed: ${state.completedLessons.length}/${state.totalLessons} lessons on *${state.topic}*\n\nCome back to continue learning!`;
    }
    return '👨‍🏫 *Teacher Mode deactivated.* Keep learning! 📚';
  },

  async handleMessage(ctx: ModeContext, text: string, _message: TelegramMessage): Promise<ModeResult> {
    const state = loadState(ctx.modeData);

    if (!state.topic) {
      state.topic = text.trim();
      state.lessonNumber = 0;
      return teachNextLesson(ctx, state);
    }

    if (text.toLowerCase() === 'more' || text.toLowerCase() === 'next') {
      return teachNextLesson(ctx, state);
    }

    if (text.toLowerCase() === 'exercise' || text.toLowerCase() === 'practice') {
      return generateExercise(ctx, state);
    }

    if (text.toLowerCase() === 'summary') {
      return summarizeTopic(ctx, state);
    }

    return {
      consumed: true,
      response: `🤔 Great question! Let me address that...\n\n_Send "next" for the next lesson, "exercise" for practice, or "summary" for a recap._\n\nFirst, let me answer: ${text}`,
      newModeData: JSON.stringify(state),
    };
  },

  async handleCallback(ctx: ModeContext, data: string, messageId: number): Promise<ModeResult> {
    const action = data.replace('mode_teacher_', '');
    const state = loadState(ctx.modeData);

    if (action.startsWith('level_')) {
      state.level = action.replace('level_', '') as TeacherState['level'];
      await editMessage(ctx.chatId, messageId,
        `👨‍🏫 *Level: ${LEVELS.find(l => l.id === state.level)?.label}*\n\nNow, tell me what you want to learn!\n\nSend a topic like:\n• "Python programming"\n• "World history"\n• "Photosynthesis"\n• "Chess strategies"`,
        ctx.env, 'Markdown');
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action.startsWith('topic_')) {
      state.topic = decodeURIComponent(action.replace('topic_', ''));
      state.lessonNumber = 0;
      const result = await teachNextLesson(ctx, state);
      if (result.response) {
        await editMessage(ctx.chatId, messageId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action === 'next') {
      const result = await teachNextLesson(ctx, state);
      if (result.response) {
        await editMessage(ctx.chatId, messageId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action === 'exercise') {
      const result = await generateExercise(ctx, state);
      if (result.response) {
        await editMessage(ctx.chatId, messageId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action === 'quit') {
      const summary = state.completedLessons.length > 0
        ? `📚 Completed: ${state.completedLessons.length}/${state.totalLessons} lessons on *${state.topic}*`
        : 'Keep learning! 📚';
      await editMessage(ctx.chatId, messageId,
        `👨‍🏫 *Teacher Mode deactivated.*\n\n${summary}\n\nUse \`/mode_teacher\` to start a new lesson.`,
        ctx.env, 'Markdown');
      return { consumed: true, deactivate: true };
    }

    return { consumed: false };
  },
};

async function teachNextLesson(ctx: ModeContext, state: TeacherState): Promise<ModeResult> {
  state.lessonNumber += 1;
  if (state.lessonNumber > state.totalLessons) {
    return {
      consumed: true,
      response: `🎉 *Course Complete!*\n\nYou've completed all ${state.totalLessons} lessons on *${state.topic}*!\n\nUse \`/mode_teacher\` to start a new topic.`,
      newModeData: JSON.stringify(state),
      deactivate: true,
    };
  }

  const prompt = LESSON_PROMPT
    .replace('{topic}', state.topic)
    .replace('{level}', state.level)
    .replace('{lessonNumber}', String(state.lessonNumber))
    .replace('{totalLessons}', String(state.totalLessons));

  try {
    const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 1500, 'powerful');
    if (!response) throw new Error('Empty response');

    state.completedLessons.push(`Lesson ${state.lessonNumber}`);

    return {
      consumed: true,
      response: response,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '➡️ Next Lesson', callback_data: 'mode_teacher_next' },
            { text: '📝 Exercise', callback_data: 'mode_teacher_exercise' },
          ],
          [{ text: '⏹️ Stop', callback_data: 'mode_teacher_quit' }],
        ],
      },
    };
  } catch (e: any) {
    logger.error('Teacher lesson failed', { error: e.message });
    return {
      consumed: true,
      response: `🚫 Failed to generate lesson. Let's try again!\n\n_Send any message to continue._`,
      newModeData: JSON.stringify(state),
    };
  }
}

async function generateExercise(ctx: ModeContext, state: TeacherState): Promise<ModeResult> {
  const prompt = EXERCISE_PROMPT
    .replace('{topic}', state.topic)
    .replace('{level}', state.level);

  try {
    const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 1000, 'powerful');
    const parsed = parseJSONStrict<{ exercises: Array<{ question: string; type: string; options?: string[]; answer: string }> } | null>(response, null);

    if (!parsed?.exercises?.length) throw new Error('Invalid exercise format');

    const exerciseText = parsed.exercises.map((ex, i) => {
      let text = `*${i + 1}. ${ex.question}*`;
      if (ex.options) text += `\n${ex.options.map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`).join('\n')}`;
      return text;
    }).join('\n\n');

    return {
      consumed: true,
      response: `📝 *Practice Exercise: ${state.topic}*\n\n${exerciseText}\n\n_Answer each question, then I'll check your answers!_`,
      newModeData: JSON.stringify(state),
      replyMarkup: {
        inline_keyboard: [
          [{ text: '➡️ Next Lesson', callback_data: 'mode_teacher_next' }],
          [{ text: '⏹️ Stop', callback_data: 'mode_teacher_quit' }],
        ],
      },
    };
  } catch (e: any) {
    logger.error('Teacher exercise failed', { error: e.message });
    return {
      consumed: true,
      response: `📝 *Practice Time!*\n\nTry to recall what you've learned about *${state.topic}*:\n1. What is the main concept?\n2. Can you give an example?\n3. How does this apply in real life?\n\n_Send "next" to continue the lesson._`,
      newModeData: JSON.stringify(state),
    };
  }
}

async function summarizeTopic(_ctx: ModeContext, state: TeacherState): Promise<ModeResult> {
  const pct = Math.round((state.completedLessons.length / state.totalLessons) * 100);
  return {
    consumed: true,
    response:
      `👨‍🏫 *Learning Progress*\n\n` +
      `📚 Topic: *${state.topic}*\n` +
      `🎯 Level: *${LEVELS.find(l => l.id === state.level)?.label}*\n` +
      `📊 Progress: ${state.completedLessons.length}/${state.totalLessons} (${pct}%)\n\n` +
      `Completed lessons:\n${state.completedLessons.map(l => `  ✅ ${l}`).join('\n')}\n\n` +
      `_Send "next" to continue or "exercise" for practice._`,
    newModeData: JSON.stringify(state),
  };
}
