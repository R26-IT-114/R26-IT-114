import React, { createContext, useContext, useState, useEffect } from 'react';
import { createAdaptiveProfile, updateAdaptiveProfile } from '../utils/adaptiveDifficulty';
import * as wmApi from '../api/workingMemoryApi';

/**
 * Progress Context for managing game progress and level unlock system
 * Uses backend API with localStorage fallback for offline support
 * Implements optimistic updates for better UX
 */
const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Load progress from API on mount, fallback to localStorage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await wmApi.getAllProgress();
        
        // Transform API response to local format
        const transformedProgress = {};
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach(gameProgress => {
            transformedProgress[gameProgress.gameId] = {
              currentLevel: gameProgress.currentLevel || 1,
              completedLevels: gameProgress.completedLevels || [],
              unlockedLevels: gameProgress.unlockedLevels || [1],
              levelStats: gameProgress.levelStats || {},
              levelProgress: gameProgress.levelProgress || {},
              adaptiveProfile: gameProgress.adaptiveProfile || createAdaptiveProfile(),
              _id: gameProgress._id, // Keep database ID for reference
            };
          });
        }
        
        setProgress(transformedProgress);
        setIsOnline(true);
        console.log('✅ Loaded progress from backend');
      } catch (error) {
        console.warn('⚠️ Failed to load from backend, using localStorage:', error.message);
        setIsOnline(false);
        
        // Fallback to localStorage
        const savedProgress = localStorage.getItem('wmProgressData');
        if (savedProgress) {
          try {
            setProgress(JSON.parse(savedProgress));
          } catch (parseError) {
            console.error('Error parsing localStorage:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  // Save progress to localStorage (backup)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wmProgressData', JSON.stringify(progress));
    }
  }, [progress, isLoading]);

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
        wmApi.initializeGame(gameId)
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
  const completeLevel = (gameId, level, stats = null) => {
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
      wmApi.completeLevel(gameId, level, stats)
        .catch(err => console.warn(`Failed to complete level on backend: ${err.message}`));
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
  const updateLevelProgress = (gameId, level, percent = 0, stats = null) => {
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
      wmApi.updateLevelProgress(gameId, level, percent, stats)
        .catch(err => console.warn(`Failed to update level progress on backend: ${err.message}`));
    }
  };

  const getAdaptiveProfile = (gameId) => {
    return createAdaptiveProfile(progress[gameId]?.adaptiveProfile);
  };

  const recordAdaptiveResult = (gameId, metrics = {}) => {
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

      return {
        ...prev,
        [gameId]: {
          ...gameProgress,
          adaptiveProfile: updateAdaptiveProfile(gameProgress.adaptiveProfile, metrics),
        },
      };
    });

    // Sync with backend in background
    if (isOnline) {
      wmApi.recordAdaptiveResult(gameId, metrics)
        .catch(err => console.warn(`Failed to record result on backend: ${err.message}`));
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
      wmApi.resetAdaptiveProfile(gameId)
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
      wmApi.resetAllAdaptiveProfiles()
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
