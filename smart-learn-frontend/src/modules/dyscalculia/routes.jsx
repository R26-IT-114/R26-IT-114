import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';

// Lazy imports - Only for existing files
const DyscalculiaFlowLayout = lazy(() => import('./pages/DyscalculiaFlowLayout'));
const DyscalculiaHome = lazy(() => import('./pages/DyscalculiaHome'));
const DyscalculiaDashboard = lazy(() => import('./pages/DyscalculiaDashboard'));
const NumberListeningGame = lazy(() => import('./pages/NumberListeningGame'));
const BalloonPopGame = lazy(() => import('./pages/BalloonPopGame'));
const NumberSortingGame = lazy(() => import('./pages/NumberSortingGame'));
const DyscalculiaNumber0 = lazy(() => import('./pages/DyscalculiaNumber0'));
const DyscalculiaNumber1 = lazy(() => import('./pages/DyscalculiaNumber1'));
const DyscalculiaNumber2 = lazy(() => import('./pages/DyscalculiaNumber2'));
const DyscalculiaNumber3 = lazy(() => import('./pages/DyscalculiaNumber3'));
const DyscalculiaNumber4 = lazy(() => import('./pages/DyscalculiaNumber4'));
const DyscalculiaNumber5 = lazy(() => import('./pages/DyscalculiaNumber5'));
const DyscalculiaNumber6 = lazy(() => import('./pages/DyscalculiaNumber6'));
const DyscalculiaNumber7 = lazy(() => import('./pages/DyscalculiaNumber7'));
const DyscalculiaNumber8 = lazy(() => import('./pages/DyscalculiaNumber8'));
const DyscalculiaNumber9 = lazy(() => import('./pages/DyscalculiaNumber9'));
const NumberTracingGameCard = lazy(() => import('./pages/NumberTracingGameCard'));
const NumberTracingGame = lazy(() => import('./pages/NumberTracingGame'));
const NumberMemoryWritingCard = lazy(() => import('./pages/NumberMemoryWritingCard'));
const NumberMemoryWritingGame = lazy(() => import('./pages/NumberMemoryWritingGame'));

const moduleFallback = <div className='page-shell'>Loading dyscalculia module...</div>;

const dyscalculiaRoutes = [
  {
    path: 'dyscalculia',
    element: (
      <Suspense fallback={moduleFallback}>
        <DyscalculiaFlowLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaHome />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaDashboard />
          </Suspense>
        ),
      },
      // Game 1: Listening Game
      {
        path: 'listening-game',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberListeningGame />
          </Suspense>
        ),
      },
      // Game 2: Balloon Pop Game
      {
        path: 'balloon-pop',
        element: (
          <Suspense fallback={moduleFallback}>
            <BalloonPopGame />
          </Suspense>
        ),
      },
      // Game 3: Number Sorting Game
      {
        path: 'number-sorting',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberSortingGame />
          </Suspense>
        ),
      },
      // Game 4a: Number Learning & Tracing (digit cards)
      {
        path: 'number-tracing',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberTracingGameCard />
          </Suspense>
        ),
      },
      {
        path: 'number-tracing/:number',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberTracingGame />
          </Suspense>
        ),
      },

      // Game 4b: Number Memory Writing & Evaluation (digit cards)
      {
        path: 'number-memory-write',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberMemoryWritingCard />
          </Suspense>
        ),
      },
      {
        path: 'number-memory-write/:number',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberMemoryWritingGame />
          </Suspense>
        ),
      },

      // Number Learning Routes - Direct component imports (0-9)
      {
        path: 'number/0',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber0 />
          </Suspense>
        ),
      },
      {
        path: 'number/1',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber1 />
          </Suspense>
        ),
      },
      {
        path: 'number/2',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber2 />
          </Suspense>
        ),
      },
      {
        path: 'number/3',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber3 />
          </Suspense>
        ),
      },
      {
        path: 'number/4',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber4 />
          </Suspense>
        ),
      },
      {
        path: 'number/5',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber5 />
          </Suspense>
        ),
      },
      {
        path: 'number/6',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber6 />
          </Suspense>
        ),
      },
      {
        path: 'number/7',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber7 />
          </Suspense>
        ),
      },
      {
        path: 'number/8',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber8 />
          </Suspense>
        ),
      },
      {
        path: 'number/9',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber9 />
          </Suspense>
        ),
      },

      // Fallback route - redirect to home
      {
        path: '*',
        element: <Navigate to='/dyscalculia' replace />,
      },
    ],
  },
];

export default dyscalculiaRoutes;
