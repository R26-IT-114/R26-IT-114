import { recordLevelResult } from './gameLevelProgress';

export const NUMBER_TRACING_GAME_KEY = 'NumberTracingGame';
export const NUMBER_TRACING_LEVEL_ROUTE = '/dyscalculia/number-tracing';
export const NUMBER_TRACING_LEVEL_DIGITS = {
  easy: [0, 1, 2, 7],
  medium: [9, 3, 6],
  hard: [5, 8, 4],
};
export const NUMBER_TRACING_REQUIRED_COMPLETIONS = 2;

const STORAGE_KEY = 'smartlearn_number_tracing_level_progress';

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

export const getNumberTracingCompletedDigits = (level) => {
  const completedDigits = read()?.[level]?.completedDigits;
  return Array.isArray(completedDigits) ? completedDigits : [];
};

export const normalizeConfidencePercent = (confidence) => {
  const numeric = Number(confidence);
  if (!Number.isFinite(numeric)) return null;
  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return Math.round(Math.max(0, Math.min(100, percent)));
};

export const accuracyStarsFromConfidence = (confidence) => {
  const percent = normalizeConfidencePercent(confidence);
  return percent === null ? null : Math.max(1, Math.min(5, Math.ceil(percent / 20)));
};

export const getTracingLevelForDigit = (digit, requestedLevel) => {
  if (NUMBER_TRACING_LEVEL_DIGITS[requestedLevel]?.includes(digit)) return requestedLevel;
  return Object.entries(NUMBER_TRACING_LEVEL_DIGITS).find(([, digits]) => digits.includes(digit))?.[0] || 'easy';
};

export const recordNumberTracingPrediction = ({
  level,
  targetNumber,
  predictedNumber,
  confidence,
  correct,
}) => {
  const progress = read();
  const levelProgress = progress[level] || { completedDigits: [], attempts: [] };
  const accuracyPercent = normalizeConfidencePercent(confidence);
  const accuracyStars = accuracyStarsFromConfidence(confidence);
  const attempt = {
    targetNumber,
    predictedNumber,
    confidence,
    accuracyPercent,
    accuracyStars,
    correct: Boolean(correct),
    playedAt: new Date().toISOString(),
  };

  levelProgress.attempts = [...(levelProgress.attempts || []), attempt].slice(-100);
  if (correct && !levelProgress.completedDigits.includes(targetNumber)) {
    levelProgress.completedDigits = [...levelProgress.completedDigits, targetNumber];
  }
  progress[level] = levelProgress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  const requiredDigits = NUMBER_TRACING_LEVEL_DIGITS[level];
  const completedLevelDigits = levelProgress.completedDigits.filter((digit) => requiredDigits.includes(digit));
  const levelComplete = completedLevelDigits.length >= NUMBER_TRACING_REQUIRED_COMPLETIONS;
  const successfulAttempts = levelProgress.attempts.filter((item) => item.correct && item.accuracyPercent !== null);
  const averageAccuracy = successfulAttempts.length
    ? Math.round(successfulAttempts.reduce((sum, item) => sum + item.accuracyPercent, 0) / successfulAttempts.length)
    : 0;

  if (levelComplete) {
    recordLevelResult(NUMBER_TRACING_GAME_KEY, level, {
      correctAnswers: completedLevelDigits.length,
      totalQuestions: NUMBER_TRACING_REQUIRED_COMPLETIONS,
      score: averageAccuracy,
    });
  }

  return { levelComplete, averageAccuracy, completedDigits: levelProgress.completedDigits };
};
