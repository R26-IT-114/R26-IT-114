import { describe, expect, it } from 'vitest';
import {
  aggregatePerformanceSummary,
  dedupePerformanceResults,
} from './performanceMetrics';

describe('dedupePerformanceResults', () => {
  it('deduplicates identical neighbouring results even when timestamps differ', () => {
    const results = [
      { timestamp: '2026-08-29T10:00:00.000Z', metrics: { level: 1, accuracy: 80, timestamp: '2026-08-29T10:00:00.000Z' } },
      { timestamp: '2026-08-29T10:00:05.000Z', metrics: { level: 1, accuracy: 80, timestamp: '2026-08-29T10:00:05.000Z' } },
    ];

    expect(dedupePerformanceResults(results)).toHaveLength(1);
  });

  it('keeps genuine replays outside the duplicate window', () => {
    const results = [
      { timestamp: '2026-08-29T10:00:00.000Z', metrics: { level: 1, accuracy: 80 } },
      { timestamp: '2026-08-29T10:01:00.000Z', metrics: { level: 1, accuracy: 80 } },
    ];

    expect(dedupePerformanceResults(results)).toHaveLength(2);
  });
});

describe('aggregatePerformanceSummary', () => {
  it('aggregates every saved session with question weighting', () => {
    const summary = aggregatePerformanceSummary([
      {
        gameId: 'game-a',
        completedLevels: 2,
        sessionHistory: [
          { level: 1, accuracy: 50, totalQuestions: 5, averageResponseMs: 4000, earnedStars: 2 },
          { level: 1, accuracy: 100, totalQuestions: 5, averageResponseMs: 2000, earnedStars: 5 },
        ],
      },
      {
        gameId: 'game-b',
        completedLevels: 1,
        sessionHistory: [
          { level: 1, accuracy: 75, totalQuestions: 10, averageResponseMs: 1000, earnedStars: 7 },
        ],
      },
    ]);

    expect(summary.totalSessions).toBe(3);
    expect(summary.totalCompletedLevels).toBe(3);
    expect(summary.overallAccuracy).toBe(75);
    expect(summary.overallAverageResponseMs).toBe(2000);
    // Stars follow the first recorded run per game/level scope.
    expect(summary.totalStars).toBe(12);
  });
});
