const keyFor = (userId) => `wm_story_checkpoint:${userId || 'guest'}`;
export const readStoryCheckpoint = (userId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(userId)));
    return saved?.version === 1 && ['score', 'totalWrong', 'totalResponseMs', 'responseCount'].every(field => Number.isFinite(saved[field]) && saved[field] >= 0) ? saved : null;
  } catch { return null; }
};
export const saveStoryCheckpoint = (userId, result) => {
  const saved = { version: 1, score: result.score, totalWrong: result.totalWrong, totalResponseMs: result.totalResponseMs || 0, responseCount: result.responseCount || 0 };
  try { localStorage.setItem(keyFor(userId), JSON.stringify(saved)); } catch { /* Continue if storage is unavailable. */ }
  return saved;
};
export const clearStoryCheckpoint = (userId) => {
  try { localStorage.removeItem(keyFor(userId)); } catch { /* Storage may be unavailable. */ }
};
