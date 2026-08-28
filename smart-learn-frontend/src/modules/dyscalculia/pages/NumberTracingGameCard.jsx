import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/dyscalculia-cartoon.css';
import '../styles/dyscalculia-cartoon2.css';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import DifficultySelector from '../components/DifficultySelector';
import { getGameLevels } from '../utils/gameLevelProgress';
import miniMouseImg from '../../../assets/images/dyscalculiaimages/minimouse.png';
import scoobyImg from '../../../assets/images/dyscalculiaimages/scooby.png';
import genieImg from '../../../assets/images/dyscalculiaimages/Genie Aladdin 01.svg';
import lionImg from '../../../assets/images/dyscalculiaimages/lion.png';
import shellTracingBackground from '../../../assets/images/dyscalculia-backgrounds/shell-tracing-shore.png';

const LEVEL_DIGITS = { easy: [0, 1, 2, 7], medium: [9, 3, 6], hard: [5, 8, 4] };
const DIGIT_WORDS_SI = ['බිංදුව', 'එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය'];

/* Emoji mascots — one per digit card */
const DIGIT_EMOJIS = ['🐚', '🐢', '🐠', '🦀', '⭐', '🐙', '🐳', '🪸', '🫧', '🐬'];

const NumberTracingGameCard = () => {
  const navigate = useNavigate();
  // Show playable cards immediately when this route opens. The selector in the
  // page header still lets the learner switch to Medium or Hard.
  const [level, setLevel] = useState('easy');
  const [levels] = useState(() => getGameLevels('NumberTracingGame'));

  return (
    <main className="dc-shell dc-cartoon-bg ntc-theme adventure-land station-shell-shore">
      <AdventureBackdrop station='shell-tracing-shore' message='Shell Tracing Shore එකේ අංකයක් තෝරමු! 🐚' />

      {/* ── Back Button ── */}
      <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='aqua' />

      <div className="ntc-deco-layer" aria-hidden="true">
        <span className="ntc-orb orb-1" />
        <span className="ntc-orb orb-2" />
        <span className="ntc-orb orb-3" />
        <span className="ntc-orb orb-4" />
      </div>

      <img src={miniMouseImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--left" />
      <img src={scoobyImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--right" />
      <img src={genieImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--bottom" />
      <img src={lionImg} alt="" aria-hidden="true" className="ntc-mascot ntc-mascot--top" />

      {/* ── Floating balloon decorations ── */}
      <span className="dc-balloon dc-balloon--1" aria-hidden="true">🎈</span>
      <span className="dc-balloon dc-balloon--2" aria-hidden="true">🎈</span>
      <span className="dc-balloon dc-balloon--3" aria-hidden="true">🎈</span>

      <section className="dc-stage ntc-stage">

        {/* ── Header ── */}
        <header className="dc-header-box ntc-header-box">
          <div className="dc-header-stars" aria-hidden="true">⭐ ✨ 🌟 ⭐ ✨ 🌟 ⭐</div>
          <h1 className="dc-title">
            <span className="dc-title-icon" aria-hidden="true">🐚</span>
            අංක ඉගෙනීම සහ ඇඳීම
            <span className="dc-title-range"> (0 – 9)</span>
          </h1>
          <p className="dc-subtitle ntc-subtitle">
            🐢 අංක 2ක් නිවැරදිව සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු! 🫧
          </p>
          <DifficultySelector levels={levels} selected={level} onSelect={setLevel} />
        </header>

        {/* ── Digit Grid ── */}
        <div className="dc-grid ntc-grid" role="list" aria-label="පුහුණුව සඳහා අංකයක් තෝරන්න">
          {(level ? LEVEL_DIGITS[level] : []).map((d) => (
            <button
              key={d}
              type="button"
              role="listitem"
              onClick={() => navigate(`/dyscalculia/number-tracing/${d}?level=${level}`)}
              className={`dc-digit-card dc-digit-card--${d}`}
              aria-label={`අංක ${d} ඇඳීම පුහුණු කරන්න`}
            >
              {/* Emoji mascot top-right */}
              <span className="dc-card-emoji" aria-hidden="true">
                {DIGIT_EMOJIS[d]}
              </span>

              {/* The big digit */}
              <span className="dc-card-num">{d}</span>
              {/* <img
                src={NUMBER_IMAGES[d]}
                alt={DIGIT_WORDS_SI[d]}
                className="dc-card-number-image"
              /> */}

              {/* Word label */}
              <span className="dc-card-word">
                {DIGIT_WORDS_SI[d]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Bottom cheer line ── */}
        <p className="dc-cheer" aria-live="polite">{level ? '🐢 ඔබට පුළුවන්! දිගටම පුහුණු වෙමු! ⭐' : '🐢 Tiki: ආරම්භ කිරීමට Easy, Medium, හෝ Hard තෝරන්න!'}</p>

      </section>

      <style>{`
        .ntc-theme {
          display: block !important;
          width: 100%;
          min-height: 100dvh;
          padding: 72px 16px 60px;
          overflow-x: hidden;
          overflow-y: auto;
          background:
            radial-gradient(circle at 8% 16%, rgba(220, 252, 255, 0.9), transparent 33%),
            radial-gradient(circle at 86% 14%, rgba(99, 225, 235, 0.82), transparent 35%),
            radial-gradient(circle at 83% 88%, rgba(74, 179, 218, 0.58), transparent 33%),
            linear-gradient(145deg, #e5fcff 0%, #8ce3eb 45%, #3aa7d1 100%) !important;
          background-size: 145% 145% !important;
          animation: ntcBgMove 16s ease infinite;
        }

        @keyframes ntcBgMove {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        .ntc-deco-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .ntc-orb {
          position: absolute;
          border-radius: 999px;
          opacity: 0.46;
          filter: blur(1px);
          animation: ntcFloat 8s ease-in-out infinite;
        }

        .ntc-orb.orb-1 {
          width: 220px;
          height: 220px;
          left: -44px;
          top: 60px;
          background: radial-gradient(circle, rgba(255, 155, 86, 0.92), rgba(255, 155, 86, 0.08));
        }

        .ntc-orb.orb-2 {
          width: 180px;
          height: 180px;
          right: -34px;
          top: 220px;
          background: radial-gradient(circle, rgba(106, 210, 255, 0.9), rgba(106, 210, 255, 0.08));
          animation-delay: 1.2s;
        }

        .ntc-orb.orb-3 {
          width: 240px;
          height: 240px;
          left: 16%;
          bottom: -120px;
          background: radial-gradient(circle, rgba(255, 136, 196, 0.88), rgba(255, 136, 196, 0.05));
          animation-delay: 0.6s;
        }

        .ntc-orb.orb-4 {
          width: 190px;
          height: 190px;
          right: 10%;
          bottom: -70px;
          background: radial-gradient(circle, rgba(255, 220, 98, 0.88), rgba(255, 220, 98, 0.06));
          animation-delay: 1.8s;
        }

        @keyframes ntcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        .ntc-mascot {
          position: fixed;
          z-index: 2;
          pointer-events: none;
          filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.2));
          animation: ntcBuddy 3.2s ease-in-out infinite;
        }

        .ntc-mascot--left {
          width: clamp(72px, 10vw, 118px);
          left: 16px;
          top: 116px;
        }

        .ntc-mascot--right {
          width: clamp(82px, 12vw, 132px);
          right: 16px;
          top: 112px;
          animation-delay: 0.6s;
        }

        .ntc-mascot--bottom {
          width: clamp(74px, 11vw, 120px);
          right: 22px;
          bottom: 22px;
          animation-delay: 1.2s;
        }

        .ntc-mascot--top {
          width: clamp(68px, 10vw, 106px);
          left: 18px;
          bottom: 20px;
          animation-delay: 1.7s;
        }

        @keyframes ntcBuddy {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }

        .dc-card-number-image {
          width: 70px;
          height: 70px;
          object-fit: contain;
          margin: 8px auto;
          display: block;
          transition: transform 0.3s ease;
        }

        .dc-digit-card:hover .dc-card-number-image {
          transform: scale(1.08);
        }
        .ntc-stage {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative;
          z-index: 5;
          width: min(980px, 100%);
          min-height: 320px;
          margin: 18px auto 0;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.62);
          border-radius: 28px;
          padding: 16px 14px 22px;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(6px);
        }

        .ntc-stage > * {
          visibility: visible !important;
          opacity: 1 !important;
        }

        .ntc-header-box,
        .ntc-grid {
          display: grid !important;
        }

        .ntc-header-box {
          justify-items: center;
        }

        .ntc-header-box {
          background: linear-gradient(135deg, #ff6e7a 0%, #ff9f1a 38%, #4acb66 100%);
          border-color: rgba(255, 239, 138, 0.95);
        }

        .ntc-subtitle {
          color: #fff8c4;
          font-size: clamp(0.95rem, 2.3vw, 1.1rem);
        }

        .ntc-grid .dc-digit-card {
          min-height: 126px;
          border: 2px solid rgba(255, 255, 255, 0.22);
        }

        .ntc-grid .dc-card-word {
          font-size: 0.76rem;
          text-transform: none;
          letter-spacing: 0.4px;
        }

        /* Keep the tracing picker as one compact page. Shared beach and level
           styles also support full-screen selectors, so this page explicitly
           opts its embedded selector back into an inline header layout. */
        main.dc-shell.dc-cartoon-bg.ntc-theme {
          min-height: calc(100dvh - 52px);
          padding: clamp(18px, 3vw, 36px) clamp(12px, 3vw, 32px) 44px;
          background:
            linear-gradient(rgba(225, 249, 255, 0.2), rgba(255, 246, 218, 0.16)),
            url(${shellTracingBackground}) center center / cover no-repeat fixed !important;
          background-size: cover !important;
          background-position: center center !important;
          background-repeat: no-repeat !important;
          animation: none !important;
        }

        .ntc-theme > .nal-backdrop,
        .ntc-theme > .nal-floating-mascot,
        .ntc-theme > .ntc-deco-layer,
        .ntc-theme > .ntc-mascot,
        .ntc-theme > .dc-balloon {
          display: none !important;
        }

        .ntc-theme::after {
          display: none !important;
        }

        @media (max-width: 700px) {
          main.dc-shell.dc-cartoon-bg.ntc-theme {
            background-position: center top !important;
            background-attachment: scroll !important;
          }
        }

        .ntc-stage {
          width: min(1120px, 100%);
          min-height: 0;
          margin: 0 auto;
          padding: clamp(16px, 2.5vw, 28px);
          border: 2px solid rgba(255, 255, 255, 0.92) !important;
          border-radius: 30px;
          background: rgba(248, 254, 255, 0.93) !important;
          box-shadow: 0 22px 55px rgba(8, 87, 124, 0.22) !important;
          backdrop-filter: blur(10px);
        }

        .ntc-header-box {
          display: block !important;
          margin: 0 0 clamp(18px, 2.5vw, 28px);
          padding: clamp(18px, 2.5vw, 28px);
          overflow: visible;
          border: 2px solid rgba(93, 204, 219, 0.7) !important;
          border-radius: 24px;
          background: linear-gradient(145deg, #fffdf4, #e5faff) !important;
          box-shadow: 0 10px 28px rgba(15, 126, 158, 0.13) !important;
        }

        .ntc-header-box::before,
        .ntc-header-stars {
          display: none;
        }

        .ntc-header-box .dc-title {
          margin: 0 0 8px;
          color: #164663;
          font-size: clamp(1.55rem, 3vw, 2.25rem);
          text-shadow: none;
        }

        .ntc-header-box .ntc-subtitle {
          margin: 0;
          color: #3b718a;
          text-shadow: none;
        }

        .ntc-header-box .dc-level-screen {
          min-height: 0;
          margin: 18px 0 0;
          padding: 0;
          overflow: visible;
          background: transparent !important;
        }

        .ntc-header-box .dc-level-screen::before,
        .ntc-header-box .dc-level-screen::after {
          display: none !important;
          content: none !important;
        }

        .ntc-header-box .dc-level-selector {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          width: 100%;
          gap: 14px;
          margin: 0;
        }

        .ntc-header-box .dc-level-button {
          width: 100%;
          min-height: 112px;
          padding: 12px;
          border-radius: 18px;
        }

        .ntc-header-box .dc-level-button span {
          font-size: 1.65rem;
        }

        .ntc-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: clamp(12px, 2vw, 20px);
        }

        .ntc-grid .dc-digit-card {
          min-height: 150px;
          padding: 18px 12px;
          border: 2px solid #65cbd7 !important;
          border-radius: 22px;
        }

        .ntc-grid .dc-card-num {
          color: #164663;
          font-size: clamp(3rem, 6vw, 4.7rem);
          line-height: 1;
          text-shadow: 0 3px 0 rgba(255, 255, 255, 0.9);
        }

        .ntc-grid .dc-card-word {
          color: #466c7d;
          font-size: 0.9rem;
          font-weight: 900;
        }

        .ntc-theme .dc-cheer {
          margin: 24px 0 0;
          color: #167fa5 !important;
          font-size: clamp(0.95rem, 2vw, 1.15rem);
        }

        @media (max-width: 900px) {
          .ntc-mascot--left,
          .ntc-mascot--right {
            width: 86px;
          }
        }

        @media (max-width: 760px) {
          .ntc-mascot {
            display: none;
          }

          .ntc-stage {
            margin-top: 10px;
            border-radius: 22px;
          }

          .ntc-grid .dc-digit-card {
            min-height: 96px;
          }

          .ntc-grid .dc-card-word {
            font-size: 0.62rem;
          }

          .ntc-header-box .dc-level-selector {
            grid-template-columns: 1fr;
          }

          .ntc-header-box .dc-level-button {
            min-height: 88px;
          }

          .ntc-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ntc-grid .dc-digit-card {
            min-height: 118px;
          }
        }

        @media (max-width: 760px) {
        .dc-card-number-image {
          width: 50px;
          height: 50px;
        }
      }
      `}</style>
    </main>
  );
};

export default NumberTracingGameCard;
