import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NumberMatchingGame from './NumberMatchingGame';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';

vi.mock('../utils/audioGuide', () => ({ speakSinhala: vi.fn() }));
vi.mock('../utils/gameAudio', () => ({
  REPLAY_EVENT: 'dyscalculia:replay-instructions',
  createGameAudio: () => ({ play: () => Promise.resolve(), pause: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), currentTime: 0 }),
  createGameAudioContext: vi.fn(),
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
  const view = render(<MemoryRouter><NumberMatchingGame /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'පහසු' }));
  return view;
}
function answerButton(correct = true) {
  const target = document.querySelector('.nm-target-board-number').textContent;
  return [...document.querySelectorAll('button.nm-option')].find((button) => button.getAttribute('aria-label').startsWith(`${target} `) === correct);
}
function tapTwice(button) { act(() => { button.dispatchEvent(new MouseEvent('click', { bubbles: true })); button.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); }
function finishFeedback() { act(() => vi.advanceTimersByTime(1200)); }

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); vi.spyOn(Math, 'random').mockReturnValue(0.25); sessionStorage.setItem('smartlearn:number-matching:intro-played', 'true'); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); sessionStorage.clear(); });

describe('matching feedback progression', () => {
  it('continues once after positive feedback and ignores rapid repeat taps', () => {
    openGame(); tapTwice(answerButton());
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    expect(screen.getByText('🎉 නියමයි! හරි පිළිතුර!')).toBeInTheDocument();
    for (const button of document.querySelectorAll('button.nm-option')) expect(button).toBeDisabled();
    act(() => vi.advanceTimersByTime(1199));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(saveGameSession).not.toHaveBeenCalled();
  });

  it('saves once after ten answers and awards fewer stars after a repeated attempt', () => {
    openGame();
    tapTwice(answerButton(false));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    for (let index = 0; index < 10; index += 1) { tapTwice(answerButton()); expect(saveGameSession).not.toHaveBeenCalled(); finishFeedback(); }
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(10);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({ gameType: 'NumberMatchingGame', correctCount: 10, wrongCount: 1, attempts: 11, starsEarned: 29 }));
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
    expect(screen.getByText('⭐ 29 ලැබුණු තරු')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^11$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^1$/);
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    expect(duration).toHaveTextContent(/^12.0 තත්\.$/);
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(/^12.0 තත්\.$/);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
  });

  it.each(['back', 'restart', 'unmount'])('cancels the final result save on %s during feedback', (exit) => {
    const view = openGame();
    for (let index = 0; index < 9; index += 1) { fireEvent.click(answerButton()); finishFeedback(); }
    fireEvent.click(answerButton());
    if (exit === 'back') fireEvent.click(screen.getByRole('button', { name: /ආපසු යන්න/ }));
    else if (exit === 'restart') fireEvent.click(screen.getByRole('button', { name: '↻ නැවත අරඹන්න' }));
    else view.unmount();
    act(() => vi.advanceTimersByTime(10000));
    expect(saveGameSession).not.toHaveBeenCalled();
    expect(recordLevelResult).not.toHaveBeenCalled();
    if (exit === 'restart') expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    if (exit === 'back') expect(screen.getByRole('button', { name: 'පහසු' })).toBeInTheDocument();
  });
});
