import type { ToolDefinition } from '../types.ts';

const TIMEZONE_ALIASES: Record<string, string> = {
  tehran: 'Asia/Tehran',
  istanbul: 'Europe/Istanbul',
  moscow: 'Europe/Moscow',
  london: 'Europe/London',
  paris: 'Europe/Paris',
  berlin: 'Europe/Berlin',
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  chicago: 'America/Chicago',
  dubai: 'Asia/Dubai',
  tokyo: 'Asia/Tokyo',
  shanghai: 'Asia/Shanghai',
  beijing: 'Asia/Shanghai',
  seoul: 'Asia/Seoul',
  mumbai: 'Asia/Kolkata',
  delhi: 'Asia/Kolkata',
  sydney: 'Australia/Sydney',
  toronto: 'America/Toronto',
  vancouver: 'America/Vancouver',
  singapore: 'Asia/Singapore',
  'hong kong': 'Asia/Hong_Kong',
};

export const timeTool: ToolDefinition = {
  name: 'time',
  description: 'Get the current date and time for any city or timezone around the world.',
  parameters: {
    location: { type: 'string', description: 'City name or timezone (e.g., Tehran, London, New York, Asia/Tehran)', required: true },
  },
  execute: async (params) => {
    const input = params.location?.trim();
    if (!input) return 'Please provide a city or timezone.';
    const tz = TIMEZONE_ALIASES[input.toLowerCase()] || input;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const formatted = formatter.format(now);
      const timezoneName = tz.split('/').pop()?.replace(/_/g, ' ') || tz;
      const utcOffset = (() => {
        try {
          const offset = -new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' });
          return 'UTC' + (offset >= 0 ? '+' : '') + offset;
        } catch { return ''; }
      })();
      return [
        `Location: ${input}`,
        `Timezone: ${tz}`,
        `Date & Time: ${formatted}`,
      ].join('\n');
    } catch {
      try {
        const now = new Date().toLocaleString('en-US', { timeZone: tz });
        return `Time at ${input}: ${now}`;
      } catch {
        return `Could not find timezone for "${input}". Try a major city name like "Tehran", "London", or "Tokyo".`;
      }
    }
  },
};
