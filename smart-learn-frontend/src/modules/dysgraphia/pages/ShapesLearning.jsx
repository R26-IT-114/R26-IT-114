import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import shapeAudio from '../../../assets/audio/shape.mp3';
import '../styles/ShapesLearning.css';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { dysgraphiaService } from '../services/dysgraphiaService';

// ===== DATA =====
const SHAPES = [
  {
    id: 'straightline', name: 'සරල රේඛාව', color: '#6c5ce7',
    display: () => (<line x1="50" y1="150" x2="250" y2="150" stroke="#6c5ce7" strokeWidth="5" />),
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.moveTo(w / 2 - 100, h / 2); ctx.lineTo(w / 2 + 100, h / 2); ctx.stroke(); }
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
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 105); ctx.lineTo(w / 2 + 105, h / 2 + 80); ctx.lineTo(w / 2 - 105, h / 2 + 80); ctx.closePath(); ctx.stroke(); }
  },
  {
    id: 'circle', name: 'රවුම', color: '#ff6b6b',
    display: () => <circle cx="150" cy="150" r="90" fill="none" stroke="#ff6b6b" strokeWidth="5" />,
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.arc(w / 2, h / 2, 90, 0, Math.PI * 2); ctx.stroke(); }
  },
  {
    id: 'waves', name: 'රැළි', color: '#54a0ff',
    display: () => <path d="M20 150 Q55 95,90 150 T160 150 T230 150 T290 150" fill="none" stroke="#54a0ff" strokeWidth="5" />,
    guide: (ctx, w, h) => { ctx.beginPath(); ctx.moveTo(18, h / 2); for (let x = 18; x < w - 18; x += 36) ctx.quadraticCurveTo(x + 18, h / 2 - 55, x + 36, h / 2); ctx.stroke(); }
  },
  {
    id: 'star', name: 'තරුව', color: '#00b894',
    display: () => <polygon points="150,35 174,109 252,109 189,154 213,228 150,182 87,228 111,154 48,109 126,109" fill="none" stroke="#00b894" strokeWidth="5" strokeLinejoin="round" />,
    guide: (ctx, w, h) => {
      const points = [
        [w / 2, h / 2 - 105], [w / 2 + 24, h / 2 - 31], [w / 2 + 102, h / 2 - 31],
        [w / 2 + 39, h / 2 + 14], [w / 2 + 63, h / 2 + 88], [w / 2, h / 2 + 42],
        [w / 2 - 63, h / 2 + 88], [w / 2 - 39, h / 2 + 14], [w / 2 - 102, h / 2 - 31],
        [w / 2 - 24, h / 2 - 31]
      ];
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
      ctx.closePath();
      ctx.stroke();
    }
  },
];

const COLORS = ['#ff6b6b', '#fd79a8', '#e17055', '#f7b731', '#a29bfe', '#4ecdc4', '#54a0ff', '#00b894', '#6c5ce7', '#2d3436', '#636e72'];
const BRUSHES = [3, 6, 10, 16];
const GALAXY_NEBULAS = [
  { top: '6%', left: '-8%', width: '34rem', height: '26rem', color: 'rgba(255, 72, 234, 0.28)', delay: '0s', duration: '18s' },
  { top: '14%', left: '28%', width: '30rem', height: '24rem', color: 'rgba(96, 155, 255, 0.24)', delay: '2s', duration: '22s' },
  { top: '44%', left: '18%', width: '42rem', height: '28rem', color: 'rgba(153, 112, 255, 0.24)', delay: '1s', duration: '26s' },
  { top: '30%', left: '66%', width: '24rem', height: '20rem', color: 'rgba(255, 58, 166, 0.18)', delay: '4s', duration: '20s' },
  { top: '68%', left: '56%', width: '28rem', height: '18rem', color: 'rgba(79, 215, 255, 0.18)', delay: '3s', duration: '24s' },
];

const GALAXY_STARS = Array.from({ length: 56 }, (_, i) => ({
  id: i,
  top: `${(i * 17) % 100}%`,
  left: `${(i * 31 + 7) % 100}%`,
  size: `${(i % 4) + 1}px`,
  delay: `${(i % 7) * 0.45}s`,
  duration: `${2.4 + (i % 5) * 0.65}s`,
  opacity: 0.35 + (i % 6) * 0.1,
}));

