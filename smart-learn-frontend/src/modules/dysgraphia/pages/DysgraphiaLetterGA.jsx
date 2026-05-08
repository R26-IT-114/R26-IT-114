import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-ga.css';
import fingerPointer from '../../../assets/images/finger.png';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';

const ANIMATION_DURATION_MS = 4500;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;
const SEGMENT_RESUME_THRESHOLD = 0.08;
const FREE_TRACE_RESUME_THRESHOLD = 0.06;

const GA_GUIDE_PATH =
  'M 266.3 180.0 C -93.0 180.0 -78.7 420.0 203.2 420.0 C 391.9 420.0 439.6 299.5 248.8 299.5 C 248.8 240.0 305.6 180.0 440.9 180.0 C 679.1 180.0 681.2 420.0 439.6 420.0';

const START_MARKER = { x: 266.3, y: 180.0 };
const END_MARKER = { x: 439.6, y: 420.0 };

// Pen cursor
const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

// ──────────────────────────────────────────────────────
// Space background (same as DysgraphiaHome)
// ──────────────────────────────────────────────────────
const GA_STAR_COLORS = ['#ffffff','#ffe4b5','#add8e6','#ffcccb','#b0e0e6','#fff176','#e0b0ff'];

const GaSpaceBackground = () => (
  <>
    {/* <TaStarField /> */}
    {Array.from({length:10},(_,i) => <div key={i} className={`dg-shoot dg-shoot-${i+1}`} aria-hidden='true' />)}
    {[
      {s:'✦',cls:'dg-sparkle-1'},{s:'✧',cls:'dg-sparkle-2'},{s:'✦',cls:'dg-sparkle-3'},
      {s:'✧',cls:'dg-sparkle-4'},{s:'★',cls:'dg-sparkle-5'},{s:'✦',cls:'dg-sparkle-6'},
      {s:'✧',cls:'dg-sparkle-7'},{s:'✦',cls:'dg-sparkle-8'},{s:'★',cls:'dg-sparkle-9'},
      {s:'✧',cls:'dg-sparkle-10'},{s:'✦',cls:'dg-sparkle-11'},{s:'★',cls:'dg-sparkle-12'},
    ].map((item,i) => <div key={i} className={`dg-sparkle ${item.cls}`} aria-hidden='true'>{item.s}</div>)}
  </>
);

