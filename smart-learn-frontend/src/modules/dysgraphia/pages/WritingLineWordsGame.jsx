import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WritingLineWordsGame.css';

// Word images
import imgBata  from '../../../assets/images/dysgraphia/bata.png';
import imgGasa  from '../../../assets/images/dysgraphia/gasa.png';
import imgDara  from '../../../assets/images/dysgraphia/dhara.png';
import imgMala  from '../../../assets/images/dysgraphia/mala.png';
import imgYata  from '../../../assets/images/dysgraphia/yata.png';
import imgUla   from '../../../assets/images/dysgraphia/ula.png';
import imgRata  from '../../../assets/images/dysgraphia/rata.png';
import imgMama  from '../../../assets/images/dysgraphia/mama.png';
import starImage from '../../../assets/images/dysgraphia/star.png';
import warning from '../../../assets/audio/dysgraphia/warning.mp3';
import coolDinosaurBg from '../../../assets/images/dysgraphia/dinosaurs/dinosaur-cool-background.png';

// Word audio
import audioBata from '../../../assets/audio/bata.wav';
import audioGasa from '../../../assets/audio/gasa.wav';
import audioDara from '../../../assets/audio/dara.wav';
import audioMala from '../../../assets/audio/mala.wav';
import imgPahana  from '../../../assets/images/dysgraphia/pahana.png';
import imgWataya  from '../../../assets/images/dysgraphia/wataya.png';
import imgSarama  from '../../../assets/images/dysgraphia/sarama.png';
import imgBasaya  from '../../../assets/images/dysgraphia/basaya.png';
import imgWayasa  from '../../../assets/images/dysgraphia/wayasa.png';
import imgAhasa   from '../../../assets/images/dysgraphia/ahasa.jpg';
import imgMahatha from '../../../assets/images/dysgraphia/mahatha.png';
// import bg from '../../../assets/images/dysgraphia/bg04.png';

import introWordAudio from '../../../assets/audio/dysgraphia/line.mp4';
import audioAhasa from '../../../assets/audio/ahasa.wav';
import audioBasaya from '../../../assets/audio/basaya.wav';
import audioWayasa from '../../../assets/audio/wayasa.wav';
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { dysgraphiaService } from '../services/dysgraphiaService';

// ── Canvas constants ────────────────────────────────────────────────────────
const TOP_LINE_RATIO    = 0.20;   // guide line A (cap-height / top boundary)
const BOTTOM_LINE_RATIO = 0.76;   // guide line B (baseline / bottom boundary)
const MIN_WORD_PIXELS   = 500;
const MIN_COLUMN_PIXELS = 2;
const MERGE_GAP_PX      = 10;
const SEGMENT_PADDING_PX = 14;
const MODEL_IMAGE_SIZE   = 128;

// ── Pass / fail thresholds ───────────────────────────────────────────────────
const OUT_OF_LINES_STRIKE_PCT    = 10;  // counts as ONE strike above this
const OUT_OF_LINES_HARD_FAIL_PCT = 25;  // always fails above this, no matter what
const MAX_STRIKES_ALLOWED        = 1;   // 2 or more strikes => retry

// Per-letter size comparison thresholds (relative to the word's average letter size)
const LETTER_BIG_RATIO   = 1.5;   // > 1.5x average => flagged "big"
const LETTER_SMALL_RATIO = 0.7;   // < 0.7x average => flagged "small"

const LETTER_ID_MAP = {
  'අ':'a','බ':'ba','ද':'dha','ග':'ga','හ':'ha','ක':'ka',
  'ල':'la','ම':'ma','න':'na','ප':'pa','ර':'ra','ස':'sa',
  'ට':'ta','ත':'tha','උ':'u','ය':'ya','ව':'wa',
};

// ── Word catalogue ──────────────────────────────────────────────────────────
const WORDS = [
  { id:'rata', text:'රට', pronunciation:'rata', image:imgRata, expectedLength:2 },
  { id:'bata', text:'බට', pronunciation:'bata', image:imgBata, audio:audioBata, expectedLength:2 },
  { id:'gasa', text:'ගස', pronunciation:'gasa', image:imgGasa, audio:audioGasa, expectedLength:2 },
  { id:'dara', text:'දර', pronunciation:'dara', image:imgDara, audio:audioDara, expectedLength:2 },
  { id:'mala', text:'මල', pronunciation:'mala', image:imgMala, audio:audioMala, expectedLength:2 },
  { id:'yata', text:'යට', pronunciation:'yata', image:imgYata, expectedLength:2 },
  { id:'ula',  text:'උල', pronunciation:'ula',  image:imgUla,  expectedLength:2 },
  { id:'mama', text:'මම', pronunciation:'mama', image:imgMama, expectedLength:2 },
  { id: 'basaya', text: 'බසය', pronunciation: 'basaya',  image: imgBasaya, audio: audioBasaya, expectedLength: 3 },
  { id: 'ahasa', text: 'අහස', pronunciation: 'ahasa',   image: imgAhasa, audio: audioAhasa, expectedLength: 3 },
  { id: 'wayasa', text: 'වයස', pronunciation: 'wayasa',  image: imgWayasa, audio: audioWayasa, expectedLength: 3 },
  { id: 'pahana', text: 'පහන', pronunciation: 'pahana',  image: imgPahana, expectedLength: 3 },
  { id: 'wataya', text: 'වටය', pronunciation: 'wataya',  image: imgWataya, expectedLength: 3 },
  { id: 'sarama', text: 'සරම', pronunciation: 'sarama',  image: imgSarama, expectedLength: 3 },
  { id: 'mahatha', text: 'මහත', pronunciation: 'mahatha', image: imgMahatha, expectedLength: 3 },
];

// ── Sound helpers ────────────────────────────────────────────────────────────
const speakWord = (text) => {
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'si-LK';
  utt.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
};

const playWordAudio = (word) => {
  if (word.audio) {
    new Audio(word.audio).play().catch(() => speakWord(word.text));
  } else {
    speakWord(word.text);
  }
};

const playSuccessSound = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.2);
  });
};

