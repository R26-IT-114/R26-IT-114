import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import CorrectAnswerCelebration from '../components/CorrectAnswerCelebration';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WORD_IMAGE_LEVELS, WORDS_MAP } from '../data/wordImageData';
import introImg from '../../../assets/images/background/panda.png';
import pandaScoreboardImg from '../../../assets/images/word-listen-match-panda-scoreboard.png';

// Keep this picture game semantically correct without changing the recorded
// "කඩය" audio currently used by the separate Word Listen Match game.
const WORD_IMAGE_GAME_MAP = {
  ...WORDS_MAP,
  nose: { ...WORDS_MAP.nose, word: 'නහය' },
};

// ── Audio (Web Audio API — no external files needed) ──────────────────────────

const playCorrect = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Cheerful ascending arpeggio: C5 → E5 → G5 → C6
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch {
    return;
  }
};

const playWrong = () => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.38);
  } catch {
    return;
  }
};

// ── Speech ────────────────────────────────────────────────────────────────────

const speak = (text) => {
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (synth.paused) synth.resume();
  synth.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang   = 'si-LK';
    u.rate   = 0.7;
    u.pitch  = 1.1;
    u.volume = 1;
    synth.speak(u);
  }, 120);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Intro Card ─────────────────────────────────────────────────────────────────

