export interface ModelLengthConfig {
  short: number;
  medium: number;
  long: number;
  temperature: number;
  contextWindow: number;
}

export const MODEL_LIMITS: Record<string, ModelLengthConfig> = {
  fast:           { short: 500,  medium: 1000,  long: 2000,  temperature: 0.7, contextWindow: 8 },
  balanced:       { short: 800,  medium: 1500,  long: 3000,  temperature: 0.6, contextWindow: 6 },
  powerful:       { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7, contextWindow: 10 },
  glm:            { short: 500,  medium: 1000,  long: 2500,  temperature: 0.7, contextWindow: 8 },
  vision:         { short: 500,  medium: 1000,  long: 2000,  temperature: 0.7, contextWindow: 4 },
  llama4:         { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7, contextWindow: 10 },
  gemma4:         { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7, contextWindow: 8 },
  qwen_coder:     { short: 800,  medium: 1500,  long: 3000,  temperature: 0.2, contextWindow: 8 },
  gemini_flash:   { short: 1000, medium: 2000,  long: 4000,  temperature: 0.5, contextWindow: 15 },
  gemini_flash_3: { short: 1000, medium: 2000,  long: 4000,  temperature: 0.5, contextWindow: 15 },
  openai:         { short: 600,  medium: 1200,  long: 3000,  temperature: 0.7, contextWindow: 10 },
  kimi:           { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7, contextWindow: 8 },
  openai_small:   { short: 500,  medium: 1000,  long: 2000,  temperature: 0.7, contextWindow: 8 },
  mistral:        { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7, contextWindow: 10 },
  nemotron:       { short: 600,  medium: 1200,  long: 3000,  temperature: 0.7, contextWindow: 10 },
};

export const DEFAULT_MODEL_LIMITS: ModelLengthConfig = {
  short: 500,
  medium: 1000,
  long: 2500,
  temperature: 0.7,
  contextWindow: 8,
};

export function getModelLimits(modelKey: string): ModelLengthConfig {
  return MODEL_LIMITS[modelKey] || DEFAULT_MODEL_LIMITS;
}

export function getTemperature(modelKey: string): number {
  return getModelLimits(modelKey).temperature;
}
