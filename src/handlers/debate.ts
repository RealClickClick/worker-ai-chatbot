import { sendMessage, sendMessageWithId, editMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import { runChat, cleanAIResponseText } from '../ai.ts';
import { MAX_MESSAGE_LENGTH, TOKEN_LIMIT_MEDIUM, DEBATE_TOKEN_LIMIT, DEBATE_AI_TIMEOUT, DEBATE_HISTORY_TRUNCATE, MIN_DEBATE_ROUNDS, MAX_DEBATE_ROUNDS } from '../constants.ts';
import { getActiveDebateSession, createDebateSession, updateDebateSession, getDebateSession, 
getDebateMessages, addDebateMessage, deleteDebateRoundMessages } from '../services/index.ts';
import { logger } from '../utils/logger.ts';
import { PERSONAS } from '../../config/personas.ts';
import { PERSONA_THINKING_EMOJIS } from '../../config/persona-emojis.ts';
import { buildStyleKeyboard, buildRoundsKeyboard, buildPersonaCategoryKeyboard, buildPersonaSubKeyboard, buildDebateContinueKeyboard, buildRetryKeyboard, buildJudgeToggleKeyboard, getRoles } from '../menus/debateMenu.ts';
import type { Env } from '../types/env.d.ts';

function getPersonaEmoji(persona: string): string {
  const emojis = (PERSONA_THINKING_EMOJIS as any)[persona];
  return emojis?.[0] || '🤖';
}

function getPersonaPrompt(persona: string, lang: string): string {
  const config = (PERSONAS as any)[persona];
  return config?.[lang] || config?.en || 'You are a helpful assistant.';
}

function formatDebateHistory(persona1: string, persona2: string, messages: any[]): { text: string; isEmpty: boolean } {
  if (!messages.length) return { text: '', isEmpty: true };
  const lines: string[] = [];
  let lastSpeaker = '';
  for (const msg of messages) {
    if (!msg.message_text) continue;
    const speakerName = msg.persona_name === persona1 ? persona1 : persona2;
    const speakerEmoji = getPersonaEmoji(speakerName);
    const speaker = msg.persona_name === persona1 ? persona1 : persona2;
    if (speaker !== lastSpeaker) {
      lines.push(`\n${speakerEmoji} **${speaker}:**`);
      lastSpeaker = speaker;
    }
    lines.push(msg.message_text.slice(0, DEBATE_HISTORY_TRUNCATE));
  }
  return { text: lines.join('\n'), isEmpty: false };
}

function buildPersonaSystemPrompt(persona: string, lang: string, role: string, topic: string, style: string, round: number, totalRounds: number): string {
  const personaPrompt = getPersonaPrompt(persona, lang);
  const styleDesc: Record<string, string> = {
    debate: 'a formal debate — argue your position and challenge the other side',
    panel: 'a panel discussion — share your expert perspective on the topic',
    collaboration: 'a collaborative session — work together to explore the topic',
    interview: 'an interview — answer questions and share your insights',
  };
  const styleText = styleDesc[style] || 'a discussion';
  const langRules: Record<string, string> = {
    en: 'Always respond in English.',
    fa: 'همیشه به فارسی پاسخ دهید.',
    ar: 'تحدث بالعربية دائماً.',
    tr: 'Her zaman Türkçe cevap ver.',
    ru: 'Отвечай всегда на русском.',
  };
  const emoji = getPersonaEmoji(persona);
  return [
    `${emoji} You are ${persona}. ${personaPrompt}`,
    `Your role in this discussion is: ${role}.`,
    `You are participating in ${styleText} on the topic: "${topic}"`,
    `This is Round ${round}/${totalRounds}.`,
    (langRules as any)[lang] || langRules.en,
    '',
    'RULES:',
    '- Stay in character as your persona at all times. Use emojis naturally in your speech.',
    '- Respond from your character\'s unique perspective, expertise, and personality.',
    '- Be concise but thorough (2-4 paragraphs).',
    '- Directly address the other participant\'s points and arguments.',
    '- Do NOT repeat what the other person said — build on it or challenge it.',
    '- Use natural dialogue, not bullet points or structured lists.',
    '- Respond with ONLY your dialogue text — do NOT include your name, labels, or prefixes.',
  ].join('\n');
}

export function hasActiveDebateSession(env: Env, chatId: number | string): Promise<any> {
  return getActiveDebateSession(env, chatId);
}

export async function handleDebateMessage(env: Env, chatId: number | string, text: string, lang: string): Promise<boolean> {
  const session = await getActiveDebateSession(env, chatId);
  if (!session || session.setup_step !== 'topic') return false;
  await updateDebateSession(env, session.id, { topic: text, setup_step: 'ready' });
  await initDebate(env, chatId, session.id, lang);
  return true;
}

export async function handleDebateCommand(chatId: number | string, args: string, env: Env, lang: string, userName: string): Promise<void> {
  const userId = Number(chatId);
  const sessionId = await createDebateSession(env, chatId, userId);
  if (args) {
    await updateDebateSession(env, sessionId, { topic: args });
  }
  const msgId = await sendMessageWithId(chatId, t(lang, 'debate_p1_prompt'), env, 'Markdown', buildPersonaCategoryKeyboard(lang, 'p1'));
  if (msgId) {
    await updateDebateSession(env, sessionId, { message_id: msgId });
  }
}

async function initDebate(env: Env, chatId: number | string, sessionId: number, lang: string): Promise<void> {
  const session = await getDebateSession(env, sessionId);
  if (!session) return;
  await updateDebateSession(env, sessionId, { status: 'active', current_round: 0 });
  const msgId = await sendMessageWithId(chatId, `🎭 *${session.persona_1}* vs *${session.persona_2}*\n📌 ${session.topic || 'General discussion'}`, env, 'Markdown');
  if (msgId) {
    await updateDebateSession(env, sessionId, { message_id: msgId });
  }
  await runDebateRound(env, chatId, sessionId, 1, lang);
}

async function runDebateRound(env: Env, chatId: number | string, sessionId: number, roundNumber: number, lang: string): Promise<void> {
  const session = await getDebateSession(env, sessionId);
  if (!session || session.status === 'finished') return;

  const p1 = session.persona_1;
  const p2 = session.persona_2;
  const topic = session.topic || 'General discussion';
  const style = session.style || 'debate';
  const totalRounds = session.max_rounds || 3;
  const [role1, role2] = getRoles(style);
  const debateMsg = session.message_id;
  const isLastRound = roundNumber >= totalRounds;

  await updateDebateSession(env, sessionId, { current_round: roundNumber });
  let roundText = isLastRound ? '' : `━━━━━━━━━━━━━━━━\n🎭 *${topic}* — Round ${roundNumber}/${totalRounds}\n━━━━━━━━━━━━━━━━\n\n`;

  for (const [persona, role] of [[p1, role1], [p2, role2]] as [string, string][]) {
    const history = await getDebateMessages(env, sessionId);
    const { text: formattedHistory, isEmpty: noHistory } = formatDebateHistory(p1!, p2!, history);
    const systemContent = buildPersonaSystemPrompt(persona, lang, role, topic, style, roundNumber, totalRounds);
    const historyBlock = noHistory
      ? `You are starting the discussion on the topic: "${topic}".`
      : `Continue the discussion. The conversation so far:\n${formattedHistory}\n\nNow respond as ${persona} (${role}) — directly address the previous points, build on them or challenge them.`;
    const chatMessages = [
      { role: 'system', content: systemContent },
      { role: 'user', content: historyBlock }
    ];

    const emoji = getPersonaEmoji(persona);
    roundText += `\n${emoji} *${persona}* (${role})\n`;
    if (debateMsg) {
      await editMessage(chatId, debateMsg, roundText.trim(), env, 'Markdown');
    }

    let accumulated = '';
    let personaFailed = false;
    try {
      accumulated = await Promise.race([
        runChat(env, chatMessages, DEBATE_TOKEN_LIMIT, 'fast'),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('AI did not respond')), DEBATE_AI_TIMEOUT)),
      ]);
    } catch (e: any) {
      personaFailed = true;
      logger.error('Debate AI error', { sessionId, persona, error: (e as any).message });
    }

    if (!accumulated) {
      accumulated = '*[No response from AI]*';
      personaFailed = true;
    }

    let cleanText = cleanAIResponseText(accumulated) || '';
    const namePrefix = cleanText.match(new RegExp(`^.{0,5}?${persona.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[:.]`, 'i'));
    if (namePrefix) cleanText = cleanText.slice(namePrefix[0].length).trim();
    roundText += cleanText + '\n';
    if (debateMsg) {
      await editMessage(chatId, debateMsg, roundText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown').catch(() => {});
    }
    await addDebateMessage(env, sessionId, roundNumber, persona, cleanText);

    if (personaFailed) {
      await updateDebateSession(env, sessionId, { setup_step: 'retry' });
      if (debateMsg) {
        const idx = p1 === persona ? 0 : 1;
        await editMessage(chatId, debateMsg, roundText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown', buildRetryKeyboard(lang, idx, roundNumber));
      }
      return;
    }
  }

  await updateDebateSession(env, sessionId, { setup_step: 'active' });

  if (session.judge_enabled && !isLastRound) {
    const judgePersona = session.judge_persona || 'judge';
    const judgeEmoji = getPersonaEmoji(judgePersona);
    const judgeSystem = `You are an impartial discussion judge ${judgeEmoji}. Analyze the arguments just presented in Round ${roundNumber}/${totalRounds} of this ${style} on the topic "${topic}". Provide brief, constructive feedback (1-2 paragraphs). Identify the strongest points from each side. Be fair and insightful. Do NOT declare a winner yet — only analyze this round's arguments.`;
    const roundMsgs = await getDebateMessages(env, sessionId);
    const recentMsgs = roundMsgs.filter(m => m.round_number === roundNumber);
    const judgeInput = `${p1}: ${(recentMsgs.find(m => m.persona_name === p1)?.message_text || '').slice(0, 1500)}\n\n${p2}: ${(recentMsgs.find(m => m.persona_name === p2)?.message_text || '').slice(0, 1500)}`;
    let judgeFeedback = '';
    try {
      judgeFeedback = await Promise.race([
        runChat(env, [
          { role: 'system', content: judgeSystem },
          { role: 'user', content: `Round ${roundNumber} arguments:\n\n${judgeInput}` }
        ], DEBATE_TOKEN_LIMIT, 'fast'),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Judge timed out')), DEBATE_AI_TIMEOUT)),
      ]);
    } catch (e: any) {
      logger.error('Debate judge round error', { sessionId, round: roundNumber, error: e.message });
    }
    if (judgeFeedback) {
      const cleanJudge = cleanAIResponseText(judgeFeedback) || '';
      roundText += `\n━━━ ⚖️ *${judgePersona}* (Judge) ━━━\n${cleanJudge}\n`;
      if (debateMsg) {
        await editMessage(chatId, debateMsg, roundText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown').catch(() => {});
      }
      await addDebateMessage(env, sessionId, roundNumber, judgePersona, cleanJudge);
    }
  }

  if (isLastRound) {
    await finishDebate(env, chatId, sessionId, lang, debateMsg);
  } else {
    if (debateMsg) {
      await editMessage(chatId, debateMsg, (roundText + '\n━━━━━━━━━━━━━━━━').slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown', buildDebateContinueKeyboard(lang, true));
    }
  }
}

async function finishDebate(env: Env, chatId: number | string, sessionId: number, lang: string, debateMsg: number | null): Promise<void> {
  await updateDebateSession(env, sessionId, { status: 'finished' });

  const messages = await getDebateMessages(env, sessionId);
  const session = await getDebateSession(env, sessionId);
  if (!session) return;

  const historyText = messages.map(m =>
    `${m.persona_name}: ${m.message_text.slice(0, 200)}`
  ).join('\n');

  const summaryPrompt = [
    { role: 'system', content: `You are a debate analyst. Summarize the key arguments, counterpoints, and conclusions from this discussion in ${lang}. Be concise and insightful.` },
    { role: 'user', content: `Topic: ${session.topic}\nStyle: ${session.style}\n\nDiscussion:\n${historyText}\n\nProvide a brief summary of who made stronger points, key insights, and the overall outcome.` }
  ];

  let summary = '';
  try {
    summary = await runChat(env, summaryPrompt, TOKEN_LIMIT_MEDIUM, 'fast');
  } catch (e: any) {
    logger.error('Debate summary error', { sessionId, error: (e as any).message });
    summary = 'Debate concluded.';
  }

  const cleanSummary = cleanAIResponseText(summary) || 'Debate concluded.';
  let finalText = `━━━━━━━━━━━━━━━━\n📋 *Debate Summary*\n━━━━━━━━━━━━━━━━\n\n${cleanSummary}`;

  if (session.judge_enabled) {
    const judgePersona = session.judge_persona || 'judge';
    const judgeEmoji = getPersonaEmoji(judgePersona);
    const fullHistory = messages.map(m =>
      `${m.persona_name}: ${(m.message_text || '').slice(0, 300)}`
    ).join('\n');
    const verdictPrompt = [
      { role: 'system', content: `${judgeEmoji} You are the final judge of a ${session.style} discussion. Score each participant out of 10, declare a winner, and explain your reasoning concisely (2-3 paragraphs). Be specific about what each participant did well and where they fell short.` },
      { role: 'user', content: `Topic: ${session.topic}\nStyle: ${session.style}\n\nFull discussion:\n${fullHistory}\n\nProvide your final verdict with scores.` }
    ];
    let verdict = '';
    try {
      verdict = await Promise.race([
        runChat(env, verdictPrompt, DEBATE_TOKEN_LIMIT, 'fast'),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Verdict timed out')), DEBATE_AI_TIMEOUT)),
      ]);
    } catch (e: any) {
      logger.error('Debate verdict error', { sessionId, error: (e as any).message });
    }
    const cleanVerdict = cleanAIResponseText(verdict) || '';
    if (cleanVerdict) {
      finalText += `\n\n━━━━━━━━━━━━━━━━\n⚖️ *${judgePersona}'s Verdict*\n━━━━━━━━━━━━━━━━\n\n${cleanVerdict}`;
    }
  }

  if (debateMsg) {
    await editMessage(chatId, debateMsg, finalText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown');
  } else {
    await sendMessage(chatId, finalText, env, 'Markdown');
  }
}

export async function handleDebateCallback(data: string, chatId: number | string, messageId: number, env: Env, lang: string): Promise<boolean> {
  const session = await getActiveDebateSession(env, chatId);
  if (!session && data !== 'debate_next' && data !== 'debate_end' && data !== 'debate_cancel' && !data.startsWith('debate_retry_')) return false;

  const retryMatch = data.match(/^debate_retry_(\d+)_(\d+)$/);
  if (retryMatch) {
    if (!session) return false;
    const retryRound = parseInt(retryMatch[1], 10);
    if (retryRound !== (session.current_round || 0)) return false;
    await editMessage(chatId, messageId, '🔄 Retrying...', env);
    await deleteDebateRoundMessages(env, session.id, retryRound);
    await runDebateRound(env, chatId, session.id, retryRound, lang);
    return true;
  }

  if (data === 'debate_cancel') {
    if (session) {
      await updateDebateSession(env, session.id, { status: 'finished' });
    }
    await editMessage(chatId, messageId, `❌ ${t(lang, 'debate_cancelled')}`, env);
    return true;
  }

  if (data === 'debate_end') {
    if (!session) return false;
    await finishDebate(env, chatId, session.id, lang, session.message_id);
    return true;
  }

  if (data === 'debate_next') {
    if (!session) return false;
    const nextRound = (session.current_round || 0) + 1;
    if (nextRound > (session.max_rounds || 3)) {
      await finishDebate(env, chatId, session.id, lang, session.message_id);
    } else {
      await runDebateRound(env, chatId, session.id, nextRound, lang);
    }
    return true;
  }

  if (!session) return false;

  if (data.startsWith('debate_cat_')) {
    const rest = data.replace('debate_cat_', '');
    const step = rest.startsWith('p1_') ? 'p1' : rest.startsWith('judge_') ? 'judge' : 'p2';
    const category = rest.replace(/^(p1_|p2_|judge_)/, '');
    const keyboard = buildPersonaSubKeyboard(lang, category, step);
    if (!keyboard) return false;
    const prompts: Record<string, string> = { p1: 'debate_p1_prompt', p2: 'debate_p2_prompt', judge: 'debate_judge_select' };
    await editMessage(chatId, messageId, t(lang, prompts[step] || 'debate_p2_prompt'), env, 'Markdown', keyboard);
    return true;
  }

  const p1Match = data.match(/^debate_p1_(.+)$/);
  if (p1Match) {
    const persona = p1Match[1];
    await updateDebateSession(env, session.id, { persona_1: persona, setup_step: 'p2' });
    await editMessage(chatId, messageId, t(lang, 'debate_p2_prompt'), env, 'Markdown', buildPersonaCategoryKeyboard(lang, 'p2'));
    return true;
  }

  const p2Match = data.match(/^debate_p2_(.+)$/);
  if (p2Match) {
    const persona = p2Match[1];
    if (persona === session.persona_1) {
      await editMessage(chatId, messageId, '❌ Cannot select the same persona twice!', env, 'Markdown', buildPersonaCategoryKeyboard(lang, 'p2'));
      return true;
    }
    await updateDebateSession(env, session.id, { persona_2: persona, setup_step: 'style' });
    await editMessage(chatId, messageId, t(lang, 'debate_style_prompt'), env, 'Markdown', buildStyleKeyboard(lang));
    return true;
  }

  const styleMatch = data.match(/^debate_style_(.+)$/);
  if (styleMatch) {
    const style = styleMatch[1];
    await updateDebateSession(env, session.id, { style, setup_step: 'rounds' });
    await editMessage(chatId, messageId, t(lang, 'debate_rounds_prompt'), env, 'Markdown', buildRoundsKeyboard(lang));
    return true;
  }

  const roundsMatch = data.match(/^debate_rounds_(\d+)$/);
  if (roundsMatch) {
    const roundVal = Math.min(MAX_DEBATE_ROUNDS, Math.max(MIN_DEBATE_ROUNDS, parseInt(roundsMatch[1], 10)));
    await updateDebateSession(env, session.id, { max_rounds: roundVal, setup_step: 'judge_ask' });
    await editMessage(chatId, messageId, t(lang, 'debate_judge_ask'), env, 'Markdown', buildJudgeToggleKeyboard(lang));
    return true;
  }

  if (data === 'debate_judge_yes') {
    await updateDebateSession(env, session.id, { setup_step: 'judge' });
    await editMessage(chatId, messageId, t(lang, 'debate_judge_select'), env, 'Markdown', buildPersonaCategoryKeyboard(lang, 'judge'));
    return true;
  }

  if (data === 'debate_judge_no') {
    await proceedFromJudge(env, chatId, messageId, session, lang);
    return true;
  }

  const judgeSelMatch = data.match(/^debate_judge_(.+)$/);
  if (judgeSelMatch) {
    const persona = judgeSelMatch[1];
    await updateDebateSession(env, session.id, { judge_enabled: 1, judge_persona: persona });
    await proceedFromJudge(env, chatId, messageId, session, lang);
    return true;
  }

  return false;
}

async function proceedFromJudge(env: Env, chatId: number | string, messageId: number, session: any, lang: string): Promise<void> {
  const updated = await getDebateSession(env, session.id);
  if (updated?.topic) {
    await updateDebateSession(env, session.id, { setup_step: 'ready' });
    await editMessage(chatId, messageId, `🎭 ${t(lang, 'debate_intro')}`, env);
    await initDebate(env, chatId, session.id, lang);
  } else {
    await updateDebateSession(env, session.id, { setup_step: 'topic' });
    await editMessage(chatId, messageId, t(lang, 'debate_topic_prompt'), env, 'Markdown');
  }
}
