import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/letter-review-game.css';
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
import level3Audio from '../../../assets/audio/level3.mp3';
import level32Audio from '../../../assets/audio/level3.2.mp3';

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
  // { char: 'ත', audio: 'ත' },
  { char: 'ල', audio: 'ල' },
  { char: 'න', audio: 'න' },
  { char: 'ම', audio: 'ම' },
];

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

const evalCanvas = async (canvasRef, targetChar) => {
  const paths = await canvasRef.current.exportPaths();
  if (!paths || paths.length === 0) return { status: 'empty' };

  const letterId = REVIEW_LETTER_ID_MAP[targetChar];
  if (!letterId) {
    throw new Error(`Unknown review letter mapping for ${targetChar}`);
  }

  const dataUrl = await canvasRef.current.exportImage('jpeg');
  const blob = await fetch(dataUrl).then((r) => r.blob());
  const processed = await preprocessBlob(blob);
  const response = await dysgraphiaService.recordLetterActivity({
    letterId,
    targetChar,
    mode: 'review',
    durationSeconds: 0,
    strokeCount: paths.length,
    image: processed,
  });

  return {
    status: 'done',
    predicted: response?.predicted ?? null,
    confidence: response?.confidence ?? null,
    isCorrect: Boolean(response?.isCorrect),
    starsEarned: response?.starsEarned ?? 0,
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
  const [evalInfo, setEvalInfo] = useState(null); // { predicted, confidence }
  const [evalMessage, setEvalMessage] = useState('');
  const canvasRef = useRef(null);

  const speak = useCallback(() => {
    playLetterPromptAudio(letter);
  }, [letter]);

  useEffect(() => { speak(); }, [speak]);

  const handleChoiceClick = (ch) => {
    if (ch.char === letter.char) {
      setSelected(ch.char);
      setTimeout(() => setStep('write'), 600);
    } else {
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
      const result = await evalCanvas(canvasRef, letter.char);
      if (result.status === 'empty') { setEvalFeedback('empty'); return; }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      if (result.isCorrect) {
        awardStars(result.starsEarned || 1);
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
            {choices.map((ch) => (
              <button
                key={ch.char}
                className={`lrg-choice-btn ${selected === ch.char ? 'lrg-choice-correct' : ''} ${wrongShake === ch.char ? 'lrg-choice-wrong' : ''}`}
                onClick={() => handleChoiceClick(ch)}
              >
                {ch.char}
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
          {evalFeedback === 'correct' && (
            <div className="lrg-eval-correct">
              🎉 හරිම නිවැරදිව ලිව්වා!
              {evalInfo?.confidence != null && (
                <span className="lrg-eval-conf"> ({(evalInfo.confidence * 100).toFixed(0)}%)</span>
              )}
            </div>
          )}
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
   Step 1 – "choose": two big letter tiles (one mirrored, one
            correct), shuffled.  Tap the correct one.
   Step 2 – "write":  draw the letter; ML model checks it.
───────────────────────────────────────────────────────── */
const MirrorRound = ({ letter, onComplete, roundIndex, totalRounds, onWriteShown, awardStars }) => {
  // 'choose' → user picks correct vs mirrored
  // 'write'  → user draws the letter, model checks
  const [step, setStep] = useState('choose');

  // Randomise which tile appears first (left vs right)
  const [choices] = useState(() =>
    shuffle([{ mirrored: false }, { mirrored: true }])
  );
  const [wrongShake, setWrongShake] = useState(false);
  const [selectedCorrect, setSelectedCorrect] = useState(false);

  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState(null);
  const [evalInfo, setEvalInfo] = useState(null);
  const [evalMessage, setEvalMessage] = useState('');
  const canvasRef = useRef(null);

  const speak = useCallback(() => {
    playLetterPromptAudio(letter);
  }, [letter]);

  useEffect(() => { speak(); }, [speak]);

  /* ── Step 1: choose ── */
  const handleChoiceClick = (choice) => {
    if (!choice.mirrored) {
      // Correct tile
      setSelectedCorrect(true);
      setTimeout(() => setStep('write'), 700);
    } else {
      // Mirrored / wrong tile
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 500);
    }
  };

  /* ── Step 2: write + model ── */
  const handleCheck = async () => {
    setEvalLoading(true);
    setEvalFeedback(null);
    setEvalInfo(null);
    setEvalMessage('');
    try {
      const result = await evalCanvas(canvasRef, letter.char);
      if (result.status === 'empty') { setEvalFeedback('empty'); return; }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      if (result.isCorrect) {
        awardStars(result.starsEarned || 1);
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

  return (
    <div className="lrg-round-card">
      <div className="lrg-round-badge">{roundIndex + 1} / {totalRounds}</div>
      <div className="lrg-mode-label">දර්පණ අකුරු</div>

      {/* ── STEP 1: choose the correct letter ── */}
      {step === 'choose' && (
        <>
          <div className="lrg-mirror-question">
            <span className="lrg-mirror-q-emoji"></span>
            <p className="lrg-mirror-q-text">
              <strong>නිවැරදි අකුර</strong> තෝරන්න?<br />
              {/* <span className="lrg-mirror-q-sub">Tap the correct letter (not the mirror!)</span> */}
            </p>
          </div>

           <button className="lrg-audio-btn" onClick={speak} aria-label="Play audio">
              <span>🔊</span>
              <span className="lrg-audio-hint">මේ අකුර කුමක්ද?</span>
            </button>

          <div className="lrg-mirror-choice-row">
            {choices.map((c, i) => (
              <button
                key={i}
                className={[
                  'lrg-mirror-choice-btn',
                  wrongShake && c.mirrored ? 'lrg-choice-wrong' : '',
                  selectedCorrect && !c.mirrored ? 'lrg-choice-correct' : '',
                ].join(' ')}
                onClick={() => handleChoiceClick(c)}
                disabled={selectedCorrect}
                aria-label={c.mirrored ? 'mirror letter' : 'correct letter'}
              >
                {/* <span className="lrg-mc-tag">{c.mirrored ? '🪞 Mirror' : '✍️ Original'}</span> */}
                <span className={`lrg-mc-letter ${c.mirrored ? 'lrg-letter-mirrored' : ''}`}>
                  {letter.char}
                </span>
                {/* <span className="lrg-mc-hint">{c.mirrored ? 'දර්පණ අකුර' : 'නිවැරදි අකුර'}</span> */}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── STEP 2: draw the letter ── */}
      {step === 'write' && (
        <>
          <div className="lrg-write-prompt">
            ✅ හොඳයි! දැන් <strong>{letter.char}</strong> ලියන්න 👇
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

          {evalFeedback === 'correct' && (
            <div className="lrg-eval-correct">
              🎉 හරිම නිවැරදිව ලිව්වා!
              {evalInfo?.confidence != null && (
                <span className="lrg-eval-conf"> ({(evalInfo.confidence * 100).toFixed(0)}%)</span>
              )}
            </div>
          )}
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

  /* Build a mixed sequence of rounds: 4 find-write + 3 mirror */
  const [rounds] = useState(() => {
    const pool = shuffle(LETTERS).slice(0, 10);
    return pool.map((letter, i) => ({
      letter,
      mode: i % 2 === 0 ? MODE_FIND_WRITE : MODE_MIRROR,
    }));
  });

  const [currentRound, setCurrentRound] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // ===== ADDED: reward hook =====
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();

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
    <main className="dg-shell dg-theme-review" >

    {/* style={{
    backgroundImage: `url(${bg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }} */}
      <ReviewGalaxyBackground />

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
        className={`lrg-page-audio-btn ${narrationPlaying ? 'is-playing' : ''}`}
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
        className="dg-home-btn lrg-home-link-btn"
        onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}
        aria-label="Go to dysgraphia home page"
        title="ඩිස්ග්‍රාෆියා මුල් පිටුවට යන්න"
      >
        <span aria-hidden="true">←</span>
        <span>මුල් පිටුව</span>
      </button>

      <div className="lrg-page-title">
        අපි දැන් බලමු ඉගෙන ගත්ත අකුරු ටික
      </div>

      {!completed ? (
        <div className="lrg-stage">
          {/* Mode tabs */}
          <div className="lrg-mode-tabs">
            <span className={`lrg-tab ${round.mode === MODE_FIND_WRITE ? 'lrg-tab--active' : ''}`}>🎧 අකුරු හඳුනාගෙන ලියමු</span>
            <span className={`lrg-tab ${round.mode === MODE_MIRROR ? 'lrg-tab--active' : ''}`}>🪞 දර්පණ අකුරු</span>
          </div>

          {/* Progress bar */}
          <div className="lrg-progress-bar">
            <div className="lrg-progress-fill" style={{ width: `${(currentRound / rounds.length) * 100}%` }} />
          </div>

          {round.mode === MODE_FIND_WRITE ? (
            <FindWriteRound
              key={currentRound}
              letter={round.letter}
              onComplete={handleRoundComplete}
              roundIndex={currentRound}
              totalRounds={rounds.length}
              onWriteShown={handleWriteShown}
              awardStars={awardStars}
            />
          ) : (
            <MirrorRound
              key={currentRound}
              letter={round.letter}
              onComplete={handleRoundComplete}
              roundIndex={currentRound}
              totalRounds={rounds.length}
              onWriteShown={handleWriteShown}
              awardStars={awardStars}
            />
          )}
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