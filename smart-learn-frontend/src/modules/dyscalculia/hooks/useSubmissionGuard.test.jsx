import { StrictMode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import useSubmissionGuard from './useSubmissionGuard';

afterEach(cleanup);

describe('async drawing submissions', () => {
  it('accepts only one submission before a render and allows a new attempt after completion', () => {
    const { result } = renderHook(useSubmissionGuard);
    const first = result.current.begin();
    expect(first).not.toBeNull();
    expect(result.current.begin()).toBeNull();
    expect(result.current.isCurrent(first)).toBe(true);
    result.current.finish(first);
    expect(result.current.isCurrent(first)).toBe(false);
    const next = result.current.begin();
    expect(next).not.toBeNull();
    expect(next).not.toBe(first);
  });

  it('invalidates a pending response on navigation, even when it resolves later', async () => {
    const { result, unmount } = renderHook(useSubmissionGuard);
    const { begin, isCurrent } = result.current;
    let resolvePrediction;
    const prediction = new Promise((resolve) => { resolvePrediction = resolve; });
    const token = begin();
    const saved = [];
    const evaluation = prediction.then((value) => {
      if (isCurrent(token)) saved.push(value);
    });
    unmount();
    await act(async () => {
      resolvePrediction({ isCorrect: true });
      await evaluation;
    });
    expect(saved).toEqual([]);
    expect(isCurrent(token)).toBe(false);
    expect(begin()).toBeNull();
  });

  it('keeps a new request locked if an older completion arrives again', () => {
    const { result } = renderHook(useSubmissionGuard);
    const old = result.current.begin();
    result.current.finish(old);
    const current = result.current.begin();
    result.current.finish(old);
    expect(result.current.isCurrent(current)).toBe(true);
    expect(result.current.begin()).toBeNull();
  });

  it('accepts submissions after the Strict Mode mount cleanup rehearsal', () => {
    const { result } = renderHook(useSubmissionGuard, { wrapper: StrictMode });
    const token = result.current.begin();
    expect(token).not.toBeNull();
    expect(result.current.isCurrent(token)).toBe(true);
  });
});
