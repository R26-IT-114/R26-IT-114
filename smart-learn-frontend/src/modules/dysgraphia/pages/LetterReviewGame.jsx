import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import confetti from 'canvas-confetti';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/letter-review-game.css';
import '../styles/dysgraphia-progress-dashboard.css';
import '../styles/letter-review-dinosaur.css';
import dinosaurBackground from '../../../assets/images/dysgraphia/dinosaurs/dinosaur-learning-background.png';
import babyStegosaurus from '../../../assets/images/dysgraphia/dinosaurs/baby-stegosaurus.png';
import babyTrexLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-trex-letter-board.png';
import babyTriceratopsLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-triceratops-letter-board.png';
import babyBrachiosaurusLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-brachiosaurus-letter-board.png';
import babyStegosaurusLetterBoard from '../../../assets/images/dysgraphia/dinosaurs/letter-boards/baby-stegosaurus-letter-board.png';
import backButtonImage from '../../../assets/images/dysgraphia/back.png';
import letterAImage from '../../../assets/images/dysgraphia/AL.png';
import letterBaImage from '../../../assets/images/dysgraphia/BaL.png';
import letterDhaImage from '../../../assets/images/dysgraphia/DhaL.png';
import letterGaImage from '../../../assets/images/dysgraphia/GaL.png';
import letterHaImage from '../../../assets/images/dysgraphia/HaL.png';
import letterKaImage from '../../../assets/images/dysgraphia/KaL.png';
import letterLaImage from '../../../assets/images/dysgraphia/LaL.png';
import letterMaImage from '../../../assets/images/dysgraphia/MaL.png';
import letterNaImage from '../../../assets/images/dysgraphia/NaL.png';
import letterPaImage from '../../../assets/images/dysgraphia/PaL.png';
import letterRaImage from '../../../assets/images/dysgraphia/RaL.png';
import letterSaImage from '../../../assets/images/dysgraphia/SaL.png';
import letterTaImage from '../../../assets/images/dysgraphia/TaL.png';
import letterThaImage from '../../../assets/images/dysgraphia/ThaL.png';
import letterUImage from '../../../assets/images/dysgraphia/UL.png';
import letterYaImage from '../../../assets/images/dysgraphia/YaL.png';
import aWav from '../../../assets/audio/a.wav';
import baWav from '../../../assets/audio/ba.wav';
import daWav from '../../../assets/audio/da.wav';
import gaWav from '../../../assets/audio/ga.wav';
import kaWav from '../../../assets/audio/ka.wav';
import maWav from '../../../assets/audio/ma.wav';
import naWav from '../../../assets/audio/na.wav';
import paWav from '../../../assets/audio/pa.mp3';
import raWav from '../../../assets/audio/ra.wav';
import saWav from '../../../assets/audio/sa.wav';
import taWav from '../../../assets/audio/ta.wav';
import thaWav from '../../../assets/audio/tha.wav';
import uWav from '../../../assets/audio/u.wav';
import waWav from '../../../assets/audio/wa.wav';
import yaWav from '../../../assets/audio/ya.wav';
import laWav from '../../../assets/audio/la.ogg';
import level3Audio from '../../../assets/audio/dysgraphia/level3.mp3';
import level32Audio from '../../../assets/audio/dysgraphia/level3.2.mp3';
import wrongChoiceAudio from '../../../assets/audio/dysgraphia/wrong.mp3';
import correctChoiceAudio from '../../../assets/audio/dysgraphia/reward.mp3';
import failedDrawingAudio from '../../../assets/audio/dysgraphia/fail.mp3';

// import bg from '../../../assets/images/dysgraphia/reviewbg02.png';

// ===== ADDED: reward imports =====
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';
import { dysgraphiaService } from '../services/dysgraphiaService';

/* ─── Letter data ─── */
const LETTERS = [
  { char: 'අ', audio: 'අ' },
  { char: 'ට', audio: 'ට' },
  { char: 'ර', audio: 'ර' },
  { char: 'ය', audio: 'ය' },
  { char: 'ප', audio: 'ප' },
  { char: 'උ', audio: 'උ' },
  { char: 'ග', audio: 'ග' },
  { char: 'ත', audio: 'ත' },
  { char: 'ල', audio: 'ල' },
  { char: 'න', audio: 'න' },
  { char: 'ම', audio: 'ම' },
  { char: 'ස', audio: 'ස' },
];

const LETTER_IMAGES = {
  'අ': letterAImage,
  'බ': letterBaImage,
  'ද': letterDhaImage,
  'ග': letterGaImage,
  'හ': letterHaImage,
  'ක': letterKaImage,
  'ල': letterLaImage,
  'ම': letterMaImage,
  'න': letterNaImage,
  'ප': letterPaImage,
  'ර': letterRaImage,
  'ස': letterSaImage,
  'ට': letterTaImage,
  'ත': letterThaImage,
  'උ': letterUImage,
  'ය': letterYaImage,
};

let activeKaAudio = null;

const LETTER_AUDIO_CLIPS = {
  'අ': aWav,
  'බ': baWav,
  'ද': daWav,
  'ග': gaWav,
  'ක': kaWav,
  'ම': maWav,
  'න': naWav,
  'ප': paWav,
  'ර': raWav,
  'ස': saWav,
  'ට': taWav,
  'ත': thaWav,
  'උ': uWav,
  'ව': waWav,
  'ය': yaWav,
  'ල': laWav,
};

  //  Waving Leaves Background — per-leaf ripple via SVG filter
const DinosaurReviewBackground = () => (
  <div className="lrg-dino-background" aria-hidden="true">
    <img src={dinosaurBackground} alt="" className="lrg-dino-scene" />
    <div className="lrg-dino-glaze" />
  </div>
);


// Swinging Monkey
const ReviewDinoFriend = () => (
  <img
    src={babyStegosaurus}
    alt=""
    className="lrg-dino-friend"
    aria-hidden="true"
  />
);

const DINO_LETTER_BOARDS = [
  { src: babyTrexLetterBoard, className: 'is-trex' },
  { src: babyTriceratopsLetterBoard, className: 'is-triceratops' },
  { src: babyBrachiosaurusLetterBoard, className: 'is-brachiosaurus' },
  { src: babyStegosaurusLetterBoard, className: 'is-stegosaurus' },
];

const DinosaurLetterBoard = ({ char, mirrored = false, variant = 0 }) => {
  const board = DINO_LETTER_BOARDS[variant % DINO_LETTER_BOARDS.length];

  return (
    <span className={`lrg-dino-letter-board ${board.className}`}>
      <img
        src={board.src}
        alt=""
        className="lrg-dino-letter-board-image"
        aria-hidden="true"
        draggable="false"
      />
      <span className={`lrg-dino-board-letter ${mirrored ? 'is-mirrored' : ''}`}>{char}</span>
    </span>
  );
};

const speakText = (text) => {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'si-LK';
  window.speechSynthesis.speak(u);
};

const playLetterPromptAudio = (letter) => {
  const clipSrc = LETTER_AUDIO_CLIPS[letter?.char];
  if (!clipSrc) {
    speakText(letter.audio);
    return;
  }

  let didFallback = false;
  const fallbackToSpeech = () => {
    if (didFallback) return;
    didFallback = true;
    speakText(letter.audio);
  };

  try {
    window.speechSynthesis.cancel();
    if (activeKaAudio) {
      activeKaAudio.pause();
      activeKaAudio.currentTime = 0;
    }
    const audio = new Audio(clipSrc);
    activeKaAudio = audio;
    audio.onerror = fallbackToSpeech;
    const playPromise = audio.play();
    if (playPromise?.catch) playPromise.catch(fallbackToSpeech);
  } catch {
    fallbackToSpeech();
  }
};

/* ─── Helper: shuffle array ─── */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* ─── Pick 1 distractor + correct letter (2 total) ─── */
const buildChoices = (target) => {
  const pool = LETTERS.filter((l) => l.char !== target.char);
  const distractors = shuffle(pool).slice(0,3);
  return shuffle([target, ...distractors]);
};

const buildMirrorChoices = (target) => {
  const distractorChar = DISTRACTOR_MAP[target.char];

  const mappedDistractor = LETTERS.find(
    (letter) => letter.char === distractorChar
  );
  const distractor = mappedDistractor
    ?? LETTERS.find((letter) => letter.char !== target.char && LETTER_IMAGES[letter.char]);

  return shuffle([
    { ...target, mirrored: false },
    { ...target, mirrored: true },
    { ...distractor, mirrored: false },
    { ...distractor, mirrored: true },
  ]);
};

/* ─── Modes ─── */
const MODE_FIND_WRITE = 'find_write';
const MODE_MIRROR = 'mirror';

/* ─── Tailwind cosmic scenery for review page ─── */
const GALAXY_NEBULAS = [
  { top: '6%', left: '-8%', width: '40rem', height: '24rem', color: 'rgba(98, 226, 255, 0.24)' },
  { top: '18%', left: '26%', width: '54rem', height: '18rem', color: 'rgba(56, 219, 255, 0.18)' },
  { top: '10%', left: '48%', width: '34rem', height: '20rem', color: 'rgba(102, 247, 255, 0.16)' },
  { top: '38%', left: '6%', width: '36rem', height: '18rem', color: 'rgba(97, 161, 255, 0.16)' },
  { top: '54%', left: '58%', width: '30rem', height: '16rem', color: 'rgba(132, 169, 255, 0.14)' },
];

const GALAXY_STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  top: `${(i * 19) % 100}%`,
  left: `${(i * 29 + 11) % 100}%`,
  size: i % 12 === 0 ? 4 : i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
  opacity: i % 10 === 0 ? 1 : 0.45 + (i % 4) * 0.12,
  blur: i % 9 === 0 ? 10 : 6,
}));

