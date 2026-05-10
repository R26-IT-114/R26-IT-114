import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

const NumberTracingGameCard = () => {
  const navigate = useNavigate();

  return (
    <main className="dg-shell dg-theme-ta dc-number-page dc-cartoon-bg">
      <button
        type="button"
        className="dg-home-btn dc-back-button"
        onClick={() => navigate('/dyscalculia')}
        aria-label="Back"
      >
        ←
      </button>

      <section className="dg-stage" style={{ maxWidth: 980, margin: '0 auto' }}>
        <header className="dg-header dc-instruction-box">
          <h1>Number Learning &amp; Tracing (0–9)</h1>
          <p>Pick a digit to learn and trace step-by-step.</p>
        </header>

        <div
          className="dg-digit-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(80px, 1fr))',
            gap: 14,
            padding: 12,
          }}
        >
          {DIGITS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => navigate(`/dyscalculia/number-tracing/${d}`)}
              className="dg-digit-card"
              style={{
                border: '2px solid rgba(255,255,255,0.35)',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                padding: '18px 0',
                fontSize: 44,
                fontWeight: 900,
                cursor: 'pointer',
              }}
              aria-label={`Practice tracing digit ${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default NumberTracingGameCard;

