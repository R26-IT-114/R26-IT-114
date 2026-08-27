import { lazy, Suspense } from 'react';

const WorkingMemoryLayout = lazy(() => import('./pages/WorkingMemoryLayout'));
const WorkingMemoryHome = lazy(() => import('./pages/WorkingMemoryHome'));
const WorkingMemoryDashboard = lazy(() => import('./pages/WorkingMemoryDashboard'));

const moduleFallback = <div className='page-shell'>Loading module...</div>;

const workingMemoryRoutes = [
  {
    path: 'working-memory',
    element: (
      <Suspense fallback={moduleFallback}>
        <WorkingMemoryLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={moduleFallback}>
            <WorkingMemoryHome />
          </Suspense>
        ),
      },
      {
        path: 'home',
        element: (
          <Suspense fallback={moduleFallback}>
            <WorkingMemoryHome />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={moduleFallback}>
            <WorkingMemoryDashboard />
          </Suspense>
        ),
      },
      {
        // support deep-linking into a specific game and level to avoid 404s
        path: ':game/:level',
        element: (
          <Suspense fallback={moduleFallback}>
            <WorkingMemoryHome />
          </Suspense>
        ),
      },
    ],
  },
];

export default workingMemoryRoutes;