const COSMIC_STREAKS = [
  { top: '22%', left: '18%', width: '44rem', rotate: '-7deg', opacity: 0.42 },
  { top: '24%', left: '36%', width: '32rem', rotate: '-14deg', opacity: 0.34 },
  { top: '31%', left: '14%', width: '52rem', rotate: '6deg', opacity: 0.26 },
];

const ReviewGalaxyBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[linear-gradient(180deg,#071126_0%,#0a1c40_24%,#0b3d73_56%,#0d5f97_78%,#0b2748_100%)]"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_8%,rgba(255,244,228,0.95)_0%,rgba(255,190,180,0.24)_7%,rgba(255,255,255,0.06)_13%,transparent_26%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(105,222,255,0.2),transparent_22%),radial-gradient(circle_at_72%_14%,rgba(114,246,255,0.18),transparent_20%),radial-gradient(circle_at_54%_48%,rgba(83,126,255,0.12),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(161,179,255,0.12),transparent_22%)]" />

    {COSMIC_STREAKS.map((streak, index) => (
      <div
        key={index}
        className="absolute rounded-full blur-2xl"
        style={{
          top: streak.top,
          left: streak.left,
          width: streak.width,
          height: '5rem',
          opacity: streak.opacity,
          transform: `rotate(${streak.rotate})`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(154,247,255,0.9), rgba(84,224,255,0.45), rgba(255,255,255,0))',
        }}
      />
    ))}

    {GALAXY_NEBULAS.map((nebula, index) => (
      <div
        key={index}
        className="absolute rounded-full blur-3xl"
        style={{
          top: nebula.top,
          left: nebula.left,
          width: nebula.width,
          height: nebula.height,
          background: `radial-gradient(circle at 50% 50%, ${nebula.color} 0%, rgba(255,255,255,0.08) 22%, transparent 70%)`,
        }}
      />
    ))}

    <div className="absolute left-1/2 top-[26%] h-40 w-[78vw] max-w-6xl -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,245,255,0.24)_0%,rgba(74,214,255,0.14)_34%,transparent_72%)] blur-3xl" />

    {GALAXY_STARS.map((star) => (
      <span
        key={star.id}
        className="absolute block rounded-full bg-white"
        style={{
          top: star.top,
          left: star.left,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          boxShadow: `0 0 ${star.blur}px rgba(255,255,255,0.85)`,
        }}
      />
    ))}

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(3,9,28,0.16)_100%)]" />
  </div>
);

/* ─── Model evaluation helpers ─── */
const REVIEW_LETTER_ID_MAP = {
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
};

const DISTRACTOR_MAP = {
  'අ': 'උ',
  'ට': 'ල',
  'ර': 'ය',
  'ය': 'ස',
  'ප': 'ම',
  'උ': 'අ',
  'ග': 'ත',
  'ත': 'න',
  'ල': 'ට',
  'න': 'ත',
  'ම': 'ප',
  'ස': 'ය',
};

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.error?.message || error?.message || fallbackMessage;

const preprocessBlob = async (blob) => {
  const image = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob failed'))), 'image/jpeg', 0.92);
  });
};

const evalCanvas = async (
  canvasRef,
  targetChar,
  metrics = {},
  submitActivity = dysgraphiaService.recordLetterActivity,
  extraPayload = {}
) => {
  const paths = await canvasRef.current.exportPaths();
  if (!paths || paths.length === 0) return { status: 'empty' };

  const letterId = REVIEW_LETTER_ID_MAP[targetChar];
  if (!letterId) {
    throw new Error(`Unknown review letter mapping for ${targetChar}`);
  }

  const dataUrl = await canvasRef.current.exportImage('jpeg');
  const blob = await fetch(dataUrl).then((r) => r.blob());
  const processed = await preprocessBlob(blob);
  const response = await submitActivity.call(dysgraphiaService, {
    letterId,
    targetChar,
    ...(submitActivity === dysgraphiaService.recordLetterActivity ? { mode: 'review' } : {}),
    durationSeconds: metrics.durationSeconds || 0,
    timerSeconds: metrics.timerSeconds || metrics.durationSeconds || 0,
    strokeCount: paths.length,
    eraseCount: metrics.eraseCount || 0,
    attemptNumber: metrics.attemptNumber || 1,
    ...extraPayload,
    image: processed,
  });

  return {
    status: 'done',
    predicted: response?.predictedLetter ?? response?.predicted ?? null,
    confidence: response?.confidence ?? null,
    isCorrect: Boolean(response?.isCorrect),
    starsEarned: response?.starsAdded ?? response?.starsEarned ?? 0,
  };
};



/* ─────────────────────────────────────────────────────────
   FIND & WRITE ROUND
───────────────────────────────────────────────────────── */
const FindWriteRound = ({ letter, onComplete, roundIndex, totalRounds, onWriteShown, awardStars }) => {
  const [step, setStep] = useState('choose'); // 'choose' | 'write'
  const [choices] = useState(() => buildChoices(letter));
  const [selected, setSelected] = useState(null);
  const [wrongShake, setWrongShake] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState(null); // 'correct' | 'wrong' | 'error' | 'empty'
  const [, setEvalInfo] = useState(null); // { predicted, confidence }
  const [evalMessage, setEvalMessage] = useState('');
  const canvasRef = useRef(null);
  const writeStartedAtRef = useRef(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);
  const [choiceWrongAttemptCount, setChoiceWrongAttemptCount] = useState(0);

  const speak = useCallback(() => {
    playLetterPromptAudio(letter);
  }, [letter]);

  useEffect(() => { speak(); }, [speak]);

  const handleChoiceClick = (ch) => {
    if (ch.char === letter.char) {
      setSelected(ch.char);
      setTimeout(() => setStep('write'), 600);
    } else {
      setChoiceWrongAttemptCount((count) => count + 1);
      setWrongShake(ch.char);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const handleCheck = async () => {
    setEvalLoading(true);
    setEvalFeedback(null);
    setEvalInfo(null);
    setEvalMessage('');
    try {
      const attemptNumber = attemptCount + 1;
      const durationSeconds = writeStartedAtRef.current
        ? Math.max(0, Math.round((Date.now() - writeStartedAtRef.current) / 1000))
        : 0;
      const result = await evalCanvas(canvasRef, letter.char, {
        durationSeconds,
        attemptNumber,
      });
      setAttemptCount(attemptNumber);
      if (result.status === 'empty') { setEvalFeedback('empty'); return; }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      if (result.isCorrect) {
        awardStars(result.starsEarned || 1);
      } else {
        setWrongAttemptCount((count) => count + 1);
      }
      setEvalFeedback(result.isCorrect ? 'correct' : 'wrong');
    } catch (error) {
      setEvalMessage(getErrorMessage(error, 'Server එකට connect වෙන්න බැරිවිය'));
      setEvalFeedback('error');
    } finally {
      setEvalLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'write') {
      writeStartedAtRef.current = Date.now();
      onWriteShown?.();
    }
  }, [step, onWriteShown]);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setHasDrawn(false);
    setEvalFeedback(null);
    setEvalInfo(null);
    setEvalMessage('');
  };

  const handleListenSectionClick = () => {
    speak();
  };

  return (
    <div className="lrg-round-card">
      <div className="lrg-round-badge">{roundIndex + 1} / {totalRounds}</div>

      <div className="lrg-mode-label"> අකුරු හඳුනාගෙන ලියමු</div>

      {step === 'choose' && (
        <>
          <div className="lrg-listen-section" role="button" tabIndex={0} onClick={handleListenSectionClick} onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleListenSectionClick();
            }
          }}>
            <button className="lrg-audio-btn" onClick={speak} aria-label="Play audio">
              <span>🔊</span>
              <span className="lrg-audio-hint">මේ අකුර කුමක්ද?</span>
            </button>
          </div>
          <div className="lrg-choices">
            {choices.map((ch, choiceIndex) => (
              <button
                key={ch.char}
                className={`lrg-choice-btn ${selected === ch.char ? 'lrg-choice-correct' : ''} ${wrongShake === ch.char ? 'lrg-choice-wrong' : ''}`}
                onClick={() => handleChoiceClick(ch)}
              >
                <DinosaurLetterBoard char={ch.char} variant={choiceIndex} />
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'write' && (
        <>
          <div className="lrg-write-prompt">
             <strong>දැන් අපි නිවැරදිව <span className="lrg-big-letter">{letter.char}</span> අකුර ලියමු !</strong> 
          </div>
          <div className="lrg-canvas-shell">
            <ReactSketchCanvas
              ref={canvasRef}
              width="340px"
              height="340px"
              strokeWidth={7}
              strokeColor="black"
              canvasColor="white"
              onStroke={() => setHasDrawn(true)}
              style={{ border: 'none', borderRadius: '16px' }}
            />
          </div>

          {/* Model feedback */}
          {evalFeedback === 'wrong' && (
            <div className="lrg-eval-wrong">
              ❌ නැවත උත්සාහ කරන්න
              {/* {evalInfo?.predicted && <span className="lrg-eval-conf"> — AI දුටුවේ: {evalInfo.predicted}</span>} */}
            </div>
          )}
          {evalFeedback === 'empty' && <div className="lrg-eval-warn">⚠️ කරුණාකර මුලින් අක්ෂරය අඳින්න</div>}
          {evalFeedback === 'error' && <div className="lrg-eval-warn">⚠️ {evalMessage || 'Server එකට connect වෙන්න බැරිවිය'}</div>}

          <div className="lrg-canvas-actions">
            <button
              className="lrg-btn lrg-btn-clear"
              onClick={handleClear}
              disabled={evalFeedback === 'correct'}
            >
              🗑️ මකන්න
            </button>

            <button
              className="lrg-btn lrg-btn-check"
              disabled={!hasDrawn || evalLoading || evalFeedback === 'correct'}
              onClick={handleCheck}
            >
              {evalLoading ? '⏳ ...' : ' පරීක්ෂා කරන්න'}
            </button>

            {evalFeedback === 'correct' && (
              <button className="lrg-btn lrg-btn-next" onClick={onComplete}>
                ඊළඟ →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
  MIRROR ROUND
  Step 1 – "choose": select the target letter from four choices.
  Step 2 – "write":  draw the letter; ML model checks it.
───────────────────────────────────────────────────────── */
const MirrorRound = ({ letter, onComplete, roundIndex, totalRounds, onWriteShown, awardStars }) => {
  // 'choose' → user picks the target letter
  // 'write'  → user draws the letter, model checks
  const [step, setStep] = useState('choose');

  const [choices] = useState(() => buildMirrorChoices(letter));
  const [wrongShake, setWrongShake] = useState(null);
  const [selectedCorrect, setSelectedCorrect] = useState(null);
  const [mirrorWrongAttempts, setMirrorWrongAttempts] = useState(0);
  const [mirrorTotalAttempts, setMirrorTotalAttempts] = useState(0);
  const [drawingEraseCount, setDrawingEraseCount] = useState(0);

  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState(null);
  const [, setEvalInfo] = useState(null);
  const [evalMessage, setEvalMessage] = useState('');
  const canvasRef = useRef(null);
  const feedbackAudioRef = useRef(null);
  const writeStartedAtRef = useRef(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [wrongAttemptCount, setWrongAttemptCount] = useState(0);

  const speak = useCallback(() => {
    playLetterPromptAudio(letter);
  }, [letter]);

  const playChoiceFeedback = useCallback((source) => {
    feedbackAudioRef.current?.pause();
    const audio = new Audio(source);
    feedbackAudioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => () => {
    feedbackAudioRef.current?.pause();
    feedbackAudioRef.current = null;
  }, []);

  const celebrateCorrectChoice = useCallback(() => {
    const fireworkOptions = {
      particleCount: 72,
      spread: 360,
      startVelocity: 42,
      gravity: 0.75,
      ticks: 90,
      scalar: 1.05,
      colors: ['#ffd83d', '#ff6b7a', '#7c5cff', '#34d9ff', '#65e572'],
      zIndex: 1190,
      disableForReducedMotion: true,
    };

    confetti({ ...fireworkOptions, origin: { x: 0.28, y: 0.38 } });
    confetti({ ...fireworkOptions, origin: { x: 0.72, y: 0.38 } });
  }, []);

  /* ── Step 1: choose ── */
  const handleChoiceClick = (choice) => {
    const choiceKey = `${choice.char}-${choice.mirrored}`;
    if (choice.char === letter.char && !choice.mirrored) {
      playChoiceFeedback(correctChoiceAudio);
      celebrateCorrectChoice();
      setSelectedCorrect(choiceKey);
      setMirrorTotalAttempts((count) => count + 1);
      setTimeout(() => setStep('write'), 700);
    } else {
      playChoiceFeedback(wrongChoiceAudio);
      setMirrorWrongAttempts((count) => count + 1);
      setMirrorTotalAttempts((count) => count + 1);
      setWrongShake(choiceKey);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  /* ── Step 2: write + model ── */
  const handleCheck = async () => {
    setEvalLoading(true);
    setEvalFeedback(null);
    setEvalInfo(null);
    setEvalMessage('');
    try {
      const attemptNumber = attemptCount + 1;
      const durationSeconds = writeStartedAtRef.current
        ? Math.max(0, Math.round((Date.now() - writeStartedAtRef.current) / 1000))
        : 0;
      const totalAttempts = mirrorTotalAttempts;
      const result = await evalCanvas(canvasRef, letter.char, {
        durationSeconds,
        attemptNumber,
        eraseCount: drawingEraseCount,
      }, dysgraphiaService.recordMirrorLetterActivity, {
        wrongAttempts: mirrorWrongAttempts,
        totalAttempts,
        correctAttempts: 1,
        completed: true,
        drawingDurationSeconds: durationSeconds,
        drawingEraseCount,
      });
      setAttemptCount(attemptNumber);
      if (result.status === 'empty') { setEvalFeedback('empty'); return; }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      if (result.isCorrect) {
        celebrateCorrectChoice();
        if (result.starsEarned > 0) {
          playChoiceFeedback(correctChoiceAudio);
          awardStars(result.starsEarned);
        }
      } else {
        playChoiceFeedback(failedDrawingAudio);
        setWrongAttemptCount((count) => count + 1);
      }
      setEvalFeedback(result.isCorrect ? 'correct' : 'wrong');
    } catch (error) {
      setEvalMessage(getErrorMessage(error, 'Server එකට connect වෙන්න බැරිවිය'));
      setEvalFeedback('error');
    } finally {
      setEvalLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'write') {
      writeStartedAtRef.current = Date.now();
      onWriteShown?.();
    }
  }, [step, onWriteShown]);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setDrawingEraseCount((count) => count + 1);
    setHasDrawn(false);
    setEvalFeedback(null);
    setEvalInfo(null);
    setEvalMessage('');
  };

  return (
    <div className="lrg-round-card !relative !mx-auto !w-full !max-w-4xl !rounded-2xl !border-4 !border-white/90 !bg-gradient-to-br !from-cyan-50 !via-white !to-emerald-50 !p-3 !text-slate-800 !shadow-[0_10px_0_rgba(21,128,61,.35),0_20px_38px_rgba(0,0,0,.25)] sm:!rounded-3xl sm:!p-6 lg:!rounded-[2.5rem] lg:!p-8 lg:!shadow-[0_16px_0_rgba(21,128,61,.35),0_28px_55px_rgba(0,0,0,.28)]">
      <div className="lrg-round-badge !relative !right-auto !top-auto !self-end !rounded-full !border-2 !border-white !bg-gradient-to-r !from-orange-400 !to-pink-500 !px-3 !py-1.5 !text-xs !font-black !text-white !shadow-lg sm:!px-4 sm:!py-2 sm:!text-sm">{roundIndex + 1} / {totalRounds}</div>

      {/* ── STEP 1: choose the correct letter ── */}
      {step === 'choose' && (
        <>
          <div className="lrg-mirror-question !rounded-2xl !border-2 !border-emerald-200 !bg-white/80 !p-3 !shadow-inner sm:!rounded-3xl sm:!p-4">
            <span className="lrg-mirror-q-emoji"></span>
            <p className="lrg-mirror-q-text !text-black">
              <strong>නිවැරදි අකුර</strong> තෝරන්න?<br />
              {/* <span className="lrg-mirror-q-sub">Tap the correct letter (not the mirror!)</span> */}
            </p>
          </div>

           <button className="lrg-audio-btn !mx-auto !my-2 !flex !h-auto !min-h-11 !w-auto !max-w-full !shrink-0 !flex-row !items-center !justify-center !gap-2 !whitespace-nowrap !rounded-[60px] !border-0 !bg-[linear-gradient(135deg,#7c5ee8,#4a2fc0)] !px-6 !py-2.5 !text-base !font-bold !text-white !shadow-[0_5px_12px_rgba(0,0,0,.2)] !transition-transform !duration-200 hover:!scale-[1.04] hover:!bg-[linear-gradient(135deg,#8f74ff,#5f40e0)] sm:!my-4 sm:!px-8 sm:!py-3 sm:!text-[1.2rem]" onClick={speak} aria-label="මේ අකුර කුමක්ද?" title="මේ අකුර කුමක්ද?">
              <span aria-hidden="true">🔊</span>
              <span>අහන්න</span>
            </button>

          <div className="lrg-mirror-choice-row !mt-3 !grid !grid-cols-2 !gap-2 sm:!mt-5 sm:!gap-4 lg:!mt-6 lg:!gap-6">
            {choices.map((choice, choiceIndex) => {
              const choiceKey = `${choice.char}-${choice.mirrored}`;
              return (
                <button
                  key={choiceKey}
                  className={[
                    'lrg-mirror-choice-btn !min-h-28 !rounded-2xl !border-[3px] !border-emerald-100 !bg-gradient-to-br !from-white !to-cyan-50 !p-2 !shadow-[0_5px_0_#a7f3d0] !transition-all !duration-200 hover:!-translate-y-1 hover:!border-yellow-300 hover:!from-yellow-50 hover:!to-orange-100 hover:!shadow-[0_8px_0_#fcd34d] active:!translate-y-1 active:!shadow-[0_3px_0_#a7f3d0] sm:!min-h-36 sm:!rounded-3xl sm:!border-4 sm:!p-4 lg:hover:!-translate-y-2',
                    wrongShake === choiceKey ? 'lrg-choice-wrong' : '',
                    selectedCorrect === choiceKey ? 'lrg-choice-correct' : '',
                  ].join(' ')}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={selectedCorrect}
                  aria-label={`Select letter ${choice.char}`}
                >
                  <DinosaurLetterBoard
                    char={choice.char}
                    mirrored={choice.mirrored}
                    variant={choiceIndex}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── STEP 2: draw the letter ── */}
      {step === 'write' && (
        <>
          <div className="lrg-write-prompt !text-slate-600">
             හොඳයි! දැන් <strong>{letter.char}</strong> ලියන්න
          </div>
          <div className="lrg-canvas-shell">
            <ReactSketchCanvas
              ref={canvasRef}
              width="340px"
              height="340px"
              strokeWidth={7}
              strokeColor="black"
              canvasColor="white"
              onStroke={() => setHasDrawn(true)}
              style={{ border: 'none', borderRadius: '16px' }}
            />
          </div>

          {evalFeedback === 'wrong' && (
            <div className="lrg-eval-wrong">
              ❌ නැවත උත්සාහ කරන්න
              {/* {evalInfo?.predicted && <span className="lrg-eval-conf"> — AI දුටුවේ: {evalInfo.predicted}</span>} */}
            </div>
          )}
          {evalFeedback === 'empty' && <div className="lrg-eval-warn">⚠️ කරුණාකර මුලින් අක්ෂරය අඳින්න</div>}
          {evalFeedback === 'error' && <div className="lrg-eval-warn">⚠️ {evalMessage || 'Server එකට connect වෙන්න බැරිවිය'}</div>}

          <div className="lrg-canvas-actions">
            <button
              className="lrg-btn lrg-btn-clear"
              onClick={handleClear}
              disabled={evalFeedback === 'correct'}
            >
              🗑️ මකන්න
            </button>

            <button
              className="lrg-btn lrg-btn-check"
              disabled={!hasDrawn || evalLoading || evalFeedback === 'correct'}
              onClick={handleCheck}
            >
              {evalLoading ? '⏳ ...' : '🔍 පරීක්ෂා කරන්න'}
            </button>

            {evalFeedback === 'correct' && (
              <button className="lrg-btn lrg-btn-next" onClick={onComplete}>
                ඊළඟ →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
const LetterReviewGame = () => {
  const navigate = useNavigate();
  const narrationAudioRef = useRef(null);
  const hasPlayedIntroRef = useRef(false);
  const [narrationPlaying, setNarrationPlaying] = useState(false);
  const [narrationSrc, setNarrationSrc] = useState(level3Audio);

  /* Build the review sequence from mirror-letter rounds. */
  const [rounds] = useState(() => {
    const pool = LETTERS.slice(0, 10);
    return pool.map((letter) => ({
      letter,
      mode: MODE_MIRROR,
    }));
  });

  const [currentRound, setCurrentRound] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [progressReady, setProgressReady] = useState(false);

  // ===== ADDED: reward hook =====
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();

  useEffect(() => {
    let active = true;

    const restoreRound = (overview) => {
      if (!active) return;
      const mirrorProgress = overview?.dysgraphia?.mirrorLetters || {};
      const completedQuestions = Object.values(mirrorProgress).reduce(
        (total, item) => total + Number(item?.drawingCorrectAttempts || 0),
        0
      );
      const resumedRound = completedQuestions % rounds.length;
      setCurrentRound(resumedRound);
      setScore(resumedRound);
      setProgressReady(true);
    };

    dysgraphiaService.getOverview()
      .then(restoreRound)
      .catch(() => restoreRound(dysgraphiaService.getCachedOverview()));

    return () => {
      active = false;
    };
  }, [rounds.length]);

  const handleRoundComplete = () => {
    setScore((s) => s + 1);
    if (currentRound + 1 >= rounds.length) {
      setCompleted(true);
    } else {
      setCurrentRound((r) => r + 1);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  useEffect(() => {
    const audio = narrationAudioRef.current;
    if (!audio) return;

    audio.volume = 0.9;

    const handleEnded = () => setNarrationPlaying(false);
    audio.addEventListener('ended', handleEnded);

    if (!hasPlayedIntroRef.current) {
      hasPlayedIntroRef.current = true;
      audio.currentTime = 0;
      audio.muted = true;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => {
            setNarrationPlaying(true);
            requestAnimationFrame(() => {
              audio.muted = false;
            });
          })
          .catch(() => setNarrationPlaying(false));
      } else {
        setNarrationPlaying(!audio.paused);
        requestAnimationFrame(() => {
          audio.muted = false;
        });
      }
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playNarration = useCallback((source) => {
    const audio = narrationAudioRef.current;
    if (!audio) return;

    if (audio.src !== source) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = source;
      audio.load();
    }

    audio.muted = false;

    audio
      .play()
      .then(() => setNarrationPlaying(true))
      .catch(() => setNarrationPlaying(false));
  }, []);

  const handleNarrationToggle = useCallback(() => {
    const audio = narrationAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      playNarration(narrationSrc);
      return;
    }

    audio.pause();
    setNarrationPlaying(false);
  }, [narrationSrc, playNarration]);

  const handleWriteShown = useCallback(() => {
    if (currentRound === 0) {
      setNarrationSrc(level32Audio);
      playNarration(level32Audio);
    }
  }, [playNarration, currentRound]);

  useEffect(() => {
    if (!completed) {
      setNarrationSrc(level3Audio);
      if (currentRound > 0) {
        const audio = narrationAudioRef.current;
        if (audio) {
          audio.pause();
          setNarrationPlaying(false);
        }
      }
    }
  }, [currentRound, completed]);

  const round = rounds[currentRound];

  return (
    <main className="dgd-shell dg-shell dg-theme-review !relative !min-h-screen !overflow-x-hidden !px-2 !pb-10 !pt-20 sm:!px-5 sm:!pb-14 sm:!pt-20 lg:!px-6 lg:!pb-16 lg:!pt-10">

    {/* style={{
    backgroundImage: `url(${bg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }} */}
      <DinosaurReviewBackground />
      <ReviewDinoFriend />

      <audio
        ref={narrationAudioRef}
        src={narrationSrc}
        preload="auto"
        playsInline
        onEnded={() => setNarrationPlaying(false)}
        style={{ display: 'none' }}
      />

      {/* ===== ADDED: reward box ===== */}
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />

      <button
        type="button"
        className={`lrg-page-audio-btn !fixed !right-2 !top-2 !z-40 !grid !h-11 !w-11 !place-items-center !rounded-full !border-[3px] !border-white !bg-gradient-to-br !from-sky-400 !to-blue-600 !text-white !shadow-[0_5px_0_#1e40af] !transition hover:!-translate-y-1 active:!translate-y-1 sm:!right-4 sm:!top-4 sm:!h-12 sm:!w-12 sm:!border-4 sm:!shadow-[0_6px_0_#1e40af] ${narrationPlaying ? 'is-playing animate-pulse' : ''}`}
        onClick={handleNarrationToggle}
        aria-label={narrationPlaying ? 'Stop page narration' : 'Play page narration'}
        title="Page narration"
      >
        <span className="lrg-page-audio-icon" aria-hidden="true">
          {narrationPlaying ? (
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

      <button
        type="button"
        className="!fixed !left-2 !top-12 !z-40 !m-0 !border-0 !bg-transparent !p-0 !transition-transform hover:!-translate-y-1 hover:!scale-105 active:!translate-y-0 active:!scale-95 sm:!left-4 sm:!top-18"
        onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}
        aria-label="Go to dysgraphia home page"
        title="ඩිස්ග්‍රාෆියා මුල් පිටුවට යන්න"
      >
        <img
          className="!block !h-auto !w-[72px] !select-none sm:!w-[88px]"
          src={backButtonImage}
          alt=""
          aria-hidden="true"
          draggable="false"
        />
      </button>

      <header
        className="dgd-header relative z-10 mx-auto mb-3 flex max-w-6xl justify-center px-12 sm:mb-5 sm:px-20 lg:mb-6 lg:px-0"
        style={{ padding: 0, border: 0, borderRadius: 0, background: 'transparent', boxShadow: 'none', backdropFilter: 'none' }}
      >
        <h1 className="m-0 text-center text-xl font-black leading-tight !text-white drop-shadow-[0_3px_5px_rgba(0,0,0,.55)] sm:text-3xl lg:text-4xl" style={{ fontFamily: "'Noto Sans Sinhala', 'Nunito', system-ui, sans-serif" }}>
          <strong>දර්පණ අකුරු</strong> ඉගෙන ගමු
        </h1>
      </header>

      {!progressReady ? (
        <div className="relative z-10 grid min-h-48 w-full place-items-center text-lg font-black text-white" role="status">
          ප්‍රගතිය පූරණය වෙමින්...
        </div>
      ) : !completed ? (
        <div className="lrg-stage relative z-10 !w-full !max-w-5xl !bg-transparent !p-0 sm:!p-3 lg:!p-5">

          {/* Progress bar */}
          <div className="lrg-progress-bar !mx-auto !mb-3 !h-4 !max-w-3xl !overflow-hidden !rounded-full !border-2 !border-white !bg-emerald-950/50 !p-0.5 !shadow-inner sm:!mb-5 sm:!h-5 sm:!p-1">
            <div className="lrg-progress-fill !h-full !rounded-full !bg-gradient-to-r !from-yellow-300 !via-orange-400 !to-pink-500 !transition-all !duration-500" style={{ width: `${(currentRound / rounds.length) * 100}%` }} />
          </div>

          <MirrorRound
            key={currentRound}
            letter={round.letter}
            onComplete={handleRoundComplete}
            roundIndex={currentRound}
            totalRounds={rounds.length}
            onWriteShown={handleWriteShown}
            awardStars={awardStars}
          />
        </div>
      ) : (
        <div className="lrg-complete-card">
          <div className="lrg-complete-stars">⭐⭐⭐</div>
          <h2 className="lrg-complete-title">🎉 හොඳින් කළා!</h2>
          <p className="lrg-complete-score">{score} / {rounds.length} නිවැරදිව</p>
          <div className="lrg-complete-actions">
            <button className="lrg-btn lrg-btn-next" onClick={handleRestart}>🔁 නැවත කරන්න</button>
            <button className="lrg-btn lrg-btn-clear" onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}>🏠 ගෙදර</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default LetterReviewGame;
