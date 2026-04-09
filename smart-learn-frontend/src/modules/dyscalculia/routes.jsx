import { lazy, Suspense } from 'react';

const DyscalculiaFlowLayout = lazy(() => import('./pages/DyscalculiaFlowLayout'));
const DyscalculiaHome = lazy(() => import('./pages/DyscalculiaHome'));
const AssessmentScreen = lazy(() => import('./pages/AssessmentScreen'));
const LearningGameScreen = lazy(() => import('./pages/LearningGameScreen'));
const RecommendationScreen = lazy(() => import('./pages/RecommendationScreen'));
const ResultSummaryScreen = lazy(() => import('./pages/ResultSummaryScreen'));
const ProgressDashboardScreen = lazy(() => import('./pages/ProgressDashboardScreen'));

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
    ],
  },
];

export default dyscalculiaRoutes;
