const KEY = 'smartlearn_dyscalculia_levels';
const NUMBER_MATCHING_LEVEL_RESET_KEY = 'smartlearn:number-matching:levels-reset-v1';
export const LEVELS = ['easy', 'medium', 'hard'];

const read = () => {
  try {
    const all = JSON.parse(localStorage.getItem(KEY)) || {};
    if (localStorage.getItem(NUMBER_MATCHING_LEVEL_RESET_KEY) !== 'true') {
      all.NumberMatchingGame = {};
      localStorage.setItem(KEY, JSON.stringify(all));
      localStorage.setItem(NUMBER_MATCHING_LEVEL_RESET_KEY, 'true');
    }
    return all;
  } catch {
    return {};
  }
};

export const getGameLevels = (gameKey) => {
  const saved = read()[gameKey] || {};
  return LEVELS.reduce((result, level, index) => ({
    ...result,
    [level]: { unlocked: index === 0 || Boolean(saved[level]?.unlocked), completed: Boolean(saved[level]?.completed), bestScore: saved[level]?.bestScore || 0 },
  }), {});
};

export const recordLevelResult = (gameKey, level, result) => {
  const all = read();
  const levels = getGameLevels(gameKey);
  if (!LEVELS.includes(level) || (gameKey === 'NumberMatchingGame' && !levels[level].unlocked)) {
    return { levels, passed: false };
  }
  const passed = result.correctAnswers >= Math.ceil((result.totalQuestions || 10) * 0.7);
  levels[level] = { ...levels[level], completed: levels[level].completed || passed, unlocked: true, bestScore: Math.max(levels[level].bestScore, result.score || 0) };
  const next = LEVELS[LEVELS.indexOf(level) + 1];
  if (passed && next) levels[next] = { ...levels[next], unlocked: true };
  all[gameKey] = levels;
  localStorage.setItem(KEY, JSON.stringify(all));
  return { levels, passed };
};

export const resetGameLevelProgress = (gameKey) => {
  const all = read();
  delete all[gameKey];
  localStorage.setItem(KEY, JSON.stringify(all));
};
