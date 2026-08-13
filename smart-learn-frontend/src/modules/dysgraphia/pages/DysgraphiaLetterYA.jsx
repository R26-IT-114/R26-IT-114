import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-a.css';
import fingerPointer from '../../../assets/images/finger.png';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { dysgraphiaService } from '../services/dysgraphiaService';

import button from '../../../assets/images/dysgraphia/button.png';
import button01 from '../../../assets/images/dysgraphia/button01.png';
import button02 from '../../../assets/images/dysgraphia/button02.png';
import buttonD02 from '../../../assets/images/dysgraphia/buttonD02.png';
import button03 from '../../../assets/images/dysgraphia/button03.png';
import buttonD03 from '../../../assets/images/dysgraphia/Dbutton03.png';
import button04 from '../../../assets/images/dysgraphia/button04.png';
import buttonD04 from '../../../assets/images/dysgraphia/Dbutton04.png';
import Topic from '../../../assets/images/dysgraphia/yatopic.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;
const FREE_TRACE_RESUME_THRESHOLD = 0.06;

// SVG: viewBox="0 0 50.714 100"
// Scale: s=6.0, offset_x=167.858
const YA_GUIDE_PATH =
  'M 283.484 240 c -68.856 0 -112.626 39.5736 -112.626 90 0 50.9082 27.0624 90 83.592 90 56.5314 0 65.55 -60 65.55 -60 s 9.0204 60 65.55 60 c 56.532 0 83.592 -39.0918 83.592 -90 s -39 -90 -101.034 -90 h -41.085 c 0 -15.9342 21.2784 -60 63.498 -60 27.981 0 51.0456 22.959 51.0456 60';

const START_MARKER = { x: 283.484, y: 240.0 };
const END_MARKER = { x: 441.5666, y: 240.0 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;


// ── Caterpillar tracer ─────────────────────────────────────────────────────
const CaterpillarTracer = ({ progress, pathRef, isActive }) => {
  const [headPos, setHeadPos] = useState({ x: 0, y: 0 });
  const [bodyPoints, setBodyPoints] = useState([]);
  const [legAngle, setLegAngle] = useState(0);
  const [colorHue, setColorHue] = useState(210);

  useEffect(() => {
    if (!isActive || !pathRef.current) return;
    let raf;
    const path = pathRef.current;
    const length = path.getTotalLength();
    const animate = () => {
      const t = Math.max(0, Math.min(1, progress));
      const headPoint = path.getPointAtLength(t * length);
      const newBody = [];
      for (let i = 1; i <= 16; i++) {
        const lagT = Math.max(0, t - i * 0.032);
        if (lagT <= 0) break;
        const pt = path.getPointAtLength(lagT * length);
        const wiggle = Math.sin((t * 25) - i * 1.2) * 2.8;
        const breath = Math.sin(t * 12 + i) * 0.8;
        newBody.push({ x: pt.x + wiggle, y: pt.y + Math.cos(i) * 2, size: 19.5 - i * 0.85 + breath, index: i });
      }
      setHeadPos(headPoint);
      setBodyPoints(newBody);
      setLegAngle(Math.sin(t * 18) * 25);
      setColorHue(180 + ((performance.now() / 30) % 90));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [progress, isActive, pathRef]);

  if (!isActive) return null;

  return (
    <g>
      {bodyPoints.map((pt, i) => (
        <g key={i}>
          <ellipse cx={pt.x} cy={pt.y} rx={pt.size} ry={pt.size * 0.78}
            fill={`hsl(120, 65%, ${48 + i * 1.2}%)`} stroke='#1b5e20' strokeWidth='2.5' opacity={0.95 - i * 0.025} />
          <ellipse cx={pt.x - 3} cy={pt.y - 4} rx={pt.size * 0.65} ry={pt.size * 0.45} fill='rgba(255,255,255,0.4)' />
          <circle cx={pt.x + (i % 2 ? 7 : -6)} cy={pt.y + (i % 3 - 1) * 4} r={pt.size * 0.55} fill='#558b2f' opacity='0.68' />
          <g opacity='0.75'>
            <line x1={pt.x - 8} y1={pt.y + 6} x2={pt.x - 14} y2={pt.y + 12 + Math.sin(legAngle * (pt.index % 3) / 10) * 4}
              stroke='#1b5e20' strokeWidth='2.5' strokeLinecap='round' />
            <line x1={pt.x + 8} y1={pt.y + 6} x2={pt.x + 14} y2={pt.y + 12 + Math.cos(legAngle * (pt.index % 3) / 10) * 4}
              stroke='#1b5e20' strokeWidth='2.5' strokeLinecap='round' />
          </g>
        </g>
      ))}
      <ellipse cx={headPos.x} cy={headPos.y} rx='24' ry='21' fill='#2e7d32' stroke='#fff' strokeWidth='4' />
      <ellipse cx={headPos.x - 6} cy={headPos.y - 7} rx='14' ry='11' fill='rgba(255,255,255,0.45)' />
      <ellipse cx={headPos.x - 8} cy={headPos.y - 4} rx='7' ry='8' fill='#fff' />
      <ellipse cx={headPos.x + 8} cy={headPos.y - 4} rx='7' ry='8' fill='#fff' />
      <circle cx={headPos.x - 8} cy={headPos.y - 3} r='3.5' fill='#1a237e' />
      <circle cx={headPos.x + 8} cy={headPos.y - 3} r='3.5' fill='#1a237e' />
      <circle cx={headPos.x - 9.5} cy={headPos.y - 6} r='1.5' fill='#ffffff' />
      <circle cx={headPos.x + 6.5} cy={headPos.y - 6} r='1.5' fill='#ffffff' />
      <path d={`M ${headPos.x - 11} ${headPos.y - 13} Q ${headPos.x - 22} ${headPos.y - 28} ${headPos.x - 13} ${headPos.y - 32}`}
        fill='none' stroke='#1b5e20' strokeWidth='3.5' strokeLinecap='round' />
      <path d={`M ${headPos.x + 11} ${headPos.y - 13} Q ${headPos.x + 21} ${headPos.y - 27} ${headPos.x + 14} ${headPos.y - 31}`}
        fill='none' stroke='#1b5e20' strokeWidth='3.5' strokeLinecap='round' />
      <circle cx={headPos.x - 13} cy={headPos.y - 32} r='3' fill='#8bc34a' />
      <circle cx={headPos.x + 14} cy={headPos.y - 31} r='3' fill='#8bc34a' />
    </g>
  );
};

const DysgraphiaLetterYA = () => {
  const navigate = useNavigate();
  const letterPathRef = useRef(null);
  const progressRef = useRef(0);
  const svgRef = useRef(null);
  const THIRD_PREVIEW_MS = 1200;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);
  const [blindMode, setBlindMode] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [animatePop, setAnimatePop] = useState(false);
  const [nodesDeployed, setNodesDeployed] = useState(false);
  const [originPoint, setOriginPoint] = useState({ x: -100, y: 300 });
  const [animationComplete, setAnimationComplete] = useState(false);

  // Drawing mode
  const [drawingMode, setDrawingMode] = useState(false);
  const [segmentProgress, setSegmentProgress] = useState([0, 0]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawNodes, setDrawNodes] = useState([]);
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [thirdUnlocked, setThirdUnlocked] = useState(false);
  const [thirdPreviewVisible, setThirdPreviewVisible] = useState(false);
  const [practiceBlind, setPracticeBlind] = useState(false);
  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState(null);
  const [easyMode, setEasyMode] = useState(false);
  const [freeTraceMode, setFreeTraceMode] = useState(false);
  const [freeTraceProgress, setFreeTraceProgress] = useState(0);
  const [freeTraceIsDrawing, setFreeTraceIsDrawing] = useState(false);
  const [freeTracePointerPos, setFreeTracePointerPos] = useState({ x: -100, y: -100 });
  const [freeTraceComplete, setFreeTraceComplete] = useState(false);

  const audioCtxRef = useRef(null);
  const trainOscRef = useRef(null);
  const trainGainRef = useRef(null);
  const lastDrawTickOverallRef = useRef(0);
  const lastDrawTickAtMsRef = useRef(0);
  const attemptCountRef = useRef(0);
  const canvasRef = useRef(null);
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const wentOffPathRef = useRef(false);

  // ── Overall progress ─────────────────────────────────────────────────────
  const overallProgress = (() => {
    const segCount = segmentProgress.length;
    if (segCount === 0) return 0;
    return segmentProgress.reduce((s, v) => s + v, 0) / segCount;
  })();
  const drawingStepAvailable = freeTraceComplete || drawingMode || practiceBlind || drawingWithCanvas;
  const displayedTraceProgress = freeTraceMode ? freeTraceProgress : overallProgress;
  const currentStrokeWidth = (drawingMode || freeTraceMode)
    ? Math.min(52, 28 + displayedTraceProgress * 18 + ((isDrawing || freeTraceIsDrawing) ? 6 : 0))
    : 28;
  const finalStrokeWidth = drawSuccess || freeTraceComplete ? 36 : currentStrokeWidth;

  // ── Audio helpers (identical to original) ───────────────────────────────
  const initAudio = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const startTrainSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sawtooth'; lfo.frequency.value = 8; lfoGain.gain.value = 50;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); lfo.start();
    trainOscRef.current = { osc, lfo }; trainGainRef.current = gain;
  };

  const stopTrainSound = () => {
    if (trainGainRef.current && trainOscRef.current) {
      const ctx = audioCtxRef.current;
      trainGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      setTimeout(() => {
        trainOscRef.current?.osc.stop();
        trainOscRef.current?.lfo.stop();
        trainOscRef.current = null;
      }, 200);
    }
  };


  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
    } catch (e) { console.error(e); }
  };

  const playCheckpointSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  };

  const playSuccessSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.6);
  };

  const playDrawTickSound = (strength = 0.5) => {
    initAudio();
    const ctx = audioCtxRef.current; const now = ctx.currentTime;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'triangle';
    const clamped = Math.max(0, Math.min(1, strength));
    osc.frequency.setValueAtTime(220 + clamped * 220 + Math.random() * 30, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.08);
  };

  // ── Guided animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !showGuide) return;
    let frameId;
    const start = performance.now() - progressRef.current * ANIMATION_DURATION_MS;
    startTrainSound();
    const animate = (now) => {
      const elapsed = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;
      if (nextProgress >= 1) {
        progressRef.current = 1; setProgress(1);
        setIsPlaying(false); setAnimationComplete(true);
        stopTrainSound();

        return;
      }
      progressRef.current = nextProgress; setProgress(nextProgress);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frameId); stopTrainSound(); };
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const path = letterPathRef.current;
    if (!path) return;
    const pt = path.getPointAtLength(progress * path.getTotalLength());
    setMarkerPosition({ x: pt.x, y: pt.y });
  }, [progress]);

  const handleReset = () => {
    progressRef.current = 0; setProgress(0);
    setMarkerPosition(START_MARKER); setIsPlaying(false);
    setAnimationComplete(false); stopTrainSound();
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('ය'); u.lang = 'si-LK';
    window.speechSynthesis.speak(u);
  };

  // ── Coordinate conversion ────────────────────────────────────────────────
  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current; if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal; if (!vb) return null;
    return { x: (clientX - rect.left) * (vb.width / rect.width) + vb.x, y: (clientY - rect.top) * (vb.height / rect.height) + vb.y };
  };

  // ── Drawing logic ────────────────────────────────────────────────────────
  const getClosestPointOnPath = (x, y) => {
    const path = letterPathRef.current; if (!path) return null;
    const total = path.getTotalLength();
    let bestDist = Infinity, bestT = 0;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const pt = path.getPointAtLength(t * total);
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < bestDist) { bestDist = d; bestT = t; }
    }
    return { t: bestT, distance: bestDist };
  };

  const getSegmentFromT = t => { const sc = drawNodes.length - 1; if (sc <= 1) return 0; return Math.min(Math.floor(t * sc), sc - 1); };
  const getSegmentStartT = seg => seg / (drawNodes.length - 1);
  const getSegmentEndT = seg => (seg + 1) / (drawNodes.length - 1);

  const resetCurrentSegment = () => {
    if (activeSegment >= drawNodes.length - 1) return;
    if (segmentProgress[activeSegment] > 0) {
      attemptCountRef.current += 1;
      if (attemptCountRef.current >= 5 && !easyMode && !drawSuccess) {
        setEasyMode(true); activateEasyDrawingMode(); return;
      }
    }
    const np = [...segmentProgress]; np[activeSegment] = 0; setSegmentProgress(np);
  };

  const handleSegmentComplete = () => {
    const np = [...segmentProgress]; np[activeSegment] = 1; setSegmentProgress(np);
    playCheckpointSound();
    const reached = activeSegment + 1;
    setDrawNodes(prev => { const u = [...prev]; if (u[reached]) u[reached].completed = true; return u; });
    if (activeSegment === drawNodes.length - 2) {
      setDrawSuccess(true); setShowSuccessMessage(true); setThirdUnlocked(true);
      playSuccessSound();
      setTimeout(() => setShowSuccessMessage(false), 2500);
    } else {
      setActiveSegment(p => p + 1);
    }
  };

  const updateDrawProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y); if (!closest) return;
    let { t, distance } = closest;
    let seg = getSegmentFromT(t);
    if (seg < activeSegment) return;
    if (seg > activeSegment) {
      if (segmentProgress[activeSegment] >= 0.95) {
        handleSegmentComplete();
        seg = getSegmentFromT(t);
        if (seg < activeSegment) return;
      } else { seg = activeSegment; }
    }
    if (seg !== activeSegment) return;
    if (segmentProgress[activeSegment] === 0) {
      const sn = drawNodes[activeSegment];
      if (sn && Math.hypot(point.x - sn.point.x, point.y - sn.point.y) > SEGMENT_START_THRESHOLD) return;
    }
    if (distance > DRAW_DISTANCE_THRESHOLD) { resetCurrentSegment(); return; }
    const segStart = getSegmentStartT(activeSegment);
    const segEnd = getSegmentEndT(activeSegment);
    let segT = Math.min(1, Math.max(0, (t - segStart) / (segEnd - segStart)));
    if (segT > segmentProgress[activeSegment]) {
      const np = [...segmentProgress]; np[activeSegment] = segT; setSegmentProgress(np);
      const now = performance.now();
      const overall = (activeSegment + segT) / (drawNodes.length - 1);
      if (now - lastDrawTickAtMsRef.current >= 70 && overall - lastDrawTickOverallRef.current >= 0.02) {
        lastDrawTickAtMsRef.current = now; lastDrawTickOverallRef.current = overall;
        playDrawTickSound(Math.min(1, 0.25 + (segT - segmentProgress[activeSegment]) * 8));
      }
      if (segT >= 0.99) handleSegmentComplete();
    }
  };

  const updateFreeTraceProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);
    if (!closest) return;

    const { t, distance } = closest;

    if (distance > DRAW_DISTANCE_THRESHOLD) { wentOffPathRef.current = true; return; }

    if (freeTraceProgress === 0) {
      const dx = point.x - START_MARKER.x;
      const dy = point.y - START_MARKER.y;
      if (Math.hypot(dx, dy) > SEGMENT_START_THRESHOLD) return;
    }

    if (t + 0.002 < freeTraceProgress) return;
    if (t > freeTraceProgress + FREE_TRACE_RESUME_THRESHOLD) return;

    if (t > freeTraceProgress) {
      const nowMs = performance.now();
      if (nowMs - lastDrawTickAtMsRef.current >= 70 && t - lastDrawTickOverallRef.current >= 0.02) {
        lastDrawTickAtMsRef.current = nowMs;
        lastDrawTickOverallRef.current = t;
        playDrawTickSound(Math.min(1, 0.25 + (t - freeTraceProgress) * 8));
      }

      setFreeTraceProgress(t);

      if (t >= 0.99) {
        setFreeTraceProgress(1);
        awardStars(wentOffPathRef.current ? 2 : 3);
        setFreeTraceComplete(true);
        playSuccessSound();
      }
    }
  };

  const handlePointerMove = (e) => {
    if (freeTraceMode) {
      e.preventDefault();
      const point = clientToViewBox(e.clientX, e.clientY);
      if (!point) return;
      setFreeTracePointerPos(point);
      if (freeTraceIsDrawing && !freeTraceComplete) updateFreeTraceProgress(point);
      return;
    }
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    const pt = clientToViewBox(e.clientX, e.clientY); if (!pt) return;
    setPointerPos(pt);
    if (isDrawing) updateDrawProgress(pt);
  };
  const handlePointerDown = (e) => {
    if (freeTraceMode) {
      e.preventDefault(); e.stopPropagation();
      initAudio();
      const point = clientToViewBox(e.clientX, e.clientY); if (!point) return;
      setFreeTracePointerPos(point);
      setFreeTraceIsDrawing(true);
      playDrawTickSound(0.35);
      updateFreeTraceProgress(point);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (!drawingMode || drawSuccess) return;
    e.preventDefault(); e.stopPropagation();
    const pt = clientToViewBox(e.clientX, e.clientY); if (!pt) return;
    setPointerPos(pt); setIsDrawing(true); updateDrawProgress(pt);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerUp = (e) => {
    if (freeTraceMode) {
      e.preventDefault();
      setFreeTraceIsDrawing(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      return;
    }
    if (!drawingMode || drawSuccess) return;
    e.preventDefault(); setIsDrawing(false); resetCurrentSegment();
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const activateDrawingMode = (forceEasy = false) => {
    if (isPlaying) setIsPlaying(false);
    stopTrainSound(); setShowGuide(false); setDrawingMode(true);
    setPracticeBlind(false); setPointerPos({ x: -100, y: -100 });
    lastDrawTickOverallRef.current = 0; lastDrawTickAtMsRef.current = 0; attemptCountRef.current = 0;
    const path = letterPathRef.current; if (!path) return;
    const len = path.getTotalLength();
    let nodes;
    if (forceEasy || easyMode) {
      nodes = [0, 0.25, 0.5, 0.75, 1].map((t, i) => ({ t, point: path.getPointAtLength(len * t), completed: false }));
      setSegmentProgress([0, 0, 0, 0]);
    } else {
      nodes = [0, 0.5, 1].map(t => ({ t, point: path.getPointAtLength(len * t), completed: false }));
      setSegmentProgress([0, 0]);
    }
    setDrawNodes(nodes); setActiveSegment(0);
    setDrawSuccess(false); setShowSuccessMessage(false);
  };

  const activateEasyDrawingMode = () => { setEasyMode(true); activateDrawingMode(true); };

  const handleFirstStarClick = (e) => {
    setBlindMode(false); setDrawingWithCanvas(false); setEasyMode(false);
    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);
    if (drawingMode) {
      setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
      setSegmentProgress([0, 0]); setActiveSegment(0); stopTrainSound();
    }
    setPracticeBlind(false); setThirdPreviewVisible(false);
    if (isPlaying) { setIsPlaying(false); stopTrainSound(); }
    const svg = svgRef.current;
    if (svg) {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = clientToViewBox(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (point) setOriginPoint(point);
    }
    setShowGuide(true); setNodesDeployed(false); setAnimationComplete(false); playPopSound();
    progressRef.current = 0; setProgress(0); setMarkerPosition(START_MARKER);
    setTimeout(() => {
      setNodesDeployed(true); playPopSound();
      setTimeout(() => setIsPlaying(true), 800);
    }, 50);
    setAnimatePop(true); setTimeout(() => setAnimatePop(false), 500);
  };

  const handleThirdStarClick = () => {
    if (!thirdUnlocked) return;
    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);
    if (isPlaying) setIsPlaying(false); stopTrainSound(); setShowGuide(false);
    setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
    setSegmentProgress([0, 0]); setActiveSegment(0); setPointerPos({ x: -100, y: -100 });
    setEasyMode(false); attemptCountRef.current = 0;
    setPracticeBlind(false); setThirdPreviewVisible(true);
    setTimeout(() => {
      setThirdPreviewVisible(false); setPracticeBlind(true);
      setDrawingWithCanvas(true); setBlindMode(true); playPopSound();
    }, THIRD_PREVIEW_MS);
  };

  const handleFreeTraceStarClick = () => {
    if (isPlaying) { setIsPlaying(false); stopTrainSound(); }
    setShowGuide(false);
    setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
    setSegmentProgress([0, 0]); setActiveSegment(0);
    setPointerPos({ x: -100, y: -100 });
    setBlindMode(false); setDrawingWithCanvas(false);
    setPracticeBlind(false); setThirdPreviewVisible(false); setEasyMode(false);
    attemptCountRef.current = 0;
    setFreeTraceMode(true);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);
    lastDrawTickOverallRef.current = 0;
    lastDrawTickAtMsRef.current = 0;
    wentOffPathRef.current = false;
    playPopSound();
  };

  const submitCanvasForEvaluation = async () => {
    if (!canvasRef.current) return;
    setEvalLoading(true); setEvalError(null); setEvalResult(null);
    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const response = await dysgraphiaService.recordLetterActivity({
        letterId: 'ya',
        targetChar: 'ය',
        mode: 'independent',
        durationSeconds: 0,
        strokeCount: (await canvasRef.current.exportPaths()).length,
        image: blob,
      });
      setEvalResult({ ...response, prediction: { sinhala: response?.predicted ?? null, confidence: response?.confidence ?? null } });
      if (response?.isCorrect) {
        awardStars(response.starsEarned || 1);
      }
    } catch (err) { setEvalError(err?.response?.data?.error?.message || err.message || 'Evaluation failed'); }
    finally { setEvalLoading(false); }
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <main className='dg-shell dg-theme-a'>
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />

      <section className='dg-stage'>
        <header className='dg-header'>
          <img src={Topic} alt="ය අක්ෂරය" className="dg-topic-image" onClick={handleAudio} />
        </header>

        <div className={`dg-canvas-wrap${drawingWithCanvas ? ' no-board' : ''}`}>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${drawingMode ? 'drawing-active' : ''}`}
              viewBox='0 0 640 600'
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none', cursor: freeTraceMode ? PEN_CURSOR : (drawingMode && !drawSuccess ? 'none' : 'default') }}
              draggable={false}
            >
              <defs>
                {/* Rainbow gradient for drawing mode */}
                <linearGradient id='rainbowGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='640' y2='0' spreadMethod='reflect'>
                  <animate attributeName='gradientTransform' type='translate' from='0 0' to='640 0' dur='2.8s' repeatCount='indefinite' />
                  <stop offset='0%' stopColor='#ff0000'><animate attributeName='stop-color' values='#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='20%' stopColor='#ffff00'><animate attributeName='stop-color' values='#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='40%' stopColor='#00ff00'><animate attributeName='stop-color' values='#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='60%' stopColor='#00ffff'><animate attributeName='stop-color' values='#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='80%' stopColor='#0000ff'><animate attributeName='stop-color' values='#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff;#0000ff' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='100%' stopColor='#ff00ff'><animate attributeName='stop-color' values='#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff' dur='2s' repeatCount='indefinite' /></stop>
                </linearGradient>

                <linearGradient id='ya-done-rainbow' x1='327' y1='240' x2='284' y2='240' gradientUnits='userSpaceOnUse'>
                  <stop offset='0%' stopColor='#f48fb1'><animate attributeName='stop-color' values='#f48fb1;#ffb74d;#fff176;#a5d6a7;#80deea;#ce93d8;#f48fb1' dur='2.6s' repeatCount='indefinite' /></stop>
                  <stop offset='20%' stopColor='#ffb74d'><animate attributeName='stop-color' values='#ffb74d;#fff176;#a5d6a7;#80deea;#ce93d8;#f48fb1;#ffb74d' dur='2.6s' repeatCount='indefinite' /></stop>
                  <stop offset='40%' stopColor='#fff176'><animate attributeName='stop-color' values='#fff176;#a5d6a7;#80deea;#ce93d8;#f48fb1;#ffb74d;#fff176' dur='2.6s' repeatCount='indefinite' /></stop>
                  <stop offset='60%' stopColor='#a5d6a7'><animate attributeName='stop-color' values='#a5d6a7;#80deea;#ce93d8;#f48fb1;#ffb74d;#fff176;#a5d6a7' dur='2.6s' repeatCount='indefinite' /></stop>
                  <stop offset='80%' stopColor='#80deea'><animate attributeName='stop-color' values='#80deea;#ce93d8;#f48fb1;#ffb74d;#fff176;#a5d6a7;#80deea' dur='2.6s' repeatCount='indefinite' /></stop>
                  <stop offset='100%' stopColor='#ce93d8'><animate attributeName='stop-color' values='#ce93d8;#f48fb1;#ffb74d;#fff176;#a5d6a7;#80deea;#ce93d8' dur='2.6s' repeatCount='indefinite' /></stop>
                </linearGradient>
  

                <filter id='glow' x='-40%' y='-40%' width='180%' height='180%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='4' result='blur' />
                  <feColorMatrix in='blur' type='hueRotate' values='0' result='hue'>
                    <animate attributeName='values' from='0' to='360' dur='2.4s' repeatCount='indefinite' />
                  </feColorMatrix>
                  <feMerge><feMergeNode in='hue' /><feMergeNode in='SourceGraphic' /></feMerge>
                </filter>

                <filter id='nodeGlow' x='-50%' y='-50%' width='200%' height='200%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur' />
                  <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
                </filter>
              </defs>

              {!blindMode && (
                <>
                  {!practiceBlind && !thirdPreviewVisible && (
                    <path d={YA_GUIDE_PATH} className='dg-chain-path' style={{ stroke: '#ffffff', strokeOpacity: 0.9, filter: 'drop-shadow(0 0 8px #ffffff)' }} />
                  )}
                  <path d={YA_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />


                  {/* ── Rainbow progress fill (drawing) ── */}
                  <path
                    d={YA_GUIDE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: (drawingMode || freeTraceMode) ? 'url(#rainbowGrad)' : '#ffffff',
                      strokeWidth: finalStrokeWidth,
                      strokeDashoffset: `${1 - displayedTraceProgress}`,
                      filter: (drawingMode || freeTraceMode) ? 'url(#glow)' : 'none',
                      transition: 'stroke-width 0.1s ease-out',
                    }}
                  />

                  {/* ── Permanent glitter rainbow fill after caterpillar completes ── */}
                  {/* {animationComplete && showGuide && !drawingMode && (
                    <g>
                      <defs>
                        <linearGradient id='ya-done-rainbow' x1='327' y1='240' x2='284' y2='240' gradientUnits='userSpaceOnUse'>
                          <stop offset='0%' stopColor='#f48fb1'><animate attributeName='stop-color' values='#f48fb1;#ffb74d;#fff176;#a5d6a7;#80deea;#ce93d8;#f48fb1' dur='2.6s' repeatCount='indefinite' /></stop>
                          <stop offset='20%' stopColor='#ffb74d'><animate attributeName='stop-color' values='#ffb74d;#fff176;#a5d6a7;#80deea;#ce93d8;#f48fb1;#ffb74d' dur='2.6s' repeatCount='indefinite' /></stop>
                          <stop offset='40%' stopColor='#fff176'><animate attributeName='stop-color' values='#fff176;#a5d6a7;#80deea;#ce93d8;#f48fb1;#ffb74d;#fff176' dur='2.6s' repeatCount='indefinite' /></stop>
                          <stop offset='60%' stopColor='#a5d6a7'><animate attributeName='stop-color' values='#a5d6a7;#80deea;#ce93d8;#f48fb1;#ffb74d;#fff176;#a5d6a7' dur='2.6s' repeatCount='indefinite' /></stop>
                          <stop offset='80%' stopColor='#80deea'><animate attributeName='stop-color' values='#80deea;#ce93d8;#f48fb1;#ffb74d;#fff176;#a5d6a7;#80deea' dur='2.6s' repeatCount='indefinite' /></stop>
                          <stop offset='100%' stopColor='#ce93d8'><animate attributeName='stop-color' values='#ce93d8;#f48fb1;#ffb74d;#fff176;#a5d6a7;#80deea;#ce93d8' dur='2.6s' repeatCount='indefinite' /></stop>
                        </linearGradient>
                        <filter id='ya-done-glow' x='-30%' y='-30%' width='160%' height='160%'>
                          <feGaussianBlur stdDeviation='7' result='blur' />
                          <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
                        </filter>
                      </defs>
                      <path d={YA_GUIDE_PATH} fill='none' stroke='rgba(200,130,255,0.40)' strokeWidth='56' strokeLinecap='round' filter='url(#ya-done-glow)' />
                      <path d={YA_GUIDE_PATH} fill='none' stroke='url(#ya-done-rainbow)' strokeWidth='34' strokeLinecap='round' />
                      <path d={YA_GUIDE_PATH} fill='none' stroke='rgba(255,255,255,0.65)' strokeWidth='14' strokeLinecap='round' />
                      <path d={YA_GUIDE_PATH} fill='none' stroke='#ffea00' strokeWidth='8' strokeLinecap='round' strokeDasharray='0 22' opacity='0.95' style={{ filter: 'drop-shadow(0 0 6px #ffea00)' }} />
                      <path d={YA_GUIDE_PATH} fill='none' stroke='#ff4081' strokeWidth='6' strokeLinecap='round' strokeDasharray='0 16' strokeDashoffset='8' opacity='0.90' style={{ filter: 'drop-shadow(0 0 5px #ff4081)' }} />
                      <path d={YA_GUIDE_PATH} fill='none' stroke='#40c4ff' strokeWidth='5' strokeLinecap='round' strokeDasharray='0 12' strokeDashoffset='4' opacity='0.85' style={{ filter: 'drop-shadow(0 0 5px #40c4ff)' }} />
                      <path d={YA_GUIDE_PATH} fill='none' stroke='#69f0ae' strokeWidth='4' strokeLinecap='round' strokeDasharray='0 9' strokeDashoffset='2' opacity='0.80' style={{ filter: 'drop-shadow(0 0 4px #69f0ae)' }} />
                    </g>
                  )} */}

                  {/* ── Third star preview flash ── */}
                  {thirdPreviewVisible && (
                    <path d={YA_GUIDE_PATH} fill='none' stroke='#ffffff' strokeWidth='40'
                      strokeLinecap='round' strokeLinejoin='round'
                      style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }}
                    />
                  )}

                  {/* Piyabanapirisiya (UFO) nodes – now with correct completion marks */}
                  {freeTraceMode && (
                    <>
                      <circle
                        cx={START_MARKER.x}
                        cy={START_MARKER.y}
                        r='18'
                        fill={freeTraceProgress > 0 ? '#4caf50' : 'none'}
                        stroke={freeTraceProgress > 0 ? '#2e7d32' : '#ffca28'}
                        strokeWidth='2.5'
                        filter={freeTraceProgress > 0 ? 'url(#nodeGlow)' : 'none'}
                        className='dg-draw-node'
                      />
                      <circle
                        cx={START_MARKER.x}
                        cy={START_MARKER.y}
                        r='7'
                        fill={freeTraceProgress > 0 ? '#fff' : '#ffca28'}
                        stroke='#000'
                        strokeWidth='1'
                      />
                    </>
                  )}

                  {drawingMode && !drawSuccess && drawNodes.map((node, idx) => (
                    <g key={idx}>
                      <circle
                        cx={node.point.x}
                        cy={node.point.y}
                        r='18'
                        fill={node.completed ? '#4caf50' : 'none'}
                        stroke={node.completed ? '#2e7d32' : '#ffca28'}
                        strokeWidth='2.5'
                        filter={node.completed ? 'url(#nodeGlow)' : 'none'}
                        className='dg-draw-node'
                      />
                      <circle
                        cx={node.point.x}
                        cy={node.point.y}
                        r='7'
                        fill={node.completed ? '#fff' : '#ffca28'}
                        stroke='#000'
                        strokeWidth='1'
                      />
                      {node.completed && (
                        <text
                          x={node.point.x}
                          y={node.point.y + 1}
                          textAnchor='middle'
                          dominantBaseline='central'
                          fontSize='12'
                          fill='#000'
                        >
                          ★
                        </text>
                      )}
                    </g>
                  ))}

                  {/* ── Guide nodes (star → star) during animation ── */}
                  {showGuide && !drawingMode && !animationComplete && (
                    <>
                      <circle cx={nodesDeployed ? START_MARKER.x : originPoint.x} cy={nodesDeployed ? START_MARKER.y : originPoint.y} r='22' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`} />
                      <text x={nodesDeployed ? START_MARKER.x : originPoint.x} y={nodesDeployed ? START_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                      <circle cx={nodesDeployed ? END_MARKER.x : originPoint.x} cy={nodesDeployed ? END_MARKER.y : originPoint.y} r='22' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`} />
                      <text x={nodesDeployed ? END_MARKER.x : originPoint.x} y={nodesDeployed ? END_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                    </>
                  )}



                  {/* ── Purple tinted finger pointer ── */}
                  {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                    <image href={fingerPointer} x={pointerPos.x - 30} y={pointerPos.y - 30} width='60' height='60'
                      className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false' />
                  )}

                  {freeTraceMode && freeTracePointerPos.x > -50 && (
                    <image href={fingerPointer} x={freeTracePointerPos.x - 30} y={freeTracePointerPos.y - 30} width='60' height='60'
                      className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false' />
                  )}

                  {/* ── Caterpillar tracer ── */}
                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      {progress > 0 && (
                        <path
                          d={YA_GUIDE_PATH}
                          pathLength='1'
                          fill='none'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          style={{
                            stroke: 'url(#ya-done-rainbow)',
                            strokeWidth: 30,
                            strokeDasharray: '1',
                            strokeDashoffset: `${1 - progress}`,
                            filter: 'url(#trailGlow)',
                          }}
                        />
                      )}
                      <CaterpillarTracer
                        progress={progress}
                        pathRef={letterPathRef}
                        isActive={isPlaying || (progress > 0 && !animationComplete)}
                      />
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            /* ── Free-draw canvas (3rd star) ── */
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
             
              <div className='dg-practice-canvas-shell' style={{ position: 'relative', margin: '16px auto', borderRadius: '16px', overflow: 'hidden' }}>
                <ReactSketchCanvas ref={canvasRef} width='100%' height='100%' strokeWidth={8} strokeColor='black'
                  canvasColor='white'
                  style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px', position: 'absolute', top: 0, left: 0, cursor: PEN_CURSOR }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => canvasRef.current?.clearCanvas()} style={{ color: '#ffffff' }}>🗑️මකන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : ' පරීක්ෂා කරන්න'}</button>
              </div>
              {evalResult && <div className='dg-eval-result' style={{ textAlign: 'center', marginTop: 8, color: '#ffffff' }}><strong>Result:</strong> {JSON.stringify(evalResult)}</div>}
              {evalError && <div className='dg-eval-error' style={{ textAlign: 'center', marginTop: 8 }}>{evalError}</div>}
            </div>
          )}
        </div>

        {/* ── Star control buttons ── */}
        <div className='dg-floating-stars'>
          <button
            type='button'
            className='dg-star-btn dg-back-star-btn'
            onClick={() => navigate('/dysgraphia?view=letters')}
            aria-label='Back to letters'
          >
            <svg className='dg-back-star-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
              <path d='M15.5 4.5 8 12l7.5 7.5' fill='none' stroke='currentColor' strokeWidth='2.8' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </button>
          <button type='button' className='dg-star-btn dg-star-img-btn active' onClick={handleFirstStarClick} aria-label='Start'>
            <img src={button} alt='' className='dg-star-btn-img' />
          </button>
          <button
            type='button'
            className={'dg-star-btn dg-star-img-btn ' + (animationComplete ? 'active' : 'inactive')}
            disabled={!animationComplete}
            onClick={() => {
              if (!animationComplete) return;
              handleFreeTraceStarClick();
            }}
          >
            <img src={animationComplete ? button02 : buttonD02} alt='' className='dg-star-btn-img' />
          </button>
          <button
            type='button'
            className={'dg-star-btn dg-star-img-btn ' + (drawingStepAvailable ? 'active' : 'inactive')}
            disabled={!drawingStepAvailable}
            onClick={() => {
              if (!drawingStepAvailable) return;
              if (drawingMode && !drawSuccess) {
                canvasRef.current?.clearCanvas();
                setSegmentProgress([0, 0]); setActiveSegment(0);
                setDrawSuccess(false); setShowSuccessMessage(false); return;
              }
              setBlindMode(false); setDrawingWithCanvas(false);
              setPracticeBlind(false); setThirdPreviewVisible(false);
              setEasyMode(false); setFreeTraceMode(false); setFreeTraceProgress(0); setFreeTraceIsDrawing(false); setFreeTracePointerPos({ x: -100, y: -100 }); setFreeTraceComplete(false);
              attemptCountRef.current = 0;
              activateDrawingMode();
            }}
          >
            <img src={drawingStepAvailable ? button03 : buttonD03} alt='' className='dg-star-btn-img' />
          </button>
          <button
            type='button'
            className={`dg-star-btn dg-star-img-btn ${thirdUnlocked ? 'active' : 'inactive'}`}
            disabled={!thirdUnlocked}
            onClick={handleThirdStarClick}
          >
            <img src={thirdUnlocked ? button04 : buttonD04} alt='' className='dg-star-btn-img' />
          </button>
        </div>


        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            {practiceBlind ? '✍️ දැන් "ය" අක්ෂරය ඔබම අඳින්න.' : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න '}
          </div>
        )}
        {showSuccessMessage && (
          <div className='dg-draw-success'>🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා! 🎉</div>
        )}

        {freeTraceMode && (
          <div className='dg-draw-instruction' style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>✨ පාරෙන් පිටතට ගියොත් නවතී. නැවත අක්ෂර පාරට එන්න, එතැනින්ම දිගටම අඳින්න.</span>

          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterYA;