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
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

const GAME_ID = "color-memory";

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
  { id: "teal",   label: "කොළ-නිල්", hex: "#14B8A6" },
];

const NUMBERS_POOL = Array.from({ length: 9 }, (_, i) => ({
  id: `n${i + 1}`, label: String(i + 1),
}));

const LETTERS_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => ({
  id: l, label: l,
}));

// ─────────────────────────────────────────────
//  LEVEL CONFIG
// ─────────────────────────────────────────────
const LEVEL_CONFIG = {
  1: {
    type: "color",   subTitle: "වර්ණ මතකය",
    instruction: "ඔය වර්ණය ක්ෂණිකව දිස්වේ — මතකෙ තියාගෙන ගැලපෙන එක ටිකෙ කරන්න!",
    pool: COLORS_POOL,  memorizeMs: 2500, choices: 3, rounds: 5,  passScore: 4,
    accentColor: "#EC4899",
  },
  2: {
    type: "number",  subTitle: "අංක මතකය",
    instruction: "ඔය අංකය ක්ෂණිකව දිස්වේ — මතකෙ තියාගෙන ගැලපෙන එක ටිකෙ කරන්න!",
    pool: NUMBERS_POOL, memorizeMs: 3000, choices: 4, rounds: 4,  passScore: 3,
    accentColor: "#0284C7",
  },
  3: {
    type: "letter",  subTitle: "අකුරු මතකය",
    instruction: "ඔය අකුර ක්ෂණිකව දිස්වේ — මතකෙ තියාගෙන ගැලපෙන එක ටිකෙ කරන්න!",
    pool: LETTERS_POOL, memorizeMs: 2800, choices: 4, rounds: 5,  passScore: 4,
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

const AnimatedSeaBg = () => (
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
  const r    = 30;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, 1 - elapsed / total);
  const secs = Math.ceil(Math.max(0, total - elapsed) / 1000);
  return (
    <svg width={76} height={76} viewBox="0 0 76 76" aria-label={`${secs} seconds left`}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="7" />
      <circle cx="38" cy="38" r={r} fill="rgba(255,255,255,0.12)" />
      <motion.circle cx="38" cy="38" r={r}
        fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" transform="rotate(-90 38 38)" />
      <text x="38" y="44" textAnchor="middle" fill="white" fontSize="21" fontWeight="900">{secs}</text>
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
        className="flex flex-col items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.06, 1], boxShadow: [`0 8px 40px ${item.hex}88`, `0 16px 60px ${item.hex}cc`, `0 8px 40px ${item.hex}88`] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-3xl border-4 border-white/60 shadow-2xl"
          style={{ width: 155, height: 155, background: item.hex }} />
        <p className="text-3xl font-extrabold text-white drop-shadow-lg">{item.label}</p>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}>
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center rounded-3xl border-4 border-sky-200 shadow-2xl"
        style={{
          width: 175, height: 175,
          background: "rgba(255,255,255,0.95)",
          fontSize: type === "letter" ? 100 : 108,
          fontWeight: 900, color: "#0284C7", lineHeight: 1,
          boxShadow: "0 12px 60px rgba(14,165,233,0.45)",
        }}>
        {item.label}
      </motion.div>
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
        className="relative flex items-center justify-center rounded-3xl overflow-hidden shadow-lg"
        style={{
          width: "100%", height: 100,
          background: item.hex,
          boxShadow: isCorrect ? `0 0 0 5px #22C55E, 0 8px 28px ${item.hex}88`
                   : isWrong   ? `0 0 0 5px #EF4444, 0 8px 28px ${item.hex}88`
                               : `0 6px 24px ${item.hex}55`,
          border: isCorrect ? "3px solid #22C55E" : isWrong ? "3px solid #EF4444" : "3px solid rgba(255,255,255,0.45)",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "box-shadow 0.18s, border 0.18s",
        }}
        aria-label={item.label}>
        {isCorrect && <div className="absolute inset-0 flex items-center justify-center bg-green-500/25 rounded-3xl"><CheckIcon size={42} /></div>}
        {isWrong   && <div className="absolute inset-0 flex items-center justify-center bg-red-500/25 rounded-3xl"><CrossIcon size={42} /></div>}
        {!isCorrect && !isWrong && (
          <span className="text-xl font-extrabold text-white drop-shadow-lg">{item.label}</span>
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
      className="flex items-center justify-center rounded-3xl shadow-lg"
      style={{
        width: "100%", height: 100,
        background: isCorrect ? "#22C55E" : isWrong ? "#EF4444" : "rgba(255,255,255,0.93)",
        color: isCorrect || isWrong ? "white" : "#0284C7",
        fontSize: 62, fontWeight: 900, lineHeight: 1,
        boxShadow: isCorrect ? "0 0 0 5px #22C55E88, 0 8px 28px rgba(34,197,94,0.4)"
                 : isWrong   ? "0 0 0 5px #EF444488, 0 8px 28px rgba(239,68,68,0.4)"
                             : "0 6px 20px rgba(14,165,233,0.2)",
        border: isCorrect ? "3px solid #22C55E" : isWrong ? "3px solid #EF4444" : "2px solid rgba(14,165,233,0.25)",
        backdropFilter: "blur(8px)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.18s, box-shadow 0.18s",
      }}
      aria-label={item.label}>
      {isCorrect ? <CheckIcon size={42} /> : isWrong ? <CrossIcon size={42} /> : item.label}
    </motion.button>
  );
};

// ─────────────────────────────────────────────
//  LEVEL INTRO
// ─────────────────────────────────────────────
const LevelIntro = ({ level, config, onStart }) => {
  const accentColors = { 1: "#EC4899", 2: "#0284C7", 3: "#7C3AED" };
  const bgColors     = { 1: "#FCE7F3", 2: "#E0F2FE", 3: "#EDE9FE" };
  const color        = accentColors[level];
  const preview      = config.pool.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 p-7 rounded-3xl w-full max-w-sm"
      style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(18px)", border: `2px solid ${color}33` }}>

      {/* Level badge */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center w-20 h-20 rounded-full text-4xl font-black text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
        {level}
      </motion.div>

      <div className="text-center">
        <p className="text-2xl font-extrabold" style={{ color }}>{config.subTitle}</p>
        <p className="text-sm font-semibold text-gray-500 mt-1">
          {config.rounds} Rounds  •  Pass: {config.passScore}/{config.rounds} නිවැරදි
        </p>
      </div>

      {/* How-to card */}
      <div className="w-full rounded-2xl p-4 text-center" style={{ background: bgColors[level], border: `2px solid ${color}22` }}>
        <p className="text-base font-bold text-gray-700 leading-relaxed">{config.instruction}</p>
        <div className="flex items-center justify-center gap-3 mt-3 text-sm font-semibold text-gray-500">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {(config.memorizeMs / 1000).toFixed(1)}s
          </span>
          <span>→</span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
            {config.choices} choices
          </span>
        </div>
      </div>

      {/* Sample items preview */}
      <div className="flex gap-3 flex-wrap justify-center">
        {config.type === "color"
          ? preview.map(item => (
              <div key={item.id} className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white/60" style={{ background: item.hex }} />
            ))
          : preview.map(item => (
              <div key={item.id}
                className="w-12 h-12 rounded-2xl shadow-md flex items-center justify-center font-extrabold text-2xl bg-white border-2"
                style={{ color, borderColor: `${color}44` }}>
                {item.label}
              </div>
            ))}
        <div className="w-12 h-12 rounded-2xl bg-white/40 border-2 border-dashed border-white/60 flex items-center justify-center text-white/70 font-bold text-xl">
          +
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="w-full rounded-full py-5 text-xl font-extrabold text-white shadow-xl"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}>
        ▶ ආරම්භ කරමු!
      </motion.button>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  RESULT SCREEN
// ─────────────────────────────────────────────
const ResultScreen = ({ level, correct, total, passScore, onNext, onRetry, onHome }) => {
  const passed = correct >= passScore;
  const pct    = Math.round((correct / total) * 100);
  const stars  = correct >= total ? 3 : correct >= passScore ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="flex flex-col items-center gap-5 p-7 rounded-3xl text-center w-full max-w-sm"
      style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(18px)" }}>

      <motion.div
        animate={passed ? { rotate: [0, -10, 10, -8, 8, 0] } : { scale: [1, 1.12, 1] }}
        transition={{ delay: 0.25, duration: 0.6 }}>
        {passed ? <TrophyIcon size={64} color="#F59E0B" /> : <SmileIcon size={64} color="#F97316" />}
      </motion.div>

      <div>
        <p className="text-3xl font-extrabold mb-1" style={{ color: passed ? "#22C55E" : "#F97316" }}>
          {passed ? "ජය ගත්තා!" : "නැවත උත්සාහ කරන්න!"}
        </p>
        <p className="text-lg font-bold text-gray-600">{correct} / {total} නිවැරදි ({pct}%)</p>
      </div>

      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3].map(i => <StarIcon key={i} size={36} filled={i <= stars} />)}
      </div>

      {/* Unlock notification */}
      {passed && level < 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
          style={{ background: "#EFF6FF", border: "2px solid #BFDBFE" }}>
          <UnlockIcon size={18} color="#2563EB" />
          <p className="text-base font-bold text-blue-600">Level {level + 1} unlock වුණා!</p>
        </motion.div>
      )}

      {passed && level === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="w-full rounded-2xl px-5 py-3 text-center"
          style={{ background: "#FEF9C3", border: "2px solid #FDE047" }}>
          <p className="text-base font-bold text-yellow-700">සියලු levels ජය ගත්තා! ඔබ ශූරයෙක්!</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        {passed && level < 3 && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
            className="rounded-full py-4 font-extrabold text-lg text-white shadow-lg flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg,#22C55E,#16A34A)" }}>
            <NextIcon size={20} /> ඊළඟ Level
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRetry}
          className="rounded-full py-4 font-extrabold text-lg text-white shadow-lg flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(90deg,#0EA5E9,#0284C7)" }}>
          <RetryIcon size={20} /> නැවත ක්‍රීඩා කරමු
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onHome}
          className="rounded-full py-4 font-extrabold text-lg text-white shadow-lg flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(90deg,#8B5CF6,#7C3AED)" }}>
          <HomeIcon size={20} /> ගෙදරට
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  MAIN GAME COMPONENT
// ─────────────────────────────────────────────
const ColorMemoryGame = ({ level = 1, onComplete }) => {
  const cfg = LEVEL_CONFIG[Math.min(3, Math.max(1, Number(level)))];
  const { completeLevel, initializeGame } = useProgress();

  // phase: intro | memorize | recall | feedback | result
  const [phase,   setPhase]   = useState("intro");
  const [round,   setRound]   = useState(0);
  const [target,  setTarget]  = useState(null);
  const [options, setOptions] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [picked,  setPicked]  = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const correctRef = useRef(0);
  const timerRef   = useRef(null);
  const tickRef    = useRef(null);

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
      setPhase("recall");
    }, cfg.memorizeMs);
  }, [cfg]);

  const handleStart = () => {
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    startRound();
  };

  const handleAnswer = useCallback((item) => {
    clearTimers();
    const isRight = item.id === target.id;
    setPicked(item.id);
    if (isRight) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
    }
    setPhase("feedback");

    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= cfg.rounds) {
        setRound(nextRound);
        const passed = correctRef.current >= cfg.passScore;
        if (passed) {
          completeLevel(GAME_ID, Number(level), {
            correct: correctRef.current,
            total: cfg.rounds,
            pct: Math.round((correctRef.current / cfg.rounds) * 100),
          });
          setTimeout(() => confetti({
            particleCount: 160, spread: 90, origin: { y: 0.55 },
            colors: ["#0EA5E9", "#A78BFA", "#FB923C", "#22C55E", "#F472B6"],
          }), 200);
        }
        setPhase("result");
      } else {
        setRound(nextRound);
        startRound();
      }
    }, 1100);
  }, [target, round, cfg, level, completeLevel, startRound]);

  // Reset when level prop changes (e.g., navigated to next level)
  useEffect(() => {
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    setPhase("intro");
    clearTimers();
  }, [level]);

  useEffect(() => () => clearTimers(), []);

  const color = cfg.accentColor;
  const roundsTotal = cfg.rounds;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-x-hidden" style={{ zIndex: 1 }}>
      <AnimatedSeaBg />

      <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm">

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <LevelIntro level={Number(level)} config={cfg} onStart={handleStart} />
        )}

        {/* ── ACTIVE GAME ── */}
        {(phase === "memorize" || phase === "recall" || phase === "feedback") && (
          <>
            {/* Progress header */}
            <div className="w-full flex items-center gap-3">
              <div className="rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-md flex-shrink-0"
                style={{ background: color }}>
                {round + 1} / {roundsTotal}
              </div>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
                <motion.div className="h-3 rounded-full bg-white/80"
                  animate={{ width: `${(round / roundsTotal) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
              <div className="rounded-full px-3 py-2 text-sm font-extrabold text-white shadow-md flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.85)" }}>
                ✓ {correct}
              </div>
            </div>

            {/* Level label */}
            <div className="rounded-full px-5 py-1.5 text-sm font-extrabold text-white/90"
              style={{ background: `${color}bb`, backdropFilter: "blur(8px)" }}>
              {cfg.subTitle}
            </div>

            {/* MEMORIZE phase */}
            {phase === "memorize" && target && (
              <div className="flex flex-col items-center gap-5">
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-extrabold text-white drop-shadow-lg text-center">
                  {cfg.type === "color"  ? "ඔය වර්ණය මතකෙ තියාගන්න!" :
                   cfg.type === "number" ? "ඔය අංකය මතකෙ තියාගන්න!" :
                                          "ඔය අකුර මතකෙ තියාගන්න!"}
                </motion.p>
                <TimerRing elapsed={elapsed} total={cfg.memorizeMs} color={color} />
                <TargetDisplay item={target} type={cfg.type} />
              </div>
            )}

            {/* RECALL / FEEDBACK phase */}
            {(phase === "recall" || phase === "feedback") && (
              <div className="flex flex-col items-center gap-4 w-full">
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-extrabold text-white drop-shadow-lg text-center">
                  {cfg.type === "color"  ? "ගැලපෙන වර්ණය ටිකෙ කරන්න!" :
                   cfg.type === "number" ? "ගැලපෙන අංකය ටිකෙ කරන්න!" :
                                          "ගැලපෙන අකුර ටිකෙ කරන්න!"}
                </motion.p>

                <div className={`grid gap-4 w-full ${cfg.choices === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
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

                {/* Feedback flash message */}
                <AnimatePresence>
                  {phase === "feedback" && (
                    <motion.div key="fb"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`rounded-full px-6 py-2 text-base font-extrabold text-white shadow-lg ${picked === target?.id ? "bg-green-500" : "bg-red-500"}`}>
                      {picked === target?.id ? "නිවැරදි!" : "වැරදියි!"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <ResultScreen
            level={Number(level)}
            correct={correct}
            total={cfg.rounds}
            passScore={cfg.passScore}
            onNext={() => onComplete && onComplete({ passed: true, nextLevel: Number(level) + 1 })}
            onRetry={() => { setRound(0); setCorrect(0); correctRef.current = 0; clearTimers(); setPhase("intro"); }}
            onHome={() => onComplete && onComplete({ goHome: true })}
          />
        )}

      </div>
    </div>
  );
};

export default ColorMemoryGame;
