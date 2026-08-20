import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import kahaAudio   from '../../../assets/voice/kaha.wav';
import pahaAudio   from '../../../assets/voice/paha.wav';
import hayaAudio   from '../../../assets/voice/haya.wav';
import payaAudio   from '../../../assets/voice/paya.wav';
import yahanaAudio from '../../../assets/voice/yahana.wav';
import pahanaAudio from '../../../assets/voice/pahana.wav';
import gaganaAudio from '../../../assets/voice/gagana.wav';
import nayanaAudio from '../../../assets/voice/nayana.wav';
import gasaAudio   from '../../../assets/voice/gasa.wav';
import pasaAudio   from '../../../assets/voice/pasa.wav';
import hathaAudio  from '../../../assets/voice/hatha.wav';
import introImg    from '../../../assets/images/background/monkeyy.png';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Check, X, ArrowLeft, RotateCcw, Home,
  Star, Sun, Cloud, Leaf, Flower2, Music2, PlayCircle,
} from 'lucide-react';
import { RO_WORDS, RO_LEVELS } from '../data/rhymeData';

// ── Word → audio file map ─────────────────────────────────────────────────────
const WORD_AUDIO = {
  kaha:  kahaAudio,
  paha:  pahaAudio,
  panah: null,
  haya:  hayaAudio,
  paya:  payaAudio,
  nahay: null,
  kasay: null,
  yahan: yahanaAudio,
  pahan: pahanaAudio,
  gagan: gaganaAudio,
  nayan: nayanaAudio,
  gas:   gasaAudio,
  pasa:  pasaAudio,
  hath:  hathaAudio,
  gang:  null,
};

// ── TTS / audio helpers ───────────────────────────────────────────────────────

const speakWord = (word, audioFile, cb) => {
  const useTTS = () => {
    const synth = window.speechSynthesis;
    if (!synth) { cb?.(); return; }
    if (synth.paused) synth.resume();
    synth.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'si-LK'; u.rate = 0.55; u.pitch = 1.05; u.volume = 1;
      u.onend   = () => cb?.();
      u.onerror = () => cb?.();
      synth.speak(u);
    }, 120);
  };
  if (audioFile) {
    const el = new Audio(audioFile);
    el.onended = () => cb?.();
    el.onerror = () => useTTS();
    el.play().catch(() => useTTS());
  } else {
    useTTS();
  }
};

/** Speak an array of {word, audioFile} items in sequence, calling cb when all done */
const speakAll = (items, onWordStart, cb) => {
  if (!items.length) { cb?.(); return; }
  const go = (i) => {
    if (i >= items.length) { cb?.(); return; }
    onWordStart?.(i);
    speakWord(items[i].word, items[i].audioFile, () => {
      setTimeout(() => go(i + 1), 380);
    });
  };
  go(0);
};

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
  } catch (_) {}
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
  } catch (_) {}
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
  active:  'bg-[#BDE0FE]/80 border-[#4AA8D8] text-[#0A2A5A] ring-2 ring-[#4AA8D8]',
  correct: 'bg-[#E8F8EF] border-[#52B788] text-[#1A4A2A] ring-4 ring-[#A8D5BA]',
  wrong:   'bg-[#FFF0EF] border-[#FF6B6B] text-[#1A4A2A] ring-4 ring-[#FFB3B3]',
  reveal:  'bg-[#E8F8EF] border-[#A8D5BA] text-[#2D6A4A] opacity-75',
};

const WordCard = ({ item, cardState, onTap, onSpeak, disabled, speakingId }) => {
  const isSpeaking = speakingId === item.id;

  return (
    <motion.button
      className={`${CARD_BASE} ${CARD_STATE[cardState]}`}
      onClick={() => !disabled && onTap(item.id)}
      whileHover={!disabled ? { scale: 1.05, y: -3 } : {}}
      whileTap={!disabled ? { scale: 0.91 } : {}}
      animate={
        cardState === 'wrong'
          ? { x: [-7, 7, -5, 5, -2, 2, 0] }
          : cardState === 'correct' || cardState === 'active'
          ? { scale: [1, 1.06, 1] }
          : {}
      }
      transition={
        cardState === 'wrong'
          ? { duration: 0.42 }
          : { type: 'spring', stiffness: 280, damping: 18 }
      }
      disabled={disabled && cardState === 'idle'}
    >
      {/* Speaker icon — small, tap to hear this word only */}
      <button
        onPointerDown={(e) => { e.stopPropagation(); onSpeak(item.word); }}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center
                    border-2 transition-colors
                    ${isSpeaking
                      ? 'bg-[#BDE0FE] border-[#4AA8D8]'
                      : 'bg-white/70 border-[#A8D5BA] hover:border-[#52B788]'}`}
        aria-label={`Hear ${item.word}`}
        tabIndex={-1}
      >
        <Volume2 size={13} className={isSpeaking ? 'text-[#1A4A8A]' : 'text-[#2D6A4A]'} strokeWidth={2} />
      </button>

      {/* Word text */}
      <span
        className="font-black leading-none"
        style={{ fontSize: '40px', fontFamily: 'Poppins, Arial, sans-serif' }}
      >
        {item.word}
      </span>

      {/* Rhyme ending label shown after answer */}
      {(cardState === 'correct' || cardState === 'reveal') && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-[#2D6A4A] bg-[#A8D5BA]/50 rounded-full px-2 py-0.5"
        >
          {item.ending}
        </motion.span>
      )}

      {/* Overlay icons */}
      {cardState === 'correct' && (
        <motion.div
          className="absolute inset-0 flex items-end justify-start p-2 rounded-[24px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Check size={20} className="text-[#52B788] drop-shadow" strokeWidth={3} />
        </motion.div>
      )}
      {cardState === 'wrong' && (
        <motion.div
          className="absolute inset-0 flex items-end justify-start p-2 rounded-[24px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <X size={20} className="text-[#FF6B6B] drop-shadow" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
};

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
      <motion.div
        className="flex justify-center mb-3"
        animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        <Music2 size={56} className="text-[#F4A261]" strokeWidth={1.4} />
      </motion.div>

      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">ඉවරයි!</h2>
      <p className="text-[#2D6A4A] font-semibold text-base mb-5">
        {total} ප්‍රශ්නයෙන් <strong className="text-[#1A4A2A]">{score}</strong>ක් නිවැරදි
      </p>

      <div className="flex justify-center gap-2 mb-5">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span key={i}
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}>
            <Star size={36} strokeWidth={1.5}
              className={i < stars ? 'text-[#FFD166] fill-[#FFD166]' : 'text-[#A8D5BA]'} />
          </motion.span>
        ))}
      </div>

      <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-[#F4A261] to-[#E06B2D]
                      flex flex-col items-center justify-center shadow-lg mb-6">
        <span className="text-white font-black text-3xl leading-none">{score}/{total}</span>
        <span className="text-white/80 text-sm font-semibold">{pct}%</span>
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
 * Child hears all words, then taps the ONE that does NOT rhyme with the others.
 */
const RhymeOddOneOut = () => {
  const navigate            = useNavigate();
  const { replay }          = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  const questions = useMemo(() => {
    const raw = RO_LEVELS[level] ?? RO_LEVELS[1];
    return raw.map(q => ({ ...q, shuffled: shuffle(q.wordIds) }));
  }, [level]);

  // phase: intro | playing-all | choosing | correct | wrong | finished
  const [qIndex,        setQIndex]       = useState(0);
  const [phase,         setPhase]        = useState('intro');
  const [selectedId,    setSelectedId]   = useState(null);
  const [score,         setScore]        = useState(0);
  useDyslexiaGameSession({ gameKey: 'rhyme-odd-one-out', level, totalQuestions: questions.length, started: phase !== 'intro', finished: phase === 'finished', score });
  const [activeWordIdx, setActiveWordIdx] = useState(-1); // index being spoken in play-all
  const [speakingId,    setSpeakingId]   = useState(null); // id of word being spoken solo
  const cancelRef       = useRef(false);
  const startedRef      = useRef(false);

  const q          = questions[qIndex];
  const wordItems  = q.shuffled.map(id => RO_WORDS[id]);
  const oddItem    = RO_WORDS[q.oddId];
  const gridCols   = wordItems.length <= 3 ? 'grid-cols-3' : 'grid-cols-2';

  // ── Play all words in sequence ────────────────────────────────────────────
  const doPlayAll = useCallback(() => {
    cancelRef.current = false;
    setPhase('playing-all');
    setActiveWordIdx(0);
    speakAll(
      q.shuffled.map(id => ({ word: RO_WORDS[id].word, audioFile: WORD_AUDIO[id] ?? null })),
      (i) => { if (!cancelRef.current) setActiveWordIdx(i); },
      ()  => { if (!cancelRef.current) { setActiveWordIdx(-1); setPhase('choosing'); } },
    );
  }, [q.shuffled]);

  // Auto-play all words when question changes
  useEffect(() => {
    cancelRef.current = false;
    setSelectedId(null);
    setActiveWordIdx(-1);
    setSpeakingId(null);
    setPhase('intro');
    if (!startedRef.current) return;
    // Short delay so AnimatePresence can finish transition
    const t = setTimeout(() => doPlayAll(), 350);
    return () => { t && clearTimeout(t); cancelRef.current = true; };
  }, [qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Solo word speaker button
  const handleSpeakSolo = useCallback((word) => {
    if (phase === 'playing-all') return;
    const id = Object.values(RO_WORDS).find(w => w.word === word)?.id;
    setSpeakingId(id ?? null);
    speakWord(word, id ? (WORD_AUDIO[id] ?? null) : null, () => setSpeakingId(null));
  }, [phase]);

  // ── Auto-advance after correct ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'correct') return;
    const t = setTimeout(() => {
      if (qIndex + 1 >= questions.length) setPhase('finished');
      else { setQIndex(i => i + 1); }
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
    if (activeWordIdx >= 0 && q.shuffled[activeWordIdx] === id) return 'active';
    return 'idle';
  };

  const handleStart = () => {
    startedRef.current = true;
    cancelRef.current = false;
    doPlayAll();
  };

  const handleRetry = () => {
    startedRef.current = false;
    cancelRef.current = true;
    setQIndex(0); setScore(0); setSelectedId(null); setPhase('intro');
  };

  const statusMsg = () => {
    if (phase === 'playing-all')
      return (
        <><span className="w-2 h-2 rounded-full bg-[#F4A261] animate-pulse inline-block" /> ශ්‍රවණය කරයි...</>
      );
    if (phase === 'correct')
      return (
        <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> &quot;{oddItem.word}&quot; ගලපෙන ශබ්දය නැත ({oddItem.ending})!</>
      );
    if (phase === 'wrong')
      return (
        <><X size={16} className="text-[#FF6B6B]" strokeWidth={2.5} /> නැවත උත්සාහ කරන්න!</>
      );
    return <>ගලපෙන ශබ්දය <strong>නැති</strong> වචනය ස්පර්ශ කරන්න</>;
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #FFF3E8 0%, #FFECD2 30%, #E8F4FD 70%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
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
            onClick={() => { cancelRef.current = true; navigate('/dyslexia'); }}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#F4A261] text-[#7A3A0A]
                       flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#7A3A0A] font-semibold text-sm flex items-center justify-center gap-1">
              <Music2 size={14} strokeWidth={2} /> ශබ්ද ගලපෙන වචනය
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
            onHome={() => { cancelRef.current = true; navigate('/dyslexia'); }}
          />
        ) : phase === 'intro' ? (
          <AnimatePresence mode="wait">
            <IntroCard
              key="intro"
              title="ශබ්ද ගලපේන වචනය"
              instruction="වචන හොඳින් අසා, ශබ්ද නොගැලපේන වචනය ස්පර්ශ කරන්න!"
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
                <p className="text-[#7A3A0A] font-semibold text-sm mb-3">
                  ශබ්ද <strong>නොගැලපෙන</strong>— <strong>වෙනස්</strong> වචනය තෝරන්න
                </p>

                {/* Play-all button */}
                <button
                  onClick={doPlayAll}
                  disabled={phase === 'playing-all'}
                  className={`mx-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm
                              border-2 transition-all
                              ${phase === 'playing-all'
                                ? 'bg-[#F4A261]/40 border-[#F4A261] text-[#7A3A0A] cursor-default'
                                : 'bg-[#F4A261] border-[#D07820] text-white hover:scale-105 active:scale-95'}`}
                >
                  <PlayCircle size={18} strokeWidth={2} />
                  {phase === 'playing-all' ? 'ශ්‍රවණය කරයි...' : 'සියලු වචන අසන්න'}
                </button>

                {/* Active word indicator dots */}
                <div className="flex justify-center gap-2 mt-3">
                  {q.shuffled.map((id, i) => (
                    <motion.div
                      key={id}
                      className={`w-2.5 h-2.5 rounded-full transition-colors
                        ${i === activeWordIdx ? 'bg-[#F4A261]' : 'bg-[#D0B090]/40'}`}
                      animate={i === activeWordIdx ? { scale: [1, 1.5, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  ))}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <WordCard
                      item={item}
                      cardState={getCardState(item.id)}
                      onTap={handleTap}
                      onSpeak={handleSpeakSolo}
                      disabled={phase !== 'choosing'}
                      speakingId={speakingId}
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
                    ගලපෙන වචන:{' '}
                    {q.wordIds
                      .filter(id => id !== q.oddId)
                      .map(id => <strong key={id} className="mx-1">{RO_WORDS[id].word}</strong>)}
                    — ශබ්දය: <strong>{RO_WORDS[q.wordIds.find(id => id !== q.oddId)].ending}</strong>
                  </>
                ) : (
                  <>
                    <X size={14} className="inline text-[#FF6B6B] mr-1" strokeWidth={2.5} />
                    <strong>{oddItem.word}</strong> නොගැලපෙන වචනය ({oddItem.ending}) — නැවත උත්සාහ කරන්න
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
