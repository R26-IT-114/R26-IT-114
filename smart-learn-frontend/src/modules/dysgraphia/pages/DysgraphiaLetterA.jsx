import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-a.css';
import '../styles/dysgraphia-letter-dinosaur.css';
import fingerPointer from '../../../assets/images/finger.png';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { getFreeTraceStars, getGuidedDrawingStars } from '../utils/letterTaskRewardRules';
import { dysgraphiaService } from '../services/dysgraphiaService';
import button from '../../../assets/images/dysgraphia/button.png';
import button01 from '../../../assets/images/dysgraphia/button01.png';
import button02 from '../../../assets/images/dysgraphia/button02.png';
import buttonD02 from '../../../assets/images/dysgraphia/buttonD02.png';
import button03 from '../../../assets/images/dysgraphia/button03.png';
import buttonD03 from '../../../assets/images/dysgraphia/Dbutton03.png';
import button04 from '../../../assets/images/dysgraphia/button04.png';
import buttonD04 from '../../../assets/images/dysgraphia/Dbutton04.png';
import Topic from '../../../assets/images/dysgraphia/Atopic1.png';

import firstStarAudio from '../../../assets/audio/dysgraphia/first_star.mp3';
import secondStarAudio from '../../../assets/audio/dysgraphia/flotting02-enhanced.mp4';
import starFiveAudio from '../../../assets/audio/dysgraphia/star_five.mp3';
import letterTracing from '../../../assets/audio/dysgraphia/letterTracing.mp3';
import buttonSound from '../../../assets/audio/dysgraphia/buttonSound.mp3';

const ANIMATION_DURATION_MS = 1000;
const COARSE_POINTER = window.matchMedia?.('(pointer: coarse)').matches ?? false;
const DRAW_DISTANCE_THRESHOLD = COARSE_POINTER ? 58 : 30;
const SEGMENT_START_THRESHOLD = COARSE_POINTER ? 72 : 40;
const SEGMENT_RESUME_THRESHOLD = 0.08;
const FREE_TRACE_RESUME_THRESHOLD = COARSE_POINTER ? 0.16 : 0.06;

const A_GUIDE_PATH =
  'M 289.8 180.0 A 30 30 0 0 1 289.8 240.0 A 30 30 0 0 1 289.8 180.0 C 379.8 180.0 379.8 240.0 379.8 240.0 L 340.2 240.0 C 276.2 240.0 217.2 270.9 217.2 330.0 C 217.2 389.2 267.9 420.0 340.2 420.0 L 422.8 420.0 C 393.5 428.2 379.8 480.0 379.8 540.0 L 379.8 240.0 C 379.8 200.5 395.4 180.0 422.8 180.0 C 404.0 196.6 448.9 234.4 379.8 240.0';

const START_MARKER = { x: 289.8, y: 180.0 };
const END_MARKER = { x: 379.8, y: 240.0 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

//Caterpillar tracer
const CaterpillarTracer = ({ progress, pathRef, isActive }) => {
  const [headPos, setHeadPos] = useState(START_MARKER);
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
        newBody.push({
          x: pt.x + wiggle,
          y: pt.y + Math.cos(i) * 2,
          size: 19.5 - i * 0.85 + breath,
          index: i,
        });
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
          <ellipse
            cx={pt.x}
            cy={pt.y}
            rx={pt.size}
            ry={pt.size * 0.78}
            fill={`hsl(${(colorHue + i * 5) % 360}, 70%, ${48 + i * 1.2}%)`}
            stroke={`hsl(${(colorHue + 30) % 360}, 80%, 28%)`}
            strokeWidth='2.5'
            opacity={0.95 - i * 0.025}
          />
          <ellipse cx={pt.x - 3} cy={pt.y - 4} rx={pt.size * 0.65} ry={pt.size * 0.45} fill='rgba(255,255,255,0.4)' />
          <circle
            cx={pt.x + (i % 2 ? 7 : -6)}
            cy={pt.y + (i % 3 - 1) * 4}
            r={pt.size * 0.55}
            fill={`hsl(${(colorHue + i * 8 + 20) % 360}, 75%, 35%)`}
            opacity='0.68'
          />
          <g opacity='0.75'>
            <line
              x1={pt.x - 8}
              y1={pt.y + 6}
              x2={pt.x - 14}
              y2={pt.y + 12 + Math.sin(legAngle * (pt.index % 3) / 10) * 4}
              stroke={`hsl(${(colorHue + 30) % 360}, 80%, 28%)`}
              strokeWidth='2.5'
              strokeLinecap='round'
            />
            <line
              x1={pt.x + 8}
              y1={pt.y + 6}
              x2={pt.x + 14}
              y2={pt.y + 12 + Math.cos(legAngle * (pt.index % 3) / 10) * 4}
              stroke={`hsl(${(colorHue + 30) % 360}, 80%, 28%)`}
              strokeWidth='2.5'
              strokeLinecap='round'
            />
          </g>
        </g>
      ))}

      <ellipse cx={headPos.x} cy={headPos.y} rx='24' ry='21' fill={`hsl(${colorHue % 360}, 72%, 42%)`} stroke='#fff' strokeWidth='4' />
      <ellipse cx={headPos.x - 6} cy={headPos.y - 7} rx='14' ry='11' fill='rgba(255,255,255,0.45)' />
      <ellipse cx={headPos.x - 8} cy={headPos.y - 4} rx='7' ry='8' fill='#fff' />
      <ellipse cx={headPos.x + 8} cy={headPos.y - 4} rx='7' ry='8' fill='#fff' />
      <circle cx={headPos.x - 8} cy={headPos.y - 3} r='3.5' fill='#0d1b6e' />
      <circle cx={headPos.x + 8} cy={headPos.y - 3} r='3.5' fill='#0d1b6e' />
      <circle cx={headPos.x - 9.5} cy={headPos.y - 6} r='1.5' fill='#ffffff' />
      <circle cx={headPos.x + 6.5} cy={headPos.y - 6} r='1.5' fill='#ffffff' />
      <path
        d={`M ${headPos.x - 11} ${headPos.y - 13} Q ${headPos.x - 22} ${headPos.y - 28} ${headPos.x - 13} ${headPos.y - 32}`}
        fill='none'
        stroke={`hsl(${(colorHue + 30) % 360}, 80%, 28%)`}
        strokeWidth='3.5'
        strokeLinecap='round'
      />
      <path
        d={`M ${headPos.x + 11} ${headPos.y - 13} Q ${headPos.x + 21} ${headPos.y - 27} ${headPos.x + 14} ${headPos.y - 31}`}
        fill='none'
        stroke={`hsl(${(colorHue + 30) % 360}, 80%, 28%)`}
        strokeWidth='3.5'
        strokeLinecap='round'
      />
      <circle cx={headPos.x - 13} cy={headPos.y - 32} r='3' fill={`hsl(${(colorHue + 60) % 360}, 80%, 60%)`} />
      <circle cx={headPos.x + 14} cy={headPos.y - 31} r='3' fill={`hsl(${(colorHue + 60) % 360}, 80%, 60%)`} />
    </g>
  );
};

