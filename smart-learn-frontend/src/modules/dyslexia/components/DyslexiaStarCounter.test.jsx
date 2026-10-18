import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import DyslexiaStarCounter, { DYSLEXIA_STAR_EVENT, DYSLEXIA_STAR_VISIBILITY_EVENT } from './DyslexiaStarCounter';

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

function award(score, rewardRunId, gameKey = 'word-speak', level = 1) {
  act(() => window.dispatchEvent(new CustomEvent(DYSLEXIA_STAR_EVENT, {
    detail: { gameKey, level, score, rewardRunId },
  })));
}

it('awards only the improvement over the best score, independently per game and level', () => {
  renderGame();
  award(3, 'first');
  expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Star rewards collected: 3');
  award(2, 'lower');
  award(3, 'same');
  expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Star rewards collected: 3');
  award(5, 'improved');
  award(5, 'improved');
  expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Star rewards collected: 5');
  award(2, 'other-game', 'word-image-match');
  award(1, 'other-level', 'word-speak', 2);
  expect(JSON.parse(localStorage.getItem('dyslexia_star_rewards:garden-player')).stars).toBe(8);
});

it('retains previous best marks across reloads and migrates duplicate replay rewards', () => {
  localStorage.setItem('dyslexia_star_rewards:garden-player', JSON.stringify({ earnedKeys: [
    'word-speak:level-1:run-first:correct-1',
    'word-speak:level-1:run-second:correct-1',
    'word-speak:level-1:run-second:correct-2',
  ] }));
  const view = renderGame();
  expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Star rewards collected: 2');
  award(3, 'third');
  view.unmount();
  renderGame();
  award(2, 'fourth');
  expect(screen.getByRole('complementary')).toHaveAttribute('aria-label', 'Star rewards collected: 3');
});

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
