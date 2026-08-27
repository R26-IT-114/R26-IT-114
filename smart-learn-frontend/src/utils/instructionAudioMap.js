/**
 * instructionAudioMap.js
 *
 * Centralised mapping of every dyslexia game route to its pre-recorded
 * Sinhala instruction audio file.
 *
 * Audio files live in:  src/assets/instructions/
 * File naming scheme:   <section>.<sub>.ext  (e.g. 3.1.mpeg = section 3, game 1)
 *
 * Section hierarchy
 * ─────────────────
 *  0        – Dyslexia Home              (home)
 *  1        – ගෙවත්තේ චාරිකාව           (Garden Journey)
 *    1.1      – Garden Card
 *  2        – අකුරු කියමු               (Letters)
 *    2.1      – Letter Listening
 *    2.2      – Letter Pronunciation
 *  3        – අකුරු 2 වචන කියමු        (Two-letter Words)
 *    3.1      – Word Match
 *    3.2      – Letter Sound Match
 *    3.3      – Two Letter Speak
 *  4        – අකුරු තුනේ වචන කියමු     (Three-letter Words)
 *    4.1      – Word Listen Match        ⟵ audio file pending
 *    4.2      – Word Image Match         ⟵ audio file pending
 *    4.3      – Word Speak               ⟵ audio file pending
 *  5        – හපනෙක් වෙමු              (Smart Brain Games)
 *    5.1      – First Letter
 *    5.2      – Rhyme Odd One Out
 *  6        – වචන හදමු                  (Word Building)
 *    6.1      – Drag-to-bucket word build
 *
 * To add a new game:
 *   1. Drop the .mp3 / .mpeg into src/assets/instructions/
 *   2. Add an import below.
 *   3. Add a key → import entry in INSTRUCTION_AUDIO_MAP.
 *   4. Call  useInstructionAudio()  inside the new page component — done.
 */

// ── Static imports (Vite resolves these at build time) ────────────────────────

import audio_home             from '../assets/instructions/0.mpeg';

import audio_gardenCard       from '../assets/instructions/1.1.mp3';

import audio_letterListening  from '../assets/instructions/2.1.mp3';
import audio_letterPronunc    from '../assets/instructions/2.2.mpeg';

import audio_twoLetterWord    from '../assets/instructions/3.1.mpeg';
import audio_letterSoundMatch from '../assets/instructions/3.2.mpeg';
import audio_twoLetterSpeak   from '../assets/instructions/3.3.mpeg';
import audio_threeLetterWords from '../assets/instructions/4.mpeg';

import audio_firstLetter      from '../assets/instructions/5.1.mpeg';
import audio_rhymeOddOneOut   from '../assets/instructions/5.2.mpeg';

import audio_wordBuildBucket  from '../assets/instructions/6.1.mpeg';

// ── Map  (key = route pathname without the leading "/") ──────────────────────

/**
 * INSTRUCTION_AUDIO_MAP
 *
 * Keys match the react-router-dom pathname segments used in routes.jsx,
 * stripped of the leading "/".
 *
 * Values are Vite-resolved asset URLs (strings) ready for `new Audio(url)`.
 * A `null` value means no audio file exists yet for that screen — the hook
 * silently skips playback so the game still works.
 */
export const INSTRUCTION_AUDIO_MAP = {

  // ── 0  Dyslexia Home ───────────────────────────────────────────────────────
  'dyslexia':                        audio_home,

  // ── 1  ගෙවත්තේ චාරිකාව (Garden Journey) ───────────────────────────────────
  'dyslexia/garden-journey':         audio_gardenCard,

  // ── 2  අකුරු කියමු (Letters) ───────────────────────────────────────────────
  'dyslexia/letter-listening':       audio_letterListening,
  'dyslexia/letter-pronunciation':   audio_letterPronunc,

  // ── 3  අකුරු 2 වචන කියමු (Two-letter Words) ───────────────────────────────
  'dyslexia/two-letter-word-match':  audio_twoLetterWord,
  'dyslexia/letter-sound-match':     audio_letterSoundMatch,
  'dyslexia/two-letter-speak':       audio_twoLetterSpeak,
  'dyslexia/two-letter-listen':      audio_twoLetterWord,   // same section intro

  // ── 4  අකුරු තුනේ වචන කියමු (Three-letter Words) ──────────────────────────
  // The section recording is shared until game-specific recordings are added.
  'dyslexia/word-listen-match':      audio_threeLetterWords,
  'dyslexia/word-image-match':       null, // TODO: add word-image-match.mp3
  'dyslexia/word-speak':             null, // TODO: add word-speak.mp3

  // ── 5  හපනෙක් වෙමු (Smart Brain Games) ────────────────────────────────────
  'dyslexia/first-letter':           audio_firstLetter,
  'dyslexia/rhyme-odd-one-out':      audio_rhymeOddOneOut,

  // ── 6  වචන හදමු (Word Building) ────────────────────────────────────────────
  'dyslexia/word-builder':           audio_wordBuildBucket,
};
