// ===============================================
// DysgraphiaLetterNA.jsx
// FULL ADVANCED VERSION
// ===============================================

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

const NA_GUIDE_PATH =
  'M 220 120 C 180 200 180 320 240 410 C 300 500 430 520 510 450 C 570 395 565 290 505 235 C 440 175 340 185 290 250 C 250 305 255 385 330 430';

const START_MARKER = { x: 220, y: 120 };
const END_MARKER = { x: 330, y: 430 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
<path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/>
<path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/>
</svg>") 0 24, auto`;

const DysgraphiaLetterNA = () => {
  const navigate = useNavigate();

  const letterPathRef = useRef(null);
  const progressRef = useRef(0);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [markerPosition, setMarkerPosition] = useState(START_MARKER);

  const [showGuide, setShowGuide] = useState(false);

  const [drawingMode, setDrawingMode] = useState(false);

  const [segmentProgress, setSegmentProgress] = useState([0, 0]);

  const [activeSegment, setActiveSegment] = useState(0);

  const [isDrawing, setIsDrawing] = useState(false);

  const [drawNodes, setDrawNodes] = useState([]);

  const [drawSuccess, setDrawSuccess] = useState(false);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);

  const [pointerPos, setPointerPos] = useState({
    x: -100,
    y: -100,
  });

  const [evalLoading, setEvalLoading] = useState(false);

  const [evalResult, setEvalResult] = useState(null);

  const [evalError, setEvalError] = useState(null);

  const [feedback, setFeedback] = useState(null);

  const overallProgress = (() => {
    const segCount = segmentProgress.length;

    if (segCount === 0) return 0;

    const total = segmentProgress.reduce((sum, val) => sum + val, 0);

    return total / segCount;
  })();

  const currentStrokeWidth = drawingMode
    ? Math.min(52, 28 + overallProgress * 18)
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
    const pathElement = letterPathRef.current;

    if (!pathElement) return;

    const pathLength = pathElement.getTotalLength();

    const point = pathElement.getPointAtLength(progress * pathLength);

    setMarkerPosition({
      x: point.x,
      y: point.y,
    });
  }, [progress]);

  const handleAudio = () => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance('න');

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

  const getSegmentFromT = (t) => {
    const segCount = drawNodes.length - 1;

    if (segCount <= 1) return 0;

    return Math.min(Math.floor(t * segCount), segCount - 1);
  };

  const updateDrawProgress = (point) => {
    const closest = getClosestPointOnPath(point.x, point.y);

    if (!closest) return;

    const { t, distance } = closest;

    if (distance > DRAW_DISTANCE_THRESHOLD) return;

    const seg = getSegmentFromT(t);

    if (seg !== activeSegment) return;

    const segStart = activeSegment / 2;

    const segEnd = (activeSegment + 1) / 2;

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

  const handleSegmentComplete = () => {
    const updated = [...segmentProgress];

    updated[activeSegment] = 1;

    setSegmentProgress(updated);

    setDrawNodes((prev) => {
      const arr = [...prev];

      if (arr[activeSegment + 1]) {
        arr[activeSegment + 1].completed = true;
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

  const handleFirstStarClick = () => {
    setDrawingMode(false);

    setDrawingWithCanvas(false);

    progressRef.current = 0;

    setProgress(0);

    setMarkerPosition(START_MARKER);

    setShowGuide(true);

    setIsPlaying(true);
  };

  const handleThirdStarClick = () => {
    setDrawingWithCanvas(true);
  };

  const submitCanvasForEvaluation = async () => {
    if (!canvasRef.current) return;

    setEvalLoading(true);

    setEvalError(null);

    try {
      const dataUrl = await canvasRef.current.exportImage('jpeg');

      const blob = await fetch(dataUrl).then((r) => r.blob());

      const formData = new FormData();

      formData.append('image', blob, 'drawing.jpg');

      const res = await fetch('http://localhost:3000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      setEvalResult(data);

      const isCorrect =
        data?.predictions?.[0]?.sinhala === 'න' ||
        data?.prediction?.sinhala === 'න';

      if (isCorrect) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
    } catch (err) {
      setEvalError('Prediction failed');
    } finally {
      setEvalLoading(false);
    }
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
          <h1 onClick={handleAudio}>
            ‘න’ අක්ෂරය හුරු කරමු
          </h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className='dg-canvas'
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

              <path
                d={NA_GUIDE_PATH}
                className='dg-chain-path'
                style={{
                  stroke: 'rgba(255,255,255,0.25)',
                }}
              />

              <path
                d={NA_GUIDE_PATH}
                ref={letterPathRef}
                style={{
                  stroke: 'none',
                  fill: 'none',
                }}
              />

              <path
                d={NA_GUIDE_PATH}
                className='dg-progress-path'
                pathLength='1'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{
                  stroke: drawingMode
                    ? 'url(#rainbowGrad)'
                    : 'rgba(255,255,255,0.3)',

                  strokeWidth: currentStrokeWidth,

                  strokeDashoffset: `${
                    1 -
                    (drawingMode
                      ? overallProgress
                      : progress)
                  }`,
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
                      fill={
                        node.completed
                          ? '#fff'
                          : '#ffca28'
                      }
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
                  />
                )}

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
            </svg>
          ) : (
            <div
              className='dg-practice-wrap'
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <h3>
                ✍️ දැන් “න” අක්ෂරය ඔබම අඳින්න
              </h3>

              <div
                className='dg-practice-canvas-shell'
                style={{
                  position: 'relative',
                  width: 600,
                  height: 600,
                  margin: '16px auto',
                }}
              >
                <ReactSketchCanvas
                  ref={canvasRef}
                  width='600px'
                  height='600px'
                  strokeWidth={8}
                  strokeColor='black'
                  canvasColor='white'
                  style={{
                    border: '2px dashed rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    cursor: PEN_CURSOR,
                  }}
                />
              </div>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 8,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <button
                  className='dg-ctl-btn'
                  onClick={() =>
                    canvasRef.current?.clearCanvas()
                  }
                >
                  🧹 මකන්න
                </button>

                <button
                  className='dg-ctl-btn'
                  onClick={submitCanvasForEvaluation}
                >
                  {evalLoading
                    ? '...පරීක්ෂා වෙමින්'
                    : '✅ පරීක්ෂා කරන්න'}
                </button>
              </div>

              {feedback === 'correct' && (
                <div
                  style={{
                    color: '#00ff95',
                    textAlign: 'center',
                    marginTop: 12,
                    fontSize: '22px',
                    fontWeight: 'bold',
                  }}
                >
                  🎉 හරි! ඔබ නිවැරදිව ඇන්දා!
                </div>
              )}

              {feedback === 'wrong' && (
                <div
                  style={{
                    color: '#ff5252',
                    textAlign: 'center',
                    marginTop: 12,
                    fontSize: '22px',
                    fontWeight: 'bold',
                  }}
                >
                  ❌ නැවත උත්සාහ කරන්න!
                </div>
              )}

              {evalError && (
                <div
                  style={{
                    color: '#ff8080',
                    textAlign: 'center',
                    marginTop: 8,
                  }}
                >
                  {evalError}
                </div>
              )}
            </div>
          )}
        </div>

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
            className='dg-star-btn active'
            onClick={activateDrawingMode}
          >
            ✏️
          </button>

          <button
            type='button'
            className='dg-star-btn active'
            onClick={handleThirdStarClick}
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
            🎉 හොඳයි! ඔබ සම්පූර්ණයෙන්ම නිවැරදිව ඇන්දා!
            🎉
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterNA;