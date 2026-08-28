export const LISTENING_QUESTIONS_PER_LEVEL = 8;

export const LISTENING_LEVEL_CONFIG = {
  easy: { max: 3, choices: 3 },
  medium: { max: 6, choices: 5 },
  hard: { max: 9, choices: 8 },
};

export const shuffleListeningOptions = (values, random = Math.random) => {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

export const buildListeningOptions = (targetDigit, level, random = Math.random) => {
  const config = LISTENING_LEVEL_CONFIG[level];
  const target = String(targetDigit);
  const pool = Array.from({ length: config.max + 1 }, (_, digit) => String(digit))
    .filter((digit) => digit !== target);
  const distractors = shuffleListeningOptions(pool, random).slice(0, config.choices - 1);
  return shuffleListeningOptions([target, ...distractors], random);
};

export const listeningAccuracy = (correctAnswers, total = LISTENING_QUESTIONS_PER_LEVEL) =>
  total > 0 ? Math.round((correctAnswers / total) * 100) : 0;

export const listeningRewardStars = (accuracy) => {
  if (accuracy >= 88) return 3;
  if (accuracy >= 70) return 2;
  return 1;
};
