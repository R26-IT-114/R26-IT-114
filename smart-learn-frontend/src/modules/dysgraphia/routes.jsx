import { lazy, Suspense } from 'react';

const DysgraphiaHome = lazy(() => import('./pages/DysgraphiaHome'));

const dysgraphiaRoutes = [
  {
    path: 'dysgraphia',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DysgraphiaHome />
      </Suspense>
    ),
  },
];

export default dysgraphiaRoutes;
