import { lazy, Suspense } from 'react';

// Lazy imports - Only for existing files
const DyscalculiaFlowLayout = lazy(() => import('./pages/DyscalculiaFlowLayout'));
const DyscalculiaHome = lazy(() => import('./pages/DyscalculiaHome'));
const DyscalculiaDashboard = lazy(() => import('./pages/DyscalculiaDashboard'));
const NumberListeningGame = lazy(() => import('./pages/NumberListeningGame'));
const BalloonPopGame = lazy(() => import('./pages/BalloonPopGame'));
const NumberSortingGame = lazy(() => import('./pages/NumberSortingGame'));
const DyscalculiaNumber = lazy(() => import('./pages/DyscalculiaNumber'));

// FIXED: Removed missing imports:
// - AssessmentScreen
// - LearningGameScreen  
// - RecommendationScreen
// - ResultSummaryScreen
// - NumberReviewGame
// - DyscalculiaNumber0 to DyscalculiaNumber9 (using single DyscalculiaNumber component)

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
            {lazy(() => import('./pages/NumberTracingGameCard'))}
          </Suspense>
        ),
      },
      {
        path: 'number-tracing/:number',
        element: (
          <Suspense fallback={moduleFallback}>
            {lazy(() => import('./pages/NumberTracingGame'))}
          </Suspense>
        ),
      },

      // Game 4b: Number Memory Writing & Evaluation (digit cards)
      {
        path: 'number-memory-write',
        element: (
          <Suspense fallback={moduleFallback}>
            {lazy(() => import('./pages/NumberMemoryWritingCard'))}
          </Suspense>
        ),
      },
      {
        path: 'number-memory-write/:number',
        element: (
          <Suspense fallback={moduleFallback}>
            {lazy(() => import('./pages/NumberMemoryWritingGame'))}
          </Suspense>
        ),
      },

      // Backward compatible route: tracing flow for a digit
      {
        path: 'number/:number',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaNumber />
          </Suspense>
        ),
      },

      // Fallback route - redirect to home
      {
        path: '*',
        element: (
          <Suspense fallback={moduleFallback}>
            <DyscalculiaHome />
          </Suspense>
        ),
      },
    ],
  },
];

export default dyscalculiaRoutes;