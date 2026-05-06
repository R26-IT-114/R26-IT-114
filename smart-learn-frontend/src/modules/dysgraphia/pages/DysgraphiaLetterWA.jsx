import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';

import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-ta.css';

import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1200;

const WA_GUIDE_PATH =
  'M 230 180 C 180 260 190 390 270 455 C 350 520 470 505 530 430 C 575 375 565 280 505 230 C 450 185 365 195 315 255 C 280 300 275 360 330 405';

const START_MARKER = { x: 230, y: 180 };
const END_MARKER = { x: 330, y: 405 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
<path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/>
</svg>") 0 24, auto`;

const DysgraphiaLetterWA = () => {
  const navigate = useNavigate();

  const svgRef = useRef(null);
  const letterPathRef = useRef(null);
  const canvasRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(START_MARKER);

  const [showGuide, setShowGuide] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [drawingWithCanvas, setDrawingWithCanvas] = useState(false);

  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100 });
  const [feedback, setFeedback] = useState(null);

  const handleAudio = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('ව');
    utterance.lang = 'si-LK';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let frameId;
    const start = performance.now();

    const animate = (now) => {
      const nextProgress = (now - start) / ANIMATION_DURATION_MS;

      if (nextProgress >= 1) {
        setProgress(1);
        setIsPlaying(false);
        setAnimationComplete(true);
        return;
      }

      setProgress(nextProgress);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

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

  const handlePlayGuide = () => {
    setDrawingMode(false);
    setDrawingWithCanvas(false);
    setShowGuide(true);
    setProgress(0);

    setTimeout(() => {
      setIsPlaying(true);
    }, 300);
  };

  const handlePractice = () => {
    setDrawingMode(true);
    setDrawSuccess(false);
    setDrawingWithCanvas(false);
  };

  const handleCanvasMode = () => {
    setDrawingWithCanvas(true);
    setDrawingMode(false);
  };

  const submitCanvasForEvaluation = async () => {
    try {
      const paths = await canvasRef.current.exportPaths();

      if (!paths || paths.length === 0) {
        setFeedback('empty');
        return;
      }

      setFeedback('correct');
    } catch {
      setFeedback('wrong');
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
          <h1 onClick={handleAudio}>‘ව’ අක්ෂරය හුරු කරමු</h1>
        </header>

        <div className='dg-canvas-wrap'>
          {!drawingWithCanvas ? (
            <svg
              ref={svgRef}
              className='dg-canvas'
              viewBox='0 0 640 600'
              style={{
                touchAction: 'none',
                cursor: drawingMode ? 'none' : 'default',
              }}
            >
              <defs>
                <linearGradient id='rainbowGrad' x1='0' y1='0' x2='640' y2='0'>
                  <stop offset='0%' stopColor='#ff0000' />
                  <stop offset='20%' stopColor='#ffff00' />
                  <stop offset='40%' stopColor='#00ff00' />
                  <stop offset='60%' stopColor='#00ffff' />
                  <stop offset='80%' stopColor='#0000ff' />
                  <stop offset='100%' stopColor='#ff00ff' />
                </linearGradient>
              </defs>

              <path
                d={WA_GUIDE_PATH}
                className='dg-chain-path'
                stroke='rgba(255,255,255,0.2)'
                fill='none'
                strokeWidth='32'
                strokeLinecap='round'
                strokeLinejoin='round'
              />

              <path
                ref={letterPathRef}
                d={WA_GUIDE_PATH}
                fill='none'
                stroke='none'
              />

              <path
                d={WA_GUIDE_PATH}
                pathLength='1'
                className='dg-progress-path'
                stroke={drawingMode ? 'url(#rainbowGrad)' : 'rgba(255,255,255,0.4)'}
                fill='none'
                strokeWidth='34'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeDasharray='1'
                strokeDashoffset={`${1 - progress}`}
              />

              {showGuide && (
                <>
                  <circle cx={START_MARKER.x} cy={START_MARKER.y} r='22' className='dg-node' />
                  <text x={START_MARKER.x} y={START_MARKER.y + 6} textAnchor='middle'>
                    ⭐
                  </text>

                  <circle cx={END_MARKER.x} cy={END_MARKER.y} r='22' className='dg-node' />
                  <text x={END_MARKER.x} y={END_MARKER.y + 6} textAnchor='middle'>
                    ⭐
                  </text>
                </>
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

              {drawingMode && (
                <image
                  href={fingerPointer}
                  x={pointerPos.x - 30}
                  y={pointerPos.y - 30}
                  width='60'
                  height='60'
                  draggable='false'
                />
              )}
            </svg>
          ) : (
            <div className='dg-practice-wrap'>
              <h3>✍️ දැන් “ව” අක්ෂරය ඔබම අඳින්න</h3>

              <div
                style={{
                  width: 600,
                  height: 600,
                  margin: '20px auto',
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#fff',
                }}
              >
                <ReactSketchCanvas
                  ref={canvasRef}
                  width='600px'
                  height='600px'
                  strokeWidth={8}
                  strokeColor='black'
                  canvasColor='white'
                  style={{ cursor: PEN_CURSOR }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button className='dg-ctl-btn' onClick={() => canvasRef.current?.clearCanvas()}>
                  🧹 මකන්න
                </button>

                <button className='dg-ctl-btn' onClick={submitCanvasForEvaluation}>
                  ✅ පරීක්ෂා කරන්න
                </button>
              </div>

              {feedback === 'correct' && (
                <div style={{ color: '#00ff99', textAlign: 'center', marginTop: 20, fontSize: 26, fontWeight: 'bold' }}>
                  🎉 හරි! ඉතා හොඳයි!
                </div>
              )}

              {feedback === 'wrong' && (
                <div style={{ color: '#ff5252', textAlign: 'center', marginTop: 20, fontSize: 24, fontWeight: 'bold' }}>
                  ❌ නැවත උත්සාහ කරන්න
                </div>
              )}

              {feedback === 'empty' && (
                <div style={{ color: '#ffd54f', textAlign: 'center', marginTop: 20, fontSize: 22, fontWeight: 'bold' }}>
                  ⚠️ මුලින් අඳින්න
                </div>
              )}
            </div>
          )}
        </div>

        <div className='dg-floating-stars'>
          <button type='button' className='dg-star-btn active' onClick={handlePlayGuide}>
            ⭐
          </button>

          <button
            type='button'
            className={`dg-star-btn ${animationComplete ? 'active' : 'inactive'}`}
            disabled={!animationComplete}
            onClick={handlePractice}
          >
            ✏️
          </button>

          <button
            type='button'
            className={`dg-star-btn ${animationComplete ? 'active' : 'inactive'}`}
            disabled={!animationComplete}
            onClick={handleCanvasMode}
          >
            ⭐
          </button>
        </div>

        {drawingMode && (
          <div className='dg-draw-instruction'>
            💧 තරු අනුපිළිවෙලට ඇඟිල්ල ගෙනයන්න
          </div>
        )}

        {drawSuccess && <div className='dg-draw-success'>🎉 හොඳයි! 🎉</div>}
      </section>
    </main>
  );
};

export default DysgraphiaLetterWA;