import { lazy, Suspense, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import OceanAnimalFriends from '../components/OceanAnimalFriends';

const DIGIT_TRACING_PAGES = {
  0: lazy(() => import('./DyscalculiaNumber0')),
  1: lazy(() => import('./DyscalculiaNumber1')),
  2: lazy(() => import('./DyscalculiaNumber2')),
  3: lazy(() => import('./DyscalculiaNumber3')),
  4: lazy(() => import('./DyscalculiaNumber4')),
  5: lazy(() => import('./DyscalculiaNumber5')),
  6: lazy(() => import('./DyscalculiaNumber6')),
  7: lazy(() => import('./DyscalculiaNumber7')),
  8: lazy(() => import('./DyscalculiaNumber8')),
  9: lazy(() => import('./DyscalculiaNumber9')),
};

// This page reuses the existing guided trace flow.
// Route: /dyscalculia/number-tracing/:number
const NumberTracingGame = () => {
  const { number } = useParams();

  const digit = useMemo(() => {
    const n = parseInt(number, 10);
    return Number.isInteger(n) && n >= 0 && n <= 9 ? n : null;
  }, [number]);

  if (digit === null) {
    return <Navigate to='/dyscalculia/number-tracing' replace />;
  }

  const DigitTracingPage = DIGIT_TRACING_PAGES[digit];

  return (
    <Suspense fallback={<main className='dg-shell dc-number-page'><p className='page-shell'>Loading tracing…</p></main>}>
      <OceanAnimalFriends scene="tracing" />
      <DigitTracingPage />
    </Suspense>
  );
};

export default NumberTracingGame;
