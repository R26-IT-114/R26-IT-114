import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import BackButton from '../../../components/common/BackButton';
import '../styles/dyscalculia-cartoon.css';
import '../styles/dyscalculia-sorting-game.css';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import homeCharacterLeft from '../../../assets/images/dyscaculiaimages/Buzz Lightyear 01.png';
import homeCharacterRight from '../../../assets/images/dyscaculiaimages/Piglet 03.png';
import homeDecoration from '../../../assets/images/dyscaculiaimages/Character WALL 02.svg';
import homeDecoration2 from '../../../assets/images/dyscaculiaimages/scooby-doo-0.svg';
import homeExtraCharacter from '../../../assets/images/dyscaculiaimages/Tigger Pooh 01.svg';

// Additional carnival assets
import carnivalBalloon from '../../../assets/images/dyscaculiaimages/Genie Aladdin 01.png';
import carnivalLight from '../../../assets/images/dyscaculiaimages/scooby-doo-1.svg';
import carnivalMascot from '../../../assets/images/dyscaculiaimages/Winnie The Pooh 01.png';


function SortableItem({ id, number, className, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: itemIsDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: itemIsDragging ? 'none' : transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${className} ${itemIsDragging ? 'dragging' : ''}`}
      {...props}
    >
      {number}
    </div>
  );
}

const difficulties = [
  {
    key: 'easy',
    label: 'සාමාන්‍ය',
    min: 1,
    max: 5,
    count: 4,
  },
  {
    key: 'medium',
    label: 'මධ්‍යම',
    min: 1,
    max: 8,
    count: 5,
  },
  {
    key: 'hard',
    label: 'අභියෝගකාරී',
    min: 0,
    max: 9,
    count: 6,
  },
];

const STAR_COLORS = ['#ffffff', '#ffe4b5', '#add8e6', '#ffcccb', '#b0e0e6', '#fff176', '#e0b0ff'];

const StarField = () => (
  <div className="dg-stars-layer" aria-hidden="true">
    {Array.from({ length: 120 }, (_, i) => {
      const top = `${Math.random() * 96}%`;
      const left = `${Math.random() * 100}%`;
      const size = Math.random() * 3 + 0.5;
      const duration = `${(Math.random() * 4 + 2).toFixed(1)}s`;
      const delay = `${-(Math.random() * 7).toFixed(1)}s`;
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      const type = i % 7 === 0 ? 'dg-star-pulse' : i % 3 === 0 ? 'dg-star-color' : 'dg-star-dot';

      return (
        <span
          key={i}
          className={type}
          style={{
            top,
            left,
            width: `${size}px`,
            height: `${size}px`,
            '--dur': duration,
            '--delay': delay,
            ...(type !== 'dg-star-dot' ? { '--c': color } : {}),
          }}
        />
      );
    })}
  </div>
);

const shuffleArray = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const pickNumbers = (min, max, count) => {
  const pool = [];
  for (let i = min; i <= max; i += 1) {
    pool.push(i);
  }
  return shuffleArray(pool).slice(0, count).sort((a, b) => a - b);
};

const playHappySound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.12;

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
    setTimeout(() => context.close(), 250);
  } catch (error) {
    const utterance = new SpeechSynthesisUtterance('හොඳයි');
    utterance.lang = 'si-LK';
    speechSynthesis.speak(utterance);
  }
};

const playCarnivalRewardSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();

    // Create a festive melody
    const notes = [523, 659, 784, 1047]; // C, E, G, C (higher octave)
    let noteIndex = 0;

    const playNote = () => {
      if (noteIndex >= notes.length) {
        context.close();
        return;
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = notes[noteIndex];
      gain.gain.value = 0.15;

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.15);

      noteIndex++;
      setTimeout(playNote, 120);
    };

    playNote();
  } catch (error) {
    const utterance = new SpeechSynthesisUtterance('ජය වේවා!');
    utterance.lang = 'si-LK';
    speechSynthesis.speak(utterance);
  }
};

const NumberSortingGame = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [cardOrder, setCardOrder] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState('Drag the cards into the right order.');
  const [showConfetti, setShowConfetti] = useState(false);
  const [round, setRound] = useState(1);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [bigConfetti, setBigConfetti] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentDifficulty = difficulties.find((item) => item.key === difficulty);

  const initializeRound = useCallback(() => {
    const numbers = pickNumbers(currentDifficulty.min, currentDifficulty.max, currentDifficulty.count);
    setTargetNumbers(numbers);
    setCardOrder(shuffleArray(numbers));
    setIsSuccess(false);
    setFeedback('Drag the cards into the right order.');
    setShowConfetti(false);
    setShowReward(false);
    setBigConfetti(false);
    setRoundStartTime(Date.now());
    setAttempts(0);
  }, [currentDifficulty]);

  useEffect(() => {
    initializeRound();
  }, [initializeRound]);

  const evaluateOrder = useCallback(
    (nextOrder) => {
      if (!nextOrder?.length || !targetNumbers?.length || isSuccess) return;

      const correct = nextOrder.every((value, index) => value === targetNumbers[index]);

      if (correct) {
        const responseTime = Date.now() - roundStartTime;
        const newAttempts = attempts + 1;

        // Calculate stars based on attempts and time
        let stars = 1; // Minimum 1 star
        if (newAttempts === 1 && responseTime < 10000) stars = 3; // Perfect first try, fast
        else if (newAttempts <= 2 && responseTime < 15000) stars = 2; // Good performance
        else if (newAttempts <= 3) stars = 1; // Okay performance

        setStarsEarned(stars);
        setShowReward(true);
        setBigConfetti(true);

        // Save game session data
        saveGameSession({
          gameType: 'NumberSortingGame',
          playedAt: new Date().toISOString(),
          targetNumber: targetNumbers.join(''),
          correct,
          attempts: newAttempts,
          responseTime,
          score: stars * 10,
          completed: true,
        });

        setIsSuccess(true);
        setFeedback('හොඳයි!');
        setShowConfetti(true);
        playCarnivalRewardSound();
        setTimeout(() => setShowConfetti(false), 3000);
        setTimeout(() => setBigConfetti(false), 4000);
      } else {
        setAttempts((prev) => prev + 1);
        setIsSuccess(false);
        setFeedback('නැවත උත්සාහ කරන්න.');
      }
    },
    [attempts, isSuccess, roundStartTime, targetNumbers]
  );

  useEffect(() => {
    if (cardOrder.length > 0) {
      evaluateOrder(cardOrder);
    }
  }, [cardOrder, evaluateOrder]);


  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleShuffle = () => {
    setCardOrder(shuffleArray(cardOrder));
    setIsSuccess(false);
    setFeedback('Cards shuffled. Try again!');
  };

  const handleNewRound = () => {
    setRound((prev) => prev + 1);
    initializeRound();
  };

  const handleDifficultyChange = (key) => {
    setDifficulty(key);
  };

  return (
    <main className="sorting-shell">
      <StarField />
      <img className="dc-deco dc-deco--wall dc-wiggle" src={homeDecoration} alt="" aria-hidden="true" />
      <img className="dc-deco dc-deco--extra dc-soft-pop" src={homeDecoration2} alt="" aria-hidden="true" />
      <img className="dc-character dc-character--home-left dc-float" src={homeCharacterLeft} alt="" aria-hidden="true" />
      <img className="dc-character dc-character--home-right dc-bounce" src={homeCharacterRight} alt="" aria-hidden="true" />
      <img className="dc-character dc-character--home-extra dc-sparkle" src={homeExtraCharacter} alt="" aria-hidden="true" />

      {/* Additional Carnival Elements */}
      <img className="carnival-balloon carnival-float-1" src={carnivalBalloon} alt="" aria-hidden="true" />
      <img className="carnival-light carnival-glow-1" src={carnivalLight} alt="" aria-hidden="true" />
      <img className="carnival-mascot carnival-bounce-slow" src={carnivalMascot} alt="" aria-hidden="true" />
      <div className="carnival-sparkles" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${10 + i * 10}%`,
            animationDelay: `${i * 0.3}s`
          }} />
        ))}
      </div>

      <section className="sorting-card">
        <BackButton />

        <div className="sorting-topbar">
          <div>
            <h1>Number Sorting Game</h1>
            <p>Drag the numbers into the correct order.</p>
          </div>
          <div className="sorting-meta">Round {round}</div>
        </div>

        <div className="sorting-difficulty">
          {difficulties.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sorting-difficulty-btn ${difficulty === item.key ? 'active' : ''}`}
              onClick={() => handleDifficultyChange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="sorting-instructions">
          <span>Difficulty:</span> {currentDifficulty.label} • Use drag and drop to sort the cards.
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
            <div className="sorting-board">
              {cardOrder.map((number, index) => {
                const correct = number === targetNumbers[index];
                return (
                  <SortableItem
                    key={`${number}-${index}`}
                    id={number}
                    number={number}
                    isDragging={false}
                    className={`sorting-card-tile ${correct ? 'correct' : ''} ${isSuccess ? 'sorted' : ''}`}
                    aria-label={`Number card ${number}`}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <div className="sorting-feedback-row">
          <span className={`sorting-feedback ${isSuccess ? 'success' : 'hint'}`}>{feedback}</span>
          <div className="sorting-actions">
            <button type="button" className="sorting-button" onClick={handleShuffle}>
              Shuffle
            </button>
            <button type="button" className="sorting-button sorting-button--primary" onClick={handleNewRound}>
              New Round
            </button>
          </div>
        </div>

        {isSuccess && (
          <div className="sorting-celebration">
            <div className="sorting-happy">
              🎉 හොඳයි! 🎉
              <div className="star-rating">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`star ${i < starsEarned ? 'earned' : ''}`}>⭐</span>
                ))}
              </div>
            </div>
            <div className="celebration-buttons">
              <button type="button" className="sorting-button sorting-button--glow" onClick={handleNewRound}>
                Next Round
              </button>
              <button type="button" className="sorting-button sorting-button--secondary" onClick={() => {
                setCardOrder(shuffleArray(cardOrder));
                setIsSuccess(false);
                setShowReward(false);
                setFeedback('Cards shuffled. Try again!');
              }}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </section>

      {showConfetti && (
        <div className={`sorting-confetti ${bigConfetti ? 'big-burst' : ''}`} aria-hidden="true">
          {Array.from({ length: bigConfetti ? 72 : 36 }).map((_, index) => (
            <span
              key={index}
              className="sorting-confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.8}s`,
                background: bigConfetti ?
                  `radial-gradient(circle, ${['#fbbf24', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 6)]} 0%, rgba(251, 191, 36, 0.8) 100%)` :
                  'radial-gradient(circle, #fbbf24 0%, rgba(251, 191, 36, 0.8) 100%)'
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default NumberSortingGame;
