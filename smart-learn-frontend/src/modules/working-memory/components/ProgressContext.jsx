import React, { createContext, useContext, useState } from "react";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState({
    "sequence-recall": {
      level1: 1, // only first star unlocked
    },
    "matching-pairs": {
      level1: 1,
    },
  });

  // unlock next level
  const completeLevel = (game, level) => {
    setProgress((prev) => {
      const current = prev[game]?.level1 || 1;

      if (level >= current && current < 5) {
        return {
          ...prev,
          [game]: {
            level1: current + 1,
          },
        };
      }

      return prev;
    });
  };

  return (
    <ProgressContext.Provider value={{ progress, completeLevel }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);