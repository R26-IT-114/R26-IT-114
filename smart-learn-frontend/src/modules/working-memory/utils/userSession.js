/**
 * Initialize and manage user session for working memory backend
 * Generates a persistent user ID for tracking progress
 */

const USER_ID_KEY = 'userId';
const SESSION_ID_KEY = 'sessionId';

/**
 * Get or create a persistent user ID
 */
export const getUserId = () => {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate new user ID (format: user-timestamp-random)
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
    console.log(`✅ Created new user ID: ${userId}`);
  }
  
  return userId;
};

/**
 * Get or create a session ID (changes on refresh)
 */
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    console.log(`✅ Created new session ID: ${sessionId}`);
  }
  
  return sessionId;
};

/**
 * Initialize user session on app start
 */
export const initializeUserSession = () => {
  const userId = getUserId();
  const sessionId = getSessionId();
  
  console.log(`📊 User Session - ID: ${userId}, Session: ${sessionId}`);
  
  return { userId, sessionId };
};
