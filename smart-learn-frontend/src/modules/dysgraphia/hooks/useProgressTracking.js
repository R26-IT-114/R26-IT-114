import { useCallback, useEffect, useState } from 'react';

const PROGRESS_STORAGE_KEY = 'smartlearn.dysgraphia.progress';

// Initialize default progress structure
const createDefaultProgress = () => ({
  // Letter learning (3 levels)
  letters: {
    level1: { name: 'අදියර 1', completed: 0, total: 5, stars: 0, letterProgress: {} },
    level2: { name: 'අදියර 2', completed: 0, total: 5, stars: 0, letterProgress: {} },
    level3: { name: 'අදියර 3', completed: 0, total: 6, stars: 0, letterProgress: {} },
  },
  // Word games (Level 4)
  words: {
    twoLetters: { name: 'අක්ෂර දෙක', completed: 0, total: 10, stars: 0, wordProgress: {} },
    threeLetters: { name: 'අක්ෂර තුන', completed: 0, total: 12, stars: 0, wordProgress: {} },
  },
  // Overall stats
  stats: {
    totalStars: 0,
    totalMinutesSpent: 0,
    sessionsCompleted: 0,
    lastSessionDate: null,
    totalItemsCompleted: 0,
  },
  // Session history
  sessions: [],
});

const readStoredProgress = () => {
  if (typeof window === 'undefined') return createDefaultProgress();

  const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  try {
    const parsed = stored ? JSON.parse(stored) : createDefaultProgress();
    return { ...createDefaultProgress(), ...parsed };
  } catch (e) {
    console.error('Error parsing progress:', e);
    return createDefaultProgress();
  }
};

export const useProgressTracking = () => {
  const [progress, setProgress] = useState(readStoredProgress);

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Update letter progress
  const updateLetterProgress = useCallback((level, letterId, starsEarned) => {
    setProgress((current) => {
      const updated = { ...current };
      const levelKey = `level${level}`;
      
      if (!updated.letters[levelKey].letterProgress[letterId]) {
        updated.letters[levelKey].letterProgress[letterId] = { stars: 0, completed: false };
        updated.letters[levelKey].completed += 1;
      }

      const oldStars = updated.letters[levelKey].letterProgress[letterId].stars;
      updated.letters[levelKey].letterProgress[letterId].stars = starsEarned;
      updated.letters[levelKey].letterProgress[letterId].completed = starsEarned > 0;

      // Update level stars
      const levelLetters = Object.values(updated.letters[levelKey].letterProgress);
      updated.letters[levelKey].stars = levelLetters.reduce((sum, item) => sum + item.stars, 0);

      // Update total stats
      const starsDiff = starsEarned - oldStars;
      updated.stats.totalStars += starsDiff;
      updated.stats.totalItemsCompleted = Object.values(updated.letters)
        .reduce((sum, level) => sum + level.completed, 0);

      return updated;
    });
  }, []);

  // Update word game progress
  const updateWordProgress = useCallback((wordType, wordId, starsEarned) => {
    setProgress((current) => {
      const updated = { ...current };
      const wordKey = wordType === 'twoLetters' ? 'twoLetters' : 'threeLetters';

      if (!updated.words[wordKey].wordProgress[wordId]) {
        updated.words[wordKey].wordProgress[wordId] = { stars: 0, completed: false };
        updated.words[wordKey].completed += 1;
      }

      const oldStars = updated.words[wordKey].wordProgress[wordId].stars;
      updated.words[wordKey].wordProgress[wordId].stars = starsEarned;
      updated.words[wordKey].wordProgress[wordId].completed = starsEarned > 0;

      // Update word type stars
      const typeWords = Object.values(updated.words[wordKey].wordProgress);
      updated.words[wordKey].stars = typeWords.reduce((sum, item) => sum + item.stars, 0);

      // Update total stats
      const starsDiff = starsEarned - oldStars;
      updated.stats.totalStars += starsDiff;
      updated.stats.totalItemsCompleted = 
        Object.values(updated.letters).reduce((sum, level) => sum + level.completed, 0) +
        Object.values(updated.words).reduce((sum, word) => sum + word.completed, 0);

      return updated;
    });
  }, []);

  // Add session
  const addSession = useCallback((durationMinutes, itemsCompleted, starsEarned, module) => {
    setProgress((current) => {
      const updated = { ...current };
      updated.stats.sessionsCompleted += 1;
      updated.stats.totalMinutesSpent += durationMinutes;
      updated.stats.lastSessionDate = new Date().toISOString();

      updated.sessions.push({
        date: new Date().toISOString(),
        duration: durationMinutes,
        itemsCompleted,
        starsEarned,
        module,
      });

      // Keep only last 30 sessions
      if (updated.sessions.length > 30) {
        updated.sessions = updated.sessions.slice(-30);
      }

      return updated;
    });
  }, []);

  // Get overall stats
  const getStats = useCallback(() => ({
    totalStars: progress.stats.totalStars,
    totalMinutesSpent: Math.round(progress.stats.totalMinutesSpent),
    sessionsCompleted: progress.stats.sessionsCompleted,
    totalItemsCompleted: progress.stats.totalItemsCompleted,
    lastSessionDate: progress.stats.lastSessionDate,
    letterCompletion: {
      level1: Math.round((progress.letters.level1.completed / progress.letters.level1.total) * 100),
      level2: Math.round((progress.letters.level2.completed / progress.letters.level2.total) * 100),
      level3: Math.round((progress.letters.level3.completed / progress.letters.level3.total) * 100),
    },
    wordCompletion: {
      twoLetters: Math.round((progress.words.twoLetters.completed / progress.words.twoLetters.total) * 100),
      threeLetters: Math.round((progress.words.threeLetters.completed / progress.words.threeLetters.total) * 100),
    },
  }), [progress]);

  // Reset progress (optional)
  const resetProgress = useCallback(() => {
    setProgress(createDefaultProgress());
  }, []);

  return {
    progress,
    updateLetterProgress,
    updateWordProgress,
    addSession,
    getStats,
    resetProgress,
  };
};
