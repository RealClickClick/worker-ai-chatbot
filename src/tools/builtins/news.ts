import type { ToolDefinition } from '../types.ts';
import { FETCH_TIMEOUT_MS } from '../../constants.ts';

const FALLBACK_NEWS = [
  { title: 'No news API key configured (NEWS_API_KEY)', description: 'Set NEWS_API_KEY env var or use another tool.' },
];

export const newsTool: ToolDefinition = {
  name: 'news',
  description: 'Get latest news headlines. Optionally filter by topic (technology, business, science, health, sports, entertainment, world).',
  parameters: {
    topic: { type: 'string', description: 'News topic/category (technology, business, science, health, sports, entertainment, world, or leave empty for top headlines)' },
  },
  execute: async (params, env) => {
    const topic = params.topic?.trim().toLowerCase() || '';
    const apiKey = env?.NEWS_API_KEY || '';
    if (!apiKey) {
      return `News API key not configured. To enable, set NEWS_API_KEY environment variable.\n\nSample headlines:\n${FALLBACK_NEWS.map(n => `• ${n.title}`).join('\n')}`;
    }
    try {
      const categoryMap: Record<string, string> = {
        technology: 'technology', business: 'business', science: 'science',
        health: 'health', sports: 'sports', entertainment: 'entertainment',
        world: 'general', general: 'general',
      };
      const category = categoryMap[topic] || '';
      const url = category
        ? `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=5&apiKey=${apiKey}`
        : `https://newsapi.org/v2/top-headlines?pageSize=5&apiKey=${apiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return `News API error (${res.status}).`;
      const data = await res.json() as any;
      if (!data.articles?.length) return `No news found${topic ? ` for topic "${topic}"` : ''}.`;
      return data.articles.slice(0, 5).map((a: any, i: number) =>
        `${i + 1}. ${a.title}${a.source?.name ? ` — ${a.source.name}` : ''}${a.description ? `\n   ${a.description.slice(0, 200)}` : ''}`
      ).join('\n\n');
    } catch (e: any) {
      return `News fetch failed: ${e.message}`;
    }
  },
};
