import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const PARTY_CONFIG = {
  1: {
    name: 'Party 1',
    title: 'හොඳයි!',
    subtitle: 'ඔබ ඉතා හොඳ ගමණක සිටී!',
    accent: '#3B82F6',
    background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    badge: '🎈 Party 1',
  },
  2: {
    name: 'Party 2',
    title: 'ජය ගත්තා!',
    subtitle: 'ඔබේ උත්සාහය සාර්ථකයි!',
    accent: '#10B981',
    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    badge: '🥳 Party 2',
  },
  3: {
    name: 'Party 3',
    title: 'සුපිරි!',
    subtitle: 'ඔබ ඉතාම හොඳින් කළා!',
    accent: '#F59E0B',
    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    badge: '🎉 Party 3',
  },
};

const playRewardSound = (stars = 2) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const note = (freq, startTime, duration, gain = 0.48, type = 'sine') => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = 0.001;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(startTime);
      g.gain.exponentialRampToValueAtTime(gain, startTime + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.stop(startTime + duration + 0.06);
    };

    const t = ctx.currentTime;
    if (stars === 3) {
      note(523.25, t, 0.22, 0.52);
      note(659.25, t + 0.20, 0.22, 0.52);
      note(783.99, t + 0.40, 0.25, 0.52);
      note(1046.5, t + 0.58, 0.60, 0.62);
      note(659.25, t + 0.58, 0.60, 0.30, 'triangle');
    } else if (stars === 2) {
      note(523.25, t, 0.28, 0.46);
      note(783.99, t + 0.26, 0.50, 0.50);
    } else {
      note(440, t, 0.22, 0.30);
      note(523.25, t + 0.24, 0.45, 0.34);
    }

    setTimeout(() => ctx.close(), 1000);
  } catch {
    // ignore if audio is unavailable
  }
};

const fireRewardConfetti = (stars = 2) => {
  const colors = ['#F59E0B', '#22C55E', '#0EA5E9', '#EC4899', '#A855F7', '#FB923C'];

  if (stars === 3) {
    confetti({ particleCount: 130, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors, startVelocity: 55, scalar: 1.2 });
    confetti({ particleCount: 130, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors, startVelocity: 55, scalar: 1.2 });
    setTimeout(() => confetti({ particleCount: 200, spread: 160, origin: { y: 0 }, colors, startVelocity: 38, gravity: 0.85, scalar: 1.1 }), 520);
    setTimeout(() => confetti({ particleCount: 70, spread: 110, origin: { y: 0.3 }, colors, shapes: ['star'], scalar: 1.5 }), 900);
  } else if (stars === 2) {
    confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 }, colors, startVelocity: 46 });
    setTimeout(() => confetti({ particleCount: 70, spread: 120, origin: { y: 0.4 }, colors, startVelocity: 32 }), 420);
  } else {
    confetti({ particleCount: 55, spread: 65, origin: { y: 0.65 }, colors: ['#0EA5E9', '#7DD3FC', '#BAE6FD', '#A5F3FC'], startVelocity: 28 });
  }
};

