const SKILLS = [
  'number-recognition',
  'counting',
  'magnitude-comparison',
  'simple-arithmetic',
];

export const evaluateAssessment = (attempts) => {
  const totalQuestions = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const accuracy = totalQuestions ? totalCorrect / totalQuestions : 0;
  const averageResponseTimeMs = totalQuestions
    ? attempts.reduce((sum, cur) => sum + cur.responseTimeMs, 0) / totalQuestions
    : 0;

  const skillBreakdown = SKILLS.map((skillType) => {
    const group = attempts.filter((a) => a.skillType === skillType);
    const groupCorrect = group.filter((g) => g.isCorrect).length;
    const groupAccuracy = group.length ? groupCorrect / group.length : 0;
    const groupAvgTime = group.length
      ? group.reduce((sum, cur) => sum + cur.responseTimeMs, 0) / group.length
      : 0;

    return {
      skillType,
      total: group.length,
      correct: groupCorrect,
      accuracy: groupAccuracy,
      averageResponseTimeMs: groupAvgTime,
    };
  });

  const weakAreas = skillBreakdown
    .filter((item) => item.total > 0 && item.accuracy < 0.6)
    .map((item) => item.skillType);

  let severityLevel = 'Mild';
  if (accuracy < 0.55 || weakAreas.length >= 3) {
    severityLevel = 'Severe';
  } else if (accuracy < 0.8 || weakAreas.length >= 2) {
    severityLevel = 'Moderate';
  }

  return {
    attempts,
    totalQuestions,
    totalCorrect,
    accuracy,
    averageResponseTimeMs,
    weakAreas,
    severityLevel,
    skillBreakdown,
  };
};
