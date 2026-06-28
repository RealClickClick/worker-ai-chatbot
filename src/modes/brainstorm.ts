import type { Mode, ModeContext, ModeResult } from './types.ts';
import type { TelegramMessage } from '../types/env.d.ts';
import { runChat } from '../ai.ts';
import { sendMessage, editMessage, deleteMessage } from '../telegram.ts';
import { logger } from '../utils/logger.ts';

interface BrainstormIdea {
  id: number;
  text: string;
  category?: string;
  score?: number;
  note?: string;
}

interface BrainstormState {
  topic: string;
  ideas: BrainstormIdea[];
  round: number;
  nextId: number;
}

const SUGGESTED_TOPICS = [
  { id: 'business', label: '💼 Business' },
  { id: 'tech', label: '💻 Technology' },
  { id: 'writing', label: '✍️ Writing' },
  { id: 'art', label: '🎨 Art' },
  { id: 'problem', label: '🧩 Problem Solving' },
  { id: 'custom', label: '🎯 Custom Topic' },
];

function defaultState(): BrainstormState {
  return { topic: '', ideas: [], round: 0, nextId: 1 };
}

function loadState(data: string | null): BrainstormState {
  if (!data) return defaultState();
  try { return { ...defaultState(), ...JSON.parse(data) }; } catch { return defaultState(); }
}

function ideaActionsKeyboard(startId: number, endId: number): any {
  const rows: any[] = [];
  const ids: number[] = [];
  for (let i = startId; i <= endId; i++) ids.push(i);
  while (ids.length) {
    const row = ids.splice(0, 5).map(id => ({
      text: `🔍 ${id}`,
      callback_data: `mode_brainstorm_expand_${id}`,
    }));
    rows.push(row);
  }
  return rows;
}

function parseJSONStrict<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```(?:json)?\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch { return fallback; }
}

const GENERATE_PROMPT = `You are a creative brainstorming facilitator. The topic is: {topic}

Generate {count} creative, diverse, and actionable ideas. Each idea should be 1-2 sentences. Think outside the box — combine different domains. Number each idea.

Respond ONLY in this exact JSON format:
{"ideas":["1. First idea here...","2. Second idea here...","3. Third idea here..."]}`;

const EXPAND_PROMPT = `Take this idea and expand it in detail: "{idea}"

Provide:
- Core concept explanation
- How it could work
- Potential challenges
- Potential impact

Be thorough but concise (3-4 paragraphs max).`;

const CATEGORIZE_PROMPT = `Categorize these ideas into thematic groups:

{ideasList}

Respond ONLY in this JSON:
{"categories":[{"name":"Category Name","ideaIds":[1,3,5]},{"name":"Another Category","ideaIds":[2,4,6]}]}`;

const EVALUATE_PROMPT = `Evaluate these ideas by {criteria} (1-10 scale):

{ideasList}

Respond ONLY in this JSON:
{"evaluations":[{"id":1,"score":8,"note":"brief reason"},{"id":2,"score":6,"note":"brief reason"}]}`;

const COMBINE_PROMPT = `Combine the best elements of these ideas into ONE powerful hybrid concept:

{ideasList}

Describe the hybrid idea in 2-3 paragraphs. Give it a catchy name. Explain which elements are borrowed from which original idea.`;

export const brainstormMode: Mode = {
  meta: {
    id: 'brainstorm',
    name: 'Brainstorm',
    icon: '💡',
    description: 'Interactive brainstorming session with idea generation, expansion, categorization, and evaluation',
  },

  async onActivate(ctx: ModeContext): Promise<string> {
    const topicKeyboard = {
      inline_keyboard: [
        SUGGESTED_TOPICS.slice(0, 3).map(t => ({ text: t.label, callback_data: `mode_brainstorm_topic_${t.id}` })),
        SUGGESTED_TOPICS.slice(3, 6).map(t => ({ text: t.label, callback_data: `mode_brainstorm_topic_${t.id}` })),
        [{ text: '⏹️ Stop', callback_data: 'mode_brainstorm_quit' }],
      ],
    };
    await sendMessage(ctx.chatId,
      '💡 *Brainstorm Mode Activated!*\n\n' +
      'I\'ll help you generate, expand, categorize, and evaluate ideas.\n\n' +
      'Choose a topic or send your own:',
      ctx.env, 'Markdown', topicKeyboard,
    );
    return '';
  },

  async onDeactivate(ctx: ModeContext): Promise<string> {
    const state = loadState(ctx.modeData);
    if (state.ideas.length > 0) {
      return `💡 *Brainstorm Session Summary*\n\n📋 Topic: *${state.topic}*\n💭 Ideas generated: *${state.ideas.length}*\n🔄 Rounds: *${state.round}*\n\nThanks for the creative session! 🚀`;
    }
    return '💡 *Brainstorm Mode deactivated.* Come back when inspiration strikes! ✨';
  },

  async handleMessage(ctx: ModeContext, text: string, _message: TelegramMessage): Promise<ModeResult> {
    const state = loadState(ctx.modeData);

    if (!state.topic) {
      state.topic = text.trim();
      state.ideas = [];
      state.round = 0;
      return generateIdeas(ctx, state, 7);
    }

    state.topic = text.trim();
    state.ideas = [];
    state.round = 0;
    return generateIdeas(ctx, state, 7);
  },

  async handleCallback(ctx: ModeContext, data: string, messageId: number): Promise<ModeResult> {
    const action = data.replace('mode_brainstorm_', '');
    const state = loadState(ctx.modeData);

    if (action.startsWith('topic_')) {
      const topicId = action.replace('topic_', '');
      if (topicId === 'custom') {
        await editMessage(ctx.chatId, messageId,
          '💡 Great! Send me your topic as a message.',
          ctx.env, 'Markdown');
        return { consumed: true, newModeData: JSON.stringify(state) };
      }
      const topicMap: Record<string, string> = {
        business: 'innovative business ideas for 2025',
        tech: 'new technology product ideas',
        writing: 'creative writing prompts and story ideas',
        art: 'art project concepts and creative works',
        problem: 'creative solutions to everyday problems',
      };
      state.topic = topicMap[topicId] || topicId;
      state.ideas = [];
      state.round = 0;
      const result = await generateIdeas(ctx, state, 7);
      if (result.response) {
        await editMessage(ctx.chatId, messageId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action === 'more') {
      state.round += 1;
      const result = await generateIdeas(ctx, state, 5);
      if (result.response) {
        await editMessage(ctx.chatId, messageId, result.response, ctx.env, 'Markdown', result.replyMarkup);
      }
      return { consumed: true, newModeData: result.newModeData || JSON.stringify(state) };
    }

    if (action.startsWith('expand_')) {
      const id = parseInt(action.replace('expand_', ''), 10);
      const idea = state.ideas.find(i => i.id === id);
      if (!idea) return { consumed: false };
      const prompt = EXPAND_PROMPT.replace('{idea}', idea.text);
      await editMessage(ctx.chatId, messageId, `🔍 *Expanding idea #${id}...*`, ctx.env, 'Markdown');
      try {
        const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 1000, 'powerful');
        if (response) {
          const expandedText = `💡 *Idea #${id}*\n\n${idea.text}\n\n---\n\n${response}`;
          await sendMessage(ctx.chatId, expandedText, ctx.env, 'Markdown');
          await editMessage(ctx.chatId, messageId,
            `💡 *Brainstorm: ${state.topic}*\n\nShowing idea #${id} details above.`, ctx.env, 'Markdown',
            buildActionsKeyboard(state),
          );
        }
      } catch (e: any) {
        logger.error('Brainstorm expand error', { id, error: e.message });
      }
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action === 'cat') {
      if (state.ideas.length === 0) return { consumed: false };
      await editMessage(ctx.chatId, messageId, '📂 *Categorizing ideas...*', ctx.env, 'Markdown');
      const ideasList = state.ideas.map(i => `${i.id}. ${i.text}`).join('\n');
      const prompt = CATEGORIZE_PROMPT.replace('{ideasList}', ideasList);
      try {
        const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 800, 'balanced');
        const parsed = parseJSONStrict<{ categories: Array<{ name: string; ideaIds: number[] }> } | null>(response, null);
        if (parsed?.categories) {
          for (const cat of parsed.categories) {
            for (const id of cat.ideaIds) {
              const idea = state.ideas.find(i => i.id === id);
              if (idea) idea.category = cat.name;
            }
          }
          const catText = parsed.categories.map(c =>
            `📂 *${c.name}*\n${c.ideaIds.map(id => {
              const idea = state.ideas.find(i => i.id === id);
              return idea ? `  ${id}. ${idea.text.slice(0, 80)}` : '';
            }).join('\n')}`
          ).join('\n\n');
          await editMessage(ctx.chatId, messageId,
            `💡 *Categorized Ideas: ${state.topic}*\n\n${catText}`,
            ctx.env, 'Markdown', buildActionsKeyboard(state),
          );
        }
      } catch (e: any) {
        logger.error('Brainstorm categorize error', { error: e.message });
      }
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action === 'eval' || action.startsWith('eval_')) {
      if (state.ideas.length === 0) return { consumed: false };
      const criteria = action === 'eval' ? 'feasibility' : action.replace('eval_', '');
      await editMessage(ctx.chatId, messageId, `⭐ *Evaluating by ${criteria}...*`, ctx.env, 'Markdown');
      const ideasList = state.ideas.map(i => `${i.id}. ${i.text}`).join('\n');
      const prompt = EVALUATE_PROMPT.replace('{criteria}', criteria).replace('{ideasList}', ideasList);
      try {
        const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 800, 'balanced');
        const parsed = parseJSONStrict<{ evaluations: Array<{ id: number; score: number; note: string }> } | null>(response, null);
        if (parsed?.evaluations) {
          for (const ev of parsed.evaluations) {
            const idea = state.ideas.find(i => i.id === ev.id);
            if (idea) { idea.score = ev.score; idea.note = ev.note; }
          }
          const sorted = [...state.ideas].sort((a, b) => (b.score || 0) - (a.score || 0));
          const evalText = sorted.map(i =>
            `  ${'⭐'.repeat(Math.max(1, Math.min(5, Math.round((i.score || 5) / 2))))} #${i.id} — **${i.score}/10**\n  _${i.note || ''}_\n  ${i.text.slice(0, 100)}`
          ).join('\n\n');
          await editMessage(ctx.chatId, messageId,
            `💡 *Evaluation by ${criteria}: ${state.topic}*\n\n${evalText}`,
            ctx.env, 'Markdown', buildEvalKeyboard(state),
          );
        }
      } catch (e: any) {
        logger.error('Brainstorm evaluate error', { error: e.message });
      }
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action === 'combine') {
      if (state.ideas.length < 2) return { consumed: false };
      await editMessage(ctx.chatId, messageId, '🚀 *Combining best ideas...*', ctx.env, 'Markdown');
      const topIdeas = [...state.ideas].sort((a, b) => (b.score || 5) - (a.score || 5)).slice(0, 3);
      const ideasList = topIdeas.map(i => `#${i.id}: ${i.text}`).join('\n');
      const prompt = COMBINE_PROMPT.replace('{ideasList}', ideasList);
      try {
        const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 1000, 'powerful');
        if (response) {
          const hybridId = state.nextId++;
          state.ideas.push({ id: hybridId, text: `HYBRID: ${response.slice(0, 150)}...` });
          await editMessage(ctx.chatId, messageId,
            `🚀 *Hybrid Concept*\n\n${response}`,
            ctx.env, 'Markdown', buildActionsKeyboard(state),
          );
        }
      } catch (e: any) {
        logger.error('Brainstorm combine error', { error: e.message });
      }
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action === 'export') {
      if (state.ideas.length === 0) return { consumed: false };
      const sorted = [...state.ideas].sort((a, b) => (b.score || 5) - (a.score || 5));
      const exportText = sorted.map(i => {
        const cat = i.category ? ` [${i.category}]` : '';
        const score = i.score ? ` ⭐${i.score}/10` : '';
        return `#${i.id}${cat}${score}\n${i.text}\n`;
      }).join('\n');
      await editMessage(ctx.chatId, messageId,
        `💡 *Brainstorm Export: ${state.topic}*\n\nTotal ideas: ${state.ideas.length}\n\n\`\`\`\n${exportText.slice(0, 3800)}\n\`\`\``,
        ctx.env, 'Markdown', buildActionsKeyboard(state),
      );
      return { consumed: true, newModeData: JSON.stringify(state) };
    }

    if (action === 'quit') {
      const summary = state.ideas.length > 0
        ? `📋 Topic: *${state.topic}*\n💭 Ideas: *${state.ideas.length}*\n🔄 Rounds: *${state.round}*\n\nThanks for the creative session! 🚀`
        : 'Come back when inspiration strikes! ✨';
      await editMessage(ctx.chatId, messageId,
        `💡 *Brainstorm Session Ended*\n\n${summary}\n\nUse \`/mode_brainstorm\` to start a new session.`,
        ctx.env, 'Markdown');
      return { consumed: true, deactivate: true };
    }

    return { consumed: false };
  },
};

