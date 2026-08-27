import { useState, useEffect, useCallback, useMemo } from 'react';

import introImg    from '../../../assets/images/background/monkeyy.png';
import monkeyScoreboardImg from '../../../assets/images/first-letter-monkey-scoreboard.png';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import CorrectAnswerCelebration from '../components/CorrectAnswerCelebration';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, ArrowLeft, RotateCcw, Home,
  Star, Sun, Cloud, Leaf, Flower2, Music2,
} from 'lucide-react';
import { RO_WORDS, RO_LEVELS } from '../data/rhymeData';

// ── Audio ─────────────────────────────────────────────────────────────────────

const playCorrect = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t); osc.stop(t + 0.28);
    });
  } catch {
    return;
  }
};

const playWrong = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sawtooth'; osc.frequency.value = 200;
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.42);
  } catch {
    return;
  }
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Intro Card ───────────────────────────────────────────────────────────────

const IntroCard = ({ title, instruction, level, total, onStart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.88, y: -20 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="bg-white/90 backdrop-blur-sm rounded-[36px] shadow-2xl overflow-hidden max-w-xs w-full mx-auto mt-4"
  >
   {/* Center Image */}
<div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
  <motion.img
    src={introImg}
    alt="intro"
    draggable={false}
    animate={{ y: [0, -8, 0] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      width: 160,
      height: 160,
      objectFit: 'contain',
      borderRadius: 24,
      filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.35))',
    }}
  />
