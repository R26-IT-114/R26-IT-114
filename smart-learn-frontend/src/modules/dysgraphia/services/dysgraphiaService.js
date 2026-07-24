import {
  createSession,
  getCatalog,
  getOverview,
  getRecentActivity,
  resetProgress,
  submitLetterAttempt,
  submitShapeAttempt,
  submitWordAttempt,
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

  async submitWordAttempt(payload) {
    try {
      return publishOverviewFromResponse(await submitWordAttempt(payload));
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
    const response = await this.submitLetterAttempt(payload);
    if (response?.isCorrect) {
      await this.createSession(
        buildSessionPayload({
          activityType: payload.mode === 'review' ? 'review' : 'letter',
          durationSeconds: payload.durationSeconds || 0,
          itemsCompleted: 1,
          starsEarned: response.starsEarned,
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

  resetProgress,
};
