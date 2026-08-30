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
import { adaptNBackConfig } from "../utils/adaptiveDifficulty";
import { AnimatedSeaBg as SequenceRecallSeaBg } from "./SequenceRecallGame";
import nBackAudio1 from "../assets/1back.mp3";
import nBackAudio2 from "../assets/2back.mp3";
import nBackFishLevelBoard from "../assets/nback-fish-level-board-generated.png";
import nBackMemoryTimerSimple from "../assets/nback-memory-timer-simple.png";
import useResponsive from '../hooks/useResponsive';
import { awardStar } from "../components/StarRewardSystem";

const NBACK_AUDIOS = { 1: nBackAudio1, 2: nBackAudio2 };

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
    showMs:        6000,       // slow, child-friendly memory-view time
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
    showMs:        6000,       // slow, child-friendly memory-view time
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
    setTimeout(() => { try { osc.stop(); ctx.close(); } catch { /* ignore */ } }, 500);
  } catch { /* audio not available */ }
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

export const AnimatedBackground = ({ level }) => {
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

const FriendlyTimerBar = ({ durationMs, running, color = "#0284C7", label = "", shapeId, shapeColor }) => {
  const [pct, setPct] = useState(0);   // 0→100 fill (fills up, not drains)
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  const { isMobile } = useResponsive();

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
    <div className="flex w-full flex-col items-center gap-1.5">
      {label && <p className="text-base font-extrabold" style={{ color }}>{label}</p>}
      <div
        className="relative w-full max-w-2xl overflow-hidden"
        style={{
          height:isMobile ? 104 : 158,
          borderRadius:26,
          filter:"drop-shadow(0 10px 18px rgba(14,116,144,.2))",
        }}
      >
        <img src={nBackMemoryTimerSimple} alt="" aria-hidden="true"
          style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"fill",pointerEvents:"none" }}/>

        <div aria-hidden="true" style={{ position:"absolute",left:"13%",right:"17%",top:"52%",height:isMobile ? 5 : 7,transform:"translateY(-50%)",borderRadius:999,background:"rgba(255,255,255,.24)",overflow:"hidden",zIndex:3 }}>
          <motion.div style={{ width:`${pct}%`,height:"100%",borderRadius:999,background:"linear-gradient(90deg,#6EE7F9,#C4B5FD,#FDE68A)",boxShadow:"0 0 10px rgba(255,255,255,.9)",transition:"width .1s linear" }}/>
        </div>

        <motion.div
          style={{
            position:"absolute",top:isMobile ? 31 : 54,
            left:`calc(${12+Math.min(66,pct*0.66)}% - ${isMobile ? 20 : 25}px)`,
            width:isMobile ? 40 : 50,height:isMobile ? 40 : 50,zIndex:10,
            transition:"left 0.1s linear",
            borderRadius:"50%",background:"rgba(255,255,255,.94)",border:`3px solid ${shapeColor ?? color}`,
            display:"grid",placeItems:"center",boxShadow:`0 0 0 5px rgba(255,255,255,.3),0 7px 16px ${color}66`,
          }}
          animate={{ y:[-4,4,-4],rotate:[-4,4,-4],scale:[1,1.05,1] }} transition={{ duration:.8,repeat:Infinity,ease:"easeInOut" }}
        >
          <ShapeIcon shapeId={shapeId ?? "circle"} color={shapeColor ?? color} size={isMobile ? 24 : 31}/>
        </motion.div>
      </div>
      <p className="m-0 text-xs font-black" style={{ color }}>හැඩය මතකයට යනවා...</p>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TRIAL DOTS PROGRESS BAR
// ─────────────────────────────────────────────

