import React, { createContext, useContext, useState, useEffect } from "react";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("progress");
    return saved
      ? JSON.parse(saved)
      : {
          "sequence-recall": {
            unlocked: 1,
            levels: {}
          }
        };
  });

  // save to localStorage
  useEffect(() => {
    localStorage.setItem("progress", JSON.stringify(progress));
  }, [progress]);

  // ✅ COMPLETE LEVEL + UNLOCK NEXT
  const completeLevel = (game, level, stats = {}) => {
    setProgress((prev) => {
      const gameData = prev[game] || { unlocked: 1, levels: {} };

      const updatedLevels = {
        ...gameData.levels,
        [level]: {
          completed: true,
          accuracy: stats?.accuracy || 0,
        },
      };

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

  return (
    <ProgressContext.Provider value={{ progress, completeLevel }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);