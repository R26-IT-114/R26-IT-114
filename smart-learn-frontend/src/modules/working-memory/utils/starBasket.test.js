import { beforeEach, expect, it } from 'vitest';
import { improveBasket, loadBasket, saveBasket } from './starBasket';
import { getBestStarsByGame } from './performanceMetrics';

beforeEach(() => localStorage.clear());
it('adds only improvements and never deducts on a weaker or equal replay', () => {
  let basket = { best: {}, total: 0 };
  basket = improveBasket(basket, 'n-back', 5);
  expect(basket.total).toBe(5);
  basket = improveBasket(basket, 'n-back', 3);
  basket = improveBasket(basket, 'n-back', 5);
  expect(basket.total).toBe(5);
  basket = improveBasket(basket, 'n-back', 8);
  expect(basket.total).toBe(8);
  basket = improveBasket(basket, 'puzzle-game', 6);
  expect(basket.total).toBe(14);
});
it('preserves existing balances, persists bests and isolates accounts', () => {
  const basket = loadBasket('child-a', { 'n-back': 5 }, 20);
  saveBasket('child-a', basket);
  expect(loadBasket('child-a', { 'n-back': 8 }).total).toBe(23);
  expect(loadBasket('child-b').total).toBe(0);
});
it('merges server improvements without counting them again on refresh', () => {
  saveBasket('child', { best: { 'n-back': 5 }, total: 5 });
  const merged = loadBasket('child', { 'n-back': 8 });
  saveBasket('child', merged);
  expect(loadBasket('child', { 'n-back': 8 }).total).toBe(8);
  expect(loadBasket('child', { 'n-back': 2 }).total).toBe(8);
});
it('reconstructs best scores for all seven games from saved results', () => {
  const best = getBestStarsByGame({
    'n-back': { performanceHistory: [{ metrics: { correct: 2 } }, { metrics: { correct: 5 } }, { metrics: { correct: 3 } }] },
    'puzzle-game': { performanceHistory: [{ metrics: { level: 1, correctPlacements: 4 } }, { metrics: { level: 2, correctPlacements: 8 } }] },
  });
  expect(Object.keys(best)).toHaveLength(7);
  expect(best['n-back']).toBe(5);
  expect(best['puzzle-game']).toBe(8);
});
