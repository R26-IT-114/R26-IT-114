import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';

import '../styles/dyscalculia-cartoon.css';

import reviewCharacterLeft from '../../../assets/images/dyscalculiaimages/Eeyore 02.png';
import reviewCharacterCanvas from '../../../assets/images/dyscalculiaimages/Tigger Pooh 01.svg';
import reviewCharacterSuccess from '../../../assets/images/dyscalculiaimages/Princess-04.jpg';
import reviewExtraCharacter from '../../../assets/images/dyscalculiaimages/scooby-doo-1.svg';
import reviewDecoration from '../../../assets/images/dyscalculiaimages/Winnie The Pooh 01.svg';



// ===============================
// Numbers data (0–9)
// ===============================
const NUMBERS = [
  { digit: '0', audio: 'බිංදුව' },
  { digit: '1', audio: 'එක' },
  { digit: '2', audio: 'දෙක' },
  { digit: '3', audio: 'තුන' },
  { digit: '4', audio: 'හතර' },
  { digit: '5', audio: 'පහ' },
  { digit: '6', audio: 'හය' },
  { digit: '7', audio: 'හත' },
  { digit: '8', audio: 'අට' },
  { digit: '9', audio: 'නවය' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildChoices = (target) => {
  const pool = NUMBERS.filter((n) => n.digit !== target.digit);
  const distractor = shuffle(pool)[0];
  return shuffle([target, distractor]);
};

const MODE_FIND_WRITE = 'find_write';
const MODE_MIRROR = 'mirror';

// ===============================
// Canvas evaluation (reuse dysgraphia logic)
// ===============================
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
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('blob failed'))),
      'image/jpeg',
      0.92
    );
  });
};

const evalCanvas = async (canvasRef, targetDigit) => {
  const paths = await canvasRef.current.exportPaths();
  if (!paths || paths.length === 0) return { status: 'empty' };

  const dataUrl = await canvasRef.current.exportImage('jpeg');
  const blob = await fetch(dataUrl).then((r) => r.blob());
  const processed = await preprocessBlob(blob);

  const form = new FormData();
  form.append('image', processed, 'drawing.jpg');

  const res = await fetch(EVAL_URL, { method: 'POST', body: form });
  const data = await res.json();

  const predicted =
    data?.predictions?.[0]?.sinhala ?? data?.prediction?.sinhala ?? null;
  const confidence =
    data?.predictions?.[0]?.confidence ?? data?.prediction?.confidence ?? null;

  // If backend returns Sinhala digit names instead of digits,
  // this will likely fail; keep parity with DysgraphiaLetterReviewGame.
  const isCorrect = predicted === targetDigit;

  return { status: 'done', predicted, confidence, isCorrect };
};

