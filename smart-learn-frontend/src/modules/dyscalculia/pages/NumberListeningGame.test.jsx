import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NumberListeningGame from './NumberListeningGame';
import { createGameAudio } from '../utils/gameAudio';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';

vi.mock('../utils/gameAudio', () => ({
  REPLAY_EVENT: 'dyscalculia:replay-instructions',
  createGameAudio: vi.fn(() => ({
    play: () => Promise.resolve(),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    currentTime: 0,
  })),
  speakGameUtterance: vi.fn(),
}));
vi.mock('../utils/dyscalculiaProgress', () => ({ saveGameSession: vi.fn() }));
vi.mock('../utils/gameLevelProgress', () => ({
  LEVELS: ['easy', 'medium', 'hard'],
  getGameLevels: () => ({ easy: { unlocked: true }, medium: { unlocked: false }, hard: { unlocked: false } }),
  recordLevelResult: vi.fn(() => ({
    passed: true,
    levels: { easy: { unlocked: true, completed: true }, medium: { unlocked: true }, hard: { unlocked: false } },
  })),
}));
vi.mock('../components/DyscalculiaRewardBurst', () => ({ triggerDyscalculiaReward: vi.fn() }));
vi.mock('../components/NumberAdventureLand', () => ({ AdventureBackdrop: () => null }));
vi.mock('../components/OceanAnimalFriends', () => ({ default: () => null }));

function openGame() {
  const view = render(
    <MemoryRouter initialEntries={['/dyscalculia/listening-game']}>
      <Routes>
        <Route path="/dyscalculia/listening-game" element={<NumberListeningGame />} />
        <Route path="/dyscalculia" element={<h1>සෙල්ලමක් තෝරමු</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'පහසු' }));
  playCurrentPrompt();
  return view;
}

function playCurrentPrompt() {
  act(() => vi.advanceTimersByTime(250));
}

function currentAnswer(correct = true) {
  // Follow the number the child actually hears rather than guessing its random target.
  const prompt = createGameAudio.mock.calls.map(([source]) => source).findLast((source) => /number-\d\.mp3/.test(source));
  const digit = prompt.match(/number-(\d)\.mp3/)[1];
  return screen.getAllByRole('button', { name: /^අංක .* තෝරන්න$/ }).find(
    (button) => (button.getAttribute('aria-label') === `අංක ${digit} තෝරන්න`) === correct,
  );
}

function tapTwice(button) {
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function finishFeedback() {
  act(() => vi.advanceTimersByTime(1100));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.spyOn(Math, 'random').mockReturnValue(0.25);
  sessionStorage.setItem('smartlearn:number-listening:intro-played', 'true');
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe('listening game automatic progression', () => {
  it('keeps positive feedback visible before advancing once, even for rapid repeat taps', () => {
    openGame();
    tapTwice(currentAnswer());

    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    expect(screen.getByText('🎉 හරි! ඉතා හොඳයි!')).toBeInTheDocument();
    for (const button of screen.getAllByRole('button', { name: /^අංක .* තෝරන්න$/ })) {
      expect(button).toBeDisabled();
    }
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1099));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(screen.queryByText('🎉 හරි! ඉතා හොඳයි!')).not.toBeInTheDocument();
    expect(saveGameSession).not.toHaveBeenCalled();
  });

  it('counts each attempted choice once and saves one result after all eight questions', () => {
    openGame();
    for (let question = 0; question < 8; question += 1) {
      if (question < 2) {
        tapTwice(currentAnswer(false));
        expect(screen.getByText('🐚 නැවත සවන් දී උත්සාහ කරන්න')).toBeInTheDocument();
        act(() => vi.advanceTimersByTime(1200));
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(question + 1));
      }
      tapTwice(currentAnswer());
      expect(saveGameSession).not.toHaveBeenCalled();
      finishFeedback();
      if (question < 7) playCurrentPrompt();
    }

    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(8);
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
    expect(recordLevelResult).toHaveBeenCalledWith('NumberListeningGame', 'easy', {
      correctAnswers: 6, totalQuestions: 8, score: 60,
    });
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({
      gameType: 'NumberListeningGame',
      level: 'easy',
      correctCount: 6,
      wrongCount: 2,
      attempts: 10,
      accuracy: 75,
      starsEarned: 2,
      completed: true,
    }));
    expect(screen.getByText('6 / 8')).toBeInTheDocument();
    expect(screen.getByText('⭐ 2 ලැබුණු තරු')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^10$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^2$/);
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    expect(duration).toHaveTextContent(/^13.2 තත්\.$/);
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(/^13.2 තත්\.$/);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
  });

  it.each(['back', 'unmount'])('cancels a pending final answer on %s', (exit) => {
    const view = openGame();
    for (let question = 0; question < 7; question += 1) {
      fireEvent.click(currentAnswer());
      finishFeedback();
      playCurrentPrompt();
    }
    fireEvent.click(currentAnswer());
    expect(screen.getByText('🎉 හරි! ඉතා හොඳයි!')).toBeInTheDocument();
    if (exit === 'back') {
      fireEvent.click(screen.getByRole('button', { name: /ආපසු යන්න/ }));
      expect(screen.getByRole('heading', { name: 'සෙල්ලමක් තෝරමු' })).toBeInTheDocument();
    } else {
      view.unmount();
    }
    act(() => vi.advanceTimersByTime(10000));
    expect(saveGameSession).not.toHaveBeenCalled();
    expect(recordLevelResult).not.toHaveBeenCalled();
  });
});
