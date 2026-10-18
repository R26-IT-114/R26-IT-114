import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { QuestionScreen } from './VideoStoryGame';

vi.mock('../components/StarRewardSystem', () => ({ awardStar: vi.fn() }));
const questions = [{ id: 'test', question: 'Question one', options: ['Right', 'Wrong'], correct: 0 }];
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn() });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const waitForFeedback = () => act(() => vi.advanceTimersByTime(1500));
const setup = () => {
  const onDone = vi.fn();
  render(<QuestionScreen questions={questions} partLabel="Part one" accentColor="#059669" onDone={onDone} />);
  return onDone;
};

it('shows a hint and allows a correct retry without revealing the answer', () => {
  const onDone = setup();
  fireEvent.click(screen.getByRole('button', { name: /Wrong/ }));
  expect(screen.getByText(/ඉඟිය:/)).toBeTruthy();
  expect(screen.getByRole('button', { name: /Right/ }).style.background).not.toBe('rgb(34, 197, 94)');
  waitForFeedback();
  expect(onDone).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Right/ }));
  waitForFeedback();
  expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 1, accuracy: 50, totalWrong: 1 }));
});

it('counts two wrong attempts without inventing a correct answer', () => {
  const onDone = vi.fn();
  render(<QuestionScreen questions={[{ ...questions[0], options: ['Right', 'Wrong', 'Also wrong'] }]} accentColor="#059669" onDone={onDone} />);
  fireEvent.click(screen.getByRole('button', { name: /2 Wrong/ }));
  waitForFeedback();
  fireEvent.click(screen.getByRole('button', { name: /Also wrong/ }));
  waitForFeedback();
  expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 0, accuracy: 0, totalWrong: 2 }));
});

it('automatically finishes after a correct answer using the latest score', () => {
  const onDone = setup();
  fireEvent.click(screen.getByRole('button', { name: /Right/ }));
  waitForFeedback();
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ score: 1, accuracy: 100, totalWrong: 0 }));
});
