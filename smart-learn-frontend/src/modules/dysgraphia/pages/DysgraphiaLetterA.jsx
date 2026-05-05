import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 10;
const SEGMENT_START_THRESHOLD = 14;

const A_FONT_PATH =
  'M60.262576687116564 111.83067484662578Q45.08588957055215 111.83067484662578 33.82576687116564 107.34294478527609Q22.56564417177914 102.8552147239264 16.28282208588957 93.96134969325155Q10 85.0674846625767 10 72.01226993865032Q10 61.07852760736197 14.814110429447853 53.734969325153386Q19.628220858895705 46.391411042944796 27.461349693251535 42.3116564417178Q32.19386503067484 39.863803680981604 37.497546012269936 38.395092024539885Q42.80122699386503 36.926380368098165 50.06319018404908 36.35521472392639Q57.32515337423313 35.78404907975461 67.60613496932515 35.78404907975461H78.53987730061351Q78.05030674846626 28.114110429447862 73.72576687116565 24.52392638036811Q69.40122699386504 20.933742331288357 62.71042944785276 20.933742331288357Q56.34601226993865 20.933742331288357 53.08220858895706 23.30000000000001Q49.81840490797546 25.666257668711665 49.81840490797546 29.74601226993866Q49.81840490797546 30.398773006134974 49.900000000000006 31.051533742331294Q49.98159509202454 31.704294478527615 49.98159509202454 32.19386503067486L38.39509202453988 33.66257668711657Q38.2319018404908 32.19386503067486 38.150306748466264 30.888343558282216Q38.06871165644172 29.582822085889575 38.06871165644172 28.603680981595105Q38.06871165644172 19.628220858895716 44.43312883435583 14.8957055214724Q50.79754601226994 10.163190184049085 61.89447852760736 10.163190184049085Q78.86625766871165 10.163190184049085 85.39386503067485 23.871165644171782Q89.80000000000001 16.36441717791412 97.30674846625766 10L106.28220858895705 17.18036809815952Q105.79263803680982 17.996319018404918 105.5478527607362 18.64907975460124Q105.30306748466259 19.30184049079756 105.30306748466259 20.607361963190186Q105.30306748466259 22.40245398773007 106.44539877300615 24.687116564417188Q107.5877300613497 26.971779141104307 110.68834355828221 31.8674846625767Q113.62576687116564 36.27361963190185 115.42085889570552 40.271779141104304Q117.2159509202454 44.269938650306756 117.2159509202454 48.676073619631914Q117.2159509202454 55.69325153374234 112.64662576687117 60.42576687116565Q108.07730061349693 65.15828220858896 96.49079754601226 65.15828220858896Q93.39018404907975 65.15828220858896 89.96319018404907 64.34233128834356V97.30674846625767Q92.90061349693252 96.49079754601227 95.75644171779142 95.18527607361963Q98.61226993865031 93.879754601227 101.71288343558282 92.24785276073621L105.9558282208589 103.18159509202455Q102.039263803681 104.97668711656442 98.04110429447853 106.3638036809816Q94.04294478527606 107.75092024539879 89.96319018404907 108.73006134969326V143H78.53987730061351V110.68834355828221Q73.80736196319017 111.34110429447854 69.15644171779141 111.58588957055215Q64.50552147239264 111.83067484662578 60.262576687116564 111.83067484662578ZM89.96319018404907 46.554601226993874V53.734969325153386Q91.59509202453987 54.06134969325154 92.98220858895705 54.22453987730062Q94.36932515337423 54.3877300613497 95.83803680981595 54.3877300613497Q101.2233128834356 54.3877300613497 103.34478527607362 52.592638036809824Q105.46625766871165 50.79754601226995 105.46625766871165 47.37055214723927Q105.46625766871165 44.269938650306756 104.24233128834355 41.74049079754602Q103.01840490797545 39.21104294478529 100.73374233128834 35.620858895705524Q98.93865030674846 33.009815950920256 97.87791411042944 30.888343558282216Q96.81717791411043 28.766871165644176 96.3276073619632 26.64539877300615Q92.24785276073621 31.541104294478544 91.10552147239264 36.27361963190185Q89.96319018404907 41.00613496932516 89.96319018404907 46.554601226993874ZM61.568098159509205 100.24417177914111Q65.97423312883436 100.24417177914111 70.21717791411044 100.08098159509203Q74.46012269938652 99.91779141104296 78.53987730061351 99.42822085889571V46.554601226993874H68.74846625766872Q57.32515337423313 46.554601226993874 50.55276073619632 47.207361963190195Q43.78036809815951 47.860122699386515 39.70061349693252 49.16564417177915Q35.620858895705524 50.47116564417179 32.19386503067484 52.592638036809824Q22.402453987730063 58.63067484662577 22.402453987730063 72.66503067484663Q22.402453987730063 79.84539877300614 26.155828220858897 86.12822085889572Q29.90920245398773 92.4110429447853 38.47668711656442 96.3276073619632Q47.0441717791411 100.24417177914111 61.568098159509205 100.24417177914111Z';

const A_TRACE_PATH =
  'M68 41 C35 41 16 53 16 73 C16 96 35 107 61 107 C70 107 78 106 84 105 L84 43 C82 25 73 15 62 15 C49 15 43 20 43 29 M84 105 L84 142 M88 55 C105 58 112 54 112 48 C112 42 107 36 101 28 C98 24 96 20 101 14';

const START_MARKER = { x: 68, y: 41 };
const END_MARKER = { x: 101, y: 14 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

const DysgraphiaLetterA = () => {
  const navigate = useNavigate();
  const letterPathRef = useRef(null);
  const progressRef = useRef(0);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const THIRD_PREVIEW_MS = 1200;
  const EVAL_ENDPOINT = '/myscript/evaluate';

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

  const audioCtxRef = useRef(null);
  const trainOscRef = useRef(null);
  const trainGainRef = useRef(null);
  const lastDrawTickOverallRef = useRef(0);
  const lastDrawTickAtMsRef = useRef(0);
  const attemptCountRef = useRef(0);

  const overallProgress = (() => {
    if (segmentProgress.length === 0) return 0;
    return segmentProgress.reduce((sum, val) => sum + val, 0) / segmentProgress.length;
  })();

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const playSimpleSound = (freq = 440, duration = 0.2) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const startTrainSound = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    trainOscRef.current = { osc };
    trainGainRef.current = gain;
  };

  const stopTrainSound = () => {
    if (trainGainRef.current && trainOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      trainGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      setTimeout(() => {
        try {
          trainOscRef.current?.osc.stop();
        } catch {}
        trainOscRef.current = null;
      }, 200);
    }
  };

  const playPopSound = () => playSimpleSound(700, 0.25);
  const playBubbleSound = () => playSimpleSound(900, 0.12);
  const playCheckpointSound = () => playSimpleSound(1046.5, 0.25);
  const playSuccessSound = () => playSimpleSound(880, 0.45);
  const playDrawTickSound = () => playSimpleSound(360, 0.08);

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

          for (let i = 0; i < 80; i++) {
            const pt = pathElement.getPointAtLength(Math.random() * pathLength);
            burstBubbles.push({
              id: Date.now() + Math.random(),
              x: pt.x,
              y: pt.y,
              size: Math.random() * 3 + 1.5,
              isFloating: true,
              idleDuration: 2,
            });
          }

          setBubbles((prev) => [...prev, ...burstBubbles]);
          for (let i = 0; i < 6; i++) setTimeout(() => playBubbleSound(), i * 80);
        }

        return;
      }

      const pathElement = letterPathRef.current;
      if (pathElement && Math.random() < 0.8) {
        const pathLength = pathElement.getTotalLength();
        const pt = pathElement.getPointAtLength(nextProgress * pathLength);

        setBubbles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: pt.x + (Math.random() * 5 - 2.5),
            y: pt.y + (Math.random() * 5 - 2.5),
            size: Math.random() * 2.5 + 1,
            isFloating: Math.random() < 0.1,
            idleDuration: 1.5 + Math.random() * 2,
          },
        ]);
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
    const utterance = new SpeechSynthesisUtterance('අ');
    utterance.lang = 'si-LK';
    window.speechSynthesis.speak(utterance);
  };

  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    const x = (clientX - rect.left) * (viewBox.width / rect.width) + viewBox.x;
    const y = (clientY - rect.top) * (viewBox.height / rect.height) + viewBox.y;

    return { x, y };
  };

  const getClosestPointOnPath = (x, y) => {
    const path = letterPathRef.current;
    if (!path) return null;

    const totalLength = path.getTotalLength();
    let bestDist = Infinity;
    let bestT = 0;

    for (let i = 0; i <= 220; i++) {
      const t = i / 220;
      const pt = path.getPointAtLength(t * totalLength);
      const dist = Math.hypot(pt.x - x, pt.y - y);

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
    return Math.min(Math.floor(t * segCount), segCount - 1);
  };

  const getSegmentStartT = (seg) => seg / (drawNodes.length - 1);
  const getSegmentEndT = (seg) => (seg + 1) / (drawNodes.length - 1);

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

  const resetCurrentSegment = () => {
    if (activeSegment >= drawNodes.length - 1) return;

    if (segmentProgress[activeSegment] > 0) {
      attemptCountRef.current += 1;

      if (attemptCountRef.current >= 5 && !easyMode && !drawSuccess) {
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
    setDrawNodes((prev) => {
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
      if (segmentProgress[activeSegment] >= 0.95) {
        handleSegmentComplete();
        seg = getSegmentFromT(t);
      } else {
        seg = activeSegment;
      }
    }

    if (seg !== activeSegment) return;

    if (segmentProgress[activeSegment] === 0) {
      const startNode = drawNodes[activeSegment];
      if (startNode) {
        const distToNode = Math.hypot(point.x - startNode.point.x, point.y - startNode.point.y);
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

      if (
        nowMs - lastDrawTickAtMsRef.current >= 70 &&
        overall - lastDrawTickOverallRef.current >= 0.02
      ) {
        lastDrawTickAtMsRef.current = nowMs;
        lastDrawTickOverallRef.current = overall;
        playDrawTickSound();
      }

      if (segT >= 0.99) handleSegmentComplete();
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
    playDrawTickSound();
    updateDrawProgress(point);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();

    setIsDrawing(false);
    resetCurrentSegment();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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
      const payload = { image: dataUrl, letter: 'a' };

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

  return (
    <main className='dg-shell dg-theme-ta'>
      <button type='button' className='dg-home-btn' onClick={() => navigate('/dysgraphia')}>
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>‘අ’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''} ${
                drawingMode ? 'drawing-active' : ''
              }`}
              viewBox='0 0 174 153'
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                touchAction: 'none',
                cursor: drawingMode && !drawSuccess ? 'none' : 'default',
              }}
              draggable={false}
            >
              <defs>
                <linearGradient id='rainbowGrad' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='174' y2='0'>
                  <stop offset='0%' stopColor='#ff0000' />
                  <stop offset='20%' stopColor='#ffff00' />
                  <stop offset='40%' stopColor='#00ff00' />
                  <stop offset='60%' stopColor='#00ffff' />
                  <stop offset='80%' stopColor='#0000ff' />
                  <stop offset='100%' stopColor='#ff00ff' />
                </linearGradient>

                <linearGradient id='aFillGrad' x1='0' y1='0' x2='174' y2='0'>
                  <stop offset='0%' stopColor='#003B73' />
                  <stop offset='100%' stopColor='#009B4D' />
                </linearGradient>

                <filter id='glow' x='-40%' y='-40%' width='180%' height='180%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='1.5' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>

                <filter id='nodeGlow' x='-50%' y='-50%' width='200%' height='200%'>
                  <feGaussianBlur in='SourceGraphic' stdDeviation='1.2' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
              </defs>

              {!blindMode && (
                <>
                  <path d={A_FONT_PATH} fill='rgba(255,255,255,0.18)' fillRule='nonzero' />

                  <path d={A_TRACE_PATH} ref={letterPathRef} fill='none' stroke='none' />

                  {!practiceBlind && !thirdPreviewVisible && (
                    <path
                      d={A_TRACE_PATH}
                      className='dg-chain-path'
                      fill='none'
                      stroke='rgba(255,255,255,0.35)'
                      strokeWidth='5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  )}

                  <path
                    d={A_TRACE_PATH}
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
                    <path d={A_FONT_PATH} fill='url(#aFillGrad)' fillRule='nonzero' opacity='0.95' />
                  )}

                  {thirdPreviewVisible && (
                    <path
                      d={A_FONT_PATH}
                      fill='rgba(255,255,255,0.9)'
                      fillRule='nonzero'
                      style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                    />
                  )}

                  {drawingMode &&
                    !drawSuccess &&
                    drawNodes.map((node, idx) => (
                      <g key={idx}>
                        <circle
                          cx={node.point.x}
                          cy={node.point.y}
                          r='4.5'
                          fill={node.completed ? '#4caf50' : 'none'}
                          stroke={node.completed ? '#2e7d32' : '#ffca28'}
                          strokeWidth='1.2'
                          filter={node.completed ? 'url(#nodeGlow)' : 'none'}
                        />
                        <circle
                          cx={node.point.x}
                          cy={node.point.y}
                          r='1.8'
                          fill={node.completed ? '#fff' : '#ffca28'}
                          stroke='#000'
                          strokeWidth='0.3'
                        />
                        {node.completed && (
                          <text
                            x={node.point.x}
                            y={node.point.y + 0.2}
                            textAnchor='middle'
                            dominantBaseline='central'
                            fontSize='3'
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
                        r='5'
                        className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}
                      />
                      <text
                        x={nodesDeployed ? START_MARKER.x : originPoint.x}
                        y={nodesDeployed ? START_MARKER.y + 1.5 : originPoint.y + 1.5}
                        textAnchor='middle'
                        fontSize='4'
                      >
                        ⭐
                      </text>

                      <circle
                        cx={nodesDeployed ? END_MARKER.x : originPoint.x}
                        cy={nodesDeployed ? END_MARKER.y : originPoint.y}
                        r='5'
                        className={`dg-node ${nodesDeployed ? 'dg-deployed' : ''}`}
                      />
                      <text
                        x={nodesDeployed ? END_MARKER.x : originPoint.x}
                        y={nodesDeployed ? END_MARKER.y + 1.5 : originPoint.y + 1.5}
                        textAnchor='middle'
                        fontSize='4'
                      >
                        ⭐
                      </text>
                    </>
                  )}

                  {bubbles.map((b) => (
                    <circle
                      key={b.id}
                      cx={b.x}
                      cy={b.y}
                      r={b.size}
                      fill='rgba(255,255,255,0.4)'
                      stroke='rgba(255,255,255,0.8)'
                      strokeWidth='0.4'
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
                      x={pointerPos.x - 7}
                      y={pointerPos.y - 7}
                      width='14'
                      height='14'
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
                        r='5'
                        className='dg-node dg-node-active'
                      />
                      <text
                        x={markerPosition.x}
                        y={markerPosition.y + 1.6}
                        textAnchor='middle'
                        className='dg-node-icon'
                        style={{ fontSize: '4px' }}
                      >
                        🚂
                      </text>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              <h3>✍️ දැන් “අ” අක්ෂරය ඔබම අඳින්න</h3>

              <div
                className='dg-practice-canvas-shell'
                style={{
                  position: 'relative',
                  width: 600,
                  height: 600,
                  margin: '16px auto',
                }}
              >
                <svg
                  viewBox='0 0 174 153'
                  style={{
                    position: 'absolute',
                    width: '600px',
                    height: '600px',
                    opacity: 0.18,
                    pointerEvents: 'none',
                  }}
                >
                  <path d={A_FONT_PATH} fill='#ffffff' fillRule='nonzero' />
                </svg>

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
                <button
                  className='dg-practice-clear-btn dg-ctl-btn'
                  onClick={() => canvasRef.current?.clearCanvas()}
                  style={{ color: '#ffffff' }}
                >
                  🧹 පැහැය මකා දමන්න
                </button>

                <button
                  className='dg-ctl-btn'
                  onClick={submitCanvasForEvaluation}
                  disabled={evalLoading}
                  style={{ color: '#ffffff' }}
                >
                  {evalLoading ? '...පරීක්ෂා වෙමින්' : '✅ පරීක්ෂා කරන්න'}
                </button>
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

        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={handleFirstStarClick}>
            ⭐
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
            ✏️
          </button>

          <button
            type='button'
            className={`dg-star-btn ${thirdUnlocked ? 'active' : 'inactive'}`}
            disabled={!thirdUnlocked}
            onClick={handleThirdStarClick}
          >
            ⭐
          </button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            {practiceBlind
              ? '✍️ දැන් “අ” අක්ෂරය ඔබම අඳින්න.'
              : '💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න'}
          </div>
        )}

        {showSuccessMessage && (
          <div className='dg-draw-success'>
            🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා! 🎉
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterA;