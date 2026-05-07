import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 10;

const LETTER_CHAR = 'ප';
const EVAL_LETTER = 'pa';

/* ✅ CORRECT DRAW ORDER FOR "ප"
   Stroke 1 — closed oval body (clockwise from top)
   Stroke 2 — descending tail with bottom hook */
const TRACE_PATH =
  'M82 30 C56 30 36 48 36 72 C36 98 58 118 84 118 C110 118 128 98 128 72 C128 48 108 30 84 30 M128 55 L128 120 C128 132 114 138 102 130';

const START_MARKER = { x: 82, y: 30 };
const END_MARKER = { x: 102, y: 130 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/></svg>") 0 24, auto`;

const DysgraphiaLetterPA = () => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);
  const [animationComplete, setAnimationComplete] = useState(false);

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [thirdUnlocked, setThirdUnlocked] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });

  const [segmentProgress, setSegmentProgress] = useState([0, 0]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [drawNodes, setDrawNodes] = useState([]);

  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [evalError, setEvalError] = useState(null);

  const audioCtxRef = useRef(null);

  const overallProgress =
    segmentProgress.reduce((sum, val) => sum + val, 0) / segmentProgress.length;

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (freq = 600, duration = 0.15) => {
    initAudio();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(LETTER_CHAR);
    utterance.lang = 'si-LK';
    window.speechSynthesis.speak(utterance);
  };

  const startAnimation = () => {
    setDrawingWithCanvas(false);
    setDrawingMode(false);
    setAnimationComplete(false);
    setThirdUnlocked(false);
    setDrawSuccess(false);
    setShowSuccessMessage(false);
    setProgress(0);
    progressRef.current = 0;
    setMarkerPosition(START_MARKER);
    setTimeout(() => setIsPlaying(true), 300);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let frameId;
    const start = performance.now() - progressRef.current * ANIMATION_DURATION_MS;

    const animate = (now) => {
      const nextProgress = (now - start) / ANIMATION_DURATION_MS;

      if (nextProgress >= 1) {
        progressRef.current = 1;
        setProgress(1);
        setIsPlaying(false);
        setAnimationComplete(true);
        playSound(900, 0.3);
        return;
      }

      const path = pathRef.current;
      if (path) {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(nextProgress * len);
        setMarkerPosition({ x: pt.x, y: pt.y });
      }

      progressRef.current = nextProgress;
      setProgress(nextProgress);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  const clientToViewBox = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;

    return {
      x: (clientX - rect.left) * (viewBox.width / rect.width) + viewBox.x,
      y: (clientY - rect.top) * (viewBox.height / rect.height) + viewBox.y,
    };
  };

  const getClosestPointOnPath = (x, y) => {
    const path = pathRef.current;
    if (!path) return null;

    const len = path.getTotalLength();
    let bestDist = Infinity;
    let bestT = 0;

    for (let i = 0; i <= 220; i++) {
      const t = i / 220;
      const pt = path.getPointAtLength(t * len);
      const dist = Math.hypot(pt.x - x, pt.y - y);

      if (dist < bestDist) {
        bestDist = dist;
        bestT = t;
      }
    }

    return { t: bestT, distance: bestDist };
  };

  const activateDrawingMode = () => {
    setDrawingWithCanvas(false);
    setDrawingMode(true);
    setDrawSuccess(false);
    setShowSuccessMessage(false);
    setPointerPos({ x: -100, y: -100 });

    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();

    setDrawNodes([
      { point: path.getPointAtLength(0), completed: false },
      { point: path.getPointAtLength(len * 0.5), completed: false },
      { point: path.getPointAtLength(len), completed: false },
    ]);

    setSegmentProgress([0, 0]);
    setActiveSegment(0);
  };

  const completeSegment = () => {
    const updatedProgress = [...segmentProgress];
    updatedProgress[activeSegment] = 1;
    setSegmentProgress(updatedProgress);

    setDrawNodes((prev) => {
      const updated = [...prev];
      if (updated[activeSegment + 1]) updated[activeSegment + 1].completed = true;
      return updated;
    });

    playSound(900, 0.18);

    if (activeSegment === 1) {
      setDrawSuccess(true);
      setThirdUnlocked(true);
      setShowSuccessMessage(true);
      playSound(1200, 0.4);
      setTimeout(() => setShowSuccessMessage(false), 2500);
    } else {
      setActiveSegment((prev) => prev + 1);
    }
  };

  const updateDrawProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);
    if (!closest) return;

    const { t, distance } = closest;
    if (distance > DRAW_DISTANCE_THRESHOLD) return;

    const seg = Math.min(Math.floor(t * 2), 1);
    if (seg !== activeSegment) return;

    const segStart = activeSegment / 2;
    const segEnd = (activeSegment + 1) / 2;
    const segT = Math.min(1, Math.max(0, (t - segStart) / (segEnd - segStart)));

    if (segT > segmentProgress[activeSegment]) {
      const updatedProgress = [...segmentProgress];
      updatedProgress[activeSegment] = segT;
      setSegmentProgress(updatedProgress);

      if (segT >= 0.99) completeSegment();
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

  const handlePointerMove = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();

    const point = clientToViewBox(e.clientX, e.clientY);
    if (!point) return;

    setPointerPos(point);
    if (isDrawing) updateDrawProgress(point);
  };

  const handlePointerUp = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();

    setIsDrawing(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const startBlindPractice = () => {
    if (!thirdUnlocked) return;
    setDrawingMode(false);
    setDrawingWithCanvas(true);
  };

  const submitCanvasForEvaluation = async () => {
    if (!canvasRef.current) return;

    setEvalLoading(true);
    setEvalError(null);
    setEvalResult(null);

    try {
      const dataUrl = await canvasRef.current.exportImage('png');
      const payload = { image: dataUrl, letter: EVAL_LETTER };

      const res = await fetch('/myscript/evaluate', {
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
          <h1 onClick={handleAudio}>‘{LETTER_CHAR}’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className='dg-canvas'
              viewBox='0 0 174 153'
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                touchAction: 'none',
                cursor: drawingMode && !drawSuccess ? 'none' : 'default',
              }}
            >
              <defs>
                <linearGradient id='rainbowGrad' x1='0' y1='0' x2='174' y2='0'>
                  <stop offset='0%' stopColor='#ff0000' />
                  <stop offset='20%' stopColor='#ffff00' />
                  <stop offset='40%' stopColor='#00ff00' />
                  <stop offset='60%' stopColor='#00ffff' />
                  <stop offset='80%' stopColor='#0000ff' />
                  <stop offset='100%' stopColor='#ff00ff' />
                </linearGradient>

                <linearGradient id='letterGrad' x1='0' y1='0' x2='174' y2='0'>
                  <stop offset='0%' stopColor='#003B73' />
                  <stop offset='100%' stopColor='#009B4D' />
                </linearGradient>
              </defs>

              <text
                x='87'
                y='118'
                textAnchor='middle'
                fontSize='118'
                fontFamily='"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
                fill='rgba(255,255,255,0.18)'
              >
                {LETTER_CHAR}
              </text>

              {progress >= 1 && !drawingMode && (
                <text
                  x='87'
                  y='118'
                  textAnchor='middle'
                  fontSize='118'
                  fontFamily='"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
                  fill='url(#letterGrad)'
                >
                  {LETTER_CHAR}
                </text>
              )}

              <path d={TRACE_PATH} ref={pathRef} fill='none' stroke='none' />

              <path
                d={TRACE_PATH}
                fill='none'
                stroke='rgba(255,255,255,0.35)'
                strokeWidth='5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />

              <path
                d={TRACE_PATH}
                pathLength='1'
                fill='none'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{
                  stroke: drawingMode ? 'url(#rainbowGrad)' : '#009B4D',
                  strokeWidth: drawingMode ? 8 : 7,
                  strokeDasharray: 1,
                  strokeDashoffset: drawingMode ? `${1 - overallProgress}` : `${1 - progress}`,
                }}
              />

              {drawNodes.map((node, index) => (
                drawingMode && !drawSuccess && (
                  <g key={index}>
                    <circle
                      cx={node.point.x}
                      cy={node.point.y}
                      r='4.5'
                      fill={node.completed ? '#4caf50' : 'none'}
                      stroke={node.completed ? '#2e7d32' : '#ffca28'}
                      strokeWidth='1.2'
                    />
                    <circle cx={node.point.x} cy={node.point.y} r='1.8' fill='#ffca28' />
                  </g>
                )
              ))}

              {!drawingMode && (
                <>
                  <circle cx={START_MARKER.x} cy={START_MARKER.y} r='5' className='dg-node' />
                  <text x={START_MARKER.x} y={START_MARKER.y + 1.5} textAnchor='middle' fontSize='4'>
                    ⭐
                  </text>

                  <circle cx={END_MARKER.x} cy={END_MARKER.y} r='5' className='dg-node' />
                  <text x={END_MARKER.x} y={END_MARKER.y + 1.5} textAnchor='middle' fontSize='4'>
                    ⭐
                  </text>

                  {isPlaying && (
                    <>
                      <circle
                        cx={markerPosition.x}
                        cy={markerPosition.y}
                        r='5'
                        className='dg-node dg-node-active'
                      />
                      <text
                        x={markerPosition.x}
                        y={markerPosition.y + 1.5}
                        textAnchor='middle'
                        fontSize='4'
                      >
                        🚂
                      </text>
                    </>
                  )}
                </>
              )}

              {drawingMode && !drawSuccess && pointerPos.x > -50 && (
                <image
                  href={fingerPointer}
                  x={pointerPos.x - 7}
                  y={pointerPos.y - 7}
                  width='14'
                  height='14'
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                />
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap' style={{ width: '100%', height: '100%' }}>
              <h3>✍️ දැන් “{LETTER_CHAR}” අක්ෂරය ඔබම අඳින්න</h3>

              <div
                className='dg-practice-canvas-shell'
                style={{ position: 'relative', width: 600, height: 600, margin: '16px auto' }}
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
                  <text
                    x='87'
                    y='118'
                    textAnchor='middle'
                    fontSize='118'
                    fontFamily='"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
                    fill='#ffffff'
                  >
                    {LETTER_CHAR}
                  </text>
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

              <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button
                  className='dg-practice-clear-btn dg-ctl-btn'
                  onClick={() => canvasRef.current?.clearCanvas()}
                  style={{ color: '#fff' }}
                >
                  🧹 පැහැය මකා දමන්න
                </button>

                <button
                  className='dg-ctl-btn'
                  onClick={submitCanvasForEvaluation}
                  disabled={evalLoading}
                  style={{ color: '#fff' }}
                >
                  {evalLoading ? '...පරීක්ෂා වෙමින්' : '✅ පරීක්ෂා කරන්න'}
                </button>
              </div>

              {evalResult && (
                <div style={{ color: '#fff', textAlign: 'center' }}>
                  {JSON.stringify(evalResult)}
                </div>
              )}

              {evalError && (
                <div style={{ color: '#ff8080', textAlign: 'center' }}>
                  {evalError}
                </div>
              )}
            </div>
          )}
        </div>

        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={startAnimation}>
            ⭐
          </button>

          <button
            type='button'
            className={`dg-star-btn ${animationComplete ? 'active' : 'inactive'}`}
            disabled={!animationComplete}
            onClick={activateDrawingMode}
          >
            ✏️
          </button>

          <button
            type='button'
            className={`dg-star-btn ${thirdUnlocked ? 'active' : 'inactive'}`}
            disabled={!thirdUnlocked}
            onClick={startBlindPractice}
          >
            ⭐
          </button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න
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

export default DysgraphiaLetterPA;