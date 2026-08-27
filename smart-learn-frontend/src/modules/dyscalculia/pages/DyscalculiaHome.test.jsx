import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import DyscalculiaHome from './DyscalculiaHome';

const CurrentPath = () => {
  const location = useLocation();
  return <output aria-label="current path">{location.pathname}</output>;
};

describe('DyscalculiaHome', () => {
  it('shows every available game and navigates to the selected game', () => {
    render(
      <MemoryRouter initialEntries={['/dyscalculia']}>
        <DyscalculiaHome />
        <CurrentPath />
      </MemoryRouter>
    );

    const gameButtons = screen.getAllByRole('button', { name: /^Play / });
    expect(gameButtons).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: 'Play Number Listening' }));
    expect(screen.getByLabelText('current path')).toHaveTextContent('/dyscalculia/listening-game');
  });
});
