/**
 * Letter Sound Match game data — uses /src/assets/images/2letters/
 * All items have pre-recorded audio files (no TTS fallback needed).
 *
 *   ග — ගස (tree)    → gasa.wav
 *   ක — කහ (yellow)  → kaha.wav
 *   ප — පහ (five)    → paha.wav
 *   ප — පස (soil)    → pasa.wav
 *   හ — හත (seven)   → hatha.wav
 *   හ — හය (six)     → haya.wav
 *   ඇ — ඇඟ (body)    ← distractor only (level 3)
 */

export const ITEMS = {
  tree:   { id: 'tree',   image: '/src/assets/images/2letters/tree.jpg',   name: 'ගස', startLetter: 'ග' },
  yellow: { id: 'yellow', image: '/src/assets/images/2letters/yellow.png', name: 'කහ', startLetter: 'ක' },
  five:   { id: 'five',   image: '/src/assets/images/2letters/five.jpg',   name: 'පහ', startLetter: 'ප' },
  soil:   { id: 'soil',   image: '/src/assets/images/2letters/soil.jpg',   name: 'පස', startLetter: 'ප' },
  seven:  { id: 'seven',  image: '/src/assets/images/2letters/seven.jpg',  name: 'හත', startLetter: 'හ' },
  six:    { id: 'six',    image: '/src/assets/images/2letters/six.jpg',    name: 'හය', startLetter: 'හ' },
  body:   { id: 'body',   image: '/src/assets/images/2letters/body.jpg',   name: 'ඇඟ', startLetter: 'ඇ' },
};

/**
 * Questions per level.
 * Each question: { letter, correctId, choices }
 *   letter    — Sinhala letter shown on screen
 *   correctId — key into ITEMS that is the correct answer
 *   choices   — ITEMS keys to show (will be shuffled at runtime)
 */
export const LETTER_SOUND_LEVELS = {
  /** Level 1 — 4 questions, 3 choices */
  1: [
    { letter: 'ග', correctId: 'tree',   choices: ['tree',   'five',   'yellow'] },
    { letter: 'ප', correctId: 'five',   choices: ['five',   'tree',   'seven']  },
    { letter: 'ප', correctId: 'soil',   choices: ['soil',   'six',    'yellow'] },
    { letter: 'ක', correctId: 'yellow', choices: ['yellow', 'five',   'tree']   },
  ],

  /** Level 2 — 4 questions, 4 choices */
  2: [
    { letter: 'ග', correctId: 'tree',   choices: ['tree',   'five',  'yellow', 'seven'] },
    { letter: 'ක', correctId: 'yellow', choices: ['yellow', 'soil',  'six',    'tree']  },
    { letter: 'ප', correctId: 'five',   choices: ['five',   'tree',  'seven',  'yellow'] },
    { letter: 'ප', correctId: 'soil',   choices: ['soil',   'tree',  'seven',  'yellow'] },
  ],

  /** Level 3 — 6 questions, 4 choices, all 6 audio-backed items + body distractor */
  3: [
    { letter: 'හ', correctId: 'seven',  choices: ['seven',  'tree',  'five',  'soil']  },
    { letter: 'ග', correctId: 'tree',   choices: ['tree',   'six',   'soil',  'body']  },
    { letter: 'ප', correctId: 'five',   choices: ['five',   'soil',  'six',   'seven'] },
    { letter: 'ක', correctId: 'yellow', choices: ['yellow', 'soil',  'six',   'seven'] },
    { letter: 'හ', correctId: 'six',    choices: ['six',    'tree',  'five',  'soil']  },
    { letter: 'ප', correctId: 'soil',   choices: ['soil',   'body',  'six',   'tree']  },
  ],
};