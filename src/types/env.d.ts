export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  WORKER_DOMAIN: string;
  BOT_USERNAME?: string;
  ADMIN_IDS?: string;
  BRAVE_API_KEY?: string;
  GOOGLE_GEMINI_API_KEY?: string;
  WEBHOOK_SECRET?: string;
  BOT_NAME?: string;
  BOT_DESCRIPTION?: string;
  DB?: D1Database;
  AI: Ai;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramSticker {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  emoji?: string;
  set_name?: string;
}

export interface TelegramVideoNote {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  duration: number;
  mime_type?: string;
}

export interface TelegramLocation {
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
}

export interface TelegramContact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
  caption_entities?: Array<{ type: string; offset: number; length: number }>;
  photo?: Array<{ file_id: string; file_unique_id: string; file_size?: number; width: number; height: number }>;
  document?: { file_id: string; file_unique_id: string; file_size?: number; mime_type?: string; file_name?: string };
  voice?: { file_id: string; file_unique_id: string; file_size?: number; duration: number; mime_type?: string };
  sticker?: TelegramSticker;
  video_note?: TelegramVideoNote;
  location?: TelegramLocation;
  contact?: TelegramContact;
  reply_to_message?: TelegramMessage;
  reply_markup?: Record<string, unknown>;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: { message_id: number; chat: TelegramChat; text?: string };
  data?: string;
  inline_message_id?: string;
}

export interface TelegramInlineQuery {
  id: string;
  from: TelegramUser;
  query: string;
  offset: string;
  chat_type?: string;
}

export interface InlineQueryResult {
  type: 'article';
  id: string;
  title: string;
  input_message_content: {
    message_text: string;
    parse_mode?: string;
  };
  description?: string;
  reply_markup?: any;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  edited_message?: TelegramMessage;
  inline_query?: TelegramInlineQuery;
}

export interface GroupMessage {
  id: number;
  chat_id: string;
  user_id: string;
  message_id: number;
  role: 'user' | 'assistant';
  content: string;
  reply_to_message_id: number | null;
  reply_to_user_id: string | null;
  reply_to_content: string | null;
  thread_id: string | null;
  user_name: string;
  created_at: string;
}

export interface UserSettings {
  persona: string;
  response_length: string;
  ai_model: string;
  lang: string | null;
  custom_instructions: string | null;
  bot_name: string | null;
  active_session: string;
  programming_lang: string | null;
  memory_enabled: number;
  formatting: string;
  feedback_enabled: number;
  img_model: string;
  daily_tips_enabled?: number;
  timezone?: string;
  translate_source?: string | null;
  translate_target?: string | null;
  translate_pending?: string | null;
  translate_enabled?: number;
  ensemble_enabled?: number;
  ensemble_models?: string | null;
  ensemble_strategy?: string;
  active_mode?: string | null;
  mode_data?: string | null;
}

export interface D1Result<T> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: { changes?: number; duration?: number };
}

declare global {
  function getMiniflareBindings(): Env;
}
