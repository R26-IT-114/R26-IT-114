import { beforeEach, describe, expect, it } from 'vitest';
import { getGameLevels } from './gameLevelProgress';
import { getDyscalculiaProgress, getTracingAccuracyProgress, saveGameSession } from './dyscalculiaProgress';
import {
  NUMBER_TRACING_LEVEL_ROUTE,
  accuracyStarsFromConfidence,
  normalizeConfidencePercent,
  recordNumberTracingPrediction,
} from './numberTracingProgress';

describe('number tracing accuracy', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    [0, 0, 1],
    [0.2, 20, 1],
    [0.21, 21, 2],
    [0.4, 40, 2],
    [0.6, 60, 3],
    [0.8, 80, 4],
    [0.86, 86, 5],
    [100, 100, 5],
  ])('converts confidence %s to %s%% and %s stars', (confidence, percent, stars) => {
    expect(normalizeConfidencePercent(confidence)).toBe(percent);
    expect(accuracyStarsFromConfidence(confidence)).toBe(stars);
  });

  it('does not invent an accuracy when confidence is missing', () => {
    expect(normalizeConfidencePercent(undefined)).toBeNull();
    expect(accuracyStarsFromConfidence(undefined)).toBeNull();
  });

  it('completes Easy and unlocks Medium after two different Easy digits are correct', () => {
    const first = recordNumberTracingPrediction({ level: 'easy', targetNumber: 0, predictedNumber: 0, confidence: 0.8, correct: true });
    expect(first.levelComplete).toBe(false);

    const completion = recordNumberTracingPrediction({ level: 'easy', targetNumber: 1, predictedNumber: 1, confidence: 0.9, correct: true });
    expect(completion.levelComplete).toBe(true);
    expect(getGameLevels('NumberTracingGame').medium.unlocked).toBe(true);
  });

  it('does not count completing the same number twice toward the two-number rule', () => {
    recordNumberTracingPrediction({ level: 'easy', targetNumber: 0, predictedNumber: 0, confidence: 0.8, correct: true });
    const repeated = recordNumberTracingPrediction({ level: 'easy', targetNumber: 0, predictedNumber: 0, confidence: 0.9, correct: true });
    expect(repeated.levelComplete).toBe(false);
    expect(getGameLevels('NumberTracingGame').medium.unlocked).toBe(false);
  });

  it('does not complete a level for an incorrect prediction', () => {
    const result = recordNumberTracingPrediction({ level: 'medium', targetNumber: 9, predictedNumber: 4, confidence: 0.55, correct: false });
    expect(result.levelComplete).toBe(false);
    expect(result.completedDigits).toEqual([]);
  });

  it('unlocks Hard after two Medium numbers are completed', () => {
    [9, 3].forEach((digit) => recordNumberTracingPrediction({ level: 'medium', targetNumber: digit, predictedNumber: digit, confidence: 0.75, correct: true }));
    expect(getGameLevels('NumberTracingGame').hard.unlocked).toBe(true);
  });

  it('uses the existing level selection route for Next', () => {
    expect(NUMBER_TRACING_LEVEL_ROUTE).toBe('/dyscalculia/number-tracing');
  });

  it('makes stored tracing accuracy available to the progress dashboard', () => {
    saveGameSession({ gameType: 'TracingNumbers', targetNumber: 3, predictedNumber: 3, accuracyPercent: 86, tracingAccuracyStars: 5, confidence: 0.86, attempts: 1, correct: true, completed: true });
    const stats = getTracingAccuracyProgress(getDyscalculiaProgress());
    expect(stats.averageAccuracy).toBe(86);
    expect(stats.latest.tracingAccuracyStars).toBe(5);
  });
});
