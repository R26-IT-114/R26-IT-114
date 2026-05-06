import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';

import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-ta.css';

import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;
const SEGMENT_START_THRESHOLD = 40;

const L_GUIDE_PATH =
  'M 240 110 C 180 180 170 310 230 410 C 290 500 420 520 500 450 C 560 395 560 290 500 235 C 430 170 315 190 280 285 C 250 365 305 425 390 410 C 455 398 500 350 500 350';

const START_MARKER = { x: 240, y: 110 };
const END_MARKER = { x: 500, y: 350 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
<path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/>
<path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/>
</svg>") 0 24, auto`;

const DysgraphiaLetterLa = () => {
  const navigate = useNavigate();

  const svgRef = useRef(null);
  const letterPathRef = useRef(null);
  const canvasRef = useRef(null);

  const progressRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [markerPosition, setMarkerPosition] = useState(START_MARKER);

  const [showGuide, setShowGuide] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);

  const [segmentProgress, setSegmentProgress] = useState([0, 0]);
  const [activeSegment, setActiveSegment] = useState(0);

  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });

  const [drawNodes, setDrawNodes] = useState([]);

  const overallProgress = (() => {
    const total = segmentProgress.reduce((a, b) => a + b, 0);
    return total / segmentProgress.length;
  })();

  const currentStrokeWidth = drawingMode
    ? Math.min(52, 28 + overallProgress * 18 + (isDrawing ? 6 : 0))
    : 28;

  useEffect(() => {
    if (!isPlaying || !showGuide) return;

    let frameId;

    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;

      const nextProgress = elapsed / ANIMATION_DURATION_MS;

      if (nextProgress >= 1) {
        progressRef.current = 1;

        setProgress(1);
        setIsPlaying(false);

        return;
      }

      progressRef.current = nextProgress;

      setProgress(nextProgress);

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const path = letterPathRef.current;

    if (!path) return;

    const len = path.getTotalLength();

    const point = path.getPointAtLength(progress * len);

    setMarkerPosition({
      x: point.x,
      y: point.y,
    });
  }, [progress]);

  const handleAudio = () => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance('ල');
    utterance.lang = 'si-LK';

    window.speechSynthesis.speak(utterance);
  };

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

    return {
      t: bestT,
      distance: bestDist,
    };
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
    const updated = [...segmentProgress];

    updated[activeSegment] = 0;

    setSegmentProgress(updated);
  };

  const handleSegmentComplete = () => {
    const updated = [...segmentProgress];

    updated[activeSegment] = 1;

    setSegmentProgress(updated);

    const reachedNode = activeSegment + 1;

    setDrawNodes((prev) => {
      const arr = [...prev];

      if (arr[reachedNode]) {
        arr[reachedNode].completed = true;
      }

      return arr;
    });

    if (activeSegment === drawNodes.length - 2) {
      setDrawSuccess(true);

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2500);
    } else {
      setActiveSegment((p) => p + 1);
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

        const dist = Math.hypot(dx, dy);

        if (dist > SEGMENT_START_THRESHOLD) return;
      }
    }

    if (distance > DRAW_DISTANCE_THRESHOLD) {
      resetCurrentSegment();
      return;
    }

    const segStart = getSegmentStartT(activeSegment);
    const segEnd = getSegmentEndT(activeSegment);

    let segT = (t - segStart) / (segEnd - segStart);

    segT = Math.max(0, Math.min(1, segT));

    if (segT > segmentProgress[activeSegment]) {
      const updated = [...segmentProgress];

      updated[activeSegment] = segT;

      setSegmentProgress(updated);

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

    resetCurrentSegment();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const activateDrawingMode = () => {
    setShowGuide(false);

    setDrawingMode(true);

    const path = letterPathRef.current;

    if (!path) return;

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

  const handleGuidePlay = () => {
    progressRef.current = 0;

    setProgress(0);

    setMarkerPosition(START_MARKER);

    setShowGuide(true);

    setIsPlaying(true);

    setDrawingMode(false);
  };

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
          <h1 onClick={handleAudio}>‘ල’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          <svg
            ref={svgRef}
            className={`dg-canvas ${drawingMode ? 'drawing-active' : ''}`}
            viewBox='0 0 640 600'
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              touchAction: 'none',
              cursor: drawingMode && !drawSuccess ? 'none' : 'default',
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
            </defs>

            <path
              d={L_GUIDE_PATH}
              className='dg-chain-path'
              style={{
                stroke: 'rgba(255,255,255,0.25)',
              }}
            />

            <path
              d={L_GUIDE_PATH}
              ref={letterPathRef}
              style={{
                stroke: 'none',
                fill: 'none',
              }}
            />

            <path
              d={L_GUIDE_PATH}
              className='dg-progress-path'
              pathLength='1'
              strokeLinecap='round'
              strokeLinejoin='round'
              style={{
                stroke: drawingMode
                  ? 'url(#rainbowGrad)'
                  : 'rgba(255,255,255,0.3)',

                strokeWidth: currentStrokeWidth,

                strokeDashoffset: `${1 - overallProgress}`,
              }}
            />

            {drawingMode &&
              !drawSuccess &&
              drawNodes.map((node, idx) => (
                <g key={idx}>
                  <circle
                    cx={node.point.x}
                    cy={node.point.y}
                    r='18'
                    fill={node.completed ? '#4caf50' : 'none'}
                    stroke={node.completed ? '#2e7d32' : '#ffca28'}
                    strokeWidth='2.5'
                  />

                  <circle
                    cx={node.point.x}
                    cy={node.point.y}
                    r='7'
                    fill={node.completed ? '#fff' : '#ffca28'}
                    stroke='#000'
                    strokeWidth='1'
                  />
                </g>
              ))}

            {drawingMode &&
              !drawSuccess &&
              pointerPos.x > -50 && (
                <image
                  href={fingerPointer}
                  x={pointerPos.x - 30}
                  y={pointerPos.y - 30}
                  width='60'
                  height='60'
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
              )}

            {showGuide && (
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
          </svg>
        </div>

        <div className='dg-floating-stars'>
          <button
            type='button'
            className='dg-star-btn active'
            onClick={handleGuidePlay}
          >
            ⭐
          </button>

          <button
            type='button'
            className='dg-star-btn active'
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
            🎉 හොඳයි! ඔබ “ල” නිවැරදිව ඇන්දා! 🎉
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterLa;