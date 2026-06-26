// Re-exports from repositories for service-layer access patterns.
// New code should import from here instead of directly from db.ts or repositories.

export {
  getSettings, setPersona, setResponseLength, setAiModel, setImgModel,
  setLanguage, setTranslateSource, setTranslateTarget,
  setTranslatePending, setTranslateEnabled,
  setCustomInstructions, setBotName, setActiveSession, setProgrammingLang,
  toggleMemory, toggleFormatting, toggleFeedback, toggleResponseLength,
  setTimezone, toggleDailyTips, getDailyTipsEnabled,
  createSession, getSessions,
} from '../repositories/settings.repo.ts';

export {
  getChatHistory, addChatMessage, getAllChatMessages, clearChat,
  addGroupMessage, getUserWindow, getMessageByMessageId,
  getAmbientContext, getThreadMessages, getLastGroupMessages, cleanupOldGroupData,
} from '../repositories/chat.repo.ts';

export {
  saveCustomPersona, getCustomPersonas, deleteCustomPersona,
  recordFeedback, getLearnedTraits,
} from '../repositories/persona.repo.ts';
export { analyzeFeedback, getAdaptationContext } from './persona-adaptive.service.ts';

export {
  createDebateSession, updateDebateSession, getActiveDebateSession,
  addDebateMessage, getDebateMessages, getDebateSession,
} from '../repositories/debate.repo.ts';

export {
  getTimezoneOffset, localToUTC, formatDateUTC, formatTimeUTC, utcToLocal,
  createReminder, getReminders, getAllReminders,
  markReminderSent, cancelReminder, deleteReminder,
  getDueReminders, rescheduleReminder, getReminderCount,
} from '../repositories/reminder.repo.ts';

export {
  checkRateLimit, getRateLimitStats,
  isBlocked, blockUser, unblockUser, getBlockedUsers,
  trackMessage, trackNewUser, trackImage, trackSearch, trackFeedback, trackTiming,
  getAnalytics, getAllChatIds, getActiveUsersLastDay,
} from '../repositories/admin.repo.ts';

export { initDB, cleanupOldData, getDailyTipsChats } from '../repositories/settings.repo.ts';
export { clearDBCache } from '../repositories/cache.ts';
export { runEnsemble, parseEnsembleModels } from './ensemble.service.ts';
export { routeModel, logRouting } from './router.service.ts';
export type { RequestType } from './router.service.ts';
export { indexText, getRagContext, clearKnowledge, getKnowledgeCount } from './rag.service.ts';
export { executeCode, getSupportedLanguages } from './sandbox.service.ts';
export { generateAndStoreSummary, getMemoryContext, clearMemorySummaries, shouldSummarize, getOldMessages } from './memory.service.ts';
