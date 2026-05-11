import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TwoLetterWordsGame.css';
import imgYata from '../../../assets/images/yata.png';
import imgUla from '../../../assets/images/ula.png';
import imgRata from '../../../assets/images/rata.png';
import imgBata from '../../../assets/images/bata.png';
import imgGasa from '../../../assets/images/gasa.png';
import imgDara from '../../../assets/images/dhara.png';
import imgMala from '../../../assets/images/mala.png';
import imgMama from '../../../assets/images/mama.png';
import introWordAudio from '../../../assets/audio/word.mp3';
import audioBata from '../../../assets/audio/bata.wav';
import audioGasa from '../../../assets/audio/gasa.wav';
import audioDara from '../../../assets/audio/dara.wav';
import audioMala from '../../../assets/audio/mala.wav';

// Import reward components
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';

const LETTER_PREDICT_URL = 'http://localhost:3000/predict';
const MIN_WORD_PIXELS = 600;
const MIN_COLUMN_PIXELS = 2;
const MERGE_GAP_PX = 10;
const SEGMENT_PADDING_PX = 14;
const MODEL_IMAGE_SIZE = 128;

// ========== Word list (2‑letter Sinhala words) ==========
const WORDS = [
  { text: 'බට', pronunciation: 'bata', image: imgBata, audio: audioBata }, 
  { text: 'ගස', pronunciation: 'gasa', image: imgGasa, audio: audioGasa },
  { text: 'දර', pronunciation: 'dara', image: imgDara, audio: audioDara },
  { text: 'මල', pronunciation: 'mala', image: imgMala, audio: audioMala }, 
  { text: 'යට', pronunciation: 'yata' , image: imgYata },
  { text: 'උල', pronunciation: 'ula', image: imgUla },
  { text: 'රට', pronunciation: 'rata', image: imgRata },
  { text: 'මම', pronunciation: 'mama', image: imgMama },
];

// ========== Helper: speak word using Web Speech API ==========
const speakWord = (word) => {
  if (!window.speechSynthesis) {
    alert("Your browser doesn't support speech synthesis.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'si-LK';
  utterance.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const playWordAudio = (word) => {
  if (word.audio) {
    const clip = new Audio(word.audio);
    clip.play().catch(() => {
      speakWord(word.text);
    });
    return;
  }
  speakWord(word.text);
};

// ========== Sound effects ==========
const playSuccessSound = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
  });
};

const playErrorSound = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 300;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.3);
};

const getAlphaAt = (data, width, x, y) => data[(y * width + x) * 4 + 3];

const getCanvasInkStats = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  const columnInk = Array(width).fill(0);
  let totalDrawnPixels = 0;
  let minX = width;
  let maxX = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (getAlphaAt(data, width, x, y) > 30) {
        totalDrawnPixels += 1;
        columnInk[x] += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxX === -1) {
    return { imageData, columnInk, totalDrawnPixels, bounds: null };
  }

  return {
    imageData,
    columnInk,
    totalDrawnPixels,
    bounds: { minX, maxX },
  };
};

const getColumnRuns = (columnInk) => {
  const runs = [];
  let start = null;

  columnInk.forEach((count, index) => {
    if (count >= MIN_COLUMN_PIXELS && start === null) {
      start = index;
      return;
    }

    if (count < MIN_COLUMN_PIXELS && start !== null) {
      runs.push({ start, end: index - 1 });
      start = null;
    }
  });

  if (start !== null) {
    runs.push({ start, end: columnInk.length - 1 });
  }

  return runs;
};

const mergeRuns = (runs) => {
  if (runs.length === 0) return [];

  return runs.reduce((merged, run) => {
    const previous = merged[merged.length - 1];
    if (!previous) {
      merged.push({ ...run });
      return merged;
    }

    if (run.start - previous.end <= MERGE_GAP_PX) {
      previous.end = run.end;
      return merged;
    }

    merged.push({ ...run });
    return merged;
  }, []);
};

const findValleySplit = (columnInk, minX, maxX) => {
  const width = maxX - minX + 1;
  const searchStart = minX + Math.max(1, Math.floor(width * 0.2));
  const searchEnd = maxX - Math.max(1, Math.floor(width * 0.2));
  let bestX = Math.floor((minX + maxX) / 2);
  let bestScore = Number.POSITIVE_INFINITY;

  for (let x = searchStart; x <= searchEnd; x++) {
    const score = (columnInk[x - 1] ?? columnInk[x]) + columnInk[x] + (columnInk[x + 1] ?? columnInk[x]);
    if (score < bestScore) {
      bestScore = score;
      bestX = x;
    }
  }

  return bestX;
};

const buildWordSegments = (canvas) => {
  const { imageData, columnInk, totalDrawnPixels, bounds } = getCanvasInkStats(canvas);

  if (!bounds || totalDrawnPixels < MIN_WORD_PIXELS) {
    return { status: 'empty', totalDrawnPixels };
  }

  const runs = mergeRuns(getColumnRuns(columnInk));
  let leftRange;
  let rightRange;

  if (runs.length >= 2) {
    const largestGapIndex = runs.slice(0, -1).reduce((bestIndex, run, index) => {
      const currentGap = runs[index + 1].start - run.end;
      const bestGap = runs[bestIndex + 1].start - runs[bestIndex].end;
      return currentGap > bestGap ? index : bestIndex;
    }, 0);

    leftRange = { start: runs[0].start, end: runs[largestGapIndex].end };
    rightRange = { start: runs[largestGapIndex + 1].start, end: runs[runs.length - 1].end };
  } else {
    const splitX = findValleySplit(columnInk, bounds.minX, bounds.maxX);
    leftRange = { start: bounds.minX, end: splitX };
    rightRange = { start: splitX + 1, end: bounds.maxX };
  }

  const ranges = [leftRange, rightRange].filter((range) => range.end > range.start);
  if (ranges.length !== 2) {
    return { status: 'failed' };
  }

  const segments = ranges.map((range) => {
    let minY = canvas.height;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = range.start; x <= range.end; x++) {
        if (getAlphaAt(imageData.data, canvas.width, x, y) > 30) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxY === -1) {
      minY = 0;
      maxY = canvas.height - 1;
    }

    return {
      x: Math.max(0, range.start - SEGMENT_PADDING_PX),
      y: Math.max(0, minY - SEGMENT_PADDING_PX),
      width: Math.min(canvas.width - Math.max(0, range.start - SEGMENT_PADDING_PX), (range.end - range.start + 1) + SEGMENT_PADDING_PX * 2),
      height: Math.min(canvas.height - Math.max(0, minY - SEGMENT_PADDING_PX), (maxY - minY + 1) + SEGMENT_PADDING_PX * 2),
    };
  });

  return { status: 'ok', segments };
};

const segmentToBlob = async (canvas, segment) => {
  const sourceCtx = canvas.getContext('2d');
  const sourceData = sourceCtx.getImageData(segment.x, segment.y, segment.width, segment.height);

  const binaryCanvas = document.createElement('canvas');
  binaryCanvas.width = segment.width;
  binaryCanvas.height = segment.height;
  const binaryCtx = binaryCanvas.getContext('2d');
  const binaryImage = binaryCtx.createImageData(segment.width, segment.height);

  for (let index = 0; index < sourceData.data.length; index += 4) {
    const isInk = sourceData.data[index + 3] > 30;
    binaryImage.data[index] = isInk ? 0 : 255;
    binaryImage.data[index + 1] = isInk ? 0 : 255;
    binaryImage.data[index + 2] = isInk ? 0 : 255;
    binaryImage.data[index + 3] = 255;
  }

  binaryCtx.putImageData(binaryImage, 0, 0);

  const normalizedCanvas = document.createElement('canvas');
  normalizedCanvas.width = MODEL_IMAGE_SIZE;
  normalizedCanvas.height = MODEL_IMAGE_SIZE;
  const normalizedCtx = normalizedCanvas.getContext('2d');
  normalizedCtx.fillStyle = '#ffffff';
  normalizedCtx.fillRect(0, 0, MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE);

  const scale = Math.min(
    (MODEL_IMAGE_SIZE - SEGMENT_PADDING_PX * 2) / segment.width,
    (MODEL_IMAGE_SIZE - SEGMENT_PADDING_PX * 2) / segment.height
  );
  const drawWidth = Math.max(1, Math.round(segment.width * scale));
  const drawHeight = Math.max(1, Math.round(segment.height * scale));
  const drawX = Math.round((MODEL_IMAGE_SIZE - drawWidth) / 2);
  const drawY = Math.round((MODEL_IMAGE_SIZE - drawHeight) / 2);

  normalizedCtx.drawImage(binaryCanvas, drawX, drawY, drawWidth, drawHeight);

  return new Promise((resolve, reject) => {
    normalizedCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('segment blob failed'))), 'image/png');
  });
};

const predictLetterBlob = async (blob) => {
  const formData = new FormData();
  formData.append('image', blob, 'segment.png');

  const response = await fetch(LETTER_PREDICT_URL, { method: 'POST', body: formData });
  if (!response.ok) {
    throw new Error(`prediction failed: ${response.status}`);
  }

  const data = await response.json();
  return data?.predictions?.[0]?.sinhala ?? data?.prediction?.sinhala ?? null;
};

const detectWordWithLetterModel = async (canvas, targetWord) => {
  const segmentation = buildWordSegments(canvas);
  if (segmentation.status !== 'ok') {
    return segmentation;
  }

  const predictedLetters = [];
  for (const segment of segmentation.segments) {
    const blob = await segmentToBlob(canvas, segment);
    const predictedLetter = await predictLetterBlob(blob);
    if (!predictedLetter) {
      return { status: 'failed' };
    }
    predictedLetters.push(predictedLetter);
  }

  const predictedWord = predictedLetters.join('');
  return {
    status: 'done',
    predictedLetters,
    predictedWord,
    isCorrect: predictedWord === targetWord,
  };
};

const TwoLetterWordsGame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [completedWords, setCompletedWords] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const introAudioRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  // Reward system
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const rewardedWordRef = useRef(false);

  const currentWord = WORDS[currentIndex];

  const playIntroAudio = () => {
    if (!introAudioRef.current) {
      introAudioRef.current = new Audio(introWordAudio);
      introAudioRef.current.volume = 0.9;
    }

    const audio = introAudioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    playIntroAudio();

    return () => {
      const audio = introAudioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#5c51d4';
    ctx.lineWidth = 8;
    ctxRef.current = ctx;
    clearCanvas();
  }, [currentIndex]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSuccess(false);
    setShowRetry(false);
    setRetryMessage('');
  };

  // Drawing handlers
  const startDrawing = (e) => {
    const pos = getCanvasPos(e);
    if (!pos) return;
    isDrawing.current = true;
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    const ctx = ctxRef.current;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
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

  const handleCheck = async () => {
    const canvas = canvasRef.current;
    if (!canvas || checkLoading) return;

    setCheckLoading(true);
    setSuccess(false);
    setShowRetry(false);
    setRetryMessage('');

    try {
      const result = await detectWordWithLetterModel(canvas, currentWord.text);

      if (result.status === 'empty') {
        setShowRetry(true);
        setRetryMessage('කරුණාකර වචනය මුලින් ලියන්න.');
        playErrorSound();
        return;
      }

      if (result.status !== 'done') {
        setShowRetry(true);
        setRetryMessage('අකුරු දෙක වෙන් කර හඳුනාගන්න බැරි වුණා. ටිකක් ඉඩ තබා නැවත ලියන්න.');
        playErrorSound();
        return;
      }

      if (result.isCorrect) {
      setSuccess(true);
      setShowRetry(false);
      playSuccessSound();

      // Award star only once per word
      if (!completedWords.includes(currentIndex) && !rewardedWordRef.current) {
        awardStars(1);
        rewardedWordRef.current = true;
        const newCompleted = [...completedWords, currentIndex];
        setCompletedWords(newCompleted);
        if (newCompleted.length === WORDS.length) {
          setGameFinished(true);
        }
      } else if (!completedWords.includes(currentIndex)) {
        // Still mark as completed if star already awarded (defensive)
        const newCompleted = [...completedWords, currentIndex];
        setCompletedWords(newCompleted);
        if (newCompleted.length === WORDS.length) {
          setGameFinished(true);
        }
      }
      } else {
        // setRetryMessage(`AI දුටුවේ "${result.predictedWord}". නැවත උත්සාහ කරන්න!`);
        setShowRetry(true);
        setSuccess(false);
        playErrorSound();
      }
    } catch {
      setRetryMessage('Server එකට connect වෙන්න බැරිවුණා.');
      setShowRetry(true);
      setSuccess(false);
      playErrorSound();
    } finally {
      setCheckLoading(false);
    }
  };

  const nextWord = () => {
    if (currentIndex + 1 < WORDS.length) {
      setCurrentIndex(currentIndex + 1);
      setSuccess(false);
      setShowRetry(false);
      rewardedWordRef.current = false; // reset for new word
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
    rewardedWordRef.current = false;
  };

  if (gameFinished) {
    return (
      <div className="word-game-container">
        <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
        <div className="game-complete-card">
          <div className="complete-emoji">🎉✨🏆✨🎉</div>
          <h2>අපූරුයි! ඔබ සියලු වචන සම්පූර්ණ කළා!</h2>
          <p>ඔබට තරු 3ක් හිමි වේ ⭐⭐⭐</p>
          <button className="game-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🔙 මුල් පිටුවට</button>
          <button className="game-reset-btn" onClick={resetGame}>🔄 නැවත පුහුණු වන්න</button>
        </div>
      </div>
    );
  }

  return (
    <div className="word-game-container">
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
      <div className="word-game-header">
        <button className="back-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🏠 මුල් පිටුව</button>
        <div className="progress-badge">
          📖 {currentIndex + 1} / {WORDS.length}
        </div>
        <button className="audio-btn" onClick={playIntroAudio}>
          🔊 උපදෙස් අහන්න
        </button>
      </div>

      <div className="game-main-grid">
        {/* Left: Word display & audio */}
        <div className="word-card">
          <div className="word-sinhala">{currentWord.text}</div>
          <button className="audio-btn" onClick={() => playWordAudio(currentWord)}>
            🔊 අහන්න
          </button>
          {currentWord.image && (
            <div className="word-image-wrap">
              <img
                className="word-image"
                src={currentWord.image}
                alt={currentWord.text}
                loading="lazy"
              />
            </div>
          )}
          {success && (
            <div className="success-stars">
              <span>⭐</span><span>⭐</span><span>⭐</span>
              <div className="success-message">නියමයි! 🎉</div>
            </div>
          )}
          {showRetry && (
            <div className="retry-message">
              {retryMessage || 'තව ටිකක් හොඳට ලියන්න. නැවත උත්සාහ කරන්න!'}
            </div>
          )}
        </div>

        {/* Right: Drawing area */}
        <div className="drawing-card">
          <h3>✏️ මෙතන ලියන්න</h3>
          <canvas
            ref={canvasRef}
            className="word-drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="drawing-buttons">
            <button className="clear-btn" onClick={clearCanvas}>🗑️ මකන්න</button>
            <button className="check-btn" onClick={handleCheck} disabled={checkLoading}>{checkLoading ? '⏳ පරීක්ෂා වෙමින්...' : ' පරීක්ෂා කරන්න'}</button>
          </div>
          {success && currentIndex + 1 < WORDS.length && (
            <button className="next-btn" onClick={nextWord}> ඊළඟ වචනය </button>
          )}
          {success && currentIndex + 1 === WORDS.length && (
            <button className="next-btn" onClick={nextWord}>අවසන් කරන්න</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoLetterWordsGame;