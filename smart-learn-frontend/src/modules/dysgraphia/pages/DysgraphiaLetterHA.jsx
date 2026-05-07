import { useEffect, useRef, useState } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useNavigate } from 'react-router-dom';

import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-letter-ta.css';

import fingerPointer from '../../../assets/images/finger.png';

const ANIMATION_DURATION_MS = 1200;

const HA_GUIDE_PATH =
  'M 240 120 C 180 200 185 330 255 425 C 320 515 450 520 525 445 C 580 390 575 285 510 225 C 455 175 360 185 305 255 C 265 310 270 390 345 435';

const START_MARKER = { x: 240, y: 120 };
const END_MARKER = { x: 345, y: 435 };

const PEN_CURSOR = `url("data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
<path d='M3 21l2.5-2.5L18 6l-3-3L2.5 15.5 3 21z' fill='black'/>
</svg>") 0 24, auto`;

const DysgraphiaLetterHA = () => {
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

  const [pointerPos, setPointerPos] = useState({
    x: -100,
    y: -100,
  });

  const [feedback, setFeedback] = useState(null);

  const handleAudio = () => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance('හ');
    utterance.lang = 'si-LK';

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let frameId;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const nextProgress = elapsed / ANIMATION_DURATION_MS;

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
    } catch (err) {
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
          <h1 onClick={handleAudio}>‘හ’ අක්ෂරය හුරු කරමු</h1>
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
                d={HA_GUIDE_PATH}
                className='dg-chain-path'
                stroke='rgba(255,255,255,0.2)'
                fill='none'
                strokeWidth='32'
                strokeLinecap='round'
                strokeLinejoin='round'
              />

              <path
                ref={letterPathRef}
                d={HA_GUIDE_PATH}
                fill='none'
                stroke='none'
              />

              <path
                d={HA_GUIDE_PATH}
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
              <h3>✍️ දැන් “හ” අක්ෂරය ඔබම අඳින්න</h3>

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
                  style={{
                    cursor: PEN_CURSOR,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <button
                  className='dg-ctl-btn'
                  onClick={() => canvasRef.current?.clearCanvas()}
                >
                  🧹 මකන්න
                </button>

                <button
                  className='dg-ctl-btn'
                  onClick={submitCanvasForEvaluation}
                >
                  ✅ පරීක්ෂා කරන්න
                </button>
              </div>

              {feedback === 'correct' && (
                <div
                  style={{
                    color: '#00ff99',
                    textAlign: 'center',
                    marginTop: 20,
                    fontSize: 26,
                    fontWeight: 'bold',
                  }}
                >
                  🎉 හරි! ඉතා හොඳයි!
                </div>
              )}

              {feedback === 'wrong' && (
                <div
                  style={{
                    color: '#ff5252',
                    textAlign: 'center',
                    marginTop: 20,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  ❌ නැවත උත්සාහ කරන්න
                </div>
              )}

              {feedback === 'empty' && (
                <div
                  style={{
                    color: '#ffd54f',
                    textAlign: 'center',
                    marginTop: 20,
                    fontSize: 22,
                    fontWeight: 'bold',
                  }}
                >
                  ⚠️ මුලින් අඳින්න
                </div>
              )}
            </div>
          )}
        </div>

        <div className='dg-floating-stars'>
          <button
            type='button'
            className='dg-star-btn active'
            onClick={handlePlayGuide}
          >
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

        {drawSuccess && (
          <div className='dg-draw-success'>🎉 හොඳයි! 🎉</div>
        )}
      </section>
    </main>
  );
};

export default DysgraphiaLetterHA;