import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useDyslexiaProgress from './useDyslexiaProgress';
import { dyslexiaService } from '../services/dyslexiaService';

vi.mock('../../../hooks/useAuth', () => ({
  default: () => ({ user: { uid: 'learner-a' }, isAuthLoading: false }),
}));
vi.mock('../services/dyslexiaService', () => ({
  dyslexiaService: {
    getAssessment: vi.fn(), saveAssessment: vi.fn(), deleteAssessment: vi.fn(),
  },
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  dyslexiaService.getAssessment.mockResolvedValue({ data: null });
  dyslexiaService.saveAssessment.mockResolvedValue({});
  dyslexiaService.deleteAssessment.mockResolvedValue({});
});

describe('skipping the dyslexia pre-test', () => {
  it('persists the skip for this learner without submitting an assessment or inventing results', async () => {
    const { result, unmount } = renderHook(() => useDyslexiaProgress());
    await waitFor(() => expect(result.current.syncing).toBe(false));
    act(() => result.current.skipAssessment());
    expect(result.current.assessmentSkipped).toBe(true);
    expect(result.current.assessmentDone).toBe(false);
    expect(result.current.assessmentResult).toBeNull();
    expect(result.current.recommendedLevel).toBe(1);
    for (const section of [1, 2, 3, 4, 5, 6]) {
      expect(result.current.isSectionUnlocked(section)).toBe(true);
    }
    expect(dyslexiaService.saveAssessment).not.toHaveBeenCalled();
    unmount();
    const restored = renderHook(() => useDyslexiaProgress());
    await waitFor(() => expect(restored.result.current.syncing).toBe(false));
    expect(restored.result.current.assessmentSkipped).toBe(true);
    const otherLearner = renderHook(() => useDyslexiaProgress('learner-b'));
    await waitFor(() => expect(otherLearner.result.current.syncing).toBe(false));
    expect(otherLearner.result.current.assessmentSkipped).toBe(false);
  });

  it('can clear the skip and later save a completed assessment normally', async () => {
    const { result } = renderHook(() => useDyslexiaProgress());
    await waitFor(() => expect(result.current.syncing).toBe(false));
    act(() => result.current.skipAssessment());
    await act(async () => result.current.resetAssessment());
    expect(result.current.assessmentSkipped).toBe(false);
    expect(localStorage.getItem('dyslexia_progress:learner-a')).toBeNull();
    await act(async () => result.current.completeAssessment({ letters: 3, twoLetter: 2, threeLetter: 1 }));
    expect(result.current.assessmentDone).toBe(true);
    expect(result.current.assessmentSkipped).toBe(false);
    expect(dyslexiaService.saveAssessment).toHaveBeenCalledOnce();
    act(() => result.current.skipAssessment());
    expect(result.current.assessmentDone).toBe(true);
  });
});