</div>
    <div className="p-6 text-center">
      <h2 className="text-[#7A3A0A] text-2xl font-black mb-1">{title}</h2>
      <div className="inline-flex items-center gap-2 bg-[#FFF3E8] border-2 border-[#F4C28A]
                      rounded-xl px-3 py-1 mb-4">
        <span className="text-[#7A3A0A] font-bold text-sm">මට්ටම {level}</span>
        <span className="text-[#F4A261] text-xs">· ප්‍රශ්න {total}ක්</span>
      </div>
      <p className="text-[#7A3A0A] text-sm font-semibold mb-6 leading-relaxed px-2">
        {instruction}
      </p>
      <motion.button
        onClick={onStart}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F4A261] to-[#D07820]
                   text-white font-black text-lg shadow-lg border-2 border-[#B05810]
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        ආරම්භ කරන්න 🎮
      </motion.button>
    </div>
  </motion.div>
);

// ── Word Card ─────────────────────────────────────────────────────────────────

const CARD_BASE = `relative rounded-[28px] border-4 shadow-md p-4
  flex flex-col items-center justify-center gap-2 select-none
  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
  transition-colors duration-150`;

const CARD_STATE = {
  idle:    'bg-white/88 border-[#A8D5BA] text-[#1A4A2A]',
  correct: 'bg-[#E8F8EF] border-[#52B788] text-[#1A4A2A] ring-4 ring-[#A8D5BA]',
  wrong:   'bg-[#FFF0EF] border-[#FF6B6B] text-[#1A4A2A] ring-4 ring-[#FFB3B3]',
  reveal:  'bg-[#E8F8EF] border-[#A8D5BA] text-[#2D6A4A] opacity-75',
};

const WordCard = ({ item, cardState, onTap, disabled }) => (
    <motion.div
      className="relative h-full"
      animate={
        cardState === 'wrong'
          ? { x: [-7, 7, -5, 5, -2, 2, 0] }
          : cardState === 'correct'
          ? { scale: [1, 1.06, 1] }
          : {}
      }
      transition={
        cardState === 'wrong'
          ? { duration: 0.42 }
          : { type: 'spring', stiffness: 280, damping: 18 }
      }
    >
      <motion.button
        className={`${CARD_BASE} ${CARD_STATE[cardState]} w-full h-full`}
        onClick={() => !disabled && onTap(item.id)}
        whileHover={!disabled ? { scale: 1.05, y: -3 } : {}}
        whileTap={!disabled ? { scale: 0.91 } : {}}
        disabled={disabled && cardState === 'idle'}
      >
        <span
          className="font-black leading-none"
          style={{ fontSize: '40px', fontFamily: 'Poppins, Arial, sans-serif' }}
        >
          {item.word}
        </span>

        {(cardState === 'correct' || cardState === 'reveal') && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-[#2D6A4A] bg-[#A8D5BA]/50 rounded-full px-2 py-0.5"
          >
            {item.ending}
          </motion.span>
        )}

        {cardState === 'correct' && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-end justify-start p-2 rounded-[24px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Check size={20} className="text-[#52B788] drop-shadow" strokeWidth={3} />
          </motion.div>
        )}
        {cardState === 'wrong' && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-end justify-start p-2 rounded-[24px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <X size={20} className="text-[#FF6B6B] drop-shadow" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
);

// ── Results Screen ────────────────────────────────────────────────────────────

const ResultsScreen = ({ score, total, onRetry, onHome }) => {
  const pct   = total ? Math.round((score / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white/88 backdrop-blur-sm rounded-[36px] p-8 shadow-2xl
                 text-center max-w-xs w-full mx-auto mt-4"
    >
      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">ඉවරයි!</h2>
      <p className="text-[#2D6A4A] font-semibold text-base mb-2">
        ප්‍රශ්න {total}න් <strong className="text-[#1A4A2A]">{score}</strong>ක් නිවැරදියි
      </p>

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
          src={monkeyScoreboardImg}
          alt="ලකුණු පුවරුව අල්ලාගෙන සිටින වඳුරා"
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

      <div className="flex justify-center gap-2 mb-4" aria-label={`${stars} stars out of 3`}>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span key={i}
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}>
            <Star size={36} strokeWidth={1.5}
              className={i < stars ? 'text-[#FFD166] fill-[#FFD166]' : 'text-[#A8D5BA]'} />
          </motion.span>
        ))}
      </div>

      <div className="inline-flex items-center justify-center rounded-full bg-[#F4A261]
                      text-white font-black text-sm px-5 py-2 shadow-md mb-5">
        {pct}%
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={onRetry}
          className="px-5 py-3 rounded-2xl bg-[#A8D5BA] text-[#1A3A2A] font-bold text-sm
                     border-2 border-[#7CB89A] hover:scale-105 active:scale-95 transition-transform
                     flex items-center gap-2">
          <RotateCcw size={15} strokeWidth={2} /> නැවත
        </button>
        <button onClick={onHome}
          className="px-5 py-3 rounded-2xl bg-[#BDE0FE] text-[#1A3060] font-bold text-sm
                     border-2 border-[#8EC8FF] hover:scale-105 active:scale-95 transition-transform
                     flex items-center gap-2">
          <Home size={15} strokeWidth={2} /> නිවස
        </button>
      </div>
    </motion.div>
  );
};

// ── Main Game ─────────────────────────────────────────────────────────────────

/**
 * RhymeOddOneOut
 * Child reads the reference and choices, then taps the ONE that does not rhyme.
 */
const RhymeOddOneOut = () => {
  const navigate            = useNavigate();
  const { replay, stop: stopInstruction } = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  const questions = useMemo(() => {
    const raw = RO_LEVELS[level] ?? RO_LEVELS[1];
    return raw.map(q => ({ ...q, shuffled: shuffle(q.wordIds) }));
  }, [level]);

  // phase: intro | choosing | correct | wrong | finished
  const [qIndex,        setQIndex]       = useState(0);
  const [phase,         setPhase]        = useState('intro');
  const [selectedId,    setSelectedId]   = useState(null);
  const [score,         setScore]        = useState(0);
  useDyslexiaGameSession({ gameKey: 'rhyme-odd-one-out', level, totalQuestions: questions.length, started: phase !== 'intro', finished: phase === 'finished', score });

  const q          = questions[qIndex];
  const promptItem = RO_WORDS[q.promptId];
  const wordItems  = q.shuffled.map(id => RO_WORDS[id]);
  const oddItem    = RO_WORDS[q.oddId];
  const gridCols   = wordItems.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';

  // ── Auto-advance after correct ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'correct') return;
    const t = setTimeout(() => {
      if (qIndex + 1 >= questions.length) setPhase('finished');
      else {
        setQIndex(i => i + 1);
        setSelectedId(null);
        setPhase('choosing');
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-reset after wrong ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'wrong') return;
    const t = setTimeout(() => { setSelectedId(null); setPhase('choosing'); }, 1100);
    return () => clearTimeout(t);
  }, [phase]);

  const handleTap = useCallback((id) => {
    if (phase !== 'choosing') return;
    setSelectedId(id);
    if (id === q.oddId) { setScore(s => s + 1); playCorrect(); setPhase('correct'); }
    else                { playWrong(); setPhase('wrong'); }
  }, [phase, q.oddId]);

  const getCardState = (id) => {
    if (phase === 'correct' || phase === 'wrong') {
      if (id === q.oddId) return phase === 'correct' && selectedId === id ? 'correct'
                               : phase === 'correct' ? 'correct'
                               : 'reveal'; // show rhyming words in reveal state after wrong
      if (id === selectedId && phase === 'wrong') return 'wrong';
      return phase === 'correct' ? 'reveal' : 'idle';
    }
    return 'idle';
  };

  const handleStart = () => {
    stopInstruction();
    setSelectedId(null);
    setPhase('choosing');
  };

  const handleRetry = () => {
    setQIndex(0); setScore(0); setSelectedId(null); setPhase('intro');
  };

  const statusMsg = () => {
    if (phase === 'correct')
      return (
        <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> &quot;{oddItem.word}&quot; යනු &quot;{promptItem.word}&quot; සමඟ නොගැළපෙන වචනයයි!</>
      );
    if (phase === 'wrong')
      return (
        <><X size={16} className="text-[#FF6B6B]" strokeWidth={2.5} /> නැවත උත්සාහ කරන්න!</>
      );
    return <>&quot;{promptItem.word}&quot; සමඟ <strong>ශබ්දයෙන් නොගැළපෙන</strong> වචනය තෝරන්න</>;
  };

  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #FFF3E8 0%, #FFECD2 30%, #E8F4FD 70%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CorrectAnswerCelebration active={phase === 'correct'} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <Sun     size={50} className="absolute top-4  right-8   opacity-35 text-[#F7A84A]" strokeWidth={1.2} />
        <Cloud   size={34} className="absolute top-3  left-10   opacity-20 text-[#2D6A4A]" strokeWidth={1.2} />
        <Leaf    size={28} className="absolute bottom-6 left-4  opacity-30 text-[#2D6A4A]" strokeWidth={1.2} />
        <Flower2 size={26} className="absolute bottom-6 right-4 opacity-25 text-[#FF9A9A]" strokeWidth={1.2} />
        <Music2  size={22} className="absolute top-1/3 left-3   opacity-15 text-[#F4A261]" strokeWidth={1.2} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dyslexia')}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#F4A261] text-[#7A3A0A]
                       flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#7A3A0A] font-semibold text-sm flex items-center justify-center gap-1">
              <Music2 size={14} strokeWidth={2} /> නොගැළපෙන රිද්ම වචනය
            </p>
            {phase !== 'finished' && phase !== 'intro' && (
              <p className="text-[#4A2000] font-black text-sm">
                {qIndex + 1} / {questions.length} · මට්ටම {level}
              </p>
            )}
          </div>

          <div className="w-11 h-11 rounded-2xl bg-[#FFD166]/85 border-2 border-[#E6B800]
                          flex items-center justify-center" aria-label={`Score ${score}`}>
            <span className="text-[#4A3000] font-black text-base">{score}</span>
          </div>
        </div>

        {/* Progress bar */}
        {phase !== 'finished' && phase !== 'intro' && (
          <div className="mb-4 h-3 rounded-full bg-white/50 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#F4A261] to-[#FFD166]"
              animate={{ width: `${((qIndex + (phase === 'correct' ? 1 : 0)) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

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
              title="නොගැළපෙන රිද්ම වචනය"
              instruction="මුල් වචනය කියවා, අනෙක් වචන අතරින් ශබ්දයෙන් නොගැළපෙන වචනය තෝරන්න!"
              level={level}
              total={questions.length}
              onStart={handleStart}
            />
          </AnimatePresence>
        ) : (
          <>
            {/* Instruction card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`instr-${qIndex}`}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.28 }}
                className="bg-white/88 backdrop-blur-sm rounded-[28px] shadow-lg border-4
                           border-[#F4C28A] p-4 text-center mb-4"
              >
                <p className="text-[#7A3A0A] font-semibold text-sm mb-2">
                  මුල් වචනය කියවා, ඒ සමඟ <strong>ශබ්දයෙන් නොගැළපෙන</strong> වචනය තෝරන්න
                </p>

                <div
                  className="mx-auto w-fit min-w-32 rounded-2xl border-[3px] border-[#F4A261]
                             bg-[#FFF3E8] px-6 py-3 text-[#7A3A0A] font-black text-4xl"
                  aria-label={`මුල් වචනය ${promptItem.word}`}
                >
                  {promptItem.word}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Status label */}
            <p className="text-center text-[#7A3A0A] font-semibold text-sm mb-3
                          flex items-center justify-center gap-2">
              {statusMsg()}
            </p>

            {/* Word cards grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`cards-${qIndex}`}
                className={`grid ${gridCols} gap-4`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {wordItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <WordCard
                      item={item}
                      cardState={getCardState(item.id)}
                      onTap={handleTap}
                      disabled={phase !== 'choosing'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Post-answer rhyme explanation */}
            {(phase === 'correct' || phase === 'wrong') && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-5 bg-white/75 border-2 border-[#F4C28A] rounded-2xl
                           px-4 py-3 text-center text-sm text-[#7A3A0A] font-semibold"
              >
                {phase === 'correct' ? (
                  <>
                    <Check size={14} className="inline text-[#52B788] mr-1" strokeWidth={2.5} />
                    <strong>{promptItem.word}</strong> සමඟ ගැළපෙන වචන:{' '}
                    {q.wordIds
                      .filter(id => id !== q.oddId)
                      .map(id => <strong key={id} className="mx-1">{RO_WORDS[id].word}</strong>)}
                    — ගැළපෙන අවසාන ශබ්දය: <strong>{promptItem.ending}</strong>
                  </>
                ) : (
                  <>
                    <X size={14} className="inline text-[#FF6B6B] mr-1" strokeWidth={2.5} />
                    <strong>{oddItem.word}</strong> යනු <strong>{promptItem.word}</strong> සමඟ නොගැළපෙන වචනයයි — නැවත උත්සාහ කරන්න
                  </>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default RhymeOddOneOut;
