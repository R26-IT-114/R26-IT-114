import React, { createContext, useContext, useState, useEffect } from "react";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {

  // ─────────────────────────────────────────────
  // INITIAL STATE
  // ─────────────────────────────────────────────
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("progress");

    return saved
      ? JSON.parse(saved)
      : {
          "sequence-recall": {
            unlocked: 1,
            levels: {},
          },

          "video-story": {
            unlocked: 1,
            levels: {},
          },
        };
  });

  // ─────────────────────────────────────────────
  // SAVE TO LOCAL STORAGE
  // ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("progress", JSON.stringify(progress));
  }, [progress]);

  // ─────────────────────────────────────────────
  // INITIALIZE GAME
  // ─────────────────────────────────────────────
  const initializeGame = (game) => {
    setProgress((prev) => {
      if (prev[game]) return prev;

      return {
        ...prev,

        [game]: {
          unlocked: 1,
          levels: {},
        },
      };
    });
  };

  // ─────────────────────────────────────────────
  // COMPLETE LEVEL + SAVE STATS + UNLOCK NEXT
  // ─────────────────────────────────────────────
  const completeLevel = (game, level, stats = {}) => {

    setProgress((prev) => {

      const gameData = prev[game] || {
        unlocked: 1,
        levels: {},
      };

      const updatedLevels = {
        ...gameData.levels,

        [level]: {
          completed: true,

          // overall progress %
          accuracy: stats?.pct || stats?.accuracy || 0,

          // FULL STATS OBJECT
          stats: {
            ...stats,
          },
        },
      };

      // unlock next level
      const newUnlocked =
        level >= gameData.unlocked
          ? Math.min(level + 1, 5)
          : gameData.unlocked;

      return {
        ...prev,

        [game]: {
          unlocked: newUnlocked,
          levels: updatedLevels,
        },
      };
    });
  };

  // ─────────────────────────────────────────────
  // UPDATE LEVEL PROGRESS
  // ─────────────────────────────────────────────
  const updateLevelProgress = (game, level, accuracy = 0, stats = {}) => {

    setProgress((prev) => {

      const gameData = prev[game] || {
        unlocked: 1,
        levels: {},
      };

      const existingLevel = gameData.levels[level] || {};

      return {
        ...prev,

        [game]: {
          ...gameData,

          levels: {
            ...gameData.levels,

            [level]: {
              ...existingLevel,

              accuracy,

              stats: {
                ...(existingLevel.stats || {}),
                ...stats,
              },
            },
          },
        },
      };
    });
  };

  // ─────────────────────────────────────────────
  // GET LEVEL STATS
  // ─────────────────────────────────────────────
  const getLevelStats = (game, level) => {
    return progress?.[game]?.levels?.[level]?.stats || null;
  };

  // ─────────────────────────────────────────────
  // GET LEVEL PROGRESS
  // ─────────────────────────────────────────────
  const getLevelProgress = (game, level) => {
    return progress?.[game]?.levels?.[level]?.accuracy || 0;
  };

  // ─────────────────────────────────────────────
  // IS LEVEL COMPLETED
  // ─────────────────────────────────────────────
  const isLevelCompleted = (game, level) => {
    return progress?.[game]?.levels?.[level]?.completed || false;
  };

  // ─────────────────────────────────────────────
  // GET UNLOCKED LEVEL
  // ─────────────────────────────────────────────
  const getUnlockedLevel = (game) => {
    return progress?.[game]?.unlocked || 1;
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,

        initializeGame,

        completeLevel,

        updateLevelProgress,

        getLevelStats,

        getLevelProgress,

        isLevelCompleted,

        getUnlockedLevel,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);