const DysgraphiaLetterGA = () => {
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
  const [trainRotation, setTrainRotation] = useState(0);
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
  const [pendingSegmentComplete, setPendingSegmentComplete] = useState(false);
  const [pendingCompletedNodeIndex, setPendingCompletedNodeIndex] = useState(null);
  const [practiceBlind, setPracticeBlind] = useState(false);
  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Easy mode (more guiding nodes after 5 failed attempts)
  const [easyMode, setEasyMode] = useState(false);
  const [freeTraceMode,       setFreeTraceMode]       = useState(false);
  const [freeTraceProgress,   setFreeTraceProgress]   = useState(0);
  const [freeTraceIsDrawing,  setFreeTraceIsDrawing]  = useState(false);
  const [freeTracePointerPos, setFreeTracePointerPos] = useState({ x: -100, y: -100 });
  const [freeTraceComplete,   setFreeTraceComplete]   = useState(false);

  const audioCtxRef = useRef(null);
  const trainOscRef = useRef(null);
  const trainGainRef = useRef(null);
  const lastDrawTickOverallRef = useRef(0);
  const lastDrawTickAtMsRef = useRef(0);
  const attemptCountRef = useRef(0);

  const canvasRef = useRef(null);
  const rewardedTraceRef = useRef(false);
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();

  useEffect(() => {
    if (drawSuccess && !rewardedTraceRef.current) {
      awardStars(1);
      rewardedTraceRef.current = true;
      return;
    }

    if (!drawSuccess) rewardedTraceRef.current = false;
  }, [drawSuccess, awardStars]);
  // Overall progress for the rainbow trail
  const overallProgress = (() => {
    const segCount = segmentProgress.length;
    if (segCount === 0) return 0;
    const total = segmentProgress.reduce((sum, val) => sum + val, 0);
    return total / segCount;
  })();

  const displayedTraceProgress = freeTraceMode ? freeTraceProgress : overallProgress;

  const currentStrokeWidth = (drawingMode || freeTraceMode)
    ? Math.min(52, 28 + displayedTraceProgress * 18 + ((isDrawing || freeTraceIsDrawing) ? 6 : 0))
    : 28;
  const finalStrokeWidth = drawSuccess || freeTraceComplete ? 36 : currentStrokeWidth;

  // ---------- Audio helpers (identical to previous version) ----------
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const startTrainSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    const lfo = ctx.createOscillator();
    lfo.type = 'sawtooth';
    lfo.frequency.value = 8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 50;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    trainOscRef.current = { osc, lfo };
    trainGainRef.current = gain;
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error('Audio API not supported', e);
    }
  };

  const playCheckpointSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const playSuccessSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  const playCheerSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    // Three ascending sparkle notes played in sequence
    const notes = [523.25, 784, 1046.5]; // C5, G5, C6
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.18;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.22);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
      // tiny shimmer overtone
      const osc2  = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, t);
      gain2.gain.setValueAtTime(0.07, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.3);
    });
  };

  const playDrawTickSound = (strength = 0.5) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const clamped = Math.max(0, Math.min(1, strength));
    const freq = 220 + clamped * 220 + Math.random() * 30;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  };

  // ---------- Guided animation (unchanged) ----------
  useEffect(() => {
    if (!isPlaying || !showGuide) return;
    let frameId;
    const start = performance.now() - (progressRef.current * ANIMATION_DURATION_MS);
    startTrainSound();
    const animate = (now) => {
      const elapsed = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;
      if (nextProgress >= 1) {
        progressRef.current = 1;
        setProgress(1);
        setIsPlaying(false);
        setAnimationComplete(true);
        stopTrainSound();
        playCheerSound();
        return;
      }
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      frameId = window.requestAnimationFrame(animate);
    };
    frameId = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frameId);
      stopTrainSound();
    };
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const pathElement = letterPathRef.current;
    if (!pathElement) return;
    const pathLength = pathElement.getTotalLength();
    const point = pathElement.getPointAtLength(progress * pathLength);
    setMarkerPosition({ x: point.x, y: point.y });
    // Compute tangent angle so the train faces its direction of travel
    const delta = 0.01;
    const t1 = Math.max(0, progress - delta);
    const t2 = Math.min(1, progress + delta);
    const p1 = pathElement.getPointAtLength(t1 * pathLength);
    const p2 = pathElement.getPointAtLength(t2 * pathLength);
    setTrainRotation(Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI));
  }, [progress]);

  useEffect(() => {
    if (!feedback) return;
    if (feedback === 'correct') playCheerSound();
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleReset = () => {
    progressRef.current = 0;
    setProgress(0);
    setMarkerPosition(START_MARKER);
    setIsPlaying(false);

    setPendingSegmentComplete(false);
    setPendingCompletedNodeIndex(null);
    stopTrainSound();
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('ග');
    utterance.lang = 'si-LK';
    window.speechSynthesis.speak(utterance);
  };

  // ---------- Coordinate conversion ----------
  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    if (!viewBox) return null;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const x = (clientX - rect.left) * scaleX + viewBox.x;
    const y = (clientY - rect.top) * scaleY + viewBox.y;
    return { x, y };
  };

  // ---------- Drawing logic (FIXED VERSION) ----------
  const getClosestPointOnPath = (x, y) => {
    const path = letterPathRef.current;
    if (!path) return null;
    const totalLength = path.getTotalLength();
    let bestDist = Infinity;
    let bestT = 0;
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = path.getPointAtLength(t * totalLength);
      const dx = pt.x - x;
      const dy = pt.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        bestT = t;
      }
    }
    return { t: bestT, distance: bestDist };
  };

  // Segment index from t – works for any number of nodes
  const getSegmentFromT = (t) => {
    const segCount = drawNodes.length - 1;
    if (segCount <= 1) return 0;
    const seg = Math.floor(t * segCount);
    return Math.min(seg, segCount - 1);
  };

  const getSegmentStartT = (seg) => seg / (drawNodes.length - 1);
  const getSegmentEndT = (seg) => (seg + 1) / (drawNodes.length - 1);

  const resetCurrentSegment = () => {
    if (activeSegment >= drawNodes.length - 1) return;
    if (segmentProgress[activeSegment] > 0) {
      attemptCountRef.current += 1;
      if (attemptCountRef.current >= 5 && !easyMode && !drawSuccess) {
        setEasyMode(true);
        activateEasyDrawingMode();
        return;
      }
    }
    const newProgress = [...segmentProgress];
    newProgress[activeSegment] = 0;
    setSegmentProgress(newProgress);
  };

  const handleSegmentComplete = () => {
    // Called when a segment reaches 100%
    const newProgress = [...segmentProgress];
    newProgress[activeSegment] = 1;
    setSegmentProgress(newProgress);
    playCheckpointSound();

    // Mark the reached node and move on immediately so the completed state stays visible.
    const reachedNode = activeSegment + 1;
    setDrawNodes(prev => {
      const updated = [...prev];
      if (updated[reachedNode]) updated[reachedNode].completed = true;
      return updated;
    });

    if (activeSegment === drawNodes.length - 2) {
      setDrawSuccess(true);
      setShowSuccessMessage(true);
      setThirdUnlocked(true);
      playSuccessSound();
      setTimeout(() => setShowSuccessMessage(false), 2500);
    } else {
      setActiveSegment(prev => prev + 1);
    }
  };

  const updateDrawProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);
    if (!closest) return;

    const { t, distance } = closest;
    let seg = getSegmentFromT(t);

    // Prevent skipping backward
    if (seg < activeSegment) return;

    // Keep progress tied to the current segment only; do not auto-complete when the pointer enters the next segment area.
    if (seg > activeSegment) seg = activeSegment;

    // Now seg should be equal to activeSegment
    if (seg !== activeSegment) return;

    // Check starting condition
    if (segmentProgress[activeSegment] === 0) {
      const startNode = drawNodes[activeSegment];
      if (startNode) {
        const dx = point.x - startNode.point.x;
        const dy = point.y - startNode.point.y;
        const distToNode = Math.hypot(dx, dy);
        if (distToNode > SEGMENT_START_THRESHOLD) return;
      }
    }

    if (distance > DRAW_DISTANCE_THRESHOLD) {
      resetCurrentSegment();
      return;
    }

    // Compute the local progress within this segment
    const segStart = getSegmentStartT(activeSegment);
    const segEnd = getSegmentEndT(activeSegment);
    let segT = (t - segStart) / (segEnd - segStart);
    segT = Math.min(1, Math.max(0, segT));

    // Only allow small forward steps so the segment fills progressively while the user traces it.
    if (segT > segmentProgress[activeSegment] + SEGMENT_RESUME_THRESHOLD) return;

    if (segT > segmentProgress[activeSegment]) {
      const newProgress = [...segmentProgress];
      newProgress[activeSegment] = segT;
      setSegmentProgress(newProgress);

      const nowMs = performance.now();
      const overall = (activeSegment + segT) / (drawNodes.length - 1);
      if (nowMs - lastDrawTickAtMsRef.current >= 70 && overall - lastDrawTickOverallRef.current >= 0.02) {
        lastDrawTickAtMsRef.current = nowMs;
        lastDrawTickOverallRef.current = overall;
        playDrawTickSound(Math.min(1, 0.25 + (segT - segmentProgress[activeSegment]) * 8));
      }

      if (segT >= 0.99) {
        handleSegmentComplete();
      }
    }
  };

  const updateFreeTraceProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);
    if (!closest) return;

    const { t, distance } = closest;

    if (distance > DRAW_DISTANCE_THRESHOLD) return;

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
    stopTrainSound();
    setShowGuide(false);
    setDrawingMode(true);
    setPracticeBlind(false);

    setPointerPos({ x: -100, y: -100 });
    lastDrawTickOverallRef.current = 0;
    lastDrawTickAtMsRef.current = 0;
    attemptCountRef.current = 0;

    const path = letterPathRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();

    let nodes;
    if (forceEasy || easyMode) {
      // 4 segments with 5 nodes (UFOs)
      nodes = [
        { t: 0, point: path.getPointAtLength(0), completed: false },
        { t: 0.25, point: path.getPointAtLength(totalLen * 0.25), completed: false },
        { t: 0.5, point: path.getPointAtLength(totalLen * 0.5), completed: false },
        { t: 0.75, point: path.getPointAtLength(totalLen * 0.75), completed: false },
        { t: 1, point: path.getPointAtLength(totalLen), completed: false },
      ];
      setSegmentProgress([0, 0, 0, 0]);
    } else {
      // Normal 2 segments
      nodes = [
        { t: 0, point: path.getPointAtLength(0), completed: false },
        { t: 0.5, point: path.getPointAtLength(totalLen * 0.5), completed: false },
        { t: 1, point: path.getPointAtLength(totalLen), completed: false },
      ];
      setSegmentProgress([0, 0]);
    }

    setDrawNodes(nodes);
    setActiveSegment(0);
    setDrawSuccess(false);
    setShowSuccessMessage(false);
    setPendingSegmentComplete(false);
    setPendingCompletedNodeIndex(null);
  };

  const activateEasyDrawingMode = () => {
    setEasyMode(true);
    activateDrawingMode(true);
  };

  const handleFirstStarClick = (e) => {
    setBlindMode(false);
    setDrawingWithCanvas(false);
    setEasyMode(false);
    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);

    if (drawingMode) {
      setDrawingMode(false);
      setDrawSuccess(false);
      setShowSuccessMessage(false);
      setSegmentProgress([0, 0]);
      setActiveSegment(0);
      setPendingSegmentComplete(false);
      setPendingCompletedNodeIndex(null);
      stopTrainSound();
    }
    setPracticeBlind(false);
    setThirdPreviewVisible(false);
    if (isPlaying) {
      setIsPlaying(false);
      stopTrainSound();
    }
    const svg = svgRef.current;
    if (svg) {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = clientToViewBox(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (point) setOriginPoint(point);
    }
    setShowGuide(true);
    setNodesDeployed(false);

    playPopSound();
    progressRef.current = 0;
    setProgress(0);
    setMarkerPosition(START_MARKER);
    setTimeout(() => {
      setNodesDeployed(true);
      playPopSound(); // Sound when nodes animate to correct positions
      setTimeout(() => setIsPlaying(true), 800);
    }, 50);
    setAnimatePop(true);
    setTimeout(() => setAnimatePop(false), 500);
  };

  const handleThirdStarClick = () => {
    if (!thirdUnlocked) return;

    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);

    if (isPlaying) setIsPlaying(false);
    stopTrainSound();
    setShowGuide(false);

    setDrawingMode(false);
    setDrawSuccess(false);
    setShowSuccessMessage(false);
    setSegmentProgress([0, 0]);
    setActiveSegment(0);
    setPointerPos({ x: -100, y: -100 });

    setEasyMode(false);
    attemptCountRef.current = 0;

    setPracticeBlind(false);
    setThirdPreviewVisible(true);
    setHasDrawn(false); // Reset hasDrawn flag when reopening the canvas

    setTimeout(() => {
      setThirdPreviewVisible(false);
      setPracticeBlind(true);
      setDrawingWithCanvas(true);
      setBlindMode(true);
      playPopSound();
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
    playPopSound();
  };

  const preprocessDrawingBlob = async (blob, mime = 'image/png') => {
    const image = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    return await new Promise((resolve, reject) => {
      const quality = mime === 'image/jpeg' ? 0.92 : undefined;
      canvas.toBlob((processedBlob) => {
        if (processedBlob) {
          resolve(processedBlob);
        } else {
          reject(new Error('Unable to preprocess drawing'));
        }
      }, mime, quality);
    });
  };

  const submitCanvasForEvaluation = async () => {
    if (!canvasRef.current) return;

    setEvalLoading(true);
    setEvalError(null);
    setEvalResult(null);
    setFeedback(null);

    try {
      // ✅ CHECK strokes first
      const paths = await canvasRef.current.exportPaths();

      if (!paths || paths.length === 0) {
        setEvalError("⚠️ කරුණාකර මුලින් අක්ෂරය අඳින්න");
        setEvalLoading(false);
        return;
      }

      // ✅ now safe to export (JPEG with white background)
      const dataUrl = await canvasRef.current.exportImage("jpeg");

      // convert + preprocess
      const blob = await fetch(dataUrl).then(res => res.blob());
      const processedBlob = await preprocessDrawingBlob(blob, 'image/jpeg');

      const formData = new FormData();
      formData.append("image", processedBlob, "drawing.jpg");

      const res = await fetch("http://localhost:3000/predict", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      console.log('Model response:', data);

      setEvalResult(data);
      // Validate: check if the returned Sinhala letter matches "ග"
      const isCorrect = data?.predictions?.[0]?.sinhala === "ග" || data?.prediction?.sinhala === "ග";
      
      if (isCorrect) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }

    } catch (err) {
      console.error(err);
      setEvalError("Prediction failed");
      setFeedback(null);
    } finally {
      setEvalLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <main className='dg-shell dg-theme-ga'>
      <GaSpaceBackground />
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
      <button type='button' className='dg-home-btn' onClick={() => navigate('/dysgraphia?view=letters')}>
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>‘ග’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${drawingMode ? 'drawing-active' : ''}`}
              viewBox='-40 -20 720 640'
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none', cursor: freeTraceMode ? PEN_CURSOR : (drawingMode && !drawSuccess ? 'none' : 'default') }}
              draggable={false}
            >
              <defs>
                <linearGradient id='rainbowGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='640' y2='0' spreadMethod='reflect'>
                  <animate attributeName='gradientTransform' type='translate' from='0 0' to='640 0' dur='2.8s' repeatCount='indefinite' />
                  <stop offset='0%' stopColor='#ff0000'><animate attributeName='stop-color' values='#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='20%' stopColor='#ffff00'><animate attributeName='stop-color' values='#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='40%' stopColor='#00ff00'><animate attributeName='stop-color' values='#00ff00;#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='60%' stopColor='#00ffff'><animate attributeName='stop-color' values='#00ffff;#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='80%' stopColor='#0000ff'><animate attributeName='stop-color' values='#0000ff;#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff;#0000ff' dur='2s' repeatCount='indefinite' /></stop>
                  <stop offset='100%' stopColor='#ff00ff'><animate attributeName='stop-color' values='#ff00ff;#ff0000;#ffff00;#00ff00;#00ffff;#0000ff;#ff00ff' dur='2s' repeatCount='indefinite' /></stop>
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
                {/* Mask that reveals only the portion of the track the train has travelled */}
                <mask id='ga-track-mask'>
                  <path
                    d={GA_GUIDE_PATH}
                    fill='none'
                    stroke='white'
                    strokeWidth='60'
                    strokeLinecap='butt'
                    pathLength='1'
                    strokeDasharray='1'
                    strokeDashoffset={`${1 - progress}`}
                  />
                </mask>
              </defs>

              {!blindMode && (
                <>
                  {!practiceBlind && !thirdPreviewVisible && (
                    <path d={GA_GUIDE_PATH} className='dg-chain-path' style={{ stroke: 'rgba(255,255,255,0.25)' }} />
                  )}
                  <path d={GA_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />

                  {/* ── Train track trail (animation / showGuide mode only) ── */}
                  {showGuide && !drawingMode && (
                    <g mask='url(#ga-track-mask)'>
                      {/* Layer 1 – gravel ballast, also forms the two outer rails at the edges */}
                      <path
                        d={GA_GUIDE_PATH}
                        fill='none'
                        stroke='#607d8b'
                        strokeWidth='44'
                        strokeLinecap='butt'
                        strokeLinejoin='round'
                      />
                      {/* Layer 2 – wooden cross-ties (brown dashes); gaps reveal the gray rails below) */}
                      <path
                        d={GA_GUIDE_PATH}
                        fill='none'
                        stroke='#5d4037'
                        strokeWidth='34'
                        strokeLinecap='butt'
                        strokeLinejoin='round'
                        strokeDasharray='18 12'
                      />
                      {/* Layer 3 – dark center channel between the two rails */}
                      <path
                        d={GA_GUIDE_PATH}
                        fill='none'
                        stroke='#263238'
                        strokeWidth='14'
                        strokeLinecap='butt'
                        strokeLinejoin='round'
                        strokeDasharray='18 12'
                      />
                      {/* Layer 4 – metallic rail-head shine (thin bright lines on each rail) */}
                      <path
                        d={GA_GUIDE_PATH}
                        fill='none'
                        stroke='#b0bec5'
                        strokeWidth='44'
                        strokeLinecap='butt'
                        strokeLinejoin='round'
                        strokeDasharray='0 12 18 12'
                        strokeOpacity='0.55'
                      />
                    </g>
                  )}

                  <path
                    d={GA_GUIDE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: (drawingMode || freeTraceMode) ? 'url(#rainbowGrad)' : 'rgba(255,255,255,0.3)',
                      strokeWidth: finalStrokeWidth,
                      strokeDashoffset: `${1 - displayedTraceProgress}`,
                      filter: (drawingMode || freeTraceMode) ? 'url(#glow)' : 'none',
                      transition: 'stroke-width 0.1s ease-out'
                    }}
                  />

                  {thirdPreviewVisible && (
                    <path d={GA_GUIDE_PATH} fill='none' stroke='rgba(255,255,255,0.95)' strokeWidth='40' strokeLinecap='round' strokeLinejoin='round' style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }} />
                  )}
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

                  {showGuide && !drawingMode && (
                    <>
                      <circle cx={nodesDeployed ? START_MARKER.x : originPoint.x} cy={nodesDeployed ? START_MARKER.y : originPoint.y} r='22' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`} />
                      <text x={nodesDeployed ? START_MARKER.x : originPoint.x} y={nodesDeployed ? START_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                      <circle cx={nodesDeployed ? END_MARKER.x : originPoint.x} cy={nodesDeployed ? END_MARKER.y : originPoint.y} r='22' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`} />
                      <text x={nodesDeployed ? END_MARKER.x : originPoint.x} y={nodesDeployed ? END_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                    </>
                  )}


                  {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                    <image href={fingerPointer} x={pointerPos.x - 30} y={pointerPos.y - 30} width='60' height='60' className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false' />
                  )}

                  {freeTraceMode && freeTracePointerPos.x > -50 && (
                    <image href={fingerPointer} x={freeTracePointerPos.x - 30} y={freeTracePointerPos.y - 30} width='60' height='60'
                      className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false'/>
                  )}

                  {/* ═══════════════ HIGHLY REALISTIC TRAIN ═══════════════ */}
                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      <g transform={`translate(${markerPosition.x}, ${markerPosition.y}) rotate(${trainRotation})`}>

                        {/* Ground Shadow */}
                        <ellipse cx="2" cy="42" rx="68" ry="11" fill="rgba(0,0,0,0.45)" />

                        {/* ── Steam / Smoke ── */}
                        {isPlaying && (
                          <>
                            <circle cx="-38" cy="-52" r="11" fill="#e0f2fe" opacity="0.9">
                              <animate attributeName="cy" values="-52;-78;-110" dur="1.35s" repeatCount="indefinite" />
                              <animate attributeName="r"  values="11;16;22"    dur="1.35s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9;0.45;0" dur="1.35s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="-32" cy="-48" r="8" fill="#f0f9ff" opacity="0.75">
                              <animate attributeName="cy" values="-48;-72;-98" dur="1.6s" begin="0.25s" repeatCount="indefinite" />
                              <animate attributeName="r"  values="8;13;18"    dur="1.6s" begin="0.25s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.75;0.35;0" dur="1.6s" begin="0.25s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="-48" cy="-38" r="6" fill="#f0f9ff" opacity="0.6">
                              <animate attributeName="cy" values="-38;-58;-82" dur="1.1s" begin="0.6s" repeatCount="indefinite" />
                              <animate attributeName="r"  values="6;9;12"     dur="1.1s" begin="0.6s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.6;0.3;0" dur="1.1s" begin="0.6s" repeatCount="indefinite" />
                            </circle>
                          </>
                        )}

                        {/* ── Main Engine Body ── */}
                        <rect x="-62" y="-24" width="88" height="42" rx="14" fill="#e53935" />
                        {/* Highlight on boiler top */}
                        <rect x="-58" y="-19" width="80" height="14" rx="7" fill="#ff8a65" opacity="0.55" />

                        {/* Boiler Bands */}
                        <rect x="-58" y="-7"  width="80" height="6" fill="#ffca28" />
                        <rect x="-58" y="1"   width="80" height="5" fill="#ffb300" />

                        {/* Boiler Dome */}
                        <ellipse cx="-26" cy="-26" rx="19" ry="13" fill="#ff7043" />
                        <ellipse cx="-26" cy="-30" rx="12" ry="7"  fill="#ffab91" opacity="0.8" />

                        {/* Chimney */}
                        <rect x="-47" y="-46" width="16" height="24" rx="4" fill="#263238" />
                        <rect x="-51" y="-50" width="24" height="9"  rx="4" fill="#455a64" />

                        {/* ── Driver's Cab ── */}
                        <rect x="22" y="-34" width="38" height="52" rx="8" fill="#1565c0" />
                        {/* Cab roof */}
                        <rect x="18" y="-37" width="46" height="11" rx="6" fill="#0d47a1" />
                        {/* Cab windows */}
                        <rect x="27" y="-29" width="13" height="11" rx="2" fill="#81d4fa" stroke="#0277bd" strokeWidth="2" />
                        <rect x="27" y="-14" width="13" height="11" rx="2" fill="#81d4fa" stroke="#0277bd" strokeWidth="2" />

                        {/* Front Buffer Beam */}
                        <rect x="54" y="-22" width="22" height="36" rx="6" fill="#0d47a1" />

                        {/* ── Headlight ── */}
                        <circle cx="69" cy="-4" r="12" fill="#fff176" />
                        <circle cx="69" cy="-4" r="7"  fill="#ffffff" />
                        <circle cx="69" cy="-4" r="14" fill="none" stroke="#ffeb3b" strokeWidth="4" opacity="0.6">
                          <animate attributeName="r"       values="14;19;14"  dur="0.9s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" repeatCount="indefinite" />
                        </circle>

                        {/* Cow Catcher */}
                        <polygon points="68,14 90,26 68,26" fill="#f57c00" stroke="#e65100" strokeWidth="2.5" />

                        {/* ── WHEELS ── */}
                        {/* Large Rear Wheel */}
                        <circle cx="-34" cy="23" r="19.5" fill="#1c2526" stroke="#455a64" strokeWidth="7" />
                        <circle cx="-34" cy="23" r="9"    fill="#455a64" />
                        <g style={{ transform: `rotate(${progress * 720}deg)`, transformOrigin: '-34px 23px' }}>
                          <line x1="-34" y1="4"  x2="-34" y2="42" stroke="#78909c" strokeWidth="3" />
                          <line x1="-53" y1="23" x2="-15" y2="23" stroke="#78909c" strokeWidth="3" />
                          <line x1="-21" y1="10" x2="-47" y2="36" stroke="#78909c" strokeWidth="3" />
                          <line x1="-21" y1="36" x2="-47" y2="10" stroke="#78909c" strokeWidth="3" />
                        </g>

                        {/* Large Front Wheel */}
                        <circle cx="8" cy="23" r="19.5" fill="#1c2526" stroke="#455a64" strokeWidth="7" />
                        <circle cx="8" cy="23" r="9"    fill="#455a64" />
                        <g style={{ transform: `rotate(${progress * 720}deg)`, transformOrigin: '8px 23px' }}>
                          <line x1="8"  y1="4"  x2="8"  y2="42" stroke="#78909c" strokeWidth="3" />
                          <line x1="-11" y1="23" x2="27" y2="23" stroke="#78909c" strokeWidth="3" />
                          <line x1="20"  y1="11" x2="-4" y2="35" stroke="#78909c" strokeWidth="3" />
                          <line x1="20"  y1="35" x2="-4" y2="11" stroke="#78909c" strokeWidth="3" />
                        </g>

                        {/* Small Front Wheel */}
                        <circle cx="46" cy="25" r="12.5" fill="#1c2526" stroke="#455a64" strokeWidth="4" />
                        <circle cx="46" cy="25" r="5"    fill="#455a64" />

                        {/* ── Connecting Rods (Realistic Motion) ── */}
                        <rect
                          x="-42" y="14" width="54" height="8" rx="4" fill="#ff5722"
                          style={{
                            transform: `rotate(${Math.sin(progress * 18) * 12}deg)`,
                            transformOrigin: '-34px 18px',
                          }}
                        />
                        <circle cx="-34" cy="18" r="6" fill="#263238" />
                        <circle cx="8"   cy="18" r="6" fill="#263238" />

                        {/* Handrail */}
                        <line x1="-60" y1="-26" x2="22" y2="-26" stroke="#ffca28" strokeWidth="3.5" strokeLinecap="round" />

                        {/* Body Bounce (subtle vertical oscillation) */}
                        <rect x="-62" y="-24" width="88" height="1" fill="none"
                          style={{ transform: `translateY(${Math.sin(progress * 25) * 1.5}px)` }}
                        />
                      </g>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              <h3>✍️ දැන් “ග” අක්ෂරය ඔබම අඳින්න</h3>
              <div className='dg-practice-canvas-shell' style={{ position: 'relative', width: 600, height: 600, margin: '16px auto', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 0 3px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.5)' }}>
                <ReactSketchCanvas
                  ref={canvasRef}
                  width='600px'
                  height='600px'
                  strokeWidth={8}
                  strokeColor='black'
                  canvasColor='white'
                  onStroke={() => setHasDrawn(true)}
                  style={{
                    border: 'none',
                    borderRadius: '20px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: PEN_CURSOR,
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => { canvasRef.current?.clearCanvas(); setHasDrawn(false); }} style={{ color: '#ffffff' }}>🧹 පැහැය මකා දමන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={!hasDrawn || evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : '✅ පරීක්ෂා කරන්න'}</button>
              </div>
              {evalResult && evalResult.prediction && (
                <div style={{ textAlign: 'center', marginTop: 8, color: '#ffffff' }}>
                  <h3>🎯 Result</h3>
                  <p>Letter: {evalResult.prediction.sinhala}</p>
                  <p>Confidence: {(evalResult.prediction.confidence * 100).toFixed(2)}%</p>
                </div>
              )}
              
              {/* show raw model response */}
              {/* {evalResult && (
                <details style={{ marginTop: 12, color: '#ffffff', textAlign: 'left' }}>
                  <summary style={{ cursor: 'pointer', textAlign: 'center' }}>Show raw model response</summary>
                  <pre style={{ marginTop: 10, padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(evalResult, null, 2)}
                  </pre>
                </details>
              )} */}
              {evalError && (
                <div className='dg-eval-error' style={{ textAlign: 'center', marginTop: 8, color: '#ff8080' }}>
                  {evalError}
                </div>
              )}
              {feedback === 'correct' && (
                <div key='cheer' className='dg-cheer-overlay'>
                  <div className='dg-cheer-stars'>
                    <span className='dg-cheer-star dg-cheer-star-1'>⭐</span>
                    <span className='dg-cheer-star dg-cheer-star-2'>⭐</span>
                    <span className='dg-cheer-star dg-cheer-star-3'>⭐</span>
                  </div>
                </div>
              )}
              {feedback === 'wrong' && (
                <div style={{ color: '#ff5252', textAlign: 'center', marginTop: 12, padding: '10px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold' }}>
                  ❌ නැවත උත්සාහ කරන්න!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Star buttons */}
        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={handleFirstStarClick}>⭐</button>
          <button type='button' className='dg-star-btn active' onClick={handleFreeTraceStarClick}>⭐</button>
          <button
            type='button'
            className={`dg-star-btn ${animationComplete ? 'active' : 'inactive'}`}
            disabled={!animationComplete}
            onClick={() => {
              if (!animationComplete) return;
              
              // If already in drawing mode and not successful, clear canvas and reset
              if (drawingMode && !drawSuccess) {
                canvasRef.current?.clearCanvas();
                setSegmentProgress([0, 0]);
                setActiveSegment(0);
                setDrawSuccess(false);
                setShowSuccessMessage(false);
                return;
              }
              
              // Normal activation
              setBlindMode(false);
              setDrawingWithCanvas(false);
              setPracticeBlind(false);
              setThirdPreviewVisible(false);
              setEasyMode(false);
              setFreeTraceMode(false);
              setPendingSegmentComplete(false);
              setPendingCompletedNodeIndex(null);
                  setPendingSegmentComplete(false);
                  setPendingCompletedNodeIndex(null);
              setPendingSegmentComplete(false);
              setPendingCompletedNodeIndex(null);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);
              attemptCountRef.current = 0;
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
            {practiceBlind
              ? '✍️ දැන් “ග” අක්ෂරය ඔබම අඳින්න.'
              : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න '}
          </div>
        )}
        {showSuccessMessage && (
          <div className='dg-draw-success'>🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා! 🎉</div>
        )}

        {freeTraceMode && (
          <div className='dg-draw-instruction' style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>✨ පාරෙන් පිටතට ගියොත් නවතී. නැවත අක්ෂර පාරට එන්න, එතැනින්ම දිගටම අඳින්න.</span>
            <button
              className='dg-ctl-btn'
              style={{ color: '#ffffff', padding: '6px 16px' }}
              onClick={() => {
                setFreeTraceProgress(0);
                setFreeTraceIsDrawing(false);
                setFreeTracePointerPos({ x: -100, y: -100 });
                setFreeTraceComplete(false);
                lastDrawTickOverallRef.current = 0;
                lastDrawTickAtMsRef.current = 0;
              }}
            >
              🧹 නැවතත් අදින්න
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterGA;