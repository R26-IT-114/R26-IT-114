import { dyslexiaClient } from '../../../services/axiosInstance';

// ── Module overview ───────────────────────────────────────────────────────────

export const getDyslexiaOverview = async () => {
  const { data } = await dyslexiaClient.get('/overview');
  return data;
};

export const getDyslexiaCatalog = async () => {
  const { data } = await dyslexiaClient.get('/catalog');
  return data;
};

export const getDyslexiaGameByKey = async (gameKey) => {
  const { data } = await dyslexiaClient.get(`/games/${encodeURIComponent(gameKey)}`);
  return data;
};

// ── Pre-assessment ────────────────────────────────────────────────────────────

/**
 * Save (or overwrite) a child's pre-assessment result.
 * @param {string} userId
 * @param {{ letters: number, twoLetter: number, threeLetter: number }} scores
 */
export const saveAssessment = async (userId, scores) => {
  const { data } = await dyslexiaClient.post('/assessment', { userId, scores });
  return data;
};

/**
 * Fetch an existing assessment result. Returns { data: null } if not yet done.
 * @param {string} userId
 */
export const getAssessment = async (userId) => {
  const { data } = await dyslexiaClient.get(`/assessment/${encodeURIComponent(userId)}`);
  return data;
};

/**
 * Reset/delete the child's assessment so they can retake it.
 * @param {string} userId
 */
export const deleteAssessment = async (userId) => {
  const { data } = await dyslexiaClient.delete(`/assessment/${encodeURIComponent(userId)}`);
  return data;
};

/**
 * Lightweight fetch of only the unlocked section IDs.
 * Returns default [1,2,5,6] if no assessment on record.
 * @param {string} userId
 */
export const getUnlockedSections = async (userId) => {
  const { data } = await dyslexiaClient.get(
    `/assessment/${encodeURIComponent(userId)}/unlocked-sections`
  );
  return data;
};

// ── Game sessions ─────────────────────────────────────────────────────────────

/**
 * Start a new game session.
 * @param {{ userId: string, gameKey: string, level?: number, totalQuestions?: number, metadata?: object }} payload
 */
export const startSession = async (payload) => {
  const { data } = await dyslexiaClient.post('/sessions', payload);
  return data;
};

export const listSessions = async (userId, { status, limit } = {}) => {
  const params = { userId };
  if (status) params.status = status;
  if (limit)  params.limit  = limit;
  const { data } = await dyslexiaClient.get('/sessions', { params });
  return data;
};

export const getSessionById = async (sessionId) => {
  const { data } = await dyslexiaClient.get(`/sessions/${encodeURIComponent(sessionId)}`);
  return data;
};

/**
 * Record a single question attempt within a session.
 * @param {string} sessionId
 * @param {{ userId: string, questionId: string, prompt: string,
 *           expectedAnswer: string, userAnswer: string,
 *           isCorrect: boolean, responseTimeMs?: number, metadata?: object }} payload
 */
export const recordAttempt = async (sessionId, payload) => {
  const { data } = await dyslexiaClient.post(
    `/sessions/${encodeURIComponent(sessionId)}/attempts`,
    payload
  );
  return data;
};

/**
 * Complete (close) a session with final scores.
 * @param {string} sessionId
 * @param {{ userId: string, score: number, totalQuestions: number,
 *           correctAnswers: number, wrongAnswers: number,
 *           durationSeconds?: number, metadata?: object }} payload
 */
export const completeSession = async (sessionId, payload) => {
  const { data } = await dyslexiaClient.post(
    `/sessions/${encodeURIComponent(sessionId)}/complete`,
    payload
  );
  return data;
};

// ── User progress ─────────────────────────────────────────────────────────────

export const getUserProgress = async (userId) => {
  const { data } = await dyslexiaClient.get(`/progress/${encodeURIComponent(userId)}`);
  return data;
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * Full performance dashboard for a single child.
 * Returns: assessment, overall stats, section breakdown, game breakdown,
 *          recent sessions, accuracy trend.
 */
export const getUserDashboard = async (userId) => {
  const { data } = await dyslexiaClient.get(`/dashboard/${encodeURIComponent(userId)}`);
  return data;
};

/**
 * Lightweight summary for ALL users — for the admin dashboard list.
 */
export const getAllUsersDashboard = async () => {
  const { data } = await dyslexiaClient.get('/dashboard');
  return data;
};
