import { DYSCALCULIA_REWARD_GAMES, digitUnitId, getRewardGame } from './dyscalculiaGameCatalog';
import { resetGameLevelProgress } from './gameLevelProgress';

const STORAGE_KEY = 'smartlearn_dyscalculia_progress';
const MAIN_GAME_RESET_CONFIG = {
  'number-tracing': { gameType: 'TracingNumbers', levelKey: 'NumberTracingGame' },
  'number-listening': { gameType: 'NumberListeningGame', levelKey: 'NumberListeningGame' },
  'number-sorting': { gameType: 'NumberSortingGame', levelKey: 'NumberSortingGame' },
  'balloon-pop': { gameType: 'BalloonPopGame', levelKey: 'BalloonPopGame', extraKeys: ['balloon_score'] },
  'symbol-detective': { gameType: 'SymbolDetectiveGame', levelKey: 'SymbolDetectiveGame', extraKeys: ['symbol_detective_progress'] },
  'number-matching': { gameType: 'NumberMatchingGame', levelKey: 'NumberMatchingGame' },
};
const LEGACY_HOME_STARS = {
  'game_number-tracing_stars': 'number-tracing',
  'game_listening_stars': 'number-listening',
  'game_sorting_stars': 'number-sorting',
  'game_balloon_stars': 'balloon-pop',
  'game_symbol-detective_stars': 'symbol-detective',
  'game_number-matching_stars': 'number-matching',
};
export const MAX_STARS_PER_GAME = 3;
export const MAX_STARS_PER_UNIT = MAX_STARS_PER_GAME;
export const ELIGIBLE_DYSCALCULIA_GAME_IDS = DYSCALCULIA_REWARD_GAMES.map(({ id }) => id);

let learnerId = null;

export const setDyscalculiaLearnerId = (id) => {
  learnerId = id ? String(id) : null;
};

const getStorageKey = () => learnerId ? `${STORAGE_KEY}:${encodeURIComponent(learnerId)}` : STORAGE_KEY;

// FIXED: Added constants here instead of missing import
const WEAK_AREA_ACCURACY_THRESHOLD_PERCENT = 70;
const WEAK_AREA_MIN_ATTEMPTS = 5;

// Initialize progress data structure
const initializeProgress = () => ({
  sessions: [],
  overallStats: {
    totalGames: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    starsEarned: 0,
    levelsCompleted: 0
  },
  bestStars: {},
  completedUnitsByGame: {},
  gameResetAt: {},
  legacyBestStars: {},
  completedGameIds: [],
  numberStats: {
    '0': { attempts: 0, correct: 0 },
    '1': { attempts: 0, correct: 0 },
    '2': { attempts: 0, correct: 0 },
    '3': { attempts: 0, correct: 0 },
    '4': { attempts: 0, correct: 0 },
    '5': { attempts: 0, correct: 0 },
    '6': { attempts: 0, correct: 0 },
    '7': { attempts: 0, correct: 0 },
    '8': { attempts: 0, correct: 0 },
    '9': { attempts: 0, correct: 0 }
  },
  gameStats: {
    'NumberListeningGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'BalloonPopGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'NumberSortingGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'TracingNumbers': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'TracingNumbersLearning': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'NumberMemoryWriting': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null }
    ,'SymbolDetectiveGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    NumberMatchingGame: { attempts: 0, correct: 0, wrong: 0, lastPlayed: null }
  },

  rewards: {
    stars: 0,
    badges: [],
    streak: 0,
    lastActivity: null
  }
});

const GAME_ID_BY_TYPE = {
  TracingNumbers: 'number-tracing',
  'Number Tracing Game': 'number-tracing',
  NumberListeningGame: 'number-listening',
  'Number Listening Game': 'number-listening',
  NumberSortingGame: 'number-sorting',
  'Number Sorting Game': 'number-sorting',
  BalloonPopGame: 'balloon-pop',
  'Balloon Pop Game': 'balloon-pop',
  SymbolDetectiveGame: 'symbol-detective',
  'Symbol Detective Game': 'symbol-detective',
  NumberMatchingGame: 'number-matching',
  'Number Matching': 'number-matching',
  AdaptiveNumberFindGame: 'adaptive-number-find',
  AdaptiveCountMatchGame: 'adaptive-count-match',
  AdaptiveNumberOrderGame: 'adaptive-number-order',
  AdaptiveQuickCompareGame: 'adaptive-quick-compare',
  NumberReviewGame: 'number-review',
};

