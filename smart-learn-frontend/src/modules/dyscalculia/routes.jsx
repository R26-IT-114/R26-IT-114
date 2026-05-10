import { lazy, Suspense } from 'react';

const DyscalculiaFlowLayout = lazy(() => import('./pages/DyscalculiaFlowLayout'));
const DyscalculiaHome = lazy(() => import('./pages/DyscalculiaHome'));
const AssessmentScreen = lazy(() => import('./pages/AssessmentScreen'));
const LearningGameScreen = lazy(() => import('./pages/LearningGameScreen'));
const RecommendationScreen = lazy(() => import('./pages/RecommendationScreen'));
const ResultSummaryScreen = lazy(() => import('./pages/ResultSummaryScreen'));
const ProgressDashboardScreen = lazy(() => import('./pages/ProgressDashboardScreen'));
const NumberReviewGame = lazy(() => import('./pages/NumberReviewGame'));
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
        path: 'assessment',
        element: (
          <Suspense fallback={moduleFallback}>
            <AssessmentScreen />
          </Suspense>
        ),
      },
      {
        path: 'learning-game/:activityId',
        element: (
          <Suspense fallback={moduleFallback}>
            <LearningGameScreen />
          </Suspense>
        ),
      },
      {
        path: 'recommendation',
        element: (
          <Suspense fallback={moduleFallback}>
            <RecommendationScreen />
          </Suspense>
        ),
      },
      {
        path: 'result-summary',
        element: (
          <Suspense fallback={moduleFallback}>
            <ResultSummaryScreen />
          </Suspense>
        ),
      },
      {
        path: 'progress-dashboard',
        element: (
          <Suspense fallback={moduleFallback}>
            <ProgressDashboardScreen />
          </Suspense>
        ),
      },
      {
        path: 'review',
        element: (
          <Suspense fallback={moduleFallback}>
            <NumberReviewGame />
          </Suspense>
        ),
      },
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
    ],
  },
];

export default dyscalculiaRoutes;
