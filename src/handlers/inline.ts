import { answerInlineQuery } from '../telegram.ts';
import { runChat, cleanAIResponseText, buildSystemPrompt, getTokenLimit, getLengthRule } from '../ai.ts';
import { parseMarkdownToTelegramHTML } from '../parsers/htmlParser.ts';
import { getSettings } from '../services/index.ts';
import { getLang } from '../locales.ts';
import { getCachedResponse, setCachedResponse } from '../utils/cache.ts';
import { logger } from '../utils/logger.ts';
import type { Env, TelegramInlineQuery, UserSettings } from '../types/env.d.ts';

const INLINE_CACHE_TTL = 60;
const MAX_INLINE_RESULTS = 5;

export async function handleInlineQuery(iq: TelegramInlineQuery, env: Env): Promise<void> {
  const query = iq.query.trim();
  if (!query) {
    return await answerInlineQuery(iq.id, [], env, INLINE_CACHE_TTL);
  }

  const userId = String(iq.from.id);
  const settings = await getSettings(env, userId) as UserSettings;
  const lang = getLang(iq.from, settings.lang, query);
  const userName = iq.from.first_name || 'User';
  const lengthRule = getLengthRule('short', lang);
  const tokenLimit = getTokenLimit('short', { modelKey: settings.ai_model });
  const systemContent = buildSystemPrompt(settings.persona, userName, lang, lengthRule, settings.bot_name || undefined);

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: query }
  ];

  let responseText = await getCachedResponse(settings.ai_model, systemContent, [{ role: 'user', content: query }]);
  if (!responseText) {
    responseText = await runChat(env, messages, tokenLimit, settings.ai_model).catch((e: any) => {
      logger.error('Inline AI error', { userId, error: e.message });
      return null;
    });
    if (responseText) {
      await setCachedResponse(settings.ai_model, systemContent, [{ role: 'user', content: query }], responseText);
    }
  }

  if (!responseText) {
    return await answerInlineQuery(iq.id, [
      {
        type: 'article',
        id: 'error',
        title: 'Error',
        input_message_content: { message_text: 'AI response failed. Try again later.' },
        description: 'Server error occurred',
      }
    ], env, INLINE_CACHE_TTL);
  }

  const cleanText = cleanAIResponseText(responseText);
  const displayText = settings.formatting === 'plain' ? cleanText : parseMarkdownToTelegramHTML(cleanText);
  const previewText = cleanText.length > 100 ? cleanText.slice(0, 100) + '...' : cleanText;

  const results = [
    {
      type: 'article',
      id: 'result-1',
      title: previewText.split('\n')[0],
      input_message_content: {
        message_text: displayText,
        parse_mode: settings.formatting === 'plain' ? undefined : 'HTML',
      },
      description: previewText,
    }
  ];

  await answerInlineQuery(iq.id, results, env, INLINE_CACHE_TTL);
}
