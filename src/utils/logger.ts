const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LEVEL = LOG_LEVELS.INFO;
let requestCounter = 0;
let requestId: string | null = null;

function getRequestId() {
  if (!requestId) requestId = Date.now().toString(36) + '-' + (++requestCounter);
  return requestId;
}

function log(level: keyof typeof LOG_LEVELS, message: string, data: Record<string, any> = {}) {
  if (LOG_LEVELS[level] < CURRENT_LEVEL) return;
  const entry = {
    ts: new Date().toISOString(),
    lvl: level,
    msg: message,
    rid: getRequestId(),
    ...data,
  };
  const method = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
  console[method](JSON.stringify(entry));
}

export function resetRequestId() {
  requestId = null;
}

export const logger = {
  debug: (msg: string, data?: Record<string, any>) => log('DEBUG', msg, data),
  info: (msg: string, data?: Record<string, any>) => log('INFO', msg, data),
  warn: (msg: string, data?: Record<string, any>) => log('WARN', msg, data),
  error: (msg: string, data?: Record<string, any>) => log('ERROR', msg, data),
};