// ===============================
// Round components
// ===============================
const FindWriteRound = ({ number, onComplete, roundIndex, totalRounds }) => {
  const [step, setStep] = useState('choose'); // 'choose' | 'write'
  const [choices] = useState(() => buildChoices(number));
  const [selected, setSelected] = useState(null);
  const [wrongShake, setWrongShake] = useState(null);

  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState(null); // 'correct' | 'wrong' | 'error' | 'empty'
  const [evalInfo, setEvalInfo] = useState(null); // { predicted, confidence }
  const canvasRef = useRef(null);

  const speak = useCallback(() => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(number.audio);
    u.lang = 'si-LK';
    window.speechSynthesis.speak(u);
  }, [number.audio]);

  useEffect(() => {
    speak();
  }, [speak]);

  const handleChoiceClick = (ch) => {
    if (ch.digit === number.digit) {
      setSelected(ch.digit);
      setTimeout(() => setStep('write'), 600);
    } else {
      setWrongShake(ch.digit);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const handleCheck = async () => {
    setEvalLoading(true);
    setEvalFeedback(null);
    setEvalInfo(null);

    try {
      const result = await evalCanvas(canvasRef, number.digit);
      if (result.status === 'empty') {
        setEvalFeedback('empty');
        return;
      }

      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      setEvalFeedback(result.isCorrect ? 'correct' : 'wrong');
    } catch {
      setEvalFeedback('error');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setHasDrawn(false);
    setEvalFeedback(null);
    setEvalInfo(null);
  };

  return (
    <div className="lrg-round-card">
      <div className="lrg-round-badge">
        {roundIndex + 1} / {totalRounds}
      </div>
      <div className="lrg-mode-label">🎯 Find &amp; Write</div>

      {step === 'choose' && (
        <>
          <div className="lrg-listen-section">
            <button className="lrg-audio-btn" onClick={speak} aria-label="Play audio">
              <span>🔊</span>
              <span className="lrg-audio-hint">අංකය අහන්න? ටයිප් කරන්න?</span>
            </button>
          </div>

          <div className="lrg-choices">
            {choices.map((ch) => (
              <button
                key={ch.digit}
                className={`lrg-choice-btn ${
                  selected === ch.digit ? 'lrg-choice-correct' : ''
                } ${wrongShake === ch.digit ? 'lrg-choice-wrong' : ''}`}
                onClick={() => handleChoiceClick(ch)}
              >
                {ch.digit}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'write' && (
        <>
          <div className="lrg-write-prompt">
            ✅ {number.audio}! අංකය <strong>{number.digit}</strong> ලියමු! 👇
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
              🎉 {number.audio} නිවැරදිව ලිව්වා!{' '}
              {evalInfo?.confidence != null && (
                <span className="lrg-eval-conf">
                  ({(evalInfo.confidence * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          )}

          {evalFeedback === 'wrong' && (
            <div className="lrg-eval-wrong">
              ❌ හරි නැහැ. නැවත අඳින්න!{' '}
              {evalInfo?.predicted && (
                <span className="lrg-eval-conf">— AI: {evalInfo.predicted}</span>
              )}
            </div>
          )}

          {evalFeedback === 'empty' && (
            <div className="lrg-eval-warn">⚠️ අඳින්න පෙර පාරවෙන්න.</div>
          )}

          {evalFeedback === 'error' && (
            <div className="lrg-eval-warn">⚠️ Server connect error</div>
          )}

          <div className="lrg-canvas-actions">
            <button className="lrg-btn lrg-btn-clear" onClick={handleClear}>
              🧹 පිරිසිදු කරමු
            </button>
            <button
              className="lrg-btn lrg-btn-check"
              disabled={!hasDrawn || evalLoading}
              onClick={handleCheck}
            >
              {evalLoading ? '⏳ ...' : '✅ අගයන්න'}
            </button>
            {evalFeedback === 'correct' && (
              <button className="lrg-btn lrg-btn-next" onClick={onComplete}>
                ඉදිරියට →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const MirrorRound = ({ number, onComplete, roundIndex, totalRounds }) => {
  const [step, setStep] = useState('choose');

  const [choices] = useState(() => shuffle([{ mirrored: false }, { mirrored: true }]));
  const [wrongShake, setWrongShake] = useState(false);
  const [selectedCorrect, setSelectedCorrect] = useState(false);

  const [hasDrawn, setHasDrawn] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState(null);
  const [evalInfo, setEvalInfo] = useState(null);
  const canvasRef = useRef(null);

  const speak = useCallback(() => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(number.audio);
    u.lang = 'si-LK';
    window.speechSynthesis.speak(u);
  }, [number.audio]);

  useEffect(() => {
    speak();
  }, [speak]);

  const handleChoiceClick = (choice) => {
    if (!choice.mirrored) {
      setSelectedCorrect(true);
      setTimeout(() => setStep('write'), 700);
    } else {
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 500);
    }
  };

  const handleCheck = async () => {
    setEvalLoading(true);
    setEvalFeedback(null);
    setEvalInfo(null);

    try {
      const result = await evalCanvas(canvasRef, number.digit);
      if (result.status === 'empty') {
        setEvalFeedback('empty');
        return;
      }
      setEvalInfo({ predicted: result.predicted, confidence: result.confidence });
      setEvalFeedback(result.isCorrect ? 'correct' : 'wrong');
    } catch {
      setEvalFeedback('error');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setHasDrawn(false);
    setEvalFeedback(null);
    setEvalInfo(null);
  };

  return (
    <div className="lrg-round-card">
      <div className="lrg-round-badge">
        {roundIndex + 1} / {totalRounds}
      </div>
      <div className="lrg-mode-label">🤪 Mirror Trainer</div>

      {step === 'choose' && (
        <>
          <div className="lrg-mirror-question">
            <span className="lrg-mirror-q-emoji">🔔</span>
            <p className="lrg-mirror-q-text">
              <strong>{number.audio}</strong> අංකය හරිද?
              <br />
              <span className="lrg-mirror-q-sub">Mirror එක තෝරන්න එපා!</span>
            </p>
          </div>

          <button className="lrg-audio-btn lrg-audio-btn--sm" onClick={speak}>
            🔊 අහන්න
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
                aria-label={c.mirrored ? 'mirrored number' : 'correct number'}
              >
                <span className="lrg-mc-tag">{c.mirrored ? '🤩 Mirror' : '✌️ Original'}</span>
                <span className={`lrg-mc-letter ${c.mirrored ? 'lrg-letter-mirrored' : ''}`}>
                  {number.digit}
                </span>
                <span className="lrg-mc-hint">{c.mirrored ? 'නැවත බලන්න' : 'හරි'}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'write' && (
        <>
          <div className="lrg-write-prompt">
            ✅ {number.digit}! අංකය අඳිමු! ✍️
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
              🎉 {number.audio} නිවැරදිව ලිව්වා!
              {evalInfo?.confidence != null && (
                <span className="lrg-eval-conf">
                  ({(evalInfo.confidence * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          )}

          {evalFeedback === 'wrong' && (
            <div className="lrg-eval-wrong">
              ❌ හරි නැහැ. නැවත අඳින්න!
              {evalInfo?.predicted && <span className="lrg-eval-conf"> — AI: {evalInfo.predicted}</span>}
            </div>
          )}

          {evalFeedback === 'empty' && <div className="lrg-eval-warn">⚠️ අඳින්න පෙර පාරවෙන්න.</div>}

          {evalFeedback === 'error' && <div className="lrg-eval-warn">⚠️ Server connect error</div>}

          <div className="lrg-canvas-actions">
            <button className="lrg-btn lrg-btn-clear" onClick={handleClear}>
              🧹 පිරිසිදු කරමු
            </button>
            <button
              className="lrg-btn lrg-btn-check"
              disabled={!hasDrawn || evalLoading}
              onClick={handleCheck}
            >
              {evalLoading ? '⏳ ...' : '✅ අගයන්න'}
            </button>
            {evalFeedback === 'correct' && (
              <button className="lrg-btn lrg-btn-next" onClick={onComplete}>
                ඉදිරියට →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ===============================
// Main game
// ===============================
const NumberReviewGame = () => {
  const navigate = useNavigate();

  const [rounds] = useState(() => {
    const pool = shuffle(NUMBERS).slice(0, 7);
    return pool.map((number, i) => ({
      number,
      mode: i % 2 === 0 ? MODE_FIND_WRITE : MODE_MIRROR,
    }));
  });

  const [currentRound, setCurrentRound] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleRoundComplete = () => {
    setScore((s) => s + 1);

    if (currentRound + 1 >= rounds.length) {
      setCompleted(true);
      return;
    }
    setCurrentRound((r) => r + 1);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const round = rounds[currentRound];

  return (
    <main className="dg-shell dg-theme-review">
      <LightScenery />

      <img
        className="dc-character dc-character--review-left dc-wiggle"
        src={reviewCharacterLeft}
        alt=""
        aria-hidden="true"
      />

      <img
        className="dc-character dc-character--review-success dc-soft-pop"
        src={reviewCharacterSuccess}
        alt=""
        aria-hidden="true"
      />

      <img
        className="dc-character dc-character--review-extra dc-bounce"
        src={reviewExtraCharacter}
        alt=""
        aria-hidden="true"
      />

      <img
        className="dc-deco dc-deco--review dc-sparkle"
        src={reviewDecoration}
        alt=""
        aria-hidden="true"
      />


      <button type="button" className="dg-home-btn" onClick={() => navigate('/dyscalculia')}>
        ←
      </button>

<div className="lrg-page-title">🔍 අංක සමාලෝචනාව</div>

      <img
        className="dc-character dc-character--review-canvas dc-float"
        src={reviewCharacterCanvas}
        alt=""
        aria-hidden="true"
      />

      {!completed ? (

        <div className="lrg-stage">
          <div className="lrg-mode-tabs">
            <span className={`lrg-tab ${round.mode === MODE_FIND_WRITE ? 'lrg-tab--active' : ''}`}>
              🎯 Find &amp; Write
            </span>
            <span className={`lrg-tab ${round.mode === MODE_MIRROR ? 'lrg-tab--active' : ''}`}>
              🤪 Mirror Trainer
            </span>
          </div>

          <div className="lrg-progress-bar">
            <div
              className="lrg-progress-fill"
              style={{ width: `${(currentRound / rounds.length) * 100}%` }}
            />
          </div>

          {round.mode === MODE_FIND_WRITE ? (
            <FindWriteRound
              key={currentRound}
              number={round.number}
              onComplete={handleRoundComplete}
              roundIndex={currentRound}
              totalRounds={rounds.length}
            />
          ) : (
            <MirrorRound
              key={currentRound}
              number={round.number}
              onComplete={handleRoundComplete}
              roundIndex={currentRound}
              totalRounds={rounds.length}
            />
          )}
        </div>
      ) : (
        <div className="lrg-complete-card">
          <div className="lrg-complete-stars">⭐ ⭐ ⭐</div>
          <h2 className="lrg-complete-title">🎉 අංක සමාලෝචනය සාර්ථකයි!</h2>
          <p className="lrg-complete-score">
            {score} / {rounds.length} ✅
          </p>
          <div className="lrg-complete-actions">
            <button className="lrg-btn lrg-btn-next" onClick={handleRestart}>
              🔁 නැවත අරඹමු
            </button>
            <button className="lrg-btn lrg-btn-clear" onClick={() => navigate('/dyscalculia')}>
              🏠 මුල් පිටුව
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

// ===============================
// LightScenery (reuse from dysgraphia review)
// ===============================
const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

const CLOUDS = [
  { top: '7%', w: 180, dur: 32, delay: 0 },
  { top: '15%', w: 240, dur: 44, delay: 9 },
  { top: '4%', w: 130, dur: 27, delay: 18 },
  { top: '60%', w: 200, dur: 50, delay: 6 },
  { top: '78%', w: 160, dur: 38, delay: 22 },
];

const LightScenery = () => (
  <div className="lrg-sky-bg" aria-hidden="true">
    <div className="lrg-sun">
      {SUN_RAYS.map((r) => (
        <div key={r} className="lrg-sun-ray" style={{ '--r': `${r}deg` }} />
      ))}
    </div>
    {CLOUDS.map((c, i) => (
      <div
        key={i}
        className="lrg-cloud"
        style={{
          top: c.top,
          width: c.w,
          '--cd': `${c.dur}s`,
          animationDelay: `-${c.delay}s`,
        }}
      >
        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
          <ellipse cx="100" cy="55" rx="90" ry="28" fill="white" opacity="0.9" />
          <ellipse cx="70" cy="42" rx="48" ry="32" fill="white" opacity="0.9" />
          <ellipse cx="130" cy="45" rx="42" ry="28" fill="white" opacity="0.9" />
        </svg>
      </div>
    ))}
  </div>
);

export default NumberReviewGame;