const DysgraphiaLetterA = () => {
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
  const [audioPhase, setAudioPhase] = useState('first');
  const [isGuideAudioPlaying, setIsGuideAudioPlaying] = useState(false);
  const [eraseCount, setEraseCount] = useState(0);

    // status board 
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
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
  const { totalStars, rewardPulse, awardStars, awardPracticeStars } = useDysgraphiaRewards();
  const wentOffPathRef = useRef(false);

  // Timer refs for tracking time spent drawing on the free-draw canvas
  const drawTimerIntervalRef = useRef(null);
  const drawTimerStartRef = useRef(null);
  const hasStartedTimerRef = useRef(false);

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

   // animation sound
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

  // Plays buttonSound.mp3 — used on every button click
  const playButtonSound = () => {
    const audio = buttonSoundAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
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

   // Stop the draw timer if the component unmounts mid-count
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

  // ── Guided animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !showGuide) return;
    let frameId;
    const start = performance.now() - progressRef.current * ANIMATION_DURATION_MS;
    startCaterpillarSound();
    const animate = (now) => {
      const elapsed = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;
      if (nextProgress >= 1) {
        progressRef.current = 1; setProgress(1);
        setIsPlaying(false); setAnimationComplete(true);
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
      progressRef.current = nextProgress; setProgress(nextProgress);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frameId); stopCaterpillarSound(); };
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
    setAnimationComplete(false); setFinalSegmentPending(false); stopCaterpillarSound();
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('අ'); u.lang = 'si-LK';
    window.speechSynthesis.speak(u);
  };

  // ── Coordinate conversion ────────────────────────────────────────────────
  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current; if (!svg) return null;
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const point = svg.createSVGPoint();
      point.x = clientX; point.y = clientY;
      const transformed = point.matrixTransform(matrix.inverse());
      return { x: transformed.x, y: transformed.y };
    }
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
      void awardPracticeStars(getGuidedDrawingStars(easyMode, attemptCountRef.current), {
        task: 'guided',
        attemptNumber: attemptCountRef.current + 1,
        additionalNodesDisplayed: easyMode,
      });
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
    if (seg > activeSegment) seg = activeSegment;
    if (seg !== activeSegment) return;
    if (segmentProgress[activeSegment] === 0) {
      const sn = drawNodes[activeSegment];
      if (sn && Math.hypot(point.x - sn.point.x, point.y - sn.point.y) > SEGMENT_START_THRESHOLD) return;
    }
    if (distance > DRAW_DISTANCE_THRESHOLD) { resetCurrentSegment(); return; }
    const segStart = getSegmentStartT(activeSegment);
    const segEnd = getSegmentEndT(activeSegment);
    let segT = Math.min(1, Math.max(0, (t - segStart) / (segEnd - segStart)));
    if (segT > segmentProgress[activeSegment] + SEGMENT_RESUME_THRESHOLD) return;
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
        void awardPracticeStars(getFreeTraceStars(attemptCountRef.current), {
          task: 'free-trace',
          breakCount: attemptCountRef.current,
        });
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
      if (freeTraceIsDrawing && freeTraceProgress > 0 && freeTraceProgress < 0.99) {
        attemptCountRef.current += 1;
      }
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
    stopCaterpillarSound(); setShowGuide(false); setDrawingMode(true);
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
    playButtonSound();
    resetSessionStats();
    if (secondAudioDelayRef.current) {
      clearTimeout(secondAudioDelayRef.current);
      secondAudioDelayRef.current = null;
    }

    setBlindMode(false); setDrawingWithCanvas(false); setEasyMode(false);
    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);
    if (drawingMode) {
      setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
      setSegmentProgress([0, 0]); setActiveSegment(0); stopCaterpillarSound();
    }

    const guidanceAudio = guideAudioRef.current;
    if (guidanceAudio) {
      guidanceAudio.pause();
      setIsGuideAudioPlaying(false);
    }

    setPracticeBlind(false); setThirdPreviewVisible(false);
    if (isPlaying) { setIsPlaying(false); stopCaterpillarSound(); }
    const svg = svgRef.current;
    if (svg) {
      const rect = e.currentTarget.getBoundingClientRect();
      const point = clientToViewBox(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (point) setOriginPoint(point);
    }
    setShowGuide(true); setNodesDeployed(false);
    progressRef.current = 0; setProgress(0); setMarkerPosition(START_MARKER);
    setTimeout(() => {
      setNodesDeployed(true);
      setTimeout(() => setIsPlaying(true), 800);
    }, 50);
    setAnimatePop(true); setTimeout(() => setAnimatePop(false), 500);
  };

  const handleThirdStarClick = () => {
    if (!thirdUnlocked) return;
    playButtonSound();
    setFreeTraceMode(false);
    setFreeTraceProgress(0);
    setFreeTraceIsDrawing(false);
    setFreeTracePointerPos({ x: -100, y: -100 });
    setFreeTraceComplete(false);
    if (isPlaying) setIsPlaying(false); stopCaterpillarSound(); setShowGuide(false);
    setDrawingMode(false); setDrawSuccess(false); setShowSuccessMessage(false);
    setSegmentProgress([0, 0]); setActiveSegment(0); setPointerPos({ x: -100, y: -100 });
    setEasyMode(false); attemptCountRef.current = 0;
    setPracticeBlind(false); setThirdPreviewVisible(true);
    resetSessionStats();
    setTimeout(() => {
      setThirdPreviewVisible(false); setPracticeBlind(true);
      setDrawingWithCanvas(true); setBlindMode(true);
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

  const submitCanvasForEvaluation = async () => {
     playButtonSound();
    if (!canvasRef.current) return;
    setEvalLoading(true); setEvalError(null); setEvalResult(null);
    try {
      // attempt
      const nextAttemptNumber = attemptCount + 1;
      setAttemptCount(nextAttemptNumber);

      const dataUrl = await canvasRef.current.exportImage('png');
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const response = await dysgraphiaService.recordLetterActivity({
        letterId: 'a',
        targetChar: 'අ',
        mode: 'independent',
        durationSeconds: elapsedSeconds,
        timerSeconds: elapsedSeconds,
        attemptNumber: nextAttemptNumber,
        wrongAttempts: wrongCount,
        eraseCount,
        strokeCount: (await canvasRef.current.exportPaths()).length,
        image: blob,
      });
      setEvalResult({ ...response, prediction: { sinhala: response?.predicted ?? null, confidence: response?.confidence ?? null } });
      if (response?.isCorrect) {
        stopDrawTimer();
        window.dispatchEvent(new Event('dysgraphia:fourth-task-complete'));
        awardStars(response.starsEarned || 1);
      } else {
        //Wrong letter  keep the timer running
        setWrongCount(prev => prev + 1);
      }
      setFeedback(response?.isCorrect ? 'correct' : 'wrong');
    } catch (err) { setEvalError(err?.response?.data?.error?.message || err.message || 'Evaluation failed'); }
    finally { setEvalLoading(false); }
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <main className='dg-shell dg-theme-a'>

      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
      
      {/* Status panel  */}
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
          <img src={Topic} alt="අ අක්ෂරය" className="dg-topic-image" onClick={handleAudio} />
        </header>

        <div className={`dg-canvas-wrap${drawingWithCanvas ? ' no-board' : ''}`}>
          {!drawingWithCanvas ? (
            <div className="dg-letter-container">
              <svg
                ref={svgRef}
                className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${drawingMode ? 'drawing-active' : ''}`}
                viewBox="0 40 640 560"
                preserveAspectRatio="xMidYMid meet" //add new
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

                  <linearGradient id='goldGlitterGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='640' y2='0' spreadMethod='reflect'>
                    <animate attributeName='gradientTransform' type='translate' from='0 0' to='640 0' dur='2.6s' repeatCount='indefinite' />
                    <stop offset='0%' stopColor='#d4af37'>
                      <animate attributeName='stop-color' values='#d4af37;#f3e5ab;#ffffff;#ffd700;#d4af37' dur='1.8s' repeatCount='indefinite' />
                    </stop>
                    <stop offset='35%' stopColor='#f3e5ab'>
                      <animate attributeName='stop-color' values='#f3e5ab;#ffffff;#ffd700;#d4af37;#f3e5ab' dur='1.8s' repeatCount='indefinite' />
                    </stop>
                    <stop offset='70%' stopColor='#ffffff'>
                      <animate attributeName='stop-color' values='#ffffff;#ffd700;#d4af37;#f3e5ab;#ffffff' dur='1.8s' repeatCount='indefinite' />
                    </stop>
                    <stop offset='100%' stopColor='#fff8e7'>
                      <animate attributeName='stop-color' values='#fff8e7;#ffffff;#f3e5ab;#ffd700;#fff8e7' dur='1.8s' repeatCount='indefinite' />
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
                      <path d={A_GUIDE_PATH} className='dg-chain-path' style={{ stroke: '#201f1f', strokeOpacity: 0.9, filter: 'drop-shadow(0 0 8px #ffffff)' }} />
                    )}
                    <path d={A_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />


                    {/* ── Rainbow progress fill (drawing) ── */}
                    <path
                      d={A_GUIDE_PATH}
                      className='dg-progress-path'
                      pathLength='1'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      style={{
                        stroke: (drawingMode || freeTraceMode) ? 'url(#goldGlitterGrad)' : '#201f1f',
                        strokeWidth: finalStrokeWidth,
                        strokeDashoffset: `${1 - displayedTraceProgress}`,
                        filter: (drawingMode || freeTraceMode) ? 'url(#glow)' : 'none',
                        transition: 'stroke-width 0.1s ease-out',
                      }}
                    />

                    {/* ── Third star preview flash ── */}
                    {thirdPreviewVisible && (
                      <path d={A_GUIDE_PATH} fill='none' stroke='#ffffff' strokeWidth='40'
                        strokeLinecap='round' strokeLinejoin='round'
                        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }}
                      />
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

                    {/* ── Guide nodes (star → star) during animation ── */}
                    {showGuide && !drawingMode && (
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

                    {showGuide && !drawingMode && (
                      <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                        {progress > 0 && (
                          <path
                            d={A_GUIDE_PATH}
                            pathLength='1'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            style={{
                              stroke: 'url(#rainbowGrad)',
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
            </div>
          ) : (

            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>

              <div
                className='dg-practice-canvas-shell'
                style={{ position: 'relative', margin: '16px auto', borderRadius: '16px', overflow: 'hidden' }}
                onPointerDown={startDrawTimer}
              >
                <ReactSketchCanvas ref={canvasRef} width='100%' height='100%' strokeWidth={8} strokeColor='black'
                  canvasColor='white'
                  style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px', position: 'absolute', top: 0, left: 0, cursor: PEN_CURSOR }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => { playButtonSound(); setEraseCount(count => count + 1); canvasRef.current?.clearCanvas(); }} style={{ color: '#ffffff' }}>🗑️මකන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : 'පරීක්ෂා කරන්න'}</button>
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
            onClick={() => { playButtonSound(); navigate('/dysgraphia?view=letters'); }}
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
            {practiceBlind ? '✍️ දැන් "අ" අක්ෂරය ඔබම අඳින්න.' : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න '}
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

export default DysgraphiaLetterA;
