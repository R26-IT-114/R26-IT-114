import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLevelQuestions, SYMBOLS, STAGES } from '../data/symbolDetectiveData';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { speakSinhala } from '../utils/audioGuide';
import '../styles/symbol-detective-game.css';
import DifficultySelector from '../components/DifficultySelector';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import { getGameLevels, LEVELS, recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import easyFishBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/easy-fish-board.webp';
import mediumSeahorseBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/medium-seahorse-board.webp';
import hardOctopusBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/hard-octopus-board.webp';
import symbolDetectiveIntroAudio from '../../../assets/audio/dyscalculia/G05.wav';

const GAME_KEY = 'symbol_detective_progress';
const GAME_TYPE = 'SymbolDetectiveGame';
const SYMBOL_DETECTIVE_INTRO_PLAYED_KEY = 'smartlearn:symbol-detective:intro-played';
let symbolDetectiveIntroPlayedInSession = false;
const LEVEL_NAMES = ['සංකේතය හඳුනාගන්න', 'අර්ථය ගළපන්න', 'සංකේතයේ ක්‍රියාව'];

const hasSymbolDetectiveIntroPlayed = () => {
  if (symbolDetectiveIntroPlayedInSession) return true;
  try {
    return sessionStorage.getItem(SYMBOL_DETECTIVE_INTRO_PLAYED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markSymbolDetectiveIntroPlayed = () => {
  symbolDetectiveIntroPlayedInSession = true;
  try {
    sessionStorage.setItem(SYMBOL_DETECTIVE_INTRO_PLAYED_KEY, 'true');
  } catch {
    // The in-memory flag still prevents repeated autoplay in this session.
  }
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const playCorrectSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, context.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.12 + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + index * 0.12 + 0.2);
    });
  } catch {
    // Audio is an enhancement; gameplay continues when it is unavailable.
  }
};

const getSavedProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(GAME_KEY)) || {};
  } catch {
    return {};
  }
};

const starsFor = (accuracy) => (accuracy >= 90 ? 3 : accuracy >= 80 ? 2 : 1);

const SymbolDetectiveGame = () => {
  const navigate = useNavigate();
  const introAudioRef = useRef(null);
  const pendingIntroInteractionRef = useRef(null);
  const [gamePhase, setGamePhase] = useState('intro');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStage, setCurrentStage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [attemptOnCurrent, setAttemptOnCurrent] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [levelScore, setLevelScore] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [weakSymbols, setWeakSymbols] = useState([]);
  const [symbolStats, setSymbolStats] = useState({});
  const [levelStars, setLevelStars] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [difficultyLevels, setDifficultyLevels] = useState(() => getGameLevels(GAME_TYPE));
  const [completionOutcome, setCompletionOutcome] = useState(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);

  const question = questions[questionIndex];
  useEffect(() => {
    const saved = getSavedProgress();
    setCurrentStage(saved.currentStage || 1);
    setWeakSymbols(saved.weakSymbols || []);
    setSymbolStats(saved.symbolStats || {});
    setLevelStars(saved.levelStars || []);
  }, []);

  useEffect(() => {
    const audio = new Audio(symbolDetectiveIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;

    const handlePlay = () => setIsIntroPlaying(true);
    const handleStop = () => setIsIntroPlaying(false);
    const playAfterInteraction = () => {
      pendingIntroInteractionRef.current = null;
      audio.play().then(markSymbolDetectiveIntroPlayed).catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handleStop);
    audio.addEventListener('ended', handleStop);

    if (!hasSymbolDetectiveIntroPlayed()) {
      audio.play().then(markSymbolDetectiveIntroPlayed).catch(() => {
        pendingIntroInteractionRef.current = playAfterInteraction;
        document.addEventListener('pointerdown', playAfterInteraction, { once: true });
      });
    }

    return () => {
      document.removeEventListener('pointerdown', playAfterInteraction);
      if (pendingIntroInteractionRef.current === playAfterInteraction) {
        pendingIntroInteractionRef.current = null;
      }
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handleStop);
      audio.removeEventListener('ended', handleStop);
      audio.pause();
      audio.currentTime = 0;
      introAudioRef.current = null;
    };
  }, []);

  const replayIntro = useCallback(() => {
    const audio = introAudioRef.current;
    if (!audio) return;

    const pendingInteraction = pendingIntroInteractionRef.current;
    if (pendingInteraction) {
      document.removeEventListener('pointerdown', pendingInteraction);
      pendingIntroInteractionRef.current = null;
    }

    audio.currentTime = 0;
    audio.play().then(markSymbolDetectiveIntroPlayed).catch(() => {});
  }, []);

  const stopIntro = useCallback(() => {
    const pendingInteraction = pendingIntroInteractionRef.current;
    if (pendingInteraction) {
      document.removeEventListener('pointerdown', pendingInteraction);
      pendingIntroInteractionRef.current = null;
    }

    const audio = introAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  useEffect(() => {
    if (question && gamePhase === 'playing') speakSinhala(question.instructionSi);
  }, [question, gamePhase]);

  const startLevel = (level = 1, stage = currentStage, selectedDifficulty = difficulty) => {
    setCurrentLevel(level);
    setCurrentStage(stage);
    setQuestions(generateLevelQuestions(level, selectedDifficulty));
    setQuestionIndex(0);
    setLevelScore(0);
    setLevelCorrect(0);
    setLevelAttempts(0);
    setAttemptOnCurrent(0);
    setShowFeedback(false);
    setSelectedSymbol('');
    setGamePhase('playing');
  };

  const startDifficulty = (nextDifficulty) => {
    stopIntro();
    const selectedDifficulty = LEVELS.includes(nextDifficulty) ? nextDifficulty : difficulty;
    setDifficulty(selectedDifficulty);
    setScore(0);
    setIncorrectAttempts(0);
    setLevelStars([]);
    startLevel(1, selectedDifficulty === 'easy' ? 1 : selectedDifficulty === 'medium' ? 2 : 3, selectedDifficulty);
  };

  const persistProgress = (nextStage, nextWeakSymbols, nextStars, nextSymbolStats = symbolStats) => {
    try {
      localStorage.setItem(GAME_KEY, JSON.stringify({ currentStage: nextStage, weakSymbols: nextWeakSymbols, levelStars: nextStars, symbolStats: nextSymbolStats }));
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  };

  const finishLevel = (nextScore, nextCorrect, nextAttempts, finalSymbolStats = symbolStats, finalWeakSymbols = weakSymbols) => {
    const accuracy = nextAttempts ? Math.round((nextCorrect / nextAttempts) * 100) : 0;
    const stars = starsFor(accuracy);
    const nextStars = [...levelStars];
    nextStars[currentLevel - 1] = Math.max(nextStars[currentLevel - 1] || 0, stars);
    const nextStage = accuracy >= 70 && currentStage < STAGES.length ? currentStage + 1 : currentStage;
    setLevelStars(nextStars);
    setCurrentStage(nextStage);
    persistProgress(nextStage, finalWeakSymbols, nextStars, finalSymbolStats);
    const symbolAccuracy = Object.fromEntries(SYMBOLS.map((item) => {
      const stats = finalSymbolStats[item.symbol] || { correct: 0, attempts: 0 };
      return [item.symbol, stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0];
    }));
    saveGameSession({ gameType: GAME_TYPE, correct: nextCorrect > 0, attempts: nextAttempts, score: nextScore, completed: true, level: currentLevel, accuracy, symbolAccuracy });
    if (currentLevel === LEVEL_NAMES.length) {
      const levelResult = recordLevelResult(GAME_TYPE, difficulty, {
        correctAnswers: nextCorrect,
        totalQuestions: nextAttempts,
        score: nextScore,
      });
      setDifficultyLevels(levelResult.levels);
      const nextDifficulty = LEVELS[LEVELS.indexOf(difficulty) + 1];
      setCompletionOutcome({ passed: levelResult.passed, nextDifficulty });
      if (levelResult.passed && nextDifficulty) setDifficulty(nextDifficulty);
      setGamePhase('gameComplete');
    } else {
      setGamePhase('levelComplete');
    }
  };

  const handleAnswer = (symbol) => {
    if (!question || showFeedback) return;
    setSelectedSymbol(symbol);
    const nextAttempt = attemptOnCurrent + 1;
    const nextAttempts = levelAttempts + 1;
    const trackedSymbol = question.trackingSymbol || question.correctSymbol;
    const currentSymbolStats = symbolStats[trackedSymbol] || { correct: 0, attempts: 0 };
    const nextSymbolStats = {
      ...symbolStats,
      [trackedSymbol]: {
        correct: currentSymbolStats.correct + (symbol === question.correctSymbol ? 1 : 0),
        attempts: currentSymbolStats.attempts + 1,
      },
    };
    setSymbolStats(nextSymbolStats);
    persistProgress(currentStage, weakSymbols, levelStars, nextSymbolStats);
    setLevelAttempts(nextAttempts);
    setAttemptOnCurrent(nextAttempt);
    if (symbol !== question.correctSymbol) {
      const nextIncorrect = incorrectAttempts + 1;
      setIncorrectAttempts(nextIncorrect);
      setFeedbackType('incorrect');
      setShowFeedback(true);
      const nextWeak = trackedSymbol && nextIncorrect % 2 === 0 && !weakSymbols.includes(trackedSymbol) ? [...weakSymbols, trackedSymbol] : weakSymbols;
      setWeakSymbols(nextWeak);
      persistProgress(currentStage, nextWeak, levelStars, nextSymbolStats);
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedSymbol('');
      }, 700);
      return;
    }
    const points = nextAttempt === 1 ? 10 : nextAttempt === 2 ? 5 : 0;
    const nextScore = levelScore + points;
    const nextCorrect = levelCorrect + 1;
    setScore((value) => value + points);
    setLevelScore(nextScore);
    setLevelCorrect(nextCorrect);
    setFeedbackType('correct');
    setShowFeedback(true);
    playCorrectSound();
    triggerDyscalculiaReward();
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedSymbol('');
      if (questionIndex + 1 >= questions.length) finishLevel(nextScore, nextCorrect, nextAttempts, nextSymbolStats);
      else {
        setQuestionIndex((value) => value + 1);
        setAttemptOnCurrent(0);
      }
    }, 650);
  };

  const renderOptions = () => {
    if (question.type === 'memory') {
      const cards = shuffle([...question.options, ...question.options]);
      return (
        <div className="sd-memory-grid">
          {cards.map((item, index) => (
            <button
              key={`${item.symbol}-${index}`}
              className="sd-symbol-card sd-memory-card"
              type="button"
              onClick={() => handleAnswer(item.symbol)}
            >
              <span>?</span>
              <small>{item.meaningSi}</small>
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="sd-options">
        {question.options.map((item, index) => {
          const isSelected = showFeedback && item.symbol === selectedSymbol;
          const feedbackClass = isSelected ? `is-${feedbackType}` : '';

          return (
            <button
              key={item.symbol}
              type="button"
              className={`sd-symbol-card sd-symbol-card-${index + 1} ${feedbackClass}`}
              onClick={() => handleAnswer(item.symbol)}
              aria-label={`${item.nameSi}: ${item.meaningSi}`}
              aria-pressed={isSelected}
            >
              <span className="sd-card-sparkle" aria-hidden="true">✦</span>
              <strong>{item.symbol}</strong>
              <small className="sd-card-hint">තෝරන්න</small>
            </button>
          );
        })}
      </div>
    );
  };

  if (gamePhase === 'intro') {
    return (
      <main className="sd-shell">
        <OceanAnimalFriends scene="symbols" />
        <section className="sd-panel sd-intro">
          <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='coral' />
          <button
            type="button"
            className={`sd-intro-speaker ${isIntroPlaying ? 'is-playing' : ''}`}
            onClick={replayIntro}
            aria-label="හඬ නැවත අසන්න"
            title="හඬ නැවත අසන්න"
          >
            <span aria-hidden="true">🔊</span>
            <span className="sd-intro-speaker-waves" aria-hidden="true"><i /><i /><i /></span>
          </button>
          <p className="sd-kicker">සංකේත පරීක්ෂක</p>
          <h1 className='nm-level-title'>ගණිත සංකේත ඉගෙන ගමු</h1>
          <p className="sd-intro-copy">එක් මට්ටමක් සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු.</p>
          <DifficultySelector
            levels={difficultyLevels}
            selected={difficulty}
            onSelect={startDifficulty}
            language='si'
            mascotImages={{
              easy: easyFishBoard,
              medium: mediumSeahorseBoard,
              hard: hardOctopusBoard,
            }}
          />
        </section>
      </main>
    );
  }

  if (gamePhase === 'levelComplete' || gamePhase === 'gameComplete') {
    const accuracy = levelAttempts ? Math.round((levelCorrect / levelAttempts) * 100) : 0;
    const isComplete = gamePhase === 'gameComplete';
    const passed = completionOutcome?.passed;
    const hasNextDifficulty = passed && completionOutcome?.nextDifficulty;
    const resultMessage = !isComplete
      ? `මෙම අදියරේදී ඔබ තරු ${starsFor(accuracy)}ක් ලබා ගත්තා.`
      : hasNextDifficulty
        ? 'හොඳයි! ඊළඟ මට්ටම දැන් විවෘතයි.'
        : passed
          ? 'විශිෂ්ටයි! ඔබ සියලුම මට්ටම් සම්පූර්ණ කළා.'
          : 'ඊළඟ මට්ටම විවෘත කිරීමට නැවත උත්සාහ කර 70%ක් ලබා ගන්න.';

    return <main className="sd-shell"><OceanAnimalFriends scene="symbols" /><section className="sd-panel sd-result"><div className="sd-result-icon">{isComplete ? '🏆' : '⭐'}</div><p className="sd-kicker">{isComplete ? 'මට්ටම සම්පූර්ණයි' : `${currentLevel} අදියර සම්පූර්ණයි`}</p><h1>{isComplete ? 'ඔබ සංකේත ශූරයෙක්!' : 'විශිෂ්ට සෙවීමක්!'}</h1><div className="sd-result-stats"><strong>{levelScore}<small>ලකුණු</small></strong><strong>{accuracy}%<small>නිවැරදිතාව</small></strong><strong>{'⭐'.repeat(starsFor(accuracy))}<small>තරු</small></strong></div><p>{resultMessage}</p><div className="sd-result-actions">{isComplete ? <><button className="sd-secondary" type="button" onClick={() => setGamePhase('intro')}>මට්ටම් තෝරන්න</button>{passed && !hasNextDifficulty ? <button className="sd-primary" type="button" onClick={() => navigate('/dyscalculia')}>ක්‍රීඩා වෙත ආපසු</button> : <button className="sd-primary" type="button" onClick={startDifficulty}>{hasNextDifficulty ? 'ඊළඟ මට්ටම' : 'නැවත උත්සාහ කරන්න'} <span>→</span></button>}</> : <><button className="sd-secondary" type="button" onClick={() => startLevel(currentLevel)}>නැවත ක්‍රීඩා කරන්න</button><button className="sd-primary" type="button" onClick={() => startLevel(currentLevel + 1, currentStage)}>ඊළඟ අදියර <span>→</span></button></>}</div></section></main>;
  }

  const progress = ((questionIndex + 1) / questions.length) * 100;

  return (
    <main className="sd-shell">
      <OceanAnimalFriends scene="symbols" />
      <section className="sd-panel sd-game">
        <header className="sd-game-header">
          <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant="coral" />
          <div className="sd-title-block">
            <span className="sd-level">මට්ටම {currentLevel} / {LEVEL_NAMES.length}</span>
            <h1>{LEVEL_NAMES[currentLevel - 1]}</h1>
          </div>
          <div className="sd-score" aria-label={`ලකුණු ${score}`}>
            <span aria-hidden="true">⭐</span>
            <strong>{score}</strong>
            <small>ලකුණු</small>
          </div>
        </header>

        <div className="sd-progress-meta" aria-hidden="true">
          <span>🐚 ප්‍රශ්නය {questionIndex + 1} / {questions.length}</span>
          <span>✨ ඉදිරියට යමු!</span>
        </div>
        <div className="sd-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="sd-question">
          <span className="sd-question-decoration sd-question-decoration-left" aria-hidden="true">✦</span>
          <span className="sd-question-decoration sd-question-decoration-right" aria-hidden="true">●</span>
          <div className="sd-question-copy">
            <small>පුංචි පරීක්ෂකයා, හොඳින් බලන්න!</small>
            <p>{question.instructionSi}</p>
          </div>
          <button className="sd-replay" type="button" onClick={() => speakSinhala(question.instructionSi)} aria-label="උපදෙස් නැවත අසන්න" title="උපදෙස් නැවත අසන්න">
            🔊
          </button>
          {question.display && <div className="sd-equation">{question.display}</div>}
        </div>

        {renderOptions()}

        <div className={`sd-feedback ${showFeedback ? `show ${feedbackType}` : ''}`} role="status" aria-live="polite">
          {feedbackType === 'correct' ? '🌟 හොඳයි! නිවැරදියි!' : '💛 කමක් නැහැ, නැවත උත්සාහ කරමු!'}
        </div>
      </section>
    </main>
  );
};

export default SymbolDetectiveGame;
