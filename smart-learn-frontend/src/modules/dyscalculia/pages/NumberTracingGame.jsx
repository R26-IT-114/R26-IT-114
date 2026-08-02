import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import BackButton from '../../../components/common/BackButton';


// This page reuses the existing guided trace flow.
// Route: /dyscalculia/number-tracing/:number
const NumberTracingGame = () => {
  const navigate = useNavigate();
  const { number } = useParams();

  // Ensure we only pass digits 0..9
  const digit = useMemo(() => {
    const n = parseInt(number, 10);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(9, n));
  }, [number]);

  // DyscalculiaNumber uses /dyscalculia/number/:number internally (params name is `number`)
  // so we just navigate to that compatible route with the same param.
  useEffect(() => {
    navigate(`/dyscalculia/number/${digit}`, { replace: true });
  }, [digit, navigate]);

  return (
    <main className="dg-shell">
      <BackButton onClick={() => navigate('/dyscalculia/number-tracing')} />
      <p style={{ textAlign: 'center', color: '#fff' }}>Loading tracing…</p>
    </main>
  );
};

export default NumberTracingGame;

