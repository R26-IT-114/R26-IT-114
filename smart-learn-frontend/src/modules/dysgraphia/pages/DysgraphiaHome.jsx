import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-home.css'; // ← NEW animated background styles

/* ─────────────────────────────────────────────────────────
   Inline SVG of the Rocket Rabbit (no external asset needed)
   Designed to match the uploaded reference image palette.
───────────────────────────────────────────────────────── */
const RocketRabbitSVG = () => (
  <svg
    className="dg-rocket-rabbit"
    viewBox="0 0 200 260"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* ── Rocket body ── */}
    <g className="rocket-group">
      {/* Rocket fuselage */}
      <ellipse cx="100" cy="155" rx="28" ry="55" fill="#d0d8e8" />
      <ellipse cx="100" cy="155" rx="28" ry="55" fill="url(#rocketShine)" />

      {/* Red nose cone */}
      <ellipse cx="100" cy="100" rx="28" ry="30" fill="#e03030" />
      <path d="M72 105 Q100 60 128 105 Z" fill="#cc2020" />

      {/* Window */}
      <circle cx="100" cy="150" r="16" fill="#7ec8e3" opacity="0.9" />
      <circle cx="100" cy="150" r="16" fill="none" stroke="#4a90c0" strokeWidth="3" />
      <ellipse cx="94" cy="144" rx="5" ry="7" fill="white" opacity="0.5" />

      {/* Left fin */}
      <path d="M72 185 L52 215 L72 205 Z" fill="#c0c8d8" />
      <path d="M72 185 L52 215 L72 205 Z" fill="#cc2020" opacity="0.6" />
      {/* Right fin */}
      <path d="M128 185 L148 215 L128 205 Z" fill="#c0c8d8" />
      <path d="M128 185 L148 215 L128 205 Z" fill="#cc2020" opacity="0.6" />

      {/* Flame */}
      <g className="rocket-flame">
        <ellipse cx="100" cy="213" rx="14" ry="22" fill="#ff9900" opacity="0.95" />
        <ellipse cx="100" cy="210" rx="8"  ry="15" fill="#ffdd00" />
        <ellipse cx="100" cy="208" rx="4"  ry="8"  fill="white"  opacity="0.8" />
      </g>
    </g>

    {/* ── Rabbit body (sits on top of rocket) ── */}
    <g className="rabbit-body">
      {/* Ears */}
      <ellipse cx="85"  cy="60" rx="9"  ry="22" fill="#d4956a" transform="rotate(-12 85 60)" />
      <ellipse cx="115" cy="58" rx="9"  ry="22" fill="#d4956a" transform="rotate(10 115 58)" />
      <ellipse cx="85"  cy="62" rx="5"  ry="16" fill="#f7c4a8" transform="rotate(-12 85 62)" />
      <ellipse cx="115" cy="60" rx="5"  ry="16" fill="#f7c4a8" transform="rotate(10 115 60)" />

      {/* Head */}
      <ellipse cx="100" cy="92" rx="26" ry="24" fill="#d4956a" />
      <ellipse cx="100" cy="92" rx="26" ry="24" fill="url(#rabbitFur)" />

      {/* Eyes */}
      <ellipse cx="91"  cy="87" rx="5"  ry="6"  fill="white" />
      <ellipse cx="109" cy="87" rx="5"  ry="6"  fill="white" />
      <circle  cx="92"  cy="88" r="3"   fill="#2a1a0a" />
      <circle  cx="110" cy="88" r="3"   fill="#2a1a0a" />
      <circle  cx="93"  cy="86.5" r="1" fill="white" />
      <circle  cx="111" cy="86.5" r="1" fill="white" />

      {/* Nose + mouth */}
      <ellipse cx="100" cy="97" rx="3"  ry="2"  fill="#e07080" />
      <path d="M97 99 Q100 103 103 99" stroke="#c05060" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Cheek blush */}
      <ellipse cx="86"  cy="96" rx="6"  ry="4"  fill="#f0a0a0" opacity="0.45" />
      <ellipse cx="114" cy="96" rx="6"  ry="4"  fill="#f0a0a0" opacity="0.45" />

      {/* Body / jacket */}
      <ellipse cx="100" cy="128" rx="22" ry="20" fill="#3a5a8a" />
      {/* Star badge */}
      <text x="93" y="133" fontSize="12" fill="#ffd700">★</text>

      {/* Goggle / helmet hint */}
      <path d="M76 90 Q100 75 124 90" stroke="#6a8ab0" strokeWidth="2.5" fill="none" />

      {/* Arms holding rocket */}
      <ellipse cx="76"  cy="128" rx="8" ry="5" fill="#3a5a8a" transform="rotate(-30 76 128)" />
      <ellipse cx="124" cy="128" rx="8" ry="5" fill="#3a5a8a" transform="rotate(30 124 128)" />
      <ellipse cx="68"  cy="134" rx="7" ry="5" fill="#d4956a" transform="rotate(-30 68 134)" />
      <ellipse cx="132" cy="134" rx="7" ry="5" fill="#d4956a" transform="rotate(30 132 134)" />
    </g>

    {/* ── Gradients ── */}
    <defs>
      <radialGradient id="rocketShine" cx="35%" cy="30%" r="60%">
        <stop offset="0%"   stopColor="white"   stopOpacity="0.25" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="rabbitFur" cx="40%" cy="35%" r="55%">
        <stop offset="0%"   stopColor="#e8b48a" stopOpacity="0.4" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
  </svg>
);

