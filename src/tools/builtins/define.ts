import type { ToolDefinition } from '../types.ts';
import { FETCH_TIMEOUT_MS } from '../../constants.ts';

export const defineTool: ToolDefinition = {
  name: 'define',
  description: 'Get the dictionary definition, pronunciation, and examples of a word in English.',
  parameters: {
    word: { type: 'string', description: 'Word to look up in the dictionary', required: true },
  },
  execute: async (params) => {
    const word = params.word?.trim().toLowerCase();
    if (!word) return 'Please provide a word to define.';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) {
        if (res.status === 404) return `No definition found for "${word}".`;
        return `Dictionary lookup failed (${res.status}).`;
      }
      const data = await res.json() as any[];
      if (!data?.[0]) return `No definition found for "${word}".`;
      const entry = data[0];
      const parts: string[] = [];
      const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
      if (phonetic) parts.push(`Pronunciation: ${phonetic}`);
      if (entry.phonetics?.[0]?.audio) {
        parts.push(`Audio: ${entry.phonetics[0].audio}`);
      }
      entry.meanings?.forEach((m: any) => {
        const partOfSpeech = m.partOfSpeech || '';
        m.definitions?.slice(0, 3).forEach((d: any) => {
          const def = d.definition || '';
          const example = d.example ? `\n   Example: "${d.example}"` : '';
          const synonyms = d.synonyms?.length ? `\n   Synonyms: ${d.synonyms.slice(0, 3).join(', ')}` : '';
          parts.push(`[${partOfSpeech}] ${def}${example}${synonyms}`);
        });
      });
      return parts.length > 0
        ? `Word: ${word}\n${parts.join('\n')}`
        : `No definitions found for "${word}".`;
    } catch (e: any) {
      return `Dictionary lookup failed: ${e.message}`;
    }
  },
};
