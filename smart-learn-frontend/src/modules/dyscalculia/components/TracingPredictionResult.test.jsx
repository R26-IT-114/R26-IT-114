import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TracingPredictionResult from './TracingPredictionResult';

describe('TracingPredictionResult Next button', () => {
  it('shows Next after a correct result and calls navigation', () => {
    const onNext = vi.fn();
    render(<TracingPredictionResult result={{ predictedNumber: 0, confidence: 0.81 }} correct onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('does not show Next after an incorrect result', () => {
    render(<TracingPredictionResult result={{ predictedNumber: 6, confidence: 0.55 }} correct={false} onNext={() => {}} />);
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
  });
});
