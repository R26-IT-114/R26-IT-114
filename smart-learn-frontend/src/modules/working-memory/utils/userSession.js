/**
 * User session utilities for Working Memory
 * Uses Firebase Authentication UID as the ONLY user ID.
 */

import { getAuth } from 'firebase/auth';

const SESSION_ID_KEY = 'sessionId';

/**
 * Get the authenticated Firebase user ID.
 *
 * Returns:
 *   Firebase UID when a user is signed in.
 *
 * Throws:
 *   Error when no Firebase user is authenticated.
 */
export const getUserId = () => {
  const firebaseUid = getAuth().currentUser?.uid;

  if (!firebaseUid) {
    throw new Error('No authenticated Firebase user found.');
  }

  return firebaseUid;
};

/**
 * Get or create a session ID.
 * This is separate from the Firebase user ID.
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
};