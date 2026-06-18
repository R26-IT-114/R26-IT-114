/**
 * SequenceRecallGame — 3 Levels
 * Child-friendly (ages 6-8)  |  Sea animated background  |  Sinhala UI
 *
 * Level 1 — Fruits   (seq 2, 4 rounds, 3000 ms/item)
 * Level 2 — Animals  (seq 3, 4 rounds, 2500 ms/item)
 * Level 3 — Vehicles (seq 4, 5 rounds, 2200 ms/item)
 *
 * Completion logic mirrors ColorMemoryGame:
 *   ජය ගත්තා! | correct/total | unlock badge | Next Level / Retry / Home
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";
import { adaptSequenceRecallConfig } from "../utils/adaptiveDifficulty";

// --- Assets ---
import imgApple      from "../assets/apple .png";
import imgBanana     from "../assets/banana.png";
import imgGrapes     from "../assets/grapes.png";
import imgStrawberry from "../assets/strawberry.png";
import imgOrange     from "../assets/orange.png";
import imgDog        from "../assets/dog.png";
import imgCat        from "../assets/cat.png";
import imgCow        from "../assets/cow.png";
import imgPig        from "../assets/pig.png";
import imgBunny      from "../assets/bunnyy.png";
import imgBird       from "../assets/bird.png";
import imgCar        from "../assets/car.png";
import imgBus        from "../assets/bus.png";
import imgTrain      from "../assets/train.png";
import imgFlight     from "../assets/flight.png";
import imgSeahorse   from "../assets/seahorse.png";
import imgDolphin    from "../assets/dolphin.png";
import imgMermaid    from "../assets/mermaid.png";
import imgPuffefish  from "../assets/puffefish.png";
import levelUpSound        from "../assets/level-up.mp3";
import instructionAudio1   from "../assets/piliwelamthkay1nd.mp3";
import instructionAudio2   from "../assets/piliwelamathka2nd.mp3";
import instructionAudio3   from "../assets/piliwelamathaka3rd.mp3";

const INSTRUCTION_AUDIOS = { 1: instructionAudio1, 2: instructionAudio2, 3: instructionAudio3 };

const playLevelUp = () => {
  try {
    const audio = new Audio(levelUpSound);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
};

const GAME_ID = "sequence-recall";

// --- Level config ---
const LEVELS = [
  {
    id: 1,
    name: "පළතුරු",
    difficulty: "පහසු",
    seqLen: 2,
    rounds: 4,
    passScore: 3,
    speedMs: 3000,
    accentColor: "#0284C7",
    bgGrad: "linear-gradient(135deg,#E0F2FE,#BAE6FD)",
    hint: "රූප 2ක් දිස්වෙනවා — ඒ අනුපිළිවෙලම ටිකෙ කරන්න!",
    mascot: imgDolphin,
    items: [
      { key: "apple",      label: "ඇපල්",       src: imgApple      },
      { key: "banana",     label: "කෙසෙල්",      src: imgBanana     },
      { key: "grapes",     label: "මිදි",        src: imgGrapes     },
      { key: "strawberry", label: "ස්ට්‍රෝබෙරි", src: imgStrawberry },
      { key: "orange",     label: "දොඩම්",       src: imgOrange     },
    ],
  },
  {
    id: 2,
    name: "සතුන්",
    difficulty: "මධ්‍යම",
    seqLen: 3,
    rounds: 4,
    passScore: 3,
    speedMs: 2500,
    accentColor: "#0D9488",
    bgGrad: "linear-gradient(135deg,#CCFBF1,#99F6E4)",
    hint: "රූප 3ක් දිස්වෙනවා — ඒ අනුපිළිවෙලම ටිකෙ කරන්න!",
    mascot: imgMermaid,
    items: [
      { key: "dog",   label: "බල්ලා",    src: imgDog   },
      { key: "cat",   label: "පූසා",     src: imgCat   },
      { key: "cow",   label: "ගවයා",     src: imgCow   },
      { key: "pig",   label: "ඌරා",      src: imgPig   },
      { key: "bunny", label: "හාවා",     src: imgBunny },
      { key: "bird",  label: "කුරුල්ලා", src: imgBird  },
    ],
  },
  {
    id: 3,
    name: "වාහන",
    difficulty: "අපහසු",
    seqLen: 4,
    rounds: 5,
    passScore: 4,
    speedMs: 2200,
    accentColor: "#7C3AED",
    bgGrad: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
    hint: "රූප 4ක් දිස්වෙනවා — ඒ අනුපිළිවෙලම ටිකෙ කරන්න!",
    mascot: imgSeahorse,
    items: [
      { key: "car",    label: "කාර්",       src: imgCar    },
      { key: "bus",    label: "බස්",         src: imgBus    },
      { key: "train",  label: "දුම්රිය",    src: imgTrain  },
      { key: "flight", label: "ගුවන් යානය", src: imgFlight },
    ],
  },
];

// --- Audio helpers ---
const speak = (text) => {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "si-LK";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};

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


// --- SVG Icons ---
const NextIcon   = ({ size = 20 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const RetryIcon  = ({ size = 20 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/></svg>;
const HomeIcon   = ({ size = 20 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const StarIcon   = ({ size = 28, filled = false }) => <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const TrophyIcon = ({ size = 64, color = "#F59E0B" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4.5A2.5 2.5 0 0 0 2 6.5v0A2.5 2.5 0 0 0 4.5 9H7"/><path d="M17 4h2.5A2.5 2.5 0 0 1 22 6.5v0A2.5 2.5 0 0 1 19.5 9H17"/><rect x="7" y="2" width="10" height="11" rx="2"/></svg>;
const SmileIcon  = ({ size = 64, color = "#F97316" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3.5"/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3.5"/></svg>;
const UnlockIcon = ({ size = 18, color = "#2563EB" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
const EyeIcon    = ({ size = 18 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

// --- Sea Background ---
const FishSVG = ({ size = 52, color = "#0EA5E9", flip = false }) => (
  <svg viewBox="0 0 80 48" width={size} height={size * 0.6} style={{ transform: flip ? "scaleX(-1)" : "none" }} aria-hidden="true">
    <ellipse cx="46" cy="24" rx="26" ry="16" fill={color}/>
    <polygon points="20,24 4,8 4,40" fill={color} opacity="0.85"/>
    <circle cx="62" cy="17" r="5" fill="white"/>
    <circle cx="63" cy="17" r="2.5" fill="#0C4A6E"/>
  </svg>
);
const JellyfishSVG = ({ size = 46, color = "#C084FC" }) => {
  const tx = [8,16,24,32,40,48];
  return (
    <svg viewBox="0 0 60 90" width={size} height={size*1.5} aria-hidden="true" overflow="visible">
      <ellipse cx="30" cy="28" rx="26" ry="10" fill={color} opacity="0.25"/>
      <path d="M4 30 Q4 2 30 2 Q56 2 56 30 Z" fill={color} opacity="0.80"/>
      <path d="M14 25 Q18 8 30 6 Q42 8 46 25" fill="white" opacity="0.18"/>
      {tx.map((x,i)=>(
        <motion.path key={i}
          d={`M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`}
          stroke={color} strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round"
          animate={{ d:[
            `M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`,
            `M${x} 30 Q${x+(i%2===0?7:-7)} 52 ${x} 70 Q${x+(i%2===0?-6:6)} 82 ${x} 90`,
            `M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`,
          ]}}
          transition={{ duration:1.2+i*0.15, delay:i*0.1, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}
    </svg>
  );
};
const SeaweedSVG  = ({ size=56, color="#34D399" }) => (
  <svg viewBox="0 0 30 80" width={size*0.4} height={size} aria-hidden="true">
    <path d="M15 80 Q8 60 15 45 Q22 30 15 15 Q10 5 15 0" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M15 60 Q5 55 8 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M15 35 Q25 30 22 20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
  </svg>
);
const StarfishSVG = ({ size=36, color="#FB923C" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    {[0,72,144,216,288].map((angle,i) => {
      const r=(angle*Math.PI)/180;
      return <line key={i} x1="40" y1="40" x2={40+36*Math.cos(r)} y2={40+36*Math.sin(r)} stroke={color} strokeWidth="9" strokeLinecap="round"/>;
    })}
    <circle cx="40" cy="40" r="10" fill={color}/>
    <circle cx="40" cy="40" r="5" fill="white" opacity="0.4"/>
  </svg>
);
const ShellSVG   = ({ size=30, color="#F9A8D4" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    <path d="M40 40 m0,-30 a30,30 0 1,1 0,60 a20,20 0 1,0 0,-40 a10,10 0 1,1 0,20" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9"/>
    <circle cx="40" cy="40" r="5" fill={color} opacity="0.9"/>
    <circle cx="40" cy="40" r="2" fill="white" opacity="0.6"/>
  </svg>
);
const BubbleSVG  = ({ size=16 }) => (
  <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
    <circle cx="15" cy="15" r="13" fill="#93C5FD" opacity="0.35"/>
    <circle cx="15" cy="15" r="13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="9" cy="9" r="4" fill="white" opacity="0.4"/>
  </svg>
);
const WaveStrip  = ({ y, opacity, color, duration }) => (
  <motion.div className="absolute w-full pointer-events-none" style={{ bottom:`${y}%`, opacity, height:28 }}
    animate={{ x:[0,-60,0] }} transition={{ duration, repeat:Infinity, ease:"linear" }}>
    <svg viewBox="0 0 400 28" width="400%" height="28" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 14 Q50 0 100 14 Q150 28 200 14 Q250 0 300 14 Q350 28 400 14 L400 28 L0 28 Z" fill={color}/>
    </svg>
  </motion.div>
);

const SEA_CREATURES = [
  { type:"fish",      x:-10, y:25, size:62, color:"#0EA5E9", delay:0,   dur:13, flip:false, opacity:0.70, driftX:"115%",  driftY:["0%","4%","-4%","0%"] },
  { type:"fish",      x:-10, y:55, size:46, color:"#FB923C", delay:4,   dur:16, flip:false, opacity:0.65, driftX:"115%",  driftY:["0%","-5%","5%","0%"] },
  { type:"fish",      x:110, y:18, size:54, color:"#A78BFA", delay:7,   dur:14, flip:true,  opacity:0.65, driftX:"-115%", driftY:["0%","3%","-3%","0%"] },
  { type:"fish",      x:110, y:65, size:40, color:"#34D399", delay:2,   dur:18, flip:true,  opacity:0.60, driftX:"-115%", driftY:["0%","-4%","4%","0%"] },
  { type:"fish",      x:-10, y:40, size:36, color:"#F472B6", delay:10,  dur:20, flip:false, opacity:0.55, driftX:"115%",  driftY:["0%","6%","-6%","0%"] },
  { type:"jellyfish", x:8,   y:50, size:50, color:"#C084FC", delay:0,   dur:8  },
  { type:"jellyfish", x:76,  y:44, size:40, color:"#F9A8D4", delay:3.5, dur:10 },
  { type:"jellyfish", x:44,  y:58, size:34, color:"#818CF8", delay:6,   dur:9  },
  { type:"seaweed",   x:3,   y:62, size:72, color:"#34D399", delay:0,   dur:3.0 },
  { type:"seaweed",   x:18,  y:66, size:56, color:"#4ADE80", delay:0.8, dur:3.8 },
  { type:"seaweed",   x:64,  y:64, size:62, color:"#34D399", delay:1.5, dur:3.2 },
  { type:"seaweed",   x:88,  y:67, size:52, color:"#4ADE80", delay:0.3, dur:4.0 },
  { type:"starfish",  x:34,  y:80, size:38, color:"#FB923C", delay:0,   dur:4  },
  { type:"starfish",  x:58,  y:83, size:30, color:"#F87171", delay:1.5, dur:5  },
  { type:"shell",     x:46,  y:83, size:32, color:"#F9A8D4", delay:0,   dur:0.4 },
  { type:"shell",     x:78,  y:80, size:26, color:"#FDE68A", delay:0.2, dur:0.5 },
  { type:"shell",     x:26,  y:84, size:24, color:"#86EFAC", delay:0.1, dur:0.45 },
];
const BUBBLES = [
  { x:10, size:16, delay:0,   dur:7   },
  { x:28, size:12, delay:1.5, dur:9   },
  { x:50, size:18, delay:0.5, dur:8   },
  { x:66, size:14, delay:2.5, dur:10  },
  { x:84, size:11, delay:1,   dur:7.5 },
  { x:38, size:10, delay:3.5, dur:11  },
];

const SeaCreature = ({ item }) => {
  if (item.type==="fish") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity??0.65 }}
      animate={{ x:item.driftX,y:item.driftY }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"linear",times:[0,0.33,0.66,1] }}>
      <motion.div animate={{ rotate:[-3,3,-3] }} transition={{ duration:0.5,repeat:Infinity,ease:"easeInOut" }}>
        <FishSVG size={item.size} color={item.color} flip={item.flip}/>
      </motion.div>
    </motion.div>
  );
  if (item.type==="jellyfish") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity??0.65 }}
      animate={{ y:["0%","-22%","0%"],x:["0%","4%","-4%","0%"] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <JellyfishSVG size={item.size} color={item.color}/>
    </motion.div>
  );
  if (item.type==="seaweed") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity??0.65,transformOrigin:"50% 100%" }}
      animate={{ rotate:[-14,14,-14] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <SeaweedSVG size={item.size} color={item.color}/>
    </motion.div>
  );
  if (item.type==="starfish") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity??0.65 }}
      animate={{ rotate:[0,15,-15,8,-8,0],scale:[1,1.1,1] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <StarfishSVG size={item.size} color={item.color}/>
    </motion.div>
  );
  if (item.type==="shell") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity??0.65 }}
      animate={{ rotate:[-12,12,-12],x:[-3,3,-3] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <ShellSVG size={item.size} color={item.color}/>
    </motion.div>
  );
  return null;
};

const AnimatedSeaBg = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
    <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,#bae6fd 0%,#7dd3fc 28%,#38bdf8 58%,#0ea5e9 100%)" }}/>
    <motion.div className="absolute top-[-60px] left-1/2 -translate-x-1/2 rounded-full"
      style={{ width:400,height:400,background:"radial-gradient(circle,rgba(255,255,200,0.15) 0%,transparent 70%)" }}
      animate={{ scale:[1,1.07,1],opacity:[0.6,1,0.6] }} transition={{ duration:4,repeat:Infinity,ease:"easeInOut" }}/>
    {SEA_CREATURES.map((item,i) => <SeaCreature key={i} item={item}/>)}
    {BUBBLES.map((b,i) => (
      <motion.div key={i} className="absolute pointer-events-none" style={{ left:`${b.x}%`,bottom:"4%" }}
        animate={{ y:[0,-600],opacity:[0,0.65,0.45,0] }}
        transition={{ duration:b.dur,delay:b.delay,repeat:Infinity,ease:"easeOut" }}>
        <BubbleSVG size={b.size}/>
      </motion.div>
    ))}
    <WaveStrip y={8} opacity={0.18} color="#0284C7" duration={8}/>
    <WaveStrip y={4} opacity={0.12} color="#0369A1" duration={12}/>
    <WaveStrip y={0} opacity={0.20} color="#075985" duration={6}/>
    <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background:"linear-gradient(0deg,#92400E33,transparent)" }}/>
  </div>
);

// --- Level Intro Screen ---
const LevelIntro = ({ levelCfg, onStart }) => (
  <motion.div initial={{ opacity:0,y:28 }} animate={{ opacity:1,y:0 }}
    className="flex flex-col items-center gap-7 p-10 rounded-3xl w-full relative overflow-hidden"
    style={{ background:"rgba(255,255,255,0.96)",backdropFilter:"blur(20px)",border:`3px solid ${levelCfg.accentColor}44`,boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>

    {/* Floating mascot top-right */}
    {levelCfg.mascot && (
      <motion.img src={levelCfg.mascot} alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ width:130, height:"auto", right:-18, top:8, opacity:0.88, zIndex:0 }}
        animate={{ y:[0,-14,0], rotate:[-6,6,-6] }}
        transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }}
      />
    )}
    {/* Floating pufferfish bottom-left */}
    <motion.img src={imgPuffefish} alt="" aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={{ width:80, height:"auto", left:-14, bottom:12, opacity:0.70, zIndex:0 }}
      animate={{ scale:[1,1.18,1], rotate:[-8,8,-8] }}
      transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}
    />

    {/* Level badge */}
    <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:1.6,repeat:Infinity,ease:"easeInOut" }}
      className="flex items-center justify-center w-32 h-32 rounded-full text-6xl font-black text-white shadow-2xl"
      style={{ background:`linear-gradient(135deg,${levelCfg.accentColor},${levelCfg.accentColor}88)`, zIndex:1 }}>
      {levelCfg.id}
    </motion.div>

    <div className="text-center z-10">
      <p className="text-4xl font-extrabold leading-tight" style={{ color:levelCfg.accentColor }}>{levelCfg.name}</p>
      <p className="text-2xl font-bold text-gray-500 mt-1">Level {levelCfg.id} — {levelCfg.difficulty}</p>
      <p className="text-lg font-semibold text-gray-400 mt-1">{levelCfg.rounds} වාර  •  ජය: {levelCfg.passScore}/{levelCfg.rounds}</p>
    </div>

    <div className="w-full rounded-3xl p-6 text-center z-10" style={{ background:levelCfg.bgGrad,border:`2px solid ${levelCfg.accentColor}33` }}>
      <p className="text-xl font-bold text-gray-700 leading-relaxed">{levelCfg.hint}</p>
      <div className="flex items-center justify-center gap-4 mt-4 text-lg font-semibold text-gray-600">
        <span className="flex items-center gap-2"><EyeIcon size={20}/> {(levelCfg.speedMs/1000).toFixed(1)}s</span>
        <span className="text-2xl">→</span>
        <span>ටිකෙ කරන්න</span>
      </div>
    </div>

    {/* Item preview */}
    <div className="flex gap-4 flex-wrap justify-center z-10">
      {levelCfg.items.slice(0,4).map(item => (
        <motion.div key={item.key} whileHover={{ scale:1.08, y:-4 }}
          className="flex flex-col items-center gap-2 rounded-3xl p-4 bg-white shadow-xl border-2 border-gray-100">
          <img src={item.src} alt={item.label} className="w-20 h-20 object-contain rounded-2xl"/>
          <span className="text-base font-extrabold text-gray-700">{item.label}</span>
        </motion.div>
      ))}
      {levelCfg.items.length > 4 && (
        <div className="w-28 h-28 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center font-extrabold text-2xl text-gray-400">
          +{levelCfg.items.length-4}
        </div>
      )}
    </div>

    <motion.button whileHover={{ scale:1.04, boxShadow:"0 12px 40px rgba(0,0,0,0.22)" }} whileTap={{ scale:0.95 }} onClick={onStart}
      className="w-full rounded-full py-6 text-2xl font-extrabold text-white shadow-2xl z-10"
      style={{ background:`linear-gradient(90deg,${levelCfg.accentColor},${levelCfg.accentColor}cc)` }}>
      ▶ ආරම්භ කරමු!
    </motion.button>
  </motion.div>
);

