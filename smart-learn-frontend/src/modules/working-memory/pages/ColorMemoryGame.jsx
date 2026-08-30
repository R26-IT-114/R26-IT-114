/**
 * ColorMemoryGame.jsx
 * Flash-and-Match Working Memory Game  —  ages 6–8 (Working Memory Disorder support)
 *
 *  Level 1 — Color matching   (flash 2.5 s  |  3 choices  |  8 rounds)
 *  Level 2 — Number matching  (flash 2.0 s  |  4 choices  | 10 rounds)
 *  Level 3 — Letter matching  (flash 1.8 s  |  4 choices  | 10 rounds)
 *
 *  Level 1 always unlocked. Complete each level to unlock the next.
 *  Sea / Ocean animated background  |  SVG-only icons  |  Sinhala UI
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import useResponsive from '../hooks/useResponsive';
import { useProgress } from "../context/ProgressContext";
import { adaptColorMemoryConfig } from "../utils/adaptiveDifficulty";
import { AnimatedSeaBg as SequenceRecallSeaBg } from "./SequenceRecallGame";
import { awardStar } from "../components/StarRewardSystem";
import colorInstrAudio1 from "../assets/color-memory-preview-instruction-enhanced-v1.mp3";
import colorInstrAudio2 from "../assets/number-memory-preview-instruction-enhanced-v1.mp3";
import colorInstrAudio3 from "../assets/letter-memory-preview-instruction-enhanced-v1.mp3";
import colorNameRed from "../assets/color-name-red-enhanced-v1.mp3";
import colorNameOrange from "../assets/color-name-orange-enhanced-v1.mp3";
import colorNamePurple from "../assets/color-name-purple-enhanced-v1.mp3";
import colorNamePink from "../assets/color-name-pink-enhanced-v1.mp3";
import colorNameBlue from "../assets/color-name-blue-enhanced-v1.mp3";
import colorNameYellow from "../assets/color-name-yellow-enhanced-v1.mp3";
import colorNameGreen from "../assets/color-name-green-enhanced-v1.mp3";
import numberName01 from "../assets/number-name-01-enhanced-v1.mp3";
import numberName02 from "../assets/number-name-02-enhanced-v1.mp3";
import numberName03 from "../assets/number-name-03-enhanced-v1.mp3";
import numberName04 from "../assets/number-name-04-enhanced-v1.mp3";
import numberName05 from "../assets/number-name-05-enhanced-v1.mp3";
import numberName06 from "../assets/number-name-06-enhanced-v1.mp3";
import numberName07 from "../assets/number-name-07-enhanced-v1.mp3";
import numberName08 from "../assets/number-name-08-enhanced-v1.mp3";
import numberName09 from "../assets/number-name-09-enhanced-v1.mp3";
import numberName10 from "../assets/number-name-10-enhanced-v1.mp3";
import letterNameA from "../assets/letter-name-a-enhanced-v1.mp3";
import letterNameAa from "../assets/letter-name-aa-enhanced-v1.mp3";
import letterNameWa from "../assets/letter-name-wa-enhanced-v1.mp3";
import letterNameGa from "../assets/letter-name-ga-enhanced-v1.mp3";
import letterNameU from "../assets/letter-name-u-enhanced-v1.mp3";
import letterNameE from "../assets/letter-name-e-enhanced-v1.mp3";
import letterNameDa from "../assets/letter-name-da-enhanced-v1.mp3";
import letterNameRa from "../assets/letter-name-ra-enhanced-v1.mp3";
import letterNameTha from "../assets/letter-name-tha-enhanced-v1.mp3";
import letterNameI from "../assets/letter-name-i-enhanced-v1.mp3";
import letterNameMa from "../assets/letter-name-ma-enhanced-v1.mp3";
import letterNameSa from "../assets/letter-name-sa-enhanced-v1.mp3";
import letterNameKa from "../assets/letter-name-ka-enhanced-v1.mp3";
import letterNamePa from "../assets/letter-name-pa-enhanced-v1.mp3";
import letterNameNa from "../assets/letter-name-na-enhanced-v1.mp3";
import colorOctopusLevelBoard from "../assets/color-octopus-level-board-generated.png";
import colorMemoryCrabHolder from "../assets/color-memory-crab-holder-v1.png";
import animatedCrabMascot from "../assets/card-mascot-crab-v1.png";
import numberMemoryJellyfishHolder from "../assets/number-memory-jellyfish-holder-v1.png";
import letterMemoryPrawnHolder from "../assets/letter-memory-prawn-holder-v1.png";

const COLOR_INSTR_AUDIOS = { 1: colorInstrAudio1, 2: colorInstrAudio2, 3: colorInstrAudio3 };

const COLOR_NAME_AUDIOS = {
  red: colorNameRed,
  orange: colorNameOrange,
  purple: colorNamePurple,
  pink: colorNamePink,
  blue: colorNameBlue,
  yellow: colorNameYellow,
  green: colorNameGreen,
};

const NUMBER_NAME_AUDIOS = {
  n1: numberName01,
  n2: numberName02,
  n3: numberName03,
  n4: numberName04,
  n5: numberName05,
  n6: numberName06,
  n7: numberName07,
  n8: numberName08,
  n9: numberName09,
  n10: numberName10,
};

const LETTER_NAME_AUDIOS = {
  අ: letterNameA,
  ආ: letterNameAa,
  ව: letterNameWa,
  ග: letterNameGa,
  උ: letterNameU,
  එ: letterNameE,
  ද: letterNameDa,
  ර: letterNameRa,
  ත: letterNameTha,
  ඉ: letterNameI,
  ම: letterNameMa,
  ස: letterNameSa,
  ක: letterNameKa,
  ප: letterNamePa,
  න: letterNameNa,
};

const GAME_ID = "color-memory";

// ─────────────────────────────────────────────
//  SOUND HELPERS
// ─────────────────────────────────────────────
const beep = (type = "correct") => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === "correct" ? "sine" : "triangle";
    osc.frequency.value = type === "correct" ? 880 : 260;
    gain.gain.value = 0.001;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    setTimeout(() => { osc.stop(); ctx.close(); }, 320);
  } catch { /* ignore */ }
};

