import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameSoundControls from './GameSoundControls';
import GameRoundProgress from './GameRoundProgress';
import GameResultCard from './GameResultCard';
import DifficultySelector from './DifficultySelector';
import useGameInstructions from '../hooks/useGameInstructions';
import { setGameSoundEnabled, REPLAY_EVENT } from '../utils/gameAudio';
import { nextUnlockedLevel } from '../utils/gameUiProgress';

beforeEach(() => {
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn() });
  setGameSoundEnabled(true);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function Guide({ replay }) { useGameInstructions(replay); return null; }

describe('shared game UI', () => {
  it('replays the latest route instruction and removes the listener on unmount', () => {
    const first = vi.fn(), next = vi.fn();
    const view = render(<><GameSoundControls /><Guide replay={first} /></>);
    fireEvent.click(screen.getByRole('button', { name: 'උපදෙස් නැවත අසන්න' }));
    expect(first).toHaveBeenCalledTimes(1);
    view.rerender(<><GameSoundControls /><Guide replay={next} /></>);
    fireEvent.click(screen.getByRole('button', { name: 'උපදෙස් නැවත අසන්න' }));
    expect(next).toHaveBeenCalledTimes(1);
    view.unmount(); window.dispatchEvent(new Event(REPLAY_EVENT));
    expect(next).toHaveBeenCalledTimes(1);
  });
  it('disables replay while muted and exposes the new toggle state', () => {
    render(<GameSoundControls />);
    fireEvent.click(screen.getByRole('button', { name: 'හඬ නවත්වන්න' }));
    expect(screen.getByRole('button', { name: 'හඬ සක්‍රිය කරන්න' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'උපදෙස් නැවත අසන්න' })).toBeDisabled();
  });
  it('shows remaining questions and clamps progress at the final question', () => {
    const view = render(<GameRoundProgress current={3} total={8} correct={2} />);
    expect(screen.getByText('ඉතිරි 5')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    view.rerender(<GameRoundProgress current={9} total={8} />);
    expect(screen.getByText('ඉතිරි 0')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '8');
  });
  it('keeps completed levels playable and locked levels disabled', () => {
    const select = vi.fn();
    render(<MemoryRouter><DifficultySelector language="si" levels={{ easy: { completed: true }, medium: { unlocked: false }, hard: { unlocked: false } }} onSelect={select} mascotImages={{ easy: 'easy.png', medium: 'medium.png', hard: 'hard.png' }} /></MemoryRouter>);
    expect(screen.getByText('✓ සම්පූර්ණයි')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'පහසු' }));
    expect(select).toHaveBeenCalledWith('easy');
    expect(screen.getByRole('button', { name: 'මධ්‍යම අගුළු දමා ඇත' })).toBeDisabled();
  });
  it('only offers an unlocked next level and preserves retry/level actions', () => {
    const retry = vi.fn(), levels = vi.fn();
    expect(nextUnlockedLevel('easy', { medium: { unlocked: false } })).toBeNull();
    expect(nextUnlockedLevel('easy', { medium: { unlocked: true } })).toBe('medium');
    expect(nextUnlockedLevel('hard', {})).toBeNull();
    render(<GameResultCard correct={4} total={5} stars={2} rewardStars={12} onRetry={retry} onLevels={levels} />);
    expect(screen.queryByText('ඊළඟ මට්ටම →')).not.toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('⭐ 12 ලැබුණු තරු')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '↻ නැවත උත්සාහ කරන්න' }));
    fireEvent.click(screen.getByRole('button', { name: 'මට්ටම් තෝරන්න' }));
    expect(retry).toHaveBeenCalledTimes(1); expect(levels).toHaveBeenCalledTimes(1);
  });
});
