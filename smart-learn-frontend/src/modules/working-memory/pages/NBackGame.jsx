/**
 * NBackGame.jsx
 * N-Back Working Memory Game — Level 1 (1-Back) & Level 2 (2-Back)
 * Language: Sinhala | Theme: Sea / Ocean
 * Level 1 — match by SHAPE only
 * Level 2 — match by SHAPE + COLOR together
 * No emojis — SVG icons & sea creatures only.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

// ─────────────────────────────────────────────
//  SVG SHAPES  (no emojis)
// ─────────────────────────────────────────────

const SHAPE_PATHS = {
  circle: <circle cx="50" cy="50" r="42" />,
  square: <rect x="7" y="7" width="86" height="86" rx="16" />,
  triangle: <polygon points="50,6 95,92 5,92" />,
  star: <polygon points="50,4 63,36 98,36 71,57 82,92 50,70 18,92 29,57 2,36 37,36" />,
  diamond: <polygon points="50,3 95,50 50,97 5,50" />,
};

const ShapeIcon = ({ shapeId, color, size = 100, glowing = false }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    aria-hidden="true"
    style={{
      fill: color,
      filter: glowing
        ? `drop-shadow(0 0 14px ${color}) drop-shadow(0 4px 18px ${color}88)`
        : `drop-shadow(0 4px 12px ${color}55)`,
      display: "block",
    }}
  >
    {SHAPE_PATHS[shapeId]}
  </svg>
);

// Check-mark path
const CheckIcon = ({ size = 28, color = "white" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X (cross) icon
const CrossIcon = ({ size = 28, color = "white" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Lock icon
const LockIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Brain icon (minimalistic)
const BrainIcon = ({ size = 36 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.62-4.38A3 3 0 0 1 4 11.5a2.99 2.99 0 0 1 .8-2.02A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.62-4.38A3 3 0 0 0 20 11.5a2.99 2.99 0 0 0-.8-2.02A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

// Trophy icon
const TrophyIcon = ({ size = 32, color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

// ─────────────────────────────────────────────
//  SEA CREATURE SVGs  (animated background)
// ─────────────────────────────────────────────

// Simple cartoon fish (facing right)
const FishSVG = ({ size = 60, color = "#4E9AF1", flip = false }) => (
  <svg
    viewBox="0 0 80 50" width={size} height={size * 0.625}
    style={{ transform: flip ? "scaleX(-1)" : undefined, display: "block" }}
    aria-hidden="true"
  >
    {/* body */}
    <ellipse cx="38" cy="25" rx="26" ry="16" fill={color} opacity="0.9" />
    {/* tail */}
    <polygon points="14,25 2,10 2,40" fill={color} opacity="0.75" />
    {/* fin */}
    <path d="M38 9 Q50 2 60 9" stroke={color} strokeWidth="4" fill="none" opacity="0.7" strokeLinecap="round" />
    {/* eye */}
    <circle cx="56" cy="21" r="4" fill="white" />
    <circle cx="57" cy="21" r="2" fill="#1E3A5F" />
    {/* mouth */}
    <path d="M63 26 Q65 30 63 33" stroke="#1E3A5F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

// Bubble
const BubbleSVG = ({ size = 18, color = "#93C5FD" }) => (
  <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
    <circle cx="15" cy="15" r="13" fill={color} stroke={color} strokeWidth="2" opacity="0.35" />
    <circle cx="15" cy="15" r="13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
    <circle cx="9" cy="9" r="4" fill="white" opacity="0.4" />
  </svg>
);

// Small fish for the timer bar
const TinyFishSVG = ({ color = "#0EA5E9" }) => (
  <svg viewBox="0 0 40 25" width="32" height="20" aria-hidden="true">
    <ellipse cx="22" cy="12" rx="14" ry="9" fill={color} />
    <polygon points="8,12 0,4 0,20" fill={color} opacity="0.8" />
    <circle cx="31" cy="9" r="2.5" fill="white" />
    <circle cx="31.5" cy="9" r="1.2" fill="#0C4A6E" />
  </svg>
);

// Seaweed (wavy path)
const SeaweedSVG = ({ size = 50, color = "#34D399" }) => (
  <svg viewBox="0 0 20 80" width={size * 0.25} height={size} aria-hidden="true">
    <path
      d="M10 78 Q0 65 10 52 Q20 39 10 26 Q0 13 10 0"
      stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8"
    />
  </svg>
);

