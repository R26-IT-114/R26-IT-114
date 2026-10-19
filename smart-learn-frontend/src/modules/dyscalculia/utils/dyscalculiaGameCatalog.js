import { SYMBOLS } from '../data/symbolDetectiveData';

const DIGITS = Array.from({ length: 10 }, (_, digit) => String(digit));

export const digitUnitId = (digit) => `digit-${Number(digit)}`;

export const sortingSequenceUnitId = (numbers) => (
  `sequence-${[...numbers].map(Number).sort((left, right) => left - right).join('-')}`
);

const SYMBOL_IDS = new Map([
  ['+', 'symbol-plus'],
  ['−', 'symbol-minus'],
  ['×', 'symbol-times'],
  ['÷', 'symbol-divide'],
  ['=', 'symbol-equals'],
]);
const OPERATOR_IDS = new Map([['+', 'plus'], ['−', 'minus'], ['×', 'times'], ['÷', 'divide']]);

export const symbolQuestionUnitId = (symbol) => SYMBOL_IDS.get(symbol) || null;

export const equationQuestionUnitId = (left, operator, right, difficulty = 'hard') => {
  const operatorId = OPERATOR_IDS.get(operator);
  const operandsValid = Number.isFinite(Number(left)) && Number.isFinite(Number(right));
  return operandsValid && operatorId
    ? difficulty === 'medium' ? 'equation-medium' : `equation-hard-${operatorId}`
    : null;
};

export const getSymbolDetectiveUnitId = (question) => {
  if (question?.type === 'identify') return symbolQuestionUnitId(question.trackingSymbol);
  const match = /^(\d+)\s*([+−×÷])\s*(\d+)\s*=/.exec(question?.display || '');
  return match ? equationQuestionUnitId(match[1], match[2], match[3], question?.difficulty) : null;
};

export const DYSCALCULIA_REWARD_GAMES = [
  {
    id: 'number-tracing',
    title: 'අංක ලිවීම',
    route: '/dyscalculia/number-tracing',
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  },
  {
    id: 'number-listening',
    title: 'අහලා තෝරන්න',
    route: '/dyscalculia/listening-game',
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  },
  {
    id: 'number-sorting',
    title: 'අංක අනුපිළිවෙල',
    route: '/dyscalculia/number-sorting',
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  },
  {
    id: 'balloon-pop',
    title: 'බැලුන් පොප් කරමු',
    route: '/dyscalculia/balloon-pop',
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  },
  {
    id: 'number-matching',
    title: 'අංකයට ගැළපෙන ප්‍රමාණය',
    route: '/dyscalculia/number-matching',
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  },
  {
    id: 'symbol-detective',
    title: 'සංකේත හඳුනමු',
    route: '/dyscalculia/symbol-detective',
    unitIds: [
      ...SYMBOLS.map(({ symbol }) => symbolQuestionUnitId(symbol)),
      'equation-medium',
      ...['plus', 'minus', 'times', 'divide'].map((operatorId) => `equation-hard-${operatorId}`),
    ],
  },
  ...[
    ['number-find', 'අංක සෙවීම'],
    ['count-match', 'ගණන් ගැළපීම'],
    ['number-order', 'අංක පෙළ'],
    ['quick-compare', 'ඉක්මන් තේරීම'],
  ].map(([gameKey, title]) => ({
    id: `adaptive-${gameKey}`,
    title: `අනුවර්තී ${title}`,
    route: `/dyscalculia/adaptive/${gameKey}?target=0`,
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  })),
  {
    id: 'number-review',
    title: 'අංක සමාලෝචනය',
    route: '/dyscalculia/review',
    unitIds: DIGITS.map((digit) => digitUnitId(digit)),
  },
];

export const MAIN_DYSCALCULIA_GAME_IDS = [
  'number-tracing',
  'number-listening',
  'number-sorting',
  'balloon-pop',
  'symbol-detective',
  'number-matching',
];

export const getRewardGame = (gameId) => DYSCALCULIA_REWARD_GAMES.find((game) => game.id === gameId) || null;
