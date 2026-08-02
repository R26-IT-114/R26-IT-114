import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import BackButton from '../../../components/common/BackButton';


// Placeholder: Until we fully split DyscalculiaNumber into tracing vs memory-write,
// we reuse the same component route and rely on backend evaluation integration.
// Route: /dyscalculia/number-memory-write/:number
const NumberMemoryWritingGame = () => {
  const navigate = useNavigate();
  const { number } = useParams();

  const digit = useMemo(() => {
    const n = parseInt(number, 10);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(9, n));
  }, [number]);

  useEffect(() => {
    navigate(`/dyscalculia/number/${digit}`, { replace: true });
  }, [digit, navigate]);

  return (
    <main className="dg-shell">
      <BackButton onClick={() => navigate('/dyscalculia/number-memory-write')} />
      <p style={{ textAlign: 'center', color: '#fff' }}>Loading memory writing…</p>
    </main>
  );
};

export default NumberMemoryWritingGame;

