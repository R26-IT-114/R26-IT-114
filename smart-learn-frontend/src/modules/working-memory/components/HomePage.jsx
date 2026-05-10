/**
 * Working Memory HomePage
 * Child-friendly UI, animated sea background, SVG icons only — no emojis.
 */
import React from "react";
import { motion } from "framer-motion";
import { useProgress } from "../context/ProgressContext";
import { getAdaptivePresentation } from "../utils/adaptiveDifficulty";
import submarineImg  from "../assets/submarine.png";
import imgDolphin   from "../assets/dolphin.png";
import audioSeqRecall  from "../assets/piliwelamthaya.mp3";
import audioNBack      from "../assets/Nback.mp3";
import audioVideoStory from "../assets/story1.mp3";
import audioColorMem   from "../assets/mathkaya.mp3";
import imgMermaid   from "../assets/mermaid.png";
import imgPuffefish from "../assets/puffefish.png";
import imgFishC     from "../assets/fish.png";
import imgShellC    from "../assets/shell.png";

// ─────────────────────────────────────────────
//  GAME REGISTRY
// ─────────────────────────────────────────────
const GAMES = [
  {
    id: "sea-odd-one-out", label: "වෙනස් ඒක සොයමු", subtitle: "වෙනස්/ලොකු-පොඩි පින්තූරය හඳුනාගෙන තෝරමු!", subtitleIcon: "sparkle", levels: 2, available: true,
    color: "#0891B2", bg: "#06B6D4", icon: "search",
    deco: { src: imgShellC,    w: 64, pos: { right: -6,  bottom: -8 }, op: 0.85,
      anim: { rotate: [-12, 12, -12], x: [-4, 4, -4] }, trans: { duration: 2.8, repeat: Infinity } },
  },
  {
    id: "image-matcher", label: "පින්තූර ගළපමු", subtitle: "එකම පින්තූර වේගයෙන් හඳුනාගමු!", subtitleIcon: "triangle", levels: 3, available: true,
    color: "#0369A1", bg: "#E0F2FE", icon: "cards",
    deco: { src: imgFishC,     w: 72, pos: { right: -12, top: 14 }, op: 0.84,
      anim: { x: [0, 8, -8, 5, 0], y: [0, -4, 0] }, trans: { duration: 2.4, repeat: Infinity } },
  },
  {
    id: "sequence-recall", label: "පිළිවෙල මතකය", subtitle: "දැක්ක දේ ඒ පිළිවෙලට මතක තියාගමු!", subtitleIcon: "ordered", levels: 3, available: true,
    color: "#0284C7", bg: "#E0F2FE", icon: "brain", audio: audioSeqRecall,
    deco: { src: imgDolphin,   w: 90, pos: { right: -18, bottom: -14 }, op: 0.90,
      anim: { y: [0, -14, 0], rotate: [-7, 7, -7] }, trans: { duration: 2.4, repeat: Infinity } },
  },
  {
    id: "n-back", label: "පෙර තිබුණේ මොකක්ද?", subtitle: "කලින් දැක්ක දේ හොයමු!", subtitleIcon: "crosshair", levels: 2, available: true,
    color: "#7C3AED", bg: "#EDE9FE", icon: "target", audio: audioNBack,
    deco: { src: imgMermaid,   w: 82, pos: { right: -10, bottom: -8 }, op: 0.88,
      anim: { y: [0, -10, 0], scale: [1, 1.06, 1] }, trans: { duration: 3.0, repeat: Infinity } },
  },
  {
    id: "color-memory", label: "මතක අභියෝගය", subtitle: "හරි දේ මතක තියාගෙන සොයමු!", subtitleIcon: "sparkle", levels: 3, available: true,
    color: "#EC4899", bg: "#FCE7F3", icon: "palette", audio: audioColorMem,
    deco: { src: imgPuffefish, w: 74, pos: { right: -8,  bottom: -10 }, op: 0.86,
      anim: { scale: [1, 1.22, 1], rotate: [-5, 5, -5] }, trans: { duration: 2.0, repeat: Infinity } },
  },
  {
    id: "video-story", label: "කතාව මතකද?", subtitle: "වීඩියෝ බලලා ප්‍රශ්න වලට උත්තර දෙමු!", subtitleIcon: "film", levels: 1, available: true,
    color: "#059669", bg: "#D1FAE5", icon: "video", audio: audioVideoStory,
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
const FishSVG = ({ size=48, color="#0EA5E9", flip=false }) => (
  <svg viewBox="0 0 80 48" width={size} height={size*0.6} style={{ transform:flip?"scaleX(-1)":"none" }} aria-hidden="true">
    <ellipse cx="46" cy="24" rx="26" ry="16" fill={color}/>
    <polygon points="20,24 4,8 4,40" fill={color} opacity="0.85"/>
    <circle cx="62" cy="17" r="5" fill="white"/>
    <circle cx="63" cy="17" r="2.5" fill="#0C4A6E"/>
  </svg>
);
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
  { type:"fish",      x:-10, y:25, size:64, color:"#0EA5E9", delay:0,   dur:13, flip:false, opacity:0.70, driftX:"115%", driftY:["0%","4%","-4%","0%"] },
  { type:"fish",      x:-10, y:55, size:48, color:"#FB923C", delay:4,   dur:16, flip:false, opacity:0.65, driftX:"115%", driftY:["0%","-5%","5%","0%"] },
  { type:"fish",      x:110, y:18, size:56, color:"#A78BFA", delay:7,   dur:14, flip:true,  opacity:0.65, driftX:"-115%",driftY:["0%","3%","-3%","0%"] },
  { type:"fish",      x:110, y:68, size:40, color:"#34D399", delay:2,   dur:18, flip:true,  opacity:0.60, driftX:"-115%",driftY:["0%","-4%","4%","0%"] },
  { type:"fish",      x:-10, y:40, size:36, color:"#F472B6", delay:10,  dur:20, flip:false, opacity:0.55, driftX:"115%", driftY:["0%","6%","-6%","0%"] },
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
  if (item.type==="fish") return (
    <Mot.div className="absolute pointer-events-none" style={{ left:`${item.x}%`,top:`${item.y}%`,opacity:item.opacity }}
      animate={{ x:item.driftX,y:item.driftY }} transition={{ duration:item.dur,delay:item.delay,repeat:Infinity,ease:"linear",times:[0,0.33,0.66,1] }}>
      <Mot.div animate={{ rotate:[-3,3,-3] }} transition={{ duration:0.5,repeat:Infinity,ease:"easeInOut" }}>
        <FishSVG size={item.size} color={item.color} flip={item.flip}/>
      </Mot.div>
    </Mot.div>
  );
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
    <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,#bae6fd 0%,#7dd3fc 28%,#38bdf8 58%,#0ea5e9 100%)" }}/>
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
  const highestDone = availLevels.filter(l=>isCompleted(game.id,l)).length;
  const overallPct  = game.available ? Math.round((highestDone/game.levels)*100) : 0;
  // Start at the first unlocked level that hasn't been completed yet, or the highest unlocked
  const nextPlayLevel = availLevels.find(l => isUnlocked(l) && !isCompleted(game.id, l)) ?? Math.max(...availLevels.filter(l => isUnlocked(l)));

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

      {/* Coming soon badge */}
      {!game.available && (
        <div className="absolute top-3 right-3 rounded-full px-4 py-1.5 text-base font-bold text-white" style={{ background:"#94A3B8" }}>
          ළඟදීම එයි
        </div>
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
      {game.available ? (
        <LevelDots
          gameId={game.id}
          totalLevels={game.levels}
          getProgress={getLevelProgress}
          isCompleted={isCompleted}
          isUnlocked={isUnlocked}
          onSelect={(lvl)=>onSelect(game.id,lvl)}
          accentColor={game.color}
        />
      ) : (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length:game.levels },(_,i)=>{
            const lvl = i+1;
            const isFirst = lvl === 1;
            return (
              <div key={i} className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-extrabold"
                style={{
                  background: isFirst ? `${game.color}33` : "rgba(200,200,200,0.4)",
                  border: isFirst ? `2px solid ${game.color}66` : "1px solid rgba(180,180,180,0.3)",
                  color: isFirst ? game.color : "#94A3B8",
                }}>
                {isFirst ? lvl : <LockIcon size={15}/>}
              </div>
            );
          })}
        </div>
      )}

      {/* Play button */}
      {game.available && (
        <Mot.button
          whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
          onClick={()=>onSelect(game.id, game.id === "reverse-sequence" ? "color" : nextPlayLevel)}
          className="flex items-center justify-center gap-2 rounded-full py-5 text-xl font-extrabold text-white shadow-md"
          style={{ background:`linear-gradient(90deg,${game.color},${game.color}cc)`, fontSize:"1.25rem" }}
        >
          <PlayIcon size={24}/> ක්‍රීඩා කරමු!
        </Mot.button>
      )}
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
    <div className="rounded-2xl px-8 py-6 flex items-center gap-6"
      style={{ background:"rgba(255,255,255,0.88)",backdropFilter:"blur(14px)",boxShadow:"0 4px 24px rgba(0,0,0,0.10)" }}>
      <div className="flex-1">
        <div className="flex justify-between font-bold text-gray-700 mb-3">
          <span className="text-lg">ඔයාගේ ප්‍රගතිය</span>
          <span className="text-lg" style={{ color:"#0284C7" }}>{completedLevels} / {totalLevels} මට්ටම් ජය ගත්තා!</span>
        </div>
        <div className="h-5 w-full rounded-full overflow-hidden" style={{ background:"rgba(200,200,200,0.4)" }}>
          <Mot.div className="h-5 rounded-full" style={{ background:"linear-gradient(90deg,#0EA5E9,#7C3AED)" }}
            initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1,ease:"easeOut" }}/>
        </div>
      </div>
      <div className="text-right">
        <div className="text-5xl font-extrabold" style={{ color:"#0284C7" }}>{pct}%</div>
        <div className="flex gap-1 justify-end mt-1">
          {[0,1,2].map(i=><StarIcon key={i} size={24} filled={pct>=(i+1)*33}/>)}
        </div>
      </div>
    </div>
  );
};

