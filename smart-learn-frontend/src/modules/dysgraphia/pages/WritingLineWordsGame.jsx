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

// Word audio
import audioBata from '../../../assets/audio/bata.wav';
import audioGasa from '../../../assets/audio/gasa.wav';
import audioDara from '../../../assets/audio/dara.wav';
import audioMala from '../../../assets/audio/mala.wav';
import audioIntroWord from '../../../assets/audio/dysgraphia/word.mp3';
import imgPahana  from '../../../assets/images/dysgraphia/pahana.png';
import imgWataya  from '../../../assets/images/dysgraphia/wataya.png';
import imgSarama  from '../../../assets/images/dysgraphia/sarama.png';
import imgBasaya  from '../../../assets/images/dysgraphia/basaya.png';
import imgWayasa  from '../../../assets/images/dysgraphia/wayasa.png';
import imgAhasa   from '../../../assets/images/dysgraphia/ahasa.jpg';
import imgMahatha from '../../../assets/images/dysgraphia/mahatha.png';
// import bg from '../../../assets/images/dysgraphia/bg04.png';

import introWordAudio from '../../../assets/audio/dysgraphia/word.mp3';
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
  if (segmentation.status !== 'ok') return segmentation;

  const sorted = [...segmentation.segments].sort((a, b) => a.x - b.x);
  const chars  = Array.from(word.text);
  if (chars.length !== word.expectedLength || sorted.length !== word.expectedLength) return { status: 'failed' };

  const predictions = await Promise.all(sorted.map(async (seg, idx) => {
    const targetChar = chars[idx];
    const letterId   = LETTER_ID_MAP[targetChar];
    if (!letterId) throw new Error(`No mapping for ${targetChar}`);
    const image = await segmentToBlob(canvas, seg);
    const res = await dysgraphiaService.submitLetterAttempt({ letterId, targetChar, mode:'independent', durationSeconds:0, image });
    return { letter: res?.predicted ?? '', confidence: Number(res?.confidence ?? 0) };
  }));

  return {
    status: 'ok',
    predictedLetters: predictions.map(p => p.letter),
    predictedWord:    predictions.map(p => p.letter).join(''),
    confidences:      predictions.map(p => p.confidence),
    spacing: sorted.slice(1).map((s, i) => Math.max(0, s.x - (sorted[i].x + sorted[i].width))),
    sizes:   sorted.map(({ width, height }) => ({ width, height })),
  };
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message || error?.message || fallback;

// ── WritingLineWordsGame component ──────────────────────────────────────────
const WritingLineWordsGame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [success, setSuccess]               = useState(false);
  const [showRetry, setShowRetry]           = useState(false);
  const [retryMessage, setRetryMessage]     = useState('');
  const [checkLoading, setCheckLoading]     = useState(false);
  const [completedWords, setCompletedWords] = useState([]);
  const [gameFinished, setGameFinished]     = useState(false);
  const [linesBlinking, setLinesBlinking]   = useState(false);   // red-blink state
  const [lastResult, setLastResult]         = useState(null);    // { isCorrect, outOfLinesPct, letterHeightRatio, starsEarned }

  const canvasRef      = useRef(null);
  const ctxRef         = useRef(null);
  const isDrawing      = useRef(false);
  const blinkTimer     = useRef(null);
  const introAudioRef  = useRef(null);
  const rewardedWord   = useRef(false);

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
    clearCanvas();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setSuccess(false);
    setShowRetry(false);
    setRetryMessage('');
    setLastResult(null);
    setLinesBlinking(false);
  };

  // ── submit / check ───────────────────────────────────────────────────────
  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || checkLoading) return;
    setCheckLoading(true);
    setSuccess(false);
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

      const sizeFeedback = getLetterSizeFeedback(prediction.sizes);
      const spacingFeedback = getLetterSpacingFeedback(prediction.spacing, prediction.sizes);

      const result = await dysgraphiaService.recordWritingLineActivity({
        group:          'writingLines',
        wordId:          currentWord.id,
        targetWord:      currentWord.text,
        expectedLength:  currentWord.expectedLength,
        durationSeconds: 0,
        outOfLinesPct:   metrics.outOfLinesPct,
        letterHeightRatio: metrics.letterHeightRatio,
        predictedWord:   prediction.predictedWord,
        predictedLetters: prediction.predictedLetters,
        confidences:     prediction.confidences,
        spacing:         prediction.spacing,
        sizes:           prediction.sizes,
      });

      setLastResult({
        isCorrect:        result.isCorrect,
        outOfLinesPct:    result.outOfLinesPct ?? metrics.outOfLinesPct,
        letterHeightRatio: result.letterHeightRatio ?? metrics.letterHeightRatio,
        starsEarned:      result.starsEarned ?? 0,
        predictedWord:    result.predictedWord,
        sizeFeedback,
        spacingFeedback,
      });

      if (result.isCorrect) {
        setSuccess(true);
        setShowRetry(false);
        playSuccessSound();
        if (!rewardedWord.current) {
          awardStars(result.starsEarned || 1);
          rewardedWord.current = true;
        }
        const newCompleted = completedWords.includes(currentIndex)
          ? completedWords
          : [...completedWords, currentIndex];
        setCompletedWords(newCompleted);
        if (newCompleted.length === WORDS.length) setGameFinished(true);
      } else {
        setShowRetry(true);
        const pw = result?.predictedWord || prediction.predictedWord;
        setRetryMessage(pw ? `AI දුටුවේ "${pw}". නැවත උත්සාහ කරන්න!` : 'නැවත උත්සාහ කරන්න!');
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

  const resetGame = () => {
    setCurrentIndex(0);
    setCompletedWords([]);
    setGameFinished(false);
    setSuccess(false);
    setShowRetry(false);
    rewardedWord.current = false;
  };

  // ── star rating label ────────────────────────────────────────────────────
  const getStarLabel = (stars) => {
    if (stars === 3) return { label: 'විශිෂ්ට! රේඛා ඇතුළේ ලිව්වා!', cls: 'wlg-stars--3' };
    if (stars === 2) return { label: 'හොඳයි! ටිකක් රේඛාවෙන් එළියෙ ගියා', cls: 'wlg-stars--2' };
    return { label: 'ලිව්වා! නැවත කරන්න', cls: 'wlg-stars--1' };
  };

  // ── line score indicator ─────────────────────────────────────────────────
  const getLineScoreClass = (pct) => {
    if (pct < 10) return 'wlg-metric--excellent';
    if (pct < 30) return 'wlg-metric--good';
    return 'wlg-metric--needs-work';
  };

  const getSizeLabel = (ratio) => {
    if (ratio >= 0.55 && ratio <= 1.2) return { text: 'ලකුණු ප්‍රමාණය හොඳයි ✓', cls: 'wlg-metric--excellent' };
    if (ratio < 0.55) return { text: 'ලකුණු ටිකක් කුඩායි', cls: 'wlg-metric--needs-work' };
    return { text: 'ලකුණු ටිකක් ලොකුයි', cls: 'wlg-metric--needs-work' };
  };

  const getLetterSizeFeedback = (sizes) => {
    if (!sizes || !sizes.length) {
      return { text: 'අකුරු ප්‍රමාණය නිශ්චිත කළ නොහැක.', cls: 'wlg-metric--needs-work' };
    }
    const heights = sizes.map((s) => s.height).filter(Boolean);
    const widths = sizes.map((s) => s.width).filter(Boolean);
    if (!heights.length || !widths.length) {
      return { text: 'අකුරු ප්‍රමාණය නිශ්චිත කළ නොහැක.', cls: 'wlg-metric--needs-work' };
    }
    const avgHeight = heights.reduce((total, value) => total + value, 0) / heights.length;
    const avgWidth = widths.reduce((total, value) => total + value, 0) / widths.length;
    const heightRatios = heights.map((height) => height / avgHeight);
    const widthRatios = widths.map((width) => width / avgWidth);
    const hasMismatch = [...heightRatios, ...widthRatios].some((ratio) => ratio < 0.7 || ratio > 1.5);

    if (hasMismatch) {
      return {
        text: 'අකුරු ප්‍රමාණය එකසේ නැහැ. එක් අකුරක් විශාලයි, තවත් එක කුඩායි.',
        cls: 'wlg-metric--needs-work',
      };
    }
    return { text: 'අකුරු ප්‍රමාණය සමතුලිතයි.', cls: 'wlg-metric--good' };
  };

  const getLetterSpacingFeedback = (spacing, sizes) => {
    if (!spacing || !spacing.length || !sizes || !sizes.length) {
      return { text: 'අකුරු අතර spaces හොඳයි.', cls: 'wlg-metric--good' };
    }
    const avgWidth = sizes.reduce((total, size) => total + (size.width || 0), 0) / sizes.length;
    if (!avgWidth) {
      return { text: 'අකුරු අතර spaces විශ්ලේෂණය කළ නොහැක.', cls: 'wlg-metric--needs-work' };
    }
    const normalized = spacing.map((gap) => gap / avgWidth);
    const tooTight = normalized.some((ratio) => ratio < 0.35);
    const tooLoose = normalized.some((ratio) => ratio > 1.5);
    if (tooTight && tooLoose) {
      return { text: 'ප්‍රමාණවත් නොවන gap. හෝඩිය inconsistentයි.', cls: 'wlg-metric--needs-work' };
    }
    if (tooTight) {
      return { text: 'අකුරු අතර gap ටිකක් අඩුයි.', cls: 'wlg-metric--needs-work' };
    }
    if (tooLoose) {
      return { text: 'අකුරු අතර gap ටිකක් වැඩියි.', cls: 'wlg-metric--needs-work' };
    }
    return { text: 'අකුරු අතර gap හොඳයි.', cls: 'wlg-metric--good' };
  };

  // ── game-over screen ─────────────────────────────────────────────────────
  if (gameFinished) {
    return (
      <div className="wlg-shell"   >
     {/* style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }} */}

        <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
        <div className="wlg-complete-card">
          <div className="wlg-complete-emoji">🎉✨🏆✨🎉</div>
          <h2 className="wlg-complete-title">අපූරුයි! ඔබ සියලු වචන ලිව්වා!</h2>
          <p className="wlg-complete-sub">ඔබේ රේඛා ලිවීම ඉතාම හොඳයි ⭐</p>
          <div className="wlg-complete-actions">
            <button className="wlg-btn wlg-btn--home" onClick={() => navigate('/dysgraphia')}>🏠 මුල් පිටුවට</button>
            <button className="wlg-btn wlg-btn--retry" onClick={resetGame}>🔄 නැවත ලියන්න</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wlg-shell"   >
     {/* style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }} */}
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />

      {/* ── Header ── */}
      <div className="wlg-header">
        <button className="wlg-back-btn" onClick={() => navigate('/dysgraphia')}>🏠 මුල් පිටුව</button>
        <div className="wlg-progress-badge">✏️ {currentIndex + 1} / {WORDS.length}</div>
        <button className="wlg-audio-btn" onClick={playIntroAudio}>🔊 උපදෙස්</button>
      </div>

      {/* ── Instruction banner ── */}
      <div className="wlg-instruction-banner">
        රේඛා <span className="wlg-guide-label">දෙකේ</span> ඇතුළේ <strong>{currentWord.text}</strong> ලියන්න
      </div>

      {/* ── Main grid ── */}
      <div className="wlg-main-grid">

        {/* ─ Word card ─ */}
        <div className="wlg-word-card">
          <button className="wlg-play-btn" onClick={() => playWordAudio(currentWord)}>🔊 අහන්න</button>

          {/* Reference: word shown positioned between two guide lines (matches right-side canvas line spacing) */}
          <div className="wlg-reference-lines">
            <span
              className="wlg-reference-line wlg-reference-line--top"
              style={{ top: `${TOP_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
            <span
              className="wlg-reference-word"
              style={{ top: `${TOP_LINE_RATIO * 100}%`, bottom: `${(1 - BOTTOM_LINE_RATIO) * 60}%` }}
            >
              {currentWord.text}
            </span>
            <span
              className="wlg-reference-line wlg-reference-line--bottom"
              style={{ top: `${BOTTOM_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Result panel */}
          {lastResult && (
            <div className={`wlg-result-panel ${lastResult.isCorrect ? 'wlg-result-panel--correct' : 'wlg-result-panel--wrong'}`}>
              {lastResult.isCorrect ? (
                <div className={`wlg-stars ${getStarLabel(lastResult.starsEarned).cls}`}>
                  {'⭐'.repeat(lastResult.starsEarned)}
                  <span className="wlg-star-label">{getStarLabel(lastResult.starsEarned).label}</span>
                </div>
              ) : (
                <div className="wlg-retry-msg">{retryMessage || 'නැවත උත්සාහ කරන්න!'}</div>
              )}

              <div className={`wlg-metric ${getLineScoreClass(lastResult.outOfLinesPct)}`}>
                📏 රේඛාවෙන් පිටත: <strong>{lastResult.outOfLinesPct}%</strong>
              </div>
              <div className={`wlg-metric ${getSizeLabel(lastResult.letterHeightRatio).cls}`}>
                📐 {getSizeLabel(lastResult.letterHeightRatio).text}
              </div>
              {lastResult.sizeFeedback && (
                <div className={`wlg-metric ${lastResult.sizeFeedback.cls}`}>
                  ✏️ {lastResult.sizeFeedback.text}
                </div>
              )}
              {lastResult.spacingFeedback && (
                <div className={`wlg-metric ${lastResult.spacingFeedback.cls}`}>
                  ↔️ {lastResult.spacingFeedback.text}
                </div>
              )}
            </div>
          )}
          {showRetry && !lastResult && (
            <div className="wlg-retry-msg">{retryMessage}</div>
          )}
        </div>

        {/* ─ Drawing card ─ */}
        <div className="wlg-drawing-card">
          <h3 className="wlg-drawing-title">✏️ රේඛා අතරේ ලියන්න</h3>

          {/* Canvas + guide-line overlay */}
          <div className="wlg-canvas-wrap">
            {/* Guide lines – CSS positions match TOP/BOTTOM ratios */}
            <div
              className={`wlg-guide-line wlg-guide-line--top ${linesBlinking ? 'wlg-guide-line--blink' : ''}`}
              style={{ top: `${TOP_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
            <div
              className={`wlg-guide-line wlg-guide-line--bottom ${linesBlinking ? 'wlg-guide-line--blink' : ''}`}
              style={{ top: `${BOTTOM_LINE_RATIO * 100}%` }}
              aria-hidden="true"
            />
            {/* Mid dashed helper */}
            <div
              className="wlg-guide-mid"
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
            <div className="wlg-out-warning" aria-live="polite">⚠️ රේඛාවෙන් පිටත!</div>
          )}

          <div className="wlg-canvas-btns">
            <button className="wlg-btn wlg-btn--clear" onClick={clearCanvas}>🗑️ මකන්න</button>
            <button className="wlg-btn wlg-btn--check" onClick={handleCheck} disabled={checkLoading}>
              {checkLoading ? '⏳ පරීක්ෂා කරමින්...' : '✅ පරීක්ෂා කරන්න'}
            </button>
          </div>

          {success && (
            <button className="wlg-btn wlg-btn--next" onClick={nextWord}>
              {currentIndex + 1 < WORDS.length ? 'ඊළඟ වචනය →' : '🏁 අවසන් කරන්න'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingLineWordsGame;
