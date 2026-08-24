const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const getAdaptiveTier = (score = 50) => {
  if (score <= 35) return 'support';
  if (score >= 65) return 'challenge';
  return 'balanced';
};

export const createAdaptiveProfile = (profile = {}) => {
  const normalizedScore = clamp(Number(profile.score ?? 50), 0, 100);
  const recentResults = Array.isArray(profile.recentResults) ? profile.recentResults.slice(-6) : [];
  const streak = Number.isFinite(profile.streak) ? profile.streak : 0;

  return {
    score: normalizedScore,
    tier: getAdaptiveTier(normalizedScore),
    streak,
    lastAccuracy: profile.lastAccuracy ?? null,
    updatedAt: profile.updatedAt ?? null,
    recentResults,
    lastMetrics: profile.lastMetrics ?? null,
  };
};

const resolveAccuracy = (metrics = {}) => {
  const direct = metrics.accuracy ?? metrics.pct ?? metrics.percent;
  if (Number.isFinite(direct)) return clamp(Math.round(direct), 0, 100);

  const correct = metrics.correct ?? metrics.score;
  const total = metrics.total ?? metrics.totalQuestions ?? metrics.answered ?? metrics.totalPairs;
  if (Number.isFinite(correct) && Number.isFinite(total) && total > 0) {
    return clamp(Math.round((correct / total) * 100), 0, 100);
  }

  return 0;
};

const resolveMistakes = (metrics = {}) => (
  metrics.mistakes
  ?? metrics.wrongAttempts
  ?? metrics.totalWrong
  ?? metrics.wrong
  ?? null
);

const resolveAttempts = (metrics = {}) => (
  metrics.totalAttempts
  ?? metrics.total
  ?? metrics.totalQuestions
  ?? metrics.answered
  ?? metrics.moves
  ?? null
);

const resolveAverageResponseMs = (metrics = {}) => (
  metrics.avgResponseMs
  ?? metrics.averageResponseMs
  ?? metrics.responseMs
  ?? null
);

export const updateAdaptiveProfile = (profile, metrics = {}) => {
  const current = createAdaptiveProfile(profile);
  const accuracy = resolveAccuracy(metrics);
  const mistakes = resolveMistakes(metrics);
  const attempts = resolveAttempts(metrics);
  const averageResponseMs = resolveAverageResponseMs(metrics);
  const targetResponseMs = metrics.targetResponseMs ?? null;

  let delta = 0;
  if (accuracy >= 92) delta += 12;
  else if (accuracy >= 80) delta += 7;
  else if (accuracy >= 65) delta += 2;
  else if (accuracy <= 40) delta -= 12;
  else if (accuracy <= 55) delta -= 7;

  if (Number.isFinite(mistakes) && Number.isFinite(attempts) && attempts > 0) {
    const mistakeRate = mistakes / attempts;
    if (mistakeRate >= 0.45) delta -= 4;
    else if (mistakeRate <= 0.15) delta += 3;
  }

  if (Number.isFinite(averageResponseMs) && Number.isFinite(targetResponseMs) && targetResponseMs > 0) {
    const pace = averageResponseMs / targetResponseMs;
    if (pace <= 0.75) delta += 3;
    else if (pace >= 1.35) delta -= 3;
  }

  let streak = current.streak;
  if (accuracy >= 80) streak += 1;
  else if (accuracy <= 55) streak -= 1;
  else if (streak > 0) streak -= 1;
  else if (streak < 0) streak += 1;

  streak = clamp(streak, -3, 3);
  if (streak >= 2) delta += 2;
  else if (streak <= -2) delta -= 2;

  const score = clamp(current.score + delta, 0, 100);
  const tier = getAdaptiveTier(score);
  const result = {
    accuracy,
    mistakes,
    attempts,
    averageResponseMs,
    timestamp: new Date().toISOString(),
  };

  return {
    ...current,
    score,
    tier,
    streak,
    lastAccuracy: accuracy,
    updatedAt: result.timestamp,
    recentResults: [...current.recentResults, result].slice(-6),
    lastMetrics: {
      ...metrics,
      accuracy,
      mistakes,
      attempts,
      averageResponseMs,
    },
  };
};

export const getAdaptiveScale = (profile) => {
  const tier = createAdaptiveProfile(profile).tier;
  if (tier === 'support') return -1;
  if (tier === 'challenge') return 1;
  return 0;
};

