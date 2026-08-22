import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/node-letter-challenge.css';

const VIEWBOX_WIDTH = 640;
const VIEWBOX_HEIGHT = 580;
const TARGET_LETTER = 'ට';
const LETTER_PATH = 'M 320 280 C 180 280 140 440 280 500 C 460 560 560 340 460 180 C 380 40 200 60 160 200';
const NODE_COUNT = 18;
// Slightly larger hit radius on touch devices — fingers are less precise than a mouse.
const HIT_RADIUS = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 34 : 27;
const PASS_PERCENT = 75;

const makeStroke = () => ({ id: `${Date.now()}-${Math.random()}`, points: [] });

const NodeLetterChallenge = () => {
  const navigate = useNavigate();
  const pathRef = useRef(null);
  const boardRef = useRef(null);
  const drawingRef = useRef(false);
  const [stage, setStage] = useState('guide');
  const [nodes, setNodes] = useState([]);
  const [covered, setCovered] = useState(() => new Set());
  const [strokes, setStrokes] = useState([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    setNodes(Array.from({ length: NODE_COUNT }, (_, index) => {
      const point = path.getPointAtLength((index / (NODE_COUNT - 1)) * length);
      return { x: point.x, y: point.y };
    }));
  }, []);

  // Stop the page/board from being pinch-zoomed or pulled-to-refresh while
  // a child is actively tracing on a phone or tablet.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;
    const preventTouchScroll = (event) => {
      if (drawingRef.current) event.preventDefault();
    };
    board.addEventListener('touchmove', preventTouchScroll, { passive: false });
    return () => board.removeEventListener('touchmove', preventTouchScroll);
  }, []);

  const isMemoryStage = stage === 'memory';
  const coveragePercent = nodes.length ? Math.round((covered.size / nodes.length) * 100) : 0;

  const pointFromEvent = (event) => {
    const rect = boardRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
    };
  };

  // Coverage only matters once nodes are hidden (memory stage) — that's the
  // stage that actually scores the child's recall of the letter shape.
  const coverNearbyNodes = (point) => {
    if (!isMemoryStage) return;
    setCovered((current) => {
      const next = new Set(current);
      nodes.forEach((node, index) => {
        if (Math.hypot(point.x - node.x, point.y - node.y) <= HIT_RADIUS) next.add(index);
      });
      return next;
    });
  };

  const startDrawing = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setChecked(false);
    const point = pointFromEvent(event);
    coverNearbyNodes(point);
    setStrokes((current) => [...current, { ...makeStroke(), points: [point] }]);
  };

  const continueDrawing = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    coverNearbyNodes(point);
    setStrokes((current) => {
      if (!current.length) return current;
      const next = [...current];
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, points: [...last.points, point] };
      return next;
    });
  };

  const stopDrawing = (event) => {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const clearBoard = () => {
    setCovered(new Set());
    setStrokes([]);
    setChecked(false);
  };

  const startMemoryStage = () => {
    setStage('memory');
    clearBoard();
  };

  const passed = coveragePercent >= PASS_PERCENT;

  return (
    <main className="dg-shell dg-theme-a nlc-page">
      <div className="nlc-decoration" aria-hidden="true"><span>⭐</span><span>☁️</span><span>🌈</span><span>✏️</span></div>
      <header className="nlc-header">
        <button type="button" className="nlc-back" onClick={() => navigate('/dysgraphia/progress')}>← ආපහු</button>
        <div><h1>“{TARGET_LETTER}” අකුර සම්පූර්ණ කරමු!</h1></div>
        <div className="nlc-stage-pill">{stage === 'guide' ? '1 / 2 · තිත් සමඟ' : '2 / 2 · මතකයෙන්'}</div>
      </header>

      <section className="nlc-game-card">

        {stage === 'guide' ? (
          <div className="nlc-guide-message"> පළමු තිතෙන් පටන්ගෙන සියලුම තිත් එකට යා කරන්න. </div>
        ) : (
          <div className="nlc-progress-row"><span>ආවරණය කළ සැඟවුණු තිත්</span><strong>{covered.size} / {nodes.length}</strong><div className="nlc-progress"><span style={{ width: `${coveragePercent}%` }} /></div><b>{coveragePercent}%</b></div>
        )}

        <div className="nlc-board-frame">
          <div className={`nlc-board ${isMemoryStage ? 'nlc-board-memory' : ''}`}>
            <svg
              ref={boardRef}
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`Draw the Sinhala letter ${TARGET_LETTER}`}
              style={{ touchAction: 'none' }}
              onPointerDown={startDrawing}
              onPointerMove={continueDrawing}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={(event) => { if (drawingRef.current && event.buttons === 0) stopDrawing(event); }}
            >
              <path ref={pathRef} d={LETTER_PATH} fill="none" stroke="transparent" />
              {/* Letter shape is always visible — with nodes in stage 1, without them in stage 2 */}
              <path d={LETTER_PATH} className="nlc-letter-shape" />
              {stage === 'guide' && <path d={LETTER_PATH} className="nlc-guide-path" />}
              {stage === 'guide' && nodes.map((node, index) => <g key={`${node.x}-${node.y}`} className={covered.has(index) ? 'is-covered' : ''}><circle className="nlc-node-ring" cx={node.x} cy={node.y} r="12" /><circle className="nlc-node-dot" cx={node.x} cy={node.y} r="5" />{index === 0 && <text x={node.x} y={node.y - 20} textAnchor="middle">START</text>}</g>)}
              {strokes.map((stroke) => <polyline key={stroke.id} className="nlc-child-stroke" points={stroke.points.map((point) => `${point.x},${point.y}`).join(' ')} />)}
            </svg>
          </div>
        </div>

        {checked && <div className={`nlc-result ${passed ? 'is-pass' : 'is-retry'}`}><span>{passed ? '🌟' : '💪'}</span><div><strong>{passed ? 'සුපිරි වැඩක්!' : 'තව ටිකක් පුහුණු වෙමු!'}</strong><p>ඔබ තිත් {covered.size} ක් ආවරණය කළා — මුළු ලකුණු {coveragePercent}%.</p></div></div>}

        <div className="nlc-actions">
          <button type="button" className="nlc-button nlc-button-light" onClick={clearBoard}>🗑️ මකන්න</button>
          {stage === 'guide' ? <button type="button" className="nlc-button nlc-button-main" disabled={!strokes.length} onClick={startMemoryStage}>තිත් සඟවා ලියමු →</button> : <button type="button" className="nlc-button nlc-button-main" disabled={!strokes.length} onClick={() => setChecked(true)}>මගේ ලකුණු බලමු 🎯</button>}
        </div>

      </section>
    </main>
  );
};

export default NodeLetterChallenge;