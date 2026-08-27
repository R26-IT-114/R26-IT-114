const LETTER_ONLY_REGEX = /[^\p{L}\p{N}]+/gu;
const SPACE_AND_PUNCT_REGEX = /[\s\u200B-\u200D\uFEFF.,!?;:'"“”‘’()\[\]{}\/\\|\-—–_*+=<>@#$%^&~`]+/g;

const LETTER_NAME_ALIASES = {
  ක: ['ka', 'kaa', 'k'],
  ග: ['ga', 'gaa', 'g'],
  ප: ['pa', 'paa', 'p'],
  ම: ['ma', 'maa', 'm'],
  න: ['na', 'naa', 'n'],
  ත: ['ta', 'taa', 't'],
  ට: ['ta', 'taa', 't'],
  ද: ['da', 'daa', 'd'],
  ස: ['sa', 'saa', 's'],
  ය: ['ya', 'yaa', 'y'],
  ර: ['ra', 'raa', 'r'],
  හ: ['ha', 'haa', 'h'],
  ව: ['wa', 'va', 'v'],
  බ: ['ba', 'baa', 'b'],
  අ: ['a', 'aa', 'ah'],
  උ: ['u', 'oo'],
};

export const shuffleArray = (items = []) => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

export const normalizeSinhalaText = (value = '') => {
  const base = String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(SPACE_AND_PUNCT_REGEX, '')
    .replace(LETTER_ONLY_REGEX, '')
    .trim();

  return base;
};

export const matchesSinhalaAnswer = (expected = '', transcript = '', acceptedAnswers = []) => {
  const normalizedTranscript = normalizeSinhalaText(transcript);
  if (!normalizedTranscript) return false;

  const candidates = [expected, ...acceptedAnswers].filter(Boolean);
  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeSinhalaText(candidate);
    if (!normalizedCandidate) return false;

    const aliases = LETTER_NAME_ALIASES[candidate] ?? [];
    const normalizedAliases = aliases.map((alias) => normalizeSinhalaText(alias));

    return (
      normalizedTranscript === normalizedCandidate ||
      normalizedTranscript.includes(normalizedCandidate) ||
      normalizedCandidate.includes(normalizedTranscript) ||
      normalizedAliases.includes(normalizedTranscript)
    );
  });
};

export const formatPercent = (score = 0, total = 0) => {
  if (!total) return 0;
  return Math.round((score / total) * 100);
};

export const scoreSection = (attempts = []) => {
  const total = attempts.length;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const score = formatPercent(correct, total);
  const averageResponseTimeMs = total
    ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.responseTimeMs ?? 0), 0) / total)
    : 0;

  return {
    score,
    correct,
    total,
    averageResponseTimeMs,
  };
};

export const deriveWeakLetters = (attempts = []) => {
  const counts = new Map();

  attempts.forEach((attempt) => {
    if (attempt.correct) return;
    if (!attempt.target || String(attempt.target).length > 2) return;

    const target = String(attempt.target).trim();
    counts.set(target, (counts.get(target) ?? 0) + 1);
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([letter]) => letter)
    .sort((left, right) => left.localeCompare(right, 'si'));
};

export const getStrengths = (sections = {}) => {
  const strengths = [];

  if ((sections.letterRecognition?.score ?? 0) >= 80) {
    strengths.push('Sinhala letter recognition');
  }
  if ((sections.letterSound?.score ?? 0) >= 75) {
    strengths.push('Letter-sound matching');
  }
  if ((sections.twoLetterReading?.score ?? 0) >= 75) {
    strengths.push('Two-letter reading');
  }
  if ((sections.threeLetterReading?.score ?? 0) >= 70) {
    strengths.push('Three-letter reading');
  }

  return strengths;
};

export const getWeaknesses = (sections = {}) => {
  const weaknesses = [];

  if ((sections.letterRecognition?.score ?? 0) < 85) {
    weaknesses.push('Sinhala letter recognition');
  }
  if ((sections.letterSound?.score ?? 0) < 80) {
    weaknesses.push('Letter-sound association');
  }
  if ((sections.twoLetterReading?.score ?? 0) < 80) {
    weaknesses.push('Two-letter word reading');
  }
  if ((sections.threeLetterReading?.score ?? 0) < 70) {
    weaknesses.push('Three-letter word reading');
  }

  return weaknesses;
};

export const getRecommendedLevel = (scores = {}) => {
  const letterRecognition = scores.letterRecognition ?? 0;
  const letterSound = scores.letterSound ?? 0;
  const twoLetter = scores.twoLetterReading ?? 0;
  const threeLetter = scores.threeLetterReading ?? 0;

  if (letterRecognition < 50 || letterSound < 50) {
    return 1;
  }

  if (letterRecognition >= 85 && letterSound >= 80 && twoLetter >= 80 && threeLetter >= 70) {
    return 4;
  }

  if (letterSound >= 70 && (twoLetter < 70 || threeLetter < 70)) {
    return 3;
  }

  return 2;
};

export const getStartingGameLevel = (recommendedLevel = 1) => {
  if (recommendedLevel >= 4) return 3;
  if (recommendedLevel >= 1) return recommendedLevel;
  return 1;
};

const RECOMMENDATION_TARGETS = {
  letterRecognition: {
    threshold: 80,
    games: [
      { gameKey: 'letter-pronunciation', route: '/dyslexia/letter-pronunciation', title: 'අකුරු හඩ පුහුණුව', reason: 'අකුරු හඳුනාගෙන නිවැරදිව කියමු.' },
      { gameKey: 'first-letter', route: '/dyslexia/first-letter', title: 'පළමු අකුර', reason: 'පින්තූරයට ගැළපෙන පළමු අකුර සොයමු.' },
    ],
  },
  letterSound: {
    threshold: 80,
    games: [
      { gameKey: 'letter-sound-match', route: '/dyslexia/letter-sound-match', title: 'අකුරු-හඩ ගැළපීම', reason: 'අසන හඩට නිවැරදි අකුර හඳුනාගනිමු.' },
      { gameKey: 'letter-listening', route: '/dyslexia/letter-listening', title: 'අකුරු වලට සවන් දෙමු', reason: 'හඩ සහ අකුර අතර සම්බන්ධය ශක්තිමත් කරමු.' },
    ],
  },
  twoLetterReading: {
    threshold: 75,
    games: [
      { gameKey: 'two-letter-listen', route: '/dyslexia/two-letter-listen', title: 'අකුරු දෙකේ වචන අසමු', reason: 'කෙටි වචන අසා නිවැරදි පින්තූරය තෝරමු.' },
      { gameKey: 'two-letter-word-match', route: '/dyslexia/two-letter-word-match', title: 'අකුරු දෙකේ වචන', reason: 'අකුරු එකතු කර කෙටි වචන සාදමු.' },
      { gameKey: 'two-letter-speak', route: '/dyslexia/two-letter-speak', title: 'අකුරු දෙකේ වචන කියමු', reason: 'කෙටි වචන පැහැදිලිව කියවමු.' },
    ],
  },
  threeLetterReading: {
    threshold: 70,
    games: [
      { gameKey: 'word-image-match', route: '/dyslexia/word-image-match', title: 'වචනයට පින්තූරය', reason: 'වචන සහ රූප අතර සම්බන්ධය හඳුනාගනිමු.' },
      { gameKey: 'word-builder', route: '/dyslexia/word-builder', title: 'වචන හදමු', reason: 'අකුරු නිවැරදි පිළිවෙළට තබා වචන සාදමු.' },
      { gameKey: 'word-speak', route: '/dyslexia/word-speak', title: 'වචන කියමු', reason: 'නිවැරදි උච්චාරණය පුහුණු කරමු.' },
    ],
  },
};

const NEXT_SKILL = {
  letterRecognition: 'letterSound',
  letterSound: 'twoLetterReading',
  twoLetterReading: 'threeLetterReading',
  threeLetterReading: 'threeLetterReading',
};

export const getGameRecommendations = (scores = {}, weakLetters = [], recommendedLevel = 1) => {
  const skillSequence = Object.entries(RECOMMENDATION_TARGETS);
  const firstUnmastered = skillSequence.find(([skill, config]) => (Number(scores[skill]) || 0) < config.threshold);
  const weakestSkill = firstUnmastered?.[0] ?? 'threeLetterReading';
  const primaryGames = RECOMMENDATION_TARGETS[weakestSkill].games;
  const challengeSkill = NEXT_SKILL[weakestSkill];
  const challengeGames = RECOMMENDATION_TARGETS[challengeSkill].games;
  const selected = [primaryGames[0], primaryGames[1], challengeGames.find((game) => game.gameKey !== primaryGames[0]?.gameKey && game.gameKey !== primaryGames[1]?.gameKey)]
    .filter(Boolean);

  if (!firstUnmastered) {
    selected.splice(0, selected.length,
      RECOMMENDATION_TARGETS.threeLetterReading.games[1],
      RECOMMENDATION_TARGETS.threeLetterReading.games[2],
      { gameKey: 'rhyme-odd-one-out', route: '/dyslexia/rhyme-odd-one-out', title: 'වෙනස් වචනය සොයමු', reason: 'ශබ්ද රටා හඳුනාගෙන වෙනස් වචනය තෝරමු.' });
  }

  const roles = [
    { priority: 1, label: 'මුලින්ම මෙතනින් පටන් ගනිමු', badge: 'පටන් ගන්න' },
    { priority: 2, label: 'ඊළඟට පුහුණු කරමු', badge: 'පුහුණුව' },
    { priority: 3, label: 'දැන් අභියෝගයක්', badge: 'අභියෝගය' },
  ];

  return selected.map((game, index) => ({
    ...game,
    ...roles[index],
    targetSkill: index < 2 ? weakestSkill : challengeSkill,
    level: getStartingGameLevel(recommendedLevel),
    weakLetters,
  }));
};

export const summarizePlacementAssessment = ({ assessmentId, childId, startedAt, completedAt, responses }) => {
  const sectionBuckets = {
    letterRecognition: [],
    letterSound: [],
    twoLetterReading: [],
    threeLetterReading: [],
  };

  responses.forEach((response) => {
    if (!sectionBuckets[response.sectionKey]) return;
    sectionBuckets[response.sectionKey].push(response);
  });

  const sections = Object.fromEntries(
    Object.entries(sectionBuckets).map(([sectionKey, items]) => [sectionKey, scoreSection(items)])
  );

  const legacyScores = {
    letters: Math.round((sections.letterRecognition.score / 100) * 3),
    twoLetter: Math.round((sections.twoLetterReading.score / 100) * 2),
    threeLetter: Math.round((sections.threeLetterReading.score / 100) * 2),
  };

  const pronunciationScore = Math.round(
    ((sections.twoLetterReading.score + sections.threeLetterReading.score) / 2) || 0
  );

  const overallScore = Math.round(
    (sections.letterRecognition.score * 0.3) +
    (sections.letterSound.score * 0.25) +
    (sections.twoLetterReading.score * 0.2) +
    (sections.threeLetterReading.score * 0.15) +
    (pronunciationScore * 0.1)
  );

  const sectionScores = {
    letterRecognition: sections.letterRecognition.score,
    letterSound: sections.letterSound.score,
    twoLetterReading: sections.twoLetterReading.score,
    threeLetterReading: sections.threeLetterReading.score,
    pronunciation: pronunciationScore,
    overall: overallScore,
  };

  const recommendedLevel = getRecommendedLevel(sectionScores);
  const weakLetters = deriveWeakLetters(responses);
  const strengths = getStrengths(sections);
  const weaknesses = getWeaknesses(sections);
  const recommendedGames = getGameRecommendations(sectionScores, weakLetters, recommendedLevel);

  const recommendedActivities = [];
  if (recommendedLevel === 1) {
    recommendedActivities.push('Individual Sinhala letter activities');
    recommendedActivities.push('Letter-sound matching');
  } else if (recommendedLevel === 2) {
    recommendedActivities.push('Two-letter word practice');
    recommendedActivities.push('Letter-sound matching');
  } else if (recommendedLevel === 3) {
    recommendedActivities.push('Two-letter word practice');
    recommendedActivities.push('Speech and pronunciation games');
  } else {
    recommendedActivities.push('Reading and pronunciation activities');
    recommendedActivities.push('Advanced word practice');
  }

  return {
    childId,
    assessmentId,
    startedAt,
    completedAt,
    completed: true,
    scores: {
      letterRecognition: sections.letterRecognition.score,
      letterSound: sections.letterSound.score,
      twoLetterReading: sections.twoLetterReading.score,
      threeLetterReading: sections.threeLetterReading.score,
      pronunciation: pronunciationScore,
      overall: overallScore,
    },
    sections,
    overallScore,
    recommendedLevel,
    strengths,
    weaknesses,
    recommendedActivities,
    recommendedGames,
    weakLetters,
    responses,
    legacyScores,
  };
};
