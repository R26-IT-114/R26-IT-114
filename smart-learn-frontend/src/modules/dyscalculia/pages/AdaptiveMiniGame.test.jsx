import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdaptiveMiniGame from './AdaptiveMiniGame';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';

vi.mock('../utils/dyscalculiaProgress', () => ({ saveGameSession: vi.fn() }));
vi.mock('../components/DyscalculiaRewardBurst', () => ({ triggerDyscalculiaReward: vi.fn() }));
vi.mock('../components/NumberAdventureLand', () => ({ AdventureBackdrop: () => null }));
vi.mock('../components/OceanAnimalFriends', () => ({ default: () => null }));

const openGame = () => render(<MemoryRouter initialEntries={['/dyscalculia/adaptive/number-find?target=5']}>
  <Routes><Route path="/dyscalculia/adaptive/:gameKey" element={<AdaptiveMiniGame />} /></Routes>
</MemoryRouter>);

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('adaptive question feedback', () => {
  it('advances once after feedback and cancels progression on exit', () => {
    const view = openGame();
    const choice = screen.getByRole('button', { name: '5' });
    act(() => {
      choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      choice.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(triggerDyscalculiaReward).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1099));
    expect(screen.getByText('1/5')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText('2/5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    view.unmount();
    act(() => vi.runAllTimers());
    expect(saveGameSession).not.toHaveBeenCalled();
  });

  it('does not invent stars when every answer is incorrect', () => {
    openGame();
    for (let i = 0; i < 5; i++) {
      const wrong = document.querySelector('.adaptive-mini-options button:not([disabled])');
      const choices = [...document.querySelectorAll('.adaptive-mini-options button')];
      fireEvent.click(choices.find((button) => button.textContent !== '5') || wrong);
      act(() => vi.advanceTimersByTime(1100));
    }
    expect(saveGameSession).toHaveBeenCalledTimes(1);
    expect(saveGameSession).toHaveBeenCalledWith(expect.objectContaining({ correctCount: 0, starsEarned: 0, totalQuestions: 5 }));
    expect(screen.getByText('⭐ 0 ලැබුණු තරු')).toBeInTheDocument();
    expect(screen.getByText('උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^5$/);
    expect(screen.getByText('නැවත උත්සාහ කළ වාර').parentElement.querySelector('strong')).toHaveTextContent(/^5$/);
    const duration = screen.getByText('සෙල්ලම් කළ කාලය').parentElement.querySelector('strong');
    expect(duration).toHaveTextContent(/^5.5 තත්\.$/);
    act(() => vi.advanceTimersByTime(10000));
    expect(duration).toHaveTextContent(/^5.5 තත්\.$/);
  });
});
