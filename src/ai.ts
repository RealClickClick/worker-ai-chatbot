import type { Env } from './types/env.d.ts';
import { PERSONAS, PERSONA_LABELS } from '../config/personas.ts';
import { t } from './locales.ts';
import { TOKEN_LIMIT_SHORT, TOKEN_LIMIT_MEDIUM, TOKEN_LIMIT_LONG, TOKEN_LIMIT_BALANCED_BONUS, VISION_MAX_TOKENS } from './constants.ts';
import { retry, AIError } from './utils/error.ts';
import { getCachedSearch, setCachedSearch } from './utils/cache.ts';
import { logger } from './utils/logger.ts';

export interface ModelConfig {
  id: string;
  label: string;
  vision: boolean;
  provider?: 'cloudflare' | 'google_direct';
}

export const MODELS: Record<string, ModelConfig> = {
  fast:         { id: '@cf/meta/llama-3.1-8b-instruct-fp8',                label: 'model_fast',         vision: false, provider: 'cloudflare' },
  balanced:     { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',     label: 'model_balanced',     vision: false, provider: 'cloudflare' },
  powerful:     { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',         label: 'model_powerful',     vision: false, provider: 'cloudflare' },
  glm:          { id: '@cf/zai-org/glm-5.2',                               label: 'model_glm',          vision: false, provider: 'cloudflare' },
  vision:       { id: '@cf/meta/llama-3.2-11b-vision-instruct',           label: 'model_vision',       vision: true,  provider: 'cloudflare' },
  llama4:       { id: '@cf/meta/llama-4-scout-17b-16e-instruct',          label: 'model_llama4',       vision: false, provider: 'cloudflare' },
  gemma4:       { id: '@cf/google/gemma-4-26b-a4b-it',                    label: 'model_gemma4',       vision: false, provider: 'cloudflare' },
  qwen_coder:   { id: '@cf/qwen/qwen3-30b-a3b-fp8',                       label: 'model_qwen_coder',   vision: false, provider: 'cloudflare' },
  gemini_flash: { id: 'gemini-2.5-flash',                                  label: 'model_gemini_flash', vision: false, provider: 'google_direct' },
  gemini_flash_3: { id: 'gemini-3-flash',                                  label: 'model_gemini_flash_3', vision: false, provider: 'google_direct' },
  openai:       { id: '@cf/openai/gpt-oss-120b',                          label: 'model_openai',       vision: false, provider: 'cloudflare' },
  kimi:         { id: '@cf/moonshotai/kimi-k2.7-code',                    label: 'model_kimi',         vision: false, provider: 'cloudflare' },
  openai_small: { id: '@cf/openai/gpt-oss-20b',                           label: 'model_openai_small', vision: false, provider: 'cloudflare' },
  mistral:      { id: '@cf/mistralai/mistral-small-3.1-24b-instruct',     label: 'model_mistral',      vision: false, provider: 'cloudflare' },
  nemotron:     { id: '@cf/nvidia/nemotron-3-120b-a12b',                  label: 'model_nemotron',     vision: false, provider: 'cloudflare' },
};

export const IMAGE_MODELS: Record<string, { id: string; label: string }> = {
  sdxl:         { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',     label: 'img_sdxl' },
  flux:         { id: '@cf/black-forest-labs/flux-1-schnell',             label: 'img_flux' },
  lightning:    { id: '@cf/bytedance/stable-diffusion-xl-lightning',      label: 'img_lightning' },
  flux2_dev:    { id: '@cf/black-forest-labs/flux-2-dev',                 label: 'img_flux2_dev' },
  lucid:        { id: '@cf/leonardo/lucid-origin',                        label: 'img_lucid' },
  klein4b:      { id: '@cf/black-forest-labs/flux-2-klein-4b',            label: 'img_klein4b' },
  klein9b:      { id: '@cf/black-forest-labs/flux-2-klein-9b',            label: 'img_klein9b' },
  phoenix:      { id: '@cf/leonardo/phoenix-1.0',                         label: 'img_phoenix' },
  dreamshaper:  { id: '@cf/lykon/dreamshaper-8-lcm',                      label: 'img_dreamshaper' },
};

const CHAT_MODEL = '@cf/meta/llama-3.2-3b-instruct';
const BRAVE_URL = 'https://api.search.brave.com/res/v1/web/search';

export function getModel(modelKey: string): ModelConfig {
  return MODELS[modelKey] || MODELS.fast;
}

export function buildGroupSystemPrompt(persona: string, userName: string, lang: string, lengthRule: string, botName?: string): string {
  const base = buildSystemPrompt(persona, userName, lang, lengthRule, botName);
  const groupRules: Record<string, string> = {
    en: '\n\n[GROUP CHAT RULES]\n- This is a group chat with multiple users. Each message is prefixed with the sender\'s name.\n- Pay attention to who said what and maintain conversation context.\n- When replying to a specific user, address them by name.\n- Use the reply chain context to understand threaded conversations.\n- Only respond when directly addressed or when you have something valuable to add.\n- SILENCE RULE: If the conversation does NOT need your input (e.g. users talking among themselves, agreements, casual chatter), respond with exactly: [SILENT]',
    fa: '\n\n[قوانین گروه]\n- این یک گروه با چند کاربر است. هر پیام با نام فرستنده مشخص شده.\n- دقت کنید که چه کسی چه گفته و بافتار مکالمه را حفظ کنید.\n- وقتی به کاربر خاصی پاسخ می‌دهید، با نامش خطاب کنید.\n- از زنجیره ریپلای برای درک مکالمات زنجیره‌ای استفاده کنید.\n- فقط زمانی پاسخ دهید که مستقیم خطاب شده‌اید یا مطلب ارزشمندی برای اضافه دارید.\n- قانون سکوت: اگر مکالمه به ورودی شما نیاز ندارد، دقیقاً پاسخ دهید: [SILENT]',
    ar: '\n\n[قواعد المجموعة]\n- هذه مجموعة دردشة مع عدة مستخدمين. كل رسالة مسبوقة باسم المرسل.\n- انتبه لمن قال ماذا وحافظ على سياق المحادثة.\n- عند الرد على مستخدم معين، خاطبه باسمه.\n- استخدم سياق سلسلة الردود لفهم المحادثات المتسلسلة.\n- قم بالرد فقط عندما يتم مخاطبتك مباشرة أو عندما يكون لديك شيء قيّم لإضافته.\n- قاعدة الصمت: إذا كانت المحادثة لا تحتاج إلى مدخلاتك، رد بالضبط: [SILENT]',
    tr: '\n\n[GRUP KURALLARI]\n- Bu, birden çok kullanıcılı bir grup sohbetidir. Her mesaj gönderenin adıyla öncelenir.\n- Kimin ne söylediğine dikkat edin ve konuşma bağlamını koruyun.\n- Belirli bir kullanıcıya yanıt verirken onlara adıyla hitap edin.\n- Zincirleme konuşmaları anlamak için yanıt zinciri bağlamını kullanın.\n- Yalnızca doğrudan size hitap edildiğinde veya ekleyecek değerli bir şeyiniz olduğunda yanıt verin.\n- SESSİZLİK KURALI: Konuşma sizin girdinizi gerektirmiyorsa, aynen şöyle yanıt verin: [SILENT]',
    ru: '\n\n[ПРАВИЛА ГРУППЫ]\n- Это групповой чат с несколькими пользователями. Каждое сообщение имеет префикс с именем отправителя.\n- Обращайте внимание на то, кто что сказал, и сохраняйте контекст беседы.\n- Отвечая конкретному пользователю, обращайтесь к нему по имени.\n- Используйте контекст цепочки ответов для понимания вложенных бесед.\n- Отвечайте только когда к вам напрямую обращаются или когда у вас есть ценная информация.\n- ПРАВИЛО ТИШИНЫ: Если разговор не требует вашего участия, ответьте ровно: [SILENT]',
  };
  return base + (groupRules[lang] || groupRules.en);
}

export function buildSystemPrompt(persona: string, userName: string, lang: string, lengthRule: string, botName?: string): string {
  const personaConfig = (PERSONAS as Record<string, any>)[persona] || PERSONAS.standard;
  const personaDesc = personaConfig[lang] || personaConfig.en;
  const LANG_INST: Record<string, string> = {
    en: 'Always respond in English.',
    fa: 'همیشه به فارسی پاسخ دهید.',
    ar: 'تحدث بالعربية دائماً.',
    tr: 'Her zaman Türkçe cevap ver.',
    ru: 'Отвечай всегда на русском.'
  };
  const NAME_INST: Record<string, string> = {
    en: `The person chatting with you is named ${userName}.`,
    fa: `شخصی که با شما صحبت می‌کند ${userName} نام دارد.`,
    ar: `الشخص الذي يتحدث معك اسمه ${userName}.`,
    tr: `Sizinle sohbet eden kişinin adı ${userName}.`,
    ru: `Человека, который с вами разговаривает, зовут ${userName}.`
  };
  const name = NAME_INST[lang] || NAME_INST.en;
  const langInst = LANG_INST[lang] || LANG_INST.en;
  if (botName) {
    let content = `You are ${botName}. ${personaDesc}`;
    content += `\n${langInst}`;
    content += `\n${name}`;
    content += `\nCRITICAL RULE: ${lengthRule}\n`;
    content += `FORMAT: **bold**, \`code\`, \`\`\`lang...\`\`\`, *italic*, emojis, - lists\n`;
    content += `CODE: English identifiers (names/vars/comments) ONLY, never translate code syntax`;
    return content;
  }
  const personaLabel = (PERSONA_LABELS as Record<string, any>)[persona];
  const personaName = (personaLabel?.[lang] || personaLabel?.en || 'AI Assistant').replace(/^[^\s]+\s/, '');
  let content = `You are ${personaName}. ${personaDesc}`;
  content += `\n${langInst}`;
  content += `\n${name}`;
  content += `\nCRITICAL RULE: ${lengthRule}\n`;
  content += `FORMAT: **bold**, \`code\`, \`\`\`lang...\`\`\`, *italic*, emojis, - lists\n`;
  content += `CODE: English identifiers (names/vars/comments) ONLY, never translate code syntax`;
  return content;
}

export function getLengthRule(length: string, lang: string): string {
  return t(lang, `length_rule_${length}`);
}

export function getTokenLimit(length: string, { modelKey }: { modelKey?: string } = {}): number {
  const isGoogleModel = modelKey?.startsWith('gemini');
  let base;
  switch (length) {
    case 'short':  base = isGoogleModel ? TOKEN_LIMIT_MEDIUM : TOKEN_LIMIT_SHORT;  break;
    case 'medium': base = TOKEN_LIMIT_MEDIUM;  break;
    case 'long':   base = TOKEN_LIMIT_LONG; break;
    default:       base = isGoogleModel ? TOKEN_LIMIT_MEDIUM : TOKEN_LIMIT_SHORT;
  }
  if (modelKey === 'balanced') base += TOKEN_LIMIT_BALANCED_BONUS;
  return base;
}

function getFinishReason(response: any): string | null {
  const fr = response?.result?.usage?.finish_reason
    ?? response?.usage?.finish_reason
    ?? response?.choices?.[0]?.finish_reason
    ?? response?.choices?.[0]?.stop_reason
    ?? null;
  return fr ? String(fr).toLowerCase() : null;
}

export function extractText(response: any): string | null {
  if (!response) return null;
  if (typeof response === 'string') return response;
  if (response.response) return response.response;
  if (response.result?.response) return response.result.response;
  if (response.choices?.length > 0) {
    return response.choices[0].message?.content ?? response.choices[0].text ?? null;
  }
  return null;
}

export async function runGoogleGeminiChat(env: Env, messages: any[], maxTokens: number, modelName: string): Promise<string> {
  const apiKey = env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new AIError('GOOGLE_GEMINI_API_KEY not set. Get a free key at https://aistudio.google.com/apikey');

  let systemInstruction: any = undefined;
  let contents = messages;

  if (messages[0]?.role === 'system') {
    systemInstruction = { parts: [{ text: messages[0].content }] };
    contents = messages.slice(1);
  }

  const geminiContents = contents.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: any = {
    contents: geminiContents,
    generationConfig: { maxOutputTokens: maxTokens },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  return retry(async () => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body) },
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new AIError(`Gemini API error (${res.status}): ${errText}`);
    }
    const data = await res.json() as any;
    const finishReason = data?.candidates?.[0]?.finishReason;
    const safetyRatings = data?.candidates?.[0]?.safetyRatings;
    const usage = data?.usageMetadata;
    if (finishReason && finishReason !== 'STOP') {
      logger.warn('Gemini response incomplete', { model: modelName, finishReason, safetyRatings, usage });
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (text === null || text === undefined) throw new AIError('Empty Gemini response');
    return text;
  }, { ctx: `runGoogleGeminiChat:${modelName}` });
}

export async function runChat(env: Env, messages: any[], maxTokens: number, modelKey = 'fast'): Promise<string> {
  const model = getModel(modelKey);

  if (model.provider === 'google_direct') {
    return runGoogleGeminiChat(env, messages, maxTokens, model.id);
  }

  // Some models (gemma4) return empty response with long system prompts
  // Workaround: merge system message into the first user message
  if (modelKey === 'gemma4' && messages[0]?.role === 'system') {
    const systemMsg = messages[0];
    const rest = messages.slice(1);
    if (rest.length > 0) {
      messages = [{ role: 'user', content: systemMsg.content + '\n\n---\n' + rest[0].content }, ...rest.slice(1)];
    } else {
      messages = [{ role: 'user', content: systemMsg.content }];
    }
  }
  // GLM may not handle system role; convert to user role instead
  if (modelKey === 'glm' && messages[0]?.role === 'system') {
    messages = [{ role: 'user', content: messages[0].content }, ...messages.slice(1)];
  }
  return retry(async () => {
    const res = await env.AI.run(model.id, { max_tokens: maxTokens, temperature: 0.7, messages }) as any;
    const finishReason = getFinishReason(res);
    if (finishReason && finishReason !== 'stop' && finishReason !== 'end_turn') {
      logger.warn('AI response may be incomplete', { model: modelKey, finishReason, maxTokens });
    }
    const text = extractText(res);
    if (text === null || text === undefined) throw new AIError('Empty AI response');
    return text || '';
  }, { ctx: `runChat:${modelKey}` });
}

export async function* runGoogleGeminiChatStreaming(env: Env, messages: any[], maxTokens: number, modelName: string): AsyncGenerator<string> {
  const apiKey = env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) throw new AIError('GOOGLE_GEMINI_API_KEY not set');

  let systemInstruction: any = undefined;
  let contents = messages;
  if (messages[0]?.role === 'system') {
    systemInstruction = { parts: [{ text: messages[0].content }] };
    contents = messages.slice(1);
  }
  const geminiContents = contents.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const body: any = {
    contents: geminiContents,
    generationConfig: { maxOutputTokens: maxTokens },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body) },
  );
  if (!res.ok) throw new AIError(`Gemini streaming API error (${res.status})`);

  const reader = res.body?.getReader();
  if (!reader) throw new AIError('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch { }
      }
    }
  }
}

