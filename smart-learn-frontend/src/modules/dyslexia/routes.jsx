import { lazy, Suspense } from 'react';

const DyslexiaHome = lazy(() => import('./pages/DyslexiaHome'));
const GardenJourney = lazy(() => import('./pages/GardenJourney'));
const ImageMatcher = lazy(() => import('./pages/ImageMatcher'));
const ImageHunt = lazy(() => import('./pages/ImageHunt'));
const LetterPronunciation = lazy(() => import('./pages/LetterPronunciation'));

const OddOneOut = lazy(() => import('./pages/OddOneOut'));
const LetterListening = lazy(() => import('./pages/LetterListening'));

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
    path: 'dyslexia/image-matcher',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <ImageMatcher />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/image-hunt',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <ImageHunt />
      </Suspense>
    ),
  },
  {
    path: 'dyslexia/odd-one-out',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading game...</div>}>
        <OddOneOut />
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
];

export default dyslexiaRoutes;
