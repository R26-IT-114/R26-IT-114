import { speakSinhala } from './audioGuide';

// Lightweight audio manager to prevent overlapping TTS/speech.
// SAFE Phase-1: API is intentionally small to avoid touching game logic flow.

const audioState = {
  currentAudioKey: null,
  currentAudio: null,
};

const stopCurrentAudio = () => {
  try {
    if (audioState.currentAudio && typeof audioState.currentAudio.pause === 'function') {
      audioState.currentAudio.pause();
      audioState.currentAudio.currentTime = 0;
    }
  } catch {
    // ignore
  } finally {
    audioState.currentAudio = null;
    audioState.currentAudioKey = null;
  }
};

export const playNumberAudio = async ({ src, speechText }) => {
  // If we have an audio src, play it; otherwise fall back to speech synthesis.
  try {
    stopCurrentAudio();

    if (src) {
      const audio = new Audio(src);
      audioState.currentAudio = audio;
      audioState.currentAudioKey = src;
      await audio.play();
      return;
    }

    if (speechText) {
      speakSinhala(speechText);
    }
  } catch {
    // Fallback to speech synthesis when HTMLAudio fails.
    if (speechText) speakSinhala(speechText);
  }
};

export const playPositiveChime = async ({ src, speechText }) => {
  // positive sound should also not overlap with number TTS
  try {
    stopCurrentAudio();

    if (src) {
      const audio = new Audio(src);
      audioState.currentAudio = audio;
      audioState.currentAudioKey = src;
      await audio.play();
      return;
    }

    if (speechText) speakSinhala(speechText);
  } catch {
    if (speechText) speakSinhala(speechText);
  }
};

export const playRetryChime = async ({ src, speechText }) => {
  try {
    stopCurrentAudio();

    if (src) {
      const audio = new Audio(src);
      audioState.currentAudio = audio;
      audioState.currentAudioKey = src;
      await audio.play();
      return;
    }

    if (speechText) speakSinhala(speechText);
  } catch {
    if (speechText) speakSinhala(speechText);
  }
};

