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
  // Spoken targets stay single-digit; distractors can repeat or extend that digit.
  // No leading-zero variants: "00" and "01" would duplicate the correct value.
  const repeated = target === '0' ? '10' : `${target}${target}`;
  const trickyPool = target === '0'
    ? ['20', '30', '40', '50']
    : [...new Set([`${target}0`, `1${target}`, `${target}1`])].filter((digit) => digit !== repeated);
  const tricky = [repeated];
  if (level !== 'easy') tricky.push(shuffleListeningOptions(trickyPool, random)[0]);
  const remaining = shuffleListeningOptions(pool, random);
  const distractors = [...tricky, ...remaining].slice(0, config.choices - 1);
  return shuffleListeningOptions([target, ...distractors], random);
};

export const listeningAccuracy = (correctAnswers, total = LISTENING_QUESTIONS_PER_LEVEL) =>
  total > 0 ? Math.round((correctAnswers / total) * 100) : 0;

export const listeningRewardStars = (accuracy) => {
  if (accuracy >= 88) return 3;
  if (accuracy >= 70) return 2;
  return 1;
};
