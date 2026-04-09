import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import useAuth from '../hooks/useAuth';

vi.mock('../hooks/useAuth', () => ({
  default: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('shows loading state while auth is loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAuthLoading: true, user: null });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secure</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Checking session...')).toBeInTheDocument();
  });

  it('renders children when user role is allowed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      user: { role: 'admin' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Secure</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Secure')).toBeInTheDocument();
  });

  it('redirects when role is not allowed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      user: { role: 'student' },
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['admin']}>
          <div>Secure</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secure')).not.toBeInTheDocument();
  });
});
