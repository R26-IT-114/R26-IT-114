/**
 * Initialize and manage user session for working memory backend
 * Prefers the Firebase Authentication UID when a user is signed in.
 * Falls back to a persistent anonymous localStorage ID only when no
 * Firebase user is available (e.g. offline or before sign-in).
 */

import { getAuth } from 'firebase/auth';

const ANON_USER_ID_KEY = 'wmAnonUserId';
const SESSION_ID_KEY = 'sessionId';

/**
 * Get userId for API requests.
 * Returns Firebase UID when signed in, otherwise a stable anonymous ID.
 */
export const getUserId = () => {
  // Prefer the real Firebase UID
  const firebaseUid = getAuth().currentUser?.uid;
  if (firebaseUid) return firebaseUid;

  // Fallback: stable anonymous ID stored in localStorage
  let anonId = localStorage.getItem(ANON_USER_ID_KEY);
  if (!anonId) {
    anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(ANON_USER_ID_KEY, anonId);
  }
  return anonId;
};

/**
 * Get or create a session ID (changes on page refresh).
 * Kept for any future session-level analytics.
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};
