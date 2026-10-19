import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SymbolDetectiveGame from './SymbolDetectiveGame';
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
vi.mock('../components/OceanAnimalFriends', () => ({ default: () => null }));

function openGame() {
  const view = render(<MemoryRouter initialEntries={['/dyscalculia/symbol-detective']}><Routes>
    <Route path="/dyscalculia/symbol-detective" element={<SymbolDetectiveGame />} />
    <Route path="/dyscalculia" element={<h1>සෙල්ලමක් තෝරමු</h1>} />
  </Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'පහසු' }));
  return view;
}
function answerButton(correct = true) {
  const instruction = document.querySelector('.sd-question-copy p').textContent;
  return [...document.querySelectorAll('button.sd-symbol-card')].find((button) => instruction.includes(button.getAttribute('aria-label').split(':')[0]) === correct);
}
function tapTwice(button) { act(() => { button.dispatchEvent(new MouseEvent('click', { bubbles: true })); button.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); }
function finishFeedback() { act(() => vi.advanceTimersByTime(1100)); }

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); vi.spyOn(Math, 'random').mockReturnValue(0.25); localStorage.clear(); sessionStorage.setItem('smartlearn:symbol-detective:intro-played', 'true'); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear(); });

describe('symbol feedback progression', () => {
  it('rejects repeat taps during positive feedback and advances only once', () => {
    openGame(); tapTwice(answerButton());
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('හොඳයි! නිවැරදියි!');
    act(() => vi.advanceTimersByTime(1099));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(saveGameSession).not.toHaveBeenCalled();
  });

  it('keeps a wrong answer on the same question and saves one completed stage with actual stars', () => {
    openGame(); tapTwice(answerButton(false)); finishFeedback();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    for (let index = 0; index < 5; index += 1) { tapTwice(answerButton()); expect(saveGameSession).not.toHaveBeenCalled(); finishFeedback(); }
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({ gameType: 'SymbolDetectiveGame', attempts: 6, starsEarned: 5, accuracy: 83, score: 45 }));
    expect(screen.getByText('⭐ 5 ලැබුණු තරු')).toBeInTheDocument();
    expect(screen.getByText('මෙම අදියරේදී ඔබ තරු 5ක් ලබා ගත්තා.')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^6$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^1$/);
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    expect(duration).toHaveTextContent(/^6.6 තත්\.$/);
    expect(recordLevelResult).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(/^6.6 තත්\.$/);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
  });

  it('retries the completed difficulty and only changes difficulty when continuing', () => {
    openGame();
    for (let stage = 0; stage < 3; stage += 1) {
      for (let index = 0; index < 5; index += 1) { fireEvent.click(answerButton()); finishFeedback(); }
      if (stage < 2) fireEvent.click(screen.getByRole('button', { name: 'ඊළඟ අදියර →' }));
    }
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
    expect(recordLevelResult).toHaveBeenCalledWith('SymbolDetectiveGame', 'easy', expect.any(Object));
    expect(screen.getByRole('button', { name: 'ඊළඟ මට්ටම →' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '↻ නැවත උත්සාහ කරන්න' }));
    expect(document.querySelector('.sd-equation')).toBeNull();
    expect(document.querySelector('.sd-question-copy p')).toHaveTextContent('සංකේතය තෝරන්න');
    for (let stage = 0; stage < 3; stage += 1) {
      for (let index = 0; index < 5; index += 1) { fireEvent.click(answerButton()); finishFeedback(); }
      if (stage < 2) fireEvent.click(screen.getByRole('button', { name: 'ඊළඟ අදියර →' }));
    }
    expect(recordLevelResult).toHaveBeenLastCalledWith('SymbolDetectiveGame', 'easy', expect.any(Object));
    fireEvent.click(screen.getByRole('button', { name: 'ඊළඟ මට්ටම →' }));
    expect(document.querySelector('.sd-equation')).toHaveTextContent('= ?');
  });

  it.each(['back', 'unmount'])('cancels a pending final stage answer on %s', (exit) => {
    const view = openGame();
    for (let index = 0; index < 4; index += 1) { fireEvent.click(answerButton()); finishFeedback(); }
    fireEvent.click(answerButton());
    if (exit === 'back') {
      fireEvent.click(screen.getByRole('button', { name: /ආපසු යන්න/ }));
      expect(screen.getByRole('heading', { name: 'සෙල්ලමක් තෝරමු' })).toBeInTheDocument();
    } else view.unmount();
    act(() => vi.advanceTimersByTime(10000));
    expect(saveGameSession).not.toHaveBeenCalled();
    expect(recordLevelResult).not.toHaveBeenCalled();
  });
});
