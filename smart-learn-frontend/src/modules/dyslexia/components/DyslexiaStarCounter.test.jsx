import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import DyslexiaStarCounter, { DYSLEXIA_STAR_VISIBILITY_EVENT } from './DyslexiaStarCounter';

vi.mock('../../../hooks/useAuth', () => ({ default: () => ({ user: { uid: 'garden-player' } }) }));
vi.mock('./DyslexiaConfettiBurst', () => ({ default: () => null }));

let media;
let resize;
beforeEach(() => {
  localStorage.clear();
  media = {
    matches: true,
    addEventListener: vi.fn((event, callback) => { resize = callback; }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
});
afterEach(() => vi.unstubAllGlobals());

function renderGame(path = '/dyslexia/garden-journey') {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <DyslexiaStarCounter>
        <h1>Game heading</h1>
        <div id="dyslexia-game-rewards" />
        <button>Answer</button>
      </DyslexiaStarCounter>
    </MemoryRouter>,
  );
  act(() => window.dispatchEvent(new CustomEvent(DYSLEXIA_STAR_VISIBILITY_EVENT, { detail: { visible: true } })));
  return view;
}

it.each(['garden-journey', 'letter-pronunciation', 'letter-listening', 'letter-sound-match', 'word-image-match', 'word-speak', 'word-listen-match', 'two-letter-listen', 'first-letter', 'rhyme-odd-one-out', 'two-letter-word-match', 'two-letter-speak', 'word-builder'])('places %s rewards inline on small screens and preserves desktop placement', (game) => {
  localStorage.setItem('dyslexia_star_rewards:garden-player', JSON.stringify({ earnedKeys: ['earned-star'] }));
  const { container } = renderGame(`/dyslexia/${game}`);
  const getCounter = () => screen.getByRole('complementary', { name: 'Star rewards collected: 1' });
  expect(getCounter().parentElement.id).toBe('dyslexia-game-rewards');
  expect(getCounter().parentElement.previousElementSibling).toHaveTextContent('Game heading');
  act(() => { media.matches = false; resize(); });
  expect(getCounter().parentElement.id).not.toBe('dyslexia-game-rewards');
  act(() => { media.matches = true; resize(); });
  expect(getCounter().parentElement.id).toBe('dyslexia-game-rewards');
  expect(container.querySelectorAll('.dyslexia-star-counter')).toHaveLength(1);
});

it('preserves the desktop position from initial render', () => {
  media.matches = false;
  renderGame();
  expect(screen.getByRole('complementary').parentElement.id).not.toBe('dyslexia-game-rewards');
});

it('keeps the reward box hidden when a game hides its rewards', () => {
  renderGame('/dyslexia/letter-listening');
  act(() => window.dispatchEvent(new CustomEvent(DYSLEXIA_STAR_VISIBILITY_EVENT, { detail: { visible: false } })));
  const hiddenCounter = document.querySelector('.dyslexia-star-counter');
  expect(hiddenCounter).toHaveClass('dyslexia-star-counter--hidden');
  expect(document.getElementById('dyslexia-game-rewards')).toBeEmptyDOMElement();
});
