import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-dha.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;

// SVG: viewBox="0 0 35.505 100", circle cx=12.592 cy=35 r=5 + connector + oval body + descender
// Scale: s=6.0, offset_x=213.485  →  circle(289,210)r=30, junction(379,240), end(423.5,480)
// Stroke: CW circle → connector → oval humps → bottom descender hook
const DHA_GUIDE_PATH =
  'M 289.0 180.0 A 30 30 0 0 1 289.0 240.0 A 30 30 0 0 1 289.0 180.0 C 379.0 180.0 379.0 240.0 379.0 240.0 L 339.5 240.0 C 275.5 240.0 216.5 270.9 216.5 330.0 C 216.5 389.1 267.2 420.0 339.5 420.0 L 379.0 420.0 C 296.9 420.0 277.6 456.3 277.6 480.0 C 277.6 503.7 295.8 540.0 343.5 540.0 C 391.1 540.0 415.6 514.3 423.5 480.0';

const START_MARKER = { x: 289.0, y: 180.0 };
const END_MARKER   = { x: 423.5, y: 480.0 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

// ── Star polygon helper ──────────────────────────────────────────────────────
// Returns SVG points string for a N-pointed star centred at (cx,cy)
const starPoints = (cx, cy, outerR, innerR, points = 5) => {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
};

// ── 4-point sparkle star shape ───────────────────────────────────────────────
const SparkleIcon = ({ cx, cy, size = 28, delay = 0, color = '#ffd700' }) => (
  <g style={{ animation: `sparkleAnim 2.4s ease-in-out ${delay}s infinite alternate`, transformOrigin: `${cx}px ${cy}px` }}>
    {/* Big cross arms */}
    <polygon
      points={starPoints(cx, cy, size, size * 0.18, 4)}
      fill={color}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    />
    {/* Inner bright core */}
    <circle cx={cx} cy={cy} r={size * 0.18} fill="white" opacity="0.85" />
  </g>
);



// ════════════════════════════════════════════════════════════════════════════
// ── Space background (star field + shooting stars + sparkles) ──────────────────
const SPACE_STAR_COLORS = ['#ffffff','#ffe4b5','#add8e6','#ffcccb','#b0e0e6','#fff176','#e0b0ff'];

const SpaceBackground = () => (
  <>
    {Array.from({length:10},(_,i) => <div key={i} className={`dg-shoot dg-shoot-${i+1}`} aria-hidden='true' />)}
    {[
      {s:'\u2726',cls:'dg-sparkle-1'},{s:'\u2727',cls:'dg-sparkle-2'},{s:'\u2726',cls:'dg-sparkle-3'},
      {s:'\u2727',cls:'dg-sparkle-4'},{s:'\u2605',cls:'dg-sparkle-5'},{s:'\u2726',cls:'dg-sparkle-6'},
      {s:'\u2727',cls:'dg-sparkle-7'},{s:'\u2726',cls:'dg-sparkle-8'},{s:'\u2605',cls:'dg-sparkle-9'},
      {s:'\u2727',cls:'dg-sparkle-10'},{s:'\u2726',cls:'dg-sparkle-11'},{s:'\u2605',cls:'dg-sparkle-12'},
    ].map((item,i) => <div key={i} className={`dg-sparkle ${item.cls}`} aria-hidden='true'>{item.s}</div>)}
  </>
);

const DysgraphiaLetterDHA = () => {
  const navigate = useNavigate();
  const letterPathRef   = useRef(null);
  const progressRef     = useRef(0);
  const svgRef          = useRef(null);
  const THIRD_PREVIEW_MS = 1200;

  const [isPlaying,           setIsPlaying]           = useState(false);
  const [progress,            setProgress]            = useState(0);
  const [markerPosition,      setMarkerPosition]      = useState(START_MARKER);
  const [blindMode,           setBlindMode]           = useState(false);
  const [showGuide,           setShowGuide]           = useState(false);
  const [animatePop,          setAnimatePop]          = useState(false);
  const [nodesDeployed,       setNodesDeployed]       = useState(false);
  const [originPoint,         setOriginPoint]         = useState({ x: -100, y: 300 });
  const [bubbles,             setBubbles]             = useState([]);
  const [animationComplete,   setAnimationComplete]   = useState(false);

  // Drawing mode
  const [drawingMode,         setDrawingMode]         = useState(false);
  const [segmentProgress,     setSegmentProgress]     = useState([0, 0]);
  const [activeSegment,       setActiveSegment]       = useState(0);
  const [isDrawing,           setIsDrawing]           = useState(false);
  const [drawNodes,           setDrawNodes]           = useState([]);
  const [drawSuccess,         setDrawSuccess]         = useState(false);
  const [showSuccessMessage,  setShowSuccessMessage]  = useState(false);
  const [thirdUnlocked,       setThirdUnlocked]       = useState(false);
  const [thirdPreviewVisible, setThirdPreviewVisible] = useState(false);
  const [practiceBlind,       setPracticeBlind]       = useState(false);
  const [drawingWithCanvas,   setDrawingWithCanvas]   = useState(false);
  const [pointerPos,          setPointerPos]          = useState({ x: -100, y: -100 });
  const [evalLoading,         setEvalLoading]         = useState(false);
  const [evalResult,          setEvalResult]          = useState(null);
  const [evalError,           setEvalError]           = useState(null);
  const [easyMode,            setEasyMode]            = useState(false);

  const audioCtxRef             = useRef(null);
  const trainOscRef             = useRef(null);
  const trainGainRef            = useRef(null);
  const lastDrawTickOverallRef  = useRef(0);
  const lastDrawTickAtMsRef     = useRef(0);
  const attemptCountRef         = useRef(0);
  const canvasRef               = useRef(null);
  const EVAL_ENDPOINT           = '/myscript/evaluate';


  // ── Overall progress ─────────────────────────────────────────────────────
  const overallProgress = (() => {
    const segCount = segmentProgress.length;
    if (segCount === 0) return 0;
    return segmentProgress.reduce((s, v) => s + v, 0) / segCount;
  })();

  const currentStrokeWidth = drawingMode
    ? Math.min(52, 28 + overallProgress * 18 + (isDrawing ? 6 : 0))
    : 28;
  const finalStrokeWidth = drawSuccess ? 36 : currentStrokeWidth;

  // ── Audio helpers (identical to original) ───────────────────────────────
  const initAudio = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const startTrainSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    const lfo     = ctx.createOscillator();
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

  const playBubbleSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc  = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'triangle';
    const f = 500 + Math.random() * 300;
    osc.frequency.setValueAtTime(f, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f * 2, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    const click = ctx.createOscillator(); const cg = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1200 + Math.random() * 400, ctx.currentTime);
    cg.gain.setValueAtTime(0.15, ctx.currentTime);
    cg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain).connect(ctx.destination);
    click.connect(cg).connect(ctx.destination);
    osc.start(); click.start();
    osc.stop(ctx.currentTime + 0.15); click.stop(ctx.currentTime + 0.05);
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
      const elapsed     = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;
      if (nextProgress >= 1) {
        progressRef.current = 1; setProgress(1);
        setIsPlaying(false); setAnimationComplete(true);
        stopTrainSound();
        const path = letterPathRef.current;
        if (path) {
          const len = path.getTotalLength();
          const burst = [];
          for (let i = 0; i < 120; i++) {
            const t  = Math.random();
            const pt = path.getPointAtLength(t * len);
            burst.push({ id: Date.now() + Math.random(), x: pt.x, y: pt.y, size: Math.random() * 10 + 5, isFloating: true, colorIndex: Math.floor(Math.random() * 3), idleDuration: 2 });
          }
          setBubbles(p => [...p, ...burst]);
          for (let i = 0; i < 8; i++) setTimeout(() => playBubbleSound(), i * 80);
        }
        return;
      }
      if (Math.random() < 0.8) {
        const path = letterPathRef.current;
        if (path) {
          const len = path.getTotalLength();
          const pt  = path.getPointAtLength(nextProgress * len);
          const nb  = [];
          for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
            nb.push({ id: Date.now() + Math.random(), x: pt.x + (Math.random() * 24 - 12), y: pt.y + (Math.random() * 24 - 12), size: Math.random() * 8 + 3, isFloating: Math.random() < 0.1, colorIndex: Math.floor(Math.random() * 3), idleDuration: 1.5 + Math.random() * 2 });
          }
          setBubbles(p => [...p, ...nb]);
          if (Math.random() < 0.1) playBubbleSound();
        }
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
    setBubbles(p => { const now = Date.now(); return p.filter(b => !b.isFloating || now - b.id < 3000); });
  }, [progress]);

  const handleReset = () => {
    progressRef.current = 0; setProgress(0);
    setMarkerPosition(START_MARKER); setIsPlaying(false);
    setAnimationComplete(false); setBubbles([]); stopTrainSound();
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('ද'); u.lang = 'si-LK';
    window.speechSynthesis.speak(u);
  };

  // ── Coordinate conversion ────────────────────────────────────────────────
  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current; if (!svg) return null;
    const rect  = svg.getBoundingClientRect();
    const vb    = svg.viewBox.baseVal; if (!vb) return null;
    return { x: (clientX - rect.left) * (vb.width / rect.width) + vb.x, y: (clientY - rect.top) * (vb.height / rect.height) + vb.y };
  };

  // ── Drawing logic ────────────────────────────────────────────────────────
  const getClosestPointOnPath = (x, y) => {
    const path = letterPathRef.current; if (!path) return null;
    const total = path.getTotalLength();
    let bestDist = Infinity, bestT = 0;
    for (let i = 0; i <= 200; i++) {
      const t  = i / 200;
      const pt = path.getPointAtLength(t * total);
      const d  = Math.hypot(pt.x - x, pt.y - y);
      if (d < bestDist) { bestDist = d; bestT = t; }
    }
    return { t: bestT, distance: bestDist };
  };

  const getSegmentFromT    = t  => { const sc = drawNodes.length - 1; if (sc <= 1) return 0; return Math.min(Math.floor(t * sc), sc - 1); };
  const getSegmentStartT   = seg => seg / (drawNodes.length - 1);
  const getSegmentEndT     = seg => (seg + 1) / (drawNodes.length - 1);

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
    const segEnd   = getSegmentEndT(activeSegment);
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

  const handlePointerMove = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    const pt = clientToViewBox(e.clientX, e.clientY); if (!pt) return;
    setPointerPos(pt);
    if (isDrawing) updateDrawProgress(pt);
  };
  const handlePointerDown = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault(); e.stopPropagation();
    const pt = clientToViewBox(e.clientX, e.clientY); if (!pt) return;
    setPointerPos(pt); setIsDrawing(true); updateDrawProgress(pt);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerUp = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault(); setIsDrawing(false); resetCurrentSegment();
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const activateDrawingMode = (forceEasy = false) => {
    if (isPlaying) setIsPlaying(false);
    stopTrainSound(); setShowGuide(false); setDrawingMode(true);
    setPracticeBlind(false); setBubbles([]); setPointerPos({ x: -100, y: -100 });
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
    if (drawingMode) {
      setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
      setSegmentProgress([0, 0]); setActiveSegment(0); stopTrainSound();
    }
    setPracticeBlind(false); setThirdPreviewVisible(false);
    if (isPlaying) { setIsPlaying(false); stopTrainSound(); }
    const svg = svgRef.current;
    if (svg) {
      const rect  = e.currentTarget.getBoundingClientRect();
      const point = clientToViewBox(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (point) setOriginPoint(point);
    }
    setShowGuide(true); setNodesDeployed(false); setBubbles([]); playPopSound();
    progressRef.current = 0; setProgress(0); setMarkerPosition(START_MARKER);
    setTimeout(() => {
      setNodesDeployed(true); playPopSound();
      setTimeout(() => setIsPlaying(true), 800);
    }, 50);
    setAnimatePop(true); setTimeout(() => setAnimatePop(false), 500);
  };

  const handleThirdStarClick = () => {
    if (!thirdUnlocked) return;
    if (isPlaying) setIsPlaying(false); stopTrainSound(); setShowGuide(false);
    setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
    setSegmentProgress([0, 0]); setActiveSegment(0); setPointerPos({ x: -100, y: -100 });
    setBubbles([]); setEasyMode(false); attemptCountRef.current = 0;
    setPracticeBlind(false); setThirdPreviewVisible(true);
    setTimeout(() => {
      setThirdPreviewVisible(false); setPracticeBlind(true);
      setDrawingWithCanvas(true); setBlindMode(true); playPopSound();
    }, THIRD_PREVIEW_MS);
  };

  const submitCanvasForEvaluation = async () => {
    if (!canvasRef.current) return;
    setEvalLoading(true); setEvalError(null); setEvalResult(null);
    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const res     = await fetch(EVAL_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl, letter: 'dha' }) });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      setEvalResult(await res.json());
    } catch (err) { setEvalError(err.message || 'Evaluation failed'); }
    finally { setEvalLoading(false); }
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <main className='dg-shell dg-theme-dha'>
      <SpaceBackground />
      {/* Floating golden sparkles in background */}
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        viewBox="0 0 640 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <style>{`
          @keyframes sparkleAnim {
            0%   { opacity:.45; transform:scale(.75) rotate(-12deg); }
            100% { opacity:1;   transform:scale(1.25) rotate(12deg); }
          }
        `}</style>
        <SparkleIcon cx={110} cy={150} size={26} delay={0}   color="#ffd700" />
        <SparkleIcon cx={490} cy={200} size={20} delay={0.7} color="#ffd700" />
        <SparkleIcon cx={400} cy={540} size={22} delay={1.3} color="#ffd700" />
        <SparkleIcon cx={60}  cy={440} size={18} delay={0.4} color="#ffe066" />
        <SparkleIcon cx={560} cy={420} size={16} delay={1.8} color="#ffd700" />
      </svg>

      <button type='button' className='dg-home-btn' onClick={() => navigate('/dysgraphia')}>←</button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>'ද' අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${drawingMode ? 'drawing-active' : ''}`}
              viewBox='0 0 640 600'
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none', cursor: drawingMode && !drawSuccess ? 'none' : 'default' }}
              draggable={false}
            >
              <defs>
                {/* Rainbow gradient for drawing mode */}
                <linearGradient id='rainbowGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='640' y2='0' spreadMethod='reflect'>
                  <animate attributeName='gradientTransform' type='translate' from='0 0' to='640 0' dur='2.8s' repeatCount='indefinite' />
                  <stop offset='0%'   stopColor='#ff0000'><animate attributeName='stop-color' values='#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000' dur='2s' repeatCount='indefinite'/></stop>
                  <stop offset='20%'  stopColor='#ffff00'><animate attributeName='stop-color' values='#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00' dur='2s' repeatCount='indefinite'/></stop>
                  <stop offset='40%'  stopColor='#00ff00'><animate attributeName='stop-color' values='#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00' dur='2s' repeatCount='indefinite'/></stop>
                  <stop offset='60%'  stopColor='#00ffff'><animate attributeName='stop-color' values='#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff' dur='2s' repeatCount='indefinite'/></stop>
                  <stop offset='80%'  stopColor='#0000ff'><animate attributeName='stop-color' values='#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff;#0000ff' dur='2s' repeatCount='indefinite'/></stop>
                  <stop offset='100%' stopColor='#ff00ff'><animate attributeName='stop-color' values='#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff' dur='2s' repeatCount='indefinite'/></stop>
                </linearGradient>

                <filter id='glow' x='-40%' y='-40%' width='180%' height='180%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='4' result='blur' />
                  <feColorMatrix in='blur' type='hueRotate' values='0' result='hue'>
                    <animate attributeName='values' from='0' to='360' dur='2.4s' repeatCount='indefinite' />
                  </feColorMatrix>
                  <feMerge><feMergeNode in='hue' /><feMergeNode in='SourceGraphic' /></feMerge>
                </filter>

                <filter id='nodeGlow' x='-50%' y='-50%' width='200%' height='200%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur'/>
                  <feMerge><feMergeNode in='blur'/><feMergeNode in='SourceGraphic'/></feMerge>
                </filter>
              </defs>

              {!blindMode && (
                <>
                  {!practiceBlind && !thirdPreviewVisible && (
                    <path d={DHA_GUIDE_PATH} className='dg-chain-path' style={{ stroke: '#ffffff', strokeOpacity: 0.9, filter: 'drop-shadow(0 0 8px #ffffff)' }} />
                  )}
                  <path d={DHA_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />


                  {/* ── Rainbow progress fill (drawing) ── */}
                  <path
                    d={DHA_GUIDE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: drawingMode ? 'url(#rainbowGrad)' : '#ffffff',
                      strokeWidth: finalStrokeWidth,
                      strokeDashoffset: `${1 - overallProgress}`,
                      filter: drawingMode ? 'url(#glow)' : 'none',
                      transition: 'stroke-width 0.1s ease-out',
                    }}
                  />

                  {/* ── Third star preview flash ── */}
                  {thirdPreviewVisible && (
                    <path d={DHA_GUIDE_PATH} fill='none' stroke='#ffffff' strokeWidth='40'
                      strokeLinecap='round' strokeLinejoin='round'
                      style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }}
                    />
                  )}

                  {/* Piyabanapirisiya (UFO) nodes – now with correct completion marks */}
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
                  {showGuide && !drawingMode && (
                    <>
                      <circle cx={nodesDeployed ? START_MARKER.x : originPoint.x} cy={nodesDeployed ? START_MARKER.y : originPoint.y} r='22' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}/>
                      <text   x={nodesDeployed ? START_MARKER.x : originPoint.x}  y={nodesDeployed ? START_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                      <circle cx={nodesDeployed ? END_MARKER.x : originPoint.x}   cy={nodesDeployed ? END_MARKER.y : originPoint.y}   r='22' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}/>
                      <text   x={nodesDeployed ? END_MARKER.x : originPoint.x}    y={nodesDeployed ? END_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                    </>
                  )}

                  {/* ── Bubbles ── */}
                  {bubbles.map(b => {
                    const [fill, stroke, shadow] = b.colorIndex === 1
                      ? ['rgba(100,180,255,0.4)', 'rgba(100,180,255,0.8)', 'rgba(100,180,255,0.8)']
                      : b.colorIndex === 2
                        ? ['rgba(0,220,255,0.4)',  'rgba(0,220,255,0.8)',  'rgba(0,220,255,0.8)']
                        : ['rgba(255,255,255,0.4)','rgba(255,255,255,0.8)','rgba(255,255,255,0.8)'];
                    return (
                      <circle key={b.id} cx={b.x} cy={b.y} r={b.size} fill={fill} stroke={stroke} strokeWidth='1.5'
                        className={b.isFloating ? 'dg-bubble-anim' : 'dg-bubble-idle'}
                        style={{ animationDuration: b.isFloating ? '3s' : `${b.idleDuration}s`, transformOrigin: `${b.x}px ${b.y}px`, filter: `drop-shadow(0 0 2px ${shadow})` }}
                      />
                    );
                  })}

                  {/* ── Purple tinted finger pointer ── */}
                  {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                    <image href={fingerPointer} x={pointerPos.x - 30} y={pointerPos.y - 30} width='60' height='60'
                      className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false'/>
                  )}

                  {/* ── Moving train marker ── */}
                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      <circle cx={markerPosition.x} cy={markerPosition.y} r='22' className='dg-node dg-node-active'/>
                      <text x={markerPosition.x} y={markerPosition.y + 6} textAnchor='middle' className='dg-node-icon' style={{ fontSize: '20px' }}>🚂</text>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            /* ── Free-draw canvas (3rd star) ── */
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              <h3>✍️ දැන් "ද" අක්ෂරය ඔබම අඳින්න</h3>
              <div className='dg-practice-canvas-shell' style={{ position: 'relative', width: 600, height: 600, margin: '16px auto' }}>
                <ReactSketchCanvas ref={canvasRef} width='600px' height='600px' strokeWidth={8} strokeColor='black'
                  canvasColor='transparent'
                  style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px', position: 'absolute', top: 0, left: 0, cursor: PEN_CURSOR }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => canvasRef.current?.clearCanvas()} style={{ color: '#ffffff' }}>🧹 පැහැය මකා දමන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : '✅ පරීක්ෂා කරන්න'}</button>
              </div>
              {evalResult && <div className='dg-eval-result' style={{ textAlign: 'center', marginTop: 8, color: '#ffffff' }}><strong>Result:</strong> {JSON.stringify(evalResult)}</div>}
              {evalError  && <div className='dg-eval-error'  style={{ textAlign: 'center', marginTop: 8 }}>{evalError}</div>}
            </div>
          )}
        </div>

        {/* ── Star control buttons ── */}
        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={handleFirstStarClick}>⭐</button>
          <button
            type='button'
            className={`dg-star-btn ${animationComplete ? 'active' : 'inactive'}`}
            disabled={!animationComplete}
            onClick={() => {
              if (!animationComplete) return;
              if (drawingMode && !drawSuccess) {
                canvasRef.current?.clearCanvas();
                setSegmentProgress([0, 0]); setActiveSegment(0);
                setDrawSuccess(false); setShowSuccessMessage(false); return;
              }
              setBlindMode(false); setDrawingWithCanvas(false);
              setPracticeBlind(false); setThirdPreviewVisible(false);
              setEasyMode(false); attemptCountRef.current = 0;
              activateDrawingMode();
            }}
          >✏️</button>
          <button
            type='button'
            className={`dg-star-btn ${thirdUnlocked ? 'active' : 'inactive'}`}
            disabled={!thirdUnlocked}
            onClick={handleThirdStarClick}
          >⭐</button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            {practiceBlind ? '✍️ දැන් "ද" අක්ෂරය ඔබම අඳින්න.' : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න '}
          </div>
        )}
        {showSuccessMessage && (
          <div className='dg-draw-success'>🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා! 🎉</div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterDHA;