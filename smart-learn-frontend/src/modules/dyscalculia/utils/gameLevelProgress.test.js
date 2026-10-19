import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getGameLevels, recordLevelResult } from './gameLevelProgress';

const LEVELS_KEY = 'smartlearn_dyscalculia_levels';
const NUMBER_MATCHING_RESET_KEY = 'smartlearn:number-matching:levels-reset-v1';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('Number Matching level progression', () => {
  it('resets saved Number Matching unlocks once while preserving other game levels', () => {
    localStorage.setItem(LEVELS_KEY, JSON.stringify({
      NumberMatchingGame: {
        easy: { unlocked: true, completed: true, bestScore: 100 },
        medium: { unlocked: true, completed: true, bestScore: 100 },
        hard: { unlocked: true, completed: true, bestScore: 100 },
      },
      NumberListeningGame: {
        easy: { unlocked: true, completed: true, bestScore: 80 },
        medium: { unlocked: true, completed: false, bestScore: 0 },
      },
    }));

    expect(getGameLevels('NumberMatchingGame')).toEqual({
      easy: { unlocked: true, completed: false, bestScore: 0 },
      medium: { unlocked: false, completed: false, bestScore: 0 },
      hard: { unlocked: false, completed: false, bestScore: 0 },
    });
    expect(getGameLevels('NumberListeningGame').medium.unlocked).toBe(true);
    expect(localStorage.getItem(NUMBER_MATCHING_RESET_KEY)).toBe('true');
  });

  it('unlocks each next level only when the previous unlocked level is passed', () => {
    getGameLevels('NumberMatchingGame');
    const blockedMedium = recordLevelResult('NumberMatchingGame', 'medium', {
      correctAnswers: 10,
      totalQuestions: 10,
      score: 100,
    });
    expect(blockedMedium.passed).toBe(false);
    expect(blockedMedium.levels.medium.unlocked).toBe(false);

    const failedEasy = recordLevelResult('NumberMatchingGame', 'easy', {
      correctAnswers: 6,
      totalQuestions: 10,
      score: 60,
    });
    expect(failedEasy.passed).toBe(false);
    expect(failedEasy.levels.medium.unlocked).toBe(false);

    const passedEasy = recordLevelResult('NumberMatchingGame', 'easy', {
      correctAnswers: 7,
      totalQuestions: 10,
      score: 70,
    });
    expect(passedEasy.passed).toBe(true);
    expect(passedEasy.levels.medium.unlocked).toBe(true);
    expect(passedEasy.levels.hard.unlocked).toBe(false);

    const passedMedium = recordLevelResult('NumberMatchingGame', 'medium', {
      correctAnswers: 7,
      totalQuestions: 10,
      score: 70,
    });
    expect(passedMedium.passed).toBe(true);
    expect(passedMedium.levels.hard.unlocked).toBe(true);
  });
});
