import React, { useState, useRef, useEffect } from 'react';
import '../styles/ShapesLearning.css';

// ===== DATA =====
const SHAPES = [
  {
    id: 'circle', name: 'රවුම', color: '#ff6b6b',
    display: () => <circle cx="150" cy="150" r="90" fill="none" stroke="#ff6b6b" strokeWidth="5" />,
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.arc(w / 2, h / 2, 90, 0, Math.PI * 2); ctx.stroke(); }
  },
  {
    id: 'rectangle', name: 'දිග හතරැස්', color: '#4ecdc4',
    display: () => <rect x="55" y="90" width="190" height="120" fill="none" stroke="#4ecdc4" strokeWidth="5" />,
    guide: (ctx, w, h) => ctx.strokeRect(w / 2 - 95, h / 2 - 60, 190, 120)
  },
  {
    id: 'square', name: 'සම හතරැස්', color: '#f7b731',
    display: () => <rect x="75" y="75" width="150" height="150" fill="none" stroke="#f7b731" strokeWidth="5" />,
    guide: (ctx, w, h) => ctx.strokeRect(w / 2 - 75, h / 2 - 75, 150, 150)
  },
  {
    id: 'triangle', name: 'ත්‍රිකෝණය', color: '#a29bfe',
    display: () => <polygon points="150,35 255,245 45,245" fill="none" stroke="#a29bfe" strokeWidth="5" />,
    guide: (ctx, w, h) => {
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2 - 105);
      ctx.lineTo(w / 2 + 105, h / 2 + 80);
      ctx.lineTo(w / 2 - 105, h / 2 + 80);
      ctx.closePath(); 
      ctx.stroke();
    }
  },
  {
    id: 'waves', name: 'රැළි', color: '#54a0ff',
    display: () => <path d="M20 150 Q55 95,90 150 T160 150 T230 150 T290 150" fill="none" stroke="#54a0ff" strokeWidth="5" />,
    guide: (ctx, w, h) => {
      ctx.beginPath(); 
      ctx.moveTo(18, h / 2);
      for (let x = 18; x < w - 18; x += 36) ctx.quadraticCurveTo(x + 18, h / 2 - 55, x + 36, h / 2);
      ctx.stroke();
    }
  },
  {
    id: 'upward', name: 'ඉහළ රේඛාව', color: '#fd79a8',
    display: () => <line x1="55" y1="245" x2="245" y2="55" stroke="#fd79a8" strokeWidth="5" />,
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.moveTo(w / 2 - 105, h / 2 + 90); ctx.lineTo(w / 2 + 105, h / 2 - 90); ctx.stroke(); }
  },
  {
    id: 'downward', name: 'පහළ රේඛාව', color: '#e17055',
    display: () => <line x1="55" y1="55" x2="245" y2="245" stroke="#e17055" strokeWidth="5" />,
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.moveTo(w / 2 - 105, h / 2 - 90); ctx.lineTo(w / 2 + 105, h / 2 + 90); ctx.stroke(); }
  },
];

const COLORS = ['#ff6b6b', '#fd79a8', '#e17055', '#f7b731', '#a29bfe', '#4ecdc4', '#54a0ff', '#00b894', '#6c5ce7', '#2d3436', '#636e72'];
const BRUSHES = [3, 6, 10, 16];

const CLOUDS = [
  { top: '8%', w: 180, cd: 30, delay: 0 },
  { top: '18%', w: 240, cd: 42, delay: 10 },
  { top: '5%', w: 130, cd: 26, delay: 18 },
  { top: '28%', w: 200, cd: 38, delay: 6 },
  { top: '55%', w: 160, cd: 50, delay: 22 },
  { top: '75%', w: 220, cd: 35, delay: 12 },
];

// ===== COMPONENT =====
const ShapesLearning = () => {
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [drawColor, setDrawColor] = useState('#a29bfe');
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Initialize canvas and draw guide when shape changes
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
    drawGuide(ctx, selectedShape);
  }, [selectedShape]);

  const drawGuide = (ctx, shape) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.strokeStyle = shape.color + '55'; // transparent version
    ctx.setLineDash([9, 8]);
    ctx.lineWidth = 4;
    shape.guide(ctx, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  };

  const clearCanvas = () => drawGuide(ctxRef.current, selectedShape);

  // Drawing handlers
  const handleStart = (e) => {
    const pos = getCanvasPos(e);
    if (!pos) return;
    setIsDrawing(true);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    const ctx = ctxRef.current;
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
    ctx.setLineDash([]);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  // Helper to extract coordinates from mouse/touch events
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  // Pencil cursor movement
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <>
      {/* BACKGROUND */}
      <div className="space-bg">
        {/* Sun */}
        <div className="sun">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="sun-ray" style={{ '--r': `${i * 45}deg` }} />
          ))}
        </div>
        <div className="rainbow" />

      

        {/* Clouds */}
        {CLOUDS.map((c, i) => (
          <div
            key={`cloud-${i}`}
            className="cloud-shape"
            style={{ top: c.top, left: '-300px', '--cd': `${c.cd}s`, animationDelay: `${c.delay}s` }}
          >
            <svg width={c.w} height={c.w * 0.45} viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="100" cy="65" rx="90" ry="28" fill="white" opacity="0.85" />
              <ellipse cx="70" cy="52" rx="45" ry="35" fill="white" opacity="0.85" />
              <ellipse cx="120" cy="48" rx="38" ry="32" fill="white" opacity="0.85" />
              <ellipse cx="150" cy="58" rx="30" ry="22" fill="white" opacity="0.85" />
            </svg>
          </div>
        ))}

        {/* Aliens */}
      
      </div>

      {/* MAIN CONTENT */}
      <div className="shapes-container">
        <div className="shapes-header">
          <h1>👽 හැඩතල ඉගෙන ගමු! 🌈</h1>
          <p className="header-subtitle">alien මිතුරන් සමඟ හැඩතල ඇඳීම ඉගෙන ගනිමු ⭐</p>
        </div>

        <div className="shapes-selector">
          {SHAPES.map(shape => (
            <button
              key={shape.id}
              className={`shape-btn ${selectedShape.id === shape.id ? 'active' : ''}`}
              onClick={() => setSelectedShape(shape)}
            >
              {shape.name}
            </button>
          ))}
        </div>

        <div className="shapes-display">
          {/* Left: shape preview */}
          <div className="shape-section">
            <h2>⭐ හැඩතලය</h2>
            <div className="shape-canvas">
              <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                {selectedShape.display()}
              </svg>
            </div>
          </div>

          {/* Right: drawing area */}
          <div className="shape-section">
            <h2>✏️ මෙහි අඳින්න</h2>
            <div
              className="pencil-drawing-area"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {/* Pencil cursor */}
              <svg
                className={`pencil-svg ${!isHovering ? 'hidden' : ''}`}
                style={{
                  left: `${cursorPos.x - 10}px`,
                  top: `${cursorPos.y - 44}px`
                }}
                viewBox="0 0 52 52"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(26,26) rotate(45) translate(-10,-26)">
                  <rect x="3" y="0" width="14" height="8" rx="3" fill="#FF69B4" stroke="#cc3380" strokeWidth="1.5" />
                  <rect x="3" y="7" width="14" height="5" rx="1" fill="#C0C0C0" stroke="#888" strokeWidth="1" />
                  <rect x="3" y="11" width="14" height="24" fill="#FFE600" stroke="#cc9900" strokeWidth="1.5" />
                  <rect x="5" y="11" width="3" height="24" fill="rgba(255,255,255,0.4)" rx="1" />
                  <polygon points="3,35 17,35 12,44 8,44" fill="#D4A574" stroke="#996633" strokeWidth="1.5" />
                  <polygon points="8,44 12,44 10,52" fill="#333" />
                </g>
              </svg>

              <canvas
                ref={canvasRef}
                className="drawing-canvas"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => { e.preventDefault(); handleStart(e); }}
                onTouchMove={(e) => { e.preventDefault(); handleMove(e); }}
                onTouchEnd={handleEnd}
              />
            </div>

            {/* Color picker */}
            <div className="color-picker">
              {COLORS.map(c => (
                <div
                  key={c}
                  className={`color-dot ${c === drawColor ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setDrawColor(c)}
                />
              ))}
            </div>

            {/* Brush size */}
            <div className="brush-label">🖌️ Brush Size</div>
            <div className="brush-sizes">
              {BRUSHES.map(bs => (
                <div
                  key={bs}
                  className={`brush-dot ${bs === brushSize ? 'selected' : ''}`}
                  style={{ width: bs + 10, height: bs + 10 }}
                  onClick={() => setBrushSize(bs)}
                />
              ))}
            </div>

            <button className="clear-btn" onClick={clearCanvas}>
              🗑️ ඉවත් කරන්න
            </button>
          </div>
        </div>

        <div className="instructions">
          <p>📝 <strong>{selectedShape.name}</strong> — ඉරි රේඛා අනුගමන කරලා අඳින්න! 👽🎯</p>
        </div>
      </div>
    </>
  );
};

export default ShapesLearning;