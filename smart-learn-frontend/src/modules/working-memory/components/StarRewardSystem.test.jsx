import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import StarRewardSystem, { awardStar } from './StarRewardSystem';
import { loadBasket } from '../utils/starBasket';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); });

it('keeps run rewards intact but adds only a new per-game best across replays and remounts', () => {
  const onCountChange = vi.fn();
  const props = { storageKey: 'test-child', rewardScopeKey: 'n-back-1', visible: false, onCountChange };
  const view = render(<StarRewardSystem {...props} sessionKey="first" />);
  act(() => { awardStar(); awardStar(); awardStar(); });
  expect(loadBasket('test-child').total).toBe(3);
  view.rerender(<StarRewardSystem {...props} sessionKey="replay" />);
  act(() => { awardStar(); awardStar(); });
  expect(loadBasket('test-child').total).toBe(3);
  expect(onCountChange).toHaveBeenLastCalledWith(3, 2);
  act(() => { awardStar(); awardStar(); });
  expect(loadBasket('test-child').total).toBe(4);
  view.unmount();
  render(<StarRewardSystem {...props} sessionKey="after-login" />);
  expect(loadBasket('test-child')).toEqual({ best: { 'n-back': 4 }, total: 4 });
});
