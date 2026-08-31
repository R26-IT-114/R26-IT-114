import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import '../styles/dyscalculia-cartoon.css';
import '../styles/dyscalculia-sorting-game.css';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PartyIcon, StarIcon } from '../components/DyscalculiaIcons';
import { AdventureBackdrop as BaseAdventureBackdrop } from '../components/NumberAdventureLand';
import OceanAnimalFriends from '../components/OceanAnimalFriends';
import DifficultySelector from '../components/DifficultySelector';
import { getGameLevels, recordLevelResult } from '../utils/gameLevelProgress';
import { triggerDyscalculiaReward } from '../components/DyscalculiaRewardBurst';
import easyFishBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/easy-fish-board.webp';
import mediumSeahorseBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/medium-seahorse-board.webp';
import hardOctopusBoard from '../../../assets/images/dyscalculiaimages/level-board-animals/hard-octopus-board.webp';
import sortingIntroAudio from '../../../assets/audio/dyscalculia/G03.wav';

const difficulties = [
  { key: 'easy', label: 'Easy', min: 0, max: 9, count: 3 },
  { key: 'medium', label: 'Medium', min: 1, max: 8, count: 5 },
  { key: 'hard', label: 'Hard', min: 0, max: 9, count: 8 },
];

const AdventureBackdrop = (props) => <><BaseAdventureBackdrop {...props} /><OceanAnimalFriends scene="sorting" /></>;
const shuffle = (values) => { const result = [...values]; for (let i = result.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; };
const buildCards = (numbers) => numbers.map((number) => ({ id: `card-${number}`, number }));
const isInTargetOrder = (cards, target) => cards.every((card, index) => card.number === target[index]);
const makeQuestion = ({ min, max, count }) => {
  const target = shuffle(Array.from({ length: max - min + 1 }, (_, i) => i + min)).slice(0, count).sort((a, b) => a - b);
  let order = shuffle(buildCards(target));
  for (let attempt = 0; attempt < 6 && isInTargetOrder(order, target); attempt += 1) order = shuffle(order);
  if (isInTargetOrder(order, target)) order = [...order].reverse();
  return { target, order };
};
function SortableItem({ card, index, count, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 30 : undefined,
  };

  return <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onSelect(card.id)} className={`sorting-card-tile ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`} role="button" tabIndex={0} aria-pressed={isSelected} aria-label={`ස්ථානය ${index + 1} / ${count}: ${card.number}`}>{card.number}</div>;
}

const SORTING_INTRO_PLAYED_KEY = 'smartlearn:number-sorting:intro-played';
let sortingIntroPlayedInSession = false;

const hasSortingIntroPlayed = () => {
  if (sortingIntroPlayedInSession) return true;
  try {
    return sessionStorage.getItem(SORTING_INTRO_PLAYED_KEY) === 'true';
  } catch {
    return false;
  }
};

const markSortingIntroPlayed = () => {
  sortingIntroPlayedInSession = true;
  try {
    sessionStorage.setItem(SORTING_INTRO_PLAYED_KEY, 'true');
  } catch {
    // The in-memory flag still prevents repeated autoplay in this session.
  }
};

