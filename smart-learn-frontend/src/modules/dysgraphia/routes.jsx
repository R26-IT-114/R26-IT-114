import { lazy, Suspense } from 'react';

const DysgraphiaHome = lazy(() => import('./pages/DysgraphiaHome'));
const DysgraphiaLetterA = lazy(() => import('./pages/DysgraphiaLetterA'));
const DysgraphiaLetterTA = lazy(() => import('./pages/DysgraphiaLetterTA'));

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
];

export default dysgraphiaRoutes;
