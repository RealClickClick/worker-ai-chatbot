import { sendMessage } from '../telegram.ts';
import { t } from '../locales.ts';
import { createWorkflow, listWorkflows, getWorkflow, deleteWorkflow, parseWorkflowSteps, validateWorkflowName } from '../repositories/workflow.repo.ts';
import { executeWorkflow } from '../services/workflow.service.ts';
import { logger } from '../utils/logger.ts';
import type { Env } from '../types/env.d.ts';

export async function handleWorkflow(
  chatId: number | string, args: string, env: Env, lang: string,
): Promise<any> {
  if (!args) return await sendMessage(chatId, t(lang, 'workflow_usage'), env, 'Markdown');

  const parts = args.split(' ');
  const cmd = parts[0].toLowerCase();

  if (cmd === 'create') {
    const rest = args.slice('create'.length).trim();
    const separatorIndex = rest.indexOf('|');
    if (separatorIndex === -1) {
      return await sendMessage(chatId, t(lang, 'workflow_create_usage'), env, 'Markdown');
    }
    const name = validateWorkflowName(rest.slice(0, separatorIndex));
    if (!name) return await sendMessage(chatId, t(lang, 'workflow_invalid_name'), env);

    const stepsRaw = rest.slice(separatorIndex + 1).trim();
    const stepTexts = stepsRaw.split('|').map(s => s.trim()).filter(Boolean);
    if (stepTexts.length < 2) {
      return await sendMessage(chatId, t(lang, 'workflow_too_few_steps'), env);
    }
    const steps = stepTexts.map((text, i) => {
      const colonIdx = text.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        return { label: text.slice(0, colonIdx).trim(), prompt: text.slice(colonIdx + 1).trim() };
      }
      return { label: `Step ${i + 1}`, prompt: text };
    });

    const ok = await createWorkflow(env, chatId, name, steps);
    if (!ok) return await sendMessage(chatId, t(lang, 'workflow_create_failed'), env);
    return await sendMessage(chatId, t(lang, 'workflow_created', { name, count: String(steps.length) }), env, 'Markdown');
  }

  if (cmd === 'list') {
    const workflows = await listWorkflows(env, chatId);
    if (!workflows.length) return await sendMessage(chatId, t(lang, 'workflow_list_empty'), env);
    const list = workflows.map((w, i) => {
      const steps = parseWorkflowSteps(w.steps);
      return `${i + 1}. \`${w.name}\` — ${steps.length} steps`;
    }).join('\n');
    return await sendMessage(chatId, t(lang, 'workflow_list_title', { list }), env, 'Markdown');
  }

  if (cmd === 'view') {
    const name = parts.slice(1).join(' ');
    if (!name) return await sendMessage(chatId, t(lang, 'workflow_view_usage'), env);
    const workflow = await getWorkflow(env, chatId, name);
    if (!workflow) return await sendMessage(chatId, t(lang, 'workflow_not_found'), env);
    const steps = parseWorkflowSteps(workflow.steps);
    const stepList = steps.map((s, i) => `  ${i + 1}. *${s.label}*: ${s.prompt.slice(0, 200)}`).join('\n');
    return await sendMessage(chatId, t(lang, 'workflow_view', { name: workflow.name, steps: stepList, count: String(steps.length) }), env, 'Markdown');
  }

  if (cmd === 'delete') {
    const name = parts.slice(1).join(' ');
    if (!name) return await sendMessage(chatId, t(lang, 'workflow_delete_usage'), env);
    const ok = await deleteWorkflow(env, chatId, name);
    if (!ok) return await sendMessage(chatId, t(lang, 'workflow_not_found'), env);
    return await sendMessage(chatId, t(lang, 'workflow_deleted', { name }), env);
  }

  if (cmd === 'run') {
    const name = parts.slice(1).join(' ');
    if (!name) return await sendMessage(chatId, t(lang, 'workflow_run_usage'), env);
    try {
      await executeWorkflow(env, chatId, name, lang);
    } catch (e: any) {
      logger.error('Workflow execution error', { chatId, name, error: e.message });
      return await sendMessage(chatId, t(lang, 'workflow_run_failed', { name, error: e.message }), env);
    }
    return;
  }

  return await sendMessage(chatId, t(lang, 'workflow_usage'), env, 'Markdown');
}
