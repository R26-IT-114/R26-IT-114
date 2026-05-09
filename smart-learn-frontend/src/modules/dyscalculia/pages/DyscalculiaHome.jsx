import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-cartoon.css';

import { getDyscalculiaProgress } from '../utils/dyscalculiaProgress';
import LearningJourney from '../components/LearningJourney';
import ChildProfileHeader from '../components/ChildProfileHeader';
import EmotionalEncouragementCard from '../components/EmotionalEncouragementCard';

import homeCharacterLeft from '../../../assets/images/dyscaculiaimages/Buzz Lightyear 01.png';
import homeCharacterRight from '../../../assets/images/dyscaculiaimages/Piglet 03.png';
import homeDecoration from '../../../assets/images/dyscaculiaimages/Character WALL 02.svg';
import homeExtraCharacter from '../../../assets/images/dyscaculiaimages/Tigger Pooh 01.svg';
import homeDecoration2 from '../../../assets/images/dyscaculiaimages/scooby-doo-0.svg';

const STAR_COLORS = ['#ffffff', '#ffe4b5', '#add8e6', '#ffcccb', '#b0e0e6', '#fff176', '#e0b0ff'];

const StarField = () => {
  const stars = Array.from({ length: 120 }, (_, i) => ({
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
  const progress = useMemo(() => getDyscalculiaProgress(), []);

  return (
    <main className="dg-home-shell">
      <SpaceBackground />

      {/* Decorative Elements */}
      <img
        className="dc-deco dc-deco--wall dc-wiggle"
        src={homeDecoration}
        alt=""
        aria-hidden="true"
      />

      <img
        className="dc-deco dc-deco--extra dc-soft-pop"
        src={homeDecoration2}
        alt=""
        aria-hidden="true"
      />

      {/* Character Animations */}
      <img
        className="dc-character dc-character--home-left dc-float"
        src={homeCharacterLeft}
        alt="Buzz Lightyear character"
      />

      <img
        className="dc-character dc-character--home-right dc-bounce"
        src={homeCharacterRight}
        alt="Piglet character"
      />

      <img
        className="dc-character dc-character--home-extra dc-sparkle"
        src={homeExtraCharacter}
        alt="Tigger character"
      />

      {/* Main Content Card */}
      <section className="dg-home-card">
        <div className="dg-home-header">
          <h1 className="dg-home-title">
            <span className="dg-title-wave">✨</span>
            අංක ඉගෙනගැනීමට ලැබෙයි!
            <span className="dg-title-wave">🚀</span>
          </h1>
          <p className="dg-home-subtitle">Let's learn numbers in a fun way!</p>
        </div>

        <ChildProfileHeader
          progress={progress}
          onGoDashboard={() => navigate('/dyscalculia/dashboard')}
        />

        <div className="dg-home-journey-stack">
          <LearningJourney progress={progress} navigate={navigate} />

          <EmotionalEncouragementCard
            emoji="🎈"
            message="හරි, ආයෙත් උත්සාහ කරමු 😊"
          />

          <div className="dg-home-quick-actions">
            <button
              type="button"
              className="dg-home-action-btn"
              onClick={() => navigate('/dyscalculia/recommendation')}
            >
              <span className="dg-btn-icon">🎯</span>
              Recommended Next Activity
            </button>
            <button
              type="button"
              className="dg-home-action-btn dg-home-action-btn--alt"
              onClick={() => navigate('/dyscalculia/listening-game')}
            >
              <span className="dg-btn-icon">🎧</span>
              Quick Listening
            </button>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="dg-home-footer">
          <div className="dg-achievement-badge">
            <span className="dg-achievement-icon">🏆</span>
            <span className="dg-achievement-text">Keep going! You're doing great!</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DyscalculiaHome;