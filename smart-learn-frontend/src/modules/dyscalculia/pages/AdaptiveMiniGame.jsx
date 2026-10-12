import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import crabTreasureBeach from '../../../assets/images/dyscalculia-backgrounds/crab-treasure-beach.png';
import octopusCountingCove from '../../../assets/images/dyscalculia-backgrounds/octopus-counting-cove.png';
import shellTracingShore from '../../../assets/images/dyscalculia-backgrounds/shell-tracing-shore.png';
import tropicalFishSchool from '../../../assets/images/dyscalculia-backgrounds/tropical-fish-school.png';
import '../styles/adaptive-mini-games.css';

const GAME_CONFIGS = {
  'number-find': {
    gameType: 'AdaptiveNumberFindGame',
    title: 'අලුත් අංක සෙවීම',
    subtitle: 'දෙන අංකය ඉක්මනින් සොයා තෝරන්න.',
    prompt: (target) => `අංක ${target} සොයන්න`,
    icon: '🔎',
    background: shellTracingShore,
  },
  'count-match': {
    gameType: 'AdaptiveCountMatchGame',
    title: 'අලුත් ගණන් ගැළපීම',
    subtitle: 'පෙන්වන ප්‍රමාණයට ගැළපෙන අංකය තෝරන්න.',
    prompt: (target) => `වස්තු ${target}ක් තියෙන අංකය තෝරන්න`,
    icon: '🧮',
    background: octopusCountingCove,
  },
  'number-order': {
    gameType: 'AdaptiveNumberOrderGame',
    title: 'අලුත් අංක පෙළ',
    subtitle: 'හිස් තැනට එන ඊළඟ අංකය තෝරන්න.',
    prompt: (target) => {
      if (target === 0) return '?, 1, 2';
      if (target === 1) return '0, ?, 2';
      return `${target - 2}, ${target - 1}, ?`;
    },
    icon: '➡️',
    background: tropicalFishSchool,
  },
  'quick-compare': {
    gameType: 'AdaptiveQuickCompareGame',
    title: 'අලුත් ඉක්මන් තේරීම',
    subtitle: 'ලොකු අංකය හෝ නිවැරදි අංකය ඉක්මනින් හඳුනාගන්න.',
    prompt: (target) => `අංක ${target} ට ගැළපෙන පිළිතුර තෝරන්න`,
    icon: '⚡',
    background: crabTreasureBeach,
  },
};

const clampDigit = (value) => {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(9, Math.max(0, number)) : 1;
};
const DIGIT_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const buildOptions = (target, gameKey) => {
  const fillOptions = (values) => {
    const optionSet = new Set(values);
    DIGIT_VALUES.some((digit) => {
      optionSet.add(digit);
      return optionSet.size >= 4;
    });
    return shuffle([...optionSet].slice(0, 4));
  };

  if (gameKey === 'quick-compare') {
    const other = target >= 8 ? target - 2 : target + 2;
    return fillOptions([target, other, Math.max(0, target - 1), Math.min(9, target + 1)]);
  }

  return fillOptions([
    target,
    Math.max(0, target - 1),
    Math.min(9, target + 1),
    target >= 5 ? target - 3 : target + 3,
  ]);
};

const AdaptiveMiniGame = () => {
  const navigate = useNavigate();
  const { gameKey = 'number-find' } = useParams();
  const [searchParams] = useSearchParams();
  const config = GAME_CONFIGS[gameKey] || GAME_CONFIGS['number-find'];
  const target = clampDigit(searchParams.get('target'));
  const [questionIndex, setQuestionIndex] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [questionSeed, setQuestionSeed] = useState(0);
  const options = useMemo(() => buildOptions(target, gameKey), [target, gameKey, questionSeed]);
  const objectCount = gameKey === 'count-match' ? Array.from({ length: target }) : [];

  const completeGame = (nextCorrect, nextAttempts) => {
    const accuracy = Math.round((nextCorrect / 5) * 100);
    saveGameSession({
      gameType: config.gameType,
      targetNumber: target,
      attempts: nextAttempts,
      correctCount: nextCorrect,
      wrongCount: Math.max(0, nextAttempts - nextCorrect),
      totalQuestions: 5,
      accuracy,
      score: nextCorrect * 10,
      starsEarned: Math.max(1, Math.ceil(accuracy / 34)),
      completed: true,
    });
    setIsComplete(true);
  };

  const choose = (value) => {
    if (isComplete) return;
    const isCorrect = value === target;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    const nextAttempts = attempts + 1;
    setCorrect(nextCorrect);
    setAttempts(nextAttempts);
    setFeedback(isCorrect ? 'හරි! තවත් එකක් කරමු.' : 'තව ටිකක් බලලා තෝරමු.');
    if (isCorrect) triggerDyscalculiaReward();

    if (questionIndex >= 5) {
      completeGame(nextCorrect, nextAttempts);
      return;
    }

    setTimeout(() => {
      setQuestionIndex((value) => value + 1);
      setQuestionSeed((value) => value + 1);
      setFeedback('');
    }, 650);
  };

  return (
    <main
      className="adaptive-mini-shell adventure-land"
      style={{ '--adaptive-mini-bg-image': `linear-gradient(180deg, rgba(211,247,255,.24), rgba(255,233,177,.34)), url(${config.background})` }}
    >
      <AdventureBackdrop station="progress-garden" message="අලුත් adaptive ක්‍රීඩාවක් පටන් ගමු!" />
      <OceanAnimalFriends scene="tracing" />
      <DyscalculiaBackButton to="/dyscalculia/dashboard" variant="aqua" />
      <section className="adaptive-mini-card">
        <p className="adaptive-mini-kicker">ADAPTIVE GAME</p>
        <h1><span>{config.icon}</span>{config.title}</h1>
        <p>{config.subtitle}</p>

        <div className="adaptive-mini-status">
          <strong>{questionIndex}/5</strong>
          <span>{correct} නිවැරදි</span>
        </div>

        {isComplete ? (
          <div className="adaptive-mini-result">
            <h2>හොඳයි!</h2>
            <p>{correct}/5 නිවැරදි පිළිතුරු.</p>
            <button type="button" onClick={() => navigate('/dyscalculia/dashboard')}>Dashboard එකට</button>
            <button type="button" onClick={() => window.location.reload()}>නැවත කරන්න</button>
          </div>
        ) : (
          <>
            <div className="adaptive-mini-question">
              {gameKey === 'count-match' && <div className="adaptive-mini-objects">{objectCount.map((_, index) => <span key={index}>●</span>)}</div>}
              <strong>{config.prompt(target)}</strong>
            </div>

            <div className="adaptive-mini-options">
              {options.map((option) => (
                <button type="button" key={option} onClick={() => choose(option)}>
                  {option}
                </button>
              ))}
            </div>
            {feedback && <p className="adaptive-mini-feedback">{feedback}</p>}
          </>
        )}
      </section>
    </main>
  );
};

export default AdaptiveMiniGame;
