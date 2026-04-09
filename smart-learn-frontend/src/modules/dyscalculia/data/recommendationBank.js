const recommendationBank = [
  {
    id: 'r1',
    title: 'Number Balloon Pop',
    skillType: 'number-recognition',
    level: 'easy',
    description: 'Pop only the number you hear.',
    durationMinutes: 8,
  },
  {
    id: 'r2',
    title: 'Fruit Counting Basket',
    skillType: 'counting',
    level: 'easy',
    description: 'Count fruit pictures and match cards.',
    durationMinutes: 10,
  },
  {
    id: 'r3',
    title: 'Bigger Number Race',
    skillType: 'magnitude-comparison',
    level: 'medium',
    description: 'Pick bigger or smaller quickly.',
    durationMinutes: 9,
  },
  {
    id: 'r4',
    title: 'Picture Plus Minus',
    skillType: 'simple-arithmetic',
    level: 'medium',
    description: 'Use visual objects for + and - practice.',
    durationMinutes: 12,
  },
  {
    id: 'r5',
    title: 'Guided Practice Buddy',
    skillType: 'simple-arithmetic',
    level: 'supportive',
    description: 'Slow-paced activity with extra hints.',
    durationMinutes: 7,
  },
];

export const getRecommendationsByPerformance = (weakAreas = [], severity = 'Mild') => {
  const matched = recommendationBank.filter((item) => weakAreas.includes(item.skillType));

  if (severity === 'Severe') {
    const supportive = recommendationBank.filter((item) => item.level === 'supportive');
    return [...matched, ...supportive].slice(0, 5);
  }

  if (severity === 'Moderate') {
    const easy = recommendationBank.filter((item) => item.level === 'easy');
    return [...matched, ...easy].slice(0, 5);
  }

  return [...matched, ...recommendationBank].slice(0, 4);
};
