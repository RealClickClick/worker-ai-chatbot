import type { Plugin, PluginContext } from './types.ts';
import type { Env, TelegramMessage, TelegramUpdate } from '../types/env.d.ts';
import { logger } from '../utils/logger.ts';

export class PluginRegistry {
  private plugins: Plugin[] = [];

  register(plugin: Plugin): void {
    this.plugins.push(plugin);
    logger.info('Plugin registered', { name: plugin.meta.name, version: plugin.meta.version });
  }

  async initAll(env: Env): Promise<void> {
    for (const p of this.plugins) {
      try {
        await p.onInit?.(env);
        logger.info('Plugin initialized', { name: p.meta.name });
      } catch (e: any) {
        logger.error('Plugin init failed', { name: p.meta.name, error: e.message });
      }
    }
  }

  async dispatchOnMessage(ctx: PluginContext): Promise<boolean> {
    for (const p of this.plugins) {
      try {
        const result = await p.onMessage?.(ctx);
        if (result === true) return true;
      } catch (e: any) {
        logger.error('Plugin onMessage error', { name: p.meta.name, error: e.message });
      }
    }
    return false;
  }

  async dispatchOnCommand(command: string, args: string, ctx: PluginContext): Promise<string | null> {
    for (const p of this.plugins) {
      try {
        const result = await p.onCommand?.(command, args, ctx);
        if (result !== undefined && result !== null) return result;
      } catch (e: any) {
        logger.error('Plugin onCommand error', { name: p.meta.name, command, error: e.message });
      }
    }
    return null;
  }

  async dispatchOnAfterResponse(ctx: PluginContext, responseText: string): Promise<string> {
    let text = responseText;
    for (const p of this.plugins) {
      try {
        const result = await p.onAfterResponse?.(ctx, text);
        if (result !== undefined) text = result;
      } catch (e: any) {
        logger.error('Plugin onAfterResponse error', { name: p.meta.name, error: e.message });
      }
    }
    return text;
  }

  async dispatchOnScheduled(env: Env, cron: string): Promise<void> {
    for (const p of this.plugins) {
      try {
        await p.onScheduled?.(env, cron);
      } catch (e: any) {
        logger.error('Plugin onScheduled error', { name: p.meta.name, cron, error: e.message });
      }
    }
  }

  getPlugins(): Plugin[] {
    return [...this.plugins];
  }
}

export const registry = new PluginRegistry();
