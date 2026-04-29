import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactSketchCanvas } from "react-sketch-canvas";
import "../styles/dysgraphia-common.css";
import "../styles/dysgraphia-letter-a.css";

// Exact match dual-stroke path for Sinhala Letter 'අ' as depicted in the reference image (Restored and fine-tuned)
const LETTER_A_PATH = `
  M 45 28
  C 38 28, 38 18, 45 18
  C 52 18, 52 28, 44 32
  C 30 38, 28 55, 44 60
  C 50 61, 58 60, 58 60
  L 68 60
  C 65 64, 60 67, 58 74
  M 58 32
  C 62 20, 68 20, 65 28
  C 63 31, 59 32, 58 32
  L 58 84
  C 58 88, 55 90, 52 87
`;

// Same elegant vector path for practice
const PRACTICE_LETTER_A_PATH = LETTER_A_PATH;

const START_MARKER = { x: 48, y: 30 };
const END_MARKER = { x: 74, y: 88 };

const DysgraphiaLetterA = () => {
  const navigate = useNavigate();
  const railPathRef = useRef(null);
  const canvasRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pathLength, setPathLength] = useState(0);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);

  const duration = 4000; // animation speed

  // 🔊 Play sound
  const playSound = () => {
    const audio = new Audio("/sounds/a.mp3");
    audio.play();
  };

  // 🎬 Calculate path length + animate
  useEffect(() => {
    const path = railPathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    setPathLength(length);

    let start = null;
    let frameId;

    const animate = (timestamp) => {
      if (!start) start = timestamp;

      const elapsed = timestamp - start;
      const progressValue = Math.min(elapsed / duration, 1);

      setProgress(progressValue);

      if (progressValue < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false); // stop after one run
      }
    };

    if (isPlaying) {
      frameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // 📍 Update moving marker position
  useEffect(() => {
    const path = railPathRef.current;
    if (!path || pathLength === 0) return;

    const point = path.getPointAtLength(progress * pathLength);

    setMarkerPosition({
      x: point.x,
      y: point.y,
    });
  }, [progress, pathLength]);

  // 🔄 Replay animation
  const handleReplay = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  // 🧹 Clear drawing
  const clearCanvas = () => {
    canvasRef.current.clearCanvas();
  };

  return (
    <main className="dg-shell dg-theme-a">
      {/* Back */}
      <button className="dg-home-btn" onClick={() => navigate("/dysgraphia")}>
        ←
      </button>

      <section className="dg-stage">
        {/* Header */}
        <header className="dg-header">
          <p className="dg-chip">🖊️ අත්අකුරු පුහුණුව</p>
          <h1 onClick={playSound}>‘අ’ අක්ෂරය හුරු කරමු</h1>
          <p>මාර්ගය අනුගමනය කරමින් ලියන්න.</p>
        </header>

        {/* 🎬 SVG Animation */}
        <div className="dg-canvas-wrap">
          <svg viewBox="0 0 100 100" className="dg-canvas">
            
            {/* Hidden path */}
            <path d={LETTER_A_PATH} ref={railPathRef} fill="none" stroke="none" />

            {/* Background guide */}
            <path d={LETTER_A_PATH} className="dg-chain-path" />

            {/* Progress stroke */}
            <path
              d={LETTER_A_PATH}
              className="dg-progress-path"
              style={{
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength * (1 - progress),
              }}
            />

            {/* Start point */}
            <circle cx={START_MARKER.x} cy={START_MARKER.y} r="2.2" className="dg-node-start" />

            {/* End point (Optional visual cue) */}
            <circle cx={END_MARKER.x} cy={END_MARKER.y} r="2.2" className="dg-node-end" style={{ fill: '#315cbe' }} />

            {/* Moving marker */}
            <g transform={`translate(${markerPosition.x}, ${markerPosition.y})`}>
              <circle r="2.4" className="dg-node-active" />
              <text textAnchor="middle" dy="0.9" style={{ fontSize: '2.5px' }}>🐘</text>
            </g>

          </svg>
        </div>

        {/* Controls */}
        <div className="dg-controls">
          <button className="dg-ctl-btn dg-ctl-primary" onClick={handleReplay}>
            ▶️ නැවත පෙන්වන්න
          </button>

          <button
            className="dg-ctl-btn dg-ctl-secondary"
            onClick={() => setIsPlaying(false)}
          >
            ⏸️ නවත්වන්න
          </button>
        </div>

        {/* ✍️ Practice Area */}
        <div className="dg-practice-wrap">
          <h3>✍️ ඔබත් ලියන්න</h3>

          <div className="dg-practice-canvas-shell">
            <svg viewBox="0 0 100 100" className="dg-practice-guide">
              <rect width="100" height="100" rx="4" className="dg-practice-guide-bg" />
              <path d={PRACTICE_LETTER_A_PATH} className="dg-practice-guide-path" />
              <circle cx={START_MARKER.x} cy={START_MARKER.y} r="1.5" className="dg-practice-guide-start" />
            </svg>

            <ReactSketchCanvas
              ref={canvasRef}
              width="300px"
              height="300px"
              strokeWidth={4}
              strokeColor="black"
              canvasColor="transparent"
              style={{
                border: "2px dashed #ccc",
                borderRadius: "10px",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          </div>

          <button onClick={clearCanvas} className="dg-practice-clear-btn">
            🧹 Clear
          </button>
        </div>

        <p className="dg-hint">
          💡 ඉඟිය: මාර්ගය අනුගමනය කරමින් අකුර ලියන්න.
        </p>
      </section>
    </main>
  );
};

export default DysgraphiaLetterA;