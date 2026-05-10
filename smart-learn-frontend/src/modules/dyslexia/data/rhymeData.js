/**
 * Rhyme Odd-One-Out — mixed 2 & 3 letter Sinhala words.
 * Child hears all words, then picks the ONE that does NOT rhyme with the others.
 *
 * Rhyme groups (by last letter):
 *   -හ : කහ  පහ  පනහ
 *   -ය : හය  පය  නහය  කසය
 *   -න : යහන  පහන  ගඟන  නයන
 *   -ස : ගස  පස   (only 2 — used as odd-ones-out only)
 *   -ත : හත              (used as odd-one-out only)
 *   -ඟ : ගඟ              (used as odd-one-out only)
 */

export const RO_WORDS = {
  kaha:  { id: 'kaha',  word: 'කහ',  rhymeGroup: 'ha', ending: '-හ' },
  paha:  { id: 'paha',  word: 'පහ',  rhymeGroup: 'ha', ending: '-හ' },
  panah: { id: 'panah', word: 'පනහ', rhymeGroup: 'ha', ending: '-හ' },
  haya:  { id: 'haya',  word: 'හය',  rhymeGroup: 'ya', ending: '-ය' },
  paya:  { id: 'paya',  word: 'පය',  rhymeGroup: 'ya', ending: '-ය' },
  nahay: { id: 'nahay', word: 'නහය', rhymeGroup: 'ya', ending: '-ය' },
  kasay: { id: 'kasay', word: 'කසය', rhymeGroup: 'ya', ending: '-ය' },
  yahan: { id: 'yahan', word: 'යහන', rhymeGroup: 'na', ending: '-න' },
  pahan: { id: 'pahan', word: 'පහන', rhymeGroup: 'na', ending: '-න' },
  gagan: { id: 'gagan', word: 'ගඟන', rhymeGroup: 'na', ending: '-න' },
  nayan: { id: 'nayan', word: 'නයන', rhymeGroup: 'na', ending: '-න' },
  gas:   { id: 'gas',   word: 'ගස',  rhymeGroup: 'sa', ending: '-ස' },
  pasa:  { id: 'pasa',  word: 'පස',  rhymeGroup: 'sa', ending: '-ස' },
  hath:  { id: 'hath',  word: 'හත',  rhymeGroup: 'tha', ending: '-ත' },
  gang:  { id: 'gang',  word: 'ගඟ',  rhymeGroup: 'nga', ending: '-ඟ' },
};

export const RO_LEVELS = {
  /**
   * Level 1 — 3 word choices: 2 rhyme + 1 odd
   * Child just needs to find the 1 word that is different.
   */
  1: [
    { wordIds: ['kaha',  'paha',  'haya'],  oddId: 'haya'  },
    { wordIds: ['haya',  'paya',  'gas'],   oddId: 'gas'   },
    { wordIds: ['yahan', 'pahan', 'kaha'],  oddId: 'kaha'  },
    { wordIds: ['nahay', 'kasay', 'yahan'], oddId: 'yahan' },
    { wordIds: ['gagan', 'nayan', 'pasa'],  oddId: 'pasa'  },
  ],

  /**
   * Level 2 — 4 word choices: 3 rhyme + 1 odd
   */
  2: [
    { wordIds: ['kaha',  'paha',  'panah', 'gas'],   oddId: 'gas'   },
    { wordIds: ['haya',  'paya',  'nahay', 'gagan'], oddId: 'gagan' },
    { wordIds: ['yahan', 'pahan', 'gagan', 'kaha'],  oddId: 'kaha'  },
    { wordIds: ['kasay', 'nahay', 'haya',  'nayan'], oddId: 'nayan' },
    { wordIds: ['nayan', 'gagan', 'pahan', 'paya'],  oddId: 'paya'  },
    { wordIds: ['kaha',  'pasa',  'paha',  'panah'], oddId: 'pasa'  },
  ],

  /**
   * Level 3 — 4 word choices, harder distractors (close-sounding pairs)
   */
  3: [
    { wordIds: ['kaha',  'paha',  'panah', 'nayan'], oddId: 'nayan' },
    { wordIds: ['haya',  'nahay', 'kasay', 'gas'],   oddId: 'gas'   },
    { wordIds: ['yahan', 'gagan', 'nayan', 'paha'],  oddId: 'paha'  },
    { wordIds: ['paha',  'kaha',  'haya',  'panah'], oddId: 'haya'  },
    { wordIds: ['gagan', 'nayan', 'yahan', 'gas'],   oddId: 'gas'   },
    { wordIds: ['haya',  'kasay', 'nahay', 'hath'],  oddId: 'hath'  },
    { wordIds: ['yahan', 'pahan', 'gagan', 'gang'],  oddId: 'gang'  },
    { wordIds: ['kaha',  'panah', 'paha',  'pasa'],  oddId: 'pasa'  },
  ],
};