const GALAXY_COMETS = [
  { top: '18%', left: '12%', delay: '1s', duration: '8s' },
  { top: '54%', left: '72%', delay: '4.5s', duration: '10s' },
  { top: '74%', left: '24%', delay: '7s', duration: '9s' },
];

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.error?.message || error?.message || fallbackMessage;

// ===== Generate dense guide points for accurate path-following detection =====
const generateGuidePoints = (shape, width, height) => {
  const points = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const step = 5; // small step for dense sampling

  const addLine = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push({ x: x1 + dx * t, y: y1 + dy * t });
    }
  };

  const addQuadratic = (x0, y0, cx, cy, x1, y1, steps = 30) => {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1;
      const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
      points.push({ x, y });
    }
  };

  switch (shape.id) {
    case 'straightline':
      addLine(centerX - 100, centerY, centerX + 100, centerY);
      break;
    case 'upward':
      addLine(centerX - 105, centerY + 90, centerX + 105, centerY - 90);
      break;
    case 'downward':
      addLine(centerX - 105, centerY - 90, centerX + 105, centerY + 90);
      break;
    case 'rectangle': {
      const l = centerX - 95, r = centerX + 95, t = centerY - 60, b = centerY + 60;
      addLine(l, t, r, t); addLine(r, t, r, b); addLine(r, b, l, b); addLine(l, b, l, t);
      break;
    }
    case 'square': {
      const l = centerX - 75, r = centerX + 75, t = centerY - 75, b = centerY + 75;
      addLine(l, t, r, t); addLine(r, t, r, b); addLine(r, b, l, b); addLine(l, b, l, t);
      break;
    }
    case 'triangle': {
      const tip = { x: centerX, y: centerY - 105 };
      const left = { x: centerX - 105, y: centerY + 80 };
      const right = { x: centerX + 105, y: centerY + 80 };
      addLine(tip.x, tip.y, left.x, left.y);
      addLine(left.x, left.y, right.x, right.y);
      addLine(right.x, right.y, tip.x, tip.y);
      break;
    }
    case 'circle': {
      const r = 90;
      for (let ang = 0; ang < 2 * Math.PI; ang += 0.1) {
        points.push({ x: centerX + r * Math.cos(ang), y: centerY + r * Math.sin(ang) });
      }
      break;
    }
    case 'waves': {
      const midY = height / 2;
      for (let seg = 0; seg < 8; seg++) {
        const x0 = 18 + seg * 36;
        const cx = x0 + 18;
        const cy = midY - 55;
        const x1 = x0 + 36;
        addQuadratic(x0, midY, cx, cy, x1, midY, 20);
      }
      break;
    }
    case 'star': {
      const starPoints = [
        { x: centerX, y: centerY - 105 }, { x: centerX + 24, y: centerY - 31 }, { x: centerX + 102, y: centerY - 31 },
        { x: centerX + 39, y: centerY + 14 }, { x: centerX + 63, y: centerY + 88 }, { x: centerX, y: centerY + 42 },
        { x: centerX - 63, y: centerY + 88 }, { x: centerX - 39, y: centerY + 14 }, { x: centerX - 102, y: centerY - 31 },
        { x: centerX - 24, y: centerY - 31 }
      ];
      for (let i = 0; i < starPoints.length; i++) {
        const p1 = starPoints[i];
        const p2 = starPoints[(i + 1) % starPoints.length];
        addLine(p1.x, p1.y, p2.x, p2.y);
      }
      break;
    }
    default: break;
  }
  return points;
};

// ===== MAIN COMPONENT =====
const ShapesLearning = () => {
  const navigate = useNavigate();
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [completedShapeIds, setCompletedShapeIds] = useState([]);
  const [unlockedShapeIds, setUnlockedShapeIds] = useState([SHAPES[0].id]);
  const [newlyUnlockedShapeId, setNewlyUnlockedShapeId] = useState(null);
  const [awardedStars, setAwardedStars] = useState(0);
  const [drawColor, setDrawColor] = useState('#a29bfe');
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawSuccess, setDrawSuccess] = useState(false);
  const [showRetryMessage, setShowRetryMessage] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [liveCoverage, setLiveCoverage] = useState(0);
  const [liveStray, setLiveStray] = useState(0);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const guidePointsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const [flyingStars, setFlyingStars] = useState([]);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);
  const rewardBoxRef = useRef(null);
  const flyIdRef = useRef(0);
  const finalCelebrationPlayedRef = useRef(false);
  const celebrationTimerRef = useRef(null);
  const pageAudioRef = useRef(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const totalGems = Math.floor(totalStars / 20);

  useEffect(() => {
    const audio = new Audio(shapeAudio);
    audio.volume = 0.9;
    pageAudioRef.current = audio;

    if (!hasStartedGame) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsVoicePlaying(true))
          .catch(() => {
            // Ignore autoplay blocks; user can still interact with page normally.
            setIsVoicePlaying(false);
          });
      } else {
        setIsVoicePlaying(!audio.paused);
      }
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
      pageAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hasStartedGame) return;
    const audio = pageAudioRef.current;
    if (!audio) return;
    audio.pause();
    setIsVoicePlaying(false);
  }, [hasStartedGame]);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (completedShapeIds.length === SHAPES.length && !finalCelebrationPlayedRef.current) {
      finalCelebrationPlayedRef.current = true;
      setShowFinalCelebration(true);
      playFinalCelebrationSound();
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = setTimeout(() => {
        setShowFinalCelebration(false);
      }, 2800);
    }
  }, [completedShapeIds]);

  // Initialize canvas and guide on shape change
  useEffect(() => {
    const init = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctxRef.current = ctx;
      guidePointsRef.current = generateGuidePoints(selectedShape, canvas.width, canvas.height);
      drawGuideVisible(ctx);
      setDrawSuccess(false);
      setShowRetryMessage(false);
      setRetryMessage('');
      setAwardedStars(0);
      setLiveCoverage(0);
      setLiveStray(0);
    };
    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, [selectedShape]);

  const drawGuideVisible = (ctx) => {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.strokeStyle = selectedShape.color + '55';
    ctx.setLineDash([9, 8]);
    ctx.lineWidth = 6;
    selectedShape.guide(ctx, w, h);
    ctx.restore();
  };

  const clearCanvas = () => {
    if (!ctxRef.current) return;
    drawGuideVisible(ctxRef.current);
    setLiveCoverage(0);
    setLiveStray(0);
    setDrawSuccess(false);
    setShowRetryMessage(false);
    setRetryMessage('');
    setAwardedStars(0);
  };

  const getStarsFromCoverage = (coverage) => {
    if (coverage > 85) return 3;
    if (coverage > 60) return 2;
    if (coverage > 50) return 1;
    return 0;
  };

  // Advanced checking: returns { coverage, strayRatio }
  const checkAccuracy = (radius = 12) => {
    const canvas = canvasRef.current;
    if (!canvas) return { coverage: 0, strayRatio: 1 };
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const w = canvas.width, h = canvas.height;

    // Precompute distance to nearest guide point for each drawn pixel (coarse)
    const guide = guidePointsRef.current;
    if (guide.length === 0) return { coverage: 0, strayRatio: 1 };

    // 1) coverage: % of guide points that have drawn pixel within radius
    let coveredGuide = 0;
    for (const gp of guide) {
      const px = Math.floor(gp.x), py = Math.floor(gp.y);
      let found = false;
      for (let dy = -radius; dy <= radius && !found; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x = px + dx, y = py + dy;
          if (x >= 0 && x < w && y >= 0 && y < h) {
            const idx = (y * w + x) * 4 + 3;
            if (pixels[idx] > 100) { found = true; break; }
          }
        }
      }
      if (found) coveredGuide++;
    }
    const coverage = (coveredGuide / guide.length) * 100;

    // 2) stray ratio: % of drawn pixels that are far from ANY guide point
    let totalDrawnPixels = 0;
    let strayPixels = 0;
    const strayDist = radius * 0.5; // further than 1.5x radius = stray
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4 + 3;
        if (pixels[idx] > 100) {
          totalDrawnPixels++;
          // check distance to nearest guide point
          let minDistSq = Infinity;
          for (const gp of guide) {
            const dx = x - gp.x, dy = y - gp.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < minDistSq) minDistSq = d2;
          }
          if (minDistSq > strayDist * strayDist) strayPixels++;
        }
      }
    }
    const strayRatio = totalDrawnPixels === 0 ? 1 : strayPixels / totalDrawnPixels;
    return { coverage, strayRatio: strayRatio * 100 };
  };

  const updateLiveStats = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      const { coverage, strayRatio } = checkAccuracy(12);
      setLiveCoverage(Math.min(100, Math.round(coverage)));
      setLiveStray(Math.min(100, Math.round(strayRatio)));
      animationFrameRef.current = null;
    });
  };

  const finalCheck = async () => {
    const { coverage, strayRatio } = checkAccuracy(12);
    // Success: at least 55% path coverage AND less than 45% stray marks
    const success = (coverage >= 55) && (strayRatio <= 45);
    if (success) {
      try {
        const isFirstRewardForShape = !completedShapeIds.includes(selectedShape.id);
        const response = await dysgraphiaService.recordShapeActivity({
          shapeId: selectedShape.id,
          coverage,
          strayRatio,
          durationSeconds: 0,
          clientMetrics: {
            liveCoverage,
            liveStray,
            brushSize,
            drawColor,
          },
        });
        const stars = response?.starsEarned ?? getStarsFromCoverage(coverage);

        setDrawSuccess(true);
        setShowRetryMessage(false);
        setRetryMessage('');
        setAwardedStars(stars);
        setCompletedShapeIds((prev) => {
          if (prev.includes(selectedShape.id)) return prev;
          return [...prev, selectedShape.id];
        });
        setUnlockedShapeIds((prev) => {
          const currentIndex = SHAPES.findIndex((shape) => shape.id === selectedShape.id);
          const nextShape = SHAPES[currentIndex + 1];
          if (!nextShape || prev.includes(nextShape.id)) return prev;
          setNewlyUnlockedShapeId(nextShape.id);
          if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
          unlockTimerRef.current = setTimeout(() => {
            setNewlyUnlockedShapeId(null);
          }, 1800);
          return [...prev, nextShape.id];
        });
        playSuccessSound();

        if (isFirstRewardForShape && stars > 0) {
          setTimeout(() => {
            const box = rewardBoxRef.current?.getBoundingClientRect();
            const canvas = canvasRef.current?.getBoundingClientRect();
            if (!box || !canvas) return;
            const startX = canvas.left + canvas.width / 2;
            const startY = canvas.top + canvas.height / 2;
            const endX = box.left + box.width / 2;
            const endY = box.top + box.height / 2;
            const dx = endX - startX;
            const dy = endY - startY;
            const newFlying = Array.from({ length: stars }, (_, i) => ({
              id: (flyIdRef.current += 1),
              startX, startY, dx, dy,
              delay: i * 0.18,
            }));
            setFlyingStars((prev) => [...prev, ...newFlying]);
            const landTime = 900 + stars * 180 + 100;
            setTimeout(() => {
              playRewardSound();
              awardStars(stars);
              setFlyingStars((prev) => prev.filter((star) => !newFlying.some((nextStar) => nextStar.id === star.id)));
            }, landTime);
          }, 700);
        }
      } catch (error) {
        setDrawSuccess(false);
        setShowRetryMessage(true);
        setRetryMessage(getErrorMessage(error, 'හැඩය සුරකින්න බැරිවුණා. නැවත උත්සාහ කරන්න.'));
        setAwardedStars(0);
        playErrorSound();
      }
    } else {
      setShowRetryMessage(true);
      setRetryMessage('');
      setAwardedStars(0);
      playErrorSound();
    }
  };

  const handleShapeSelect = (shape) => {
    if (!unlockedShapeIds.includes(shape.id)) return;
    setSelectedShape(shape);
  };

  const playErrorSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 400; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.2);
  };

  const playSuccessSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [523.25, 659.25, 783.99];
    freqs.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.frequency.value = f;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.15);
      osc.start(audioCtx.currentTime + i * 0.1);
      osc.stop(audioCtx.currentTime + i * 0.1 + 0.15);
    });
  };

  const playRewardSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const freqs = [784, 988, 1175, 1319];
      freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = f;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.07 + 0.22);
        osc.start(audioCtx.currentTime + i * 0.07);
        osc.stop(audioCtx.currentTime + i * 0.07 + 0.22);
      });
    } catch (e) { /* ignore audio errors */ }
  };

  const playFinalCelebrationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51];

      fanfare.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        gain.gain.setValueAtTime(0.001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.35);
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.36);
      });

      for (let i = 0; i < 4; i++) {
        const bufferSize = audioCtx.sampleRate * 0.14;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize);
        }
        const noise = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        const gain = audioCtx.createGain();
        noise.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.value = 1400 + i * 250;
        filter.Q.value = 0.8;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        const start = now + 0.72 + i * 0.11;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        noise.start(start);
        noise.stop(start + 0.16);
      }
    } catch (e) { /* ignore audio errors */ }
  };

  const handleStart = (e) => {
    if (!ctxRef.current) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    if (!hasStartedGame) setHasStartedGame(true);
    setIsDrawing(true);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleVoiceToggle = () => {
    const audio = pageAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsVoicePlaying(true))
        .catch(() => setIsVoicePlaying(false));
      return;
    }

    audio.pause();
    setIsVoicePlaying(false);
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
    updateLiveStats();
  };

  const handleEnd = () => {
    setIsDrawing(false);
    setTimeout(() => {
      void finalCheck();
    }, 100);
  };

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
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  return (
    <>
      {/* Animated galaxy background */}
      <div className="space-bg">
        <div className="space-vignette" />
        <div className="space-core-glow" />
        {GALAXY_NEBULAS.map((nebula, index) => (
          <div
            key={index}
            className="galaxy-nebula"
            style={{
              top: nebula.top,
              left: nebula.left,
              width: nebula.width,
              height: nebula.height,
              '--nebula-color': nebula.color,
              '--nebula-delay': nebula.delay,
              '--nebula-duration': nebula.duration,
            }}
          />
        ))}
        {GALAXY_STARS.map((star) => (
          <span
            key={star.id}
            className="space-star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              '--star-delay': star.delay,
              '--star-duration': star.duration,
              opacity: star.opacity,
            }}
          />
        ))}
        {GALAXY_COMETS.map((comet, index) => (
          <span
            key={index}
            className="space-comet"
            style={{
              top: comet.top,
              left: comet.left,
              '--comet-delay': comet.delay,
              '--comet-duration': comet.duration,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className="shape-back-btn"
        onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}
        aria-label="Go to dysgraphia home"
        title="ඩිස්ග්‍රාෆියා මුල් පිටුවට යන්න"
      >
        <span className="shape-back-btn-icon" aria-hidden="true">←</span>
        <span>ආපසු</span>
      </button>

      <button
        type="button"
        className={`shape-audio-toggle-btn ${isVoicePlaying ? 'is-playing' : ''}`}
        onClick={handleVoiceToggle}
        aria-label={isVoicePlaying ? 'Stop instructions' : 'Play instructions'}
        title="උපදෙස් අසන්න (Listen to instructions)"
      >
        <span className="shape-audio-toggle-icon" aria-hidden="true">
          {isVoicePlaying ? (
            <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
              <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" />
              <path d="M16 8l5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M21 8l-5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" focusable="false">
              <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" />
              <path d="M16 9.5a4 4 0 010 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18.5 7a8 8 0 010 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>

      <div className="shapes-container">
        <div className="shapes-header"><h1>හැඩතල ඉගෙන ගමු!</h1></div>

        <div className="reward-box" ref={rewardBoxRef}>
          <div className="reward-trophy">🏆</div>
          <div className="reward-metrics">
            <div className="reward-metric">
              <div className="reward-icon">⭐</div>
              <div className={`reward-count${rewardPulse ? ' reward-pulse' : ''}`}>{totalStars}</div>
              <div className="reward-label">Stars</div>
            </div>
            <div className="reward-divider" aria-hidden="true" />
            <div className="reward-metric">
              <div className="reward-icon">💎</div>
              <div className="reward-count reward-count-gem">{totalGems}</div>
              <div className="reward-label">Gems</div>
            </div>
          </div>
        </div>

        <div className="shapes-selector">
          {SHAPES.map(shape => (
            <button
              key={shape.id}
              type="button"
              disabled={!unlockedShapeIds.includes(shape.id)}
              className={`shape-btn ${selectedShape.id === shape.id ? 'active' : ''} ${completedShapeIds.includes(shape.id) ? 'completed' : ''} ${!unlockedShapeIds.includes(shape.id) ? 'locked' : ''} ${newlyUnlockedShapeId === shape.id ? 'unlock-burst' : ''}`}
              onClick={() => handleShapeSelect(shape)}
            >
              {newlyUnlockedShapeId === shape.id && (
                <>
                  <span className="unlock-spark unlock-spark-1">✨</span>
                  <span className="unlock-spark unlock-spark-2">⭐</span>
                  <span className="unlock-spark unlock-spark-3">✨</span>
                </>
              )}
              {completedShapeIds.includes(shape.id) ? ' ' : !unlockedShapeIds.includes(shape.id) ? '🔒 ' : ''}
              {shape.name}
            </button>
          ))}
        </div>

        <div className="shapes-display">
          <div className="shape-section">
            <h2>⭐ හැඩතලය</h2>
            <div className="shape-canvas"><svg viewBox="0 0 300 300">{selectedShape.display()}</svg></div>
          </div>

          <div className="shape-section">
            {/* {isDrawing || (liveCoverage > 0 || liveStray > 0) ? (
              <h2 className="live-percentage-header">මාර්ග ආවරණය: {liveCoverage}% &nbsp;|&nbsp; අමතර ඉරි: {liveStray}%</h2>
            ) : (
              <h2>✏️ මෙහි අඳින්න</h2>
            )} */}
            <h2>✏️ මෙහි අඳින්න</h2>
            <div className="drawing-area-wrapper">
              <canvas ref={canvasRef} className="drawing-canvas"
                onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
                onTouchStart={e => { e.preventDefault(); handleStart(e); }}
                onTouchMove={e => { e.preventDefault(); handleMove(e); }}
                onTouchEnd={handleEnd} />
            </div>
            {drawSuccess && (
              <div className="shape-success-stars">
                {Array.from({ length: awardedStars }, (_, index) => (
                  <span key={index} className="success-star" style={{ '--delay': `${0.1 + index * 0.2}s` }}>⭐</span>
                ))}
              </div>
            )}
            {showRetryMessage && (
              <div className="shape-retry-stars">
                <span className="retry-star" style={{ '--delay': '0.1s' }}>😢</span>
                <span className="retry-star" style={{ '--delay': '0.3s' }}>😢</span>
                <span className="retry-star" style={{ '--delay': '0.5s' }}>😢</span>
              </div>
            )}
            {showRetryMessage && retryMessage && (
              <div className="shape-feedback-text">{retryMessage}</div>
            )}
            <div className="color-picker">
              {COLORS.map(c => <div key={c} className={`color-dot ${c === drawColor ? 'selected' : ''}`} style={{ background: c }} onClick={() => setDrawColor(c)} />)}
            </div>
            <button className="clear-btn" onClick={clearCanvas}>🗑️ මකන්න</button>
          </div>
        </div>
      </div>

      {/* Flying Stars - animate from drawing area to reward box */}
      {flyingStars.map(star => (
        <div
          key={star.id}
          className="flying-star"
          style={{
            top: `${star.startY}px`,
            left: `${star.startX}px`,
            '--fly-dx': `${star.dx}px`,
            '--fly-dy': `${star.dy}px`,
            '--fly-delay': `${star.delay}s`,
          }}
        >⭐</div>
      ))}

      {showFinalCelebration && (
        <div className="final-celebration-overlay" aria-live="polite">
          <div className="final-celebration-burst" aria-hidden="true">
            <span className="celebration-ray celebration-ray-1" />
            <span className="celebration-ray celebration-ray-2" />
            <span className="celebration-ray celebration-ray-3" />
            <span className="celebration-ray celebration-ray-4" />
            <span className="celebration-ray celebration-ray-5" />
            <span className="celebration-ray celebration-ray-6" />
          </div>
          <div className="final-celebration-stars" aria-hidden="true">
            <span className="final-star final-star-left">⭐</span>
            <span className="final-star final-star-center">⭐</span>
            <span className="final-star final-star-right">⭐</span>
          </div>
          <p className="final-celebration-title">Level C1 Completed</p>
        </div>
      )}
    </>
  );
};

export default ShapesLearning;