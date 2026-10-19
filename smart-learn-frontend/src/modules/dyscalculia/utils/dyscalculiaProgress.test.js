import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DYSCALCULIA_REWARD_GAMES, getSymbolDetectiveUnitId, MAIN_DYSCALCULIA_GAME_IDS, getRewardGame } from './dyscalculiaGameCatalog';
import { getGameLevels, recordLevelResult } from './gameLevelProgress';
import {
  ELIGIBLE_DYSCALCULIA_GAME_IDS,
  getAllGameStarProgress,
  getDyscalculiaProgress,
  getGameStarProgress,
  getStarProgress,
  mergeDyscalculiaProgress,
  resetDyscalculiaGameProgress,
  saveGameSession,
  setDyscalculiaLearnerId,
} from './dyscalculiaProgress';

const firstUnit = (gameId) => getRewardGame(gameId).unitIds[0];

const finish = (gameId, starsEarned, sessionId = `${gameId}-${Math.random()}`, unitId = firstUnit(gameId)) => saveGameSession({
  gameId,
  gameType: `Test-${gameId}`,
  attempts: 1,
  correctCount: starsEarned > 0 ? 1 : 0,
  starsEarned,
  unitId,
  completed: true,
  sessionId,
});

beforeEach(() => {
  setDyscalculiaLearnerId(null);
  localStorage.clear();
});