const boundedStars = (value) => {
  const stars = Number(value);
  return Number.isFinite(stars) ? Math.max(0, Math.min(MAX_STARS_PER_GAME, Math.round(stars))) : 0;
};

const legacySortingDigitUnitIds = (unitId) => {
  if (typeof unitId !== 'string' || !unitId.startsWith('sequence-')) return [];
  const digits = unitId.slice('sequence-'.length).split('-').map(Number);
  return digits.every((digit) => Number.isInteger(digit) && digit >= 0 && digit <= 9)
    ? [...new Set(digits)].map(digitUnitId)
    : [];
};

const normalizeSymbolDetectiveUnitId = (unitId) => {
  if (['symbol-plus', 'symbol-minus', 'symbol-times', 'symbol-divide', 'symbol-equals', 'equation-medium'].includes(unitId)) {
    return [unitId];
  }
  const legacyEquation = /^equation-(plus|minus|times|divide)-\d+-\d+$/.exec(unitId);
  if (legacyEquation) return [`equation-hard-${legacyEquation[1]}`];
  return [];
};

const normalizeResetTimestamps = (resetTimestamps) => Object.fromEntries(
  Object.entries(resetTimestamps || {}).filter(
    ([gameId, timestamp]) => MAIN_GAME_RESET_CONFIG[gameId] && Number.isFinite(Date.parse(timestamp)),
  ),
);

const getTotalBestStars = (bestStars) => DYSCALCULIA_REWARD_GAMES.reduce(
  (total, game) => total + game.unitIds.reduce(
    (gameTotal, unitId) => gameTotal + boundedStars(bestStars?.[game.id]?.[unitId]),
    0,
  ),
  0,
);