const AdaptiveAdminPanel = ({ games, getAdaptiveProfile, onResetGame, onResetAll, onClose }) => {
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
            <p className="text-sm font-semibold text-slate-600">සෑම මතක ක්‍රීඩාවකටම අනුවර්තන ප්‍රොෆයිල් පරීක්ෂා කිරීම සහ නැවත සකස් කිරීම සඳහා මෙවලම්.</p>
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
                <th className="px-4 py-3 font-black text-slate-700">යාවත්කාලීන කළ වේලාව</th>
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
                        නැවත සකසන්න
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onResetAll}
            className="rounded-xl px-4 py-2 font-extrabold text-white"
            style={{ background: "linear-gradient(90deg,#B91C1C,#EF4444)" }}
          >
            සියලු අනුවර්තන ප්‍රොෆයිල් නැවත සකසන්න
          </button>
        </div>
      </Mot.div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const HomePage = ({ onGameSelect }) => {
  const {
    getUnlockedLevels,
    isLevelCompleted,
    getLevelProgress,
    getAdaptiveProfile,
    resetAdaptiveProfile,
    resetAllAdaptiveProfiles,
  } = useProgress();
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);

  const getMaxUnlocked = (gameId) => {
    const unlocked = getUnlockedLevels(gameId);
    return Array.isArray(unlocked)&&unlocked.length ? Math.max(...unlocked) : 1;
  };

  const handleResetGameProfile = (gameId, label) => {
    const proceed = window.confirm(`${label} සඳහා අනුවර්තන ප්‍රොෆයිල් එක නැවත සකසන්නද?`);
    if (!proceed) return;
    resetAdaptiveProfile(gameId);
  };

  const handleResetAllProfiles = () => {
    const proceed = window.confirm("සියලු අනුවර්තන ප්‍රොෆයිල් නැවත සකසන්නද?");
    if (!proceed) return;
    resetAllAdaptiveProfiles();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ zIndex:1 }}>
      <AnimatedSeaBg/>

      <div className="relative z-10 flex flex-col items-center px-6 py-10 gap-8 max-w-5xl mx-auto">

        {/* ── Title ── */}
        <Mot.div initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }} className="w-full flex items-center justify-between gap-4">
          <div className="flex-1 text-left">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
              මුහුද ගවේෂණ කරන ගමන් මතකය වර්ධනය කරගමු
            </h1>
            <p className="text-2xl font-bold mt-2 drop-shadow" style={{ color:"#E0F2FE" }}>
              ක්‍රීඩා කරලා ඔයාගේ මතකය ශක්තිමත් කරගමු!
            </p>
            <p className="text-lg font-semibold mt-1 drop-shadow" style={{ color:"#BAE6FD" }}>
              ඔයාට කැමති ක්‍රීඩාවක් තෝරාගෙන පටන් ගන්න!
            </p>
          </div>
          {/* Submarine — shaking animation */}
          <Mot.img
            src={submarineImg}
            alt="submarine"
            className="flex-shrink-0 drop-shadow-2xl"
            style={{ width:200, height:"auto" }}
            animate={{
              rotate: [-4, 4, -4, 3, -3, 0],
              y: [0, -8, 0, -5, 0],
              x: [0, 3, -3, 2, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 1.0,
              ease: "easeInOut",
            }}
          />
        </Mot.div>

        {/* ── Overall progress bar ── */}
        <div className="w-full">
          <SummaryBar isLevelCompleted={isLevelCompleted}/>
        </div>

        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={() => setShowAdminPanel(true)}
            className="rounded-full px-5 py-3 text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(90deg,#1E293B,#334155)", boxShadow: "0 8px 24px rgba(15,23,42,0.35)" }}
          >
            ගුරු/පරිපාලක අනුවර්තන පැනලය
          </button>
        </div>

        {/* ── Available games section ── */}
        <div className="w-full">
          <p className="text-xl font-extrabold uppercase tracking-widest mb-4 drop-shadow" style={{ color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.25)" }}>
            ඔයාට ක්‍රීඩා කළ හැකි ක්‍රීඩා
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {GAMES.filter(g=>g.available).map((game,idx)=>(
              <Mot.div key={game.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:idx*0.1 }}>
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

        {/* ── Coming soon section ── */}
        <div className="w-full">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {GAMES.filter(g=>!g.available).map((game,idx)=>(
              <Mot.div key={game.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3+idx*0.06 }}>
                <GameCard
                  game={game}
                  unlockedLevel={0}
                  isCompleted={isLevelCompleted}
                  getLevelProgress={getLevelProgress}
                  adaptiveProfile={getAdaptiveProfile(game.id)}
                  onSelect={()=>{}}
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

      {showAdminPanel && (
        <AdaptiveAdminPanel
          games={GAMES.filter(g => g.available)}
          getAdaptiveProfile={getAdaptiveProfile}
          onResetGame={handleResetGameProfile}
          onResetAll={handleResetAllProfiles}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      <style>{`
        @keyframes card-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(239,68,68,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0   rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
