import { LEVELS } from './gameLevelProgress';
export const nextUnlockedLevel = (level, levels) => {
  const index = LEVELS.indexOf(level);
  if (index < 0) return null;
  const next = LEVELS[index + 1];
  return next && levels[next]?.unlocked ? next : null;
};