export async function* runChatStreaming(env: Env, messages: any[], maxTokens: number, modelKey = 'fast'): AsyncGenerator<string> {
  const model = getModel(modelKey);

  if (model.provider === 'google_direct') {
    yield* runGoogleGeminiChatStreaming(env, messages, maxTokens, model.id);
    return;
  }

  if (modelKey === 'gemma4' && messages[0]?.role === 'system') {
    const systemMsg = messages[0];
    const rest = messages.slice(1);
    if (rest.length > 0) {
      messages = [{ role: 'user', content: systemMsg.content + '\n\n---\n' + rest[0].content }, ...rest.slice(1)];
    } else {
      messages = [{ role: 'user', content: systemMsg.content }];
    }
  }
  if (modelKey === 'glm' && messages[0]?.role === 'system') {
    messages = [{ role: 'user', content: messages[0].content }, ...messages.slice(1)];
  }

  const res = await env.AI.run(model.id, { stream: true, max_tokens: maxTokens, temperature: 0.7, messages }) as any;

  if (res instanceof ReadableStream) {
    const reader = res.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.response || parsed?.choices?.[0]?.delta?.content || '';
            if (text) yield text;
          } catch { }
        }
      }
    }
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim();
      if (data !== '[DONE]') {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.response || parsed?.choices?.[0]?.delta?.content || '';
          if (text) yield text;
        } catch { }
      }
    }
    return;
  }

  if (res?.[Symbol.asyncIterator]) {
    for await (const chunk of res) {
      const text = chunk?.response || chunk?.choices?.[0]?.delta?.content || '';
      if (text) yield text;
    }
    return;
  }

  const text = extractText(res);
  if (text) yield text;
}

