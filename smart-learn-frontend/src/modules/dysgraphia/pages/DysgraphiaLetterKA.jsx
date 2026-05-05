import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1200;
const DRAW_DISTANCE_THRESHOLD = 12;

const LETTER_CHAR = 'ක';
const EVAL_LETTER = 'ka';

/* ✅ CORRECT DRAW ORDER FOR “ක” */
const TRACE_PATH =
  'M62 35 C42 38 28 56 30 82 C32 112 58 126 84 116 C110 106 113 72 90 60 C72 50 54 62 54 84 C54 106 74 116 96 106 C120 94 126 62 104 45 C92 36 74 34 62 35 M104 45 C126 46 145 62 145 86 C145 110 128 124 108 116';

const START_MARKER = { x: 62, y: 35 };
const END_MARKER = { x: 108, y: 116 };

const DysgraphiaLetterKA = () => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);

  const [drawingMode, setDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });

  const [segmentProgress, setSegmentProgress] = useState([0, 0]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [drawNodes, setDrawNodes] = useState([]);

  const playSound = (freq = 700) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = freq;
      gain.gain.value = 0.2;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore audio errors
    }
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(LETTER_CHAR);
    utterance.lang = 'si-LK';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let frameId;
    const start = performance.now();

    const animate = (now) => {
      const t = (now - start) / ANIMATION_DURATION_MS;

      if (t >= 1) {
        setProgress(1);
        setIsPlaying(false);
        playSound(1000);
        return;
      }

      const path = pathRef.current;
      if (path) {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(t * len);
        setMarkerPosition({ x: pt.x, y: pt.y });
      }

      setProgress(t);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  const startAnimation = () => {
    setDrawingMode(false);
    setDrawSuccess(false);
    setShowSuccess(false);
    setProgress(0);
    setMarkerPosition(START_MARKER);
    setIsPlaying(true);
  };

  const clientToSVG = (x, y) => {
    const rect = svgRef.current.getBoundingClientRect();
    const vb = svgRef.current.viewBox.baseVal;

    return {
      x: (x - rect.left) * (vb.width / rect.width),
      y: (y - rect.top) * (vb.height / rect.height),
    };
  };

  const getClosestPoint = (x, y) => {
    const path = pathRef.current;
    const len = path.getTotalLength();

    let best = { dist: Infinity, t: 0 };

    for (let i = 0; i <= 220; i++) {
      const t = i / 220;
      const pt = path.getPointAtLength(t * len);
      const d = Math.hypot(pt.x - x, pt.y - y);

      if (d < best.dist) {
        best = { dist: d, t };
      }
    }

    return best;
  };

  const startDrawing = () => {
    setDrawingMode(true);
    setDrawSuccess(false);
    setShowSuccess(false);
    setProgress(0);

    const path = pathRef.current;
    const len = path.getTotalLength();

    setDrawNodes([
      { point: path.getPointAtLength(0), done: false },
      { point: path.getPointAtLength(len * 0.5), done: false },
      { point: path.getPointAtLength(len), done: false },
    ]);

    setSegmentProgress([0, 0]);
    setActiveSegment(0);
  };

  const completeSegment = () => {
    const updated = [...segmentProgress];
    updated[activeSegment] = 1;
    setSegmentProgress(updated);

    playSound(900);

    if (activeSegment === 1) {
      setDrawSuccess(true);
      setShowSuccess(true);
      playSound(1200);
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      setActiveSegment(1);
    }
  };

  const updateDraw = (pt) => {
    const { t, dist } = getClosestPoint(pt.x, pt.y);
    if (dist > DRAW_DISTANCE_THRESHOLD) return;

    const seg = Math.min(Math.floor(t * 2), 1);
    if (seg !== activeSegment) return;

    const segStart = activeSegment / 2;
    const segEnd = (activeSegment + 1) / 2;
    const segT = Math.min(1, Math.max(0, (t - segStart) / (segEnd - segStart)));

    if (segT > segmentProgress[seg]) {
      const updated = [...segmentProgress];
      updated[seg] = segT;
      setSegmentProgress(updated);

      setProgress((activeSegment + segT) / 2);

      if (segT > 0.95) {
        completeSegment();
      }
    }
  };

  const onDown = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();

    const pt = clientToSVG(e.clientX, e.clientY);
    setPointerPos(pt);
    setIsDrawing(true);
    updateDraw(pt);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();

    const pt = clientToSVG(e.clientX, e.clientY);
    setPointerPos(pt);

    if (isDrawing) updateDraw(pt);
  };

  const onUp = (e) => {
    if (!drawingMode || drawSuccess) return;
    e.preventDefault();

    setIsDrawing(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <main className='dg-shell'>
      <button className='dg-home-btn' onClick={() => navigate('/dysgraphia')}>
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>‘ක’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          <svg
            ref={svgRef}
            className='dg-canvas'
            viewBox='0 0 174 153'
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{
              touchAction: 'none',
              cursor: drawingMode && !drawSuccess ? 'none' : 'default',
            }}
          >
            <defs>
              <linearGradient id='letterGrad' x1='0' y1='0' x2='174' y2='0'>
                <stop offset='0%' stopColor='#003B73' />
                <stop offset='100%' stopColor='#009B4D' />
              </linearGradient>

              <linearGradient id='rainbowGrad' x1='0' y1='0' x2='174' y2='0'>
                <stop offset='0%' stopColor='#ff0000' />
                <stop offset='20%' stopColor='#ffff00' />
                <stop offset='40%' stopColor='#00ff00' />
                <stop offset='60%' stopColor='#00ffff' />
                <stop offset='80%' stopColor='#0000ff' />
                <stop offset='100%' stopColor='#ff00ff' />
              </linearGradient>
            </defs>

            {/* faint font letter */}
            <text
              x='87'
              y='120'
              textAnchor='middle'
              fontSize='120'
              fontFamily='"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
              fill='rgba(255,255,255,0.15)'
            >
              ක
            </text>

            {/* final filled letter after animation */}
            {progress >= 1 && !drawingMode && (
              <text
                x='87'
                y='120'
                textAnchor='middle'
                fontSize='120'
                fontFamily='"Noto Sans Sinhala", "Iskoola Pota", sans-serif'
                fill='url(#letterGrad)'
              >
                ක
              </text>
            )}

            {/* hidden path for calculations */}
            <path d={TRACE_PATH} ref={pathRef} fill='none' stroke='none' />

            {/* guide path */}
            <path
              d={TRACE_PATH}
              fill='none'
              stroke='rgba(255,255,255,0.35)'
              strokeWidth='6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {/* progress path */}
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
                strokeDashoffset: 1 - progress,
              }}
            />

            {/* start and end markers */}
            {!drawingMode && (
              <>
                <circle cx={START_MARKER.x} cy={START_MARKER.y} r='5' fill='#ffca28' />
                <text x={START_MARKER.x} y={START_MARKER.y + 1.5} textAnchor='middle' fontSize='4'>
                  ⭐
                </text>

                <circle cx={END_MARKER.x} cy={END_MARKER.y} r='5' fill='#ffca28' />
                <text x={END_MARKER.x} y={END_MARKER.y + 1.5} textAnchor='middle' fontSize='4'>
                  ⭐
                </text>
              </>
            )}

            {/* animation marker */}
            {isPlaying && (
              <>
                <circle cx={markerPosition.x} cy={markerPosition.y} r='5' fill='yellow' />
                <text x={markerPosition.x} y={markerPosition.y + 1.5} textAnchor='middle' fontSize='4'>
                  🚂
                </text>
              </>
            )}

            {/* draw nodes */}
            {drawingMode &&
              !drawSuccess &&
              drawNodes.map((n, i) => (
                <g key={i}>
                  <circle
                    cx={n.point.x}
                    cy={n.point.y}
                    r='4.5'
                    fill={i <= activeSegment ? '#4caf50' : 'none'}
                    stroke={i <= activeSegment ? '#2e7d32' : '#ffca28'}
                    strokeWidth='1.2'
                  />
                  <circle cx={n.point.x} cy={n.point.y} r='1.8' fill='#ffca28' />
                </g>
              ))}

            {/* finger pointer */}
            {drawingMode && !drawSuccess && pointerPos.x > -50 && (
              <image
                href={fingerPointer}
                x={pointerPos.x - 8}
                y={pointerPos.y - 8}
                width='16'
                height='16'
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              />
            )}
          </svg>
        </div>

        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={startAnimation}>
            ⭐
          </button>

          <button type='button' className='dg-star-btn active' onClick={startDrawing}>
            ✏️
          </button>
        </div>

        {drawingMode && !drawSuccess && (
          <div className='dg-draw-instruction'>
            💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න
          </div>
        )}

        {showSuccess && (
          <div className='dg-draw-success'>
            🎉 හොඳයි! ඔබ “ක” අකුර නිවැරදිව ඇන්දා! 🎉
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterKA;