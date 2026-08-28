const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

export const SYMBOLS = [
  { symbol: '+', name: 'Plus', nameSi: 'එකතු කිරීම', meaning: 'Put numbers together', meaningSi: 'සංඛ්‍යා එකතු කිරීම', category: 'basic' },
  { symbol: '−', name: 'Minus', nameSi: 'අඩු කිරීම', meaning: 'Take one number away', meaningSi: 'එක් සංඛ්‍යාවක් අඩු කිරීම', category: 'basic' },
  { symbol: '×', name: 'Times', nameSi: 'ගුණ කිරීම', meaning: 'Make equal groups', meaningSi: 'සමාන කණ්ඩායම් සෑදීම', category: 'intermediate' },
  { symbol: '÷', name: 'Divide', nameSi: 'බෙදීම', meaning: 'Share equally', meaningSi: 'සමානව බෙදා ගැනීම', category: 'intermediate' },
  { symbol: '=', name: 'Equals', nameSi: 'සමානයි', meaning: 'Both sides are the same', meaningSi: 'දෙපසම සමාන වීම', category: 'basic' },
  { symbol: '<', name: 'Less than', nameSi: 'වඩා අඩුයි', meaning: 'The left number is smaller', meaningSi: 'වම් සංඛ්‍යාව කුඩා වීම', category: 'advanced' },
  { symbol: '>', name: 'Greater than', nameSi: 'වඩා වැඩියි', meaning: 'The left number is bigger', meaningSi: 'වම් සංඛ්‍යාව විශාල වීම', category: 'advanced' },
];

export const STAGES = [
  { name: 'Symbol Starters', symbols: ['+', '−', '='] },
  { name: 'Operation Explorers', symbols: ['+', '−', '×', '÷', '='] },
  { name: 'Comparison Crew', symbols: ['+', '−', '×', '÷', '=', '<', '>'] },
  { name: 'Symbol Champions', symbols: ['+', '−', '×', '÷', '=', '<', '>'] },
  { name: 'Detective Mastery', symbols: ['+', '−', '×', '÷', '=', '<', '>'] },
];

const getSymbol = (symbol) => SYMBOLS.find((item) => item.symbol === symbol) || SYMBOLS[0];
const pick = (symbols, correct, count = 3) => shuffle([correct, ...shuffle(symbols.filter((item) => item.symbol !== correct.symbol)).slice(0, count - 1)]);

const makeQuestion = (level, type, correct, options, instruction, instructionSi, display = null) => ({
  id: `${level}-${type}-${correct.symbol}-${Math.random().toString(36).slice(2, 8)}`,
  level,
  type,
  instruction,
  instructionSi,
  correctSymbol: correct.symbol,
  options,
  explanation: `${correct.symbol} means ${correct.meaning.toLowerCase()}.`,
  display,
});

const createQuestion = (level, available) => {
  const correct = available[Math.floor(Math.random() * available.length)];
  const options = pick(available, correct, Math.min(3, available.length));

  if (level === 1) {
    return makeQuestion(level, 'identify', correct, options, `Find the ${correct.name} symbol`, `${correct.nameSi} සංකේතය තෝරන්න`);
  }
  if (level === 2) {
    return makeQuestion(level, 'meaning', correct, options, `Which symbol means: ${correct.meaning}?`, `“${correct.meaningSi}” පෙන්වන්නේ කුමන සංකේතයෙන්ද?`);
  }
  if (level === 3) {
    return makeQuestion(level, 'action', correct, options, `What does ${correct.symbol} mean?`, `${correct.symbol} කියන්නේ මොකක්ද?`);
  }
  if (level === 4) {
    return makeQuestion(level, 'requested', correct, options, `Find the symbol for “${correct.name}”`, `“${correct.nameSi}” සඳහා සංකේතය සොයන්න`);
  }
  if (level === 5) {
    return makeQuestion(level, 'memory', correct, options, 'Find the matching symbol pair', 'ගැළපෙන සංකේත යුගලය සොයන්න');
  }
  if (level === 6) {
    const equations = {
      '+': ['2', '3', '5'], '−': ['7', '2', '5'], '×': ['2', '3', '6'], '÷': ['8', '2', '4'],
    };
    const numbers = equations[correct.symbol] || ['4', '4', '4'];
    return makeQuestion(level, 'equation', correct, options, 'Choose the missing symbol', 'හිස් සංකේතය තෝරන්න', `${numbers[0]}  _  ${numbers[1]}  =  ${numbers[2]}`);
  }
  const left = correct.symbol === '<' ? 2 : correct.symbol === '>' ? 8 : 5;
  const right = correct.symbol === '<' ? 8 : correct.symbol === '>' ? 2 : 5;
  return makeQuestion(level, 'comparison', correct, options, 'Which symbol shows the numbers correctly?', 'අංක දෙක නිවැරදිව පෙන්වන සංකේතය තෝරන්න', `${left}  _  ${right}`);
};

export const generateLevelQuestions = (level, stage = 1, weakSymbols = []) => {
  const stageConfig = STAGES[Math.max(0, Math.min(STAGES.length - 1, stage - 1))];
  const stageAvailable = stageConfig.symbols.map(getSymbol);
  const available = level === 6
    ? stageAvailable.filter((item) => ['+', '−', '×', '÷'].includes(item.symbol))
    : level === 7
      ? stageAvailable.filter((item) => ['<', '>', '='].includes(item.symbol))
      : stageAvailable;
  const questionSymbols = available.length >= 2 ? available : stageAvailable;
  const questions = Array.from({ length: 8 }, () => createQuestion(level, questionSymbols));
  const practice = questionSymbols.filter((item) => weakSymbols.includes(item.symbol));
  if (practice.length) {
    questions.splice(1, 0, createQuestion(level, practice.length >= 2 ? practice : questionSymbols));
  }
  return shuffle(questions).slice(0, 10);
};
