import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import { saveGameSession } from '../utils/dyscalculiaProgress';

import { predictNumber } from "../api/numberPredictionApi";
import bg01 from '../../../assets/images/dyscalculiaimages/bg16.png';
import active from '../../../assets/images/dyscalculiaimages/active.png';
import inactive from '../../../assets/images/dyscalculiaimages/inactive.png';
import arrow from '../../../assets/images/dyscalculiaimages/arrow.png';

import '../styles/dyscalculia-cartoon.css';

import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 15000;

const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;
const OUTSIDE_REVERSE_STEP = 0.04;
const START_MARKER = { x: 430, y: 160 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

const AUDIO_TEXT = 'හය';

const NUMBER_GUIDE_PATH = 'M 430 160 C 330 120 220 200 210 340 C 200 470 300 530 390 490 C 470 455 470 340 390 310 C 310 280 230 320 220 390';

const BUBBLE_PALETTE = [
  { fill: 'rgba(255, 107, 157, 0.55)', stroke: 'rgba(255, 182, 209, 0.95)' },
  { fill: 'rgba(64, 200, 255, 0.5)', stroke: 'rgba(185, 239, 255, 0.95)' },
  { fill: 'rgba(255, 202, 40, 0.52)', stroke: 'rgba(255, 238, 163, 0.95)' },
  { fill: 'rgba(102, 222, 147, 0.5)', stroke: 'rgba(197, 255, 216, 0.95)' },
  { fill: 'rgba(190, 132, 255, 0.5)', stroke: 'rgba(231, 203, 255, 0.95)' },
  { fill: 'rgba(255, 153, 87, 0.53)', stroke: 'rgba(255, 217, 185, 0.95)' },
];

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : normalized;

  const intVal = parseInt(value, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
};

const rgbToHex = ({ r, g, b }) => {
  const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const mixHexColors = (startHex, endHex, t) => {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const ratio = clamp01(t);
  return rgbToHex({
    r: start.r + (end.r - start.r) * ratio,
    g: start.g + (end.g - start.g) * ratio,
    b: start.b + (end.b - start.b) * ratio,
  });
};

const DyscalculiaNumber6 = () => {
  const navigate = useNavigate();

  const letterPathRef = useRef(null);
  const progressRef = useRef(0);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const THIRD_PREVIEW_MS = 1000;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);
  const [tracingStartTime, setTracingStartTime] = useState(Date.now());

  const [showGuide, setShowGuide] = useState(false);
  const [animatePop, setAnimatePop] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [nodesDeployed, setNodesDeployed] = useState(false);
  const [originPoint, setOriginPoint] = useState({ x: -100, y: 320 });
  const [bubbles, setBubbles] = useState([]);
  const [thirdUnlocked, setThirdUnlocked] = useState(false);
  const [thirdPreviewVisible, setThirdPreviewVisible] = useState(false);
  const [practiceBlind, setPracticeBlind] = useState(false);
  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });

  const [drawingMode, setDrawingMode] = useState(false);
  const [segmentProgress, setSegmentProgress] = useState([0, 0]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawNodes, setDrawNodes] = useState([]);
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [easyMode, setEasyMode] = useState(false);

  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);
  // kept for parity with other dyscalculia templates (optional evaluation)