const Bubble = ({ x, size, delay, duration }) => (
  <motion.div
    className="absolute pointer-events-none rounded-full"
    style={{
      left: `${x}%`,
      bottom: '0%',
      width: size,
      height: size,
      background: 'rgba(255,255,255,0.16)',
      border: '1px solid rgba(255,255,255,0.28)',
    }}
    animate={{ y: [0, -620], opacity: [0, 0.55, 0.45, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
  />
);

const BUBBLES = [
  { x: 8, size: 22, delay: 0, duration: 7.5 },
  { x: 24, size: 14, delay: 1.3, duration: 9 },
  { x: 42, size: 24, delay: 0.7, duration: 8 },
  { x: 60, size: 16, delay: 2.2, duration: 10 },
  { x: 76, size: 18, delay: 1.0, duration: 8.5 },
  { x: 92, size: 12, delay: 1.9, duration: 11 },
];

const getNBackMessage = (accuracy) => {
  const messages = [
    { min: 85, text: 'අපූරුයි!',          sub: 'ඔබේ මතකය ඉතාම ශක්තිමත්!',       color: '#047857', bg: 'from-emerald-50 to-teal-50' },
    { min: 60, text: 'නියමයි!',            sub: 'ඔබ ඉතා හොඳින් ඉගෙනගනිනවා!',    color: '#0C4A6E', bg: 'from-sky-50 to-blue-50' },
    { min: 35, text: 'හොඳ උත්සාහයක්!',   sub: 'නැවත නැවත කරන්න — දිනෙන් දින දිනෙන් ශ්‍රේෂ්ඨ!', color: '#92400E', bg: 'from-amber-50 to-yellow-50' },
    { min: 0,  text: 'එළිය ගෙනෙන්න!',    sub: 'සෑම උත්සාහයක්ම ඔබව ලොකු කරවයි!', color: '#991B1B',   bg: 'from-rose-50 to-pink-50' },
  ];
  return messages.find((message) => accuracy >= message.min) || messages[messages.length - 1];
};

const TrophyIcon = ({ size = 96, color = '#F59E0B' }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
    <path d="M30 22h60v8a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10v-8Z" fill={color} />
    <path d="M32 30h56c6 0 10 5 10 10v14c0 22-20 24-20 24h-36s-20-2-20-24V40c0-5 4-10 10-10Z" fill={color} />
    <path d="M40 76h8v20H40zm32 0h8v20h-8z" fill="#0F172A" opacity="0.7" />
    <path d="M20 30H12a8 8 0 0 0-8 8v18c0 18 16 22 20 22v-40Zm80 0h8a8 8 0 0 1 8 8v18c0 18-16 22-20 22V38Z" fill="#FDE68A" opacity="0.3" />
  </svg>
);

const StarRow = ({ count = 3 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
    {Array.from({ length: 3 }).map((_, index) => (
      <span
        key={index}
        style={{
          fontSize: 34,
          lineHeight: 1,
          color: '#F59E0B',
          opacity: index < count ? 1 : 0.24,
          textShadow: index < count ? '0 2px 8px rgba(245,158,11,0.35)' : 'none',
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const RewardPanel = ({
  stars = 2,
  accuracy = 0,
  correct = 0,
  total = 0,
  partyLevel = 2,
  variant = 'party',
  unlockText = null,
  nextLabel = 'ඊළඟ මට්ටම',
  onNext = null,
  onRetry = null,
  onHome = null,
  showNext = false,
  showRetry = true,
  showHome = true,
}) => {
  const starsCount = Math.min(Math.max(stars, 1), 3);
  const party = PARTY_CONFIG[partyLevel] || PARTY_CONFIG[2];
  const firedRef = useRef(false);
  const message = variant === 'n-back' ? getNBackMessage(accuracy) : null;

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    playRewardSound(starsCount);
    const id = setTimeout(() => fireRewardConfetti(starsCount), 320);
    return () => clearTimeout(id);
  }, [starsCount]);

  if (variant === 'n-back') {
    return (
      <AnimatePresence>
        <motion.div
          key={`reward-panel-n-back-${starsCount}`}
          initial={{ opacity: 0, scale: 0.94, y: 26 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ type: 'spring', stiffness: 170, damping: 20 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 820,
            margin: '0 auto',
            padding: 32,
            borderRadius: 40,
            background: party.background,
            boxShadow: '0 28px 62px rgba(15,23,42,0.18)',
            border: `2px solid ${party.accent}33`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(circle at top, rgba(255,255,255,0.24), transparent 36%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 15% 20%, ${party.accent}20, transparent 24%), radial-gradient(circle at 80% 40%, #ffffff15, transparent 18%)`,
            }}
          />
          {BUBBLES.map((bubble, index) => (
            <Bubble key={index} {...bubble} />
          ))}
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 54,
              opacity: 0.25,
            }}
            animate={{ x: [0, -48, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 400 56" width="400%" height="56" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 28 Q50 0 100 28 Q150 56 200 28 Q250 0 300 28 Q350 56 400 28 L400 56 L0 56 Z" fill="rgba(255,255,255,0.40)" />
            </svg>
          </motion.div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ marginBottom: 12 }}
            >
              <TrophyIcon size={110} color={starsCount >= 2 ? party.accent : '#9CA3AF'} />
            </motion.div>

            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontSize: 52, margin: 0, color: message.color, lineHeight: 1.02 }}>{message.text}</h1>
              <p style={{ fontSize: 21, margin: '14px auto 0', maxWidth: 640, color: '#334155', fontWeight: 700 }}>
                {message.sub}
              </p>
            </div>

            <StarRow count={starsCount} />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 16,
                textAlign: 'center',
                marginBottom: 22,
              }}
            >
              <div style={{ borderRadius: 28, background: '#ffffff', padding: 18, boxShadow: '0 16px 28px rgba(15,23,42,0.08)' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: party.accent }}>නිවැරදි</p>
                <p style={{ fontSize: 36, fontWeight: 900, margin: '10px 0 0', color: '#0F172A' }}>{correct}</p>
              </div>
              <div style={{ borderRadius: 28, background: '#ffffff', padding: 18, boxShadow: '0 16px 28px rgba(15,23,42,0.08)' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: party.accent }}>උත්තර</p>
                <p style={{ fontSize: 36, fontWeight: 900, margin: '10px 0 0', color: '#0F172A' }}>{total}</p>
              </div>
              <div style={{ borderRadius: 28, background: '#ffffff', padding: 18, boxShadow: '0 16px 28px rgba(15,23,42,0.08)' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: party.accent }}>නිරවද්‍යතාව</p>
                <p style={{ fontSize: 36, fontWeight: 900, margin: '10px 0 0', color: '#0F172A' }}>{accuracy}%</p>
              </div>
            </div>

            <div style={{ width: '100%', borderRadius: 999, background: 'rgba(255,255,255,0.72)', height: 14, overflow: 'hidden', marginBottom: 24 }}>
              <motion.div
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${party.accent}, ${party.accent}CC)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            </div>

            {unlockText && (
              <div
                style={{
                  marginBottom: 24,
                  padding: '18px 20px',
                  borderRadius: 30,
                  background: '#EFF6FF',
                  border: `2px dashed ${party.accent}55`,
                  color: '#1D4ED8',
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {unlockText}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              {showNext && onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  style={{
                    minWidth: 220,
                    padding: '18px 24px',
                    borderRadius: 999,
                    border: 'none',
                    background: `linear-gradient(135deg, ${party.accent}, ${party.accent}CC)`,
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 16px 30px rgba(15,23,42,0.18)',
                  }}
                >
                  🌊 {nextLabel}
                </button>
              )}

              {showRetry && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    minWidth: 220,
                    padding: '18px 24px',
                    borderRadius: 999,
                    border: '2px solid rgba(15,23,42,0.12)',
                    background: '#ffffff',
                    color: '#0F172A',
                    fontSize: 22,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 14px 24px rgba(15,23,42,0.12)',
                  }}
                >
                  🔁 නැවත උත්සාහ කරන්න
                </button>
              )}

              {showHome && onHome && (
                <button
                  type="button"
                  onClick={onHome}
                  style={{
                    minWidth: 220,
                    padding: '18px 24px',
                    borderRadius: 999,
                    border: 'none',
                    background: '#A855F7',
                    color: '#fff',
                    fontSize: 22,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 16px 30px rgba(124,58,237,0.24)',
                  }}
                >
                  🏠 මුල් පිටුවට
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={`reward-panel-${starsCount}`}
        initial={{ opacity: 0, scale: 0.94, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 18 }}
        transition={{ type: 'spring', stiffness: 170, damping: 20 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 820,
          margin: '0 auto',
          padding: 28,
          borderRadius: 40,
          background: party.background,
          boxShadow: '0 28px 62px rgba(15,23,42,0.18)',
          border: `2px solid ${party.accent}33`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(circle at top, rgba(255,255,255,0.24), transparent 36%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(circle at 15% 20%, ${party.accent}20, transparent 24%), radial-gradient(circle at 80% 40%, #ffffff15, transparent 18%)`,
          }}
        />
        {BUBBLES.map((bubble, index) => (
          <Bubble key={index} {...bubble} />
        ))}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 54,
            opacity: 0.25,
          }}
          animate={{ x: [0, -48, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 400 56" width="400%" height="56" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 28 Q50 0 100 28 Q150 56 200 28 Q250 0 300 28 Q350 56 400 28 L400 56 L0 56 Z" fill="rgba(255,255,255,0.40)" />
          </svg>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                color: party.accent,
                borderRadius: 999,
                padding: '10px 18px',
                fontWeight: 800,
                boxShadow: '0 10px 24px rgba(15,23,42,0.12)',
              }}
            >
              <span style={{ fontSize: 20 }}>{party.badge}</span>
              <span style={{ fontSize: 16 }}>party{starsCount}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 54, margin: 0, color: '#0F172A', lineHeight: 1.05 }}>{party.title}</h1>
            <p style={{ fontSize: 22, margin: '14px auto 0', maxWidth: 640, color: '#334155', fontWeight: 700 }}>
              {party.subtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ borderRadius: 28, background: '#ffffff', padding: 18, boxShadow: '0 16px 28px rgba(15,23,42,0.08)' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: party.accent }}>⭐ ලකුණු</p>
              <p style={{ fontSize: 36, fontWeight: 900, margin: '10px 0 0', color: '#0F172A' }}>{correct} / {total}</p>
            </div>
            <div style={{ borderRadius: 28, background: '#ffffff', padding: 18, boxShadow: '0 16px 28px rgba(15,23,42,0.08)' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: party.accent }}>🎯 සාර්ථකත්වය</p>
              <p style={{ fontSize: 36, fontWeight: 900, margin: '10px 0 0', color: '#0F172A' }}>{accuracy}%</p>
            </div>
            <div style={{ borderRadius: 28, background: '#ffffff', padding: 18, boxShadow: '0 16px 28px rgba(15,23,42,0.08)' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: party.accent }}>✨ තරු</p>
              <p style={{ fontSize: 36, fontWeight: 900, margin: '10px 0 0', color: '#0F172A' }}>{stars}</p>
            </div>
          </div>

          {unlockText && (
            <div
              style={{
                marginBottom: 24,
                padding: '18px 20px',
                borderRadius: 30,
                background: '#EFF6FF',
                border: `2px dashed ${party.accent}55`,
                color: '#1D4ED8',
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              {unlockText}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {showNext && onNext && (
              <button
                type="button"
                onClick={onNext}
                style={{
                  minWidth: 220,
                  padding: '18px 24px',
                  borderRadius: 999,
                  border: 'none',
                  background: `linear-gradient(135deg, ${party.accent}, ${party.accent}CC)`,
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 16px 30px rgba(15,23,42,0.18)',
                }}
              >
                🌊 {nextLabel}
              </button>
            )}

            {showRetry && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  minWidth: 220,
                  padding: '18px 24px',
                  borderRadius: 999,
                  border: '2px solid rgba(15,23,42,0.12)',
                  background: '#ffffff',
                  color: '#0F172A',
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 14px 24px rgba(15,23,42,0.12)',
                }}
              >
                🔁 නැවත උත්සාහ කරන්න
              </button>
            )}

            {showHome && onHome && (
              <button
                type="button"
                onClick={onHome}
                style={{
                  minWidth: 220,
                  padding: '18px 24px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#A855F7',
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 16px 30px rgba(124,58,237,0.24)',
                }}
              >
                🏠 මුල් පිටුවට
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardPanel;
