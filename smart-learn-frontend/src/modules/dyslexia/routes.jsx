import { lazy, Suspense } from 'react';
import './responsive.css';
import DyslexiaRewardPopup from './components/DyslexiaRewardPopup';
import SharedJungleGameBackground from './components/SharedJungleGameBackground';

const DyslexiaHome = lazy(() => import('./pages/DyslexiaHome'));
const ReadingPlacementAssessment = lazy(() => import('./pages/ReadingPlacementAssessment'));
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

const withRewards = (game) => (
  <SharedJungleGameBackground>
    <DyslexiaRewardPopup>{game}</DyslexiaRewardPopup>
  </SharedJungleGameBackground>
);

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
    path: 'dyslexia/pre-assessment',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading...</div>}>
        <ReadingPlacementAssessment />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/reading-placement',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading...</div>}>
        <ReadingPlacementAssessment />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/garden-journey',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<GardenJourney />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/letter-pronunciation',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<LetterPronunciation />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/letter-listening',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<LetterListening />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/letter-sound-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<LetterSoundMatch />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-image-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<WordImageMatch />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-speak',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<WordSpeakGame />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-listen-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<WordListenMatch />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/two-letter-listen',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<TwoLetterListenMatch />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/first-letter',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<FirstLetterGame />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/rhyme-odd-one-out',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<RhymeOddOneOut />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/two-letter-word-match',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<TwoLetterWordMatch />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/two-letter-speak',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<TwoLetterSpeakGame />)}
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/word-builder',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        {withRewards(<WordBuilder />)}
      </Suspense>
    ),
  },
];

export default dyslexiaRoutes;
