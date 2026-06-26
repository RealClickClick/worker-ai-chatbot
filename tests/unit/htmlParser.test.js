import { describe, it, expect } from 'vitest';

describe('HTML Parser', () => {
  it('converts bold markdown to HTML', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    expect(parseMarkdownToTelegramHTML('**bold**')).toContain('<b>bold</b>');
  });

  it('converts italic markdown to HTML', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    expect(parseMarkdownToTelegramHTML('*italic*')).toContain('<i>italic</i>');
  });

  it('converts inline code to HTML', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    expect(parseMarkdownToTelegramHTML('`code`')).toContain('<code>code</code>');
  });

  it('converts code blocks with language', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    const input = '```python\nprint("hello")\n```';
    const result = parseMarkdownToTelegramHTML(input);
    expect(result).toContain('<pre><code class="language-python">');
    expect(result).toContain('print(&quot;hello&quot;)');
  });

  it('converts code blocks without language', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    const input = '```\nplain code\n```';
    const result = parseMarkdownToTelegramHTML(input);
    expect(result).toContain('<pre><code>');
    expect(result).toContain('plain code');
  });

  it('converts links', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    expect(parseMarkdownToTelegramHTML('[text](https://example.com)')).toContain(
      '<a href="https://example.com">text</a>',
    );
  });

  it('handles newlines', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    expect(parseMarkdownToTelegramHTML('line1\nline2')).toContain('line1\nline2');
  });

  it('preserves existing HTML tags', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    const input = 'Hello <u>world</u>';
    const result = parseMarkdownToTelegramHTML(input);
    expect(result).toContain('<u>world</u>');
  });

  it('handles mixed formatting', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    const input = '**bold** and *italic* and `code`';
    const result = parseMarkdownToTelegramHTML(input);
    expect(result).toContain('<b>bold</b>');
    expect(result).toContain('<i>italic</i>');
    expect(result).toContain('<code>code</code>');
  });

  it('handles null/undefined gracefully', async () => {
    const { parseMarkdownToTelegramHTML } = await import('../../src/parsers/htmlParser.js');
    expect(parseMarkdownToTelegramHTML(null)).toBe('');
    expect(parseMarkdownToTelegramHTML(undefined)).toBe('');
  });
});
