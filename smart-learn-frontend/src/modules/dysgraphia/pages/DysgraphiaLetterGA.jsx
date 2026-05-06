// ===============================
// DysgraphiaLetterGA.jsx
// ===============================

import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;

/* ✅ Sinhala “ග” correct stroke order */
const GA_GUIDE_PATH =
  'M 320 220 C 240 220 180 300 230 390 C 280 470 420 450 450 340 C 470 250 410 190 330 210 C 270 225 250 280 280 320 C 320 370 400 360 420 300 C 440 240 390 200 330 210 M 420 300 C 500 320 520 390 470 450 C 430 500 340 500 300 450';

const START_MARKER = { x: 320, y: 220 };
const END_MARKER = { x: 300, y: 450 };

// Pen cursor
const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

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

  const audioCtxRef = useRef(null);
  const trainOscRef = useRef(null);
  const trainGainRef = useRef(null);

  const canvasRef = useRef(null);

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

  // ================= AUDIO =================

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const startTrainSound = () => {
    initAudio();

    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 120;

    gain.gain.value = 0.05;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    trainOscRef.current = osc;
    trainGainRef.current = gain;
  };

  const stopTrainSound = () => {
    if (trainOscRef.current) {
      trainOscRef.current.stop();
      trainOscRef.current = null;
    }
  };

  const playCheckpointSound = () => {
    initAudio();

    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 800;

    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playSuccessSound = () => {
    initAudio();

    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 1200;

    gain.gain.value = 0.2;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // ================= ANIMATION =================

  useEffect(() => {
    if (!isPlaying || !showGuide) return;

    let frameId;

    const start = performance.now();

    startTrainSound();

    const animate = (now) => {
      const elapsed = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;

      if (nextProgress >= 1) {
        setProgress(1);
        setIsPlaying(false);
        setAnimationComplete(true);
        stopTrainSound();
        return;
      }

      progressRef.current = nextProgress;
      setProgress(nextProgress);

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      stopTrainSound();
    };
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const pathElement = letterPathRef.current;

    if (!pathElement) return;

    const pathLength = pathElement.getTotalLength();

    const point = pathElement.getPointAtLength(progress * pathLength);

    setMarkerPosition({
      x: point.x,
      y: point.y,
    });
  }, [progress]);

  // ================= AUDIO LETTER =================

  const handleAudio = () => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance('ග');

    utterance.lang = 'si-LK';

    window.speechSynthesis.speak(utterance);
  };

  // ================= POINTER =================

  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current;

    if (!svg) return null;

    const rect = svg.getBoundingClientRect();

    const viewBox = svg.viewBox.baseVal;

    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX + viewBox.x,
      y: (clientY - rect.top) * scaleY + viewBox.y,
    };
  };

  const getClosestPointOnPath = (x, y) => {
    const path = letterPathRef.current;

    if (!path) return null;

    const totalLength = path.getTotalLength();

    let bestDist = Infinity;
    let bestT = 0;

    for (let i = 0; i <= 200; i++) {
      const t = i / 200;

      const pt = path.getPointAtLength(t * totalLength);

      const dx = pt.x - x;
      const dy = pt.y - y;

      const dist = Math.hypot(dx, dy);

      if (dist < bestDist) {
        bestDist = dist;
        bestT = t;
      }
    }

    return {
      t: bestT,
      distance: bestDist,
    };
  };

  // ================= DRAWING =================

  const activateDrawingMode = () => {
    setDrawingMode(true);

    const path = letterPathRef.current;

    const totalLen = path.getTotalLength();

    const nodes = [
      {
        t: 0,
        point: path.getPointAtLength(0),
        completed: false,
      },
      {
        t: 0.5,
        point: path.getPointAtLength(totalLen * 0.5),
        completed: false,
      },
      {
        t: 1,
        point: path.getPointAtLength(totalLen),
        completed: false,
      },
    ];

    setDrawNodes(nodes);
    setSegmentProgress([0, 0]);
    setActiveSegment(0);
    setDrawSuccess(false);
  };

  const handleSegmentComplete = () => {
    const newProgress = [...segmentProgress];

    newProgress[activeSegment] = 1;

    setSegmentProgress(newProgress);

    playCheckpointSound();

    const reachedNode = activeSegment + 1;

    setDrawNodes((prev) => {
      const updated = [...prev];

      if (updated[reachedNode]) {
        updated[reachedNode].completed = true;
      }

      return updated;
    });

    if (activeSegment === drawNodes.length - 2) {
      setDrawSuccess(true);
      setShowSuccessMessage(true);
      setThirdUnlocked(true);

      playSuccessSound();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2500);
    } else {
      setActiveSegment((prev) => prev + 1);
    }
  };

  const updateDrawProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);

    if (!closest) return;

    const { t, distance } = closest;

    if (distance > DRAW_DISTANCE_THRESHOLD) return;

    const seg = activeSegment;

    const segStart = seg / 2;
    const segEnd = (seg + 1) / 2;

    let segT = (t - segStart) / (segEnd - segStart);

    segT = Math.min(1, Math.max(0, segT));

    if (segT > segmentProgress[seg]) {
      const newProgress = [...segmentProgress];

      newProgress[seg] = segT;

      setSegmentProgress(newProgress);

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

    if (isDrawing) {
      updateDrawProgress(point);
    }
  };

  const handlePointerDown = (e) => {
    if (!drawingMode || drawSuccess) return;

    e.preventDefault();

    const point = clientToViewBox(e.clientX, e.clientY);

    if (!point) return;

    setPointerPos(point);
    setIsDrawing(true);

    updateDrawProgress(point);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (!drawingMode || drawSuccess) return;

    e.preventDefault();

    setIsDrawing(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // ================= STARS =================

  const handleFirstStarClick = () => {
    setBlindMode(false);
    setDrawingWithCanvas(false);

    setShowGuide(true);

    setProgress(0);

    progressRef.current = 0;

    setTimeout(() => {
      setIsPlaying(true);
    }, 500);
  };

  // ================= RENDER =================

  return (
    <main className='dg-shell dg-theme-ta'>
      <button
        type='button'
        className='dg-home-btn'
        onClick={() => navigate('/dysgraphia')}
      >
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>
            ‘ග’ අක්ෂරය හුරු කරමු
          </h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className={`dg-canvas ${animatePop ? 'dg-pop' : ''}`}
              viewBox='0 0 640 600'
              onPointerMove={handlePointerMove}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                touchAction: 'none',
                cursor:
                  drawingMode && !drawSuccess
                    ? 'none'
                    : 'default',
              }}
            >
              <defs>
                <linearGradient
                  id='rainbowGrad'
                  gradientUnits='userSpaceOnUse'
                  x1='0'
                  y1='0'
                  x2='640'
                  y2='0'
                >
                  <stop offset='0%' stopColor='#ff0000' />
                  <stop offset='20%' stopColor='#ffff00' />
                  <stop offset='40%' stopColor='#00ff00' />
                  <stop offset='60%' stopColor='#00ffff' />
                  <stop offset='80%' stopColor='#0000ff' />
                  <stop offset='100%' stopColor='#ff00ff' />
                </linearGradient>
              </defs>

              {!blindMode && (
                <>
                  <path
                    d={GA_GUIDE_PATH}
                    ref={letterPathRef}
                    style={{
                      stroke: 'none',
                      fill: 'none',
                    }}
                  />

                  <path
                    d={GA_GUIDE_PATH}
                    className='dg-progress-path'
                    pathLength='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{
                      stroke: drawingMode
                        ? 'url(#rainbowGrad)'
                        : 'rgba(255,255,255,0.35)',
                      strokeWidth: finalStrokeWidth,
                      strokeDashoffset: `${1 - overallProgress}`,
                    }}
                  />

                  {/* nodes */}
                  {drawingMode &&
                    !drawSuccess &&
                    drawNodes.map((node, idx) => (
                      <g key={idx}>
                        <circle
                          cx={node.point.x}
                          cy={node.point.y}
                          r='18'
                          fill={
                            node.completed
                              ? '#4caf50'
                              : 'none'
                          }
                          stroke={
                            node.completed
                              ? '#2e7d32'
                              : '#ffca28'
                          }
                          strokeWidth='2.5'
                        />

                        <circle
                          cx={node.point.x}
                          cy={node.point.y}
                          r='7'
                          fill='#ffca28'
                        />
                      </g>
                    ))}

                  {/* guide stars */}
                  {showGuide && !drawingMode && (
                    <>
                      <circle
                        cx={START_MARKER.x}
                        cy={START_MARKER.y}
                        r='22'
                        className='dg-node'
                      />

                      <text
                        x={START_MARKER.x}
                        y={START_MARKER.y + 6}
                        textAnchor='middle'
                      >
                        ⭐
                      </text>

                      <circle
                        cx={END_MARKER.x}
                        cy={END_MARKER.y}
                        r='22'
                        className='dg-node'
                      />

                      <text
                        x={END_MARKER.x}
                        y={END_MARKER.y + 6}
                        textAnchor='middle'
                      >
                        ⭐
                      </text>
                    </>
                  )}

                  {/* finger */}
                  {drawingMode &&
                    !drawSuccess &&
                    pointerPos.x > -50 && (
                      <image
                        href={fingerPointer}
                        x={pointerPos.x - 30}
                        y={pointerPos.y - 30}
                        width='60'
                        height='60'
                      />
                    )}

                  {/* train */}
                  {showGuide && !drawingMode && (
                    <g>
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
                        style={{ fontSize: '20px' }}
                      >
                        🚂
                      </text>
                    </g>
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap'>
              <h3>
                ✍️ දැන් “ග” අක්ෂරය ඔබම අඳින්න
              </h3>

              <ReactSketchCanvas
                ref={canvasRef}
                width='600px'
                height='600px'
                strokeWidth={8}
                strokeColor='black'
                canvasColor='transparent'
                style={{
                  border:
                    '2px dashed rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  cursor: PEN_CURSOR,
                }}
              />
            </div>
          )}
        </div>

        {/* buttons */}
        <div className='dg-floating-stars'>
          <button
            type='button'
            className='dg-star-btn active'
            onClick={handleFirstStarClick}
          >
            ⭐
          </button>

          <button
            type='button'
            className={`dg-star-btn ${
              animationComplete
                ? 'active'
                : 'inactive'
            }`}
            disabled={!animationComplete}
            onClick={activateDrawingMode}
          >
            ✏️
          </button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න
          </div>
        )}

        {showSuccessMessage && (
          <div className='dg-draw-success'>
            🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම
            නිවැරදිව ඇන්දා! 🎉
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterGA;