export interface D1Row {
  [key: string]: unknown;
}

export interface D1Result<T = D1Row> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: { changes?: number; duration?: number; last_row_id?: number };
}

export interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  first<T = D1Row | null>(): Promise<T>;
  all<T = D1Row[]>(): Promise<D1Result<T extends unknown[] ? T[number] : D1Row>>;
}

export interface SettingsRow {
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
  daily_tips_enabled: number;
  timezone: string;
  translate_source: string | null;
  translate_target: string | null;
  translate_pending: string | null;
  translate_enabled: number;
  ensemble_enabled: number;
  ensemble_models: string | null;
  ensemble_strategy: string;
  active_mode: string | null;
  mode_data: string | null;
}

export interface ChatHistoryRow {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface SessionRow {
  session_id: string;
  title: string | null;
}

export interface CustomPersonaRow {
  name: string;
  description: string;
}

export interface RateLimitRow {
  count: number;
  window_start: string;
  violations: number;
  last_violation: string | null;
  tier: string;
}

export interface AnalyticsRow {
  key: string;
  value: number;
}

export interface ReminderRow {
  id: number;
  chat_id: string;
  title: string;
  reminder_date: string;
  reminder_time: string;
  recurrence: string;
  status: string;
  created_at: string;
  timezone: string;
}

export interface CountRow {
  cnt: number;
}

export interface DebateTemplateRow {
  id: number;
  chat_id: string;
  name: string;
  persona_1: string;
  persona_2: string;
  style: string;
  created_at: string;
}

export interface DebateSessionRow {
  id: number;
  chat_id: number | string;
  message_id: number | null;
  user_id: number;
  topic: string;
  style: string;
  max_rounds: number;
  current_round: number;
  status: string;
  setup_step: string | null;
  persona_1: string | null;
  persona_2: string | null;
  judge_enabled: number;
  judge_persona: string | null;
  participant_persona: string | null;
  roles_swapped: number;
  waiting_since: string | null;
  created_at: string;
}

export interface DebateMessageRow {
  id: number;
  session_id: number;
  round_number: number;
  persona_name: string;
  message_text: string;
  created_at: string;
}

export interface MemorySummaryRow {
  id: number;
  chat_id: string;
  session_id: string;
  summary: string;
  created_at: string;
}

export interface DocumentRow {
  id: number;
  chat_id: string;
  source: string;
  title: string;
  content: string;
  created_at: string;
}

export interface PersonaAdaptationRow {
  chat_id: string;
  feedback_log: string;
  learned_traits: string | null;
  last_adapted: string | null;
  adaptation_count: number;
}
