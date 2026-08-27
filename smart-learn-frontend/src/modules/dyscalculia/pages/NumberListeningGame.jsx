import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { speakSinhala } from '../utils/audioGuide';
import { saveGameSession } from '../utils/dyscalculiaProgress';

import '../styles/number-listening-game.css';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import DifficultySelector from '../components/DifficultySelector';
import { getGameLevels } from '../utils/gameLevelProgress';
import listeningGameBackground from '../../../assets/images/background/listninggameimage.jpg';

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

const getRandomTarget = (prevTargetDigit, max = 9) => {
  const available = NUMBERS.filter((n) => Number(n.digit) <= max);
  const candidates = available.filter((n) => n.digit !== prevTargetDigit);
  const list = candidates.length ? candidates : available;
  return list[Math.floor(Math.random() * list.length)];
};

const buildOptions = (targetDigit, optionCount, max = 9) => {
  const target = NUMBERS.find((n) => n.digit === targetDigit);
  const pool = NUMBERS.filter((n) => n.digit !== targetDigit && Number(n.digit) <= max);
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
  const [level, setLevel] = useState(null);
  const [levels] = useState(() => getGameLevels('NumberListeningGame'));
  const levelConfig = { easy: { max: 3, choices: 2 }, medium: { max: 6, choices: 4 }, hard: { max: 9, choices: 5 } }[level || 'easy'];

  const speakNowRef = useRef(() => { });

  const [lastTargetDigit, setLastTargetDigit] = useState(null);
  const [target, setTarget] = useState(() => {
    const n = getRandomTarget(null, 3);
    return { ...n, optionCount: 2 };
  });

  const [options, setOptions] = useState(() => buildOptions(target.digit, target.optionCount, 3));

  const [selectedDigit, setSelectedDigit] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const speakNow = useCallback(() => {
    playNumberAudio(target.digit);
  }, [target.digit]);

  speakNowRef.current = speakNow;

  const loadNextQuestion = useCallback(() => {
    const nextTargetBase = getRandomTarget(lastTargetDigit, levelConfig.max);
    const optionCount = levelConfig.choices;

    setTarget({ ...nextTargetBase, optionCount });
    setOptions(buildOptions(nextTargetBase.digit, optionCount, levelConfig.max));

    setSelectedDigit(null);
    setIsCorrect(null);
    setIsLocked(false);

    setLastTargetDigit(nextTargetBase.digit);
  }, [lastTargetDigit, levelConfig]);

  const selectLevel = (nextLevel) => {
    const config = { easy: { max: 3, choices: 2 }, medium: { max: 6, choices: 4 }, hard: { max: 9, choices: 5 } }[nextLevel];
    const nextTarget = getRandomTarget(null, config.max);
    setLevel(nextLevel); setTarget({ ...nextTarget, optionCount: config.choices }); setOptions(buildOptions(nextTarget.digit, config.choices, config.max)); setSelectedDigit(null); setIsCorrect(null); setIsLocked(false);
  };

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

  if (!level) return <main className='nlg-page adventure-land'><DifficultySelector fullScreen levels={levels} onSelect={selectLevel} onBack={() => navigate('/dyscalculia')} /></main>;
  return (
    <main
      className="nlg-page adventure-land station-whale-cove"
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(
          rgba(8, 19, 45, 0.52),
          rgba(8, 19, 45, 0.68)
        ), url(${listeningGameBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <AdventureBackdrop station='whale-song-cove' message='Whale Song Cove එකේ අංකයට සවන් දෙමු! 🐋' />
      <StarField />

      <section className="lrg-stage">
        <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='ocean' />
        <h2 className="lrg-page-title">අහලා තෝරන්න</h2>
        <button className='dc-level-back' type='button' onClick={() => setLevel(null)}>Change Level</button><DifficultySelector levels={levels} selected={level} onSelect={selectLevel} />
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
