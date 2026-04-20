import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  setPersistence: vi.fn().mockResolvedValue(undefined),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn().mockResolvedValue(undefined),
  getRedirectResult: vi.fn(),
  credentialFromError: vi.fn(),
  credential: vi.fn((idToken, accessToken) => ({
    providerId: 'google.com',
    signInMethod: 'google.com',
    idToken: idToken || '',
    accessToken: accessToken || '',
  })),
}));

vi.mock('firebase/auth', () => {
  class MockGoogleAuthProvider {
    setCustomParameters() {}

    static credentialFromError(error) {
      return mocks.credentialFromError(error);
    }

    static credential(idToken, accessToken) {
      return mocks.credential(idToken, accessToken);
    }
  }

  return {
    createUserWithEmailAndPassword: vi.fn(),
    browserLocalPersistence: { type: 'local' },
    browserSessionPersistence: { type: 'session' },
    getRedirectResult: mocks.getRedirectResult,
    GoogleAuthProvider: MockGoogleAuthProvider,
    onAuthStateChanged: vi.fn(),
    setPersistence: mocks.setPersistence,
    linkWithCredential: vi.fn(),
    linkWithPopup: vi.fn(),
    linkWithRedirect: vi.fn(),
    signInWithRedirect: mocks.signInWithRedirect,
    signInWithPopup: mocks.signInWithPopup,
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn().mockResolvedValue(undefined),
  collection: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => 0),
}));

vi.mock('./firebaseConfig', () => ({
  auth: {},
  db: {},
}));

vi.mock('./firebaseUserProfile', () => ({
  fetchUserProfile: vi.fn().mockResolvedValue(null),
  syncUserProfile: vi.fn().mockResolvedValue(undefined),
}));

import {
  completeGoogleRedirectLogin,
  loginWithGoogle,
} from './firebaseAuth';

const PENDING_GOOGLE_LINK_KEY = 'smartlearn_pending_google_link_v1';

describe('firebaseAuth Google login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it('starts Google sign-in with popup', async () => {
    mocks.signInWithPopup.mockResolvedValueOnce({
      user: {
        uid: 'google-user-1',
        email: 'learner@example.com',
        displayName: 'Learner One',
        photoURL: '',
        providerData: [{ providerId: 'google.com' }],
      },
    });

    const result = await loginWithGoogle(false);

    expect(result).toMatchObject({
      id: 'google-user-1',
      email: 'learner@example.com',
      name: 'Learner One',
      role: 'student',
    });
    expect(mocks.signInWithPopup).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithRedirect).not.toHaveBeenCalled();
    expect(mocks.setPersistence).toHaveBeenCalledTimes(1);
  });

  it('falls back to redirect when popup is blocked', async () => {
    mocks.signInWithPopup.mockRejectedValueOnce({
      code: 'auth/popup-blocked',
    });
    mocks.signInWithRedirect.mockResolvedValueOnce(undefined);

    const result = await loginWithGoogle(true);

    expect(result).toBeNull();
    expect(mocks.signInWithPopup).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithRedirect).toHaveBeenCalledTimes(1);
    expect(mocks.setPersistence).toHaveBeenCalledTimes(2);
  });

  it('falls back to redirect when popup is not supported in the environment', async () => {
    mocks.signInWithPopup.mockRejectedValueOnce({
      code: 'auth/operation-not-supported-in-this-environment',
    });
    mocks.signInWithRedirect.mockResolvedValueOnce(undefined);

    const result = await loginWithGoogle(true);

    expect(result).toBeNull();
    expect(mocks.signInWithPopup).toHaveBeenCalledTimes(1);
    expect(mocks.signInWithRedirect).toHaveBeenCalledTimes(1);
  });

  it('stores pending Google credential when redirect login conflicts by provider', async () => {
    mocks.credentialFromError.mockReturnValueOnce({
      providerId: 'google.com',
      signInMethod: 'google.com',
      accessToken: 'access-1',
      idToken: 'id-1',
    });

    mocks.getRedirectResult.mockRejectedValueOnce({
      code: 'auth/account-exists-with-different-credential',
      customData: { email: 'learner@example.com' },
    });

    await expect(completeGoogleRedirectLogin()).rejects.toThrow(
      'A Google account already exists with a different sign-in method. Please use that method to continue.'
    );

    const pending = JSON.parse(window.sessionStorage.getItem(PENDING_GOOGLE_LINK_KEY));
    expect(pending).toMatchObject({
      email: 'learner@example.com',
      providerId: 'google.com',
      signInMethod: 'google.com',
      accessToken: 'access-1',
      idToken: 'id-1',
    });
  });
});
