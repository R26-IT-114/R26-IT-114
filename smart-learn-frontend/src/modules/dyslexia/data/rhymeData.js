/**
 * Rhyme Odd-One-Out
 * Each question has a reference word (`promptId`) and four answer choices.
 * Three choices rhyme with the reference; `oddId` is the different sound.
 */

export const RO_WORDS = {
  mala:   { id: 'mala',   word: 'මල',    rhymeGroup: 'la',   ending: '-ල' },
  kala:   { id: 'kala',   word: 'කල',    rhymeGroup: 'la',   ending: '-ල' },
  pala:   { id: 'pala',   word: 'පල',    rhymeGroup: 'la',   ending: '-ල' },
  tala:   { id: 'tala',   word: 'තල',    rhymeGroup: 'la',   ending: '-ල' },
  bala:   { id: 'bala',   word: 'බල',    rhymeGroup: 'la',   ending: '-ල' },
  gama:   { id: 'gama',   word: 'ගම',    rhymeGroup: 'ma',   ending: '-ම' },
  sama:   { id: 'sama',   word: 'සම',    rhymeGroup: 'ma',   ending: '-ම' },
  kama:   { id: 'kama',   word: 'කම',    rhymeGroup: 'ma',   ending: '-ම' },
  tama:   { id: 'tama',   word: 'තම',    rhymeGroup: 'ma',   ending: '-ම' },
  rata:   { id: 'rata',   word: 'රට',    rhymeGroup: 'ta',   ending: '-ට' },
  kata:   { id: 'kata',   word: 'කට',    rhymeGroup: 'ta',   ending: '-ට' },
  wata:   { id: 'wata',   word: 'වට',    rhymeGroup: 'ta',   ending: '-ට' },
  thata:  { id: 'thata',  word: 'තට',    rhymeGroup: 'ta',   ending: '-ට' },
  gasa:   { id: 'gasa',   word: 'ගස',    rhymeGroup: 'sa',   ending: '-ස' },
  rasa:   { id: 'rasa',   word: 'රස',    rhymeGroup: 'sa',   ending: '-ස' },
  pasa:   { id: 'pasa',   word: 'පස',    rhymeGroup: 'sa',   ending: '-ස' },
  wasa:   { id: 'wasa',   word: 'වස',    rhymeGroup: 'sa',   ending: '-ස' },
  atha:   { id: 'atha',   word: 'අත',    rhymeGroup: 'tha',  ending: '-ත' },
  gatha:  { id: 'gatha',  word: 'ගත',    rhymeGroup: 'tha',  ending: '-ත' },
  matha:  { id: 'matha',  word: 'මත',    rhymeGroup: 'tha',  ending: '-ත' },
  watha:  { id: 'watha',  word: 'වත',    rhymeGroup: 'tha',  ending: '-ත' },
  kamala: { id: 'kamala', word: 'කමල',   rhymeGroup: 'mala', ending: '-මල' },
  vimala: { id: 'vimala', word: 'විමල',  rhymeGroup: 'mala', ending: '-මල' },
  amala:  { id: 'amala',  word: 'අමල',   rhymeGroup: 'mala', ending: '-මල' },
  nimala: { id: 'nimala', word: 'නිමල',  rhymeGroup: 'mala', ending: '-මල' },
  nayana: { id: 'nayana', word: 'නයන',   rhymeGroup: 'ana',  ending: '-අන' },
  pawana: { id: 'pawana', word: 'පවන',   rhymeGroup: 'ana',  ending: '-අන' },
  sawana: { id: 'sawana', word: 'සවන',   rhymeGroup: 'ana',  ending: '-අන' },
  bhawana:{ id: 'bhawana',word: 'භවන',   rhymeGroup: 'ana',  ending: '-අන' },
  kusuma: { id: 'kusuma', word: 'කුසුම', rhymeGroup: 'suma', ending: '-සුම' },
};

const QUESTIONS = [
  { promptId: 'mala',   wordIds: ['kala', 'pala', 'tala', 'gasa'],          oddId: 'gasa'   },
  { promptId: 'gama',   wordIds: ['sama', 'kama', 'tama', 'rata'],          oddId: 'rata'   },
  { promptId: 'rata',   wordIds: ['kata', 'wata', 'thata', 'mala'],         oddId: 'mala'   },
  { promptId: 'gasa',   wordIds: ['rasa', 'pasa', 'wasa', 'gama'],          oddId: 'gama'   },
  { promptId: 'atha',   wordIds: ['gatha', 'matha', 'watha', 'kata'],       oddId: 'kata'   },
  { promptId: 'bala',   wordIds: ['kala', 'pala', 'tala', 'gasa'],          oddId: 'gasa'   },
  { promptId: 'kamala', wordIds: ['vimala', 'amala', 'nimala', 'nayana'],   oddId: 'nayana' },
  { promptId: 'nayana', wordIds: ['pawana', 'sawana', 'bhawana', 'kusuma'], oddId: 'kusuma' },
];

export const RO_LEVELS = {
  1: QUESTIONS.slice(0, 5),
  2: QUESTIONS.slice(0, 6),
  3: QUESTIONS,
};
