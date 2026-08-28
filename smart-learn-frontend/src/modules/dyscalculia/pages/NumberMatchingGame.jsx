import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { saveGameSession } from '../utils/dyscalculiaProgress';
import { speakSinhala } from '../utils/audioGuide';
import { AdventureBackdrop, AdventureProgressBar, GameHeader, RewardStars } from '../components/NumberAdventureLand';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import DifficultySelector from '../components/DifficultySelector';
import { getGameLevels, recordLevelResult } from '../utils/gameLevelProgress';
import '../styles/number-matching-game.css';

const TOTAL_QUESTIONS = 10;
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

const createQuestion = (level) => {
  const difficulty = getDifficulty(level);
  const target = randomInt(difficulty.min, difficulty.max);
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
    const context = new AudioContext();
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

const NumberMatchingGame = () => {
  const navigate = useNavigate();
  const nextQuestionTimeout = useRef(null);
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
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => () => clearTimeout(nextQuestionTimeout.current), []);

  useEffect(() => {
    if (isStarted && !isComplete) speakSinhala('අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න');
  }, [question.id, isComplete, isStarted]);

  const score = correctAnswers * 10;

  const handleOptionSelect = (quantity) => {
    if (isLocked || wrongOptions.includes(quantity)) return;

    const nextAttemptsForQuestion = attemptsForQuestion + 1;
    const nextTotalAttempts = totalAttempts + 1;
    setAttemptsForQuestion(nextAttemptsForQuestion);
    setTotalAttempts(nextTotalAttempts);

    if (quantity !== question.target) {
      setWrongOptions((items) => [...items, quantity]);
      setFeedback('💡 නැවත ගණන් කරලා බලමු!');
      return;
    }

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

    nextQuestionTimeout.current = setTimeout(() => {
      const isLastQuestion = questionIndex + 1 >= TOTAL_QUESTIONS;
      if (isLastQuestion) {
        saveGameSession({
          gameType: 'NumberMatchingGame',
          correct: nextCorrect > 0,
          correctCount: nextCorrect,
          wrongCount: nextTotalAttempts - nextCorrect,
          attempts: nextTotalAttempts,
          score: nextCorrect * 10,
          starsEarned: nextStars,
          completed: true,
          numberResults: finalResults,
        });
        const savedLevels = recordLevelResult('NumberMatchingGame', level, { score: nextCorrect * 10, correctAnswers: nextCorrect, totalQuestions: TOTAL_QUESTIONS });
        setLevels(savedLevels.levels);
        setIsComplete(true);
        return;
      }

      setQuestionIndex((value) => value + 1);
      setQuestion(createQuestion(level));
      setAttemptsForQuestion(0);
      setWrongOptions([]);
      setSelectedCorrect(null);
      setFeedback('');
      setIsLocked(false);
    }, 1200);
  };

  const restartGame = () => {
    clearTimeout(nextQuestionTimeout.current);
    setQuestionIndex(0);
    setCorrectAnswers(0);
    setTotalAttempts(0);
    setAttemptsForQuestion(0);
    setStars(0);
    setQuestion(createQuestion(level || 'easy'));
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
    setLevel(nextLevel);
    restartGame();
    setQuestion(createQuestion(nextLevel));
    setIsStarted(true);
  };

  const showLevelSelection = () => {
    clearTimeout(nextQuestionTimeout.current);
    setIsComplete(false);
    setIsStarted(false);
  };

  if (!isStarted) {
    return (
      <main className='nm-shell adventure-land station-octopus-cove'>
        <AdventureBackdrop station='octopus-cove' message='ඔබගේ ගණන් කිරීමේ මට්ටම තෝරමු! 🐙' />
        <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='purple' />
        <section className='nm-panel nm-level-select'>
          <div className='nm-level-icon' aria-hidden='true'>🐙</div>
          <p className='nm-kicker'>අංකයට ගැළපෙන ප්‍රමාණය</p>
          <h1>ඔබගේ මට්ටම තෝරන්න</h1>
          <p>එක් මට්ටමක් සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු.</p>
          <DifficultySelector levels={levels} selected={level} onSelect={setLevel} language='si' />
          <button className='nm-button nm-button-primary' type='button' onClick={() => startLevel(level)}>මට්ටම අරඹන්න →</button>
        </section>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className='nm-shell adventure-land station-octopus-cove'>
        <AdventureBackdrop station='octopus-cove' message='Octopus Counting Cove එකේ වෙරළ තරු ගණන් කරමු! 🐙' />
        <section className='nm-panel nm-results'>
          <div className='nm-trophy' aria-hidden='true'>🏆</div>
          <p className='nm-kicker'>මට්ටම සම්පූර්ණයි</p>
          <h1>ඔබ හොඳින් කළා!</h1>
          <p className='nm-result-message'>{performanceMessage}</p>
          <div className='nm-result-stats'>
            <div><strong>{score}</strong><span>මුළු ලකුණු</span></div>
            <div><strong>{correctAnswers}/{TOTAL_QUESTIONS}</strong><span>නිවැරදි පිළිතුරු</span></div>
            <div><strong>{totalAttempts}</strong><span>මුළු උත්සාහයන්</span></div>
            <div><strong>⭐ {stars}</strong><span>ලැබුණු තරු</span><RewardStars count={Math.min(3, Math.ceil(stars / TOTAL_QUESTIONS))} /></div>
          </div>
          <div className='nm-actions'>
            <button className='nm-button nm-button-secondary' type='button' onClick={showLevelSelection}>මට්ටම් තෝරන්න</button>
            <button className='nm-button nm-button-primary' type='button' onClick={restartGame}>නැවත ක්‍රීඩා කරන්න</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className='nm-shell adventure-land station-octopus-cove'>
      <AdventureBackdrop station='octopus-cove' message='අංකයට ගැළපෙන වෙරළ ප්‍රමාණය ගණන් කරමු! 🐙' />
      <section className='nm-panel'>
        <GameHeader station='Octopus Counting Cove' title='අංකයට ගැළපෙන ප්‍රමාණය' subtitle='Number Matching' score={`${stars} • ${score}`} onBack={() => navigate('/dyscalculia')} backVariant='purple' />
        <div className='nm-progress-meta'>
          <span>ප්‍රශ්නය {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
          <span>{level === 'easy' ? 'පහසු' : level === 'medium' ? 'මධ්‍යම' : 'අමාරු'} මට්ටම</span>
          <span>✓ {correctAnswers}</span>
          <span>↻ {totalAttempts}</span>
        </div>
        <AdventureProgressBar value={((questionIndex + 1) / TOTAL_QUESTIONS) * 100} label={`Adventure progress: ${questionIndex + 1} / ${TOTAL_QUESTIONS}`} />

        <section className='nm-question'>
          <p className='nm-instruction'>අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න</p>
          <button type='button' className='nm-sound' onClick={() => speakSinhala('අංකයට ගැළපෙන ප්‍රමාණය තෝරන්න')} aria-label='උපදෙස් නැවත අසන්න'>🔊</button>
          <div className='nm-target' aria-label={`ඉලක්කම් අංකය ${question.target}`}>{question.target}</div>
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
                <span className='nm-object-count'>{quantity === 0 ? '0' : question.object.icon.repeat(quantity)}</span>
              </button>
            );
          })}
        </div>

        <p className={`nm-feedback ${feedback.includes('🎉') ? 'is-success' : 'is-hint'}`} aria-live='polite'>{feedback}</p>
        <div className='nm-actions nm-game-actions'>
          <button className='nm-button nm-button-secondary' type='button' onClick={restartGame}>↻ නැවත අරඹන්න</button>
        </div>
      </section>
    </main>
  );
};

export default NumberMatchingGame;
