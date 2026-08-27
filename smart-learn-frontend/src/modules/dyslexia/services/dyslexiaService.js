import {
  getDyslexiaOverview,
  getDyslexiaCatalog,
  getDyslexiaGameByKey,
  saveAssessment,
  getAssessment,
  deleteAssessment,
  getUnlockedSections,
  startSession,
  listSessions,
  getSessionById,
  recordAttempt,
  completeSession,
  getUserProgress,
  getUserDashboard,
  getAllUsersDashboard,
} from '../api/dyslexiaApi';

export const dyslexiaService = {
  // Overview
  getOverview:    getDyslexiaOverview,
  getCatalog:     getDyslexiaCatalog,
  getGameByKey:   getDyslexiaGameByKey,

  // Pre-assessment
  saveAssessment,
  getAssessment,
  deleteAssessment,
  getUnlockedSections,

  // Game sessions
  startSession,
  listSessions,
  getSessionById,
  recordAttempt,
  completeSession,

  // Progress
  getUserProgress,

  // Dashboard
  getUserDashboard,
  getAllUsersDashboard,
};
