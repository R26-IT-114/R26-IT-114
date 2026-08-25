import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import wrongSound from '../../../assets/audio/dysgraphia/wrong.mp3';
import rewardSound from '../../../assets/audio/dysgraphia/reward.mp3';
import { dysgraphiaService } from '../services/dysgraphiaService';

const WORDS = ['රට', 'බට', 'ගස', 'දර', 'මල', 'යට', 'උල', 'මම'];
const MODEL_IMAGE_SIZE = 128;
const MODEL_PADDING = 14;
const LETTER_COMPLETION_THRESHOLD = 0.45;
const GUIDE_COVERAGE_TOLERANCE_PX = 14;

const LETTER_ID_MAP = {
  අ: 'a', බ: 'ba', ද: 'dha', ග: 'ga', හ: 'ha', ක: 'ka',
  ල: 'la', ම: 'ma', න: 'na', ප: 'pa', ර: 'ra', ස: 'sa',
  ට: 'ta', ත: 'tha', උ: 'u', ය: 'ya', ව: 'wa',
};

const getInkBounds = (imageData, startX, endX) => {
  const { data, width, height } = imageData;
  let minX = endX;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  let inkPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= 30) continue;
      inkPixels += 1;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1, inkPixels };
};

const letterSegmentToBlob = (canvas, bounds) => {
  const source = document.createElement('canvas');
  source.width = bounds.width;
  source.height = bounds.height;
  const sourceContext = source.getContext('2d');
  const sourceData = canvas.getContext('2d').getImageData(bounds.x, bounds.y, bounds.width, bounds.height);
  const binaryData = sourceContext.createImageData(bounds.width, bounds.height);

  for (let index = 0; index < sourceData.data.length; index += 4) {
    const hasInk = sourceData.data[index + 3] > 30;
    binaryData.data[index] = hasInk ? 0 : 255;
    binaryData.data[index + 1] = hasInk ? 0 : 255;
    binaryData.data[index + 2] = hasInk ? 0 : 255;
    binaryData.data[index + 3] = 255;
  }
  sourceContext.putImageData(binaryData, 0, 0);

  const normalized = document.createElement('canvas');
  normalized.width = MODEL_IMAGE_SIZE;
  normalized.height = MODEL_IMAGE_SIZE;
  const normalizedContext = normalized.getContext('2d');
  normalizedContext.fillStyle = '#ffffff';
  normalizedContext.fillRect(0, 0, MODEL_IMAGE_SIZE, MODEL_IMAGE_SIZE);
  const scale = Math.min(
    (MODEL_IMAGE_SIZE - MODEL_PADDING * 2) / bounds.width,
    (MODEL_IMAGE_SIZE - MODEL_PADDING * 2) / bounds.height,
  );
  const drawWidth = Math.max(1, Math.round(bounds.width * scale));
  const drawHeight = Math.max(1, Math.round(bounds.height * scale));
  normalizedContext.drawImage(
    source,
    Math.round((MODEL_IMAGE_SIZE - drawWidth) / 2),
    Math.round((MODEL_IMAGE_SIZE - drawHeight) / 2),
    drawWidth,
    drawHeight,
  );

  return new Promise((resolve, reject) => normalized.toBlob(
    (blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the traced letter.'))),
    'image/png',
  ));
};

const predictTracedWord = async (canvas, targetWord) => {
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const middle = Math.floor(canvas.width / 2);
  const bounds = [getInkBounds(imageData, 0, middle), getInkBounds(imageData, middle, canvas.width)];
  const targetLetters = Array.from(targetWord);

  if (bounds.some((letterBounds) => !letterBounds || letterBounds.inkPixels < 100)) {
    return { status: 'incomplete' };
  }

  const predictions = await Promise.all(bounds.map(async (letterBounds, index) => {
    const targetChar = targetLetters[index];
    const letterId = LETTER_ID_MAP[targetChar];
    if (!letterId) throw new Error(`No model mapping for ${targetChar}`);
    const image = await letterSegmentToBlob(canvas, letterBounds);
    const result = await dysgraphiaService.submitLetterAttempt({
      letterId,
      targetChar,
      mode: 'independent',
      durationSeconds: 0,
      image,
    });
    return result?.predicted ?? '';
  }));

  return { status: 'ok', predictedWord: predictions.join(''), predictedLetters: predictions };
};

const prepareCanvas = (canvas) => {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width: rect.width, height: rect.height };
};

