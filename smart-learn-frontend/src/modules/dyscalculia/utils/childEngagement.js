export const MODE = {
  DEFAULT: 'default',
  CALM: 'calm',
  REDUCED_MOTION: 'reducedMotion',
};

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getEngagementMode = ({ explicitMode }) => {
  if (explicitMode && explicitMode !== MODE.DEFAULT) return explicitMode;
  return prefersReducedMotion() ? MODE.REDUCED_MOTION : MODE.DEFAULT;
};

export const clamp01 = (n) => Math.min(1, Math.max(0, n));

export const getMotivationalMessageSi = ({ correct, severityLevel, streak = 0, weakCount = 0 }) => {
  if (correct) {
    const pool = [
      'හොඳයි! ⭐',
      'ඔයාට පුළුවන්! 🎉',
      'සුපිරි වැඩක්! 🚀',
      'ජය වේවා! ✨',
      'ඔයා විශිෂ්ටයි! 🎈',
    ];
    if (streak >= 5) return pool[3];
    if (severityLevel === 'Severe') return pool[1];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = [
    'හරි, ආයෙත් උත්සාහ කරමු 😊',
    'තව ටිකක් බලමු 🎈',
    'ඔයාට මේක කරන්න පුළුවන් ⭐',
    'කාලෙකට පස්සේ තවත් උත්සාහ කරමු 🌸',
    'හිත නොහාරන්න! අපිට පුළුවන් 💛',
  ];
  if (severityLevel === 'Severe' || weakCount >= 2) return pool[0];
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getFeedbackVariants = ({ correct, mode }) => {
  const reduced = mode === MODE.REDUCED_MOTION;
  return {
    overlayEmoji: correct ? '🎉✨🌟' : '💪🎈✨',
    overlayClass: correct ? 'success' : 'wrong',
    showConfetti: !!(correct && !reduced),
    showShake: !!(!correct && !reduced),
    confettiPieces: correct ? (reduced ? 25 : 50) : 0,
    retryDelayMs: reduced ? 1400 : 2000,
  };
};

export const getAchievementName = ({ earned, scenario }) => {
  if (!earned) return null;
  const map = {
    number_master: 'Number Master',
    fast_learner: 'Fast Learner',
    tracing_star: 'Tracing Star',
    counting_hero: 'Counting Hero',
  };
  return map[scenario] || 'Math Explorer';
};
