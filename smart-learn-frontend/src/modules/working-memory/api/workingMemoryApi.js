import { workingMemoryClient } from '../../../services/axiosInstance';
import { getUserId } from '../utils/userSession';

/**
 * Get userId for API requests (persistent across sessions)
 */
const getAuthUserId = (userId) => userId || getUserId();

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
export const getAllProgress = async (authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const initializeGame = async (gameId, authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const getGameProgress = async (gameId, authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const updateLevelProgress = async (gameId, level, percent, stats = null, authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const completeLevel = async (gameId, level, stats = null, authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const recordAdaptiveResult = async (gameId, metrics = {}, authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const resetAdaptiveProfile = async (gameId, authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
export const resetAllAdaptiveProfiles = async (authenticatedUserId) => {
  try {
    const userId = getAuthUserId(authenticatedUserId);
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
/**
 * Predict shape from an uploaded/captured image
 */
export const predictShape = async (imageFile) => {
  try {
    const formData = new FormData();

    formData.append(
      'image',
      imageFile,
      imageFile.name || 'shape.jpg'
    );

    console.log('Image file:', imageFile);
    console.log('File name:', imageFile.name);
    console.log('File type:', imageFile.type);
    console.log('File size:', imageFile.size);
    console.log('Sending image to /predict-shape');

    const { data } = await workingMemoryClient.post(
      '/predict-shape',
      formData,
      {
        // The backend starts Python and loads the YOLO model for each request.
        // On ordinary laptops this can legitimately take longer than the
        // shared client's 10-second timeout even when prediction succeeds.
        // The first YOLO request loads PyTorch and the model into memory and
        // can take longer than subsequent predictions on ordinary laptops.
        timeout: 60000,
      }
    );

    console.log('Raw prediction response:', data);

    const prediction =
      data?.data ||
      (Array.isArray(data) ? data[0] : data);

    console.log(
      'Extracted prediction:',
      prediction
    );

    if (!prediction || !prediction.shape) {
      return {
        shape: null,
        confidence: 0,
        confidenceLevel: "Not Detected",
      };
    }

    const confidence = Number(
      prediction.confidence || 0
    );

    let confidenceLevel = "Not Detected";

    if (confidence >= 0.8) {
      confidenceLevel = "Very Good";
    } else if (confidence >= 0.7) {
      confidenceLevel = "Good";
    } else if (confidence >= 0.6) {
      confidenceLevel = "Medium";
    } else if (confidence >= 0.4) {
      confidenceLevel = "Low";
    }

    const result = {
      shape: prediction.shape,
      confidence,
      confidenceLevel,
    };

    console.log(
      'Processed prediction:',
      result
    );

    return result;

  } catch (error) {
    console.error(
      'Failed to predict shape:',
      error.message
    );

    console.error(
      'Status:',
      error.response?.status
    );

    console.error(
      'Backend error:',
      error.response?.data
    );

    throw error;
  }
};
