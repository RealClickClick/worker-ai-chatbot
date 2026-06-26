export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRunResponse {
  response?: string;
  result?: {
    response?: string;
    usage?: {
      finish_reason?: string;
    };
  };
  choices?: Array<{
    message?: { content?: string };
    text?: string;
    delta?: { content?: string };
    finish_reason?: string;
    stop_reason?: string;
  }>;
  usage?: {
    finish_reason?: string;
  };
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
    safetyRatings?: Array<Record<string, unknown>>;
  }>;
  usageMetadata?: Record<string, unknown>;
}

export interface VisionMessageContent {
  type: 'text' | 'image';
  text?: string;
  image?: number[];
}

export interface TTSResponse {
  audio?: Uint8Array;
  data?: number[];
  result?: number[];
}

export interface WhisperResponse {
  text?: string;
}

export interface BraveSearchResult {
  title: string;
  url: string;
  description?: string;
}

export interface BraveSearchResponse {
  web?: {
    results?: BraveSearchResult[];
  };
}

export type EnsembleStrategy = 'judge' | 'random';

export interface EnsembleResponse {
  modelKey: string;
  text: string;
}
