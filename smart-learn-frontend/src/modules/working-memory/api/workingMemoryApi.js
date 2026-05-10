import { workingMemoryClient } from '../../../services/axiosInstance';
import { getUserId } from '../utils/userSession';

/**
 * Get userId for API requests (persistent across sessions)
 */
const getAuthUserId = () => {
  return getUserId();
};

/**
 * Get all available games
 */
export const getGames = async () => {
  try {
    const { data } = await workingMemoryClient.get('/games');
    return data;
  } catch (error) {
    console.error('Failed to fetch games:', error.message);
    throw error;
  }
};

/**
 * Get all progress for current user
 */
export const getAllProgress = async () => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.get('/progress', {
      params: { userId },
      headers: { 'x-user-id': userId }
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch all progress:', error.message);
    throw error;
  }
};

/**
 * Initialize a game for current user
 */
export const initializeGame = async (gameId) => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.post(`/progress/${gameId}/initialize`, {
      userId,
    });
    return data;
  } catch (error) {
    console.error(`Failed to initialize game ${gameId}:`, error.message);
    throw error;
  }
};

/**
 * Get progress for a specific game
 */
export const getGameProgress = async (gameId) => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.get(`/progress/${gameId}`, {
      params: { userId },
      headers: { 'x-user-id': userId }
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch progress for ${gameId}:`, error.message);
    throw error;
  }
};

/**
 * Update level progress
 */
export const updateLevelProgress = async (gameId, level, percent, stats = null) => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.post(`/progress/${gameId}/level-progress`, {
      userId,
      level,
      percent,
      stats,
    });
    return data;
  } catch (error) {
    console.error(`Failed to update level progress for ${gameId}:`, error.message);
    throw error;
  }
};

/**
 * Complete a level
 */
export const completeLevel = async (gameId, level, stats = null) => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.post(`/progress/${gameId}/complete-level`, {
      userId,
      level,
      stats,
    });
    return data;
  } catch (error) {
    console.error(`Failed to complete level for ${gameId}:`, error.message);
    throw error;
  }
};

/**
 * Record an adaptive result
 */
export const recordAdaptiveResult = async (gameId, metrics = {}) => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.post(`/progress/${gameId}/result`, {
      userId,
      metrics,
    });
    return data;
  } catch (error) {
    console.error(`Failed to record result for ${gameId}:`, error.message);
    throw error;
  }
};

/**
 * Reset adaptive profile for a game
 */
export const resetAdaptiveProfile = async (gameId) => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.post(`/progress/${gameId}/reset-adaptive`, {
      userId,
    });
    return data;
  } catch (error) {
    console.error(`Failed to reset adaptive profile for ${gameId}:`, error.message);
    throw error;
  }
};

/**
 * Reset all adaptive profiles
 */
export const resetAllAdaptiveProfiles = async () => {
  try {
    const userId = getAuthUserId();
    const { data } = await workingMemoryClient.post('/progress/reset-all-adaptive', {
      userId,
    });
    return data;
  } catch (error) {
    console.error('Failed to reset all adaptive profiles:', error.message);
    throw error;
  }
};

/**
 * Get overview (legacy)
 */
export const getWorkingMemoryOverview = async () => {
  try {
    const { data } = await workingMemoryClient.get('/overview');
    return data;
  } catch (error) {
    console.warn('Overview endpoint not available, using local data');
    throw error;
  }
};
