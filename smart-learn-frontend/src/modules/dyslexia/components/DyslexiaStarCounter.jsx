import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import elephantBucketImg from '../../../assets/images/dyslexia-elephant-wooden-basket.png';
import rewardStarImg from '../../../assets/images/letter-listening-star.png';
import DyslexiaConfettiBurst from './DyslexiaConfettiBurst';

export const DYSLEXIA_STAR_EVENT = 'dyslexia:correct-answer';
export const DYSLEXIA_STAR_VISIBILITY_EVENT = 'dyslexia:star-counter-visibility';

const emptyRewards = { stars: 0, earnedKeys: [] };

const playRewardChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(0.26, context.currentTime);
    master.connect(context.destination);

    [783.99, 987.77, 1174.66, 1567.98].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + 0.02 + (index * 0.1);
      const duration = index === 3 ? 0.32 : 0.12;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(master);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(1, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    });

    window.setTimeout(() => context.close().catch(() => {}), 1200);
  } catch {
    // Reward audio is optional when Web Audio is unavailable.
  }
};

const readRewards = (storageKey) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const earnedKeys = Array.isArray(saved?.earnedKeys) ? saved.earnedKeys : [];
    return { stars: earnedKeys.length, earnedKeys };
  } catch {
    return emptyRewards;
  }
};

export default function DyslexiaStarCounter({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const ownerId = user?.uid || user?.id || 'guest';
  const storageKey = `dyslexia_star_rewards:${ownerId}`;
  const [rewards, setRewards] = useState(() => readRewards(storageKey));
  const [starPulse, setStarPulse] = useState(null);
  const [flyingStar, setFlyingStar] = useState(null);
  const [rewardBurst, setRewardBurst] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef(null);
  const bucketTargetRef = useRef(null);
  const pulseTimerRef = useRef(null);
  const flyingTimerRef = useRef(null);
  const rewardTimerRef = useRef(null);

  useEffect(() => {
    const updateVisibility = (event) => setIsVisible(event.detail?.visible !== false);
    window.addEventListener(DYSLEXIA_STAR_VISIBILITY_EVENT, updateVisibility);
    return () => window.removeEventListener(DYSLEXIA_STAR_VISIBILITY_EVENT, updateVisibility);
  }, []);

  useEffect(() => {
    setIsVisible(false);
  }, [location.pathname]);

  useEffect(() => {
    setRewards(readRewards(storageKey));
  }, [storageKey]);

  useEffect(() => {
    const awardStars = (event) => {
      const gameKey = event.detail?.gameKey;
      const level = event.detail?.level ?? 1;
      const score = Math.max(0, Math.floor(Number(event.detail?.score) || 0));
      if (!gameKey || score < 1) return;

      clearTimeout(rewardTimerRef.current);
      setRewardBurst(false);
      window.requestAnimationFrame(() => setRewardBurst(true));
      playRewardChime();
      rewardTimerRef.current = setTimeout(() => setRewardBurst(false), 1700);

      setRewards((current) => {
        const earned = new Set(current.earnedKeys);
        let added = 0;

        for (let correctPosition = 1; correctPosition <= score; correctPosition += 1) {
          const key = `${gameKey}:level-${level}:correct-${correctPosition}`;
          if (!earned.has(key)) {
            earned.add(key);
            added += 1;
          }
        }

        if (added === 0) return current;

        const next = { stars: earned.size, earnedKeys: [...earned] };
        localStorage.setItem(storageKey, JSON.stringify(next));
        clearTimeout(pulseTimerRef.current);
        clearTimeout(flyingTimerRef.current);
        const counterBounds = counterRef.current?.getBoundingClientRect();
        const bucketBounds = bucketTargetRef.current?.getBoundingClientRect();
        const sourceBounds = event.detail?.sourceRect;
        const fromX = Number(sourceBounds?.left) + (Number(sourceBounds?.width) / 2);
        const fromY = Number(sourceBounds?.top) + (Number(sourceBounds?.height) / 2);
        setStarPulse({ id: Date.now(), added });
        setFlyingStar({
          id: Date.now(),
          added,
          fromX: Number.isFinite(fromX) ? fromX : window.innerWidth * 0.5,
          fromY: Number.isFinite(fromY) ? fromY : window.innerHeight * 0.5,
          toX: bucketBounds
            ? bucketBounds.left + (bucketBounds.width / 2)
            : (counterBounds ? counterBounds.left + (counterBounds.width / 2) : 82),
          toY: bucketBounds
            ? bucketBounds.top + (bucketBounds.height / 2)
            : (counterBounds ? counterBounds.top + (counterBounds.height / 2) : window.innerHeight * 0.5),
        });
        pulseTimerRef.current = setTimeout(() => setStarPulse(null), 1450);
        flyingTimerRef.current = setTimeout(() => setFlyingStar(null), 1250);
        return next;
      });
    };

    window.addEventListener(DYSLEXIA_STAR_EVENT, awardStars);
    return () => {
      window.removeEventListener(DYSLEXIA_STAR_EVENT, awardStars);
      clearTimeout(pulseTimerRef.current);
      clearTimeout(flyingTimerRef.current);
      clearTimeout(rewardTimerRef.current);
    };
  }, [storageKey]);

  const starLabel = useMemo(() => (rewards.stars === 1 ? 'STAR' : 'STARS'), [rewards.stars]);

  return (
    <>
      {children}
      <DyslexiaConfettiBurst active={rewardBurst} />
      <AnimatePresence>
        {flyingStar && (
          <motion.div
            key={flyingStar.id}
            className="dyslexia-flying-star"
            initial={{ x: flyingStar.fromX, y: flyingStar.fromY, scale: 0.35, opacity: 0 }}
            animate={{
              x: [flyingStar.fromX, flyingStar.fromX + ((flyingStar.toX - flyingStar.fromX) * 0.35), flyingStar.toX],
              y: [flyingStar.fromY, Math.min(flyingStar.fromY, flyingStar.toY) - 120, flyingStar.toY],
              scale: [0.25, 1.5, 0.75, 0.25],
              rotate: [0, -35, 360, 720],
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 1.15, times: [0, 0.2, 0.82, 1], ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <img className="dyslexia-flying-star__main" src={rewardStarImg} alt="" />
            <i className="dyslexia-flying-star__spark dyslexia-flying-star__spark--one" />
            <i className="dyslexia-flying-star__spark dyslexia-flying-star__spark--two" />
            <i className="dyslexia-flying-star__spark dyslexia-flying-star__spark--three" />
            {flyingStar.added > 1 && <span>+{flyingStar.added}</span>}
          </motion.div>
        )}
      </AnimatePresence>
      <aside
        ref={counterRef}
        className={`dyslexia-star-counter${isVisible ? '' : ' dyslexia-star-counter--hidden'}`}
        aria-hidden={!isVisible}
        aria-label={`Star rewards collected: ${rewards.stars}`}
      >
        <div className="dyslexia-star-counter__mascot" aria-hidden="true">
          <motion.img
            src={elephantBucketImg}
            alt=""
            animate={starPulse ? { y: [0, -6, 0], rotate: [0, -2, 2, 0] } : { y: [0, -2, 0] }}
            transition={starPulse ? { duration: 0.55 } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span ref={bucketTargetRef} className="dyslexia-star-counter__bucket-target" />
        </div>
        <div className="dyslexia-star-counter__section">
          <motion.span
            className="dyslexia-star-counter__icon"
            animate={starPulse ? { scale: [1, 1.45, 1], rotate: [0, 12, -8, 0] } : { scale: 1 }}
          >⭐</motion.span>
          <strong>{rewards.stars}</strong>
          <span>{starLabel}</span>
        </div>
        <AnimatePresence>
          {starPulse && (
            <motion.div
              key={starPulse.id}
              className="dyslexia-star-counter__plus"
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, y: -4, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              +{starPulse.added} ⭐
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </>
  );
}
