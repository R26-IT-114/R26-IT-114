import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLevelQuestions, SYMBOLS, STAGES } from '../data/symbolDetectiveData';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { speakSinhala } from '../utils/audioGuide';
import '../styles/symbol-detective-game.css';
import DifficultySelector from '../components/DifficultySelector';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import { getGameLevels } from '../utils/gameLevelProgress';

const GAME_KEY = 'symbol_detective_progress';
const GAME_TYPE = 'SymbolDetectiveGame';
const LEVEL_NAMES = ['Identify the Symbol', 'Match the Meaning', 'Symbol to Action', 'Find the Requested Symbol', 'Symbol Memory', 'Complete the Equation', 'Comparison Symbols'];

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
  const [levelScore, setLevelScore] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [weakSymbols, setWeakSymbols] = useState([]);
  const [symbolStats, setSymbolStats] = useState({});
  const [levelStars, setLevelStars] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [difficultyLevels] = useState(() => getGameLevels('SymbolDetectiveGame'));

  const question = questions[questionIndex];
  useEffect(() => {
    const saved = getSavedProgress();
    setCurrentStage(saved.currentStage || 1);
    setWeakSymbols(saved.weakSymbols || []);
    setSymbolStats(saved.symbolStats || {});
    setLevelStars(saved.levelStars || []);
  }, []);

  useEffect(() => {
    if (question && gamePhase === 'playing') speakSinhala(question.instructionSi);
  }, [question, gamePhase]);

  const startLevel = (level = 1, stage = currentStage) => {
    setCurrentLevel(level);
    setCurrentStage(stage);
    setQuestions(generateLevelQuestions(level, stage, weakSymbols));
    setQuestionIndex(0);
    setLevelScore(0);
    setLevelCorrect(0);
    setLevelAttempts(0);
    setAttemptOnCurrent(0);
    setShowFeedback(false);
    setGamePhase('playing');
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
    setGamePhase(currentLevel === LEVEL_NAMES.length ? 'gameComplete' : 'levelComplete');
  };

  const handleAnswer = (symbol) => {
    if (!question || showFeedback) return;
    const nextAttempt = attemptOnCurrent + 1;
    const nextAttempts = levelAttempts + 1;
    const currentSymbolStats = symbolStats[question.correctSymbol] || { correct: 0, attempts: 0 };
    const nextSymbolStats = {
      ...symbolStats,
      [question.correctSymbol]: {
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
      const nextWeak = question.correctSymbol && nextIncorrect % 2 === 0 && !weakSymbols.includes(question.correctSymbol) ? [...weakSymbols, question.correctSymbol] : weakSymbols;
      setWeakSymbols(nextWeak);
      persistProgress(currentStage, nextWeak, levelStars, nextSymbolStats);
      setTimeout(() => setShowFeedback(false), 700);
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
    setTimeout(() => {
      setShowFeedback(false);
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
      return <div className="sd-memory-grid">{cards.map((item, index) => <button key={`${item.symbol}-${index}`} className="sd-symbol-card sd-memory-card" type="button" onClick={() => handleAnswer(item.symbol)}><span>?</span><small>{item.meaning}</small></button>)}</div>;
    }
    return <div className="sd-options">{question.options.map((item) => <button key={item.symbol} type="button" className={`sd-symbol-card ${showFeedback && feedbackType === 'correct' && item.symbol === question.correctSymbol ? 'is-correct' : ''}`} onClick={() => handleAnswer(item.symbol)} aria-label={`${item.name}: ${item.meaning}`}><strong>{item.symbol}</strong><span>{item.nameSi}</span></button>)}</div>;
  };

  if (gamePhase === 'intro') return <main className="sd-shell"><section className="sd-panel sd-intro"><DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='coral' /><div className="sd-magnify">🔍</div><p className="sd-kicker">SYMBOL DETECTIVE</p><h1>සංකේත හඳුනමු</h1><p className="sd-intro-copy">Learn what +, −, ×, ÷, =, &lt; and &gt; are saying.</p><DifficultySelector levels={difficultyLevels} selected={difficulty} onSelect={setDifficulty} /><div className="sd-symbol-ribbon">{(difficulty === 'easy' ? SYMBOLS.slice(0, 3) : difficulty === 'medium' ? SYMBOLS.slice(0, 5) : SYMBOLS).map((item) => <span key={item.symbol}>{item.symbol}</span>)}</div><button className="sd-primary" type="button" onClick={() => startLevel(1, difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3)}>Start Detecting <span>→</span></button></section></main>;

  if (gamePhase === 'levelComplete' || gamePhase === 'gameComplete') {
    const accuracy = levelAttempts ? Math.round((levelCorrect / levelAttempts) * 100) : 0;
    const isComplete = gamePhase === 'gameComplete';
    return <main className="sd-shell"><section className="sd-panel sd-result"><div className="sd-result-icon">{isComplete ? '🏆' : '⭐'}</div><p className="sd-kicker">{isComplete ? 'DETECTIVE COMPLETE' : `LEVEL ${currentLevel} COMPLETE`}</p><h1>{isComplete ? 'Symbol Master!' : 'Great detecting!'}</h1><div className="sd-result-stats"><strong>{levelScore}<small>points</small></strong><strong>{accuracy}%<small>accuracy</small></strong><strong>{'⭐'.repeat(starsFor(accuracy))}<small>stars</small></strong></div><p>{isComplete ? 'You can recognize every symbol in the case.' : `You earned ${starsFor(accuracy)} star${starsFor(accuracy) === 1 ? '' : 's'} on this level.`}</p><div className="sd-result-actions">{isComplete ? <button className="sd-primary" type="button" onClick={() => navigate('/dyscalculia')}>Back to games</button> : <><button className="sd-secondary" type="button" onClick={() => startLevel(currentLevel)}>Replay level</button><button className="sd-primary" type="button" onClick={() => startLevel(currentLevel + 1, currentStage)}>Next level <span>→</span></button></>}</div></section></main>;
  }

  return <main className="sd-shell"><section className="sd-panel sd-game"><header className="sd-game-header"><DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='coral' /><div className="sd-title-block"><span className="sd-level">Level {currentLevel} / {LEVEL_NAMES.length}</span><h1>{LEVEL_NAMES[currentLevel - 1]}</h1></div><div className="sd-score">⭐ {score}</div></header><div className="sd-progress"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div><div className="sd-question"><div className="sd-question-copy"><p>{question.instruction}</p><small>{question.instructionSi}</small></div><button className="sd-replay" type="button" onClick={() => speakSinhala(question.instructionSi)} aria-label="Replay instruction">🔊</button>{question.display && <div className="sd-equation">{question.display}</div>}{currentLevel === 7 && <div className="sd-objects"><span>● ●</span><b>?</b><span>● ● ● ● ● ● ● ●</span></div>}</div>{renderOptions()}<div className={`sd-feedback ${showFeedback ? `show ${feedbackType}` : ''}`}>{feedbackType === 'correct' ? '⭐ හොඳයි! Correct!' : 'Try again! නැවත උත්සාහ කරන්න.'}</div></section></main>;
};

export default SymbolDetectiveGame;
