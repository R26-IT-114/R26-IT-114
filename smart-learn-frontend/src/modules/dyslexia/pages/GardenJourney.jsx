import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { animals } from '../utils/gamedata';
import AnimalCard from './AnimalCard';
import doraImg from '../../../assets/images/background/dora.png';

// ── Helpers ───────────────────────────────────────────────────────────────────

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MAX_ROUNDS = animals.length; // 8

// ── Deterministic leaf data ───────────────────────────────────────────────────

const LEAF_SYMS = ['🍃', '🌿', '🍀', '🌱', '🌸'];
const LEAVES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  sym:      LEAF_SYMS[i % LEAF_SYMS.length],
  left:     `${(i * 41 + 7) % 90}%`,
  size:     `${14 + (i % 4) * 6}px`,
  duration: 15 + (i % 5) * 3,
  delay:    i * 2,
  rotate:   i % 2 === 0 ? 180 : -180,
  xDrift:   i % 2 === 0 ? 30 : -30,
}));

// ── Sub-components ────────────────────────────────────────────────────────────

const FloatingLeaf = ({ leaf }) => (
  <motion.div
    aria-hidden="true"
    className="absolute pointer-events-none select-none"
    style={{ left: leaf.left, bottom: '-8%', fontSize: leaf.size }}
    animate={{ y: ['0vh', '-115vh'], rotate: [0, leaf.rotate], x: [0, leaf.xDrift, -leaf.xDrift * 0.5, 0] }}
    transition={{ duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: 'linear',
                  x: { duration: leaf.duration, ease: 'easeInOut', repeat: Infinity } }}
  >{leaf.sym}</motion.div>
);

// ── Results screen ────────────────────────────────────────────────────────────

const ResultsScreen = ({ score, onRetry, onHome }) => {
  const pct   = Math.round((score / MAX_ROUNDS) * 100);
  const stars = pct === 100 ? 3 : pct >= 62 ? 2 : 1;
  const msg   = pct === 100 ? 'සුපිරිම! 🏆' : pct >= 75 ? 'හොඳයි! 🌟' : pct >= 50 ? 'හොඳ ප්‍රයත්නයක්! 👏' : 'නැවත උත්සාහ කරමු! 💪';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white/88 backdrop-blur-sm rounded-[36px] p-8 shadow-2xl text-center max-w-sm w-full mx-auto"
    >
      <motion.div className="text-6xl mb-2"
        animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
        transition={{ duration: 0.9, delay: 0.3 }}>
        🎊
      </motion.div>

      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">සෙල්ලම අවසන්!</h2>
      <p className="text-[#2D6A4A] text-lg mb-1">
        {MAX_ROUNDS} ප්‍රශ්නයෙන් <strong className="text-[#1A4A2A]">{score}</strong> ක් නිවැරදි
      </p>
      <p className="text-[#2D6A4A] font-semibold text-base mb-5">{msg}</p>

      {/* Stars */}
      <div className="flex justify-center gap-3 mb-6 text-4xl" aria-label={`${stars} out of 3 stars`}>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}>
            {i < stars ? '⭐' : '☆'}
          </motion.span>
        ))}
      </div>

      {/* Score ring */}
      <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-[#A8D5BA] to-[#52B788]
                      flex flex-col items-center justify-center shadow-lg mb-6">
        <span className="text-white font-black text-3xl leading-none">{score}/{MAX_ROUNDS}</span>
        <span className="text-white/80 text-sm font-semibold">{pct}%</span>
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={onRetry}
          className="px-6 py-3 rounded-2xl bg-[#A8D5BA] text-[#1A3A2A] font-bold text-base
                     border-2 border-[#7CB89A] hover:scale-105 active:scale-95 transition-transform">
          🔄 නැවත
        </button>
        <button onClick={onHome}
          className="px-6 py-3 rounded-2xl bg-[#BDE0FE] text-[#1A3060] font-bold text-base
                     border-2 border-[#8EC8FF] hover:scale-105 active:scale-95 transition-transform">
          🏠 නිවස
        </button>
      </div>
    </motion.div>
  );
};

// ── Start screen ──────────────────────────────────────────────────────────────

const StartScreen = ({ onStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: 'easeOut' }}
    className="bg-white/88 backdrop-blur-sm rounded-[36px] p-8 shadow-2xl text-center max-w-sm w-full mx-auto"
  >
    <motion.img
      src={doraImg}
      alt="Dora"
      className="mx-auto mb-2"
      style={{ width: 160, height: 160, objectFit: 'contain' }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />

    <h1 className="text-[#1A4A2A] text-3xl font-black mb-3">ගෙවත්තේ චාරිකාව</h1>
    <p className="text-[#2D6A4A] text-lg leading-relaxed mb-2">
      🔊 සතාගේ ශබ්දය අසා<br />
      🖼️ නිවැරදි රූපය තෝරන්න
    </p>

    <div className="my-4 flex items-center justify-center gap-3" aria-hidden="true">
      <div className="h-0.5 w-12 rounded-full bg-[#A8D5BA]" />
      <span className="text-xl">🐾</span>
      <div className="h-0.5 w-12 rounded-full bg-[#A8D5BA]" />
    </div>

    <div className="grid grid-cols-4 gap-2 mb-6 opacity-70" aria-hidden="true">
      {['🐕','🐈','🦆','🐄','🐸','🦅','🐐','🐓'].map((e, i) => (
        <span key={i} className="text-2xl text-center">{e}</span>
      ))}
    </div>

    <button
      onClick={onStart}
      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#52B788] to-[#74C69D]
                 text-white font-black text-xl shadow-lg border-2 border-[#3A9A6C]
                 hover:scale-105 active:scale-95 transition-transform"
    >
      ▶ සෙල්ලම් කරමු!
    </button>
  </motion.div>
);

// ── Main component ────────────────────────────────────────────────────────────

const GardenJourney = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [phase,            setPhase]            = useState('start');  // start|playing|finished
  const [questionAnimal,   setQuestionAnimal]    = useState(null);
  const [options,          setOptions]           = useState([]);
  const [selectedId,       setSelectedId]        = useState(null);
  const [isCorrect,        setIsCorrect]         = useState(false);
  const [showCorrectId,    setShowCorrectId]      = useState(null);   // show correct card after wrong
  const [score,            setScore]             = useState(0);
  const [roundIndex,       setRoundIndex]        = useState(0);       // 0-based completed rounds
  const [usedIds,          setUsedIds]           = useState([]);
  const [isAnswered,       setIsAnswered]        = useState(false);
  const [showCelebration,  setShowCelebration]   = useState(false);

  // ── Play audio ──────────────────────────────────────────────────────────────
  const playSound = useCallback((path) => {
    if (!audioRef.current) return;
    audioRef.current.src = path;
    audioRef.current.play().catch(() => {});
  }, []);

  // ── Generate a new question ─────────────────────────────────────────────────
  const generateQuestion = useCallback((currentUsed) => {
    const available = animals.filter(a => !currentUsed.includes(a.id));
    if (available.length === 0) {
      setPhase('finished');
      return;
    }
    const chosen   = available[Math.floor(Math.random() * available.length)];
    const others   = shuffle(animals.filter(a => a.id !== chosen.id)).slice(0, 3);
    const opts     = shuffle([chosen, ...others]);

    setQuestionAnimal(chosen);
    setOptions(opts);
    setSelectedId(null);
    setIsCorrect(false);
    setShowCorrectId(null);
    setIsAnswered(false);
    setShowCelebration(false);
    setUsedIds([...currentUsed, chosen.id]);

    setTimeout(() => playSound(chosen.sound), 350);
  }, [playSound]);

  // ── Start / restart ─────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    setScore(0);
    setRoundIndex(0);
    setUsedIds([]);
    setPhase('playing');
    generateQuestion([]);
  }, [generateQuestion]);

  // ── Answer handler ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((animal) => {
    if (isAnswered || !questionAnimal) return;

    const correct = animal.id === questionAnimal.id;
    setSelectedId(animal.id);
    setIsCorrect(correct);
    setIsAnswered(true);
    setRoundIndex(prev => prev + 1);

    if (correct) {
      setScore(prev => prev + 1);
      setShowCelebration(true);
      setTimeout(() => {
        setUsedIds(prev => {
          const next = prev; // already added in generateQuestion
          if (next.length >= MAX_ROUNDS) { setPhase('finished'); return next; }
          generateQuestion(next);
          return next;
        });
      }, 1400);
    } else {
      setShowCorrectId(questionAnimal.id);
      setTimeout(() => {
        setUsedIds(prev => {
          if (prev.length >= MAX_ROUNDS) { setPhase('finished'); return prev; }
          generateQuestion(prev);
          return prev;
        });
      }, 2000);
    }
  }, [isAnswered, questionAnimal, generateQuestion]);

  // ── Replay sound on question change ────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing' && questionAnimal) {
      const t = setTimeout(() => playSound(questionAnimal.sound), 300);
      return () => clearTimeout(t);
    }
  }, [questionAnimal?.id]);   // only re-run when the question changes

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className="min-h-screen relative overflow-hidden font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      {/* Floating leaves */}
      {LEAVES.map(l => <FloatingLeaf key={l.id} leaf={l} />)}

      {/* Static decorations */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-4 right-8  text-5xl opacity-55">☀️</div>
        <div className="absolute top-3 left-10  text-3xl opacity-30">☁️</div>
        <div className="absolute bottom-6 left-4  text-3xl opacity-40">🌿</div>
        <div className="absolute bottom-6 right-4 text-3xl opacity-40">🌸</div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* ── Start screen ── */}
        {phase === 'start' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <StartScreen onStart={startGame} />
          </div>
        )}

        {/* ── Finished screen ── */}
        {phase === 'finished' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <ResultsScreen
              score={score}
              onRetry={startGame}
              onHome={() => navigate('/dyslexia')}
            />
          </div>
        )}

        {/* ── Playing screen ── */}
        {phase === 'playing' && questionAnimal && (
          <>
            {/* Celebration burst */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  key="celebrate"
                  className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-8xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: [0, 1.4, 1], rotate: 0 }}
                    transition={{ duration: 0.7, ease: 'backOut' }}
                  >
                    ⭐✨🎉
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/dyslexia')}
                className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                           font-bold text-xl flex items-center justify-center
                           hover:scale-105 active:scale-95 transition-transform"
                aria-label="Back"
              >
                ←
              </button>

              <div className="text-center">
                <p className="text-[#2D6A4A] font-semibold text-sm">🌳 ගෙවත්තේ චාරිකාව</p>
                <p className="text-[#1A4A2A] font-black text-sm">
                  {roundIndex} / {MAX_ROUNDS}
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-[#FFD166]/85 border-2 border-[#E6B800]
                              flex items-center justify-center" aria-label={`Score: ${score}`}>
                <span className="text-[#4A3000] font-black text-base">{score}</span>
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div className="mb-5 h-3 rounded-full bg-white/50 overflow-hidden" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#74C69D]"
                animate={{ width: `${(roundIndex / MAX_ROUNDS) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* ── Prompt card ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`q-${questionAnimal.id}`}
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.3 }}
                className="bg-white/85 backdrop-blur-sm rounded-[28px] p-5 shadow-xl
                           border-4 border-[#A8D5BA] mb-5 text-center"
              >
                <p className="text-[#2D6A4A] font-semibold text-base mb-4 leading-snug">
                  🎵 ශබ්දය අසා නිවැරදි සතා තෝරන්න 👇
                </p>

                {/* Sound button */}
                <motion.button
                  onClick={() => playSound(questionAnimal.sound)}
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl
                             bg-gradient-to-r from-[#52B788] to-[#74C69D]
                             text-white font-black text-xl shadow-md border-2 border-[#3A9A6C]
                             hover:scale-105 active:scale-95 transition-transform"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label="Play animal sound"
                  disabled={isAnswered}
                >
                  <motion.span
                    animate={!isAnswered ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-2xl"
                  >
                    🔊
                  </motion.span>
                  ශබ්දය අසන්න
                </motion.button>

                <p className="text-[#52B788] text-sm mt-3 opacity-75">
                  {isAnswered ? '⏳ මීළඟ ප්‍රශ්නය...' : '👆 නැවත ශබ්දය ඇසීමට ස්පර්ශ කරන්න'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ── Choice grid ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`opts-${questionAnimal.id}`}
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {options.map((animal, i) => (
                  <motion.div
                    key={animal.id}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <AnimalCard
                      animal={animal}
                      onClick={handleAnswer}
                      isSelected={selectedId === animal.id}
                      isCorrect={isCorrect && selectedId === animal.id}
                      showAsCorrect={showCorrectId === animal.id}
                      disabled={isAnswered}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── Feedback banner ── */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`mt-5 rounded-[24px] p-5 text-center border-4 shadow-lg
                    ${isCorrect
                      ? 'bg-[#E8F8EF] border-[#52B788]'
                      : 'bg-[#FFF3CD] border-[#FFD166]'}`}
                >
                  <p className="text-2xl font-black text-[#1A4A2A]">
                    {isCorrect
                      ? '✅ හරිම හරි! ඉතා හොඳයි! 🌟'
                      : `❌ නිවැරදි සතා — ${questionAnimal.name}`}
                  </p>
                  {!isCorrect && questionAnimal.sinhalaDesc && (
                    <p className="text-[#2D6A4A] text-sm mt-1 font-medium">
                      ({questionAnimal.sinhalaDesc})
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <audio ref={audioRef} />
    </main>
  );
};

export default GardenJourney;