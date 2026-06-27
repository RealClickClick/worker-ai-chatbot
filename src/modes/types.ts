import type { Env, TelegramMessage } from '../types/env.d.ts';

export interface ModeMeta {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface ModeContext {
  env: Env;
  chatId: number | string;
  userId: number;
  userName: string;
  lang: string;
  modeData: string | null;
}

export interface ModeResult {
  consumed: boolean;
  response?: string;
  replyMarkup?: any;
  newModeData?: string | null;
  /** If true, the registry also clears active_mode and mode_data from DB */
  deactivate?: boolean;
}

export interface Mode {
  meta: ModeMeta;

  onActivate(ctx: ModeContext): Promise<string>;
  onDeactivate(ctx: ModeContext): Promise<string>;
  handleMessage(ctx: ModeContext, text: string, message: TelegramMessage): Promise<ModeResult>;
  handleCallback(ctx: ModeContext, data: string, messageId: number): Promise<ModeResult>;
}

export interface PersistedModeState {
  activeMode: string | null;
  modeData: string | null;
}
