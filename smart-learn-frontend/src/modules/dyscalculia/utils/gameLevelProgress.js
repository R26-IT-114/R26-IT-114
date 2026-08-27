const KEY = 'smartlearn_dyscalculia_levels';
export const LEVELS = ['easy', 'medium', 'hard'];

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
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
  const passed = result.correctAnswers >= Math.ceil((result.totalQuestions || 10) * 0.7);
  levels[level] = { ...levels[level], completed: levels[level].completed || passed, unlocked: true, bestScore: Math.max(levels[level].bestScore, result.score || 0) };
  const next = LEVELS[LEVELS.indexOf(level) + 1];
  if (passed && next) levels[next] = { ...levels[next], unlocked: true };
  all[gameKey] = levels;
  localStorage.setItem(KEY, JSON.stringify(all));
  return { levels, passed };
};
