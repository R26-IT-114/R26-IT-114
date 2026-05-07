import React, { useState, useRef, useEffect } from 'react';
import '../styles/ShapesLearning.css';

// ===== DATA =====
const SHAPES = [
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
    id: 'star', name: 'තරුව', color: '#00b894',
    display: () => <polygon points="150,35 174,109 252,109 189,154 213,228 150,182 87,228 111,154 48,109 126,109" fill="none" stroke="#00b894" strokeWidth="5" strokeLinejoin="round" />,
    guide: (ctx, w, h) => {
      const points = [
        [w / 2, h / 2 - 105],
        [w / 2 + 24, h / 2 - 31],
        [w / 2 + 102, h / 2 - 31],
        [w / 2 + 39, h / 2 + 14],
        [w / 2 + 63, h / 2 + 88],
        [w / 2, h / 2 + 42],
        [w / 2 - 63, h / 2 + 88],
        [w / 2 - 39, h / 2 + 14],
        [w / 2 - 102, h / 2 - 31],
        [w / 2 - 24, h / 2 - 31],
      ];

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.closePath();
      ctx.stroke();
    }
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
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showRetryMessage, setShowRetryMessage] = useState(false);
  const [successRate, setSuccessRate] = useState(0);
  const [livePercentage, setLivePercentage] = useState(0);
  const audioRef = useRef(null);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const guideCanvasRef = useRef(null);

  // Initialize canvas and draw guide when shape changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Simple canvas setup without DPI scaling
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
    
    // Create guide canvas with same dimensions for detection
    if (!guideCanvasRef.current) {
      guideCanvasRef.current = document.createElement('canvas');
    }
    guideCanvasRef.current.width = canvas.width;
    guideCanvasRef.current.height = canvas.height;
    const guideCtx = guideCanvasRef.current.getContext('2d');
    guideCtx.lineCap = 'round';
    guideCtx.lineJoin = 'round';
    
    setDrawSuccess(false);
    setShowRetryMessage(false);
    
    // Draw dashed guide on visible canvas
    drawGuideVisible(ctx, selectedShape);
    
    // Draw solid guide on hidden canvas for detection
    drawGuideSolid(guideCtx, selectedShape);
  }, [selectedShape]);

  const drawGuideVisible = (ctx, shape) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.strokeStyle = shape.color + '55'; // transparent version
    ctx.setLineDash([9, 8]);
    ctx.lineWidth = 6; // Increased from 4 for better visibility
    shape.guide(ctx, width, height);
    ctx.restore();
  };

  const drawGuideSolid = (ctx, shape) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.strokeStyle = '#000000'; // Solid black for detection
    ctx.setLineDash([]);
    ctx.lineWidth = 8; // Thicker for easier detection
    shape.guide(ctx, width, height);
    ctx.restore();
  };

  const clearCanvas = () => {
    setLivePercentage(0);
    setDrawSuccess(false);
    setShowRetryMessage(false);
    drawGuideVisible(ctxRef.current, selectedShape);
  };

  // Drawing handlers
  const playErrorSound = () => {
    // Create simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playSuccessSound = () => {
    // Create cheerful ascending beep pattern
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G notes
    frequencies.forEach((freq, idx) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + idx * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + idx * 0.1 + 0.15);
      oscillator.start(audioContext.currentTime + idx * 0.1);
      oscillator.stop(audioContext.currentTime + idx * 0.1 + 0.15);
    });
  };

  const handleStart = (e) => {
    if (!ctxRef.current) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    setIsDrawing(true);
    setLivePercentage(0); // Reset percentage when starting new stroke
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMove = (e) => {
    if (!isDrawing || !ctxRef.current) return;
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
    
    // Show real-time coverage percentage while drawing
    updateLivePercentage();
  };

  const updateLivePercentage = () => {
    const canvas = canvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (!canvas || !guideCanvas) return;

    const ctx = canvas.getContext('2d');
    const guideCtx = guideCanvas.getContext('2d');
    
    const drawnData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const guideData = guideCtx.getImageData(0, 0, guideCanvas.width, guideCanvas.height);
    
    const drawnPixels = drawnData.data;
    const guidePixels = guideData.data;
    
    let guideCovered = 0;
    let guideTotal = 0;
    
    for (let i = 0; i < guidePixels.length; i += 4) {
      const guideAlpha = guidePixels[i + 3];
      if (guideAlpha > 200) {
        guideTotal++;
        const drawnAlpha = drawnPixels[i + 3];
        if (drawnAlpha > 100) {
          guideCovered++;
        }
      }
    }
    
    const coverage = guideTotal > 0 ? Math.round((guideCovered / guideTotal) * 100) : 0;
    setLivePercentage(coverage);
  };

  const checkDrawingSuccess = () => {
    const canvas = canvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (!canvas || !guideCanvas) return;

    const ctx = canvas.getContext('2d');
    const guideCtx = guideCanvas.getContext('2d');
    
    const drawnData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const guideData = guideCtx.getImageData(0, 0, guideCanvas.width, guideCanvas.height);
    
    const drawnPixels = drawnData.data;
    const guidePixels = guideData.data;
    
    let guideCovered = 0;
    let guideTotal = 0;
    
    for (let i = 0; i < guidePixels.length; i += 4) {
      const guideAlpha = guidePixels[i + 3];
      if (guideAlpha > 200) {
        guideTotal++;
        const drawnAlpha = drawnPixels[i + 3];
        if (drawnAlpha > 100) {
          guideCovered++;
        }
      }
    }
    
    const coverage = guideTotal > 0 ? Math.round((guideCovered / guideTotal) * 100) : 0;
    setSuccessRate(coverage);
    
    // Check side coverage for shapes with distinct edges
    const shapeId = selectedShape.id;
    const hasSideCoverage = checkSideCoverage(drawnData, drawnPixels, guidePixels);
    
    // For rectangle, square, triangle: must have good side coverage
    const requiresSideCheck = ['rectangle', 'square', 'triangle'].includes(shapeId);
    
    if (coverage >= 50 && (!requiresSideCheck || hasSideCoverage)) {
      setDrawSuccess(true);
      setShowRetryMessage(false);
      playSuccessSound();
    } else if (coverage < 50 || (requiresSideCheck && !hasSideCoverage)) {
      setShowRetryMessage(true);
      playErrorSound();
      // Show retry sad faces - no auto-clear, user must retry manually
    }
  };

  const checkSideCoverage = (imageData, pixels, guidePixels) => {
    const width = imageData.width;
    const height = imageData.height;
    const margin = 15; // Slightly smaller margin for more lenient detection
    
    // Divide into regions: top, bottom, left, right (slightly larger regions)
    const regions = {
      top: { startX: margin, startY: margin, endX: width - margin, endY: height * 0.4, pixels: 0 },
      bottom: { startX: margin, startY: height * 0.55, endX: width - margin, endY: height - margin, pixels: 0 },
      left: { startX: margin, startY: margin, endX: width * 0.35, endY: height - margin, pixels: 0 },
      right: { startX: width * 0.65, startY: margin, endX: width - margin, endY: height - margin, pixels: 0 },
    };
    
    // Count drawn pixels in each region, but only when near the guide path
    const proximityRadius = 8; // pixels
    const isNearGuide = (px, py) => {
      const r = proximityRadius;
      const minX = Math.max(0, px - r);
      const maxX = Math.min(width - 1, px + r);
      const minY = Math.max(0, py - r);
      const maxY = Math.min(height - 1, py + r);

      for (let yy = minY; yy <= maxY; yy++) {
        for (let xx = minX; xx <= maxX; xx++) {
          const gIdx = (yy * width + xx) * 4;
          if (guidePixels[gIdx + 3] > 100) return true;
        }
      }
      return false;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = pixels[idx + 3];

        if (alpha > 100 && isNearGuide(x, y)) {
          Object.values(regions).forEach(region => {
            if (x >= region.startX && x <= region.endX && y >= region.startY && y <= region.endY) {
              region.pixels++;
            }
          });
        }
      }
    }
    
    // Check if each side has sufficient coverage (lowered threshold for more lenient detection)
    const sideCoverages = Object.values(regions).map(r => (r.pixels > 20 ? 1 : 0));
    const coveredSides = sideCoverages.reduce((a, b) => a + b, 0);
    
    return coveredSides >= 3; // At least 3 out of 4 sides
  };

  const handleEnd = () => {
    setIsDrawing(false);
    // Check success after drawing ends
    setTimeout(() => checkDrawingSuccess(), 100);
  };

  // Helper to extract coordinates from mouse/touch events
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return { 
      x: clientX - rect.left, 
      y: clientY - rect.top 
    };
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
          <h1> හැඩතල ඉගෙන ගමු! </h1>
          <p className="header-subtitle">alien මිතුරන් සමඟ හැඩතල ඇඳීම ඉගෙන ගනිමු </p>
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
            {isDrawing || livePercentage > 0 ? (
              <h2 className="live-percentage-header">Coverage: {livePercentage}%</h2>
            ) : (
              <h2>✏️ මෙහි අඳින්න</h2>
            )}
            <div className="drawing-area-wrapper">
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

            {drawSuccess && (
              <div className="shape-success-stars">
                <span className="success-star" style={{ '--delay': '0.1s' }}>⭐</span>
                <span className="success-star" style={{ '--delay': '0.3s' }}>⭐</span>
                <span className="success-star" style={{ '--delay': '0.5s' }}>⭐</span>
              </div>
            )}

            {showRetryMessage && (
              <div className="shape-retry-stars">
                <span className="retry-star" style={{ '--delay': '0.1s' }}>😢</span>
                <span className="retry-star" style={{ '--delay': '0.3s' }}>😢</span>
                <span className="retry-star" style={{ '--delay': '0.5s' }}>😢</span>
              </div>
            )}

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