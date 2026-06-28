import { logger } from '../utils/logger.ts';
import type { Env } from '../types/env.d.ts';
import type { WorkflowRow, WorkflowStep } from '../types/d1.ts';

export async function createWorkflow(
  env: Env, chatId: number | string, name: string, steps: WorkflowStep[],
): Promise<boolean> {
  if (!env.DB) return false;
  try {
    await env.DB.prepare(
      `INSERT INTO workflows (chat_id, name, steps) VALUES (?, ?, ?)`
    ).bind(String(chatId), name, JSON.stringify(steps)).run();
    return true;
  } catch (e: any) {
    logger.error('createWorkflow error', { chatId, name, error: e.message });
    return false;
  }
}

export async function getWorkflow(
  env: Env, chatId: number | string, name: string,
): Promise<WorkflowRow | null> {
  if (!env.DB) return null;
  try {
    return await env.DB.prepare(
      `SELECT * FROM workflows WHERE chat_id = ? AND name = ?`
    ).bind(String(chatId), name).first<WorkflowRow>();
  } catch (e: any) {
    logger.error('getWorkflow error', { chatId, name, error: e.message });
    return null;
  }
}

export async function listWorkflows(
  env: Env, chatId: number | string,
): Promise<WorkflowRow[]> {
  if (!env.DB) return [];
  try {
    const result = await env.DB.prepare(
      `SELECT id, name, steps, created_at, updated_at FROM workflows WHERE chat_id = ? ORDER BY created_at DESC`
    ).bind(String(chatId)).all<WorkflowRow>();
    return result.results || [];
  } catch (e: any) {
    logger.error('listWorkflows error', { chatId, error: e.message });
    return [];
  }
}

export async function deleteWorkflow(
  env: Env, chatId: number | string, name: string,
): Promise<boolean> {
  if (!env.DB) return false;
  try {
    await env.DB.prepare(
      `DELETE FROM workflows WHERE chat_id = ? AND name = ?`
    ).bind(String(chatId), name).run();
    return true;
  } catch (e: any) {
    logger.error('deleteWorkflow error', { chatId, name, error: e.message });
    return false;
  }
}

export function parseWorkflowSteps(stepsJson: string): WorkflowStep[] {
  try {
    const steps = JSON.parse(stepsJson);
    return Array.isArray(steps) ? steps : [];
  } catch {
    return [];
  }
}

export function validateWorkflowName(name: string): string | null {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9_\u0600-\u06FF\u0400-\u04FF-]/g, '');
  if (!cleaned || cleaned.length > 50) return null;
  return cleaned;
}
