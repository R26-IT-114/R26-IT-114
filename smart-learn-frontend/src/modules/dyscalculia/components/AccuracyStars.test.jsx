import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AccuracyStars from './AccuracyStars';

describe('AccuracyStars', () => {
  it('shows actual percentage and five-star visual for high confidence', () => {
    render(<AccuracyStars confidence={0.86} />);
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByText('★★★★★')).toBeInTheDocument();
  });

  it('shows filled and unfilled stars for medium confidence', () => {
    render(<AccuracyStars confidence={0.58} />);
    expect(screen.getByText('★★★')).toBeInTheDocument();
    expect(screen.getByText('☆☆')).toBeInTheDocument();
  });
});