const IntroCard = ({ title, instruction, level, total, onStart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.88, y: -20 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="bg-white/90 backdrop-blur-sm rounded-[36px] shadow-2xl overflow-hidden max-w-xs w-full mx-auto mt-4"
  >
    <div className="w-full overflow-hidden bg-[#E8F8EF]" style={{ height: '160px' }}>
      <img src={introImg} alt="" className="w-full h-full object-contain p-2" draggable={false} />
    </div>
    <div className="p-6 text-center">
      <h2 className="text-[#1A4A2A] text-2xl font-black mb-1">{title}</h2>
      <div className="inline-flex items-center gap-2 bg-[#E8F8EF] border-2 border-[#A8D5BA]
                      rounded-xl px-3 py-1 mb-4">
        <span className="text-[#2D6A4A] font-bold text-sm">මට්ටම {level}</span>
        <span className="text-[#52B788] text-xs">· ප්‍රශ්න {total}ක්</span>
      </div>
      <p className="text-[#2D6A4A] text-sm font-semibold mb-6 leading-relaxed px-2">
        {instruction}
      </p>
      <motion.button
        onClick={onStart}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#52B788] to-[#3A9A6A]
                   text-white font-black text-lg shadow-lg border-2 border-[#2D8A5A]
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        ආරම්භ කරන්න 🎮
      </motion.button>
    </div>
  </motion.div>
);

// ── WordCard ──────────────────────────────────────────────────────────────────

const WordCard = ({ word, onSpeak }) => (
  <div className="bg-white/88 backdrop-blur-sm rounded-[32px] p-5 shadow-xl
                  border-4 border-[#A8D5BA] text-center mb-5">
    <p className="text-[#2D6A4A] font-semibold text-base mb-4 leading-snug">
      මේ වචනයට ගැළපෙන රූපය තෝරන්න
    </p>

    {/* Tappable word — replays speech on tap */}
    <motion.button
      onClick={onSpeak}
      className="inline-block bg-gradient-to-br from-[#C5EDD6] to-[#A8D5BA]
                 rounded-3xl px-10 py-4 shadow-md border-2 border-[#7CB89A]
                 text-[#1A4A2A] font-black
                 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]"
      style={{ fontSize: '64px', lineHeight: 1.2, fontFamily: 'Poppins, Arial, sans-serif' }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Word: ${word}, tap to hear pronunciation`}
    >
      {word}
    </motion.button>

    <p className="text-[#52B788] text-sm mt-3 opacity-80">
      👆 ස්පර්ශ කර ශබ්දය අසන්න
    </p>
  </div>
);

// ── ImageChoice card ──────────────────────────────────────────────────────────

const CARD_STYLE = {
  idle:    'border-white/65 bg-white/85',
  correct: 'border-[#52B788] ring-4 ring-[#A8D5BA] bg-[#E8F8EF]',
  wrong:   'border-[#FF6B6B] ring-4 ring-[#FFB3B3] bg-[#FFF0EF]',
};

const ImageChoice = ({ item, cardState, onSelect, disabled }) => (
  <motion.button
    className={`relative rounded-3xl overflow-hidden border-4 shadow-lg w-full h-full select-none
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                ${CARD_STYLE[cardState]}`}
    onClick={() => !disabled && onSelect(item.id)}
    whileHover={!disabled ? { scale: 1.06, y: -4 } : {}}
    whileTap={!disabled ? { scale: 0.92 } : {}}
    animate={
      cardState === 'wrong'
        ? { x: [-8, 8, -6, 6, -3, 3, 0] }
        : cardState === 'correct'
        ? { scale: [1, 1.1, 1] }
        : {}
    }
    transition={
      cardState === 'wrong'
        ? { duration: 0.42 }
        : cardState === 'correct'
        ? { duration: 0.4, ease: 'easeOut' }
        : { type: 'spring', stiffness: 280, damping: 18 }
    }
    aria-label={item.word}
    aria-pressed={cardState !== 'idle'}
    disabled={disabled && cardState === 'idle'}
  >
    {/* Image */}
    <div className="aspect-square w-full overflow-hidden bg-white flex items-center justify-center">
      <img
        src={item.image}
        alt={item.word}
        className="w-full h-full object-contain p-2 sm:p-3"
        draggable={false}
      />
    </div>

    {/* Correct overlay */}
    {cardState === 'correct' && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#A8D5BA]/50 rounded-3xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28 }}
      >
        <span className="text-5xl drop-shadow-md">✅</span>
      </motion.div>
    )}

    {/* Wrong overlay */}
    {cardState === 'wrong' && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#FF6B6B]/35 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-5xl drop-shadow-md">❌</span>
      </motion.div>
    )}
  </motion.button>
);

// ── ScoreBoard (top bar) ──────────────────────────────────────────────────────

const ScoreBoard = ({ qIndex, total, level, score, phase, onBack }) => (
  <div className="flex items-center justify-between mb-4">
    <button
      onClick={onBack}
      className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                 font-bold text-xl flex items-center justify-center
                 hover:scale-105 active:scale-95 transition-transform"
      aria-label="Back to home"
    >
      ←
    </button>

    <div className="text-center">
      <p className="text-[#2D6A4A] font-semibold text-sm">📝 වචන - රූප ගැළපීම</p>
      <p className="text-[#1A4A2A] font-black text-sm">
        {phase === 'finished'
          ? '✓ ඉවරයි!'
          : phase === 'intro'
          ? `මට්ටම ${level}`
          : `ප්‍රශ්නය ${qIndex + 1} / ${total}  ·  මට්ටම ${level}`}
      </p>
    </div>

    <div
      className="w-11 h-11 rounded-2xl bg-[#FFD166]/85 border-2 border-[#E6B800]
                 flex items-center justify-center"
      aria-label={`Score: ${score}`}
    >
      <span className="text-[#4A3000] font-black text-base">{score}</span>
    </div>
  </div>
);

// ── ResultsScreen ─────────────────────────────────────────────────────────────

const ResultsScreen = ({ score, total, onRetry, onHome }) => {
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
  const msgs  = ['හොඳ උත්සාහයක්! 💪', 'හොඳයි! 🌟', 'සුපිරියි! 🏆'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white/88 backdrop-blur-sm rounded-[36px] p-8 shadow-2xl
                 text-center max-w-xs w-full mx-auto mt-4"
    >
      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">ඉවරයි!</h2>
      <p className="text-[#2D6A4A] text-lg mb-2">
        ප්‍රශ්න {total}න් <strong className="text-[#1A4A2A]">{score}</strong>ක් නිවැරදියි
      </p>
      <p className="text-[#2D6A4A] font-semibold text-base mb-1">{msgs[stars - 1]}</p>

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.9 }}
        animate={{ opacity: 1, y: [0, -7, 0], scale: 1 }}
        transition={{
          opacity: { duration: 0.35 },
          scale: { type: 'spring', stiffness: 220 },
          y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative w-full max-w-[260px] mx-auto -mt-1 mb-1"
      >
        <img
          src={pandaScoreboardImg}
          alt="ලකුණු පුවරුව අල්ලාගෙන සිටින පැන්ඩා"
          className="block w-full h-auto drop-shadow-xl"
        />
        <div
          className="absolute left-[15%] right-[15%] top-[48%] h-[22%]
                     flex items-center justify-center gap-1 font-black text-[#1A4A2A]"
          style={{ textShadow: '0 2px 0 rgba(255,255,255,0.7)' }}
          aria-label={`ලකුණු ${score} / ${total}`}
        >
          <span className="text-5xl leading-none">{score}</span>
          <span className="text-2xl leading-none text-[#2D6A4A]">/ {total}</span>
        </div>
      </motion.div>

      {/* Stars */}
      <div className="flex justify-center gap-3 mb-4 text-4xl" aria-label={`${stars} out of 3 stars`}>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}
          >
            {i < stars ? '⭐' : '☆'}
          </motion.span>
        ))}
      </div>

      <div className="inline-flex items-center justify-center rounded-full bg-[#52B788]
                      text-white font-black text-sm px-5 py-2 shadow-md mb-5">
        {pct}%
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-2xl bg-[#A8D5BA] text-[#1A3A2A] font-bold text-base
                     border-2 border-[#7CB89A] hover:scale-105 active:scale-95 transition-transform"
        >
          🔄 නැවත
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3 rounded-2xl bg-[#BDE0FE] text-[#1A3060] font-bold text-base
                     border-2 border-[#8EC8FF] hover:scale-105 active:scale-95 transition-transform"
        >
          🏠 නිවස
        </button>
      </div>
    </motion.div>
  );
};

// ── WordImageMatch — main game ────────────────────────────────────────────────

const WordImageMatch = () => {
  const navigate             = useNavigate();
  const { replay }           = useInstructionAudio();
  const { state: locState }  = useLocation();
  const level                = locState?.level ?? 1;

  // Build question list once per level (shuffle choices per question)
  const rawQuestions = useMemo(
    () => WORD_IMAGE_LEVELS[level] ?? WORD_IMAGE_LEVELS[1],
    [level]
  );
  const questions = useMemo(
    () => rawQuestions.map(q => ({ ...q, shuffledChoices: shuffle(q.choices) })),
    [rawQuestions]
  );

  const [qIndex,     setQIndex]     = useState(0);
  const [phase,      setPhase]      = useState('intro'); // intro|playing|correct|wrong|finished
  const [selectedId, setSelectedId] = useState(null);
  const [score,      setScore]      = useState(0);
  useDyslexiaGameSession({ gameKey: 'word-image-match', level, totalQuestions: questions.length, started: phase !== 'intro', finished: phase === 'finished', score });
  const startedRef   = useRef(false);

  // Memoise per-question derived data
  const q           = useMemo(() => questions[qIndex], [questions, qIndex]);
  const wordItem    = useMemo(() => WORD_IMAGE_GAME_MAP[q.wordId], [q]);
  const choiceItems = useMemo(() => q.shuffledChoices.map(id => WORD_IMAGE_GAME_MAP[id]), [q]);
  const gridCols    = choiceItems.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';

  // ── Auto-speak word when question changes ─────────────────────────────────
  useEffect(() => {
    if (!startedRef.current) return;
    const word = WORD_IMAGE_GAME_MAP[questions[qIndex].wordId].word;
    const t = setTimeout(() => speak(word), 420);
    return () => clearTimeout(t);
  }, [qIndex, questions]);

  // ── Answer handler ────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (id) => {
      if (phase !== 'playing') return;
      setSelectedId(id);

      if (id === q.wordId) {
        setPhase('correct');
        setScore(s => s + 1);
        playCorrect();
        setTimeout(() => {
          if (qIndex + 1 >= questions.length) {
            setPhase('finished');
          } else {
            setQIndex(i => i + 1);
            setSelectedId(null);
            setPhase('playing');
          }
        }, 1500);
      } else {
        setPhase('wrong');
        playWrong();
        setTimeout(() => {
          setSelectedId(null);
          setPhase('playing');
        }, 950);
      }
    },
    [phase, q, qIndex, questions.length]
  );

  const handleStart = () => {
    startedRef.current = true;
    setPhase('playing');
    const word = WORD_IMAGE_GAME_MAP[questions[qIndex].wordId].word;
    setTimeout(() => speak(word), 420);
  };

  const handleRetry = () => {
    startedRef.current = false;
    setQIndex(0);
    setScore(0);
    setSelectedId(null);
    setPhase('intro');
  };

  // Each card's visual state
  const getCardState = (id) => {
    if (selectedId === id)                      return id === q.wordId ? 'correct' : 'wrong';
    if (phase === 'correct' && id === q.wordId) return 'correct';
    return 'idle';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CorrectAnswerCelebration active={phase === 'correct'} />
      {/* Nature decorations */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-4 right-8   text-5xl opacity-55">☀️</div>
        <div className="absolute top-3 left-10   text-3xl opacity-30">☁️</div>
        <div className="absolute bottom-6 left-4  text-3xl opacity-40">🌿</div>
        <div className="absolute bottom-6 right-4 text-3xl opacity-40">🌸</div>
        <div className="absolute top-1/2 left-2   text-2xl opacity-20">🍃</div>
        <div className="absolute top-1/3 right-2  text-2xl opacity-20">🌱</div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Score bar */}
        <ScoreBoard
          qIndex={qIndex}
          total={questions.length}
          level={level}
          score={score}
          phase={phase}
          onBack={() => navigate('/dyslexia')}
        />

        {/* Progress bar */}
        {phase !== 'finished' && phase !== 'intro' && (
          <div className="mb-5 h-3 rounded-full bg-white/50 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#F7A84A] to-[#FFD166]"
              animate={{
                width: `${((qIndex + (phase === 'correct' ? 1 : 0)) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* ── Intro / Finished / Game ── */}
        {phase === 'finished' ? (
          <ResultsScreen
            score={score}
            total={questions.length}
            onRetry={handleRetry}
            onHome={() => navigate('/dyslexia')}
          />
        ) : phase === 'intro' ? (
          <AnimatePresence mode="wait">
            <IntroCard
              key="intro"
              title="වචන - රූප ගැළපීම"
              instruction="වචනය කියවා, ගැළපෙන රූපය ස්පර්ශ කරන්න!"
              level={level}
              total={questions.length}
              onStart={handleStart}
            />
          </AnimatePresence>
        ) : (
          <>
            {/* ── Word display ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`word-${qIndex}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <WordCard
                  word={wordItem.word}
                  onSpeak={() => speak(wordItem.word)}
                />
              </motion.div>
            </AnimatePresence>

            {/* ── Image choices ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`choices-${qIndex}`}
                className={`grid ${gridCols} gap-3 items-stretch`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {choiceItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className={`h-full ${choiceItems.length === 3 && i === 2
                      ? 'col-span-2 sm:col-span-1 w-[calc(50%_-_0.375rem)] sm:w-full justify-self-center'
                      : 'w-full'}`}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <ImageChoice
                      item={item}
                      cardState={getCardState(item.id)}
                      onSelect={handleSelect}
                      disabled={phase !== 'playing'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* ── Feedback banner ── */}
            <AnimatePresence>
              {(phase === 'correct' || phase === 'wrong') && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-5 rounded-[24px] p-4 text-center border-4 shadow-lg
                    ${phase === 'correct'
                      ? 'bg-[#E8F8EF] border-[#52B788]'
                      : 'bg-[#FFF3CD] border-[#FFD166]'}`}
                >
                  <p className="text-2xl font-black text-[#1A4A2A]">
                    {phase === 'correct'
                      ? '✅ හරියටම හරි! ඉතා හොඳයි! 🌟'
                      : '❌ නිවැරදි රූපය තෝරන්න!'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default WordImageMatch;
