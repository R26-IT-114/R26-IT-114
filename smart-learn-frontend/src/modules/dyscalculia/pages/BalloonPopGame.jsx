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
import '../styles/balloon-pop-adventure.css';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import DifficultySelector from '../components/DifficultySelector';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import { getDyscalculiaProgress, getGameStarProgress, saveGameSession } from '../utils/dyscalculiaProgress';
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

function createObjectPositions(quantity) {
  const columns = Math.min(3, Math.ceil(Math.sqrt(quantity * .76)));
  const rows = Math.ceil(quantity / columns);
  const xPositions = columns === 1
    ? [50]
    : Array.from({ length: columns }, (_, index) => 26 + (48 * index) / (columns - 1));
  const yPositions = rows === 1
    ? [50]
    : Array.from({ length: rows }, (_, index) => 24 + (52 * index) / (rows - 1));
  const slots = yPositions.flatMap((y) => xPositions.map((x) => ({ x, y })));

  for (let index = slots.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [slots[index], slots[swapIndex]] = [slots[swapIndex], slots[index]];
  }

  return slots.slice(0, quantity).map(({ x, y }) => ({
    x: x + (Math.random() - .5) * 6,
    y: y + (Math.random() - .5) * 4,
    rotation: (Math.random() - .5) * 24,
  }));
}

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
  const wrongAttemptsRef = useRef(0);
  const totalAnswersRef = useRef(0);
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
        objectPositions: createObjectPositions(quantity),
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
    wrongAttemptsRef.current = 0;
    totalAnswersRef.current = 0;
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
    totalAnswersRef.current += 1;
    setShowFeedback(true);
    if (!correct) {
      wrongAttemptsRef.current += 1;
      setFeedbackType('wrong');
      setFeedbackMessage(getMotivationalMessageSi({ correct: false }));
      setShakeBalloonId(balloon.id);
      setPoppedCircleId(null);
      schedule(() => {
        setShowFeedback(false);
        setShakeBalloonId(null);
        answerLockedRef.current = false;
      }, 1100);
      return;
    }

    unitResultsRef.current = [
      ...unitResultsRef.current,
      {
        unitId: digitUnitId(currentQuestion.targetNumber),
        starsEarned: 3,
        completed: true,
      },
    ];
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
          attempts: totalAnswersRef.current,
          correctCount: finalCorrect,
          wrongCount: wrongAttemptsRef.current,
          score: finalCorrect * 10,
          starsEarned: unitResultsRef.current.reduce((total, result) => total + result.starsEarned, 0),
          unitResults: unitResultsRef.current,
          completed: true,
        });
        setRoundResult({
          correct: finalCorrect,
          total: 5,
          attempts: totalAnswersRef.current,
          wrongAnswers: wrongAttemptsRef.current,
          passed: levelResult.passed,
          levels: levelResult.levels,
          durationSeconds: (Date.now() - startedAtRef.current) / 1000,
        });
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
            <span className="balloon-knot" aria-hidden="true" />
            <span className="balloon-string" aria-hidden="true" />
            <div className="circle-objects">
              {balloon.objectPositions.map((position, idx) => (
                <img
                  key={idx}
                  src={balloon.objSrc}
                  alt=""
                  className="circle-obj-img"
                  draggable={false}
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                  }}
                />
              ))}
            </div>
            {poppedCircleId === balloon.id && <span className="balloon-pop-particles" aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => <i key={index} />)}
            </span>}
          </button>
        </div>
      </div>
    ));
  }, [balloons, showFeedback, shakeBalloonId, poppedCircleId, handleBalloonClick]);

  useGameInstructions(() => !gameStarted ? replayIntro() : playNumberAudio(currentQuestion?.targetNumber));

  if (roundResult) {
    const next = nextUnlockedLevel(level, roundResult.levels);
    const progress = getGameStarProgress(getDyscalculiaProgress(), 'balloon-pop');
    return <main className="sorting-shell adventure-land dc-result-shell balloon-result-shell">
      <DyscalculiaBackButton onClick={() => setRoundResult(null)} />
      <GameResultCard gameId="balloon-pop" correct={roundResult.correct} total={5} stars={Math.min(3, Math.ceil(roundResult.correct * 3 / 5))} rewardStars={Math.min(3, Math.ceil(roundResult.correct * 3 / 5))}
        attempts={roundResult.attempts} wrongAnswers={roundResult.wrongAnswers} durationSeconds={roundResult.durationSeconds}
        message={roundResult.passed ? '✓ මට්ටම සම්පූර්ණයි!' : '↻ තව ටිකක් පුහුණු වෙමු!'}
        onRetry={() => startGame(level)} onLevels={() => setRoundResult(null)} onJourney={() => navigate('/dyscalculia/dashboard')}
        onNext={next ? () => startGame(next) : undefined} />
      <section className="balloon-result-progress" aria-label="බැලුන් ක්‍රීඩාවේ තරු ප්‍රගතිය">
        <div className="balloon-result-progress__heading">
          <span aria-hidden="true">🎈</span>
          <div><h2>බැලුන් ක්‍රීඩාවේ ප්‍රගතිය</h2><p>ඔයාගේ හොඳම තරු ගමන</p></div>
          <strong>⭐ {progress.earnedStars} / {progress.maximumStars}</strong>
        </div>
        <div className="balloon-result-progress__bar" role="progressbar" aria-label="බැලුන් ක්‍රීඩාවේ තරු ප්‍රගතිය" aria-valuemin={0} aria-valuemax={progress.maximumStars} aria-valuenow={progress.earnedStars}>
          <span style={{ width: `${progress.progressPercentage}%` }} />
        </div>
        <p className="balloon-result-progress__units">
          <span>සම්පූර්ණ කළ අභියෝග: {progress.completedUnits} / {progress.totalUnits}</span>
          <strong>{progress.progressPercentage}%</strong>
        </p>
      </section>
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
    <main className="balloon-pop-game balloon-motion-game balloon-adventure adventure-land station-bubble-beach">
      <AdventureBackdrop station='bubble-beach-lagoon' />
      <OceanAnimalFriends scene="balloon" />
      <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='sky' />

      <div className="balloon-sky-decorations" aria-hidden="true">
        <span className="balloon-sky-cloud balloon-sky-cloud--one" />
        <span className="balloon-sky-cloud balloon-sky-cloud--two" />
        <span className="balloon-sky-cloud balloon-sky-cloud--three" />
        <span className="balloon-sky-sparkle balloon-sky-sparkle--one">✦</span>
        <span className="balloon-sky-sparkle balloon-sky-sparkle--two">✧</span>
        <span className="balloon-sky-sparkle balloon-sky-sparkle--three">✦</span>
      </div>
      <div className="balloon-adventure-content">
        <header className="balloon-adventure-header">
          <div className="balloon-adventure-brand">
            <span className="balloon-adventure-brand__icon" aria-hidden="true">🎈</span>
            <div><p>අංක ගණන් කරමු</p><h1>බැලුන් වික්‍රමය</h1></div>
          </div>
          <div className="balloon-adventure-score" aria-label={`ලකුණු ${score}`}>
            <span aria-hidden="true">🏅</span><strong>{score}</strong><small>ලකුණු</small>
          </div>
        </header>
        <div className="balloon-adventure-progress"><GameRoundProgress current={questionCount + 1} total={5} correct={Math.round(score / 10)} /></div>
        <section className="balloon-question-card" aria-label="අද අංකය">
          <div className="balloon-target-bubble">
            <span>අහන්න</span>
            <strong>{currentQuestion?.targetNumber}</strong>
            <small>{currentQuestion?.targetText}</small>
          </div>
          <div className="balloon-question-copy">
            <p>ඇසෙන අංකයට ගැළපෙන වස්තු ගණන සොයමු!</p>
            <button className="balloon-replay-button" type="button" onClick={() => playNumberAudio(currentQuestion?.targetNumber)}>
              <span aria-hidden="true">🔊</span> අංකය නැවත අහන්න
            </button>
          </div>
        </section>
        <section className="balloon-stage" aria-label="බැලුන් තෝරන තැන">
          <div className="balloon-board-heading">
            <h2>හරි බැලුනය තෝරන්න!</h2><span aria-hidden="true">🫧</span>
          </div>
          {showFeedback && <p className={`balloon-answer-status is-${feedbackType}`} role="status" aria-live="polite" aria-atomic="true">
            <span aria-hidden="true">{feedbackType === 'success' ? '✓' : '↻'}</span> {feedbackMessage}
          </p>}
          <div className={`balloon-container balloon-container--${balloons.length}`}>
            {renderedBalloons}
          </div>
        </section>
      </div>

      {showStarReward && <div className="star-reward-overlay" aria-hidden="true">
        <div className="star-reward-core">⭐</div><div className="star-reward-center-glow">✨</div>
        <span className="star-reward s1">⭐</span><span className="star-reward s2">✨</span>
        <span className="star-reward s3">⭐</span><span className="star-reward s4">✨</span>
        <span className="star-reward s5">⭐</span><span className="star-reward s6">✨</span>
      </div>}

      {showConfetti && <div className="confetti-container pointer-events-none" aria-hidden="true">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="confetti-piece rounded-sm" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.4}s`, backgroundColor: ['#FFB347', '#FF6B6B', '#4ECDC4', '#FFE66D', '#C44569'][i % 5] }} />
        ))}
      </div>}
    </main>
  );
};

export default BalloonPopGame;