const normalizeProgress = (progress) => {
  const defaultProgress = initializeProgress();
  const gameResetAt = normalizeResetTimestamps(progress?.gameResetAt);
  const bestStars = {};
  const completedUnitsByGame = {};
  const legacyBestStars = Object.fromEntries(
    Object.entries(progress?.legacyBestStars || {}).filter(([gameId]) => !gameResetAt[gameId]),
  );
  Object.entries(progress?.bestStars || {}).forEach(([gameId, saved]) => {
    const game = getRewardGame(gameId);
    if (gameResetAt[gameId]) return;
    if (!game) {
      if (Number.isFinite(Number(saved))) legacyBestStars[gameId] = boundedStars(saved);
      return;
    }
    if (typeof saved === 'number' || typeof saved === 'string') {
      legacyBestStars[gameId] = Math.max(
        boundedStars(legacyBestStars[gameId]),
        boundedStars(saved),
      );
      return;
    }
    if (!saved || typeof saved !== 'object') return;
    const unitScores = {};
    Object.entries(saved).forEach(([unitId, value]) => {
      const stars = boundedStars(value);
      const unitIds = game.unitIds.includes(unitId)
        ? [unitId]
        : gameId === 'number-sorting'
          ? legacySortingDigitUnitIds(unitId)
          : gameId === 'symbol-detective'
            ? normalizeSymbolDetectiveUnitId(unitId)
          : [];
      unitIds.forEach((scoringUnitId) => {
        if (stars > 0) {
          unitScores[scoringUnitId] = Math.max(
            boundedStars(unitScores[scoringUnitId]),
            stars,
          );
        }
      });
    });
    bestStars[gameId] = unitScores;
  });
  Object.entries(progress?.completedUnitsByGame || {}).forEach(([gameId, completedUnits]) => {
    const game = getRewardGame(gameId);
    if (!game || !Array.isArray(completedUnits) || gameResetAt[gameId]) return;
    completedUnitsByGame[gameId] = [...new Set(completedUnits.flatMap((unitId) => (
      game.unitIds.includes(unitId)
        ? [unitId]
        : gameId === 'number-sorting'
          ? legacySortingDigitUnitIds(unitId)
          : gameId === 'symbol-detective'
            ? normalizeSymbolDetectiveUnitId(unitId)
          : []
    )))];
  });

  const normalized = {
    ...defaultProgress,
    ...(progress || {}),
    overallStats: { ...defaultProgress.overallStats, ...(progress?.overallStats || {}) },
    rewards: { ...defaultProgress.rewards, ...(progress?.rewards || {}) },
    bestStars,
    completedUnitsByGame,
    gameResetAt,
    legacyBestStars,
    completedGameIds: Array.isArray(progress?.completedGameIds) ? [...progress.completedGameIds] : [],
    sessions: Array.isArray(progress?.sessions)
      ? progress.sessions.filter((session) => {
        const gameId = session.gameId || GAME_ID_BY_TYPE[session.gameType];
        const resetTimestamp = gameResetAt[gameId];
        return !resetTimestamp || Date.parse(session.playedAt) > Date.parse(resetTimestamp);
      })
      : [],
    numberStats: { ...defaultProgress.numberStats, ...(progress?.numberStats || {}) },
    gameStats: { ...defaultProgress.gameStats, ...(progress?.gameStats || {}) },
  };

  normalized.sessions.forEach((session) => {
    const gameId = session.gameId || GAME_ID_BY_TYPE[session.gameType];
    const game = getRewardGame(gameId);
    if (!game) return;
    const savedUnitResults = Array.isArray(session.unitResults)
      ? session.unitResults
      : gameId === 'number-tracing' && session.targetNumber != null
        ? [{ unitId: digitUnitId(session.targetNumber), starsEarned: session.completed ? session.starsEarned : 0, completed: true }]
        : [];
    const unitResults = savedUnitResults.flatMap((result) => {
      if (game.unitIds.includes(result.unitId)) return [result];
      const migratedUnitIds = gameId === 'number-sorting'
        ? legacySortingDigitUnitIds(result.unitId)
        : gameId === 'symbol-detective'
          ? normalizeSymbolDetectiveUnitId(result.unitId)
          : [];
      return migratedUnitIds.map((unitId) => ({ ...result, unitId }));
    });
    unitResults.forEach(({ unitId, starsEarned, completed = true }) => {
      if (!completed || !game.unitIds.includes(unitId)) return;
      const stars = boundedStars(starsEarned);
      normalized.completedUnitsByGame[gameId] ||= [];
      if (!normalized.completedUnitsByGame[gameId].includes(unitId)) {
        normalized.completedUnitsByGame[gameId].push(unitId);
      }
      normalized.bestStars[gameId] ||= {};
      normalized.bestStars[gameId][unitId] = Math.max(
        boundedStars(normalized.bestStars[gameId][unitId]),
        stars,
      );
    });
    if (unitResults.some(({ completed = true }) => completed)) normalized.completedGameIds.push(gameId);
  });

  normalized.completedGameIds = DYSCALCULIA_REWARD_GAMES
    .filter((game) => normalized.completedUnitsByGame[game.id]?.length === game.unitIds.length)
    .map(({ id }) => id);
  normalized.rewards.stars = getTotalBestStars(normalized.bestStars);
  normalized.overallStats.levelsCompleted = Math.max(
    Number(normalized.overallStats.levelsCompleted) || 0,
    Object.values(normalized.completedUnitsByGame).reduce((total, units) => total + units.length, 0),
  );
  return normalized;
};

// Get progress data from localStorage
export const getDyscalculiaProgress = () => {
  try {
    const key = getStorageKey();
    let stored = localStorage.getItem(key);
    let migratedLegacyProgress = false;
    if (!stored && learnerId) {
      stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localStorage.setItem(key, stored);
        localStorage.removeItem(STORAGE_KEY);
      }
      migratedLegacyProgress = true;
    }
    const progress = normalizeProgress(stored ? JSON.parse(stored) : initializeProgress());
    if (migratedLegacyProgress) {
      Object.entries(LEGACY_HOME_STARS).forEach(([legacyKey, gameId]) => {
        progress.legacyBestStars[gameId] = Math.max(
          progress.legacyBestStars[gameId] || 0,
          boundedStars(localStorage.getItem(legacyKey)),
        );
        localStorage.removeItem(legacyKey);
      });
      progress.rewards.stars = getTotalBestStars(progress.bestStars);
      localStorage.setItem(key, JSON.stringify(progress));
    }
    return progress;
  } catch (error) {
    console.error('Error loading progress:', error);
    return initializeProgress();
  }
};