export const getAdaptivePresentation = (profile) => {
  const current = createAdaptiveProfile(profile);

  if (current.tier === 'support') {
    return {
      tier: current.tier,
      label: 'සුලු උදව් මට්ටම',
      shortLabel: 'උදව්',
      color: '#0EA5E9',
      surface: '#E0F2FE',
      message: 'වැඩි කාලය, අඩු තේරීම්, සහ ඉඟි දීලා දරුවාට ආපසු රිද්මය හදාගන්න දෙයි.',
    };
  }

  if (current.tier === 'challenge') {
    return {
      tier: current.tier,
      label: 'අභියෝග මට්ටම',
      shortLabel: 'අභියෝග',
      color: '#7C3AED',
      surface: '#EDE9FE',
      message: 'දක්ෂතාවය හොඳ නිසා වැඩි අයිතම, ඉක්මන් වේලාව, සහ ටිකක් අමාරු තේරීම් දීලා පුහුණුව දිගටම ගෙන යයි.',
    };
  }

  return {
    tier: current.tier,
    label: 'සමතුලිත මට්ටම',
    shortLabel: 'සමතුලිත',
    color: '#059669',
    surface: '#D1FAE5',
    message: 'දරුවාගේ වර්තමාන දක්ෂතාවයට ගැළපෙන සාමාන්‍ය මට්ටමක් පවත්වාගෙන යයි.',
  };
};

export const adaptSequenceRecallConfig = (baseConfig, profile) => {
  const scale = getAdaptiveScale(profile);
  const seqLen = clamp(baseConfig.seqLen + (scale > 0 ? 1 : baseConfig.seqLen > 2 ? scale : 0), 2, baseConfig.items.length);
  const rounds = clamp(baseConfig.rounds + scale, 3, 7);
  const passScore = clamp(baseConfig.passScore + scale, 2, rounds);
  const hint = scale < 0
    ? 'පින්තූරය සහ නම දෙකම හොඳට බලන්න. ටිකක් වැඩි වෙලාවක් දෙනවා.'
    : scale > 0
      ? 'දැන් ඉක්මනට බලලා අනුපිළිවෙල මතක තබාගන්න.'
      : baseConfig.hint;

  return {
    ...baseConfig,
    seqLen,
    rounds,
    passScore,
    speedMs: clamp(baseConfig.speedMs + (scale < 0 ? 800 : scale > 0 ? -450 : 0), 1200, 5000),
    hint,
    adaptiveHint: hint,
    hintMode: scale < 0,
    tier: createAdaptiveProfile(profile).tier,
  };
};

export const adaptColorMemoryConfig = (baseConfig, profile) => {
  const scale = getAdaptiveScale(profile);
  const rounds = clamp(baseConfig.rounds + scale, 3, 7);
  const choices = clamp(baseConfig.choices + scale, 2, 6);
  const instruction = scale < 0
    ? 'තේරීම් අඩු කරලා වැඩි කාලයක් දෙනවා. මුලින්ම වර්ණය හෝ අකුර මනසින් කියන්න.'
    : scale > 0
      ? 'දැන් ටිකක් ඉක්මනට මතක තබාගෙන තේරීම් අතරින් හොයන්න.'
      : baseConfig.instruction;

  return {
    ...baseConfig,
    rounds,
    choices,
    passScore: clamp(baseConfig.passScore + scale, 2, rounds),
    memorizeMs: clamp(baseConfig.memorizeMs + (scale < 0 ? 900 : scale > 0 ? -450 : 0), 1200, 4500),
    instruction,
    adaptiveHint: instruction,
    hintMode: scale < 0,
    tier: createAdaptiveProfile(profile).tier,
  };
};

export const adaptNBackConfig = (baseConfig, profile) => {
  const scale = getAdaptiveScale(profile);
  const shapeLimit = clamp(baseConfig.shapePool.length + (scale < 0 ? -1 : scale > 0 ? 1 : 0), 2, baseConfig.shapePool.length);
  const colorLimit = clamp(baseConfig.colorPool.length + (scale < 0 ? -1 : scale > 0 ? 0 : 0), 3, baseConfig.colorPool.length);
  const instruction = scale < 0
    ? 'දැනට වැඩි කාලයක් දෙනවා. කලින් හැඩය මනසින් නම කියලා තියාගන්න.'
    : scale > 0
      ? 'දැන් පිළිතුරු වේගය සහ මතක ශක්තිය දෙකම පරීක්ෂා කරනවා.'
      : baseConfig.instruction;

  return {
    ...baseConfig,
    totalTrials: clamp(baseConfig.totalTrials + scale, baseConfig.n + 4, baseConfig.totalTrials + 2),
    showMs: clamp(baseConfig.showMs + (scale < 0 ? 900 : scale > 0 ? -400 : 0), 1400, 5000),
    responseMs: clamp(baseConfig.responseMs + (scale < 0 ? 1200 : scale > 0 ? -600 : 0), 2000, 7000),
    matchRate: clamp(baseConfig.matchRate + (scale < 0 ? 0.1 : scale > 0 ? -0.05 : 0), 0.25, 0.65),
    shapePool: baseConfig.shapePool.slice(0, shapeLimit),
    colorPool: baseConfig.colorPool.slice(0, colorLimit),
    instruction,
    adaptiveHint: instruction,
    tier: createAdaptiveProfile(profile).tier,
  };
};

export const adaptImageMatcherConfig = (baseConfig, profile) => {
  const scale = getAdaptiveScale(profile);

  return {
    ...baseConfig,
    pairs: clamp(baseConfig.pairs + scale, 3, 7),
    cardSize: clamp(164 + (scale < 0 ? 28 : scale > 0 ? -18 : 0), 132, 208),
    startMessage: scale < 0
      ? 'රූප ටිකක් ලොකුයි. එකම හැඩය, වර්ණය, සහ සතුන්ගේ පිහිටීම හොඳට බලන්න.'
      : scale > 0
        ? 'දැන් තව ජෝඩු කිහිපයක් සහ කුඩා කාඩ් එක්ක වේගයෙන් ගැලපීම හොයන්න.'
        : 'වම් පසින් පින්තූරයක් තෝරලා, දකුණු පසින් එකම පින්තූරය හොයන්න.',
    adaptiveHint: scale < 0
      ? 'රූප ටිකක් ලොකුයි. එකම හැඩය, වර්ණය, සහ සතුන්ගේ පිහිටීම හොඳට බලන්න.'
      : scale > 0
        ? 'දැන් තව ජෝඩු කිහිපයක් සහ කුඩා කාඩ් එක්ක වේගයෙන් ගැලපීම හොයන්න.'
        : 'වම් පසින් පින්තූරයක් තෝරලා, දකුණු පසින් එකම පින්තූරය හොයන්න.',
    hintAfterMistakes: 4,
    tier: createAdaptiveProfile(profile).tier,
  };
};

export const adaptOddOneOutConfig = (profile) => {
  const scale = getAdaptiveScale(profile);

  return {
    visibleChoices: scale < 0 ? 3 : 4,
    imageSize: scale < 0 ? 142 : scale > 0 ? 118 : 130,
    oddScale: scale < 0 ? 1.12 : scale > 0 ? 1 : 1.04,
    hintAfterMistakes: 4,
    titleHint: scale < 0
      ? 'තේරීම් ටිකක් අඩු කරලා ඉඟියක් දෙනවා.'
      : scale > 0
        ? 'දැන් වෙනස බලාගන්න වෙලාව අඩුයි. හොඳට නිරීක්ෂණය කරන්න.'
        : 'එකම පින්තූර අතරින් වෙනස් එක තෝරන්න',
    tier: createAdaptiveProfile(profile).tier,
  };
};

export const adaptVideoStoryQuestionSet = (questions, profile) => {
  const scale = getAdaptiveScale(profile);

  return questions.map((question) => {
    if (scale >= 0) {
      return {
        ...question,
        displayOptions: question.options,
        displayCorrectIndex: question.correct,
      };
    }

    const distractors = question.options
      .map((option, index) => ({ option, index }))
      .filter(({ index }) => index !== question.correct)
      .slice(0, 2);

    const selected = [
      { option: question.options[question.correct], index: question.correct },
      ...distractors,
    ].sort((left, right) => left.index - right.index);

    return {
      ...question,
      displayOptions: selected.map(({ option }) => option),
      displayCorrectIndex: selected.findIndex(({ index }) => index === question.correct),
    };
  });
};

export const adaptVideoStoryConfig = (profile) => {
  const scale = getAdaptiveScale(profile);

  return {
    retryPopupThreshold: 4,
    helperText: scale < 0
      ? 'උදව් මට්ටමේ නිසා තේරීම් ටිකක් අඩු කරලා වීඩියෝව මතක් කරගන්න කියලා මතක් කරනවා.'
      : scale > 0
        ? 'අභියෝග මට්ටමේ නිසා මුල් ප්‍රශ්න හැම තේරීමක්ම මතකෙන් විසඳන්න.'
        : 'වීඩියෝව හොඳට බලලා ප්‍රශ්න වලට උත්තර දෙන්න.',
    tier: createAdaptiveProfile(profile).tier,
  };
};

// Shape Recall uses three short memory tasks inside each level. Keep the
// baseline task design, then adjust it from the learner's persisted profile.
export const adaptShapeRecallConfig = (baseConfig, profile, level = 1) => {
  const scale = getAdaptiveScale(profile);
  const levelBoost = Number(level) >= 2 ? 1 : 0;
  const cardCount = clamp(baseConfig.cardCount + levelBoost + scale, 3, 6);
  const revealTime = clamp(
    baseConfig.revealTime
      + (levelBoost * 450)
      + (scale < 0 ? 1400 : scale > 0 ? -850 : 0),
    6500,
    14000,
  );

  return {
    ...baseConfig,
    cardCount,
    revealTime,
    maxAttempts: Number(level) === 1 ? 3 : (scale < 0 ? 4 : 3),
    targetResponseMs: clamp(
      18000 + (cardCount * 3500) + (scale < 0 ? 7000 : scale > 0 ? -3500 : 0),
      18000,
      50000,
    ),
    adaptiveHint: scale < 0
      ? 'කලබල වෙන්න එපා. කාඩ්පතේ තැන සහ හැඩය හොඳින් බලන්න.'
      : scale > 0
        ? 'හැඩය සහ එය තිබුණු තැන හොඳින් මතක තබාගන්න.'
        : 'හැඩයත් එය තිබුණු කාඩ්පතත් දෙකම මතක තබාගන්න.',
    hintMode: scale < 0,
    tier: createAdaptiveProfile(profile).tier,
  };
};