const NumberSortingGame = () => {
  const navigate = useNavigate();
  const introAudioRef = useRef(null);
  const pendingIntroInteractionRef = useRef(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [levels, setLevels] = useState(() => getGameLevels('NumberSortingGame'));
  const [phase, setPhase] = useState('levels');
  const [question, setQuestion] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [target, setTarget] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [feedback, setFeedback] = useState('කාඩ්පත් නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.');
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const audio = new Audio(sortingIntroAudio);
    audio.preload = 'auto';
    introAudioRef.current = audio;
    let autoplayTimer = null;

    const handlePlay = () => setIsIntroPlaying(true);
    const handleStop = () => setIsIntroPlaying(false);
    const playAfterInteraction = () => {
      pendingIntroInteractionRef.current = null;
      audio.play().then(markSortingIntroPlayed).catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handleStop);
    audio.addEventListener('ended', handleStop);

    if (!hasSortingIntroPlayed()) {
      autoplayTimer = window.setTimeout(() => {
        if (introAudioRef.current !== audio) return;

        audio.play().then(markSortingIntroPlayed).catch(() => {
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
    audio.play().then(markSortingIntroPlayed).catch(() => {});
  };

  const stopIntro = () => {
    const pendingInteraction = pendingIntroInteractionRef.current;
    if (pendingInteraction) {
      document.removeEventListener('pointerdown', pendingInteraction);
      pendingIntroInteractionRef.current = null;
    }

    const audio = introAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const current = difficulties.find((item) => item.key === difficulty) || difficulties[0];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const newQuestion = useCallback(() => { const next = makeQuestion(current); setTarget(next.target); setOrder(next.order); setSelectedCardId(null); setChecked(false); setFeedback('කාඩ්පත් නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.'); }, [current]);
  const startSession = (selectedDifficulty = difficulty) => {
    stopIntro();
    const selected = difficulties.find((item) => item.key === selectedDifficulty) || difficulties[0];
    const next = makeQuestion(selected);
    setDifficulty(selected.key);
    setPhase('playing');
    setQuestion(1);
    setCorrectAnswers(0);
    setWrongAttempts(0);
    setTotalAttempts(0);
    setScore(0);
    setStartedAt(Date.now());
    setTarget(next.target);
    setOrder(next.order);
    setSelectedCardId(null);
    setChecked(false);
    setFeedback('කාඩ්පත් නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.');
  };
  const checkOrder = () => {
    if (checked || phase !== 'playing') return;
    const isCorrect = isInTargetOrder(order, target);
    setTotalAttempts((value) => value + 1);
    if (!isCorrect) { setWrongAttempts((value) => value + 1); setFeedback('තව ටිකක් උත්සාහ කරන්න!'); return; }
    setChecked(true); setCorrectAnswers((value) => value + 1); setScore((value) => value + 10); setFeedback('හොඳයි! නිවැරදි අනුපිළිවෙලයි.'); triggerDyscalculiaReward();
    if (question >= 8) {
      const finalCorrect = correctAnswers + 1; const finalAttempts = totalAttempts + 1; const accuracy = Math.round((finalCorrect / 8) * 1000) / 10; const seconds = Math.round((Date.now() - startedAt) / 1000); const stars = Math.max(1, Math.min(3, Math.ceil(accuracy / 34)));
      const result = recordLevelResult('NumberSortingGame', difficulty, { correctAnswers: finalCorrect, totalQuestions: 8, score: score + 10, accuracy, wrongAttempts, totalAttempts: finalAttempts, timeSpent: seconds, starsEarned: stars });
      saveGameSession({ gameType: 'NumberSortingGame', level: difficulty, correctAnswers: finalCorrect, wrongCount: wrongAttempts, attempts: finalAttempts, totalQuestions: 8, accuracy, score: score + 10, timeSpent: seconds, starsEarned: stars, completed: result.passed });
      setLevels(result.levels); setPhase('result');
    } else setTimeout(() => { setQuestion((value) => value + 1); newQuestion(); }, 550);
  };
  const onDragEnd = ({ active, over }) => {
    setSelectedCardId(null);
    if (!over || active.id === over.id || checked) return;
    setOrder((values) => {
      const oldIndex = values.findIndex((card) => card.id === active.id);
      const newIndex = values.findIndex((card) => card.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return values;
      return arrayMove(values, oldIndex, newIndex);
    });
  };
  const onCardSelect = (cardId) => {
    if (checked) return;
    if (!selectedCardId) {
      setSelectedCardId(cardId);
      return;
    }
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
      return;
    }
    setOrder((cards) => {
      const firstIndex = cards.findIndex((card) => card.id === selectedCardId);
      const secondIndex = cards.findIndex((card) => card.id === cardId);
      if (firstIndex < 0 || secondIndex < 0) return cards;
      const nextCards = [...cards];
      [nextCards[firstIndex], nextCards[secondIndex]] = [nextCards[secondIndex], nextCards[firstIndex]];
      return nextCards;
    });
    setSelectedCardId(null);
  };
  const accuracy = Math.round((correctAnswers / 8) * 1000) / 10;

  if (phase === 'levels') {
    return (
      <main className="sorting-shell sorting-level-shell adventure-land station-fish-school">
        <AdventureBackdrop station="tropical-fish-school" message="ඔබට ගැළපෙන මට්ටම තෝරමු! 🐠" />
        <section className="sorting-card sorting-level-card">
          <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant="turquoise" />
          <button
            type="button"
            className={`sorting-intro-speaker ${isIntroPlaying ? 'is-playing' : ''}`}
            onClick={replayIntro}
            aria-label="හඬ නැවත අසන්න"
            title="හඬ නැවත අසන්න"
          >
            <span aria-hidden="true">🔊</span>
            <span className="sorting-intro-speaker-waves" aria-hidden="true"><i /><i /><i /></span>
          </button>
          <p className="sorting-level-kicker">⭐ ✨ 🌟 ⭐ ✨ 🌟 ⭐</p>
          <h1>අංක අනුපිළිවෙල</h1>
          <p className="sorting-level-copy">එක් මට්ටමක් සම්පූර්ණ කර ඊළඟ මට්ටම විවෘත කරමු.</p>
          <div className="sorting-level-picker">
            <DifficultySelector
              levels={levels}
              selected={difficulty}
              onSelect={startSession}
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
    <main className="sorting-shell adventure-land station-fish-school">
      <AdventureBackdrop station="tropical-fish-school" message="Tropical Fish School එකේ අංක පිළිවෙලට සකසමු! 🐠" />
      <section className="sorting-card">
        <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant="turquoise" />
        <div className="sorting-topbar">
          <div>
            <h1>අංක අනුපිළිවෙල ක්‍රීඩාව</h1>
            <p>අංක නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.</p>
          </div>
          <div className="sorting-meta">ප්‍රශ්නය {phase === 'result' ? 8 : question} / 8</div>
        </div>

        {phase === 'playing' ? (
          <>
            <div className="sorting-instructions">අමාරුමට්ටම: {current.label} • {current.count} කාඩ්පත්<br /><span>කාඩ්පත් ඇදලා තබන්න, නැත්නම් cards දෙකක් tap කර swap කරන්න.</span></div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
              onDragStart={() => setSelectedCardId(null)}
            >
              <SortableContext items={order.map((card) => card.id)} strategy={rectSortingStrategy}>
                <div className={`sorting-board sorting-board--count-${current.count}`}>
                  {order.map((card, index) => <SortableItem key={card.id} card={card} index={index} count={current.count} isSelected={selectedCardId === card.id} onSelect={onCardSelect} />)}
                </div>
              </SortableContext>
            </DndContext>
            <div className="sorting-feedback-row">
              <span className={`sorting-feedback ${checked ? 'success' : 'hint'}`}>{feedback}</span>
              <div className="sorting-actions">
                <button type="button" className="sorting-button" onClick={() => setOrder(shuffle(order))}>කලවම් කරන්න</button>
                <button type="button" className="sorting-button sorting-button--primary" onClick={checkOrder}>පරීක්ෂා කරන්න</button>
              </div>
            </div>
          </>
        ) : (
          <div className="sorting-celebration">
            <div className="sorting-celebration-line"><PartyIcon size={28} /> {levels[difficulty]?.completed ? `${current.label} Level Complete!` : 'තව ටිකක් පුහුණු වෙමු!'}</div>
            <p>{correctAnswers} / 8 Correct</p>
            <p>🎯 Accuracy: {accuracy}%</p>
            <p>Attempts: {totalAttempts}</p>
            <div className="star-rating">{[0, 1, 2].map((i) => <span key={i} className={`star ${i < Math.max(1, Math.min(3, Math.ceil(accuracy / 34))) ? 'earned' : ''}`}><StarIcon size={22} /></span>)}</div>
            <div className="celebration-buttons">
              <button type="button" className="sorting-button sorting-button--glow" onClick={() => startSession(difficulty)}>🔄 Play Again</button>
              <button type="button" className="sorting-button sorting-button--secondary" onClick={() => setPhase('levels')}>➡️ Levels</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
export default NumberSortingGame;