const playErrorSound = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = 280; osc.type = 'sine';
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
};

const WritingGameBackground = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-800 to-teal-700" />
    <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-lime-300/30 blur-3xl sm:h-96 sm:w-96" />
    <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-950/60 to-transparent" />
    <span className="absolute left-[8%] top-[18%] text-3xl opacity-60 sm:text-5xl">☁️</span>
    <span className="absolute right-[9%] top-[12%] text-4xl opacity-70 sm:text-6xl">☁️</span>
    <span className="absolute bottom-[8%] left-[5%] text-4xl opacity-70 sm:text-6xl">🌿</span>
    <span className="absolute bottom-[5%] right-[4%] text-5xl opacity-70 sm:text-7xl">🌳</span>
  </div>
);

// ── Canvas analysis helpers ──────────────────────────────────────────────────
const getAlphaAt = (data, width, x, y) => data[(y * width + x) * 4 + 3];

/** Returns outOfLinesPct (0–100) and letterHeightRatio */
function calculateWritingMetrics(canvas, topLineY, bottomLineY) {
  const { data, width, height } = canvas.getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height);
  let totalInk = 0, outOfLinesInk = 0, minY = height, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (getAlphaAt(data, width, x, y) > 30) {
        totalInk++;
        if (y < topLineY || y > bottomLineY) outOfLinesInk++;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const outOfLinesPct = totalInk > 0 ? (outOfLinesInk / totalInk) * 100 : 0;
  const zoneHeight    = bottomLineY - topLineY;
  const actualHeight  = maxY > minY ? maxY - minY : 0;
  const letterHeightRatio = zoneHeight > 0 ? actualHeight / zoneHeight : 0;
  return { outOfLinesPct: Math.round(outOfLinesPct * 10) / 10, letterHeightRatio: Math.round(letterHeightRatio * 100) / 100, totalInk };
}

// ink bounding column helpers for per-letter segmentation
const getColumnRuns = (ink) => {
  const runs = []; let start = null;
  ink.forEach((c, i) => {
    if (c >= MIN_COLUMN_PIXELS && start === null) { start = i; }
    else if (c < MIN_COLUMN_PIXELS && start !== null) { runs.push({ start, end: i - 1 }); start = null; }
  });
  if (start !== null) runs.push({ start, end: ink.length - 1 });
  return runs;
};

const mergeRuns = (runs) => {
  if (!runs.length) return [];
  return runs.reduce((m, r) => {
    const prev = m[m.length - 1];
    if (!prev) { m.push({ ...r }); return m; }
    if (r.start - prev.end <= MERGE_GAP_PX) { prev.end = r.end; }
    else m.push({ ...r });
    return m;
  }, []);
};

const findValleySplit = (columnInk, minX, maxX) => {
  const w = maxX - minX + 1;
  const s = minX + Math.max(1, Math.floor(w * 0.2));
  const e = maxX - Math.max(1, Math.floor(w * 0.2));
  let bestX = Math.floor((minX + maxX) / 2), bestScore = Infinity;
  for (let x = s; x <= e; x++) {
    const sc = (columnInk[x - 1] ?? columnInk[x]) + columnInk[x] + (columnInk[x + 1] ?? columnInk[x]);
    if (sc < bestScore) { bestScore = sc; bestX = x; }
  }
  return bestX;
};

const getInkBounds = (data, width, height, x, y, boxWidth, boxHeight) => {
  let minX = boxWidth;
  let maxX = -1;
  let minY = boxHeight;
  let maxY = -1;

  for (let yy = 0; yy < boxHeight; yy++) {
    for (let xx = 0; xx < boxWidth; xx++) {
      const canvasX = x + xx;
      const canvasY = y + yy;

      if (canvasX < 0 || canvasX >= width || canvasY < 0 || canvasY >= height) {
        continue;
      }

      const alpha = data[(canvasY * width + canvasX) * 4 + 3];

      if (alpha > 30) {
        if (xx < minX) minX = xx;
        if (xx > maxX) maxX = xx;
        if (yy < minY) minY = yy;
        if (yy > maxY) maxY = yy;
      }
    }
  }

  if (maxX === -1) {
    return null;
  }

  return {
    left: x + minX,
    right: x + maxX,
    top: y + minY,
    bottom: y + maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
};

const buildWordSegments = (canvas) => {
  const ctx = canvas.getContext('2d');
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const columnInk = Array(width).fill(0);
  let totalDrawnPixels = 0, minX = width, maxX = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (getAlphaAt(data, width, x, y) > 30) {
        totalDrawnPixels++; columnInk[x]++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxX === -1 || totalDrawnPixels < MIN_WORD_PIXELS) return { status: 'empty', totalDrawnPixels };

  const runs = mergeRuns(getColumnRuns(columnInk));
  let leftRange, rightRange;

  if (runs.length >= 2) {
    const gapIdx = runs.slice(0, -1).reduce((best, _, i) => {
      const cur  = runs[i + 1].start - runs[i].end;
      const prev = runs[best + 1].start - runs[best].end;
      return cur > prev ? i : best;
    }, 0);
    leftRange  = { start: runs[0].start, end: runs[gapIdx].end };
    rightRange = { start: runs[gapIdx + 1].start, end: runs[runs.length - 1].end };
  } else {
    const splitX = findValleySplit(columnInk, minX, maxX);
    leftRange  = { start: minX, end: splitX };
    rightRange = { start: splitX + 1, end: maxX };
  }

  const ranges = [leftRange, rightRange].filter(r => r.end > r.start);
  if (ranges.length !== 2) return { status: 'failed' };

  const segments = ranges.map(range => {
    let sMinY = canvas.height, sMaxY = -1;
    for (let y = 0; y < canvas.height; y++)
      for (let x = range.start; x <= range.end; x++)
        if (getAlphaAt(data, width, x, y) > 30) { if (y < sMinY) sMinY = y; if (y > sMaxY) sMaxY = y; }
    if (sMaxY === -1) { sMinY = 0; sMaxY = canvas.height - 1; }
    return {
      x: Math.max(0, range.start - SEGMENT_PADDING_PX),
      y: Math.max(0, sMinY - SEGMENT_PADDING_PX),
      width:  Math.min(canvas.width  - Math.max(0, range.start - SEGMENT_PADDING_PX), (range.end - range.start + 1) + SEGMENT_PADDING_PX * 2),
      height: Math.min(canvas.height - Math.max(0, sMinY - SEGMENT_PADDING_PX),       (sMaxY - sMinY + 1)           + SEGMENT_PADDING_PX * 2),
    };
  });
  return { status: 'ok', segments };
};

const CalmDinosaurBackground = () => (
  <div className="wlg-dino-background" aria-hidden="true">
    <img className="wlg-dino-scene" src={coolDinosaurBg} alt="" />
    <div className="wlg-dino-overlay" />
  </div>
);

const segmentToBlob = async (canvas, seg) => {
  const srcData = canvas.getContext('2d').getImageData(seg.x, seg.y, seg.width, seg.height);
  const bin = document.createElement('canvas');
  bin.width = seg.width; bin.height = seg.height;
  const binCtx = bin.getContext('2d');
  const binImg = binCtx.createImageData(seg.width, seg.height);
  for (let i = 0; i < srcData.data.length; i += 4) {
    const ink = srcData.data[i + 3] > 30;
    binImg.data[i] = ink ? 0 : 255;
    binImg.data[i + 1] = ink ? 0 : 255;
    binImg.data[i + 2] = ink ? 0 : 255;
    binImg.data[i + 3] = 255;
  }
  binCtx.putImageData(binImg, 0, 0);

  const norm = document.createElement('canvas');
  norm.width = MODEL_IMAGE_SIZE; norm.height = MODEL_IMAGE_SIZE;
  const normCtx = norm.getContext('2d');
  normCtx.fillStyle = '#ffffff'; normCtx.fillRect(0, 0, MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE);
  const scale = Math.min((MODEL_IMAGE_SIZE - SEGMENT_PADDING_PX * 2) / seg.width, (MODEL_IMAGE_SIZE - SEGMENT_PADDING_PX * 2) / seg.height);
  const dw = Math.max(1, Math.round(seg.width * scale));
  const dh = Math.max(1, Math.round(seg.height * scale));
  const dx = Math.round((MODEL_IMAGE_SIZE - dw) / 2);
  const dy = Math.round((MODEL_IMAGE_SIZE - dh) / 2);
  normCtx.drawImage(bin, dx, dy, dw, dh);
  return new Promise((res, rej) => norm.toBlob(b => b ? res(b) : rej(new Error('blob failed')), 'image/png'));
};

const predictWordSegments = async (canvas, word) => {
  const segmentation = buildWordSegments(canvas);

  if (segmentation.status !== 'ok') {
    return segmentation;
  }

  const sorted = [...segmentation.segments].sort((a, b) => a.x - b.x);

  const chars = Array.from(word.text);

  if (
    chars.length !== word.expectedLength ||
    sorted.length !== word.expectedLength
  ) {
    return { status: 'failed' };
  }

  // Get original canvas pixel data
  const ctx = canvas.getContext('2d');

  const { data, width, height } =
    ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Find the REAL ink boundary for each letter
  const inkBounds = sorted.map((seg) =>
    getInkBounds(
      data,
      width,
      height,
      seg.x,
      seg.y,
      seg.width,
      seg.height
    )
  );

  // If any letter has no detectable ink, fail
  if (inkBounds.some((bounds) => !bounds)) {
    return { status: 'failed' };
  }

  // Predict each letter
  const predictions = await Promise.all(
    sorted.map(async (seg, idx) => {
      const targetChar = chars[idx];

      const letterId = LETTER_ID_MAP[targetChar];

      if (!letterId) {
        throw new Error(`No mapping for ${targetChar}`);
      }

      const image = await segmentToBlob(canvas, seg);

      const res = await dysgraphiaService.predictHandwritingLetter(image);

      return {
        letter: res?.predicted ?? '',
        confidence: Number(res?.confidence ?? 0)
      };
    })
  );

  // REAL INTER-LETTER GAP

  const spacing = inkBounds
    .slice(1)
    .map((currentLetter, i) => {
      const previousLetter = inkBounds[i];

      const gap =
        currentLetter.left - previousLetter.right - 1;

      return Math.max(0, gap);
    });

  // REAL LETTER SIZE

  const sizes = inkBounds.map((bounds) => ({
    width: bounds.width,
    height: bounds.height
  }));

  return {
    status: 'ok',

    predictedLetters: predictions.map(
      (p) => p.letter
    ),

    predictedWord: predictions
      .map((p) => p.letter)
      .join(''),

    confidences: predictions.map(
      (p) => p.confidence
    ),

    spacing,
    sizes
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.message || fallback;

// ── WritingLineWordsGame component ──────────────────────────────────────────
const WritingLineWordsGame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [showRetry, setShowRetry]           = useState(false);
  const [retryMessage, setRetryMessage]     = useState('');
  const [checkLoading, setCheckLoading]     = useState(false);
  const [completedWords, setCompletedWords] = useState([]);
  const [gameFinished, setGameFinished]     = useState(false);
  const [linesBlinking, setLinesBlinking]   = useState(false);   // red-blink state
  const [lastResult, setLastResult]         = useState(null);    // full popup-result object (see handleCheck)

  const canvasRef      = useRef(null);
  const ctxRef         = useRef(null);
  const isDrawing      = useRef(false);
  const blinkTimer     = useRef(null);
  const introAudioRef  = useRef(null);
  const rewardedWord   = useRef(false);
  const warningAudioRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const wordStartedAtRef = useRef(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);

  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const currentWord = WORDS[currentIndex];

  // ── get guide-line pixel positions from the canvas ──────────────────────
  const getLinePositions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { topLineY: 0, bottomLineY: 0 };
    return {
      topLineY:    Math.round(canvas.height * TOP_LINE_RATIO),
      bottomLineY: Math.round(canvas.height * BOTTOM_LINE_RATIO),
    };
  }, []);

  // ── play intro audio ────────────────────────────────────────────────────
  const playIntroAudio = () => {
    if (!introAudioRef.current) {
      introAudioRef.current = new Audio(introWordAudio);
      introAudioRef.current.volume = 0.9;
    }
    const a = introAudioRef.current;
    a.pause(); a.currentTime = 0;
    a.play().catch(() => {});
  };

  useEffect(() => { playIntroAudio(); return () => { const a = introAudioRef.current; if (!a) return; a.pause(); a.currentTime = 0; }; }, []);

  // ── initialise canvas on word change ────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctx.strokeStyle = '#3b2fcf';
    ctx.lineWidth   = 9;
    ctxRef.current  = ctx;
    wordStartedAtRef.current = Date.now();
    setAttemptCount(0);
    setWrongAttemptCount(0);
    clearCanvas();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (warningAudioRef.current) {
        warningAudioRef.current.pause();
        warningAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // ── drawing helpers ──────────────────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const src    = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const triggerBlink = useCallback(() => {
    setLinesBlinking(true);
    clearTimeout(blinkTimer.current);
    blinkTimer.current = setTimeout(() => setLinesBlinking(false), 1200);

    // Play warning sound only if it's not already playing
    if (!warningAudioRef.current || warningAudioRef.current.paused) {
      // Create Audio instance if it doesn't exist
      if (!warningAudioRef.current) {
        warningAudioRef.current = new Audio(warning);
      } else {
        warningAudioRef.current.currentTime = 0; // rewind
      }
      warningAudioRef.current.play().catch(() => {});
      // Clear any previous stop timer
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      // Schedule stop after 2.5 seconds
      warningTimeoutRef.current = setTimeout(() => {
        if (warningAudioRef.current) {
          warningAudioRef.current.pause();
          warningAudioRef.current.currentTime = 0;
        }
        warningTimeoutRef.current = null;
      }, 2500);
    }
  }, []);

  const startDrawing = (e) => {
    const pos = getPos(e);
    isDrawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const { topLineY, bottomLineY } = getLinePositions();
    if (pos.y < topLineY || pos.y > bottomLineY) triggerBlink();
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(pos.x, pos.y);
  };

  const stopDrawing = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setShowRetry(false);
    setRetryMessage('');
    setLastResult(null);
    setLinesBlinking(false);
  };

  // ── feedback helpers ─────────────────────────────────────────────────────

  // Overall word-height-in-zone indicator (informational only — does not affect pass/fail)
  const getSizeLabel = (ratio) => {
    if (ratio >= 0.55 && ratio <= 1.2) return { text: 'ලකුණු ප්‍රමාණය හොඳයි ✓', cls: 'wlg-metric--excellent' };
    if (ratio < 0.55) return { text: 'ලකුණු ටිකක් කුඩායි', cls: 'wlg-metric--needs-work' };
    return { text: 'ලකුණු ටිකක් ලොකුයි', cls: 'wlg-metric--needs-work' };
  };

  // Are individual letters wildly different sizes from each other? (STRIKE #2)
  // Now names the specific letter(s) that are too big / too small.
  const getLetterSizeFeedback = (sizes, letters) => {
    if (!sizes || !sizes.length) {
      return { text: 'අකුරු ප්‍රමාණය නිශ්චිත කළ නොහැක.', cls: 'wlg-metric--needs-work', isBad: false, letterDetails: [] };
    }
    const heights = sizes.map((s) => s.height).filter(Boolean);
    const widths = sizes.map((s) => s.width).filter(Boolean);
    if (!heights.length || !widths.length) {
      return { text: 'අකුරු ප්‍රමාණය නිශ්චිත කළ නොහැක.', cls: 'wlg-metric--needs-work', isBad: false, letterDetails: [] };
    }
    const avgHeight = heights.reduce((total, value) => total + value, 0) / heights.length;
    const avgWidth = widths.reduce((total, value) => total + value, 0) / widths.length;

    // Work out a status ('big' | 'small' | 'ok') for EACH letter individually
    const letterDetails = sizes.map((size, idx) => {
      const heightRatio = size.height ? size.height / avgHeight : 1;
      const widthRatio = size.width ? size.width / avgWidth : 1;
      // use whichever dimension deviates furthest from the word's average
      const ratio = Math.abs(heightRatio - 1) >= Math.abs(widthRatio - 1) ? heightRatio : widthRatio;

      let status = 'ok';
      if (ratio > LETTER_BIG_RATIO) status = 'big';
      else if (ratio < LETTER_SMALL_RATIO) status = 'small';

      return {
        letter: letters?.[idx] ?? '?',
        status,
        ratio: Math.round(ratio * 100) / 100,
      };
    });

    const bigLetters = letterDetails.filter((d) => d.status === 'big').map((d) => d.letter);
    const smallLetters = letterDetails.filter((d) => d.status === 'small').map((d) => d.letter);
    const isBad = bigLetters.length > 0 || smallLetters.length > 0;

    if (!isBad) {
      return { text: 'අකුරු ප්‍රමාණය සමතුලිතයි.', cls: 'wlg-metric--good', isBad: false, letterDetails };
    }

    const parts = [];
    if (bigLetters.length) parts.push(`"${bigLetters.join('", "')}" ලොකුයි`);
    if (smallLetters.length) parts.push(`"${smallLetters.join('", "')}" කුඩායි`);

    return {
      text: `අකුරු ප්‍රමාණය එකසේ නැහැ — ${parts.join(', ')}.`,
      cls: 'wlg-metric--needs-work',
      isBad: true,
      letterDetails,
    };
  };

  // Are the gaps between letters too big (or too tight)? Only "too big" counts as a STRIKE (#3).
  const getLetterSpacingFeedback = (spacing, sizes) => {
    if (!spacing || !spacing.length || !sizes || !sizes.length) {
      return { text: 'අකුරු අතර spaces හොඳයි.', cls: 'wlg-metric--good', isBad: false, tooLoose: false, tooTight: false };
    }

    const avgWidth =
      sizes.reduce((total, size) => total + (size.width || 0), 0) / sizes.length;

    if (!avgWidth) {
      return { text: 'අකුරු අතර spaces විශ්ලේෂණය කළ නොහැක.', cls: 'wlg-metric--needs-work', isBad: false, tooLoose: false, tooTight: false };
    }

    const normalized = spacing.map((gap) => gap / avgWidth);
    const averageGap = spacing.reduce((total, gap) => total + gap, 0) / spacing.length;
    const tooTight = normalized.some((ratio) => ratio < 0.35);
    const tooLoose = normalized.some((ratio) => ratio > 1.5);

    if (tooTight && tooLoose) {
      return {
        text: `අකුරු අතර gap එකිනෙකට වෙනස්. සාමාන්‍ය gap: ${averageGap.toFixed(1)} px`,
        cls: 'wlg-metric--needs-work', isBad: true, tooLoose, tooTight,
      };
    }
    if (tooTight) {
      return {
        text: `අකුරු අතර gap ටිකක් අඩුයි. සාමාන්‍ය gap: ${averageGap.toFixed(1)} px`,
        cls: 'wlg-metric--needs-work', isBad: false, tooLoose, tooTight,
      };
    }
    if (tooLoose) {
      return {
        text: `අකුරු අතර gap ටිකක් වැඩියි. සාමාන්‍ය gap: ${averageGap.toFixed(1)} px`,
        cls: 'wlg-metric--needs-work', isBad: true, tooLoose, tooTight,
      };
    }
    return {
      text: `අකුරු අතර gap හොඳයි. සාමාන්‍ය gap: ${averageGap.toFixed(1)} px`,
      cls: 'wlg-metric--good', isBad: false, tooLoose, tooTight,
    };
  };

  const getLineScoreClass = (pct) => {
    if (pct < 10) return 'wlg-metric--excellent';
    if (pct < 30) return 'wlg-metric--good';
    return 'wlg-metric--needs-work';
  };

  const getStarLabel = (stars) => {
    if (stars === 3) return { label: 'විශිෂ්ට! රේඛා ඇතුළේ ලිව්වා!', cls: 'wlg-stars--3' };
    if (stars === 2) return { label: 'හොඳයි! ටිකක් රේඛාවෙන් එළියෙ ගියා', cls: 'wlg-stars--2' };
    return { label: 'ලිව්වා! නැවත කරන්න', cls: 'wlg-stars--1' };
  };

  // ── submit / check ───────────────────────────────────────────────────────
  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || checkLoading) return;
    setCheckLoading(true);
    setShowRetry(false);
    setLastResult(null);

    try {
      const { topLineY, bottomLineY } = getLinePositions();
      const metrics = calculateWritingMetrics(canvas, topLineY, bottomLineY);

      if (metrics.totalInk < MIN_WORD_PIXELS) {
        setShowRetry(true);
        setRetryMessage('කරුණාකර වචනය මුලින් ලියන්න.');
        playErrorSound();
        return;
      }

      const prediction = await predictWordSegments(canvas, currentWord);

      if (prediction.status === 'empty') {
        setShowRetry(true);
        setRetryMessage('කරුණාකර වචනය මුලින් ලියන්න.');
        playErrorSound();
        return;
      }

      if (prediction.status !== 'ok') {
        setShowRetry(true);
        setRetryMessage('අකුරු වෙන් කරගන්න බැරිවුණා. ඉඩ තබා නැවත ලියන්න.');
        playErrorSound();
        return;
      }

      const sizeFeedback = getLetterSizeFeedback(prediction.sizes, Array.from(currentWord.text));
      const spacingFeedback = getLetterSpacingFeedback(prediction.spacing, prediction.sizes);
      const linesFail = metrics.outOfLinesPct > OUT_OF_LINES_STRIKE_PCT;
      const hardLinesFail = metrics.outOfLinesPct > OUT_OF_LINES_HARD_FAIL_PCT;
      const sizeFail = sizeFeedback.isBad;
      const spacingFail = spacingFeedback.isBad;
      const strikeCount = [linesFail, sizeFail, spacingFail].filter(Boolean).length;
      const attemptNumber = attemptCount + 1;
      const durationSeconds = wordStartedAtRef.current
        ? Math.max(0, Math.round((Date.now() - wordStartedAtRef.current) / 1000))
        : 0;

      const backendResult = await dysgraphiaService.recordWritingLineActivity({
        group:          'writingLines',
        wordId:          currentWord.id,
        targetWord:      currentWord.text,
        expectedLength:  currentWord.expectedLength,
        durationSeconds,
        attemptNumber,
        wrongAttempts: wrongAttemptCount,
        outOfLinesPct:   metrics.outOfLinesPct,
        letterHeightRatio: metrics.letterHeightRatio,
        sizeFail,
        spacingFail,
        predictedWord:   prediction.predictedWord,
        predictedLetters: prediction.predictedLetters,
        confidences:     prediction.confidences,
        segmentation: {
          spacing: prediction.spacing,
          sizes: prediction.sizes,
        },
      });

      const outOfLinesPct = backendResult.outOfLinesPct ?? metrics.outOfLinesPct;

      // ── STRIKE-BASED PASS/FAIL LOGIC ──────────────────────────────────
      const aiCorrect   = !!backendResult.isCorrect;

      setAttemptCount(attemptNumber);
      if (!aiCorrect) setWrongAttemptCount((count) => count + 1);

      const passed = aiCorrect && !hardLinesFail && strikeCount <= MAX_STRIKES_ALLOWED;
      // ────────────────────────────────────────────────────────────────

      const popupResult = {
        passed,
        aiCorrect,
        hardLinesFail,
        strikeCount,
        outOfLinesPct,
        letterHeightRatio: backendResult.letterHeightRatio ?? metrics.letterHeightRatio,
        starsEarned: passed ? (backendResult.starsEarned || 1) : 0,
        predictedWord: backendResult.predictedWord || prediction.predictedWord,
        linesFail,
        sizeFeedback,
        spacingFeedback,
      };

      setLastResult(popupResult);

      if (passed) {
        playSuccessSound();
        if (!rewardedWord.current) {
          awardStars(popupResult.starsEarned || 1);
          rewardedWord.current = true;
        }
        const newCompleted = completedWords.includes(currentIndex)
          ? completedWords
          : [...completedWords, currentIndex];
        setCompletedWords(newCompleted);
        if (newCompleted.length === WORDS.length) setGameFinished(true);
      } else {
        playErrorSound();
      }
    } catch (error) {
      setRetryMessage(getErrorMessage(error, 'Server එකට connect වෙන්න බැරිවුණා.'));
      setShowRetry(true);
      playErrorSound();
    } finally {
      setCheckLoading(false);
    }
  };

  const nextWord = () => {
    if (currentIndex + 1 < WORDS.length) {
      setCurrentIndex(i => i + 1);
      rewardedWord.current = false;
    } else {
      setGameFinished(true);
    }
  };

  const handleTryAgain = () => {
    clearCanvas();
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setCompletedWords([]);
    setGameFinished(false);
    setShowRetry(false);
    rewardedWord.current = false;
  };

  // ── popup title text ─────────────────────────────────────────────────────
  const getPopupTitle = (r) => {
    if (r.passed) return getStarLabel(r.starsEarned).label;
    if (r.hardLinesFail) return 'රේඛාවෙන් ගොඩක් එළියට ගියා!';
    if (!r.aiCorrect) return `AI දුටුවේ "${r.predictedWord}". නැවත උත්සාහ කරමු!`;
    return 'ලස්සනයි! ටිකක් තවත් Practice කරමු 💪';
  };

  // ── game-over screen ─────────────────────────────────────────────────────
  if (gameFinished) {
    return (
      <div className="wlg-shell !relative !min-h-screen !overflow-x-hidden !bg-transparent !px-3 !pb-12 !pt-24 !text-slate-800 sm:!px-6 sm:!pt-10">
     {/* style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }} */}
        <WritingGameBackground />
        <CalmDinosaurBackground />
        <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
        <div className="wlg-complete-card !relative !z-10 !mx-auto !mt-12 !max-w-xl !rounded-[2rem] !border-4 !border-cyan-200 !bg-cyan-50/95 !px-5 !py-10 !text-center !shadow-[0_14px_0_rgba(14,116,144,.25),0_28px_60px_rgba(49,46,129,.2)] !backdrop-blur-xl sm:!mt-20 sm:!rounded-[2.5rem] sm:!px-10 sm:!py-14">
          <div className="wlg-complete-emoji !mb-4 !text-5xl sm:!text-7xl">🎉✨🏆✨🎉</div>
          <h2 className="wlg-complete-title !mb-3 !text-2xl !font-black !text-indigo-700 sm:!text-4xl">අපූරුයි! ඔබ සියලු වචන ලිව්වා!</h2>
          <p className="wlg-complete-sub !mb-7 !text-base !font-bold !text-slate-600 sm:!text-lg">ඔබේ රේඛා ලිවීම ඉතාම හොඳයි ⭐</p>
          <div className="wlg-complete-actions !flex !flex-col !justify-center !gap-3 sm:!flex-row">
            <button className="wlg-btn wlg-btn--home !min-h-12 !rounded-full !bg-gradient-to-r !from-violet-500 !to-indigo-600 !px-7 !font-black !text-white !shadow-lg !transition hover:!-translate-y-1" onClick={() => navigate('/dysgraphia')}>🏠 මුල් පිටුවට</button>
            <button className="wlg-btn wlg-btn--retry !min-h-12 !rounded-full !bg-gradient-to-r !from-cyan-500 !to-sky-600 !px-7 !font-black !text-white !shadow-lg !transition hover:!-translate-y-1" onClick={resetGame}>🔄 නැවත ලියන්න</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wlg-shell !relative !min-h-screen !overflow-x-hidden !bg-transparent !px-3 !pb-12 !pt-24 !text-slate-800 sm:!px-6 sm:!pt-8">
     {/* style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }} */}
      <WritingGameBackground />
      <CalmDinosaurBackground />
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />

      {/* ── Header ── */}
      <div className="wlg-header !relative !z-10 !mx-auto !mb-4 !flex !max-w-6xl !items-center !justify-between !gap-2 !rounded-3xl !border-2 !border-cyan-200 !bg-cyan-50/95 !p-2 !shadow-xl !backdrop-blur-xl sm:!mb-6 sm:!rounded-full sm:!px-4 sm:!py-3">
        <button className="wlg-back-btn !min-h-11 !rounded-full !border-0 !bg-gradient-to-r !from-violet-500 !to-indigo-600 !px-3 !text-xs !font-black !text-white !shadow-[0_5px_0_#4338ca] !transition hover:!-translate-y-1 active:!translate-y-1 sm:!px-5 sm:!text-sm" onClick={() => navigate('/dysgraphia')}>🏠 <span className="hidden sm:inline">මුල් පිටුව</span></button>
        <div className="wlg-progress-badge !rounded-full !bg-gradient-to-r !from-cyan-300 !to-sky-400 !px-4 !py-2 !text-sm !font-black !text-cyan-950 !shadow-md sm:!px-6 sm:!text-base">✏️ {currentIndex + 1} / {WORDS.length}</div>
        <button className="wlg-audio-btn !min-h-11 !rounded-full !border-0 !bg-gradient-to-r !from-sky-500 !to-cyan-600 !px-3 !text-xs !font-black !text-white !shadow-[0_5px_0_#0e7490] !transition hover:!-translate-y-1 active:!translate-y-1 sm:!px-5 sm:!text-sm" onClick={playIntroAudio}>🔊 <span className="hidden sm:inline">උපදෙස්</span></button>
      </div>

      {/* ── Instruction banner ── */}
      <div className="wlg-instruction-banner !relative !z-10 !mx-auto !mb-5 !max-w-3xl !rounded-2xl !border-2 !border-cyan-100 !bg-sky-50/95 !px-4 !py-3 !text-center !text-sm !font-bold !text-slate-700 !shadow-lg !backdrop-blur sm:!rounded-3xl sm:!text-lg">
        රේඛා <span className="wlg-guide-label !font-black !text-violet-600">දෙකේ</span> ඇතුළේ <strong className="!text-2xl !text-indigo-700 sm:!text-3xl">{currentWord.text}</strong> ලියන්න
      </div>

      {/* ── Main grid ── */}
      <div className="wlg-main-grid !relative !z-10 !mx-auto !grid !max-w-6xl !grid-cols-1 !gap-4 lg:!grid-cols-[0.9fr_1.4fr] lg:!gap-6">

        {/* ─ Word card ─ */}
        <div className="wlg-word-card !rounded-[2rem] !border-4 !border-white/90 !bg-gradient-to-br !from-white/95 !to-violet-50/95 !p-4 !shadow-[0_10px_0_rgba(124,58,237,.22),0_22px_45px_rgba(49,46,129,.18)] !backdrop-blur-xl sm:!p-6">
          <button className="wlg-play-btn !min-h-12 !rounded-full !border-0 !bg-gradient-to-r !from-violet-500 !to-indigo-600 !px-7 !font-black !text-white !shadow-[0_5px_0_#4338ca] !transition hover:!-translate-y-1 active:!translate-y-1" onClick={() => playWordAudio(currentWord)}>🔊 අහන්න</button>

          {/* Reference: word shown positioned between two guide lines (matches right-side canvas line spacing) */}
          <div className="wlg-reference-lines !h-[190px] !rounded-2xl !border-2 !border-violet-100 !bg-white !shadow-inner sm:!h-[260px] lg:!h-[380px]">
            <span
              className="wlg-reference-line wlg-reference-line--top !bg-indigo-400/70"
              style={{ top: `${TOP_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
            <span
              className="wlg-reference-word !text-[4.5rem] !font-black !text-indigo-700 !drop-shadow-sm sm:!text-[7rem] lg:!text-[10rem]"
              style={{ top: `${TOP_LINE_RATIO * 100}%`, bottom: `${(1 - BOTTOM_LINE_RATIO) * 60}%` }}
            >
              {currentWord.text}
            </span>
            <span
              className="wlg-reference-line wlg-reference-line--bottom !bg-indigo-400/70"
              style={{ top: `${BOTTOM_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
          </div>

          {showRetry && !lastResult && (
            <div className="wlg-retry-msg !rounded-xl !border-2 !border-red-200 !bg-red-50 !p-3 !font-bold !text-red-600">{retryMessage}</div>
          )}
        </div>

        {/* ─ Drawing card ─ */}
        <div className="wlg-drawing-card !rounded-[2rem] !border-4 !border-white/90 !bg-gradient-to-br !from-white/95 !to-cyan-50/95 !p-4 !shadow-[0_10px_0_rgba(6,182,212,.24),0_22px_45px_rgba(30,64,175,.17)] !backdrop-blur-xl sm:!p-6">
          <h3 className="wlg-drawing-title !m-0 !text-base !font-black !text-slate-700 sm:!text-xl">✏️ රේඛා අතරේ ලියන්න</h3>

          {/* Canvas + guide-line overlay */}
          <div className="wlg-canvas-wrap !h-[220px] !rounded-2xl !border-4 !border-cyan-200 !bg-white !shadow-inner sm:!h-[300px] lg:!h-[380px]">
            {/* Guide lines – CSS positions match TOP/BOTTOM ratios */}
            <div
              className={`wlg-guide-line wlg-guide-line--top !bg-indigo-400/70 ${linesBlinking ? 'wlg-guide-line--blink' : ''}`}
              style={{ top: `${TOP_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
            <div
              className={`wlg-guide-line wlg-guide-line--bottom !bg-indigo-400/70 ${linesBlinking ? 'wlg-guide-line--blink' : ''}`}
              style={{ top: `${BOTTOM_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
            {/* Mid dashed helper */}
            <div
              className="wlg-guide-mid !border-indigo-300/40 !bg-indigo-300/20"
              style={{ top: `${(TOP_LINE_RATIO + BOTTOM_LINE_RATIO) / 2 * 100}%` }}
              aria-hidden="true"
            />

            <canvas
              ref={canvasRef}
              className="wlg-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
              onTouchMove={(e)  => { e.preventDefault(); draw(e); }}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Blink warning label */}
          {linesBlinking && (
            <div className="wlg-out-warning !rounded-full !bg-red-100 !px-4 !py-2 !font-black !text-red-600" aria-live="polite">⚠️ රේඛාවෙන් පිටත!</div>
          )}

          <div className="wlg-canvas-btns !flex !w-full !flex-col !gap-3 sm:!flex-row sm:!justify-center">
            <button className="wlg-btn wlg-btn--clear !min-h-12 !rounded-full !bg-gradient-to-r !from-slate-500 !to-slate-700 !px-6 !font-black !text-white !shadow-lg !transition hover:!-translate-y-1" onClick={clearCanvas}>🗑️ මකන්න</button>
            <button className="wlg-btn wlg-btn--check !min-h-12 !rounded-full !bg-gradient-to-r !from-cyan-500 !to-indigo-600 !px-7 !font-black !text-white !shadow-lg !transition hover:!-translate-y-1 disabled:!cursor-not-allowed disabled:!opacity-50" onClick={handleCheck} disabled={checkLoading}>
              {checkLoading ? '⏳ පරීක්ෂා කරමින්...' : '✅ පරීක්ෂා කරන්න'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Chalkboard results POPUP (fixed overlay, not inline in the page flow) ── */}
      {lastResult && (
        <div className="wlg-popup-overlay !fixed !inset-0 !z-[9999] !flex !items-center !justify-center !overflow-y-auto !bg-slate-950/75 !p-4 !backdrop-blur-md sm:!p-8" role="dialog" aria-modal="true">
          <div className={`!relative !w-full !max-w-2xl !overflow-hidden !rounded-[2rem] !border-4 !bg-white !shadow-[0_30px_100px_rgba(0,0,0,.55)] sm:!rounded-[2.75rem] ${lastResult.passed ? '!border-cyan-300' : '!border-violet-300'}`}>
            <div className={`!absolute !inset-x-0 !top-0 !h-44 ${lastResult.passed ? '!bg-gradient-to-br !from-cyan-300 !via-sky-200 !to-violet-300' : '!bg-gradient-to-br !from-violet-300 !via-fuchsia-200 !to-sky-300'}`} />
            <div className="!absolute !-right-10 !-top-12 !h-40 !w-40 !rounded-full !bg-white/30 !blur-2xl" />
            <div className="wlg-popup-board-content !relative !inset-auto !top-auto !right-auto !bottom-auto !left-auto !flex !w-full !max-w-full !flex-col !items-center !justify-start !gap-0 !px-4 !pb-6 !pt-8 !text-center sm:!px-9 sm:!pb-9 sm:!pt-10">
              <div className="!mb-3 !flex !min-h-16 !items-center !justify-center !gap-2">
                {Array.from({ length: lastResult.passed ? Math.max(1, lastResult.starsEarned) : 1 }).map((_, index) => (
                  <img
                    key={index}
                    src={starImage}
                    alt="Star"
                    className={`!drop-shadow-[0_8px_12px_rgba(180,83,9,.35)] ${lastResult.passed ? '!h-14 !w-14 sm:!h-16 sm:!w-16' : '!h-12 !w-12 !grayscale-[.35] sm:!h-14 sm:!w-14'} ${index === 1 ? '!scale-110' : ''}`}
                  />
                ))}
              </div>

              <div className={`wlg-popup-title !mb-5 !max-w-xl !text-center !text-xl !font-black !leading-snug !drop-shadow-sm sm:!text-3xl ${lastResult.passed ? '!text-cyan-950' : '!text-violet-950'}`}>
                {getPopupTitle(lastResult)}
              </div>

              <div className="wlg-popup-metrics !mt-4 !grid !w-full !max-w-full !gap-3">
                <div className={`wlg-popup-metric !box-border !flex !w-full !max-w-full !items-center !justify-center !rounded-2xl !border-2 !px-4 !py-3 !text-center !text-sm !font-bold !shadow-sm sm:!px-5 sm:!text-base ${lastResult.linesFail ? '!border-rose-200 !bg-rose-50 !text-rose-800' : '!border-emerald-200 !bg-emerald-50 !text-emerald-800'}`}>
                  <span className="!mr-2 !inline-grid !h-6 !w-6 !place-items-center !rounded-full !bg-current/10">{lastResult.linesFail ? '×' : '✓'}</span>
                  රේඛාවෙන් පිටත: <strong>{lastResult.outOfLinesPct}%</strong>
                </div>

                <div className={`wlg-popup-metric !box-border !flex !w-full !max-w-full !items-center !justify-center !rounded-2xl !border-2 !px-4 !py-3 !text-center !text-sm !font-bold !shadow-sm sm:!px-5 sm:!text-base ${lastResult.sizeFeedback.isBad ? '!border-rose-200 !bg-rose-50 !text-rose-800' : '!border-emerald-200 !bg-emerald-50 !text-emerald-800'}`}>
                  <span className="!mr-2 !inline-grid !h-6 !w-6 !place-items-center !rounded-full !bg-current/10">{lastResult.sizeFeedback.isBad ? '×' : '✓'}</span>
                  {lastResult.sizeFeedback.text}
                </div>

                {/* Per-letter big/small chips — only shown when there's something to flag */}
                {lastResult.sizeFeedback.letterDetails && lastResult.sizeFeedback.letterDetails.some(d => d.status !== 'ok') && (
                  <div className="wlg-letter-chips !flex !flex-wrap !justify-center !gap-2 !rounded-2xl !bg-slate-50 !p-3">
                    {lastResult.sizeFeedback.letterDetails.map((d, i) => (
                      <span key={i} className={`wlg-letter-chip wlg-letter-chip--${d.status} !rounded-full !border !border-slate-200 !bg-white !px-3 !py-1.5 !text-sm !font-extrabold !text-slate-700 !shadow-sm`}>
                        {d.letter} {d.status === 'big' ? '↑ ලොකුයි' : d.status === 'small' ? '↓ කුඩායි' : '✓'}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`wlg-popup-metric !box-border !flex !w-full !max-w-full !items-center !justify-center !rounded-2xl !border-2 !px-4 !py-3 !text-center !text-sm !font-bold !shadow-sm sm:!px-5 sm:!text-base ${lastResult.spacingFeedback.isBad ? '!border-rose-200 !bg-rose-50 !text-rose-800' : '!border-emerald-200 !bg-emerald-50 !text-emerald-800'}`}>
                  <span className="!mr-2 !inline-grid !h-6 !w-6 !place-items-center !rounded-full !bg-current/10">{lastResult.spacingFeedback.isBad ? '×' : '✓'}</span>
                  {lastResult.spacingFeedback.text}
                </div>
              </div>

              <div className="wlg-popup-actions !mt-6 !flex !w-full !justify-center">
                {lastResult.passed ? (
                  <button className="wlg-btn wlg-btn--next wlg-popup-btn !min-h-12 !rounded-full !border-0 !bg-gradient-to-r !from-cyan-500 !to-indigo-600 !px-8 !font-black !text-white !shadow-[0_8px_0_#3730a3] !transition hover:!-translate-y-1 hover:!shadow-[0_11px_0_#3730a3] active:!translate-y-1 active:!shadow-[0_4px_0_#3730a3]" onClick={nextWord}>
                    {currentIndex + 1 < WORDS.length ? 'ඊළඟ වචනය →' : 'අවසන් කරන්න'}
                  </button>
                ) : (
                  <button className="wlg-btn wlg-btn--retry wlg-popup-btn !min-h-12 !rounded-full !border-0 !bg-gradient-to-r !from-violet-500 !to-fuchsia-600 !px-8 !font-black !text-white !shadow-[0_8px_0_#7e22ce] !transition hover:!-translate-y-1 hover:!shadow-[0_11px_0_#7e22ce] active:!translate-y-1 active:!shadow-[0_4px_0_#7e22ce]" onClick={handleTryAgain}>
                    නැවත උත්සාහ කරන්න
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingLineWordsGame;
