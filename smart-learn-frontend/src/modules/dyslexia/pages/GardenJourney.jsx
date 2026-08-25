import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { animals } from '../utils/gamedata';
import AnimalCard from './AnimalCard';
import doraImg from '../../../assets/images/background/dora.png';
import elephantScoreboardImg from '../../../assets/images/garden-journey-elephant-scoreboard.png';

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
      className="bg-white/88 backdrop-blur-sm rounded-[36px] px-7 py-6 shadow-2xl text-center max-w-sm w-full mx-auto"
    >
      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">සෙල්ලම අවසන්!</h2>
      <p className="text-[#2D6A4A] text-lg mb-1">
        {MAX_ROUNDS} ප්‍රශ්නයෙන් <strong className="text-[#1A4A2A]">{score}</strong> ක් නිවැරදි
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
        transition={{
          opacity: { duration: 0.35 },
          scale: { type: 'spring', stiffness: 220 },
          y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative w-full max-w-[310px] mx-auto -my-2"
      >
        <img
          src={elephantScoreboardImg}
          alt="ලකුණු පුවරුව අල්ලාගෙන සිටින අලියා"
          draggable={false}
          className="block w-full h-auto drop-shadow-xl"
        />
        <div
          className="absolute left-[18%] right-[15%] top-[53%] h-[21%]
                     flex flex-col items-center justify-center font-black text-[#1A4A2A]"
          style={{ textShadow: '0 2px 0 rgba(255,255,255,0.8)' }}
          aria-label={`ලකුණු ${score} / ${MAX_ROUNDS}, සියයට ${pct}`}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl leading-none">{score}</span>
            <span className="text-2xl leading-none text-[#2D6A4A]">/ {MAX_ROUNDS}</span>
          </div>
          <span className="mt-1 text-sm leading-none text-[#52B788]">{pct}%</span>
        </div>
      </motion.div>

      <p className="text-[#2D6A4A] font-semibold text-base mb-3">{msg}</p>

      {/* Stars */}
      <div className="flex justify-center gap-3 mb-4 text-4xl" aria-label={`${stars} out of 3 stars`}>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}>
            {i < stars ? '⭐' : '☆'}
          </motion.span>
        ))}
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
    className="bg-white/88 backdrop-blur-sm rounded-[36px] p-10 shadow-2xl text-center max-w-md w-full mx-auto"
    style={{ fontFamily: "'Baloo 2', 'Noto Sans Sinhala', 'Arial Rounded MT Bold', sans-serif" }}
  >
    <motion.img
      src={doraImg}
      alt="Dora"
      className="mx-auto mb-3"
      style={{ width: 190, height: 190, objectFit: 'contain' }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />

    <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1A4A2A', marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>
      ගෙවත්තේ චාරිකාව
    </h1>
    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2D6A4A', lineHeight: 1.9, marginBottom: '0.5rem' }}>
      🔊 සතාගේ ශබ්දය අසා<br />
      🖼️ නිවැරදි රූපය තෝරන්න
    </p>

    <div className="my-4 flex items-center justify-center gap-3" aria-hidden="true">
      <div className="h-0.5 w-16 rounded-full bg-[#A8D5BA]" />
      <span style={{ fontSize: '1.5rem' }}>🐾</span>
      <div className="h-0.5 w-16 rounded-full bg-[#A8D5BA]" />
    </div>

    <div className="grid grid-cols-4 gap-3 mb-7 opacity-75" aria-hidden="true">
      {['🐕','🐈','🦆','🐄','🐸','🦅','🐐','🐓'].map((e, i) => (
        <span key={i} style={{ fontSize: '2rem' }} className="text-center">{e}</span>
      ))}
    </div>

    <button
      onClick={onStart}
      className="w-full rounded-2xl bg-gradient-to-r from-[#52B788] to-[#74C69D]
                 text-white shadow-lg border-2 border-[#3A9A6C]
                 hover:scale-105 active:scale-95 transition-transform"
      style={{ padding: '1.1rem', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.5px' }}
    >
      ▶ සෙල්ලම් කරමු!
    </button>
  </motion.div>
);

// ── Main component ────────────────────────────────────────────────────────────

const GardenJourney = () => {
  const navigate = useNavigate();
  const { replay } = useInstructionAudio();
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
  useDyslexiaGameSession({ gameKey: 'garden-journey', totalQuestions: MAX_ROUNDS, started: phase !== 'start', finished: phase === 'finished', score });

  // ── Play audio ──────────────────────────────────────────────────────────────
  const playSound = useCallback((path) => {
    if (!audioRef.current) return;
    audioRef.current.src = path;
    audioRef.current.play().catch(() => {});
  }, []);

  // ── Cheer sound (Web Audio API synthesized fanfare) ──────────────────────────
  const playCheerSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Cheerful ascending fanfare: C5 E5 G5 C6 — then a sparkle trill
      const sequence = [
        { freq: 523.25, dur: 0.13, delay: 0.00 },  // C5
        { freq: 659.25, dur: 0.13, delay: 0.12 },  // E5
        { freq: 783.99, dur: 0.13, delay: 0.24 },  // G5
        { freq: 1046.50, dur: 0.30, delay: 0.36 }, // C6 (held)
        { freq: 1318.51, dur: 0.10, delay: 0.62 }, // E6 trill
        { freq: 1046.50, dur: 0.10, delay: 0.72 }, // C6
        { freq: 1318.51, dur: 0.10, delay: 0.82 }, // E6
        { freq: 1567.98, dur: 0.40, delay: 0.92 }, // G6 finish
      ];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
      masterGain.connect(ctx.destination);
      sequence.forEach(({ freq, dur, delay }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(masterGain);
        const t = ctx.currentTime + delay + 0.05;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t);
        osc.stop(t + dur + 0.02);
      });
      // Close context after the sound finishes
      setTimeout(() => ctx.close().catch(() => {}), 2000);
    } catch (_) {}
  }, []);

  // ── Level-complete chime (short cheerful ding) ───────────────────────────────
  const playLevelChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.32, ctx.currentTime);
      master.connect(ctx.destination);
      // Quick bright ascending chime: G5 → B5 → D6 → G6
      [
        { freq: 783.99,  delay: 0.00, dur: 0.12 },
        { freq: 987.77,  delay: 0.10, dur: 0.12 },
        { freq: 1174.66, delay: 0.20, dur: 0.12 },
        { freq: 1567.98, delay: 0.30, dur: 0.30 },
      ].forEach(({ freq, delay, dur }) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(master);
        const t = ctx.currentTime + delay + 0.02;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t);
        osc.stop(t + dur + 0.02);
      });
      setTimeout(() => ctx.close().catch(() => {}), 1200);
    } catch (_) {}
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
      playLevelChime();
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
  }, [isAnswered, questionAnimal, generateQuestion, playLevelChime]);

  // ── Replay sound on question change ────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing' && questionAnimal) {
      const t = setTimeout(() => playSound(questionAnimal.sound), 300);
      return () => clearTimeout(t);
    }
  }, [questionAnimal?.id]);   // only re-run when the question changes

  // ── Play cheer when game finishes with a passing score ───────────────────────
  useEffect(() => {
    if (phase === 'finished' && score >= Math.ceil(MAX_ROUNDS / 2)) {
      const t = setTimeout(() => playCheerSound(), 400);
      return () => clearTimeout(t);
    }
  }, [phase, score, playCheerSound]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
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
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default GardenJourney;
