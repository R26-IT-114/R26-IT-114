import gaAudio from '../../../assets/voice/ga.wav';
import kaAudio from '../../../assets/voice/ka.wav';
import paAudio from '../../../assets/voice/pa.mp3';
import maAudio from '../../../assets/voice/ma.wav';
import naAudio from '../../../assets/voice/na.wav';
import taAudio from '../../../assets/voice/ta.wav';
import thaAudio from '../../../assets/voice/tha.wav';
import saAudio from '../../../assets/voice/sa.wav';
import yaAudio from '../../../assets/voice/ya.wav';
import raAudio from '../../../assets/voice/ra.wav';
import daAudio from '../../../assets/voice/da.wav';

export const PRE_TEST_SECTIONS = [
  {
    key: 'letterRecognition',
    title: 'සිංහල අකුරු හඳුනාගනිමු',
    shortTitle: 'අකුරු හඳුනාගැනීම',
    kind: 'multiple-choice',
    targetScoreLabel: 'letterRecognitionScore',
    questionCountLabel: '5',
  },
  {
    key: 'letterSound',
    title: 'අකුරු සහ හඬ එක්කරමු',
    shortTitle: 'අකුරු-හඬ සම්බන්ධය',
    kind: 'multiple-choice',
    targetScoreLabel: 'letterSoundScore',
    questionCountLabel: '5',
  },
  {
    key: 'twoLetterReading',
    title: 'අකුරු දෙකේ වචන කියවමු',
    shortTitle: 'වචන කියවීම',
    kind: 'speech',
    targetScoreLabel: 'twoLetterScore',
    questionCountLabel: '6',
  },
  {
    key: 'threeLetterReading',
    title: 'අකුරු තුනේ වචන කියවමු',
    shortTitle: 'දිගු වචන කියවීම',
    kind: 'speech',
    targetScoreLabel: 'threeLetterScore',
    questionCountLabel: '5',
  },
];

export const LETTER_RECOGNITION_QUESTIONS = [
  {
    id: 'lr01',
    sectionKey: 'letterRecognition',
    type: 'letter-recognition',
    target: 'ක',
    prompt: 'මේ අකුර තෝරන්න',
    options: ['ක', 'ම', 'න', 'ත'],
    hint: 'ක',
  },
  {
    id: 'lr02',
    sectionKey: 'letterRecognition',
    type: 'letter-recognition',
    target: 'ම',
    prompt: 'මේ අකුර තෝරන්න',
    options: ['ම', 'ග', 'ප', 'න'],
    hint: 'ම',
  },
  {
    id: 'lr03',
    sectionKey: 'letterRecognition',
    type: 'letter-recognition',
    target: 'ත',
    prompt: 'මේ අකුර තෝරන්න',
    options: ['ත', 'ක', 'ර', 'ස'],
    hint: 'ත',
  },
  {
    id: 'lr04',
    sectionKey: 'letterRecognition',
    type: 'letter-recognition',
    target: 'න',
    prompt: 'මේ අකුර තෝරන්න',
    options: ['න', 'ද', 'ය', 'ප'],
    hint: 'න',
  },
  {
    id: 'lr05',
    sectionKey: 'letterRecognition',
    type: 'letter-recognition',
    target: 'ප',
    prompt: 'මේ අකුර තෝරන්න',
    options: ['ප', 'ග', 'ම', 'ත'],
    hint: 'ප',
  },
];

export const LETTER_SOUND_QUESTIONS = [
  {
    id: 'ls01',
    sectionKey: 'letterSound',
    type: 'letter-sound',
    mode: 'visual',
    target: 'ක',
    prompt: 'මේ අකුරේ හඬට ගැළපෙන අකුර තෝරන්න',
    audio: kaAudio,
    options: ['ක', 'ග', 'න', 'ත'],
    hint: 'ක',
  },
  {
    id: 'ls02',
    sectionKey: 'letterSound',
    type: 'letter-sound',
    mode: 'audio',
    target: 'ග',
    prompt: 'හඬ අසලා නිවැරදි අකුර තෝරන්න',
    audio: gaAudio,
    options: ['ග', 'ක', 'ප', 'න'],
    hint: 'ග',
  },
  {
    id: 'ls03',
    sectionKey: 'letterSound',
    type: 'letter-sound',
    mode: 'visual',
    target: 'ප',
    prompt: 'මේ අකුරේ හඬට ගැළපෙන අකුර තෝරන්න',
    audio: paAudio,
    options: ['ප', 'ත', 'ර', 'ම'],
    hint: 'ප',
  },
  {
    id: 'ls04',
    sectionKey: 'letterSound',
    type: 'letter-sound',
    mode: 'audio',
    target: 'ම',
    prompt: 'හඬ අසලා නිවැරදි අකුර තෝරන්න',
    audio: maAudio,
    options: ['ම', 'න', 'ය', 'ප'],
    hint: 'ම',
  },
  {
    id: 'ls05',
    sectionKey: 'letterSound',
    type: 'letter-sound',
    mode: 'audio',
    target: 'න',
    prompt: 'හඬ අසලා නිවැරදි අකුර තෝරන්න',
    audio: naAudio,
    options: ['න', 'ද', 'ක', 'ත'],
    hint: 'න',
  },
];

export const TWO_LETTER_READING_QUESTIONS = [
  {
    id: 'tlr01',
    sectionKey: 'twoLetterReading',
    type: 'speech',
    target: 'මම',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['මම', 'mama'],
    hint: 'මම',
  },
  {
    id: 'tlr02',
    sectionKey: 'twoLetterReading',
    type: 'speech',
    target: 'ගස',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['ගස', 'gasa'],
    hint: 'ගස',
  },
  {
    id: 'tlr03',
    sectionKey: 'twoLetterReading',
    type: 'speech',
    target: 'කහ',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['කහ', 'kaha'],
    hint: 'කහ',
  },
  {
    id: 'tlr04',
    sectionKey: 'twoLetterReading',
    type: 'speech',
    target: 'පහ',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['පහ', 'paha'],
    hint: 'පහ',
  },
  {
    id: 'tlr05',
    sectionKey: 'twoLetterReading',
    type: 'speech',
    target: 'පය',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['පය', 'paya'],
    hint: 'පය',
  },
  {
    id: 'tlr06',
    sectionKey: 'twoLetterReading',
    type: 'speech',
    target: 'පස',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['පස', 'pasa'],
    hint: 'පස',
  },
];

export const THREE_LETTER_READING_QUESTIONS = [
  {
    id: 'thr01',
    sectionKey: 'threeLetterReading',
    type: 'speech',
    target: 'යහන',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['යහන', 'yahana'],
    hint: 'යහන',
  },
  {
    id: 'thr02',
    sectionKey: 'threeLetterReading',
    type: 'speech',
    target: 'පහන',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['පහන', 'pahana'],
    hint: 'පහන',
  },
  {
    id: 'thr03',
    sectionKey: 'threeLetterReading',
    type: 'speech',
    target: 'නයන',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['නයන', 'nayana'],
    hint: 'නයන',
  },
  {
    id: 'thr04',
    sectionKey: 'threeLetterReading',
    type: 'speech',
    target: 'කසය',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['කසය', 'kasaya', 'kasa'],
    hint: 'කසය',
  },
  {
    id: 'thr05',
    sectionKey: 'threeLetterReading',
    type: 'speech',
    target: 'ගඟන',
    prompt: 'මේ වචනය කියවන්න',
    acceptedAnswers: ['ගඟන', 'gagana'],
    hint: 'ගඟන',
  },
];

export const PRE_TEST_BANK = {
  letterRecognition: LETTER_RECOGNITION_QUESTIONS,
  letterSound: LETTER_SOUND_QUESTIONS,
  twoLetterReading: TWO_LETTER_READING_QUESTIONS,
  threeLetterReading: THREE_LETTER_READING_QUESTIONS,
};
