import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { speakSinhala } from '../utils/audioGuide';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import '../styles/dyscalculia-cartoon.css';

import homeCharacterLeft from '../../../assets/images/dyscalculiaimages/Buzz Lightyear 01.png';
import homeCharacterRight from '../../../assets/images/dyscalculiaimages/Piglet 03.png';
import homeDecoration from '../../../assets/images/dyscalculiaimages/Character WALL 02.svg';
import homeDecoration2 from '../../../assets/images/dyscalculiaimages/scooby-doo-0.svg';
import homeExtraCharacter from '../../../assets/images/dyscalculiaimages/Tigger Pooh 01.svg';

import number0Audio from '../../../assets/audio/dyscalculia/number-0.mp3';
import number1Audio from '../../../assets/audio/dyscalculia/number-1.mp3';
import number2Audio from '../../../assets/audio/dyscalculia/number-2.mp3';
import number3Audio from '../../../assets/audio/dyscalculia/number-3.mp3';
import number4Audio from '../../../assets/audio/dyscalculia/number-4.mp3';
import number5Audio from '../../../assets/audio/dyscalculia/number-5.mp3';
import number6Audio from '../../../assets/audio/dyscalculia/number-6.mp3';
import number7Audio from '../../../assets/audio/dyscalculia/number-7.mp3';
import number8Audio from '../../../assets/audio/dyscalculia/number-8.mp3';
import number9Audio from '../../../assets/audio/dyscalculia/number-9.mp3';

const STAR_COLORS = ['#ffffff', '#ffe4b5', '#add8e6', '#ffcccb', '#b0e0e6', '#fff176', '#e0b0ff'];

const StarField = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 95}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 0.6,
        dur: (Math.random() * 4 + 2).toFixed(1),
        delay: -(Math.random() * 7).toFixed(1),
        type: i % 7 === 0 ? 'pulse' : i % 3 === 0 ? 'color' : 'dot',
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      })),
    []
  );

  return (
    <div className="dg-stars-layer" aria-hidden="true">
      {stars.map((s) => {
        const cls =
          s.type === 'pulse'
            ? 'dg-star-pulse'
            : s.type === 'color'
              ? 'dg-star-color'
              : 'dg-star-dot';

        return (
          <span
            key={s.id}
            className={cls}
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              '--dur': `${s.dur}s`,
              '--delay': `${s.delay}s`,
              ...(s.type !== 'dot' ? { '--c': s.color } : {}),
            }}
          />
        );
      })}
    </div>
  );
};

const replayButtonLabel = 'Replay';

// Sinhala number names (0-9)
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

const NUMBER_AUDIO = {
  '0': number0Audio,
  '1': number1Audio,
  '2': number2Audio,
  '3': number3Audio,
  '4': number4Audio,
  '5': number5Audio,
  '6': number6Audio,
  '7': number7Audio,
  '8': number8Audio,
  '9': number9Audio,
};

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getRandomTarget = (prevTargetDigit) => {
  const candidates = NUMBERS.filter((n) => n.digit !== prevTargetDigit);
  const list = candidates.length ? candidates : NUMBERS;
  return list[Math.floor(Math.random() * list.length)];
};

const buildOptions = (targetDigit, optionCount) => {
  const target = NUMBERS.find((n) => n.digit === targetDigit);
  const pool = NUMBERS.filter((n) => n.digit !== targetDigit);
  const distractors = shuffle(pool).slice(0, Math.max(0, optionCount - 1));
  return shuffle([target, ...distractors]);
};

const playNumberAudio = (digit) => {
  const audioSrc = NUMBER_AUDIO[digit];
  if (audioSrc) {
    const audio = new Audio(audioSrc);
    audio.play().catch(() => {
      // Fallback to speech synthesis if audio fails
      const numberObj = NUMBERS.find(n => n.digit === digit);
      if (numberObj) speakSinhala(numberObj.audio);
    });
  } else {
    // Fallback if no audio file
    const numberObj = NUMBERS.find(n => n.digit === digit);
    if (numberObj) speakSinhala(numberObj.audio);
  }
};

const NumberListeningGame = () => {
  const navigate = useNavigate();

  const speakNowRef = useRef(() => {});

  const [lastTargetDigit, setLastTargetDigit] = useState(null);
  const [target, setTarget] = useState(() => {
    const n = getRandomTarget(null);
    return { ...n, optionCount: 4 };
  });

  const [options, setOptions] = useState(() => buildOptions(target.digit, target.optionCount));

  const [selectedDigit, setSelectedDigit] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const speakNow = useCallback(() => {
    playNumberAudio(target.digit);
  }, [target.digit]);

  speakNowRef.current = speakNow;

  const loadNextQuestion = useCallback(() => {
    const nextTargetBase = getRandomTarget(lastTargetDigit);
    const optionCount = Math.random() < 0.5 ? 3 : 4;

    setTarget({ ...nextTargetBase, optionCount });
    setOptions(buildOptions(nextTargetBase.digit, optionCount));

    setSelectedDigit(null);
    setIsCorrect(null);
    setIsLocked(false);

    setLastTargetDigit(nextTargetBase.digit);
  }, [lastTargetDigit]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      speakNowRef.current();
    }, 200);

    return () => window.clearTimeout(t);
  }, [target.digit, target.optionCount]);

  const handleReplay = () => {
    speakNowRef.current();
  };

  const handlePick = (digit) => {
    if (isLocked) return;

    const correct = digit === target.digit;
    const startTime = Date.now();
    setSelectedDigit(digit);
    setIsCorrect(correct);
    setIsLocked(correct);

    // Save game session data
    saveGameSession({
      gameType: 'NumberListeningGame',
      playedAt: new Date().toISOString(),
      targetNumber: target.digit,
      correct,
      attempts: 1,
      responseTime: Date.now() - startTime,
      score: correct ? 10 : 0,
      completed: true
    });

    if (correct) {
      window.setTimeout(() => {
        speakNowRef.current();
      }, 150);
    }
  };

  return (
    <main className="dg-shell">
      <StarField />

      <img className="dc-deco dc-deco--wall dc-wiggle" src={homeDecoration} alt="" aria-hidden="true" />
      <img className="dc-deco dc-deco--extra dc-soft-pop" src={homeDecoration2} alt="" aria-hidden="true" />

      <img
        className="dc-character dc-character--home-left dc-float"
        src={homeCharacterLeft}
        alt=""
        aria-hidden="true"
      />
      <img
        className="dc-character dc-character--home-right dc-bounce"
        src={homeCharacterRight}
        alt=""
        aria-hidden="true"
      />
      <img
        className="dc-character dc-character--home-extra dc-sparkle"
        src={homeExtraCharacter}
        alt=""
        aria-hidden="true"
      />

      <section className="lrg-stage">
        <button
          type="button"
          className="dg-home-btn dc-back-button"
          onClick={() => navigate('/dyscalculia')}
          aria-label="Back"
        >
          ←
        </button>
        <h2 className="lrg-page-title">අහලා තෝරන්න</h2>
      </section>

      <section className="lrg-stage" style={{ paddingTop: 0, marginTop: -28 }}>
        <div className="lrg-round-card">
          <div className="lrg-round-badge">🎧 Number Listening</div>

          <div className="lrg-mode-label" style={{ marginTop: 2 }}>
            ඇසෙන අංකය නිවැරදිව තෝරන්න
          </div>

          <div className="lrg-listen-section" style={{ marginTop: 12, marginBottom: 10 }}>
            <button type="button" className="lrg-audio-btn" onClick={handleReplay}>
              🔊 <span style={{ marginLeft: 6 }}>{replayButtonLabel}</span>
            </button>
          </div>

          {/* Optional prompt text */}
          <div className="dnl-number-prompt" style={{ marginTop: 4 }}>
            <div className="dnl-prompt-row">
              <span className="dnl-sparkle-emoji">✨</span>
              <span className="dnl-prompt-text">Audio කියවෙනවා… තෝරන්න!</span>
            </div>
          </div>

          <div
            className="lrg-choices"
            style={{
              marginTop: 14,
              gridTemplateColumns: `repeat(${options.length}, minmax(110px, 1fr))`,
              display: 'grid',
              gap: 14,
            }}
          >
            {options.map((opt) => {
              const isPicked = selectedDigit === opt.digit;


              let cardClass = 'lrg-choice-btn';
              if (isPicked && isCorrect) cardClass = `${cardClass} lrg-choice-correct`;
              if (isPicked && isCorrect === false) cardClass = `${cardClass} lrg-choice-wrong`;

              return (
                <button
                  key={opt.digit}
                  type="button"
                  className={cardClass}
                  onClick={() => handlePick(opt.digit)}
                  disabled={isLocked}
                  aria-label={`Choose ${opt.digit}`}
                  style={{ fontSize: '2.2rem', padding: '18px 16px' }}
                >
                  {opt.digit}
                </button>
              );
            })}
          </div>

          {isCorrect === true && (
            <div
              className="lrg-eval-correct"
              style={{ marginTop: 14, textAlign: 'center', fontSize: '1.05rem' }}
            >
              🎉 හරි!
            </div>
          )}

          {isCorrect === false && (
            <div
              className="lrg-eval-wrong"
              style={{ marginTop: 14, textAlign: 'center', fontSize: '1.05rem' }}
            >
              නැවත උත්සාහ කරන්න
            </div>
          )}

          <div
            className="dnl-actions"
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {isCorrect === true ? (
              <button type="button" className="lrg-btn lrg-btn-next" onClick={loadNextQuestion}>
                ඊළඟ ➜
              </button>
            ) : (
              <button type="button" className="lrg-btn lrg-btn-clear" onClick={handleReplay}>
                🔊 Replay
              </button>
            )}
          </div>

          {/* Keep next question always reachable after correct */}
          <div style={{ height: 6 }} aria-hidden="true" />
        </div>
      </section>
    </main>
  );
};

export default NumberListeningGame;

