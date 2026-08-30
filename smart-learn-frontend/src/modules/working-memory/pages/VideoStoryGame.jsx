/**
 * VideoStoryGame — "වනාන්තර කතාව" (Jungle Story)
 * Working Memory + Comprehension  |  Sinhala UI  |  Ages 6–8
 *
 * Flow:
 *   Step 1 → Play jungle1.mp4
 *   Step 2 → Questions about Part 1 (must answer correctly to proceed)
 *   Step 3 → Play jungle2.mp4
 *   Step 4 → Questions about Part 2 (must answer correctly to proceed)
 *   Step 5 → Final score / celebration screen
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";
import { adaptVideoStoryConfig, adaptVideoStoryQuestionSet } from "../utils/adaptiveDifficulty";
import useResponsive from '../hooks/useResponsive';
import { awardStar } from "../components/StarRewardSystem";

// --- Video Assets ---
import jungle1 from "../assets/jungle1.mp4";
import jungle2 from "../assets/jungle2.mp4";
import levelUpSound from "../assets/level-up.mp3";
import storyInstrAudio from "../assets/story.mp3";
import storyWhaleBookBoard from "../assets/story-whale-book-board-generated.png";
import { AnimatedSeaBg as SequenceRecallSeaBg } from "./SequenceRecallGame";

// --- Per-question voice audio ---
import q1Audio from "../assets/1.m4a_clean (1).mp3.mpeg";
import q2Audio from "../assets/2.m4a_clean.mp3.mpeg";
import q3Audio from "../assets/3.m4a_clean (1).mp3.mpeg";
import q4Audio from "../assets/4.m4a_clean.mp3.mpeg";
import q5Audio from "../assets/5.m4a_clean.mp3.mpeg";
import q6Audio from "../assets/6.m4a_clean.mp3.mpeg";
import q7Audio from "../assets/7.m4a_clean.mp3.mpeg";
import q8Audio from "../assets/8.m4a_clean.mp3.mpeg";
import q9Audio from "../assets/9.m4a_clean.mp3.mpeg";

// --- Mascot Assets ---
import imgDolphin   from "../assets/dolphin.png";
import imgMermaid   from "../assets/mermaid.png";
import imgPuffefish from "../assets/puffefish.png";
import imgSeahorse  from "../assets/seahorse.png";

const GAME_ID = "video-story";

// ─────────────────────────────────────────────────────────────────
//  QUESTION DATA (Sinhala)
//  Part 1 → jungle1.mp4 comprehension questions
//  Part 2 → jungle2.mp4 comprehension questions
// ─────────────────────────────────────────────────────────────────
const PART1_QUESTIONS = [
  {
    id: "p1q1",
    question: "වීඩියෝ එකේ කොහේ සිදුවීම් දිස්වූවාද?",
    options: ["වනාන්තරයේ", "මුහුදේ", "කඳු මුදුනේ", "නගරයේ"],
    correct: 0,
    audio: q1Audio,
  },
  {
    id: "p1q2",
    question: "වීඩියෝ එකේ ඉන්න සතුන් කවුද?",
    options: ["අලියා, වඳුරා, මුවා", "සිංහයා, ගෝනා, නරියා", "අලියා, ගෝනා, සිංහයා", "කුකුළා, බල්ලා, ඌරා"],
    correct: 0,
    audio: q2Audio,
  },
  {
    id: "p1q3",
    question: "ශබ්දය ඇහෙන්නේ කොයි දිසාවෙන් ද?",
    options: ["ගමෙන්", "ගෙදරින්", "කැලෑවෙන්", "ගඟෙන්"],
    correct: 2,
    audio: q3Audio,
  },
  {
    id: "p1q4",
    question: "කැලෑවෙන් ශබ්දය ඇහෙන්නේ කාටද?",
    options: ["අලියාට", "වඳුරාට", "සිංහයාට", "මුවාට"],
    correct: 3,
    audio: q4Audio,
  },
  {
    id: "p1q5",
    question: "වීඩියෝවට අනුව හොඳට කන් ඇහෙන්නේ කාටද?",
    options: ["අලියාට", "වඳුරාට", "සිංහයාට", "මුවාට"],
    correct: 3,
    audio: q5Audio,
  },
];

const PART2_QUESTIONS = [
  {
    id: "p2q1",
    question: "ශබ්දය ඇසෙන දිහාවට ගිය විට යාලුවෝ තුන් දෙනා දුටුවේ කුමක්ද?",
    options: ["අලි පැටියෙක්", "වඳුරෙක්", "කොටි පැටියෙක්", "මුවෙක්"],
    correct: 2,
    audio: q6Audio,
  },
  {
    id: "p2q2",
    question: "කොටි පැටියා කරදරේ වැටිලා සිටියේ කුමන තැනකද?",
    options: ["ගසක", "ගල් ගුහාවක", "වතුර වලක", "කුඹුරක"],
    correct: 2,
    audio: q7Audio,
  },
  {
    id: "p2q3",
    question: "කොටි පැටියාට ගොඩට ඒමට කොටයක් විසි කරේ කවුද?",
    options: ["වඳුරා", "මුවා", "අලියා", "සිංහයා"],
    correct: 2,
    audio: q8Audio,
  },
  {
    id: "p2q4",
    question: "කොටි පැටියා බේරා ගැනීමෙන් පසු යාලුවෝ හතර දෙනා කොහෙද ගියේ?",
    options: ["ගඟ අද්දරට", "ගෙදරට", "කොටි පැටියාගේ දෙමාපියො බැලීමට", "කෑම සොයන්න"],
    correct: 2,
    audio: q9Audio,
  },
];

// ─────────────────────────────────────────────────────────────────
//  AUDIO HELPERS
// ─────────────────────────────────────────────────────────────────
// TTS removed — per-question .mpeg audio files used instead

// playLevelUp kept for potential reuse

const beep = (type = "correct") => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === "correct" ? "sine" : "triangle";
    osc.frequency.value = type === "correct" ? 880 : 260;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    setTimeout(() => { osc.stop(); ctx.close(); }, 360);
  } catch { /* ignore */ }
};

// ─────────────────────────────────────────────────────────────────
//  SVG ICONS
// ─────────────────────────────────────────────────────────────────
const PlayIcon    = ({ size=28, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const CheckIcon   = ({ size=28, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon       = ({ size=28, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const HomeIcon    = ({ size=22, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const RetryIcon   = ({ size=22, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5"/></svg>;
const TrophyIcon  = ({ size=80, color="#F59E0B" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4.5A2.5 2.5 0 0 0 2 6.5v0A2.5 2.5 0 0 0 4.5 9H7"/><path d="M17 4h2.5A2.5 2.5 0 0 1 22 6.5v0A2.5 2.5 0 0 1 19.5 9H17"/><rect x="7" y="2" width="10" height="11" rx="2"/></svg>;
const StarIcon    = ({ size=36, filled=false }) => <svg viewBox="0 0 24 24" width={size} height={size} fill={filled?"#F59E0B":"none"} stroke="#F59E0B" strokeWidth="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const VideoIcon   = ({ size=28, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const QuizIcon    = ({ size=28, color="white" }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"/></svg>;

// ─────────────────────────────────────────────────────────────────
//  SEA BACKGROUND (minimal version)
// ─────────────────────────────────────────────────────────────────
const FishSVG  = ({ size=52, color="#0EA5E9", flip=false }) => (
  <svg viewBox="0 0 80 48" width={size} height={size*0.6} style={{ transform:flip?"scaleX(-1)":"none" }} aria-hidden="true">
    <ellipse cx="46" cy="24" rx="26" ry="16" fill={color}/>
    <polygon points="20,24 4,8 4,40" fill={color} opacity="0.85"/>
    <circle cx="62" cy="17" r="5" fill="white"/>
    <circle cx="63" cy="17" r="2.5" fill="#0C4A6E"/>
  </svg>
);
const SeaweedSVG = ({ size=56, color="#34D399" }) => (
  <svg viewBox="0 0 30 80" width={size*0.38} height={size} aria-hidden="true">
    <path d="M15 80 Q8 60 15 45 Q22 30 15 15 Q10 5 15 0" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M15 60 Q5 55 8 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M15 35 Q25 30 22 20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
  </svg>
);
const BubbleSVG = ({ size=16 }) => (
  <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
    <circle cx="15" cy="15" r="13" fill="#93C5FD" opacity="0.35"/>
    <circle cx="15" cy="15" r="13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="9" cy="9" r="4" fill="white" opacity="0.4"/>
  </svg>
);
const WaveStrip = ({ y, opacity, color, duration }) => (
  <motion.div className="absolute w-full pointer-events-none" style={{ bottom:`${y}%`, opacity, height:28 }}
    animate={{ x:[0,-60,0] }} transition={{ duration, repeat:Infinity, ease:"linear" }}>
    <svg viewBox="0 0 400 28" width="400%" height="28" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 14 Q50 0 100 14 Q150 28 200 14 Q250 0 300 14 Q350 28 400 14 L400 28 L0 28 Z" fill={color}/>
    </svg>
  </motion.div>
);

const FISH_LIST = [
  { x:-10, y:22, size:60, color:"#0EA5E9", delay:0,  dur:14, flip:false, opacity:0.70, driftX:"115%",  driftY:["0%","4%","-4%","0%"] },
  { x:110, y:45, size:44, color:"#A78BFA", delay:5,  dur:15, flip:true,  opacity:0.62, driftX:"-115%", driftY:["0%","3%","-3%","0%"] },
  { x:-10, y:60, size:36, color:"#F472B6", delay:9,  dur:19, flip:false, opacity:0.55, driftX:"115%",  driftY:["0%","6%","-6%","0%"] },
];
const BUBBLE_LIST = [
  { x:12, size:16, delay:0,   dur:7  },
  { x:34, size:12, delay:1.5, dur:9  },
  { x:56, size:18, delay:0.7, dur:8  },
  { x:78, size:13, delay:2.8, dur:11 },
];
const SEAWEED_LIST = [
  { x:2,  y:64, size:70, color:"#34D399", delay:0,   dur:3.2 },
  { x:20, y:68, size:56, color:"#4ADE80", delay:0.9, dur:3.7 },
  { x:66, y:65, size:62, color:"#34D399", delay:1.4, dur:3.0 },
  { x:88, y:68, size:52, color:"#4ADE80", delay:0.2, dur:4.1 },
];

export const AnimatedSeaBg = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
    <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,#bae6fd 0%,#7dd3fc 28%,#38bdf8 58%,#0ea5e9 100%)" }}/>
    <motion.div className="absolute top-[-60px] left-1/2 -translate-x-1/2 rounded-full"
      style={{ width:400,height:400,background:"radial-gradient(circle,rgba(255,255,200,0.15) 0%,transparent 70%)" }}
      animate={{ scale:[1,1.07,1],opacity:[0.6,1,0.6] }} transition={{ duration:4,repeat:Infinity,ease:"easeInOut" }}/>
    {FISH_LIST.map((f,i) => (
      <motion.div key={i} className="absolute pointer-events-none" style={{ left:`${f.x}%`, top:`${f.y}%`, opacity:f.opacity }}
        animate={{ x:f.driftX, y:f.driftY }} transition={{ duration:f.dur, delay:f.delay, repeat:Infinity, ease:"linear", times:[0,0.33,0.66,1] }}>
        <motion.div animate={{ rotate:[-3,3,-3] }} transition={{ duration:0.5, repeat:Infinity, ease:"easeInOut" }}>
          <FishSVG size={f.size} color={f.color} flip={f.flip}/>
        </motion.div>
      </motion.div>
    ))}
    {SEAWEED_LIST.map((s,i) => (
      <motion.div key={i} className="absolute pointer-events-none" style={{ left:`${s.x}%`, top:`${s.y}%`, opacity:0.65, transformOrigin:"50% 100%" }}
        animate={{ rotate:[-14,14,-14] }} transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:"easeInOut" }}>
        <SeaweedSVG size={s.size} color={s.color}/>
      </motion.div>
    ))}
    {BUBBLE_LIST.map((b,i) => (
      <motion.div key={i} className="absolute pointer-events-none" style={{ left:`${b.x}%`, bottom:"4%" }}
        animate={{ y:[0,-580], opacity:[0,0.65,0.45,0] }} transition={{ duration:b.dur, delay:b.delay, repeat:Infinity, ease:"easeOut" }}>
        <BubbleSVG size={b.size}/>
      </motion.div>
    ))}
    <WaveStrip y={8} opacity={0.18} color="#0284C7" duration={8}/>
    <WaveStrip y={4} opacity={0.12} color="#0369A1" duration={12}/>
    <WaveStrip y={0} opacity={0.20} color="#075985" duration={6}/>
    <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background:"linear-gradient(0deg,#92400E33,transparent)" }}/>
  </div>
);

// ─────────────────────────────────────────────────────────────────
//  PROGRESS STEPS BAR
// ─────────────────────────────────────────────────────────────────
const STEPS = [
  { label:"1 කොටස",  icon:"video" },
  { label:"ප්‍රශ්න 1", icon:"quiz"  },
  { label:"2 කොටස",  icon:"video" },
  { label:"ප්‍රශ්න 2", icon:"quiz"  },
];

const StepBar = ({ currentStep }) => (
  <div className="w-full flex items-center justify-between gap-1">
    {STEPS.map((s, i) => {
      const done   = i < currentStep;
      const active = i === currentStep;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1 flex-1">
            <motion.div animate={active ? { scale:[1,1.12,1] } : {}} transition={{ duration:1.2, repeat:Infinity, ease:"easeInOut" }}
              className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-md"
              style={{
                background: done ? "#22C55E" : active ? "#0284C7" : "rgba(255,255,255,0.40)",
                border: active ? "3px solid white" : "2px solid rgba(255,255,255,0.55)",
                color: (done || active) ? "white" : "rgba(255,255,255,0.70)",
              }}>
              {done
                ? <CheckIcon size={18} color="white"/>
                : s.icon === "video"
                  ? <VideoIcon size={16} color={(done||active)?"white":"rgba(255,255,255,0.70)"}/>
                  : <QuizIcon  size={16} color={(done||active)?"white":"rgba(255,255,255,0.70)"}/>}
            </motion.div>
            <span className="text-xs font-bold text-white/90 text-center leading-tight">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-1 flex-1 rounded-full mb-4" style={{ background: i < currentStep ? "#22C55E" : "rgba(255,255,255,0.30)" }}/>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────
//  VIDEO PLAYER SCREEN
// ─────────────────────────────────────────────────────────────────
const VideoScreen = ({ src, partLabel, mascot, accentColor, onEnded }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ended,   setEnded]   = useState(false);
  const [ready,   setReady]   = useState(false);

  const { isMobile } = useResponsive();

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setEnded(true);
  };

  return (
    <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
      className="flex flex-col items-center gap-5 w-full rounded-3xl overflow-hidden relative"
      style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)",
        border:`3px solid ${accentColor}44`, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", padding:"2rem" }}>

      {/* Floating mascot */}
      {mascot && (
        <motion.img src={mascot} alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width: isMobile ? 72 : 110, right: -12, top: 12, opacity: 0.85, zIndex: 0 }}
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
      )}

      {/* Part badge */}
      <motion.div animate={{ scale:[1,1.06,1] }} transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
        className="flex items-center gap-3 px-7 py-3 rounded-full text-white font-extrabold text-xl shadow-xl z-10"
        style={{ background:`linear-gradient(90deg,${accentColor},${accentColor}cc)` }}>
        <VideoIcon size={24} color="white"/>
        {partLabel}
      </motion.div>

      {/* Video element */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl z-10"
        style={{ border:`3px solid ${accentColor}44`, background:"#000" }}>
        <video
          ref={videoRef}
          src={src}
          className="w-full rounded-3xl"
          style={{ maxHeight:"56vw", display:"block" }}
          onCanPlay={() => setReady(true)}
          onEnded={handleEnded}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          controls={playing}
          playsInline
        />
        {/* Play overlay */}
        {!playing && !ended && (
          <motion.button
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
            whileHover={{ scale:1.08 }} whileTap={{ scale:0.92 }}
            onClick={handlePlay}
            disabled={!ready}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background:"rgba(0,0,0,0.42)", cursor: ready ? "pointer" : "not-allowed" }}>
            <motion.div animate={{ scale:[1,1.14,1] }} transition={{ duration:1.4, repeat:Infinity, ease:"easeInOut" }}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background: ready ? accentColor : "#9CA3AF", paddingLeft:6 }}>
              <PlayIcon size={40} color="white"/>
            </motion.div>
            <span className="text-white font-extrabold text-2xl drop-shadow-lg">
              {ready ? "▶ ක්‍රීඩාව ආරම්භ කරන්න" : "පූරණය වෙනවා..."}
            </span>
          </motion.button>
        )}
        {/* Ended overlay */}
        {ended && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background:"rgba(0,0,0,0.52)" }}>
            <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:1.2, repeat:Infinity, ease:"easeInOut" }}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background:"#22C55E" }}>
              <CheckIcon size={40} color="white"/>
            </motion.div>
            <span className="text-white font-extrabold text-2xl drop-shadow-lg">ඉවරයි!</span>
          </motion.div>
        )}
      </div>

      {/* Proceed button */}
      {ended && (
        <motion.button initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          whileHover={{ scale:1.04, boxShadow:"0 12px 40px rgba(0,0,0,0.22)" }} whileTap={{ scale:0.95 }}
          onClick={onEnded}
          className="w-full rounded-full py-5 text-2xl font-extrabold text-white shadow-2xl flex items-center justify-center gap-3 z-10"
          style={{ background:`linear-gradient(90deg,${accentColor},${accentColor}bb)` }}>
          <QuizIcon size={26} color="white"/>
          ප්‍රශ්නවලට පිළිතුරු දෙමු!
        </motion.button>
      )}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  QUESTION SCREEN
// ─────────────────────────────────────────────────────────────────
const OPTION_COLORS = ["#0284C7","#059669","#D97706","#7C3AED"];
const OPTION_LABELS = ["1","2","3","4"];

const QuestionScreen = ({ questions, partLabel, mascot, accentColor, onDone, onBack, helperText, retryPopupThreshold }) => {
  const [qIdx,      setQIdx]      = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [feedback,  setFeedback]  = useState(null); // "correct" | "wrong"
  const [answered,  setAnswered]  = useState(false);
  const [score,        setScore]        = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [totalCorrect,  setTotalCorrect]  = useState(0);
  const [totalWrong,    setTotalWrong]    = useState(0);
  const [showRetryPopup, setShowRetryPopup] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const responseStartedAtRef = useRef(null);
  const responseTimesRef = useRef([]);

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  const totalAttempts = totalCorrect + totalWrong;
  const accuracy = totalAttempts === 0 ? 0 : Math.round((totalCorrect / totalAttempts) * 100);

  const playQuestionAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (q.audio) {
      audioRef.current = new Audio(q.audio);
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    playQuestionAudio();
    responseStartedAtRef.current = Date.now();
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const t = timerRef.current;
      clearTimeout(t);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx]);

  const handleSelect = (optionIdx) => {
    if (answered) return;
    if (responseStartedAtRef.current) {
      responseTimesRef.current.push(Date.now() - responseStartedAtRef.current);
      responseStartedAtRef.current = null;
    }
    setSelected(optionIdx);
    const correctIndex = q.displayCorrectIndex ?? q.correct;
    const isCorrect = optionIdx === correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    setAnswered(true);

    if (isCorrect) {
      awardStar();
      beep("correct");
      setScore(prev => (optionIdx === correctIndex ? prev + 1 : prev));
      setTotalCorrect(c => c + 1);
      setWrongAttempts(0);
    } else {
      beep("wrong");
      setTotalWrong(w => w + 1);
      const newWrongCount = wrongAttempts + 1;
      setWrongAttempts(newWrongCount);
      if (newWrongCount >= retryPopupThreshold) {
        setShowRetryPopup(true);
        setTimeout(() => setShowRetryPopup(false), 4000);
      }
    }
  };

  const handleNext = () => {
    if (!answered) return;
    if (feedback === "wrong") {
      // must re-answer — reset state but keep question
      setSelected(null);
      setFeedback(null);
      setAnswered(false);
      playQuestionAudio();
      responseStartedAtRef.current = Date.now();
      return;
    }
    // correct → advance
    if (isLast) {
  onDone({
    score,
    accuracy,
    totalWrong,
    totalResponseMs: responseTimesRef.current.reduce((sum, value) => sum + value, 0),
    responseCount: responseTimesRef.current.length,
  });
} else {
      setQIdx(i => i + 1);
      setSelected(null);
      setFeedback(null);
      setAnswered(false);
    }
  };

  const advance = handleNext;

  return (
    <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
      className="flex flex-col items-center gap-6 w-full rounded-3xl overflow-hidden relative"
      style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)",
        border:`3px solid ${accentColor}44`, boxShadow:"0 24px 64px rgba(0,0,0,0.18)", padding:"2rem" }}>

      {/* Floating mascot */}
      {mascot && (
        <motion.img src={mascot} alt="" aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width:100, right:-14, top:14, opacity:0.82, zIndex:0 }}
          animate={{ y:[0,-10,0], rotate:[-5,5,-5] }}
          transition={{ duration:2.6, repeat:Infinity, ease:"easeInOut" }}/>
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.93 }} onClick={onBack}
              className="rounded-full px-4 py-2 text-white font-extrabold text-base shadow-lg flex items-center gap-2"
              style={{ background:"rgba(100,100,100,0.72)", backdropFilter:"blur(6px)" }}>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
              ආපසු
            </motion.button>
          )}
          <div className="rounded-full px-5 py-2 text-white font-extrabold text-base shadow-lg flex items-center gap-2"
            style={{ background:accentColor }}>
            <QuizIcon size={18} color="white"/>
            {partLabel}
          </div>
        </div>
        <div className="rounded-full px-5 py-2 font-extrabold text-base shadow-md flex items-center gap-2"
          style={{ background:"rgba(34,197,94,0.88)", color:"white" }}>
          {qIdx + 1} / {questions.length}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-3 z-10">
        {questions.map((_,i) => (
          <motion.div key={i} className="rounded-full"
            style={{ width:18, height:18, background:i<qIdx?"#22C55E":i===qIdx?accentColor:"rgba(200,200,200,0.60)",
              border:"2.5px solid rgba(255,255,255,0.70)" }}
            animate={i===qIdx?{ scale:[1,1.4,1] }:{}}
            transition={{ duration:0.8, repeat:i===qIdx?Infinity:0 }}/>
        ))}
      </div>

      {/* Accuracy Bar */}
      <div className="w-full z-10">
        <div className="flex justify-between mb-2">
          <span className="font-bold text-gray-700">නිරවද්‍යතා මට්ටම</span>
          <span className="font-extrabold text-sky-600">{accuracy}%</span>
        </div>
        <div className="w-full h-5 rounded-full overflow-hidden" style={{ background:"#E5E7EB" }}>
          <motion.div
            initial={{ width:0 }}
            animate={{ width:`${accuracy}%` }}
            transition={{ duration:0.5 }}
            className="h-full rounded-full"
            style={{ background: accuracy >= 80 ? "#22C55E" : accuracy >= 50 ? "#F59E0B" : "#EF4444" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm font-bold text-gray-600">
          <span>✅ නිවැරදි: {totalCorrect}</span>
          <span>❌ වැරදි: {totalWrong}</span>
        </div>
      </div>

      {/* Question bubble */}
      <motion.div key={qIdx} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ type:"spring", stiffness:200, damping:20 }}
        className="w-full rounded-3xl p-7 text-center z-10"
        style={{ background:`linear-gradient(135deg,${accentColor}18,${accentColor}08)`, border:`2px solid ${accentColor}33` }}>
        <p className="text-2xl font-extrabold text-gray-800 leading-relaxed">{q.question}</p>
        {q.audio && (
          <button
            type="button"
            onClick={playQuestionAudio}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white font-bold text-base shadow-lg"
            style={{ background: accentColor }}
            aria-label="ප්‍රශ්නය නැවත අසන්න">
            🔊 ප්‍රශ්නය අසන්න
          </button>
        )}
        {helperText && (
          <div className="mt-4 rounded-2xl px-4 py-3 text-left" style={{ background: `${accentColor}14`, border: `1px solid ${accentColor}22` }}>
            <p className="text-base font-bold" style={{ color: accentColor }}>{helperText}</p>
          </div>
        )}
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 w-full z-10">
        {(q.displayOptions || q.options).map((opt, i) => {
          const isSelected = selected === i;
          const correctIndex = q.displayCorrectIndex ?? q.correct;
          const isCorrect  = i === correctIndex;
          let bg = OPTION_COLORS[i];
          if (answered) {
            if (isCorrect)           bg = "#22C55E";
            else if (isSelected)     bg = "#EF4444";
            else                     bg = "#9CA3AF";
          }
          return (
            <motion.button key={i}
              whileHover={answered ? {} : { scale:1.04, y:-4 }}
              whileTap={answered ? {} : { scale:0.93 }}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className="rounded-3xl py-5 px-4 text-white font-extrabold text-xl shadow-xl flex items-center gap-3"
              style={{ background:bg, cursor:answered?"not-allowed":"pointer",
                border:isSelected && answered ? "3px solid white" : "3px solid transparent" }}>
              <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-sm font-black flex-shrink-0">
                {OPTION_LABELS[i]}
              </span>
              <span className="text-left leading-tight">{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div key={feedback} initial={{ opacity:0, scale:0.8, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0 }}
            className="w-full rounded-2xl px-6 py-4 flex items-center gap-4 z-10"
            style={{ background: feedback === "correct" ? "#DCFCE7" : "#FEE2E2",
              border:`2px solid ${feedback==="correct"?"#22C55E":"#EF4444"}` }}>
            {feedback === "correct"
              ? <CheckIcon size={32} color="#22C55E"/>
              : <XIcon     size={32} color="#EF4444"/>}
            <div>
              <p className="text-xl font-extrabold" style={{ color: feedback==="correct"?"#15803D":"#DC2626" }}>
                {feedback === "correct" ? "නිවැරදි! ඉතා හොඳයි! 🎉" : "නොමැත! නැවත උත්සාහ කරන්න!"}
              </p>
              {feedback === "wrong" && (
                <p className="text-base font-semibold text-red-500 mt-1">නිවැරදි පිළිතුර තෝරා ඊළඟ ප්‍රශ්නයට යයි.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retry Popup */}
      <AnimatePresence>
        {showRetryPopup && (
          <motion.div
            initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background:"rgba(0,0,0,0.45)" }}>
            <div className="rounded-3xl p-8 text-center shadow-2xl max-w-md"
              style={{ background:"white", border:"4px solid #F59E0B" }}>
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-2xl font-extrabold text-orange-600 leading-relaxed">
                නැවත වීඩියෝවට සවන් දී<br/>
                තව සැරයක් උත්සාහ කරන්න
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button — only enabled when answered correctly */}
      {answered && (
        <motion.button initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          whileHover={feedback==="correct"?{ scale:1.04 }:{}}
          whileTap={feedback==="correct"?{ scale:0.95 }:{}}
          onClick={advance}
          className="w-full rounded-full py-5 text-2xl font-extrabold text-white shadow-2xl flex items-center justify-center gap-3 z-10"
          style={{ background: feedback==="correct"
            ? "linear-gradient(90deg,#22C55E,#16A34A)"
            : "linear-gradient(90deg,#EF4444,#DC2626)",
            cursor: feedback==="correct" ? "pointer" : "default" }}>
          {feedback === "correct"
            ? (isLast ? <><CheckIcon size={26} color="white"/> ඉදිරියට!</> : <><CheckIcon size={26} color="white"/> ඊළඟ ප්‍රශ්නය</>)
            : <><RetryIcon size={26} color="white"/> නැවත උත්සාහ කරන්න</>}
        </motion.button>
      )}
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  FINAL SCORE SCREEN
// ─────────────────────────────────────────────────────────────────
const ScoreScreen = ({ totalCorrect, totalQuestions, onRetry, onHome }) => {
  const pct   = Math.round((totalCorrect / totalQuestions) * 100);
  const stars = totalCorrect >= totalQuestions ? 3 : totalCorrect >= Math.ceil(totalQuestions * 0.6) ? 2 : 1;
  const passed = stars >= 2;

  useEffect(() => {
    if (passed) {
      const winAudio = new Audio(levelUpSound);
      winAudio.volume = 1;
      winAudio.playbackRate = 1.1;
      winAudio.play().catch(() => {});
      setTimeout(() => confetti({
        particleCount: 300, spread: 140, startVelocity: 45, scalar: 1.3,
        origin: { y: 0.55 },
        colors: ["#22C55E","#0EA5E9","#F59E0B","#EC4899","#A855F7"],
      }), 200);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div initial={{ opacity:0, scale:0.82 }} animate={{ opacity:1, scale:1 }}
      transition={{ type:"spring", stiffness:180, damping:18 }}
      className="flex flex-col items-center gap-7 rounded-3xl p-10 text-center w-full relative overflow-hidden"
      style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)", boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>

      <motion.img src={imgDolphin} alt="" aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ width:110, right:-16, top:10, opacity:0.80 }}
        animate={{ y:[0,-12,0], rotate:[-5,5,-5] }}
        transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}/>

      <motion.div animate={passed?{ rotate:[0,-12,12,-8,8,0], scale:[1,1.1,1] }:{ scale:[1,1.15,1] }} transition={{ delay:0.25, duration:0.7 }}>
        <TrophyIcon size={100} color={passed?"#F59E0B":"#9CA3AF"}/>
      </motion.div>

      <div className="w-full">
        <p className="text-5xl font-extrabold mb-3 leading-tight text-center" style={{ color:passed?"#22C55E":"#F97316" }}>
          {passed ? "ජය ගත්තා!" : "නැවත උත්සාහ කරන්න!"}
        </p>
        <p className="text-2xl font-bold text-gray-600 text-center">{totalCorrect} / {totalQuestions} නිවැරදි ({pct}%)</p>
        <div className="w-full mt-5">
          <div className="w-full h-6 rounded-full overflow-hidden" style={{ background:"#E5E7EB" }}>
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${pct}%` }}
              transition={{ duration:1 }}
              className="h-full rounded-full"
              style={{ background: pct >= 80 ? "#22C55E" : pct >= 50 ? "#F59E0B" : "#EF4444" }}
            />
          </div>
          <p className="mt-2 text-lg font-bold text-sky-700 text-center">නිරවද්‍යතා මට්ටම: {pct}%</p>
        </div>
      </div>

      <div className="flex gap-3">
        {[1,2,3].map(i => <StarIcon key={i} size={52} filled={i<=stars}/>)}
      </div>

      {passed ? (
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}
          className="w-full rounded-2xl px-6 py-4 text-center"
          style={{ background:"#FEF9C3", border:"2px solid #FDE047" }}>
          <p className="text-xl font-bold text-yellow-700">ඔබ ඉතා දක්ෂයෙකු! &ldquo;වනාන්තර කතාව&rdquo; ජය ගත්තා!</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}
          className="w-full rounded-2xl px-6 py-4 text-center"
          style={{ background:"#FFF7ED", border:"2px solid #FED7AA" }}>
          <p className="text-xl font-bold text-orange-700">ප්‍රශ්නවලට හොඳින් ඇහුම්කන් දෙන්න. ආයෙත් බලන්න!</p>
        </motion.div>
      )}

      <div className="flex flex-col gap-4 w-full">
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onRetry}
          className="rounded-full py-5 font-extrabold text-2xl text-white shadow-xl flex items-center justify-center gap-3"
          style={{ background:"linear-gradient(90deg,#0EA5E9,#0284C7)" }}>
          <RetryIcon size={26} color="white"/> නැවත ක්‍රීඩා කරමු
        </motion.button>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={onHome}
          className="rounded-full py-5 font-extrabold text-2xl text-white shadow-xl flex items-center justify-center gap-3"
          style={{ background:"linear-gradient(90deg,#8B5CF6,#7C3AED)" }}>
          <HomeIcon size={26} color="white"/> ගෙදරට
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  INTRO SCREEN
// ─────────────────────────────────────────────────────────────────
const IntroScreen = ({ onStart }) => (
  <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
    className="flex flex-col items-center gap-8 p-10 rounded-3xl w-full relative overflow-hidden"
    style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)",
      border:"3px solid #0284C744", boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>

    <motion.img src={imgMermaid} alt="" aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={{ width:120, right:-16, top:10, opacity:0.85, zIndex:0 }}
      animate={{ y:[0,-14,0], rotate:[-6,6,-6] }}
      transition={{ duration:2.8, repeat:Infinity, ease:"easeInOut" }}/>
    <motion.img src={imgPuffefish} alt="" aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={{ width:80, left:-12, bottom:16, opacity:0.72, zIndex:0 }}
      animate={{ scale:[1,1.18,1], rotate:[-8,8,-8] }}
      transition={{ duration:2.2, repeat:Infinity, ease:"easeInOut" }}/>

    {/* Game badge */}
    <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:1.6, repeat:Infinity, ease:"easeInOut" }}
      className="w-36 h-36 rounded-full text-6xl font-black text-white shadow-2xl flex items-center justify-center"
      style={{ background:"linear-gradient(135deg,#0284C7,#0EA5E9)", zIndex:1 }}>
      🌿
    </motion.div>

    <div className="text-center z-10">
      <p className="text-4xl font-extrabold leading-tight text-sky-600">වනාන්තර කතාව</p>
      <p className="text-2xl font-bold text-gray-500 mt-1">Jungle Story</p>
      <p className="text-lg font-semibold text-gray-400 mt-2">සංජානනය + මතක ක්‍රීඩාව</p>
    </div>

    <div className="w-full rounded-3xl p-6 z-10" style={{ background:"linear-gradient(135deg,#E0F2FE,#BAE6FD)", border:"2px solid #0284C733" }}>
      <p className="text-xl font-bold text-gray-700 leading-relaxed text-center mb-4">ක්‍රීඩාව ගැන:</p>
      <div className="flex flex-col gap-3 text-left">
        {[
          { step:"1", icon:<VideoIcon size={20} color="#0284C7"/>, text:"වනාන්තරයේ 1 කොටස නරඹන්න" },
          { step:"2", icon:<QuizIcon  size={20} color="#059669"/>, text:"1 කොටස ගැන ප්‍රශ්නවලට පිළිතුරු දෙන්න" },
          { step:"3", icon:<VideoIcon size={20} color="#7C3AED"/>, text:"වනාන්තරයේ 2 කොටස නරඹන්න" },
          { step:"4", icon:<QuizIcon  size={20} color="#D97706"/>, text:"2 කොටස ගැන ප්‍රශ්නවලට පිළිතුරු දෙන්න" },
        ].map(item => (
          <div key={item.step} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow font-extrabold text-sky-600 flex-shrink-0">
              {item.step}
            </div>
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-base font-semibold text-gray-700">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-3 w-full justify-center z-10 text-base font-semibold text-gray-500">
      <span>ප්‍රශ්න: {PART1_QUESTIONS.length + PART2_QUESTIONS.length}</span>
      <span>•</span>
      <span>නිවැරදිව නොඅනිව ඉදිරියට යයි</span>
    </div>

    <motion.button whileHover={{ scale:1.04, boxShadow:"0 12px 40px rgba(0,0,0,0.22)" }} whileTap={{ scale:0.95 }}
      onClick={onStart}
      className="w-full rounded-full py-6 text-2xl font-extrabold text-white shadow-2xl z-10 flex items-center justify-center gap-3"
      style={{ background:"linear-gradient(90deg,#0284C7,#0EA5E9)" }}>
      <PlayIcon size={28} color="white"/>
      ▶ ආරම්භ කරමු!
    </motion.button>
  </motion.div>
);

const ChildStoryIntro = ({ onStart }) => {
  const { isMobile } = useResponsive();
  const questionCount = PART1_QUESTIONS.length + PART2_QUESTIONS.length;
  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
      className="grid w-full overflow-x-hidden rounded-[2rem] border-[3px] border-white/80 bg-white/95 shadow-2xl"
      style={{ maxWidth:940, maxHeight:"calc(100dvh - 128px)", overflowY:"auto", gridTemplateColumns:isMobile ? "1fr" : "minmax(290px,.9fr) minmax(0,1.1fr)", padding:isMobile ? "12px 12px 78px" : 22, gap:isMobile ? 8 : 22 }}>
      <div className="flex items-center justify-center rounded-3xl" style={{ minHeight:isMobile ? 230 : 450, background:"linear-gradient(155deg,#DBEAFE,#EDE9FE,#fff)" }}>
        <motion.div className="relative" style={{ width:isMobile ? 170 : 300 }} animate={{ y:[0,-6,0], rotate:[-1,1,-1] }} transition={{ duration:3, repeat:Infinity }}>
          <img src={storyWhaleBookBoard} alt="තල්මස් යාළුවා කතා පොත අල්ලාගෙන සිටී" className="block h-auto w-full" style={{ filter:"drop-shadow(0 14px 20px rgba(37,99,235,.22))" }}/>
          <div className="absolute flex flex-col items-center justify-center text-center" style={{ left:"9%", right:"9%", top:"49%", bottom:"18%" }}>
            <span className="font-black text-slate-500" style={{ fontSize:isMobile ? 9 : 14 }}>කතා මෙහෙයුම</span>
            <span className="font-black leading-tight text-blue-600" style={{ fontSize:isMobile ? 17 : 29 }}>කතාව මතකද?</span>
            <span className="font-extrabold text-slate-700" style={{ fontSize:isMobile ? 9 : 14 }}>බලමු • මතක තබමු</span>
          </div>
        </motion.div>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-3 text-center">
        <div><h1 className="m-0 text-3xl font-black text-slate-800">කතාව මතකද?</h1><p className="mt-1 font-bold text-blue-600">වීඩියෝ කතාව බලලා ප්‍රශ්නවලට උත්තර දෙමු!</p></div>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-3 text-left font-bold leading-relaxed text-slate-700">කතාවේ චරිත සහ සිදුවීම් හොඳින් මතක තබාගන්න. කලබල වෙන්න එපා—කතාව කොටස් දෙකකින් බලමු.</div>
        <div className="grid grid-cols-4 gap-2 text-xs font-black text-slate-700"><div className="rounded-xl bg-sky-100 p-2">1. බලන්න</div><div className="rounded-xl bg-emerald-100 p-2">2. උත්තර</div><div className="rounded-xl bg-violet-100 p-2">3. බලන්න</div><div className="rounded-xl bg-amber-100 p-2">4. උත්තර</div></div>
        <div className="flex justify-center gap-3 text-sm font-black"><span className="rounded-full bg-violet-100 px-4 py-2 text-violet-700">කොටස් 2</span><span className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">ප්‍රශ්න {questionCount}</span></div>
        <motion.button type="button" onClick={onStart} whileHover={{ scale:1.03 }} whileTap={{ scale:.95 }} className="rounded-full py-4 text-xl font-black text-white shadow-xl" style={{ position:isMobile ? "fixed" : "static", left:isMobile ? 20 : "auto", right:isMobile ? 20 : "auto", bottom:isMobile ? 14 : "auto", zIndex:40, background:"linear-gradient(90deg,#0284C7,#7C3AED)" }}>තල්මස් යාළුවා එක්ක කතාව බලමු!</motion.button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
//  MAIN GAME COMPONENT
// ─────────────────────────────────────────────────────────────────
// Steps: 0=intro | 1=video1 | 2=questions1 | 3=video2 | 4=questions2 | 5=score
const VideoStoryGame = ({ onComplete = null }) => {
  const { initializeGame, completeLevel, updateLevelProgress, getAdaptiveProfile, recordAdaptiveResult } = useProgress();
  const adaptiveProfile = getAdaptiveProfile(GAME_ID);
  const adaptiveConfig = adaptVideoStoryConfig(adaptiveProfile);
  const part1Questions = adaptVideoStoryQuestionSet(PART1_QUESTIONS, adaptiveProfile);
  const part2Questions = adaptVideoStoryQuestionSet(PART2_QUESTIONS, adaptiveProfile);

  const [step,           setStep]           = useState(0);
  const [part1Score,     setPart1Score]     = useState(0);
  const [part2Score,     setPart2Score]     = useState(0);
  const [part1Wrong,     setPart1Wrong]     = useState(0);
  const [part2Wrong,     setPart2Wrong]     = useState(0);
  const [part1ResponseTotalMs, setPart1ResponseTotalMs] = useState(0);
  const [part1ResponseCount, setPart1ResponseCount] = useState(0);

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

  useEffect(() => {
    initializeGame(GAME_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    if (instrAudioRef.current) {
      instrAudioRef.current.pause();
      instrAudioRef.current.currentTime = 0;
    }
    setInstrPlaying(false);
    setStep(1);
  };

  const handleVideo1End  = () => setStep(2);
  const handleVideo2End  = () => setStep(4);

  const handleBackToVideo1 = () => setStep(1);
  const handleBackToVideo2 = () => setStep(3);

  const handlePart1Done = (data) => {
    const { score, accuracy, totalWrong, totalResponseMs, responseCount } = data;
    setPart1Score(score);
    setPart1Wrong(totalWrong);
    setPart1ResponseTotalMs(totalResponseMs || 0);
    setPart1ResponseCount(responseCount || 0);
    updateLevelProgress(GAME_ID, 1, accuracy, { part1Score: score });
    setStep(3);
  };

  const handlePart2Done = (data) => {
    const { score, totalWrong, totalResponseMs, responseCount } = data;
    setPart2Score(score);
    setPart2Wrong(totalWrong);
    const total = part1Score + score;
    const max = PART1_QUESTIONS.length + PART2_QUESTIONS.length;
    const allWrongAttempts = part1Wrong + totalWrong;
    const finalAccuracy = Math.round(
      (total / Math.max(total + allWrongAttempts, 1)) * 100
    );
    const combinedResponseCount = part1ResponseCount + (responseCount || 0);
    const averageResponseMs = combinedResponseCount > 0
      ? Math.round(
          (part1ResponseTotalMs + (totalResponseMs || 0)) / combinedResponseCount
        )
      : null;
    const stats = {
      level: 1,
      correct: total,
      total: max,
      pct: finalAccuracy,
      accuracy: finalAccuracy,
      part1Correct: part1Score,
      part2Correct: score,
      wrongAttempts: allWrongAttempts,
      mistakes: allWrongAttempts,
      totalAttempts: total + allWrongAttempts,
      averageResponseMs,
    };
    completeLevel(GAME_ID, 1, stats);
    updateLevelProgress(GAME_ID, 1, finalAccuracy, stats);
    recordAdaptiveResult(GAME_ID, stats);
    if (onComplete) {
      onComplete({
        ...stats,
        accuracy: finalAccuracy,
        passed: true,
        level: 1,
      });
    } else {
      setStep(5);
    }
  };

  const handleRetry = () => {
    setPart1Score(0);
    setPart2Score(0);
    setPart1Wrong(0);
    setPart2Wrong(0);
    setPart1ResponseTotalMs(0);
    setPart1ResponseCount(0);
    setStep(0);
    speechSynthesis.cancel();
  };

  const handleHome = () => {
    speechSynthesis.cancel();
    const _total = part1Score + part2Score;
    const _max   = PART1_QUESTIONS.length + PART2_QUESTIONS.length;
    if (onComplete) onComplete({ goHome: true, accuracy: Math.round((_total / _max) * 100) });
  };

  // step → progress bar index: video1=0, q1=1, video2=2, q2=3
  const stepBarIndex = step === 1 ? 0 : step === 2 ? 1 : step === 3 ? 2 : step === 4 ? 3 : step === 5 ? 4 : -1;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-x-hidden" style={{ zIndex:1 }}>
      <SequenceRecallSeaBg/>

      {/* Voice instruction audio */}
      <audio ref={instrAudioRef} src={storyInstrAudio} onEnded={() => setInstrPlaying(false)} />

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl">

        {/* Progress bar (visible during game) */}
        {step >= 1 && step <= 4 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="w-full">
            <StepBar currentStep={stepBarIndex}/>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* INTRO */}
          {step === 0 && (
            <motion.div key="intro" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex w-full flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceInstruction}
                aria-label={instrPlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}
                className="z-20 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-sky-200 bg-sky-50 px-5 py-2.5 font-black text-sky-700 shadow-md transition hover:scale-[1.03] hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
              >
                <span className="text-2xl leading-none" aria-hidden="true">{instrPlaying ? "⏹" : "🔊"}</span>
                <span>{instrPlaying ? "උපදෙස් නවත්වන්න" : "උපදෙස් අසන්න"}</span>
              </button>
              <ChildStoryIntro onStart={handleStart}/>
            </motion.div>
          )}

          {/* VIDEO 1 */}
          {step === 1 && (
            <motion.div key="video1" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="w-full">
              <VideoScreen
                src={jungle1}
                partLabel="1 වැනි කොටස — වනාන්තර ගමන"
                mascot={imgDolphin}
                accentColor="#0284C7"
                onEnded={handleVideo1End}
              />
            </motion.div>
          )}

          {/* QUESTIONS 1 */}
          {step === 2 && (
            <motion.div key="q1" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="w-full">
              <QuestionScreen
                questions={part1Questions}
                partLabel="1 වැනි කොටසේ ප්‍රශ්න"
                mascot={imgMermaid}
                accentColor="#059669"
                helperText={adaptiveConfig.helperText}
                retryPopupThreshold={adaptiveConfig.retryPopupThreshold}
                onDone={handlePart1Done}
                onBack={handleBackToVideo1}
              />
            </motion.div>
          )}

          {/* VIDEO 2 */}
          {step === 3 && (
            <motion.div key="video2" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="w-full">
              <VideoScreen
                src={jungle2}
                partLabel="2 වැනි කොටස — ගැඹුරු වනාන්තරය"
                mascot={imgSeahorse}
                accentColor="#7C3AED"
                onEnded={handleVideo2End}
              />
            </motion.div>
          )}

          {/* QUESTIONS 2 */}
          {step === 4 && (
            <motion.div key="q2" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="w-full">
              <QuestionScreen
                questions={part2Questions}
                partLabel="2 වැනි කොටසේ ප්‍රශ්න"
                mascot={imgPuffefish}
                accentColor="#D97706"
                helperText={adaptiveConfig.helperText}
                retryPopupThreshold={adaptiveConfig.retryPopupThreshold}
                onDone={handlePart2Done}
                onBack={handleBackToVideo2}
              />
            </motion.div>
          )}

          {/* SCORE */}
          {step === 5 && (
            <motion.div key="score" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="w-full">
              <ScoreScreen
                totalCorrect={part1Score + part2Score}
                totalQuestions={PART1_QUESTIONS.length + PART2_QUESTIONS.length}
                onRetry={handleRetry}
                onHome={handleHome}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VideoStoryGame;