// Starfish
const StarfishSVG = ({ size = 38, color = "#FB923C" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
    <polygon
      points="50,4 63,36 98,36 71,57 82,92 50,70 18,92 29,57 2,36 37,36"
      fill={color} opacity="0.85"
    />
  </svg>
);

// Shell — filled with spiral stripes
const ShellSVG = ({ size = 32, color = "#F9A8D4" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    {/* filled outer shell */}
    <path d="M40 10 a30,30 0 1,1 -0.01,0 Z" fill={color} opacity="0.25" />
    {/* spiral lines */}
    <path d="M40 40 m0,-30 a30,30 0 1,1 0,60 a20,20 0 1,0 0,-40 a10,10 0 1,1 0,20" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9" />
    {/* ridge lines */}
    <path d="M40 40 L68 28 M40 40 L65 58 M40 40 L28 68" stroke={color} strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
    <circle cx="40" cy="40" r="5" fill={color} opacity="0.9" />
    <circle cx="40" cy="40" r="2" fill="white" opacity="0.6" />
  </svg>
);

// Jellyfish — each tentacle is its own animated element
const JellyfishSVG = ({ size = 44, color = "#C084FC", wiggle = false }) => {
  const tentacles = [8, 16, 24, 32, 40, 48];
  return (
    <svg viewBox="0 0 60 90" width={size} height={size * 1.5} aria-hidden="true" overflow="visible">
      {/* glow dome */}
      <ellipse cx="30" cy="28" rx="26" ry="10" fill={color} opacity="0.25" />
      {/* dome */}
      <path d="M4 30 Q4 2 30 2 Q56 2 56 30 Z" fill={color} opacity="0.80" />
      {/* inner highlight */}
      <path d="M14 25 Q18 8 30 6 Q42 8 46 25" fill="white" opacity="0.18" />
      {/* tentacles — rendered as foreign objects so each can animate */}
      {tentacles.map((x, i) => (
        <motion.path
          key={i}
          d={`M${x} 30 Q${x + (i % 2 === 0 ? -7 : 7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? 6 : -6)} 82 ${x} 90`}
          stroke={color} strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round"
          animate={wiggle ? { d: [
            `M${x} 30 Q${x + (i % 2 === 0 ? -7 : 7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? 6 : -6)} 82 ${x} 90`,
            `M${x} 30 Q${x + (i % 2 === 0 ? 7 : -7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? -6 : 6)} 82 ${x} 90`,
            `M${x} 30 Q${x + (i % 2 === 0 ? -7 : 7)} 52 ${x} 70 Q${x + (i % 2 === 0 ? 6 : -6)} 82 ${x} 90`,
          ]} : {}}
          transition={{ duration: 1.2 + i * 0.15, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
};

// ─────────────────────────────────────────────
//  COLOUR PALETTE
// ─────────────────────────────────────────────

const PALETTE = [
  { id: "coral",    hex: "#FF6B6B" },
  { id: "ocean",    hex: "#4E9AF1" },
  { id: "sun",      hex: "#FFB830" },
  { id: "leaf",     hex: "#56C596" },
  { id: "lavender", hex: "#9B72CF" },
  { id: "peach",    hex: "#FF8C61" },
];

// ─────────────────────────────────────────────
//  LEVEL CONFIGURATION
// ─────────────────────────────────────────────

const LEVELS = {
  1: {
    n: 1,
    matchMode:     "shape",          // compare shape only
    label:         "පළමු මට්ටම",
    title:         "1-Back",
    subtitle:      "අවසාන හැඩය මතක තබා ගන්න",
    instruction:   "හැඩය හොඳින් මතක තබා ගන්න! ඊළඟ හැඩය එන විට — ඔය දෙක එකම හැඩද? ඔව් නම් 'ඔව්!' ඔබන්න!",
    warmUp:        1,
    totalTrials:   6,          // 1 warm-up + 5 questions
    showMs:        3500,       // generous show time for kids
    responseMs:    6000,       // plenty of time to answer
    shapePool:     ["circle", "square", "triangle"],
    colorPool:     PALETTE.slice(0, 4),
    matchRate:     0.40,
    bgGradient:    "from-cyan-200 via-sky-100 to-blue-200",
    cardAccent:    "#0284C7",
    cardAccentBg:  "#E0F2FE",
    badgeBg:       "bg-sky-100",
    badgeText:     "text-sky-700",
    warmUpNote:    "1 පුහුණු වටය — ඉන් පසු ප්‍රශ්න 5ක් පමණයි!",
    promptText:    "මේ හැඩය කලින් හැඩයටම සමානද?",
    matchHint:     "කලින් දකින ලද හැඩය:",
    watchLabel:    "හැඩය මතක තබා ගන්න!",
    thinkLabel:    "හොඳට හිතන්න...",
    memoriseLabel: "මතක තබා ගනිමින්...",
    answerLabel:   "ඉක්මනට පිළිතුරු දෙන්න!",
    questionLabel: (q, total) => `ප්‍රශ්නය ${q} / ${total}`,
  },
  2: {
    n: 2,
    matchMode:     "shape+color",    // compare BOTH shape AND color
    label:         "දෙවන මට්ටම",
    title:         "2-Back",
    subtitle:      "හැඩය සහ වර්ණය 2 පියවරයක් ඉදිරියෙන් මතක තබා ගන්න",
    instruction:   "දැන් ඔබට හැඩය සහ වර්ණය දෙකම මතක තිබිය යුතුයි! 2 හැඩයකට ඉදිරියෙන් ඔබ දුටු හැඩය සහ වර්ණය දෙකම දැන් දිස්වන එකටම සමානද? දෙකම ගැළපේ නම් 'ඔව්!' ඔබන්න!",
    warmUp:        2,
    totalTrials:   7,          // 2 warm-ups + 5 questions
    showMs:        3200,       // generous show time
    responseMs:    5500,       // plenty of time to answer
    shapePool:     ["circle", "square", "triangle", "star", "diamond"],
    colorPool:     PALETTE,
    matchRate:     0.40,
    bgGradient:    "from-teal-200 via-emerald-100 to-cyan-200",
    cardAccent:    "#0D9488",
    cardAccentBg:  "#CCFBF1",
    badgeBg:       "bg-teal-100",
    badgeText:     "text-teal-700",
    warmUpNote:    "2 පුහුණු වටය — ඉන් පසු ප්‍රශ්න 5ක් පමණයි!",
    promptText:    "හැඩය සහ වර්ණය — දෙකම 2 පියවරකට ඉදිරිය එකද?",
    matchHint:     "2 පියවරකට ඉදිරිය ඔබ දුටුවේ:",
    watchLabel:    "හැඩය සහ වර්ණය මතක තබා ගන්න!",
    thinkLabel:    "හොඳට හිතන්න...",
    memoriseLabel: "මතක තබා ගනිමින්...",
    answerLabel:   "ඉක්මනට පිළිතුරු දෙන්න!",
    questionLabel: (q, total) => `ප්‍රශ්නය ${q} / ${total}`,
  },
};

// ─────────────────────────────────────────────
//  SEQUENCE GENERATOR
// ─────────────────────────────────────────────

function generateSequence(cfg) {
  const { n, totalTrials, shapePool, colorPool, matchRate, matchMode } = cfg;
  const rndShape = () => shapePool[Math.floor(Math.random() * shapePool.length)];
  const rndColor = () => colorPool[Math.floor(Math.random() * colorPool.length)];
  const rndColorExcept = (excludeId) => {
    const pool = colorPool.filter(c => c.id !== excludeId);
    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : rndColor();
  };
  const items = [];

  for (let i = 0; i < totalTrials; i++) {
    if (i < n) {
      // warm-up — no answer required
      items.push({ shapeId: rndShape(), color: rndColor(), answerable: false, isMatch: false });
    } else {
      const doMatch = Math.random() < matchRate;
      const nBackItem = items[i - n];

      if (matchMode === "shape+color") {
        // Level 2: match = same shape AND same color
        if (doMatch) {
          items.push({
            shapeId: nBackItem.shapeId,   // same shape
            color:   nBackItem.color,     // same color  ← key change
            answerable: true,
            isMatch: true,
          });
        } else {
          // Deliberately differ on at least one dimension
          const diffType = Math.random() < 0.5 ? "shape" : "color";
          if (diffType === "shape") {
            const pool = shapePool.filter(s => s !== nBackItem.shapeId);
            const shape = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : rndShape();
            items.push({ shapeId: shape, color: rndColor(), answerable: true, isMatch: false });
          } else {
            // same shape, different color
            const color = rndColorExcept(nBackItem.color.id);
            items.push({ shapeId: nBackItem.shapeId, color, answerable: true, isMatch: false });
          }
        }
      } else {
        // Level 1: match = same shape only (color irrelevant)
        if (doMatch) {
          items.push({
            shapeId: nBackItem.shapeId,
            color:   rndColor(),
            answerable: true,
            isMatch: true,
          });
        } else {
          const pool = shapePool.filter(s => s !== nBackItem.shapeId);
          const shape = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : rndShape();
          items.push({ shapeId: shape, color: rndColor(), answerable: true, isMatch: false });
        }
      }
    }
  }
  return items;
}

// ─────────────────────────────────────────────
//  AUDIO
// ─────────────────────────────────────────────

function playTone(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = type === "correct" ? 880 : 330;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    setTimeout(() => { try { osc.stop(); ctx.close(); } catch (_) {} }, 500);
  } catch (_) { /* audio not available */ }
}

// ─────────────────────────────────────────────
//  SEA ANIMATED BACKGROUND
// ─────────────────────────────────────────────

// Wave strip at the bottom
const WaveStrip = ({ color = "#BAE6FD", y = "85%", opacity = 0.45 }) => (
  <motion.div
    className="absolute w-full pointer-events-none"
    style={{ top: y, opacity }}
    animate={{ x: ["0%", "-6%", "0%"] }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg viewBox="0 0 1200 60" width="120%" height="60" preserveAspectRatio="none">
      <path
        d="M0 30 Q150 0 300 30 Q450 60 600 30 Q750 0 900 30 Q1050 60 1200 30 L1200 60 L0 60 Z"
        fill={color}
      />
    </svg>
  </motion.div>
);

// Sun rays at top
const SunRays = () => (
  <motion.div
    className="absolute top-0 left-1/2 pointer-events-none"
    style={{ transform: "translateX(-50%)", opacity: 0.18 }}
    animate={{ opacity: [0.14, 0.22, 0.14] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <svg viewBox="0 0 200 120" width="320" height="120">
      {[0, 25, 50, 75, 100, 125, 150, 175].map((angle, i) => (
        <line
          key={i}
          x1="100" y1="0"
          x2={100 + Math.cos((angle * Math.PI) / 180) * 100}
          y2={Math.sin((angle * Math.PI) / 180) * 100}
          stroke="#FDE68A" strokeWidth="8" strokeLinecap="round" opacity="0.7"
        />
      ))}
      <circle cx="100" cy="0" r="20" fill="#FDE68A" opacity="0.9" />
    </svg>
  </motion.div>
);

// Floating bubble
const FloatingBubble = ({ x, startY, size, delay, dur }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${startY}%` }}
    animate={{ y: ["-10%", "-90%"], opacity: [0, 0.6, 0] }}
    transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
  >
    <BubbleSVG size={size} color="#BAE6FD" />
  </motion.div>
);

// Sea creature items for animation
const SEA_CREATURES = [
  // fish swimming left→right (bigger, more visible)
  { type: "fish",      x: -10, y: 28, size: 68, color: "#0EA5E9", delay: 0,   dur: 12,  flip: false, opacity: 0.75, driftX: "115%", driftY: ["0%","4%","-4%","0%"] },
  { type: "fish",      x: -10, y: 52, size: 52, color: "#FB923C", delay: 4,   dur: 15,  flip: false, opacity: 0.70, driftX: "115%", driftY: ["0%","-5%","5%","0%"] },
  { type: "fish",      x: 110, y: 18, size: 60, color: "#A78BFA", delay: 7,   dur: 13,  flip: true,  opacity: 0.70, driftX: "-115%",driftY: ["0%","3%","-3%","0%"] },
  { type: "fish",      x: 110, y: 66, size: 44, color: "#34D399", delay: 2,   dur: 17,  flip: true,  opacity: 0.65, driftX: "-115%",driftY: ["0%","-4%","4%","0%"] },
  { type: "fish",      x: -10, y: 42, size: 38, color: "#F472B6", delay: 9,   dur: 19,  flip: false, opacity: 0.60, driftX: "115%", driftY: ["0%","6%","-6%","0%"] },
  // jellyfish — wiggling tentacles
  { type: "jellyfish", x: 8,   y: 55, size: 58, color: "#C084FC", delay: 0,   dur: 8,   opacity: 0.72, wiggle: true },
  { type: "jellyfish", x: 76,  y: 48, size: 46, color: "#F9A8D4", delay: 3.5, dur: 10,  opacity: 0.65, wiggle: true },
  { type: "jellyfish", x: 42,  y: 62, size: 38, color: "#818CF8", delay: 6,   dur: 9,   opacity: 0.60, wiggle: true },
  // seaweed — big dramatic sway
  { type: "seaweed",   x: 3,   y: 62, size: 75, color: "#34D399", delay: 0,   dur: 3.0, opacity: 0.75 },
  { type: "seaweed",   x: 18,  y: 66, size: 62, color: "#4ADE80", delay: 0.8, dur: 3.8, opacity: 0.65 },
  { type: "seaweed",   x: 64,  y: 64, size: 68, color: "#34D399", delay: 1.5, dur: 3.2, opacity: 0.70 },
  { type: "seaweed",   x: 88,  y: 67, size: 58, color: "#4ADE80", delay: 0.3, dur: 4.0, opacity: 0.65 },
  // starfish — bouncy wobble
  { type: "starfish",  x: 35,  y: 79, size: 42, color: "#FB923C", delay: 0,   dur: 4,   opacity: 0.75 },
  { type: "starfish",  x: 58,  y: 82, size: 34, color: "#F87171", delay: 1.5, dur: 5,   opacity: 0.70 },
  { type: "starfish",  x: 75,  y: 78, size: 30, color: "#FCD34D", delay: 3,   dur: 4.5, opacity: 0.65 },
  // shells — rapid shake
  { type: "shell",     x: 46,  y: 82, size: 34, color: "#F9A8D4", delay: 0,   dur: 0.4, opacity: 0.80 },
  { type: "shell",     x: 80,  y: 79, size: 28, color: "#FDE68A", delay: 0.2, dur: 0.5, opacity: 0.75 },
  { type: "shell",     x: 26,  y: 83, size: 26, color: "#86EFAC", delay: 0.1, dur: 0.45,opacity: 0.70 },
];

const BUBBLES = [
  { x: 10, startY: 82, size: 18, delay: 0,   dur: 7   },
  { x: 28, startY: 86, size: 14, delay: 1.5, dur: 9   },
  { x: 48, startY: 80, size: 20, delay: 0.5, dur: 8   },
  { x: 65, startY: 84, size: 15, delay: 2.5, dur: 10  },
  { x: 82, startY: 81, size: 12, delay: 1,   dur: 7.5 },
  { x: 38, startY: 88, size: 10, delay: 3.5, dur: 11  },
  { x: 72, startY: 85, size: 16, delay: 4,   dur: 8.5 },
];

const SeaCreature = ({ item }) => {
  if (item.type === "fish") {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
        animate={{ x: item.driftX, y: item.driftY }}
        transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "linear", times: [0, 0.33, 0.66, 1] }}
      >
        {/* body wiggle */}
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <FishSVG size={item.size} color={item.color} flip={item.flip} />
        </motion.div>
      </motion.div>
    );
  }
  if (item.type === "jellyfish") {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
        animate={{ y: ["0%", "-22%", "0%"], x: ["0%", "4%", "-4%", "0%"] }}
        transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* dome pulse */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: item.dur * 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <JellyfishSVG size={item.size} color={item.color} wiggle={item.wiggle} />
        </motion.div>
      </motion.div>
    );
  }
  if (item.type === "seaweed") {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity, transformOrigin: "50% 100%" }}
        animate={{ rotate: [-14, 14, -14] }}
        transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <SeaweedSVG size={item.size} color={item.color} />
      </motion.div>
    );
  }
  if (item.type === "starfish") {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
        animate={{ rotate: [0, 15, -15, 8, -8, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <StarfishSVG size={item.size} color={item.color} />
      </motion.div>
    );
  }
  if (item.type === "shell") {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{ left: `${item.x}%`, top: `${item.y}%`, opacity: item.opacity }}
        animate={{ rotate: [-12, 12, -12], x: [-3, 3, -3] }}
        transition={{ duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShellSVG size={item.size} color={item.color} />
      </motion.div>
    );
  }
  return null;
};

const AnimatedBackground = ({ level }) => {
  const isLevel2 = level === 2;
  const seaBg    = isLevel2
    ? "from-teal-300 via-emerald-200 to-cyan-300"
    : "from-sky-300 via-blue-200 to-cyan-300";
  const waveCols = isLevel2
    ? ["#99F6E4", "#6EE7B7", "#5EEAD4"]
    : ["#BAE6FD", "#7DD3FC", "#38BDF8"];

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-b ${seaBg}`}>
      {/* Sun rays at the top */}
      <SunRays />

      {/* Sea creatures */}
      {SEA_CREATURES.map((item, i) => <SeaCreature key={i} item={item} />)}

      {/* Bubbles rising */}
      {BUBBLES.map((b, i) => <FloatingBubble key={i} {...b} />)}

      {/* Layered wave strips */}
      <WaveStrip color={waveCols[0]} y="75%" opacity={0.35} />
      <WaveStrip color={waveCols[1]} y="82%" opacity={0.45} />
      <WaveStrip color={waveCols[2]} y="90%" opacity={0.55} />

      {/* Sea floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: isLevel2 ? "#A7F3D0" : "#BAE6FD", opacity: 0.6, borderRadius: "60% 60% 0 0 / 30px 30px 0 0" }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
//  FRIENDLY TIMELINE BAR  (replaces countdown ring)
//  A fish swims across a wave bar — calm, no stress
// ─────────────────────────────────────────────

const FriendlyTimerBar = ({ durationMs, running, color = "#0284C7", label = "" }) => {
  const [pct, setPct] = useState(0);   // 0→100 fill (fills up, not drains)
  const startRef = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!running) { setPct(0); return; }
    startRef.current = Date.now();
    const tick = () => {
      const elapsed  = Date.now() - startRef.current;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setPct(progress);
      if (progress < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, durationMs]);

  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      {label && <p className="text-base font-extrabold" style={{ color }}>{label}</p>}
      <div
        className="relative w-full h-14 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.55)", border: `2px solid ${color}33` }}
      >
        {/* Wave fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}55, ${color}99)`,
            transition: "width 0.1s linear",
          }}
        >
          {/* tiny wave ripple on the fill surface */}
          <motion.div
            className="absolute right-0 inset-y-0 w-6"
            style={{ background: `radial-gradient(ellipse at right, ${color}44, transparent)` }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </motion.div>

        {/* Bubbles inside bar */}
        {[20, 45, 70].map((bx, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 5, height: 5, left: `${bx}%`, top: "50%",
              background: color, opacity: 0,
              transform: "translateY(-50%)",
              display: pct > bx ? "block" : "none",
            }}
            animate={{ y: ["-50%", "-180%"], opacity: [0, 0.55, 0] }}
            transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

        {/* Fish swimming along the bar */}
        <motion.div
          className="absolute top-1/2"
          style={{
            left: `calc(${pct}% - 20px)`,
            transform: "translateY(-50%)",
            transition: "left 0.15s linear",
            pointerEvents: "none",
          }}
        >
          <TinyFishSVG color={color} />
        </motion.div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TRIAL DOTS PROGRESS BAR
// ─────────────────────────────────────────────

const TrialDots = ({ total, current }) => (
  <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
    {Array.from({ length: total }, (_, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: active ? 22 : 14,
            height: active ? 22 : 14,
            background: done ? "#6BCB77" : active ? "#FFB830" : "#D1D5DB",
            boxShadow: active ? "0 0 8px #FFB83088" : "none",
          }}
          animate={active ? { scale: [1, 1.25, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.1 }}
        />
      );
    })}
  </div>
);

// ─────────────────────────────────────────────
//  STAR ROW  (uses star SVG shape — no emoji)
// ─────────────────────────────────────────────

const StarRow = ({ count }) => (
  <div className="flex gap-3 justify-center">
    {[1, 2, 3].map(i => (
      <motion.div
        key={i}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3 + i * 0.18, type: "spring", stiffness: 220 }}
      >
        <ShapeIcon
          shapeId="star"
          color={i <= count ? "#FFD700" : "#D1D5DB"}
          size={80}
          glowing={i <= count}
        />
      </motion.div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  FEEDBACK OVERLAY  (correct / wrong / timeout)
// ─────────────────────────────────────────────

const FeedbackOverlay = ({ type }) => {
  if (!type) return null;
  const cfg = {
    correct: { bg: "bg-emerald-100", border: "border-emerald-300", icon: <CheckIcon size={80} color="#059669" />, label: "නියමයි!",       textColor: "text-emerald-700" },
    wrong:   { bg: "bg-rose-100",    border: "border-rose-300",    icon: <CrossIcon  size={80} color="#DC2626" />, label: "දෙවතාවක් හිතන්න!", textColor: "text-rose-700" },
    timeout: { bg: "bg-orange-100",  border: "border-orange-300",  icon: <CrossIcon  size={80} color="#D97706" />, label: "ඉක්මනින් උත්තර දෙන්න!", textColor: "text-orange-700" },
  }[type];

  return (
    <motion.div
      className={`absolute inset-0 z-30 flex items-center justify-center rounded-2xl ${cfg.bg} border-2 ${cfg.border}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col items-center gap-2">
        {cfg.icon}
        <p className={`text-3xl font-extrabold ${cfg.textColor}`}>{cfg.label}</p>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  INTRO SCREEN
// ─────────────────────────────────────────────

const IntroScreen = ({ cfg, level, onStart }) => {
  const shapePool = cfg.shapePool;
  const demoShape = shapePool[0];
  const demoColor = cfg.colorPool[2].hex;
  const isLevel2  = level === 2;

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen w-full max-w-sm mx-auto text-center gap-5 px-3 py-8"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45 }}
    >
      {/* Level badge */}
      <div className={`px-7 py-2.5 rounded-full text-xl font-extrabold ${cfg.badgeBg} ${cfg.badgeText} shadow-md`}>
        {cfg.label}
      </div>

      {/* Animated demo shape with sea-glow */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShapeIcon shapeId={demoShape} color={demoColor} size={180} glowing />
      </motion.div>

      {/* Title */}
      <div>
        <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">{cfg.title}</h1>
        <p className="mt-2 text-lg font-semibold text-gray-600">{cfg.subtitle}</p>
      </div>

      {/* Instruction card */}
      <div className="rounded-3xl p-6 text-left w-full shadow-lg" style={{ background: cfg.cardAccentBg, border: `3px solid ${cfg.cardAccent}44` }}>
        <div className="flex items-start gap-4">
          <span style={{ color: cfg.cardAccent, flexShrink: 0 }}><BrainIcon size={42} /></span>
          <p className="text-base text-gray-700 leading-relaxed font-semibold">{cfg.instruction}</p>
        </div>
        <p className="mt-3 text-sm text-gray-500 pl-14 font-medium">{cfg.warmUpNote}</p>
      </div>

      {/* Level 2 color-match callout */}
      {isLevel2 && (
        <motion.div
          className="w-full rounded-2xl p-3 flex items-center gap-3"
          style={{ background: "#FFF7ED", border: "2px solid #FED7AA" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <div className="flex gap-2 flex-shrink-0">
            <ShapeIcon shapeId="circle" color="#FB923C" size={44} />
            <ShapeIcon shapeId="circle" color="#FB923C" size={44} />
          </div>
          <p className="text-sm text-orange-800 font-semibold leading-snug">
            දෙවන මට්ටමේදී හැඩය <em>සහ</em> වර්ණය — දෙකම ගැළපිය යුතුයි!
          </p>
        </motion.div>
      )}

      {/* Visual step guide */}
      <div className="flex gap-2 items-center w-full justify-center">
        {Array.from({ length: cfg.n + 1 }, (_, i) => {
          const isQuestion = i === cfg.n;
          const sh = shapePool[i % shapePool.length];
          const co = cfg.colorPool[i % cfg.colorPool.length].hex;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="rounded-xl p-2"
                  style={{
                    background: isQuestion ? cfg.cardAccentBg : "rgba(255,255,255,0.7)",
                    border: isQuestion ? `2px solid ${cfg.cardAccent}` : "1.5px solid #E5E7EB",
                  }}
                >
                  <ShapeIcon shapeId={sh} color={isQuestion ? cfg.cardAccent : co} size={56} />
                </div>
                <span className="text-sm text-gray-500 font-semibold">
                  {isQuestion ? "?" : i === 0 ? "1 වැනි" : `${i + 1} වැනි`}
                </span>
              </div>
              {i < cfg.n && (
                <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        onClick={onStart}
        className="w-full py-6 rounded-3xl text-white text-3xl font-extrabold shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${cfg.cardAccent}, ${cfg.cardAccent}cc)` }}
      >
        ක්‍රීඩා කරමු!
      </motion.button>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  GAME SCREEN
// ─────────────────────────────────────────────

const GameScreen = ({
  cfg, index, totalTrials, sequence, phase, feedback,
  onYes, onNo,
}) => {
  const current  = sequence[index] || null;
  const nBack    = index >= cfg.n ? sequence[index - cfg.n] : null;
  const isWarmUp = current && !current.answerable;

  const answerable = phase === "responding";
  const showing    = phase === "showing";

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto gap-5 pt-3 pb-8">

      {/* TOP: trial progress */}
      <div className="w-full flex flex-col items-center gap-2">
        <TrialDots total={totalTrials} current={index} />
        <p className="text-base text-gray-600 font-bold">
          {isWarmUp
            ? cfg.watchLabel
            : cfg.questionLabel(index - cfg.n + 1, totalTrials - cfg.n)}
        </p>
      </div>

      {/* STIMULUS CARD */}
      <div className="relative w-full">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-sm shadow-2xl border-2 border-white/70 flex flex-col items-center px-8 py-10 gap-6"
          layout
        >
          {/* Phase label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isWarmUp ? "warmup" : answerable ? "respond" : "show"}
              className="text-xl font-extrabold tracking-wide uppercase"
              style={{ color: cfg.cardAccent }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              {isWarmUp ? cfg.watchLabel : answerable ? cfg.promptText : cfg.thinkLabel}
            </motion.p>
          </AnimatePresence>

          {/* Main shape with entrance animation */}
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={`${index}-shape`}
                initial={{ scale: 0.4, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.3, opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="relative"
              >
                {/* Pulsing ring behind shape */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: current.color.hex + "22", margin: "-28px" }}
                  animate={showing ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <ShapeIcon shapeId={current.shapeId} color={current.color.hex} size={200} glowing={showing} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Friendly timer bar — only while showing */}
          {showing && (
            <div className="w-full px-2">
              <FriendlyTimerBar
                durationMs={cfg.showMs}
                running={showing}
                color={cfg.cardAccent}
                label={cfg.memoriseLabel}
              />
            </div>
          )}

          {/* N-back reference thumbnail (shown during responding) */}
          {answerable && nBack && (
            <motion.div
              className="flex flex-col items-center gap-2 px-6 py-4 rounded-3xl"
              style={{ background: cfg.cardAccentBg, border: `2px solid ${cfg.cardAccent}44` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-base font-bold" style={{ color: cfg.cardAccent }}>
                {cfg.matchHint}
              </p>
              {/* Level 2: show nBack shape with its original colour */}
              <ShapeIcon shapeId={nBack.shapeId} color={nBack.color.hex} size={48} glowing={cfg.matchMode === "shape+color"} />
              {cfg.matchMode === "shape+color" && (
                <p className="text-[10px] text-gray-500 font-medium">හැඩය + වර්ණය දෙකම!</p>
              )}
            </motion.div>
          )}

          {/* Friendly timer bar — during responding */}
          {answerable && (
            <div className="w-full px-2">
              <FriendlyTimerBar
                durationMs={cfg.responseMs}
                running={answerable}
                color="#F59E0B"
                label={cfg.answerLabel}
              />
            </div>
          )}

          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && <FeedbackOverlay key="fb" type={feedback} />}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* YES / NO BUTTONS */}
      <AnimatePresence>
        {answerable && (
          <motion.div
            className="flex gap-4 w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* YES */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              onClick={onYes}
              className="flex-1 flex flex-col items-center justify-center gap-3 py-8 rounded-3xl text-white font-extrabold text-2xl shadow-xl border-b-[6px]"
              style={{ background: "#22C55E", borderColor: "#15803D" }}
              aria-label="Yes, same shape"
            >
              <CheckIcon size={52} color="white" />
              <span>ඔව්!</span>
              <span className="text-sm font-semibold opacity-90">එකම හැඩය</span>
            </motion.button>

            {/* NO */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              onClick={onNo}
              className="flex-1 flex flex-col items-center justify-center gap-3 py-8 rounded-3xl text-white font-extrabold text-2xl shadow-xl border-b-[6px]"
              style={{ background: "#EF4444", borderColor: "#B91C1C" }}
              aria-label="No, different shape"
            >
              <CrossIcon size={52} color="white" />
              <span>නෑ!</span>
              <span className="text-sm font-semibold opacity-90">වෙනස් හැඩය</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
//  COMPLETE SCREEN
// ─────────────────────────────────────────────

const CompleteScreen = ({ score, stars, accuracy, level, cfg, onReplay, onContinue }) => {
  const messages = [
    { min: 85, text: "අපූරුයි!",          sub: "ඔබේ මතකය ඉතාම ශක්තිමත්!",       color: "text-emerald-700", bg: "from-emerald-50 to-teal-50" },
    { min: 60, text: "නියමයි!",            sub: "ඔබ ඉතා හොඳින් ඉගෙනගනිනවා!",    color: "text-sky-700",     bg: "from-sky-50 to-blue-50" },
    { min: 35, text: "හොඳ උත්සාහයක්!",   sub: "නැවත නැවත කරන්න — දිනෙන් දින දිනෙන් ශ්‍රේෂ්ඨ!", color: "text-amber-700", bg: "from-amber-50 to-yellow-50" },
    { min: 0,  text: "එළිය ගෙනෙන්න!",    sub: "සෑම උත්සාහයක්ම ඔබව ලොකු කරවයි!", color: "text-rose-700",   bg: "from-rose-50 to-pink-50" },
  ];
  const msg = messages.find(m => accuracy >= m.min) || messages[messages.length - 1];

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen w-full max-w-sm mx-auto text-center gap-5 px-3 py-8"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 220 }}
    >
      {/* Trophy */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <TrophyIcon size={110} color={stars >= 2 ? "#F59E0B" : "#9CA3AF"} />
      </motion.div>

      {/* Title */}
      <div>
        <h2 className={`text-5xl font-extrabold ${msg.color}`}>{msg.text}</h2>
        <p className="mt-2 text-lg text-gray-600 font-semibold">{msg.sub}</p>
      </div>

      {/* Stars */}
      <StarRow count={stars} />

      {/* Score card */}
      <div className={`w-full rounded-2xl bg-gradient-to-br ${msg.bg} border border-gray-100 shadow-md p-5`}>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-4xl font-extrabold text-gray-800">{score.correct}</p>
            <p className="text-sm text-gray-500 mt-1 font-semibold">නිවැරදි</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-gray-800">{score.answered}</p>
            <p className="text-sm text-gray-500 mt-1 font-semibold">උත්තර</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-gray-800">{accuracy}%</p>
            <p className="text-sm text-gray-500 mt-1 font-semibold">නිරවද්‍යතාව</p>
          </div>
        </div>

        {/* Accuracy bar */}
        <div className="mt-4">
          <div className="h-5 w-full rounded-full bg-white/60 overflow-hidden">
            <motion.div
              className="h-5 rounded-full"
              style={{ background: `linear-gradient(90deg, ${cfg.cardAccent}, ${cfg.cardAccent}99)` }}
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Performance breakdown */}
      <div className="w-full rounded-2xl bg-white/75 border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">ප්‍රතිඵලය</p>
        <div className="flex items-center justify-between text-base">
          <span className="text-gray-600 font-semibold">{cfg.label} — {cfg.title}</span>
          <span className={`text-lg font-extrabold ${msg.color}`}>{stars} / 3 තරු</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onReplay}
          className="flex-1 py-5 rounded-3xl border-2 font-bold text-gray-700 bg-white/80 text-lg"
          style={{ borderColor: cfg.cardAccent + "55" }}
        >
          නැවත උත්සාහ කරන්න
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.03 }}
          onClick={onContinue}
          className="flex-1 py-5 rounded-3xl text-white font-extrabold shadow-xl text-lg"
          style={{ background: `linear-gradient(135deg, ${cfg.cardAccent}, ${cfg.cardAccent}cc)` }}
        >
          ඉදිරියට
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
//  MAIN GAME COMPONENT
// ─────────────────────────────────────────────

const NBackGame = ({ level = 1, onComplete }) => {
  const cfg = LEVELS[level] || LEVELS[1];
  const { completeLevel } = useProgress() || {};

  // ── state ──────────────────────────────────
  const [phase,    setPhase]    = useState("intro");   // intro | showing | responding | complete
  const [sequence, setSequence] = useState([]);
  const [index,    setIndex]    = useState(0);
  const [feedback, setFeedback] = useState(null);      // null | "correct" | "wrong" | "timeout"
  const [score,    setScore]    = useState({ correct: 0, answered: 0 });

  const timersRef       = useRef([]);
  const respondedRef    = useRef(false);

  // ── helpers ────────────────────────────────
  const clearAllTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timersRef.current.push(id); return id; };

  useEffect(() => () => clearAllTimers(), []);

  // ── advance to next trial ──────────────────
  const advance = useCallback((curIdx, seq) => {
    const nextIdx = curIdx + 1;
    if (nextIdx >= seq.length) {
      setPhase("complete");
    } else {
      setIndex(nextIdx);
      setFeedback(null);
      respondedRef.current = false;
      setPhase("showing");
    }
  }, []);

  // ── showing phase — show stimulus then enter responding (or skip warm-up) ──
  useEffect(() => {
    if (phase !== "showing" || !sequence.length || index >= sequence.length) return;
    clearAllTimers();
    respondedRef.current = false;
    setFeedback(null);

    const item = sequence[index];

    if (!item.answerable) {
      // warm-up item: just show for showMs then advance
      later(() => advance(index, sequence), cfg.showMs);
    } else {
      // real trial: show then flip to responding
      later(() => {
        setPhase("responding");
        // timeout if child doesn't answer
        later(() => {
          if (!respondedRef.current) {
            respondedRef.current = true;
            setFeedback("timeout");
            setScore(prev => ({ ...prev, answered: prev.answered + 1 }));
            playTone("wrong");
            later(() => advance(index, sequence), 1000);
          }
        }, cfg.responseMs);
      }, cfg.showMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, sequence]);

  // ── handle YES / NO response ───────────────
  const handleResponse = useCallback((answer) => {
    if (phase !== "responding" || respondedRef.current) return;
    respondedRef.current = true;
    clearAllTimers();

    const item = sequence[index];
    const correct = (answer === "yes") === item.isMatch;

    setFeedback(correct ? "correct" : "wrong");
    setScore(prev => ({
      correct:  prev.correct  + (correct ? 1 : 0),
      answered: prev.answered + 1,
    }));
    playTone(correct ? "correct" : "wrong");
    later(() => advance(index, sequence), 1050);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, sequence, advance]);

  // ── complete phase ─────────────────────────
  useEffect(() => {
    if (phase !== "complete") return;
    const acc = score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0;
    if (acc >= 50) {
      setTimeout(() => confetti({ particleCount: 130, spread: 130, origin: { y: 0.5 } }), 350);
    }
    try { completeLevel?.("n-back", level, { accuracy: acc, correct: score.correct, total: score.answered }); } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── start / restart game ───────────────────
  const startGame = useCallback(() => {
    clearAllTimers();
    const seq = generateSequence(cfg);
    respondedRef.current = false;
    setSequence(seq);
    setIndex(0);
    setScore({ correct: 0, answered: 0 });
    setFeedback(null);
    setPhase("showing");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  // ── derived values ─────────────────────────
  const accuracy = score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0;
  const stars     = accuracy >= 85 ? 3 : accuracy >= 55 ? 2 : accuracy >= 30 ? 1 : 0;

  return (
    <div className="relative min-h-screen overflow-hidden select-none">
      <AnimatedBackground level={level} />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4">

        <AnimatePresence mode="wait">

          {/* ─── INTRO ─── */}
          {phase === "intro" && (
            <IntroScreen key="intro" cfg={cfg} level={level} onStart={startGame} />
          )}

          {/* ─── GAME ─── */}
          {(phase === "showing" || phase === "responding") && (
            <motion.div
              key="game"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameScreen
                cfg={cfg}
                index={index}
                totalTrials={cfg.totalTrials}
                sequence={sequence}
                phase={feedback ? "feedback" : phase}
                feedback={feedback}
                onYes={() => handleResponse("yes")}
                onNo={()  => handleResponse("no")}
              />
            </motion.div>
          )}

          {/* ─── COMPLETE ─── */}
          {phase === "complete" && (
            <CompleteScreen
              key="complete"
              score={score}
              stars={stars}
              accuracy={accuracy}
              level={level}
              cfg={cfg}
              onReplay={startGame}
              onContinue={() => { if (onComplete) onComplete(); }}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default NBackGame;
