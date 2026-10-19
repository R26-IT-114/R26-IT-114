import useFeedbackAdvance from '../hooks/useFeedbackAdvance';
import GameResultCard from '../components/GameResultCard';
import { nextUnlockedLevel } from '../utils/gameUiProgress';
import GameRoundProgress from '../components/GameRoundProgress';
import useGameInstructions from '../hooks/useGameInstructions';
import { createGameAudio } from '../utils/gameAudio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { speakSinhala } from '../utils/audioGuide';
import { saveGameSession } from '../utils/dyscalculiaProgress';

import '../styles/number-listening-game.css';
import '../styles/dyscalculia-sorting-game.css';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import DifficultySelector from '../components/DifficultySelector';
import { getGameLevels, recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import {
  LISTENING_LEVEL_CONFIG,
  LISTENING_QUESTIONS_PER_LEVEL,
  buildListeningOptions,
  listeningAccuracy,
  listeningRewardStars,
} from '../utils/numberListeningSession';
import listeningGameBackground from '../../../assets/images/dyscalculiaimages/listening-ocean-cove-background-v2.png';
import easyFishBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/easy-fish-board.webp';
import mediumSeahorseBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/medium-seahorse-board.webp';
import hardOctopusBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/hard-octopus-board.webp';
import easyStarfish from '../../../assets/images/dyscalculiaimages/difficulty-starfish/easy-starfish.webp';
import mediumStarfish from '../../../assets/images/dyscalculiaimages/difficulty-starfish/medium-starfish.webp';
import hardStarfish from '../../../assets/images/dyscalculiaimages/difficulty-starfish/hard-starfish.webp';
import whaleFriend from '../../../assets/images/dyscalculiaimages/dashboard-animals/whale-splash.png';
import dolphinFriend from '../../../assets/images/dyscalculiaimages/dashboard-animals/dolphin-jump.png';
import sealFriend from '../../../assets/images/dyscalculiaimages/dashboard-animals/seal-ball.png';
import turtleFriend from '../../../assets/images/dyscalculiaimages/dashboard-animals/turtle-star.png';
import jellyfishFriend from '../../../assets/images/dyscalculiaimages/dashboard-animals/jellyfish-glow.png';
import pufferfishFriend from '../../../assets/images/dyscalculiaimages/dashboard-animals/pufferfish-graduate.png';

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
import listeningIntroAudio from '../../../assets/audio/dyscalculia/G02.wav';

const SEA_FRIENDS = [
  { name: 'whale', src: whaleFriend },
  { name: 'dolphin', src: dolphinFriend },
  { name: 'seal', src: sealFriend },
  { name: 'turtle', src: turtleFriend },
  { name: 'jellyfish', src: jellyfishFriend },
  { name: 'pufferfish', src: pufferfishFriend },
];

const ListeningSeaLife = () => (
  <div className="nlg-animated-sea-life" aria-hidden="true">
    {SEA_FRIENDS.map(({ name, src }) => (
      <img
        key={name}
        className={`nlg-sea-friend nlg-sea-friend--${name}`}
        src={src}
        alt=""
        draggable="false"
      />
    ))}
    <div className="nlg-bubble-stream nlg-bubble-stream--left">
      {[1, 2, 3, 4, 5].map((bubble) => <i key={bubble} />)}
    </div>
    <div className="nlg-bubble-stream nlg-bubble-stream--right">
      {[1, 2, 3, 4, 5].map((bubble) => <i key={bubble} />)}
    </div>
  </div>
);

const replayButtonLabel = 'Replay';

const LISTENING_INTRO_PLAYED_KEY = 'smartlearn:number-listening:intro-played';
let listeningIntroPlayedInSession = false;

const hasListeningIntroPlayed = () => {
  if (listeningIntroPlayedInSession) return true;

  try {
    return sessionStorage.getItem(LISTENING_INTRO_PLAYED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markListeningIntroPlayed = () => {
  listeningIntroPlayedInSession = true;
  try {
    sessionStorage.setItem(LISTENING_INTRO_PLAYED_KEY, 'true');
  } catch {
    // The in-memory flag still prevents repeated autoplay in this session.
  }
};

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

const getRandomTarget = (prevTargetDigit, max = 9) => {
  const available = NUMBERS.filter((n) => Number(n.digit) <= max);
  const candidates = available.filter((n) => n.digit !== prevTargetDigit);
  const list = candidates.length ? candidates : available;
  return list[Math.floor(Math.random() * list.length)];
};

const playNumberAudio = (digit) => {
  const audioSrc = NUMBER_AUDIO[digit];
  if (audioSrc) {
    const audio = createGameAudio(audioSrc);
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
  const { schedule, cancel } = useFeedbackAdvance();
  const answeredRef = useRef(false);
  const wrongDigitsRef = useRef(new Set());
  const [phase, setPhase] = useState('levels');
  const [level, setLevel] = useState(null);
  const [levels, setLevels] = useState(() => getGameLevels('NumberListeningGame'));
  const [questionNumber, setQuestionNumber] = useState(1);
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [questionAttempts, setQuestionAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [result, setResult] = useState(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const lastTargetRef = useRef(null);
  const speakNowRef = useRef(() => {});
  const introAudioRef = useRef(null);
  const pendingIntroInteractionRef = useRef(null);

  useEffect(() => {
    const audio = createGameAudio(listeningIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;
    let autoplayTimer = null;

    const handlePlay = () => setIsIntroPlaying(true);
    const handleStop = () => setIsIntroPlaying(false);
    const playAfterInteraction = () => {
      pendingIntroInteractionRef.current = null;
      audio.play().then(markListeningIntroPlayed).catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handleStop);
    audio.addEventListener('ended', handleStop);

    if (!hasListeningIntroPlayed()) {
      autoplayTimer = window.setTimeout(() => {
        if (introAudioRef.current !== audio) return;

        audio.play().then(markListeningIntroPlayed).catch(() => {
          pendingIntroInteractionRef.current = playAfterInteraction;
          document.addEventListener('pointerdown', playAfterInteraction, { once: true });
        });
      }, 0);
    }

    return () => {
      if (autoplayTimer !== null) window.clearTimeout(autoplayTimer);
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

  const replayIntro = () => {
    const audio = introAudioRef.current;
    if (!audio) return;

    const pendingInteraction = pendingIntroInteractionRef.current;
    if (pendingInteraction) {
      document.removeEventListener('pointerdown', pendingInteraction);
      pendingIntroInteractionRef.current = null;
    }

    audio.muted = false;
    audio.currentTime = 0;
    audio.play().then(markListeningIntroPlayed).catch(() => {});
  };

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

  const createQuestion = useCallback((selectedLevel) => {
    answeredRef.current = false;
    wrongDigitsRef.current.clear();
    const config = LISTENING_LEVEL_CONFIG[selectedLevel];
    const nextTarget = getRandomTarget(lastTargetRef.current, config.max);
    lastTargetRef.current = nextTarget.digit;
    setTarget(nextTarget);
    setOptions(buildListeningOptions(nextTarget.digit, selectedLevel));
    setSelectedDigit(null);
    setIsCorrect(null);
    setQuestionAttempts(0);
  }, []);

  const startLevel = useCallback((selectedLevel) => {
    cancel();
    stopIntro();
    setLevel(selectedLevel);
    setQuestionNumber(1);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTotalAttempts(0);
    setResult(null);
    setStartedAt(Date.now());
    lastTargetRef.current = null;
    createQuestion(selectedLevel);
    setPhase('playing');
  }, [createQuestion, stopIntro, cancel]);

  const speakNow = useCallback(() => {
    if (target) playNumberAudio(target.digit);
  }, [target]);
  speakNowRef.current = speakNow;

  useEffect(() => {
    if (phase !== 'playing' || !target) return undefined;
    const timer = window.setTimeout(() => speakNowRef.current(), 250);
    return () => window.clearTimeout(timer);
  }, [phase, target]);

  const finishLevel = useCallback((finalCorrect, finalWrong, finalAttempts) => {
    const accuracy = listeningAccuracy(finalCorrect);
    const stars = listeningRewardStars(accuracy);
    const timeSpent = Date.now() - startedAt;
    const levelResult = recordLevelResult('NumberListeningGame', level, {
      correctAnswers: finalCorrect,
      totalQuestions: LISTENING_QUESTIONS_PER_LEVEL,
      score: finalCorrect * 10,
    });
    setLevels(levelResult.levels);

    saveGameSession({
      gameType: 'NumberListeningGame',
      level,
      totalQuestions: LISTENING_QUESTIONS_PER_LEVEL,
      correct: levelResult.passed,
      correctCount: finalCorrect,
      wrongCount: finalWrong,
      correctAnswers: finalCorrect,
      wrongAnswers: finalWrong,
      firstAttemptCorrect: finalCorrect,
      attempts: finalAttempts,
      totalAttempts: finalAttempts,
      accuracy,
      responseTime: timeSpent,
      timeSpent,
      score: finalCorrect * 10,
      starsEarned: stars,
      completed: true,
      passed: levelResult.passed,
    });

    setResult({ accuracy, stars, passed: levelResult.passed, correct: finalCorrect, wrong: finalWrong, attempts: finalAttempts, timeSpent });
    setPhase('result');
  }, [level, startedAt]);

  const handlePick = (digit) => {
    if (answeredRef.current || phase !== 'playing' || !target || wrongDigitsRef.current.has(digit)) return;
    const correct = digit === target.digit;
    if (correct) answeredRef.current = true;
    else wrongDigitsRef.current.add(digit);
    const nextAttempts = totalAttempts + 1;
    const nextQuestionAttempts = questionAttempts + 1;
    setSelectedDigit(digit);
    setIsCorrect(correct);
    setTotalAttempts(nextAttempts);
    setQuestionAttempts(nextQuestionAttempts);

    if (correct) {
      triggerDyscalculiaReward();
      const firstAttempt = nextQuestionAttempts === 1;
      if (firstAttempt) setCorrectAnswers((value) => value + 1);
    } else {
      setWrongAnswers((value) => value + 1);
    }
  };

  const loadNextQuestion = useCallback(() => {
    if (isCorrect !== true) return;
    if (questionNumber === LISTENING_QUESTIONS_PER_LEVEL) {
      finishLevel(correctAnswers, wrongAnswers, totalAttempts);
      return;
    }
    setQuestionNumber((value) => value + 1);
    createQuestion(level);
  }, [isCorrect, questionNumber, correctAnswers, wrongAnswers, totalAttempts, finishLevel, createQuestion, level]);

  useEffect(() => {
    if (phase !== 'playing' || isCorrect !== true) return undefined;
    schedule(loadNextQuestion);
    return cancel;
  }, [phase, isCorrect, loadNextQuestion, schedule, cancel]);

  const showLevels = () => {
    cancel();
    setLevels(getGameLevels('NumberListeningGame'));
    setPhase('levels');
  };

  useGameInstructions(() => phase === 'levels' ? replayIntro() : speakNow());

  if (phase === 'levels') {
    return (
      <main className="sorting-shell sorting-level-shell listening-level-shell adventure-land station-whale-cove">
        <AdventureBackdrop station="whale-song-cove" />
        <OceanAnimalFriends scene="listening" />
        <section className="sorting-card sorting-level-card">
          <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant="turquoise" />
          <button
            type="button"
            className={`nlg-intro-speaker ${isIntroPlaying ? 'is-playing' : ''}`}
            onClick={replayIntro}
            aria-label="හඬ නැවත අසන්න"
            title="හඬ නැවත අසන්න"
          >
            <span aria-hidden="true">🔊</span>
            <span className="nlg-intro-speaker-waves" aria-hidden="true"><i /><i /><i /></span>
          </button>
          <p className="sorting-level-kicker">⭐ ✨ 🌟 ⭐ ✨ 🌟 ⭐</p>
          <h1>අංකයට සවන් දෙමු</h1>
          <div className="sorting-level-picker">
            <DifficultySelector
              levels={levels}
              selected={level}
              onSelect={startLevel}
              language="si"
              mobileMascotImages={{ easy: easyStarfish, medium: mediumStarfish, hard: hardStarfish }}
              mascotImages={{
                easy: easyFishBoard,
                medium: mediumSeahorseBoard,
                hard: hardOctopusBoard,
              }}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="nlg-page nlg-ocean-playground adventure-land station-whale-cove"
      style={{
        '--nlg-scene-background': `url(${listeningGameBackground})`,
        minHeight: 'calc(100dvh - 52px)',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <AdventureBackdrop station='whale-song-cove' />
      <ListeningSeaLife />
      <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='ocean' />

      {phase === 'playing' && target && (
        <section className="lrg-stage nlg-game-stage">
          <div className="lrg-round-card">
        <h1 className="nlg-session-title">අංකයට සවන් දෙමු</h1>
        <GameRoundProgress current={questionNumber} total={LISTENING_QUESTIONS_PER_LEVEL} correct={correctAnswers} />

            <div className="nlg-listening-hero">
              <span className="nlg-music-note" aria-hidden="true">♫</span>
              <div className="lrg-mode-label"><strong>හොඳින් සවන් දෙන්න!</strong><small>ඇසෙන අංකය නිවැරදිව තෝරන්න</small></div>
              <div className="nlg-sound-wave" aria-hidden="true">{[1, 2, 3, 4, 5].map((bar) => <i key={bar} />)}</div>
              <div className="lrg-listen-section">
                <button type="button" className="lrg-audio-btn" onClick={speakNow}>
                  🔊 <span>{replayButtonLabel}</span>
                </button>
              </div>
            </div>
            <p className="nlg-choice-prompt">👇 පිළිතුර මෙතැනින් තෝරන්න</p>
            <div className={`lrg-choices nlg-options nlg-options--${options.length}`}>
              {options.map((digit) => {
                const isPicked = selectedDigit === digit;
                let cardClass = 'lrg-choice-btn';
                if (isPicked && isCorrect) cardClass += ' lrg-choice-correct';
                if (isPicked && isCorrect === false) cardClass += ' lrg-choice-wrong';
                return (
                  <button key={digit} type="button" className={cardClass} onClick={() => handlePick(digit)} disabled={isCorrect === true} aria-label={`අංක ${digit} තෝරන්න`}>
                    {digit}
                  </button>
                );
              })}
            </div>
            <div className="nlg-feedback-slot" aria-live="polite">
              {isCorrect === true && <div className="lrg-eval-correct">🎉 හරි! ඉතා හොඳයි!</div>}
              {isCorrect === false && <div className="lrg-eval-wrong">🐚 නැවත සවන් දී උත්සාහ කරන්න</div>}

            </div>
          </div>
        </section>
      )}

      {phase === 'result' && result && (
        <section className="lrg-stage nlg-game-stage">
          <GameResultCard correct={result.correct} total={LISTENING_QUESTIONS_PER_LEVEL} accuracy={result.accuracy} stars={result.stars} rewardStars={result.stars}
            attempts={result.attempts} wrongAnswers={result.wrong} durationSeconds={result.timeSpent / 1000}
            message={result.passed ? '✓ මට්ටම සම්පූර්ණයි!' : '↻ නැවත පුහුණු වෙමු!'}
            onRetry={() => startLevel(level)} onLevels={showLevels} onJourney={() => navigate('/dyscalculia/dashboard')}
            onNext={nextUnlockedLevel(level, levels) ? () => startLevel(nextUnlockedLevel(level, levels)) : undefined} />
        </section>
      )}
    </main>
  );
};

export default NumberListeningGame;
