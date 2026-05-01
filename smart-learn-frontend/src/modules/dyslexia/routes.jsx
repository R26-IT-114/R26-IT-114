import { lazy, Suspense } from 'react';

const DyslexiaHome = lazy(() => import('./pages/DyslexiaHome'));
const GardenJourney = lazy(() => import('./pages/GardenJourney'));

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
];

export default dyslexiaRoutes;
