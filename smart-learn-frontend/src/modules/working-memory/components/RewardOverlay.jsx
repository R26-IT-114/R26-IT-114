/**
 * RewardOverlay — shared advanced reward screen shown after every game completion.
 * Plays Web-Audio fanfare sounds and fires canvas-confetti bursts.
 * Stars:  3 = perfect (≥90%)  |  2 = passed (≥60%)  |  1 = encouragement
 * No external audio assets needed — all sounds are synthesised.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import rewardSeaBackground from '../assets/reward-sea-background-generated.png';
import turtleLevelBoard from '../assets/reward-turtle-board-v2.png';
import realisticTrophy from '../assets/reward-trophy-cartoon-v2.png';
import realisticStar from '../assets/reward-star-cartoon-v2.png';

// ─── Web Audio reward sounds ──────────────────────────────────────
const playRewardSound = (stars) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const note = (freq, startTime, duration, gain = 0.48, type = 'sine') => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type          = type;
      osc.frequency.value = freq;
      g.gain.value      = 0.001;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(startTime);
      g.gain.exponentialRampToValueAtTime(gain, startTime + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.stop(startTime + duration + 0.06);
    };

    const t = ctx.currentTime;
    if (stars === 3) {
      // Triumphant 4-note fanfare: C5 → E5 → G5 → C6
      note(523.25, t,        0.22, 0.52);
      note(659.25, t + 0.20, 0.22, 0.52);
      note(783.99, t + 0.40, 0.25, 0.52);
      note(1046.5, t + 0.58, 0.60, 0.62);
      // Harmony layer
      note(659.25, t + 0.58, 0.60, 0.30, 'triangle');
    } else if (stars === 2) {
      // Success: C5 → G5
      note(523.25, t,        0.28, 0.46);
      note(783.99, t + 0.26, 0.50, 0.50);
    } else {
      // Gentle encouragement: A4 → C5
      note(440,    t,        0.22, 0.30);
      note(523.25, t + 0.24, 0.45, 0.34);
    }
  } catch { /* ignore if AudioContext unavailable */ }
};

// ─── Confetti bursts ──────────────────────────────────────────────
const fireRewardConfetti = (stars) => {
  const colors = ['#F59E0B', '#22C55E', '#0EA5E9', '#EC4899', '#A855F7', '#FB923C'];

  if (stars === 3) {
    // Side cannons
    confetti({ particleCount: 130, angle: 60,  spread: 55, origin: { x: 0,   y: 0.65 }, colors, startVelocity: 55, scalar: 1.2 });
    confetti({ particleCount: 130, angle: 120, spread: 55, origin: { x: 1,   y: 0.65 }, colors, startVelocity: 55, scalar: 1.2 });
    // Top shower
    setTimeout(() =>
      confetti({ particleCount: 200, spread: 160, origin: { y: 0 }, colors, startVelocity: 38, gravity: 0.85, scalar: 1.1 }),
    520);
    // Star shapes
    setTimeout(() =>
      confetti({ particleCount: 70, spread: 110, origin: { y: 0.3 }, colors, shapes: ['star'], scalar: 1.5 }),
    900);
  } else if (stars === 2) {
    confetti({ particleCount: 110, spread: 80,  origin: { y: 0.6 }, colors, startVelocity: 46 });
    setTimeout(() =>
      confetti({ particleCount: 70, spread: 120, origin: { y: 0.4 }, colors, startVelocity: 32 }),
    420);
  } else {
    // Gentle shimmer
    confetti({ particleCount: 55, spread: 65, origin: { y: 0.65 }, colors: ['#0EA5E9', '#7DD3FC', '#BAE6FD', '#A5F3FC'], startVelocity: 28 });
  }
};

