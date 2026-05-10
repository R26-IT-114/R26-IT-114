import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';
import '../styles/dyscalculia-cartoon2.css';
import miniMouseImg from '../../../assets/images/dyscalculiaimages/minimouse.png';
import scoobyImg from '../../../assets/images/dyscalculiaimages/scooby.png';
import genieImg from '../../../assets/images/dyscalculiaimages/Genie Aladdin 01.svg';
import lionImg from '../../../assets/images/dyscalculiaimages/lion.png';

const DIGITS = Array.from({ length: 10 }, (_, i) => i);
const DIGIT_WORDS_SI = ['බිංදුව', 'එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය'];

/* Emoji mascots — one per digit card */
const DIGIT_EMOJIS = ['🎪', '🎠', '🎡', '🎢', '🤹', '🎭', '🎈', '🎉', '🦁', '🐘'];

const NumberTracingGameCard = () => {
  const navigate = useNavigate();

  return (
    <main className="dc-shell dc-cartoon-bg ntc-theme">

      {/* ── Back Button ── */}
      <button
        type="button"
        className="dg-home-btn dc-back-button"
        onClick={() => navigate('/dyscalculia')}
        aria-label="පසුපස යන්න"
      >
        ← පසුපස
      </button>

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
            <span className="dc-title-icon" aria-hidden="true">🎪</span>
            අංක ඉගෙනීම සහ ඇඳීම
            <span className="dc-title-range"> (0 – 9)</span>
          </h1>
          <p className="dc-subtitle ntc-subtitle">
            🎠 අංකයක් තෝරා පියවරෙන් පියවර ඇඳීම පුහුණු වෙමු! 🎡
          </p>
        </header>

        {/* ── Digit Grid ── */}
        <div className="dc-grid ntc-grid" role="list" aria-label="පුහුණුව සඳහා අංකයක් තෝරන්න">
          {DIGITS.map((d, i) => (
            <button
              key={d}
              type="button"
              role="listitem"
              onClick={() => navigate(`/dyscalculia/number-tracing/${d}`)}
              className={`dc-digit-card dc-digit-card--${d}`}
              aria-label={`අංක ${d} ඇඳීම පුහුණු කරන්න`}
            >
              {/* Emoji mascot top-right */}
              <span className="dc-card-emoji" aria-hidden="true">
                {DIGIT_EMOJIS[i]}
              </span>

              {/* The big digit */}
              <span className="dc-card-num">{d}</span>

              {/* Word label */}
              <span className="dc-card-word">
                {DIGIT_WORDS_SI[d]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Bottom cheer line ── */}
        <p className="dc-cheer" aria-live="polite">
          🌟 ඔබට පුළුවන්! දිගටම පුහුණු වෙමු! 🌟
        </p>

      </section>

      <style>{`
        .ntc-theme {
          background:
            radial-gradient(circle at 8% 16%, rgba(255, 236, 137, 0.9), transparent 33%),
            radial-gradient(circle at 86% 14%, rgba(142, 227, 255, 0.82), transparent 35%),
            radial-gradient(circle at 83% 88%, rgba(255, 170, 210, 0.8), transparent 33%),
            linear-gradient(145deg, #ffeac0 0%, #ffd6ea 38%, #d6f4ff 70%, #fff5bf 100%) !important;
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

        .ntc-stage {
          position: relative;
          z-index: 5;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.62);
          border-radius: 28px;
          padding: 16px 14px 22px;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.16);
          backdrop-filter: blur(6px);
          margin-top: 18px;
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
        }
      `}</style>
    </main>
  );
};

export default NumberTracingGameCard;