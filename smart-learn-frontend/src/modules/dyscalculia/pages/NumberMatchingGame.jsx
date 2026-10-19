import GameResultCard from '../components/GameResultCard';
import { nextUnlockedLevel } from '../utils/gameUiProgress';
import GameRoundProgress from '../components/GameRoundProgress';
import useGameInstructions from '../hooks/useGameInstructions';
import { createGameAudio, createGameAudioContext } from '../utils/gameAudio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveGameSession } from '../utils/dyscalculiaProgress';
import { digitUnitId } from '../utils/dyscalculiaGameCatalog';
import { speakSinhala } from '../utils/audioGuide';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import DifficultySelector from '../components/DifficultySelector';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import { getGameLevels, recordLevelResult } from '../utils/gameLevelProgress';
import easyFishBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/easy-fish-board.webp';
import mediumSeahorseBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/medium-seahorse-board.webp';
import hardOctopusBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/hard-octopus-board.webp';
import wrongAnswerSound from '../../../assets/audio/dysgraphia/wrong.mp3';
import numberMatchingIntroAudio from '../../../assets/audio/dyscalculia/G06.wav';
import '../styles/number-matching-game.css';

const TOTAL_QUESTIONS = 10;
const NUMBER_MATCHING_INTRO_PLAYED_KEY = 'smartlearn:number-matching:intro-played';
let numberMatchingIntroPlayedInSession = false;
const LEVEL_BOARD_ANIMALS = {
  easy: easyFishBoard,
  medium: mediumSeahorseBoard,
  hard: hardOctopusBoard,
};
const OBJECTS = [
  { icon: '🐟', name: 'මාළු' },
  { icon: '⭐', name: 'තරු මාළු' },
  { icon: '🫧', name: 'බුබුළු' },
  { icon: '🐟', name: 'මාළු' },
  { icon: '🐚', name: 'සිප්පි' },
  { icon: '🦀', name: 'කකුළුවන්' },
];

const getDifficulty = (level) => ({
  easy: { label: 'Easy', min: 1, max: 3, optionCount: 3 },
  medium: { label: 'Medium', min: 1, max: 6, optionCount: 5 },
  hard: { label: 'Hard', min: 0, max: 9, optionCount: 7 },
}[level]);

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const hasNumberMatchingIntroPlayed = () => {
  if (numberMatchingIntroPlayedInSession) return true;
  try {
    return sessionStorage.getItem(NUMBER_MATCHING_INTRO_PLAYED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markNumberMatchingIntroPlayed = () => {
  numberMatchingIntroPlayedInSession = true;
  try {
    sessionStorage.setItem(NUMBER_MATCHING_INTRO_PLAYED_KEY, 'true');
  } catch {
    // The in-memory flag still prevents repeated autoplay in this session.
  }
};

const createQuestion = (level, targetOverride) => {
  const difficulty = getDifficulty(level);
  const target = Number.isInteger(targetOverride) && targetOverride >= difficulty.min && targetOverride <= difficulty.max
    ? targetOverride
    : randomInt(difficulty.min, difficulty.max);
  const values = Array.from({ length: difficulty.max - difficulty.min + 1 }, (_, index) => difficulty.min + index);
  const distractors = difficulty.label === 'Easy'
    ? values.filter((value) => value !== target)
    : values
      .filter((value) => value !== target)
      .sort((left, right) => Math.abs(left - target) - Math.abs(right - target));
  const quantities = [target, ...shuffle(distractors.slice(0, difficulty.optionCount - 1))];

  return {
    id: `${Date.now()}-${Math.random()}`,
    target,
    difficulty: difficulty.label,
    object: OBJECTS[randomInt(0, OBJECTS.length - 1)],
    options: shuffle(quantities),
  };
};

const playCorrectSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = createGameAudioContext();
    [523, 659, 784].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, context.currentTime + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + index * 0.1 + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * 0.1);
      oscillator.stop(context.currentTime + index * 0.1 + 0.18);
    });
  } catch {
    // Sound is optional; the visual feedback remains available.
  }
};

