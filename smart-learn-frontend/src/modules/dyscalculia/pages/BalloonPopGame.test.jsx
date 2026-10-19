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
vi.mock('../utils/dyscalculiaProgress', () => ({
  MAX_STARS_PER_GAME: 3,
  MAX_STARS_PER_UNIT: 3,
  getGameStarProgress: () => ({ earnedStars: 0, maximumStars: 30 }),
  getDyscalculiaProgress: () => ({ bestStars: {}, sessions: [] }),
  saveGameSession: vi.fn(),
}));
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
  const target = document.querySelector('.balloon-target-bubble > strong').textContent;
  const buttons = [...document.querySelectorAll('.math-circle')];
  return buttons.find((button) => button.getAttribute('aria-label').includes(` ${target}ක් `) === correct);
}

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); });

describe('balloon rounds', () => {
  it('shows the new Sinhala adventure layout and lets children retry a wrong balloon', () => {
    openGame();
    expect(screen.getByRole('heading', { name: 'බැලුන් වික්‍රමය' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'අංකය නැවත අහන්න' })).toBeInTheDocument();
    document.querySelectorAll('.math-circle').forEach((balloon) => {
      const quantity = Number(/වස්තු (\d+)ක්/.exec(balloon.getAttribute('aria-label'))[1]);
      const objects = [...balloon.querySelectorAll('.circle-obj-img')];
      expect(objects).toHaveLength(quantity);
      const positions = objects.map((object) => ({
        x: Number.parseFloat(object.style.left),
        y: Number.parseFloat(object.style.top),
      }));
      expect(positions.every(({ x, y }) => x >= 20 && x <= 80 && y >= 18 && y <= 82)).toBe(true);
      if (quantity > 1) {
        expect(new Set(positions.map(({ x, y }) => `${x},${y}`)).size).toBe(quantity);
      }
    });

    const target = document.querySelector('.balloon-target-bubble > strong').textContent;
    fireEvent.click(answerButton(false));
    expect(screen.getByRole('status')).toHaveTextContent('නැවත උත්සාහ');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(document.querySelector('.balloon-target-bubble > strong')).toHaveTextContent(target);

    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(document.querySelector('.balloon-target-bubble > strong')).toHaveTextContent(target);
    expect(answerButton()).toBeEnabled();
  });

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
      if (question === 1) {
        const target = document.querySelector('.balloon-target-bubble > strong').textContent;
        fireEvent.click(answerButton(false));
        expect(screen.getByRole('status')).toHaveTextContent('නැවත උත්සාහ');
        act(() => vi.advanceTimersByTime(1100));
        expect(document.querySelector('.balloon-target-bubble > strong')).toHaveTextContent(target);
      }
      fireEvent.click(answerButton());
      act(() => vi.advanceTimersByTime(1800));
    }
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({
      correctCount: 5,
      wrongCount: 1,
      attempts: 6,
      gameId: 'balloon-pop',
      completed: true,
      unitResults: expect.arrayContaining([
        expect.objectContaining({ unitId: expect.stringMatching(/^digit-/), starsEarned: 3 }),
      ]),
    }));
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^6$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^1$/);
    expect(screen.getByRole('progressbar', { name: 'බැලුන් ක්‍රීඩාවේ තරු ප්‍රගතිය' })).toHaveAttribute('aria-valuemax', '30');
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    const durationText = duration.textContent;
    expect(duration).toHaveTextContent(/^\d+\.\d+ තත්\.$/);
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(durationText);
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
