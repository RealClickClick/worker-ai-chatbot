export const RATE_LIMIT = 5;
export const RATE_WINDOW_SECONDS = 3;
export const MAX_HISTORY = 50;
export const EXPENSIVE_RATE_LIMIT = 2;
export const EXPENSIVE_RATE_WINDOW = 10;
export const MAX_MESSAGE_LENGTH = 4096;
export const MAX_FILE_CONTENT = 2500;
export const MAX_PDF_CONTENT = 4000;
export const MAX_WEB_CONTENT = 2500;
export const MAX_SEARCH_RESULTS = 3000;
export const MAX_HISTORY_MESSAGES = 8;
export const TOKEN_LIMIT_SHORT = 500;
export const TOKEN_LIMIT_MEDIUM = 1000;
export const TOKEN_LIMIT_LONG = 2500;
export const TOKEN_LIMIT_BALANCED_BONUS = 800;
export const TOKEN_LIMIT_CODE_BOOST = 2000;
export const VISION_MAX_TOKENS = 512;
export const EXPORT_LIMIT = 200;
export const PROFILE_TRUNCATE = 50;
export const STATS_TRUNCATE = 30;
export const SUMMARY_HISTORY_COUNT = 4;
export const SUMMARY_TRUNCATE = 100;
export const CODE_TERM_THRESHOLD = 2;
export const DEFAULT_LANG = 'en';
export const GROUP_USER_WINDOW_SIZE = 50;
export const GROUP_AMBIENT_SIZE = 5;
export const MAX_REPLY_DEPTH = 5;
export const GROUP_MSG_TRUNCATE = 200;
export const SILENT_MARKER = '[SILENT]';
export const MAX_FILE_SIZE_MB = 10;
export const MAX_PHOTO_SIZE_MB = 5;
export const FETCH_TIMEOUT_MS = 15000;
export const MAX_DEBATE_ROUNDS = 5;
export const MIN_DEBATE_ROUNDS = 2;
export const DEBATE_STYLES = ['debate', 'panel', 'collaboration', 'interview'] as const;
export const REMINDER_SNOOZE_MINUTES = 5;
export const REMINDER_MAX_PER_USER = 50;
export const REMINDER_HOURS = [
  '00','01','02','03','04','05',
  '06','07','08','09','10','11',
  '12','13','14','15','16','17',
  '18','19','20','21','22','23',
];
export const REMINDER_MINUTES = ['00', '15', '30', '45'];
export const TIMEZONE_DEFAULT = 'UTC';
export const LANGUAGE_TIMEZONE_MAP: Record<string, string> = {
  fa: 'Asia/Tehran',
  tr: 'Europe/Istanbul',
  ar: 'Asia/Riyadh',
  ru: 'Europe/Moscow',
};
export const RAG_MAX_CHUNK_SIZE = 500;
export const RAG_MAX_RESULTS = 5;
export const PISTON_API_URL = 'https://piston.metio.dev';
export const PISTON_TIMEOUT_MS = 30000;
export const COMMON_TIMEZONES = [
  'UTC', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tehran', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Pacific/Auckland', 'Australia/Sydney',
];
