import { downloadFile } from '../telegram.ts';
import { MAX_FILE_CONTENT, MAX_PDF_CONTENT } from '../constants.ts';
import type { Env } from '../types/env.d.ts';
import { logger } from './logger.ts';

export async function readFileContent(fileId: string, env: Env) {
  const bytes = await downloadFile(fileId, env);
  return new TextDecoder('utf-8').decode(bytes).slice(0, MAX_FILE_CONTENT);
}

export async function readPdfContent(fileId: string, env: Env) {
  const bytes = await downloadFile(fileId, env);
  try {
    const text = await extractPdfText(new Uint8Array(bytes));
    const result = text.slice(0, MAX_PDF_CONTENT);
    if (result.trim()) return result;
    logger.warn('PDF text extraction returned empty', { fileId });
  } catch (e: any) {
    logger.error('PDF extraction failed', { fileId, error: e.message });
  }
  return '(no text extracted)';
}

async function tryDecompress(data: Uint8Array, format: 'gzip' | 'deflate' | 'deflate-raw') {
  try {
    const cs = new DecompressionStream(format);
    const writer = cs.writable.getWriter();
    await writer.write(data);
    await writer.close();
    const reader = cs.readable.getReader();
    const chunks: any[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { out.set(c, off); off += c.length; }
    return out;
  } catch { return null; }
}

async function decompressDeflate(data: Uint8Array) {
  let result = await tryDecompress(data, 'deflate');
  if (result) return result;
  if (data.length > 6) {
    result = await tryDecompress(data.slice(2, -4), 'deflate');
    if (result) return result;
  }
  result = await tryDecompress(data, 'gzip');
  if (result) return result;
  return data;
}

function findSequence(data: Uint8Array, seq: Uint8Array, start: number) {
  for (let i = start; i <= data.length - seq.length; i++) {
    let match = true;
    for (let j = 0; j < seq.length; j++) {
      if (data[i + j] !== seq[j]) { match = false; break; }
    }
    if (match) return i;
  }
  return -1;
}

function unescapePdf(str: string) {
  return str.replace(/\\([\\()nrt])/g, (_, c) => c === 'n' ? '\n' : c === 'r' ? '\r' : c === 't' ? '\t' : c);
}

function extractTextOps(content: string) {
  const parts: string[] = [];
  let i = 0;
  while (i < content.length) {
    if (content[i] === '(') {
      let depth = 1;
      let j = i + 1;
      while (j < content.length && depth > 0) {
        if (content[j] === '\\') { j += 2; continue; }
        if (content[j] === '(') depth++;
        else if (content[j] === ')') depth--;
        j++;
      }
      parts.push(unescapePdf(content.slice(i + 1, j - 1)));
      i = j;
    } else {
      i++;
    }
  }
  return parts.join(' ');
}

function extractTextFallback(rawText: string) {
  const parens = rawText.match(/\(([^)]*)\)/g);
  if (!parens) return '';
  return parens.map(p => p.slice(1, -1)).join(' ').trim();
}

async function extractPdfText(data: Uint8Array) {
  const streamSig = new TextEncoder().encode('stream');
  const endSig = new TextEncoder().encode('endstream');

  const results: string[] = [];
  let pos = 0;

  while (true) {
    const s = findSequence(data, streamSig, pos);
    if (s === -1) break;

    let dataStart = s + streamSig.length;
    if (data[dataStart] === 0x0D) dataStart++;
    if (data[dataStart] === 0x0A) dataStart++;

    const e = findSequence(data, endSig, dataStart);
    if (e === -1) break;

    let dataEnd = e;
    while (dataEnd > dataStart && (data[dataEnd - 1] === 0x0A || data[dataEnd - 1] === 0x0D || data[dataEnd - 1] === 0x20)) dataEnd--;

    const raw = data.slice(dataStart, dataEnd);

    if (raw.length > 0) {
      try {
        const dec = await decompressDeflate(raw);
        const decoded = new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(dec);
        if (/[a-zA-Z]{3,}/.test(decoded)) {
          const extracted = extractTextOps(decoded);
          if (extracted) results.push(extracted);
        }
      } catch {
        const decoded = new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(raw);
        const extracted = extractTextOps(decoded);
        if (extracted) results.push(extracted);
      }
    }

    pos = e + endSig.length;
  }

  if (results.length === 0) {
    const fullText = new TextDecoder('utf-8', { fatal: false, ignoreBOM: false }).decode(data);
    const fallback = extractTextFallback(fullText);
    if (fallback) results.push(fallback);
  }

  return results.join('\n');
}

export async function downloadImageBytes(fileId: string, env: Env) {
  return await downloadFile(fileId, env);
}