// Save progress data to localStorage
export const saveDyscalculiaProgress = (progress) => {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(normalizeProgress(progress)));
    window.dispatchEvent(new Event('dyscalculia:progress-updated'));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

export const resetDyscalculiaGameProgress = (gameId) => {
  const config = MAIN_GAME_RESET_CONFIG[gameId];
  if (!config) throw new Error(`Cannot reset unsupported Dyscalculia game: ${gameId}`);

  const progress = getDyscalculiaProgress();
  const removedSessions = progress.sessions.filter(
    (session) => (session.gameId || GAME_ID_BY_TYPE[session.gameType]) === gameId,
  );
  const remainingSessions = progress.sessions.filter(
    (session) => (session.gameId || GAME_ID_BY_TYPE[session.gameType]) !== gameId,
  );
  const removedGameStats = progress.gameStats[config.gameType] || { attempts: 0, correct: 0 };

  progress.sessions = remainingSessions;
  progress.bestStars = { ...progress.bestStars };
  delete progress.bestStars[gameId];
  progress.completedUnitsByGame = { ...progress.completedUnitsByGame };
  delete progress.completedUnitsByGame[gameId];
  progress.legacyBestStars = { ...progress.legacyBestStars };
  delete progress.legacyBestStars[gameId];
  progress.gameResetAt = { ...progress.gameResetAt, [gameId]: new Date().toISOString() };
  progress.completedGameIds = progress.completedGameIds.filter((completedGameId) => completedGameId !== gameId);
  progress.gameStats = {
    ...progress.gameStats,
    [config.gameType]: { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
  };
  progress.overallStats = {
    ...progress.overallStats,
    totalGames: Math.max(0, progress.overallStats.totalGames - removedSessions.length),
    totalAttempts: Math.max(0, progress.overallStats.totalAttempts - (Number(removedGameStats.attempts) || 0)),
    totalCorrect: Math.max(0, progress.overallStats.totalCorrect - (Number(removedGameStats.correct) || 0)),
    levelsCompleted: Math.max(
      0,
      progress.overallStats.levelsCompleted - removedSessions.filter((session) => session.completed).length,
    ),
  };

  removedSessions.forEach((session) => {
    const numberResults = Array.isArray(session.numberResults)
      ? session.numberResults
      : session.targetNumber !== undefined
        ? [{ targetNumber: session.targetNumber, attempts: 1, correct: session.correct }]
        : [];
    numberResults.forEach((result) => {
      const number = String(result.targetNumber);
      if (!progress.numberStats[number]) return;
      progress.numberStats[number].attempts = Math.max(
        0,
        progress.numberStats[number].attempts - (Number(result.attempts) || 1),
      );
      if (result.correct) {
        progress.numberStats[number].correct = Math.max(0, progress.numberStats[number].correct - 1);
      }
    });
  });

  const orderedSessions = [...remainingSessions].sort(
    (left, right) => Date.parse(left.playedAt) - Date.parse(right.playedAt),
  );
  progress.rewards = {
    ...progress.rewards,
    streak: orderedSessions.reduce((streak, session) => {
      const correct = Number(session.correctCount) || (session.correct ? 1 : 0);
      return correct > 0 ? streak + correct : 0;
    }, 0),
    lastActivity: orderedSessions.at(-1)?.playedAt || null,
    badges: gameId === 'symbol-detective'
      ? progress.rewards.badges.filter((badge) => badge !== 'Symbol Master')
      : progress.rewards.badges,
  };

  if (!saveDyscalculiaProgress(progress)) {
    throw new Error(`Unable to save reset Dyscalculia progress for ${gameId}`);
  }

  resetGameLevelProgress(config.levelKey);
  (config.extraKeys || []).forEach((key) => localStorage.removeItem(key));
  return getDyscalculiaProgress();
};

const GAME_TYPE_ALIASES = {
  NumberListeningGame: 'NumberListeningGame',
  'Number Listening Game': 'NumberListeningGame',
  BalloonPopGame: 'BalloonPopGame',
  'Balloon Pop Game': 'BalloonPopGame',
  NumberSortingGame: 'NumberSortingGame',
  'Number Sorting Game': 'NumberSortingGame',

  TracingNumbers: 'TracingNumbers',
  'Number Tracing Game': 'TracingNumbers',

  TracingNumbersLearning: 'TracingNumbersLearning',
  'Number Tracing Learning': 'TracingNumbersLearning',

  NumberMemoryWriting: 'NumberMemoryWriting',
  'Number Memory Writing': 'NumberMemoryWriting',
  SymbolDetectiveGame: 'SymbolDetectiveGame',
  'Symbol Detective Game': 'SymbolDetectiveGame',
  NumberMatchingGame: 'NumberMatchingGame',
  'Number Matching': 'NumberMatchingGame',
  AdaptiveNumberFindGame: 'AdaptiveNumberFindGame',
  AdaptiveCountMatchGame: 'AdaptiveCountMatchGame',
  AdaptiveNumberOrderGame: 'AdaptiveNumberOrderGame',
  AdaptiveQuickCompareGame: 'AdaptiveQuickCompareGame',
  NumberReviewGame: 'NumberReviewGame',
};


// Save game session data
export const saveGameSession = (sessionData) => {
  const progress = getDyscalculiaProgress();
  const normalizedGameType = GAME_TYPE_ALIASES[sessionData.gameType] || sessionData.gameType;
  const gameId = getRewardGame(sessionData.gameId)
    ? sessionData.gameId
    : GAME_ID_BY_TYPE[normalizedGameType] || null;
  const attempts = Number(sessionData.attempts) || 1;
  const correctCount = Number.isFinite(sessionData.correctCount)
    ? sessionData.correctCount
    : (sessionData.correct ? 1 : 0);
  const wrongCount = Number.isFinite(sessionData.wrongCount)
    ? sessionData.wrongCount
    : (sessionData.correct ? 0 : 1);

  const completed = Boolean(sessionData.completed);
  const game = getRewardGame(gameId);
  const incomingUnits = Array.isArray(sessionData.unitResults)
    ? sessionData.unitResults
    : sessionData.unitId
      ? [{ unitId: sessionData.unitId, starsEarned: sessionData.starsEarned, completed }]
      : gameId === 'number-tracing' && sessionData.targetNumber != null
        ? [{
          unitId: digitUnitId(sessionData.targetNumber),
          starsEarned: completed ? sessionData.starsEarned : 0,
          completed,
        }]
      : [];
  const attemptsByUnit = new Map();
  incomingUnits.forEach(({ unitId, starsEarned, completed: unitCompleted = completed }) => {
    if (!game || !unitCompleted || !game.unitIds.includes(unitId)) return;
    attemptsByUnit.set(unitId, Math.max(
      boundedStars(attemptsByUnit.get(unitId)),
      boundedStars(starsEarned),
    ));
  });
  const existingBest = gameId ? { ...(progress.bestStars[gameId] || {}) } : {};
  const completedUnits = gameId ? new Set(progress.completedUnitsByGame[gameId] || []) : new Set();
  const unitResults = [...attemptsByUnit].map(([unitId, attemptStars]) => {
    const previousBest = boundedStars(existingBest[unitId]);
    const bestStars = Math.max(previousBest, attemptStars);
    const starsAwarded = bestStars - previousBest;
    existingBest[unitId] = bestStars;
    completedUnits.add(unitId);
    return { unitId, attemptStars, bestStars, starsAwarded, improved: starsAwarded > 0, completed: true };
  });
  const possibleStarsAwarded = unitResults.reduce((total, result) => total + result.starsAwarded, 0);
  const attemptStars = game
    ? unitResults.reduce((total, result) => total + result.attemptStars, 0)
    : boundedStars(sessionData.starsEarned);
  const recordedAttemptStars = unitResults.length
    ? attemptStars
    : boundedStars(sessionData.starsEarned);
  const bestStars = unitResults.reduce((total, result) => total + result.bestStars, 0);
  const rewardResult = {
    gameId,
    attemptStars,
    bestStars,
    starsAwarded: possibleStarsAwarded,
    improved: possibleStarsAwarded > 0,
    completed,
    unitResults,
  };

  // Keep attempts separate from the best score stored for every scoring unit.
  progress.sessions.push({
    ...sessionData,
    gameType: normalizedGameType,
    gameId,
    starsEarned: recordedAttemptStars,
    unitResults: unitResults.map(({ unitId, attemptStars, bestStars: unitBest, starsAwarded, completed: unitCompleted }) => ({
      unitId,
      starsEarned: attemptStars,
      bestStars: unitBest,
      starsAwarded,
      completed: unitCompleted,
    })),
    starsAwarded: possibleStarsAwarded,
    completed,
    sessionId: sessionData.sessionId || (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
    playedAt: new Date().toISOString(),
  });

  // Update overall stats
  progress.overallStats.totalGames += 1;
  progress.overallStats.totalAttempts += attempts;
  progress.overallStats.totalCorrect += correctCount;
  if (completed) {
    progress.overallStats.levelsCompleted += 1;
  }
  if (gameId && unitResults.length) {
    progress.bestStars[gameId] = existingBest;
    progress.completedUnitsByGame[gameId] = [...completedUnits];
    if (completedUnits.size === game.unitIds.length && !progress.completedGameIds.includes(gameId)) {
      progress.completedGameIds.push(gameId);
    }
  }

  // Update number stats
  if (Array.isArray(sessionData.numberResults)) {
    sessionData.numberResults.forEach((result) => {
      const num = result.targetNumber?.toString();
      if (progress.numberStats[num]) {
        progress.numberStats[num].attempts += result.attempts || 1;
        if (result.correct) progress.numberStats[num].correct += 1;
      }
    });
  } else if (sessionData.targetNumber !== undefined) {
    const num = sessionData.targetNumber.toString();
    if (progress.numberStats[num]) {
      progress.numberStats[num].attempts += 1;
      if (sessionData.correct) {
        progress.numberStats[num].correct += 1;
      }
    }
  }

  // Update game stats
  if (!progress.gameStats[normalizedGameType]) {
    progress.gameStats[normalizedGameType] = { attempts: 0, correct: 0, wrong: 0, lastPlayed: null };
  }
  const gameStat = progress.gameStats[normalizedGameType];
  gameStat.attempts += attempts;
  gameStat.correct += correctCount;
  gameStat.wrong += wrongCount;
  gameStat.lastPlayed = new Date().toISOString();

  progress.rewards.stars = getTotalBestStars(progress.bestStars);
  if (correctCount > 0) {
    progress.rewards.streak += correctCount;
  } else {
    progress.rewards.streak = 0;
  }
  progress.rewards.lastActivity = new Date().toISOString();

  // Add badges based on achievements
  if (progress.overallStats.totalCorrect >= 10 && !progress.rewards.badges.includes('First Steps')) {
    progress.rewards.badges.push('First Steps');
  }
  if (progress.rewards.streak >= 5 && !progress.rewards.badges.includes('Streak Master')) {
    progress.rewards.badges.push('Streak Master');
  }
  if (normalizedGameType === 'SymbolDetectiveGame' && sessionData.symbolAccuracy) {
    const symbolAccuracy = Object.values(sessionData.symbolAccuracy);
    if (symbolAccuracy.length === 7 && symbolAccuracy.every((accuracy) => accuracy >= 70) && !progress.rewards.badges.includes('Symbol Master')) {
      progress.rewards.badges.push('Symbol Master');
    }
  }

  const persisted = saveDyscalculiaProgress(progress);
  if (!persisted) {
    rewardResult.bestStars = Math.max(0, bestStars - possibleStarsAwarded);
    rewardResult.starsAwarded = 0;
    rewardResult.improved = false;
    rewardResult.unitResults = unitResults.map((result) => ({
      ...result,
      bestStars: result.bestStars - result.starsAwarded,
      starsAwarded: 0,
      improved: false,
    }));
  }
  if (persisted && possibleStarsAwarded > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dyscalculia:stars-awarded', {
      detail: { amount: possibleStarsAwarded, targetTotal: progress.rewards.stars, gameId },
    }));
  }
  return { progress, rewardResult };
};

