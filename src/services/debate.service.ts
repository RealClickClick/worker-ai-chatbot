import { sendMessage, sendMessageWithId, editMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import { runChat, cleanAIResponseText } from '../ai.ts';
import { MAX_MESSAGE_LENGTH, TOKEN_LIMIT_MEDIUM, DEBATE_TOKEN_LIMIT, DEBATE_AI_TIMEOUT, DEBATE_HISTORY_TRUNCATE } from '../constants.ts';
import { getActiveDebateSession, createDebateSession, updateDebateSession, getDebateSession, 
getDebateMessages, addDebateMessage, deleteDebateRoundMessages, deleteDebateRoundPersonaMessage } from './index.ts';
import { logger } from '../utils/logger.ts';
import { PERSONAS } from '../../config/personas.ts';
import { PERSONA_THINKING_EMOJIS } from '../../config/persona-emojis.ts';
import { buildDebateContinueKeyboard, buildRetryKeyboard, getRoles } from '../menus/debateMenu.ts';
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
  let lastRound = 0;
  for (const msg of messages) {
    if (!msg.message_text) continue;
    if (msg.persona_name !== persona1 && msg.persona_name !== persona2) continue;
    if (msg.round_number && msg.round_number !== lastRound) {
      if (lastRound > 0) lines.push('');
      lines.push(`[Round ${msg.round_number}]`);
      lastRound = msg.round_number;
      lastSpeaker = '';
    }
    const speakerEmoji = getPersonaEmoji(msg.persona_name);
    const speaker = msg.persona_name;
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
    brainstorm: 'a brainstorming session — generate creative ideas freely, no wrong answers',
    negotiation: 'a negotiation — advocate for your position and find common ground',
    cross_examine: 'a cross-examination — one side questions deeply, the other defends',
    storytelling: 'a collaborative storytelling session — build a narrative together, turn by turn',
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

async function buildRoundDisplayText(env: Env, sessionId: number, p1: string, p2: string, topic: string, roundNumber: number, totalRounds: number): Promise<string> {
  const messages = await getDebateMessages(env, sessionId);
  const roundMsgs = messages.filter(m => m.round_number === roundNumber);
  const { text: formattedHistory } = formatDebateHistory(p1, p2, roundMsgs);
  const header = `━━━━━━━━━━━━━━━━\n🎭 *${topic}* — Round ${roundNumber}/${totalRounds}\n━━━━━━━━━━━━━━━━\n\n`;
  return header + formattedHistory;
}

async function generateAITurn(env: Env, sessionId: number, persona: string, role: string, lang: string, topic: string, style: string, roundNumber: number, totalRounds: number, history: any[], p1: string, p2: string): Promise<string> {
  const { text: formattedHistory, isEmpty: noHistory } = formatDebateHistory(p1, p2, history);
  const systemContent = buildPersonaSystemPrompt(persona, lang, role, topic, style, roundNumber, totalRounds);
  const historyBlock = noHistory
    ? `You are starting the discussion on the topic: "${topic}".`
    : `Continue the discussion. The conversation so far:\n${formattedHistory}\n\nNow respond as ${persona} (${role}) — directly address the previous points, build on them or challenge them.`;
  const chatMessages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: historyBlock }
  ];
  try {
    const result = await Promise.race([
      runChat(env, chatMessages, DEBATE_TOKEN_LIMIT, 'fast'),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('AI did not respond')), DEBATE_AI_TIMEOUT)),
    ]);
    return result;
  } catch (e: any) {
    logger.error('Debate AI error', { sessionId, persona, error: e.message });
    return '';
  }
}

function cleanPersonaResponse(text: string, persona: string): string {
  let cleanText = cleanAIResponseText(text) || '';
  const namePrefix = cleanText.match(new RegExp(`^.{0,5}?${persona.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[:.]`, 'i'));
  if (namePrefix) cleanText = cleanText.slice(namePrefix[0].length).trim();
  return cleanText || '_(no response)_';
}

async function runJudgeRound(env: Env, sessionId: number, chatId: number | string, roundNumber: number, roundText: string, p1: string, p2: string, style: string, topic: string, debateMsg: number | null, lang: string): Promise<string> {
  const session = await getDebateSession(env, sessionId);
  if (!session) return roundText;
  if (!session.judge_enabled && !session.judge_persona) return roundText;
  const judgePersona = session.judge_persona || 'judge';
  const judgeEmoji = getPersonaEmoji(judgePersona);
  const judgeSystem = `You are an impartial discussion judge ${judgeEmoji}. Analyze the arguments just presented in Round ${roundNumber} of this ${style} on the topic "${topic}". Provide brief, constructive feedback (1-2 paragraphs). Identify the strongest points from each side. Be fair and insightful. Do NOT declare a winner yet — only analyze this round's arguments.`;
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
  return roundText;
}

