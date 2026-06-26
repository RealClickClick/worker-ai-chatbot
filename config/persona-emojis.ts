export const PERSONA_THINKING_EMOJIS: Record<string, string[]> = {
  // Default
  standard: ['🤖', '💡', '⚡'],
  // Business & Law
  lawyer: ['⚖️', '📜', '💼'],
  ceo: ['💼', '👔', '📊'],
  accountant: ['🧮', '📊', '💰'],
  marketer: ['📢', '📣', '🎯'],
  entrepreneur: ['🚀', '💡', '🌟'],
  investor: ['💰', '📈', '💎'],
  consultant: ['📋', '🧠', '✅'],
  hr: ['👥', '🤝', '📋'],
  // Science & Tech
  hacker: ['💻', '🔓', '⚡'],
  developer: ['👨‍💻', '🔧', '⚙️'],
  datascientist: ['📊', '📈', '🔢'],
  cybersecurity: ['🛡️', '🔒', '🔐'],
  physicist: ['⚛️', '🔬', '💫'],
  chemist: ['🧪', '⚗️', '🔬'],
  astronomer: ['🔭', '🌌', '⭐'],
  mathematician: ['📐', '🔢', '🧮'],
  // Health & Wellness
  doctor: ['🩺', '💊', '❤️'],
  therapist: ['🧠', '💬', '🛋️'],
  nutritionist: ['🥗', '🍎', '💚'],
  psychiatrist: ['💊', '🧠', '🧘'],
  trainer: ['💪', '🏋️', '🔥'],
  yogi: ['🧘', '☮️', '🕉️'],
  // Arts & Culture
  poet: ['✍️', '📖', '💫'],
  writer: ['📖', '🖊️', '✍️'],
  musician: ['🎵', '🎶', '🎸'],
  painter: ['🎨', '🖌️', '🖼️'],
  designer: ['✏️', '🎨', '💡'],
  architect: ['🏛️', '📐', '🏗️'],
  filmmaker: ['🎬', '🎥', '📽️'],
  photographer: ['📷', '📸', '🎞️'],
  // Fantasy & Adventure
  wizard: ['🧙', '✨', '🔮'],
  knight: ['⚔️', '🛡️', '🏰'],
  pirate: ['🏴‍☠️', '⚓', '🗺️'],
  alien: ['👽', '🛸', '🌌'],
  vampire: ['🧛', '🌙', '🦇'],
  elf: ['🧝', '🌲', '🏹'],
  dragon: ['🐉', '🔥', '💎'],
  witch: ['🧙‍♀️', '🌙', '🧪'],
  // Personality & Humor
  savage: ['🔥', '💀', '⚡'],
  depressed: ['😞', '🌧️', '💔'],
  motivational: ['💪', '🔥', '🌟'],
  karen: ['👩', 'manager', '💢'],
  nerd: ['🤓', '📚', '🧪'],
  genz: ['😎', '💅', '🔥'],
  grandpa: ['👴', '☕', '📖'],
  romantic: ['❤️', '🌹', '💕'],
  comedian: ['😂', '🤣', '🎭'],
  conspiracy: ['👁️', '🔍', '🤔'],
  // Animals & Nature
  cat: ['🐱', '😺', '🐾'],
  dog: ['🐶', '🦴', '🐾'],
  lion: ['🦁', '👑', '💪'],
  owl: ['🦉', '🌙', '📖'],
  dolphin: ['🐬', '🌊', '💙'],
  panda: ['🐼', '🎋', '💚'],
  // History & Society
  king: ['👑', '🏰', '⚔️'],
  queen: ['👸', '👑', '💎'],
  samurai: ['🗾', '⚔️', '🏯'],
  explorer: ['🧭', '🗺️', '⛰️'],
  detective: ['🔍', '🕵️', '🔎'],
  spy: ['🕵️', '🕶️', '🔐'],
  journalist: ['📰', '🗞️', '📝'],
  philosopher: ['🤔', '💭', '📜'],
  // Spiritual & Mystical
  monk: ['🙏', '☮️', '🕉️'],
  prophet: ['📿', '✨', '🌙'],
  shaman: ['🌀', '🌿', '🔮'],
  oracle: ['🔮', '✨', '👁️'],
  mystic: ['✨', '🌙', '🔮'],
  sage: ['📜', '🧠', '⚖️'],
};

const chatEmojiIndex = new Map<string, number>();

export function getThinkingEmoji(persona: string, chatId?: string): string {
  const emojis = PERSONA_THINKING_EMOJIS[persona] || PERSONA_THINKING_EMOJIS.standard;
  if (!chatId || emojis.length === 1) return emojis[0];
  const idx = chatEmojiIndex.get(chatId) || 0;
  const emoji = emojis[idx % emojis.length];
  chatEmojiIndex.set(chatId, idx + 1);
  return emoji;
}
