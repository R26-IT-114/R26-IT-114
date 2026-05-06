// ===============================
// DysgraphiaLetterTHA.jsx
// ===============================

import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;

/* ✅ Sinhala “ත” correct stroke order */
const THA_GUIDE_PATH =
  'M 320 170 C 240 170 190 250 220 340 C 250 430 360 450 430 390 C 500 330 500 220 430 180 C 370 145 300 160 270 220 C 245 270 270 330 330 340 C 390 350 440 320 445 260 C 450 210 410 180 360 180 M 360 180 C 470 190 540 270 500 390';

const START_MARKER = { x: 320, y: 170 };
const END_MARKER = { x: 500, y: 390 };

// Pen cursor
const PEN_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/><path d='M5 19l-1.5 1.5' stroke='black' stroke-width='2'/></svg>") 0 24, auto`;

const DysgraphiaLetterTHA = () => {
  const navigate = useNavigate();

  const letterPathRef = useRef(null);
  const progressRef = useRef(0);
  const svgRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [markerPosition, setMarkerPosition] =
    useState(START_MARKER);

  const [showGuide, setShowGuide] = useState(false);
  const [animationComplete, setAnimationComplete] =
    useState(false);

  // Drawing
  const [drawingMode, setDrawingMode] = useState(false);
  const [segmentProgress, setSegmentProgress] =
    useState([0, 0]);

  const [activeSegment, setActiveSegment] =
    useState(0);

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [drawNodes, setDrawNodes] =
    useState([]);

  const [drawSuccess, setDrawSuccess] =
    useState(false);

  const [showSuccessMessage, setShowSuccessMessage] =
    useState(false);

  const [pointerPos, setPointerPos] =
    useState({ x: -100, y: -100 });

  const canvasRef = useRef(null);

  // ================= AUDIO =================

  const playSound = (freq = 700) => {
    try {
      const ctx = new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.value = 0.15;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const handleAudio = () => {
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance('ත');

    utterance.lang = 'si-LK';

    window.speechSynthesis.speak(utterance);
  };

  // ================= ANIMATION =================

  useEffect(() => {
    if (!isPlaying || !showGuide) return;

    let frameId;

    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;

      const nextProgress =
        elapsed / ANIMATION_DURATION_MS;

      if (nextProgress >= 1) {
        setProgress(1);

        setIsPlaying(false);

        setAnimationComplete(true);

        playSound(1000);

        return;
      }

      progressRef.current = nextProgress;

      setProgress(nextProgress);

      frameId =
        window.requestAnimationFrame(animate);
    };

    frameId =
      window.requestAnimationFrame(animate);

    return () =>
      window.cancelAnimationFrame(frameId);
  }, [isPlaying, showGuide]);

  useEffect(() => {
    const pathElement =
      letterPathRef.current;

    if (!pathElement) return;

    const pathLength =
      pathElement.getTotalLength();

    const point =
      pathElement.getPointAtLength(
        progress * pathLength
      );

    setMarkerPosition({
      x: point.x,
      y: point.y,
    });
  }, [progress]);

  // ================= HELPERS =================

  const clientToViewBox = (
    clientX,
    clientY
  ) => {
    const svg = svgRef.current;

    if (!svg) return null;

    const rect =
      svg.getBoundingClientRect();

    const viewBox =
      svg.viewBox.baseVal;

    const scaleX =
      viewBox.width / rect.width;

    const scaleY =
      viewBox.height / rect.height;

    return {
      x:
        (clientX - rect.left) *
          scaleX +
        viewBox.x,

      y:
        (clientY - rect.top) *
          scaleY +
        viewBox.y,
    };
  };

  const getClosestPointOnPath = (
    x,
    y
  ) => {
    const path = letterPathRef.current;

    if (!path) return null;

    const totalLength =
      path.getTotalLength();

    let bestDist = Infinity;
    let bestT = 0;

    for (let i = 0; i <= 200; i++) {
      const t = i / 200;

      const pt =
        path.getPointAtLength(
          t * totalLength
        );

      const dx = pt.x - x;
      const dy = pt.y - y;

      const dist =
        Math.hypot(dx, dy);

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

  // ================= DRAW =================

  const activateDrawingMode = () => {
    setDrawingMode(true);

    const path =
      letterPathRef.current;

    const totalLen =
      path.getTotalLength();

    const nodes = [
      {
        t: 0,
        point:
          path.getPointAtLength(0),
        completed: false,
      },
      {
        t: 0.5,
        point:
          path.getPointAtLength(
            totalLen * 0.5
          ),
        completed: false,
      },
      {
        t: 1,
        point:
          path.getPointAtLength(
            totalLen
          ),
        completed: false,
      },
    ];

    setDrawNodes(nodes);

    setSegmentProgress([0, 0]);

    setActiveSegment(0);

    setDrawSuccess(false);
  };

  const handleSegmentComplete = () => {
    const newProgress = [
      ...segmentProgress,
    ];

    newProgress[activeSegment] = 1;

    setSegmentProgress(newProgress);

    playSound(850);

    const reachedNode =
      activeSegment + 1;

    setDrawNodes((prev) => {
      const updated = [...prev];

      if (updated[reachedNode]) {
        updated[
          reachedNode
        ].completed = true;
      }

      return updated;
    });

    if (
      activeSegment ===
      drawNodes.length - 2
    ) {
      setDrawSuccess(true);

      setShowSuccessMessage(true);

      playSound(1200);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2500);
    } else {
      setActiveSegment(
        (prev) => prev + 1
      );
    }
  };

  const updateDrawProgress = (
    point
  ) => {
    const closest =
      getClosestPointOnPath(
        point.x,
        point.y
      );

    if (!closest) return;

    const { t, distance } =
      closest;

    if (
      distance >
      DRAW_DISTANCE_THRESHOLD
    )
      return;

    const seg = activeSegment;

    const segStart = seg / 2;

    const segEnd =
      (seg + 1) / 2;

    let segT =
      (t - segStart) /
      (segEnd - segStart);

    segT = Math.min(
      1,
      Math.max(0, segT)
    );

    if (
      segT >
      segmentProgress[seg]
    ) {
      const newProgress = [
        ...segmentProgress,
      ];

      newProgress[seg] = segT;

      setSegmentProgress(
        newProgress
      );

      if (segT >= 0.99) {
        handleSegmentComplete();
      }
    }
  };

  const handlePointerMove = (e) => {
    if (
      !drawingMode ||
      drawSuccess
    )
      return;

    e.preventDefault();

    const point =
      clientToViewBox(
        e.clientX,
        e.clientY
      );

    if (!point) return;

    setPointerPos(point);

    if (isDrawing) {
      updateDrawProgress(point);
    }
  };

  const handlePointerDown = (e) => {
    if (
      !drawingMode ||
      drawSuccess
    )
      return;

    e.preventDefault();

    const point =
      clientToViewBox(
        e.clientX,
        e.clientY
      );

    if (!point) return;

    setPointerPos(point);

    setIsDrawing(true);

    updateDrawProgress(point);

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  };

  const handlePointerUp = (e) => {
    if (
      !drawingMode ||
      drawSuccess
    )
      return;

    e.preventDefault();

    setIsDrawing(false);

    if (
      e.currentTarget.hasPointerCapture(
        e.pointerId
      )
    ) {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    }
  };

  // ================= GUIDE START =================

  const handleFirstStarClick = () => {
    setShowGuide(true);

    setProgress(0);

    progressRef.current = 0;

    setTimeout(() => {
      setIsPlaying(true);
    }, 500);
  };

  // ================= UI =================

  return (
    <main className='dg-shell dg-theme-ta'>
      <button
        type='button'
        className='dg-home-btn'
        onClick={() =>
          navigate('/dysgraphia')
        }
      >
        ←
      </button>

      <section className='dg-stage'>
        <header className='dg-header'>
          <h1 onClick={handleAudio}>
            ‘ත’ අක්ෂරය හුරු කරමු
          </h1>
        </header>

        <div className='dg-canvas-wrap'>
          <svg
            ref={svgRef}
            className='dg-canvas'
            viewBox='0 0 640 600'
            onPointerMove={
              handlePointerMove
            }
            onPointerDown={
              handlePointerDown
            }
            onPointerUp={
              handlePointerUp
            }
            onPointerCancel={
              handlePointerUp
            }
            style={{
              touchAction: 'none',
              cursor:
                drawingMode &&
                !drawSuccess
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
                <stop
                  offset='0%'
                  stopColor='#ff0000'
                />
                <stop
                  offset='20%'
                  stopColor='#ffff00'
                />
                <stop
                  offset='40%'
                  stopColor='#00ff00'
                />
                <stop
                  offset='60%'
                  stopColor='#00ffff'
                />
                <stop
                  offset='80%'
                  stopColor='#0000ff'
                />
                <stop
                  offset='100%'
                  stopColor='#ff00ff'
                />
              </linearGradient>
            </defs>

            <path
              d={THA_GUIDE_PATH}
              ref={letterPathRef}
              style={{
                stroke: 'none',
                fill: 'none',
              }}
            />

            <path
              d={THA_GUIDE_PATH}
              className='dg-progress-path'
              pathLength='1'
              strokeLinecap='round'
              strokeLinejoin='round'
              style={{
                stroke: drawingMode
                  ? 'url(#rainbowGrad)'
                  : 'rgba(255,255,255,0.35)',

                strokeWidth: 28,

                strokeDashoffset: `${
                  1 -
                  (drawingMode
                    ? (segmentProgress[0] +
                        segmentProgress[1]) /
                      2
                    : progress)
                }`,
              }}
            />

            {/* nodes */}
            {drawingMode &&
              !drawSuccess &&
              drawNodes.map(
                (node, idx) => (
                  <g key={idx}>
                    <circle
                      cx={
                        node.point.x
                      }
                      cy={
                        node.point.y
                      }
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
                      cx={
                        node.point.x
                      }
                      cy={
                        node.point.y
                      }
                      r='7'
                      fill='#ffca28'
                    />
                  </g>
                )
              )}

            {/* guide stars */}
            {showGuide &&
              !drawingMode && (
                <>
                  <circle
                    cx={
                      START_MARKER.x
                    }
                    cy={
                      START_MARKER.y
                    }
                    r='22'
                    className='dg-node'
                  />

                  <text
                    x={
                      START_MARKER.x
                    }
                    y={
                      START_MARKER.y +
                      6
                    }
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
                    y={
                      END_MARKER.y +
                      6
                    }
                    textAnchor='middle'
                  >
                    ⭐
                  </text>
                </>
              )}

            {/* finger */}
            {drawingMode &&
              !drawSuccess &&
              pointerPos.x >
                -50 && (
                <image
                  href={
                    fingerPointer
                  }
                  x={
                    pointerPos.x -
                    30
                  }
                  y={
                    pointerPos.y -
                    30
                  }
                  width='60'
                  height='60'
                />
              )}

            {/* train */}
            {showGuide &&
              !drawingMode && (
                <g>
                  <circle
                    cx={
                      markerPosition.x
                    }
                    cy={
                      markerPosition.y
                    }
                    r='22'
                    className='dg-node dg-node-active'
                  />

                  <text
                    x={
                      markerPosition.x
                    }
                    y={
                      markerPosition.y +
                      6
                    }
                    textAnchor='middle'
                    style={{
                      fontSize: '20px',
                    }}
                  >
                    🚂
                  </text>
                </g>
              )}
          </svg>
        </div>

        {/* buttons */}
        <div className='dg-floating-stars'>
          <button
            type='button'
            className='dg-star-btn active'
            onClick={
              handleFirstStarClick
            }
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
            disabled={
              !animationComplete
            }
            onClick={
              activateDrawingMode
            }
          >
            ✏️
          </button>
        </div>

        {drawingMode &&
          !drawSuccess && (
            <div className='dg-draw-instruction'>
              💧 තරු
              අනුපිළිවෙලට
              ඇඟිල්ල
              ගෙනයන්න
            </div>
          )}

        {showSuccessMessage && (
          <div className='dg-draw-success'>
            🎉 හොඳයි!
            ඔබ
            සම්පූර්ණයෙන්ම
            නිවැරදිව
            ඇන්දා! 🎉
          </div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterTHA;