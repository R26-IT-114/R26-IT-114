const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

export const SYMBOLS = [
  { symbol: '+', name: 'Plus', nameSi: 'එකතු කිරීම', meaning: 'Put numbers together', meaningSi: 'සංඛ්‍යා එකතු කිරීම' },
  { symbol: '−', name: 'Minus', nameSi: 'අඩු කිරීම', meaning: 'Take one number away', meaningSi: 'එක් සංඛ්‍යාවක් අඩු කිරීම' },
  { symbol: '×', name: 'Times', nameSi: 'ගුණ කිරීම', meaning: 'Make equal groups', meaningSi: 'සමාන කණ්ඩායම් සෑදීම' },
  { symbol: '÷', name: 'Divide', nameSi: 'බෙදීම', meaning: 'Share equally', meaningSi: 'සමානව බෙදා ගැනීම' },
  { symbol: '=', name: 'Equals', nameSi: 'සමානයි', meaning: 'Both sides are the same', meaningSi: 'දෙපසම සමාන වීම' },
];

export const STAGES = Array.from({ length: 5 }, (_, index) => ({
  name: `Math Adventure ${index + 1}`,
  symbols: SYMBOLS.map((item) => item.symbol),
}));

const symbolByValue = (symbol) => SYMBOLS.find((item) => item.symbol === symbol);

const makeAnswerOption = (value) => ({ symbol: String(value), nameSi: String(value), meaningSi: String(value) });

const makeAnswerOptions = (answer) => {
  const candidates = [answer - 2, answer - 1, answer + 1, answer + 2, answer + 3]
    .filter((value) => value >= 0 && value !== answer);
  return shuffle([answer, ...shuffle([...new Set(candidates)]).slice(0, 2)]).map(makeAnswerOption);
};

const makeSymbolQuestion = (symbol, index) => {
  const correct = symbolByValue(symbol);
  const distractors = shuffle(SYMBOLS.filter((item) => item.symbol !== symbol)).slice(0, 2);
  return {
    id: `easy-${index}-${symbol}`,
    type: 'identify',
    instructionSi: `${correct.nameSi} සංකේතය තෝරන්න`,
    correctSymbol: symbol,
    trackingSymbol: symbol,
    options: shuffle([correct, ...distractors]),
  };
};

const buildCalculation = (operator) => {
  let left;
  let right;
  let answer;

  if (operator === '+') {
    left = 1 + Math.floor(Math.random() * 8);
    right = 1 + Math.floor(Math.random() * (10 - left));
    answer = left + right;
  } else if (operator === '−') {
    left = 2 + Math.floor(Math.random() * 8);
    right = 1 + Math.floor(Math.random() * left);
    answer = left - right;
  } else if (operator === '×') {
    left = 1 + Math.floor(Math.random() * 5);
    right = 1 + Math.floor(Math.random() * 5);
    answer = left * right;
  } else {
    right = 1 + Math.floor(Math.random() * 5);
    answer = 1 + Math.floor(Math.random() * 5);
    left = right * answer;
  }

  return { left, right, answer };
};

const makeCalculationQuestion = (difficulty, operator, index) => {
  const { left, right, answer } = buildCalculation(operator);
  return {
    id: `${difficulty}-${index}-${operator}-${left}-${right}`,
    type: 'calculation',
    instructionSi: 'නිවැරදි පිළිතුර තෝරන්න',
    correctSymbol: String(answer),
    trackingSymbol: operator,
    options: makeAnswerOptions(answer),
    display: `${left} ${operator} ${right} = ?`,
  };
};

export const generateLevelQuestions = (level, difficulty = 'easy') => {
  const questionCount = 5;
  if (difficulty === 'easy') {
    const symbols = [
      ...SYMBOLS.map((item) => item.symbol),
      ...shuffle(SYMBOLS).slice(0, questionCount - SYMBOLS.length).map((item) => item.symbol),
    ];
    return shuffle(symbols.map((symbol, index) => makeSymbolQuestion(symbol, `${level}-${index}`)));
  }

  const operators = difficulty === 'medium' ? ['+', '−'] : ['+', '−', '×', '÷'];
  return Array.from({ length: questionCount }, (_, index) => (
    makeCalculationQuestion(difficulty, operators[index % operators.length], `${level}-${index}`)
  ));
};
