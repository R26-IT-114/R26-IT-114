import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BalloonPopGame from './BalloonPopGame';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';

vi.mock('../utils/gameAudio', () => ({
  REPLAY_EVENT: 'dyscalculia:replay-instructions',
  createGameAudio: () => ({ play: () => Promise.resolve(), pause: vi.fn(), currentTime: 0 }),
  createGameAudioContext: vi.fn(),
  speakGameUtterance: vi.fn(),
}));
vi.mock('../utils/dyscalculiaProgress', () => ({ saveGameSession: vi.fn() }));
vi.mock('../utils/gameLevelProgress', () => ({
  LEVELS: ['easy', 'medium', 'hard'],
  getGameLevels: () => ({ easy: { unlocked: true }, medium: { unlocked: false }, hard: { unlocked: false } }),
  recordLevelResult: vi.fn(() => ({ passed: true, levels: { easy: { unlocked: true, completed: true }, medium: { unlocked: true }, hard: { unlocked: false } } })),
}));
vi.mock('../components/DyscalculiaRewardBurst', () => ({ triggerDyscalculiaReward: vi.fn() }));
vi.mock('../components/NumberAdventureLand', () => ({ AdventureBackdrop: () => null }));
vi.mock('../components/OceanAnimalFriends', () => ({ default: () => null }));

function openGame() {
  const view = render(<MemoryRouter><div className="dyscalculia-beach-module"><BalloonPopGame /></div></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'පහසු' }));
  return view;
}

function answerButton(correct = true) {
  const target = document.querySelector('.target-number-large').textContent;
  const buttons = [...document.querySelectorAll('.math-circle')];
  return buttons.find((button) => button.getAttribute('aria-label').includes(` ${target}ක් `) === correct);
}

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); });

describe('balloon rounds', () => {
  it('shows positive feedback before automatically advancing and ignores rapid repeat taps', () => {
    openGame();
    const correct = answerButton();
    act(() => {
      correct.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      correct.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('නිවැරදියි');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1399));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(document.querySelectorAll('.balloon-lane .balloon-drift > button')).toHaveLength(3);
    expect(saveGameSession).not.toHaveBeenCalled();
  });

  it('saves exactly one completed session with rewards based on actual answers', () => {
    openGame();
    for (let question = 0; question < 5; question += 1) {
      fireEvent.click(answerButton(question !== 1));
      act(() => vi.advanceTimersByTime(1800));
    }
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({ correctCount: 4, wrongCount: 1, attempts: 5, starsEarned: 4 }));
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^5$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^1$/);
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    expect(duration).toHaveTextContent(/^8.6 තත්\.$/);
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(/^8.6 තත්\.$/);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending final answer when navigating away', () => {
    const view = openGame();
    for (let question = 0; question < 4; question += 1) {
      fireEvent.click(answerButton());
      act(() => vi.advanceTimersByTime(1400));
    }
    fireEvent.click(answerButton());
    view.unmount();
    act(() => vi.advanceTimersByTime(10000));
    expect(saveGameSession).not.toHaveBeenCalled();
    expect(recordLevelResult).not.toHaveBeenCalled();
  });
});