// Get overall stats for dashboard
export const getOverallStats = (progress) => {
  const p = normalizeProgress(progress || getDyscalculiaProgress());
  const accuracy = p.overallStats.totalAttempts > 0
    ? Math.round((p.overallStats.totalCorrect / p.overallStats.totalAttempts) * 100)
    : 0;

  return {
    totalGames: p.overallStats.totalGames,
    totalCorrect: p.overallStats.totalCorrect,
    accuracy,
    starsEarned: p.rewards.stars,
    levelsCompleted: p.overallStats.levelsCompleted
  };
};

// Get number recognition progress
export const getNumberRecognitionProgress = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const result = {};

  for (let i = 0; i <= 9; i++) {
    const num = i.toString();
    const stats = p.numberStats[num];
    result[num] = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  }

  return result;
};

// Handwriting quality reported by the tracing ML model. This is deliberately
// separate from correctness and from the game's completion reward stars.
export const getTracingAccuracyProgress = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const tracingSessions = p.sessions.filter(
    (session) => session.gameType === 'TracingNumbers' && Number.isFinite(session.accuracyPercent)
  );
  const averageAccuracy = tracingSessions.length
    ? Math.round(tracingSessions.reduce((sum, session) => sum + session.accuracyPercent, 0) / tracingSessions.length)
    : 0;

  return {
    averageAccuracy,
    attempts: tracingSessions.length,
    latest: tracingSessions.at(-1) || null,
  };
};

