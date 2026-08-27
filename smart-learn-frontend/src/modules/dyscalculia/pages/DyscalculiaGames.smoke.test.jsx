import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NumberListeningGame from './NumberListeningGame';
import NumberSortingGame from './NumberSortingGame';
import BalloonPopGame from './BalloonPopGame';
import SymbolDetectiveGame from './SymbolDetectiveGame';
import NumberMatchingGame from './NumberMatchingGame';

const renderGame = (Component, path) => render(
  <MemoryRouter initialEntries={[path]}>
    <Component />
  </MemoryRouter>
);

vi.stubGlobal('Audio', class {
  play() { return Promise.resolve(); }
});

describe('Dyscalculia game card routes', () => {
  afterEach(cleanup);

  it('renders Number Listening in Easy mode', () => {
    renderGame(NumberListeningGame, '/dyscalculia/listening-game');
    expect(screen.getByRole('heading', { name: 'අහලා තෝරන්න' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Choose / })).toHaveLength(2);
  });

  it('renders Number Sorting without repeatedly evaluating the untouched board', () => {
    renderGame(NumberSortingGame, '/dyscalculia/number-sorting');
    expect(screen.getByRole('heading', { name: 'අංක අනුපිළිවෙල ක්‍රීඩාව' })).toBeInTheDocument();
    expect(screen.getAllByRole('group', { name: /අංක කාඩ්/ })).toHaveLength(3);
    expect(screen.getByText('කාඩ්පත් නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.')).toBeInTheDocument();
  });

  it('renders Balloon Pop with its start action', () => {
    renderGame(BalloonPopGame, '/dyscalculia/balloon-pop');
    expect(screen.getByRole('button', { name: /ක්‍රීඩාව ආරම්භ කරන්න/ })).toBeInTheDocument();
  });

  it('renders Symbol Detective with its start action', () => {
    renderGame(SymbolDetectiveGame, '/dyscalculia/symbol-detective');
    expect(screen.getByRole('heading', { name: 'සංකේත හඳුනමු' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Detecting/ })).toBeInTheDocument();
  });

  it('renders Number Matching with a playable question', () => {
    renderGame(NumberMatchingGame, '/dyscalculia/number-matching');
    expect(screen.getByText('Choose the group that matches the number')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity choices').children.length).toBe(3);
  });
});
