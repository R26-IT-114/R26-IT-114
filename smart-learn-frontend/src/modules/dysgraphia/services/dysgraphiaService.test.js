import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  createSession: vi.fn(),
  getCatalog: vi.fn(),
  getOverview: vi.fn(),
  getRecentActivity: vi.fn(),
  predictHandwritingLetter: vi.fn(),
  resetProgress: vi.fn(),
  submitInterventionAttempt: vi.fn(),
  submitLetterAttempt: vi.fn(),
  submitLetterPracticeAttempt: vi.fn(),
  submitMirrorLetterAttempt: vi.fn(),
  submitShapeAttempt: vi.fn(),
  submitWordAttempt: vi.fn(),
  submitWritingLineAttempt: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  currentUser: { uid: 'user-1' },
}));

vi.mock('../api/dysgraphiaApi', () => api);
vi.mock('../../../services/firebaseConfig', () => ({ auth }));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const loadService = async () => {
  const module = await import('./dysgraphiaService');
  return module.dysgraphiaService;
};

describe('dysgraphiaService overview requests', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(api).forEach((mock) => mock.mockReset());
    auth.currentUser = { uid: 'user-1' };
  });

  it('deduplicates simultaneous same-user calls, including Strict Mode-style duplicate effects', async () => {
    const pending = deferred();
    api.getOverview.mockReturnValueOnce(pending.promise);
    const service = await loadService();

    const first = service.getOverview();
    const second = service.getOverview();

    expect(first).toBe(second);
    expect(api.getOverview).toHaveBeenCalledTimes(1);

    const overview = { stats: { totalStars: 4 } };
    pending.resolve(overview);
    await expect(Promise.all([first, second])).resolves.toEqual([overview, overview]);
    expect(service.getCachedOverview()).toBe(overview);
  });

  it('clears a failed in-flight request so a later call can retry', async () => {
    const failure = new Error('network failed');
    const overview = { stats: { totalStars: 5 } };
    api.getOverview.mockRejectedValueOnce(failure).mockResolvedValueOnce(overview);
    const service = await loadService();

    await expect(service.getOverview()).rejects.toBe(failure);
    await expect(service.getOverview()).resolves.toBe(overview);
    expect(api.getOverview).toHaveBeenCalledTimes(2);
  });

  it('keeps completed data cached while later intentional refreshes fetch fresh data', async () => {
    const firstOverview = { stats: { totalStars: 1 } };
    const refreshedOverview = { stats: { totalStars: 2 } };
    api.getOverview.mockResolvedValueOnce(firstOverview).mockResolvedValueOnce(refreshedOverview);
    const service = await loadService();

    await service.getOverview();
    expect(service.getCachedOverview()).toBe(firstOverview);

    await service.getOverview();
    expect(api.getOverview).toHaveBeenCalledTimes(2);
    expect(service.getCachedOverview()).toBe(refreshedOverview);
  });

  it('prevents an older overview request from overwriting a handwriting update', async () => {
    const staleRequest = deferred();
    const staleOverview = { stats: { totalStars: 1 } };
    const updatedOverview = { stats: { totalStars: 8 } };
    api.getOverview.mockReturnValueOnce(staleRequest.promise);
    api.submitLetterAttempt.mockResolvedValueOnce({ overviewSummary: updatedOverview });
    const service = await loadService();

    const oldResult = service.getOverview();
    await service.submitLetterAttempt({ letterId: 'ta' });
    expect(service.getCachedOverview()).toBe(updatedOverview);

    staleRequest.resolve(staleOverview);
    await expect(oldResult).resolves.toBe(staleOverview);
    expect(service.getCachedOverview()).toBe(updatedOverview);
  });

  it('isolates cached and in-flight data when the authenticated user changes', async () => {
    const firstUserRequest = deferred();
    const secondUserRequest = deferred();
    api.getOverview
      .mockReturnValueOnce(firstUserRequest.promise)
      .mockReturnValueOnce(secondUserRequest.promise);
    const service = await loadService();

    const firstUserResult = service.getOverview();
    auth.currentUser = { uid: 'user-2' };
    expect(service.getCachedOverview()).toBeNull();
    const secondUserResult = service.getOverview();
    expect(api.getOverview).toHaveBeenCalledTimes(2);

    firstUserRequest.resolve({ owner: 'user-1' });
    await expect(firstUserResult).rejects.toMatchObject({ code: 'AUTH_SCOPE_CHANGED' });
    expect(service.getCachedOverview()).toBeNull();

    const secondOverview = { owner: 'user-2' };
    secondUserRequest.resolve(secondOverview);
    await expect(secondUserResult).resolves.toBe(secondOverview);
    expect(service.getCachedOverview()).toBe(secondOverview);

    auth.currentUser = null;
    expect(service.getCachedOverview()).toBeNull();
  });

  it('refreshes after session creation and clears cache after progress reset', async () => {
    const initialOverview = { stats: { sessionsCompleted: 0 } };
    const sessionOverview = { stats: { sessionsCompleted: 1 } };
    api.getOverview.mockResolvedValueOnce(initialOverview).mockResolvedValueOnce(sessionOverview);
    api.createSession.mockResolvedValueOnce({ sessionId: 'session-1' });
    api.resetProgress.mockResolvedValueOnce({ ok: true });
    const service = await loadService();

    await service.getOverview();
    await service.createSession({ activityType: 'letter' });
    expect(api.getOverview).toHaveBeenCalledTimes(2);
    expect(service.getCachedOverview()).toBe(sessionOverview);

    await service.resetProgress();
    expect(service.getCachedOverview()).toBeNull();
  });
});
