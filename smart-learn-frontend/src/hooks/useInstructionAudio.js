import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { INSTRUCTION_AUDIO_MAP } from '../utils/instructionAudioMap';

/**
 * useInstructionAudio(key?)
 *
 * Plays the pre-recorded Sinhala instruction audio for the current game
 * screen automatically when the component mounts, and cleans up on unmount.
 *
 * @param {string} [key]
 *   Optional explicit map key (e.g. `'dyslexia/first-letter'`).
 *   When omitted the current URL pathname is used as the lookup key, so
 *   simply calling  useInstructionAudio()  inside any page component is
 *   enough — no argument needed.
 *
 * @returns {{ replay: () => void, stop: () => void }}
 *   replay() – re-triggers the instruction (e.g. on a help-button press).
 *   stop()   – silences the audio immediately (e.g. when a game starts).
 *
 * ─── Usage ──────────────────────────────────────────────────────────────────
 *
 *   // Most common: zero-config auto-play
 *   const { replay, stop } = useInstructionAudio();
 *
 *   // Explicit key (useful for sub-views that don't match the URL):
 *   const { replay } = useInstructionAudio('dyslexia/two-letter-word-match');
 *
 *   // Wire replay to a help button:
 *   <button onClick={replay}>🔊 උපදෙස් නැවත අසන්න</button>
 *
 *   // Silence the instruction once the child starts playing:
 *   <button onClick={() => { stop(); startGame(); }}>▶ ක්‍රීඩාව ආරම්භ කරන්න</button>
 *
 * ─── Adding a new game ───────────────────────────────────────────────────────
 *   1. Add the .mp3/.mpeg to  src/assets/instructions/
 *   2. Import & register it in  src/utils/instructionAudioMap.js
 *   3. Call  useInstructionAudio()  inside the new page — nothing else needed.
 */
// Tracks which audio keys have already auto-played in this session.
// Using a module-level Set means it persists across re-mounts but resets on page refresh.
const autoPlayedKeys = new Set();

const useInstructionAudio = (key) => {
  const location  = useLocation();
  const audioRef  = useRef(null);

  // Strip the leading "/" from the pathname to match map keys
  const resolvedKey = key ?? location.pathname.replace(/^\//, '');
  const audioSrc    = INSTRUCTION_AUDIO_MAP[resolvedKey] ?? null;

  /** Stop and discard the currently playing instance */
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  /**
   * Create a fresh Audio instance and play it.
   * Silently ignores routes that have no audio file yet (null entries).
   * Silently swallows autoplay-policy rejections — the user can trigger
   * replay() via a help button after their first gesture.
   */
  const play = useCallback(() => {
    if (!audioSrc) return;
    stop();
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.play().catch(() => {
      // Browser autoplay policy blocked the call (no prior user gesture).
      // The instruction will play normally when the user calls replay().
    });
  }, [audioSrc, stop]);

  // Auto-play on mount only if this key hasn't played yet in the session
  useEffect(() => {
    if (audioSrc && !autoPlayedKeys.has(resolvedKey)) {
      autoPlayedKeys.add(resolvedKey);
      play();
    }
    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedKey]);

  return { replay: play, stop };
};

export default useInstructionAudio;
