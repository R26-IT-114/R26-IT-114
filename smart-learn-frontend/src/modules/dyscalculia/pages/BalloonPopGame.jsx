import GameRoundProgress from '../components/GameRoundProgress';
import GameResultCard from '../components/GameResultCard';
import { nextUnlockedLevel } from '../utils/gameUiProgress';
import useGameInstructions from '../hooks/useGameInstructions';
import { createGameAudio, createGameAudioContext, speakGameUtterance } from '../utils/gameAudio';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-balloon-game.css';
import '../styles/dyscalculia-sorting-game.css';
import '../styles/dyscalculia-balloon-motion.css';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import DifficultySelector from '../components/DifficultySelector';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { digitUnitId } from '../utils/dyscalculiaGameCatalog';
import { getGameLevels, recordLevelResult } from '../utils/gameLevelProgress';

// Object image imports (adjust paths as needed)
import imgBaloon from '../../../assets/images/dyscalculiaimages/baloon.png';
import imgBall from '../../../assets/images/dyscalculiaimages/ball.png';
import imgApple from '../../../assets/images/dyscalculiaimages/apple.png';
import imgCar from '../../../assets/images/dyscalculiaimages/car.png';
import imgFlower from '../../../assets/images/dyscalculiaimages/flower.png';
import imgHeart from '../../../assets/images/dyscalculiaimages/heart.png';
import imgMoon from '../../../assets/images/dyscalculiaimages/moon.png';
import imgRocket from '../../../assets/images/dyscalculiaimages/rocket.png';
import imgSun from '../../../assets/images/dyscalculiaimages/sun.png';
import imgLion from '../../../assets/images/dyscalculiaimages/lion.png';
import imgJellyfish from '../../../assets/images/dyscalculiaimages/jelyfish.png';
import imgSippi from '../../../assets/images/dyscalculiaimages/sippi.png';
import imgStarfish from '../../../assets/images/dyscalculiaimages/starfish.png';
import balloonChildBunch from '../../../assets/images/dyscalculia-backgrounds/balloon-child-bunch.png';
import easyFishBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/easy-fish-board.webp';
import mediumSeahorseBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/medium-seahorse-board.webp';
import hardOctopusBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/hard-octopus-board.webp';

// Audio imports
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
import number10Audio from '../../../assets/audio/dyscalculia/number-10.mp3';
import balloonIntroAudio from '../../../assets/audio/dyscalculia/G04.wav';

const audioMap = {
  0: number0Audio, 1: number1Audio, 2: number2Audio, 3: number3Audio,
  4: number4Audio, 5: number5Audio, 6: number6Audio, 7: number7Audio,
  8: number8Audio, 9: number9Audio, 10: number10Audio,
};

const BALLOON_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const BALLOON_INTRO_PLAYED_KEY = 'smartlearn:balloon-pop:intro-played';
let balloonIntroPlayedInSession = false;

