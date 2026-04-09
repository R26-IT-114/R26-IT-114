import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminRecommendations from './AdminRecommendations';

const mockListProfiles = vi.fn();
const mockUpdateRecommendations = vi.fn();
const mockUpdateRole = vi.fn();
const mockAudit = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  default: () => ({ user: { id: 'admin-1', role: 'admin' } }),
}));

vi.mock('../services/firebaseUserProfile', () => ({
  DEFAULT_RECOMMENDATIONS: [],
  VALID_RECOMMENDATION_PATHS: ['/dyslexia', '/dysgraphia', '/dyscalculia', '/working-memory'],
  MAX_RECOMMENDATIONS_PER_USER: 4,
  listUserProfiles: () => mockListProfiles(),
  updateUserRecommendations: (...args) => mockUpdateRecommendations(...args),
  updateUserRole: (...args) => mockUpdateRole(...args),
  createAdminAuditLog: (...args) => mockAudit(...args),
}));

vi.mock('../services/telemetry', () => ({
  logTelemetryError: vi.fn(),
}));

describe('AdminRecommendations', () => {
  beforeEach(() => {
    mockListProfiles.mockResolvedValue([
      {
        uid: 'u-1',
        email: 'student@test.com',
        name: 'Student One',
        role: 'student',
        recommendations: [{ label: 'Dyslexia', path: '/dyslexia', reason: 'help' }],
      },
    ]);

    mockUpdateRecommendations.mockResolvedValue([
      { label: 'Dysgraphia', path: '/dysgraphia', reason: 'writing' },
    ]);

    mockUpdateRole.mockResolvedValue('therapist');
    mockAudit.mockResolvedValue(undefined);
  });

  it('shows validation error for invalid recommendation path', async () => {
    render(<AdminRecommendations />);

    await waitFor(() => {
      expect(screen.getByText('student@test.com')).toBeInTheDocument();
    });

    const textarea = screen.getByRole('textbox');
    await waitFor(() => {
      expect(textarea).toHaveValue('Dyslexia | /dyslexia | help');
    });

    fireEvent.change(textarea, {
      target: { value: 'Invalid | /invalid-path | reason' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save recommendations' }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid module paths detected/)).toBeInTheDocument();
    });
    expect(mockUpdateRecommendations).not.toHaveBeenCalled();
  });

  it('saves recommendations and writes an audit log', async () => {
    render(<AdminRecommendations />);

    await waitFor(() => {
      expect(screen.getByText('student@test.com')).toBeInTheDocument();
    });

    const textarea = screen.getByRole('textbox');
    await waitFor(() => {
      expect(textarea).toHaveValue('Dyslexia | /dyslexia | help');
    });

    fireEvent.change(textarea, {
      target: { value: 'Dysgraphia | /dysgraphia | writing support' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save recommendations' }));

    await waitFor(() => {
      expect(mockUpdateRecommendations).toHaveBeenCalled();
      expect(mockAudit).toHaveBeenCalled();
    });
  });
});
