import type { Plugin } from '../types.ts';

export const examplePlugin: Plugin = {
  meta: {
    name: 'example',
    version: '1.0.0',
    description: 'Example plugin demonstrating the plugin system',
  },

  async onCommand(command, args, ctx) {
    if (command === '/hello' || command === '/hi') {
      return `Hello, ${ctx.userName || 'User'}! This is the Example Plugin v${this.meta.version}.`;
    }
    if (command === '/ping') {
      return 'pong';
    }
    return null;
  },

  async onAfterResponse(_ctx, responseText) {
    const wordCount = responseText.split(/\s+/).filter(Boolean).length;
    return `${responseText}\n\n_📊 Word count: ${wordCount}_`;
  },
};
