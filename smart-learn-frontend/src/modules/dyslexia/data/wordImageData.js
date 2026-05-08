/**
 * Word-Image Match game data
 * All images live in /src/assets/images/3letters/
 *
 * Word → image mapping:
 *   යහන  → bed.jpg   (bed)
 *   පහන  → lamp.jpg  (lamp)
 *   නහය  → nose.jpg  (nose)
 *   කසය  → rope.png  (rope)
 *   පනහ  → fifty.jpg (fifty)
 *   ගඟන  → sky.jpg   (sky)
 *   නයන  → eyes.jpg  (eyes)
 */

export const WORDS_MAP = {
  bed:   { id: 'bed',   word: 'යහන',  image: '/src/assets/images/3letters/bed.jpg'   },
  lamp:  { id: 'lamp',  word: 'පහන',  image: '/src/assets/images/3letters/lamp.jpg'  },
  nose:  { id: 'nose',  word: 'කඩය',  image: '/src/assets/images/3letters/nose.jpg'  },
  rope:  { id: 'rope',  word: 'කසය',  image: '/src/assets/images/3letters/rope.png'  },
  fifty: { id: 'fifty', word: 'පනහ',  image: '/src/assets/images/3letters/fifty.jpg' },
  sky:   { id: 'sky',   word: 'අහස',  image: '/src/assets/images/3letters/sky.jpg'   },
  eyes:  { id: 'eyes',  word: 'නයන',  image: '/src/assets/images/3letters/eyes.jpg'  },
};

/**
 * Questions per level.
 * Each question: { wordId, choices }
 *   wordId  — key in WORDS_MAP that is the correct answer
 *   choices — WORDS_MAP keys to display as image options (will be shuffled)
 */
export const WORD_IMAGE_LEVELS = {
  /** Level 1 — 4 questions, 3 image choices */
  1: [
    { wordId: 'bed',   choices: ['bed',   'lamp',  'nose']  },
    { wordId: 'lamp',  choices: ['lamp',  'rope',  'eyes']  },
    { wordId: 'nose',  choices: ['nose',  'fifty', 'bed']   },
    { wordId: 'sky',   choices: ['sky',   'lamp',  'rope']  },
  ],

  /** Level 2 — 5 questions, 4 image choices */
  2: [
    { wordId: 'rope',  choices: ['rope',  'bed',   'nose',  'sky']  },
    { wordId: 'fifty', choices: ['fifty', 'lamp',  'eyes',  'nose'] },
    { wordId: 'eyes',  choices: ['eyes',  'rope',  'sky',   'bed']  },
    { wordId: 'bed',   choices: ['bed',   'fifty', 'nose',  'lamp'] },
    { wordId: 'lamp',  choices: ['lamp',  'eyes',  'sky',   'rope'] },
  ],

  /** Level 3 — 7 questions, 4 image choices (all words used) */
  3: [
    { wordId: 'sky',   choices: ['sky',   'bed',   'rope',  'eyes']  },
    { wordId: 'nose',  choices: ['nose',  'fifty', 'sky',   'lamp']  },
    { wordId: 'fifty', choices: ['fifty', 'rope',  'eyes',  'bed']   },
    { wordId: 'eyes',  choices: ['eyes',  'sky',   'nose',  'rope']  },
    { wordId: 'rope',  choices: ['rope',  'lamp',  'fifty', 'nose']  },
    { wordId: 'bed',   choices: ['bed',   'eyes',  'sky',   'fifty'] },
    { wordId: 'lamp',  choices: ['lamp',  'nose',  'rope',  'sky']   },
  ],
};