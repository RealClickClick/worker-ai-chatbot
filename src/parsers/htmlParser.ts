const HTML_TAGS = /<\/?(?:b|i|u|s|code|pre|br|a(?:\s[^>]*)?)>/g;

function escapeHTML(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function parseMarkdownToTelegramHTML(text: string): string {
  if (!text) return '';
  const blocks: string[] = [];
  const saved: string[] = [];

  let parsed = text;

  parsed = parsed.replace(/```(\w*)\n?([\s\S]*?)```/g, (_: string, lang: string, code: string) => {
    const langAttr = lang ? ` class="language-${lang}"` : '';
    blocks.push(`<pre><code${langAttr}>${escapeHTML(code)}</code></pre>`);
    return `\x00BLOCK_${blocks.length - 1}\x00`;
  });

  parsed = parsed.replace(/`([^`\n]+)`/g, (_: string, code: string) => {
    blocks.push(`<code>${escapeHTML(code)}</code>`);
    return `\x00BLOCK_${blocks.length - 1}\x00`;
  });

  parsed = parsed.replace(HTML_TAGS, (m: string) => {
    saved.push(m);
    return `\x00SAVED_${saved.length - 1}\x00`;
  });

  parsed = escapeHTML(parsed);

  parsed = parsed.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>');
  parsed = parsed.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/gs, '<i>$1</i>');
  parsed = parsed.replace(/__(.+?)__/gs, '<u>$1</u>');
  parsed = parsed.replace(/~~(.+?)~~/gs, '<s>$1</s>');
  parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  parsed = parsed.replace(/\x00SAVED_(\d+)\x00/g, (_: string, i: string) => saved[+i]);

  blocks.forEach((block: string, i: number) => {
    parsed = parsed.replace(`\x00BLOCK_${i}\x00`, block);
  });

  return parsed;
}
