import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { createAdaptiveProfile, updateAdaptiveProfile } from '../utils/adaptiveDifficulty';
import * as wmApi from '../api/workingMemoryApi';

/**
 * Progress Context for managing game progress and level unlock system
 * Uses backend API with localStorage fallback for offline support
 * Implements optimistic updates for better UX
 */
const ProgressContext = createContext();

const transformBackendProgress = (response) => {
  const transformedProgress = {};

  if (response?.data && Array.isArray(response.data)) {
    response.data.forEach((gameProgress) => {
      transformedProgress[gameProgress.gameId] = {
        currentLevel: gameProgress.currentLevel || 1,
        completedLevels: gameProgress.completedLevels || [],
        unlockedLevels: gameProgress.unlockedLevels || [1],
        levelStats: gameProgress.levelStats || {},
        levelProgress: gameProgress.levelProgress || {},
        performanceHistory: gameProgress.performanceHistory || [],
        adaptiveProfile: gameProgress.adaptiveProfile || createAdaptiveProfile(),
        _id: gameProgress._id,
      };
    });
  }

  if (transformedProgress['image-matcher'] && !transformedProgress['puzzle-game']) {
    transformedProgress['puzzle-game'] = transformedProgress['image-matcher'];
  }

  return transformedProgress;
};

export const ProgressProvider = ({ children, userId = null }) => {
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // A successful server read always replaces the whole client snapshot. This
  // prevents a device-local cache from hiding progress written by another device.
  const refreshProgress = useCallback(async () => {
    if (!userId) return {};

    const data = await wmApi.getAllProgress(userId);
    const serverProgress = transformBackendProgress(data);
    setProgress(serverProgress);
    setIsOnline(true);
    return serverProgress;
  }, [userId]);

  // Reload progress whenever the authenticated user changes.
  // When userId becomes null (logout), clear local state immediately.
  useEffect(() => {
    if (!userId) {
      // Logged out — wipe local state so next user starts clean
      setProgress({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const loadProgress = async () => {
      try {
        await refreshProgress();
        console.log('✅ Loaded progress from backend');
      } catch (error) {
        console.warn('⚠️ Failed to load from backend, using localStorage:', error.message);
        setIsOnline(false);
        
        // Fallback to localStorage — key by userId to keep users separate
        const lsKey = userId ? `wmProgressData_${userId}` : 'wmProgressData';
        const savedProgress = localStorage.getItem(lsKey);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            // Backwards compatibility for localStorage keys
            if (parsed && parsed['image-matcher'] && !parsed['puzzle-game']) {
              parsed['puzzle-game'] = parsed['image-matcher'];
            }
            setProgress(parsed);
          } catch (parseError) {
            console.error('Error parsing localStorage:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [refreshProgress, userId]);

  // If this page was left open while the same account played on another
  // device, refresh the authoritative snapshot when the user returns to it.
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return undefined;

    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible') {
        refreshProgress().catch((error) => {
          console.warn('Failed to refresh working-memory progress:', error.message);
        });
      }
    };

    window.addEventListener('focus', refreshOnReturn);
    document.addEventListener('visibilitychange', refreshOnReturn);

    return () => {
      window.removeEventListener('focus', refreshOnReturn);
      document.removeEventListener('visibilitychange', refreshOnReturn);
    };
  }, [refreshProgress, userId]);

  // Mirror progress to localStorage (per-user key) as an offline backup
  useEffect(() => {
    if (!isLoading && userId) {
      localStorage.setItem(`wmProgressData_${userId}`, JSON.stringify(progress));
    }
  }, [progress, isLoading, userId]);

  /**
   * Initialize game progress if not exists
   * Optimistically updates state, syncs with API in background
   */
  const initializeGame = (gameId) => {
    if (!progress[gameId]) {
      const newGameProgress = {
        currentLevel: 1,
        completedLevels: [],
        unlockedLevels: [1],
        levelStats: {},
        levelProgress: {},
        adaptiveProfile: createAdaptiveProfile(),
      };

      // Optimistic update
      setProgress(prev => ({
        ...prev,
        [gameId]: newGameProgress
      }));

      // Sync with backend in background
      if (isOnline) {
        wmApi.initializeGame(gameId, userId)
          .then(data => {
            if (data.data) {
              setProgress(prev => ({
                ...prev,
                [gameId]: {
                  currentLevel: data.data.currentLevel || 1,
                  completedLevels: data.data.completedLevels || [],
                  unlockedLevels: data.data.unlockedLevels || [1],
                  levelStats: data.data.levelStats || {},
                  levelProgress: data.data.levelProgress || {},
                  performanceHistory: data.data.performanceHistory || [],
                  adaptiveProfile: data.data.adaptiveProfile || createAdaptiveProfile(),
                  _id: data.data._id,
                }
              }));
            }
          })
          .catch(err => console.warn(`Failed to initialize game on backend: ${err.message}`));
      }
    }
  };

  /**
   * Check if a level is unlocked
   * Level 1 is ALWAYS unlocked for every game.
   */
  const isLevelUnlocked = (gameId, level) => {
    if (level === 1) return true; // Level 1 always accessible
    return progress[gameId]?.unlockedLevels?.includes(level) || false;
  };

  /**
   * Check if a level is completed
   */
  const isLevelCompleted = (gameId, level) => {
    return progress[gameId]?.completedLevels?.includes(level) || false;
  };

  /**
   * Mark a level as completed and unlock next level
   * Optimistically updates state, syncs with API in background
   */
  const completeLevel = async (gameId, level, stats = null) => {
    // Optimistic update
    setProgress(prev => {
      const gameProgress = prev[gameId] || {
        currentLevel: 1,
        completedLevels: [],
        unlockedLevels: [1],
        levelStats: {},
        levelProgress: {},
        adaptiveProfile: createAdaptiveProfile(),
      };

      const newCompletedLevels = [...gameProgress.completedLevels];
      if (!newCompletedLevels.includes(level)) {
        newCompletedLevels.push(level);
      }

      // Unlock next level; always keep level 1 unlocked
      const newUnlockedLevels = [...(gameProgress.unlockedLevels || [1])];
      if (!newUnlockedLevels.includes(1)) newUnlockedLevels.push(1);
      const nextLevel = level + 1;
      if (!newUnlockedLevels.includes(nextLevel)) {
        newUnlockedLevels.push(nextLevel);
      }

      const newLevelStats = { ...(gameProgress.levelStats || {}) };
      if (stats) {
        newLevelStats[level] = stats;
      }

      return {
        ...prev,
        [gameId]: {
          ...gameProgress,
          currentLevel: Math.max(gameProgress.currentLevel || 1, nextLevel),
          completedLevels: newCompletedLevels,
          unlockedLevels: newUnlockedLevels,
          levelStats: newLevelStats,
          adaptiveProfile: createAdaptiveProfile(gameProgress.adaptiveProfile),
        }
      };
    });

    // Sync with backend in background
    if (isOnline) {
      try {
        await wmApi.completeLevel(gameId, level, stats, userId);
        await refreshProgress();
      } catch (err) {
        console.warn(`Failed to complete level on backend: ${err.message}`);
      }
    }
  };

  /**
   * Get current level for a game
   */
  const getCurrentLevel = (gameId) => {
    return progress[gameId]?.currentLevel || 1;
  };

  /**
   * Get all completed levels for a game
   */
  const getCompletedLevels = (gameId) => {
    return progress[gameId]?.completedLevels || [];
  };

  /**
   * Get all unlocked levels for a game.
   * Level 1 is always included.
   */
  const getUnlockedLevels = (gameId) => {
    const stored = progress[gameId]?.unlockedLevels;
    if (!stored || !stored.length) return [1];
    return stored.includes(1) ? stored : [1, ...stored];
  };

  const getLevelStats = (gameId, level) => {
    return progress[gameId]?.levelStats?.[level] || null;
  };

  /**
   * Get level progress percent (0-100)
   */
  const getLevelProgress = (gameId, level) => {
    return progress[gameId]?.levelProgress?.[level] || 0;
  };

  /**
   * Update level progress percent and optional partial stats
   * Optimistically updates state, syncs with API in background
   */
  const updateLevelProgress = async (gameId, level, percent = 0, stats = null) => {
    // Optimistic update
    setProgress(prev => {
      const gameProgress = prev[gameId] || {
        currentLevel: 1,
        completedLevels: [],
        unlockedLevels: [1],
        levelStats: {},
        levelProgress: {},
        adaptiveProfile: createAdaptiveProfile(),
      };

      const newLevelProgress = { ...(gameProgress.levelProgress || {}) };
      newLevelProgress[level] = Math.max(0, Math.min(100, Math.round(percent)));

      const newLevelStats = { ...(gameProgress.levelStats || {}) };
      if (stats) newLevelStats[level] = { ...(newLevelStats[level] || {}), ...stats };

      return {
        ...prev,
        [gameId]: {
          ...gameProgress,
          levelProgress: newLevelProgress,
          levelStats: newLevelStats,
          adaptiveProfile: createAdaptiveProfile(gameProgress.adaptiveProfile),
        }
      };
    });

    // Sync with backend in background
    if (isOnline) {
      try {
        await wmApi.updateLevelProgress(gameId, level, percent, stats, userId);
        await refreshProgress();
      } catch (err) {
        console.warn(`Failed to update level progress on backend: ${err.message}`);
      }
    }
  };

  const getAdaptiveProfile = (gameId) => {
    return createAdaptiveProfile(progress[gameId]?.adaptiveProfile);
  };

  const recordAdaptiveResult = async (gameId, metrics = {}) => {
    // Optimistic update
    setProgress(prev => {
      const gameProgress = prev[gameId] || {
        currentLevel: 1,
        completedLevels: [],
        unlockedLevels: [1],
        levelStats: {},
        levelProgress: {},
        adaptiveProfile: createAdaptiveProfile(),
      };
      const adaptiveProfile = updateAdaptiveProfile(gameProgress.adaptiveProfile, metrics);
      const latestResult = adaptiveProfile.recentResults.at(-1);
      const performanceResult = {
        accuracy: latestResult?.accuracy ?? adaptiveProfile.lastAccuracy ?? 0,
        mistakes: latestResult?.mistakes ?? null,
        attempts: latestResult?.attempts ?? null,
        averageResponseMs: latestResult?.averageResponseMs ?? null,
        timestamp: latestResult?.timestamp ?? new Date().toISOString(),
        metrics,
      };

      return {
        ...prev,
        [gameId]: {
          ...gameProgress,
          adaptiveProfile,
          performanceHistory: [
            ...(Array.isArray(gameProgress.performanceHistory) ? gameProgress.performanceHistory : []),
            performanceResult,
          ],
        },
      };
    });

    // Sync with backend in background
    if (isOnline) {
      try {
        await wmApi.recordAdaptiveResult(gameId, metrics, userId);
        await refreshProgress();
      } catch (err) {
        console.warn(`Failed to record result on backend: ${err.message}`);
      }
    }
  };

  const resetAdaptiveProfile = (gameId) => {
    // Optimistic update
    setProgress(prev => {
      if (!prev[gameId]) return prev;
      return {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          adaptiveProfile: createAdaptiveProfile(),
        },
      };
    });

    // Sync with backend in background
    if (isOnline) {
      wmApi.resetAdaptiveProfile(gameId, userId)
        .catch(err => console.warn(`Failed to reset adaptive profile on backend: ${err.message}`));
    }
  };

  const resetAllAdaptiveProfiles = () => {
    // Optimistic update
    setProgress(prev => {
      const next = { ...prev };
      Object.keys(next).forEach((gameId) => {
        next[gameId] = {
          ...next[gameId],
          adaptiveProfile: createAdaptiveProfile(),
        };
      });
      return next;
    });

    // Sync with backend in background
    if (isOnline) {
      wmApi.resetAllAdaptiveProfiles(userId)
        .catch(err => console.warn(`Failed to reset all adaptive profiles on backend: ${err.message}`));
    }
  };

  /**
   * Reset progress (for testing)
   */
  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem('wmProgressData');
  };

  const value = {
    progress,
    isLevelUnlocked,
    isLevelCompleted,
    completeLevel,
    getCurrentLevel,
    getCompletedLevels,
    getUnlockedLevels,
    resetProgress,
    initializeGame,
    isLoading,
    isOnline,
    getLevelStats,
    getLevelProgress,
    updateLevelProgress,
    getAdaptiveProfile,
    recordAdaptiveResult,
    resetAdaptiveProfile,
    resetAllAdaptiveProfiles,
    refreshProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

/**
 * Hook to use Progress Context
 */
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};
