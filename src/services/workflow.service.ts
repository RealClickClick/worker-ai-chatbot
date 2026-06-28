import { sendMessage, sendChatAction } from '../telegram.ts';
import { t } from '../locales.ts';
import { runChat } from '../ai.ts';
import { getTokenLimit } from '../ai.ts';
import { getWorkflow, parseWorkflowSteps } from '../repositories/workflow.repo.ts';
import { safe } from '../utils/error.ts';
import { logger } from '../utils/logger.ts';
import type { Env } from '../types/env.d.ts';
import type { WorkflowStep } from '../types/d1.ts';

interface WorkflowResult {
  stepResults: { label: string; output: string }[];
}

function substituteVariables(prompt: string, vars: Record<string, string>): string {
  let result = prompt;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

export async function executeWorkflow(
  env: Env, chatId: number | string, workflowName: string, lang: string,
): Promise<WorkflowResult> {
  const row = await getWorkflow(env, chatId, workflowName);
  if (!row) throw new Error('Workflow not found');

  const steps = parseWorkflowSteps(row.steps);
  if (!steps.length) throw new Error('Workflow has no steps');

  const stepResults: { label: string; output: string }[] = [];
  const vars: Record<string, string> = {};

  await sendMessage(chatId, t(lang, 'workflow_started', { name: row.name, count: String(steps.length) }), env, 'Markdown');

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepKey = `step${i + 1}`;
    const label = step.label || `Step ${i + 1}`;

    await sendChatAction(chatId, env, 'typing');
    await sendMessage(chatId, t(lang, 'workflow_step_running', { current: String(i + 1), total: String(steps.length), label }), env, 'Markdown');

    const prompt = substituteVariables(step.prompt, vars);
    const tokenLimit = getTokenLimit('medium', { modelKey: 'fast' });
    const result = await safe(() => runChat(env, [{ role: 'user', content: prompt }], tokenLimit, 'fast'), 'workflowStep');

    const output = result || t(lang, 'workflow_step_empty');
    stepResults.push({ label, output });
    vars[stepKey] = output;

    await sendMessage(chatId, t(lang, 'workflow_step_done', { current: String(i + 1), total: String(steps.length), label, output: output.slice(0, 1000) }), env, 'Markdown');
  }

  await sendMessage(chatId, t(lang, 'workflow_completed', { name: row.name, count: String(steps.length) }), env, 'Markdown');

  return { stepResults };
}
