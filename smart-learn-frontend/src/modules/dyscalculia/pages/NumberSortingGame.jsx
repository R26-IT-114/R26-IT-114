import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
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
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import DifficultySelector from '../components/DifficultySelector';
import { getGameLevels } from '../utils/gameLevelProgress';

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
      aria-label={positionLabel ? `${positionLabel}: අංක කාඩ් ${number}` : `අංක කාඩ් ${number}`}
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
    label: 'Easy',
    min: 1,
    max: 3,
    count: 3,
  },
  {
    key: 'medium',
    label: 'Medium',
    min: 1,
    max: 8,
    count: 5,
  },
  {
    key: 'hard',
    label: 'Hard',
    min: 0,
    max: 9,
    count: 8,
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
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(null);
  const [levels] = useState(() => getGameLevels('NumberSortingGame'));
  const [targetNumbers, setTargetNumbers] = useState([]);
  const [cardOrder, setCardOrder] = useState([]);
  // Stable ids for dnd-kit tiles in each round (prevents duplicate id bugs)
  const [tileIds, setTileIds] = useState([]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState('කාඩ්පත් නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.');
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

  const currentDifficulty = difficulties.find((item) => item.key === (difficulty || 'easy'));

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
    setFeedback('කාඩ්පත් නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.');
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
    setFeedback('කාඩ්පත් කලවම් කරන ලදි. නැවත උත්සාහ කරන්න!');
  };

  const handleNewRound = () => {
    setRound((prev) => prev + 1);
    initializeRound();
  };

  const handleDifficultyChange = (key) => {
    setDifficulty(key);
  };

  if (!difficulty) return <main className='sorting-shell adventure-land'><DifficultySelector fullScreen levels={levels} onSelect={setDifficulty} onBack={() => navigate('/dyscalculia')} /></main>;
  return (
    <main className="sorting-shell adventure-land station-fish-school">
      <AdventureBackdrop station='tropical-fish-school' message='Tropical Fish School එකේ අංක පිළිවෙලට සකසමු! 🐠' />
      <StarField />

      <section className="sorting-card">
        <DyscalculiaBackButton onClick={() => navigate('/dyscalculia')} variant='turquoise' />

        <div className="sorting-topbar">
          <div>
            <h1>අංක අනුපිළිවෙල ක්‍රීඩාව</h1>
            <p>අංක නිවැරදි අනුපිළිවෙලට ඇදලා තබන්න.</p>
          </div>
          <div className="sorting-meta">වටය {round}</div>
        </div>

        <div className="sorting-difficulty">
          <DifficultySelector levels={levels} selected={difficulty} onSelect={handleDifficultyChange} />
          <button className='dc-level-back' type='button' onClick={() => setDifficulty(null)}>Change Level</button>
        </div>

        <div className="sorting-instructions" id="sorting-instructions">
          <span>අමාරුමට්ටම:</span> {currentDifficulty.label} • ඇදලා අතහරිමින් කාඩ්පත් අනුපිළිවෙලට සකසන්න.
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tileIds} strategy={verticalListSortingStrategy}>
            <div className="sorting-board mt-4 bg-white/35 backdrop-blur-[2px]">
              {cardOrder.map((number, index) => {
                const correct = number === targetNumbers[index];
                const tileId = tileIds[index];

                return (
                  <SortableItem
                    key={tileId}
                    id={tileId}
                    number={number}
                    positionLabel={`ස්ථානය ${index + 1} / ${currentDifficulty.count}`}
                    isDragging={false}
                    className={`sorting-card-tile ${correct ? 'correct ring-4 ring-emerald-300' : ''} ${isSuccess ? 'sorted' : ''} hover:rotate-1`}
                    aria-describedby="sorting-instructions"
                    data-index={index}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        <div className="sorting-feedback-row mt-5 rounded-2xl border border-violet-200/80 bg-violet-50/70 px-4 py-3">
          <span className={`sorting-feedback ${isSuccess ? 'success' : 'hint'} font-extrabold`}>{feedback}</span>
          <div className="sorting-actions">
            <button type="button" className="sorting-button hover:scale-105" onClick={handleShuffle}>
              කලවම් කරන්න
            </button>
            <button type="button" className="sorting-button sorting-button--primary hover:scale-105" onClick={handleNewRound}>
              නව වටය
            </button>
          </div>
        </div>

        {isSuccess && (
          <div className="sorting-celebration mt-5 ring-4 ring-yellow-200/80 animate-[celebrationSlideIn_0.6s_ease-out]">
            <div className="sorting-happy">
              {/* celebration */}
              <div className="sorting-celebration-line flex items-center justify-center gap-2 text-2xl font-black text-emerald-700">
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
              <button type="button" className="sorting-button sorting-button--glow hover:scale-105" onClick={handleNewRound}>
                ඊළඟ වටය
              </button>
              <button
                type="button"
                className="sorting-button sorting-button--secondary hover:scale-105"
                onClick={() => {
                  const shuffled = shuffleArray(cardOrder);
                  setCardOrder(shuffled);
                  setTileIds(shuffled.map((n, i) => `tile-${n}-${i}`));
                  setIsSuccess(false);
                  setFeedback('කාඩ්පත් කලවම් කරන ලදි. නැවත උත්සාහ කරන්න!');
                }}
              >
                නැවත ක්‍රීඩා කරන්න
              </button>
            </div>
          </div>
        )}
      </section>

      {showConfetti && (
        <div className={`sorting-confetti ${bigConfetti ? 'big-burst' : ''} pointer-events-none`} aria-hidden="true">
          {Array.from({ length: bigConfetti ? 72 : 36 }).map((_, index) => (
            <span
              key={index}
              className="sorting-confetti-piece rounded-full"
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
