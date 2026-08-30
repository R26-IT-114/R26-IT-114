import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

import { useProgress } from "../context/ProgressContext";
import { predictShape } from "../api/workingMemoryApi";
import { adaptShapeRecallConfig } from "../utils/adaptiveDifficulty";
import { awardStar } from "../components/StarRewardSystem";
import { AnimatedSeaBg } from "./SequenceRecallGame";

import circleImage from "../assets/mlIMG/circle.jpg";
import squareImage from "../assets/mlIMG/square.webp";
import triangleImage from "../assets/mlIMG/triangle.avif";
import shapeSeahorseLevelBoard from "../assets/shape-seahorse-level-board-generated.png";
import shapeTimerCrab from "../assets/timer-crab-generated.png";
import shapeTimerTreasure from "../assets/timer-treasure-chest-generated.png";
import shapeDolphinDisplayBoard from "../assets/shape-dolphin-display-board-generated.png";
import shapeDolphinQuestionBoard from "../assets/shape-dolphin-question-board-v2.png";

const GAME_ID = "memory-shape-recall";
const MIN_ACCEPTED_CONFIDENCE = 0.4;
const PREDICTION_POPUP_DURATION_MS = 3500;

/* =========================================================
   SHAPES
========================================================= */

const SHAPES = [
  {
    id: "circle",
    label: "වෘත්තය",
    image: circleImage,
  },
  {
    id: "square",
    label: "චතුරස්‍රය",
    image: squareImage,
  },
  {
    id: "triangle",
    label: "ත්‍රිකෝණය",
    image: triangleImage,
  },
];

const LEVEL_ONE_GAME_SHAPES = {
  1: ["triangle", "circle", "square"],
  2: ["square", "triangle", "circle"],
  3: ["circle", "square", "triangle"],
};

/* =========================================================
   THREE ROUNDS PER LEVEL
========================================================= */

const GAME_CONFIG = {
  1: {
    gameNumber: 1,
    cardCount: 4,
    revealTime: 10000,
    label: "හැඩ හතරක් මතක තබාගන්න",
  },

  2: {
    gameNumber: 2,
    cardCount: 4,
    revealTime: 10000,
    label: "හැඩ හතරක් මතක තබාගන්න",
  },

  3: {
    gameNumber: 3,
    cardCount: 4,
    revealTime: 10000,
    label: "අලුත් පිළිවෙලේ හැඩ හතර මතක තබාගන්න",
  },
};

const LEVEL_ONE_GAME_CONFIG = {
  1: { ...GAME_CONFIG[1], cardCount: 3, revealTime: 14000, label: "හැඩ තුනක් මතක තබාගන්න" },
  2: { ...GAME_CONFIG[2], cardCount: 3, revealTime: 14000, label: "අලුත් පිළිවෙලේ හැඩ තුන මතක තබාගන්න" },
  3: { ...GAME_CONFIG[3], cardCount: 3, revealTime: 14000, label: "හැඩ තුනක් නැවත මතක තබාගන්න" },
};

/* =========================================================
   HELPERS
========================================================= */

const shuffle = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const normalizeShape = (shape) => {
  if (!shape || typeof shape !== "string") {
    return "";
  }

  return shape.trim().toLowerCase();
};

const getShape = (id) => {
  return SHAPES.find((shape) => shape.id === id);
};

const PREDICTION_LABELS = {
  circle: "රවුමක්",
  square: "කොටුවක්",
  triangle: "ත්‍රිකෝණයක්",
};

const getConfidenceText = (confidence) => {
  if (confidence < MIN_ACCEPTED_CONFIDENCE) return "හඳුනාගත නොහැක";
  if (confidence < 0.5) return "අඩු විශ්වාසයක්";
  if (confidence < 0.6) return "අඩුයි";
  if (confidence < 0.7) return "මධ්‍යමයි";
  if (confidence < 0.8) return "හොඳයි";

  return "ඉතා හොඳයි";
};

/* =========================================================
   CARD
========================================================= */

const MemoryCard = ({
  card,
  index,
  flipped,
  selected,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 250,
      }}
      className="perspective-[1000px]"
    >
      <motion.div
        animate={{
          rotateY: flipped ? 180 : 0,
          scale: selected ? 1.05 : 1,
        }}
        transition={{
          duration: 0.65,
          ease: "easeInOut",
        }}
        className="relative h-[104px] w-full sm:h-[150px] lg:h-[168px]"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-white to-sky-50 shadow-xl ${
            selected ? "ring-4 ring-yellow-300" : ""
          }`}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-100 bg-white shadow-lg sm:h-[108px] sm:w-[108px] sm:rounded-3xl lg:h-[122px] lg:w-[122px]">
            <img
              src={card.image}
              alt={card.label}
              className={`h-full w-full object-contain p-1.5 sm:p-2 ${card.imageClassName || ""}`}
            />
          </div>

          <div className="mt-1 text-[11px] font-black text-sky-800 sm:mt-2 sm:text-sm">
            හැඩය {index + 1}
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg sm:h-12 sm:w-12">
            <span className="text-xl font-black text-blue-600 sm:text-2xl">
              {index + 1}
            </span>
          </div>

          <p className="mt-1 text-[10px] font-black text-white sm:mt-2 sm:text-sm">
            කාඩ්පත {index + 1}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ShapeCrabTimer = ({ durationMs, seconds }) => (
  <div className="relative mx-auto mb-2 h-[70px] w-full max-w-3xl overflow-hidden rounded-[1.35rem] border-[3px] border-white/90 shadow-lg sm:h-[76px]"
    style={{ background:"linear-gradient(180deg,#E0F2FE 0%,#BAE6FD 43%,#38BDF8 44%,#0369A1 100%)" }}
    aria-label={`හැඩ බැලීමට ඉතිරි කාලය තත්පර ${seconds}`}>
    <motion.div className="absolute left-[-45px] right-[-45px] top-7 h-9" animate={{ x:[0,-46] }} transition={{ duration:2.4, repeat:Infinity, ease:"linear" }} aria-hidden="true">
      <svg viewBox="0 0 720 44" width="140%" height="100%" preserveAspectRatio="none"><path d="M0 22 Q24 3 48 22 T96 22 T144 22 T192 22 T240 22 T288 22 T336 22 T384 22 T432 22 T480 22 T528 22 T576 22 T624 22 T672 22 T720 22 L720 44 L0 44 Z" fill="rgba(255,255,255,.58)"/></svg>
    </motion.div>
    <motion.div className="absolute left-[-55px] right-[-55px] top-[45px] h-8" animate={{ x:[-54,0] }} transition={{ duration:3.1, repeat:Infinity, ease:"linear" }} aria-hidden="true">
      <svg viewBox="0 0 720 44" width="140%" height="100%" preserveAspectRatio="none"><path d="M0 22 Q28 7 56 22 T112 22 T168 22 T224 22 T280 22 T336 22 T392 22 T448 22 T504 22 T560 22 T616 22 T672 22 T728 22 L728 44 L0 44 Z" fill="rgba(3,105,161,.38)"/></svg>
    </motion.div>
    <motion.div className="absolute left-2 top-5 z-10 h-12 w-12 sm:h-14 sm:w-14" initial={{ left:"2%" }} animate={{ left:"79%", y:[0,-3,0], rotate:[-5,5,-5] }} transition={{ left:{ duration:durationMs / 1000, ease:"linear" }, y:{ duration:.55, repeat:Infinity }, rotate:{ duration:.55, repeat:Infinity } }} aria-hidden="true">
      <img src={shapeTimerCrab} alt="" className="h-full w-full object-contain" style={{ filter:"drop-shadow(0 6px 8px rgba(3,105,161,.28))" }}/>
    </motion.div>
    <motion.img src={shapeTimerTreasure} alt="" className="absolute bottom-0 right-1 z-[9] h-[58px] w-[58px] object-contain sm:h-[64px] sm:w-[64px]" animate={{ scale:[1,1.07,1] }} transition={{ duration:1.6, repeat:Infinity }} aria-hidden="true"/>
    <div className="absolute left-3 top-1.5 z-20 rounded-full bg-white/90 px-3 py-0.5 text-xs font-black text-sky-800 sm:text-sm">තත්පර {seconds}</div>
    <div className="absolute bottom-1 left-3 z-20 rounded-full bg-white/85 px-2.5 py-0.5 text-[9px] font-black text-sky-800 sm:text-[10px]">කකුළුවා නිධානයට යනවා!</div>
  </div>
);

const DolphinShapeBoard = ({ cards, durationMs }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showShape, setShowShape] = useState(false);

  useEffect(() => {
    setActiveCardIndex(0);
    setShowShape(false);
  }, [cards]);

  useEffect(() => {
    if (!cards.length) return undefined;

    const cardDuration = Math.max(900, durationMs / cards.length);
    const flipTimer = window.setTimeout(
      () => setShowShape(true),
      Math.min(1200, cardDuration * 0.26),
    );
    const nextCardTimer = activeCardIndex < cards.length - 1
      ? window.setTimeout(() => {
          setShowShape(false);
          setActiveCardIndex((current) => current + 1);
        }, cardDuration)
      : null;

    return () => {
      window.clearTimeout(flipTimer);
      if (nextCardTimer) window.clearTimeout(nextCardTimer);
    };
  }, [activeCardIndex, cards.length, durationMs]);

  const activeCard = cards[activeCardIndex];

  return (
    <motion.div
      className="relative mx-auto w-[min(100%,64dvh)] max-w-[790px] sm:w-[min(100%,68dvh)] lg:w-[min(100%,72dvh)]"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <img
        src={shapeDolphinDisplayBoard}
        alt="ඩොල්ෆින් යාළුවා හැඩ කාඩ්පත අල්ලාගෙන සිටී"
        className="block h-auto w-full"
        style={{ filter: "drop-shadow(0 16px 22px rgba(2,132,199,.24))" }}
      />

      <div
        className="absolute flex items-center justify-center"
        style={{ left: "31%", right: "7%", top: "39%", bottom: "9%" }}
      >
        {activeCard && (
          <div className="w-[42%] min-w-[78px] max-w-[142px] perspective-[1000px]">
            <motion.div
              key={`${activeCard.id}-${activeCardIndex}`}
              className="relative aspect-square w-full"
              initial={{ opacity: 0, scale: 0.78, y: 10 }}
              animate={{
                opacity: 1,
                scale: showShape ? [1, 1.18, 1.05] : 1,
                y: 0,
                rotateY: showShape ? 180 : 0,
              }}
              transition={{
                opacity: { duration: 0.25 },
                scale: showShape
                  ? { duration: 0.72, times: [0, 0.55, 1], ease: "easeOut" }
                  : { type: "spring", stiffness: 240, damping: 18 },
                y: { duration: 0.25 },
                rotateY: { duration: 0.5, ease: "easeInOut" },
              }}
              style={{ transformStyle: "preserve-3d" }}
              aria-label={`කාඩ්පත ${activeCardIndex + 1}: ${showShape ? activeCard.label : "අංකය"}`}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-xl ring-2 ring-sky-200 sm:rounded-3xl sm:border-4"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-[clamp(2rem,8vw,4.5rem)] font-black leading-none text-white drop-shadow-md">
                  {activeCardIndex + 1}
                </span>
                <span className="mt-1 text-[9px] font-black text-blue-50 sm:text-xs">
                  කාඩ්පත
                </span>
              </div>

              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border-[3px] border-yellow-300 bg-white shadow-[0_0_30px_rgba(250,204,21,0.7)] ring-4 ring-white sm:rounded-3xl sm:border-4"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-2 rounded-xl border-2 border-dashed border-sky-200 sm:rounded-2xl"
                  animate={showShape ? { scale: [0.86, 1.06, 1], opacity: [0, 1, 0.75] } : {}}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  aria-hidden="true"
                />
                <img
                  src={activeCard.image}
                  alt={activeCard.label}
                  className={`relative z-10 h-full w-full object-contain p-2 sm:p-3 ${activeCard.imageClassName || ""}`}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <div
        className="absolute flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow sm:gap-2 sm:px-3"
        style={{ right: "7%", top: "34%" }}
        aria-label={`කාඩ්පත ${activeCardIndex + 1} / ${cards.length}`}
      >
        {cards.map((card, index) => (
          <span
            key={`${card.id}-step-${index}`}
            className={`h-2 rounded-full transition-all duration-300 sm:h-2.5 ${
              index === activeCardIndex
                ? "w-5 bg-blue-500 sm:w-7"
                : index < activeCardIndex
                  ? "w-2 bg-emerald-400 sm:w-2.5"
                  : "w-2 bg-slate-200 sm:w-2.5"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

const DolphinQuestionBoard = ({ cardNumber }) => (
  <motion.div
    className="relative mx-auto w-[min(100%,55dvh)] max-w-[760px] sm:w-[min(100%,61dvh)] lg:w-[min(100%,66dvh)]"
    initial={{ opacity: 0, scale: 0.9, y: 12 }}
    animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
    transition={{
      opacity: { duration: 0.3 },
      scale: { duration: 0.35 },
      y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    }}
  >
    <img
      src={shapeDolphinQuestionBoard}
      alt={`ඩොල්ෆින් යාළුවා කාඩ්පත ${cardNumber} පුවරුව අල්ලාගෙන සිටී`}
      className="block h-auto w-full"
      style={{ filter: "drop-shadow(0 16px 22px rgba(2,132,199,.24))" }}
    />

    <div
      className="absolute flex items-center justify-center"
      style={{ left: "20%", right: "6%", top: "30%", bottom: "12%" }}
    >
      <motion.div
        className="flex h-full w-full flex-col items-center justify-center rounded-[1.5rem] bg-transparent"
        initial={{ scale: 0.7, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220 }}
      >
        <span className="text-[clamp(4.5rem,16vw,9rem)] font-black leading-none text-blue-600 drop-shadow-sm">
          {cardNumber}
        </span>
        <span className="mt-1 rounded-full bg-sky-100 px-4 py-1 text-sm font-black text-sky-800 sm:text-xl">
          කාඩ්පත {cardNumber}
        </span>
      </motion.div>
    </div>
  </motion.div>
);

const ShapeRecallIntro = ({ level, onStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative z-10 grid h-full min-h-0 w-full grid-rows-[minmax(145px,34%)_1fr] overflow-hidden rounded-[2rem] border-4 border-white bg-white/95 p-2 shadow-2xl md:grid-cols-[0.85fr_1.15fr] md:grid-rows-1 md:gap-4 md:p-4"
  >
    <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-[1.7rem] bg-gradient-to-b from-sky-100 via-cyan-200 to-blue-400">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {[12, 31, 73, 88].map((left, index) => (
          <motion.span
            key={left}
            className="absolute bottom-[-24px] rounded-full border-2 border-white/70 bg-white/20"
            style={{ left: `${left}%`, width: 13 + index * 4, height: 13 + index * 4 }}
            animate={{ y: [0, -560], opacity: [0, 0.85, 0] }}
            transition={{ duration: 6 + index, delay: index * 0.7, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <motion.div
        className="relative w-[145px] sm:w-[180px] md:w-[clamp(260px,42vh,390px)]"
        animate={{ y: [0, -7, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={shapeSeahorseLevelBoard}
          alt={`මුහුදු අශ්ව යාළුවා මට්ටම ${level} පුවරුව අල්ලාගෙන සිටී`}
          className="block h-auto w-full"
          style={{ filter: "drop-shadow(0 18px 24px rgba(3,105,161,.3))" }}
        />
        <div
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ left: "25%", right: "8%", top: "45%", bottom: "19%" }}
        >
          <span className="text-[8px] font-black text-sky-700 sm:text-[10px] md:text-sm">අද පුහුණුව</span>
          <span className="text-2xl font-black leading-none text-violet-600 sm:text-3xl md:text-6xl">
            {level === 1 ? "හැඩ 3" : "හැඩ 4"}
          </span>
          <span className="mt-0.5 text-[7px] font-extrabold text-slate-600 sm:text-[9px] md:mt-1 md:text-sm">වට 3ක් සම්පූර්ණ කරමු</span>
        </div>
      </motion.div>
    </div>

    <div className="flex min-h-0 min-w-0 flex-col justify-center gap-1 px-1 py-1 text-center sm:gap-2 sm:px-3 md:gap-3 md:overflow-hidden md:px-4 md:py-1">
      <div>
        <div className="mx-auto mb-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700 sm:text-sm md:mb-2 md:gap-2 md:px-4 md:py-2">
          ⭐ මට්ටම {level}
        </div>
        <h2 className="text-xl font-black text-slate-800 sm:text-2xl md:text-4xl">හැඩ මතක අභියෝගය</h2>
        <p className="text-xs font-bold text-sky-700 sm:text-sm md:mt-1 md:text-base">බලමු, මතක තබමු, ඇඳලා පෙන්වමු!</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
        {[
          { icon: "👀", instruction: `හැඩ ${level === 1 ? 3 : 4} බලන්න`, color: "bg-sky-50 border-sky-200 text-sky-700" },
          { icon: "🧠", instruction: "හැඩය සහ තිබුණු තැන මතක තබාගන්න", color: "bg-violet-50 border-violet-200 text-violet-700" },
          { icon: "✏️", instruction: "අදාළ හැඩය පෙන්වන්න", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map((step, index) => (
          <motion.div
            key={step.instruction}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + index * 0.1 }}
            className={`rounded-xl border-2 p-1 sm:p-2 md:rounded-2xl md:p-3 ${step.color}`}
          >
            <div className="text-lg sm:text-2xl md:text-3xl">{step.icon}</div>
            <p className="text-[9px] font-black leading-tight sm:mt-1 sm:text-[11px] md:text-sm">
              {index + 1}. {step.instruction}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-3" aria-label="රවුම, කොටුව සහ ත්‍රිකෝණය">
        <motion.span className="h-6 w-6 rounded-full bg-pink-400 shadow-lg md:h-11 md:w-11" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <motion.span className="h-6 w-6 rotate-6 rounded-md bg-violet-500 shadow-lg md:h-10 md:w-10 md:rounded-lg" animate={{ rotate: [6, -6, 6] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.span className="h-0 w-0 border-x-[14px] border-b-[24px] border-x-transparent border-b-amber-400 drop-shadow-lg md:border-x-[23px] md:border-b-[40px]" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.8, delay: 0.3, repeat: Infinity }} />
        {level === 2 && <span className="h-6 w-6 rounded-full bg-emerald-400 shadow-lg md:h-10 md:w-10" />}
      </div>

      

      <motion.button
        type="button"
        onClick={onStart}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        className="min-h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-violet-600 px-4 py-2 text-base font-black text-white shadow-xl shadow-blue-200 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 sm:min-h-14 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-lg md:py-4"
      >
        🚀 ක්‍රීඩාව පටන් ගමු!
      </motion.button>
    </div>
  </motion.div>
);

/* =========================================================
   MAIN GAME
========================================================= */

const MemoryShapeRecallGame = ({
  level = 1,
  onComplete,
}) => {
  const safeLevel = Number(level) === 2 ? 2 : 1;

  const {
    initializeGame,
    completeLevel,
    updateLevelProgress,
    recordAdaptiveResult,
    getAdaptiveProfile,
  } = useProgress();

  const adaptiveProfile = useMemo(
    () => getAdaptiveProfile(GAME_ID),
    [getAdaptiveProfile],
  );
  const getGameConfig = useCallback(
    (game) => {
      const baseConfig = safeLevel === 1
        ? LEVEL_ONE_GAME_CONFIG[game]
        : GAME_CONFIG[game];
      const adaptedConfig = adaptShapeRecallConfig(baseConfig, adaptiveProfile, safeLevel);

      return {
        ...adaptedConfig,
        cardCount: baseConfig.cardCount,
        targetResponseMs: adaptedConfig.targetResponseMs
          + ((baseConfig.cardCount - adaptedConfig.cardCount) * 3500),
      };
    },
    [adaptiveProfile, safeLevel],
  );

  /* =======================================================
     GAME STATE
  ======================================================= */

  const [gameNumber, setGameNumber] = useState(1);
  const totalGames = 3;

  const [attempt, setAttempt] = useState(1);

  const [phase, setPhase] = useState("intro");

  const [cards, setCards] = useState([]);

  const [questionIndex, setQuestionIndex] = useState(null);

  const [timeLeft, setTimeLeft] = useState(5);

  const [message, setMessage] = useState("");

  /* =======================================================
     LEVEL RESULT
  ======================================================= */

  const [completedGames, setCompletedGames] = useState([]);

  const [gameAttempts, setGameAttempts] = useState({});

  const [finalResult, setFinalResult] = useState({
    correct: false,
    accuracy: 0,
    completedGames: 0,
    totalAttempts: 0,
    mistakes: 0,
  });

  /* =======================================================
     PREDICTION STATE
  ======================================================= */

  const [analysis, setAnalysis] = useState({
    status: "idle",
    predicted: null,
    confidence: 0,
    confidenceLevel: "හඳුනාගත නොහැක",
    matched: null,
  });

  /* =======================================================
     IMAGE INPUT
  ======================================================= */

  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedPreview, setSelectedPreview] = useState("");

  const [hasDrawing, setHasDrawing] = useState(false);

  /* =======================================================
     CANVAS
  ======================================================= */

  const canvasRef = useRef(null);

  const canvasWrapperRef = useRef(null);

  const ctxRef = useRef(null);

  const lastPointRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  /* =======================================================
     INPUT REFS
  ======================================================= */

  const fileInputRef = useRef(null);

  const cameraInputRef = useRef(null);

  const timerRef = useRef(null);

  const previewUrlRef = useRef("");

  const answerStartTimeRef = useRef(null);
  const responseTimesRef = useRef([]);
  const submissionLockRef = useRef(false);

  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {
    initializeGame(GAME_ID);
  }, [initializeGame]);

  /* =======================================================
     RESET PREVIEW
  ======================================================= */

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedFile(null);
    setSelectedPreview("");
  }, []);

  /* =======================================================
     RESET ANALYSIS
  ======================================================= */

  const resetAnalysis = useCallback(() => {
    setAnalysis({
      status: "idle",
      predicted: null,
      confidence: 0,
      confidenceLevel: "හඳුනාගත නොහැක",
      matched: null,
    });
  }, []);

  /* =======================================================
     CANVAS BACKGROUND
  ======================================================= */

  const drawCanvasBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#071a33";

    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#7dd3fc";

    ctx.lineWidth = 8;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";
  }, []);

  /* =======================================================
     RESIZE CANVAS
  ======================================================= */

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    const wrapper = canvasWrapperRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();

    const width = Math.max(
      280,
      rect.width
    );

    // Keep enough room below the canvas for the input and check buttons.
    // This uses the canvas' real viewport position, so short mobile screens
    // shrink the drawing area while desktop screens can still use a large one.
    const controlsSpace = window.innerWidth < 640 ? 200 : 190;
    const availableHeight = window.innerHeight - rect.top - controlsSpace;
    const height = Math.min(
      440,
      Math.max(
        140,
        availableHeight
      )
    );

    const ratio =
      window.devicePixelRatio || 1;

    canvas.width = width * ratio;

    canvas.height = height * ratio;

    canvas.style.width = `${width}px`;

    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    ctx.strokeStyle = "#7dd3fc";

    ctx.lineWidth = 8;

    ctxRef.current = ctx;

    drawCanvasBackground();
  }, [drawCanvasBackground]);

  useEffect(() => {
    if (phase !== "answer") {
      return;
    }

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas
      );
    };
  }, [phase, resizeCanvas]);

  /* =======================================================
     CLEAR DRAWING
  ======================================================= */

  const clearDrawing = useCallback(() => {
    drawCanvasBackground();

    setHasDrawing(false);

    resetAnalysis();

    setMessage("");
  }, [
    drawCanvasBackground,
    resetAnalysis,
  ]);

  /* =======================================================
     CREATE GAME CARDS
  ======================================================= */

  const createCardsForGame = useCallback(
    (game) => {
      const config = getGameConfig(game);
      const shapeOffset = Math.floor(Math.random() * SHAPES.length);
      const generatedCards = safeLevel === 1
        ? LEVEL_ONE_GAME_SHAPES[game].map((shapeId) => ({ ...getShape(shapeId) }))
        : shuffle(
            Array.from(
              { length: config.cardCount },
              (_, index) => SHAPES[(index + shapeOffset) % SHAPES.length],
            ),
          ).map((shape) => ({ ...shape }));

      const randomQuestion = Math.floor(Math.random() * generatedCards.length);

      setCards(generatedCards);

      setQuestionIndex(
        randomQuestion
      );

      setGameNumber(game);

      setAttempt(1);

      setTimeLeft(
        Math.ceil(
          config.revealTime / 1000
        )
      );

      resetAnalysis();

      clearPreview();

      setHasDrawing(false);

      setMessage("");

      answerStartTimeRef.current = null;

      setPhase("memorize");
    },
    [
      clearPreview,
      getGameConfig,
      resetAnalysis,
      safeLevel,
    ]
  );

  /* =======================================================
     START LEVEL 1
  ======================================================= */

  const startGame = useCallback(() => {
    setCompletedGames([]);

    setGameAttempts({});
    responseTimesRef.current = [];

    setFinalResult({
      correct: false,
      accuracy: 0,
      completedGames: 0,
      totalAttempts: 0,
      mistakes: 0,
    });

    createCardsForGame(1);
  }, [createCardsForGame]);

  /* =======================================================
     MEMORIZE TIMER
  ======================================================= */

  useEffect(() => {
    if (phase !== "memorize") {
      return;
    }

    const config = getGameConfig(gameNumber);

    let remaining =
      Math.ceil(
        config.revealTime / 1000
      );

    setTimeLeft(remaining);

    timerRef.current =
      setInterval(() => {
        remaining -= 1;

        setTimeLeft(
          Math.max(
            remaining,
            0
          )
        );

        if (remaining <= 0) {
          clearInterval(
            timerRef.current
          );

          setTimeout(() => {
            setPhase("question");

            setMessage(
              `කාඩ්පත ${
                questionIndex + 1
              } හි තිබුණු හැඩය මතකද?`
            );
          }, 250);
        }
      }, 1000);

    return () => {
      clearInterval(
        timerRef.current
      );
    };
  }, [
    phase,
    getGameConfig,
    gameNumber,
    questionIndex,
  ]);

  /* =======================================================
     START ANSWER
  ======================================================= */

  const startAnswer = () => {
    setPhase("answer");

    setMessage("");

    answerStartTimeRef.current =
      Date.now();

    setTimeout(() => {
      resizeCanvas();
    }, 100);
  };

  const replayShapeSequence = () => {
    setMessage("");
    setPhase("memorize");
  };

  /* =======================================================
     POINTER POSITION
  ======================================================= */

  const getPointerPosition = (
    event
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  };

  /* =======================================================
     DRAW LINE
  ======================================================= */

  const drawLine = (point) => {
    const ctx = ctxRef.current;

    if (!ctx || !point) {
      return;
    }

    const previous =
      lastPointRef.current;

    if (!previous) {
      lastPointRef.current =
        point;

      return;
    }

    ctx.beginPath();

    ctx.moveTo(
      previous.x,
      previous.y
    );

    ctx.lineTo(
      point.x,
      point.y
    );

    ctx.stroke();

    lastPointRef.current =
      point;

    setHasDrawing(true);
  };

  /* =======================================================
     POINTER DOWN
  ======================================================= */

  const handlePointerDown = (
    event
  ) => {
    if (phase !== "answer") {
      return;
    }

    if (
      analysis.status ===
      "loading"
    ) {
      return;
    }

    event.preventDefault();

    const point =
      getPointerPosition(event);

    if (!point) {
      return;
    }

    setIsDrawing(true);

    lastPointRef.current =
      point;
  };

  /* =======================================================
     POINTER MOVE
  ======================================================= */

  const handlePointerMove = (
    event
  ) => {
    if (!isDrawing) {
      return;
    }

    event.preventDefault();

    const point =
      getPointerPosition(event);

    drawLine(point);
  };

  /* =======================================================
     POINTER UP
  ======================================================= */

  const handlePointerUp = () => {
    setIsDrawing(false);

    lastPointRef.current =
      null;
  };

  /* =======================================================
     FILE PICK
  ======================================================= */

  const handleFilePick = (
    event,
    source
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    clearPreview();

    const url =
      URL.createObjectURL(file);

    previewUrlRef.current =
      url;

    setSelectedFile(file);

    setSelectedPreview(url);

    setHasDrawing(false);

    resetAnalysis();

    setMessage(
      source === "camera"
        ? "කැමරා පින්තූරය ලැබුණා! දැන් පරීක්ෂා කරමු."
        : "පින්තූරය ලැබුණා! දැන් පරීක්ෂා කරමු."
    );
  };

  /* =======================================================
     CANVAS TO BLOB
  ======================================================= */

  const canvasToBlob =
    useCallback(() => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return Promise.resolve(
          null
        );
      }

      return new Promise(
        (
          resolve,
          reject
        ) => {
          const sourceCtx = canvas.getContext("2d");

          if (!sourceCtx) {
            reject(new Error("Canvas unavailable"));
            return;
          }

          const { width, height } = canvas;
          const pixels = sourceCtx.getImageData(0, 0, width, height).data;
          let minX = width;
          let minY = height;
          let maxX = -1;
          let maxY = -1;

          // Only preserve the strong blue pen stroke. This deliberately ignores
          // the pale-blue dashed guide frame and the white canvas background.
          const isDrawingPixel = (red, green, blue, alpha) => (
            alpha > 0
            && blue - red >= 60
            && green - red >= 70
            && ((red + green + blue) / 3) < 210
          );

          for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
              const offset = (y * width + x) * 4;
              if (!isDrawingPixel(
                pixels[offset],
                pixels[offset + 1],
                pixels[offset + 2],
                pixels[offset + 3],
              )) continue;

              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }

          if (maxX < minX || maxY < minY) {
            resolve(null);
            return;
          }

          const padding = Math.max(24, Math.round(Math.max(maxX - minX, maxY - minY) * 0.2));
          const cropX = Math.max(0, minX - padding);
          const cropY = Math.max(0, minY - padding);
          const cropWidth = Math.min(width - cropX, maxX - minX + (padding * 2));
          const cropHeight = Math.min(height - cropY, maxY - minY + (padding * 2));

          // A square, high-contrast image is much closer to a model-training
          // sample than the full responsive drawing canvas.
          const output = document.createElement("canvas");
          output.width = 640;
          output.height = 640;

          const ctx = output.getContext("2d");

          if (!ctx) {
            reject(
              new Error(
                "Canvas unavailable"
              )
            );

            return;
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, output.width, output.height);

          const scale = Math.min(output.width / cropWidth, output.height / cropHeight) * 0.84;
          const drawWidth = cropWidth * scale;
          const drawHeight = cropHeight * scale;
          const drawX = (output.width - drawWidth) / 2;
          const drawY = (output.height - drawHeight) / 2;

          ctx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, drawX, drawY, drawWidth, drawHeight);

          // Convert the blue pen to a bold black outline and remove any guide
          // pixels that were carried into the crop.
          const normalized = ctx.getImageData(0, 0, output.width, output.height);
          for (let offset = 0; offset < normalized.data.length; offset += 4) {
            const red = normalized.data[offset];
            const green = normalized.data[offset + 1];
            const blue = normalized.data[offset + 2];
            if (isDrawingPixel(red, green, blue, normalized.data[offset + 3])) {
              normalized.data[offset] = 0;
              normalized.data[offset + 1] = 0;
              normalized.data[offset + 2] = 0;
            } else {
              normalized.data[offset] = 255;
              normalized.data[offset + 1] = 255;
              normalized.data[offset + 2] = 255;
            }
          }
          ctx.putImageData(normalized, 0, 0);

          output.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], "canvas-shape.png", { type: "image/png" }));
              } else {
                reject(
                  new Error(
                    "Image export failed"
                  )
                );
              }
            },
            "image/png"
          );
        }
      );
    }, []);

  /* =======================================================
     GET SUBMISSION
  ======================================================= */

  const getSubmissionFile =
    useCallback(
      async () => {
        if (selectedFile) {
          return selectedFile;
        }

        if (hasDrawing) {
          return canvasToBlob();
        }

        return null;
      },
      [
        canvasToBlob,
        hasDrawing,
        selectedFile,
      ]
    );

  const buildPerformanceMetrics = useCallback(
    (completedGameNumbers, attemptsByGame) => {
      const maxAttempts = getGameConfig(1).maxAttempts;
      const totalAttempts = Object.values(attemptsByGame).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      );
      const masteryPoints = completedGameNumbers.reduce(
        (sum, game) => sum + Math.max(0, (maxAttempts - Number(attemptsByGame[game] || maxAttempts) + 1) / maxAttempts),
        0,
      );
      const responseTimes = responseTimesRef.current.filter(Number.isFinite);

      return {
        totalGames,
        completedCount: completedGameNumbers.length,
        totalAttempts,
        mistakes: Math.max(totalAttempts - completedGameNumbers.length, 0),
        // Passing after several retries is still a pass, but should not be
        // scored like a first-attempt success for adaptive difficulty.
        accuracy: Math.round((masteryPoints / totalGames) * 100),
        averageResponseMs: responseTimes.length
          ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
          : null,
        targetResponseMs: getGameConfig(totalGames).targetResponseMs,
      };
    },
    [getGameConfig, totalGames],
  );

  /* =======================================================
     GAME OVER
  ======================================================= */

  const handleGameOver =
    useCallback((finalAttempts = gameAttempts) => {
      const metrics = buildPerformanceMetrics(completedGames, finalAttempts);
      const stats = {
        level: safeLevel,
        ...metrics,
        correct: metrics.completedCount,
        total: metrics.totalGames,
        difficulty: Array.from({ length: totalGames }, (_, index) => getGameConfig(index + 1).cardCount).join("-"),
        timestamp: new Date().toISOString(),
      };

      setFinalResult({
        correct: false,
        accuracy: metrics.accuracy,
        completedGames: metrics.completedCount,
        totalAttempts: metrics.totalAttempts,
        mistakes: metrics.mistakes,
      });

      // Failed levels must influence the next session too; otherwise the
      // profile only ever moves toward challenge after eventual success.
      updateLevelProgress(GAME_ID, safeLevel, metrics.accuracy, stats);
      recordAdaptiveResult(GAME_ID, stats);

      setPhase("gameover");
    }, [
      buildPerformanceMetrics,
      completedGames,
      gameAttempts,
      getGameConfig,
      recordAdaptiveResult,
      safeLevel,
      totalGames,
      updateLevelProgress,
    ]);

  /* =======================================================
     COMPLETE LEVEL
  ======================================================= */

  const finishLevel = useCallback(
  async (finalGames, finalAttempts) => {
    const metrics = buildPerformanceMetrics(
      finalGames,
      finalAttempts
    );
    const passed = metrics.completedCount === metrics.totalGames;

    const stats = {
      level: safeLevel,

      gamesCompleted: metrics.completedCount,
      totalGames: metrics.totalGames,

      correct: metrics.completedCount,
      total: metrics.totalGames,

      accuracy: metrics.accuracy,
      passed,

      totalAttempts: metrics.totalAttempts,
      mistakes: metrics.mistakes,

      averageResponseMs: metrics.averageResponseMs,
      targetResponseMs: metrics.targetResponseMs,

      game1Attempts: finalAttempts[1] || 0,
      game2Attempts: finalAttempts[2] || 0,
      game3Attempts: finalAttempts[3] || 0,
      game4Attempts: finalAttempts[4] || 0,

      difficulty: Array.from({ length: totalGames }, (_, index) => getGameConfig(index + 1).cardCount).join("-"),

      timestamp: new Date().toISOString(),
    };

    setFinalResult({
      correct:
        metrics.completedCount === metrics.totalGames,

      accuracy: metrics.accuracy,

      completedGames:
        metrics.completedCount,

      totalAttempts:
        metrics.totalAttempts,

      mistakes:
        metrics.mistakes,
    });

    try {
      // 1️⃣ Save level performance
      await updateLevelProgress(
        GAME_ID,
        safeLevel,
        metrics.accuracy,
        stats
      );

      // 2️⃣ Update adaptive profile
      // THIS IS THE IMPORTANT CALL
      await recordAdaptiveResult(
        GAME_ID,
        stats
      );

      // 3️⃣ Mark level as completed
      if (passed) {
        await completeLevel(
          GAME_ID,
          safeLevel,
          stats
        );
      }

    } catch (error) {
      console.error(
        "Progress update failed:",
        error
      );
    }

    if (passed) {
      confetti({
        particleCount: 180,
        spread: 100,
        origin: {
          y: 0.55,
        },
      });
    }

    if (passed && onComplete) {
      onComplete({
        passed: true,
        nextLevel: safeLevel === 1 ? 2 : null,
        level: safeLevel,
        accuracy: metrics.accuracy,
        correct: metrics.completedCount,
        total: metrics.totalGames,
        completedGames: metrics.completedCount,
        totalAttempts: metrics.totalAttempts,
        mistakes: metrics.mistakes,
        averageResponseMs: metrics.averageResponseMs,
      });
    } else {
      setPhase(passed ? "result" : "gameover");
    }
  },
  [
    completeLevel,
    buildPerformanceMetrics,
    getGameConfig,
    recordAdaptiveResult,
    onComplete,
    safeLevel,
    totalGames,
    updateLevelProgress,
  ]
);

  /* =======================================================
     SUCCESSFUL GAME
  ======================================================= */

  const handleGameSuccess =
    useCallback(
      (attemptUsed) => {
        const updatedAttempts = {
          ...gameAttempts,
          [gameNumber]:
            attemptUsed,
        };

        const updatedCompletedGames =
          completedGames.includes(
            gameNumber
          )
            ? completedGames
            : [
                ...completedGames,
                gameNumber,
              ];

        setGameAttempts(
          updatedAttempts
        );

        setCompletedGames(
          updatedCompletedGames
        );

        /*
          GAME 3 COMPLETE
        */

        if (gameNumber === totalGames) {
          setMessage(
            `තෙවන වටයත් හරි! මට්ටම ${safeLevel} සම්පූර්ණයි!`
          );

          setTimeout(() => {
            finishLevel(
              updatedCompletedGames,
              updatedAttempts
            );
          }, 1200);

          return;
        }

        /*
          MOVE TO NEXT GAME
        */

        const nextGame =
          gameNumber + 1;

        setMessage(
          `නියමයි! දැන් හැඩ ${getGameConfig(nextGame).cardCount}ක් තියෙන ${nextGame} වන වටයට යමු!`
        );

        setTimeout(() => {
          createCardsForGame(
            nextGame
          );
        }, 1400);
      },
      [
        completedGames,
        createCardsForGame,
        finishLevel,
        gameAttempts,
        gameNumber,
        getGameConfig,
        safeLevel,
        totalGames,
      ]
    );

  /* =======================================================
     ATTEMPT FAILED
  ======================================================= */

  const handleAttemptFailed =
    useCallback(
      (attemptUsed) => {
        const maxAttempts = getGameConfig(gameNumber).maxAttempts;
        const updatedAttempts = {
          ...gameAttempts,
          [gameNumber]:
            attemptUsed,
        };

        setGameAttempts(
          updatedAttempts
        );

        /*
          ATTEMPT 1 FAILED
          → Motivation
        */

        if (attemptUsed === 1) {
          setPhase("feedback");

          setMessage(
            "🌟 හොඳ උත්සාහයක්! මේක කරන්න ඔයාට පුළුවන්. ආයෙත් උත්සාහ කරමු! 💪"
          );

          setTimeout(() => {
            setAttempt(2);

            clearPreview();

            clearDrawing();

            resetAnalysis();

            setMessage("");

            setPhase("memorize");
          }, 2200);

          return;
        }

        /*
          ATTEMPT 2 FAILED
          → Hint
        */

        if (attemptUsed === 2) {
          setPhase("feedback");

          setMessage(
            "💡 පොඩි ඉඟියක්! මතකද? අපේ රූප අතර රවුමක්, ත්‍රිකෝණයක් සහ කොටුවක් තිබුණා. හොඳින් මතක් කරලා නැවත උත්සාහ කරමු! 🌟"
          );

          setTimeout(() => {
            setAttempt(3);

            clearPreview();

            clearDrawing();

            resetAnalysis();

            setMessage("");

            setPhase("memorize");
          }, 2500);

          return;
        }

        // Preserve Level 2's adaptive support retry. Level 1 always stops at
        // three attempts within its three-round learning flow.
        if (safeLevel === 2 && attemptUsed === 3 && maxAttempts > 3) {
          setPhase("feedback");
          setMessage("හැඩය සහ එය තිබුණු තැන නැවත හොඳින් බලන්න. මේ අවසාන උත්සාහයයි!");

          setTimeout(() => {
            setAttempt(4);
            clearPreview();
            clearDrawing();
            resetAnalysis();
            setMessage("");
            setPhase("memorize");
          }, 2500);

          return;
        }

        /*
          ATTEMPT 3 FAILED
          → GAME OVER
        */

        if (attemptUsed === maxAttempts) {
          setTimeout(() => {
            if (gameNumber < totalGames) {
              createCardsForGame(gameNumber + 1);
            } else {
              handleGameOver(updatedAttempts);
            }
          }, 1200);
        }
      },
      [
        clearDrawing,
        clearPreview,
        createCardsForGame,
        gameAttempts,
        getGameConfig,
        gameNumber,
        handleGameOver,
        resetAnalysis,
        safeLevel,
        totalGames,
      ]
    );

  /* =======================================================
     CHECK PREDICTION
  ======================================================= */

  const handleCheck =
    useCallback(
      async () => {
        if (
          submissionLockRef.current ||
          analysis.status !==
          "idle"
        ) {
          return;
        }

        submissionLockRef.current = true;

        let file;

        try {
          file = await getSubmissionFile();
        } catch (error) {
          submissionLockRef.current = false;
          console.error("Canvas export error:", error);
          setMessage("හැඩය සකස් කරන්න බැරි වුණා. නැවත අඳින්න.");
          return;
        }

        if (!file) {
          submissionLockRef.current = false;
          setMessage(
            "හැඩය අඳින්න හෝ පින්තූරයක් තෝරන්න."
          );

          return;
        }

        setAnalysis(
          (previous) => ({
            ...previous,
            status: "loading",
          })
        );

        setMessage(
          "හැඩය හඳුනාගනිමින්..."
        );

        try {
          const response =
            await predictShape(
              file
            );

          const predicted =
            normalizeShape(
              response?.shape
            );

          const confidence =
            Number(
              response?.confidence ??
                0
            );

          const targetShape =
            cards[
              questionIndex
            ];
          const expectedPrediction =
            normalizeShape(
              targetShape?.predictionClass || targetShape?.id
            );

          const confidenceLevel =
            getConfidenceText(
              confidence
            );

          const matched =
            predicted ===
              expectedPrediction &&
            confidence >= MIN_ACCEPTED_CONFIDENCE;

          const responseTimeMs =
            answerStartTimeRef.current
              ? Date.now() -
                answerStartTimeRef.current
              : null;

          if (Number.isFinite(responseTimeMs)) {
            responseTimesRef.current.push(responseTimeMs);
          }

          setAnalysis({
            status: "done",

            predicted,

            confidence,

            confidenceLevel,

            matched,
          });

          setPhase("prediction-result");

          /*
            CORRECT
          */

          if (matched) {
            awardStar();
            setMessage(
              attempt === 1
                ? "🎉 නියමයි! පළමු උත්සාහයෙන්ම හරි! 🚀"
                : attempt === 2
                  ? "🌟 Great Job! දෙවැනි උත්සාහයෙන් හරි!"
                  : "💪 නියමයි! තුන්වැනි උත්සාහයෙන් හරි!"
            );

            setTimeout(() => {
              handleGameSuccess(
                attempt
              );
            }, PREDICTION_POPUP_DURATION_MS);

            return;
          }

          /*
            WRONG
          */

          setMessage(
            attempt === 1
              ? "හ්ම්... ඒක හරි නෑ. කමක් නෑ! 😊"
              : attempt === 2
                ? "තව එක අවස්ථාවක් තියෙනවා! 💪"
                : "මේ වතාවේ හරි ගියේ නෑ. 💙"
          );

          setTimeout(() => {
            handleAttemptFailed(
              attempt
            );
          }, PREDICTION_POPUP_DURATION_MS);
        } catch (error) {
          console.error(
            "Prediction error:",
            error
          );

          setAnalysis({
            status: "done",

            predicted: null,

            confidence: 0,

            confidenceLevel:
              "හඳුනාගත නොහැක",

            matched: false,
          });

          setMessage(
            "හැඩය හඳුනාගන්න බැරි වුණා. නැවත උත්සාහ කරන්න."
          );
        } finally {
          submissionLockRef.current = false;
        }
      },
      [
        analysis.status,
        attempt,
        cards,
        getSubmissionFile,
        handleAttemptFailed,
        handleGameSuccess,
        questionIndex,
      ]
    );

  const failedGames = Array.from(
    { length: totalGames },
    (_, index) => index + 1,
  ).filter((game) => gameAttempts[game] && !completedGames.includes(game));

  /* =======================================================
     GAME CONFIG
  ======================================================= */

  const currentConfig =
    getGameConfig(gameNumber);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="relative flex h-[calc(100dvh-80px)] min-h-0 overflow-hidden px-3 py-2 sm:px-5">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <AnimatedSeaBg />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-center gap-2">

        {/* =================================================
            HEADER
        ================================================= */}

        {phase === "hidden-header" && (
        <div className="rounded-[2rem] border-4 border-white bg-white/95 p-5 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-black tracking-widest text-sky-500">
                මතක පුහුණුව
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-800 sm:text-3xl">
                හැඩ මතකය
              </h1>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 px-5 py-3 text-center text-white shadow-lg">

              <p className="text-xs font-bold">
                මට්ටම
              </p>

              <p className="text-2xl font-black">
                {safeLevel}
              </p>

            </div>

          </div>

          {/* GAME PROGRESS */}

          <div className="mt-5 flex gap-2">

            {Array.from({ length: totalGames }, (_, index) => index + 1).map(
              (game) => (
                <div
                  key={game}
                  className={`h-3 flex-1 rounded-full transition-all ${
                    completedGames.includes(
                      game
                    )
                      ? "bg-emerald-500"
                      : game ===
                          gameNumber
                        ? "bg-purple-500"
                        : "bg-slate-200"
                  }`}
                />
              )
            )}

          </div>

          <div className="mt-2 flex justify-between text-xs font-bold text-slate-400">

            <span>
              පළමු වටය • හැඩ 3
            </span>

            <span>
              දෙවන වටය • හැඩ 4
            </span>

            <span>
              තෙවන වටය • හැඩ 6
            </span>

          </div>

        </div>
        )}

        {/* =================================================
            INTRO
        ================================================= */}

        {phase === "intro" && <ShapeRecallIntro level={safeLevel} onStart={startGame} />}

        {phase === "legacy-intro" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-4 text-center shadow-2xl sm:p-6"
          >

            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-5xl shadow-xl">
              🧠
            </div>

            <h2 className="text-2xl font-black text-slate-800">
              Shapes මතක තියාගන්න! 🎯
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-relaxed text-slate-500">
              Card වල තියෙන shapes හොඳින් බලන්න.
              පස්සේ cards වැහෙනවා.
              ඔයාට මතක shape එක අඳින්න හෝ photo එකක් upload කරන්න.
            </p>

            {/* 3 GAME STEPS */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <div className="rounded-3xl bg-sky-50 p-4 shadow-md">
                <div className="text-3xl">
                  3️⃣
                </div>

                <p className="mt-2 font-black text-slate-700">
                  Game 1
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Shapes 3ක්
                </p>
              </div>

              <div className="rounded-3xl bg-purple-50 p-4 shadow-md">
                <div className="text-3xl">
                  4️⃣
                </div>

                <p className="mt-2 font-black text-slate-700">
                  Game 2
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Shapes 4ක්
                </p>
              </div>

              <div className="rounded-3xl bg-pink-50 p-4 shadow-md">
                <div className="text-3xl">
                  6️⃣
                </div>

                <p className="mt-2 font-black text-slate-700">
                  Game 3
                </p>

                <p className="text-sm font-bold text-slate-500">
                  Shapes 6ක්
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-3xl bg-yellow-50 p-4">

              <p className="font-black text-yellow-700">
                🌟 උත්සාහ 3ක් තියෙනවා!
              </p>

              <p className="mt-1 text-sm font-semibold text-yellow-600">
                පළමු උත්සාහයෙන් බැරි වුණොත්
                අපි ඔයාට උදව් කරනවා.
              </p>

            </div>

            <button
              type="button"
              onClick={startGame}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-lg font-black text-white shadow-xl transition hover:scale-[1.02]"
            >
              🚀 Game එක පටන් ගමු!
            </button>

          </motion.div>

        )}

        {/* =================================================
            MEMORIZE
        ================================================= */}

        {phase === "memorize" && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="max-h-full rounded-[2rem] border-4 border-white bg-white/95 p-3 shadow-2xl sm:p-4"
          >

            {/* GAME / ATTEMPT */}

            <div className="mb-2 flex items-center justify-between">

              <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700">
                වටය {gameNumber} / {totalGames}
              </div>

              <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                උත්සාහය {attempt} / {currentConfig.maxAttempts}
              </div>

            </div>

            <div className="mb-2 text-center">

              <div className="hidden items-center gap-2 rounded-full bg-orange-100 px-5 py-2 text-orange-700">

                <span className="text-xl">
                  ⏱️
                </span>

                <span className="text-lg font-black">
                  {timeLeft}
                </span>

              </div>

              <h2 className="mt-1 text-xl font-black text-slate-800 sm:text-2xl">
                {safeLevel === 1 ? "හැඩ 3ක් පෙන්වයි" : currentConfig.label}
              </h2>

              <p className="mt-1 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-bold text-sky-700 sm:text-base">
                හැඩය සහ එය තිබුණු තැන හොඳින් මතක තබාගෙන අඳුරු කොටුවේ අඳින්න
              </p>

            </div>

            {/* TIMER */}

            <ShapeCrabTimer key={`${safeLevel}-${gameNumber}-${attempt}`} durationMs={currentConfig.revealTime} seconds={timeLeft} />

            {/* CARDS */}

            {safeLevel === 1 ? (
              <DolphinShapeBoard
                cards={cards}
                durationMs={currentConfig.revealTime}
              />
            ) : (
              <div
                className="mx-auto grid w-full grid-cols-4 gap-2 sm:gap-4"
              >
                {cards.map((card, index) => (
                  <MemoryCard
                    key={`${card.id}-${index}`}
                    card={card}
                    index={index}
                    flipped={false}
                  />
                ))}
              </div>
            )}

          </motion.div>

        )}

        {/* =================================================
            QUESTION
        ================================================= */}

        {phase === "question" && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="flex max-h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border-4 border-white bg-gradient-to-b from-white via-sky-50/95 to-cyan-100/90 p-2 text-center shadow-2xl ring-4 ring-sky-200/60 sm:h-full sm:rounded-[2rem] sm:p-5"
          >

            <div className="mb-1 flex items-center justify-between sm:mb-4">

              <div className="rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700">
                වටය {gameNumber} / {totalGames}
              </div>

              <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
                උත්සාහය {attempt} / {currentConfig.maxAttempts}
              </div>

            </div>

            <div className="rounded-2xl border-2 border-purple-100 bg-gradient-to-r from-blue-50 via-white to-purple-50 px-3 py-2 text-center shadow-sm sm:rounded-3xl sm:px-5 sm:py-3">
              <p className="text-base font-black text-purple-700 sm:text-2xl">
                {questionIndex + 1} වන කාඩ්පතේ තිබුණේ මොන හැඩයද?
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-600 sm:mt-1 sm:text-base">
                මතක් කරගෙන හැඩය අඳින්න යමු. පහළ බොත්තම ඔබන්න.
              </p>
            </div>

            {/* The dolphin shows only the card number being asked about. */}

            <DolphinQuestionBoard cardNumber={questionIndex + 1} />

            <div className="relative z-20 mt-1 grid w-full shrink-0 grid-cols-[0.42fr_1fr] gap-2 sm:mt-2 sm:gap-3">
              <motion.button
                type="button"
                onClick={replayShapeSequence}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="min-h-10 rounded-xl border-2 border-white bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-1.5 text-xs font-black text-white shadow-lg shadow-orange-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 sm:min-h-12 sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 sm:text-base"
                aria-label="හැඩ කාඩ්පත් නැවත බලන්න"
              >
                <span className="leading-tight">↻ නැවත බලමු</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={startAnswer}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="min-h-10 rounded-xl border-2 border-white bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-3 py-1.5 text-sm font-black text-white shadow-lg shadow-blue-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 sm:min-h-12 sm:rounded-2xl sm:border-4 sm:px-6 sm:py-2 sm:text-base"
              >
                <span className="block">✏️ හැඩය අඳිමු</span>
              </motion.button>
            </div>

          </motion.div>

        )}

        {/* =================================================
            PREDICTION RESULT
        ================================================= */}

        {phase === "prediction-result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative mx-auto flex h-full min-h-0 w-full max-w-5xl items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-100 via-cyan-200 to-blue-500 p-0 shadow-2xl sm:p-6"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {[12, 28, 73, 88].map((left, index) => (
                <motion.span
                  key={left}
                  className="absolute bottom-[-30px] rounded-full border-2 border-white/70 bg-white/20"
                  style={{ left: `${left}%`, width: 16 + index * 4, height: 16 + index * 4 }}
                  animate={{ y: [0, -650], opacity: [0, 0.9, 0] }}
                  transition={{ duration: 6 + index, delay: index * 0.6, repeat: Infinity, ease: "linear" }}
                />
              ))}
            </div>

            <motion.div
              className="relative z-10 w-[108%] max-w-[820px] shrink-0 sm:w-full"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={shapeDolphinDisplayBoard}
                alt="ඩොල්ෆින් යාළුවා ප්‍රතිඵල පුවරුව අල්ලාගෙන සිටී"
                className="block h-auto w-full drop-shadow-2xl"
              />

              <div className="absolute flex flex-col items-center justify-center px-3 text-center"
                style={{ left: "31%", right: "7%", top: "31%", bottom: "13%" }}>
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 240, delay: 0.15 }}
                  className={`mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl shadow-lg sm:mb-2 sm:h-16 sm:w-16 sm:text-3xl ${
                    analysis.matched
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {analysis.matched ? "✓" : "💪"}
                </motion.div>

                <p className={`text-base font-black leading-tight sm:text-3xl ${
                  analysis.matched ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {analysis.matched ? "හරිම හොඳයි!" : "හොඳ උත්සාහයක්!"}
                </p>

                {analysis.matched && (
                  <>
                    <p className="mt-0.5 text-[10px] font-bold text-slate-500 sm:mt-2 sm:text-base">
                      ඔයා නිවැරදිව ඇන්දේ
                    </p>

                    <p className="mt-0.5 text-xl font-black leading-tight text-violet-700 sm:mt-1 sm:text-5xl">
                      {PREDICTION_LABELS[analysis.predicted] || "හැඩයක්"}
                    </p>
                  </>
                )}

                <p className="mt-1 max-w-full text-[10px] font-bold leading-tight text-sky-700 sm:mt-3 sm:text-lg">
                  {analysis.matched
                    ? "ඔයා හැඩය ලස්සනට පෙන්වලා තියෙනවා!"
                    : "කමක් නෑ! හැඩය මතක් කරගෙන ආයෙත් අඳිමු."}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* =================================================
            FEEDBACK POPUP
        ================================================= */}

        {phase === "feedback" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-8 text-center shadow-2xl"
          >

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-6xl shadow-xl">
              {attempt === 1
                ? "💪"
                : "💡"}
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-800">

              {attempt === 1
                ? "හොඳ උත්සාහයක්!"
                : "පොඩි ඉඟියක්!"}

            </h2>

            <p className="mx-auto mt-4 max-w-lg text-lg font-bold leading-relaxed text-slate-600">
              {message}
            </p>

            <div className="mt-6 rounded-3xl bg-sky-50 p-4">

              <p className="text-sm font-black text-sky-600">
                {attempt === 1
                  ? "තව අවස්ථා 2ක් තියෙනවා"
                  : "තව අවස්ථාවක් තියෙනවා"}
              </p>

            </div>

            <div className="mt-6">

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-500"
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width:
                      attempt === 1
                        ? "66%"
                        : "100%",
                  }}
                  transition={{
                    duration: 2,
                  }}
                />

              </div>

            </div>

          </motion.div>

        )}

        {/* =================================================
            ANSWER
        ================================================= */}

        {phase === "answer" && (

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="max-h-full overflow-hidden rounded-[2rem] border-4 border-white bg-white/95 p-3 shadow-2xl sm:p-4"
          >

            {/* GAME / ATTEMPT */}

            <div className="mb-1.5 flex items-center justify-between">

              <div className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-purple-700 sm:text-sm">
                වටය {gameNumber} / {totalGames}
              </div>

              <div className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black text-orange-700 sm:text-sm">
                උත්සාහය {attempt} / {currentConfig.maxAttempts}
              </div>

            </div>

            {/* QUESTION */}

            <div className="mb-2 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1.5 text-center">

              <p className="text-[10px] font-bold leading-tight text-slate-500 sm:text-xs">
                ඔයාට අහන්නේ...
              </p>

              <p className="mt-0.5 text-base font-black leading-tight text-purple-700 sm:text-lg">
                {questionIndex + 1} වන කාඩ්පතේ තිබුණේ මොන හැඩයද?
              </p>

            </div>

            {/* CANVAS */}

            <div
              ref={canvasWrapperRef}
              className="mx-2 overflow-hidden rounded-[2rem] border-4 border-cyan-300 bg-slate-950 p-1.5 shadow-inner shadow-cyan-900/50 sm:mx-0"
            >

              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#071a33]">

                <canvas
                  ref={canvasRef}
                  className="block w-full touch-none"
                  style={{
                    touchAction:
                      "none",
                    cursor:
                      "crosshair",
                  }}
                  onPointerDown={
                    handlePointerDown
                  }
                  onPointerMove={
                    handlePointerMove
                  }
                  onPointerUp={
                    handlePointerUp
                  }
                  onPointerLeave={
                    handlePointerUp
                  }
                />

                {/* Keep the drawing guide outside the canvas bitmap. Otherwise
                    the ML export mistakes this blue frame for a user stroke. */}
                <div
                  className="pointer-events-none absolute inset-[15px] rounded-xl border-2 border-dashed border-sky-400/80"
                  aria-hidden="true"
                />

                {!hasDrawing &&
                  !selectedPreview && (

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">

                      <div className="rounded-2xl border border-cyan-300/40 bg-slate-950/70 px-5 py-3 shadow-xl backdrop-blur-sm">

                        <div className="text-4xl">
                          ✏️
                        </div>

                        <p className="mt-1 font-black text-white">
                          මෙතන හැඩය අඳින්න
                        </p>

                        <p className="text-xs font-semibold text-cyan-100/75 sm:text-sm">
                          නැත්නම් පින්තූරයක් තෝරන්න
                        </p>

                      </div>

                    </div>

                  )}

                {selectedPreview && (

                  <div className="absolute inset-0 flex items-center justify-center bg-[#071a33]">

                    <img
                      src={
                        selectedPreview
                      }
                      alt="Selected"
                      className="max-h-full max-w-full object-contain"
                    />

                  </div>

                )}

              </div>

            </div>

            {/* INPUT BUTTONS */}

            <div className="mt-1.5 grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() => {
                  clearPreview();

                  clearDrawing();
                }}
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-100 px-2 py-1.5 font-black text-slate-600 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-200 sm:min-h-12"
              >
                <span className="text-lg" aria-hidden="true">🧹</span>
                <span className="text-[10px] sm:text-xs">මකන්න</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  cameraInputRef.current?.click()
                }
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-sky-300 bg-gradient-to-br from-sky-400 to-cyan-500 px-2 py-1.5 font-black text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-cyan-600 sm:min-h-12"
              >
                <span className="text-lg" aria-hidden="true">📸</span>
                <span className="text-[10px] sm:text-xs">ෆොටෝ එකක් ගන්න</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-300 to-orange-400 px-2 py-1.5 font-black text-amber-950 shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 hover:from-amber-400 hover:to-orange-500 sm:min-h-12"
              >
                <span className="text-lg" aria-hidden="true">🖼️</span>
                <span className="text-[10px] sm:text-xs">පින්තූරයක් තෝරන්න</span>
              </button>

            </div>

            {/* HIDDEN INPUTS */}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) =>
                handleFilePick(
                  event,
                  "camera"
                )
              }
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                handleFilePick(
                  event,
                  "upload"
                )
              }
            />

            {/* CHECK */}

            <button
              type="button"
              onClick={handleCheck}
              disabled={analysis.status !== "idle"}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-base font-black text-white shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
            >
              {analysis.status ===
              "loading"
                ? "🔍 බලනවා..."
                : "හැඩය පරීක්ෂා කරමු"}
            </button>

            {/* MESSAGE */}

            {message && (

              <AnimatePresence mode="wait">

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={`mt-4 rounded-2xl p-4 text-center text-lg font-black ${
                    analysis.matched
                      ? "bg-emerald-100 text-emerald-700"
                      : analysis.status ===
                          "done"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {message}
                </motion.div>

              </AnimatePresence>

            )}

          </motion.div>

        )}

        {/* =================================================
            GAME OVER
        ================================================= */}

        {phase === "gameover" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="max-h-full overflow-hidden rounded-[2rem] border-4 border-white bg-white/95 p-3 text-center shadow-2xl sm:p-6"
          >

            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 text-6xl shadow-xl">
              💙
            </div>

            <h2 className="mt-5 text-3xl font-black text-slate-800">
              හොඳ උත්සාහයක්! 🌟
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-lg font-bold leading-relaxed text-slate-500">
              මේ වතාවේ ක්‍රීඩාව සම්පූර්ණ කරන්න බැරි වුණා.
              කමක් නෑ! ආයෙත් මුල ඉඳන් උත්සාහ කරමු.
              ඔයාට මේක කරන්න පුළුවන්! 💪
            </p>

            <div className="mt-6 rounded-3xl bg-gradient-to-r from-sky-50 to-purple-50 p-5">

              <p className="text-sm font-bold text-slate-400">
                නැවත පුහුණු විය යුතු වට
              </p>

              <p className="mt-2 text-2xl font-black text-purple-600">
                {failedGames.length > 0
                  ? failedGames.map((game) => `වටය ${game}`).join(" • ")
                  : "සම්පූර්ණ ප්‍රතිඵලය නැවත උත්සාහ කරමු"}
              </p>

              <p className="mt-1 font-bold text-slate-500">
                සාර්ථක වට {completedGames.length} / {totalGames}
              </p>

            </div>

            <button
              type="button"
              onClick={startGame}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 text-xl font-black text-white shadow-xl transition hover:scale-[1.02]"
            >
              නැවත උත්සාහ කරමු
            </button>

          </motion.div>

        )}

        {/* =================================================
            LEVEL RESULT
        ================================================= */}

        {phase === "result" && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-[2rem] border-4 border-white bg-white/95 p-7 text-center shadow-2xl"
          >

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-3xl shadow-xl sm:h-24 sm:w-24 sm:text-5xl">
              🎉
            </div>

            <h2 className="mt-2 text-xl font-black text-slate-800 sm:mt-4 sm:text-3xl">
              මට්ටම {safeLevel} ජය ගත්තා!
            </h2>

            <p className="mt-1 text-sm font-bold text-slate-500 sm:text-lg">
              ඔයා වට {totalGames}ම සාර්ථකව සම්පූර්ණ කළා!
            </p>

            {/* RESULT */}

            <div className="mt-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 p-2 sm:mt-5 sm:rounded-3xl sm:p-4">

              <p className="text-sm font-bold text-slate-400">
                ඔයාගේ ප්‍රතිඵලය
              </p>

              <p className="text-3xl font-black text-emerald-600 sm:mt-1 sm:text-5xl">
                {finalResult.accuracy}%
              </p>

              <p className="mt-1 font-bold text-slate-500">
                හරිම හොඳ මතකයක්!
              </p>

            </div>

            {/* GAME RESULTS */}

            <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">

              {Array.from({ length: totalGames }, (_, index) => index + 1).map(
                (game) => (

                  <div
                    key={game}
                    className="rounded-xl bg-slate-50 p-2 sm:rounded-2xl sm:p-3"
                  >

                    <p className="text-xs font-black text-slate-400">
                      වටය {game}
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-600">
                      {gameAttempts[
                        game
                      ] || 1}
                      x
                    </p>

                    <p className="text-xs font-bold text-slate-400">
                      උත්සාහ
                    </p>

                  </div>

                )
              )}

            </div>

            <div className="mt-4 hidden rounded-2xl bg-blue-50 p-4 sm:block">

              <p className="text-sm font-black text-blue-700">
                ඔයාට ගැළපෙන පුහුණුව
              </p>

              <p className="mt-1 text-sm font-semibold text-blue-600">
                ඔයාගේ ප්‍රගතිය සුරැකලා ඊළඟ පුහුණුව ඔයාට ගැළපෙන ලෙස සකස් කරනවා.
              </p>

            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:gap-3">

              <button
                type="button"
                onClick={startGame}
                className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3 py-2 text-sm font-black text-white shadow-lg sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
              >
                නැවත ක්‍රීඩා කරමු
              </button>

              {finalResult.correct && safeLevel === 1 && (

                <button
                  type="button"
                  onClick={() =>
                    onComplete &&
                    onComplete({
                      passed: true,

                      nextLevel: 2,

                      accuracy:
                        finalResult.accuracy,

                      completedGames:
                        finalResult.completedGames,

                      totalAttempts:
                        finalResult.totalAttempts,

                      mistakes:
                        finalResult.mistakes,
                    })
                  }
                  className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-sm font-black text-white shadow-lg sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
                >
                  දෙවන මට්ටමට යමු
                </button>

              )}

              {finalResult.correct && safeLevel === 2 && (
                <button
                  type="button"
                  onClick={() => onComplete && onComplete({ passed:true, accuracy:finalResult.accuracy, completedGames:finalResult.completedGames, totalAttempts:finalResult.totalAttempts, mistakes:finalResult.mistakes })}
                  className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-sm font-black text-white shadow-lg sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
                >
                  මට්ටම් දෙකම ජය ගත්තා!
                </button>
              )}

            </div>

          </motion.div>

        )}

      </div>
    </div>
  );
};

export default MemoryShapeRecallGame;