function buildActionsKeyboard(state: BrainstormState): any {
  const actionRow = [
    { text: '➕ More', callback_data: 'mode_brainstorm_more' },
    { text: '📂 Categorize', callback_data: 'mode_brainstorm_cat' },
    { text: '🚀 Combine', callback_data: 'mode_brainstorm_combine' },
    { text: '📋 Export', callback_data: 'mode_brainstorm_export' },
  ];
  const evalRow = [
    { text: '⭐ Feasibility', callback_data: 'mode_brainstorm_eval_feasibility' },
    { text: '⭐ Impact', callback_data: 'mode_brainstorm_eval_impact' },
    { text: '⭐ Creativity', callback_data: 'mode_brainstorm_eval_creativity' },
  ];
  const navRow = [
    { text: '⏹️ Stop', callback_data: 'mode_brainstorm_quit' },
  ];
  const keyboards: any[][] = [actionRow, evalRow];
  if (state.ideas.length > 0) {
    const maxId = Math.max(...state.ideas.map(i => i.id));
    const minId = Math.min(...state.ideas.map(i => i.id));
    const ideaRows = ideaActionsKeyboard(minId, maxId);
    keyboards.push(...ideaRows);
  }
  keyboards.push(navRow);
  return { inline_keyboard: keyboards };
}

function buildEvalKeyboard(state: BrainstormState): any {
  return {
    inline_keyboard: [
      [
        { text: '➕ More', callback_data: 'mode_brainstorm_more' },
        { text: '📂 Categorize', callback_data: 'mode_brainstorm_cat' },
        { text: '📋 Export', callback_data: 'mode_brainstorm_export' },
      ],
      [
        { text: '⭐ Feasibility', callback_data: 'mode_brainstorm_eval_feasibility' },
        { text: '⭐ Impact', callback_data: 'mode_brainstorm_eval_impact' },
        { text: '⭐ Creativity', callback_data: 'mode_brainstorm_eval_creativity' },
      ],
      [{ text: '⏹️ Stop', callback_data: 'mode_brainstorm_quit' }],
    ],
  };
}

async function generateIdeas(ctx: ModeContext, state: BrainstormState, count: number): Promise<ModeResult> {
  const prompt = GENERATE_PROMPT.replace('{topic}', state.topic).replace('{count}', String(count));
  try {
    const response = await runChat(ctx.env, [{ role: 'user', content: prompt }], 1000, 'powerful');
    const parsed = parseJSONStrict<{ ideas: string[] } | null>(response, null);
    if (!parsed?.ideas?.length) throw new Error('Empty response');

    const newIdeas: BrainstormIdea[] = parsed.ideas.map((text: string) => ({
      id: state.nextId++,
      text: text.replace(/^\d+[\.\)]\s*/, ''),
    }));
    state.ideas.push(...newIdeas);

    const displayLimit = 5;
    const displayIdeas = newIdeas.length > displayLimit
      ? newIdeas.slice(0, displayLimit)
      : newIdeas;

    const ideasText = displayIdeas.map(i => `  ${i.id}. ${i.text}`).join('\n');
    const moreText = newIdeas.length > displayLimit
      ? `\n  _...and ${newIdeas.length - displayLimit} more_`
      : '';

    return {
      consumed: true,
      response:
        `💡 *Brainstorm: ${state.topic}*\n` +
        `_Round ${state.round + 1}_\n\n${ideasText}${moreText}`,
      newModeData: JSON.stringify(state),
      replyMarkup: buildActionsKeyboard(state),
    };
  } catch (e: any) {
    logger.error('Brainstorm generation failed', { error: e.message });
    return {
      consumed: true,
      response: '🚫 Failed to generate ideas. Try again!',
      newModeData: JSON.stringify(state),
    };
  }
}