async function finishDebate(env: Env, chatId: number | string, sessionId: number, lang: string, debateMsg: number | null): Promise<void> {
  await updateDebateSession(env, sessionId, { status: 'finished' });

  const messages = await getDebateMessages(env, sessionId);
  const session = await getDebateSession(env, sessionId);
  if (!session) return;

  const historyText = messages.map(m =>
    `${m.persona_name}: ${(m.message_text || '').slice(0, 300)}`
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
    const verdictPrompt = [
      { role: 'system', content: `${judgeEmoji} You are the final judge of a ${session.style} discussion. Score each participant out of 10, declare a winner, and explain your reasoning concisely (2-3 paragraphs). Be specific about what each participant did well and where they fell short.` },
      { role: 'user', content: `Topic: ${session.topic}\nStyle: ${session.style}\n\nFull discussion:\n${historyText}\n\nProvide your final verdict with scores.` }
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

export async function runDebateRound(env: Env, chatId: number | string, sessionId: number, roundNumber: number, lang: string): Promise<void> {
  const session = await getDebateSession(env, sessionId);
  if (!session || session.status === 'finished') return;

  const p1 = session.persona_1;
  const p2 = session.persona_2;
  const topic = session.topic || 'General discussion';
  const style = session.style || 'debate';
  const totalRounds = session.max_rounds || 3;
  const [role1, role2] = getRoles(style, !!session.roles_swapped);
  const debateMsg = session.message_id;
  const isLastRound = roundNumber >= totalRounds;

  await updateDebateSession(env, sessionId, { current_round: roundNumber });
  let roundText = isLastRound ? '' : `━━━━━━━━━━━━━━━━\n🎭 *${topic}* — Round ${roundNumber}/${totalRounds}\n━━━━━━━━━━━━━━━━\n\n`;

  for (const [persona, role] of [[p1, role1], [p2, role2]] as [string, string][]) {
    if (session.participant_persona && persona === session.participant_persona) {
      const emoji = getPersonaEmoji(persona);
      roundText += `\n${emoji} *${persona}* (${role})\n`;
      if (debateMsg) {
        await editMessage(chatId, debateMsg, roundText.trim(), env, 'Markdown');
      }
      const now = new Date().toISOString();
      await updateDebateSession(env, sessionId, { setup_step: 'waiting_user', waiting_since: now });
      const prompt = t(lang, 'debate_your_turn', { round: String(roundNumber) });
      await sendMessage(chatId, prompt, env);
      return;
    }

    const history = await getDebateMessages(env, sessionId);
    const emoji = getPersonaEmoji(persona);
    roundText += `\n${emoji} *${persona}* (${role})\n`;
    if (debateMsg) {
      await editMessage(chatId, debateMsg, roundText.trim(), env, 'Markdown');
    }

    let accumulated = '';
    let personaFailed = false;
    accumulated = await generateAITurn(env, sessionId, persona, role, lang, topic, style, roundNumber, totalRounds, history, p1!, p2!);
    if (!accumulated) {
      accumulated = '*[No response from AI]*';
      personaFailed = true;
    }

    let cleanText = cleanPersonaResponse(accumulated, persona);
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

  roundText = await runJudgeRound(env, sessionId, chatId, roundNumber, roundText, p1!, p2!, style, topic, debateMsg, lang);

  try {
    if (isLastRound) {
      await finishDebate(env, chatId, sessionId, lang, debateMsg);
    } else {
      const continueText = (roundText + '\n━━━━━━━━━━━━━━━━').slice(0, MAX_MESSAGE_LENGTH);
      if (debateMsg) {
        await editMessage(chatId, debateMsg, continueText, env, 'Markdown', buildDebateContinueKeyboard(lang, true));
      } else {
        await sendMessage(chatId, continueText, env, 'Markdown', buildDebateContinueKeyboard(lang, true));
      }
    }
  } catch (e: any) {
    logger.error('Debate continue/finish error', { sessionId, round: roundNumber, error: e.message });
  }
}

export async function resumeDebateRoundAfterUser(env: Env, chatId: number | string, sessionId: number, userText: string, lang: string): Promise<void> {
  const session = await getDebateSession(env, sessionId);
  if (!session || session.status !== 'active') return;

  const p1 = session.persona_1!;
  const p2 = session.persona_2!;
  const topic = session.topic || 'General discussion';
  const style = session.style || 'debate';
  const roundNumber = session.current_round;
  const totalRounds = session.max_rounds || 3;
  const [role1, role2] = getRoles(style, !!session.roles_swapped);
  const debateMsg = session.message_id;
  const isLastRound = roundNumber >= totalRounds;
  const participantPersona = session.participant_persona!;

  await addDebateMessage(env, sessionId, roundNumber, participantPersona, userText);
  let roundText = await buildRoundDisplayText(env, sessionId, p1, p2, topic, roundNumber, totalRounds);
  if (debateMsg) {
    await editMessage(chatId, debateMsg, roundText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown').catch(() => {});
  }

  const userIsP1 = participantPersona === p1;
  {
    const opponentPersona = userIsP1 ? p2 : p1;
    const opponentRole = userIsP1 ? role2 : role1;
    if (!opponentPersona) return;
    const history = await getDebateMessages(env, sessionId);
    const result = await generateAITurn(env, sessionId, opponentPersona, opponentRole, lang, topic, style, roundNumber, totalRounds, history, p1, p2);
    let cleanText = cleanPersonaResponse(result, opponentPersona);
    roundText += `\n${getPersonaEmoji(opponentPersona)} *${opponentPersona}* (${opponentRole})\n${cleanText}\n`;
    if (debateMsg) {
      await editMessage(chatId, debateMsg, roundText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown').catch(() => {});
    }
    await addDebateMessage(env, sessionId, roundNumber, opponentPersona, cleanText);
  }

  await updateDebateSession(env, sessionId, { setup_step: 'active' });

  roundText = await runJudgeRound(env, sessionId, chatId, roundNumber, roundText, p1, p2, style, topic, debateMsg, lang);

  try {
    if (isLastRound) {
      await finishDebate(env, chatId, sessionId, lang, debateMsg);
    } else {
      const continueText = (roundText + '\n━━━━━━━━━━━━━━━━').slice(0, MAX_MESSAGE_LENGTH);
      if (debateMsg) {
        await editMessage(chatId, debateMsg, continueText, env, 'Markdown', buildDebateContinueKeyboard(lang, true));
      } else {
        await sendMessage(chatId, continueText, env, 'Markdown', buildDebateContinueKeyboard(lang, true));
      }
    }
  } catch (e: any) {
    logger.error('Debate continue/finish error (after user)', { sessionId, round: roundNumber, error: e.message });
  }
}

export async function retryPersonaInRound(env: Env, chatId: number | string, sessionId: number, roundNumber: number, personaIndex: number, lang: string): Promise<void> {
  const session = await getDebateSession(env, sessionId);
  if (!session || session.status !== 'active') return;

  const p1 = session.persona_1!;
  const p2 = session.persona_2!;
  const topic = session.topic || 'General discussion';
  const style = session.style || 'debate';
  const totalRounds = session.max_rounds || 3;
  const [role1, role2] = getRoles(style, !!session.roles_swapped);
  const debateMsg = session.message_id;
  const isLastRound = roundNumber >= totalRounds;

  const failedPersona = personaIndex === 0 ? p1 : p2;
  await deleteDebateRoundPersonaMessage(env, sessionId, roundNumber, failedPersona);

  let roundText = await buildRoundDisplayText(env, sessionId, p1, p2, topic, roundNumber, totalRounds);

  const personas = personaIndex === 0
    ? [[p1, role1], [p2, role2]] as [string, string][]
    : [[p2, role2]] as [string, string][];

  for (const [persona, role] of personas) {
    if (session.participant_persona && persona === session.participant_persona) {
      const emoji = getPersonaEmoji(persona);
      roundText += `\n${emoji} *${persona}* (${role})\n`;
      if (debateMsg) {
        await editMessage(chatId, debateMsg, roundText.trim(), env, 'Markdown');
      }
      const now = new Date().toISOString();
      await updateDebateSession(env, sessionId, { setup_step: 'waiting_user', waiting_since: now });
      const prompt = t(lang, 'debate_your_turn', { round: String(roundNumber) });
      await sendMessage(chatId, prompt, env);
      return;
    }

    const history = await getDebateMessages(env, sessionId);
    const emoji = getPersonaEmoji(persona);
    roundText += `\n${emoji} *${persona}* (${role})\n`;
    if (debateMsg) {
      await editMessage(chatId, debateMsg, roundText.trim(), env, 'Markdown');
    }

    const result = await generateAITurn(env, sessionId, persona, role, lang, topic, style, roundNumber, totalRounds, history, p1, p2);
    const cleanText = cleanPersonaResponse(result || '*[No response from AI]*', persona);
    roundText += cleanText + '\n';
    if (debateMsg) {
      await editMessage(chatId, debateMsg, roundText.slice(0, MAX_MESSAGE_LENGTH), env, 'Markdown').catch(() => {});
    }
    await addDebateMessage(env, sessionId, roundNumber, persona, cleanText);
  }

  await updateDebateSession(env, sessionId, { setup_step: 'active' });

  roundText = await runJudgeRound(env, sessionId, chatId, roundNumber, roundText, p1, p2, style, topic, debateMsg, lang);

  try {
    if (isLastRound) {
      await finishDebate(env, chatId, sessionId, lang, debateMsg);
    } else {
      const continueText = (roundText + '\n━━━━━━━━━━━━━━━━').slice(0, MAX_MESSAGE_LENGTH);
      if (debateMsg) {
        await editMessage(chatId, debateMsg, continueText, env, 'Markdown', buildDebateContinueKeyboard(lang, true));
      } else {
        await sendMessage(chatId, continueText, env, 'Markdown', buildDebateContinueKeyboard(lang, true));
      }
    }
  } catch (e: any) {
    logger.error('Debate retry continue/finish error', { sessionId, round: roundNumber, error: e.message });
  }
}

export { finishDebate, initDebate, getPersonaEmoji, formatDebateHistory, buildPersonaSystemPrompt };