const [evalResult, setEvalResult] = useState(null);
  void evalResult;


  const [feedback, setFeedback] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const audioCtxRef = useRef(null);
  const trainOscRef = useRef(null);
  const trainGainRef = useRef(null);
  const lastDrawTickOverallRef = useRef(0);
  const lastDrawTickAtMsRef = useRef(0);
  const attemptCountRef = useRef(0);
  const animationFrameRef = useRef(null);
  const rollbackFrameRef = useRef(null);
  const pointerDownPointRef = useRef(null);
  const dragStartedRef = useRef(false);

  const STAR_COLORS = useMemo(
    () => ['#ffffff', '#ffe4b5', '#add8e6', '#ffcccb', '#b0e0e6', '#fff176', '#e0b0ff'],
    []
  );

  const StarField = () => {
    const stars = Array.from({ length: 160 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 99}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 0.5,
      dur: (Math.random() * 4 + 2).toFixed(1),
      delay: -(Math.random() * 7).toFixed(1),
      type: i % 7 === 0 ? 'pulse' : i % 3 === 0 ? 'color' : 'dot',
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));

    return (
      <div className='dg-stars-layer' aria-hidden='true'>
        {stars.map((s) => {
          const cls =
            s.type === 'pulse'
              ? 'dg-star-pulse'
              : s.type === 'color'
                ? 'dg-star-color'
                : 'dg-star-dot';

          return (
            <span
              key={s.id}
              className={cls}
              style={{
                top: s.top,
                left: s.left,
                width: `${s.size}px`,
                height: `${s.size}px`,
                '--dur': `${s.dur}s`,
                '--delay': `${s.delay}s`,
                ...(s.type !== 'dot' ? { '--c': s.color } : {}),
              }}
            />
          );
        })}
      </div>
    );
  };


  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
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

  const playBubbleSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const startFreq = 500 + Math.random() * 300;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(1200 + Math.random() * 400, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain).connect(ctx.destination);
    click.connect(clickGain).connect(ctx.destination);

    osc.start();
    click.start();
    osc.stop(ctx.currentTime + 0.15);
    click.stop(ctx.currentTime + 0.05);
  };

  const playCheerSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const notes = [523.25, 784, 1046.5];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
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

      const osc2 = ctx.createOscillator();
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
    } catch {
      // ignore
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

  const overallProgress = useMemo(() => {
    const segCount = segmentProgress.length;
    if (segCount === 0) return 0;
    const total = segmentProgress.reduce((sum, val) => sum + val, 0);
    return total / segCount;
  }, [segmentProgress]);

  const currentStrokeWidth = drawingMode
    ? Math.min(52, 28 + overallProgress * 18 + (isDrawing ? 6 : 0))
    : 28;

  const finalStrokeWidth = drawSuccess ? 36 : currentStrokeWidth;

  const drawingStrokeColor = useMemo(() => {
    if (!drawingMode) return 'rgba(255,255,255,0.3)';
    if (drawSuccess) return '#2ed573';

    // Build a smooth color journey while the child traces: pink -> amber -> green.
    const t = clamp01(overallProgress);
    if (t <= 0.5) {
      return mixHexColors('#ff6b9d', '#ffca28', t / 0.5);
    }
    return mixHexColors('#ffca28', '#2ed573', (t - 0.5) / 0.5);
  }, [drawingMode, drawSuccess, overallProgress]);

  const visiblePathProgress = drawSuccess ? 1 : clamp01(overallProgress);
  const shouldShowProgressPath = drawSuccess || visiblePathProgress > 0.01;

  useEffect(() => {
    if (!isPlaying || !showGuide) return;

    let frameId;
    const start = performance.now() - progressRef.current * ANIMATION_DURATION_MS;

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

        const pathElement = letterPathRef.current;
        if (pathElement) {
          const pathLength = pathElement.getTotalLength();
          const burstBubbles = [];
          for (let i = 0; i < 100; i++) {
            const t = Math.random();
            const pt = pathElement.getPointAtLength(t * pathLength);
            burstBubbles.push({
              id: crypto.randomUUID(),
              x: pt.x,
              y: pt.y,
              size: Math.random() * 10 + 5,
              isFloating: true,
              colorIndex: Math.floor(Math.random() * BUBBLE_PALETTE.length),
              idleDuration: 2,
            });
          }
          setBubbles((prev) => [...prev, ...burstBubbles]);
          for (let i = 0; i < 8; i++) setTimeout(() => playBubbleSound(), i * 80);
        }
        return;
      }

      if (Math.random() < 0.8) {
        const pathElement = letterPathRef.current;
        if (pathElement) {
          const pathLength = pathElement.getTotalLength();
          const pt = pathElement.getPointAtLength(nextProgress * pathLength);

          const numBubbles = Math.floor(Math.random() * 3) + 1;
          const newBubbles = [];

          for (let i = 0; i < numBubbles; i++) {
            newBubbles.push({
              id: crypto.randomUUID(),
              x: pt.x + (Math.random() * 24 - 12),
              y: pt.y + (Math.random() * 24 - 12),
              size: Math.random() * 8 + 3,
              isFloating: Math.random() < 0.1,
              colorIndex: Math.floor(Math.random() * BUBBLE_PALETTE.length),
              idleDuration: 1.5 + Math.random() * 2,
            });
          }

          setBubbles((prev) => [...prev, ...newBubbles]);
          if (Math.random() < 0.1) playBubbleSound();
        }
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
  }, [isPlaying, showGuide]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pathElement = letterPathRef.current;
    if (!pathElement) return;
    const pathLength = pathElement.getTotalLength();
    const point = pathElement.getPointAtLength(progress * pathLength);
    setMarkerPosition({ x: point.x, y: point.y });

    setBubbles((prev) => {
      const now = Date.now();
      return prev.filter((b) => !b.isFloating || now - b.createdAt < 3000);
    });
  }, [progress]);

  useEffect(() => {
    if (!feedback) return;
    if (feedback === 'correct') playCheerSound();
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rollbackFrameRef.current) {
        clearInterval(rollbackFrameRef.current);
      }
    };
  }, []);

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(AUDIO_TEXT));
    utterance.lang = 'si-LK';
    window.speechSynthesis.speak(utterance);
  };

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

  const getClosestPointOnPath = (x, y) => {
    const path = letterPathRef.current;
    if (!path) return null;
    const totalLength = path.getTotalLength();
    let bestDist = Infinity;
    let bestT = 0;
    const steps = 220;
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

  const getSegmentFromT = (t) => {
    const segCount = drawNodes.length - 1;
    if (segCount <= 1) return 0;
    const seg = Math.floor(t * segCount);
    return Math.min(seg, segCount - 1);
  };

  const getSegmentStartT = (seg) => seg / (drawNodes.length - 1);
  const getSegmentEndT = (seg) => (seg + 1) / (drawNodes.length - 1);

  const reverseCurrentSegmentProgress = () => {
    if (activeSegment >= drawNodes.length - 1) return;
    const current = segmentProgress[activeSegment];
    if (current <= 0) return;

    const next = Math.max(0, current - OUTSIDE_REVERSE_STEP);
    const newProgress = [...segmentProgress];
    newProgress[activeSegment] = next;
    setSegmentProgress(newProgress);

    if (next === 0) {
      attemptCountRef.current += 1;
      if (attemptCountRef.current >= 5 && !easyMode && !drawSuccess) {
        setEasyMode(true);
        activateEasyDrawingMode();
      }
    }
  };

  const rollbackIncompleteSegmentOnStop = () => {
    if (activeSegment >= drawNodes.length - 1) return;
    const currentVal = segmentProgress[activeSegment] ?? 0;
    if (currentVal <= 0 || currentVal >= 0.99) return;

    if (rollbackFrameRef.current) {
      clearInterval(rollbackFrameRef.current);
      rollbackFrameRef.current = null;
    }

    rollbackFrameRef.current = setInterval(() => {
      setSegmentProgress((prev) => {
        const updated = [...prev];
        const val = updated[activeSegment] ?? 0;
        
        if (val <= 0) {
          if (rollbackFrameRef.current) {
            clearInterval(rollbackFrameRef.current);
            rollbackFrameRef.current = null;
          }
          attemptCountRef.current += 1;
          if (attemptCountRef.current >= 5 && !easyMode && !drawSuccess) {
            setEasyMode(true);
            activateEasyDrawingMode();
          }
          return updated;
        }
        
        updated[activeSegment] = Math.max(0, val - 0.08);
        return updated;
      });
    }, 40);
  };

  const playCheckpointAtSegmentEnd = () => {
    playCheckpointSound();
  };

  const handleSegmentComplete = () => {
    const newProgress = [...segmentProgress];
    newProgress[activeSegment] = 1;
    setSegmentProgress(newProgress);
    playCheckpointAtSegmentEnd();

    const reachedNode = activeSegment + 1;
    setDrawNodes((prev) => {
      const updated = [...prev];
      if (updated[reachedNode]) updated[reachedNode].completed = true;
      return updated;
    });

    if (activeSegment === drawNodes.length - 2) {
      // Save game session data for completed tracing
      saveGameSession({
        gameType: 'TracingNumbers',
        playedAt: new Date().toISOString(),
        targetNumber: 6,
        correct: true,
        attempts: 1,
        responseTime: Date.now() - tracingStartTime,
        score: 15,
        completed: true
      });

      setDrawSuccess(true);
      setShowSuccessMessage(true);
      setThirdUnlocked(true);
      playSuccessSound();
      setTimeout(() => setShowSuccessMessage(false), 2500);
    } else {
      setActiveSegment((prev) => prev + 1);
    }
  };

  const updateDrawProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);
    if (!closest) return;

    const { t, distance } = closest;
    let seg = getSegmentFromT(t);

    if (seg < activeSegment) return;

    if (seg > activeSegment) {
      const currentProgress = segmentProgress[activeSegment];
      if (currentProgress >= 0.95) {
        handleSegmentComplete();
        seg = getSegmentFromT(t);
        if (seg < activeSegment) return;
      } else {
        seg = activeSegment;
      }
    }

    if (seg !== activeSegment) return;

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
      reverseCurrentSegmentProgress();
      return;
    }

    const segStart = getSegmentStartT(activeSegment);
    const segEnd = getSegmentEndT(activeSegment);
    let segT = (t - segStart) / (segEnd - segStart);
    segT = Math.min(1, Math.max(0, segT));

    if (segT > segmentProgress[activeSegment]) {
      const newProgress = [...segmentProgress];
      newProgress[activeSegment] = segT;
      setSegmentProgress(newProgress);

      const nowMs = performance.now();
      const overall = (activeSegment + segT) / (drawNodes.length - 1);
      if (
        nowMs - lastDrawTickAtMsRef.current >= 70 &&
        overall - lastDrawTickOverallRef.current >= 0.02
      ) {
        lastDrawTickAtMsRef.current = nowMs;
        lastDrawTickOverallRef.current = overall;
        playDrawTickSound(Math.min(1, 0.25 + (segT - segmentProgress[activeSegment]) * 8));
      }

      if (segT >= 0.99) {
        handleSegmentComplete();
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    const point = clientToViewBox(e.clientX, e.clientY);
    if (!point) return;

    // Throttle pointer position updates using requestAnimationFrame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setPointerPos(point);
      animationFrameRef.current = null;
    });

    if (isDrawing) {
      if (!dragStartedRef.current && pointerDownPointRef.current) {
        const dx = point.x - pointerDownPointRef.current.x;
        const dy = point.y - pointerDownPointRef.current.y;
        const movedDistance = Math.hypot(dx, dy);
        if (movedDistance < 8) return;
        dragStartedRef.current = true;
      }
      updateDrawProgress(point);
    }
  };

  const handlePointerDown = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    e.stopPropagation();
    initAudio();
    const point = clientToViewBox(e.clientX, e.clientY);
    if (!point) return;
    setPointerPos(point);
    setIsDrawing(true);
    if (rollbackFrameRef.current) {
      clearInterval(rollbackFrameRef.current);
      rollbackFrameRef.current = null;
    }
    pointerDownPointRef.current = point;
    dragStartedRef.current = false;
    playDrawTickSound(0.35);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    setIsDrawing(false);
    pointerDownPointRef.current = null;
    dragStartedRef.current = false;
    rollbackIncompleteSegmentOnStop();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const activateDrawingMode = (forceEasy = false) => {
    if (isPlaying) setIsPlaying(false);
    stopTrainSound();
    setShowGuide(false);
    setDrawingMode(true);
    setPracticeBlind(false);
    setBubbles([]);
    setPointerPos({ x: -100, y: -100 });
    lastDrawTickOverallRef.current = 0;
    lastDrawTickAtMsRef.current = 0;
    attemptCountRef.current = 0;

    const path = letterPathRef.current;
    if (!path) return;
    const totalLen = path.getTotalLength();

    const nodes = forceEasy || easyMode
      ? [
          { t: 0, point: path.getPointAtLength(0), completed: false },
          { t: 0.25, point: path.getPointAtLength(totalLen * 0.25), completed: false },
          { t: 0.5, point: path.getPointAtLength(totalLen * 0.5), completed: false },
          { t: 0.75, point: path.getPointAtLength(totalLen * 0.75), completed: false },
          { t: 1, point: path.getPointAtLength(totalLen), completed: false },
        ]
      : [
          { t: 0, point: path.getPointAtLength(0), completed: false },
          { t: 0.5, point: path.getPointAtLength(totalLen * 0.5), completed: false },
          { t: 1, point: path.getPointAtLength(totalLen), completed: false },
        ];

    setDrawNodes(nodes);
    setSegmentProgress(forceEasy || easyMode ? [0, 0, 0, 0] : [0, 0]);
    setActiveSegment(0);
    setDrawSuccess(false);
    setShowSuccessMessage(false);
  };

  const activateEasyDrawingMode = () => {
    setEasyMode(true);
    activateDrawingMode(true);
  };

  const handleFirstStarClick = (e) => {
    setBlindMode(false);
    setDrawingWithCanvas(false);
    setEasyMode(false);
    setAnimationComplete(false);
    setThirdUnlocked(false);

    if (drawingMode) {
      setDrawingMode(false);
      setDrawSuccess(false);
      setShowSuccessMessage(false);
      setSegmentProgress([0, 0]);
      setActiveSegment(0);
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
    setBubbles([]);
    playPopSound();
    progressRef.current = 0;
    setProgress(0);
    setMarkerPosition(START_MARKER);
    setTimeout(() => {
      setNodesDeployed(true);
      playPopSound();
      setTimeout(() => setIsPlaying(true), 800);
    }, 50);
    setAnimatePop(true);
    setTimeout(() => setAnimatePop(false), 500);
  };

  const handleThirdStarClick = () => {
    if (!thirdUnlocked) return;
    if (isPlaying) setIsPlaying(false);
    stopTrainSound();
    setShowGuide(false);
    setDrawingMode(false);
    setDrawSuccess(false);
    setShowSuccessMessage(false);
    setSegmentProgress([0, 0]);
    setActiveSegment(0);
    setPointerPos({ x: -100, y: -100 });
    setBubbles([]);
    setEasyMode(false);
    attemptCountRef.current = 0;
    setPracticeBlind(false);
    setThirdPreviewVisible(true);
    setTimeout(() => {
      setThirdPreviewVisible(false);
      setPracticeBlind(true);
      setDrawingWithCanvas(true);
      setBlindMode(true);
      playPopSound();
    }, THIRD_PREVIEW_MS);
  };

  const submitCanvasForEvaluation = async () => {
    if (!canvasRef.current || !hasDrawn || evalLoading) return;

    try {
      setEvalLoading(true);
      setEvalError(null);
      setEvalResult(null);
      setShowSuccessMessage(false);

      const imageDataUrl = await canvasRef.current.exportImage('png');

      if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
        throw new Error('Canvas image could not be generated.');
      }

      const result = await predictNumber({
        studentId: 'ST001',
        actualNumber: 6,
        image: imageDataUrl,
        timeTaken: Math.max(1, Math.round((Date.now() - tracingStartTime) / 1000)),
        attemptCount: attemptCountRef.current + 1,
      });

      console.log('Prediction result:', result);
      setEvalResult(result);

      if (result?.isCorrect === true) {
        setFeedback('correct');
        setShowSuccessMessage(true);
        playCheerSound();

        saveGameSession({
          gameType: 'TracingNumbers',
          playedAt: new Date().toISOString(),
          targetNumber: 6,
          predictedNumber: result.predictedNumber,
          confidence: result.confidence,
          correct: true,
          attempts: attemptCountRef.current + 1,
          responseTime: Date.now() - tracingStartTime,
          score: 15,
          completed: true,
        });
      } else {
        attemptCountRef.current += 1;
        setFeedback('wrong');

        const detectedNumber =
          result?.predictedNumber ?? result?.predicted_digit ?? 'unknown';

        setEvalError(
          `Model detected: ${detectedNumber}. Please try drawing 6 again.`
        );
      }
    } catch (error) {
      console.error('Digit evaluation error:', error);

      setEvalError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Unable to evaluate the number. Please try again.'
      );
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <main
      className='dg-shell dg-theme-ta dc-number-page dc-cartoon-bg'
      // style={{ '--dc-number-bg-image': `url(${bg01})` }}
    >

      <button type='button' className='dg-home-btn dc-back-button' onClick={() => navigate('/dyscalculia/number-tracing')}>
        ←
      </button>

      <section className='dg-stage dc-trace-stage'>
        <header className='dg-header dc-instruction-box'>
          <h1 onClick={handleAudio}>‘6’ {AUDIO_TEXT} අංකය ලියමු</h1>
        </header>

        <div className='dg-canvas-wrap dc-trace-card'>
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
                <linearGradient
                  id='rainbowGrad'
                  gradientUnits='userSpaceOnUse'
                  x1='0'
                  y1='0'
                  x2='640'
                  y2='0'
                  spreadMethod='reflect'
                >
                  <animate
                    attributeName='gradientTransform'
                    type='translate'
                    from='0 0'
                    to='640 0'
                    dur='2.8s'
                    repeatCount='indefinite'
                  />
                  <stop offset='0%' stopColor='#ff0000' />
                  <stop offset='20%' stopColor='#ffff00' />
                  <stop offset='40%' stopColor='#00ff00' />
                  <stop offset='60%' stopColor='#00ffff' />
                  <stop offset='80%' stopColor='#0000ff' />
                  <stop offset='100%' stopColor='#ff00ff' />
                </linearGradient>

                <filter id='glow' x='-40%' y='-40%' width='180%' height='180%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='4' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>

                <filter id='nodeGlow' x='-50%' y='-50%' width='200%' height='200%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='3' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
              </defs>

              {!blindMode && (
                <>
                  {!practiceBlind && !thirdPreviewVisible && (
                    <path
                      d={NUMBER_GUIDE_PATH}
                      className='dg-chain-path'
                      style={{
                        stroke: drawingMode ? 'rgba(255,255,255,0.16)' : '#ffffff',
                        strokeWidth: drawingMode ? 26 : 40,
                        opacity: drawingMode ? 0.75 : 0.95,
                        filter: drawingMode
                          ? 'drop-shadow(0 0 6px rgba(255,255,255,0.35))'
                          : 'drop-shadow(0 0 14px rgba(255,255,255,0.8))',
                      }}
                      fill='none'
                    />
                  )}

                  <path d={NUMBER_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />

                  {shouldShowProgressPath && (
                    <path
                      d={NUMBER_GUIDE_PATH}
                      className='dg-progress-path'
                      pathLength='1'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      style={{
                        stroke: drawingStrokeColor,
                        strokeWidth: finalStrokeWidth,
                        strokeDasharray: `${Math.max(0.0001, visiblePathProgress)} 1`,
                        strokeDashoffset: '0',
                        filter: drawingMode ? 'url(#glow)' : 'none',
                        transition: 'stroke 0.12s linear, stroke-width 0.1s ease-out',
                        fill: 'none',
                      }}
                    />
                  )}

                  {thirdPreviewVisible && (
                    <path
                      d={NUMBER_GUIDE_PATH}
                      fill='none'
                      stroke='rgba(255,255,255,0.95)'
                      strokeWidth='40'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }}
                    />
                  )}

                  {drawingMode && !drawSuccess &&
                    drawNodes.map((node, idx) => (
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
                      <circle
                        cx={nodesDeployed ? START_MARKER.x : originPoint.x}
                        cy={nodesDeployed ? START_MARKER.y : originPoint.y}
                        r='22'
                        className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}
                      />
                      <text
                        x={nodesDeployed ? START_MARKER.x : originPoint.x}
                        y={nodesDeployed ? START_MARKER.y + 6 : originPoint.y + 6}
                        textAnchor='middle'
                      >
                        ★
                      </text>
                      <circle
                        cx={markerPosition.x}
                        cy={markerPosition.y}
                        r='0'
                        style={{ opacity: 0 }}
                      />
                    </>
                  )}

                  {bubbles.map((b) => (
                    <circle
                      key={b.id}
                      cx={b.x}
                      cy={b.y}
                      r={b.size}
                      fill={BUBBLE_PALETTE[(b.colorIndex ?? 0) % BUBBLE_PALETTE.length].fill}
                      stroke={BUBBLE_PALETTE[(b.colorIndex ?? 0) % BUBBLE_PALETTE.length].stroke}
                      strokeWidth='1.5'
                      className={b.isFloating ? 'dg-bubble-anim' : 'dg-bubble-idle'}
                      style={{
                        animationDuration: b.isFloating ? '3s' : `${b.idleDuration}s`,
                        transformOrigin: `${b.x}px ${b.y}px`,
                      }}
                    />
                  ))}

                  {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                    <image
                      href={fingerPointer}
                      x={pointerPos.x - 30}
                      y={pointerPos.y - 30}
                      width='60'
                      height='60'
                      className='dg-finger'
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                      draggable='false'
                    />
                  )}

                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      <circle
                        cx={markerPosition.x}
                        cy={markerPosition.y}
                        r='22'
                        className='dg-node dg-node-active'
                      />
                      <text
                        x={markerPosition.x}
                        y={markerPosition.y + 6}
                        textAnchor='middle'
                        className='dg-node-icon'
                        style={{ fontSize: '20px' }}
                      >
                        ☺
                      </text>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              {/* <h3>✍️ {AUDIO_TEXT} “6” අංකය අඳින්න</h3> */}
              <div
                className='dg-practice-canvas-shell'
                style={{
                  position: 'relative',
                  width: 600,
                  height: 600,
                  margin: '16px auto',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '10px solid #5C4033', 
                  boxSizing: 'border-box',
                  boxShadow: '0 6px 25px rgba(92, 64, 51, 0.3)',
                }}
              >
                <ReactSketchCanvas
                  ref={canvasRef}
                  width='600px'
                  height='600px'
                  strokeWidth={18}
                  strokeColor='black'
                  canvasColor='white'
                  onStroke={() => {
                    setHasDrawn(true);
                    setEvalError(null);
                    setShowSuccessMessage(false);
                  }}
                  style={{
                    border: 'none',
                    borderRadius: '20px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: PEN_CURSOR,
                    touchAction: 'none',
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  type='button'
                  className='dg-practice-clear-btn dg-ctl-btn'
                  onClick={async () => {
                    await canvasRef.current?.clearCanvas();
                    setHasDrawn(false);
                    setEvalResult(null);
                    setEvalError(null);
                    setFeedback(null);
                    setShowSuccessMessage(false);
                    attemptCountRef.current = 0;
                    setTracingStartTime(Date.now());
                  }}
                  style={{ color: '#ffffff' }}
                >
                  පිරිසිදු කරමු
                </button>
                <button
                  type='button'
                  className='dg-ctl-btn'
                  onClick={submitCanvasForEvaluation}
                  disabled={!hasDrawn || evalLoading}
                  style={{ color: '#ffffff' }}
                >
                  {evalLoading ? 'අගයමින්...' : 'අගයමු'}
                </button>
              </div>

              {showSuccessMessage && (
                <div className='dg-draw-success'>🎉 හොඳයි! ඔබ අංකය නිවැරදිව ලිව්වා!</div>
              )}
              {evalError && (
                <div className='dg-eval-error' style={{ textAlign: 'center', marginTop: 8, color: '#ff8080' }}>
                  {evalError}
                </div>
              )}
              {evalResult && (
                <div
                  className='dg-eval-result'
                  style={{ textAlign: 'center', marginTop: 10, color: '#ffffff' }}
                >
                  හඳුනාගත් අංකය: {evalResult.predictedNumber}
                  {' | '}
                  විශ්වාසය: {Math.round((evalResult.confidence || 0) * 100)}%
                </div>
              )}
            </div>
          )}
        </div>

        <div className='dg-floating-stars dc-star-controls'>
          {/* <button type='button' className='dg-home-btn dc-back-button' onClick={() => navigate('/dyscalculia/number-tracing')}>
            <img src={arrow} alt='arrow' className='dg-star-btn-img'/>
          </button> */}
          <button type='button' className='dg-star-btn active' onClick={handleFirstStarClick}>
            <img src={active} alt='active' className='dg-star-btn-img'/>
          </button>
          <button
            type='button'
            className={`dg-star-btn ${animationComplete ? 'active' : 'inactive'}`}
            disabled={!animationComplete}
            onClick={() => {
              if (!animationComplete) return;
              if (drawingMode && !drawSuccess) {
                setSegmentProgress([0, 0]);
                setActiveSegment(0);
                setDrawSuccess(false);
                setShowSuccessMessage(false);
                return;
              }
              setBlindMode(false);
              setDrawingWithCanvas(false);
              setPracticeBlind(false);
              setThirdPreviewVisible(false);
              setEasyMode(false);
              attemptCountRef.current = 0;
              activateDrawingMode();
            }}
          >
            <img src={animationComplete ? active : inactive} alt='' className='dg-star-btn-img' />
          </button>
          <button
            type='button'
            className={`dg-star-btn ${thirdUnlocked ? 'active' : 'inactive'}`}
            disabled={!thirdUnlocked}
            onClick={handleThirdStarClick}
          >
            <img src={thirdUnlocked ? active : inactive} alt='' className='dg-star-btn-img' />
          </button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            {practiceBlind
              ? '👉 අංකය “6” මතක තියා අඳින්න.'
              : '✒️ මඟ පෙන්වූ රේඛාව දිගේ අංකය අඳින්න.'}
          </div>
        )}

        {showSuccessMessage && (
          <div className='dg-draw-success'>🎉 හොඳයි! ඔබ අංකය නිවැරදිව ලිව්වා!</div>
        )}
      </section>
    </main>
  );
};

export default DyscalculiaNumber6;




