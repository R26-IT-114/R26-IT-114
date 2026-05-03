import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Progress Context for managing game progress and level unlock system
 * Stores: { gameId: { currentLevel: number, completedLevels: [] } }
 */
const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('wmProgressData');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('wmProgressData', JSON.stringify(progress));
    }
  }, [progress, isLoading]);

  /**
   * Initialize game progress if not exists
   */
  const initializeGame = (gameId) => {
    if (!progress[gameId]) {
      setProgress(prev => ({
        ...prev,
        [gameId]: {
          currentLevel: 1,
          completedLevels: [],
          unlockedLevels: [1], // Only first level unlocked initially
          levelStats: {},
          levelProgress: {},
        }
      }));
    }
  };

  /**
   * Check if a level is unlocked
   */
  const isLevelUnlocked = (gameId, level) => {
    initializeGame(gameId);
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
   */
  const completeLevel = (gameId, level, stats = null) => {
    setProgress(prev => {
      const gameProgress = prev[gameId] || {
        currentLevel: 1,
        completedLevels: [],
        unlockedLevels: [1],
        levelStats: {},
      };

      const newCompletedLevels = [...gameProgress.completedLevels];
      if (!newCompletedLevels.includes(level)) {
        newCompletedLevels.push(level);
      }

      // Unlock next level
      const newUnlockedLevels = [...(gameProgress.unlockedLevels || [])];
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
        }
      };
    });
  };

  /**
   * Get current level for a game
   */
  const getCurrentLevel = (gameId) => {
    initializeGame(gameId);
    return progress[gameId]?.currentLevel || 1;
  };

  /**
   * Get all completed levels for a game
   */
  const getCompletedLevels = (gameId) => {
    return progress[gameId]?.completedLevels || [];
  };

  /**
   * Get all unlocked levels for a game
   */
  const getUnlockedLevels = (gameId) => {
    return progress[gameId]?.unlockedLevels || [1];
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
   */
  const updateLevelProgress = (gameId, level, percent = 0, stats = null) => {
    setProgress(prev => {
      const gameProgress = prev[gameId] || {
        currentLevel: 1,
        completedLevels: [],
        unlockedLevels: [1],
        levelStats: {},
        levelProgress: {},
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
        }
      };
    });
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
    getLevelStats,
    getLevelProgress,
    updateLevelProgress,
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