// ─── Per-star config ──────────────────────────────────────────────
const CONFIGS = {
  3: {
    title:      'ශ්‍රේෂ්ඨයි!',
    subtitle:   'ඔබ ඉතා දක්ෂ ළමයෙකි!',
    message:    'සියල්ල නිවැරදිව කළා — ඔබ සැබෑ ශූරයෙකි!',
    badge:      '🏅 ස්වර්ණ ජයග්‍රාහකයා',
    badgeBg:    'linear-gradient(135deg,#F59E0B,#D97706)',
    glowColor:  '#F59E0B',
    titleColor: '#FDE68A',
  },
  2: {
    title:      'ජය ගත්තා!',
    subtitle:   'ඉතා හොඳ ප්‍රයත්නයක්!',
    message:    'ඔබ ගාමීව ඉදිරියට යයි — ජය ශ්‍රේෂ්ඨ!',
    badge:      '🥈 රිදී ජයග්‍රාහකයා',
    badgeBg:    'linear-gradient(135deg,#64748B,#94A3B8)',
    glowColor:  '#22C55E',
    titleColor: '#BBF7D0',
  },
  1: {
    title:      'හොඳ ප්‍රයත්නයක්!',
    subtitle:   'ධෛර්යයෙන් ඉදිරියට!',
    message:    'ඔබ සෑම දිනෙකම ශක්තිමත් වෙනවා — නැවත උත්සාහ කරන්න!',
    badge:      '💪 නැවත උත්සාහ කරන්න',
    badgeBg:    'linear-gradient(135deg,#0284C7,#0EA5E9)',
    glowColor:  '#7DD3FC',
    titleColor: '#BAE6FD',
  },
};

// ─── Inline SVG icons — no emoji ─────────────────────────────────
const StarSVG = ({ size = 52, filled = false, delay = 0 }) => (
  <motion.div
    initial={{ scale: 0, rotate: -35, opacity: 0 }}
    animate={{ scale: 1, rotate: 0,   opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 18, delay }}
  >
    <motion.img
      src={realisticStar}
      alt=""
      width={size}
      height={size}
      className="object-contain"
      style={{ opacity: filled ? 1 : 0.28 }}
      animate={filled
        ? { filter: ['drop-shadow(0 0 2px #F59E0B88)', 'drop-shadow(0 0 16px #F59E0Bdd)', 'drop-shadow(0 0 2px #F59E0B88)'] }
        : {}}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.4 }}
      aria-hidden="true"
    />
  </motion.div>
);

const TrophySVG = ({ size = 90 }) => (
  <img
    src={realisticTrophy}
    alt=""
    width={size}
    height={size}
    className="object-contain drop-shadow-[0_8px_14px_rgba(245,158,11,0.38)]"
    aria-hidden="true"
  />
);