// --- Timer Ring ---
const TimerRing = ({ elapsed, total, color }) => {
  const r    = 40;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, 1 - elapsed / total);
  const secs = Math.ceil(Math.max(0, total - elapsed) / 1000);
  return (
    <svg width={100} height={100} viewBox="0 0 100 100" aria-label={`${secs} seconds`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="9"/>
      <circle cx="50" cy="50" r={r} fill="rgba(255,255,255,0.14)"/>
      <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
        strokeLinecap="round" transform="rotate(-90 50 50)"/>
      <text x="50" y="60" textAnchor="middle" fill="white" fontSize="30" fontWeight="900">{secs}</text>
    </svg>
  );
};

// --- Result Screen (matches ColorMemoryGame pattern) ---
const ResultScreen = ({ level, correct, total, passScore, onNext, onRetry, onHome }) => {
  const passed = correct >= passScore;
  const pct    = Math.round((correct / total) * 100);
  const stars  = correct >= total ? 3 : correct >= passScore ? 2 : 1;

  return (
    <motion.div initial={{ opacity:0,scale:0.82 }} animate={{ opacity:1,scale:1 }}
      transition={{ type:"spring",stiffness:180,damping:18 }}
      className="flex flex-col items-center gap-7 p-10 rounded-3xl text-center w-full relative overflow-hidden"
      style={{ background:"rgba(255,255,255,0.96)",backdropFilter:"blur(20px)",boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>

      {/* Decorative mascot */}
      <motion.img src={imgDolphin} alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ width:110, height:"auto", right:-16, top:10, opacity:0.80 }}
        animate={{ y:[0,-12,0], rotate:[-5,5,-5] }}
        transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
      />

      <motion.div animate={passed?{ rotate:[0,-12,12,-8,8,0],scale:[1,1.1,1] }:{ scale:[1,1.15,1] }} transition={{ delay:0.25,duration:0.7 }}>
        {passed ? <TrophyIcon size={100} color="#F59E0B"/> : <SmileIcon size={100} color="#F97316"/>}
      </motion.div>

      <div>
        <p className="text-5xl font-extrabold mb-3 leading-tight" style={{ color:passed?"#22C55E":"#F97316" }}>
          {passed ? "ජය ගත්තා!" : "නැවත උත්සාහ කරන්න!"}
        </p>
        <p className="text-2xl font-bold text-gray-600">{correct} / {total} නිවැරදි ({pct}%)</p>
      </div>

      <div className="flex gap-3">
        {[1,2,3].map(i => <StarIcon key={i} size={52} filled={i<=stars}/>)}
      </div>

      {passed && level < LEVELS.length && (
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}
          className="w-full rounded-2xl px-6 py-4 flex items-center justify-center gap-3"
          style={{ background:"#EFF6FF",border:"2px solid #BFDBFE" }}>
          <UnlockIcon size={24} color="#2563EB"/>
          <p className="text-xl font-bold text-blue-600">Level {level+1} unlock වුණා!</p>
        </motion.div>
      )}
      {passed && level === LEVELS.length && (
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}
          className="w-full rounded-2xl px-6 py-4 text-center"
          style={{ background:"#FEF9C3",border:"2px solid #FDE047" }}>
          <p className="text-xl font-bold text-yellow-700">සියලු levels ජය ගත්තා! ඔබ ශූරයෙක්!</p>
        </motion.div>
      )}

      <div className="flex flex-col gap-4 w-full">
        {passed && level < LEVELS.length && (
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onNext}
            className="rounded-full py-5 font-extrabold text-2xl text-white shadow-xl flex items-center justify-center gap-3"
            style={{ background:"linear-gradient(90deg,#22C55E,#16A34A)" }}>
            <NextIcon size={26}/> ඊළඟ Level
          </motion.button>
        )}
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onRetry}
          className="rounded-full py-5 font-extrabold text-2xl text-white shadow-xl flex items-center justify-center gap-3"
          style={{ background:"linear-gradient(90deg,#0EA5E9,#0284C7)" }}>
          <RetryIcon size={26}/> නැවත ක්‍රීඩා කරමු
        </motion.button>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onHome}
          className="rounded-full py-5 font-extrabold text-2xl text-white shadow-xl flex items-center justify-center gap-3"
          style={{ background:"linear-gradient(90deg,#8B5CF6,#7C3AED)" }}>
          <HomeIcon size={26}/> ගෙදරට
        </motion.button>
      </div>
    </motion.div>
  );
};