const hasBalloonIntroPlayed = () => {
  if (balloonIntroPlayedInSession) return true;
  try {
    return sessionStorage.getItem(BALLOON_INTRO_PLAYED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markBalloonIntroPlayed = () => {
  balloonIntroPlayedInSession = true;
  try {
    sessionStorage.setItem(BALLOON_INTRO_PLAYED_KEY, 'true');
  } catch {
    // The in-memory flag still prevents repeated autoplay in this session.
  }
};

const OBJECT_CATEGORIES = [
  { src: imgBaloon, label: 'balloon' },
  { src: imgBall, label: 'ball' },
  { src: imgApple, label: 'apple' },
  { src: imgCar, label: 'car' },
  { src: imgFlower, label: 'flower' },
  { src: imgHeart, label: 'heart' },
  { src: imgJellyfish, label: 'jellyfish' },
  { src: imgLion, label: 'lion' },
  { src: imgMoon, label: 'moon' },
  { src: imgRocket, label: 'rocket' },
  { src: imgSippi, label: 'sippi' },
  { src: imgStarfish, label: 'starfish' },
  { src: imgSun, label: 'sun' },
];

// Helper functions
const getMotivationalMessageSi = ({ correct }) => {
  return correct ? '🎉 ලස්සනයි! නිවැරදියි! 🎉' : '🌟 උත්සාහ කරන්න! නැවත උත්සාහ කරමු! 🌟';
};

const levelConfigs = { easy: { max: 3, balloons: 3 }, medium: { max: 6, balloons: 5 }, hard: { max: 9, balloons: 7 } };

const BalloonPopGame = () => {
  const navigate = useNavigate();
  const introAudioRef = useRef(null);
  const pendingIntroInteractionRef = useRef(null);
  const answerLockedRef = useRef(false);
  const unitResultsRef = useRef([]);
  const startedAtRef = useRef(null);
  const timersRef = useRef(new Set());

  const clearPendingTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback, delay) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  useEffect(() => clearPendingTimers, [clearPendingTimers]);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeBalloonId, setShakeBalloonId] = useState(null);
  const [poppedCircleId, setPoppedCircleId] = useState(null);
  const [showStarReward, setShowStarReward] = useState(false);
  const [level, setLevel] = useState('easy');
  const [levels, setLevels] = useState(() => getGameLevels('BalloonPopGame'));
  const levelConfig = levelConfigs[level || 'easy'];

  useEffect(() => {
    const audio = createGameAudio(balloonIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;

    const playAfterInteraction = () => {
      pendingIntroInteractionRef.current = null;
      audio.play().then(markBalloonIntroPlayed).catch(() => {});
    };

    if (!hasBalloonIntroPlayed()) {
      audio.play().then(markBalloonIntroPlayed).catch(() => {
        pendingIntroInteractionRef.current = playAfterInteraction;
        document.addEventListener('pointerdown', playAfterInteraction, { once: true });
      });
    }

    return () => {
      document.removeEventListener('pointerdown', playAfterInteraction);
      if (pendingIntroInteractionRef.current === playAfterInteraction) {
        pendingIntroInteractionRef.current = null;
      }
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
    audio.play().then(markBalloonIntroPlayed).catch(() => {});
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

  // Audio handlers
  const playNumberAudio = useCallback(async (number) => {
    try {
      const audio = createGameAudio(audioMap[number]);
      await audio.play();
    } catch {
      const utterance = new SpeechSynthesisUtterance(number.toString());
      utterance.lang = 'si-LK';
      speakGameUtterance(utterance);
    }
  }, []);

  const playExplosionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = createGameAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(760, ctx.currentTime + 0.06);
      gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.06);
      osc2.stop(ctx.currentTime + 0.28);

      setTimeout(() => ctx.close().catch(() => {}), 260);
    } catch {
      // Sound is optional; gameplay continues with visual feedback.
    }
  }, []);

  const getSinhalaNumberText = useCallback((n) => {
    const map = {
      0: 'බිංදුව', 1: 'එක', 2: 'දෙක', 3: 'තුන', 4: 'හතර',
      5: 'පහ', 6: 'හය', 7: 'හත', 8: 'අට',
      9: 'නවය', 10: 'දහය'
    };
    return map[n] || n.toString();
  }, []);

  const generateTarget = useCallback((max = levelConfig.max) => {
    const targetNumber = Math.floor(Math.random() * (max + 1));
    return { targetNumber, targetText: getSinhalaNumberText(targetNumber) };
  }, [getSinhalaNumberText, levelConfig.max]);

  const pickObjectImages = useCallback((count) => {
    const shuffled = [...OBJECT_CATEGORIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const generateBalloons = useCallback((targetNumber, balloonCount = levelConfig.balloons) => {
    const correctIndex = Math.floor(Math.random() * balloonCount);
    const selectedCategories = pickObjectImages(balloonCount);
    const newBalloons = [];
    for (let i = 0; i < balloonCount; i++) {
      let quantity;
      if (i === correctIndex) {
        quantity = targetNumber;
      } else {
        let q;
        do {
          const offset = Math.floor(Math.random() * 4) + 1;
          q = Math.random() > 0.5 ? targetNumber + offset : targetNumber - offset;
        } while (q <= 0 || q > 10 || q === targetNumber);
        quantity = q;
      }
      newBalloons.push({
        id: i,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        quantity,
        // Store the scattered positions once per question so rerenders don't move objects.
        objectPositions: Array.from({ length: 12 }, (_, slot) => ({
          x: 26 + (slot % 3) * 24 + (Math.random() - .5) * 6,
          y: 20 + Math.floor(slot / 3) * 20 + (Math.random() - .5) * 5,
          rotation: (Math.random() - .5) * 24,
          order: Math.random(),
        })).sort((a, b) => a.order - b.order).slice(0, quantity),
        objSrc: selectedCategories[i].src,
        objLabel: selectedCategories[i].label,
        // The lane reserves room for the whole drift, including on narrow screens.
        driftDuration: 7 + Math.random() * 4,
        driftDelay: -Math.random() * 8,
        driftDirection: i % 2 === 0 ? 'normal' : 'reverse',
        isCorrect: i === correctIndex,
      });
    }
    return newBalloons;
  }, [pickObjectImages, levelConfig.balloons]);

  const startGame = useCallback((selection) => {
    const selectedLevel = typeof selection === 'string' ? selection : level;
    const config = levelConfigs[selectedLevel];
    if (!config || levels[selectedLevel]?.unlocked === false) return;
    clearPendingTimers();
    answerLockedRef.current = false;
    startedAtRef.current = Date.now();
    setLevel(selectedLevel);
    setRoundResult(null);
    stopIntro();
    setGameStarted(true);
    setScore(0);
    setQuestionCount(0);
    unitResultsRef.current = [];
    const q = generateTarget(config.max);
    setCurrentQuestion(q);
    setBalloons(generateBalloons(q.targetNumber, config.balloons));
    setShowConfetti(false);
    setShowFeedback(false);
    setShowStarReward(false);
    setShakeBalloonId(null);
    setPoppedCircleId(null);
    schedule(() => playNumberAudio(q.targetNumber), 400);
  }, [clearPendingTimers, generateTarget, generateBalloons, playNumberAudio, schedule, stopIntro, level, levels]);

  const handleBalloonClick = useCallback((balloon) => {
    if (answerLockedRef.current || showFeedback || !currentQuestion) return;
    // Lock before React renders the disabled state, including rapid double taps.
    answerLockedRef.current = true;
    const correct = balloon.isCorrect;
    unitResultsRef.current = [
      ...unitResultsRef.current,
      {
        unitId: digitUnitId(currentQuestion.targetNumber),
        starsEarned: correct ? 3 : 0,
        completed: true,
      },
    ];
    setShowFeedback(true);
    if (correct) {
      triggerDyscalculiaReward();
      const newScore = score + 10;
      setScore(newScore);
      setPoppedCircleId(balloon.id);
      setFeedbackType('success');
      setFeedbackMessage(getMotivationalMessageSi({ correct: true }));
      setShowConfetti(true);
      setShowStarReward(true);
      playExplosionSound();
      schedule(() => setShowConfetti(false), 1400);
      schedule(() => setShowStarReward(false), 1400);
      try {
        localStorage.setItem('balloon_score', String(newScore));
      } catch {
        // Keep the game playable when browser storage is unavailable.
      }
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage(getMotivationalMessageSi({ correct: false }));
      setShakeBalloonId(balloon.id);
      setPoppedCircleId(null);
      schedule(() => setShakeBalloonId(null), 500);
    }
    schedule(() => {
      const nextCount = questionCount + 1;
      setShowFeedback(false);
      if (nextCount >= 5) {
        const finalCorrect = Math.round((score + (correct ? 10 : 0)) / 10);
        const levelResult = recordLevelResult('BalloonPopGame', level, {
          correctAnswers: finalCorrect,
          totalQuestions: 5,
          score: finalCorrect * 10,
        });
        setLevels(levelResult.levels);
        saveGameSession({
          gameId: 'balloon-pop',
          gameType: 'BalloonPopGame',
          level,
          attempts: 5,
          correctCount: finalCorrect,
          wrongCount: 5 - finalCorrect,
          score: finalCorrect * 10,
          starsEarned: unitResultsRef.current.reduce((total, result) => total + result.starsEarned, 0),
          unitResults: unitResultsRef.current,
          completed: true,
        });
        setRoundResult({ correct: finalCorrect, total: 5, passed: levelResult.passed, levels: levelResult.levels, durationSeconds: (Date.now() - startedAtRef.current) / 1000 });
        setGameStarted(false);
        setPoppedCircleId(null);
      } else {
        const newQ = generateTarget();
        setCurrentQuestion(newQ);
        setBalloons(generateBalloons(newQ.targetNumber));
        setQuestionCount(nextCount);
        setPoppedCircleId(null);
        setShowStarReward(false);
        answerLockedRef.current = false;
        schedule(() => playNumberAudio(newQ.targetNumber), 300);
      }
    }, correct ? 1400 : 1800);
  }, [showFeedback, currentQuestion, score, questionCount, level, playExplosionSound, generateTarget, generateBalloons, playNumberAudio, schedule]);

  const renderedBalloons = useMemo(() => {
    return balloons.map((balloon) => (
      <div key={balloon.id} className={`balloon-lane ${showFeedback ? 'balloon-lane--paused' : ''}`}>
        <div className="balloon-drift" style={{ '--drift-duration': `${balloon.driftDuration}s`, '--drift-delay': `${balloon.driftDelay}s`, '--drift-direction': balloon.driftDirection }}>
      <button
        type="button"
        className={`math-circle circle-${balloon.color} ${showFeedback ? 'paused' : ''} ${shakeBalloonId === balloon.id ? 'shaking' : ''} ${poppedCircleId === balloon.id ? 'popped' : ''}`}
        onClick={() => handleBalloonClick(balloon)}
        disabled={showFeedback}
        aria-label={`වස්තු ${balloon.quantity}ක් ඇති බැලුනය`}
      >
        <div className="circle-objects">
          {balloon.objectPositions.map((position, idx) => (
            <img key={idx} src={balloon.objSrc} alt="" className="circle-obj-img" draggable={false}
              style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translate(-50%, -50%) rotate(${position.rotation}deg)` }} />
          ))}
        </div>
      </button>
        </div>
      </div>
    ));
  }, [balloons, showFeedback, shakeBalloonId, poppedCircleId, handleBalloonClick]);

  useGameInstructions(() => !gameStarted ? replayIntro() : playNumberAudio(currentQuestion?.targetNumber));

  if (roundResult) {
    const next = nextUnlockedLevel(level, roundResult.levels);
    return <main className="sorting-shell adventure-land dc-result-shell">
      <DyscalculiaBackButton onClick={() => setRoundResult(null)} />
      <GameResultCard gameId="balloon-pop" correct={roundResult.correct} total={5} stars={Math.min(3, Math.ceil(roundResult.correct * 3 / 5))} rewardStars={Math.min(3, Math.ceil(roundResult.correct * 3 / 5))}
        attempts={roundResult.total} wrongAnswers={roundResult.total - roundResult.correct} durationSeconds={roundResult.durationSeconds}
        message={roundResult.passed ? '✓ මට්ටම සම්පූර්ණයි!' : '↻ තව ටිකක් පුහුණු වෙමු!'}
        onRetry={() => startGame(level)} onLevels={() => setRoundResult(null)} onJourney={() => navigate('/dyscalculia/dashboard')}
        onNext={next ? () => startGame(next) : undefined} />
    </main>;
  }

  if (!gameStarted) {
    return (
      <main className="sorting-shell sorting-level-shell balloon-level-shell adventure-land station-bubble-beach">
        <AdventureBackdrop station="bubble-beach-lagoon" />
        <OceanAnimalFriends scene="balloon" />
        <section className="sorting-card sorting-level-card">
          <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant="turquoise" />
          <button
            type="button"
            className="sorting-intro-speaker"
            onClick={replayIntro}
            aria-label="හඬ නැවත අසන්න"
            title="හඬ නැවත අසන්න"
          >
            <span aria-hidden="true">🔊</span>
            <span className="sorting-intro-speaker-waves" aria-hidden="true"><i /><i /><i /></span>
          </button>
          <p className="sorting-level-kicker">⭐ ✨ 🌟 ⭐ ✨ 🌟 ⭐</p>
          <h1>බුබුළු පොප් ක්‍රීඩාව</h1>
          <p className="sorting-level-copy">එක් මට්ටමක් සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු.</p>
          <div className="sorting-level-picker">
            <DifficultySelector
              levels={levels}
              selected={level}
              onSelect={startGame}
              language="si"
              mascotImages={{
                easy: easyFishBoard,
                medium: mediumSeahorseBoard,
                hard: hardOctopusBoard,
              }}
            />
          </div>

          {score > 0 && <div className="final-score-badge">🌟 ඔයාගේ ලකුණු: {score} 🌟</div>}


        </section>
      </main>
    );
  }

  return (
    <div className="balloon-pop-game balloon-motion-game relative adventure-land station-bubble-beach">
      <AdventureBackdrop station='bubble-beach-lagoon' />
      <OceanAnimalFriends scene="balloon" />
      <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='sky' />

      {!gameStarted ? (
        <div className="game-intro">
          {/* Decorative sky background */}
          <div className="sky-decor" aria-hidden="true">
            <span className="cloud cloud-1" />
            <span className="cloud cloud-2" />
            <span className="cloud cloud-3" />
            <span className="star star-1">✦</span>
            <span className="star star-2">✦</span>
            <span className="star star-3">✦</span>
            <span className="star star-4">✦</span>
            <div className="rainbow-arc" />
          </div>

          <div className="wood-panel">
            <div className="ribbon-banner">
              <span className="ribbon-text">බුබුළු පොප් ක්‍රීඩාව</span>
            </div>

            <div className="wood-panel-inner">
              <div className="intro-balloon-row">
                <span className="intro-balloon balloon-red">🫧</span>
                <span className="intro-balloon balloon-blue">🫧</span>
                <span className="intro-balloon balloon-yellow">🫧</span>
              </div>

              <p className="intro-instructions">
                🔊 අංකය අහන්න, <strong>නිවැරදි ප්‍රමාණයේ වස්තු</strong> ඇති බුබුල තෝරන්න!
              </p>
              <button type="button" className="replay-audio" onClick={replayIntro} aria-label="හඬ නැවත අසන්න">
                🔊 නැවත අහන්න
              </button>
              <DifficultySelector levels={levels} selected={level} onSelect={setLevel} />

              <div className="intro-example">
                <span className="example-chip">{`🎵 "හතර"`}</span>
                <span className="example-arrow">➜</span>
                <span className="example-chip">🐱🐱🐱🐱</span>
              </div>

              {score > 0 && (
                <div className="final-score-badge">
                  <span>🌟</span>
                  <span>ඔයාගේ ලකුණු: {score}</span>
                  <span>🌟</span>
                </div>
              )}

              <button className="wood-start-button" onClick={startGame}>
                <span className="wood-start-shine" />
                <span className="wood-start-label">
                  {score > 0 ? '🏖️ නැවත ආරම්භ කරන්න' : '🫧 ක්‍රීඩාව ආරම්භ කරන්න'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="game-stage-layout">
            <aside className="question-panel ring-4 ring-cyan-100/80 shadow-xl shadow-cyan-200/30">
              <div className="question-panel-title text-violet-700">අද අංකය</div>
              <div className="target-badge target-badge-large shadow-lg">
                <span className="target-number target-number-large">{currentQuestion?.targetNumber}</span>
                <span className="target-sinhala target-sinhala-large">{currentQuestion?.targetText}</span>
              </div>
              <button className="replay-audio replay-audio-large transition-transform duration-150 hover:scale-105" onClick={() => playNumberAudio(currentQuestion?.targetNumber)}>
                🔊 නැවත අහන්න
              </button>

              <GameRoundProgress current={questionCount + 1} total={5} correct={Math.round(score / 10)} />
              <div className="question-panel-stats">
                <div className="score-display shadow-md">🏆 {score}</div>
                <div className="question-counter shadow-md">📋 {questionCount + 1}/5</div>
              </div>
            </aside>

            <section className="balloon-stage rounded-3xl border-2 border-white/50 bg-white/20 p-2 shadow-xl backdrop-blur-[1px]" aria-label="බැලුන් තෝරන තැන">
              <div className="balloon-play-instruction">
                <h2>ගණන් කර හරි බැලුනය තෝරන්න!</h2>
                <p className={`balloon-answer-status ${showFeedback ? `is-${feedbackType}` : ''}`} role="status" aria-live="polite" aria-atomic="true">
                  {showFeedback && <><span aria-hidden="true">{feedbackType === 'success' ? '✓' : '↻'}</span> {feedbackMessage}</>}
                </p>
              </div>
              <div className={`balloon-container balloon-container--${balloons.length}`}>
                {renderedBalloons}
              </div>
              <img className="balloon-child-decoration" src={balloonChildBunch} alt="" aria-hidden="true" />
            </section>
          </div>

          {showStarReward && (
            <div className="star-reward-overlay" aria-hidden="true">
              <div className="star-reward-core">⭐</div>
              <div className="star-reward-center-glow">✨</div>
              <span className="star-reward s1">⭐</span>
              <span className="star-reward s2">✨</span>
              <span className="star-reward s3">⭐</span>
              <span className="star-reward s4">✨</span>
              <span className="star-reward s5">⭐</span>
              <span className="star-reward s6">✨</span>
              <span className="star-reward s7">⭐</span>
              <span className="star-reward s8">✨</span>
              <span className="star-reward s9">⭐</span>
              <span className="star-reward s10">✨</span>
            </div>
          )}

          {showConfetti && (
            <div className="confetti-container pointer-events-none">
              {[...Array(60)].map((_, i) => (
                <div key={i} className="confetti-piece rounded-sm" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.4}s`, backgroundColor: ['#FFB347', '#FF6B6B', '#4ECDC4', '#FFE66D', '#C44569'][i % 5] }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BalloonPopGame;