/* ─────────────────────────────────────────────────────────
   Star field background layer (pure HTML divs)
───────────────────────────────────────────────────────── */
const SpaceBackground = () => (
  <>
    <div className="dg-stars-layer" aria-hidden="true" />
    <div className="dg-nebula dg-nebula-1" aria-hidden="true" />
    <div className="dg-nebula dg-nebula-2" aria-hidden="true" />
    <div className="dg-nebula dg-nebula-3" aria-hidden="true" />
    <RocketRabbitSVG />
  </>
);

/* ─────────────────────────────────────────────────────────
   Main page component
───────────────────────────────────────────────────────── */
const DysgraphiaHome = () => {
  const navigate = useNavigate();

  return (
    <main className="dg-home-shell">
      {/* Animated space background – rendered BEHIND the card */}
      <SpaceBackground />

      <section className="dg-home-card">
        <div className="dg-home-rainbow" aria-hidden="true">
          <span className="dg-rainbow-band band-red" />
          <span className="dg-rainbow-band band-orange" />
          <span className="dg-rainbow-band band-yellow" />
          <span className="dg-rainbow-band band-green" />
          <span className="dg-rainbow-band band-blue" />
          <span className="dg-rainbow-band band-purple" />
        </div>

        <p className="dg-home-chip">🌈 වර්ණවත් අකුරු පුහුණුව</p>
        <h1 className="dg-home-title">අතින් ලිවීමේ සතුටු ගමන</h1>
        <p className="dg-home-subtitle">
          හේයි! අපි එකතු වෙලා අකුරු ලියමුද?
        </p>

        <div className="dg-home-letters-grid">
          <article className="dg-home-letter-box dg-box-a">
            <div className="dg-home-letter">අ</div>
            <button
              type="button"
              className="dg-ctl-btn dg-ctl-primary dg-ctl-rainbow"
              onClick={() => navigate('/dysgraphia/letter-a')}
            >
              ✍️ අ අකුර ආරම්භ කරන්න
            </button>
          </article>

          <article className="dg-home-letter-box dg-box-ta">
            <div className="dg-home-letter">ට</div>
            <button
              type="button"
              className="dg-ctl-btn dg-ctl-primary dg-ctl-sky"
              onClick={() => navigate('/dysgraphia/letter-ta')}
            >
              ✍️ ට අකුර ආරම්භ කරන්න
            </button>
          </article>
        </div>

        
      </section>
    </main>
  );
};

export default DysgraphiaHome;