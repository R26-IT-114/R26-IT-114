import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ColorMemoryGame from './ColorMemoryGame';

vi.mock('../context/ProgressContext', () => ({ useProgress: () => ({ initializeGame: vi.fn(), completeLevel: vi.fn(), getAdaptiveProfile: vi.fn(), recordAdaptiveResult: vi.fn() }) }));
vi.mock('../context/GamePreviewContext', () => ({ useGamePreview: vi.fn() }));
vi.mock('../hooks/usePreviewInstructionAudio', () => ({ default: () => ({ playing: false, setPlaying: vi.fn(), toggle: vi.fn() }) }));
vi.mock('./SequenceRecallGame', () => ({ AnimatedSeaBg: () => null }));
vi.mock('../components/StarRewardSystem', () => ({ awardStar: vi.fn() }));
vi.mock('../utils/adaptiveDifficulty', () => ({ adaptColorMemoryConfig: cfg => ({ ...cfg, type: 'number', pool: [{ id: 'right', label: 'Right', value: 1 }, { id: 'wrong', label: 'Wrong', value: 2 }], choices: 2, rounds: 1, passScore: 1, memorizeMs: 10 }) }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); });
const setup = () => {
  const onComplete = vi.fn();
  render(<ColorMemoryGame onComplete={onComplete} />);
  fireEvent.click(screen.getByRole('button', { name: 'ක්‍රීඩාව පටන් ගමු!' }));
  act(() => vi.advanceTimersByTime(10));
  return onComplete;
};
const answer = name => {
  fireEvent.click(screen.getByRole('button', { name }));
  act(() => vi.advanceTimersByTime(1100));
};
it('keeps the same question for two retries and then advances after three wrong attempts', () => {
  const done = setup();
  answer('Wrong');
  expect(done).not.toHaveBeenCalled();
  answer('Wrong');
  expect(done).not.toHaveBeenCalled();
  answer('Wrong');
  expect(done).toHaveBeenCalledWith(expect.objectContaining({ correct: 0, wrongAttempts: 3, accuracy: 0 }));
});
it('advances on a correct retry and retains the wrong-attempt count', () => {
  const done = setup();
  answer('Wrong');
  answer('Right');
  expect(done).toHaveBeenCalledWith(expect.objectContaining({ correct: 1, wrongAttempts: 1, accuracy: 100 }));
});
