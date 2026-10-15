import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import DyslexiaStarCounter, { DYSLEXIA_STAR_EVENT, DYSLEXIA_STAR_VISIBILITY_EVENT } from './DyslexiaStarCounter';
import DyslexiaRewardSlot from './DyslexiaRewardSlot';

vi.mock('../../../hooks/useAuth', () => ({ default: () => ({ user: { uid: 'reward-learner' } }) }));
vi.mock('./DyslexiaConfettiBurst', () => ({ default: () => null }));

let media;
let updateMedia;
beforeEach(() => {
  localStorage.clear();
  media = {
    matches: true,
    addEventListener: vi.fn((event, callback) => { updateMedia = callback; }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
});
afterEach(() => vi.unstubAllGlobals());

function renderGame() {
  return render(
    <MemoryRouter>
      <DyslexiaStarCounter>
        <main>
          <h1>Game heading</h1>
          <DyslexiaRewardSlot />
          <button>Answer</button>
        </main>
      </DyslexiaStarCounter>
    </MemoryRouter>,
  );
}

it('places one reward box below the heading on small screens and retains rewards when resized', () => {
  localStorage.setItem('dyslexia_star_rewards:reward-learner', JSON.stringify({ earnedKeys: ['first'] }));
  const { container } = renderGame();
  act(() => window.dispatchEvent(new CustomEvent(DYSLEXIA_STAR_VISIBILITY_EVENT, { detail: { visible: true } })));
  const counter = screen.getByRole('complementary', { name: 'Star rewards collected: 1' });
  expect(counter.parentElement).toHaveClass('dyslexia-reward-slot');
  expect(counter.parentElement.previousElementSibling).toHaveTextContent('Game heading');
  expect(counter.parentElement.nextElementSibling).toHaveTextContent('Answer');
  act(() => { media.matches = false; updateMedia(); });
  expect(screen.getByRole('complementary', { name: 'Star rewards collected: 1' }).closest('.dyslexia-reward-slot')).toBeNull();
  act(() => { media.matches = true; updateMedia(); });
  expect(screen.getByRole('complementary', { name: 'Star rewards collected: 1' }).parentElement).toHaveClass('dyslexia-reward-slot');
  expect(container.querySelectorAll('.dyslexia-star-counter')).toHaveLength(1);
});

it('keeps the intro counter hidden and awards stars after it becomes visible', () => {
  const { container } = renderGame();
  expect(container.querySelector('.dyslexia-star-counter')).toHaveClass('dyslexia-star-counter--hidden');
  act(() => window.dispatchEvent(new CustomEvent(DYSLEXIA_STAR_VISIBILITY_EVENT, { detail: { visible: true } })));
  act(() => window.dispatchEvent(new CustomEvent(DYSLEXIA_STAR_EVENT, { detail: { gameKey: 'letter-listening', score: 1 } })));
  expect(screen.getByRole('complementary', { name: 'Star rewards collected: 1' }).parentElement).toHaveClass('dyslexia-reward-slot');
});
