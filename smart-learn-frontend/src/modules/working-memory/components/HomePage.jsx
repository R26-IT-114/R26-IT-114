/**
 * Working Memory HomePage
 * Child-friendly UI, animated sea background, SVG icons only — no emojis.
 */
import React from "react";
import { motion } from "framer-motion";
import { useProgress } from "../context/ProgressContext";
import { getAdaptivePresentation } from "../utils/adaptiveDifficulty";
import {
  aggregatePerformanceSummary,
  dedupePerformanceResults,
  getDurableStarTotal,
  safeMetricNumber,
} from "../utils/performanceMetrics";
import useAuth from "../../../hooks/useAuth";
import imgDolphin   from "../assets/dolphin.png";
import audioSeqRecall  from "../assets/piliwelamthaya.mp3";
import audioNBack      from "../assets/Nback.mp3";
import audioVideoStory from "../assets/story1.mp3";
import audioColorMem   from "../assets/mathkaya.mp3";
import audioImageMatch from "../assets/pinthura_clean.mp3";
import audioPuzzleGame from "../assets/puzzle-game-instructions.mp4";
import audioSeaOdd     from "../assets/wena.mp3";
import imgMermaid   from "../assets/mermaid.png";
import imgPuffefish from "../assets/puffefish.png";
import imgShellC    from "../assets/shell.png";
import homeSeaLandscapeBg from "../assets/working-memory-home-sea-landscape-v3.png";
import homeSeaPortraitBg from "../assets/working-memory-home-sea-portrait-v3.png";
import swimmingColorfulFish from "../assets/home-swimming-colorful-fish.png";
import swimmingSeahorse from "../assets/home-swimming-seahorse.png";
import rewardStar from "../assets/reward-star-cartoon-v2.png";
import cardMascotTurtle from "../assets/card-mascot-turtle-v1.png";
import cardMascotOctopus from "../assets/card-mascot-octopus-v1.png";
import cardMascotWhale from "../assets/card-mascot-whale-v1.png";
import cardMascotDolphin from "../assets/card-mascot-dolphin-v1.png";
import cardMascotSeahorse from "../assets/card-mascot-seahorse-v1.png";
import cardMascotPufferfish from "../assets/card-mascot-pufferfish-v1.png";
import cardMascotCrab from "../assets/card-mascot-crab-v1.png";
import progressDolphinHolder from "../assets/progress-dolphin-holder-v1.png";
import heroSubmarineSeaFriends from "../assets/hero-submarine-sea-friends-v1.png";

const SwimmingSeaFriends = () => (
  <div className="wm-swimming-friends pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
    <motion.img
      src={swimmingColorfulFish}
      alt=""
      className="absolute left-0 top-[16%] w-12 opacity-75 drop-shadow-lg sm:w-16"
      initial={{ x: "-20vw" }}
      animate={{ x: "115vw", y: [0, -14, 7, 0], rotate: [-2, 2, -1, -2] }}
      transition={{
        x: { duration: 24, repeat: Infinity, ease: "linear", repeatDelay: 3 },
        y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
      }}
    />

    <motion.img
      src={swimmingColorfulFish}
      alt=""
      className="absolute left-0 top-[56%] w-10 opacity-65 drop-shadow-md sm:w-14"
      style={{ filter: "hue-rotate(80deg) drop-shadow(0 6px 8px rgba(3,105,161,.25))" }}
      initial={{ x: "115vw", scaleX: -1 }}
      animate={{ x: "-20vw", y: [0, 10, -8, 0] }}
      transition={{
        x: { duration: 28, delay: 6, repeat: Infinity, ease: "linear", repeatDelay: 4 },
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
      }}
    />

    <motion.img
      src={swimmingColorfulFish}
      alt=""
      className="absolute left-0 top-[76%] w-9 opacity-60 sm:w-12"
      style={{ filter: "hue-rotate(155deg) drop-shadow(0 5px 7px rgba(3,105,161,.22))" }}
      initial={{ x: "-18vw" }}
      animate={{ x: "112vw", y: [0, -8, 9, 0], rotate: [1, -3, 2, 1] }}
      transition={{
        x: { duration: 32, delay: 11, repeat: Infinity, ease: "linear", repeatDelay: 5 },
        y: { duration: 5.8, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 5.8, repeat: Infinity, ease: "easeInOut" },
      }}
    />

    <motion.img
      src={swimmingColorfulFish}
      alt=""
      className="absolute left-0 top-[34%] w-8 opacity-55 sm:w-11"
      style={{ filter: "hue-rotate(230deg) drop-shadow(0 5px 7px rgba(3,105,161,.2))" }}
      initial={{ x: "112vw", scaleX: -1 }}
      animate={{ x: "-16vw", y: [0, 7, -10, 0] }}
      transition={{
        x: { duration: 35, delay: 15, repeat: Infinity, ease: "linear", repeatDelay: 6 },
        y: { duration: 6.2, repeat: Infinity, ease: "easeInOut" },
      }}
    />

    <motion.img
      src={swimmingSeahorse}
      alt=""
      className="absolute left-0 top-[38%] w-12 opacity-70 drop-shadow-lg sm:w-16"
      initial={{ x: "112vw" }}
      animate={{ x: "-20vw", y: [0, -18, 5, 0], rotate: [2, -4, 3, 2] }}
      transition={{
        x: { duration: 27, delay: 2, repeat: Infinity, ease: "linear", repeatDelay: 4 },
        y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
      }}
    />
  </div>
);

// ─────────────────────────────────────────────
//  GAME REGISTRY
// ─────────────────────────────────────────────
const GAMES = [
  {
    id: "sea-odd-one-out", label: "වෙනස් ඒක සොයමු", subtitle: "වෙනස්/ලොකු-පොඩි පින්තූරය හඳුනාගෙන තෝරමු!", subtitleIcon: "sparkle", levels: 2, available: true,
    color: "#0E7490", bg: "#CFFAFE", icon: "search", audio: audioSeaOdd, mascot: cardMascotTurtle,
    deco: { src: imgShellC,    w: 64, pos: { right: -6,  bottom: -8 }, op: 0.85,
      anim: { rotate: [-12, 12, -12], x: [-4, 4, -4] }, trans: { duration: 2.8, repeat: Infinity } },
  },
  {
    id: "n-back", label: "පෙර තිබුණේ මොකක්ද?", subtitle: "කලින් දැක්ක දේ හොයමු!", subtitleIcon: "crosshair", levels: 2, available: true,
    color: "#2563EB", bg: "#DBEAFE", icon: "target", audio: audioNBack, mascot: cardMascotOctopus,
    deco: { src: imgMermaid,   w: 82, pos: { right: -10, bottom: -8 }, op: 0.88,
      anim: { y: [0, -10, 0], scale: [1, 1.06, 1] }, trans: { duration: 3.0, repeat: Infinity } },
  },
  {
    id: "color-memory", label: "මතක අභියෝගය", subtitle: "හරි දේ මතක තියාගෙන සොයමු!", subtitleIcon: "sparkle", levels: 3, available: true,
    color: "#0891B2", bg: "#CFFAFE", icon: "palette", audio: audioColorMem, mascot: cardMascotPufferfish,
    deco: { src: imgPuffefish, w: 74, pos: { right: -8,  bottom: -10 }, op: 0.86,
      anim: { scale: [1, 1.22, 1], rotate: [-5, 5, -5] }, trans: { duration: 2.0, repeat: Infinity } },
  },
  {
    id: "puzzle-game", label: "මතක ප්‍රහේලිකාව", subtitle: "පින්තූරය මතක තබා කොටස් සම්පූර්ණ කරමු!", subtitleIcon: "sparkle", levels: 2, available: true,
    color: "#0F766E", bg: "#CCFBF1", icon: "puzzle", audio: audioPuzzleGame, mascot: cardMascotDolphin,
    deco: { src: imgDolphin,    w: 96, pos: { right: -14, bottom: -14 }, op: 0.9,
      anim: { y: [0, -12, 0], x: [0, -10, 0], rotate: [-5, 5, -5] }, trans: { duration: 2.8, repeat: Infinity } },
  },
  {
    id: "sequence-recall", label: "පිළිවෙල මතකය", subtitle: "දැක්ක දේ ඒ පිළිවෙලට මතක තියාගමු!", subtitleIcon: "ordered", levels: 3, available: true,
    color: "#0369A1", bg: "#E0F2FE", icon: "brain", audio: audioSeqRecall, mascot: cardMascotSeahorse,
    deco: { src: imgDolphin,   w: 90, pos: { right: -18, bottom: -14 }, op: 0.90,
      anim: { y: [0, -14, 0], rotate: [-7, 7, -7] }, trans: { duration: 2.4, repeat: Infinity } },
  },
  {
    id: "memory-shape-recall", label: "හැඩ මතකය", subtitle: "හැඩ රටා අනුපිළිවෙල මතක තබා එකම පිළිවෙලට තෝරමු!", subtitleIcon: "triangle", levels: 2, available: true,
    color: "#4F46E5", bg: "#E0E7FF", icon: "shapes", audio: audioImageMatch, mascot: cardMascotWhale,
    deco: { src: imgMermaid, w: 84, pos: { right: -12, bottom: -10 }, op: 0.86,
      anim: { y: [0, -10, 0], rotate: [-5, 5, -5] }, trans: { duration: 2.4, repeat: Infinity } },
  },
  {
    id: "video-story", label: "කතාව මතකද?", subtitle: "වීඩියෝ බලලා ප්‍රශ්න වලට උත්තර දෙමු!", subtitleIcon: "film", levels: 1, available: true,
    color: "#0D9488", bg: "#CCFBF1", icon: "video", audio: audioVideoStory, mascot: cardMascotCrab,
    deco: { src: imgMermaid, w: 88, pos: { right: -14, bottom: -10 }, op: 0.88,
      anim: { y: [0, -12, 0], rotate: [-5, 5, -5] }, trans: { duration: 2.6, repeat: Infinity } },
  },
];

