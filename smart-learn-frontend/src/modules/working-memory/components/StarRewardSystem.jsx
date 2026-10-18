import { loadBasket, saveBasket, improveBasket } from "../utils/starBasket";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

import turtleBasketImage from "../assets/turtle-star-basket-generated.png";
import "./StarRewardSystem.css";

const REWARD_EVENT = "working-memory:award-star";
const DEFAULT_STORAGE_KEY = "working-memory:total-stars:guest";

const readStoredCount = (storageKey) => {
  if (typeof window === "undefined") return 0;

  const storedCount = Number(window.localStorage.getItem(storageKey));
  return Number.isFinite(storedCount) && storedCount >= 0
    ? Math.floor(storedCount)
    : 0;
};

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

const StarRewardSystem = ({
  sessionKey,
  rewardScopeKey,
  storageKey = DEFAULT_STORAGE_KEY,
  authoritativeCount = null,
  bestStarsByGame,
  onCountChange,
  panelHost = null,
  visible = true,
}) => {
  const basketRefState = useRef(null);
  if (!basketRefState.current) {
    basketRefState.current = loadBasket(storageKey, bestStarsByGame, Math.max(readStoredCount(storageKey), Number(authoritativeCount) || 0));
  }
  const [count, setCount] = useState(basketRefState.current.total);
  const [runCount, setRunCount] = useState(0);
  const [flyingStars, setFlyingStars] = useState([]);
  const [correctPopup, setCorrectPopup] = useState(null);
  const [basketPulse, setBasketPulse] = useState(0);
  const nextIdRef = useRef(0);
  const basketRef = useRef(null);
  const lastPointerRef = useRef(null);
  const correctPopupTimerRef = useRef(null);
  const countRef = useRef(count);
  const runCountRef = useRef(0);
  const onCountChangeRef = useRef(onCountChange);
  const rewardScopeKeyRef = useRef(rewardScopeKey);
  const storageKeyRef = useRef(storageKey);

  useEffect(() => {
    const basket = loadBasket(storageKey, bestStarsByGame, Math.max(readStoredCount(storageKey), Number(authoritativeCount) || 0));
    basketRefState.current = basket;
    saveBasket(storageKey, basket);
    setCount(basket.total);
  }, [authoritativeCount, bestStarsByGame, storageKey]);

  useEffect(() => {
    // Reset the run counter only; per-game bests survive replays.
    setFlyingStars([]);
    rewardScopeKeyRef.current = rewardScopeKey;
    storageKeyRef.current = storageKey;
    runCountRef.current = 0;
    setRunCount(0);
    onCountChangeRef.current?.(countRef.current, 0);
  }, [rewardScopeKey, sessionKey, storageKey]);

  useEffect(() => {
    countRef.current = count;
    onCountChangeRef.current = onCountChange;
    window.localStorage.setItem(storageKey, String(count));
    onCountChange?.(count, runCount);
  }, [count, onCountChange, runCount, storageKey]);

  const collectStar = useCallback((event) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    const x = Number(event.detail?.x)
      || lastPointerRef.current?.x
      || window.innerWidth * 0.5;
    const y = Number(event.detail?.y)
      || lastPointerRef.current?.y
      || window.innerHeight * 0.48;

    const basket = basketRef.current?.getBoundingClientRect();
    const targetX = basket ? basket.left + basket.width / 2 - 24 : window.innerWidth - 82;
    const targetY = basket ? basket.top + basket.height / 2 - 24 : 230;
    setFlyingStars((current) => [...current, { id, x, y, targetX, targetY }]);
    scheduleBasketChime();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#22C55E", "#0EA5E9", "#A78BFA", "#FB923C", "#F472B6"],
    });

    window.clearTimeout(correctPopupTimerRef.current);
    setCorrectPopup(id);
    correctPopupTimerRef.current = window.setTimeout(() => {
      setCorrectPopup(null);
    }, 900);

    const eventStorageKey = storageKeyRef.current;
    const eventGameKey = rewardScopeKeyRef.current?.replace(/-\d+$/, "");
    runCountRef.current += 1;
    setRunCount(runCountRef.current);
    onCountChangeRef.current?.(countRef.current, runCountRef.current);
    if (eventGameKey) {
      // Commit immediately so a navigation during the animation cannot lose stars.
      const basket = improveBasket(basketRefState.current, eventGameKey, runCountRef.current);
      basketRefState.current = basket;
      saveBasket(eventStorageKey, basket);
      countRef.current = basket.total;
      setCount(basket.total);
    }


    window.setTimeout(() => {
      setFlyingStars((current) => current.filter((star) => star.id !== id));
      setBasketPulse((current) => current + 1);
    }, 760);
  }, []);

  useEffect(() => {
    const rememberPointer = (event) => {
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener(REWARD_EVENT, collectStar);
    window.addEventListener("pointerdown", rememberPointer, true);
    return () => {
      window.removeEventListener(REWARD_EVENT, collectStar);
      window.removeEventListener("pointerdown", rememberPointer, true);
      window.clearTimeout(correctPopupTimerRef.current);
    };
  }, [collectStar]);

  if (!sessionKey || !visible) return null;

  const panel = (
    <div
      className="wm-reward-panel pointer-events-none fixed right-1.5 top-[4.5rem] z-[90] sm:right-4 sm:top-24"
      aria-live="polite"
      aria-label={`එකතු කළ තරු ${count}`}
    >
      <motion.div
        initial={false}
        animate={basketPulse
          ? { scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }
          : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.42, ease: "easeOut" }}
        className="wm-reward-card relative flex w-[68px] flex-col items-center overflow-hidden rounded-[20px] border-2 border-amber-300/90 bg-gradient-to-b from-cyan-700 via-blue-800 to-[#073B72] px-1.5 pb-2 pt-2 shadow-[0_10px_24px_rgba(2,40,90,0.45),0_0_0_1px_rgba(186,230,253,0.75),inset_0_0_20px_rgba(34,211,238,0.22)] sm:w-[150px] sm:rounded-[34px] sm:border-[3px] sm:px-3 sm:pb-6 sm:pt-5"
      >
        <div className="absolute left-3 top-7 h-1.5 w-1.5 rounded-full bg-cyan-100/80 shadow-[0_0_8px_#a5f3fc]" />
        <div className="absolute right-4 top-16 h-1 w-1 rounded-full bg-cyan-100/80 shadow-[0_0_7px_#a5f3fc]" />
        <img
          ref={basketRef}
          src={turtleBasketImage}
          alt="තරු එකතු කරන කූඩය අල්ලාගෙන සිටින කැස්බෑ යාළුවා"
          className="h-[48px] w-[52px] object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.28)] sm:h-[138px] sm:w-[138px]"
        />

        <div className="wm-reward-divider my-1 h-px w-4/5 bg-gradient-to-r from-transparent via-amber-200/80 to-transparent sm:my-3" />
        <motion.div
          key={count}
          initial={{ scale: 1.35, y: -4 }}
          animate={{ scale: 1, y: 0 }}
          className="wm-reward-total flex flex-col items-center"
        >
          <span className="text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.72)] sm:text-5xl" aria-hidden="true">⭐</span>
          <span className="text-lg font-black leading-none text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:mt-1 sm:text-5xl">
            {count}
          </span>
          <span className="mt-0.5 text-[7px] font-black tracking-[0.12em] text-amber-100 sm:mt-2 sm:text-sm sm:tracking-[0.2em]">
            STARS
          </span>
        </motion.div>
      </motion.div>
    </div>

  );

  return (
    <>
      {panelHost ? createPortal(panel, panelHost) : panel}

      <AnimatePresence>
        {correctPopup !== null && (
          <motion.div
            key={`correct-${correctPopup}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-green-500 px-8 py-4 text-xl font-extrabold text-white shadow-xl"
            role="status"
          >
            නිවැරදි!
          </motion.div>
        )}

        {flyingStars.map((star) => (
          <motion.div
            key={star.id}
            className="pointer-events-none fixed z-[100] text-5xl"
            style={{ left: star.x - 24, top: star.y - 24 }}
            initial={{ opacity: 0, scale: 0.2, rotate: -30 }}
            animate={{
              left: star.targetX,
              top: star.targetY,
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
