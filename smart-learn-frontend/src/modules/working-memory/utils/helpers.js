/**
 * Working Memory Training System - Helper Functions
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate random numbers between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} count - How many numbers to generate
 * @returns {Array<number>} - Array of random numbers
 */
export const generateRandomNumbers = (min, max, count) => {
  const numbers = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return numbers;
};

/**
 * Generate random colors from a palette
 * @param {Array<string>} colorPalette - Array of color values
 * @param {number} count - How many colors to generate
 * @returns {Array<string>} - Array of random colors
 */
export const generateRandomColors = (colorPalette, count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
  }
  return colors;
};

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Calculate score based on time taken and difficulty
 * @param {number} timeTaken - Time taken in seconds
 * @param {number} difficulty - Difficulty level (1-4)
 * @param {number} maxTime - Maximum time allowed
 * @returns {number} - Calculated score (0-100)
 */
export const calculateScore = (timeTaken, difficulty, maxTime = 60) => {
  const timeBonus = Math.max(0, 100 - (timeTaken / maxTime) * 100);
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.25;
  return Math.round(timeBonus * difficultyMultiplier);
};

/**
 * Get success message based on score
 * @param {number} score - Score (0-100)
 * @returns {string} - Success message in Sinhala
 */
export const getSuccessMessage = (score) => {
  if (score >= 90) return '🏆 අසාරණ! ඔබ හරිම දක්ෂ!';
  if (score >= 75) return '⭐ ඉතා හොඳ! නැවතත් උත්සාහ කරන්න!';
  if (score >= 60) return '👍 හොඳ වැඩ ක්‍රම! තව පුහුණු වන්න!';
  if (score >= 45) return '📚 කරුණාකර නැවතත් උත්සාහ කරන්න!';
  return '💪 ක්‍රීඩා කරන්න සහ ඉගෙන ගන්න!';
};

/**
 * Create a grid layout based on width
 * @param {number} width - Container width in pixels
 * @returns {number} - Number of columns
 */
export const getGridColumns = (width) => {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  return 3;
};

/**
 * Check if an array contains duplicates
 * @param {Array} array - Array to check
 * @returns {boolean} - True if array has duplicates
 */
export const hasDuplicates = (array) => {
  return new Set(array).size !== array.length;
};

/**
 * Get unique items from array maintaining order
 * @param {Array} array - Array to filter
 * @returns {Array} - Array with unique items
 */
export const getUniqueItems = (array) => {
  return [...new Set(array)];
};

/**
 * Delay execution (for animations/transitions)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate if number is in range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - True if value is in range
 */
export const isInRange = (value, min, max) => value >= min && value <= max;

/**
 * Convert array to chunks
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array<Array>} - Array of chunks
 */
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Generate Sinhala numbers for display
 * @param {number} count - How many Sinhala numerals to generate
 * @returns {Array<string>} - Array of Sinhala numerals
 */
export const generateSinhalaNumerals = (count) => {
  const sinhalaNumerals = ['෦', '෧', '෨', '෩', '෪', '෫', '෬', '෭', '෮', '෯'];
  const numerals = [];
  for (let i = 0; i < count; i++) {
    numerals.push(sinhalaNumerals[i % 10]);
  }
  return numerals;
};

/**
 * Play sound effect (placeholder for sound implementation)
 * @param {string} soundName - Name of the sound effect
 */
export const playSound = (soundName) => {
  // TODO: Implement sound playback
  console.log(`Playing sound: ${soundName}`);
};

/**
 * Trigger haptic feedback (mobile/device)
 * @param {number} duration - Duration of vibration in ms (default: 50)
 */
export const triggerHaptic = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

/**
 * Get random emoji from a set
 * @param {Array<string>} emojis - Array of emojis
 * @returns {string} - Random emoji
 */
export const getRandomEmoji = (emojis) => {
  return emojis[Math.floor(Math.random() * emojis.length)];
};

/**
 * Create confetti animation data
 * @param {number} count - Number of confetti pieces
 * @returns {Array} - Array of confetti objects
 */
export const generateConfetti = (count = 50) => {
  const confetti = [];
  for (let i = 0; i < count; i++) {
    confetti.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
    });
  }
  return confetti;
};
