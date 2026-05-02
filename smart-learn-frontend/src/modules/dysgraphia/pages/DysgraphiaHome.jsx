import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';

/* ─────────────────────────────────────────────────────────
   Star field – 160 stars (white, colored, pulse variants)
───────────────────────────────────────────────────────── */
const STAR_COLORS = ['#ffffff','#ffe4b5','#add8e6','#ffcccb','#b0e0e6','#fff176','#e0b0ff'];

const StarField = () => {
  const stars = Array.from({ length: 160 }, (_, i) => ({
    id: i,
    top:   `${Math.random() * 99}%`,
    left:  `${Math.random() * 100}%`,
    size:  Math.random() * 3 + 0.5,
    dur:   (Math.random() * 4 + 2).toFixed(1),
    delay: -(Math.random() * 7).toFixed(1),
    type:  i % 7 === 0 ? 'pulse' : i % 3 === 0 ? 'color' : 'dot',
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }));

  return (
    <div className="dg-stars-layer" aria-hidden="true">
      {stars.map(s => {
        const cls =
          s.type === 'pulse' ? 'dg-star-pulse' :
          s.type === 'color' ? 'dg-star-color' :
          'dg-star-dot';
        return (
          <span
            key={s.id}
            className={cls}
            style={{
              top:     s.top,
              left:    s.left,
              width:   `${s.size}px`,
              height:  `${s.size}px`,
              '--dur':   `${s.dur}s`,
              '--delay': `${s.delay}s`,
              ...(s.type !== 'dot' ? { '--c': s.color } : {}),
            }}
          />
        );
      })}
    </div>
  );
};


