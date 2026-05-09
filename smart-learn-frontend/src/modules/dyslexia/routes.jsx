import { lazy, Suspense } from 'react';

const DyslexiaHome = lazy(() => import('./pages/DyslexiaHome'));
const GardenJourney = lazy(() => import('./pages/GardenJourney'));
const LetterPronunciation = lazy(() => import('./pages/LetterPronunciation'));
const LetterListening = lazy(() => import('./pages/LetterListening'));
const LetterSoundMatch = lazy(() => import('./pages/LetterSoundMatch'));
const WordImageMatch = lazy(() => import('./pages/WordImageMatch'));
const WordSpeakGame  = lazy(() => import('./pages/WordSpeakGame'));
const WordListenMatch = lazy(() => import('./pages/WordListenMatch'));
const TwoLetterListenMatch = lazy(() => import('./pages/TwoLetterListenMatch'));
const FirstLetterGame = lazy(() => import('./pages/FirstLetterGame'));
const RhymeOddOneOut = lazy(() => import('./pages/RhymeOddOneOut'));
const TwoLetterWordMatch = lazy(() => import('./pages/TwoLetterWordMatch'));
const TwoLetterSpeakGame = lazy(() => import('./pages/TwoLetterSpeakGame'));
const WordBuilder = lazy(() => import('./pages/WordBuilder'));

const dyslexiaRoutes = [
  {
    path: 'dyslexia',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DyslexiaHome />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/garden-journey',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <GardenJourney />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/letter-pronunciation',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <LetterPronunciation />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/letter-listening',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <LetterListening />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/letter-sound-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <LetterSoundMatch />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-image-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <WordImageMatch />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-speak',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <WordSpeakGame />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-listen-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <WordListenMatch />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/two-letter-listen',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <TwoLetterListenMatch />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/first-letter',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <FirstLetterGame />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/rhyme-odd-one-out',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <RhymeOddOneOut />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/two-letter-word-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <TwoLetterWordMatch />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/two-letter-speak',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <TwoLetterSpeakGame />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-builder',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <WordBuilder />
      </Suspense>
    ),
  },
];

export default dyslexiaRoutes;
