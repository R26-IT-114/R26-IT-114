import { useCallback, useEffect, useMemo, useState } from 'react';
import { dysgraphiaService } from '../services/dysgraphiaService';

const createDefaultProgress = () => ({
  shapes: { name: 'හැඩතල', completed: 0, total: 9, stars: 0, itemProgress: {} },
  letters: {
    level1: { name: 'අදියර 1', completed: 0, total: 5, stars: 0, itemProgress: {} },
    level2: { name: 'අදියර 2', completed: 0, total: 5, stars: 0, itemProgress: {} },
    level3: { name: 'අදියර 3', completed: 0, total: 6, stars: 0, itemProgress: {} },
  },
  words: {
    twoLetters: { name: 'අකුරු දෙක', completed: 0, total: 8, stars: 0, itemProgress: {} },
    threeLetters: { name: 'අකුරු තුන', completed: 0, total: 7, stars: 0, itemProgress: {} },
  },
});

export const useProgressTracking = () => {
  const [overview, setOverview] = useState(() => dysgraphiaService.getCachedOverview());
  const [loading, setLoading] = useState(() => !dysgraphiaService.getCachedOverview());
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = dysgraphiaService.subscribeToOverview((nextOverview) => {
      setOverview(nextOverview);
      setLoading(false);
    });

    if (!dysgraphiaService.getCachedOverview()) {
      dysgraphiaService
        .getOverview()
        .catch((requestError) => {
          setError(requestError);
          setLoading(false);
        });
    }

    return unsubscribe;
  }, []);

  const progress = overview?.progress || createDefaultProgress();
  const stats = overview?.stats || {
    totalStars: 0,
    totalMinutesSpent: 0,
    sessionsCompleted: 0,
    lastSessionDate: null,
    totalItemsCompleted: 0,
  };
  const achievements = overview?.achievements || [];
  const recentSessions = overview?.recentSessions || [];

  const getStats = useCallback(() => ({
    totalStars: stats.totalStars,
    totalMinutesSpent: Math.round(stats.totalMinutesSpent),
    sessionsCompleted: stats.sessionsCompleted,
    totalItemsCompleted: stats.totalItemsCompleted,
    lastSessionDate: stats.lastSessionDate,
    shapeCompletion: Math.round((progress.shapes.completed / Math.max(progress.shapes.total, 1)) * 100),
    letterCompletion: {
      level1: Math.round((progress.letters.level1.completed / progress.letters.level1.total) * 100),
      level2: Math.round((progress.letters.level2.completed / progress.letters.level2.total) * 100),
      level3: Math.round((progress.letters.level3.completed / progress.letters.level3.total) * 100),
    },
    wordCompletion: {
      twoLetters: Math.round((progress.words.twoLetters.completed / progress.words.twoLetters.total) * 100),
      threeLetters: Math.round((progress.words.threeLetters.completed / progress.words.threeLetters.total) * 100),
    },
  }), [progress, stats]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      await dysgraphiaService.getOverview();
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSession = useCallback(async (durationMinutes, itemsCompleted, starsEarned, activityType = 'letter') => {
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - durationMinutes * 60 * 1000);
    return dysgraphiaService.createSession({
      activityType,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationMinutes,
      itemsCompleted,
      starsEarned,
    });
  }, []);

  return {
    progress,
    stats,
    achievements,
    recentSessions,
    loading,
    error,
    addSession,
    getStats,
    refresh,
  };
};
