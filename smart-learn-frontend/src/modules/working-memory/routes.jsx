import { lazy, Suspense } from 'react';

const WorkingMemoryHome = lazy(() => import('./pages/WorkingMemoryHome'));

const workingMemoryRoutes = [
  {
    path: 'working-memory',
    element: (
      <Suspense fallback={<div className='page-shell'>Loading module...</div>}>
        <WorkingMemoryHome />
      </Suspense>
    ),
  },
];

export default workingMemoryRoutes;
