import { useState, useEffect, useCallback } from 'react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { PartyIcon, StarIcon } from '../components/DyscalculiaIcons';


import homeCharacterLeft from '../../../assets/images/dyscalculiaimages/Buzz Lightyear 01.png';
import homeCharacterRight from '../../../assets/images/dyscalculiaimages/Piglet 03.png';
import homeDecoration from '../../../assets/images/dyscalculiaimages/Character WALL 02.svg';
import homeDecoration2 from '../../../assets/images/dyscalculiaimages/scooby-doo-0.svg';
import homeExtraCharacter from '../../../assets/images/dyscalculiaimages/Tigger Pooh 01.svg';

// Additional carnival assets
import carnivalBalloon from '../../../assets/images/dyscalculiaimages/Genie Aladdin 01.png';
import carnivalLight from '../../../assets/images/dyscalculiaimages/scooby-doo-1.svg';
import carnivalMascot from '../../../assets/images/dyscalculiaimages/Winnie The Pooh 01.png';

function SortableItem({ id, number, className, positionLabel, ...props }) {
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
      role="group"
      aria-roledescription="sortable tile"
      aria-label={positionLabel ? `${positionLabel}: Card number ${number}` : `Card number ${number}`}
      tabIndex={0}
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

      noteIndex += 1;
      setTimeout(playNote, 120);
    };

    playNote();
  } catch {
    const utterance = new SpeechSynthesisUtterance('ජය වේවා!');
    utterance.lang = 'si-LK';
    speechSynthesis.speak(utterance);
  }

};

const NumberSortingGame = () => {
  // const navigate = useNavigate(); // not used in this game UI

  const [difficulty, setDifficulty] = useState('easy');
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [cardOrder, setCardOrder] = useState([]);
  // Stable ids for dnd-kit tiles in each round (prevents duplicate id bugs)
  const [tileIds, setTileIds] = useState([]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState('Drag the cards into the right order.');
  const [showConfetti, setShowConfetti] = useState(false);
  const [round, setRound] = useState(1);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
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
    const numbers = pickNumbers(
      currentDifficulty.min,
      currentDifficulty.max,
      currentDifficulty.count
    );

    setTargetNumbers(numbers);

    const shuffled = shuffleArray(numbers);
    setCardOrder(shuffled);

    // Build stable ids for each tile position within this round.
    // We include the index so duplicate numbers never share an id.
    setTileIds(shuffled.map((n, i) => `tile-${n}-${i}`));

    setIsSuccess(false);
    setFeedback('Drag the cards into the right order.');
    setShowConfetti(false);
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
    if (!over) return;

    if (active.id !== over.id) {
      setTileIds((ids) => {
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        return arrayMove(ids, oldIndex, newIndex);
      });

      // Keep cardOrder in sync with tileIds order.
      // Since both arrays represent the same tile positions, we reorder cardOrder the same way.
      setCardOrder((items) => {
        const oldIndex = tileIds.indexOf(active.id);
        const newIndex = tileIds.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(cardOrder);
    setCardOrder(shuffled);
    setTileIds(shuffled.map((n, i) => `tile-${n}-${i}`));
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
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${10 + i * 10}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
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

        <div className="sorting-instructions" id="sorting-instructions">
          <span>Difficulty:</span> {currentDifficulty.label} • Use drag and drop to sort the cards.
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tileIds} strategy={verticalListSortingStrategy}>
            <div className="sorting-board">
              {cardOrder.map((number, index) => {
                const correct = number === targetNumbers[index];
                const tileId = tileIds[index];

                return (
                  <SortableItem
                    key={tileId}
                    id={tileId}
                    number={number}
                    positionLabel={`Position ${index + 1} of ${currentDifficulty.count}`}
                    isDragging={false}
                    className={`sorting-card-tile ${correct ? 'correct' : ''} ${isSuccess ? 'sorted' : ''}`}
                    aria-describedby="sorting-instructions"
                    data-index={index}
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
              {/* celebration */}
              <div className="sorting-celebration-line">
                <PartyIcon size={28} className="dg-ico" aria-hidden="true" />
                <span>හොඳයි!</span>
                <PartyIcon size={28} className="dg-ico" aria-hidden="true" />
              </div>
              <div className="star-rating">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`star ${i < starsEarned ? 'earned' : ''}`} aria-hidden="true">
                    <StarIcon size={22} className="dg-ico" />
                  </span>
                ))}
              </div>

            </div>
            <div className="celebration-buttons">
              <button type="button" className="sorting-button sorting-button--glow" onClick={handleNewRound}>
                Next Round
              </button>
              <button
                type="button"
                className="sorting-button sorting-button--secondary"
                onClick={() => {
                  const shuffled = shuffleArray(cardOrder);
                  setCardOrder(shuffled);
                  setTileIds(shuffled.map((n, i) => `tile-${n}-${i}`));
                  setIsSuccess(false);
                  setFeedback('Cards shuffled. Try again!');
                }}
              >
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
                background: bigConfetti
                  ? `radial-gradient(circle, ${['#fbbf24', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 6)]} 0%, rgba(251, 191, 36, 0.8) 100%)`
                  : 'radial-gradient(circle, #fbbf24 0%, rgba(251, 191, 36, 0.8) 100%)',
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default NumberSortingGame;

