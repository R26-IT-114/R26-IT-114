import {
  createSession,
  getCatalog,
  getOverview,
  getRecentActivity,
  predictHandwritingLetter,
  resetProgress,
  submitLetterAttempt,
  submitInterventionAttempt,
  submitLetterPracticeAttempt,
  submitMirrorLetterAttempt,
  submitShapeAttempt,
  submitWordAttempt,
  submitWritingLineAttempt,
} from '../api/dysgraphiaApi';
import { auth } from '../../../services/firebaseConfig';

let cachedOverview = null;
const overviewListeners = new Set();
let activeOverviewUserId = auth.currentUser?.uid || null;
let overviewGeneration = 0;
let overviewRequest = null;

const currentOverviewUserId = () => auth.currentUser?.uid || null;

const clearCachedOverview = () => {
  cachedOverview = null;
  overviewListeners.forEach((listener) => {
    listener(null);
  });
};

const syncOverviewUser = () => {
  const userId = currentOverviewUserId();
  if (userId !== activeOverviewUserId) {
    activeOverviewUserId = userId;
    overviewGeneration += 1;
    overviewRequest = null;
    clearCachedOverview();
  }
  return userId;
};

const invalidateOverviewRequest = (userId, { clearCache = false } = {}) => {
  if (syncOverviewUser() !== userId) {
    return false;
  }

  overviewGeneration += 1;
  overviewRequest = null;
  if (clearCache) {
    clearCachedOverview();
  }
  return true;
};

const notifyOverviewListeners = (overview, userId) => {
  if (syncOverviewUser() !== userId) {
    return overview;
  }

  cachedOverview = overview;
  overviewListeners.forEach((listener) => {
    listener(overview);
  });
  return overview;
};

const publishOverviewFromResponse = (response, userId) => {
  if (response?.overviewSummary) {
    invalidateOverviewRequest(userId);
    notifyOverviewListeners(response.overviewSummary, userId);
  } else {
    invalidateOverviewRequest(userId, { clearCache: true });
  }

  return response;
};

const publishOverviewFromError = (error, userId) => {
  const response = error?.response?.data;
  if (response?.overviewSummary) {
    invalidateOverviewRequest(userId);
    notifyOverviewListeners(response.overviewSummary, userId);
  } else {
    invalidateOverviewRequest(userId, { clearCache: true });
  }

  throw error;
};

const runOverviewMutation = async (request) => {
  const userId = syncOverviewUser();
  try {
    return publishOverviewFromResponse(await request(), userId);
  } catch (error) {
    return publishOverviewFromError(error, userId);
  }
};

const buildSessionPayload = ({ activityType, durationSeconds = 0, itemsCompleted = 1, starsEarned = 0, itemIds = [] }) => {
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - Math.max(0, durationSeconds) * 1000);

  return {
    activityType,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationMinutes: Math.round((Math.max(0, durationSeconds) / 60) * 100) / 100,
    itemsCompleted,
    starsEarned,
    itemIds,
  };
};

const normalizeLetter = (value) => String(value ?? '').normalize('NFC').trim();

const getIndependentLetterStars = (attemptNumber) => {
  const attempt = Math.max(1, Number(attemptNumber) || 1);
  if (attempt === 1) return 3;
  if (attempt <= 3) return 2;
  return 1;
};

const applyExactLetterMatchRule = (response, requestPayload) => {
  const predictedLetter = normalizeLetter(response?.predicted ?? response?.predictedLetter);
  const expectedLetter = normalizeLetter(response?.expectedLetter ?? requestPayload.targetChar);
  const exactMatch = Boolean(predictedLetter && expectedLetter && predictedLetter === expectedLetter);

  if (!exactMatch && !response?.isCorrect) {
    return response;
  }

  const backendStars = Number(response?.starsEarned);
  return {
    ...response,
    predicted: predictedLetter || response?.predicted,
    expectedLetter: expectedLetter || response?.expectedLetter,
    isCorrect: true,
    starsEarned: backendStars > 0
      ? backendStars
      : getIndependentLetterStars(requestPayload.attemptNumber),
  };
};

export const dysgraphiaService = {
  getCachedOverview: () => {
    syncOverviewUser();
    return cachedOverview;
  },

  subscribeToOverview(listener) {
    syncOverviewUser();
    overviewListeners.add(listener);
    if (cachedOverview) {
      listener(cachedOverview);
    }

    return () => {
      overviewListeners.delete(listener);
    };
  },

  getOverview() {
    const userId = syncOverviewUser();
    if (overviewRequest?.userId === userId) {
      return overviewRequest.promise;
    }

    const generation = overviewGeneration;
    const requestPromise = getOverview()
      .then((overview) => {
        if (syncOverviewUser() !== userId) {
          const error = new Error('Authenticated user changed while loading dysgraphia progress.');
          error.code = 'AUTH_SCOPE_CHANGED';
          throw error;
        }
        if (generation === overviewGeneration) {
          notifyOverviewListeners(overview, userId);
        }
        return overview;
      })
      .finally(() => {
        if (overviewRequest?.promise === requestPromise) {
          overviewRequest = null;
        }
      });

    overviewRequest = { userId, generation, promise: requestPromise };
    return requestPromise;
  },

  getCatalog,

  async predictHandwritingLetter(image) {
    return predictHandwritingLetter(image);
  },

  async submitShapeAttempt(payload) {
    return runOverviewMutation(() => submitShapeAttempt(payload));
  },

  async submitLetterAttempt(payload) {
    return runOverviewMutation(() => submitLetterAttempt(payload));
  },

  async recordInterventionResult(payload) {
    return runOverviewMutation(() => submitInterventionAttempt(payload));
  },

  async submitLetterPracticeAttempt(payload) {
    return runOverviewMutation(() => submitLetterPracticeAttempt(payload));
  },

  async submitMirrorLetterAttempt(payload) {
    return runOverviewMutation(() => submitMirrorLetterAttempt(payload));
  },

  async submitWordAttempt(payload) {
    return runOverviewMutation(() => submitWordAttempt(payload));
  },

  async submitWritingLineAttempt(payload) {
    return runOverviewMutation(() => submitWritingLineAttempt(payload));
  },

  async createSession(payload) {
    const userId = syncOverviewUser();
    const response = await createSession(payload);
    if (invalidateOverviewRequest(userId, { clearCache: true })) {
      await this.getOverview();
    }
    return response;
  },

  async getRecentActivity(limit = 5) {
    return getRecentActivity(limit);
  },

  async recordShapeActivity(payload) {
    const response = await this.submitShapeAttempt(payload);
    if ((response?.starsEarned || 0) > 0) {
      await this.createSession(
        buildSessionPayload({
          activityType: 'shapes',
          durationSeconds: payload.durationSeconds || 0,
          itemsCompleted: 1,
          starsEarned: response.starsEarned,
          itemIds: [payload.shapeId],
        })
      );
    }
    return response;
  },

  async recordLetterActivity(payload) {
    const requestPayload = {
      ...payload,
      eraseCount: Number(payload.eraseCount || 0),
    };
    const backendResponse = await this.submitLetterAttempt(requestPayload);
    const response = applyExactLetterMatchRule(backendResponse, requestPayload);
    if (response?.isCorrect) {
      await this.createSession(
        buildSessionPayload({
          activityType: requestPayload.mode === 'review' ? 'review' : 'letter',
          durationSeconds: requestPayload.durationSeconds || 0,
          itemsCompleted: 1,
          starsEarned: response.starsEarned,
          itemIds: [requestPayload.letterId],
        })
      );
    }
    return response;
  },

  async recordMirrorLetterActivity(payload) {
    const response = await this.submitMirrorLetterAttempt(payload);
    if (response?.drawingCorrect) {
      await this.createSession(
        buildSessionPayload({
          activityType: 'review',
          durationSeconds: payload.drawingDurationSeconds || 0,
          itemsCompleted: 1,
          starsEarned: response.mirrorProgress?.starsEarned || 3,
          itemIds: [payload.letterId],
        })
      );
    }
    return response;
  },

  async recordWordActivity(payload) {
    const response = await this.submitWordAttempt(payload);
    if (response?.isCorrect) {
      await this.createSession(
        buildSessionPayload({
          activityType: payload.group === 'twoLetters' ? 'two-letter-word' : 'three-letter-word',
          durationSeconds: payload.durationSeconds || 0,
          itemsCompleted: 1,
          starsEarned: response.starsEarned,
          itemIds: [payload.wordId],
        })
      );
    }
    return response;
  },

  async recordWritingLineActivity(payload) {
    const response = await this.submitWritingLineAttempt(payload);
    if (response?.isCorrect) {
      await this.createSession(
        buildSessionPayload({
          activityType: 'writing-lines',
          durationSeconds: payload.durationSeconds || 0,
          itemsCompleted: 1,
          starsEarned: response.starsEarned || 0,
          itemIds: [payload.wordId],
        })
      );
    }
    return response;
  },

  async resetProgress() {
    const userId = syncOverviewUser();
    const response = await resetProgress();
    invalidateOverviewRequest(userId, { clearCache: true });
    return response;
  },
};
