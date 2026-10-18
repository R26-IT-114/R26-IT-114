import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TracingPredictionResult from './TracingPredictionResult';

describe('TracingPredictionResult Next button', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  it('shows Next after a correct result and calls navigation', () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    render(<TracingPredictionResult result={{ predictedNumber: 0, confidence: 0.81 }} correct onNext={onNext} />);
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2750));
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('does not show Next after an incorrect result', () => {
    render(<TracingPredictionResult result={{ predictedNumber: 6, confidence: 0.55 }} correct={false} onNext={() => {}} />);
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
  });
});
