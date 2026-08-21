import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-a.css';
import fingerPointer from '../../../assets/images/finger.png';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import CorrectStarBurst from '../components/CorrectStarBurst';
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
import Topic from '../../../assets/images/dysgraphia/katopic.png';

import firstStarAudio from '../../../assets/audio/dysgraphia/first_star.mp3';
import secondStarAudio from '../../../assets/audio/dysgraphia/second_star.mp3';
import starFiveAudio from '../../../assets/audio/dysgraphia/star_five.mp3';
import letterTracing from '../../../assets/audio/dysgraphia/letterTracing.mp3';
import buttonSound from '../../../assets/audio/dysgraphia/buttonSound.mp3';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;
const SEGMENT_RESUME_THRESHOLD = 0.08;
const FREE_TRACE_RESUME_THRESHOLD = 0.06;

// SVG source: viewBox="0 0 63.01 100"
// Transform: x = 29 + 6 * svgX, y = 6 * svgY
const KA_GUIDE_PATH =
  'M 70.6466 180 c 16.5684 0 30 13.4316 30 30 s -13.4316 30 -30 30 s -30 -13.4316 -30 -30 s 13.4316 -30 30 -30 c 64.548 0 65.5932 49.0218 54.6132 60 c 201.63 0 169.596 180 87.39 180 c -33.342 0 -57.4686 -26.868 -57.4686 -60 c 0 33.132 -24.1248 60.162 -57.4686 60 c -42.3024 -0.20772 -66.552 -36.4122 -45.369 -84.66 l -20.3442 4.66182 c 17.859 -25.0194 50.2434 -66.78 93.264 -100.002 c 43.0188 -33.2202 96.282 -60.174 153.324 -60 c 173.322 0.53268 157.794 240 10.368 240';

const START_MARKER = { x: 70.6466, y: 180.0 };
const END_MARKER = { x: 288.9554, y: 420.0 };

// Pen cursor
const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

// ── Caterpillar tracer ─────────────────────────────────────────────────────
const CaterpillarTracer = ({ progress, pathRef, isActive }) => {
  const [headPos, setHeadPos] = useState({ x: 0, y: 0 });
  const [bodyPoints, setBodyPoints] = useState([]);
  const [legAngle, setLegAngle] = useState(0);

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

const DysgraphiaLetterKA = () => {
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
  const [hasDrawn, setHasDrawn] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Easy mode (more guiding nodes after 5 failed attempts)
  const [easyMode, setEasyMode] = useState(false);
  const [freeTraceMode, setFreeTraceMode] = useState(false);
  const [freeTraceProgress, setFreeTraceProgress] = useState(0);
  const [freeTraceIsDrawing, setFreeTraceIsDrawing] = useState(false);
  const [freeTracePointerPos, setFreeTracePointerPos] = useState({ x: -100, y: -100 });
  const [freeTraceComplete, setFreeTraceComplete] = useState(false);
  const [audioPhase, setAudioPhase] = useState('first');
  const [isGuideAudioPlaying, setIsGuideAudioPlaying] = useState(false);

  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [eraseCount, setEraseCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const audioCtxRef = useRef(null);
  const letterTracingAudioRef = useRef(null);
  const buttonSoundAudioRef = useRef(null);
  const guideAudioRef = useRef(null);
  const secondAudioDelayRef = useRef(null);
  const lastDrawTickOverallRef = useRef(0);
  const lastDrawTickAtMsRef = useRef(0);
  const attemptCountRef = useRef(0);

  const canvasRef = useRef(null);
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const wentOffPathRef = useRef(false);

  const drawTimerIntervalRef = useRef(null);
  const drawTimerStartRef = useRef(null);
  const hasStartedTimerRef = useRef(false);

  // Overall progress for the rainbow trail
  const overallProgress = (() => {
    const segCount = segmentProgress.length;
    if (segCount === 0) return 0;
    const total = segmentProgress.reduce((sum, val) => sum + val, 0);
    return total / segCount;
  })();
  const drawingStepAvailable = freeTraceComplete || drawingMode || practiceBlind || drawingWithCanvas;
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

    const startCaterpillarSound = () => {
    const audio = letterTracingAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const stopCaterpillarSound = () => {
    const audio = letterTracingAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };


  const playButtonSound = () => {
    const audio = buttonSoundAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
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
      // tiny shimmer overtone
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

  // ── Stats helpers: attempts / time spent / wrong count ───────────────────
  const formatElapsedTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startDrawTimer = () => {
    if (hasStartedTimerRef.current) return;
    hasStartedTimerRef.current = true;
    setIsTimerRunning(true);
    drawTimerStartRef.current = Date.now();
    setElapsedSeconds(0);
    drawTimerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - drawTimerStartRef.current) / 1000));
    }, 1000);
  };

  const stopDrawTimer = () => {
    if (drawTimerIntervalRef.current) {
      clearInterval(drawTimerIntervalRef.current);
      drawTimerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
  };

  const resetSessionStats = () => {
    stopDrawTimer();
    hasStartedTimerRef.current = false;
    drawTimerStartRef.current = null;
    setElapsedSeconds(0);
    setAttemptCount(0);
    setWrongCount(0);
    setEraseCount(0);
  };

  // ── Guide voice audio setup (mirrors TA) ────────────────────────────────
  useEffect(() => {
    const audio = new Audio(firstStarAudio);
    audio.volume = 0.9;
    guideAudioRef.current = audio;

    const handleEnded = () => setIsGuideAudioPlaying(false);
    audio.addEventListener('ended', handleEnded);

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => setIsGuideAudioPlaying(true))
        .catch(() => setIsGuideAudioPlaying(false));
    } else {
      setIsGuideAudioPlaying(!audio.paused);
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('ended', handleEnded);
      guideAudioRef.current = null;
    };
  }, []);

   // ── Caterpillar tracing sound (letterTracing.mp3) setup + cleanup ────────
    useEffect(() => {
      const audio = new Audio(letterTracing);
      audio.loop = true;
      audio.volume = 0.9;
      letterTracingAudioRef.current = audio;
  
      return () => {
        audio.pause();
        audio.currentTime = 0;
        letterTracingAudioRef.current = null;
      };
    }, []);
  
    // ── Button click sound (buttonSound.mp3) setup + cleanup ─────────────────
    useEffect(() => {
      const audio = new Audio(buttonSound);
      audio.volume = 0.9;
      buttonSoundAudioRef.current = audio;
  
      return () => {
        audio.pause();
        audio.currentTime = 0;
        buttonSoundAudioRef.current = null;
      };
    }, []);

  useEffect(() => {
    return () => {
      if (secondAudioDelayRef.current) {
        clearTimeout(secondAudioDelayRef.current);
        secondAudioDelayRef.current = null;
      }
    };
  }, []);


   useEffect(() => {
    return () => {
      if (drawTimerIntervalRef.current) {
        clearInterval(drawTimerIntervalRef.current);
        drawTimerIntervalRef.current = null;
      }
    };
  }, []);

  const playGuidanceAudio = (src, phase) => {
    const audio = guideAudioRef.current;
    if (!audio) return;

    if (audio.src !== src) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = src;
    }

    setAudioPhase(phase);
    audio
      .play()
      .then(() => setIsGuideAudioPlaying(true))
      .catch(() => setIsGuideAudioPlaying(false));
  };

  const handleGuidanceToggle = () => {
    playButtonSound();
    const audio = guideAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      const source = audioPhase === 'second'
        ? secondStarAudio
        : audioPhase === 'five'
          ? starFiveAudio
          : firstStarAudio;
      playGuidanceAudio(source, audioPhase);
      return;
    }

    audio.pause();
    setIsGuideAudioPlaying(false);
  };

  // ---------- Guided animation (unchanged) ----------
  useEffect(() => {
    if (!isPlaying || !showGuide) return;
    let frameId;
    const start = performance.now() - (progressRef.current * ANIMATION_DURATION_MS);
    startCaterpillarSound();
    const animate = (now) => {
      const elapsed = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;
      if (nextProgress >= 1) {
        progressRef.current = 1;
        setProgress(1);
        setIsPlaying(false);
        setAnimationComplete(true);
        stopCaterpillarSound();
        if (secondAudioDelayRef.current) {
          clearTimeout(secondAudioDelayRef.current);
        }
        setAudioPhase('second');
        secondAudioDelayRef.current = setTimeout(() => {
          playGuidanceAudio(secondStarAudio, 'second');
          secondAudioDelayRef.current = null;
        }, 2000);

        return;
      }
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      frameId = window.requestAnimationFrame(animate);
    };
    frameId = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frameId);
      stopCaterpillarSound();
    };
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const pathElement = letterPathRef.current;
    if (!pathElement) return;
    const pathLength = pathElement.getTotalLength();
    const point = pathElement.getPointAtLength(progress * pathLength);
    setMarkerPosition({ x: point.x, y: point.y });
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

    stopCaterpillarSound();
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('ක');
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

    // Mark the reached node (end of current segment) as completed
    const reachedNode = activeSegment + 1;
    setDrawNodes(prev => {
      const updated = [...prev];
      if (updated[reachedNode]) updated[reachedNode].completed = true;
      return updated;
    });

    if (activeSegment === drawNodes.length - 2) {
      // Last segment finished → whole letter done
      setDrawSuccess(true);
      setShowSuccessMessage(true);
      setThirdUnlocked(true);
      playSuccessSound();
      setTimeout(() => setShowSuccessMessage(false), 2500);
    } else {
      // Advance to next segment
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
    stopCaterpillarSound();
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
  };

  const activateEasyDrawingMode = () => {
    setEasyMode(true);
    activateDrawingMode(true);
  };

  const handleFirstStarClick = (e) => {
    playButtonSound();
    resetSessionStats();
    if (secondAudioDelayRef.current) {
      clearTimeout(secondAudioDelayRef.current);
      secondAudioDelayRef.current = null;
    }

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
      stopCaterpillarSound();
    }

    const guidanceAudio = guideAudioRef.current;
    if (guidanceAudio) {
      guidanceAudio.pause();
      setIsGuideAudioPlaying(false);
    }

    setPracticeBlind(false);
    setThirdPreviewVisible(false);
    if (isPlaying) {
      setIsPlaying(false);
      stopCaterpillarSound();
    }
    const svg = svgRef.current;
    if (svg) {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = clientToViewBox(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (point) setOriginPoint(point);
    }
    setShowGuide(true);
    setNodesDeployed(false);

    
    progressRef.current = 0;
    setProgress(0);
    setMarkerPosition(START_MARKER);
    setTimeout(() => {
      setNodesDeployed(true);
       // Sound when nodes animate to correct positions
      setTimeout(() => setIsPlaying(true), 800);
    }, 50);
    setAnimatePop(true);
    setTimeout(() => setAnimatePop(false), 500);
  };

  const handleThirdStarClick = () => {
    if (!thirdUnlocked) return;
    playButtonSound();
    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);

    if (isPlaying) setIsPlaying(false);
    stopCaterpillarSound();
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
    resetSessionStats();

    setTimeout(() => {
      setThirdPreviewVisible(false);
      setPracticeBlind(true);
      setDrawingWithCanvas(true);
      setBlindMode(true);
      
    }, THIRD_PREVIEW_MS);
  };

  const handleFreeTraceStarClick = () => {
    playButtonSound();
    if (secondAudioDelayRef.current) {
      clearTimeout(secondAudioDelayRef.current);
      secondAudioDelayRef.current = null;
    }

    const guidanceAudio = guideAudioRef.current;
    if (guidanceAudio) {
      guidanceAudio.pause();
      guidanceAudio.currentTime = 0;
      setIsGuideAudioPlaying(false);
    }

    if (isPlaying) { setIsPlaying(false); stopCaterpillarSound(); }
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

      const nextAttemptNumber = attemptCount + 1;
      setAttemptCount(nextAttemptNumber);

      const dataUrl = await canvasRef.current.exportImage("jpeg");

      // convert + preprocess
      const blob = await fetch(dataUrl).then(res => res.blob());
      const processedBlob = await preprocessDrawingBlob(blob, 'image/jpeg');

      const response = await dysgraphiaService.recordLetterActivity({
        letterId: 'ka',
        targetChar: 'ක',
        mode: 'independent',
        durationSeconds: elapsedSeconds,
        timerSeconds: elapsedSeconds,
        attemptNumber: nextAttemptNumber,
        wrongAttempts: wrongCount,
        eraseCount,
        strokeCount: paths.length,
        image: processedBlob,
      });

      setEvalResult({ ...response, prediction: { sinhala: response?.predicted ?? null, confidence: response?.confidence ?? null } });

      if (response?.isCorrect) {
        stopDrawTimer();
        awardStars(response.starsEarned || 1);
        setFeedback('correct');
      } else {
         setWrongCount(prev => prev + 1);
        setFeedback('wrong');
      }

    } catch (err) {
      console.error(err);
      setEvalError(err?.response?.data?.error?.message || err.message || 'Prediction failed');
      setFeedback(null);
    } finally {
      setEvalLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <main className='dg-shell dg-theme-a'>
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />

       {drawingWithCanvas && (
        <div className='dg-stats-panel'>

          <div className='dg-stat-card dg-stat-attempts'>
            <span className='dg-stat-icon'>🎯</span>
            <div className='dg-stat-info'>
              <span className='dg-stat-label'>වර ගණන්</span>
              <span className='dg-stat-value'>{attemptCount}</span>
            </div>
          </div>

          <div className={`dg-stat-card dg-stat-time ${isTimerRunning ? 'dg-stat-time-active' : ''}`}>
            <span className='dg-stat-icon'>⏱️</span>
            <div className='dg-stat-info'>
              <span className='dg-stat-label'>ගත වූ කාලය</span>
              <span className='dg-stat-value'>{formatElapsedTime(elapsedSeconds)}</span>
            </div>
          </div>

          <div className='dg-stat-card dg-stat-wrong'>
            <span className='dg-stat-icon'>❌</span>
            <div className='dg-stat-info'>
              <span className='dg-stat-label'>වැරදි ගණන</span>
              <span className='dg-stat-value'>{wrongCount}</span>
            </div>
          </div>
        </div>
      )}

      <section className='dg-stage'>
        <header className='dg-header'>
          <img src={Topic} alt="ක අක්ෂරය" className="dg-topic-image" onClick={handleAudio} />
        </header>

        <div className={`dg-canvas-wrap${drawingWithCanvas ? ' no-board' : ''}`}>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${drawingMode ? 'drawing-active' : ''}`}
              viewBox='-40 -20 760 640'
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
                <linearGradient id='pinkGlitterGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='640' y2='0' spreadMethod='reflect'>
                  <animate attributeName='gradientTransform' type='translate' from='0 0' to='640 0' dur='2.6s' repeatCount='indefinite' />
                  <stop offset='0%' stopColor='#ff057c'>
                    <animate attributeName='stop-color' values='#ff057c;#7000ff;#8d0b93;#ff9a9e;#ff057c' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                  <stop offset='35%' stopColor='#7000ff'>
                    <animate attributeName='stop-color' values='#7000ff;#8d0b93;#ff9a9e;#ff057c;#7000ff' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                  <stop offset='70%' stopColor='#8d0b93'>
                    <animate attributeName='stop-color' values='#8d0b93;#ff9a9e;#ff057c;#7000ff;#8d0b93' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                  <stop offset='100%' stopColor='#fbc2eb'>
                    <animate attributeName='stop-color' values='#fbc2eb;#8d0b93;#7000ff;#ff057c;#fbc2eb' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                </linearGradient>
                <linearGradient id='greenGlitterGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='640' y2='0' spreadMethod='reflect'>
                  <animate attributeName='gradientTransform' type='translate' from='0 0' to='640 0' dur='2.6s' repeatCount='indefinite' />
                  <stop offset='0%' stopColor='#11998e'>
                    <animate attributeName='stop-color' values='#11998e;#38ef7d;#00b09b;#80f9d5;#11998e' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                  <stop offset='35%' stopColor='#38ef7d'>
                    <animate attributeName='stop-color' values='#38ef7d;#00b09b;#80f9d5;#11998e;#38ef7d' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                  <stop offset='70%' stopColor='#00b09b'>
                    <animate attributeName='stop-color' values='#00b09b;#80f9d5;#11998e;#38ef7d;#00b09b' dur='1.8s' repeatCount='indefinite' />
                  </stop>
                  <stop offset='100%' stopColor='#d4fcdc'>
                    <animate attributeName='stop-color' values='#d4fcdc;#00b09b;#38ef7d;#11998e;#d4fcdc' dur='1.8s' repeatCount='indefinite' />
                  </stop>
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
                    <path d={KA_GUIDE_PATH} className='dg-chain-path' style={{ stroke: 'rgba(255,255,255,0.25)' }} />
                  )}
                  <path d={KA_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />

                  <path
                    d={KA_GUIDE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: (drawingMode || freeTraceMode) ? 'url(#greenGlitterGrad)' : 'rgba(255,255,255,0.3)',
                      strokeWidth: finalStrokeWidth,
                      strokeDashoffset: `${1 - displayedTraceProgress}`,
                      filter: (drawingMode || freeTraceMode) ? 'url(#glow)' : 'none',
                      transition: 'stroke-width 0.1s ease-out'
                    }}
                  />


                  {thirdPreviewVisible && (
                    <path d={KA_GUIDE_PATH} fill='none' stroke='rgba(255,255,255,0.95)' strokeWidth='40' strokeLinecap='round' strokeLinejoin='round' style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }} />
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

                  {showGuide && !drawingMode && !animationComplete && (
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
                      className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false' />
                  )}

                  {/* ── Caterpillar tracer ── */}
                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      {progress > 0 && (
                        <path
                          d={KA_GUIDE_PATH}
                          pathLength='1'
                          fill='none'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          style={{
                            stroke: 'url(#pinkGlitterGrad)',
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
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>

              <div
                className='dg-practice-canvas-shell'
                style={{ position: 'relative', margin: '16px auto', borderRadius: '16px', overflow: 'hidden' }}
                onPointerDown={startDrawTimer}
              >             
               <ReactSketchCanvas
                  ref={canvasRef}
                  width='100%'
                  height='100%'
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
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => { if (hasDrawn) setEraseCount(count => count + 1); canvasRef.current?.clearCanvas(); setHasDrawn(false); }} style={{ color: '#ffffff' }}>🗑️මකන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={!hasDrawn || evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : ' පරීක්ෂා කරන්න'}</button>
              </div>
              {evalResult && evalResult.prediction && (
                <div style={{ textAlign: 'center', marginTop: 8, color: '#ffffff' }}>
                  <h3>🎯 Result</h3>
                  <p>Letter: {evalResult.prediction.sinhala}</p>
                  <p>Confidence: {(evalResult.prediction.confidence * 100).toFixed(2)}%</p>
                </div>
              )}

              {evalError && (
                <div className='dg-eval-error' style={{ textAlign: 'center', marginTop: 8, color: '#ff8080' }}>
                  {evalError}
                </div>
              )}
              {feedback === 'correct' && (
                <>
                  <CorrectStarBurst />
                  <div key='cheer' className='dg-cheer-overlay'>
                    <div className='dg-cheer-stars'>
                      <span className='dg-cheer-star dg-cheer-star-1'>⭐</span>
                      <span className='dg-cheer-star dg-cheer-star-2'>⭐</span>
                      <span className='dg-cheer-star dg-cheer-star-3'>⭐</span>
                    </div>
                    <div className="mt-5 px-8 py-4 rounded-3xl bg-black/40 backdrop-blur-md border border-yellow-400/40 shadow-2xl text-center">
                      <p className="text-4xl font-black text-yellow-300 drop-shadow-lg animate-bounce tracking-wide">🎉 නිවැරදියි! 🎉</p>
                      <p className="mt-2 text-lg font-bold text-white/90 tracking-wide">
                        ඔබ <span className="text-yellow-300">&quot;ක&quot;</span> අක්ෂරය නිවැරදිව ඇන්දා!
                      </p>
                      <div className="flex justify-center gap-2 mt-3">
                        {['⭐', '🌟', '✨', '🌟', '⭐'].map((e, i) => (
                          <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {feedback === 'wrong' && (
                <div style={{ color: '#ff5252', textAlign: 'center', marginTop: 12, padding: '10px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold' }}>
                  ❌ නැවත උත්සාහ කරන්න!
                </div>
              )}
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

          <button
            type='button'
            className={`dg-star-btn dg-audio-star-btn ${isGuideAudioPlaying ? 'is-playing' : ''}`}
            onClick={handleGuidanceToggle}
            aria-label={isGuideAudioPlaying ? 'Stop instructions' : 'Play instructions'}
            title='උපදෙස් අසන්න (Listen to instructions)'
          >
            {isGuideAudioPlaying ? (
              <svg viewBox='0 0 24 24' width='24' height='24' focusable='false' aria-hidden='true'>
                <path d='M3 9v6h4l5 4V5L7 9H3z' fill='currentColor' />
                <path d='M16 8l5 8' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                <path d='M21 8l-5 8' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
              </svg>
            ) : (
              <svg viewBox='0 0 24 24' width='24' height='24' focusable='false' aria-hidden='true'>
                <path d='M3 9v6h4l5 4V5L7 9H3z' fill='currentColor' />
                <path d='M16 9.5a4 4 0 010 5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                <path d='M18.5 7a8 8 0 010 10' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
              </svg>
            )}
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
              playButtonSound();
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
            onClick={() => {
              if (secondAudioDelayRef.current) {
                clearTimeout(secondAudioDelayRef.current);
                secondAudioDelayRef.current = null;
              }
              playGuidanceAudio(starFiveAudio, 'five');
              handleThirdStarClick();
            }}
          >
            <img src={thirdUnlocked ? button04 : buttonD04} alt='' className='dg-star-btn-img' />
          </button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            {practiceBlind
              ? '✍️ දැන් “ක” අක්ෂරය ඔබම අඳින්න.'
              : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න '}
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

export default DysgraphiaLetterKA;