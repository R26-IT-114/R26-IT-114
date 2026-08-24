import { useEffect, useRef, useState } from 'react';
import starImage from '../../../assets/images/dysgraphia/star.png';

/* ─── Confetti particles ───────────────────────────────────────────────────── */
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  angle: (i / 28) * 360,
  dist:  60 + (i % 5) * 22,
  size:  i % 4 === 0 ? '1.1rem' : i % 3 === 0 ? '0.85rem' : '0.7rem',
  delay: `${(i * 0.035).toFixed(2)}s`,
  hue:   (i * 42) % 360,
}));

/* ─── Main overlay ─────────────────────────────────────────────────────────── */
const StarAwardOverlay = ({ amount, phase }) => {
  // phase: 'in' | 'hold' | 'out'
  return (
    <div
      aria-live='polite'
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeContent: 'center',
        pointerEvents: 'none',
        textAlign: 'center',
      }}
    >
      {/* golden glow backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(255,210,40,0.28) 0%, transparent 65%)',
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.5s',
      }} />

      {/* confetti burst */}
      {phase !== 'out' && CONFETTI.map((c) => (
        <img
          key={c.id}
          src={starImage}
          alt=''
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: c.size,
            height: c.size,
            objectFit: 'contain',
            '--sa-tx': `${Math.cos((c.angle * Math.PI) / 180) * c.dist}px`,
            '--sa-ty': `${Math.sin((c.angle * Math.PI) / 180) * c.dist}px`,
            animation: `sa-confetti 0.7s cubic-bezier(0.2,0.9,0.3,1) ${c.delay} both`,
            filter: `hue-rotate(${c.hue}deg) drop-shadow(0 0 6px rgba(255,220,40,0.9))`,
          }}
        />
      ))}

      {/* star row */}
      <div style={{
        position: 'relative',
        display: 'flex', gap: '0.6rem',
        justifyContent: 'center', alignItems: 'center',
        animation: phase === 'in'
          ? 'sa-pop-in 0.55s cubic-bezier(0.22,1.45,0.36,1) both'
          : phase === 'out'
            ? 'sa-fly-out 0.55s cubic-bezier(0.6,0,0.8,1) forwards'
            : 'sa-float 1.5s ease-in-out infinite alternate',
      }}>
        {Array.from({ length: amount }).map((_, i) => (
          <img
            key={i}
            src={starImage}
            alt=''
            style={{
              width: 'clamp(6rem, 16vw, 10rem)',
              height: 'clamp(6rem, 16vw, 10rem)',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 18px #ffd700) drop-shadow(0 0 36px #ff8c00)',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

    </div>
  );
};

/* ─── Reward box ────────────────────────────────────────────────────────────── */
const DysgraphiaRewardBox = ({ totalStars = 0, rewardPulse = false, rewardBoxRef = null }) => {
  const totalGems = Math.floor(totalStars / 20);
  const [awardedStars, setAwardedStars] = useState(0);
  const [phase, setPhase] = useState(null); // null | 'in' | 'hold' | 'out'
  const timerRef = useRef([]);

  useEffect(() => {
    const clear = () => timerRef.current.forEach(clearTimeout);

    const handle = (event) => {
      clear();
      const amount = Math.max(1, Math.min(3, event.detail?.amount || 1));
      setAwardedStars(amount);
      setPhase('in');

      timerRef.current = [
        // hold after pop-in (500 ms)
        setTimeout(() => setPhase('hold'), 500),
        // start fly-out after 2 s hold
        setTimeout(() => setPhase('out'), 2500),
        // unmount after fly-out finishes
        setTimeout(() => setPhase(null), 3100),
      ];
    };

    window.addEventListener('dysgraphia:star-award', handle);
    return () => { window.removeEventListener('dysgraphia:star-award', handle); clear(); };
  }, []);

  return (
    <>
      {phase && <StarAwardOverlay amount={awardedStars} phase={phase} />}

      <div ref={rewardBoxRef} className='dg-reward-box' aria-label='Reward box'>
        <div className='dg-reward-trophy'>🏆</div>
        <div className='dg-reward-metrics'>
          <div className='dg-reward-metric'>
            <div className='dg-reward-icon'><img src={starImage} alt='' className='dg-reward-star-image' /></div>
            <div className={`dg-reward-count${rewardPulse ? ' dg-reward-pulse' : ''}`}>{totalStars}</div>
            <div className='dg-reward-label'>Stars</div>
          </div>
          <div className='dg-reward-divider' aria-hidden='true' />
          <div className='dg-reward-metric'>
            <div className='dg-reward-icon'>💎</div>
            <div className='dg-reward-count dg-reward-count--gem'>{totalGems}</div>
            <div className='dg-reward-label'>Gems</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DysgraphiaRewardBox;
