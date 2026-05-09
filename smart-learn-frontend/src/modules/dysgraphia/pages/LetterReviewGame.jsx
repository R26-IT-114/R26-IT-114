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

// ===== ADDED: reward imports =====
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';

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

/* ─── Light sky scenery (shapes-style) ─── */
const SUN_RAYS = [0,45,90,135,180,225,270,315];

const CLOUDS = [
  { top:'7%', w:180, dur:32, delay:0 },
  { top:'15%', w:240, dur:44, delay:9 },
  { top:'4%', w:130, dur:27, delay:18 },
  { top:'60%', w:200, dur:50, delay:6 },
  { top:'78%', w:160, dur:38, delay:22 },
];
const LightScenery = () => (
  <div className="lrg-sky-bg" aria-hidden="true">
    {/* Sun */}
    <div className="lrg-sun">
      {SUN_RAYS.map((r) => (
        <div key={r} className="lrg-sun-ray" style={{ '--r': `${r}deg` }} />
      ))}
    </div>
    {/* Clouds */}
    {CLOUDS.map((c, i) => (
      <div key={i} className="lrg-cloud" style={{ top: c.top, width: c.w, '--cd': `${c.dur}s`, animationDelay: `-${c.delay}s` }}>
        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
          <ellipse cx="100" cy="55" rx="90" ry="28" fill="white" opacity="0.9"/>
          <ellipse cx="70" cy="42" rx="48" ry="32" fill="white" opacity="0.9"/>
          <ellipse cx="130" cy="45" rx="42" ry="28" fill="white" opacity="0.9"/>
        </svg>
      </div>
    ))}
  </div>
);

/* ─── Model evaluation helpers ─── */
const EVAL_URL = 'http://localhost:3000/predict';

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
  const dataUrl = await canvasRef.current.exportImage('jpeg');
  const blob = await fetch(dataUrl).then((r) => r.blob());
  const processed = await preprocessBlob(blob);
  const form = new FormData();
  form.append('image', processed, 'drawing.jpg');
  const res = await fetch(EVAL_URL, { method: 'POST', body: form });
  const data = await res.json();
  const predicted = data?.predictions?.[0]?.sinhala ?? data?.prediction?.sinhala ?? null;
  const confidence = data?.predictions?.[0]?.confidence ?? data?.prediction?.confidence ?? null;
  const isCorrect = predicted === targetChar;
  return { status: 'done', predicted, confidence, isCorrect };
};



/* ─────────────────────────────────────────────────────────
   FIND & WRITE ROUND
───────────────────────────────────────────────────────── */
const FindWriteRound = ({ letter, onComplete, roundIndex, totalRounds, onWriteShown }) => {
  const [step, setStep] = useState('choose'); // 'choose' | 'write'
  const [choices] = useState(() => buildChoices(letter));
  const [selected, setSelected] = useState(null);
  const [wrongShake, setWrongShake] = useState(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState(null); // 'correct' | 'wrong' | 'error' | 'empty'
  const [evalInfo, setEvalInfo] = useState(null); // { predicted, confidence }
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
    try {
      const result = await evalCanvas(canvasRef, letter.char);
      if (result.status === 'empty') { setEvalFeedback('empty'); return; }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      setEvalFeedback(result.isCorrect ? 'correct' : 'wrong');
    } catch {
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
          {evalFeedback === 'error' && <div className="lrg-eval-warn">⚠️ Server එකට connect වෙන්න බැරිවිය</div>}

          <div className="lrg-canvas-actions">
            <button
              className="lrg-btn lrg-btn-clear"
              onClick={handleClear}
              disabled={evalFeedback === 'correct'}
            >
              🧹 මකන්න
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
const MirrorRound = ({ letter, onComplete, roundIndex, totalRounds, onWriteShown }) => {
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
    try {
      const result = await evalCanvas(canvasRef, letter.char);
      if (result.status === 'empty') { setEvalFeedback('empty'); return; }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      setEvalFeedback(result.isCorrect ? 'correct' : 'wrong');
    } catch {
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
          {evalFeedback === 'error' && <div className="lrg-eval-warn">⚠️ Server එකට connect වෙන්න බැරිවිය</div>}

          <div className="lrg-canvas-actions">
            <button
              className="lrg-btn lrg-btn-clear"
              onClick={handleClear}
              disabled={evalFeedback === 'correct'}
            >
              🧹 මකන්න
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
    // ===== ADDED: award 1 star for each completed round =====
    awardStars(1);
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
    <main className="dg-shell dg-theme-review">
      <LightScenery />

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

      <button type="button" className="dg-home-btn" onClick={() => navigate('/dysgraphia')}>
        ←
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
            />
          ) : (
            <MirrorRound
              key={currentRound}
              letter={round.letter}
              onComplete={handleRoundComplete}
              roundIndex={currentRound}
              totalRounds={rounds.length}
                onWriteShown={handleWriteShown}
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
            <button className="lrg-btn lrg-btn-clear" onClick={() => navigate('/dysgraphia')}>🏠 ගෙදර</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default LetterReviewGame;