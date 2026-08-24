import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import turtleBasketImage from "../assets/turtle-star-basket-generated.png";

const REWARD_EVENT = "working-memory:award-star";

export const awardStar = (origin) => {
  if (typeof window === "undefined") return;

  let x = window.innerWidth * 0.5;
  let y = window.innerHeight * 0.48;

  if (origin?.clientX != null && origin?.clientY != null) {
    x = origin.clientX;
    y = origin.clientY;
  } else if (origin?.getBoundingClientRect) {
    const rect = origin.getBoundingClientRect();
    x = rect.left + (rect.width / 2);
    y = rect.top + (rect.height / 2);
  }

  window.dispatchEvent(new CustomEvent(REWARD_EVENT, { detail: { x, y } }));
};

const scheduleBasketChime = (delaySeconds = 0.7) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const arrivalTime = context.currentTime + delaySeconds;

    [1046.5, 1318.5, 1568].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = arrivalTime + (index * 0.07);

      oscillator.type = index === 2 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.11, startTime + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.26);
    });

    window.setTimeout(() => context.close(), (delaySeconds * 1000) + 650);
  } catch {
    // Rewards remain fully usable when Web Audio is unavailable.
  }
};

const StarRewardSystem = ({ sessionKey, onCountChange }) => {
  const [count, setCount] = useState(0);
  const [flyingStars, setFlyingStars] = useState([]);
  const [basketPulse, setBasketPulse] = useState(0);
  const nextIdRef = useRef(0);
  const lastPointerRef = useRef(null);

  useEffect(() => {
    setCount(0);
    setFlyingStars([]);
    onCountChange?.(0);
  }, [onCountChange, sessionKey]);

  const collectStar = useCallback((event) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    const x = Number(event.detail?.x)
      || lastPointerRef.current?.x
      || window.innerWidth * 0.5;
    const y = Number(event.detail?.y)
      || lastPointerRef.current?.y
      || window.innerHeight * 0.48;

    setFlyingStars((current) => [...current, { id, x, y }]);
    scheduleBasketChime();

    window.setTimeout(() => {
      setFlyingStars((current) => current.filter((star) => star.id !== id));
      setCount((current) => {
        const next = current + 1;
        onCountChange?.(next);
        return next;
      });
      setBasketPulse((current) => current + 1);
    }, 760);
  }, [onCountChange]);

  useEffect(() => {
    const rememberPointer = (event) => {
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener(REWARD_EVENT, collectStar);
    window.addEventListener("pointerdown", rememberPointer, true);
    return () => {
      window.removeEventListener(REWARD_EVENT, collectStar);
      window.removeEventListener("pointerdown", rememberPointer, true);
    };
  }, [collectStar]);

  if (!sessionKey) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed right-2 top-20 z-[90] flex flex-col items-center sm:right-4 sm:top-24"
        aria-live="polite"
        aria-label={`එකතු කළ තරු ${count}`}
      >
        <motion.div
          initial={false}
          animate={basketPulse
            ? { scale: [1, 1.18, 1], rotate: [0, -5, 4, 0] }
            : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="relative h-[145px] w-[112px] sm:h-[180px] sm:w-[140px]"
        >
          <img
            src={turtleBasketImage}
            alt="තරු එකතු කරන කූඩය අල්ලාගෙන සිටින කැස්බෑ යාළුවා"
            className="h-full w-full object-contain drop-shadow-xl"
          />
        </motion.div>
        <motion.div
          key={count}
          initial={{ scale: 1.35 }}
          animate={{ scale: 1 }}
          className="-mt-5 rounded-full border-2 border-white bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 text-sm font-black text-amber-950 shadow-lg"
        >
          ⭐ {count}
        </motion.div>
      </div>

      <AnimatePresence>
        {flyingStars.map((star) => (
          <motion.div
            key={star.id}
            className="pointer-events-none fixed z-[100] text-5xl"
            style={{ left: star.x - 24, top: star.y - 24 }}
            initial={{ opacity: 0, scale: 0.2, rotate: -30 }}
            animate={{
              left: "calc(100vw - 72px)",
              top: 160,
              opacity: [0, 1, 1, 0.9],
              scale: [0.2, 1.35, 1, 0.45],
              rotate: 540,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.76, ease: [0.2, 0.75, 0.25, 1] }}
            aria-hidden="true"
          >
            ⭐
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
};

export default StarRewardSystem;
