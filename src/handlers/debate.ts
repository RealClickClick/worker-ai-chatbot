import { sendMessage, sendMessageWithId, editMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import { MAX_MESSAGE_LENGTH, MIN_DEBATE_ROUNDS, MAX_DEBATE_ROUNDS, DEBATE_USER_TIMEOUT } from '../constants.ts';
import { getActiveDebateSession, createDebateSession, updateDebateSession, getDebateSession, 
getDebateMessages, addDebateMessage, deleteDebateRoundMessages, getDebateSessions,
saveDebateTemplate, getDebateTemplates } from '../services/index.ts';
import { runDebateRound, resumeDebateRoundAfterUser, initDebate, finishDebate, getPersonaEmoji } from '../services/debate.service.ts';
import { logger } from '../utils/logger.ts';
import { buildStyleKeyboard, buildRoundsKeyboard, buildPersonaCategoryKeyboard, buildPersonaSubKeyboard, buildDebateContinueKeyboard, buildRetryKeyboard, buildJudgeToggleKeyboard, buildParticipateKeyboard, buildPickSideKeyboard, buildRoleSwapKeyboard, isAsymmetricStyle } from '../menus/debateMenu.ts';
import type { Env } from '../types/env.d.ts';

export function hasActiveDebateSession(env: Env, chatId: number | string): Promise<any> {
  return getActiveDebateSession(env, chatId);
}

export async function handleDebateMessage(env: Env, chatId: number | string, text: string, lang: string): Promise<boolean> {
  const session = await getActiveDebateSession(env, chatId);
  if (!session) return false;
  if (session.setup_step === 'topic') {
    await updateDebateSession(env, session.id, { topic: text, setup_step: 'ready' });
    await initDebate(env, chatId, session.id, lang);
    return true;
  }
  if (session.setup_step === 'waiting_user') {
    if (session.waiting_since) {
      const elapsed = Date.now() - new Date(session.waiting_since).getTime();
      if (elapsed > DEBATE_USER_TIMEOUT) {
        await updateDebateSession(env, session.id, { status: 'finished' });
        await sendMessage(chatId, `⏰ ${t(lang, 'debate_timeout')}`, env);
        return true;
      }
    }
    await resumeDebateRoundAfterUser(env, chatId, session.id, text, lang);
    return true;
  }
  return false;
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

export async function handleDebateCallback(data: string, chatId: number | string, messageId: number, env: Env, lang: string): Promise<boolean> {
  const templateMatch = data.match(/^debate_template_(\d+)$/);
  if (templateMatch) {
    const templates = await getDebateTemplates(env, chatId);
    const tmpl = templates.find(t => t.id === parseInt(templateMatch[1], 10));
    if (!tmpl) {
      await editMessage(chatId, messageId, '❌ Template not found.', env);
      return true;
    }
    const userId = Number(chatId);
    const sessionId = await createDebateSession(env, chatId, userId);
    await updateDebateSession(env, sessionId, { persona_1: tmpl.persona_1, persona_2: tmpl.persona_2, style: tmpl.style, setup_step: 'rounds' });
    await editMessage(chatId, messageId, t(lang, 'debate_rounds_prompt'), env, 'Markdown', buildRoundsKeyboard(lang));
    return true;
  }

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
    if (isAsymmetricStyle(style) && session.persona_1 && session.persona_2) {
      await editMessage(chatId, messageId, t(lang, 'debate_roles_prompt'), env, 'Markdown', buildRoleSwapKeyboard(lang, session.persona_1, session.persona_2));
      return true;
    }
    await editMessage(chatId, messageId, t(lang, 'debate_rounds_prompt'), env, 'Markdown', buildRoundsKeyboard(lang));
    return true;
  }

  if (data === 'debate_roles_default' || data === 'debate_roles_swapped') {
    const swapped = data === 'debate_roles_swapped' ? 1 : 0;
    await updateDebateSession(env, session.id, { roles_swapped: swapped, setup_step: 'rounds' });
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
    await updateDebateSession(env, session.id, { setup_step: 'participate_ask' });
    await editMessage(chatId, messageId, t(lang, 'debate_participate_ask'), env, 'Markdown', buildParticipateKeyboard(lang));
    return true;
  }

  const judgeSelMatch = data.match(/^debate_judge_(.+)$/);
  if (judgeSelMatch) {
    const persona = judgeSelMatch[1];
    try {
      await updateDebateSession(env, session.id, { judge_enabled: 1, judge_persona: persona });
    } catch {
      logger.warn('Judge columns not available (migration v16 may not have run yet), proceeding without judge', { sessionId: session.id });
    }
    await updateDebateSession(env, session.id, { setup_step: 'participate_ask' });
    await editMessage(chatId, messageId, t(lang, 'debate_participate_ask'), env, 'Markdown', buildParticipateKeyboard(lang));
    return true;
  }

  if (data === 'debate_participate_yes') {
    await updateDebateSession(env, session.id, { setup_step: 'pick_side' });
    await editMessage(chatId, messageId, t(lang, 'debate_participate_pick'), env, 'Markdown', buildPickSideKeyboard(lang, session.persona_1!, session.persona_2!));
    return true;
  }

  if (data === 'debate_participate_no') {
    await proceedToTopicOrReady(env, chatId, messageId, session, lang);
    return true;
  }

  if (data === 'debate_pick_1') {
    await updateDebateSession(env, session.id, { participant_persona: session.persona_1, setup_step: 'participate_done' });
    await proceedToTopicOrReady(env, chatId, messageId, session, lang);
    return true;
  }

  if (data === 'debate_pick_2') {
    await updateDebateSession(env, session.id, { participant_persona: session.persona_2, setup_step: 'participate_done' });
    await proceedToTopicOrReady(env, chatId, messageId, session, lang);
    return true;
  }

  return false;
}

async function proceedToTopicOrReady(env: Env, chatId: number | string, messageId: number, session: any, lang: string): Promise<void> {
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

export async function handleDebateHistory(chatId: number | string, env: Env, lang: string): Promise<void> {
  const sessions = await getDebateSessions(env, chatId, 10);
  if (!sessions.length) {
    await sendMessage(chatId, t(lang, 'debate_history_empty'), env);
    return;
  }
  const lines = sessions.map((s, i) =>
    `${i + 1}. 🎭 *${s.persona_1 || '?'}* vs *${s.persona_2 || '?'}*\n   📌 ${(s.topic || '—').slice(0, 50)} | 🏁 ${s.max_rounds} rounds`
  );
  await sendMessage(chatId, `${t(lang, 'debate_history_title', { count: String(sessions.length) })}\n\n${lines.join('\n\n')}`, env, 'Markdown');
}

export async function handleDebateSaveTemplate(chatId: number | string, name: string, env: Env, lang: string): Promise<void> {
  if (!name) {
    await sendMessage(chatId, t(lang, 'debate_template_usage_save'), env);
    return;
  }
  const session = await getActiveDebateSession(env, chatId);
  if (!session || !session.persona_1 || !session.persona_2) {
    await sendMessage(chatId, t(lang, 'debate_template_no_active'), env);
    return;
  }
  await saveDebateTemplate(env, chatId, name.trim(), session.persona_1, session.persona_2, session.style || 'debate');
  await sendMessage(chatId, t(lang, 'debate_template_saved', { name: name.trim() }), env);
}

export async function handleDebateListTemplates(chatId: number | string, env: Env, lang: string): Promise<void> {
  const templates = await getDebateTemplates(env, chatId);
  if (!templates.length) {
    await sendMessage(chatId, t(lang, 'debate_template_empty'), env);
    return;
  }
  const keyboard = {
    inline_keyboard: templates.map(t => ([{
      text: `🎭 ${t.name} (${t.persona_1} vs ${t.persona_2})`,
      callback_data: `debate_template_${t.id}`
    }]))
  };
  keyboard.inline_keyboard.push([{ text: t(lang, 'debate_end'), callback_data: 'debate_cancel' }]);
  await sendMessage(chatId, t(lang, 'debate_template_list'), env, 'Markdown', keyboard);
}

export async function handleDebateExport(chatId: number | string, env: Env, lang: string, sessionId?: number): Promise<void> {
  let session: any;
  if (sessionId) {
    session = await getDebateSession(env, sessionId);
  } else {
    const sessions = await getDebateSessions(env, chatId, 1);
    session = sessions[0] || null;
  }
  if (!session) {
    await sendMessage(chatId, t(lang, 'debate_history_empty'), env);
    return;
  }
  const messages = await getDebateMessages(env, session.id);
  if (!messages.length) {
    await sendMessage(chatId, 'No messages in this debate.', env);
    return;
  }
  const lines: string[] = [
    `# 🎭 Debate: ${session.persona_1 || '?'} vs ${session.persona_2 || '?'}`,
    `**Topic:** ${session.topic || 'General'}`,
    `**Style:** ${session.style || 'debate'}`,
    `**Rounds:** ${session.current_round}/${session.max_rounds}`,
    '',
    '---',
    '',
  ];
  let currentRound = 0;
  for (const msg of messages) {
    if (msg.round_number !== currentRound) {
      if (currentRound > 0) lines.push('');
      currentRound = msg.round_number;
      lines.push(`## Round ${currentRound}`);
      lines.push('');
    }
    const emoji = getPersonaEmoji(msg.persona_name);
    lines.push(`### ${emoji} ${msg.persona_name}`);
    lines.push('');
    lines.push(msg.message_text);
    lines.push('');
  }
  const text = lines.join('\n').slice(0, MAX_MESSAGE_LENGTH * 2);
  if (text.length > MAX_MESSAGE_LENGTH) {
    for (let i = 0; i < text.length; i += MAX_MESSAGE_LENGTH) {
      await sendMessage(chatId, text.slice(i, i + MAX_MESSAGE_LENGTH), env, 'Markdown');
    }
  } else {
    await sendMessage(chatId, text, env, 'Markdown');
  }
}
