/**
 * SequenceRecallGame — 3 Levels
 * Designed for 6-8 year old children with working memory challenges.
 * Sea animated background, public-folder images, SVG icons, timeline bar, Sinhala.
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

// ─── Working-memory assets ────────────────────────────────────────────────────
import imgApple      from "../assets/apple.png";
import imgBanana     from "../assets/banana.webp";
import imgGrapes     from "../assets/grapes.jpg";
import imgStrawberry from "../assets/strawberry.jpg";
import imgOrange     from "../assets/orange.jpg";
import imgDog        from "../assets/dog.png";
import imgCat        from "../assets/cat.jpg";
import imgCow        from "../assets/cow.jpg";
import imgPig        from "../assets/pig.jpg";
import imgBunny      from "../assets/bunny.png";
import imgBird       from "../assets/bird.jpg";
import imgCar        from "../assets/car.jpg";
import imgBus        from "../assets/bus.jpg";
import imgTrain      from "../assets/train.jpg";
import imgFlight     from "../assets/flight.jpg";

const LEVELS = [
  {
    id: 1,
    name: "පළතුරු",
    difficulty: "පහසු",
    difficultyBg: "#22C55E",
    seqLen: 2,
    rounds: 4,
    speedMs: 1800,
    items: [
      { key: "apple",      label: "ඇපල්",        src: imgApple      },
      { key: "banana",     label: "කෙසෙල්",       src: imgBanana     },
      { key: "grapes",     label: "මිදි",         src: imgGrapes     },
      { key: "strawberry", label: "ස්ට්‍රෝබෙරි",  src: imgStrawberry },
      { key: "orange",     label: "දොඩම්",        src: imgOrange     },
    ],
    accentColor: "#0284C7",
    bgFrom: "#E0F2FE",
    bgTo:   "#BAE6FD",
    hint: "පළතුරු 2ක් ඉලක්කමේ ගනිමු!",
  },
  {
    id: 2,
    name: "සතුන්",
    difficulty: "මධ්‍යම",
    difficultyBg: "#F59E0B",
    seqLen: 3,
    rounds: 4,
    speedMs: 1600,
    items: [
      { key: "dog",    label: "බල්ලා",    src: imgDog   },
      { key: "cat",    label: "පූසා",     src: imgCat   },
      { key: "cow",    label: "ගවයා",     src: imgCow   },
      { key: "pig",    label: "ඌරා",      src: imgPig   },
      { key: "bunny",  label: "හාවා",     src: imgBunny },
      { key: "bird",   label: "කුරුල්ලා", src: imgBird  },
    ],
    accentColor: "#0D9488",
    bgFrom: "#CCFBF1",
    bgTo:   "#99F6E4",
    hint: "සතුන් 3ක් කෙළිමේ ගනිමු!",
  },
  {
    id: 3,
    name: "වාහන",
    difficulty: "අපහසු",
    difficultyBg: "#EF4444",
    seqLen: 4,
    rounds: 5,
    speedMs: 1400,
    items: [
      { key: "car",    label: "කාර්",       src: imgCar    },
      { key: "bus",    label: "බස්",         src: imgBus    },
      { key: "train",  label: "දුම්රිය",    src: imgTrain  },
      { key: "flight", label: "ගුවන් යානය", src: imgFlight },
    ],
    accentColor: "#7C3AED",
    bgFrom: "#EDE9FE",
    bgTo:   "#DDD6FE",
    hint: "වාහන 4ක් කෙළිමේ ගනිමු!",
  },
];

const speakSinhala = (text) => {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "si-LK";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};

const playBeep = (type = "correct") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === "correct" ? "sine" : "triangle";
    osc.frequency.value = type === "correct" ? 880 : 260;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    setTimeout(() => { osc.stop(); ctx.close(); }, 320);
  } catch { /* ignore */ }
};

const fireConfetti = () =>
  confetti({ particleCount: 160, spread: 140, origin: { y: 0.6 } });

