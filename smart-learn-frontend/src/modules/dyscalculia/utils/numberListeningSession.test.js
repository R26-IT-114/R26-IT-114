import { beforeEach, describe, expect, it } from 'vitest';
import { getDyscalculiaProgress, saveGameSession } from './dyscalculiaProgress';
import { getGameLevels, recordLevelResult } from './gameLevelProgress';
import {
  LISTENING_LEVEL_CONFIG,
  LISTENING_QUESTIONS_PER_LEVEL,
  buildListeningOptions,
  listeningAccuracy,
  listeningRewardStars,
} from './numberListeningSession';

describe('Number Listening session rules', () => {
  beforeEach(() => localStorage.clear());
  it.each([
    ['easy', '2', 3],
    ['medium', '5', 5],
    ['hard', '9', 8],
  ])('%s returns exactly %i unique choices including the answer', (level, target, count) => {
    const options = buildListeningOptions(target, level);
    expect(options).toHaveLength(count);
    expect(new Set(options).size).toBe(count);
    expect(options).toContain(target);
    expect(options.every((digit) => Number(digit) <= LISTENING_LEVEL_CONFIG[level].max)).toBe(true);
  });

  it('uses exactly 8 questions for every level', () => {
    expect(LISTENING_QUESTIONS_PER_LEVEL).toBe(8);
  });

  it.each([
    [0, 0],
    [6, 75],
    [7, 88],
    [8, 100],
  ])('calculates %i first-attempt correct as %i%%', (correct, accuracy) => {
    expect(listeningAccuracy(correct)).toBe(accuracy);
  });

  it('uses child-friendly reward stars without changing accuracy', () => {
    expect(listeningRewardStars(60)).toBe(1);
    expect(listeningRewardStars(75)).toBe(2);
    expect(listeningRewardStars(88)).toBe(3);
  });

  it('randomizes answer positions', () => {
    const lowRandom = buildListeningOptions('2', 'hard', () => 0.05);
    const highRandom = buildListeningOptions('2', 'hard', () => 0.95);
    expect(lowRandom).not.toEqual(highRandom);
  });

  it('requires 6 of 8 to unlock the next level and persists all unlocks', () => {
    const failed = recordLevelResult('NumberListeningGame', 'easy', { correctAnswers: 5, totalQuestions: 8, score: 50 });
    expect(failed.passed).toBe(false);
    expect(failed.levels.medium.unlocked).toBe(false);

    recordLevelResult('NumberListeningGame', 'easy', { correctAnswers: 6, totalQuestions: 8, score: 60 });
    recordLevelResult('NumberListeningGame', 'medium', { correctAnswers: 7, totalQuestions: 8, score: 70 });
    recordLevelResult('NumberListeningGame', 'hard', { correctAnswers: 8, totalQuestions: 8, score: 80 });

    const refreshed = getGameLevels('NumberListeningGame');
    expect(Object.values(refreshed).every((level) => level.unlocked && level.completed)).toBe(true);
  });

  it('preserves best score when replay performance is worse', () => {
    recordLevelResult('NumberListeningGame', 'easy', { correctAnswers: 8, totalQuestions: 8, score: 80 });
    recordLevelResult('NumberListeningGame', 'easy', { correctAnswers: 6, totalQuestions: 8, score: 60 });
    expect(getGameLevels('NumberListeningGame').easy.bestScore).toBe(80);
  });

  it('stores completed level metrics for dashboard history', () => {
    saveGameSession({ gameType: 'NumberListeningGame', level: 'easy', correct: true, correctCount: 7, wrongCount: 2, attempts: 10, totalQuestions: 8, accuracy: 88, timeSpent: 42000, score: 70, starsEarned: 3, completed: true });
    const session = getDyscalculiaProgress().sessions.at(-1);
    expect(session).toMatchObject({ level: 'easy', accuracy: 88, attempts: 10, timeSpent: 42000, starsEarned: 3 });
  });
});
