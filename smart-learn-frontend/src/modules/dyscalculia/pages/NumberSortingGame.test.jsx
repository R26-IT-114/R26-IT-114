import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NumberSortingGame from './NumberSortingGame';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';

vi.mock('../utils/audioGuide', () => ({ speakSinhala: vi.fn() }));
vi.mock('../utils/gameAudio', () => ({
  REPLAY_EVENT: 'dyscalculia:replay-instructions',
  createGameAudio: () => ({ play: () => Promise.resolve(), pause: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), currentTime: 0 }),
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
  const view = render(<MemoryRouter initialEntries={['/dyscalculia/number-sorting']}><Routes>
    <Route path="/dyscalculia/number-sorting" element={<NumberSortingGame />} />
    <Route path="/dyscalculia" element={<h1>සෙල්ලමක් තෝරමු</h1>} />
  </Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'පහසු' }));
  return view;
}

function arrangeCorrectly() {
  const target = [...document.querySelectorAll('.sorting-card-tile')].map((card) => Number(card.textContent)).sort((a, b) => a - b);
  target.forEach((number, index) => {
    const cards = [...document.querySelectorAll('.sorting-card-tile')];
    if (Number(cards[index].textContent) !== number) {
      fireEvent.click(cards[index]);
      fireEvent.click(cards.find((card) => Number(card.textContent) === number));
    }
  });
}

function submitTwice() {
  const button = screen.getByRole('button', { name: /පරීක්ෂා කරන්න/ });
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}
function finishFeedback() { act(() => vi.advanceTimersByTime(1100)); }

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); vi.spyOn(Math, 'random').mockReturnValue(0.25); sessionStorage.setItem('smartlearn:number-sorting:intro-played', 'true'); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); sessionStorage.clear(); });

describe('sorting answer progression', () => {
  it('keeps positive feedback visible before advancing once and locks rearranging', () => {
    openGame(); arrangeCorrectly(); submitTwice();
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    expect(screen.getByText('හොඳයි! නිවැරදි අනුපිළිවෙලයි.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /පරීක්ෂා කරන්න/ })).toBeDisabled();
    const orderBefore = [...document.querySelectorAll('.sorting-card-tile')].map((card) => card.textContent);
    fireEvent.click(document.querySelectorAll('.sorting-card-tile')[0]);
    fireEvent.click(document.querySelectorAll('.sorting-card-tile')[1]);
    expect([...document.querySelectorAll('.sorting-card-tile')].map((card) => card.textContent)).toEqual(orderBefore);
    act(() => vi.advanceTimersByTime(1099));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(saveGameSession).not.toHaveBeenCalled();
  });

  it('saves the final correct answer once after its feedback delay with the actual reward', () => {
    openGame();
    for (let index = 0; index < 8; index += 1) {
      arrangeCorrectly(); submitTwice();
      expect(saveGameSession).not.toHaveBeenCalled();
      finishFeedback();
    }
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(8);
    expect(recordLevelResult).toHaveBeenCalledTimes(1);
    expect(recordLevelResult).toHaveBeenCalledWith('NumberSortingGame', 'easy', expect.objectContaining({ correctAnswers: 8, totalQuestions: 8, totalAttempts: 8, starsEarned: 3 }));
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({
      correctAnswers: 8,
      attempts: 8,
      wrongCount: 0,
      accuracy: 100,
      score: 80,
      unitResults: expect.arrayContaining([
        expect.objectContaining({ unitId: 'digit-0', starsEarned: 3 }),
        expect.objectContaining({ unitId: 'digit-3', starsEarned: 3 }),
        expect.objectContaining({ unitId: 'digit-7', starsEarned: 3 }),
      ]),
    }));
    expect(screen.getByText('මේ වාරේ තරු:')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^8$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^0$/);
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    expect(duration).toHaveTextContent(/^9.0 තත්\.$/);
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(/^9.0 තත්\.$/);
    expect(saveGameSession).toHaveBeenCalledTimes(1);
  });

  it('cancels the final save when the child leaves during feedback', () => {
    openGame();
    for (let index = 0; index < 7; index += 1) { arrangeCorrectly(); submitTwice(); finishFeedback(); }
    arrangeCorrectly(); submitTwice();
    fireEvent.click(screen.getByRole('button', { name: /ආපසු යන්න/ }));
    expect(screen.getByRole('heading', { name: 'සෙල්ලමක් තෝරමු' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10000));
    expect(saveGameSession).not.toHaveBeenCalled();
    expect(recordLevelResult).not.toHaveBeenCalled();
  });
});
