/**
 * First Letter Finder — mixed 2-letter & 3-letter Sinhala words.
 * Child hears the word and picks its FIRST Sinhala letter.
 *
 * Unique first letters across all words: ග, ක, ප, හ, ය, න
 *
 * 2-letter words: ගස(ග)  ගඟ(ග)  කහ(ක)  පහ(ප)  හය(හ)  හත(හ)  පය(ප)  පස(ප)
 * 3-letter words: යහන(ය) පහන(ප) නහය(න) කසය(ක) පනහ(ප) ගඟන(ග) නයන(න)
 */

export const FL_WORDS = {
  gas:   { id: 'gas',   word: 'ගස',  firstLetter: 'ග', len: 2 },
  gang:  { id: 'gang',  word: 'ගඟ',  firstLetter: 'ග', len: 2 },
  kaha:  { id: 'kaha',  word: 'කහ',  firstLetter: 'ක', len: 2 },
  paha:  { id: 'paha',  word: 'පහ',  firstLetter: 'ප', len: 2 },
  haya:  { id: 'haya',  word: 'හය',  firstLetter: 'හ', len: 2 },
  hath:  { id: 'hath',  word: 'හත',  firstLetter: 'හ', len: 2 },
  paya:  { id: 'paya',  word: 'පය',  firstLetter: 'ප', len: 2 },
  pasa:  { id: 'pasa',  word: 'පස',  firstLetter: 'ප', len: 2 },
  yahan: { id: 'yahan', word: 'යහන', firstLetter: 'ය', len: 3 },
  pahan: { id: 'pahan', word: 'පහන', firstLetter: 'ප', len: 3 },
  nahay: { id: 'nahay', word: 'නහය', firstLetter: 'න', len: 3 },
  kasay: { id: 'kasay', word: 'කසය', firstLetter: 'ක', len: 3 },
  panah: { id: 'panah', word: 'පනහ', firstLetter: 'ප', len: 3 },
  gagan: { id: 'gagan', word: 'ගඟන', firstLetter: 'ග', len: 3 },
  nayan: { id: 'nayan', word: 'නයන', firstLetter: 'න', len: 3 },
};

/** All unique first letters in the pool */
export const ALL_FIRST_LETTERS = ['ග', 'ක', 'ප', 'හ', 'ය', 'න'];

export const FL_LEVELS = {
  /** Level 1 — 5 questions, 3 letter choices */
  1: [
    { wordId: 'gas',   choices: ['ග', 'ක', 'ප'] },
    { wordId: 'kaha',  choices: ['ක', 'හ', 'ය'] },
    { wordId: 'yahan', choices: ['ය', 'න', 'ග'] },
    { wordId: 'pasa',  choices: ['ප', 'ය', 'ක'] },
    { wordId: 'haya',  choices: ['හ', 'ග', 'ප'] },
  ],
  /** Level 2 — 6 questions, 4 letter choices */
  2: [
    { wordId: 'gang',  choices: ['ග', 'ප', 'ය', 'ක'] },
    { wordId: 'nahay', choices: ['න', 'හ', 'ග', 'ප'] },
    { wordId: 'hath',  choices: ['හ', 'ක', 'ය', 'න'] },
    { wordId: 'kasay', choices: ['ක', 'ග', 'ප', 'හ'] },
    { wordId: 'pahan', choices: ['ප', 'ය', 'න', 'ග'] },
    { wordId: 'gagan', choices: ['ග', 'ක', 'හ', 'ය'] },
  ],
  /** Level 3 — 8 questions, 4 letter choices (full mix) */
  3: [
    { wordId: 'gagan', choices: ['ග', 'ය', 'ප', 'ක'] },
    { wordId: 'nayan', choices: ['න', 'ග', 'හ', 'ය'] },
    { wordId: 'hath',  choices: ['හ', 'ක', 'ප', 'ග'] },
    { wordId: 'paya',  choices: ['ප', 'හ', 'ය', 'ක'] },
    { wordId: 'gas',   choices: ['ග', 'න', 'ක', 'ප'] },
    { wordId: 'yahan', choices: ['ය', 'ග', 'හ', 'න'] },
    { wordId: 'kaha',  choices: ['ක', 'ප', 'ය', 'හ'] },
    { wordId: 'panah', choices: ['ප', 'ග', 'ක', 'ය'] },
  ],
};