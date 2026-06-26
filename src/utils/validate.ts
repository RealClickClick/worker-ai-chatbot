const MAX_PROMPT_LENGTH = 2000;
const MAX_SEARCH_LENGTH = 500;
const MAX_INSTRUCTIONS_LENGTH = 2000;
const MAX_SESSION_NAME_LENGTH = 50;
const MAX_PERSONA_NAME_LENGTH = 40;
const MAX_FEEDBACK_LENGTH = 1000;

export function validateImagePrompt(text: string): string | null {
  if (!text || text.length > MAX_PROMPT_LENGTH) return null;
  const cleaned = text.trim().replace(/[<>]/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

export function validateSearchQuery(text: string): string | null {
  if (!text || text.length > MAX_SEARCH_LENGTH) return null;
  return text.trim().slice(0, MAX_SEARCH_LENGTH);
}

export function validateCommandArgs(text: string): string | null {
  if (!text) return null;
  return text.trim();
}

export function validateInstructions(text: string): string | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/[<>]/g, '');
  return cleaned.length > MAX_INSTRUCTIONS_LENGTH ? cleaned.slice(0, MAX_INSTRUCTIONS_LENGTH) : cleaned;
}

export function validateSessionName(text: string): string | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/[^a-zA-Z0-9_\u0600-\u06FF\u0400-\u04FF-]/g, '_');
  return cleaned.length > MAX_SESSION_NAME_LENGTH ? cleaned.slice(0, MAX_SESSION_NAME_LENGTH) : cleaned;
}

export function validatePersonaName(text: string): string | null {
  if (!text) return null;
  const cleaned = text.trim().replace(/[^a-zA-Z0-9_\u0600-\u06FF\u0400-\u04FF\s-]/g, '');
  return cleaned.length > MAX_PERSONA_NAME_LENGTH ? cleaned.slice(0, MAX_PERSONA_NAME_LENGTH) : cleaned;
}

export function validateFeedbackMessage(text: string): string | null {
  if (!text || text.length > MAX_FEEDBACK_LENGTH) return null;
  return text.trim();
}