export async function runVision(env: Env, prompt: string, imageBytes: number[] | Uint8Array): Promise<string> {
  return retry(async () => {
    const res = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [
        { role: 'user', content: [
          { type: 'text', text: prompt } as any,
          { type: 'image', image: [...imageBytes] } as any
        ]}
      ] as any,
      max_tokens: VISION_MAX_TOKENS
    } as any);
    return extractText(res) || JSON.stringify(res);
  }, { ctx: 'runVision' });
}

export function getImageModel(modelKey: string): { id: string; label: string } {
  return IMAGE_MODELS[modelKey] || IMAGE_MODELS.sdxl;
}

export async function runImageGeneration(env: Env, prompt: string, modelKey = 'sdxl'): Promise<any> {
  const model = getImageModel(modelKey);
  const result = await retry(() => env.AI.run(model.id, { prompt }), { ctx: `runImageGeneration:${modelKey}` });
  const raw = result?.image ?? result?.result?.image ?? result;
  logger.info('AI image response', { type: typeof raw, constructor: raw?.constructor?.name, length: raw?.length || raw?.byteLength });
  if (raw instanceof Uint8Array) return raw;
  if (raw instanceof ArrayBuffer) return new Uint8Array(raw);
  if (Array.isArray(raw)) return new Uint8Array(raw);
  if (raw instanceof ReadableStream) {
    const buffer = await new Response(raw).arrayBuffer();
    return new Uint8Array(buffer);
  }
  if (typeof raw === 'string') {
    try {
      const b64 = raw.replace(/^data:image\/\w+;base64,/, '');
      return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    } catch (e: any) {
      return raw;
    }
  }
  return raw;
}

