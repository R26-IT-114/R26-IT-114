const amount = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;

export const improveBasket = (basket, game, earned) => {
  const previous = amount(basket.best[game]);
  const best = Math.max(previous, amount(earned));
  return { best: { ...basket.best, [game]: best }, total: basket.total + best - previous };
};

export const loadBasket = (storageKey, savedBest = {}, legacyTotal = 0) => {
  let stored;
  try { stored = JSON.parse(localStorage.getItem(`${storageKey}:best-games`)); } catch { /* Ignore invalid storage. */ }
  if (stored?.version === 1 && stored.best && typeof stored.best === 'object') {
    let basket = { best: {}, total: amount(stored.total) };
    Object.entries(stored.best).forEach(([game, stars]) => { basket.best[game] = amount(stars); });
    basket.total = Math.max(basket.total, Object.values(basket.best).reduce((sum, stars) => sum + stars, 0));
    Object.entries(savedBest).forEach(([game, stars]) => { basket = improveBasket(basket, game, stars); });
    return basket;
  }
  const best = Object.fromEntries(Object.entries(savedBest).map(([game, stars]) => [game, amount(stars)]));
  return { best, total: Math.max(amount(legacyTotal), Object.values(best).reduce((sum, stars) => sum + stars, 0)) };
};

export const saveBasket = (storageKey, basket) => {
  try {
    localStorage.setItem(`${storageKey}:best-games`, JSON.stringify({ version: 1, ...basket }));
    localStorage.setItem(storageKey, String(basket.total));
  } catch { /* Keep the in-memory basket when storage is unavailable. */ }
};