afterEach(() => {
  setDyscalculiaLearnerId(null);
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('Dyscalculia per-unit star rewards', () => {
  it('awards three stars on a first perfect scoring-unit completion', () => {
    const { rewardResult } = finish('number-listening', 3, 'first-perfect');

    expect(rewardResult).toMatchObject({
      attemptStars: 3,
      bestStars: 3,
      starsAwarded: 3,
      unitResults: [{ attemptStars: 3, bestStars: 3, starsAwarded: 3 }],
    });
    expect(getDyscalculiaProgress().rewards.stars).toBe(3);
  });

  it('does not award stars again when the same unit is replayed perfectly', () => {
    finish('number-listening', 3, 'perfect-once');
    const replay = finish('number-listening', 3, 'perfect-again');

    expect(replay.rewardResult).toMatchObject({ bestStars: 3, starsAwarded: 0, improved: false });
    expect(getDyscalculiaProgress().rewards.stars).toBe(3);
  });

  it('keeps the best score after a lower replay', () => {
    finish('number-sorting', 3, 'sorting-perfect');
    const replay = finish('number-sorting', 2, 'sorting-replay');
    const progress = getDyscalculiaProgress();

    expect(replay.rewardResult).toMatchObject({ attemptStars: 2, bestStars: 3, starsAwarded: 0 });
    expect(progress.bestStars['number-sorting'][firstUnit('number-sorting')]).toBe(3);
    expect(progress.rewards.stars).toBe(3);
  });

  it('stores a one-star first result and adds only the two-star improvement', () => {
    const first = finish('balloon-pop', 1, 'balloon-first');
    const improved = finish('balloon-pop', 3, 'balloon-improved');

    expect(first.rewardResult).toMatchObject({ bestStars: 1, starsAwarded: 1 });
    expect(improved.rewardResult).toMatchObject({ bestStars: 3, starsAwarded: 2 });
    expect(getDyscalculiaProgress().rewards.stars).toBe(3);
  });

  it('persists saved unit stars across reload reads and scopes progress to learner profiles', () => {
    setDyscalculiaLearnerId('child-a');
    finish('number-tracing', 3, 'child-a-tracing');

    setDyscalculiaLearnerId('child-b');
    expect(getDyscalculiaProgress().rewards.stars).toBe(0);
    finish('number-listening', 1, 'child-b-listening');

    setDyscalculiaLearnerId('child-a');
    const progress = getDyscalculiaProgress();
    expect(progress.rewards.stars).toBe(3);
    expect(progress.bestStars['number-tracing'][firstUnit('number-tracing')]).toBe(3);
    expect(progress.bestStars['number-listening']).toBeUndefined();
  });

  it('calculates actual catalog maxima for every existing reward game', () => {
    const sizes = Object.fromEntries(DYSCALCULIA_REWARD_GAMES.map(({ id, unitIds }) => [id, unitIds.length]));

    expect(sizes).toEqual({
      'number-tracing': 10,
      'number-listening': 10,
      'number-sorting': 10,
      'balloon-pop': 10,
      'number-matching': 10,
      'symbol-detective': 10,
      'adaptive-number-find': 10,
      'adaptive-count-match': 10,
      'adaptive-number-order': 10,
      'adaptive-quick-compare': 10,
      'number-review': 10,
    });
    expect(getRewardGame('number-sorting').unitIds).toEqual(
      Array.from({ length: 10 }, (_, digit) => `digit-${digit}`),
    );
    expect(DYSCALCULIA_REWARD_GAMES.reduce((sum, game) => sum + game.unitIds.length * 3, 0)).toBe(330);
  });

  it('calculates full-module stars from best results across all scoring units', () => {
    DYSCALCULIA_REWARD_GAMES.forEach(({ id, unitIds }) => {
      unitIds.forEach((unitId, index) => finish(id, 3, `${id}-${index}`, unitId));
    });

    const progress = getDyscalculiaProgress();
    expect(progress.completedGameIds).toHaveLength(ELIGIBLE_DYSCALCULIA_GAME_IDS.length);
    expect(getStarProgress(progress)).toEqual({
      earnedStars: 330,
      maximumStars: 330,
      progressPercentage: 100,
      completedGames: ELIGIBLE_DYSCALCULIA_GAME_IDS.length,
      totalGames: ELIGIBLE_DYSCALCULIA_GAME_IDS.length,
    });
  });

  it('calculates dashboard progress for only the six main games', () => {
    DYSCALCULIA_REWARD_GAMES.forEach(({ id, unitIds }) => {
      unitIds.forEach((unitId, index) => finish(id, 3, `all-${id}-${index}`, unitId));
    });

    expect(getAllGameStarProgress(undefined, MAIN_DYSCALCULIA_GAME_IDS)).toHaveLength(6);
    expect(getStarProgress(undefined, MAIN_DYSCALCULIA_GAME_IDS)).toEqual({
      earnedStars: 180,
      maximumStars: 180,
      progressPercentage: 100,
      completedGames: 6,
      totalGames: 6,
    });
  });

  it('migrates saved sorting sequence stars to the digits in each legacy sequence', () => {
    const progress = getGameStarProgress({
      bestStars: { 'number-sorting': { 'sequence-1-3': 2 } },
      completedUnitsByGame: { 'number-sorting': ['sequence-1-3'] },
    }, 'number-sorting');

    expect(progress).toMatchObject({
      earnedStars: 4,
      maximumStars: 30,
      completedUnits: 2,
      totalUnits: 10,
    });
  });

  it('groups Symbol Detective questions into five symbol and five calculation units', () => {
    expect(getRewardGame('symbol-detective').unitIds).toHaveLength(10);
    expect(getSymbolDetectiveUnitId({
      type: 'identify',
      trackingSymbol: '+',
    })).toBe('symbol-plus');
    expect(getSymbolDetectiveUnitId({
      type: 'calculation',
      difficulty: 'medium',
      display: '2 + 3 = ?',
    })).toBe('equation-medium');
    expect(getSymbolDetectiveUnitId({
      type: 'calculation',
      difficulty: 'hard',
      display: '2 + 3 = ?',
    })).toBe('equation-hard-plus');
  });

  it('migrates legacy Symbol Detective equation progress into capped scoring units', () => {
    const progress = getGameStarProgress({
      bestStars: {
        'symbol-detective': {
          'equation-plus-1-2': 2,
          'equation-plus-2-3': 3,
          'equation-minus-4-1': 1,
        },
      },
      completedUnitsByGame: {
        'symbol-detective': [
          'equation-plus-1-2',
          'equation-plus-2-3',
          'equation-minus-4-1',
        ],
      },
    }, 'symbol-detective');

    expect(progress).toMatchObject({
      earnedStars: 4,
      maximumStars: 30,
      completedUnits: 2,
      totalUnits: 10,
    });
  });

  it('counts each scoring unit once and updates per-game completion correctly', () => {
    const unitId = firstUnit('number-review');
    finish('number-review', 0, 'review-zero', unitId);
    finish('number-review', 3, 'review-replay', unitId);

    expect(getGameStarProgress(getDyscalculiaProgress(), 'number-review')).toMatchObject({
      earnedStars: 3,
      maximumStars: 30,
      progressPercentage: 10,
      completedUnits: 1,
      totalUnits: 10,
    });
    expect(getStarProgress().completedGames).toBe(0);
  });

  it('does not duplicate rewards or celebration events on repeated submissions', () => {
    const awardListener = vi.fn();
    window.addEventListener('dyscalculia:stars-awarded', awardListener);
    const results = Array.from({ length: 8 }, (_, index) => finish('number-matching', 3, `same-unit-${index}`));

    expect(results.reduce((total, result) => total + result.rewardResult.starsAwarded, 0)).toBe(3);
    expect(getDyscalculiaProgress().rewards.stars).toBe(3);
    expect(awardListener).toHaveBeenCalledOnce();
    expect(awardListener.mock.calls[0][0].detail.amount).toBe(3);
    window.removeEventListener('dyscalculia:stars-awarded', awardListener);
  });

  it('deduplicates repeated scoring units within one submitted session', () => {
    const unitId = firstUnit('number-matching');
    const { rewardResult } = saveGameSession({
      gameId: 'number-matching',
      gameType: 'NumberMatchingGame',
      unitResults: [
        { unitId, starsEarned: 2, completed: true },
        { unitId, starsEarned: 3, completed: true },
        { unitId, starsEarned: 1, completed: true },
      ],
      completed: true,
    });

    expect(rewardResult).toMatchObject({ attemptStars: 3, bestStars: 3, starsAwarded: 3 });
    expect(rewardResult.unitResults).toHaveLength(1);
    expect(getDyscalculiaProgress().rewards.stars).toBe(3);
  });

  it('does not award legacy round stars without valid scoring-unit results', () => {
    const { rewardResult } = saveGameSession({
      gameId: 'number-listening',
      gameType: 'NumberListeningGame',
      starsEarned: 3,
      unitResults: [],
      completed: true,
    });

    expect(rewardResult).toMatchObject({ attemptStars: 0, bestStars: 0, starsAwarded: 0 });
    expect(getDyscalculiaProgress()).toMatchObject({
      rewards: { stars: 0 },
      sessions: [expect.objectContaining({ starsEarned: 3, unitResults: [] })],
    });
  });

  it('merges concurrent cloud writes by max score per unit without duplicating totals', () => {
    const unitId = firstUnit('number-sorting');
    const lower = finish('number-sorting', 1, 'lower', unitId).progress;
    const higher = finish('number-sorting', 3, 'higher', unitId).progress;
    const merged = mergeDyscalculiaProgress(lower, higher);
    const reverseMerged = mergeDyscalculiaProgress(higher, lower);

    expect(merged.bestStars['number-sorting'][unitId]).toBe(3);
    expect(reverseMerged.bestStars['number-sorting'][unitId]).toBe(3);
    expect(merged.rewards.stars).toBe(3);
    expect(merged.completedGameIds).not.toContain('number-sorting');
    expect(merged.sessions.map(({ sessionId }) => sessionId)).toEqual(expect.arrayContaining(['lower', 'higher']));
  });

  it('preserves legacy game-level scores without inventing per-unit results', () => {
    localStorage.setItem('smartlearn_dyscalculia_progress', JSON.stringify({
      bestStars: { 'number-listening': 3 },
    }));

    const progress = getDyscalculiaProgress();

    expect(progress.legacyBestStars['number-listening']).toBe(3);
    expect(progress.bestStars['number-listening']).toBeUndefined();
    expect(progress.rewards.stars).toBe(0);
  });

  it('migrates a legacy tracing session to its exact digit unit', () => {
    const tracing = saveGameSession({
      gameType: 'TracingNumbers',
      targetNumber: 4,
      correct: true,
      starsEarned: 3,
      completed: true,
    });

    expect(tracing.rewardResult).toMatchObject({ bestStars: 3, starsAwarded: 3 });
    expect(tracing.progress.bestStars['number-tracing']['digit-4']).toBe(3);
  });

  it('resets one main game progress and preserves every other game', () => {
    saveGameSession({
      gameId: 'number-matching',
      gameType: 'NumberMatchingGame',
      attempts: 2,
      correctCount: 1,
      wrongCount: 1,
      targetNumber: 4,
      numberResults: [{ targetNumber: 4, attempts: 2, correct: true }],
      unitResults: [{ unitId: 'digit-4', starsEarned: 2, completed: true }],
      completed: true,
      sessionId: 'matching-to-reset',
    });
    finish('number-listening', 3, 'listening-to-preserve');
    recordLevelResult('NumberMatchingGame', 'easy', { correctAnswers: 8, totalQuestions: 10, score: 80 });
    recordLevelResult('NumberListeningGame', 'easy', { correctAnswers: 8, totalQuestions: 10, score: 80 });

    const reset = resetDyscalculiaGameProgress('number-matching');
    const levels = getGameLevels('NumberMatchingGame');

    expect(reset.bestStars['number-matching']).toBeUndefined();
    expect(reset.completedUnitsByGame['number-matching']).toBeUndefined();
    expect(reset.sessions.map(({ sessionId }) => sessionId)).toEqual(['listening-to-preserve']);
    expect(reset.gameStats.NumberMatchingGame).toEqual({
      attempts: 0,
      correct: 0,
      wrong: 0,
      lastPlayed: null,
    });
    expect(reset.numberStats['4']).toEqual({ attempts: 0, correct: 0 });
    expect(reset.rewards.stars).toBe(3);
    expect(levels.easy.completed).toBe(false);
    expect(levels.medium.unlocked).toBe(false);
    expect(getGameLevels('NumberListeningGame').easy.completed).toBe(true);
  });

  it('keeps reset game tombstones when merging stale cloud progress', () => {
    finish('number-matching', 3, 'cloud-matching-before-reset');
    const staleCloudProgress = getDyscalculiaProgress();
    const resetProgress = resetDyscalculiaGameProgress('number-matching');
    const merged = mergeDyscalculiaProgress(staleCloudProgress, resetProgress);
    const staleWriteAfterReset = mergeDyscalculiaProgress(resetProgress, staleCloudProgress);

    expect(getGameStarProgress(merged, 'number-matching')).toMatchObject({
      earnedStars: 0,
      maximumStars: 30,
      completedUnits: 0,
    });
    expect(merged.sessions).toHaveLength(0);
    expect(merged.gameResetAt['number-matching']).toBeDefined();
    expect(staleWriteAfterReset.gameStats.NumberMatchingGame.attempts).toBe(0);
    expect(staleWriteAfterReset.sessions).toHaveLength(0);
  });
});
