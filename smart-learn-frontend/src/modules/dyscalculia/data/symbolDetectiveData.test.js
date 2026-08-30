import { describe, expect, it } from 'vitest';
import { generateLevelQuestions } from './symbolDetectiveData';

describe('symbol detective difficulty questions', () => {
  it('covers every basic symbol on easy', () => {
    const questions = generateLevelQuestions(1, 'easy');
    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((question) => question.correctSymbol))).toEqual(new Set(['+', '−', '×', '÷', '=']));
  });

  it('uses only addition and subtraction calculations on medium', () => {
    const questions = generateLevelQuestions(1, 'medium');
    expect(questions).toHaveLength(5);
    expect(questions.every((question) => ['+', '−'].includes(question.trackingSymbol))).toBe(true);
    expect(questions.every((question) => question.options.length === 3)).toBe(true);
  });

  it('uses all four operations and exact division on hard', () => {
    const questions = generateLevelQuestions(1, 'hard');
    expect(new Set(questions.map((question) => question.trackingSymbol))).toEqual(new Set(['+', '−', '×', '÷']));
    questions.forEach((question) => {
      const [left, operator, right] = question.display.split(' ');
      if (operator === '÷') expect(Number(left) % Number(right)).toBe(0);
      expect(question.options.some((option) => option.symbol === question.correctSymbol)).toBe(true);
    });
  });
});
