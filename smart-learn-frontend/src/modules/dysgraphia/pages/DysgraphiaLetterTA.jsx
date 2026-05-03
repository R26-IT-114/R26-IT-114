import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 15000;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;

const TA_GUIDE_PATH =
  'M 320 280 C 180 280 140 440 280 500 C 460 560 560 340 460 180 C 380 40 200 60 160 200';

const START_MARKER = { x: 320, y: 280 };
const END_MARKER = { x: 160, y: 200 };

// Pen cursor
const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

const DysgraphiaLetterTA = () => {
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

  const currentStrokeWidth = drawingMode
    ? Math.min(52, 28 + overallProgress * 18 + (isDrawing ? 6 : 0))
    : 28;
  const finalStrokeWidth = drawSuccess ? 36 : currentStrokeWidth;

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
        const pathElement = letterPathRef.current;
        if (pathElement) {
          const pathLength = pathElement.getTotalLength();
          let burstBubbles = [];
          for (let i = 0; i < 120; i++) {
            const t = Math.random();
            const pt = pathElement.getPointAtLength(t * pathLength);
            burstBubbles.push({
              id: Date.now() + Math.random(),
              x: pt.x,
              y: pt.y,
              size: Math.random() * 10 + 5,
              isFloating: true,
              colorIndex: Math.floor(Math.random() * 3),
              idleDuration: 2,
            });
          }
          setBubbles((prev) => [...prev, ...burstBubbles]);
          for (let i = 0; i < 8; i++) {
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
          const numBubbles = Math.floor(Math.random() * 3) + 1;
          const newBubbles = [];
          for (let i = 0; i < numBubbles; i++) {
            newBubbles.push({
              id: Date.now() + Math.random(),
              x: pt.x + (Math.random() * 24 - 12),
              y: pt.y + (Math.random() * 24 - 12),
              size: Math.random() * 8 + 3,
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

  const handleReset = () => {
    progressRef.current = 0;
    setProgress(0);
    setMarkerPosition(START_MARKER);
    setIsPlaying(false);
    setBubbles([]);
    stopTrainSound();
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('ට');
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

    // Handle crossing to the next segment early
    if (seg > activeSegment) {
      const currentProgress = segmentProgress[activeSegment];
      if (currentProgress >= 0.95) {
        // Force completion of current segment and jump to next
        handleSegmentComplete();
        // After completion, activeSegment has been incremented; now process the point again for the new segment.
        // We'll call updateDrawProgress recursively with the same point, but careful about infinite loop.
        // Better: just re-compute seg and continue.
        seg = getSegmentFromT(t); // now seg should be >= activeSegment (the new one)
        if (seg < activeSegment) return; // still behind? shouldn't happen
      } else {
        // Not yet near the end – stay in current segment
        seg = activeSegment;
      }
    }

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
    setBlindMode(false);
    setDrawingWithCanvas(false);
    setEasyMode(false);

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
      const payload = { image: dataUrl, letter: 'ta' };
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
    <main className='dg-shell dg-theme-ta'>
      <button type='button' className='dg-home-btn' onClick={() => navigate('/dysgraphia')}>
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>‘ට’ අක්ෂරය හුරු කරමු</h1>
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
              </defs>

              {!blindMode && (
                <>
                  {!practiceBlind && !thirdPreviewVisible && (
                    <path d={TA_GUIDE_PATH} className='dg-chain-path' style={{ stroke: 'rgba(255,255,255,0.25)' }} />
                  )}
                  <path d={TA_GUIDE_PATH} ref={letterPathRef} style={{ stroke: 'none', fill: 'none' }} />

                  <path
                    d={TA_GUIDE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: drawingMode ? 'url(#rainbowGrad)' : 'rgba(255,255,255,0.3)',
                      strokeWidth: finalStrokeWidth,
                      strokeDashoffset: `${1 - overallProgress}`,
                      filter: drawingMode ? 'url(#glow)' : 'none',
                      transition: 'stroke-width 0.1s ease-out'
                    }}
                  />

                  {thirdPreviewVisible && (
                    <path d={TA_GUIDE_PATH} fill='none' stroke='rgba(255,255,255,0.95)' strokeWidth='40' strokeLinecap='round' strokeLinejoin='round' style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35))' }} />
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

                  {bubbles.map((b) => {
                    let fillColor, strokeColor, shadowColor;
                    if (b.colorIndex === 1) { fillColor = 'rgba(100, 180, 255, 0.4)'; strokeColor = 'rgba(100, 180, 255, 0.8)'; shadowColor = 'rgba(100, 180, 255, 0.8)'; }
                    else if (b.colorIndex === 2) { fillColor = 'rgba(0, 220, 255, 0.4)'; strokeColor = 'rgba(0, 220, 255, 0.8)'; shadowColor = 'rgba(0, 220, 255, 0.8)'; }
                    else { fillColor = 'rgba(255, 255, 255, 0.4)'; strokeColor = 'rgba(255, 255, 255, 0.8)'; shadowColor = 'rgba(255, 255, 255, 0.8)'; }
                    return (
                      <circle key={b.id} cx={b.x} cy={b.y} r={b.size} fill={fillColor} stroke={strokeColor} strokeWidth='1.5' className={b.isFloating ? 'dg-bubble-anim' : 'dg-bubble-idle'} style={{ animationDuration: b.isFloating ? '3s' : `${b.idleDuration}s`, transformOrigin: `${b.x}px ${b.y}px`, filter: `drop-shadow(0 0 2px ${shadowColor})` }} />
                    );
                  })}

                  {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                    <image href={fingerPointer} x={pointerPos.x - 30} y={pointerPos.y - 30} width='60' height='60' className='dg-finger' style={{ pointerEvents: 'none', userSelect: 'none' }} draggable='false' />
                  )}

                  {showGuide && !drawingMode && (
                    <g style={{ opacity: nodesDeployed ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>
                      <circle cx={markerPosition.x} cy={markerPosition.y} r='22' className='dg-node dg-node-active' />
                      <text x={markerPosition.x} y={markerPosition.y + 6} textAnchor='middle' className='dg-node-icon' style={{ fontSize: '20px' }}>🚂</text>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              <h3>✍️ දැන් “ට” අක්ෂරය ඔබම අඳින්න</h3>
              <div className='dg-practice-canvas-shell' style={{ position: 'relative', width: 600, height: 600, margin: '16px auto' }}>
                <ReactSketchCanvas
                  ref={canvasRef}
                  width='600px'
                  height='600px'
                  strokeWidth={8}
                  strokeColor='black'
                  canvasColor='transparent'
                  style={{
                    border: '2px dashed rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: PEN_CURSOR,
                  }}
                />
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className='dg-practice-clear-btn dg-ctl-btn' onClick={() => canvasRef.current?.clearCanvas()} style={{ color: '#ffffff' }}>🧹 පැහැය මකා දමන්න</button>
                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation} disabled={evalLoading} style={{ color: '#ffffff' }}>{evalLoading ? '...පරීක්ෂා වෙමින්' : '✅ පරීක්ෂා කරන්න'}</button>
              </div>
              {evalResult && (
                <div className='dg-eval-result' style={{ textAlign: 'center', marginTop: 8, color: '#ffffff' }}>
                  <strong>Result:</strong> {JSON.stringify(evalResult)}
                </div>
              )}
              {evalError && (
                <div className='dg-eval-error' style={{ textAlign: 'center', marginTop: 8, color: '#ff8080' }}>
                  {evalError}
                </div>
              )}
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
              if (drawingMode && !drawSuccess) return;
              setBlindMode(false);
              setDrawingWithCanvas(false);
              setPracticeBlind(false);
              setThirdPreviewVisible(false);
              setEasyMode(false);
              attemptCountRef.current = 0;
              activateDrawingMode();
              playPopSound();
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
              ? '✍️ දැන් “ට” අක්ෂරය ඔබම අඳින්න.'
              : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න '}
          </div>
        )}
        {showSuccessMessage && (
          <div className='dg-draw-success'>🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා! 🎉</div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterTA;