import { lazy, Suspense } from 'react';

const DysgraphiaHome = lazy(() => import('./pages/DysgraphiaHome'));
const DysgraphiaLetterA = lazy(() => import('./pages/DysgraphiaLetterA'));
const DysgraphiaLetterTA = lazy(() => import('./pages/DysgraphiaLetterTA'));
const DysgraphiaLetterRA = lazy(() => import('./pages/DysgraphiaLetterRA'));
const ShapesLearning = lazy(() => import('./pages/ShapesLearning'));

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
    path: 'dysgraphia/shapes',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <ShapesLearning />
      </Suspense>
    ),
  },
];

export default dysgraphiaRoutes;
