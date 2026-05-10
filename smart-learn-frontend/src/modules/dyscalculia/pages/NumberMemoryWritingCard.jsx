import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';

const DIGITS = Array.from({ length: 10 }, (_, i) => i);

const NumberMemoryWritingCard = () => {
  const navigate = useNavigate();

  return (
    <main className="dg-shell dg-theme-ta dc-number-page dc-cartoon-bg memory-writing-theme">
      <div className="nmw-decor-layer" aria-hidden="true">
        <span className="nmw-blob b1" />
        <span className="nmw-blob b2" />
        <span className="nmw-blob b3" />
        <span className="nmw-blob b4" />
        <span className="nmw-star s1">✦</span>
        <span className="nmw-star s2">★</span>
        <span className="nmw-star s3">✧</span>
        <span className="nmw-star s4">★</span>
      </div>

      <button
        type="button"
        className="dg-home-btn dc-back-button"
        onClick={() => navigate('/dyscalculia')}
        aria-label="Back"
      >
        ←
      </button>

      <section className="dg-stage nmw-stage">
        <header className="dg-header dc-instruction-box nmw-header">
          <h1>Memory Writing &amp; Evaluation (0-9)</h1>
          <p>Pick a digit, then write from memory.</p>
        </header>

        <div className="dg-digit-grid nmw-digit-grid">
          {DIGITS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => navigate(`/dyscalculia/number-memory-write/${d}`)}
              className="dg-digit-card"
              aria-label={`Practice memory writing digit ${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <style>{`
        .memory-writing-theme {
          background:
            radial-gradient(circle at 12% 16%, rgba(255, 240, 160, 0.82), transparent 34%),
            radial-gradient(circle at 85% 12%, rgba(152, 234, 255, 0.72), transparent 36%),
            radial-gradient(circle at 80% 84%, rgba(255, 190, 224, 0.68), transparent 38%),
            linear-gradient(140deg, #ffedd9 0%, #ffd4ea 38%, #d9f4ff 68%, #fff4b3 100%) !important;
          animation: nmwBgShift 14s ease infinite;
          background-size: 150% 150%;
        }

        @keyframes nmwBgShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        .nmw-decor-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .nmw-blob {
          position: absolute;
          border-radius: 999px;
          filter: blur(1px);
          opacity: 0.54;
          animation: nmwFloat 8s ease-in-out infinite;
        }

        .nmw-blob.b1 {
          width: 220px;
          height: 220px;
          top: -38px;
          left: -28px;
          background: radial-gradient(circle, rgba(255, 175, 87, 0.92), rgba(255, 175, 87, 0.1));
        }

        .nmw-blob.b2 {
          width: 190px;
          height: 190px;
          top: 18%;
          right: -56px;
          background: radial-gradient(circle, rgba(129, 216, 255, 0.9), rgba(129, 216, 255, 0.12));
          animation-delay: 1.6s;
        }

        .nmw-blob.b3 {
          width: 240px;
          height: 240px;
          bottom: -90px;
          left: 20%;
          background: radial-gradient(circle, rgba(255, 143, 193, 0.88), rgba(255, 143, 193, 0.1));
          animation-delay: 0.8s;
        }

        .nmw-blob.b4 {
          width: 180px;
          height: 180px;
          bottom: 8%;
          right: 8%;
          background: radial-gradient(circle, rgba(255, 230, 123, 0.9), rgba(255, 230, 123, 0.08));
          animation-delay: 2.2s;
        }

        .nmw-star {
          position: absolute;
          font-size: clamp(20px, 3vw, 30px);
          color: #ffffff;
          text-shadow: 0 0 16px rgba(255, 255, 255, 0.9);
          animation: nmwTwinkle 2.6s ease-in-out infinite;
        }

        .nmw-star.s1 { top: 12%; left: 16%; }
        .nmw-star.s2 { top: 26%; right: 12%; animation-delay: 0.6s; }
        .nmw-star.s3 { bottom: 18%; left: 11%; animation-delay: 1.2s; }
        .nmw-star.s4 { bottom: 26%; right: 18%; animation-delay: 1.7s; }

        @keyframes nmwTwinkle {
          0%, 100% { opacity: 0.42; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes nmwFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .nmw-stage {
          max-width: 980px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.18);
          border: 2px solid rgba(255, 255, 255, 0.55);
          border-radius: 30px;
          padding: 20px 16px 18px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(8px);
        }

        .nmw-header {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 246, 216, 0.95));
          border: 2px solid rgba(255, 200, 110, 0.45);
          border-radius: 22px;
        }

        .nmw-header h1 {
          background: linear-gradient(125deg, #ff6b81, #ff9f1a 38%, #45b649 70%, #3d84ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-size: clamp(1.2rem, 4.1vw, 2rem);
          margin-bottom: 8px;
        }

        .nmw-header p {
          color: #5f636f;
          font-weight: 700;
          margin: 0;
        }

        .nmw-digit-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(80px, 1fr));
          gap: 14px;
          padding: 12px;
        }

        .nmw-digit-grid .dg-digit-card {
          border: 2px solid rgba(255, 255, 255, 0.62);
          border-radius: 18px;
          background: linear-gradient(160deg, rgba(255,255,255,0.92), rgba(255,255,255,0.7));
          color: #2f4159;
          padding: 18px 0;
          font-size: 44px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .nmw-digit-grid .dg-digit-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(130deg, transparent 0%, rgba(255,255,255,0.32) 50%, transparent 100%);
          transform: translateX(-120%);
          transition: transform 0.35s ease;
        }

        .nmw-digit-grid .dg-digit-card:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 14px 24px rgba(0, 0, 0, 0.16);
          filter: saturate(1.08);
        }

        .nmw-digit-grid .dg-digit-card:hover::after {
          transform: translateX(120%);
        }

        .nmw-digit-grid .dg-digit-card:nth-child(5n + 1) { color: #ff5f6d; }
        .nmw-digit-grid .dg-digit-card:nth-child(5n + 2) { color: #e66a00; }
        .nmw-digit-grid .dg-digit-card:nth-child(5n + 3) { color: #2d9c3a; }
        .nmw-digit-grid .dg-digit-card:nth-child(5n + 4) { color: #2d6cdf; }
        .nmw-digit-grid .dg-digit-card:nth-child(5n + 5) { color: #8b45d9; }

        @media (max-width: 780px) {
          .nmw-stage {
            padding: 14px 10px 12px;
            border-radius: 22px;
          }

          .nmw-digit-grid {
            grid-template-columns: repeat(4, minmax(70px, 1fr));
            gap: 10px;
          }

          .nmw-digit-grid .dg-digit-card {
            font-size: 34px;
            padding: 14px 0;
          }
        }

        @media (max-width: 520px) {
          .nmw-digit-grid {
            grid-template-columns: repeat(3, minmax(64px, 1fr));
          }

          .nmw-digit-grid .dg-digit-card {
            font-size: 30px;
            padding: 12px 0;
          }

          .nmw-blob.b1,
          .nmw-blob.b3 {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </main>
  );
};

export default NumberMemoryWritingCard;