// Get game performance stats
export const getGamePerformance = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const result = {};

  Object.entries(p.gameStats).forEach(([gameType, stats]) => {
    const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
    const lastPlayed = stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never';

    result[gameType] = {
      attempts: stats.attempts,
      correct: stats.correct,
      wrong: stats.wrong,
      accuracy,
      lastPlayed
    };
  });

  return result;
};

// Detect weak areas 
export const getWeakAreas = (progress) => {
  const numberProgress = getNumberRecognitionProgress(progress);
  return Object.entries(numberProgress)
    .filter(([num, accuracy]) => accuracy < WEAK_AREA_ACCURACY_THRESHOLD_PERCENT && progress.numberStats[num].attempts > WEAK_AREA_MIN_ATTEMPTS)
    .map(([num]) => num);
};

// Get activity timeline
export const getActivityTimeline = (progress) => {
  const p = progress || getDyscalculiaProgress();
  return p.sessions
    .slice(-20)
    .reverse()
    .map(session => ({
      activity: `Played ${session.gameType} - ${session.correct ? 'Correct' : 'Incorrect'}`,
      time: new Date(session.playedAt).toLocaleString()
    }));
};

// Get rewards data
export const getRewards = (progress) => {
  const p = normalizeProgress(progress || getDyscalculiaProgress());
  const messages = [
    'ඉහළට යන්න! ඔබේ ප්‍රගතිය අසාමාන්‍යයි!',
    'ඔබේ උත්සාහයට ස්තුතියි! තවත් ඉගෙන ගන්න!',
    'අංක රාජ්‍යයේ රජු වීමට මාර්ගයේ සිටිනවා!',
    'ඔබේ දැනුම වැඩි වෙමින් පවතිනවා!'
  ];

  return {
    stars: p.rewards.stars,
    badges: p.rewards.badges,
    streak: p.rewards.streak,
    message: messages[Math.floor(Math.random() * messages.length)]
  };
};

