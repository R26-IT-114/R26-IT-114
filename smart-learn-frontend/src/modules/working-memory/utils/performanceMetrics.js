export const safeMetricNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const withoutVolatileTimestamps = (value) => {
  if (Array.isArray(value)) return value.map(withoutVolatileTimestamps);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !['timestamp', 'createdAt', 'updatedAt'].includes(key))
      .map(([key, entry]) => [key, withoutVolatileTimestamps(entry)]),
  );
};

export const dedupePerformanceResults = (results, windowMs = 15000) =>
  (Array.isArray(results) ? results : []).reduce((deduped, result) => {
    if (!result || typeof result !== 'object') return deduped;

    const previous = deduped.at(-1);
    const currentMetrics = result.metrics || result;
    const previousMetrics = previous?.metrics || previous;
    const currentTime = new Date(result.timestamp ?? currentMetrics.timestamp ?? 0).getTime();
    const previousTime = new Date(previous?.timestamp ?? previousMetrics?.timestamp ?? 0).getTime();
    const samePayload = previous && JSON.stringify(withoutVolatileTimestamps(currentMetrics))
      === JSON.stringify(withoutVolatileTimestamps(previousMetrics));
    const closeTogether = Number.isFinite(currentTime)
      && Number.isFinite(previousTime)
      && Math.abs(currentTime - previousTime) <= windowMs;

    if (!samePayload || !closeTogether) deduped.push(result);
    return deduped;
  }, []);

export const aggregatePerformanceSummary = (gameRows) => {
  const rows = Array.isArray(gameRows) ? gameRows : [];
  const sessions = rows.flatMap((row) => row.sessionHistory || []);
  const sessionsWithAccuracy = sessions.filter(
    (session) => safeMetricNumber(session.accuracy) !== null,
  );

  const accuracyTotals = sessionsWithAccuracy.reduce((totals, session) => {
    const weight = Math.max(1, safeMetricNumber(session.totalQuestions) ?? 1);
    totals.weighted += (safeMetricNumber(session.accuracy) ?? 0) * weight;
    totals.weight += weight;
    return totals;
  }, { weighted: 0, weight: 0 });

  const responseTotals = sessions.reduce((totals, session) => {
    const responseMs = safeMetricNumber(session.averageResponseMs);
    if (responseMs === null || responseMs <= 0) return totals;
    const weight = Math.max(1, safeMetricNumber(session.totalQuestions) ?? 1);
    totals.weighted += responseMs * weight;
    totals.weight += weight;
    return totals;
  }, { weighted: 0, weight: 0 });

  // The in-game basket counts stars only once for each game/level scope.
  // Reconstruct that same total from durable session results so the dashboard
  // is no longer tied to one device's localStorage.
  const firstSessionByScope = new Map();
  rows.forEach((row) => {
    [...(row.sessionHistory || [])].reverse().forEach((session) => {
      const level = safeMetricNumber(session.level) ?? 1;
      const scope = `${row.gameId}:${level}`;
      if (!firstSessionByScope.has(scope)) firstSessionByScope.set(scope, session);
    });
  });
  const totalStars = [...firstSessionByScope.values()].reduce(
    (sum, session) => sum + Math.max(0, safeMetricNumber(session.earnedStars) ?? 0),
    0,
  );

  return {
    totalStars,
    totalSessions: sessions.length,
    totalCompletedLevels: rows.reduce(
      (sum, row) => sum + (safeMetricNumber(row.completedLevels) ?? 0),
      0,
    ),
    overallAccuracy: accuracyTotals.weight > 0
      ? accuracyTotals.weighted / accuracyTotals.weight
      : null,
    overallAverageResponseMs: responseTotals.weight > 0
      ? responseTotals.weighted / responseTotals.weight
      : null,
  };
};
