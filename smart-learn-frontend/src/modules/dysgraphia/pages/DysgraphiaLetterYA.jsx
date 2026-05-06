import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ya.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1500;
const DRAW_DISTANCE_THRESHOLD = 10;
const SEGMENT_START_THRESHOLD = 14;

const YA_FONT_PATH =
  'M117.2 132.14Q105.14 132.14 98.12 127.46Q91.1 122.78 86.42 116.3Q81.02 123.68 74.54 127.91Q68.06 132.14 56 132.14Q45.92 132.14 37.73 127.55Q29.54 122.96 24.77 113.51Q20 104.06 20 89.48Q20 76.88 25.67 66.26Q31.34 55.64 42.59 49.16Q53.84 42.68 70.58 42.68Q75.8 42.68 79.22 43.22L78.14 55.28Q76.88 55.1 75.35 55.01Q73.82 54.92 71.3 54.92Q53.66 54.92 43.4 64.37Q33.14 73.82 33.14 90.56Q33.14 104.24 39.35 111.8Q45.56 119.36 57.26 119.36Q70.04 119.36 75.17 112.07Q80.3 104.78 80.3 92.72V91.64H92.36V92.72Q92.36 100.46 94.52 106.49Q96.68 112.52 101.9 115.94Q107.12 119.36 116.48 119.36Q127.64 119.36 133.76 112.34Q139.88 105.32 139.88 90.92Q139.88 82.64 137.63 76.79Q135.38 70.94 130.16 67.34Q120.08 60.14 96.32 60.14H88.76V52.76Q88.76 36.74 96.68 28.37Q104.6 20 119.18 20Q131.24 20 138.17 25.31Q145.1 30.62 145.1 40.88Q145.1 43.22 144.74 45.47Q144.38 47.72 143.84 49.88L131.24 47.72Q131.96 45.2 131.96 42.5Q131.96 31.88 118.28 31.88Q111.26 31.88 106.58 35.93Q101.9 39.98 101.54 48.26Q111.44 48.26 120.71 50.15Q129.98 52.04 137.27 56.81Q144.56 61.58 148.79 69.95Q153.02 78.32 153.02 91.1Q153.02 104.96 148.25 114.05Q143.48 123.14 135.38 127.64Q127.28 132.14 117.2 132.14Z';

const YA_TRACE_PATH =
  'M75 50 C48 50 27 65 27 91 C27 115 43 126 58 126 C75 126 86 112 86 93 C86 113 98 126 117 126 C136 126 146 113 146 91 C146 65 126 55 96 55 C94 38 103 26 119 26 C132 26 139 33 139 43';

const START_MARKER = { x: 75, y: 50 };
const END_MARKER   = { x: 139, y: 43 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

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
  const [originPoint, setOriginPoint] = useState({ x: -100, y: 80 });
  const [bubbles, setBubbles] = useState([]);
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

  // Easy mode (more guiding nodes after 5 failed attempts)
  const [easyMode, setEasyMode] = useState(false);

  const audioCtxRef = useRef(null);
  const trainOscRef = useRef(null);
  const trainGainRef = useRef(null);
  const lastDrawTickOverallRef = useRef(0);
  const lastDrawTickAtMsRef = useRef(0);
  const attemptCountRef = useRef(0);

  const canvasRef = useRef(null);
  const EVAL_ENDPOINT = '/myscript/evaluate';

  // Overall progress for the rainbow trail
  const overallProgress = (() => {
    const segCount = segmentProgress.length;
    if (segCount === 0) return 0;
    const total = segmentProgress.reduce((sum, val) => sum + val, 0);
    return total / segCount;
  })();

  // ---------- Audio helpers ----------
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
    if (trainGainRef.current && trainOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      trainGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      setTimeout(() => {
        try {
          trainOscRef.current?.osc.stop();
          trainOscRef.current?.lfo.stop();
        } catch {}
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
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
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

  // ---------- Guided animation ----------
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
          let burstBubbles = [];
          for (let i = 0; i < 80; i++) {
            const t = Math.random();
            const pt = pathElement.getPointAtLength(t * pathLength);
            burstBubbles.push({
              id: Date.now() + Math.random(),
              x: pt.x,
              y: pt.y,
              size: Math.random() * 3 + 1.5,
              isFloating: true,
              colorIndex: Math.floor(Math.random() * 3),
              idleDuration: 2,
            });
          }
          setBubbles((prev) => [...prev, ...burstBubbles]);
          for (let i = 0; i < 6; i++) {
            setTimeout(() => playBubbleSound(), i * 80);
          }
        }
        return;
      }
      if (Math.random() < 0.8) {
        const pathElement = letterPathRef.current;
        if (pathElement) {
          const pathLength = pathElement.getTotalLength();
          const pt = pathElement.getPointAtLength(nextProgress * pathLength);
          const newBubbles = [];
          for (let i = 0; i < 2; i++) {
            newBubbles.push({
              id: Date.now() + Math.random(),
              x: pt.x + (Math.random() * 5 - 2.5),
              y: pt.y + (Math.random() * 5 - 2.5),
              size: Math.random() * 2.5 + 1,
              isFloating: Math.random() < 0.1,
              colorIndex: Math.floor(Math.random() * 3),
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
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const pathElement = letterPathRef.current;
    if (!pathElement) return;
    const pathLength = pathElement.getTotalLength();
    const point = pathElement.getPointAtLength(progress * pathLength);
    setMarkerPosition({ x: point.x, y: point.y });
    setBubbles((prev) => {
      const now = Date.now();
      return prev.filter((b) => !b.isFloating || now - b.id < 3000);
    });
  }, [progress]);

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('ය');
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

  // ---------- Drawing logic ----------
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
    const newProgress = [...segmentProgress];
    newProgress[activeSegment] = 1;
    setSegmentProgress(newProgress);
    playCheckpointSound();

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
      resetCurrentSegment();
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

  const handlePointerMove = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    const point = clientToViewBox(e.clientX, e.clientY);
    if (!point) return;
    setPointerPos(point);
    if (isDrawing) updateDrawProgress(point);
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
    playDrawTickSound(0.35);
    updateDrawProgress(point);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();
    setIsDrawing(false);
    resetCurrentSegment();
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
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

    let nodes;
    if (forceEasy || easyMode) {
      nodes = [
        { t: 0, point: path.getPointAtLength(0), completed: false },
        { t: 0.25, point: path.getPointAtLength(totalLen * 0.25), completed: false },
        { t: 0.5, point: path.getPointAtLength(totalLen * 0.5), completed: false },
        { t: 0.75, point: path.getPointAtLength(totalLen * 0.75), completed: false },
        { t: 1, point: path.getPointAtLength(totalLen), completed: false },
      ];
      setSegmentProgress([0, 0, 0, 0]);
    } else {
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
    if (!canvasRef.current) return;
    setEvalLoading(true);
    setEvalError(null);
    setEvalResult(null);
    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const payload = { image: dataUrl, letter: 'ya' };
      const res = await fetch(EVAL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json();
      setEvalResult(json);
    } catch (err) {
      setEvalError(err.message || 'Evaluation failed');
    } finally {
      setEvalLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <main className='dg-shell dg-theme-ya'>
      <button type='button' className='dg-home-btn' onClick={() => navigate('/dysgraphia')}>
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>‘ය’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${drawingMode ? 'drawing-active' : ''}`}
              viewBox='0 0 174 153'
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none', cursor: drawingMode && !drawSuccess ? 'none' : 'default' }}
              draggable={false}
            >
              <defs>
                <linearGradient id='rainbowGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='174' y2='0' spreadMethod='reflect'>
                  <animate attributeName='gradientTransform' type='translate' from='0 0' to='174 0' dur='2.8s' repeatCount='indefinite' />
                  <stop offset='0%' stopColor='#ff0000' />
                  <stop offset='20%' stopColor='#ffff00' />
                  <stop offset='40%' stopColor='#00ff00' />
                  <stop offset='60%' stopColor='#00ffff' />
                  <stop offset='80%' stopColor='#0000ff' />
                  <stop offset='100%' stopColor='#ff00ff' />
                </linearGradient>

                <linearGradient id='yaFillGrad' x1='0' y1='0' x2='174' y2='0'>
                  <stop offset='0%' stopColor='#003B73' />
                  <stop offset='100%' stopColor='#009B4D' />
                </linearGradient>

                <filter id='glow' x='-40%' y='-40%' width='180%' height='180%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='1.5' result='blur' />
                  <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
                </filter>

                <filter id='nodeGlow' x='-50%' y='-50%' width='200%' height='200%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='1.2' result='blur' />
                  <feMerge><feMergeNode in='blur' /><feMergeNode in='SourceGraphic' /></feMerge>
                </filter>
              </defs>

              {!blindMode && (
                <>
                  <path d={YA_FONT_PATH} fill='rgba(255,255,255,0.18)' fillRule='nonzero' />
                  <path d={YA_TRACE_PATH} ref={letterPathRef} fill='none' stroke='none' />

                  {!practiceBlind && !thirdPreviewVisible && (
                    <path d={YA_TRACE_PATH} className='dg-chain-path' fill='none' stroke='rgba(255,255,255,0.35)' strokeWidth='5' strokeLinecap='round' strokeLinejoin='round' />
                  )}

                  <path
                    d={YA_TRACE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: drawingMode ? 'url(#rainbowGrad)' : '#009B4D',
                      strokeWidth: drawingMode ? 8 : 7,
                      strokeDasharray: 1,
                      strokeDashoffset: drawingMode ? `${1 - overallProgress}` : `${1 - progress}`,
                      filter: drawingMode ? 'url(#glow)' : 'none',
                    }}
                  />

                  {progress >= 1 && !drawingMode && (
                    <path d={YA_FONT_PATH} fill='url(#yaFillGrad)' fillRule='nonzero' opacity='0.95' />
                  )}

                  {thirdPreviewVisible && (
                    <path d={YA_FONT_PATH} fill='rgba(255,255,255,0.9)' fillRule='nonzero' style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
                  )}

                  {drawingMode && !drawSuccess && drawNodes.map((node, idx) => (
                    <g key={idx}>
                      <circle cx={node.point.x} cy={node.point.y} r='4.5' fill={node.completed ? '#4caf50' : 'none'} stroke={node.completed ? '#2e7d32' : '#ffca28'} strokeWidth='1.2' filter={node.completed ? 'url(#nodeGlow)' : 'none'} className='dg-draw-node' />
                      <circle cx={node.point.x} cy={node.point.y} r='1.8' fill={node.completed ? '#fff' : '#ffca28'} stroke='#000' strokeWidth='0.3' />
                      {node.completed && (
                        <text x={node.point.x} y={node.point.y + 0.2} textAnchor='middle' dominantBaseline='central' fontSize='3' fill='#000'>★</text>
                      )}
                    </g>
                  ))}

                  {showGuide && !drawingMode && (
                    <>
                      <circle cx={nodesDeployed ? START_MARKER.x : originPoint.x} cy={nodesDeployed ? START_MARKER.y : originPoint.y} r='16' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`} />
                      <text x={nodesDeployed ? START_MARKER.x : originPoint.x} y={nodesDeployed ? START_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                      <circle cx={nodesDeployed ? END_MARKER.x : originPoint.x} cy={nodesDeployed ? END_MARKER.y : originPoint.y} r='16' className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`} />
                      <text x={nodesDeployed ? END_MARKER.x : originPoint.x} y={nodesDeployed ? END_MARKER.y + 6 : originPoint.y + 6} textAnchor='middle'>⭐</text>
                    </>
                  )}

                  {bubbles.map((b) => (
                    <circle key={b.id} cx={b.x} cy={b.y} r={b.size} fill='rgba(255,255,255,0.4)' stroke='rgba(255,255,255,0.8)' strokeWidth='0.4' className={b.isFloating ? 'dg-bubble-anim' : 'dg-bubble-idle'} style={{ animationDuration: b.isFloating ? '3s' : `${b.idleDuration}s`, transformOrigin: `${b.x}px ${b.y}px` }} />
                  ))}

                  {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                    <image href={fingerPointer} x={pointerPos.x - 7} y={pointerPos.y - 7} width='14' height='14' className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false' />
                  )}

                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      <circle cx={markerPosition.x} cy={markerPosition.y} r='16' className='dg-node dg-node-active' />
                      <text x={markerPosition.x} y={markerPosition.y + 6} textAnchor='middle' className='dg-node-icon' style={{ fontSize: '10px' }}>🚂</text>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              <h3>✍️ දැන් “ය” අක්ෂරය ඔබම අඳින්න</h3>
              <div className='dg-practice-canvas-shell' style={{ position: 'relative', width: 600, height: 600, margin: '16px auto' }}>
                <svg viewBox='0 0 174 153' style={{ position: 'absolute', width: '600px', height: '600px', opacity: 0.18, pointerEvents: 'none' }}>
                  <path d={YA_FONT_PATH} fill='#ffffff' fillRule='nonzero' />
                </svg>
                <ReactSketchCanvas
                  ref={canvasRef}
                  width='600px'
                  height='600px'
                  strokeWidth={8}
                  strokeColor='black'
                  canvasColor='transparent'
                  style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px', position: 'absolute', top: 0, left: 0, cursor: PEN_CURSOR }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => canvasRef.current?.clearCanvas()} style={{ color: '#ffffff' }}>🧹 පැහැය මකා දමන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : '✅ පරීක්ෂා කරන්න'}</button>
              </div>
              {evalResult && (<div className='dg-eval-result' style={{ textAlign: 'center', marginTop: 8, color: '#ffffff' }}><strong>Result:</strong> {JSON.stringify(evalResult)}</div>)}
              {evalError && (<div className='dg-eval-error' style={{ textAlign: 'center', marginTop: 8, color: '#ff8080' }}>{evalError}</div>)}
            </div>
          )}
        </div>

        {/* Star buttons */}
        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={handleFirstStarClick}>⭐</button>
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
              ? '✍️ දැන් “ය” අක්ෂරය ඔබම අඳින්න.'
              : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න'}
          </div>
        )}
        {showSuccessMessage && (
          <div className='dg-draw-success'>🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා! 🎉</div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterYA;