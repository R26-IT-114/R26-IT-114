// ===============================
// DysgraphiaLetterDHA.jsx
// ===============================

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-letter-ta.css';
import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1000;
const DRAW_DISTANCE_THRESHOLD = 30;

/* ✅ Sinhala “ද” correct stroke order */
const DHA_GUIDE_PATH =
  'M 320 170 C 240 170 180 250 210 350 C 240 450 360 470 450 410 C 520 360 540 250 470 190 C 420 150 350 150 300 190 C 250 230 250 310 300 350 C 350 390 430 380 470 330 C 500 290 500 220 450 190 M 470 330 C 560 350 570 450 500 500 C 430 550 320 520 280 450';

const START_MARKER = { x: 320, y: 170 };
const END_MARKER = { x: 280, y: 450 };

const DysgraphiaLetterDHA = () => {
  const navigate = useNavigate();

  const svgRef = useRef(null);
  const pathRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [markerPosition, setMarkerPosition] =
    useState(START_MARKER);

  const [showGuide, setShowGuide] =
    useState(false);

  const [animationComplete, setAnimationComplete] =
    useState(false);

  // drawing
  const [drawingMode, setDrawingMode] =
    useState(false);

  const [segmentProgress, setSegmentProgress] =
    useState([0, 0]);

  const [activeSegment, setActiveSegment] =
    useState(0);

  const [drawNodes, setDrawNodes] =
    useState([]);

  const [isDrawing, setIsDrawing] =
    useState(false);

  const [drawSuccess, setDrawSuccess] =
    useState(false);

  const [showSuccessMessage, setShowSuccessMessage] =
    useState(false);

  const [pointerPos, setPointerPos] =
    useState({ x: -100, y: -100 });

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
    } catch {
      // ignore audio init errors
    }

  };


  const handleAudio = () => {
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance('ද');

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

      const t = elapsed / ANIMATION_DURATION_MS;

      if (t >= 1) {
        setProgress(1);
        setIsPlaying(false);
        setAnimationComplete(true);
        playSound(1000);
        return;
      }

      setProgress(t);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, showGuide, playSound]);


  useEffect(() => {
    const path = pathRef.current;

    if (!path) return;

    const len = path.getTotalLength();

    const pt =
      path.getPointAtLength(progress * len);

    setMarkerPosition({
      x: pt.x,
      y: pt.y,
    });
  }, [progress]);

  // ================= HELPERS =================

  const clientToViewBox = (
    clientX,
    clientY
  ) => {
    const svg = svgRef.current;

    const rect =
      svg.getBoundingClientRect();

    const vb = svg.viewBox.baseVal;

    return {
      x:
        (clientX - rect.left) *
          (vb.width / rect.width) +
        vb.x,

      y:
        (clientY - rect.top) *
          (vb.height / rect.height) +
        vb.y,
    };
  };

  const getClosestPoint = (x, y) => {
    const path = pathRef.current;

    const len = path.getTotalLength();

    let best = {
      dist: Infinity,
      t: 0,
    };

    for (let i = 0; i <= 200; i++) {
      const t = i / 200;

      const pt =
        path.getPointAtLength(t * len);

      const d = Math.hypot(
        pt.x - x,
        pt.y - y
      );

      if (d < best.dist) {
        best = { dist: d, t };
      }
    }

    return best;
  };

  // ================= DRAW =================

  const activateDrawingMode = () => {
    setDrawingMode(true);

    const path = pathRef.current;

    const len = path.getTotalLength();

    setDrawNodes([
      {
        point:
          path.getPointAtLength(0),
        completed: false,
      },

      {
        point:
          path.getPointAtLength(
            len * 0.5
          ),
        completed: false,
      },

      {
        point:
          path.getPointAtLength(len),
        completed: false,
      },
    ]);

    setSegmentProgress([0, 0]);

    setActiveSegment(0);

    setDrawSuccess(false);
  };

  const handleSegmentComplete = () => {
    const updated = [
      ...segmentProgress,
    ];

    updated[activeSegment] = 1;

    setSegmentProgress(updated);

    playSound(850);

    setDrawNodes((prev) => {
      const clone = [...prev];

      if (clone[activeSegment + 1]) {
        clone[
          activeSegment + 1
        ].completed = true;
      }

      return clone;
    });

    if (activeSegment === 1) {
      setDrawSuccess(true);

      setShowSuccessMessage(true);

      playSound(1200);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2500);
    } else {
      setActiveSegment(1);
    }
  };

  const updateDraw = (point) => {
    const { t, dist } =
      getClosestPoint(
        point.x,
        point.y
      );

    if (
      dist >
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
      const updated = [
        ...segmentProgress,
      ];

      updated[seg] = segT;

      setSegmentProgress(updated);

      if (segT >= 0.99) {
        handleSegmentComplete();
      }
    }
  };

  const onDown = (e) => {
    if (
      !drawingMode ||
      drawSuccess
    )
      return;

    const pt =
      clientToViewBox(
        e.clientX,
        e.clientY
      );

    setPointerPos(pt);

    setIsDrawing(true);

    updateDraw(pt);

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  };

  const onMove = (e) => {
    if (
      !drawingMode ||
      drawSuccess
    )
      return;

    const pt =
      clientToViewBox(
        e.clientX,
        e.clientY
      );

    setPointerPos(pt);

    if (isDrawing) {
      updateDraw(pt);
    }
  };

  const onUp = (e) => {
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

  // ================= GUIDE =================

  const startGuide = () => {
    setShowGuide(true);

    setProgress(0);

    setTimeout(() => {
      setIsPlaying(true);
    }, 400);
  };

  // ================= UI =================

  return (
    <main className='dg-shell dg-theme-ta'>
      <button
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
            ‘ද’ අක්ෂරය හුරු කරමු
          </h1>
        </header>

        <div className='dg-canvas-wrap'>
          <svg
            ref={svgRef}
            className='dg-canvas'
            viewBox='0 0 640 600'
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
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
              d={DHA_GUIDE_PATH}
              ref={pathRef}
              fill='none'
              stroke='none'
            />

            {/* main line */}
            <path
              d={DHA_GUIDE_PATH}
              pathLength='1'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              style={{
                stroke: drawingMode
                  ? 'url(#rainbowGrad)'
                  : 'rgba(255,255,255,0.35)',

                strokeWidth: 28,

                strokeDasharray: 1,

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
            className='dg-star-btn active'
            onClick={startGuide}
          >
            ⭐
          </button>

          <button
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

export default DysgraphiaLetterDHA;