// ─────────────────────────────────────────────
//  MINIMALISTIC SVG ICONS
// ─────────────────────────────────────────────
const GameIcon = ({ type, size = 36, color = "#0284C7" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "brain":    return <svg {...p}><path d="M9.5 2a2.5 2.5 0 0 1 5 0M12 2v4M9 6a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3"/><path d="M6 10H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2M18 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M9 18v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2"/></svg>;
    case "palette":  return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.5" fill={color}/><circle cx="12" cy="7" r="1.5" fill={color}/><circle cx="16" cy="10" r="1.5" fill={color}/><circle cx="16" cy="15" r="1.5" fill={color}/><path d="M12 17c1.5 0 3-1 3-2.5a2.5 2.5 0 0 0-5 0C10 16 11.5 17 12 17z"/></svg>;
    case "target":   return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>;
    case "cards":    return <svg {...p}><rect x="2" y="5" width="13" height="17" rx="2"/><path d="M6 2h13a2 2 0 0 1 2 2v13"/><line x1="7" y1="10" x2="12" y2="10"/><line x1="7" y1="14" x2="12" y2="14"/></svg>;
    case "shapes":   return <svg {...p}><circle cx="7" cy="7" r="3"/><rect x="12.5" y="4" width="6" height="6" rx="1"/><polygon points="7 13 10 19 4 19"/><polygon points="15.5 13 19 16.5 15.5 20 12 16.5"/></svg>;
    case "clipboard":return <svg {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
    case "search":   return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></svg>;
    case "clock":    return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "sort":     return <svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/><polyline points="17 16 21 12 17 8"/></svg>;
    case "music":    return <svg {...p}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case "puzzle":   return <svg {...p}><path d="M20.54 15H17v-3h3.54A1.5 1.5 0 0 0 22 10.5v-1A1.5 1.5 0 0 0 20.5 8H17V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3.5A1.5 1.5 0 0 1 5.5 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1.5A1.5 1.5 0 0 1 7 16.5V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4h3.54A1.5 1.5 0 0 0 22 14.5v-1A1.5 1.5 0 0 0 20.54 15z"/></svg>;
    case "video":    return <svg {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    default:         return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
  }
};

const LockIcon  = ({ size=16 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const CheckIcon = ({ size=14 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StarIcon  = ({ size=14, filled=false }) => <svg viewBox="0 0 24 24" width={size} height={size} fill={filled?"#F59E0B":"none"} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const PlayIcon  = ({ size=18 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

// Small inline icons for game-card subtitles — no emojis, pure SVG
const SubtitleIcon = ({ type, size=13, color="#555" }) => {
  const p = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:color, strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round", style:{flexShrink:0} };
  switch(type) {
    case "ordered":   return <svg {...p}><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
    case "crosshair": return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case "film":      return <svg {...p}><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/></svg>;
    case "sparkle":   return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M18.36 5.64l-2.83 2.83M8.46 15.54l-2.83 2.83"/></svg>;
    case "triangle":  return <svg {...p}><polygon points="12 2 22 22 2 22"/></svg>;
    case "volume":    return <svg {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
    case "link":      return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    case "eye":       return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "focus":     return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>;
    case "zap":       return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    default:          return null;
  }
};

// ─────────────────────────────────────────────
//  SEA BACKGROUND — same components as NBackGame
// ─────────────────────────────────────────────
const Mot = motion;

const JellyfishSVG = ({ size=44, color="#C084FC", wiggle=false }) => {
  const tentacles = [8,16,24,32,40,48];
  return (
    <svg viewBox="0 0 60 90" width={size} height={size*1.5} aria-hidden="true" overflow="visible">
      <ellipse cx="30" cy="28" rx="26" ry="10" fill={color} opacity="0.25"/>
      <path d="M4 30 Q4 2 30 2 Q56 2 56 30 Z" fill={color} opacity="0.80"/>
      <path d="M14 25 Q18 8 30 6 Q42 8 46 25" fill="white" opacity="0.18"/>
      {tentacles.map((x,i)=>(
        <Mot.path key={i}
          d={`M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`}
          stroke={color} strokeWidth="2.5" fill="none" opacity="0.65" strokeLinecap="round"
          animate={wiggle?{ d:[
            `M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`,
            `M${x} 30 Q${x+(i%2===0?7:-7)} 52 ${x} 70 Q${x+(i%2===0?-6:6)} 82 ${x} 90`,
            `M${x} 30 Q${x+(i%2===0?-7:7)} 52 ${x} 70 Q${x+(i%2===0?6:-6)} 82 ${x} 90`,
          ]}:{}}
          transition={{ duration:1.2+i*0.15, delay:i*0.1, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}
    </svg>
  );
};
const SeaweedSVG = ({ size=50, color="#34D399" }) => (
  <svg viewBox="0 0 30 80" width={size*0.4} height={size} aria-hidden="true">
    <path d="M15 80 Q8 60 15 45 Q22 30 15 15 Q10 5 15 0" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M15 60 Q5 55 8 45" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M15 35 Q25 30 22 20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
  </svg>
);
const StarfishSVG = ({ size=36, color="#FB923C" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    {[0,72,144,216,288].map((angle,i)=>{
      const r=(angle*Math.PI)/180;
      return <line key={i} x1="40" y1="40" x2={40+36*Math.cos(r)} y2={40+36*Math.sin(r)} stroke={color} strokeWidth="9" strokeLinecap="round"/>;
    })}
    <circle cx="40" cy="40" r="10" fill={color}/>
    <circle cx="40" cy="40" r="5" fill="white" opacity="0.4"/>
  </svg>
);
const ShellSVG = ({ size=32, color="#F9A8D4" }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true">
    <path d="M40 40 m0,-30 a30,30 0 1,1 0,60 a20,20 0 1,0 0,-40 a10,10 0 1,1 0,20" stroke={color} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9"/>
    <circle cx="40" cy="40" r="5" fill={color} opacity="0.9"/>
    <circle cx="40" cy="40" r="2" fill="white" opacity="0.6"/>
  </svg>
);
const BubbleSVG = ({ size=16, color="#93C5FD" }) => (
  <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true">
    <circle cx="15" cy="15" r="13" fill={color} opacity="0.35"/>
    <circle cx="15" cy="15" r="13" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="9" cy="9" r="4" fill="white" opacity="0.4"/>
  </svg>
);
const WaveStrip = ({ y, opacity, color, duration }) => (
  <Mot.div className="absolute w-full pointer-events-none" style={{ bottom:`${y}%`, opacity, height:28 }}
    animate={{ x:[0,-60,0] }} transition={{ duration, repeat:Infinity, ease:"linear" }}>
    <svg viewBox="0 0 400 28" width="400%" height="28" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 14 Q50 0 100 14 Q150 28 200 14 Q250 0 300 14 Q350 28 400 14 L400 28 L0 28 Z" fill={color}/>
    </svg>
  </Mot.div>
);

const SEA_CREATURES = [
  { type:"jellyfish", x:8,   y:52, size:52, color:"#C084FC", delay:0,   dur:8,  opacity:0.68, wiggle:true },
  { type:"jellyfish", x:76,  y:45, size:42, color:"#F9A8D4", delay:3.5, dur:10, opacity:0.60, wiggle:true },
  { type:"jellyfish", x:44,  y:60, size:36, color:"#818CF8", delay:6,   dur:9,  opacity:0.55, wiggle:true },
  { type:"seaweed",   x:3,   y:62, size:72, color:"#34D399", delay:0,   dur:3.0, opacity:0.70 },
  { type:"seaweed",   x:18,  y:66, size:58, color:"#4ADE80", delay:0.8, dur:3.8, opacity:0.60 },
  { type:"seaweed",   x:64,  y:64, size:65, color:"#34D399", delay:1.5, dur:3.2, opacity:0.65 },
  { type:"seaweed",   x:88,  y:67, size:55, color:"#4ADE80", delay:0.3, dur:4.0, opacity:0.60 },
  { type:"starfish",  x:34,  y:80, size:38, color:"#FB923C", delay:0,   dur:4,   opacity:0.70 },
  { type:"starfish",  x:58,  y:83, size:30, color:"#F87171", delay:1.5, dur:5,   opacity:0.65 },
  { type:"shell",     x:46,  y:83, size:32, color:"#F9A8D4", delay:0,   dur:0.4, opacity:0.75 },
  { type:"shell",     x:78,  y:80, size:26, color:"#FDE68A", delay:0.2, dur:0.5, opacity:0.70 },
  { type:"shell",     x:26,  y:84, size:24, color:"#86EFAC", delay:0.1, dur:0.45,opacity:0.65 },
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
  if (item.type==="jellyfish") return (
    <Mot.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity }}
      animate={{ y:["0%","-22%","0%"],x:["0%","4%","-4%","0%"] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <Mot.div animate={{ scale:[1,1.08,1] }} transition={{ duration:item.dur*0.5,repeat:Infinity,ease:"easeInOut" }}>
        <JellyfishSVG size={item.size} color={item.color} wiggle={item.wiggle}/>
      </Mot.div>
    </Mot.div>
  );
  if (item.type==="seaweed") return (
    <Mot.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity,transformOrigin:"50% 100%" }}
      animate={{ rotate:[-14,14,-14] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <SeaweedSVG size={item.size} color={item.color}/>
    </Mot.div>
  );
  if (item.type==="starfish") return (
    <Mot.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity }}
      animate={{ rotate:[0,15,-15,8,-8,0],scale:[1,1.1,1] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <StarfishSVG size={item.size} color={item.color}/>
    </Mot.div>
  );
  if (item.type==="shell") return (
    <Mot.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity }}
      animate={{ rotate:[-12,12,-12],x:[-3,3,-3] }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"easeInOut" }}>
      <ShellSVG size={item.size} color={item.color}/>
    </Mot.div>
  );
  return null;
};

const AnimatedSeaBg = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex:0 }}>
    <picture className="absolute inset-0 block h-full w-full">
      <source
        media="(orientation: portrait) and (max-width: 1024px)"
        srcSet={homeSeaPortraitBg}
      />
      <img
        src={homeSeaLandscapeBg}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-center brightness-110 contrast-110 saturate-110"
      />
    </picture>
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-200/5 via-transparent to-blue-950/10" />
    <Mot.div className="absolute top-[-50px] left-1/2 -translate-x-1/2 rounded-full"
      style={{ width:380,height:380,background:"radial-gradient(circle,rgba(255,255,200,0.15) 0%,transparent 70%)" }}
      animate={{ scale:[1,1.07,1],opacity:[0.6,1,0.6] }} transition={{ duration:4,repeat:Infinity,ease:"easeInOut" }}/>
    {SEA_CREATURES.map((item,i)=><SeaCreature key={i} item={item}/>)}
    {BUBBLES.map((b,i)=>(
      <Mot.div key={i} className="absolute pointer-events-none" style={{ left:`${b.x}%`,bottom:"4%" }}
        animate={{ y:[0,-580],opacity:[0,0.65,0.45,0] }} transition={{ duration:b.dur,delay:b.delay,repeat:Infinity,ease:"easeOut" }}>
        <BubbleSVG size={b.size} color="#93C5FD"/>
      </Mot.div>
    ))}
    <WaveStrip y={8}  opacity={0.18} color="#0284C7" duration={8}/>
    <WaveStrip y={4}  opacity={0.12} color="#0369A1" duration={12}/>
    <WaveStrip y={0}  opacity={0.20} color="#075985" duration={6}/>
    <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background:"linear-gradient(0deg,#92400E44,transparent)" }}/>
  </div>
);

// ─────────────────────────────────────────────
//  LEVEL DOTS ROW
// ─────────────────────────────────────────────
const LevelDots = ({ gameId, totalLevels, getProgress, isCompleted, isUnlocked, onSelect, accentColor }) => (
  <div className="flex items-center justify-center gap-2 flex-wrap">
    {Array.from({ length:totalLevels },(_,i)=>{
      const lvl   = i+1;
      const comp  = isCompleted(gameId,lvl);
      const unlo  = isUnlocked(lvl);
      const prog  = getProgress(gameId,lvl);
      return (
        <Mot.button key={lvl}
          whileHover={unlo?{ scale:1.15,y:-2 }:{}}
          whileTap={unlo?{ scale:0.9 }:{}}
          onClick={()=>unlo&&onSelect(lvl)}
          className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold shadow transition-all"
          style={{
            background: !unlo?"rgba(200,200,200,0.5)":comp?"#22C55E":accentColor,
            color:"white", border:!unlo?"1px solid rgba(180,180,180,0.4)":`2px solid ${accentColor}cc`,
            cursor:unlo?"pointer":"not-allowed",
            backdropFilter:"blur(4px)",
          }}
          title={!unlo?"ඉදිරි මට්ටම් ජය ගත්තාම unlock වෙනවා!":comp?`${prog}% ජය ගත්තා!`:`මට්ටම ${lvl} - ක්‍රීඩා කරන්න!`}
        >
          {!unlo?<LockIcon size={18}/>:comp?<CheckIcon size={18}/>:lvl}
        </Mot.button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────
//  GAME CARD
// ─────────────────────────────────────────────
const GameCard = ({ game, unlockedLevel, isCompleted, getLevelProgress, adaptiveProfile, onSelect }) => {
  const [cardAudioPlaying, setCardAudioPlaying] = React.useState(false);
  const cardAudioRef = React.useRef(null);
  const adaptiveState = getAdaptivePresentation(adaptiveProfile);

  const handleCardAudio = (e) => {
    e.stopPropagation();
    if (!cardAudioRef.current) return;
    if (cardAudioPlaying) {
      cardAudioRef.current.pause();
      cardAudioRef.current.currentTime = 0;
      setCardAudioPlaying(false);
    } else {
      cardAudioRef.current.play();
      setCardAudioPlaying(true);
    }
  };

  const availLevels = Array.from({ length:game.levels },(_,i)=>i+1);
  // Level 1 is always unlocked; subsequent levels unlock when the previous is completed
  const isUnlocked  = (lvl) => game.available && (lvl === 1 || lvl <= unlockedLevel);
  // Use the complete, server-loaded per-level progress snapshot. Completed
  // levels remain 100%, while partial attempts from another device no longer
  // disappear behind a completed-level-only calculation.
  const overallPct = game.available
    ? Math.round(availLevels.reduce((sum, lvl) => {
        const levelPercent = isCompleted(game.id, lvl)
          ? 100
          : Number(getLevelProgress(game.id, lvl)) || 0;
        return sum + Math.max(0, Math.min(100, levelPercent));
      }, 0) / game.levels)
    : 0;
  // Start at the first unlocked level that hasn't been completed yet, or the highest unlocked
  const nextPlayLevel = availLevels.find(l => isUnlocked(l) && !isCompleted(game.id, l)) ?? Math.max(...availLevels.filter(l => isUnlocked(l)));
  const mascotOnLeft = GAMES.findIndex(({ id }) => id === game.id) % 2 === 1;

  if (game.available) {
    const adaptiveIndicator = {
      challenge: { color:'#22C55E', ring:'#DCFCE7', label:'අභියෝගාත්මක' },
      balanced: { color:'#FACC15', ring:'#FEF9C3', label:'සමතුලිත' },
      support: { color:'#EF4444', ring:'#FEE2E2', label:'සහාය අවශ්‍ය' },
    }[adaptiveState.tier];

    return (
      <Mot.section
        initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }}
        whileHover={{ y:-4,boxShadow:'0 22px 42px rgba(15,23,42,.2)' }}
        transition={{ type:'spring',stiffness:210,damping:20 }}
        className="relative overflow-hidden rounded-[2rem] border-2 border-cyan-100 bg-gradient-to-b from-white via-cyan-50 to-sky-100 shadow-xl"
        aria-label={`${game.label} ක්‍රීඩාව`}
      >
        {game.audio && <audio ref={cardAudioRef} src={game.audio} onEnded={()=>setCardAudioPlaying(false)}/>}

        <div className="relative flex min-h-16 items-center gap-3 overflow-hidden px-4 py-1.5 pr-28 text-white sm:min-h-[4.5rem] sm:gap-4 sm:px-5 sm:py-2 sm:pr-32"
          style={{ background:`linear-gradient(120deg,${game.color},${game.color}d9 58%,#38BDF8)` }}>
          {[{ left:'12%',top:18,size:12 },{ left:'44%',top:10,size:8 },{ left:'67%',top:72,size:14 }].map((bubble,index)=>(
            <Mot.span key={index} aria-hidden="true"
              className="pointer-events-none absolute rounded-full border border-white/50 bg-white/20"
              style={{ left:bubble.left,top:bubble.top,width:bubble.size,height:bubble.size }}
              animate={{ y:[0,-7,0],opacity:[.45,.85,.45] }}
              transition={{ duration:2.2+(index*.4),repeat:Infinity,delay:index*.25 }}/>
          ))}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/90 shadow-lg sm:h-14 sm:w-14">
            <GameIcon type={game.icon} size={32} color={game.color}/>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black leading-tight drop-shadow-sm sm:text-2xl">{game.label}</h3>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-1.5 sm:right-4 sm:top-4 sm:gap-2">
            <div className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg sm:h-11 sm:w-11"
              title={`Adaptive: ${adaptiveIndicator.label}`} aria-label={`Adaptive මට්ටම: ${adaptiveIndicator.label}`}>
              <span className="h-5 w-5 rounded-full"
                style={{ background:adaptiveIndicator.color,boxShadow:`0 0 0 5px ${adaptiveIndicator.ring}` }}/>
              <span className="pointer-events-none absolute right-0 top-12 z-20 hidden whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white shadow-xl group-hover:block">
                {adaptiveIndicator.label}
              </span>
            </div>
            {game.audio && (
              <button type="button" onClick={handleCardAudio} title="උපදෙස් අසන්න"
                aria-label={cardAudioPlaying?'උපදෙස් නවත්වන්න':'උපදෙස් අසන්න'}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white text-base shadow-lg transition hover:scale-105 sm:h-11 sm:w-11 sm:text-lg"
                style={{ animation:cardAudioPlaying?'card-pulse 1.2s ease-in-out infinite':'none' }}>
                {cardAudioPlaying?'⏹':'🔊'}
              </button>
            )}
          </div>
          <svg className="pointer-events-none absolute -bottom-px left-0 h-4 w-full text-white/95"
            viewBox="0 0 500 30" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 18 Q65 2 130 18 T260 18 T390 18 T520 18 V30 H0Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="relative px-3 pb-1.5 pt-1 sm:px-5 sm:pb-2 sm:pt-1.5">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span className="absolute -left-6 bottom-2 h-20 w-20 rounded-full bg-cyan-200/35 blur-2xl" />
            <span className="absolute right-2 top-2 h-16 w-16 rounded-full bg-blue-200/35 blur-xl" />
          </div>
          <div className="relative z-10 mb-1 flex items-center justify-between text-xs font-black sm:text-sm">
            <span className="text-slate-600">ඔයාගේ ප්‍රගතිය</span>
            <span style={{ color:game.color }}>{overallPct}%</span>
          </div>
          <div className="relative z-10 h-2.5 overflow-hidden rounded-full bg-slate-200 shadow-inner sm:h-3">
            <Mot.div className="h-full rounded-full"
              style={{ background:`linear-gradient(90deg,${game.color},${game.color}bb)` }}
              initial={{ width:0 }} animate={{ width:`${overallPct}%` }}
              transition={{ duration:.8,ease:'easeOut' }}/>
          </div>
          <div className={`relative z-10 mt-1 grid min-w-0 items-center gap-2 sm:mt-1.5 sm:gap-3 ${
            mascotOnLeft
              ? "grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)]"
              : "grid-cols-[minmax(0,1fr)_5.5rem] sm:grid-cols-[minmax(0,1fr)_7rem]"
          }`}>
            <div className={`min-w-0 px-1 py-0.5 sm:px-2 sm:py-1 ${mascotOnLeft ? "order-2" : "order-1"}`}>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 lg:gap-7">
                {availLevels.map((lvl)=>{
                  const unlocked = isUnlocked(lvl);
                  const completed = isCompleted(game.id,lvl);
                  return (
                    <div key={lvl}>
                      <Mot.button
                        type="button"
                        whileHover={unlocked?{ scale:1.08,y:-4 }:undefined}
                        whileTap={unlocked?{ scale:.94 }:undefined}
                        onClick={()=>unlocked&&onSelect(game.id,lvl)}
                        disabled={!unlocked}
                        className="relative flex h-20 w-20 items-center justify-center rounded-full border-[5px] text-4xl font-black text-white shadow-[0_12px_24px_rgba(15,23,42,0.25)] ring-[3px] ring-white/70 transition sm:h-[5.5rem] sm:w-[5.5rem] sm:text-5xl lg:h-24 lg:w-24 lg:text-5xl"
                        style={{
                          background:!unlocked?'linear-gradient(145deg,#E2E8F0,#B8C5D6)':completed?'linear-gradient(145deg,#22C55E,#16A34A)':`linear-gradient(145deg,${game.color},#075985)`,
                          borderColor:!unlocked?'#FFFFFF':completed?'#BBF7D0':'#E0F2FE',
                          cursor:unlocked?'pointer':'not-allowed',
                        }}
                        aria-label={`මට්ටම ${lvl}${completed?' සම්පූර්ණයි':unlocked?'':' අගුළු දමා ඇත'}`}
                      >
                        {!unlocked?<LockIcon size={38}/>:lvl}
                        {completed&&(
                          <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white shadow sm:h-8 sm:w-8">
                            <CheckIcon size={16}/>
                          </span>
                        )}
                      </Mot.button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`flex h-full min-h-16 items-center justify-center overflow-visible ${mascotOnLeft ? "order-1" : "order-2"}`}>
              <Mot.img src={game.mascot} alt="" aria-hidden="true"
                className="pointer-events-none h-20 w-20 max-w-none select-none object-contain drop-shadow-xl sm:h-24 sm:w-24"
                animate={{ y:[0,-5,0],rotate:[-2,2,-2] }}
                transition={{ duration:2.4,repeat:Infinity,ease:'easeInOut' }}/>
            </div>
          </div>
        </div>
      </Mot.section>
    );
  }

  return (
    <Mot.div
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      whileHover={game.available?{ y:-4, boxShadow:"0 20px 40px rgba(0,0,0,0.18)" }:{}}
      transition={{ type:"spring",stiffness:200,damping:20 }}
      className="rounded-3xl p-8 flex flex-col gap-5 relative overflow-hidden"
      style={{ background:"rgba(255,255,255,0.88)", backdropFilter:"blur(14px)", border:`3px solid ${game.color}33`, boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}
    >
      {/* Sea creature decoration */}
      {game.deco && (
        <Mot.img
          src={game.deco.src}
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ width:game.deco.w, height:"auto", ...game.deco.pos, opacity:game.deco.op??0.88, zIndex:0 }}
          animate={game.deco.anim}
          transition={{ ...game.deco.trans, ease:"easeInOut" }}
        />
      )}
      {/* Audio element for card instruction */}
      {game.audio && (
        <audio ref={cardAudioRef} src={game.audio} onEnded={() => setCardAudioPlaying(false)} />
      )}

      {/* Voice instruction button — top-right, only for available games with audio */}
      {game.available && game.audio && (
        <button
          type="button"
          onClick={handleCardAudio}
          title="උපදෙස් අසන්න"
          aria-label={cardAudioPlaying ? "Stop" : "Play card instructions"}
          style={{
            position: 'absolute', top: '0.85rem', right: '0.85rem', zIndex: 2,
            width: '2.8rem', height: '2.8rem', borderRadius: '50%',
            border: `2px solid ${game.color}55`,
            background: cardAudioPlaying
              ? `linear-gradient(135deg,#EF4444,#F87171)`
              : `linear-gradient(135deg,${game.color},${game.color}cc)`,
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.05rem',
            boxShadow: cardAudioPlaying ? '0 0 0 4px rgba(239,68,68,0.22)' : `0 2px 10px ${game.color}55`,
            transition: 'background 0.2s, box-shadow 0.2s',
            animation: cardAudioPlaying ? 'card-pulse 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{cardAudioPlaying ? '⏹' : '🔊'}</span>
        </button>
      )}

      {/* Top row: icon + title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width:88,height:88,background:`linear-gradient(135deg,${game.bg},${game.color}22)`,border:`2px solid ${game.color}33` }}>
          <GameIcon type={game.icon} size={52} color={game.color}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-gray-900 text-2xl leading-snug">{game.label}</p>
          {game.subtitle && (
            <span className="flex items-center gap-1 mt-0.5" style={{ color:game.color, opacity:0.85 }}>
              <SubtitleIcon type={game.subtitleIcon} size={13} color={game.color} />
              <span className="text-sm font-semibold">{game.subtitle}</span>
            </span>
          )}
          <p className="text-base font-semibold text-gray-600 mt-1">
            {game.available
              ? `${game.levels} මට්ටම්`
              : `${game.levels} මට්ටම්`}
          </p>
          {game.available && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mt-2"
              style={{ background: adaptiveState.surface, color: adaptiveState.color, border: `1px solid ${adaptiveState.color}33` }}
            >
              <span className="text-xs font-black tracking-wide uppercase">Adaptive</span>
              <span className="text-sm font-extrabold">{adaptiveState.shortLabel}</span>
            </div>
          )}
          {/* Overall progress bar */}
          {game.available && (
            <div className="mt-2 h-4 w-full rounded-full" style={{ background:"rgba(200,200,200,0.4)" }}>
              <Mot.div className="h-4 rounded-full" style={{ background:game.color }}
                initial={{ width:0 }} animate={{ width:`${overallPct}%` }} transition={{ duration:0.8,ease:"easeOut" }}/>
            </div>
          )}
        </div>
      </div>

      {game.available && (
        <div className="rounded-2xl px-4 py-3" style={{ background: `${adaptiveState.color}10`, border: `1px solid ${adaptiveState.color}22` }}>
          <p className="text-sm font-bold leading-relaxed" style={{ color: adaptiveState.color }}>{adaptiveState.message}</p>
        </div>
      )}

      {/* Level dots / mode buttons */}
      <LevelDots
        gameId={game.id}
        totalLevels={game.levels}
        getProgress={getLevelProgress}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
        onSelect={(lvl)=>onSelect(game.id,lvl)}
        accentColor={game.color}
      />

      {/* Play button */}
      <Mot.button
        whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
        onClick={()=>onSelect(game.id, game.id === "reverse-sequence" ? "color" : nextPlayLevel)}
        className="flex items-center justify-center gap-2 rounded-full py-5 text-xl font-extrabold text-white shadow-md"
        style={{ background:`linear-gradient(90deg,${game.color},${game.color}cc)`, fontSize:"1.25rem" }}
      >
        <PlayIcon size={24}/> ක්‍රීඩා කරමු!
      </Mot.button>
    </Mot.div>
  );
};

// ─────────────────────────────────────────────
//  SUMMARY BAR  (top of page)
// ─────────────────────────────────────────────
const SummaryBar = ({ isLevelCompleted }) => {
  const totalLevels   = GAMES.filter(g=>g.available).reduce((s,g)=>s+g.levels,0);
  const completedLevels = GAMES.filter(g=>g.available).reduce((s,g)=>
    s + Array.from({length:g.levels},(_,i)=>i+1).filter(l=>isLevelCompleted(g.id,l)).length, 0);
  const pct = Math.round((completedLevels/totalLevels)*100);
  return (
    <div className="relative flex min-h-20 items-center gap-3 overflow-visible rounded-2xl border border-cyan-200/80 py-2 pl-24 pr-4 sm:min-h-24 sm:gap-5 sm:py-2.5 sm:pl-28 sm:pr-6"
      style={{ background:"linear-gradient(110deg,rgba(236,254,255,.94),rgba(219,234,254,.94))",backdropFilter:"blur(12px)",boxShadow:"0 6px 22px rgba(3,105,161,0.16)" }}>
      <Mot.img
        src={progressDolphinHolder}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -left-10 z-10 w-56 max-w-none select-none object-contain drop-shadow-xl sm:-bottom-5 sm:-left-11 sm:w-64"
        animate={{ y:[0,-4,0],rotate:[-1,1,-1] }}
        transition={{ duration:3,repeat:Infinity,ease:"easeInOut" }}
      />
      <div className="relative z-20 min-w-0 flex-1">
        <div className="mb-1.5 flex flex-col gap-0.5 font-bold text-slate-700 sm:flex-row sm:justify-between">
          <span className="text-sm sm:text-base">ඔයාගේ ප්‍රගතිය</span>
          <span className="text-sm sm:text-base" style={{ color:"#0369A1" }}>{completedLevels} / {totalLevels} මට්ටම් ජය ගත්තා!</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-sky-200/70 shadow-inner sm:h-3.5">
          <Mot.div className="h-full rounded-full" style={{ background:"linear-gradient(90deg,#06B6D4,#0284C7,#2563EB)" }}
            initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1,ease:"easeOut" }}/>
        </div>
      </div>
      <div className="relative z-20 shrink-0 text-right">
        <div className="text-3xl font-extrabold sm:text-4xl" style={{ color:"#0369A1" }}>{pct}%</div>
        <div className="mt-0.5 flex justify-end gap-0.5">
          {[0,1,2].map(i=><StarIcon key={i} size={18} filled={pct>=(i+1)*33}/>)}
        </div>
      </div>
    </div>
  );
};

const AdaptiveAdminPanel = ({
  games,
  getAdaptiveProfile,
  onResetGame,
  onResetAll,
  onClose,
  onViewPerformance,
}) => {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center px-4" style={{ background: "rgba(2, 6, 23, 0.6)" }}>
      <Mot.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-4xl rounded-3xl p-6"
        style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-3xl font-black text-slate-800">අනුවර්තන ගුරු පාලක පුවරුව</p>
            <p className="text-sm font-semibold text-slate-600">එක් එක් මතක ක්‍රීඩාවේ අනුවර්තන පැතිකඩ පරීක්ෂා කර අවශ්‍ය නම් යළි සකසන්න.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 font-extrabold text-white"
            style={{ background: "#475569" }}
          >
            වසන්න
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0" style={{ background: "#E2E8F0" }}>
              <tr>
                <th className="px-4 py-3 font-black text-slate-700">ක්‍රීඩාව</th>
                <th className="px-4 py-3 font-black text-slate-700">මට්ටම</th>
                <th className="px-4 py-3 font-black text-slate-700">ලකුණු</th>
                <th className="px-4 py-3 font-black text-slate-700">අවසාන නිරවද්‍යතාව</th>
                <th className="px-4 py-3 font-black text-slate-700">යාවත්කාලීන වූ වේලාව</th>
                <th className="px-4 py-3 font-black text-slate-700">ක්‍රියාව</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const profile = getAdaptiveProfile(game.id);
                const present = getAdaptivePresentation(profile);
                return (
                  <tr key={game.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-bold text-slate-800">{game.label}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full px-3 py-1 font-extrabold" style={{ color: present.color, background: present.surface }}>
                        {present.shortLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{profile.score}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{profile.lastAccuracy ?? "-"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onResetGame(game.id, game.label)}
                        className="rounded-lg px-3 py-2 font-extrabold text-white"
                        style={{ background: "#DC2626" }}
                      >
                        යළි සකසන්න
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={onViewPerformance}
            className="rounded-xl px-5 py-3 font-extrabold text-white"
            style={{
              background: "linear-gradient(90deg,#0284C7,#0EA5E9)",
              boxShadow: "0 6px 18px rgba(14,165,233,0.25)",
            }}
          >
            සම්පූර්ණ කාර්යසාධනය බලන්න
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="rounded-xl px-4 py-2 font-extrabold text-white"
            style={{
              background: "linear-gradient(90deg,#B91C1C,#EF4444)",
            }}
          >
            සියලු අනුවර්තන පැතිකඩ යළි සකසන්නද?
          </button>
        </div>
      </Mot.div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  PERFORMANCE PANEL
// ─────────────────────────────────────────────
const PerformancePanel = ({ games, progress, onClose, standalone = false }) => {
  const [historyGame, setHistoryGame] = React.useState(null);

  // IMPORTANT:
  // Number(null) and Number("") are 0 in JavaScript. That caused old/null
  // adaptive values to be treated as real 0-attempt records in the dashboard.
  const safeNumber = safeMetricNumber;

  const getGamePerformance = (game) => {
    const gameProgress = progress?.[game.id] || {};
    const profile = gameProgress.adaptiveProfile || {};
    const levelStatResults = Object.entries(gameProgress.levelStats || {})
      .filter(([, stats]) => stats && typeof stats === "object")
      .map(([level, stats]) => {
        const correct = safeNumber(stats.correct);
        const total = safeNumber(stats.total);
        const calculatedAccuracy =
          correct !== null && total !== null && total > 0
            ? Math.round((correct / total) * 100)
            : null;

        return {
          accuracy: safeNumber(stats.accuracy) ?? safeNumber(stats.pct) ?? calculatedAccuracy,
          averageResponseMs: stats.averageResponseMs ?? null,
          timestamp: stats.timestamp ?? null,
          metrics: { ...stats, level: Number(level) },
        };
      });

    // `performanceHistory` is the complete session history. If its background
    // write failed, completed-level stats are still saved through the normal
    // progress API, so use those before falling back to legacy adaptive data.
    const rawPerformanceResults = Array.isArray(gameProgress.performanceHistory)
      && gameProgress.performanceHistory.length > 0
      ? gameProgress.performanceHistory
      : levelStatResults.length > 0
        ? levelStatResults
        : (Array.isArray(profile.recentResults) ? profile.recentResults : []);

    // Older Puzzle Game builds could save the same completed session many
    // times during one render cycle. Collapse only identical neighbouring
    // records written within 15 seconds, while preserving genuine replays.
    const performanceResults = dedupePerformanceResults(rawPerformanceResults);

    // Keep only results that actually contain an accuracy value.
    const resultsWithAccuracy = performanceResults.filter(
      (result) => result && safeNumber(result.accuracy) !== null
    );

    // Games use "attempts" differently (answers, retries, and wrong
    // selections). Do not compare or add them. Every newly saved result keeps
    // the game's own `correct` and `total` values in `metrics`, which gives a
    // consistent child-facing measure: correct answers / questions or rounds.
    const questionResults = resultsWithAccuracy.filter((result) => {
      const metrics = result.metrics || result;
      const correct = safeNumber(metrics.correct);
      const total = safeNumber(metrics.total);
      return correct !== null && correct >= 0 && total !== null && total > 0;
    });

    const totals = questionResults.reduce(
      (acc, result) => {
        const metrics = result.metrics || result;
        const total = safeNumber(metrics.total) ?? 0;
        const correct = Math.min(total, Math.max(0, safeNumber(metrics.correct) ?? 0));

        acc.totalQuestions += total;
        acc.correctAnswers += correct;

        return acc;
      },
      {
        totalQuestions: 0,
        correctAnswers: 0,
      }
    );

    // Accuracy belongs to the game because some games count retries and wrong
    // selections while others score completed rounds. Recalculating it from
    // correct/total questions can turn a retried session into an incorrect 100%.
    const accuracyFromQuestions =
      totals.totalQuestions > 0
        ? (totals.correctAnswers / totals.totalQuestions) * 100
        : null;

    const latestRecordedAccuracy = safeNumber(profile.lastAccuracy);

    const simpleRecordedAccuracy =
      resultsWithAccuracy.length > 0
        ? resultsWithAccuracy.reduce(
            (sum, result) => sum + (safeNumber(result.accuracy) ?? 0),
            0
          ) / resultsWithAccuracy.length
        : null;

    const accuracy =
      simpleRecordedAccuracy !== null
        ? simpleRecordedAccuracy
        : latestRecordedAccuracy !== null
          ? latestRecordedAccuracy
          : accuracyFromQuestions;

    // Weight response time by the number of questions/rounds, never by the
    // incompatible `attempts` field.
    const responseResults = questionResults.filter((result) => {
      const responseMs = safeNumber(result.averageResponseMs);
      return responseMs !== null && responseMs > 0;
    });

    const responseWeightedTotal = responseResults.reduce((sum, result) => {
      const responseMs = safeNumber(result.averageResponseMs) ?? 0;
      const total = safeNumber((result.metrics || result).total) ?? 0;
      return sum + responseMs * total;
    }, 0);

    const responseQuestionCount = responseResults.reduce((sum, result) => {
      const total = safeNumber((result.metrics || result).total) ?? 0;
      return sum + total;
    }, 0);

    const averageResponseMs =
      responseQuestionCount > 0
        ? responseWeightedTotal / responseQuestionCount
        : null;

    const completedLevels = Array.isArray(gameProgress.completedLevels)
      ? gameProgress.completedLevels.length
      : 0;

    // A game row can represent several play sessions. Show the most recent
    // valid saved date so the dashboard does not imply that all results came
    // from one day. Older fallback records may not contain a timestamp.
    const latestPlayedAt = performanceResults.reduce((latest, result) => {
      const rawTimestamp = result?.timestamp ?? result?.metrics?.timestamp;
      if (!rawTimestamp) return latest;

      const timestamp = new Date(rawTimestamp).getTime();
      if (!Number.isFinite(timestamp)) return latest;

      return latest === null || timestamp > latest ? timestamp : latest;
    }, null);

    // Normalize every saved play session for the history view. The array
    // order is retained for records without dates, while valid timestamps are
    // used to assign stable oldest-to-newest session numbers.
    const sessionHistory = performanceResults
      .filter((result) => result && typeof result === "object")
      .map((result, originalIndex) => {
        const metrics = result.metrics || result;
        const rawTimestamp = result.timestamp ?? metrics.timestamp ?? null;
        const timestamp = rawTimestamp ? new Date(rawTimestamp).getTime() : null;
        const validTimestamp = Number.isFinite(timestamp) ? timestamp : null;
        const totalAttempts = safeNumber(
          metrics.attempts ?? metrics.totalAttempts ?? result.attempts
        );
        const wrongAttempts = safeNumber(
          metrics.mistakes ?? metrics.wrongAttempts ?? result.mistakes
        );
        const questionTotal = safeNumber(metrics.total);
        const recordedCorrect = safeNumber(metrics.correct);
        const correctAnswers = recordedCorrect !== null
          ? Math.max(0, recordedCorrect)
          : totalAttempts !== null && wrongAttempts !== null
            ? Math.max(0, totalAttempts - wrongAttempts)
            : null;
        const accuracy = safeNumber(result.accuracy)
          ?? safeNumber(metrics.accuracy)
          ?? safeNumber(metrics.pct)
          ?? (correctAnswers !== null && questionTotal !== null && questionTotal > 0
            ? (correctAnswers / questionTotal) * 100
            : null);

        return {
          originalIndex,
          level: safeNumber(metrics.level ?? result.level),
          timestamp: validTimestamp,
          accuracy,
          correctAnswers,
          totalQuestions: questionTotal === null ? null : Math.max(0, questionTotal),
          wrongAttempts: wrongAttempts === null ? null : Math.max(0, wrongAttempts),
          totalAttempts: totalAttempts === null ? null : Math.max(0, totalAttempts),
          averageResponseMs: safeNumber(
            result.averageResponseMs ?? metrics.averageResponseMs
          ),
          earnedStars: safeNumber(
            metrics.correctPlacements
              ?? metrics.completedCount
              ?? metrics.gamesCompleted
              ?? metrics.correct
          ),
        };
      })
      .sort((left, right) => {
        if (left.timestamp !== null && right.timestamp !== null) {
          return left.timestamp - right.timestamp;
        }
        return left.originalIndex - right.originalIndex;
      })
      .map((session, index) => ({ ...session, sessionNumber: index + 1 }))
      .reverse();

    const latestSession = sessionHistory[0] || null;
    const latestTotalAttempts = latestSession?.totalAttempts ?? null;
    const latestWrongAttempts = latestSession?.wrongAttempts ?? null;
    const latestCorrectAttempts = latestTotalAttempts !== null
      ? Math.max(0, latestTotalAttempts - (latestWrongAttempts ?? 0))
      : 0;

    return {
      gameId: game.id,
      label: game.label,
      color: game.color,
      accuracy: latestSession?.accuracy ?? accuracy,
      totalQuestions: latestSession?.totalQuestions ?? 0,
      correctAnswers: latestSession?.correctAnswers ?? 0,
      totalAttemptCount: latestTotalAttempts ?? 0,
      correctAttemptCount: latestCorrectAttempts,
      wrongAttemptCount: latestWrongAttempts ?? 0,
      averageResponseMs: latestSession?.averageResponseMs ?? averageResponseMs,
      resultCount: resultsWithAccuracy.length,
      validQuestionResultCount: questionResults.length,
      latestAccuracy: latestRecordedAccuracy,
      adaptiveScore: safeNumber(profile.score),
      completedLevels,
      totalLevels: game.levels,
      latestPlayedAt: latestSession?.timestamp ?? latestPlayedAt,
      sessionHistory,
    };
  };

  const gameRows = games.map(getGamePerformance);
  const rowsWithResults = gameRows.filter((row) => row.resultCount > 0);
  const totalStars = getDurableStarTotal(progress);

  const {
    totalSessions,
    totalCompletedLevels,
    overallAccuracy,
    overallAverageResponseMs,
  } = aggregatePerformanceSummary(gameRows);

  const formatPercent = (value) =>
    value === null ? "-" : `${Math.round(value)}%`;

  const formatResponseTime = (value) => {
    if (value === null) return "-";

    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} s`;
    }

    return `${Math.round(value)} ms`;
  };

  const formatPlayedDate = (timestamp) => {
    if (timestamp === null) return "-";

    return new Intl.DateTimeFormat("si-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  const formatPlayedDateTime = (timestamp) => {
    if (timestamp === null) return "-";

    return new Intl.DateTimeFormat("si-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  return (
    <div
      className={standalone
        ? "relative min-h-screen overflow-hidden px-3 py-6 sm:px-6 sm:py-10"
        : "fixed inset-0 z-[1300] flex items-center justify-center px-4"}
      style={{
        background: standalone
          ? "linear-gradient(145deg, #DFF7FF 0%, #E6FFFB 48%, #D8F3F8 100%)"
          : "rgba(2, 6, 23, 0.68)",
      }}
    >
      {standalone && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" />
        </div>
      )}
      <Mot.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`relative mx-auto w-full rounded-3xl p-4 sm:p-7 ${standalone ? "max-w-[95rem] min-h-[calc(100vh-5rem)] border border-white/80" : "max-w-6xl"}`}
        style={{
          background: "rgba(255,255,255,0.98)",
          boxShadow: standalone
            ? "0 24px 70px rgba(8, 104, 135, 0.18)"
            : "0 24px 64px rgba(0,0,0,0.25)",
          maxHeight: standalone ? "none" : "82vh",
          overflowY: "auto",
        }}
      >
        <div className={`flex gap-4 ${standalone ? "flex-col rounded-3xl bg-gradient-to-r from-sky-800 via-cyan-700 to-teal-600 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7" : "items-center justify-between"}`}>
          <div>
            {standalone && (
              <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                Working Memory Dashboard
              </p>
            )}
            <h2 className={`text-2xl font-black sm:text-3xl ${standalone ? "text-white" : "text-slate-800"}`}>
              ළමුන්ගේ කාර්යසාධන වාර්තාව
            </h2>
            <p className={`mt-2 text-sm font-semibold sm:text-base ${standalone ? "text-white/80" : "text-slate-500"}`}>
              එක් එක් ක්‍රීඩාවේ අලුත්ම වාරයේ ප්‍රතිඵල සහ සම්පූර්ණ ප්‍රගතිය එකම තැනකින් බලන්න.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`shrink-0 rounded-full px-5 py-3 font-extrabold text-white transition hover:scale-[1.03] ${standalone ? "self-start border border-white/30 bg-white/15 sm:self-auto" : ""}`}
            style={{ background: standalone ? undefined : "#475569" }}
          >
            {standalone ? "← පුවරු වෙත" : "වසන්න"}
          </button>
        </div>

        {/* Overall summary */}
        <div className={`mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 ${standalone ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
          {standalone && (
            <div className="relative overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100/80 p-5 shadow-sm">
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-yellow-300/25 blur-xl" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <img src={rewardStar} alt="" className="h-12 w-12 object-contain drop-shadow-md" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-slate-500">එකතු කළ තරු</p>
                  <p className="mt-1 text-3xl font-black text-amber-600">{totalStars}</p>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-100/70 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              සාමාන්‍ය ක්‍රීඩා නිරවද්‍යතාව
            </p>
            <p className="mt-2 text-3xl font-black text-sky-600">
              {formatPercent(overallAccuracy)}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-100/80 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              ක්‍රීඩා කළ වාර
            </p>
            <p className="mt-2 text-3xl font-black text-cyan-700">
              {totalSessions}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-100/70 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              සම්පූර්ණ කළ මට්ටම්
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {totalCompletedLevels}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-100/70 p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              සාමාන්‍ය ප්‍රතිචාර කාලය
            </p>
            <p className="mt-2 text-2xl font-black text-amber-600">
              {formatResponseTime(overallAverageResponseMs)}
            </p>
          </div>
        </div>

        {/* Game-wise performance */}
        <div className="mt-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-800">ක්‍රීඩා අනුව කාර්යසාධනය</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">වගුවේ අලුත්ම වාරය පෙන්වයි. පෙර වාර සඳහා ඉතිහාසය බලන්න.</p>
          </div>
          <p className="mt-2 text-xs font-bold text-cyan-700 sm:hidden">← වැඩි විස්තර සඳහා පැත්තට ගෙන යන්න →</p>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className={`w-full text-left text-sm ${standalone ? "min-w-[1320px]" : "min-w-[1220px]"}`}>
            <thead style={{ background: "#D8F3F8" }}>
              <tr>
                <th className="px-4 py-3 font-black text-slate-700">ක්‍රීඩාව</th>
                <th className="px-4 py-3 font-black text-slate-700">අලුත්ම නිරවද්‍යතාව</th>
                <th className="px-4 py-3 font-black text-slate-700">අලුත්ම වාරයේ නිවැරදි / මුළු ප්‍රශ්න</th>
                <th className="min-w-[210px] px-4 py-3 font-black text-slate-700">අලුත්ම වාරයේ උත්සාහ</th>
                <th className="px-4 py-3 font-black text-slate-700">අලුත්ම ප්‍රතිචාර කාලය</th>
                <th className="px-4 py-3 font-black text-slate-700">සම්පූර්ණ මට්ටම්</th>
                <th className="px-4 py-3 font-black text-slate-700">අවසන් වරට ක්‍රීඩා කළ දිනය</th>
                <th className="px-4 py-3 font-black text-slate-700">උත්සාහ ඉතිහාසය</th>
              </tr>
            </thead>

            <tbody>
              {gameRows.map((row) => (
                <tr key={row.gameId} className="border-t border-slate-100">
                  <td className="min-w-[210px] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ background: row.color }} />
                      <span className="font-extrabold text-slate-800">{row.label}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className="inline-flex rounded-full px-3 py-1 font-black"
                      style={{
                        color:
                          row.accuracy === null
                            ? "#64748B"
                            : row.accuracy >= 80
                              ? "#15803D"
                              : row.accuracy >= 60
                                ? "#B45309"
                                : "#DC2626",
                        background:
                          row.accuracy === null
                            ? "#F1F5F9"
                            : row.accuracy >= 80
                              ? "#DCFCE7"
                              : row.accuracy >= 60
                                ? "#FEF3C7"
                                : "#FEE2E2",
                      }}
                    >
                      {formatPercent(row.accuracy)}
                    </span>
                  </td>

                  <td className="px-4 py-4 font-bold text-slate-700">
                    {row.totalQuestions > 0
                      ? `${row.correctAnswers} / ${row.totalQuestions}`
                      : "-"}
                  </td>
                  <td className="min-w-[210px] px-4 py-4">
                    {row.totalAttemptCount > 0 ? (
                      <div className="space-y-1 text-xs font-bold">
                        <p className="text-slate-700">මුළු උත්සාහ ගණන: {row.totalAttemptCount}</p>
                        <p className="text-emerald-700">නිවැරදි උත්සාහ ගණන: {row.correctAttemptCount}</p>
                        <p className="text-rose-700">වැරදි උත්සාහ ගණන: {row.wrongAttemptCount}</p>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">
                    {formatResponseTime(row.averageResponseMs)}
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">
                    {row.completedLevels} / {row.totalLevels}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-700">
                    {formatPlayedDate(row.latestPlayedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setHistoryGame(row)}
                      className="whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold text-white"
                      style={{ background: row.color }}
                    >
                      උත්සාහ ඉතිහාසය බලන්න
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rowsWithResults.length === 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-800">
              තවම කාර්යසාධන ප්‍රතිඵල වාර්තා වී නැහැ. ක්‍රීඩා කිරීමෙන් පසු
              ඔබේ ප්‍රගතිය මෙහි පෙන්වනු ඇත.
            </p>
          </div>
        )}
      </Mot.div>

      {historyGame && (
        <div
          className="fixed inset-0 z-[1400] flex items-center justify-center px-4"
          style={{ background: "rgba(2, 6, 23, 0.76)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="attempt-history-title"
        >
          <Mot.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-6xl rounded-3xl bg-white p-6 shadow-2xl"
            style={{ maxHeight: "82vh", overflowY: "auto" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="attempt-history-title" className="text-2xl font-black text-slate-800">
                  {historyGame.label} — උත්සාහ ඉතිහාසය
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  අලුත්ම ක්‍රීඩා වාරය පළමුව පෙන්වයි.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryGame(null)}
                className="rounded-full bg-slate-600 px-4 py-2 font-extrabold text-white"
              >
                වසන්න
              </button>
            </div>

            {historyGame.sessionHistory.length > 0 ? (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-black text-slate-700">ක්‍රීඩා වාරය</th>
                    <th className="px-4 py-3 font-black text-slate-700">මට්ටම</th>
                    <th className="px-4 py-3 font-black text-slate-700">දිනය හා වේලාව</th>
                    <th className="px-4 py-3 font-black text-slate-700">නිරවද්‍යතාව</th>
                    <th className="px-4 py-3 font-black text-slate-700">නිවැරදි පිළිතුරු</th>
                    <th className="px-4 py-3 font-black text-slate-700">වැරදි උත්සාහ</th>
                    <th className="px-4 py-3 font-black text-slate-700">මුළු උත්සාහ</th>
                    <th className="px-4 py-3 font-black text-slate-700">සාමාන්‍ය ප්‍රතිචාර කාලය</th>
                  </tr>
                </thead>
                <tbody>
                  {historyGame.sessionHistory.map((session) => (
                    <tr
                      key={`${historyGame.gameId}-${session.sessionNumber}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-4 font-black text-slate-800">
                        වාරය {session.sessionNumber}
                      </td>
                      <td className="px-4 py-4 font-black text-cyan-700">
                        {session.level !== null ? `මට්ටම ${session.level}` : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">
                        {formatPlayedDateTime(session.timestamp)}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {formatPercent(session.accuracy)}
                      </td>
                      <td className="px-4 py-4 font-bold text-emerald-700">
                        {session.correctAnswers ?? "-"}
                      </td>
                      <td className="px-4 py-4 font-bold text-rose-700">
                        {session.wrongAttempts ?? "-"}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {session.totalAttempts ?? "-"}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {formatResponseTime(session.averageResponseMs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-extrabold text-amber-800">
                  මෙම ක්‍රීඩාව සඳහා පෙර උත්සාහ විස්තර තවම සුරැකී නැහැ.
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-700">
                  ක්‍රීඩාව සම්පූර්ණ කළ පසු නව ක්‍රීඩා වාරය මෙහි පෙන්වයි.
                </p>
              </div>
            )}
          </Mot.div>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const HomePage = ({ onGameSelect }) => {
  const { user } = useAuth();
  const {
    progress,
    getUnlockedLevels,
    isLevelCompleted,
    getLevelProgress,
    getAdaptiveProfile,
    resetAdaptiveProfile,
    resetAllAdaptiveProfiles,
  } = useProgress();
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = React.useState(false);
  const canManageWorkingMemory = ["therapist", "admin"].includes(user?.role);

  // Close the protected teacher panel if the signed-in account changes to a student.
  React.useEffect(() => {
    if (!canManageWorkingMemory) {
      setShowAdminPanel(false);
    }
  }, [canManageWorkingMemory]);


  const getMaxUnlocked = (gameId) => {
    const unlocked = getUnlockedLevels(gameId);
    return Array.isArray(unlocked)&&unlocked.length ? Math.max(...unlocked) : 1;
  };

  const handleResetGameProfile = (gameId, label) => {
    if (!canManageWorkingMemory) return;
    const proceed = window.confirm(`${label} හි අනුවර්තන පැතිකඩ යළි සකසන්නද?`);
    if (!proceed) return;
    resetAdaptiveProfile(gameId);
  };

  const handleResetAllProfiles = () => {
    if (!canManageWorkingMemory) return;
    const proceed = window.confirm("සියලු අනුවර්තන පැතිකඩ යළි සකසන්නද?");
    if (!proceed) return;
    resetAllAdaptiveProfiles();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ zIndex:1 }}>
      <AnimatedSeaBg/>
      <SwimmingSeaFriends />

      <div className="relative z-10 flex flex-col items-center px-6 py-10 gap-8 max-w-5xl mx-auto">

        {/* ── Title ── */}
        <Mot.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }} className="relative grid w-full items-center gap-2 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-5">
          <div className="w-full text-center lg:text-left">
            <h1 className="w-full text-4xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              මුහුද ගවේෂණ කරන ගමන් මතකය වර්ධනය කරගමු
            </h1>
          </div>

          <div className="relative mx-auto flex w-full max-w-xs items-center justify-center lg:max-w-none">
            <Mot.div
              aria-hidden="true"
              className="pointer-events-none absolute h-36 w-64 rounded-full bg-cyan-200/25 blur-3xl sm:h-44 sm:w-72"
              animate={{ scale:[1,1.08,1],opacity:[.55,.9,.55] }}
              transition={{ duration:3.2,repeat:Infinity,ease:"easeInOut" }}
            />
            <Mot.img
              src={heroSubmarineSeaFriends}
              alt="මුහුදු සතුන් සමඟ කුඩා ගවේෂණ සබ්මැරීනය"
              className="relative z-10 w-52 select-none object-contain drop-shadow-2xl sm:w-64 lg:w-80"
              animate={{ y:[0,-9,0],rotate:[-2,2,-2] }}
              transition={{ duration:3.4,repeat:Infinity,ease:"easeInOut" }}
            />
          </div>
        </Mot.div>

        {/* ── Overall progress bar ── */}
        <div className="w-full">
          <SummaryBar isLevelCompleted={isLevelCompleted}/>
        </div>

        {canManageWorkingMemory && (
          <div className="w-full flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAdminPanel(true)}
              className="rounded-full px-5 py-3 text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(90deg,#1E293B,#334155)", boxShadow: "0 8px 24px rgba(15,23,42,0.35)" }}
            >
              ගුරු/පරිපාලක අනුවර්තන පුවරුව
            </button>
          </div>
        )}

        {/* ── Available games section ── */}
        <div className="w-full">
          <p className="text-xl font-extrabold uppercase tracking-widest mb-4 drop-shadow" style={{ color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.25)" }}>
            ඔයාට ක්‍රීඩා කළ හැකි ක්‍රීඩා
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {GAMES.filter(g=>g.available).map((game,idx)=>(
              <Mot.div key={game.id}
                className="sm:col-span-2"
                initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:idx*0.1 }}>
                <GameCard
                  game={game}
                  unlockedLevel={getMaxUnlocked(game.id)}
                  isCompleted={isLevelCompleted}
                  getLevelProgress={getLevelProgress}
                  adaptiveProfile={getAdaptiveProfile(game.id)}
                  onSelect={onGameSelect||(()=>{})}
                />
              </Mot.div>
            ))}
          </div>
        </div>


        {/* ── Footer ── */}
        <p className="text-base font-semibold drop-shadow" style={{ color:"#E0F2FEcc" }}>
          ශ්‍රී ලංකාවේ 6-8 වයස් ළමුන් සඳහා නිර්මාණය කරන ලදී
        </p>
      </div>

      {canManageWorkingMemory && showAdminPanel && (
        <AdaptiveAdminPanel
          games={GAMES.filter(g => g.available)}
          getAdaptiveProfile={getAdaptiveProfile}
          onResetGame={handleResetGameProfile}
          onResetAll={handleResetAllProfiles}
          onClose={() => setShowAdminPanel(false)}
          onViewPerformance={() => {
            setShowAdminPanel(false);
            setShowPerformancePanel(true);
          }}
        />
      )}

      {showPerformancePanel && (
        <PerformancePanel
          games={GAMES.filter(g => g.available)}
          progress={progress}
          onClose={() => setShowPerformancePanel(false)}
        />
      )}

      <style>{`
        @keyframes card-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(239,68,68,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0   rgba(239,68,68,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wm-swimming-friends {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export { GAMES as WORKING_MEMORY_GAMES, PerformancePanel };
export default HomePage;
