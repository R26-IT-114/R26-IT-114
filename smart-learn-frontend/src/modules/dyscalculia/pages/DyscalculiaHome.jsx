import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';

const STAR_COLORS = ['#ffffff', '#ffe4b5', '#add8e6', '#ffcccb', '#b0e0e6', '#fff176', '#e0b0ff'];

const StarField = () => {
  const stars = Array.from({ length: 160 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 99}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 0.5,
    dur: (Math.random() * 4 + 2).toFixed(1),
    delay: -(Math.random() * 7).toFixed(1),
    type: i % 7 === 0 ? 'pulse' : i % 3 === 0 ? 'color' : 'dot',
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }));

  return (
    <div className="dg-stars-layer" aria-hidden="true">
      {stars.map((s) => {
        const cls =
          s.type === 'pulse'
            ? 'dg-star-pulse'
            : s.type === 'color'
              ? 'dg-star-color'
              : 'dg-star-dot';

        return (
          <span
            key={s.id}
            className={cls}
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--dur': `${s.dur}s`,
              '--delay': `${s.delay}s`,
              ...(s.type !== 'dot' ? { '--c': s.color } : {}),
            }}
          />
        );
      })}
    </div>
  );
};

const SpaceBackground = () => (
  <>
    <StarField />
    {[
      { s: '✦', cls: 'dg-sparkle-1' },
      { s: '✧', cls: 'dg-sparkle-2' },
      { s: '✦', cls: 'dg-sparkle-3' },
      { s: '✧', cls: 'dg-sparkle-4' },
      { s: '★', cls: 'dg-sparkle-5' },
      { s: '✦', cls: 'dg-sparkle-6' },
      { s: '✧', cls: 'dg-sparkle-7' },
      { s: '✦', cls: 'dg-sparkle-8' },
      { s: '★', cls: 'dg-sparkle-9' },
      { s: '✧', cls: 'dg-sparkle-10' },
      { s: '✦', cls: 'dg-sparkle-11' },
      { s: '★', cls: 'dg-sparkle-12' },
    ].map((item) => (
      <div key={item.cls} className={`dg-sparkle ${item.cls}`} aria-hidden="true">
        {item.s}
      </div>
    ))}
  </>
);

const DIGITS = [
  { digit: '0', label: 'බිංදුව' },
  { digit: '1', label: 'එක' },
  { digit: '2', label: 'දෙක' },
  { digit: '3', label: 'තුන' },
  { digit: '4', label: 'හතර' },
  { digit: '5', label: 'පහ' },
  { digit: '6', label: 'හය' },
  { digit: '7', label: 'හත' },
  { digit: '8', label: 'අට' },
  { digit: '9', label: 'නවය' },
];

const GRADIENTS = [
  'dg-ctl-orange',
  'dg-ctl-blue',
  'dg-ctl-teal',
  'dg-ctl-purple',
  'dg-ctl-green',
  'dg-ctl-yellow',
  'dg-ctl-pink',
  'dg-ctl-red',
  'dg-ctl-indigo',
  'dg-ctl-mint',
];

const DyscalculiaHome = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('levels');

  const LEVELS = [
    {
      id: 1,
      number: '01',
      title: 'අංක ලියාගැනීම',
      cta: '✨ අඳින්න',
      action: 'numbers',
      side: 'left',
    },
    {
      id: 2,
      number: '02',
      title: 'සමාලෝචනය',
      cta: '🎮 Review',
      action: 'review',
      side: 'right',
    },
  ];

  const handleLevelClick = (action) => {
    if (action === 'numbers') {
      setMode('numbers');
      return;
    }

    if (action === 'review') {
      navigate('/dyscalculiaAction');
      return;
    }

    navigate(`/dyscalculia/${action}`);
  };

  return (
    <main className="dg-home-shell">
      <SpaceBackground />
      <section className="dg-home-card">
        <h1 className="dg-home-title">අංක ඉගෙනගැනීමට ලැබෙයි! 🚀✨</h1>

        {mode === 'levels' ? (
          <div className="dg-levels-grid">
            {LEVELS.map((lv) => (
              <button
                key={lv.id}
                type="button"
                className="dg-level-card"
                onClick={() => handleLevelClick(lv.action)}
              >
                <div className={`dg-level-body dg-level-body--${lv.side}`}>
                  <div className="dg-level-number">{lv.number}</div>
                  <div className="dg-level-title">{lv.title}</div>
                  <div className="dg-level-btn-glow">{lv.cta}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="dg-letters-panel">
            <button className="dg-back-levels" onClick={() => setMode('levels')}>
              ⏪ අංක කොටස් වෙතට
            </button>
            <div className="dg-letters-subtitle">🧠 අංක එකින් එක ලියමු!</div>

            <div className="dg-letters-flex">
              {DIGITS.map((item, index) => (
                <button
                  key={item.digit}
                  type="button"
                  className={`dg-letter-big-btn ${GRADIENTS[index % GRADIENTS.length]}`}
                  onClick={() => navigate(`/dyscalculia/number/${item.digit}`)}
                >
                  <span className="dg-letter-char">{item.digit}</span>
                  <span className="dg-letter-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default DyscalculiaHome;

