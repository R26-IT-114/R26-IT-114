import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';
import '../styles/dyscalculia-cartoon2.css';

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

/* Emoji mascots — one per digit card */
const DIGIT_EMOJIS = ['🎪', '🎠', '🎡', '🎢', '🤹', '🎭', '🎈', '🎉', '🦁', '🐘'];

/* Unique accessible colour labels for screen readers */
const DIGIT_COLORS = [
  'red',    'orange', 'cyan',   'green',
  'purple', 'pink',   'magenta','blue',
  'yellow', 'teal',
];

const NumberTracingGameCard = () => {
  const navigate = useNavigate();

  return (
    <main className="dc-shell dc-cartoon-bg">

      {/* ── Back Button ── */}
      <button
        type="button"
        className="dg-home-btn dc-back-button"
        onClick={() => navigate('/dyscalculia')}
        aria-label="Go back"
      >
        ←
      </button>

      {/* ── Floating balloon decorations ── */}
      <span className="dc-balloon dc-balloon--1" aria-hidden="true">🎈</span>
      <span className="dc-balloon dc-balloon--2" aria-hidden="true">🎈</span>
      <span className="dc-balloon dc-balloon--3" aria-hidden="true">🎈</span>

      <section className="dc-stage">

        {/* ── Header ── */}
        <header className="dc-header-box">
          <div className="dc-header-stars" aria-hidden="true">⭐ ✨ 🌟 ⭐ ✨ 🌟 ⭐</div>
          <h1 className="dc-title">
            <span className="dc-title-icon" aria-hidden="true">🎪</span>
            Number Learning &amp; Tracing
            <span className="dc-title-range"> (0 – 9)</span>
          </h1>
          <p className="dc-subtitle">
            🎠 Pick a digit to learn and trace step-by-step! 🎡
          </p>
        </header>

        {/* ── Digit Grid ── */}
        <div className="dc-grid" role="list" aria-label="Choose a digit to practise">
          {DIGITS.map((d, i) => (
            <button
              key={d}
              type="button"
              role="listitem"
              onClick={() => navigate(`/dyscalculia/number-tracing/${d}`)}
              className={`dc-digit-card dc-digit-card--${d}`}
              aria-label={`Practise tracing digit ${d}`}
            >
              {/* Emoji mascot top-right */}
              <span className="dc-card-emoji" aria-hidden="true">
                {DIGIT_EMOJIS[i]}
              </span>

              {/* The big digit */}
              <span className="dc-card-num">{d}</span>

              {/* Word label */}
              <span className="dc-card-word">
                {['zero','one','two','three','four','five','six','seven','eight','nine'][d]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Bottom cheer line ── */}
        <p className="dc-cheer" aria-live="polite">
          🌟 You can do it! Keep practising! 🌟
        </p>

      </section>
    </main>
  );
};

export default NumberTracingGameCard;