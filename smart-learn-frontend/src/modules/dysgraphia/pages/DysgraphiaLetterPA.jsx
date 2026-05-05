import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1200;
const DRAW_DISTANCE_THRESHOLD = 12;

const LETTER_CHAR = 'ප';
const EVAL_LETTER = 'pa';

/* ✅ CORRECT DRAW ORDER (TOP → LOOP → RIGHT CURVE) */
const TRACE_PATH =
  'M72 35 C50 35 32 52 32 78 C32 108 55 126 82 120 C108 114 115 82 94 68 C76 56 55 66 55 88 C55 108 74 118 96 108 C118 98 123 70 106 52 C94 40 78 38 72 35 M106 52 C126 48 146 62 146 86 C146 112 124 126 104 116';

const START_MARKER = { x: 72, y: 35 };
const END_MARKER = { x: 104, y: 116 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='10' fill='black'/></svg>") 12 12, auto`;

const DysgraphiaLetterPA = () => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const canvasRef = useRef(null);

  const progressRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [thirdUnlocked, setThirdUnlocked] = useState(false);

  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });

  const [segmentProgress, setSegmentProgress] = useState([0, 0]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [drawNodes, setDrawNodes] = useState([]);

  /* ================= AUDIO ================= */
  const playSound = (freq = 700) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = freq;
    gain.gain.value = 0.2;

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  /* ================= ANIMATION ================= */
  useEffect(() => {
    if (!isPlaying) return;

    let frameId;
    const start = performance.now();

    const animate = (now) => {
      const t = (now - start) / ANIMATION_DURATION_MS;

      if (t >= 1) {
        setProgress(1);
        setIsPlaying(false);
        setThirdUnlocked(true);
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

  /* ================= HELPERS ================= */
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

    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const pt = path.getPointAtLength(t * len);
      const d = Math.hypot(pt.x - x, pt.y - y);

      if (d < best.dist) best = { dist: d, t };
    }

    return best;
  };

  /* ================= DRAW MODE ================= */
  const startDrawing = () => {
    setDrawingMode(true);

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

  const updateDraw = (pt) => {
    const { t, dist } = getClosestPoint(pt.x, pt.y);
    if (dist > DRAW_DISTANCE_THRESHOLD) return;

    const seg = Math.floor(t * 2);
    if (seg !== activeSegment) return;

    const segT = (t - seg * 0.5) / 0.5;

    if (segT > segmentProgress[seg]) {
      const newProg = [...segmentProgress];
      newProg[seg] = segT;
      setSegmentProgress(newProg);

      if (segT > 0.95) {
        playSound(900);

        if (seg === 1) {
          setDrawSuccess(true);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setActiveSegment(1);
        }
      }
    }
  };

  /* ================= EVENTS ================= */
  const onDown = (e) => {
    if (!drawingMode) return;
    setIsDrawing(true);
  };

  const onMove = (e) => {
    if (!isDrawing) return;

    const pt = clientToSVG(e.clientX, e.clientY);
    setPointerPos(pt);
    updateDraw(pt);
  };

  const onUp = () => setIsDrawing(false);

  /* ================= UI ================= */
  return (
    <main className='dg-shell'>
      <button className='dg-home-btn' onClick={() => navigate('/dysgraphia')}>
        ←
      </button>

      <h1>‘ප’ අක්ෂරය හුරු කරමු</h1>

      <svg
        ref={svgRef}
        viewBox='0 0 174 153'
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{ touchAction: 'none' }}
      >
        {/* faint letter */}
        <text
          x='87'
          y='120'
          textAnchor='middle'
          fontSize='120'
          fill='rgba(255,255,255,0.15)'
        >
          ප
        </text>

        {/* trace path */}
        <path d={TRACE_PATH} ref={pathRef} fill='none' stroke='none' />

        <path
          d={TRACE_PATH}
          fill='none'
          stroke='#aaa'
          strokeWidth='6'
        />

        <path
          d={TRACE_PATH}
          pathLength='1'
          stroke='lime'
          strokeWidth='8'
          fill='none'
          strokeDasharray='1'
          strokeDashoffset={1 - progress}
        />

        {/* train */}
        {isPlaying && (
          <circle cx={markerPosition.x} cy={markerPosition.y} r='5' fill='yellow' />
        )}

        {/* nodes */}
        {drawNodes.map((n, i) => (
          <circle
            key={i}
            cx={n.point.x}
            cy={n.point.y}
            r='4'
            fill={i <= activeSegment ? 'green' : 'orange'}
          />
        ))}

        {/* finger */}
        {drawingMode && (
          <image
            href={fingerPointer}
            x={pointerPos.x - 8}
            y={pointerPos.y - 8}
            width='16'
            height='16'
          />
        )}
      </svg>

      <div>
        <button onClick={() => setIsPlaying(true)}>⭐ Animate</button>
        <button onClick={startDrawing}>✏️ Draw</button>
      </div>

      {showSuccess && <h2>🎉 Correct!</h2>}
    </main>
  );
};

export default DysgraphiaLetterPA;