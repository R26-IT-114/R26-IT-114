import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import NumberTracingGameCard from './NumberTracingGameCard';

const CurrentLocation = () => {
  const location = useLocation();
  return <output aria-label="current location">{location.pathname}{location.search}</output>;
};

describe('NumberTracingGameCard', () => {
  it('shows Easy number games immediately and opens the selected digit', () => {
    render(
      <MemoryRouter initialEntries={['/dyscalculia/number-tracing']}>
        <NumberTracingGameCard />
        <CurrentLocation />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(4);

    fireEvent.click(screen.getByRole('listitem', { name: 'අංක 0 ඇඳීම පුහුණු කරන්න' }));
    expect(screen.getByLabelText('current location')).toHaveTextContent(
      '/dyscalculia/number-tracing/0?level=easy'
    );
  });
});
