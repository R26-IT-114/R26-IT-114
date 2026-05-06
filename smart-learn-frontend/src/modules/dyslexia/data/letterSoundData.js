/**
 * Letter Sound Match game data — uses /src/assets/images/2letters/
 *
 * Target letters & their 2-letter Sinhala words:
 *   ග — ගස (tree), ගඟ (river)
 *   ක — කහ (yellow), කකුල (foot)
 *   ප — පහ (five),  පස  (soil)
 *   හ — හත (seven), හය  (six),  හිමි (thero)
 *   ඇ — ඇඟ (body)  ← distractor only (level 3)
 */

export const ITEMS = {
  tree:   { id: 'tree',   image: '/src/assets/images/2letters/tree.jpg',   name: 'ගස',   startLetter: 'ග' },
  river:  { id: 'river',  image: '/src/assets/images/2letters/river.jpg',  name: 'ගඟ',   startLetter: 'ග' },
  yellow: { id: 'yellow', image: '/src/assets/images/2letters/yellow.png', name: 'කහ',   startLetter: 'ක' },
  foot:   { id: 'foot',   image: '/src/assets/images/2letters/foot.png',   name: 'කකුල', startLetter: 'ක' },
  five:   { id: 'five',   image: '/src/assets/images/2letters/five.jpg',   name: 'පහ',   startLetter: 'ප' },
  soil:   { id: 'soil',   image: '/src/assets/images/2letters/soil.jpg',   name: 'පස',   startLetter: 'ප' },
  seven:  { id: 'seven',  image: '/src/assets/images/2letters/seven.jpg',  name: 'හත',   startLetter: 'හ' },
  six:    { id: 'six',    image: '/src/assets/images/2letters/six.jpg',    name: 'හය',   startLetter: 'හ' },
  thero:  { id: 'thero',  image: '/src/assets/images/2letters/thero.jpg',  name: 'හිමි', startLetter: 'හ' },
  body:   { id: 'body',   image: '/src/assets/images/2letters/body.jpg',   name: 'ඇඟ',   startLetter: 'ඇ' },
};

/**
 * Questions per level.
 * Each question: { letter, correctId, choices }
 *   letter    — Sinhala letter to display on screen
 *   correctId — key into ITEMS that is the correct answer
 *   choices   — ITEMS keys to show (will be shuffled at runtime)
 */
export const LETTER_SOUND_LEVELS = {
  /** Level 1 — 5 questions, 3 choices, letters ග and ප (simplest) */
  1: [
    { letter: 'ග', correctId: 'tree',   choices: ['tree',   'five',  'yellow'] },
    { letter: 'ප', correctId: 'five',   choices: ['five',   'tree',  'seven']  },
    { letter: 'ග', correctId: 'river',  choices: ['river',  'soil',  'six']    },
    { letter: 'ප', correctId: 'soil',   choices: ['soil',   'river', 'yellow'] },
    { letter: 'ක', correctId: 'yellow', choices: ['yellow', 'five',  'tree']   },
  ],

  /** Level 2 — 6 questions, 4 choices, letters ග ක ප */
  2: [
    { letter: 'ග', correctId: 'tree',   choices: ['tree',   'five',  'yellow', 'seven'] },
    { letter: 'ක', correctId: 'yellow', choices: ['yellow', 'soil',  'six',    'tree']  },
    { letter: 'ප', correctId: 'five',   choices: ['five',   'tree',  'seven',  'yellow']},
    { letter: 'ක', correctId: 'foot',   choices: ['foot',   'river', 'five',   'thero'] },
    { letter: 'ග', correctId: 'river',  choices: ['river',  'soil',  'six',    'foot']  },
    { letter: 'ප', correctId: 'soil',   choices: ['soil',   'tree',  'seven',  'yellow']},
  ],

  /** Level 3 — 8 questions, 4 choices, letters ග ක ප හ (harder distractors) */
  3: [
    { letter: 'හ', correctId: 'seven',  choices: ['seven',  'tree',  'five',   'foot']   },
    { letter: 'ග', correctId: 'tree',   choices: ['tree',   'six',   'soil',   'body']   },
    { letter: 'ප', correctId: 'five',   choices: ['five',   'thero', 'river',  'seven']  },
    { letter: 'ක', correctId: 'yellow', choices: ['yellow', 'soil',  'six',    'thero']  },
    { letter: 'හ', correctId: 'six',    choices: ['six',    'tree',  'five',   'foot']   },
    { letter: 'ග', correctId: 'river',  choices: ['river',  'seven', 'soil',   'yellow'] },
    { letter: 'ප', correctId: 'soil',   choices: ['soil',   'body',  'thero',  'tree']   },
    { letter: 'ක', correctId: 'foot',   choices: ['foot',   'six',   'river',  'five']   },
  ],
};