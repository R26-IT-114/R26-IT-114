import {
  createSession,
  getCatalog,
  getOverview,
  getRecentActivity,
  resetProgress,
  submitLetterAttempt,
  submitMirrorLetterAttempt,
  submitShapeAttempt,
  submitWordAttempt,
  submitWritingLineAttempt,
} from '../api/dysgraphiaApi';

let cachedOverview = null;
const overviewListeners = new Set();

const notifyOverviewListeners = (overview) => {
  cachedOverview = overview;
  overviewListeners.forEach((listener) => {
    listener(overview);
  });
  return overview;
};

const publishOverviewFromResponse = (response) => {
  if (response?.overviewSummary) {
    notifyOverviewListeners(response.overviewSummary);
  }

  return response;
};

const publishOverviewFromError = (error) => {
  const response = error?.response?.data;
  if (response?.overviewSummary) {
    notifyOverviewListeners(response.overviewSummary);
  }

  throw error;
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

export const dysgraphiaService = {
  getCachedOverview: () => cachedOverview,

  subscribeToOverview(listener) {
    overviewListeners.add(listener);
    if (cachedOverview) {
      listener(cachedOverview);
    }

    return () => {
      overviewListeners.delete(listener);
    };
  },

  async getOverview() {
    return notifyOverviewListeners(await getOverview());
  },

  getCatalog,

  async submitShapeAttempt(payload) {
    return publishOverviewFromResponse(await submitShapeAttempt(payload));
  },

  async submitLetterAttempt(payload) {
    try {
      return publishOverviewFromResponse(await submitLetterAttempt(payload));
    } catch (error) {
      return publishOverviewFromError(error);
    }
  },

  async submitMirrorLetterAttempt(payload) {
    try {
      return publishOverviewFromResponse(await submitMirrorLetterAttempt(payload));
    } catch (error) {
      return publishOverviewFromError(error);
    }
  },

  async submitWordAttempt(payload) {
    try {
      return publishOverviewFromResponse(await submitWordAttempt(payload));
    } catch (error) {
      return publishOverviewFromError(error);
    }
  },

  async submitWritingLineAttempt(payload) {
    try {
      return publishOverviewFromResponse(await submitWritingLineAttempt(payload));
    } catch (error) {
      return publishOverviewFromError(error);
    }
  },

  async createSession(payload) {
    const response = await createSession(payload);
    await this.getOverview();
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
    const response = await this.submitLetterAttempt(requestPayload);
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

  resetProgress,
};
