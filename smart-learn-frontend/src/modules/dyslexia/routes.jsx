import { lazy, Suspense } from 'react';

const DyslexiaHome = lazy(() => import('./pages/DyslexiaHome'));

const dyslexiaRoutes = [
  {
    path: 'dyslexia',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <DyslexiaHome />
      </Suspense>
    ),
  },
];

export default dyslexiaRoutes;
