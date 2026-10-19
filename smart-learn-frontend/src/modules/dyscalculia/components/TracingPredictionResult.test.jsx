import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TracingPredictionResult from './TracingPredictionResult';

describe('TracingPredictionResult Next button', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); });
  it('shows positive feedback before automatically continuing once', () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    render(<TracingPredictionResult result={{ predictedNumber: 0, confidence: 0.81 }} correct onNext={onNext} />);
    expect(screen.getByText('අපූරුයි! අංකය හරි!')).toBeInTheDocument();
    expect(screen.getByText('මේ වාරේ තරු: 3 / 3')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1700));
    expect(onNext).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(100));
    expect(onNext).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'තව අංකයක් ලියමු →' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('uses the latest callback without restarting the feedback delay', () => {
    vi.useFakeTimers();
    const first = vi.fn(), latest = vi.fn();
    const result = { predictedNumber: 2, confidence: 0.91 };
    const view = render(<TracingPredictionResult result={result} correct onNext={first} />);
    act(() => vi.advanceTimersByTime(1000));
    view.rerender(<TracingPredictionResult result={result} correct onNext={latest} />);
    act(() => vi.advanceTimersByTime(800));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
  });

  it('cancels automatic progression after unmount', () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    const view = render(<TracingPredictionResult result={{ predictedNumber: 1, confidence: 0.91 }} correct onNext={onNext} />);
    view.unmount();
    act(() => vi.advanceTimersByTime(5000));
    expect(onNext).not.toHaveBeenCalled();
  });

  it('does not continue or award stars after an incorrect result', () => {
    vi.useFakeTimers();
    const onNext = vi.fn();
    render(<TracingPredictionResult result={{ predictedNumber: 6, confidence: 0.55 }} correct={false} onNext={onNext} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'තව අංකයක් ලියමු →' })).not.toBeInTheDocument();
    expect(screen.queryByText('මේ වාරේ තරු: 3 / 3')).not.toBeInTheDocument();
  });

  it('keeps keyboard focus inside the reward dialog and restores focus on close', () => {
    vi.useFakeTimers();
    const outside = document.createElement('button');
    document.body.appendChild(outside); outside.focus();
    const view = render(<TracingPredictionResult result={{ predictedNumber: 6, confidence: 0.95 }} correct onNext={() => {}} />);
    const dialog = screen.getByRole('dialog');
    const next = screen.getByRole('button', { name: 'තව අංකයක් ලියමු →' });
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(next).toHaveFocus();
    fireEvent.keyDown(next, { key: 'Tab' });
    expect(next).toHaveFocus();
    view.unmount(); expect(outside).toHaveFocus(); outside.remove();
  });
});
