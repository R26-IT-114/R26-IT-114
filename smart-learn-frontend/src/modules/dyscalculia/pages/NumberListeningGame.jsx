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
  const lastTargetRef = useRef(null);
  const speakNowRef = useRef(() => {});

  const createQuestion = useCallback((selectedLevel) => {
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
  }, [createQuestion]);

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
    if (isCorrect === true || !target) return;
    const correct = digit === target.digit;
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

  const loadNextQuestion = () => {
    if (isCorrect !== true) return;
    if (questionNumber === LISTENING_QUESTIONS_PER_LEVEL) {
      finishLevel(correctAnswers, wrongAnswers, totalAttempts);
      return;
    }
    setQuestionNumber((value) => value + 1);
    createQuestion(level);
  };

  const showLevels = () => {
    setLevels(getGameLevels('NumberListeningGame'));
    setPhase('levels');
  };

  if (phase === 'levels') {
    return (
      <main className="sorting-shell sorting-level-shell listening-level-shell adventure-land station-whale-cove">
        <AdventureBackdrop station="whale-song-cove" message="ඔබට ගැළපෙන මට්ටම තෝරමු! 🐋" />
        <OceanAnimalFriends scene="listening" />
        <section className="sorting-card sorting-level-card">
          <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant="turquoise" />
          <p className="sorting-level-kicker">අංකයට සවන් දෙමු</p>
          <h1>ඔබගේ මට්ටම තෝරන්න</h1>
          <p className="sorting-level-copy">එක් මට්ටමක් සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු.</p>
          <div className="sorting-level-picker">
            <DifficultySelector
              levels={levels}
              selected={level}
              onSelect={startLevel}
              language="si"
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
      <AdventureBackdrop station='whale-song-cove' message='Whale Song Cove එකේ අංකයට සවන් දෙමු! 🐋' />
      <ListeningSeaLife />
      <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='ocean' />

      {phase === 'playing' && target && (
        <section className="lrg-stage nlg-game-stage">
          <div className="lrg-round-card">
            <div className="nlg-session-heading">
              <div className="lrg-round-badge">🎧 {level.charAt(0).toUpperCase() + level.slice(1)}</div>
              <strong>Question {questionNumber} / {LISTENING_QUESTIONS_PER_LEVEL}</strong>
            </div>
            <div className="nlg-question-progress" aria-label={`Question ${questionNumber} of 8`}>
              <span style={{ width: `${(questionNumber / LISTENING_QUESTIONS_PER_LEVEL) * 100}%` }} />
            </div>
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
                  <button key={digit} type="button" className={cardClass} onClick={() => handlePick(digit)} disabled={isCorrect === true} aria-label={`Choose ${digit}`}>
                    {digit}
                  </button>
                );
              })}
            </div>
            <div className="nlg-feedback-slot" aria-live="polite">
              {isCorrect === true && <div className="lrg-eval-correct">🎉 හරි! ඉතා හොඳයි!</div>}
              {isCorrect === false && <div className="lrg-eval-wrong">🐚 නැවත සවන් දී උත්සාහ කරන්න</div>}
              {isCorrect === true && <div className="dnl-actions">
                <button type="button" className="lrg-btn lrg-btn-next" onClick={loadNextQuestion}>
                  {questionNumber === LISTENING_QUESTIONS_PER_LEVEL ? 'ප්‍රතිඵල බලමු' : 'ඊළඟ'} ➜
                </button>
              </div>}
            </div>
          </div>
        </section>
      )}

      {phase === 'result' && result && (
        <section className="lrg-stage nlg-game-stage">
          <div className="lrg-complete-card nlg-result-card">
            <span className="nlg-result-wave">🌊</span>
            <h1>{level.charAt(0).toUpperCase() + level.slice(1)} Level Complete!</h1>
            <h2>🎧 Listening Accuracy</h2>
            <strong className="nlg-result-score">{result.correct} / 8 Correct</strong>
            <strong className="nlg-result-accuracy">{result.accuracy}%</strong>
            <div className="nlg-result-stars" aria-label={`${result.stars} reward stars`}>{'⭐'.repeat(result.stars)}</div>
            <p>{result.passed ? '🎉 හොඳයි! ඊළඟ මට්ටම විවෘතයි.' : '🐚 නැවත පුහුණු වෙමු. 6 / 8 ලබා ගන්න!'}</p>
            <div className="nlg-result-details">
              <span>Wrong attempts: {result.wrong}</span>
              <span>Total attempts: {result.attempts}</span>
              <span>Time: {Math.max(1, Math.round(result.timeSpent / 1000))}s</span>
            </div>
            <div className="dnl-actions nlg-result-actions">
              <button type="button" className="lrg-btn lrg-btn-clear" onClick={() => startLevel(level)}>🔄 Play Again</button>
              <button type="button" className="lrg-btn lrg-btn-next" onClick={showLevels}>🗺️ Levels</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default NumberListeningGame;
