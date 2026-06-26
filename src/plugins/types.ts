import type { Env, TelegramMessage, TelegramUpdate } from '../types/env.d.ts';

export interface PluginMeta {
  name: string;
  version: string;
  description: string;
}

export interface PluginContext {
  env: Env;
  chatId: number | string;
  userId?: number;
  userName?: string;
  lang: string;
  message?: TelegramMessage;
  update?: TelegramUpdate;
}

export interface Plugin {
  meta: PluginMeta;
  onInit?(env: Env): Promise<void>;
  onMessage?(ctx: PluginContext): Promise<boolean | void>;
  onCommand?(command: string, args: string, ctx: PluginContext): Promise<string | null | void>;
  onAfterResponse?(ctx: PluginContext, responseText: string): Promise<string | void>;
  onScheduled?(env: Env, cron: string): Promise<void>;
}