/* ─────────────────────────────────────────────────────────
   UFO component factory  (reused for all 6 aliens)
───────────────────────────────────────────────────────── */
const UFOBase = ({ animClass, alienColor, eyeColor, bodyFill, ringGlow, lights }) => (
  <svg
    className={`dg-ufo ${animClass}`}
    viewBox="0 0 120 70"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <ellipse cx="60" cy="52" rx="44" ry="12" fill={ringGlow} />
    <ellipse cx="60" cy="30" rx="26" ry="18" fill="#b0bec5" opacity="0.92" />
    <ellipse cx="60" cy="30" rx="20" ry="13" fill="#e3f2fd" opacity="0.7" />
    <ellipse cx="54" cy="26" rx="7"  ry="5"  fill="white" opacity="0.5" />
    <ellipse cx="60" cy="48" rx="42" ry="11" fill={bodyFill} />
    <ellipse cx="60" cy="46" rx="38" ry="9"  fill="#b0bec5" />
    {lights.map((l, i) => (
      <circle key={i} cx={l.cx} cy={l.cy} r="4" fill={l.fill}>
        <animate attributeName="opacity" values="1;0.2;1"
          dur={l.dur} begin={l.begin} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Alien face */}
    <ellipse cx="60" cy="27" rx="8" ry="9" fill={alienColor} opacity="0.9" />
    <circle cx="56.5" cy="25" r="2.2" fill={eyeColor} />
    <circle cx="63.5" cy="25" r="2.2" fill={eyeColor} />
    <ellipse cx="57"  cy="24" rx="0.8" ry="1" fill="white" opacity="0.6" />
    <ellipse cx="64"  cy="24" rx="0.8" ry="1" fill="white" opacity="0.6" />
    <path d="M56 30 Q60 33 64 30" stroke={eyeColor} strokeWidth="1.3" fill="none" />
    {/* Antennae */}
    <line x1="55" y1="18" x2="50" y2="12" stroke={alienColor} strokeWidth="1.5" />
    <circle cx="50" cy="11" r="2.5" fill="#ef9a9a" />
    <line x1="65" y1="18" x2="70" y2="12" stroke={alienColor} strokeWidth="1.5" />
    <circle cx="70" cy="11" r="2.5" fill="#ef9a9a" />
  </svg>
);

const UFO1 = () => (
  <UFOBase
    animClass="dg-ufo-1"
    alienColor="#a5d6a7" eyeColor="#1b5e20"
    bodyFill="#78909c" ringGlow="rgba(80,255,180,0.18)"
    lights={[
      { cx:30, cy:47, fill:'#ff5252', dur:'0.6s', begin:'0s'    },
      { cx:45, cy:44, fill:'#ffeb3b', dur:'0.7s', begin:'0.1s'  },
      { cx:60, cy:43, fill:'#69f0ae', dur:'0.5s', begin:'0.2s'  },
      { cx:75, cy:44, fill:'#40c4ff', dur:'0.8s', begin:'0.05s' },
      { cx:90, cy:47, fill:'#ea80fc', dur:'0.6s', begin:'0.3s'  },
    ]}
  />
);

const UFO2 = () => (
  <UFOBase
    animClass="dg-ufo-2"
    alienColor="#ffcc80" eyeColor="#e65100"
    bodyFill="#ab47bc" ringGlow="rgba(180,130,255,0.15)"
    lights={[
      { cx:35, cy:47, fill:'#ffd740', dur:'0.5s', begin:'0s'    },
      { cx:52, cy:44, fill:'#ff4081', dur:'0.7s', begin:'0.15s' },
      { cx:68, cy:44, fill:'#18ffff', dur:'0.6s', begin:'0.3s'  },
      { cx:85, cy:47, fill:'#b2ff59', dur:'0.8s', begin:'0.1s'  },
    ]}
  />
);

const UFO3 = () => (
  <UFOBase
    animClass="dg-ufo-3"
    alienColor="#80deea" eyeColor="#006064"
    bodyFill="#607d8b" ringGlow="rgba(80,200,255,0.15)"
    lights={[
      { cx:32, cy:47, fill:'#ff9800', dur:'0.55s', begin:'0s'    },
      { cx:48, cy:44, fill:'#00bcd4', dur:'0.65s', begin:'0.12s' },
      { cx:64, cy:43, fill:'#8bc34a', dur:'0.48s', begin:'0.25s' },
      { cx:80, cy:44, fill:'#ff5722', dur:'0.72s', begin:'0.08s' },
      { cx:90, cy:47, fill:'#9c27b0', dur:'0.58s', begin:'0.33s' },
    ]}
  />
);

const UFO4 = () => (
  <UFOBase
    animClass="dg-ufo-4"
    alienColor="#f48fb1" eyeColor="#880e4f"
    bodyFill="#4db6ac" ringGlow="rgba(255,150,200,0.15)"
    lights={[
      { cx:30, cy:47, fill:'#ffeb3b', dur:'0.62s', begin:'0s'    },
      { cx:50, cy:44, fill:'#ff1744', dur:'0.73s', begin:'0.18s' },
      { cx:70, cy:43, fill:'#76ff03', dur:'0.51s', begin:'0.28s' },
      { cx:90, cy:47, fill:'#40c4ff', dur:'0.68s', begin:'0.09s' },
    ]}
  />
);

const UFO5 = () => (
  <UFOBase
    animClass="dg-ufo-5"
    alienColor="#fff176" eyeColor="#f57f17"
    bodyFill="#8d6e63" ringGlow="rgba(255,220,80,0.15)"
    lights={[
      { cx:35, cy:47, fill:'#e040fb', dur:'0.58s', begin:'0s'    },
      { cx:52, cy:44, fill:'#00e5ff', dur:'0.69s', begin:'0.14s' },
      { cx:68, cy:44, fill:'#ff6d00', dur:'0.52s', begin:'0.22s' },
      { cx:85, cy:47, fill:'#69f0ae', dur:'0.77s', begin:'0.06s' },
    ]}
  />
);

const UFO6 = () => (
  <UFOBase
    animClass="dg-ufo-6"
    alienColor="#ce93d8" eyeColor="#6a1b9a"
    bodyFill="#546e7a" ringGlow="rgba(200,100,255,0.15)"
    lights={[
      { cx:33, cy:47, fill:'#ff8a65', dur:'0.60s', begin:'0s'    },
      { cx:50, cy:44, fill:'#40c4ff', dur:'0.71s', begin:'0.16s' },
      { cx:67, cy:43, fill:'#ffeb3b', dur:'0.49s', begin:'0.27s' },
      { cx:84, cy:47, fill:'#b2ff59', dur:'0.66s', begin:'0.11s' },
    ]}
  />
);

/* ─────────────────────────────────────────────────────────
   Asteroid SVG
───────────────────────────────────────────────────────── */
const ASTEROID_PATHS = [
  'm0-8 3-5 6-1 5 3 4 6 0 8-3 5-6 2-5-3-4-6z',
  'm0-7 4-4 6 0 4 4 2 7-2 5-5 3-6 0-4-4-1-7z',
  'm0-6 5-3 5 1 3 5 0 7-4 4-6 1-4-3-2-6z',
];

const Asteroids = () => (
  <>
    {[
      { dur:'12s', delay:'0s',  y:'15vh', scale:1   },
      { dur:'16s', delay:'5s',  y:'72vh', scale:1.3 },
      { dur:'10s', delay:'9s',  y:'40vh', scale:0.8 },
      { dur:'14s', delay:'3s',  y:'85vh', scale:1.1 },
      { dur:'18s', delay:'14s', y:'28vh', scale:0.7 },
    ].map((a, i) => (
      <div
        key={i}
        className="dg-asteroid"
        style={{ '--dur': a.dur, '--delay': a.delay, '--y': a.y }}
        aria-hidden="true"
      >
        <svg viewBox="-10 -10 20 20" width={30 * a.scale} height={30 * a.scale}>
          <path
            d={ASTEROID_PATHS[i % ASTEROID_PATHS.length]}
            fill="#8d6e63" stroke="#6d4c41" strokeWidth="0.5" opacity="0.85"
          />
        </svg>
      </div>
    ))}
  </>
);

/* ─────────────────────────────────────────────────────────
   Full space background
───────────────────────────────────────────────────────── */
const SpaceBackground = () => (
  <>
    <StarField />

    {/* Nebula blobs */}
    {[1,2,3,4,5,6].map(n => (
      <div key={n} className={`dg-nebula dg-nebula-${n}`} aria-hidden="true" />
    ))}

    {/* Shooting stars */}
    {Array.from({length:10},(_,i) => (
      <div key={i} className={`dg-shoot dg-shoot-${i+1}`} aria-hidden="true" />
    ))}

    {/* Solo planets */}
    {Array.from({length:12},(_,i) => (
      <div key={i} className={`dg-planet dg-planet-${i+1}`} aria-hidden="true" />
    ))}

    {/* Ringed planets */}
    <div className="dg-saturn" aria-hidden="true">
      <div className="dg-saturn-body"><div className="dg-saturn-ring" /></div>
    </div>
    <div className="dg-ringed-planet" aria-hidden="true">
      <div className="dg-ringed-body"><div className="dg-ringed-ring" /></div>
    </div>
    <div className="dg-ringed-planet-2" aria-hidden="true">
      <div className="dg-ringed-body-2"><div className="dg-ringed-ring-2" /></div>
    </div>

    {/* Asteroids */}
    <Asteroids />

    {/* Sparkles */}
    {[
      { s:'✦', cls:'dg-sparkle-1'  },
      { s:'✧', cls:'dg-sparkle-2'  },
      { s:'✦', cls:'dg-sparkle-3'  },
      { s:'✧', cls:'dg-sparkle-4'  },
      { s:'★', cls:'dg-sparkle-5'  },
      { s:'✦', cls:'dg-sparkle-6'  },
      { s:'✧', cls:'dg-sparkle-7'  },
      { s:'✦', cls:'dg-sparkle-8'  },
      { s:'★', cls:'dg-sparkle-9'  },
      { s:'✧', cls:'dg-sparkle-10' },
      { s:'✦', cls:'dg-sparkle-11' },
      { s:'★', cls:'dg-sparkle-12' },
    ].map((item, i) => (
      <div key={i} className={`dg-sparkle ${item.cls}`} aria-hidden="true">
        {item.s}
      </div>
    ))}

    {/* UFO Aliens */}
    <UFO1 /><UFO2 /><UFO3 /><UFO4 /><UFO5 /><UFO6 />

  
  </>
);

/* ─────────────────────────────────────────────────────────
   Main page component
───────────────────────────────────────────────────────── */
const DysgraphiaHome = () => {
  const navigate = useNavigate();

  return (
    <main className="dg-home-shell">
      <SpaceBackground />

      <section className="dg-home-card">
        <p className="dg-home-chip">🚀 අකුරු ගවේෂණ ගමන</p>
        <h1 className="dg-home-title">අවකාශ අකුරු ජයගනිමු!</h1>
        <p className="dg-home-subtitle">
          හේයි! රොකට්ටුවත් ඇලියන් යාළුවන්ත් එක්ක අකුරු ලොවට යමුද? 🛸✨
        </p>

        <div className="dg-home-letters-grid">
          <article className="dg-home-letter-box dg-box-a">
            <div className="dg-home-letter dg-letter-a">අ</div>
            <button
              type="button"
              className="dg-ctl-btn dg-ctl-orange"
              onClick={() => navigate('/dysgraphia/letter-a')}
            >
              ✍️ අ අකුර ආරම්භ කරන්න
            </button>
          </article>

          <article className="dg-home-letter-box dg-box-ta">
            <div className="dg-home-letter dg-letter-ta">ට</div>
            <button
              type="button"
              className="dg-ctl-btn dg-ctl-blue"
              onClick={() => navigate('/dysgraphia/letter-ta')}
            >
              ✍️ ට අකුර ආරම්භ කරන්න
            </button>
          </article>

          <article className="dg-home-letter-box dg-box-ra">
            <div className="dg-home-letter dg-letter-ra">ර</div>
            <button
              type="button"
              className="dg-ctl-btn dg-ctl-teal"
              onClick={() => navigate('/dysgraphia/letter-ra')}
            >
              ✍️ ර අකුර ආරම්භ කරන්න
            </button>
          </article>
        </div>
      </section>
    </main>
  );
};

export default DysgraphiaHome;