import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/ThreeLetterWordsGame.css';
import '../styles/WordGameDinosaurTheme.css';
import imgPahana  from '../../../assets/images/dysgraphia/pahana.png';
import imgWataya  from '../../../assets/images/dysgraphia/wataya.png';
import imgSarama  from '../../../assets/images/dysgraphia/sarama.png';
import imgBasaya  from '../../../assets/images/dysgraphia/basaya.png';
import imgWayasa  from '../../../assets/images/dysgraphia/wayasa.png';
import imgAhasa   from '../../../assets/images/dysgraphia/ahasa.jpg';
import imgMahatha from '../../../assets/images/dysgraphia/mahatha.png';
import introWordAudio from '../../../assets/audio/dysgraphia/word.mp3';
import audioAhasa from '../../../assets/audio/ahasa.wav';
import audioBasaya from '../../../assets/audio/basaya.wav';
import audioWayasa from '../../../assets/audio/wayasa.wav';
import rewardSound from '../../../assets/audio/dysgraphia/reward.mp3';

// Import reward components
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import WordGameDinosaurBackground from '../components/WordGameDinosaurBackground';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { dysgraphiaService } from '../services/dysgraphiaService';

const MIN_WORD_PIXELS = 700;
const MIN_COLUMN_PIXELS = 2;
const MERGE_GAP_PX = 10;
const SEGMENT_PADDING_PX = 14;
const MODEL_IMAGE_SIZE = 128;

const WORDS = [
  { id: 'basaya', text: 'බසය', pronunciation: 'basaya',  image: imgBasaya, audio: audioBasaya, expectedLength: 3 },
  { id: 'ahasa', text: 'අහස', pronunciation: 'ahasa',   image: imgAhasa, audio: audioAhasa, expectedLength: 3 }, 
  { id: 'wayasa', text: 'වයස', pronunciation: 'wayasa',  image: imgWayasa, audio: audioWayasa, expectedLength: 3 },
  { id: 'pahana', text: 'පහන', pronunciation: 'pahana',  image: imgPahana, expectedLength: 3 },
  { id: 'wataya', text: 'වටය', pronunciation: 'wataya',  image: imgWataya, expectedLength: 3 },
  { id: 'sarama', text: 'සරම', pronunciation: 'sarama',  image: imgSarama, expectedLength: 3 },
  { id: 'mahatha', text: 'මහත', pronunciation: 'mahatha', image: imgMahatha, expectedLength: 3 },
];

const LETTER_ID_MAP = {
  'අ': 'a',
  'බ': 'ba',
  'ද': 'dha',
  'ග': 'ga',
  'හ': 'ha',
  'ක': 'ka',
  'ල': 'la',
  'ම': 'ma',
  'න': 'na',
  'ප': 'pa',
  'ර': 'ra',
  'ස': 'sa',
  'ට': 'ta',
  'ත': 'tha',
  'උ': 'u',
  'ය': 'ya',
  'ව': 'wa',
};

const getRequestFailureMessage = (error) => {
  const apiMessage = error?.response?.data?.error?.message
    || error?.response?.data?.message;
  const status = error?.response?.status;
  const message = apiMessage || error?.message || 'Unknown request error';
  return status ? `Request failed (${status}): ${message}` : `Request failed: ${message}`;
};

const getWordCharacters = (word) => Array.from(word);

const getInterLetterSpacing = (segments) =>
  segments.slice(1).map((segment, index) =>
    Number(
      Math.max(
        0,
        segment.x - (segments[index].x + segments[index].width)
      )
    )
  );

const getLetterSizes = (segments) =>
  segments.map(({ width, height }) => ({
    width: Number(width),
    height: Number(height),
  }));

