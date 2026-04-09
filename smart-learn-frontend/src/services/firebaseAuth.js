import {
  createUserWithEmailAndPassword,
  browserLocalPersistence,
  browserSessionPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  linkWithCredential,
  linkWithPopup,
  linkWithRedirect,
  signInWithRedirect,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { fetchUserProfile, syncUserProfile } from './firebaseUserProfile';

const LOGIN_EVENTS_COLLECTION = 'loginEvents';
const PENDING_GOOGLE_LINK_KEY = 'smartlearn_pending_google_link_v1';
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const mapAuthErrorMessage = (error) => {
  const code = error?.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please register first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/too-many-requests':
      return 'Too many login attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled in Firebase Authentication.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Popup blocked by browser. Allow popups and try Google sign-in again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Firebase Auth. Add it in Firebase Authentication settings.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Popup login is not supported in this browser. Redirect login will be used.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with a different sign-in method for this email. Sign in with that method first and Google will be linked automatically.';
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    default:
      return 'Authentication failed. Please try again.';
  }
};

const mapFirebaseUser = (firebaseUser, profile = null) => {
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    email: profile?.email || firebaseUser.email || '',
    name: profile?.name || firebaseUser.displayName || '',
    photoURL: profile?.photoURL || firebaseUser.photoURL || '',
    role: profile?.role || 'student',
  };
};

const recordLoginEvent = async (firebaseUser) => {
  if (!firebaseUser) return;

  await addDoc(collection(db, LOGIN_EVENTS_COLLECTION), {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    loggedInAt: serverTimestamp(),
    providerId: firebaseUser.providerData?.[0]?.providerId || 'password',
  });
};

const safeRecordLoginEvent = async (firebaseUser) => {
  try {
    await recordLoginEvent(firebaseUser);
  } catch (eventError) {
    console.warn('Login event write failed:', eventError?.message || eventError);
  }
};

const safeSyncUserProfile = async (firebaseUser) => {
  try {
    await syncUserProfile(firebaseUser);
  } catch (profileError) {
    console.warn('User profile sync failed:', profileError?.message || profileError);
  }
};

const safeFetchUserProfile = async (uid) => {
  try {
    return await fetchUserProfile(uid);
  } catch (profileError) {
    console.warn('User profile fetch failed:', profileError?.message || profileError);
    return null;
  }
};

const readPendingGoogleLink = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_GOOGLE_LINK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writePendingGoogleLink = (payload) => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(PENDING_GOOGLE_LINK_KEY, JSON.stringify(payload));
};

const clearPendingGoogleLink = () => {
  if (typeof window === 'undefined') return;

  window.sessionStorage.removeItem(PENDING_GOOGLE_LINK_KEY);
};

const serializeGoogleCredential = (credential, email) => ({
  email: email || '',
  providerId: credential?.providerId || 'google.com',
  signInMethod: credential?.signInMethod || 'google.com',
  accessToken: credential?.accessToken || '',
  idToken: credential?.idToken || '',
  createdAt: Date.now(),
});

const deserializeGoogleCredential = (payload) => {
  if (!payload) return null;

  const credential = GoogleAuthProvider.credential(payload.idToken || null, payload.accessToken || null);
  return credential;
};

const cachePendingGoogleLinkFromError = (error) => {
  const credential = GoogleAuthProvider.credentialFromError(error);
  const email = error?.customData?.email || error?.email || '';

  if (!credential) return null;

  const payload = serializeGoogleCredential(credential, email);
  writePendingGoogleLink(payload);
  return payload;
};

export const hasPendingGoogleLink = () => Boolean(readPendingGoogleLink());

export const completePendingGoogleLink = async () => {
  const pending = readPendingGoogleLink();

  if (!pending || !auth.currentUser) {
    return null;
  }

  if (pending.email && auth.currentUser.email && pending.email !== auth.currentUser.email) {
    return null;
  }

  const credential = deserializeGoogleCredential(pending);

  if (!credential) {
    clearPendingGoogleLink();
    return null;
  }

  try {
    const linkedCredential = await linkWithCredential(auth.currentUser, credential);
    await safeSyncUserProfile(linkedCredential.user);
    clearPendingGoogleLink();

    const profile = await safeFetchUserProfile(linkedCredential.user.uid);
    return mapFirebaseUser(linkedCredential.user, profile);
  } catch (error) {
    const code = error?.code || '';

    // Do not block normal login if linking fails for any reason.
    // Clear stale/invalid pending credentials so user can continue.
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/credential-already-in-use' ||
      code === 'auth/provider-already-linked' ||
      code === 'auth/no-such-provider'
    ) {
      clearPendingGoogleLink();
    }

    console.warn('Pending Google link failed:', error?.message || error);
    return null;
  }
};

export const linkGoogleAccount = async (rememberMe = true) => {
  try {
    await setAuthPersistenceMode(rememberMe);

    if (!auth.currentUser) {
      throw new Error('You need to sign in first before linking Google.');
    }

    const credential = await linkWithPopup(auth.currentUser, googleProvider);
    await safeSyncUserProfile(credential.user);
    await safeRecordLoginEvent(credential.user);
    const profile = await safeFetchUserProfile(credential.user.uid);
    clearPendingGoogleLink();
    return mapFirebaseUser(credential.user, profile);
  } catch (error) {
    if (shouldFallbackToRedirect(error)) {
      await setAuthPersistenceMode(rememberMe);
      await linkWithRedirect(auth.currentUser, googleProvider);
      return null;
    }

    if (error?.code === 'auth/credential-already-in-use') {
      throw new Error('This Google account is already linked to another account. Use that Google account or remove it first.');
    }

    throw new Error(mapAuthErrorMessage(error));
  }
};

const shouldFallbackToRedirect = (error) => {
  const code = error?.code || '';

  return [
    'auth/popup-blocked',
    'auth/operation-not-supported-in-this-environment',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
  ].includes(code);
};

export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    try {
      const profile = await fetchUserProfile(firebaseUser.uid);
      callback(mapFirebaseUser(firebaseUser, profile));
    } catch {
      callback(mapFirebaseUser(firebaseUser));
    }
  });
};

export const setAuthPersistenceMode = async (rememberMe) => {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
};

export const loginWithEmail = async (email, password, rememberMe = true) => {
  try {
    await setAuthPersistenceMode(rememberMe);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await safeSyncUserProfile(credential.user);
    await safeRecordLoginEvent(credential.user);
    const profile = await safeFetchUserProfile(credential.user.uid);
    return mapFirebaseUser(credential.user, profile);
  } catch (error) {
    throw new Error(mapAuthErrorMessage(error));
  }
};

export const registerWithEmail = async (email, password, rememberMe = true) => {
  try {
    await setAuthPersistenceMode(rememberMe);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await safeSyncUserProfile(credential.user);
    await safeRecordLoginEvent(credential.user);
    const profile = await safeFetchUserProfile(credential.user.uid);
    return mapFirebaseUser(credential.user, profile);
  } catch (error) {
    throw new Error(mapAuthErrorMessage(error));
  }
};

export const loginWithGoogle = async (rememberMe = true) => {
  try {
    await setAuthPersistenceMode(rememberMe);
    const credential = await signInWithPopup(auth, googleProvider);
    await safeSyncUserProfile(credential.user);
    await safeRecordLoginEvent(credential.user);
    clearPendingGoogleLink();
    const profile = await safeFetchUserProfile(credential.user.uid);
    return mapFirebaseUser(credential.user, profile);
  } catch (error) {
    if (shouldFallbackToRedirect(error)) {
      await setAuthPersistenceMode(rememberMe);
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    if (error?.code === 'auth/account-exists-with-different-credential') {
      cachePendingGoogleLinkFromError(error);
      const message =
        'A Google account already exists with a different sign-in method. Please use that method to continue.'
      throw Object.assign(new Error(message), {
        code: error?.code,
        email: error?.customData?.email || error?.email || '',
      });
    }

    throw new Error(mapAuthErrorMessage(error));
  }
};

export const completeGoogleRedirectLogin = async () => {
  try {
    const credential = await getRedirectResult(auth);

    if (!credential?.user) {
      return null;
    }

    await safeSyncUserProfile(credential.user);
    await safeRecordLoginEvent(credential.user);
    clearPendingGoogleLink();
    const profile = await safeFetchUserProfile(credential.user.uid);
    return mapFirebaseUser(credential.user, profile);
  } catch (error) {
    throw new Error(mapAuthErrorMessage(error));
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};
