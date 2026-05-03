/**
 * Working Memory Training System - Constants
 */

// Games data with Sinhala translations
export const GAMES_DATA = {
  'sequence-recall': {
    titleSinhala: 'අනුක්‍රම මතක ක්‍රීඩාව',
    descriptionSinhala: 'අංක හෝ වචන අනුපිළිවෙල මතු කරන්න',
    icon: '🔢',
  },
  'reverse-sequence': {
    titleSinhala: 'ප්‍රතිවිරුද්ධ මතක ක්‍රීඩාව',
    descriptionSinhala: 'අනුක්‍රම ප්‍රතිවිපර්යාසයෙන් සිහි ගරු කරන්න',
    icon: '🔄',
  },
  'n-back': {
    titleSinhala: 'N-Back මතක ක්‍රීඩාව',
    descriptionSinhala: 'පෙර සඳහන් සිට සිටම්බරයට ගැලපෙන්න',
    icon: '🎯',
  },
  'matching-pairs': {
    titleSinhala: 'කාඩ් සමාන කිරීමේ ක්‍රීඩාව',
    descriptionSinhala: 'ගැලපෙන කාඩ් ජෝඩු සොයා ගන්න',
    icon: '🧩',
  },
  'instruction-game': {
    titleSinhala: 'උපදෙස් මතක තබා ගැනීම',
    descriptionSinhala: 'බහු පියවරේ උපදෙස් අනුගමනය කරන්න',
    icon: '📋',
  },
  'missing-item': {
    titleSinhala: 'අතුරුදන් වූ දේ සොයන්න',
    descriptionSinhala: 'කුමක් අතුරුදන් වූ නුවන? සොයා ගන්න',
    icon: '🔍',
  },
  'timed-recall': {
    titleSinhala: 'කාල සීමා මතක ක්‍රීඩාව',
    descriptionSinhala: 'සියල්ල ඉක්මනින් සිහි ගරු කරන්න',
    icon: '⏱️',
  },
  'sorting-memory': {
    titleSinhala: 'අනුපිළිවෙලට සකස් කිරීම',
    descriptionSinhala: 'අයිතම නිවැරදි අනුපිළිවෙලට කරන්න',
    icon: '📊',
  },
  'sound-memory': {
    titleSinhala: 'ශබ්ද මතක ක්‍රීඩාව',
    descriptionSinhala: 'ශබ්දවල අනුපිළිවෙල පුනරාවර්තනය කරන්න',
    icon: '🔊',
  },
};

// Pastel colors for game cards
export const PASTEL_COLORS = [
  'bg-pink-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-purple-200',
  'bg-yellow-200',
  'bg-orange-200',
  'bg-red-200',
  'bg-indigo-200',
  'bg-cyan-200',
];

// Sinhala UI text
export const SINHALA_UI = {
  PLAY: 'ක්‍රීඩා කරන්න',
  BACK_HOME: 'ගෙදර යන්න',
  LEVELS: 'අවිසිසි',
  PROGRESS: 'ප්‍රගතිය',
  ALL_GAMES_SHOWN: '🎉 සියලුම ක්‍රීඩා පෙන්වා දී ඇත!',
  NO_GAMES: 'කිසිදු ක්‍රීඩා තොරතුරු නොමැත',
  DAILY_CHALLENGE: '🎉 සැමදා ක්‍රීඩා කරන්න සහ ඉගෙන ගන්න!',
  MEMORY_TRAINING: 'ඉතා재미있는ක්‍රීඩා හරහා ඔබේ මතක ශක්තිය තරඟ කරන්න!',
  SUCCESS: '🎉 සුපිරි! ඔබ මෙම පිළිතුර නිවැරදිව පිළිතුරු දුන්නා!',
  MEMORY_HELPS: '✨ සෑම ක්‍රීඩාවක්ම ඔබේ මතක ශක්තිය සුවඩු කිරීමට උපකාර කරයි',
  TITLE: 'මතක ශක්තිය වර්ධනය කිරීම',
  SUBTITLE: 'ළමයින් සඳහා ක්‍රීඩා මාලාව',
};

// Game levels configuration
export const LEVEL_CONFIG = {
  EASY: { 
    name: 'සරල',
    items: 3,
    timeLimit: 30,
  },
  MEDIUM: {
    name: 'මධ්‍යම',
    items: 5,
    timeLimit: 20,
  },
  HARD: {
    name: 'දුෂ්කර',
    items: 7,
    timeLimit: 15,
  },
  EXPERT: {
    name: 'විශේෂඥ',
    items: 10,
    timeLimit: 10,
  },
};

// Sound effects (optional - for future implementation)
export const SOUND_EFFECTS = {
  CLICK: 'click.mp3',
  SUCCESS: 'success.mp3',
  FAIL: 'fail.mp3',
  LEVEL_UP: 'levelup.mp3',
  UNLOCK: 'unlock.mp3',
};

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  QUICK: 200,
  NORMAL: 500,
  SLOW: 1000,
  CARD_FLIP: 600,
};
