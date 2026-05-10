import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';

import homeCharacterLeft from '../../../assets/images/dyscaculiaimages/Buzz Lightyear 01.png';
import homeCharacterRight from '../../../assets/images/dyscaculiaimages/Piglet 03.png';
import homeDecoration from '../../../assets/images/dyscaculiaimages/Character WALL 02.svg';
import homeExtraCharacter from '../../../assets/images/dyscaculiaimages/Tigger Pooh 01.svg';
import homeDecoration2 from '../../../assets/images/dyscaculiaimages/scooby-doo-0.svg';

const STAR_COLORS = ['#ffffff', '#ffe4b5', '#add8e6', '#ffcccb', '#b0e0e6', '#fff176', '#e0b0ff'];

const StarField = () => {
  const stars = Array.from({ length: 80 }, (_, i) => ({
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

const DyscalculiaHome = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  // Get stars from localStorage
  const getGameStars = (gameKey) => {
    const stars = localStorage.getItem(`game_${gameKey}_stars`);
    return stars ? parseInt(stars) : 0;
  };

  // Games Data - 4 Games (consolidated Number Tracing 0-9)
  const games = [
    {
      id: 1,
      key: 'number-tracing',
      name: 'අංක ලිවීම (0-9)',
      subName: 'Number Tracing (0-9)',
      icon: '✏️',
      route: '/dyscalculia/number/0',
      color: '#FF6B9D',
      bgGradient: 'linear-gradient(135deg, #FF6B9D, #C44569)',
      description: '✅ මඟ දක්වපු අිතිනිම් + අඳින ප්‍රශික්ෂණ + අන්ධ පරිශ්‍රමණ',
      modes: ['Guided Animation', 'Guided Drawing', 'Blind Practice'],
      stars: getGameStars('number-tracing')
    },
    {
      id: 2,
      key: 'listening',
      name: 'අහලා තෝරන්න',
      subName: 'Number Listening',
      icon: '🎧',
      route: '/dyscalculia/listening-game',
      color: '#ff6b81',
      bgGradient: 'linear-gradient(135deg, #ff6b81, #ff4757)',
      description: 'අහපු අංකය තෝරන්න',
      stars: getGameStars('listening')
    },
    {
      id: 3,
      key: 'sorting',
      name: 'අනුපිළිවෙලට',
      subName: 'Number Sorting',
      icon: '🧩',
      route: '/dyscalculia/number-sorting',
      color: '#a55eea',
      bgGradient: 'linear-gradient(135deg, #a55eea, #667eea)',
      description: 'අංක පිළිවෙලට සකසන්න',
      stars: getGameStars('sorting')
    },
    {
      id: 4,
      key: 'balloon',
      name: 'බැලුන් පොප්',
      subName: 'Balloon Pop',
      icon: '🎈',
      route: '/dyscalculia/balloon-pop',
      color: '#2ed573',
      bgGradient: 'linear-gradient(135deg, #2ed573, #1e90ff)',
      description: 'කියපු ප්‍රමාණයේ බැලුන එක පොප් කරන්න',
      stars: getGameStars('balloon')
    }
  ];

  const handlePlayClick = (route) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
    navigate(route);
  };

  return (
    <main className="dg-home-shell carnival-theme">
      {showConfetti && <div className="confetti-effect" />}
      <SpaceBackground />

      {/* Carnival Top Banner */}
      <div className="carnival-top-banner">
        <div className="carnival-lights">
          <span>🎪</span> <span>🎈</span> <span>🎡</span> <span>🎠</span> <span>🍿</span> <span>🎪</span>
        </div>
      </div>

      {/* Decorative Elements */}
      <img
        className="dc-deco dc-deco--wall dc-wiggle carnival-deco"
        src={homeDecoration}
        alt=""
        aria-hidden="true"
      />

      <img
        className="dc-deco dc-deco--extra dc-soft-pop carnival-deco-extra"
        src={homeDecoration2}
        alt=""
        aria-hidden="true"
      />

      {/* Character Animations */}
      <img
        className="dc-character dc-character--home-left dc-float carnival-character"
        src={homeCharacterLeft}
        alt="Buzz Lightyear character"
      />

      <img
        className="dc-character dc-character--home-right dc-bounce carnival-character"
        src={homeCharacterRight}
        alt="Piglet character"
      />

      <img
        className="dc-character dc-character--home-extra dc-sparkle carnival-character-extra"
        src={homeExtraCharacter}
        alt="Tigger character"
      />

      {/* Main Content Card */}
      <section className="dg-home-card carnival-card">
        
        {/* Header Section */}
        <div className="dg-home-header">
          <div className="carnival-badge-top">
            <span className="carnival-badge-text">🎪 NUMBER CARNIVAL 🎪</span>
          </div>
          <h1 className="dg-home-title carnival-title">
            <span className="dg-title-wave">🎪</span>
            අංක ඉගෙනගැනීමට ලැබෙයි!
            <span className="dg-title-wave">🎡</span>
          </h1>
          <p className="dg-home-subtitle carnival-subtitle">
            Let's learn numbers in a fun carnival way! ✨
          </p>
        </div>

        {/* Games Showcase Section - 4 Games Only */}
        <div className="games-showcase">
          <div className="games-header">
            <span className="games-header-icon">🎮</span>
            <h3 className="games-header-title">අපේ ක්‍රීඩා</h3>
            <span className="games-header-line"></span>
          </div>
          
          <div className="games-grid">
            {games.map((game) => (
              <div key={game.id} className="game-card-wrapper">
                <div 
                  className="game-card"
                  style={{ borderLeftColor: game.color }}
                  onClick={() => handlePlayClick(game.route)}
                >
                  <div className="game-card-glow" style={{ background: game.bgGradient }}></div>
                  
                  <div className="game-card-icon" style={{ background: game.bgGradient }}>
                    <span className="game-icon">{game.icon}</span>
                  </div>
                  
                  <div className="game-card-content">
                    <h4 className="game-card-title">{game.name}</h4>
                    <p className="game-card-subtitle">{game.subName}</p>
                    <p className="game-card-description">{game.description}</p>
                    
                    {/* Show modes for Number 0 game */}
                    {game.modes && (
                      <div className="game-card-modes">
                        {game.modes.map((mode, idx) => (
                          <span key={idx} className="game-mode-badge">
                            {idx === 0 ? '🎬' : idx === 1 ? '✏️' : '👁️'} {mode}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="game-card-stars">
                      {[...Array(3)].map((_, i) => (
                        <span key={i} className={`game-star ${i < game.stars ? 'filled' : 'empty'}`}>
                          {i < game.stars ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="game-play-btn" style={{ background: game.bgGradient }}>
                    <span>PLAY</span>
                    <span className="play-arrow">▶</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carnival Footer Message */}
        <div className="carnival-bottom-footer">
          <div className="footer-marquee">
            <span>🎪 Fun learning starts here! 🎈</span>
            <span>🎡 Every number is a prize! 🎠</span>
            <span>🍿 Keep playing, keep learning! 🎪</span>
          </div>
        </div>
      </section>

      <style>{`
        .carnival-theme {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #ffecd2 50%, #fcb69f 75%, #ff9a9e 100%) !important;
          background-size: 200% 200% !important;
          animation: carnivalBgShift 15s ease infinite;
        }
        
        @keyframes carnivalBgShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        .carnival-top-banner {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 30;
          pointer-events: none;
        }
        
        .carnival-lights {
          display: flex;
          justify-content: space-around;
          padding: 10px;
          background: linear-gradient(180deg, rgba(0,0,0,0.3), transparent);
        }
        
        .carnival-lights span {
          font-size: clamp(20px, 5vw, 30px);
          animation: lightBlink 1.5s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));
        }
        
        .carnival-lights span:nth-child(1) { animation-delay: 0s; }
        .carnival-lights span:nth-child(2) { animation-delay: 0.2s; }
        .carnival-lights span:nth-child(3) { animation-delay: 0.4s; }
        .carnival-lights span:nth-child(4) { animation-delay: 0.6s; }
        .carnival-lights span:nth-child(5) { animation-delay: 0.8s; }
        .carnival-lights span:nth-child(6) { animation-delay: 1s; }
        
        @keyframes lightBlink {
          0%, 100% { opacity: 0.4; transform: scale(1); text-shadow: none; }
          50% { opacity: 1; transform: scale(1.2); text-shadow: 0 0 20px gold; }
        }
        
        .confetti-effect {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 100;
          background: repeating-linear-gradient(45deg, #ff4757, #ff4757 10px, #ffa502 10px, #ffa502 20px, #2ed573 20px, #2ed573 30px, #1e90ff 30px, #1e90ff 40px, #a55eea 40px, #a55eea 50px);
          opacity: 0;
          animation: confettiBlast 3s ease-out forwards;
        }
        
        @keyframes confettiBlast {
          0% { opacity: 0; }
          10% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(100%); }
        }
        
        .carnival-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,245,235,0.98)) !important;
          border: 3px solid transparent !important;
          border-image: linear-gradient(135deg, #ff4757, #ffa502, #2ed573, #1e90ff, #a55eea) 1 !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25) !important;
        }
        
        .carnival-badge-top {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .carnival-badge-text {
          display: inline-block;
          background: linear-gradient(135deg, #ff4757, #ffa502);
          padding: 8px 20px;
          border-radius: 50px;
          color: white;
          font-weight: 900;
          font-size: clamp(12px, 4vw, 16px);
          letter-spacing: 2px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          animation: badgeGlow 2s ease-in-out infinite;
        }
        
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 5px 15px rgba(255,71,87,0.3); }
          50% { box-shadow: 0 5px 25px rgba(255,165,2,0.6); }
        }
        
        .carnival-title {
          background: linear-gradient(135deg, #ff4757 0%, #ffa502 25%, #2ed573 50%, #1e90ff 75%, #a55eea 100%);
          -webkit-background-clip: text;
          background-clip: text;
          font-size: clamp(1.3rem, 6vw, 2.5rem);
        }
        
        .carnival-subtitle {
          color: #ff6b81;
          font-weight: 600;
        }
        
        /* Games Showcase */
        .games-showcase {
          margin: 20px 0 30px;
        }
        
        .games-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .games-header-icon {
          font-size: 28px;
        }
        
        .games-header-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ff4757;
          margin: 0;
        }
        
        .games-header-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, #ffa502, transparent);
        }
        
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .game-card-wrapper {
          position: relative;
        }
        
        .game-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 5px solid;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .game-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .game-card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
        
        .game-card-icon {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .game-icon {
          font-size: 32px;
        }
        
        .game-card-content {
          margin-bottom: 15px;
        }
        
        .game-card-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #2d3436;
          margin: 0 0 4px 0;
        }
        
        .game-card-subtitle {
          font-size: 0.8rem;
          color: #636e72;
          margin: 0 0 8px 0;
        }
        
        .game-card-description {
          font-size: 0.75rem;
          color: #a55eea;
          margin: 0 0 10px 0;
        }
        
        .game-card-modes {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: 8px 0 10px 0;
        }
        
        .game-mode-badge {
          font-size: 0.7rem;
          background: rgba(255, 165, 2, 0.1);
          color: #FF6B9D;
          padding: 4px 8px;
          border-radius: 12px;
          border-left: 3px solid #FF6B9D;
          font-weight: 600;
          display: inline-block;
          width: fit-content;
        }
        
        .game-card-stars {
          display: flex;
          gap: 4px;
        }
        
        .game-star {
          font-size: 0.9rem;
        }
        
        .game-star.filled {
          opacity: 1;
        }
        
        .game-star.empty {
          opacity: 0.3;
        }
        
        .game-play-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 15px;
          border: none;
          border-radius: 40px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }
        
        .game-play-btn:hover {
          transform: scale(1.02);
          filter: brightness(1.05);
        }
        
        .play-arrow {
          font-size: 12px;
        }
        
        .carnival-bottom-footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px dashed rgba(255,165,2,0.5);
          overflow: hidden;
        }
        
        .footer-marquee {
          display: flex;
          gap: 30px;
          animation: marquee 15s linear infinite;
          white-space: nowrap;
        }
        
        .footer-marquee span {
          font-size: clamp(11px, 3.5vw, 13px);
          font-weight: 600;
          color: #ff6b81;
          letter-spacing: 1px;
        }
        
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .carnival-character {
          filter: drop-shadow(0 10px 20px rgba(255,71,87,0.4));
          animation: characterFloat 3s ease-in-out infinite;
        }
        
        .carnival-character-extra {
          filter: drop-shadow(0 10px 20px rgba(255,165,2,0.4));
          animation: characterSpin 4s ease-in-out infinite;
        }
        
        @keyframes characterFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes characterSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.05); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .games-grid {
            grid-template-columns: 1fr;
          }
          
          .game-card {
            padding: 15px;
          }
          
          .game-card-icon {
            width: 50px;
            height: 50px;
          }
          
          .game-icon {
            font-size: 28px;
          }
          
          .carnival-lights span {
            font-size: 18px;
          }
        }
        
        @media (max-width: 480px) {
          .game-card-icon {
            width: 45px;
            height: 45px;
          }
          
          .game-icon {
            font-size: 24px;
          }
          
          .game-card-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </main>
  );
};

export default DyscalculiaHome;