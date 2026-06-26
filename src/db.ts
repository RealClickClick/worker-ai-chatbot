// Backward-compatible re-exports from domain repositories
// New code should import directly from the repository files.

export { clearDBCache, cacheGet, cacheSet, CACHE_TTL } from './repositories/cache.ts';

export {
  initDB,
  getSettings,
  setPersona, setResponseLength, setAiModel, setImgModel,
  setLanguage, setTranslateSource, setTranslateTarget,
  setTranslatePending, setTranslateEnabled,
  setCustomInstructions, setBotName, setActiveSession, setProgrammingLang,
  toggleMemory, toggleFormatting, toggleFeedback, toggleResponseLength,
  setTimezone, toggleDailyTips, getDailyTipsEnabled, getDailyTipsChats,
  createSession, getSessions,
  cleanupOldData,
} from './repositories/settings.repo.ts';

export {
  getChatHistory, addChatMessage, getAllChatMessages, clearChat,
  addGroupMessage, getUserWindow, getMessageByMessageId,
  getAmbientContext, getThreadMessages, getLastGroupMessages, cleanupOldGroupData,
} from './repositories/chat.repo.ts';

export {
  saveCustomPersona, getCustomPersonas, deleteCustomPersona,
} from './repositories/persona.repo.ts';

export {
  createDebateSession, updateDebateSession, getActiveDebateSession,
  addDebateMessage, getDebateMessages, getDebateSession, deleteDebateRoundMessages,
} from './repositories/debate.repo.ts';

export {
  getTimezoneOffset, localToUTC, formatDateUTC, formatTimeUTC, utcToLocal,
  createReminder, getReminders, getAllReminders,
  markReminderSent, cancelReminder, deleteReminder,
  getDueReminders, rescheduleReminder, getReminderCount,
} from './repositories/reminder.repo.ts';

export {
  checkRateLimit, getRateLimitStats,
  isBlocked, blockUser, unblockUser, getBlockedUsers,
  trackMessage, trackNewUser, trackImage, trackSearch, trackFeedback,
  getAnalytics, getAllChatIds, getActiveUsersLastDay,
} from './repositories/admin.repo.ts';