// ─────────────────────────────────────────────
//  ITEM POOLS
// ─────────────────────────────────────────────
const COLORS_POOL = [
  { id: "red",    label: "රතු",      hex: "#EF4444" },
  { id: "blue",   label: "නිල්",     hex: "#3B82F6" },
  { id: "green",  label: "කොළ",      hex: "#22C55E" },
  { id: "yellow", label: "කහ",       hex: "#EAB308" },
  { id: "purple", label: "දම්",      hex: "#A855F7" },
  { id: "orange", label: "තැඹිලි",   hex: "#F97316" },
  { id: "pink",   label: "රෝස",      hex: "#EC4899" },
];

const NUMBERS_POOL = Array.from({ length: 10 }, (_, i) => ({
  id: `n${i + 1}`, label: String(i + 1),
}));

const LETTERS_POOL = ["අ", "ආ", "ඉ", "උ", "එ", "ක", "ග", "ත", "ද", "න", "ප", "ම", "ව", "ස", "ර"].map(l => ({
  id: l, label: l,
}));

// ─────────────────────────────────────────────
//  LEVEL CONFIG
// ─────────────────────────────────────────────
const LEVEL_CONFIG = {
  1: {
    type: "color",   subTitle: "වර්ණ මතකය",
    pool: COLORS_POOL,  memorizeMs: 6000, choices: 3, rounds: 5,  passScore: 4,
    accentColor: "#EC4899",
  },
  2: {
    type: "number",  subTitle: "අංක මතකය",
    instruction: "ඔය අංකය ක්ෂණිකව දිස්වේ — මතකෙ තියාගෙන ගැලපෙන එක ටිකෙ කරන්න!",
    pool: NUMBERS_POOL, memorizeMs: 6500, choices: 4, rounds: 4,  passScore: 3,
    accentColor: "#0284C7",
  },
  3: {
    type: "letter",  subTitle: "සිංහල අකුරු මතකය",
    instruction: " සිංහල අකුර ක්‍ෂණිකව දිස්වේ — මතකේ තියාගේන් ගැලපේන එක ටිකේ කරන්න!",
    pool: LETTERS_POOL, memorizeMs: 6000, choices: 4, rounds: 5,  passScore: 4,
    accentColor: "#7C3AED",
  },
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
//  SVG ICONS
// ─────────────────────────────────────────────
const CheckIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CrossIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const StarIcon = ({ size = 24, filled = false }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const TrophyIcon = ({ size = 56, color = "#F59E0B" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="11" />
    <path d="M7 4H4.5A2.5 2.5 0 0 0 2 6.5v0A2.5 2.5 0 0 0 4.5 9H7" />
    <path d="M17 4h2.5A2.5 2.5 0 0 1 22 6.5v0A2.5 2.5 0 0 1 19.5 9H17" />
    <rect x="7" y="2" width="10" height="11" rx="2" />
  </svg>
);
const SmileIcon = ({ size = 56, color = "#F97316" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3.5" />
  </svg>
);
const UnlockIcon = ({ size = 18, color = "#2563EB" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);
const NextIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const RetryIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-5" />
  </svg>
);
const HomeIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ─────────────────────────────────────────────
//  SEA BACKGROUND COMPONENTS
// ─────────────────────────────────────────────
const FishSVG = ({ size = 52, color = "#0EA5E9", flip = false }) => (
  <svg viewBox="0 0 80 48" width={size} height={size * 0.6}
    style={{ transform: flip ? "scaleX(-1)" : "none" }} aria-hidden="true">
    <ellipse cx="46" cy="24" rx="26" ry="16" fill={color} />
    <polygon points="20,24 4,8 4,40" fill={color} opacity="0.85" />
    <circle cx="62" cy="17" r="5" fill="white" />
    <circle cx="63" cy="17" r="2.5" fill="#0C4A6E" />
  </svg>
);

const JellyfishSVG = ({ size = 46, color = "#C084FC" }) => {
  const tx = [8, 16, 24, 32, 40, 48];
  return (
    <svg viewBox="0 0 60 90" width={size} height={size * 1.5} aria-hidden="true" overflow="visible">
      <ellipse cx="30" cy="28" rx="26" ry="10" fill={color} opacity="0.25" />
      <path d="M4 30 Q4 2 30 2 Q56 2 56 30 Z" fill={color} opacity="0.80" />
      <path d="M14 25 Q18 8 30 6 Q42 8 46 25" fill="white" opacity="0.18" />
      {tx.map((x, i) => (
        <motion.path key={i}
          d={`M${x} 30 Q${x + (i % 2 === 0 ? -7 : 7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? 6 : -6)} 82 ${x} 90`}
          stroke={color} strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round"
          animate={{ d: [
            `M${x} 30 Q${x + (i % 2 === 0 ? -7 : 7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? 6 : -6)} 82 ${x} 90`,
            `M${x} 30 Q${x + (i % 2 === 0 ? 7 : -7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? -6 : 6)} 82 ${x} 90`,
            `M${x} 30 Q${x + (i % 2 === 0 ? -7 : 7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? 6 : -6)} 82 ${x} 90`,
          ]}}
          transition={{ duration: 1.2 + i * 0.15, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
};

const SeaweedSVG = ({ size = 56, color = "#34D399" }) => (
  <svg viewBox="0 0 30 80" width={size * 0.4} height={size} aria-hidden="true">
    <path d="M15 80 Q8 60 15 45 Q22 30 15 15 Q10 5 15 0" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M15 60 Q5 55 8 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M15 35 Q25 30 22 20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);
const StarfishSVG = ({ size = 36, color = "#FB923C" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    {[0, 72, 144, 216, 288].map((angle, i) => {
      const r = (angle * Math.PI) / 180;
      return <line key={i} x1="40" y1="40" x2={40 + 36 * Math.cos(r)} y2={40 + 36 * Math.sin(r)} stroke={color} strokeWidth="9" strokeLinecap="round" />;
    })}
    <circle cx="40" cy="40" r="10" fill={color} />
    <circle cx="40" cy="40" r="5" fill="white" opacity="0.4" />
  </svg>
);
const ShellSVG = ({ size = 30, color = "#F9A8D4" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    <path d="M40 40 m0,-30 a30,30 0 1,1 0,60 a20,20 0 1,0 0,-40 a10,10 0 1,1 0,20" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9" />
    <circle cx="40" cy="40" r="5" fill={color} opacity="0.9" />
    <circle cx="40" cy="40" r="2" fill="white" opacity="0.6" />
  </svg>
);
const BubbleSVG = ({ size = 16 }) => (
  <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
    <circle cx="15" cy="15" r="13" fill="#93C5FD" opacity="0.35" />
    <circle cx="15" cy="15" r="13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <circle cx="9" cy="9" r="4" fill="white" opacity="0.4" />
  </svg>
);
const WaveStrip = ({ y, opacity, color, duration }) => (
  <motion.div className="absolute w-full pointer-events-none" style={{ bottom: `${y}%`, opacity, height: 28 }}
    animate={{ x: [0, -60, 0] }} transition={{ duration, repeat: Infinity, ease: "linear" }}>
    <svg viewBox="0 0 400 28" width="400%" height="28" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 14 Q50 0 100 14 Q150 28 200 14 Q250 0 300 14 Q350 28 400 14 L400 28 L0 28 Z" fill={color} />
    </svg>
  </motion.div>
);

const SEA_CREATURES = [
  { type: "fish",      x: -10, y: 25, size: 62, color: "#0EA5E9", delay: 0,   dur: 13, flip: false, opacity: 0.70, driftX: "115%",  driftY: ["0%", "4%",  "-4%", "0%"] },
  { type: "fish",      x: -10, y: 55, size: 46, color: "#FB923C", delay: 4,   dur: 16, flip: false, opacity: 0.65, driftX: "115%",  driftY: ["0%", "-5%", "5%",  "0%"] },
  { type: "fish",      x: 110, y: 18, size: 54, color: "#A78BFA", delay: 7,   dur: 14, flip: true,  opacity: 0.65, driftX: "-115%", driftY: ["0%", "3%",  "-3%", "0%"] },
  { type: "fish",      x: 110, y: 65, size: 40, color: "#34D399", delay: 2,   dur: 18, flip: true,  opacity: 0.60, driftX: "-115%", driftY: ["0%", "-4%", "4%",  "0%"] },
  { type: "fish",      x: -10, y: 40, size: 36, color: "#F472B6", delay: 10,  dur: 20, flip: false, opacity: 0.55, driftX: "115%",  driftY: ["0%", "6%",  "-6%", "0%"] },
  { type: "jellyfish", x: 8,   y: 50, size: 50, color: "#C084FC", delay: 0,   dur: 8,  opacity: 0.65 },
  { type: "jellyfish", x: 76,  y: 44, size: 40, color: "#F9A8D4", delay: 3.5, dur: 10, opacity: 0.58 },
  { type: "jellyfish", x: 44,  y: 58, size: 34, color: "#818CF8", delay: 6,   dur: 9,  opacity: 0.52 },
  { type: "seaweed",   x: 3,   y: 62, size: 72, color: "#34D399", delay: 0,   dur: 3.0, opacity: 0.70 },
  { type: "seaweed",   x: 18,  y: 66, size: 56, color: "#4ADE80", delay: 0.8, dur: 3.8, opacity: 0.60 },
  { type: "seaweed",   x: 64,  y: 64, size: 62, color: "#34D399", delay: 1.5, dur: 3.2, opacity: 0.65 },
  { type: "seaweed",   x: 88,  y: 67, size: 52, color: "#4ADE80", delay: 0.3, dur: 4.0, opacity: 0.60 },
  { type: "starfish",  x: 34,  y: 80, size: 38, color: "#FB923C", delay: 0,   dur: 4,  opacity: 0.70 },
  { type: "starfish",  x: 58,  y: 83, size: 30, color: "#F87171", delay: 1.5, dur: 5,  opacity: 0.65 },
  { type: "shell",     x: 46,  y: 83, size: 32, color: "#F9A8D4", delay: 0,   dur: 0.4, opacity: 0.75 },
  { type: "shell",     x: 78,  y: 80, size: 26, color: "#FDE68A", delay: 0.2, dur: 0.5, opacity: 0.70 },
  { type: "shell",     x: 26,  y: 84, size: 24, color: "#86EFAC", delay: 0.1, dur: 0.45, opacity: 0.65 },
];
const BUBBLES = [
  { x: 10, size: 16, delay: 0,   dur: 7   },
  { x: 28, size: 12, delay: 1.5, dur: 9   },
  { x: 50, size: 18, delay: 0.5, dur: 8   },
  { x: 66, size: 14, delay: 2.5, dur: 10  },
  { x: 84, size: 11, delay: 1,   dur: 7.5 },
  { x: 38, size: 10, delay: 3.5, dur: 11  },
];

const SeaCreature = ({ item }) => {
  if (item.type === "fish") return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
      animate={{ x: item.driftX, y: item.driftY }}
      transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "linear", times: [0, 0.33, 0.66, 1] }}>
      <motion.div animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}>
        <FishSVG size={item.size} color={item.color} flip={item.flip} />
      </motion.div>
    </motion.div>
  );
  if (item.type === "jellyfish") return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
      animate={{ y: ["0%", "-22%", "0%"], x: ["0%", "4%", "-4%", "0%"] }}
      transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}>
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: item.dur * 0.5, repeat: Infinity, ease: "easeInOut" }}>
        <JellyfishSVG size={item.size} color={item.color} />
      </motion.div>
    </motion.div>
  );
  if (item.type === "seaweed") return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity, transformOrigin: "50% 100%" }}
      animate={{ rotate: [-14, 14, -14] }}
      transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}>
      <SeaweedSVG size={item.size} color={item.color} />
    </motion.div>
  );
  if (item.type === "starfish") return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
      animate={{ rotate: [0, 15, -15, 8, -8, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}>
      <StarfishSVG size={item.size} color={item.color} />
    </motion.div>
  );
  if (item.type === "shell") return (
    <motion.div className="absolute pointer-events-none"
      style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
      animate={{ rotate: [-12, 12, -12], x: [-3, 3, -3] }}
      transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}>
      <ShellSVG size={item.size} color={item.color} />
    </motion.div>
  );
  return null;
};

export const AnimatedSeaBg = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
    <div className="absolute inset-0"
      style={{ background: "linear-gradient(180deg,#bae6fd 0%,#7dd3fc 28%,#38bdf8 58%,#0ea5e9 100%)" }} />
    <motion.div className="absolute top-[-60px] left-1/2 -translate-x-1/2 rounded-full"
      style={{ width: 400, height: 400, background: "radial-gradient(circle,rgba(255,255,200,0.15) 0%,transparent 70%)" }}
      animate={{ scale: [1, 1.07, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
    {SEA_CREATURES.map((item, i) => <SeaCreature key={i} item={item} />)}
    {BUBBLES.map((b, i) => (
      <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${b.x}%`, bottom: "4%" }}
        animate={{ y: [0, -600], opacity: [0, 0.65, 0.45, 0] }}
        transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeOut" }}>
        <BubbleSVG size={b.size} />
      </motion.div>
    ))}
    <WaveStrip y={8} opacity={0.18} color="#0284C7" duration={8} />
    <WaveStrip y={4} opacity={0.12} color="#0369A1" duration={12} />
    <WaveStrip y={0} opacity={0.20} color="#075985" duration={6} />
    <div className="absolute bottom-0 left-0 right-0 h-10"
      style={{ background: "linear-gradient(0deg,#92400E33,transparent)" }} />
  </div>
);

// ─────────────────────────────────────────────
//  TIMER RING
// ─────────────────────────────────────────────
const TimerRing = ({ elapsed, total, color }) => {
  const r    = 42;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, 1 - elapsed / total);
  const secs = Math.ceil(Math.max(0, total - elapsed) / 1000);
  return (
    <svg width={100} height={100} viewBox="0 0 100 100" aria-label={`${secs} seconds left`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="9" />
      <circle cx="50" cy="50" r={r} fill="#F8FAFC" />
      <motion.circle cx="50" cy="50" r={r}
        fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" transform="rotate(-90 50 50)" />
      <text x="50" y="58" textAnchor="middle" fill="#1E293B" fontSize="28" fontWeight="900">{secs}</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
//  TARGET DISPLAY (memorize phase)
// ─────────────────────────────────────────────
const TargetDisplay = ({ item, type }) => {
  if (type === "color") {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="flex flex-col items-center gap-1">
        <motion.div
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-[82vw] max-h-[310px] w-[82vw] max-w-[310px] sm:h-[360px] sm:max-h-none sm:w-[360px] sm:max-w-none"
        >
          <motion.div
            animate={{
              boxShadow: [
                `0 8px 35px ${item.hex}66`,
                `0 14px 52px ${item.hex}aa`,
                `0 8px 35px ${item.hex}66`,
              ],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[16.5%] top-[10.5%] h-[59%] w-[67%] rounded-[12%]"
            style={{ background: item.hex }}
          />
          <img
            src={colorMemoryCrabHolder}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain drop-shadow-xl"
          />
        </motion.div>
        <p className="text-3xl font-extrabold text-slate-800 sm:text-5xl">{item.label}</p>
      </motion.div>
    );
  }
  const isNumber = type === "number";
  const holderImage = isNumber
    ? numberMemoryJellyfishHolder
    : letterMemoryPrawnHolder;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -8 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="relative h-[82vw] max-h-[310px] w-[82vw] max-w-[310px] sm:h-[360px] sm:max-h-none sm:w-[360px] sm:max-w-none"
    >
      <motion.div
        animate={{
          scale: [1, 1.035, 1],
          boxShadow: isNumber
            ? [
                "0 8px 30px rgba(14,165,233,.2)",
                "0 14px 46px rgba(14,165,233,.38)",
                "0 8px 30px rgba(14,165,233,.2)",
              ]
            : [
                "0 8px 30px rgba(124,58,237,.18)",
                "0 14px 46px rgba(236,72,153,.32)",
                "0 8px 30px rgba(124,58,237,.18)",
              ],
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute flex items-center justify-center rounded-[12%] bg-white font-black leading-none ${
          isNumber
            ? "left-[18%] top-[30%] h-[54%] w-[64%] text-[clamp(5rem,25vw,8.5rem)] text-sky-600"
            : "left-[28%] top-[17.5%] h-[59%] w-[60%] text-[clamp(4.75rem,24vw,8rem)] text-purple-600"
        }`}
      >
        {item.label}
      </motion.div>

      <img
        src={holderImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain drop-shadow-xl"
      />
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  OPTION BUTTON
// ─────────────────────────────────────────────
const OptionBtn = ({ item, type, onClick, disabled, state }) => {
  const isCorrect = state === "correct";
  const isWrong   = state === "wrong";

  if (type === "color") {
    return (
      <motion.button
        whileHover={!disabled ? { scale: 1.06, y: -5 } : {}}
        whileTap={!disabled ? { scale: 0.92 } : {}}
        onClick={() => !disabled && onClick(item)}
        disabled={disabled}
        className="relative flex min-h-28 items-center justify-center overflow-hidden rounded-3xl shadow-xl outline-none ring-offset-4 transition focus-visible:ring-4 focus-visible:ring-sky-400 sm:min-h-36"
        style={{
          width: "100%",
          background: item.hex,
          boxShadow: isCorrect ? `0 0 0 6px #22C55E, 0 8px 28px ${item.hex}88`
                   : isWrong   ? `0 0 0 6px #EF4444, 0 8px 28px ${item.hex}88`
                               : `0 6px 24px ${item.hex}55`,
          border: isCorrect ? "4px solid #22C55E" : isWrong ? "4px solid #EF4444" : "3px solid rgba(255,255,255,0.45)",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "box-shadow 0.18s, border 0.18s",
        }}
        aria-label={item.label}>
        {isCorrect && <div className="absolute inset-0 flex items-center justify-center bg-green-500/25 rounded-3xl"><CheckIcon size={56} /></div>}
        {isWrong   && <div className="absolute inset-0 flex items-center justify-center bg-red-500/25 rounded-3xl"><CrossIcon size={56} /></div>}
        {!isCorrect && !isWrong && (
          <span className="px-1 text-lg font-extrabold text-white drop-shadow-lg min-[380px]:text-xl sm:text-2xl">{item.label}</span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.06, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.92 } : {}}
      onClick={() => !disabled && onClick(item)}
      disabled={disabled}
        className="flex min-h-28 items-center justify-center rounded-3xl shadow-xl outline-none ring-offset-4 focus-visible:ring-4 focus-visible:ring-sky-400 sm:min-h-36"
      style={{
        width: "100%",
        background: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "rgba(255,255,255,0.93)",
        color: isCorrect || isWrong ? "white" : "#0284C7",
        fontSize: 82, fontWeight: 900, lineHeight: 1,
        boxShadow: isCorrect ? "0 0 0 6px #22C55E88, 0 8px 28px rgba(34,197,94,0.4)"
                 : isWrong   ? "0 0 0 6px #EF444488, 0 8px 28px rgba(239,68,68,0.4)"
                             : "0 6px 20px rgba(14,165,233,0.2)",
        border: isCorrect ? "4px solid #22C55E" : isWrong ? "4px solid #EF4444" : "2px solid rgba(14,165,233,0.25)",
        backdropFilter: "blur(8px)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.18s, box-shadow 0.18s",
      }}
      aria-label={item.label}>
      {isCorrect ? <CheckIcon size={56} /> : isWrong ? <CrossIcon size={56} /> : item.label}
    </motion.button>
  );
};

// ─────────────────────────────────────────────
//  LEVEL INTRO
// ─────────────────────────────────────────────
const LevelIntro = ({ level, config, onStart, onVoiceInstruction, voicePlaying }) => {
  const accentColors = { 1: "#EC4899", 2: "#0284C7", 3: "#7C3AED" };
  const bgColors     = { 1: "#FCE7F3", 2: "#E0F2FE", 3: "#EDE9FE" };
  const color        = accentColors[level];
  const preview      = config.pool.slice(0, 4);

  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
      className="grid w-full max-w-[1100px] grid-cols-1 gap-3 overflow-x-hidden rounded-[2rem] border-[3px] border-white/80 bg-white/95 p-3 shadow-2xl sm:gap-5 sm:p-5 sm:rounded-[2.5rem] lg:grid-cols-[minmax(300px,.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:p-8">
      <div className="flex min-h-[190px] items-center justify-center rounded-3xl sm:min-h-[250px] lg:min-h-[340px]" style={{ background:`linear-gradient(155deg,${bgColors[level]},#fff)` }}>
        <motion.div className="relative w-[min(180px,58vw)] sm:w-[240px] lg:w-[clamp(260px,32dvh,360px)]" animate={{ y:[0,-6,0], rotate:[-1,1,-1] }} transition={{ duration:3, repeat:Infinity }}>
          <img src={colorOctopusLevelBoard} alt={`බූවල්ලා මට්ටම ${level} පුවරුව අල්ලාගෙන සිටී`} className="block h-auto w-full" style={{ filter:"drop-shadow(0 14px 20px rgba(124,58,237,.22))" }}/>
          <div className="absolute flex flex-col items-center justify-center text-center" style={{ left:"15%", right:"15%", top:"43%", bottom:"19%" }}>
            <span className="text-[9px] font-black text-slate-500 sm:text-xs lg:text-sm">මතක අභියෝගය</span>
            <span className="text-4xl font-black leading-none sm:text-5xl lg:text-6xl" style={{ color }}>{level}</span>
            <span className="text-[9px] font-extrabold text-slate-700 sm:text-xs lg:text-sm">{config.subTitle}</span>
          </div>
        </motion.div>
      </div>
      <div className="color-memory-intro-copy flex min-w-0 flex-col justify-center gap-4 text-center sm:gap-5">
        <div>
          <h1 className="m-0 text-3xl font-black text-slate-800">මතක අභියෝගය</h1>
          <p className="mt-1 font-extrabold" style={{ color }}>{config.subTitle}</p>
          <button
            type="button"
            onClick={onVoiceInstruction}
            aria-label={voicePlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}
            className="mx-auto mt-3 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-sky-200 bg-sky-50 px-5 py-2.5 font-black text-sky-700 shadow-md transition hover:scale-[1.03] hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {voicePlaying ? "⏹" : "🔊"}
            </span>
            <span>{voicePlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}</span>
          </button>
        </div>
        <div className="color-memory-preview flex flex-wrap justify-center gap-3 sm:gap-4">
          {preview.map(item => <div key={item.id} className="grid h-12 w-12 place-items-center rounded-xl border-2 bg-white text-xl font-black shadow" style={{ background:config.type === "color" ? item.hex : "white", color:config.type === "color" ? "white" : color, borderColor:`${color}55` }}>{config.type === "color" ? "" : item.label}</div>)}
        </div>
        <div className="color-memory-steps grid grid-cols-1 gap-2 text-sm font-black text-slate-700 min-[380px]:grid-cols-3 sm:text-base"><div className="rounded-xl bg-sky-100 p-3">1. බලන්න</div><div className="rounded-xl bg-violet-100 p-3">2. මතක තියාගන්න</div><div className="rounded-xl bg-emerald-100 p-3">3. මතකයෙන් තෝරන්න</div></div>
        <motion.button type="button" whileHover={{ scale:1.03 }} whileTap={{ scale:.95 }} onClick={onStart} className="w-full rounded-full py-3.5 text-lg font-black text-white shadow-xl sm:py-4 sm:text-xl" style={{ background:`linear-gradient(90deg,${color},#7C3AED)` }}>ක්‍රීඩාව පටන් ගමු!</motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  RESULT SCREEN
// ─────────────────────────────────────────────
const ResultScreen = ({ level, correct, total, passScore, onNext, onRetry, onHome }) => {
  const { isMobile } = useResponsive();
  const passed = correct >= passScore;
  const pct    = Math.round((correct / total) * 100);
  const stars  = correct >= total ? 3 : correct >= passScore ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl p-4 text-center sm:gap-6 sm:p-8"
      style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(18px)" }}>

      <motion.div
        animate={passed ? { rotate: [0, -10, 10, -8, 8, 0] } : { scale: [1, 1.12, 1] }}
        transition={{ delay: 0.25, duration: 0.6 }}>
        {passed ? <TrophyIcon size={isMobile ? 80 : 100} color="#F59E0B" /> : <SmileIcon size={isMobile ? 80 : 100} color="#F97316" />}
      </motion.div>

      <div>
        <p className="mb-1 text-3xl font-extrabold sm:text-5xl" style={{ color: passed ? "#22C55E" : "#F97316" }}>
          {passed ? "ජය ගත්තා!" : "නැවත උත්සාහ කරන්න!"}
        </p>
        <p className="text-lg font-bold text-gray-600 sm:text-2xl">{correct} / {total} නිවැරදි ({pct}%)</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map(i => <StarIcon key={i} size={isMobile ? 48 : 56} filled={i <= stars} />)}
      </div>

      {passed && level < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
          style={{ background: "#EFF6FF", border: "2px solid #BFDBFE" }}>
          <UnlockIcon size={24} color="#2563EB" />
          <p className="text-lg font-bold text-blue-600">Level {level + 1} unlock වුණා!</p>
        </motion.div>
      )}

      {passed && level === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full rounded-2xl px-5 py-3 text-center"
          style={{ background: "#FEF9C3", border: "2px solid #FDE047" }}>
          <p className="text-lg font-bold text-yellow-700">සියලු levels ජය ගත්තා! ඔබ ශූරයේක්!</p>
        </motion.div>
      )}

      <div className="flex flex-col gap-3 w-full">
        {passed && level < 3 && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
            className="rounded-full py-5 font-extrabold text-xl text-white shadow-xl flex items-center justify-center gap-3"
            style={{ background: "linear-gradient(90deg,#22C55E,#16A34A)" }}>
            <NextIcon size={24} /> ඉලග Level
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRetry}
          className="rounded-full py-5 font-extrabold text-xl text-white shadow-xl flex items-center justify-center gap-3"
          style={{ background: "linear-gradient(90deg,#0EA5E9,#0284C7)" }}>
          <RetryIcon size={24} /> නැවත ක්‍රීඩා කරමු
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onHome}
          className="rounded-full py-5 font-extrabold text-xl text-white shadow-xl flex items-center justify-center gap-3"
          style={{ background: "linear-gradient(90deg,#8B5CF6,#7C3AED)" }}>
          <HomeIcon size={24} /> ගේදරට
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  MAIN GAME COMPONENT
// ─────────────────────────────────────────────
const ColorMemoryGame = ({ level = 1, onComplete }) => {
  const prefersReducedMotion = useReducedMotion();
  const { completeLevel, initializeGame, getAdaptiveProfile, recordAdaptiveResult } = useProgress();
  const baseCfg = LEVEL_CONFIG[Math.min(3, Math.max(1, Number(level)))];
  const cfg = adaptColorMemoryConfig(baseCfg, getAdaptiveProfile(GAME_ID));

  const [instrPlaying, setInstrPlaying] = useState(false);
  const instrAudioRef  = useRef(null);
  const handleVoiceInstruction = () => {
    if (!instrAudioRef.current) return;
    if (instrPlaying) {
      instrAudioRef.current.pause();
      instrAudioRef.current.currentTime = 0;
      setInstrPlaying(false);
    } else {
      instrAudioRef.current.play();
      setInstrPlaying(true);
    }
  };

  // phase: intro | memorize | recall | feedback | result
  const [phase,   setPhase]   = useState("intro");
  const [round,   setRound]   = useState(0);
  const [target,  setTarget]  = useState(null);
  const [options, setOptions] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [picked,  setPicked]  = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const correctRef = useRef(0);
  const mistakesRef = useRef(0);
  const timerRef   = useRef(null);
  const tickRef    = useRef(null);

  // Dashboard performance tracking
  const answerStartTimeRef = useRef(null);
  const responseTimesRef = useRef([]);

  const [hintVisible, setHintVisible] = useState(false);
  const itemNameAudioRef = useRef(null);

  useEffect(() => {
    const audio = itemNameAudioRef.current;
    const source = target
      ? cfg.type === "color"
        ? COLOR_NAME_AUDIOS[target.id]
        : cfg.type === "number"
          ? NUMBER_NAME_AUDIOS[target.id]
          : cfg.type === "letter"
            ? LETTER_NAME_AUDIOS[target.id]
            : null
      : null;

    if (!audio || phase !== "memorize" || !source) {
      return undefined;
    }

    audio.src = source;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Some browsers can block playback until the first user interaction.
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [cfg.type, phase, target]);

  useEffect(() => {
    initializeGame(GAME_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearTimers = () => {
    clearTimeout(timerRef.current);
    clearInterval(tickRef.current);
  };

  const startRound = useCallback(() => {
    const pool = cfg.pool;
    const tgt  = pool[Math.floor(Math.random() * pool.length)];
    const rest = shuffle(pool.filter(p => p.id !== tgt.id)).slice(0, cfg.choices - 1);
    const opts = shuffle([tgt, ...rest]);

    setTarget(tgt);
    setOptions(opts);
    setPicked(null);
    setElapsed(0);
    setPhase("memorize");

    const start = Date.now();
    tickRef.current = setInterval(() => setElapsed(Date.now() - start), 80);
    timerRef.current = setTimeout(() => {
      clearInterval(tickRef.current);

      // Start measuring answer time only when recall choices appear
      answerStartTimeRef.current = Date.now();

      setPhase("recall");
    }, cfg.memorizeMs);
  }, [cfg]);

  const handleStart = () => {
    if (instrAudioRef.current) {
      instrAudioRef.current.pause();
      instrAudioRef.current.currentTime = 0;
      setInstrPlaying(false);
    }

    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    mistakesRef.current = 0;

    responseTimesRef.current = [];
    answerStartTimeRef.current = null;

    setHintVisible(false);
    startRound();
  };

  const handleAnswer = useCallback((item) => {
    clearTimers();

    // Record the child's response time for this round
    if (answerStartTimeRef.current) {
      const responseMs = Date.now() - answerStartTimeRef.current;
      responseTimesRef.current.push(responseMs);
      answerStartTimeRef.current = null;
    }

    const isRight = item.id === target.id;
    setPicked(item.id);
    if (isRight) {
      awardStar();
      correctRef.current += 1;
      setCorrect(correctRef.current);
      setHintVisible(false);
      beep("correct");
    } else {
      mistakesRef.current += 1;
      if (mistakesRef.current >= 4) setHintVisible(true);
      beep("wrong");
    }
    setPhase("feedback");

    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= cfg.rounds) {
        setRound(nextRound);
        const passed = correctRef.current >= cfg.passScore;

        const accuracy = Math.round(
          (correctRef.current / cfg.rounds) * 100
        );

        const totalAttempts =
          correctRef.current + mistakesRef.current;

        const averageResponseMs =
          responseTimesRef.current.length > 0
            ? Math.round(
                responseTimesRef.current.reduce(
                  (sum, time) => sum + time,
                  0
                ) / responseTimesRef.current.length
              )
            : null;

        // Keep the existing detailed level stats, while adding
        // the exact field names required by adaptive history/dashboard.
        const stats = {
          level: Number(level),
          correct: correctRef.current,
          total: cfg.rounds,
          pct: accuracy,
          wrongAttempts: mistakesRef.current,
          mistakes: mistakesRef.current,
          totalAttempts,
          attempts: totalAttempts,
          accuracy,
          averageResponseMs,
        };

        if (passed) {
          completeLevel(GAME_ID, Number(level), stats);
          setTimeout(() => confetti({
            particleCount: 160, spread: 90, origin: { y: 0.55 },
            colors: ["#0EA5E9", "#A78BFA", "#FB923C", "#22C55E", "#F472B6"],
          }), 200);
        }

        // Reuse the complete, standardised game result for both adaptive
        // difficulty and the performance report.
        recordAdaptiveResult(GAME_ID, stats);

        if (onComplete) {
          onComplete({
            ...stats,
            passed,
            level: Number(level),
            nextLevel: passed && Number(level) < 3 ? Number(level) + 1 : null,
          });
        } else {
          setPhase("result");
        }
      } else {
        setRound(nextRound);
        startRound();
      }
    }, 1100);
  }, [
    target,
    round,
    cfg,
    level,
    onComplete,
    completeLevel,
    recordAdaptiveResult,
    startRound,
  ]);

  // Reset when level prop changes (e.g., navigated to next level)
  useEffect(() => {
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    mistakesRef.current = 0;
    responseTimesRef.current = [];
    answerStartTimeRef.current = null;
    setHintVisible(false);
    setPhase("intro");
    clearTimers();
  }, [level]);

  useEffect(() => () => clearTimers(), []);

  const color = cfg.accentColor;
  const roundsTotal = cfg.rounds;

  return (
    <div className="relative flex min-h-[calc(100dvh-64px)] w-full max-w-full flex-col items-center justify-start overflow-x-clip px-2 py-3 sm:px-4 sm:py-5 xl:justify-center" style={{ zIndex: 1 }}>
      <SequenceRecallSeaBg />

      <audio ref={instrAudioRef} src={COLOR_INSTR_AUDIOS[Number(level)] ?? colorInstrAudio1} onEnded={() => setInstrPlaying(false)} />
      <audio ref={itemNameAudioRef} preload="auto" />

      {phase !== "intro" && (
        <button
          type="button"
          onClick={handleVoiceInstruction}
          title="උපදෙස් අසන්න (Listen to instructions)"
          aria-label={instrPlaying ? "Stop instructions" : "Play instructions"}
          className="fixed right-3 top-20 z-[1000] flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full sm:right-4 sm:top-24 sm:h-16 sm:w-16 xl:right-6 xl:top-1/2 xl:h-[4.5rem] xl:w-[4.5rem] xl:-translate-y-1/2"
          style={{
            border: '3px solid #fff',
            background: instrPlaying ? 'linear-gradient(135deg,#EF4444,#F87171)' : `linear-gradient(135deg,${cfg.accentColor},${cfg.accentColor}cc)`,
            color: '#fff', cursor: 'pointer',
            boxShadow: instrPlaying ? '0 0 0 6px rgba(239,68,68,0.25), 0 8px 24px rgba(0,0,0,0.22)' : `0 4px 18px ${cfg.accentColor}66`,
            transition: 'background 0.25s, box-shadow 0.25s',
            animation: instrPlaying ? 'color-pulse-ring 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <span className="text-2xl leading-none xl:text-[2rem]">{instrPlaying ? '⏹' : '🔊'}</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.03em', lineHeight: 1.1, textAlign: 'center' }}>
            {instrPlaying ? 'නවත්වන්න' : 'උපදෙස්'}
          </span>
        </button>
      )}
      <style>{`
        @keyframes color-pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(239,68,68,0.45), 0 8px 24px rgba(0,0,0,0.22); }
          70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0),    0 8px 24px rgba(0,0,0,0.22); }
          100% { box-shadow: 0 0 0 0   rgba(239,68,68,0),    0 8px 24px rgba(0,0,0,0.22); }
        }
        .color-memory-intro-copy > div:first-child h1 {
          font-size: clamp(1.9rem, 4vw, 3rem);
          line-height: 1.1;
        }
        .color-memory-intro-copy > div:first-child p {
          margin-top: 0.5rem;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
        }
        .color-memory-intro-copy > div:nth-child(2) {
          padding: clamp(1rem, 2vw, 1.35rem);
          font-size: clamp(1rem, 2vw, 1.25rem);
        }
        .color-memory-preview > div {
          width: clamp(3.5rem, 8vw, 5rem) !important;
          height: clamp(3.5rem, 8vw, 5rem) !important;
          border-radius: 1rem;
          font-size: clamp(1.5rem, 4vw, 2.25rem) !important;
        }
        .color-memory-intro-copy > p {
          font-size: clamp(1rem, 2vw, 1.15rem);
        }
        .color-memory-intro-copy > button {
          font-size: clamp(1.15rem, 2.5vw, 1.5rem) !important;
          padding-top: 1.15rem;
          padding-bottom: 1.15rem;
        }
        @media (max-width: 639px) {
          .color-memory-intro-copy {
            width: 100%;
          }
          .color-memory-steps > div {
            min-width: 0;
          }
        }
      `}</style>

      <motion.div
        layout
        className={`relative z-10 flex min-w-0 w-full flex-col items-center gap-4 transition-all duration-300 sm:gap-5 lg:gap-6 ${
          phase === "memorize" || phase === "recall" || phase === "feedback"
            ? "max-w-[900px] rounded-[1.75rem] border-[3px] border-white p-3 pb-8 shadow-2xl sm:rounded-[2.25rem] sm:p-6 sm:pb-10 lg:rounded-[2.5rem] lg:p-8 lg:pb-10"
            : phase === "intro"
              ? "max-w-[1100px]"
              : "max-w-xl"
        }`}
        style={
          phase === "memorize" || phase === "recall" || phase === "feedback"
            ? {
                background: "rgba(255,255,255,0.97)",
                boxShadow: "0 24px 64px rgba(3,105,161,0.28)",
              }
            : undefined
        }
      >

        {phase === "intro" && (
          <LevelIntro
            level={Number(level)}
            config={cfg}
            onStart={handleStart}
            onVoiceInstruction={handleVoiceInstruction}
            voicePlaying={instrPlaying}
          />
        )}

        {(phase === "memorize" || phase === "recall" || phase === "feedback") && (
          <>
            <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0 rounded-full px-3 py-2 text-sm font-extrabold text-white shadow-md sm:px-5 sm:py-3 sm:text-base"
                style={{ background: color }}>
                {round + 1} / {roundsTotal}
              </div>
              <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner sm:h-5">
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
                  animate={{ width: `${(round / roundsTotal) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
              <div className="flex-shrink-0 rounded-full px-3 py-2 text-sm font-extrabold text-white shadow-md sm:px-4 sm:py-3 sm:text-base"
                style={{ background: "rgba(34,197,94,0.85)" }}>
                ✓ {correct}
              </div>
            </div>

            <div className="rounded-full px-4 py-2 text-base font-extrabold text-white/90 sm:px-6 sm:text-lg"
              style={{ background: `${color}bb`, backdropFilter: "blur(8px)" }}>
              {cfg.subTitle}
            </div>

            {phase === "memorize" && target && (
              <div className="flex w-full min-w-0 flex-col items-center gap-3 sm:gap-5">
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xl font-extrabold text-slate-800 sm:text-2xl">
                  {cfg.type === "color"  ? "තිරයේ පෙන්වන වර්ණය මතකයේ තියාගන්න!" :
                   cfg.type === "number" ? "තිරයේ පෙන්වන අංකය මතකයේ තියාගන්න!" :
                                          "තිරයේ පෙන්වන සිංහල අකුර මතකයේ තියාගන්න!"}
                </motion.p>
                <TimerRing elapsed={elapsed} total={cfg.memorizeMs} color={color} />
                <TargetDisplay item={target} type={cfg.type} />
              </div>
            )}

            {(phase === "recall" || phase === "feedback") && (
              <div className="flex w-full min-w-0 flex-col items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="relative flex w-full max-w-2xl items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 via-purple-50 to-pink-50 px-3 py-3 text-center shadow-md sm:gap-3 sm:rounded-[2rem] sm:px-8 sm:py-5"
                >
                  <span className="absolute left-6 top-3 h-3 w-3 rounded-full bg-sky-300/60" aria-hidden="true" />
                  <span className="absolute bottom-3 right-10 h-4 w-4 rounded-full bg-pink-300/50" aria-hidden="true" />
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-500 text-xl font-black text-white shadow-lg sm:h-12 sm:w-12 sm:text-2xl" aria-hidden="true">
                    ?
                  </span>
                  <p className="text-base font-black leading-relaxed text-slate-800 min-[380px]:text-lg sm:text-2xl">
                    {cfg.type === "color"  ? "කලින් දැක්ක වර්ණය මතකද?" :
                     cfg.type === "number" ? "කලින් දැක්ක අංකය මතකද?" :
                                            "කලින් දැක්ක අකුර මතකද?"}
                  </p>
                </motion.div>

                <div className={`grid w-full min-w-0 gap-2 sm:gap-4 ${cfg.choices === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  <AnimatePresence>
                    {options.map((opt, i) => (
                      <motion.div key={opt.id}
                        initial={{ opacity: 0, scale: 0.65 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07, type: "spring", stiffness: 220, damping: 18 }}>
                        <OptionBtn
                          item={opt} type={cfg.type}
                          onClick={handleAnswer}
                          disabled={phase === "feedback"}
                          state={
                            phase === "feedback" && opt.id === target.id ? "correct" :
                            phase === "feedback" && opt.id === picked     ? "wrong"   : null
                          }
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {hintVisible && (
                    <motion.div
                      key="hint-banner"
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 sm:px-5 sm:py-4"
                      style={{ background: "#FEF9C3", border: "2px solid #FDE047" }}>
                      <span style={{ fontSize: 28 }}>💡</span>
                      <div>
                        <p className="text-base font-extrabold text-yellow-800">ඉඟිය: ටිකාල ලකුනෙ! ඉකමනින් ඉලියෙ, දිහා හොදෙ!</p>
                        <p className="text-sm font-semibold text-yellow-700 mt-1">
                          {cfg.type === "color"  ? "ඔය වර්ණය හිත ගාව ලාගෙන, ඒකට ගැලපෙන වර්ණය ටිකෙ කරන්න." :
                           cfg.type === "number" ? "ඔය අංකය හිතෙහිදීම කියාගෙන, ඒකට ගැලපෙන අංකය ටිකෙ කරන්න." :
                                                   "ඔය අකුරු හිත ගාව ලාගෙන, ඒකට ගැලපෙන අකුරු ටිකෙ කරන්න."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {phase === "feedback" && picked !== target?.id && (
                    <motion.div key="fb"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="rounded-full bg-red-500 px-6 py-3 text-lg font-extrabold text-white shadow-xl sm:px-8 sm:py-4 sm:text-xl">
                      වැරදියි!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {(phase === "recall" || phase === "feedback") && (
          <div
            className="pointer-events-none absolute -bottom-10 left-3 z-20 w-24 sm:-bottom-14 sm:left-6 sm:w-32"
            aria-hidden="true"
          >
            <motion.img
              src={animatedCrabMascot}
              alt=""
              className="h-auto w-full select-none drop-shadow-xl"
              animate={prefersReducedMotion ? undefined : {
                x: [0, 14, 0],
                y: [0, -7, 0],
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        )}

        {phase === "result" && (
          <ResultScreen
            level={Number(level)}
            correct={correct}
            total={cfg.rounds}
            passScore={cfg.passScore}
            onNext={() => onComplete && onComplete({ passed: true, nextLevel: Number(level) < 3 ? Number(level) + 1 : null, accuracy: Math.round((correct / cfg.rounds) * 100) })}
            onRetry={() => {
              setRound(0);
              setCorrect(0);

              correctRef.current = 0;
              mistakesRef.current = 0;

              responseTimesRef.current = [];
              answerStartTimeRef.current = null;

              setHintVisible(false);

              clearTimers();
              setPhase("intro");
            }}
            onHome={() => onComplete && onComplete({ goHome: true, accuracy: Math.round((correct / cfg.rounds) * 100) })}
          />
        )}

      </motion.div>
    </div>
  );
};

export default ColorMemoryGame;