const speakWord = (word) => {
  if (!window.speechSynthesis) return;
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

const playSuccessSound = () => {
  const audio = new Audio(rewardSound);
  audio.currentTime = 0;
  audio.play().catch(() => {});
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

const buildWordSegments = (canvas, segmentCount) => {
  const { imageData, columnInk, totalDrawnPixels, bounds } = getCanvasInkStats(canvas);

  if (!bounds || totalDrawnPixels < MIN_WORD_PIXELS) {
    return { status: 'empty', totalDrawnPixels };
  }

  const mergedRuns = mergeRuns(getColumnRuns(columnInk));
  let ranges;

  if (mergedRuns.length >= segmentCount) {
    const gaps = mergedRuns.slice(0, -1).map((run, index) => ({
      index,
      gap: mergedRuns[index + 1].start - run.end,
    }));

    const splitIndexes = gaps
      .sort((left, right) => right.gap - left.gap)
      .slice(0, segmentCount - 1)
      .map(({ index }) => index)
      .sort((left, right) => left - right);

    const grouped = [];
    let runStartIndex = 0;

    splitIndexes.forEach((splitIndex) => {
      grouped.push({
        start: mergedRuns[runStartIndex].start,
        end: mergedRuns[splitIndex].end,
      });
      runStartIndex = splitIndex + 1;
    });

    grouped.push({
      start: mergedRuns[runStartIndex].start,
      end: mergedRuns[mergedRuns.length - 1].end,
    });

    ranges = grouped;
  } else {
    ranges = [{ start: bounds.minX, end: bounds.maxX }];

    while (ranges.length < segmentCount) {
      let widestIndex = 0;
      for (let index = 1; index < ranges.length; index++) {
        const currentWidth = ranges[index].end - ranges[index].start;
        const widestWidth = ranges[widestIndex].end - ranges[widestIndex].start;
        if (currentWidth > widestWidth) widestIndex = index;
      }

      const widestRange = ranges[widestIndex];
      if (widestRange.end - widestRange.start < 2) {
        return { status: 'failed' };
      }

      const splitX = findValleySplit(columnInk, widestRange.start, widestRange.end);
      const leftRange = { start: widestRange.start, end: splitX };
      const rightRange = { start: splitX + 1, end: widestRange.end };

      ranges.splice(widestIndex, 1, leftRange, rightRange);
      ranges.sort((left, right) => left.start - right.start);
    }
  }

  const filteredRanges = ranges.filter((range) => range.end > range.start);
  if (filteredRanges.length !== segmentCount) {
    return { status: 'failed' };
  }

  const segments = filteredRanges.map((range) => {
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

    const paddedX = Math.max(0, range.start - SEGMENT_PADDING_PX);
    const paddedY = Math.max(0, minY - SEGMENT_PADDING_PX);

    return {
      x: paddedX,
      y: paddedY,
      width: Math.min(canvas.width - paddedX, (range.end - range.start + 1) + SEGMENT_PADDING_PX * 2),
      height: Math.min(canvas.height - paddedY, (maxY - minY + 1) + SEGMENT_PADDING_PX * 2),
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

const predictWordSegments = async (canvas, word) => {
  const segmentation = buildWordSegments(canvas, word.expectedLength);

  if (segmentation.status !== 'ok') {
    return segmentation;
  }

  const sortedSegments = [...segmentation.segments].sort((left, right) => left.x - right.x);
  const targetChars = getWordCharacters(word.text);

  if (targetChars.length !== word.expectedLength || sortedSegments.length !== word.expectedLength) {
    return { status: 'failed' };
  }

  const predictedLetters = await Promise.all(
    sortedSegments.map(async (segment, index) => {
      const targetChar = targetChars[index];
      const letterId = LETTER_ID_MAP[targetChar];

      if (!letterId) {
        throw new Error(`No letter mapping configured for ${targetChar}`);
      }

      const image = await segmentToBlob(canvas, segment);
      const response = await dysgraphiaService.predictHandwritingLetter(image);

      return {
        letter: response?.predicted ?? '',
        confidence: Number(response?.confidence ?? 0),
      };
    })
  );

  return {
    status: 'ok',
    predictedLetters: predictedLetters.map(({ letter }) => letter),
    predictedWord: predictedLetters.map(({ letter }) => letter).join(''),
    confidences: predictedLetters.map(({ confidence }) => Number(confidence)),
    spacing: getInterLetterSpacing(sortedSegments),
    sizes: getLetterSizes(sortedSegments),
  };
};

const ThreeLetterWordsGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedWord = searchParams.get('word')?.normalize('NFC').trim() || '';
  const requestedWordIndex = WORDS.findIndex((word) => word.id === requestedWord || word.text.normalize('NFC') === requestedWord);
  const [currentIndex, setCurrentIndex] = useState(() => Math.max(0, requestedWordIndex));
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
  const attemptCountRef = useRef(0);

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
    let attemptWasCounted = false;

    setCheckLoading(true);
    setSuccess(false);
    setShowRetry(false);
    setRetryMessage('');

    try {
      const { totalDrawnPixels } = getCanvasInkStats(canvas);
      if (totalDrawnPixels < MIN_WORD_PIXELS) {
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
        setRetryMessage('අකුරු වෙන වෙනම හඳුනාගන්න බැරිවුණා. ටිකක් ඉඩ තබා නැවත ලියන්න.');
        playErrorSound();
        return;
      }

      // Only drawings that pass the local pixel and segmentation validation
      // count as reward attempts.
      attemptCountRef.current += 1;
      attemptWasCounted = true;

      const result = await dysgraphiaService.recordWordActivity({
        group: 'threeLetters',
        wordId: currentWord.id,
        targetWord: currentWord.text,
        expectedLength: currentWord.expectedLength,
        attemptNumber: attemptCountRef.current,
        durationSeconds: 0,
        predictedWord: prediction.predictedWord,
        predictedLetters: JSON.stringify(prediction.predictedLetters),
        confidences: JSON.stringify(prediction.confidences),
        spacing: JSON.stringify(prediction.spacing),
        sizes: JSON.stringify(prediction.sizes),
      });

      if (result.isCorrect) {
        setSuccess(true);
        setShowRetry(false);
        playSuccessSound();

        if (!completedWords.includes(currentIndex) && !rewardedWordRef.current) {
          awardStars(result.starsEarned || 1);
          rewardedWordRef.current = true;
          const newCompleted = [...completedWords, currentIndex];
          setCompletedWords(newCompleted);
          if (newCompleted.length === WORDS.length) {
            setGameFinished(true);
          }
        } else if (!completedWords.includes(currentIndex)) {
          const newCompleted = [...completedWords, currentIndex];
          setCompletedWords(newCompleted);
          if (newCompleted.length === WORDS.length) {
            setGameFinished(true);
          }
        }
      } else {
        const predictedWord = result?.predictedWord || prediction.predictedWord;
        setRetryMessage(predictedWord ? `AI දුටුවේ "${predictedWord}". නැවත උත්සාහ කරන්න!` : 'නැවත උත්සාහ කරන්න!');
        setShowRetry(true);
        setSuccess(false);
        playErrorSound();
      }
    } catch (error) {
      const requestTimedOut = error?.code === 'ECONNABORTED'
        || /timeout.*exceeded/i.test(error?.message || '');
      if (attemptWasCounted && requestTimedOut) {
        attemptCountRef.current = Math.max(0, attemptCountRef.current - 1);
      }
      setRetryMessage(getRequestFailureMessage(error));
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
      rewardedWordRef.current = false;   // reset for new word
      attemptCountRef.current = 0;
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
    attemptCountRef.current = 0;
  };

  if (gameFinished) {
    return (
      <div className="three-letter-game">
        <WordGameDinosaurBackground />
        <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
        <div className="game-complete-card">
          <div className="complete-emoji">🎉✨🏆✨🎉</div>
          <h2>නියමයි! අකුරු තුනේ වචන සියල්ලම ලිව්වා!</h2>
          <p>තරු තුනක් හිමි වේ ⭐⭐⭐</p>
          <button className="game-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🔙 මුල් පිටුවට</button>
          <button className="game-reset-btn" onClick={resetGame}>🔄 නැවත පුහුණු වන්න</button>
        </div>
      </div>
    );
  }

  return (
    <div className="three-letter-game">
      <WordGameDinosaurBackground />
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
              {retryMessage || 'තව ටිකක් පැහැදිලිව ලියන්න. නැවත උත්සාහ කරන්න!'}
            </div>
          )}
        </div>

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
            <button className="next-btn" onClick={nextWord}> අවසන් කරන්න </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeLetterWordsGame;
