/**
 * Two-letter Sinhala word data for the Listen-and-Match game.
 * Images live in /src/assets/images/2letters/
 */

export const TWO_LETTER_WORDS = {
  gas:  { id: 'gas',  word: 'ගස',  image: '/src/assets/images/2letters/tree.jpg'   },
  gang: { id: 'gang', word: 'ගඟ',  image: '/src/assets/images/2letters/river.jpg'  },
  kaha: { id: 'kaha', word: 'කහ',  image: '/src/assets/images/2letters/yellow.png' },
  paha: { id: 'paha', word: 'පහ',  image: '/src/assets/images/2letters/five.jpg'   },
  haya: { id: 'haya', word: 'හය',  image: '/src/assets/images/2letters/six.jpg'    },
  hath: { id: 'hath', word: 'හත',  image: '/src/assets/images/2letters/seven.jpg'  },
  paya: { id: 'paya', word: 'පය',  image: '/src/assets/images/2letters/foot.png'   },
  pasa: { id: 'pasa', word: 'පස',  image: '/src/assets/images/2letters/soil.jpg'   },
};

export const TWO_LETTER_LEVELS = {
  /** Level 1 — 4 questions, 3 image choices */
  1: [
    { wordId: 'gas',  choices: ['gas',  'gang', 'paha'] },
    { wordId: 'kaha', choices: ['kaha', 'paya', 'hath'] },
    { wordId: 'haya', choices: ['haya', 'gas',  'pasa'] },
    { wordId: 'paya', choices: ['paya', 'hath', 'gang'] },
  ],
  /** Level 2 — 5 questions, 4 image choices */
  2: [
    { wordId: 'gang', choices: ['gang', 'gas',  'kaha', 'pasa'] },
    { wordId: 'paha', choices: ['paha', 'haya', 'paya', 'hath'] },
    { wordId: 'hath', choices: ['hath', 'kaha', 'gas',  'gang'] },
    { wordId: 'pasa', choices: ['pasa', 'paya', 'haya', 'paha'] },
    { wordId: 'gas',  choices: ['gas',  'hath', 'kaha', 'haya'] },
  ],
  /** Level 3 — 8 questions, 4 image choices (all words) */
  3: [
    { wordId: 'gas',  choices: ['gas',  'gang', 'kaha', 'pasa'] },
    { wordId: 'gang', choices: ['gang', 'paya', 'haya', 'paha'] },
    { wordId: 'kaha', choices: ['kaha', 'hath', 'pasa', 'gas']  },
    { wordId: 'paha', choices: ['paha', 'haya', 'gang', 'paya'] },
    { wordId: 'haya', choices: ['haya', 'pasa', 'kaha', 'hath'] },
    { wordId: 'hath', choices: ['hath', 'gas',  'paha', 'gang'] },
    { wordId: 'paya', choices: ['paya', 'kaha', 'hath', 'haya'] },
    { wordId: 'pasa', choices: ['pasa', 'paha', 'gas',  'kaha'] },
  ],
};