export async function transcribeAudio(env: Env, audioBytes: number[] | Uint8Array): Promise<string | null> {
  try {
    const uint8 = audioBytes instanceof Uint8Array ? audioBytes : new Uint8Array(audioBytes);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);
    const res = await env.AI.run('@cf/openai/whisper-large-v3-turbo', {
      audio: base64,
    }) as any;
    if (typeof res === 'string') return res;
    if (res?.text) return res.text;
    return null;
  } catch (e: any) {
    logger.error('Transcription error', { error: e.message });
    return null;
  }
}

const TTS_MODEL = '@cf/deepgram/aura-2-en';

export async function runTTS(env: Env, text: string): Promise<Uint8Array | null> {
  try {
    const res = await env.AI.run(TTS_MODEL, { text: text.slice(0, 500), encoding: 'mp3' }) as any;
    if (res instanceof ReadableStream) {
      const chunks: Uint8Array[] = [];
      const reader = res.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const totalLen = chunks.reduce((s, c) => s + c.length, 0);
      const combined = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      return combined;
    }
    if (res instanceof Uint8Array) return res;
    if (res?.audio instanceof Uint8Array) return res.audio;
    if (res?.data) return new Uint8Array(res.data);
    if (res?.result) return new Uint8Array(res.result);
    logger.warn('TTS unknown response format', { type: typeof res, constructor: res?.constructor?.name });
    return null;
  } catch (e: any) {
    logger.error('TTS error', { error: e.message });
    return null;
  }
}