const DottedWordTracingGame = () => {
  const navigate = useNavigate();
  const guideCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const drawingContextRef = useRef(null);
  const guideImageDataRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const rewardAudioRef = useRef(null);
  const outsideGuideRef = useRef(false);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const tracedDistanceRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [completedLetters, setCompletedLetters] = useState([false, false]);
  const [checkLoading, setCheckLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const currentWord = WORDS[currentIndex];

  const drawGuide = useCallback(() => {
    const canvas = guideCanvasRef.current;
    if (!canvas) return;
    const { context, width, height } = prepareCanvas(canvas);
    context.clearRect(0, 0, width, height);

    // Draw the word as a clean, rounded broken line like a handwriting
    // worksheet. A regular font weight prevents a heavy double outline.
    context.save();
    context.strokeStyle = '#111827';
    context.lineWidth = Math.max(2, Math.min(3.5, width / 260));
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.setLineDash([5, 9]);
    const characterCount = Array.from(currentWord).length;
    const desktopScale = width >= 640 ? 0.72 : 0.58;
    const fontSize = Math.min(height * desktopScale, width / Math.max(2.25, characterCount * 1.05));
    context.font = `500 ${fontSize}px 'Noto Sans Sinhala', 'Nirmala UI', sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeText(currentWord, width / 2, height / 2 + fontSize * 0.05);
    context.restore();
    guideImageDataRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
  }, [currentWord]);

  const clearDrawing = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const { context, width, height } = prepareCanvas(canvas);
      context.clearRect(0, 0, width, height);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = Math.max(7, width / 70);
      context.strokeStyle = '#7c3aed';
      drawingContextRef.current = context;
    }
    tracedDistanceRef.current = 0;
    outsideGuideRef.current = false;
    setHasDrawn(false);
    setCompletedLetters([false, false]);
    setCheckLoading(false);
    setFeedback(null);
  }, []);

  useEffect(() => {
    wrongAudioRef.current = new Audio(wrongSound);
    wrongAudioRef.current.preload = 'auto';
    rewardAudioRef.current = new Audio(rewardSound);
    rewardAudioRef.current.preload = 'auto';

    const refreshCanvases = () => {
      drawGuide();
      clearDrawing();
    };
    refreshCanvases();
    document.fonts?.ready.then(drawGuide);
    window.addEventListener('resize', refreshCanvases);
    return () => {
      window.removeEventListener('resize', refreshCanvases);
      wrongAudioRef.current?.pause();
      rewardAudioRef.current?.pause();
    };
  }, [drawGuide, clearDrawing]);

  const getPoint = (event) => {
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const isPointNearGuide = (point) => {
    const canvas = guideCanvasRef.current;
    const imageData = guideImageDataRef.current;
    if (!canvas || !imageData) return true;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const centerX = Math.round(point.x * scaleX);
    const centerY = Math.round(point.y * scaleY);
    const cssTolerance = rect.width >= 640 ? 28 : 20;
    const radiusX = Math.ceil(cssTolerance * scaleX);
    const radiusY = Math.ceil(cssTolerance * scaleY);
    const { data, width, height } = imageData;

    for (let y = Math.max(0, centerY - radiusY); y <= Math.min(height - 1, centerY + radiusY); y += 2) {
      for (let x = Math.max(0, centerX - radiusX); x <= Math.min(width - 1, centerX + radiusX); x += 2) {
        const normalizedX = (x - centerX) / radiusX;
        const normalizedY = (y - centerY) / radiusY;
        if (normalizedX * normalizedX + normalizedY * normalizedY > 1) continue;
        if (data[(y * width + x) * 4 + 3] > 30) return true;
      }
    }
    return false;
  };

  const showWrongFeedback = () => {
    if (outsideGuideRef.current) return;
    outsideGuideRef.current = true;
    drawingRef.current = false;
    lastPointRef.current = null;
    setFeedback('retry');

    const audio = wrongAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const updateLetterCompletion = () => {
    const guideData = guideImageDataRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!guideData || !drawingCanvas) return;

    const drawingData = drawingCanvas.getContext('2d').getImageData(
      0,
      0,
      drawingCanvas.width,
      drawingCanvas.height,
    );
    const middle = Math.floor(guideData.width / 2);
    const pixelRatio = drawingCanvas.width / drawingCanvas.getBoundingClientRect().width;
    const coverageRadius = Math.max(1, Math.round(GUIDE_COVERAGE_TOLERANCE_PX * pixelRatio));

    const hasDrawingNear = (centerX, centerY) => {
      for (let y = Math.max(0, centerY - coverageRadius); y <= Math.min(drawingData.height - 1, centerY + coverageRadius); y += 2) {
        for (let x = Math.max(0, centerX - coverageRadius); x <= Math.min(drawingData.width - 1, centerX + coverageRadius); x += 2) {
          const dx = x - centerX;
          const dy = y - centerY;
          if (dx * dx + dy * dy > coverageRadius * coverageRadius) continue;
          if (drawingData.data[(y * drawingData.width + x) * 4 + 3] > 30) return true;
        }
      }
      return false;
    };

    const completion = [[0, middle], [middle, guideData.width]].map(([startX, endX]) => {
      let guidePixels = 0;
      let coveredPixels = 0;
      for (let y = 0; y < guideData.height; y += 3) {
        for (let x = startX; x < endX; x += 3) {
          const pixelIndex = (y * guideData.width + x) * 4 + 3;
          if (guideData.data[pixelIndex] <= 30) continue;
          guidePixels += 1;
          if (hasDrawingNear(x, y)) coveredPixels += 1;
        }
      }
      return guidePixels > 0 && coveredPixels / guidePixels >= LETTER_COMPLETION_THRESHOLD;
    });
    setCompletedLetters(completion);
  };

  const startDrawing = (event) => {
    const point = getPoint(event);
    if (!isPointNearGuide(point)) {
      showWrongFeedback();
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = point;
    const context = drawingContextRef.current;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const point = getPoint(event);
    if (!isPointNearGuide(point)) {
      showWrongFeedback();
      return;
    }
    const previous = lastPointRef.current;
    const context = drawingContextRef.current;
    context.lineTo(point.x, point.y);
    context.stroke();
    context.beginPath();
    context.moveTo(point.x, point.y);
    if (previous) tracedDistanceRef.current += Math.hypot(point.x - previous.x, point.y - previous.y);
    lastPointRef.current = point;
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
    if (!outsideGuideRef.current) updateLetterCompletion();
  };

  const checkTracing = async () => {
    if (checkLoading || outsideGuideRef.current || !completedLetters.every(Boolean)) {
      setFeedback('retry');
      return;
    }
    setCheckLoading(true);
    try {
      const prediction = await predictTracedWord(drawingCanvasRef.current, currentWord);
      if (prediction.status === 'ok' && prediction.predictedWord === currentWord) {
        setFeedback('correct');
        const audio = rewardAudioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else {
        setFeedback('retry');
        const audio = wrongAudioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }
    } catch {
      setFeedback('retry');
    } finally {
      setCheckLoading(false);
    }
  };

  const nextWord = () => {
    if (currentIndex + 1 >= WORDS.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const speakWord = () => {
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.lang = 'si-LK';
    utterance.rate = 0.75;
    window.speechSynthesis?.speak(utterance);
  };

  if (finished) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-emerald-950 via-green-800 to-teal-700 px-4 py-12">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-lime-300/25 blur-3xl" />
        <section className="relative w-full max-w-xl rounded-[2.5rem] border-4 border-white/90 bg-white/95 p-8 text-center shadow-[0_16px_0_rgba(5,150,105,.45),0_30px_70px_rgba(0,0,0,.35)] sm:p-12">
          <div className="mb-4 text-6xl">🎉⭐🏆</div>
          <h1 className="mb-3 text-3xl font-black text-emerald-700 sm:text-4xl">නියමයි!</h1>
          <p className="mb-8 text-lg font-bold text-slate-600">ඔබ සියලුම තිත් වචන ලිව්වා.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 font-black text-white shadow-lg transition hover:-translate-y-1" onClick={() => { setCurrentIndex(0); setFinished(false); }}>🔄 නැවත ලියමු</button>
            <button className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-7 py-3 font-black text-white shadow-lg transition hover:-translate-y-1" onClick={() => navigate('/dysgraphia/word-game')}>🏠 මුල් පිටුව</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-950 via-green-800 to-teal-700 px-3 pb-12 pt-6 sm:px-6 sm:pt-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-lime-300/25 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <span className="absolute bottom-5 left-4 text-5xl opacity-60">🌿</span>
        <span className="absolute bottom-4 right-4 text-6xl opacity-60">🌳</span>
      </div>

      <header className="relative z-10 mx-auto mb-5 flex max-w-5xl items-center justify-between gap-2 rounded-full border-2 border-white/80 bg-white/85 p-2 shadow-xl backdrop-blur-xl sm:px-4 sm:py-3">
        <button className="min-h-11 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-4 text-xs font-black text-white shadow-[0_5px_0_#be123c] transition hover:-translate-y-1 active:translate-y-1 sm:px-6 sm:text-sm" onClick={() => navigate('/dysgraphia/word-game')}>← <span className="hidden sm:inline">මුල් පිටුව</span></button>
        <div className="rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 px-4 py-2 text-sm font-black text-amber-950 shadow-md sm:px-6 sm:text-base">✏️ {currentIndex + 1} / {WORDS.length}</div>
        <button className="min-h-11 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-4 text-xs font-black text-white shadow-[0_5px_0_#4338ca] transition hover:-translate-y-1 active:translate-y-1 sm:px-6 sm:text-sm" onClick={speakWord}>🔊 <span className="hidden sm:inline">අහන්න</span></button>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl rounded-[2rem] border-4 border-white/90 bg-white/95 p-4 shadow-[0_14px_0_rgba(5,150,105,.4),0_28px_60px_rgba(0,0,0,.3)] sm:rounded-[2.5rem] sm:p-8">
        <div className="mb-5 text-center">
          <span className="inline-flex rounded-full bg-violet-100 px-5 py-2 text-sm font-black text-violet-700 sm:text-base">තිත් උඩින් වචනය ලියමු</span>
          <h1 className="mt-3 text-2xl font-black text-slate-800 sm:text-4xl">රේඛා දෙක අතර <span className="text-violet-700">{currentWord}</span> ලියන්න</h1>
          <p className="mt-2 font-bold text-slate-500">අළු පාට තිත් රේඛා උඩින් පැන්සල ගෙන යන්න.</p>
        </div>

        <div className="relative h-[300px] overflow-hidden rounded-3xl border-4 border-slate-200 bg-white shadow-inner sm:h-[420px]">
          <canvas ref={guideCanvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
          <canvas
            ref={drawingCanvasRef}
            className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>

        {feedback === 'retry' && <div className="mx-auto mt-4 max-w-xl rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-center font-black text-red-600">✏️ තිත් උඩින් වචනය සම්පූර්ණයෙන් ලියන්න.</div>}
        {feedback === 'correct' && <div className="mx-auto mt-4 max-w-xl rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center font-black text-emerald-700">✅ හොඳයි! ඊළඟ වචනයට යමු.</div>}

        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="min-h-12 rounded-full bg-gradient-to-r from-slate-500 to-slate-700 px-7 font-black text-white shadow-lg transition hover:-translate-y-1" onClick={clearDrawing}>🗑️ මකන්න</button>
          {feedback === 'correct' ? (
            <button className="min-h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 font-black text-white shadow-lg transition hover:-translate-y-1" onClick={nextWord}>{currentIndex + 1 < WORDS.length ? 'ඊළඟ වචනය →' : 'අවසන් කරන්න 🏁'}</button>
          ) : (
            <button className="min-h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-700 px-8 font-black text-white shadow-lg transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50" onClick={checkTracing} disabled={!hasDrawn || !completedLetters.every(Boolean) || outsideGuideRef.current || checkLoading}>
              {checkLoading ? '⏳ පරීක්ෂා කරමින්...' : '✅ පරීක්ෂා කරන්න'}
            </button>
          )}
        </div>
      </section>
    </main>
  );
};

export default DottedWordTracingGame;
