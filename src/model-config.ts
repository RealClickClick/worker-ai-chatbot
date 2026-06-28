export interface ModelLengthConfig {
  short: number;
  medium: number;
  long: number;
  temperature: number;
}

export const MODEL_LIMITS: Record<string, ModelLengthConfig> = {
  fast:           { short: 500,  medium: 1000,  long: 2000,  temperature: 0.7 },
  balanced:       { short: 800,  medium: 1500,  long: 3000,  temperature: 0.6 },
  powerful:       { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7 },
  glm:            { short: 500,  medium: 1000,  long: 2500,  temperature: 0.7 },
  vision:         { short: 500,  medium: 1000,  long: 2000,  temperature: 0.7 },
  llama4:         { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7 },
  gemma4:         { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7 },
  qwen_coder:     { short: 800,  medium: 1500,  long: 3000,  temperature: 0.2 },
  gemini_flash:   { short: 1000, medium: 2000,  long: 4000,  temperature: 0.5 },
  gemini_flash_3: { short: 1000, medium: 2000,  long: 4000,  temperature: 0.5 },
  openai:         { short: 600,  medium: 1200,  long: 3000,  temperature: 0.7 },
  kimi:           { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7 },
  openai_small:   { short: 500,  medium: 1000,  long: 2000,  temperature: 0.7 },
  mistral:        { short: 600,  medium: 1200,  long: 2500,  temperature: 0.7 },
  nemotron:       { short: 600,  medium: 1200,  long: 3000,  temperature: 0.7 },
};

export const DEFAULT_MODEL_LIMITS: ModelLengthConfig = {
  short: 500,
  medium: 1000,
  long: 2500,
  temperature: 0.7,
};

export function getModelLimits(modelKey: string): ModelLengthConfig {
  return MODEL_LIMITS[modelKey] || DEFAULT_MODEL_LIMITS;
}

export function getTemperature(modelKey: string): number {
  return getModelLimits(modelKey).temperature;
}
