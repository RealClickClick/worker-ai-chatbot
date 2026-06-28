import type { Mode, ModeContext, ModeResult } from './types.ts';
import type { TelegramMessage } from '../types/env.d.ts';
import { logger } from '../utils/logger.ts';
import { setActiveMode, setModeData, clearModeState } from '../repositories/settings.repo.ts';
import { examMode } from './exam.ts';
import { quizMode } from './quiz.ts';
import { teacherMode } from './teacher.ts';
import { brainstormMode } from './brainstorm.ts';

const modes = new Map<string, Mode>();

export function registerMode(mode: Mode): void {
  modes.set(mode.meta.id, mode);
  logger.info('Mode registered', { id: mode.meta.id, name: mode.meta.name });
}

export function getMode(id: string): Mode | undefined {
  return modes.get(id);
}

export function getAllModes(): Mode[] {
  return [...modes.values()];
}

export function initModes(): void {
  registerMode(examMode);
  registerMode(quizMode);
  registerMode(teacherMode);
  registerMode(brainstormMode);
}

/** Dispatches a message to the active mode, persists modeData if changed. Returns null if no mode active. */
export async function handleModeMessageWithState(
  ctx: ModeContext,
  text: string,
  message: TelegramMessage,
  activeModeStr: string | null,
): Promise<ModeResult | null> {
  if (!activeModeStr) return null;
  const mode = modes.get(activeModeStr);
  if (!mode) return null;
  try {
    const result = await mode.handleMessage(ctx, text, message);
    if (result.consumed) {
      const { env, chatId } = ctx;
      if (result.deactivate) {
        await clearModeState(env, chatId).catch(() => {});
      } else if (result.newModeData !== undefined) {
        await setModeData(env, chatId, result.newModeData).catch(() => {});
      }
    }
    return result;
  } catch (e: any) {
    logger.error('Mode handleMessage error', { mode: activeModeStr, error: e.message });
    return null;
  }
}

/** Dispatches a callback to the active mode. Returns null if not handled. */
export async function handleModeCallbackWithState(
  ctx: ModeContext,
  data: string,
  messageId: number,
  activeModeStr: string | null,
): Promise<ModeResult | null> {
  if (!activeModeStr) return null;
  if (!data.startsWith(`mode_${activeModeStr}_`)) return null;
  const mode = modes.get(activeModeStr);
  if (!mode) return null;
  try {
    const result = await mode.handleCallback(ctx, data, messageId);
    if (result.consumed) {
      const { env, chatId } = ctx;
      if (result.deactivate) {
        await clearModeState(env, chatId).catch(() => {});
      } else if (result.newModeData !== undefined) {
        await setModeData(env, chatId, result.newModeData).catch(() => {});
      }
    }
    return result;
  } catch (e: any) {
    logger.error('Mode handleCallback error', { mode: activeModeStr, error: e.message });
    return null;
  }
}

/** Activates a mode: persists mode ID, runs onActivate. */
export async function activateMode(modeId: string, env: any, chatId: number | string, userId: number, userName: string, lang: string): Promise<string | null> {
  const mode = modes.get(modeId);
  if (!mode) return null;
  const msg = await mode.onActivate({ env, chatId, userId, userName, lang, modeData: null });
  await setActiveMode(env, chatId, modeId).catch(() => {});
  return msg;
}

/** Deactivates current mode: clears from DB, runs onDeactivate. */
export async function deactivateMode(env: any, chatId: number | string, userId: number, userName: string, lang: string, currentMode: string | null): Promise<string | null> {
  if (currentMode) {
    const mode = modes.get(currentMode);
    if (mode) {
      const msg = await mode.onDeactivate({ env, chatId, userId, userName, lang, modeData: null });
      await clearModeState(env, chatId).catch(() => {});
      return msg;
    }
  }
  await clearModeState(env, chatId).catch(() => {});
  return null;
}

export function getModeIcon(modeId: string): string {
  const mode = modes.get(modeId);
  return mode ? mode.meta.icon : '';
}
