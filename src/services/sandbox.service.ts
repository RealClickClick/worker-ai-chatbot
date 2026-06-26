import { logger } from '../utils/logger.ts';
import { PISTON_API_URL } from '../constants.ts';

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: Array<{ name: string; content: string }>;
  stdin?: string;
}

export interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

const SUPPORTED_LANGUAGES: Record<string, string> = {
  python: '3.10.0',
  javascript: '18.15.0',
  typescript: '5.0.3',
  rust: '1.68.0',
  go: '1.20.3',
  java: '15.0.2',
  cpp: '10.2.0',
  c: '10.2.0',
  ruby: '3.2.1',
  php: '8.2.3',
  sqlite: '3.40.1',
  bash: '5.2.15',
  r: '4.3.1',
  swift: '5.8.0',
  kotlin: '1.8.20',
  scala: '3.2.2',
  perl: '5.36.0',
  lua: '5.4.4',
  haskell: '9.0.2',
  elixir: '1.14.3',
};

export async function executeCode(language: string, code: string, stdin: string = ''): Promise<{ success: boolean; output: string; error: string | null }> {
  const langKey = Object.keys(SUPPORTED_LANGUAGES).find(k => k === language.toLowerCase() || language.toLowerCase().startsWith(k));
  if (!langKey) {
    const supported = Object.keys(SUPPORTED_LANGUAGES).join(', ');
    return { success: false, output: '', error: `Unsupported language: "${language}". Supported: ${supported}` };
  }

  const version = SUPPORTED_LANGUAGES[langKey];
  const extMap: Record<string, string> = {
    python: 'py', javascript: 'js', typescript: 'ts', rust: 'rs', go: 'go',
    java: 'java', cpp: 'cpp', c: 'c', ruby: 'rb', php: 'php', bash: 'sh',
    r: 'r', swift: 'swift', kotlin: 'kt', scala: 'scala', perl: 'pl',
    lua: 'lua', haskell: 'hs', elixir: 'ex',
  };
  const ext = extMap[langKey] || langKey;

  const body: PistonExecuteRequest = {
    language: langKey,
    version,
    files: [{ name: `main.${ext}`, content: code }],
    stdin: stdin || undefined,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(`${PISTON_API_URL}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { success: false, output: '', error: `Piston API error: ${res.status} ${res.statusText}` };
    }

    const data: PistonExecuteResponse = await res.json();
    const stdout = data.run.stdout || '';
    const stderr = data.run.stderr || '';
    const exitCode = data.run.code;

    if (exitCode !== 0 && !stdout) {
      return { success: false, output: '', error: stderr || `Exit code: ${exitCode}` };
    }

    let output = stdout;
    if (stderr) output += `\n\n[stderr]\n${stderr}`;
    if (exitCode !== 0) output += `\n\n[exit code: ${exitCode}]`;

    return { success: true, output, error: null };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return { success: false, output: '', error: 'Execution timed out after 30 seconds.' };
    }
    logger.error('Piston execution error', { language, error: e.message });
    return { success: false, output: '', error: `Execution error: ${e.message}` };
  }
}

export function getSupportedLanguages(): string[] {
  return Object.keys(SUPPORTED_LANGUAGES);
}
