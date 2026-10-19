import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useFeedbackAdvance from './useFeedbackAdvance';

describe('feedback progression', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('keeps feedback visible before advancing and ignores duplicate submissions', () => {
    const advance = vi.fn();
    const { result } = renderHook(() => useFeedbackAdvance());
    expect(result.current.schedule(advance)).toBe(true);
    expect(result.current.schedule(advance)).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(advance).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(100));
    expect(advance).toHaveBeenCalledTimes(1);
    expect(result.current.pending.current).toBe(false);
  });
  it('cancels pending progression on back/restart and unmount', () => {
    const advance = vi.fn();
    const { result, unmount } = renderHook(() => useFeedbackAdvance());
    result.current.schedule(advance);
    result.current.cancel();
    act(() => vi.runAllTimers());
    expect(advance).not.toHaveBeenCalled();
    expect(result.current.schedule(advance)).toBe(true);
    unmount();
    act(() => vi.runAllTimers());
    expect(advance).not.toHaveBeenCalled();
  });
});
