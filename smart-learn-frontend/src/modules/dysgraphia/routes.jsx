import { lazy, Suspense } from 'react';

const DysgraphiaHome = lazy(() => import('./pages/DysgraphiaHome'));
const DysgraphiaLetterA = lazy(() => import('./pages/DysgraphiaLetterA'));
const DysgraphiaLetterTA = lazy(() => import('./pages/DysgraphiaLetterTA'));
const DysgraphiaLetterRA = lazy(() => import('./pages/DysgraphiaLetterRA'));
const DysgraphiaLetterYA = lazy(() => import('./pages/DysgraphiaLetterYA'));
const DysgraphiaLetterPA = lazy(() => import('./pages/DysgraphiaLetterPA'));
const DysgraphiaLetterBA = lazy(() => import('./pages/DysgraphiaLetterBA'));
const DysgraphiaLetterKA = lazy(() => import('./pages/DysgraphiaLetterKA'));
const DysgraphiaLetterGA = lazy(() => import('./pages/DysgraphiaLetterGA'));
const DysgraphiaLetterDHA = lazy(() => import('./pages/DysgraphiaLetterDHA'));
const DysgraphiaLetterTHA = lazy(() => import('./pages/DysgraphiaLetterTHA'));
const DysgraphiaLetterLa = lazy(() => import('./pages/DysgraphiaLetterLa'));
const DysgraphiaLetterU = lazy(() => import('./pages/DysgraphiaLetterU'));
const DysgraphiaLetterNA = lazy(() => import('./pages/DysgraphiaLetterNA'));
const DysgraphiaLetterMA = lazy(() => import('./pages/DysgraphiaLetterMA'));
const DysgraphiaLetterHA = lazy(() => import('./pages/DysgraphiaLetterHA'));
const DysgraphiaLetterSA = lazy(() => import('./pages/DysgraphiaLetterSA'));
const ShapesLearning = lazy(() => import('./pages/ShapesLearning'));
const LetterReviewGame = lazy(() => import('./pages/LetterReviewGame'));
const TwoLetterWordsGame = lazy(() => import('./pages/TwoLetterWordsGame'));
const ThreeLetterWordsGame = lazy(() => import('./pages/ThreeLetterWordsGame'));
const WritingLineWordsGame = lazy(() => import('./pages/WritingLineWordsGame'));
const ProgressDashboard = lazy(() => import('./pages/DysgraphiaProgressDashboard'));
const NodeLetterChallenge = lazy(() => import('./pages/NodeLetterChallenge'));



const dysgraphiaRoutes = [
  {
    path: 'dysgraphia',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaHome />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-a',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ta',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterTA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ra',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterRA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ya',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterYA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-pa',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterPA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ba',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterBA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ka',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterKA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ga',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterGA />
      </Suspense>
    ),
  },
   {
    path: 'dysgraphia/letter-dha',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterDHA />
      </Suspense>
    ),
  },
   {
    path: 'dysgraphia/letter-tha',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterTHA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-la',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterLa />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-u',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterU />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-na',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterNA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ma',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterMA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-ha',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterHA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-sa',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaLetterSA />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/shapes',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <ShapesLearning />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/letter-review',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <LetterReviewGame />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/word-game',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaHome />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/word-game/two-letters',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <TwoLetterWordsGame />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/word-game/three-letters',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <ThreeLetterWordsGame />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/writing-lines',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <WritingLineWordsGame />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/progress',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <ProgressDashboard />
      </Suspense>
    ),
  },
  {
    path: 'dysgraphia/node-letter-challenge',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <NodeLetterChallenge />
      </Suspense>
    ),
  },

];

export default dysgraphiaRoutes;