/* ── SVG Icons ── */
const LockIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const StarIcon = ({ size = 22, filled = false, color = "#F59E0B" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const TrophyIcon = ({ size = 48, color = "#F59E0B" }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 6h20v16a10 10 0 0 1-20 0V6z" />
    <path d="M14 10H8a6 6 0 0 0 6 6M34 10h6a6 6 0 0 1-6 6" />
    <path d="M24 32v6M18 44h12" />
  </svg>
);
const CheckIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const RefreshIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const ArrowRightIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Sea Background SVGs ── */
const FishSVG = ({ size = 48, color = "#0EA5E9", flip = false }) => (
  <svg viewBox="0 0 80 48" width={size} height={size * 0.6} style={{ transform: flip ? "scaleX(-1)" : "none" }} aria-hidden="true">
    <ellipse cx="46" cy="24" rx="26" ry="16" fill={color} />
    <polygon points="20,24 4,8 4,40" fill={color} opacity="0.85" />
    <circle cx="62" cy="17" r="5" fill="white" />
    <circle cx="63" cy="17" r="2.5" fill="#0C4A6E" />
  </svg>
);
const TinyFishSVG = ({ color = "#0EA5E9" }) => (
  <svg viewBox="0 0 40 25" width="32" height="20" aria-hidden="true">
    <ellipse cx="22" cy="12" rx="14" ry="9" fill={color} />
    <polygon points="8,12 0,4 0,20" fill={color} opacity="0.8" />
    <circle cx="31" cy="9" r="2.5" fill="white" />
    <circle cx="31.5" cy="9" r="1.2" fill="#0C4A6E" />
  </svg>
);
const JellyfishSVG = ({ size = 44, color = "#C084FC", wiggle = false }) => {
  const tentacles = [8, 16, 24, 32, 40, 48];
  return (
    <svg viewBox="0 0 60 90" width={size} height={size * 1.5} aria-hidden="true" overflow="visible">
      <ellipse cx="30" cy="28" rx="26" ry="10" fill={color} opacity="0.25" />
      <path d="M4 30 Q4 2 30 2 Q56 2 56 30 Z" fill={color} opacity="0.80" />
      <path d="M14 25 Q18 8 30 6 Q42 8 46 25" fill="white" opacity="0.18" />
      {tentacles.map((x, i) => (
        <motion.path key={i}
          d={`M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`}
          stroke={color} strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round"
          animate={wiggle ? { d: [
            `M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`,
            `M${x} 30 Q${x+(i%2===0?7:-7)} 52 ${x} 70 Q${x+(i%2===0?-6:6)} 82 ${x} 90`,
            `M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`,
          ]} : {}}
          transition={{ duration: 1.2+i*0.15, delay: i*0.1, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
};
const SeaweedSVG = ({ size = 50, color = "#34D399" }) => (
  <svg viewBox="0 0 30 80" width={size*0.4} height={size} aria-hidden="true">
    <path d="M15 80 Q8 60 15 45 Q22 30 15 15 Q10 5 15 0" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M15 60 Q5 55 8 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M15 35 Q25 30 22 20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);
const StarfishSVG = ({ size = 36, color = "#FB923C" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    {[0,72,144,216,288].map((angle, i) => {
      const rad = (angle*Math.PI)/180;
      return <line key={i} x1="40" y1="40" x2={40+36*Math.cos(rad)} y2={40+36*Math.sin(rad)} stroke={color} strokeWidth="9" strokeLinecap="round" />;
    })}
    <circle cx="40" cy="40" r="10" fill={color} />
    <circle cx="40" cy="40" r="5" fill="white" opacity="0.4" />
  </svg>
);
const ShellSVG = ({ size = 32, color = "#F9A8D4" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    <path d="M40 40 m0,-30 a30,30 0 1,1 0,60 a20,20 0 1,0 0,-40 a10,10 0 1,1 0,20" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9" />
    <circle cx="40" cy="40" r="5" fill={color} opacity="0.9" />
    <circle cx="40" cy="40" r="2" fill="white" opacity="0.6" />
  </svg>
);
const BubbleSVG = ({ size = 16, color = "#93C5FD" }) => (
  <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
    <circle cx="15" cy="15" r="13" fill={color} opacity="0.35" />
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
  { type:"fish",      x:-10, y:28, size:68, color:"#0EA5E9", delay:0,   dur:12, flip:false, opacity:0.75, driftX:"115%", driftY:["0%","4%","-4%","0%"] },
  { type:"fish",      x:-10, y:55, size:52, color:"#FB923C", delay:4,   dur:15, flip:false, opacity:0.70, driftX:"115%", driftY:["0%","-5%","5%","0%"] },
  { type:"fish",      x:110, y:20, size:60, color:"#A78BFA", delay:7,   dur:13, flip:true,  opacity:0.70, driftX:"-115%",driftY:["0%","3%","-3%","0%"] },
  { type:"fish",      x:110, y:65, size:44, color:"#34D399", delay:2,   dur:17, flip:true,  opacity:0.65, driftX:"-115%",driftY:["0%","-4%","4%","0%"] },
  { type:"fish",      x:-10, y:42, size:38, color:"#F472B6", delay:9,   dur:19, flip:false, opacity:0.60, driftX:"115%", driftY:["0%","6%","-6%","0%"] },
  { type:"jellyfish", x:8,   y:55, size:58, color:"#C084FC", delay:0,   dur:8,  opacity:0.72, wiggle:true },
  { type:"jellyfish", x:76,  y:48, size:46, color:"#F9A8D4", delay:3.5, dur:10, opacity:0.65, wiggle:true },
  { type:"jellyfish", x:42,  y:62, size:38, color:"#818CF8", delay:6,   dur:9,  opacity:0.60, wiggle:true },
  { type:"seaweed",   x:3,   y:62, size:75, color:"#34D399", delay:0,   dur:3.0, opacity:0.75 },
  { type:"seaweed",   x:18,  y:66, size:62, color:"#4ADE80", delay:0.8, dur:3.8, opacity:0.65 },
  { type:"seaweed",   x:64,  y:64, size:68, color:"#34D399", delay:1.5, dur:3.2, opacity:0.70 },
  { type:"seaweed",   x:88,  y:67, size:58, color:"#4ADE80", delay:0.3, dur:4.0, opacity:0.65 },
  { type:"starfish",  x:35,  y:79, size:42, color:"#FB923C", delay:0,   dur:4,   opacity:0.75 },
  { type:"starfish",  x:58,  y:82, size:34, color:"#F87171", delay:1.5, dur:5,   opacity:0.70 },
  { type:"shell",     x:46,  y:82, size:34, color:"#F9A8D4", delay:0,   dur:0.4, opacity:0.80 },
  { type:"shell",     x:80,  y:79, size:28, color:"#FDE68A", delay:0.2, dur:0.5, opacity:0.75 },
  { type:"shell",     x:26,  y:83, size:26, color:"#86EFAC", delay:0.1, dur:0.45,opacity:0.70 },
];
const BUBBLES = [
  { x:10, size:18, delay:0,   dur:7   },
  { x:28, size:14, delay:1.5, dur:9   },
  { x:48, size:20, delay:0.5, dur:8   },
  { x:65, size:15, delay:2.5, dur:10  },
  { x:82, size:12, delay:1,   dur:7.5 },
  { x:38, size:10, delay:3.5, dur:11  },
];

const SeaCreature = ({ item }) => {
  if (item.type === "fish") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`, top:`${item.y}%`, opacity:item.opacity }}
      animate={{ x:item.driftX, y:item.driftY }} transition={{ duration:item.dur, delay:item.delay, repeat:Infinity, ease:"linear", times:[0,0.33,0.66,1] }}>
      <motion.div animate={{ rotate:[-3,3,-3] }} transition={{ duration:0.5, repeat:Infinity, ease:"easeInOut" }}>
        <FishSVG size={item.size} color={item.color} flip={item.flip} />
      </motion.div>
    </motion.div>
  );
  if (item.type === "jellyfish") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`, top:`${item.y}%`, opacity:item.opacity }}
      animate={{ y:["0%","-22%","0%"], x:["0%","4%","-4%","0%"] }} transition={{ duration:item.dur, delay:item.delay, repeat:Infinity, ease:"easeInOut" }}>
      <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:item.dur*0.5, repeat:Infinity, ease:"easeInOut" }}>
        <JellyfishSVG size={item.size} color={item.color} wiggle={item.wiggle} />
      </motion.div>
    </motion.div>
  );
  if (item.type === "seaweed") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`, top:`${item.y}%`, opacity:item.opacity, transformOrigin:"50% 100%" }}
      animate={{ rotate:[-14,14,-14] }} transition={{ duration:item.dur, delay:item.delay, repeat:Infinity, ease:"easeInOut" }}>
      <SeaweedSVG size={item.size} color={item.color} />
    </motion.div>
  );
  if (item.type === "starfish") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`, top:`${item.y}%`, opacity:item.opacity }}
      animate={{ rotate:[0,15,-15,8,-8,0], scale:[1,1.1,1] }} transition={{ duration:item.dur, delay:item.delay, repeat:Infinity, ease:"easeInOut" }}>
      <StarfishSVG size={item.size} color={item.color} />
    </motion.div>
  );
  if (item.type === "shell") return (
    <motion.div className="absolute pointer-events-none" style={{ left:`${item.x}%`, top:`${item.y}%`, opacity:item.opacity }}
      animate={{ rotate:[-12,12,-12], x:[-3,3,-3] }} transition={{ duration:item.dur, delay:item.delay, repeat:Infinity, ease:"easeInOut" }}>
      <ShellSVG size={item.size} color={item.color} />
    </motion.div>
  );
  return null;
};

const AnimatedSeaBackground = ({ level }) => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
    <div className="absolute inset-0" style={{ background: level===3
      ? "linear-gradient(180deg,#1e3a5f 0%,#164e63 35%,#0e7490 65%,#155e75 100%)"
      : "linear-gradient(180deg,#bae6fd 0%,#7dd3fc 30%,#38bdf8 60%,#0ea5e9 100%)" }} />
    <motion.div className="absolute top-[-60px] left-1/2 -translate-x-1/2 rounded-full"
      style={{ width:320, height:320, background:"radial-gradient(circle,rgba(255,255,200,0.18) 0%,transparent 70%)" }}
      animate={{ scale:[1,1.08,1], opacity:[0.7,1,0.7] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }} />
    {SEA_CREATURES.map((item, i) => <SeaCreature key={i} item={item} />)}
    {BUBBLES.map((b, i) => (
      <motion.div key={i} className="absolute pointer-events-none" style={{ left:`${b.x}%`, bottom:"5%" }}
        animate={{ y:[0,-(typeof window!=="undefined"?window.innerHeight*0.85:600)], opacity:[0,0.7,0.5,0] }}
        transition={{ duration:b.dur, delay:b.delay, repeat:Infinity, ease:"easeOut" }}>
        <BubbleSVG size={b.size} color="#93C5FD" />
      </motion.div>
    ))}
    <WaveStrip y={8}  opacity={0.18} color="#0284C7" duration={8}  />
    <WaveStrip y={4}  opacity={0.13} color="#0369A1" duration={12} />
    <WaveStrip y={0}  opacity={0.22} color="#075985" duration={6}  />
    <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background:"linear-gradient(0deg,#92400E55,transparent)" }} />
  </div>
);

/* ── Timeline Bar ── */
const FriendlyTimerBar = ({ durationMs, running, color="#0284C7", label="" }) => {
  const [pct, setPct] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!running) { setPct(0); return; }
    startRef.current = Date.now();
    const tick = () => {
      const p = Math.min(100,((Date.now()-startRef.current)/durationMs)*100);
      setPct(p);
      if (p<100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, durationMs]);
  return (
    <div className="w-full flex flex-col items-center gap-1">
      {label && <p className="text-xs font-bold" style={{ color }}>{label}</p>}
      <div className="relative w-full h-8 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.55)", border:`2px solid ${color}44` }}>
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}55,${color}99)`, transition:"width 0.1s linear" }}>
          <motion.div className="absolute right-0 inset-y-0 w-6" style={{ background:`radial-gradient(ellipse at right,${color}44,transparent)` }}
            animate={{ opacity:[0.4,0.8,0.4] }} transition={{ duration:0.9, repeat:Infinity }} />
        </div>
        {[20,50,78].map((bx,i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ width:5,height:5,left:`${bx}%`,top:"50%",background:color,opacity:0,transform:"translateY(-50%)",display:pct>bx?"block":"none" }}
            animate={{ y:["-50%","-180%"],opacity:[0,0.55,0] }} transition={{ duration:1.5,delay:i*0.5,repeat:Infinity,ease:"easeOut" }} />
        ))}
        <div className="absolute top-1/2" style={{ left:`calc(${pct}% - 20px)`,transform:"translateY(-50%)",transition:"left 0.15s linear",pointerEvents:"none" }}>
          <TinyFishSVG color={color} />
        </div>
      </div>
    </div>
  );
};

/* ── Stars row ── */
const StarsRow = ({ accuracy }) => {
  const count = accuracy>=90?3:accuracy>=60?2:accuracy>=35?1:0;
  return (
    <div className="flex items-center justify-center gap-2">
      {[0,1,2].map(i => <StarIcon key={i} size={32} filled={i<count} color="#F59E0B" />)}
    </div>
  );
};

/* ── Level dot ── */
const LevelDot = ({ lvl, state, onClick }) => {
  const bg = state==="locked"?"bg-white/40 text-gray-400":state==="completed"?"bg-emerald-400 text-white":"bg-amber-400 text-amber-900 ring-4 ring-amber-200";
  return (
    <motion.button whileHover={{ scale:state==="locked"?1:1.08 }} whileTap={{ scale:state==="locked"?1:0.92 }}
      onClick={onClick} className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold shadow-lg backdrop-blur-sm ${bg}`}>
      {state==="locked"?<LockIcon size={22}/>:state==="completed"?<CheckIcon size={20}/>:lvl}
    </motion.button>
  );
};

/* ── Final Summary ── */
const FinalSummaryPopup = ({ levelStats, onClose }) => {
  const total = Math.round(levelStats.reduce((s,x)=>s+(x.accuracy??0),0)/levelStats.length);
  const msg = total>=85?{ s:"බොහොම ලොකු ජය! ඔබ ශූරයෙක්!", c:"text-emerald-700", bg:"from-emerald-100 to-teal-100" }
    :total>=65?{ s:"ගොඩක් හොඳයි! අපි ජයගත්තා!",  c:"text-sky-700",   bg:"from-sky-100 to-cyan-100"     }
    :total>=40?{ s:"හොඳ උත්සාහයක්! නැවත කරන්න!",  c:"text-amber-700", bg:"from-amber-100 to-yellow-100" }
    :          { s:"නැවත කරන්න — ඔබට පුළුවන්!",   c:"text-rose-700",  bg:"from-rose-100 to-pink-100"    };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity:0,scale:0.7,y:60 }} animate={{ opacity:1,scale:1,y:0 }} exit={{ opacity:0,scale:0.7,y:60 }}
        transition={{ type:"spring",stiffness:220,damping:20 }} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <TrophyIcon size={56} color="#F59E0B" />
          <h2 className="mt-3 text-2xl font-extrabold text-purple-700">සියලු මට්ටම් ජය ගත්තා!</h2>
          <div className={`mt-4 rounded-2xl bg-gradient-to-r ${msg.bg} p-4`}>
            <div className={`text-lg font-extrabold ${msg.c}`}>{msg.s}</div>
            <div className="mt-2 text-5xl font-extrabold text-gray-900">{total}%</div>
            <div className="text-sm font-semibold text-gray-500 mt-1">සමස්ත නිරවද්‍යතාව</div>
            <div className="mt-3"><StarsRow accuracy={total} /></div>
          </div>
          <div className="mt-4 space-y-2">
            {LEVELS.map((l,i) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-xs text-white font-bold" style={{ background:l.difficultyBg }}>{l.name}</span>
                  <span className="text-gray-500">{l.difficulty}</span>
                </div>
                <span className="font-extrabold text-purple-700">{levelStats[i]?.accuracy??0}%</span>
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onClose}
            className="mt-5 w-full rounded-full py-4 text-lg font-extrabold text-gray-900 shadow-lg flex items-center justify-center gap-2" style={{ background:"#FCD34D" }}>
            <RefreshIcon size={20} /> නැවත කෙළිමු
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Item card (image) ── */
const ItemCard = ({ item, onClick, disabled }) => (
  <motion.button whileHover={disabled?{}:{ scale:1.1,y:-4 }} whileTap={disabled?{}:{ scale:0.92 }}
    onClick={onClick} disabled={disabled}
    className="flex flex-col items-center gap-1 rounded-2xl p-2 shadow-lg"
    style={{ background:"rgba(255,255,255,0.82)", border:"2px solid rgba(255,255,255,0.6)", backdropFilter:"blur(6px)" }}>
    <img src={item.src} alt={item.label} className="h-16 w-16 object-contain rounded-xl"
      onError={e=>{ e.target.style.display="none"; }} />
    <span className="text-xs font-bold text-gray-700">{item.label}</span>
  </motion.button>
);

/* ── Showing display ── */
const ShowingDisplay = ({ item, cfg }) => (
  <motion.div key={item?.key}
    initial={{ opacity:0,scale:0.5,rotate:-8 }} animate={{ opacity:1,scale:1.1,rotate:0 }} exit={{ opacity:0,scale:0.5 }}
    transition={{ type:"spring",stiffness:260,damping:18 }} className="flex flex-col items-center gap-3">
    <div className="rounded-3xl p-4 shadow-xl" style={{ background:`linear-gradient(135deg,${cfg.bgFrom},${cfg.bgTo})`, border:`3px solid ${cfg.accentColor}44` }}>
      <img src={item.src} alt={item.label} className="h-28 w-28 object-contain rounded-2xl" />
    </div>
    <span className="text-xl font-extrabold text-white drop-shadow">{item.label}</span>
  </motion.div>
);

/* ── Level complete card ── */
const LevelCompleteCard = ({ cfg, accuracy, onNext, onRetry, isLast }) => (
  <motion.div initial={{ opacity:0,scale:0.85 }} animate={{ opacity:1,scale:1 }}
    className="rounded-3xl p-6 shadow-xl text-center" style={{ background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)" }}>
    <TrophyIcon size={48} color="#F59E0B" />
    <div className="mt-2 text-2xl font-extrabold" style={{ color:cfg.accentColor }}>{cfg.name} — ජය ගත්තා!</div>
    <div className="mt-4 rounded-2xl p-4" style={{ background:`linear-gradient(135deg,${cfg.bgFrom},${cfg.bgTo})` }}>
      <div className="text-sm font-bold text-gray-600">නිරවද්‍යතාව</div>
      <div className="text-5xl font-extrabold mt-1" style={{ color:cfg.accentColor }}>{accuracy}%</div>
      <div className="mt-3"><StarsRow accuracy={accuracy} /></div>
      <div className="mt-3 h-4 w-full rounded-full bg-white/60 overflow-hidden">
        <motion.div className="h-4 rounded-full" style={{ background:cfg.accentColor }}
          initial={{ width:0 }} animate={{ width:`${accuracy}%` }} transition={{ duration:1,ease:"easeOut" }} />
      </div>
    </div>
    <div className="mt-5 flex justify-center gap-3 flex-wrap">
      <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onRetry}
        className="flex items-center gap-2 rounded-full px-6 py-3 text-lg font-extrabold shadow-lg text-white" style={{ background:"#F472B6" }}>
        <RefreshIcon size={18} /> නැවත
      </motion.button>
      {!isLast && (
        <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={onNext}
          className="flex items-center gap-2 rounded-full px-6 py-3 text-lg font-extrabold shadow-lg text-gray-900" style={{ background:"#FCD34D" }}>
          ඉදිරියට <ArrowRightIcon size={18} />
        </motion.button>
      )}
    </div>
  </motion.div>
);

/* ── Round dots ── */
const RoundDots = ({ total, done }) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length:total },(_,i)=>(
      <motion.div key={i} className="rounded-full"
        style={{ width:14,height:14, background:i<done?"#22C55E":"rgba(255,255,255,0.4)", border:"2px solid rgba(255,255,255,0.6)" }}
        animate={i===done-1?{ scale:[1,1.4,1] }:{}} transition={{ duration:0.4 }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const SequenceRecallGame = ({ level: providedLevel=1, initialLevel, onComplete=null, gameId="sequence-recall" }) => {
  const startLevel = initialLevel ?? providedLevel;
  const { initializeGame, isLevelUnlocked, isLevelCompleted, completeLevel, updateLevelProgress, getLevelStats } = useProgress();

  const [level, setLevel]           = useState(startLevel);
  const cfg = LEVELS[Math.max(0, Math.min(LEVELS.length-1, level-1))];

  const [phase, setPhase]             = useState("intro");
  const [roundIndex, setRoundIndex]   = useState(0);
  const [sequence, setSequence]       = useState([]);
  const [showIdx, setShowIdx]         = useState(0);
  const [inputIndex, setInputIndex]   = useState(0);
  const [attempts, setAttempts]       = useState(0);
  const [correctSeqs, setCorrectSeqs] = useState(0);
  const [feedback, setFeedback]       = useState(null);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [allLevelStats, setAllLevelStats]       = useState([]);

  const timeoutRefs = useRef([]);

  useEffect(() => {
    initializeGame(gameId);
    resetAll();
    return () => { timeoutRefs.current.forEach(clearTimeout); speechSynthesis.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const after = (ms, fn) => { const id=setTimeout(fn,ms); timeoutRefs.current.push(id); };
  const clearAll = () => { timeoutRefs.current.forEach(clearTimeout); timeoutRefs.current=[]; speechSynthesis.cancel(); };

  const resetAll = () => {
    clearAll();
    setPhase("intro"); setRoundIndex(0); setSequence([]); setShowIdx(0);
    setInputIndex(0); setAttempts(0); setCorrectSeqs(0); setFeedback(null);
  };

  const buildSeq = () => Array.from({ length:cfg.seqLen },()=>cfg.items[Math.floor(Math.random()*cfg.items.length)]);

  const startRound = () => {
    const s = buildSeq();
    setSequence(s); setInputIndex(0); setPhase("showing"); setShowIdx(0);
    speakSinhala("බලන්න — මතක තබා ගන්න");
    s.forEach((item,i) => after(i*cfg.speedMs, () => { setShowIdx(i); speakSinhala(item.label); }));
    after(s.length*cfg.speedMs+400, () => { setPhase("input"); speakSinhala("දැන් ක්ලික් කරන්න"); });
  };

  const handlePick = (item) => {
    if (phase !== "input") return;
    const expected = sequence[inputIndex];
    setAttempts(v=>v+1);
    if (item.key === expected.key) {
      playBeep("correct"); speakSinhala(item.label); setFeedback("correct");
      after(400, ()=>setFeedback(null));
      const nextInput = inputIndex+1;
      setInputIndex(nextInput);
      if (nextInput >= sequence.length) {
        const nextRound = roundIndex+1;
        const nextCorrect = correctSeqs+1;
        setCorrectSeqs(nextCorrect);
        if (nextRound >= cfg.rounds) { finishLevel(attempts+1, nextCorrect); return; }
        setRoundIndex(nextRound);
        after(700, startRound);
      }
    } else {
      playBeep("wrong"); setFeedback("wrong"); speakSinhala("නැවත උත්සාහ කරන්න");
      after(500, ()=>setFeedback(null));
    }
  };

  const finishLevel = (totalAttempts, totalCorrect) => {
    const accuracy = Math.round((totalCorrect/cfg.rounds)*100);
    const stats = { accuracy, attempts:totalAttempts, correctSeqs:totalCorrect };
    completeLevel(gameId, level, stats);
    updateLevelProgress(gameId, level, 100, stats);
    if (onComplete) onComplete(level, stats);
    setPhase("levelComplete");
    fireConfetti();
    if (level === LEVELS.length) {
      const updated = LEVELS.map((l) => l.id===level ? stats : (getLevelStats(gameId,l.id)||{ accuracy:0 }));
      setAllLevelStats(updated);
      after(2000, ()=>setShowFinalSummary(true));
    }
  };

  const currentItem  = phase==="showing" ? sequence[showIdx] : null;
  const liveAccuracy = Math.round((correctSeqs/Math.max(roundIndex,1))*100);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ zIndex:1 }}>
      <AnimatedSeaBackground level={level} />
      <AnimatePresence>
        {showFinalSummary && (
          <FinalSummaryPopup levelStats={allLevelStats}
            onClose={()=>{ setShowFinalSummary(false); setLevel(1); resetAll(); }} />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen p-3 md:p-5 gap-4 md:gap-6">

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 pt-4">
          {LEVELS.map(l => {
            const unlocked  = isLevelUnlocked(gameId,l.id);
            const completed = isLevelCompleted(gameId,l.id);
            const isCurrent = l.id===level;
            const state = !unlocked?"locked":completed?"completed":isCurrent?"current":"unlocked";
            return (
              <div key={l.id} className="flex flex-col items-center gap-1">
                <LevelDot lvl={l.id} state={state} onClick={()=>unlocked&&setLevel(l.id)} />
                <span className="text-xs font-bold text-white drop-shadow" style={{ maxWidth:56,textAlign:"center" }}>{l.name}</span>
                {completed && (
                  <span className="text-xs font-extrabold rounded-full px-2 py-0.5 bg-white/80 text-emerald-700">
                    {getLevelStats(gameId,l.id)?.accuracy??0}%
                  </span>
                )}
              </div>
            );
          })}
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col gap-3 max-w-lg mx-auto w-full">

          {/* Header */}
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between"
            style={{ background:"rgba(255,255,255,0.75)",backdropFilter:"blur(10px)" }}>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">අනුක්‍රම මතකය</p>
              <p className="text-lg font-extrabold" style={{ color:cfg.accentColor }}>{cfg.name}</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white shadow" style={{ background:cfg.difficultyBg }}>
              {cfg.difficulty}
            </span>
          </div>

          {/* Progress bar */}
          <div className="rounded-2xl px-4 py-3 flex flex-col gap-2"
            style={{ background:"rgba(255,255,255,0.72)",backdropFilter:"blur(10px)" }}>
            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
              <span>වටය {Math.min(roundIndex+1,cfg.rounds)} / {cfg.rounds}</span>
              <span>නිරවද්‍යතාව: <span className="text-base font-extrabold" style={{ color:cfg.accentColor }}>{liveAccuracy}%</span></span>
            </div>
            <RoundDots total={cfg.rounds} done={roundIndex} />
          </div>

          {/* Game phases */}
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {phase==="intro" && (
              <motion.div key="intro" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-20 }}
                className="rounded-3xl p-6 text-center shadow-xl flex flex-col gap-4"
                style={{ background:"rgba(255,255,255,0.88)",backdropFilter:"blur(12px)" }}>
                <div className="text-2xl font-extrabold" style={{ color:cfg.accentColor }}>{cfg.name} — මට්ටම {cfg.id}</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {cfg.items.map(item=>(
                    <div key={item.key} className="flex flex-col items-center gap-1 rounded-xl p-2 bg-white/70">
                      <img src={item.src} alt={item.label} className="h-12 w-12 object-contain rounded-lg" />
                      <span className="text-xs font-bold text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-3 text-left text-sm font-semibold text-gray-700 space-y-1"
                  style={{ background:`linear-gradient(135deg,${cfg.bgFrom},${cfg.bgTo})` }}>
                  <p>• {cfg.seqLen}ක් පෙන්වයි — ඒ අනුපිළිවෙලම මතක තබා ගන්න</p>
                  <p>• ඊළඟට නිවැරදි රූප ඒ අනුපිළිවෙලට ක්ලික් කරන්න</p>
                  <p>• {cfg.rounds} වටයක් කෙළිය යුතුයි</p>
                </div>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={()=>{ setPhase("idle"); startRound(); }}
                  className="rounded-full py-4 text-xl font-extrabold text-white shadow-lg" style={{ background:cfg.accentColor }}>
                  ක්‍රීඩා කරමු!
                </motion.button>
              </motion.div>
            )}

            {/* SHOWING */}
            {phase==="showing" && (
              <motion.div key="showing" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="rounded-3xl p-6 flex flex-col items-center gap-5 shadow-xl"
                style={{ background:"rgba(255,255,255,0.88)",backdropFilter:"blur(12px)" }}>
                <p className="text-sm font-extrabold text-gray-600">{showIdx+1} / {sequence.length} — මතක තබා ගන්න!</p>
                <div className="flex h-52 items-center justify-center w-full rounded-3xl"
                  style={{ background:`linear-gradient(135deg,${cfg.bgFrom},${cfg.bgTo})` }}>
                  <AnimatePresence mode="wait">
                    {currentItem && <ShowingDisplay key={currentItem.key+showIdx} item={currentItem} cfg={cfg} />}
                  </AnimatePresence>
                </div>
                <FriendlyTimerBar durationMs={sequence.length*cfg.speedMs+400} running={phase==="showing"} color={cfg.accentColor} label="බලන්න..." />
              </motion.div>
            )}

            {/* INPUT */}
            {phase==="input" && (
              <motion.div key="input" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                className="rounded-3xl p-5 flex flex-col gap-4 shadow-xl"
                style={{ background:"rgba(255,255,255,0.88)",backdropFilter:"blur(12px)" }}>
                {/* Sequence hint */}
                <div className="flex items-center justify-center gap-2">
                  {sequence.map((item,i)=>(
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ background:i<inputIndex?`linear-gradient(135deg,${cfg.bgFrom},${cfg.bgTo})`:"rgba(200,200,200,0.3)",
                          border:i===inputIndex?`2px solid ${cfg.accentColor}`:"2px solid transparent" }}>
                        {i<inputIndex
                          ? <img src={item.src} alt={item.label} className="h-9 w-9 object-contain rounded-lg" />
                          : <div className="h-6 w-6 rounded-full" style={{ background:"rgba(150,150,150,0.3)" }} />}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm font-extrabold" style={{ color:cfg.accentColor }}>{inputIndex+1} වැනි රූපය ක්ලික් කරන්න!</p>
                <AnimatePresence>
                  {feedback && (
                    <motion.div key={feedback} initial={{ opacity:0,scale:0.7 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0 }}
                      className="text-center text-lg font-extrabold rounded-xl py-2"
                      style={{ color:feedback==="correct"?"#16A34A":"#DC2626", background:feedback==="correct"?"#DCFCE7":"#FEE2E2" }}>
                      {feedback==="correct"?"නිවැරදි!":"නැවත උත්සාහ කරන්න!"}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className={`grid gap-3 ${cfg.items.length<=4?"grid-cols-2":cfg.items.length<=6?"grid-cols-3":"grid-cols-4"}`}>
                  {cfg.items.map(item=>(
                    <ItemCard key={item.key} item={item} onClick={()=>handlePick(item)} disabled={false} />
                  ))}
                </div>
                <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.94 }} onClick={resetAll}
                  className="flex items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-white shadow" style={{ background:"#F472B6" }}>
                  <RefreshIcon size={16} /> නැවතත් ආරම්භ
                </motion.button>
              </motion.div>
            )}

            {/* LEVEL COMPLETE */}
            {phase==="levelComplete" && (
              <motion.div key="complete" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <LevelCompleteCard cfg={cfg} accuracy={Math.round((correctSeqs/cfg.rounds)*100)}
                  onNext={()=>setLevel(v=>Math.min(LEVELS.length,v+1))} onRetry={resetAll} isLast={level===LEVELS.length} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default SequenceRecallGame;