// --- Sequence dots (showing progress through sequence) ---
const SeqDots = ({ total, filled, color }) => (
  <div className="flex gap-3 justify-center">
    {Array.from({ length:total },(_,i) => (
      <motion.div key={i} className="rounded-full"
        style={{ width:20,height:20,background:i<filled?color:"rgba(255,255,255,0.38)",border:"3px solid rgba(255,255,255,0.60)" }}
        animate={i===filled-1?{ scale:[1,1.6,1] }:{}}
        transition={{ duration:0.35 }}/>
    ))}
  </div>
);

// --- Round progress pills ---
const RoundPills = ({ total, done, color }) => (
  <div className="flex gap-2 justify-center flex-wrap">
    {Array.from({ length:total },(_,i) => (
      <div key={i} className="rounded-full"
        style={{ width:40,height:14,background:i<done?color:"rgba(255,255,255,0.35)",
          border:`2px solid ${i<done?color:"rgba(255,255,255,0.5)"}`,transition:"background 0.3s" }}/>
    ))}
  </div>
);

// --- Input slot indicators ---
const InputSlots = ({ sequence, inputIndex, color }) => (
  <div className="flex gap-3 justify-center flex-wrap">
    {sequence.map((item,i) => {
      const done = i < inputIndex;
      const next = i === inputIndex;
      return (
        <motion.div key={i} animate={next?{ scale:[1,1.1,1] }:{}} transition={{ duration:0.7,repeat:next?Infinity:0,repeatDelay:0.8 }}
          className="rounded-3xl overflow-hidden flex items-center justify-center"
          style={{ width:84,height:84,
            background: done ? color+"33" : next ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.35)",
            border: done ? `3px solid ${color}` : next ? `3px dashed ${color}` : "2.5px solid rgba(255,255,255,0.45)" }}>
          {done
            ? <img src={item.src} alt={item.label} className="w-16 h-16 object-contain rounded-2xl"/>
            : <span className="text-4xl font-extrabold" style={{ color:next?color:"rgba(200,200,200,0.8)" }}>{next?"?":"·"}</span>}
        </motion.div>
      );
    })}
  </div>
);

// --- Clickable item card ---
const ItemCard = ({ item, onClick, disabled }) => (
  <motion.button whileHover={disabled?{}:{ scale:1.1,y:-7 }} whileTap={disabled?{}:{ scale:0.86 }}
    onClick={onClick} disabled={disabled}
    className="flex flex-col items-center gap-2 rounded-3xl p-5 shadow-xl"
    style={{ background:"rgba(255,255,255,0.94)",backdropFilter:"blur(10px)",border:"3px solid rgba(255,255,255,0.75)",cursor:disabled?"not-allowed":"pointer" }}>
    <img src={item.src} alt={item.label} className="h-24 w-24 object-contain rounded-2xl"/>
    <span className="text-lg font-extrabold text-gray-700">{item.label}</span>
  </motion.button>
);

// =============================================================
//  MAIN GAME COMPONENT
// =============================================================
const SequenceRecallGame = ({ level: providedLevel = 1, onComplete = null }) => {
  const { initializeGame, completeLevel, updateLevelProgress, getAdaptiveProfile, recordAdaptiveResult } = useProgress();

  const [level,      setLevel]      = useState(Number(providedLevel));
  const baseCfg = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level - 1))];
  const cfg = adaptSequenceRecallConfig(baseCfg, getAdaptiveProfile(GAME_ID));

  const [instrPlaying, setInstrPlaying] = useState(false);
  const instrAudioRef = useRef(null);

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

  // phase: intro | showing | input | result
  const [phase,      setPhase]      = useState("intro");
  const [round,      setRound]      = useState(0);
  const [sequence,   setSequence]   = useState([]);
  const [showIdx,    setShowIdx]    = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [correct,    setCorrect]    = useState(0);
  const [feedback,   setFeedback]   = useState(null);
  const [elapsed,    setElapsed]    = useState(0);
  const [hintVisible, setHintVisible] = useState(false);

  const correctRef  = useRef(0);
  const mistakesRef = useRef(0);
  const timerRefs   = useRef([]);
  const tickRef     = useRef(null);

  const clearAll = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    clearInterval(tickRef.current);
    speechSynthesis.cancel();
  }, []);

  const after = (ms, fn) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
  };

  useEffect(() => {
    initializeGame(GAME_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearAll();
    setPhase("intro");
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    mistakesRef.current = 0;
    setSequence([]);
    setFeedback(null);
    setElapsed(0);
  }, [level, clearAll]);

  useEffect(() => () => clearAll(), [clearAll]);

  const buildSeq = () => {
    // If the child has accumulated 4+ wrong attempts this session, cap sequence length at 3
    const seqLen = mistakesRef.current >= 4 ? Math.min(cfg.seqLen, 3) : cfg.seqLen;
    return Array.from({ length: seqLen }, () => cfg.items[Math.floor(Math.random() * cfg.items.length)]);
  };

  const startRound = useCallback(() => {
    clearAll();
    const seq = buildSeq();
    setSequence(seq);
    setInputIndex(0);
    setFeedback(null);
    setShowIdx(0);
    setElapsed(0);
    setPhase("showing");
    speak("බලන්න — මතක තබා ගන්න");

    seq.forEach((item, i) => {
      after(i * cfg.speedMs, () => {
        setShowIdx(i);
        speak(item.label);
        const start = Date.now();
        clearInterval(tickRef.current);
        tickRef.current = setInterval(() => setElapsed(Date.now() - start), 60);
      });
      after((i + 1) * cfg.speedMs - 150, () => {
        clearInterval(tickRef.current);
        setElapsed(0);
      });
    });

    after(seq.length * cfg.speedMs + 400, () => {
      clearInterval(tickRef.current);
      setPhase("input");
      speak("දැන් ටිකෙ කරන්න");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, clearAll]);

  const handlePick = (item) => {
    if (phase !== "input") return;
    const expected = sequence[inputIndex];
    if (item.key === expected.key) {
      beep("correct");
      speak(item.label);
      setFeedback("correct");
      after(350, () => setFeedback(null));
      const nextInput = inputIndex + 1;
      setInputIndex(nextInput);

      if (nextInput >= sequence.length) {
        const nextRound   = round + 1;
        const nextCorrect = correctRef.current + 1;
        correctRef.current = nextCorrect;
        setCorrect(nextCorrect);

        if (nextRound >= cfg.rounds) {
          const passed = nextCorrect >= cfg.passScore;
          const stats  = {
            correct: nextCorrect,
            total: cfg.rounds,
            pct: Math.round((nextCorrect / cfg.rounds) * 100),
            wrongAttempts: mistakesRef.current,
            mistakes: mistakesRef.current,
            totalAttempts: nextCorrect + mistakesRef.current,
          };
          completeLevel(GAME_ID, level, stats);
          updateLevelProgress(GAME_ID, level, 100, stats);
          recordAdaptiveResult(GAME_ID, stats);
          if (passed) {
            playLevelUp();
            setTimeout(() => confetti({
              particleCount: 160, spread: 90, origin: { y: 0.55 },
              colors: ["#0EA5E9","#A78BFA","#FB923C","#22C55E","#F472B6"],
            }), 200);
          }
          after(600, () => setPhase("result"));
        } else {
          setRound(nextRound);
          after(700, () => startRound());
        }
      }
    } else {
      mistakesRef.current += 1;
      if (mistakesRef.current >= 4) setHintVisible(true);
      beep("wrong");
      setFeedback("wrong");
      speak("නැවත උත්සාහ කරන්න");
      after(600, () => setFeedback(null));
    }
  };

  const handleStart = () => {
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    startRound();
  };

  const handleRetry = () => {
    clearAll();
    setPhase("intro");
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    mistakesRef.current = 0;
    setHintVisible(false);
    setSequence([]);
    setFeedback(null);
    setElapsed(0);
  };

  const handleNextLevel = () => {
    playLevelUp();
    const next = level + 1;
    if (onComplete) {
      onComplete({ passed: true, nextLevel: next, accuracy: Math.round((correct / cfg.rounds) * 100) });
    } else {
      setLevel(next);
    }
  };

  const handleHome = () => {
    if (onComplete) onComplete({ goHome: true, accuracy: Math.round((correct / cfg.rounds) * 100) });
  };

  const color = cfg.accentColor;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-x-hidden" style={{ zIndex:1 }}>
      <AnimatedSeaBg/>

      {/* Voice instruction audio — level-specific */}
      <audio ref={instrAudioRef} src={INSTRUCTION_AUDIOS[level] ?? instructionAudio1} onEnded={() => setInstrPlaying(false)} />

      {/* Floating voice instruction button */}
      <button
        type="button"
        onClick={handleVoiceInstruction}
        title="උපදෙස් අසන්න (Listen to instructions)"
        aria-label={instrPlaying ? "Stop instructions" : "Play instructions"}
        style={{
          position: 'fixed',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          width: '4.5rem',
          height: '4.5rem',
          borderRadius: '50%',
          border: '3px solid #fff',
          background: instrPlaying
            ? 'linear-gradient(135deg,#EF4444,#F87171)'
            : 'linear-gradient(135deg,#0284C7,#38BDF8)',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: instrPlaying
            ? '0 0 0 6px rgba(239,68,68,0.25), 0 8px 24px rgba(0,0,0,0.22)'
            : '0 4px 18px rgba(2,132,199,0.50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '0.1rem',
          transition: 'background 0.25s, box-shadow 0.25s',
          animation: instrPlaying ? 'seq-pulse-ring 1.2s ease-in-out infinite' : 'none',
        }}
      >
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{instrPlaying ? '⏹' : '🔊'}</span>
        <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.03em', lineHeight: 1.1, textAlign: 'center' }}>
          {instrPlaying ? 'නවත්වන්න' : 'උපදෙස්'}
        </span>
      </button>
      <style>{`
        @keyframes seq-pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(239,68,68,0.45), 0 8px 24px rgba(0,0,0,0.22); }
          70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0),    0 8px 24px rgba(0,0,0,0.22); }
          100% { box-shadow: 0 0 0 0   rgba(239,68,68,0),    0 8px 24px rgba(0,0,0,0.22); }
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl">

        {/* INTRO */}
        {phase === "intro" && (
          <LevelIntro levelCfg={cfg} onStart={handleStart}/>
        )}

        {/* SHOWING + INPUT */}
        {(phase === "showing" || phase === "input") && (
          <>
            {/* Progress header */}
            <div className="w-full flex items-center gap-4">
              <div className="rounded-full px-5 py-3 text-lg font-extrabold text-white shadow-lg flex-shrink-0"
                style={{ background:color }}>
                {round + 1} / {cfg.rounds}
              </div>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.30)" }}>
                <motion.div className="h-4 rounded-full bg-white/85"
                  animate={{ width:`${(round/cfg.rounds)*100}%` }} transition={{ duration:0.4 }}/>
              </div>
              <div className="rounded-full px-5 py-3 text-lg font-extrabold text-white shadow-lg flex-shrink-0"
                style={{ background:"rgba(34,197,94,0.88)" }}>
                ✓ {correct}
              </div>
            </div>

            <div className="rounded-full px-6 py-2.5 text-lg font-extrabold text-white/95"
              style={{ background:`${color}cc`,backdropFilter:"blur(8px)" }}>
              {cfg.name} — Level {cfg.id}
            </div>

            {/* SHOWING phase */}
            {phase === "showing" && sequence[showIdx] && (
              <div className="flex flex-col items-center gap-5 w-full">
                <p className="text-3xl font-extrabold text-white drop-shadow-lg text-center">
                  {showIdx + 1} / {cfg.seqLen} — මතක තබා ගන්න!
                </p>
                <TimerRing elapsed={elapsed} total={cfg.speedMs} color={color}/>
                <AnimatePresence mode="wait">
                  <motion.div key={showIdx}
                    initial={{ scale:0.2,opacity:0,rotate:-12 }} animate={{ scale:1,opacity:1,rotate:0 }} exit={{ scale:1.4,opacity:0 }}
                    transition={{ type:"spring",stiffness:260,damping:18 }}
                    className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ scale:[1,1.06,1] }}
                      transition={{ duration:1.2,repeat:Infinity,ease:"easeInOut" }}
                      className="rounded-3xl border-4 border-white/80 shadow-2xl p-7"
                      style={{ background:cfg.bgGrad }}>
                      <img src={sequence[showIdx].src} alt={sequence[showIdx].label} className="w-56 h-56 object-contain rounded-3xl"/>
                    </motion.div>
                    <p className="text-4xl font-extrabold text-white drop-shadow-lg">{sequence[showIdx].label}</p>
                  </motion.div>
                </AnimatePresence>
                <SeqDots total={cfg.seqLen} filled={showIdx+1} color="white"/>
              </div>
            )}

            {/* INPUT phase */}
            {phase === "input" && (
              <div className="flex flex-col items-center gap-5 w-full">
                <p className="text-3xl font-extrabold text-white drop-shadow-lg text-center">
                  {inputIndex + 1} වැනි රූපය ටිකෙ කරන්න!
                </p>
                <InputSlots sequence={sequence} inputIndex={inputIndex} color={color}/>
                <AnimatePresence>
                  {feedback && (
                    <motion.div key={feedback} initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0 }}
                      className="rounded-full px-8 py-3 text-xl font-extrabold text-white shadow-xl"
                      style={{ background:feedback==="correct"?"#22C55E":"#EF4444" }}>
                      {feedback==="correct" ? "නිවැරදි!" : "වැරදියි! නැවත!"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hint banner — shown after 4 wrong attempts */}
                <AnimatePresence>
                  {hintVisible && (
                    <motion.div key="seq-hint" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="w-full rounded-2xl px-5 py-4 flex items-center gap-3"
                      style={{ background:"#FEF9C3", border:"2px solid #FDE047" }}>
                      <span style={{ fontSize:28 }}>💡</span>
                      <div>
                        <p className="text-base font-extrabold text-yellow-800"> ඉඟිය: රූප ලැයිස්තුව මතකයේ තබාගන්න!</p>
                        <p className="text-sm font-semibold text-yellow-700 mt-1">
                          රූප පෙන්වෙද්දී ඒ ඒ සතුන් හෝ දේවල්ගේ නම් හිතෙන්ම කියාගන්න. ඊළඟ රූපය පැමිණෙන විට පෙර රූපයත් සමඟ ලැයිස්තුවක් ලෙස මතකයේ ගොඩනගාගන්න.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className={`grid gap-4 w-full ${cfg.items.length<=4?"grid-cols-2":"grid-cols-3"}`}>
                  {cfg.items.map(item => (
                    <ItemCard key={item.key} item={item} onClick={() => handlePick(item)} disabled={!!feedback}/>
                  ))}
                </div>
                <RoundPills total={cfg.rounds} done={round} color={color}/>
              </div>
            )}
          </>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <ResultScreen
            level={level}
            correct={correct}
            total={cfg.rounds}
            passScore={cfg.passScore}
            onNext={handleNextLevel}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}

      </div>
    </div>
  );
};

export default SequenceRecallGame;
