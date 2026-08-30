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
import { awardStar } from "../components/StarRewardSystem";

// --- Assets ---
import imgApple      from "../assets/apple .png";
import imgBanana     from "../assets/banana.png";
import imgGrapes     from "../assets/grapes.png";
import imgStrawberry from "../assets/strawberry.png";
import imgOrange     from "../assets/orange.png";
import imgSeaFish    from "../assets/New folder/fish-transparent.png";
import imgSeaCrab    from "../assets/New folder/crab-transparent.png";
import imgOctopus    from "../assets/New folder/octopus-transparent.png";
import imgSeaTurtle  from "../assets/New folder/turtle-transparent.png";
import imgStarfish   from "../assets/New folder/starfish-transparent.png";
import deepSeaSandSeabed from "../assets/shared-deep-sea-sand-seabed.png";
import swimmingColorfulFish from "../assets/home-swimming-colorful-fish.png";
import imgSeahorse   from "../assets/seahorse.png";
import imgDolphin    from "../assets/dolphin.png";
import imgDolphinLevelBoard from "../assets/dolphin-level-board.png";
import imgMermaid    from "../assets/mermaid.png";
import imgPuffefish  from "../assets/puffefish.png";
import sequenceTurtleCard from "../assets/sequence-turtle-card-v1.png";
import sequenceSeaGrassCard from "../assets/sequence-seagrass-card-v1.png";
import sequenceJellyfishCard from "../assets/sequence-jellyfish-card-v1.png";
import sequenceSailboat from "../assets/sequence-sailboat-v1.png";
import sequenceSpeedboat from "../assets/sequence-speedboat-v1.png";
import sequenceUnderwaterScooter from "../assets/sequence-underwater-scooter-v1.png";
import sequenceFerry from "../assets/sequence-ferry-v1.png";
import sequenceHovercraft from "../assets/sequence-hovercraft-v1.png";
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
const MAX_WRONG_ATTEMPTS_PER_ROUND = 3;

// --- Level config ---
const LEVELS = [
  {
    id: 1,
    name: "පළතුරු",
    difficulty: "පහසු",
    seqLen: 2,
    rounds: 3,
    passScore: 2,
    speedMs: 3000,
    accentColor: "#0284C7",
    bgGrad: "linear-gradient(135deg,#E0F2FE,#BAE6FD)",
    hint: "රූප 2ක් දිස්වෙනවා — ඒ අනුපිළිවෙලටම තෝරන්න!",
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
    name: "මුහුදු සතුන්",
    difficulty: "මධ්‍යම",
    seqLen: 3,
    rounds: 3,
    passScore: 2,
    speedMs: 2500,
    accentColor: "#0D9488",
    bgGrad: "linear-gradient(135deg,#CCFBF1,#99F6E4)",
    hint: "රූප 3ක් දිස්වෙනවා — ඒ අනුපිළිවෙලටම තෝරන්න!",
    mascot: imgMermaid,
    items: [
      { key: "sea-fish",   label: "මාළුවා",       src: imgSeaFish   },
      { key: "sea-crab",   label: "කකුළුවා",      src: imgSeaCrab   },
      { key: "octopus",    label: "බූවල්ලා",      src: imgOctopus   },
      { key: "sea-turtle", label: "මුහුදු කැස්බෑවා", src: imgSeaTurtle },
      { key: "pufferfish", label: "පිම්බෙන මාළුවා", src: imgPuffefish },
      { key: "starfish",   label: "තරු මාළුවා",   src: imgStarfish  },
    ],
  },
  {
    id: 3,
    name: "මුහුදු වාහන",
    difficulty: "අපහසු",
    seqLen: 4,
    rounds: 4,
    passScore: 3,
    speedMs: 3500,
    accentColor: "#7C3AED",
    bgGrad: "linear-gradient(135deg,#EDE9FE,#DDD6FE)",
    hint: "රූප 4ක් දිස්වෙනවා — ඒ අනුපිළිවෙලටම තෝරන්න!",
    mascot: imgSeahorse,
    items: [
      { key: "sailboat",           label: "රුවල් බෝට්ටුව",   src: sequenceSailboat            },
      { key: "speedboat",          label: "වේග බෝට්ටුව",     src: sequenceSpeedboat           },
      { key: "underwater-scooter", label: "දිය යට ස්කූටරය", src: sequenceUnderwaterScooter   },
      { key: "ferry",              label: "මගී නෞකාව",       src: sequenceFerry               },
      { key: "hovercraft",         label: "හෝවර්ක්‍රාෆ්ට්",   src: sequenceHovercraft          },
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

// --- Sea Background ---
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
  { type:"fish",      x:-10, y:25, size:64, hue:0,   delay:0, dur:18, flip:false, opacity:0.76, driftX:"115vw",  driftY:["0%","4%","-4%","0%"] },
  { type:"fish",      x:-10, y:55, size:54, hue:80,  delay:4, dur:22, flip:false, opacity:0.70, driftX:"115vw",  driftY:["0%","-5%","5%","0%"] },
  { type:"fish",      x:110, y:18, size:58, hue:155, delay:7, dur:20, flip:true,  opacity:0.70, driftX:"-115vw", driftY:["0%","3%","-3%","0%"] },
  { type:"fish",      x:110, y:65, size:48, hue:230, delay:2, dur:25, flip:true,  opacity:0.66, driftX:"-115vw", driftY:["0%","-4%","4%","0%"] },
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
        <img
          src={swimmingColorfulFish}
          alt=""
          aria-hidden="true"
          style={{
            width:item.size,
            height:"auto",
            transform:item.flip ? "scaleX(-1)" : "none",
            filter:`hue-rotate(${item.hue ?? 0}deg) drop-shadow(0 6px 8px rgba(3,105,161,0.24))`,
          }}
        />
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

export const AnimatedSeaBg = () => (
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

    {/* Generated transparent seabed artwork shared by every game using this background. */}
    <img
      src={deepSeaSandSeabed}
      alt=""
      aria-hidden="true"
      className="absolute bottom-0 left-0 block h-[clamp(110px,21vh,145px)] w-full select-none object-fill sm:hidden"
      style={{ filter:"drop-shadow(0 -6px 12px rgba(3,105,161,0.14))" }}
    />
    <img
      src={deepSeaSandSeabed}
      alt=""
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 hidden h-auto max-w-none -translate-x-1/2 select-none sm:block"
      style={{
        width:"max(100vw, 880px)",
        filter:"drop-shadow(0 -8px 16px rgba(3,105,161,0.16))",
      }}
    />
  </div>
);

// --- Level Intro Screen ---
const LevelIntro = ({ levelCfg, onStart }) => (
  <motion.div initial={{ opacity:0,y:28 }} animate={{ opacity:1,y:0 }}
    className="relative grid w-full grid-cols-1 items-center gap-2 overflow-hidden rounded-3xl p-3 sm:gap-3 sm:p-4 lg:max-h-[calc(100dvh-5rem)] lg:grid-cols-[minmax(290px,0.9fr)_minmax(0,1.1fr)] lg:gap-5 lg:p-5"
    style={{ background:"rgba(255,255,255,0.96)",backdropFilter:"blur(20px)",border:`3px solid ${levelCfg.accentColor}44`,boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>

    {/* Floating pufferfish bottom-left */}
    <motion.img src={imgPuffefish} alt="" aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={{ width:64, height:"auto", left:-14, bottom:10, opacity:0.55, zIndex:0 }}
      animate={{ scale:[1,1.18,1], rotate:[-8,8,-8] }}
      transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}
    />

    <div className="relative z-10 flex min-h-0 items-center justify-center">
      <motion.div
        className="absolute right-0 top-2 hidden max-w-[150px] rounded-2xl rounded-bl-sm border-2 border-sky-200 bg-white px-3 py-2 text-center text-sm font-black text-sky-700 shadow-lg lg:block"
        animate={{ scale:[1,1.04,1] }}
        transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
      >
        හායි යාළුවා! අපි එකට මතක තියාගමු!
      </motion.div>
      <motion.div
        className="relative w-[150px] sm:w-[220px] md:w-[250px] lg:w-full lg:max-w-[380px]"
        animate={{ y:[0,-5,0], rotate:[-1,1,-1] }}
        transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
      >
        <img src={imgDolphinLevelBoard}
          alt={`ඩොල්ෆින් යාළුවා මට්ටම ${levelCfg.id} පුවරුව අල්ලාගෙන සිටී`}
          className="block max-h-[27dvh] w-full select-none object-contain sm:max-h-[34dvh] lg:max-h-[calc(100dvh-8rem)]" />
        <div className="absolute flex flex-col items-center justify-center px-2 text-center sm:px-3"
          style={{ left:"10%", right:"10%", top:"37%", bottom:"32%" }}>
          <p className="text-[9px] font-black leading-none text-teal-700 sm:text-sm lg:text-lg">මට්ටම</p>
          <p className="text-2xl font-black leading-none text-sky-700 sm:text-4xl lg:text-6xl">{levelCfg.id}</p>
          <p className="mt-0.5 max-w-full truncate text-[10px] font-black leading-none text-slate-800 sm:mt-1 sm:text-lg sm:leading-tight lg:mt-2 lg:text-2xl">{levelCfg.name}</p>
          <p className="hidden text-xs font-extrabold leading-none text-amber-600 sm:block sm:text-sm lg:mt-1 lg:text-base">{levelCfg.difficulty}</p>
        </div>
      </motion.div>
    </div>

    <div className="relative z-10 flex min-w-0 flex-col gap-2 sm:gap-3 lg:gap-4">
      <div className="rounded-2xl p-2 text-center sm:p-3" style={{ background:levelCfg.bgGrad,border:`2px solid ${levelCfg.accentColor}33` }}>
        <p className="text-sm font-bold leading-relaxed text-gray-700 sm:text-base lg:text-lg">{levelCfg.hint}</p>
      </div>

      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-2 text-center sm:p-3">
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-slate-700 sm:gap-2 sm:text-sm">
          <div className="rounded-xl bg-white p-1.5 shadow-sm sm:p-2">
            <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 font-black text-white">1</span>
            හොඳින් බලන්න
          </div>
          <div className="rounded-xl bg-white p-1.5 shadow-sm sm:p-2">
            <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 font-black text-white">2</span>
            පිළිවෙල මතක තබාගන්න
          </div>
          <div className="rounded-xl bg-white p-1.5 shadow-sm sm:p-2">
            <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 font-black text-white">3</span>
            වැරදුණත් නැවත උත්සාහ කරමු
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {levelCfg.items.slice(0,4).map(item => (
          <motion.div key={item.key} whileHover={{ scale:1.06, y:-2 }}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl border-2 border-gray-100 bg-white p-2 shadow-md">
            <img src={item.src} alt={item.label} className="h-8 w-8 rounded-xl object-contain sm:h-11 sm:w-11 lg:h-14 lg:w-14"/>
            <span className="max-w-full truncate text-xs font-extrabold text-gray-700 sm:text-sm">{item.label}</span>
          </motion.div>
        ))}
        {levelCfg.items.length > 4 && (
          <div className="flex min-w-[54px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 font-extrabold text-gray-500">
            +{levelCfg.items.length-4}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 text-xs font-extrabold sm:text-base">
        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-700 sm:px-4">ක්‍රීඩා වාර {levelCfg.rounds}</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700 sm:px-4">ජයගන්න {levelCfg.passScore}</span>
      </div>

      <motion.button whileHover={{ scale:1.03, boxShadow:"0 12px 40px rgba(0,0,0,0.22)" }} whileTap={{ scale:0.96 }} onClick={onStart}
        className="w-full rounded-full py-3 text-lg font-extrabold text-white shadow-2xl sm:py-4 sm:text-xl lg:text-2xl"
        style={{ background:`linear-gradient(90deg,${levelCfg.accentColor},${levelCfg.accentColor}cc)` }}>
        ▶ ක්‍රීඩාව පටන් ගමු!
      </motion.button>
    </div>
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
    className="flex min-w-0 flex-col items-center gap-1 rounded-2xl p-2 shadow-xl sm:gap-2 sm:rounded-3xl sm:p-5"
    style={{ background:"rgba(255,255,255,0.94)",backdropFilter:"blur(10px)",border:"3px solid rgba(255,255,255,0.75)",cursor:disabled?"not-allowed":"pointer" }}>
    <img src={item.src} alt={item.label} className="h-14 w-14 rounded-xl object-contain sm:h-24 sm:w-24 sm:rounded-2xl"/>
    <span className="max-w-full truncate text-xs font-extrabold text-gray-700 sm:text-lg">{item.label}</span>
  </motion.button>
);

// =============================================================
//  MAIN GAME COMPONENT
// =============================================================
const SequenceRecallGame = ({ level: providedLevel = 1, onComplete = null }) => {
  const { initializeGame, completeLevel, updateLevelProgress, getAdaptiveProfile, recordAdaptiveResult } = useProgress();

  const [level]                      = useState(Number(providedLevel));
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

  // phase: intro | showing | input | correction | result
  const [phase,      setPhase]      = useState("intro");
  const [round,      setRound]      = useState(0);
  const [sequence,   setSequence]   = useState([]);
  const [showIdx,    setShowIdx]    = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [correct,    setCorrect]    = useState(0);
  const [feedback,   setFeedback]   = useState(null);
  const [elapsed,    setElapsed]    = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [roundWrongAttempts, setRoundWrongAttempts] = useState(0);

  const correctRef  = useRef(0);
  const mistakesRef = useRef(0);
  const roundMistakesRef = useRef(0);
  const responseStartedAtRef = useRef(null);
  const responseTimesRef = useRef([]);
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
    roundMistakesRef.current = 0;
    responseStartedAtRef.current = null;
    responseTimesRef.current = [];
    setRoundWrongAttempts(0);
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
    roundMistakesRef.current = 0;
    setRoundWrongAttempts(0);
    setHintVisible(false);
    setFeedback(null);
    setShowIdx(0);
    setElapsed(0);
    setPhase("showing");
    responseStartedAtRef.current = null;
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
      responseStartedAtRef.current = Date.now();
      speak("දැන් අනුපිළිවෙලට තෝරන්න");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, clearAll]);

  const finishGame = (finalCorrect) => {
    const passed = finalCorrect >= cfg.passScore;
    const totalAttempts = finalCorrect + mistakesRef.current;
    const accuracy = totalAttempts > 0
      ? Math.round((finalCorrect / totalAttempts) * 100)
      : 0;
    const averageResponseMs = responseTimesRef.current.length > 0
      ? Math.round(
          responseTimesRef.current.reduce((sum, value) => sum + value, 0)
          / responseTimesRef.current.length
        )
      : null;
    const stats = {
      level: Number(level),
      correct: finalCorrect,
      total: cfg.rounds,
      pct: accuracy,
      accuracy,
      wrongAttempts: mistakesRef.current,
      mistakes: mistakesRef.current,
      totalAttempts,
      averageResponseMs,
      passed,
    };

    if (passed) {
      completeLevel(GAME_ID, level, stats);
    }
    updateLevelProgress(GAME_ID, level, stats.accuracy, stats);
    recordAdaptiveResult(GAME_ID, stats);

    if (passed) {
      playLevelUp();
      setTimeout(() => confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#0EA5E9","#A78BFA","#FB923C","#22C55E","#F472B6"],
      }), 200);
    }
    after(600, () => {
      if (onComplete) {
        onComplete({
          ...stats,
          accuracy: stats.accuracy,
          level,
          nextLevel: passed ? level + 1 : null,
        });
      } else {
        setPhase("intro");
      }
    });
  };

  const finishRound = (roundCorrect) => {
    const nextRound = round + 1;
    const nextCorrect = correctRef.current + (roundCorrect ? 1 : 0);

    if (roundCorrect) {
      awardStar();
      correctRef.current = nextCorrect;
      setCorrect(nextCorrect);
    }

    if (nextRound >= cfg.rounds) {
      finishGame(nextCorrect);
      return;
    }

    setRound(nextRound);
    after(700, () => startRound());
  };

  const handlePick = (item) => {
    if (phase !== "input") return;
    if (responseStartedAtRef.current) {
      responseTimesRef.current.push(Date.now() - responseStartedAtRef.current);
      responseStartedAtRef.current = null;
    }
    const expected = sequence[inputIndex];
    if (item.key === expected.key) {
      beep("correct");
      speak(item.label);
      setFeedback("correct");
      after(350, () => {
        setFeedback(null);
        if (nextInput < sequence.length) responseStartedAtRef.current = Date.now();
      });
      const nextInput = inputIndex + 1;
      setInputIndex(nextInput);

      if (nextInput >= sequence.length) {
        finishRound(true);
      }
    } else {
      mistakesRef.current += 1;
      const nextRoundMistakes = roundMistakesRef.current + 1;
      roundMistakesRef.current = nextRoundMistakes;
      setRoundWrongAttempts(nextRoundMistakes);
      beep("wrong");

      if (nextRoundMistakes >= MAX_WRONG_ATTEMPTS_PER_ROUND) {
        setFeedback(null);
        setHintVisible(false);
        setPhase("correction");
        speak("කමක් නැහැ. හරි පිළිවෙල බලමු");
        sequence.forEach((sequenceItem, index) => {
          after(900 + (index * 750), () => speak(sequenceItem.label));
        });
        after(1600 + (sequence.length * 750), () => finishRound(false));
      } else {
        setFeedback("wrong");
        setHintVisible(nextRoundMistakes === MAX_WRONG_ATTEMPTS_PER_ROUND - 1);
        speak("කමක් නැහැ. නැවත උත්සාහ කරමු");
        after(650, () => {
          setFeedback(null);
          responseStartedAtRef.current = Date.now();
        });
      }
    }
  };

  const handleStart = () => {
    if (instrAudioRef.current) {
      instrAudioRef.current.pause();
      instrAudioRef.current.currentTime = 0;
    }
    setInstrPlaying(false);
    setRound(0);
    setCorrect(0);
    correctRef.current = 0;
    mistakesRef.current = 0;
    roundMistakesRef.current = 0;
    responseStartedAtRef.current = null;
    responseTimesRef.current = [];
    setRoundWrongAttempts(0);
    setHintVisible(false);
    startRound();
  };

  const color = cfg.accentColor;
  const usesSeaGrassCard = cfg.id === 2;
  const usesJellyfishCard = cfg.id === 3;
  const sequenceCardFrame = usesJellyfishCard
    ? sequenceJellyfishCard
    : usesSeaGrassCard
      ? sequenceSeaGrassCard
      : sequenceTurtleCard;

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-x-hidden ${phase === "intro" ? "min-h-[calc(100dvh-64px)] px-2 py-2 sm:px-4 sm:py-4" : "min-h-[calc(100dvh-64px)] px-2 py-3 sm:px-4 sm:py-7"}`} style={{ zIndex:1 }}>
      <AnimatedSeaBg/>

      {/* Voice instruction audio — level-specific */}
      <audio ref={instrAudioRef} src={INSTRUCTION_AUDIOS[level] ?? instructionAudio1} onEnded={() => setInstrPlaying(false)} />

      <div className={`relative z-10 flex w-full flex-col items-center ${phase === "intro" ? "max-w-5xl gap-2" : "max-w-2xl gap-3 sm:gap-6"}`}>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="flex w-full flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleVoiceInstruction}
              aria-label={instrPlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}
              className="z-20 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-sky-200 bg-sky-50 px-5 py-2.5 font-black text-sky-700 shadow-md transition hover:scale-[1.03] hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
            >
              <span className="text-2xl leading-none" aria-hidden="true">{instrPlaying ? "⏹" : "🔊"}</span>
              <span>{instrPlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}</span>
            </button>
            <LevelIntro levelCfg={cfg} onStart={handleStart}/>
          </div>
        )}

        {/* SHOWING + INPUT + CORRECTION */}
        {(phase === "showing" || phase === "input" || phase === "correction") && (
          <>
            {/* Progress header */}
            <div className="flex w-full items-center gap-2 sm:gap-4">
              <div className="flex-shrink-0 rounded-full px-3 py-2 text-sm font-extrabold text-white shadow-lg sm:px-5 sm:py-3 sm:text-lg"
                style={{ background:color }}>
                {round + 1} / {cfg.rounds}
              </div>
              <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.30)" }}>
                <motion.div className="h-4 rounded-full bg-white/85"
                  animate={{ width:`${(round/cfg.rounds)*100}%` }} transition={{ duration:0.4 }}/>
              </div>
              <div className="flex-shrink-0 rounded-full px-3 py-2 text-sm font-extrabold text-white shadow-lg sm:px-5 sm:py-3 sm:text-lg"
                style={{ background:"rgba(34,197,94,0.88)" }}>
                ✓ {correct}
              </div>
            </div>

            <div className="rounded-full px-4 py-2 text-sm font-extrabold text-white/95 sm:px-6 sm:py-2.5 sm:text-lg"
              style={{ background:`${color}cc`,backdropFilter:"blur(8px)" }}>
              {cfg.name} — Level {cfg.id}
            </div>

            {/* SHOWING phase */}
            {phase === "showing" && sequence[showIdx] && (
              <div className="flex w-full flex-col items-center gap-2 sm:gap-5">
                <p className="text-center text-xl font-extrabold text-white drop-shadow-lg sm:text-3xl">
                  {showIdx + 1} / {sequence.length} — මතක තබා ගන්න!
                </p>
                <div className="-my-2 scale-75 sm:my-0 sm:scale-100">
                  <TimerRing elapsed={elapsed} total={cfg.speedMs} color={color}/>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={showIdx}
                    initial={{ scale:0.2,opacity:0,rotate:-12 }} animate={{ scale:1,opacity:1,rotate:0 }} exit={{ scale:1.4,opacity:0 }}
                    transition={{ type:"spring",stiffness:260,damping:18 }}
                    className="flex flex-col items-center gap-2 sm:gap-4">
                    <motion.div
                      animate={{ scale:[1,1.06,1] }}
                      transition={{ duration:1.2,repeat:Infinity,ease:"easeInOut" }}
                      className="relative w-[min(86vw,390px)] drop-shadow-2xl sm:w-[min(66vw,460px)]">
                      <img
                        src={sequenceCardFrame}
                        alt={usesJellyfishCard
                          ? "පින්තූර කාඩ්පත අල්ලාගෙන සිටින ජෙලිෆිෂ් යාළුවා"
                          : usesSeaGrassCard
                            ? "පින්තූර කාඩ්පත වටා ඇති මුහුදු තණකොළ"
                            : "පින්තූර කාඩ්පත අල්ලාගෙන සිටින කැස්බෑ යාළුවා"}
                        className="block h-auto w-full select-none object-contain"
                      />
                      <div
                        className={`absolute flex items-center justify-center overflow-hidden rounded-[13%] border-2 border-sky-200 ${usesJellyfishCard
                          ? "bottom-[25%] left-[23%] right-[23%] top-[30%]"
                          : usesSeaGrassCard
                            ? "bottom-[20%] left-[22%] right-[22%] top-[22%]"
                            : "bottom-[16.5%] left-[23%] right-[23%] top-[38.5%]"
                        }`}
                        style={{
                          background:`radial-gradient(circle, #ffffff 45%, ${color}22 100%)`,
                          boxShadow:`inset 0 0 24px ${color}24, 0 0 18px ${color}30`,
                        }}
                      >
                        <motion.img
                          src={sequence[showIdx].src}
                          alt={sequence[showIdx].label}
                          className="h-[96%] w-[96%] rounded-xl object-contain drop-shadow-lg"
                          animate={{ scale:[0.96,1.04,0.96] }}
                          transition={{ duration:1.25,repeat:Infinity,ease:"easeInOut" }}
                        />
                      </div>
                    </motion.div>
                    <p className="text-2xl font-extrabold text-white drop-shadow-lg sm:text-4xl">{sequence[showIdx].label}</p>
                  </motion.div>
                </AnimatePresence>
                <SeqDots total={sequence.length} filled={showIdx+1} color="white"/>
              </div>
            )}

            {/* INPUT phase */}
            {phase === "input" && (
              <div className="flex flex-col items-center gap-5 w-full">
                <p className="text-3xl font-extrabold text-white drop-shadow-lg text-center">
                  {inputIndex + 1} වැනි රූපය තෝරන්න!
                </p>
                <div className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-2 shadow-lg">
                  <span className="text-sm font-extrabold text-slate-600">ඉතිරි අවස්ථා</span>
                  <div className="flex gap-1" aria-label={`${MAX_WRONG_ATTEMPTS_PER_ROUND - roundWrongAttempts} attempts left`}>
                    {Array.from({ length: MAX_WRONG_ATTEMPTS_PER_ROUND }, (_, index) => (
                      <motion.span
                        key={index}
                        animate={index >= roundWrongAttempts ? { scale:[1,1.12,1] } : {}}
                        transition={{ duration:1.2, repeat:Infinity, delay:index*0.12 }}
                        className="text-2xl"
                        style={{ opacity:index < roundWrongAttempts ? 0.22 : 1 }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>
                  <span className="text-base font-black" style={{ color }}>
                    {MAX_WRONG_ATTEMPTS_PER_ROUND - roundWrongAttempts}
                  </span>
                </div>
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

                {/* Gentle hint before the final try */}
                <AnimatePresence>
                  {hintVisible && (
                    <motion.div key="seq-hint" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="w-full rounded-2xl px-5 py-4 flex items-center gap-3"
                      style={{ background:"#FEF9C3", border:"2px solid #FDE047" }}>
                      <span style={{ fontSize:28 }}>💡</span>
                      <p className="text-base font-extrabold text-yellow-800 sm:text-lg">
                        මුලින් පෙන්වූයේ <span className="text-sky-700">{sequence[0]?.label}</span>! 🌟 දැන් මතක් කරලා තෝරන්න.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="grid w-full grid-cols-3 gap-2 sm:gap-4">
                  {cfg.items.map(item => (
                    <ItemCard key={item.key} item={item} onClick={() => handlePick(item)} disabled={!!feedback}/>
                  ))}
                </div>
                <RoundPills total={cfg.rounds} done={round} color={color}/>
              </div>
            )}

            {/* CORRECTION phase — show the answer after the third wrong choice. */}
            {phase === "correction" && (
              <motion.div
                initial={{ opacity:0, scale:0.94 }}
                animate={{ opacity:1, scale:1 }}
                className="w-full rounded-3xl border-4 border-white/80 bg-white/95 p-6 text-center shadow-2xl"
              >
                <motion.img
                  src={imgDolphin}
                  alt="ඩොල්ෆින් යාළුවා"
                  className="mx-auto h-28 w-36 object-contain"
                  animate={{ y:[0,-8,0] }}
                  transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
                />
                <h3 className="text-2xl font-black text-sky-800">කමක් නැහැ! හරි පිළිවෙල බලමු</h3>
                <p className="mt-2 font-bold text-slate-600">ඩොල්ෆින් යාළුවා එක්ක එක පාරක් මතක් කරගමු.</p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  {sequence.map((item, index) => (
                    <React.Fragment key={`${item.key}-${index}`}>
                      <motion.div
                        initial={{ opacity:0, y:18 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ delay:index*0.35 }}
                        className="relative rounded-2xl border-2 border-sky-200 bg-sky-50 p-3"
                      >
                        <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">
                          {index + 1}
                        </span>
                        <img src={item.src} alt={item.label} className="h-20 w-20 object-contain" />
                        <p className="mt-1 text-sm font-extrabold text-slate-700">{item.label}</p>
                      </motion.div>
                      {index < sequence.length - 1 && (
                        <span className="text-2xl font-black text-sky-500" aria-hidden="true">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <p className="mt-5 rounded-full bg-emerald-100 px-4 py-2 font-extrabold text-emerald-800">
                  දැන් ඊළඟ වටයට යමු! 🌟
                </p>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default SequenceRecallGame;