const EncourageSVG = ({ size = 90 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#7DD3FC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3.5" />
  </svg>
);

const CheckSVG = ({ size = 20, color = '#F59E0B' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Floating bubble ──────────────────────────────────────────────
const Bubble = ({ x, size, delay, duration }) => (
  <motion.div
    className="absolute pointer-events-none rounded-full"
    style={{
      left: `${x}%`, bottom: '0%',
      width: size, height: size,
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.25)',
    }}
    animate={{ y: [0, -640], opacity: [0, 0.55, 0.40, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
  />
);

// ─── RewardOverlay ────────────────────────────────────────────────
const RewardOverlay = ({
  show = false,
  stars = 2,
  result = {},
  earnedStars = 0,
  onDismiss,
  onReplay,
}) => {
  const cfg       = CONFIGS[stars] || CONFIGS[2];
  const firedRef  = useRef(false);
  const accuracy = Number.isFinite(Number(result?.accuracy))
    ? Math.round(Number(result.accuracy))
    : null;
  const correct = Number.isFinite(Number(result?.correct)) ? Number(result.correct) : null;
  const total = Number.isFinite(Number(result?.total)) ? Number(result.total) : null;
  const attempts = Number.isFinite(Number(result?.totalAttempts ?? result?.attempts))
    ? Number(result.totalAttempts ?? result.attempts)
    : null;
  const mistakes = Number.isFinite(Number(result?.mistakes ?? result?.wrongAttempts))
    ? Number(result.mistakes ?? result.wrongAttempts)
    : null;
  const averageResponseMs = Number.isFinite(Number(result?.averageResponseMs))
    ? Number(result.averageResponseMs)
    : null;
  const metrics = [
    correct !== null && total !== null && { label: 'නිවැරදි', value: `${correct} / ${total}`, icon: '✓' },
    attempts !== null && { label: 'උත්සාහ', value: attempts, icon: '🎯' },
    mistakes !== null && { label: 'වැරදි', value: mistakes, icon: '🌱' },
    averageResponseMs !== null && {
      label: 'සාමාන්‍ය වේලාව',
      value: `${(averageResponseMs / 1000).toFixed(1)}s`,
      icon: '⏱',
    },
  ].filter(Boolean);

  // Fire sound + confetti once when shown
  useEffect(() => {
    if (!show || firedRef.current) return;
    firedRef.current = true;
    playRewardSound(stars);
    const id = setTimeout(() => fireRewardConfetti(stars), 320);
    return () => clearTimeout(id);
  }, [show, stars]);

  // Reset gate when hidden
  useEffect(() => {
    if (!show) firedRef.current = false;
  }, [show]);

  const BUBBLES = [
    { x: 7,  size: 20, delay: 0,   duration: 7.5 },
    { x: 22, size: 14, delay: 1.3, duration: 9   },
    { x: 40, size: 24, delay: 0.7, duration: 8   },
    { x: 58, size: 16, delay: 2.2, duration: 10  },
    { x: 75, size: 18, delay: 1.0, duration: 8.5 },
    { x: 90, size: 12, delay: 1.9, duration: 11  },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="reward-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.30 }}
          className="fixed inset-0 flex items-center justify-center overflow-y-auto px-3 py-4"
          style={{
            zIndex: 9000,
            backgroundImage: `linear-gradient(180deg, rgba(3,105,161,0.18), rgba(8,47,73,0.42)), url(${rewardSeaBackground})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          {/* Animated bubbles */}
          {BUBBLES.map((b, i) => <Bubble key={i} {...b} />)}

          {/* Ambient glow */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 480, height: 480,
              top: '5%', left: '50%', transform: 'translateX(-50%)',
              background: `radial-gradient(circle, ${cfg.glowColor}20 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Wave strip at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: 56, opacity: 0.22 }}
            animate={{ x: [0, -60, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 400 56" width="400%" height="56" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 28 Q50 0 100 28 Q150 56 200 28 Q250 0 300 28 Q350 56 400 28 L400 56 L0 56 Z" fill="#0284C7" />
            </svg>
          </motion.div>

          {/* Content card */}
          <motion.div
            initial={{ scale: 0.5, y: 70, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 210, damping: 22, delay: 0.08 }}
            className="relative my-auto flex w-full max-w-4xl flex-col items-center gap-2 overflow-hidden rounded-[2rem] px-4 py-5 sm:min-h-[640px] sm:justify-center sm:rounded-[2.5rem] sm:py-7 sm:pl-[290px] sm:pr-8"
            style={{
              background: 'linear-gradient(145deg, rgba(14,165,233,0.88), rgba(3,105,161,0.94) 48%, rgba(8,47,73,0.96))',
              backdropFilter: 'blur(18px)',
              border: '4px solid rgba(186,230,253,0.9)',
              boxShadow: '0 28px 72px rgba(8,47,73,0.5), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 44px rgba(34,211,238,0.12)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.16), transparent)' }}
              aria-hidden="true"
            />
            <div className="rounded-full border border-cyan-100/60 bg-cyan-100/15 px-4 py-1 text-xs font-black tracking-[0.16em] text-cyan-50 shadow-inner">
              🌊 මුහුදු තරු තෑග්ග
            </div>
            {/* Trophy / encourage icon */}
            <motion.div
              animate={{
                y: [0, -16, 0],
                rotate: stars === 3 ? [0, -10, 10, -6, 6, 0] : [0, -5, 5, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {stars >= 2
                ? <TrophySVG size={90} color={stars === 3 ? '#F59E0B' : '#94A3B8'} />
                : <EncourageSVG size={90} />
              }
            </motion.div>

            {/* Stars */}
            <div className="flex items-center gap-3">
              <StarSVG size={42} filled={stars >= 1} delay={0.20} />
              <StarSVG size={56} filled={stars >= 2} delay={0.42} />
              <StarSVG size={42} filled={stars >= 3} delay={0.64} />
            </div>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="text-3xl font-black text-center drop-shadow-lg sm:text-4xl"
              style={{ color: cfg.titleColor, textShadow: `0 0 28px ${cfg.glowColor}66` }}
            >
              {cfg.title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
              className="text-lg font-bold text-white/75 text-center"
            >
              {cfg.subtitle}
            </motion.p>

            {/* Accuracy pill */}
            {accuracy !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.72 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-extrabold text-xl text-white"
                style={{ background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.28)' }}
              >
                <CheckSVG size={20} color={cfg.glowColor} />
                {accuracy}% නිරවද්‍ය
              </motion.div>
            )}

            {metrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.76 }}
                className="grid w-full grid-cols-2 gap-2"
              >
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-center"
                  >
                    <div className="text-lg" aria-hidden="true">{metric.icon}</div>
                    <div className="text-xl font-black text-white">{metric.value}</div>
                    <div className="text-xs font-bold text-white/65">{metric.label}</div>
                  </div>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative mx-auto mt-1 h-64 w-44 sm:absolute sm:left-5 sm:top-1/2 sm:mt-0 sm:h-[500px] sm:w-[265px] sm:-translate-y-1/2"
            >
              <img
                src={turtleLevelBoard}
                alt="මෙම ක්‍රීඩාවේ තරු ගණන පෙන්වන පුවරුව අල්ලාගෙන සිටින කැස්බෑ යාළුවා"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
              <div className="absolute inset-x-[12%] top-[47%] flex flex-col items-center text-center sm:top-[49%]">
                <img
                  src={realisticStar}
                  alt=""
                  className="h-7 w-7 object-contain drop-shadow-md sm:h-10 sm:w-10"
                  aria-hidden="true"
                />
                <span className="text-4xl font-black leading-none text-sky-800 drop-shadow-sm sm:text-6xl">
                  {earnedStars}
                </span>
                <span className="mt-0.5 rounded-full bg-sky-100/80 px-2 py-0.5 text-[9px] font-black tracking-wide text-sky-800 sm:mt-1 sm:px-3 sm:text-xs">
                  මෙම ක්‍රීඩාවේ තරු
                </span>
              </div>
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.82 }}
              className="text-base font-semibold text-white/70 text-center leading-relaxed px-2"
            >
              {cfg.message}
            </motion.p>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.92 }}
              className="px-7 py-2 rounded-full text-white text-base font-extrabold shadow-xl"
              style={{ background: cfg.badgeBg }}
            >
              {cfg.badge}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.10 }}
              className="grid w-full gap-2 sm:grid-cols-[0.8fr_1.2fr]"
            >
              {onReplay && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onReplay}
                  className="min-h-14 rounded-full border-2 border-white/35 bg-white/10 px-4 py-3 text-base font-extrabold text-white"
                >
                  ↻ නැවත ක්‍රීඩා කරමු
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 14px 44px rgba(0,0,0,0.32)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className="min-h-14 rounded-full px-5 py-3 text-xl font-extrabold text-white shadow-2xl"
                style={{ background: `linear-gradient(90deg, ${cfg.glowColor}dd, ${cfg.glowColor}88)` }}
              >
                {result?.nextLevel ? 'ඊළඟ මට්ටමට →' : 'ඉදිරියට! →'}
              </motion.button>
            </motion.div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardOverlay;