const TrialDots = ({ total, current }) => (
  <div className="flex gap-2 flex-wrap justify-center max-w-xs">
    {Array.from({ length: total }, (_, i) => {
      const done    = i < current;
      const active  = i === current;
      return (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: active ? 32 : 20,
            height: active ? 32 : 20,
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

const IntroScreen = ({ cfg, level, onStart, onVoiceInstruction, voicePlaying }) => {
  const { isMobile } = useResponsive();
  const isLevel2 = Number(level) === 2;
  const demoItems = isLevel2
    ? [
        { shape: "circle", color: "#FB923C", label: "1" },
        { shape: "square", color: "#8B5CF6", label: "2" },
        { shape: "circle", color: "#FB923C", label: "?" },
      ]
    : [
        { shape: "circle", color: "#38BDF8", label: "1" },
        { shape: "circle", color: "#F472B6", label: "?" },
      ];

  return (
    <motion.main
      className="flex w-full items-center justify-center px-2 py-3"
      style={{ minHeight: "calc(100dvh - 104px)" }}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45 }}
    >
      <motion.section
        className="relative grid w-full overflow-hidden rounded-[2rem] border-[3px] border-white/80 bg-white/95 shadow-2xl"
        style={{
          maxWidth: 940,
          maxHeight: "calc(100dvh - 124px)",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(270px,.85fr) minmax(0,1.15fr)",
          padding: isMobile ? "12px 12px 78px" : 22,
          gap: isMobile ? 10 : 22,
          overflowY: "auto",
        }}
      >
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-3xl"
          style={{ minHeight: isMobile ? 230 : 440, background: `linear-gradient(160deg,${cfg.cardAccentBg},#FFFFFF)` }}>
          <motion.div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-base font-black shadow-md"
            style={{ color: cfg.cardAccent, border: `2px solid ${cfg.cardAccent}55` }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {cfg.label}
          </motion.div>

          <motion.div className="relative" style={{ width: isMobile ? 165 : 292, maxWidth: "88%", zIndex: 2 }}
            animate={{ y: [0, -6, 0], rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <img src={nBackFishLevelBoard} alt={`මාළු යාළුවා මට්ටම ${level} පුවරුව අල්ලාගෙන සිටී`}
              style={{ display: "block", width: "100%", height: "auto", objectFit: "contain", filter: "drop-shadow(0 14px 20px rgba(2,132,199,0.24))" }} />
            <div className="absolute flex flex-col items-center justify-center text-center"
              style={{ left: "13%", right: "13%", top: "49%", bottom: "12%" }}>
              <p className="m-0 font-black text-slate-500" style={{ fontSize: isMobile ? 9 : 14 }}>මතක සෙල්ලම</p>
              <p className="m-0 font-black leading-none" style={{ color: cfg.cardAccent, fontSize: isMobile ? 36 : 62 }}>{level}</p>
              <p className="mt-1 font-extrabold leading-tight text-slate-700" style={{ fontSize: isMobile ? 9 : 14 }}>
                {isLevel2 ? "දෙකකට කලින් එක" : "කලින් එක"}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex min-w-0 flex-col justify-center text-center" style={{ gap: isMobile ? 8 : 12 }}>
          <div>
            <h1 className="m-0 font-black tracking-tight text-slate-800" style={{ fontSize: isMobile ? 25 : 38 }}>කලින් දැක්ක එකමද?</h1>
            <p className="mt-1 font-bold text-slate-600" style={{ fontSize: isMobile ? 13 : 17 }}>
              {isLevel2 ? 'හැඩයයි පාටයි මතක තියාගමු' : 'හැඩය බලලා මතක තියාගමු'}
            </p>
            <button
              type="button"
              onClick={onVoiceInstruction}
              aria-label={voicePlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}
              className="mx-auto mt-3 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-sky-200 bg-sky-50 px-5 py-2.5 font-black text-sky-700 shadow-md transition hover:scale-[1.03] hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <span className="text-2xl leading-none" aria-hidden="true">{voicePlaying ? "⏹" : "🔊"}</span>
              <span>{voicePlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}</span>
            </button>
          </div>

          <div className="rounded-2xl px-4 py-3 text-left" style={{ background: cfg.cardAccentBg, border: `2px solid ${cfg.cardAccent}55` }}>
            <div className="flex items-center gap-3">
              <span style={{ color: cfg.cardAccent, flexShrink: 0 }}><BrainIcon size={isMobile ? 30 : 38} /></span>
              <p className="m-0 font-extrabold leading-snug text-slate-700" style={{ fontSize: isMobile ? 13 : 15 }}>
                {isLevel2
                  ? 'දැන් පේන රූපය, රූප දෙකකට කලින් දැක්ක එකමද බලන්න. හැඩයයි පාටයි දෙකම එකම නම් “ඔව්” තෝරන්න.'
                  : 'දැන් පේන හැඩය කලින් දැක්ක හැඩයම නම් “ඔව්”. වෙනස් නම් “නැහැ” තෝරන්න.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 p-3" style={{ border: "2px solid #E2E8F0" }}>
            {demoItems.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                <motion.div className="flex flex-col items-center gap-1" initial={{ opacity: 0, scale: .75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 * index }}>
                  <div className="grid place-items-center rounded-xl bg-white" style={{ width: isMobile ? 52 : 68, height: isMobile ? 52 : 68, border: index === demoItems.length - 1 ? `3px dashed ${cfg.cardAccent}` : "2px solid #CBD5E1" }}>
                    <ShapeIcon shapeId={item.shape} color={item.color} size={isMobile ? 35 : 48} />
                  </div>
                  <span className="text-xs font-black text-slate-500">{item.label}</span>
                </motion.div>
                {index < demoItems.length - 1 && <span className="text-2xl font-black text-slate-400">›</span>}
              </React.Fragment>
            ))}
            <span className="ml-1 rounded-full px-3 py-2 text-sm font-black" style={{ color: "#047857", background: "#D1FAE5" }}>
              {isLevel2 ? 'පළමු එකමයි — ඔව්!' : 'හැඩය එකමයි — ඔව්!'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-black text-slate-700">
            <div className="rounded-xl bg-sky-100 p-2">1. රූපය බලන්න</div>
            <div className="rounded-xl bg-violet-100 p-2">2. කලින් එක මතකද?</div>
            <div className="rounded-xl bg-emerald-100 p-2">3. ඔව් / නැහැ තෝරන්න</div>
          </div>

          <motion.button type="button" whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.03 }} onClick={onStart}
            className="rounded-full border-0 py-4 text-xl font-black text-white shadow-xl"
            style={{ position: isMobile ? "fixed" : "static", left: isMobile ? 20 : "auto", right: isMobile ? 20 : "auto", bottom: isMobile ? 14 : "auto", zIndex: 40, background: `linear-gradient(135deg,${cfg.cardAccent},#7C3AED)` }}>
            හරි, පටන් ගමු!
          </motion.button>
        </div>
      </motion.section>
    </motion.main>
  );
};

// ─────────────────────────────────────────────
//  GAME SCREEN
// ─────────────────────────────────────────────

const GameScreen = ({
  cfg, index, totalTrials, sequence, phase, feedback,
  onYes, onNo, hintVisible,
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
        <p className="text-xl text-gray-600 font-bold">
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
              className="text-3xl font-extrabold tracking-wide uppercase"
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
                shapeId={current.shapeId}
                shapeColor={current.color.hex}
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

          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && <FeedbackOverlay key="fb" type={feedback} />}
          </AnimatePresence>

          {/* Hint banner — shown after 4 wrong answers */}
          <AnimatePresence>
            {hintVisible && (
              <motion.div key="nback-hint" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="w-full rounded-2xl px-5 py-4 flex items-center gap-3 mx-2"
                style={{ background:"#FEF9C3", border:"2px solid #FDE047" }}>
                <span style={{ fontSize:28 }}>💡</span>
                <div>
                  <p className="text-base font-extrabold text-yellow-800">ඉඟිය: කලින් රූපය මතක තියාගන්න!</p>
                  <p className="text-sm font-semibold text-yellow-700 mt-1">
                    අලුත් රූපය පෙනුණාම, කලින් එකත් එක්ක සසඳන්න.
                  </p>
                </div>
              </motion.div>
            )}
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
              className="flex-1 flex flex-col items-center justify-center gap-4 py-10 rounded-3xl text-white font-extrabold text-4xl shadow-xl border-b-[6px]"
              style={{ background: "#22C55E", borderColor: "#15803D" }}
              aria-label="Yes, same shape"
            >
              <CheckIcon size={88} color="white" />
              <span>ඔව්!</span>
              <span className="text-xl font-bold opacity-90">එකම හැඩය</span>
            </motion.button>

            {/* NO */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              onClick={onNo}
              className="flex-1 flex flex-col items-center justify-center gap-4 py-10 rounded-3xl text-white font-extrabold text-4xl shadow-xl border-b-[6px]"
              style={{ background: "#EF4444", borderColor: "#B91C1C" }}
              aria-label="No, different shape"
            >
              <CrossIcon size={88} color="white" />
              <span>නෑ!</span>
              <span className="text-xl font-bold opacity-90">වෙනස් හැඩය</span>
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

const CompleteScreen = ({ score, stars, accuracy, cfg, onReplay, onContinue }) => {
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
  const { initializeGame, completeLevel, updateLevelProgress, getAdaptiveProfile, recordAdaptiveResult } = useProgress() || {};
  const baseCfg = LEVELS[level] || LEVELS[1];
  const cfg = adaptNBackConfig(baseCfg, getAdaptiveProfile?.("n-back"));

  // ── state ──────────────────────────────────
  const [phase,    setPhase]    = useState("intro");   // intro | showing | responding | complete
  const [sequence, setSequence] = useState([]);
  const [index,    setIndex]    = useState(0);
  const [feedback, setFeedback] = useState(null);      // null | "correct" | "wrong" | "timeout"
  const [score,    setScore]    = useState({ correct: 0, answered: 0 });
  const [hintVisible, setHintVisible] = useState(false);
  const wrongCountRef = useRef(0);
  const responseStartedAtRef = useRef(null);
  const responseTimesRef = useRef([]);

  const timersRef       = useRef([]);
  const respondedRef    = useRef(false);

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

  // ── helpers ────────────────────────────────
  const clearAllTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timersRef.current.push(id); return id; };

  useEffect(() => () => clearAllTimers(), []);

  useEffect(() => {
    initializeGame?.("n-back");
  }, [initializeGame]);

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
        responseStartedAtRef.current = Date.now();
      }, cfg.showMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, sequence]);

  // ── handle YES / NO response ───────────────
  const handleResponse = useCallback((answer) => {
    if (phase !== "responding" || respondedRef.current) return;
    respondedRef.current = true;
    if (responseStartedAtRef.current) {
      responseTimesRef.current.push(Date.now() - responseStartedAtRef.current);
      responseStartedAtRef.current = null;
    }
    clearAllTimers();

    const item = sequence[index];
    const correct = (answer === "yes") === item.isMatch;

    setFeedback(correct ? "correct" : "wrong");
    setScore(prev => ({
      correct:  prev.correct  + (correct ? 1 : 0),
      answered: prev.answered + 1,
    }));
    if (correct) awardStar();
    if (!correct) {
      wrongCountRef.current += 1;
      if (wrongCountRef.current >= 4) setHintVisible(true);
    }
    playTone(correct ? "correct" : "wrong");
    later(() => advance(index, sequence), 1050);
  }, [phase, index, sequence, advance]);

  // ── complete phase ─────────────────────────
  useEffect(() => {
    if (phase !== "complete") return;
    const acc = score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0;
    // The game already treats 50% as the success threshold for celebration.
    // Use that same threshold for persistence and level unlocking.
    const passed = acc >= 50;
    const averageResponseMs = responseTimesRef.current.length > 0
      ? Math.round(
          responseTimesRef.current.reduce((sum, value) => sum + value, 0)
          / responseTimesRef.current.length
        )
      : null;
    const stats = {
      level: Number(level),
      accuracy: acc,
      correct: score.correct,
      total: score.answered,
      wrongAttempts: Math.max(score.answered - score.correct, 0),
      mistakes: Math.max(score.answered - score.correct, 0),
      totalAttempts: score.answered,
      averageResponseMs,
      targetResponseMs: cfg.responseMs,
      passed,
    };
    if (passed) {
      setTimeout(() => confetti({ particleCount: 130, spread: 130, origin: { y: 0.5 } }), 350);
    }
    try {
      // Record every attempt, but do not mark a failed attempt as a completed
      // level or unlock the next level.
      if (passed) {
        completeLevel?.("n-back", level, stats);
      }
      updateLevelProgress?.("n-back", level, acc, stats);
      recordAdaptiveResult?.("n-back", stats);
    } catch { /* ignore */ }
    onComplete?.({
      ...stats,
      level: Number(level),
      nextLevel: passed && Number(level) === 1 ? 2 : null,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── start / restart game ───────────────────
  const startGame = useCallback(() => {
    if (instrAudioRef.current) {
      instrAudioRef.current.pause();
      instrAudioRef.current.currentTime = 0;
    }
    setInstrPlaying(false);
    clearAllTimers();
    const seq = generateSequence(cfg);
    respondedRef.current = false;
    wrongCountRef.current = 0;
    responseStartedAtRef.current = null;
    responseTimesRef.current = [];
    setHintVisible(false);
    setSequence(seq);
    setIndex(0);
    setScore({ correct: 0, answered: 0 });
    setFeedback(null);
    setPhase("showing");
  }, [cfg]);

  // ── derived values ─────────────────────────
  const accuracy = score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0;
  const stars     = accuracy >= 85 ? 3 : accuracy >= 55 ? 2 : accuracy >= 30 ? 1 : 0;

  return (
    <div className="relative min-h-screen overflow-hidden select-none">
      <SequenceRecallSeaBg />

      {/* Voice instruction audio — level-specific */}
      <audio ref={instrAudioRef} src={NBACK_AUDIOS[level] ?? nBackAudio1} onEnded={() => setInstrPlaying(false)} />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4">

        <AnimatePresence mode="wait">

          {/* ─── INTRO ─── */}
          {phase === "intro" && (
            <IntroScreen
              key="intro"
              cfg={cfg}
              level={level}
              onStart={startGame}
              onVoiceInstruction={handleVoiceInstruction}
              voicePlaying={instrPlaying}
            />
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
                hintVisible={hintVisible}
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
              onContinue={() => { if (onComplete) onComplete({ accuracy, passed: accuracy >= 50 }); }}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default NBackGame;