export async function enhancePrompt(env: Env, rawPrompt: string): Promise<string> {
  const res = await env.AI.run(CHAT_MODEL, {
    messages: [
      { role: 'system', content: 'Turn the simple user idea into a highly detailed, cinematic English prompt for Stable Diffusion. Return ONLY the prompt text.' },
      { role: 'user', content: rawPrompt }
    ]
  });
  return extractText(res) || rawPrompt;
}

export function cleanAIResponseText(text: string): string {
  let clean = text
    .replace(/<\|?think\|?>[\s\S]*?<\/\|?think\|?>/g, '')
    .replace(/<\|?think\|?>[\s\S]*/g, '')
    .replace(/^[\s\n]+/, '').trim();
  if (!clean) {
    clean = text.replace(/<\|?think\|?>[\s\S]*?<\/\|?think\|?>/g, '').replace(/<\/??\|?think\|??>/g, '').trim();
  }
  return clean;
}

export function buildReplyMarkup(lang: string, feedbackEnabled: boolean, translateActive = false): any {
  const rows: any[][] = [];
  if (feedbackEnabled) {
    rows.push([{ text: t(lang, 'regen_label'), callback_data: 'regen' }, { text: '👍', callback_data: 'feedback_good' }, { text: '👎', callback_data: 'feedback_bad' }]);
  }
  if (translateActive) {
    rows.push([{ text: t(lang, 'translate_mode_cancel'), callback_data: 'translate_cancel' }]);
  }
  return rows.length > 0 ? { inline_keyboard: rows } : undefined;
}

export async function webSearch(env: Env, query: string): Promise<string | null> {
  const apiKey = env.BRAVE_API_KEY;
  if (!apiKey) return null;
  const cached = getCachedSearch(query);
  if (cached) return cached;
  try {
    const results = await retry(async () => {
      const res = await fetch(`${BRAVE_URL}?q=${encodeURIComponent(query)}&count=5`, {
        headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': apiKey }
      });
      if (!res.ok) return null;
      const data: any = await res.json();
      if (!data.web?.results?.length) return null;
      return data.web.results.map((r: any) => `• [${r.title}](${r.url})\n  ${r.description || ''}`).join('\n\n');
    });
    if (results) setCachedSearch(query, results);
    return results;
  } catch (e: any) { return null; }
}