// Reset progress
export const resetProgress = () => {
  localStorage.removeItem(getStorageKey());
};

export const getUnitStarProgress = (progress, gameId, unitId) => {
  const p = normalizeProgress(progress || getDyscalculiaProgress());
  const game = getRewardGame(gameId);
  if (!game || !game.unitIds.includes(unitId)) {
    return { attemptStars: 0, bestStars: 0, starsAwarded: 0, completed: false };
  }
  const latestResult = [...p.sessions].reverse()
    .find((session) => session.gameId === gameId)
    ?.unitResults?.find((unit) => unit.unitId === unitId);
  return {
    attemptStars: boundedStars(latestResult?.starsEarned),
    bestStars: boundedStars(p.bestStars[gameId]?.[unitId]),
    starsAwarded: boundedStars(latestResult?.starsAwarded),
    completed: Boolean(p.completedUnitsByGame[gameId]?.includes(unitId)),
  };
};

const getGameStarProgressFromNormalized = (p, gameId) => {
  const game = getRewardGame(gameId);
  if (!game) {
    return { earnedStars: 0, maximumStars: 0, progressPercentage: 0, completedUnits: 0, totalUnits: 0 };
  }
  const earnedStars = game.unitIds.reduce(
    (total, unitId) => total + boundedStars(p.bestStars[gameId]?.[unitId]),
    0,
  );
  const completedUnits = game.unitIds.filter(
    (unitId) => p.completedUnitsByGame[gameId]?.includes(unitId),
  ).length;
  const maximumStars = game.unitIds.length * MAX_STARS_PER_GAME;
  return {
    earnedStars,
    maximumStars,
    progressPercentage: maximumStars > 0 ? Math.round((earnedStars / maximumStars) * 100) : 0,
    completedUnits,
    totalUnits: game.unitIds.length,
  };
};

export const getGameStarProgress = (progress, gameId) => (
  getGameStarProgressFromNormalized(normalizeProgress(progress || getDyscalculiaProgress()), gameId)
);

export const getStarProgress = (
  progress = getDyscalculiaProgress(),
  gameIds = ELIGIBLE_DYSCALCULIA_GAME_IDS,
) => {
  const p = normalizeProgress(progress);
  const gameProgress = [...new Set(gameIds)]
    .filter((gameId) => getRewardGame(gameId))
    .map((gameId) => getGameStarProgressFromNormalized(p, gameId));
  const earnedStars = gameProgress.reduce((total, game) => total + game.earnedStars, 0);
  const maximumStars = gameProgress.reduce((total, game) => total + game.maximumStars, 0);
  const completedGames = gameProgress.filter(
    (game) => game.totalUnits > 0 && game.completedUnits === game.totalUnits,
  ).length;
  return {
    earnedStars,
    maximumStars,
    progressPercentage: maximumStars > 0 ? Math.round((earnedStars / maximumStars) * 100) : 0,
    completedGames,
    totalGames: gameProgress.length,
  };
};

export const getAllGameStarProgress = (
  progress = getDyscalculiaProgress(),
  gameIds = ELIGIBLE_DYSCALCULIA_GAME_IDS,
) => {
  const normalized = normalizeProgress(progress);
  return [...new Set(gameIds)].flatMap((gameId) => {
    const game = getRewardGame(gameId);
    if (!game) return [];
    const gameProgress = getGameStarProgressFromNormalized(normalized, game.id);
    return {
      ...game,
      ...gameProgress,
      completed: game.unitIds.length > 0 && gameProgress.completedUnits === game.unitIds.length,
    };
  });
};

export const mergeDyscalculiaProgress = (current, incoming) => {
  const currentResetAt = normalizeResetTimestamps(current?.gameResetAt);
  const incomingResetAt = normalizeResetTimestamps(incoming?.gameResetAt);
  const gameResetAt = { ...currentResetAt };
  Object.entries(incomingResetAt).forEach(([gameId, timestamp]) => {
    if (!gameResetAt[gameId] || Date.parse(timestamp) > Date.parse(gameResetAt[gameId])) {
      gameResetAt[gameId] = timestamp;
    }
  });
  const existing = normalizeProgress({ ...(current || {}), gameResetAt });
  const incomingProgress = normalizeProgress({ ...(incoming || current || {}), gameResetAt });
  const currentHasNewerReset = Object.entries(gameResetAt).some(
    ([gameId, timestamp]) => Date.parse(timestamp) > (Date.parse(incomingResetAt[gameId]) || 0),
  );
  const merged = normalizeProgress({
    ...(currentHasNewerReset ? existing : incomingProgress),
    gameResetAt,
  });
  const bestStars = { ...existing.bestStars };
  Object.entries(merged.bestStars).forEach(([gameId, units]) => {
    bestStars[gameId] = { ...(bestStars[gameId] || {}) };
    Object.entries(units).forEach(([unitId, stars]) => {
      bestStars[gameId][unitId] = Math.max(
        boundedStars(bestStars[gameId][unitId]),
        boundedStars(stars),
      );
    });
  });
  merged.bestStars = bestStars;
  merged.gameResetAt = gameResetAt;
  merged.completedUnitsByGame = { ...existing.completedUnitsByGame };
  Object.entries(incomingProgress.completedUnitsByGame).forEach(([gameId, units]) => {
    merged.completedUnitsByGame[gameId] = [...new Set([
      ...(merged.completedUnitsByGame[gameId] || []),
      ...units,
    ])];
  });
  merged.rewards.stars = getTotalBestStars(merged.bestStars);
  const sessionsById = new Map();
  [...existing.sessions, ...merged.sessions].forEach((session) => {
    const id = session.sessionId || JSON.stringify(session);
    sessionsById.set(id, session);
  });
  merged.sessions = [...sessionsById.values()];
  return normalizeProgress(merged);
};