const playWrongSound = () => {
  try {
    const audio = createGameAudio(wrongAnswerSound);
    audio.volume = 0.85;
    void audio.play().catch(() => {
      // Visual feedback remains available if the browser blocks audio playback.
    });
  } catch {
    // Sound is optional; the incorrect-answer feedback remains visible.
  }
};

const NumberMatchingGame = () => {
  const navigate = useNavigate();
  const nextQuestionTimeout = useRef(null);
  const answerLockedRef = useRef(false);
  const attemptedOptionsRef = useRef(new Set());
  const startedAtRef = useRef(null);
  const introAudioRef = useRef(null);
  const pendingIntroInteractionRef = useRef(null);
  const hardTargetOrderRef = useRef([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [level, setLevel] = useState('easy');
  const [levels, setLevels] = useState(() => getGameLevels('NumberMatchingGame'));
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [attemptsForQuestion, setAttemptsForQuestion] = useState(0);
  const [stars, setStars] = useState(0);
  const [question, setQuestion] = useState(() => createQuestion('easy'));
  const [wrongOptions, setWrongOptions] = useState([]);
  const [selectedCorrect, setSelectedCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [results, setResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);

  useEffect(() => () => clearTimeout(nextQuestionTimeout.current), []);

  useEffect(() => {
    const audio = createGameAudio(numberMatchingIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;

    const handlePlay = () => setIsIntroPlaying(true);
    const handleStop = () => setIsIntroPlaying(false);
    const playAfterInteraction = () => {
      pendingIntroInteractionRef.current = null;
      audio.play().then(markNumberMatchingIntroPlayed).catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handleStop);
    audio.addEventListener('ended', handleStop);

    if (!hasNumberMatchingIntroPlayed()) {
      audio.play().then(markNumberMatchingIntroPlayed).catch(() => {
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
    audio.play().then(markNumberMatchingIntroPlayed).catch(() => {});
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
    if (isStarted && !isComplete) speakSinhala('අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න');
  }, [question.id, isComplete, isStarted]);


  const handleOptionSelect = (quantity) => {
    if (answerLockedRef.current || isLocked || attemptedOptionsRef.current.has(quantity)) return;
    attemptedOptionsRef.current.add(quantity);

    const nextAttemptsForQuestion = attemptsForQuestion + 1;
    const nextTotalAttempts = totalAttempts + 1;
    setAttemptsForQuestion(nextAttemptsForQuestion);
    setTotalAttempts(nextTotalAttempts);

    if (quantity !== question.target) {
      setWrongOptions((items) => [...items, quantity]);
      setFeedback('💡 නැවත ගණන් කරලා බලමු!');
      playWrongSound();
      return;
    }

    answerLockedRef.current = true;
    const earnedStars = nextAttemptsForQuestion === 1 ? 3 : nextAttemptsForQuestion === 2 ? 2 : 1;
    const nextCorrect = correctAnswers + 1;
    const nextStars = stars + earnedStars;
    const finalResults = [...results, { targetNumber: question.target, correct: true, attempts: nextAttemptsForQuestion }];

    setIsLocked(true);
    setSelectedCorrect(quantity);
    setCorrectAnswers(nextCorrect);
    setStars(nextStars);
    setResults(finalResults);
    setFeedback('🎉 නියමයි! හරි පිළිතුර!');
    playCorrectSound();
    triggerDyscalculiaReward();

    nextQuestionTimeout.current = setTimeout(() => {
      const isLastQuestion = questionIndex + 1 >= TOTAL_QUESTIONS;
      if (isLastQuestion) {
        saveGameSession({
          gameId: 'number-matching',
          gameType: 'NumberMatchingGame',
          correct: nextCorrect > 0,
          correctCount: nextCorrect,
          wrongCount: nextTotalAttempts - nextCorrect,
          attempts: nextTotalAttempts,
          score: nextCorrect * 10,
          starsEarned: finalResults.reduce(
            (total, result) => total + (result.attempts === 1 ? 3 : result.attempts === 2 ? 2 : 1),
            0,
          ),
          unitResults: finalResults.map((result) => ({
            unitId: digitUnitId(result.targetNumber),
            starsEarned: result.attempts === 1 ? 3 : result.attempts === 2 ? 2 : 1,
            completed: true,
          })),
          completed: true,
          numberResults: finalResults,
        });
        const savedLevels = recordLevelResult('NumberMatchingGame', level, { score: nextCorrect * 10, correctAnswers: nextCorrect, totalQuestions: TOTAL_QUESTIONS });
        setLevels(savedLevels.levels);
        setDurationSeconds((Date.now() - startedAtRef.current) / 1000);
        setIsComplete(true);
        return;
      }

      answerLockedRef.current = false;
      attemptedOptionsRef.current.clear();
      setQuestionIndex((value) => value + 1);
      setQuestion(createQuestion(level, hardTargetOrderRef.current[questionIndex + 1]));
      setAttemptsForQuestion(0);
      setWrongOptions([]);
      setSelectedCorrect(null);
      setFeedback('');
      setIsLocked(false);
    }, 1200);
  };

  const restartGame = (nextLevel = level) => {
    const targetOrder = nextLevel === 'hard'
      ? shuffle(Array.from({ length: 10 }, (_, digit) => digit))
      : [];
    hardTargetOrderRef.current = targetOrder;
    setLevel(nextLevel);
    startedAtRef.current = Date.now();
    setDurationSeconds(null);
    answerLockedRef.current = false;
    attemptedOptionsRef.current.clear();
    clearTimeout(nextQuestionTimeout.current);
    setQuestionIndex(0);
    setCorrectAnswers(0);
    setTotalAttempts(0);
    setAttemptsForQuestion(0);
    setStars(0);
    setQuestion(createQuestion(nextLevel || 'easy', targetOrder[0]));
    setWrongOptions([]);
    setSelectedCorrect(null);
    setFeedback('');
    setIsLocked(false);
    setResults([]);
    setIsComplete(false);
  };

  const performanceMessage = correctAnswers >= 9
    ? '🌟 ඉතා හොඳයි! ඔබ අංක ගණන් කිරීමේ දක්ෂයෙක්!'
    : correctAnswers >= 6
      ? '👏 හොඳ වැඩක්! තව ටිකක් පුහුණු වෙමු!'
      : '💪 හොඳ උත්සාහයක්! නැවත සෙල්ලම් කරමු!';

  const startLevel = (nextLevel = level) => {
    stopIntro();
    setLevel(nextLevel);
    restartGame(nextLevel);
    setIsStarted(true);
  };

  const showLevelSelection = () => {
    clearTimeout(nextQuestionTimeout.current);
    setIsComplete(false);
    setIsStarted(false);
  };

  useGameInstructions(() => !isStarted ? replayIntro() : speakSinhala('අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න'));

  if (!isStarted) {
    return (
      <main className='nm-shell adventure-land station-octopus-cove'>
        <AdventureBackdrop station='octopus-cove' />
        <OceanAnimalFriends scene="matching" />
        <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='purple' />
        <section className='nm-panel nm-level-select'>
          <button
            type='button'
            className={`nm-intro-speaker ${isIntroPlaying ? 'is-playing' : ''}`}
            onClick={replayIntro}
            aria-label='හඬ නැවත අසන්න'
            title='හඬ නැවත අසන්න'
          >
            <span aria-hidden='true'>🔊</span>
            <span className='nm-intro-speaker-waves' aria-hidden='true'><i /><i /><i /></span>
          </button>
          {/* <p className='nm-kicker'>අංකයට ගැළපෙන ප්‍රමාණය</p> */}
          <h1 className='nm-level-title'>අංකයට ගැළපෙන රූප ප්‍රමාණය තෝරමු</h1>
          <p>එක් මට්ටමක් සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු.</p>
          <DifficultySelector
            levels={levels}
            selected={level}
            onSelect={startLevel}
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

  if (isComplete) {
    return (
      <main className='nm-shell adventure-land station-octopus-cove'>
        <AdventureBackdrop station='octopus-cove' />
        <OceanAnimalFriends scene="matching" />
        <DyscalculiaBackButton onClick={showLevelSelection} variant="purple" />
        <GameResultCard gameId="number-matching" correct={correctAnswers} total={TOTAL_QUESTIONS} stars={Math.min(3, Math.ceil(stars / TOTAL_QUESTIONS))} rewardStars={Math.min(3, Math.ceil(stars / TOTAL_QUESTIONS))}
          attempts={totalAttempts} wrongAnswers={totalAttempts - correctAnswers} durationSeconds={durationSeconds}
          message={performanceMessage} onRetry={() => restartGame()} onLevels={showLevelSelection} onJourney={() => navigate('/dyscalculia/dashboard')}
          onNext={nextUnlockedLevel(level, levels) ? () => startLevel(nextUnlockedLevel(level, levels)) : undefined} />
      </main>
    );
  }

  return (
    <main className='nm-shell nm-play-shell adventure-land station-octopus-cove'>
      <AdventureBackdrop station='octopus-cove' />
      <OceanAnimalFriends scene="matching" />
      <DyscalculiaBackButton onClick={showLevelSelection} variant='purple' />
      <section className='nm-panel'>
        {/* <GameHeader station='Octopus Counting Cove' title='අංකයට ගැළපෙන ප්‍රමාණය' subtitle='Number Matching' score={`${stars} • ${score}`} onBack={() => navigate('/dyscalculia')} backVariant='purple' /> */}
        <GameRoundProgress current={questionIndex + 1} total={TOTAL_QUESTIONS} correct={correctAnswers} />

        <section className='nm-question'>
          <p className='nm-instruction'>අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න</p>
          <button type='button' className='nm-sound' onClick={() => speakSinhala('අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න')} aria-label='උපදෙස් නැවත අසන්න'>🔊</button>
          <div className='nm-target-board' aria-label={`ඉලක්කම් අංකය ${question.target}`}>
            <img
              className='nm-target-board-animal'
              src={LEVEL_BOARD_ANIMALS[level]}
              alt=''
              aria-hidden='true'
            />
            <strong className='nm-target-board-number'>{question.target}</strong>
          </div>
        </section>

        <div className='nm-options' aria-label='ප්‍රමාණ තේරීම්'>
          {question.options.map((quantity) => {
            const isWrong = wrongOptions.includes(quantity);
            const isCorrect = selectedCorrect === quantity;
            return (
              <button
                key={quantity}
                type='button'
                className={`nm-option ${isWrong ? 'is-wrong' : ''} ${isCorrect ? 'is-correct' : ''}`}
                onClick={() => handleOptionSelect(quantity)}
                disabled={isLocked || isWrong}
                aria-label={`${quantity} ${question.object.name}`}
              >
                <span className='nm-object-count'>{Array.from({ length: quantity }, (_, index) => <span key={index} aria-hidden='true'>{question.object.icon}</span>)}</span>
              </button>
            );
          })}
        </div>

        <p className={`nm-feedback ${feedback.includes('🎉') ? 'is-success' : 'is-hint'}`} aria-live='polite'>{feedback}</p>
        <div className='nm-actions nm-game-actions'>
          <button className='nm-button nm-button-secondary' type='button' onClick={() => restartGame()}>↻ නැවත අරඹන්න</button>
        </div>
      </section>
    </main>
  );
};

export default NumberMatchingGame;
