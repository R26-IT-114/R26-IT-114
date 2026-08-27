import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import gasaAudio   from '../../../assets/voice/gasa.wav';
import gangaAudio  from '../../../assets/voice/ganga.wav';
import kahaAudio   from '../../../assets/voice/kaha.wav';
import pahaAudio   from '../../../assets/voice/paha.wav';
import hayaAudio   from '../../../assets/voice/haya.wav';
import hathaAudio  from '../../../assets/voice/hatha.wav';
import payaAudio   from '../../../assets/voice/paya.wav';
import pasaAudio   from '../../../assets/voice/pasa.wav';
import lioImage   from '../../../assets/images/background/lio.png';
import lionScoreboardImg from '../../../assets/images/two-letter-word-match-lion-scoreboard.png';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Check, X, ArrowLeft, RotateCcw, Home,
  Star, Sun, Cloud, Leaf, Flower2, Headphones,
} from 'lucide-react';
import { TWO_LETTER_WORDS, TWO_LETTER_LEVELS } from '../data/twoLetterData';

// ── Word → audio file map ─────────────────────────────────────────────────────
const WORD_AUDIO = {
  gas:  gasaAudio,
  gang: gangaAudio,
  kaha: kahaAudio,
  paha: pahaAudio,
  haya: hayaAudio,
  hath: hathaAudio,
  paya: payaAudio,
  pasa: pasaAudio,
};

// ── TTS ───────────────────────────────────────────────────────────────────────

const speakWord = (word, audioFile, cb) => {
  if (audioFile) {
    const el = new Audio(audioFile);
    el.onended = () => cb?.();
    el.onerror = () => {
      // TTS fallback
      const synth = window.speechSynthesis;
      if (!synth) { cb?.(); return; }
      synth.cancel();
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'si-LK'; u.rate = 0.55; u.pitch = 1.05; u.volume = 1;
        u.onend   = () => cb?.();
        u.onerror = () => cb?.();
        synth.speak(u);
      }, 120);
    };
    el.play().catch(() => el.onerror());
    return;
  }
  // TTS only
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

// ── Correct-answer celebration cones ─────────────────────────────────────────

const CONE_PARTICLES = Array.from({ length: 18 }, (_, index) => index);
const PARTICLE_COLORS = ['#FF6B6B', '#FFD166', '#52B788', '#4AA8D8', '#A855F7', '#F97316'];

const CelebrationCones = ({ active }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        key="celebration-cones"
        className="fixed inset-0 z-[80] pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        aria-hidden="true"
      >
        {['left', 'right'].map((side) => {
          const direction = side === 'left' ? 1 : -1;
          return (
            <div key={side} className={`absolute bottom-3 ${side === 'left' ? 'left-3 sm:left-10' : 'right-3 sm:right-10'}`}>
              {CONE_PARTICLES.map((index) => {
                const spread = 22 + (index % 6) * 18;
                const rise = 135 + (index % 5) * 45;
                const isRound = index % 4 === 0;
                return (
                <motion.i
                  key={`${side}-${index}`}
                  className="absolute z-20 left-1/2 top-2 block"
                  style={{
                    width: isRound ? 9 : 7 + (index % 3) * 3,
                    height: isRound ? 9 : 15 + (index % 2) * 5,
                    borderRadius: isRound ? '50%' : 2,
                    background: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
                    boxShadow: '0 2px 3px rgba(0,0,0,0.18)',
                  }}
                  initial={{ x: 0, y: 10, opacity: 1, scale: 0.2, rotateX: 0, rotateZ: 0 }}
                  animate={{
                    x: direction * spread + direction * (index % 2 ? 34 : -18),
                    y: [10, -rise, -(rise - 55)],
                    opacity: [0, 1, 1, 0],
                    scale: [0.2, 1.15, 1, 0.75],
                    rotateX: 360 + index * 50,
                    rotateZ: direction * (160 + index * 47),
                  }}
                  transition={{ duration: 1.45 + (index % 3) * 0.12, delay: index * 0.018, ease: 'easeOut' }}
                />
                );
              })}

              {[0, 1, 2].map((index) => (
                <motion.div key={`smoke-${index}`}
                  className="absolute z-10 left-1/2 top-0 rounded-full bg-white/80 blur-[1px]"
                  style={{ width: 30 + index * 10, height: 30 + index * 10 }}
                  initial={{ x: -15, y: 4, opacity: 0, scale: 0.2 }}
                  animate={{ x: direction * (index * 24), y: -55 - index * 22, opacity: [0, 0.85, 0], scale: [0.2, 1.2, 1.7] }}
                  transition={{ duration: 0.75, delay: index * 0.06, ease: 'easeOut' }}
                />
              ))}

              <motion.div
                initial={{ scale: 0.5, y: 35 }}
                animate={{ scale: [0.5, 1.08, 1], y: 0, rotate: [direction * -8, direction * 25, direction * 18] }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 15 }}
                style={{ position: 'relative', width: 76, height: 112,
                         transformOrigin: '50% 100%', filter: 'drop-shadow(0 8px 7px rgba(0,0,0,0.28))' }}
              >
                <div style={{ position: 'absolute', inset: '8px 10px 0',
                              clipPath: 'polygon(8% 0, 92% 0, 68% 100%, 32% 100%)',
                              background: 'repeating-linear-gradient(135deg, #ef4444 0 15px, #fbbf24 15px 30px, #3b82f6 30px 45px)',
                              border: '3px solid rgba(120,55,20,0.55)' }} />
                <div style={{ position: 'absolute', left: 8, right: 8, top: 0, height: 22,
                              borderRadius: '50%', background: 'radial-gradient(ellipse, #2b1a12 0 45%, #f59e0b 50% 68%, #fde68a 72%)',
                              boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.6), 0 2px 3px rgba(0,0,0,0.3)' }} />
                <div style={{ position: 'absolute', left: 28, right: 28, bottom: -3, height: 13,
                              borderRadius: 5, background: 'linear-gradient(#f8fafc, #94a3b8)', border: '2px solid #64748b' }} />
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Intro Card ──────────────────────────────────────────────────────────────────

const IntroCard = ({ icon: Icon, title, instruction, onStart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.88, y: -20 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="bg-white/90 backdrop-blur-sm rounded-[36px] p-8 shadow-2xl
               text-center max-w-xs w-full mx-auto mt-8"
  >
    <motion.img
      src={lioImage}
      alt="Lion"
      className="w-full h-40 object-contain object-center mb-5"
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: [0, -4, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div
      className="w-20 h-20 rounded-full bg-gradient-to-br from-[#52B788] to-[#A8D5BA]
                 flex items-center justify-center mx-auto mb-4 shadow-lg"
      animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
      transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, repeatDelay: 3 }}
    >
      <Icon size={38} className="text-white" strokeWidth={1.6} />
    </motion.div>

    <h2 className="text-[#1A4A2A] text-2xl font-black mb-1">{title}</h2>

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
  </motion.div>
);

// ── Listen Card ───────────────────────────────────────────────────────────────

const ListenCard = ({ onSpeak, isSpeaking }) => (
  <div className="bg-white/88 backdrop-blur-sm rounded-[32px] shadow-xl
                  border-4 border-[#A8D5BA] p-6 text-center">
    <p className="text-[#2D6A4A] font-semibold text-base mb-5">
      ශබ්දය අසා නිවැරදි වචනය තෝරන්න
    </p>

    <motion.button
      onClick={onSpeak}
      disabled={isSpeaking}
      className={`relative mx-auto w-28 h-28 rounded-full flex items-center justify-center
                  shadow-lg border-4 border-white/80
                  ${isSpeaking
                    ? 'bg-[#BDE0FE] cursor-default'
                    : 'bg-gradient-to-br from-[#52B788] to-[#A8D5BA]'}
                  transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]`}
      whileHover={!isSpeaking ? { scale: 1.08 } : {}}
      whileTap={!isSpeaking ? { scale: 0.92 } : {}}
      aria-label="Tap to hear the word"
    >
      {isSpeaking && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-[#BDE0FE]/60"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-[#BDE0FE]/35"
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut', delay: 0.28 }}
          />
        </>
      )}
      <Volume2
        size={46}
        className={`z-10 ${isSpeaking ? 'text-[#1A4A8A]' : 'text-[#1A4A2A]'}`}
        strokeWidth={1.6}
      />
    </motion.button>

    <p className="text-[#2D6A4A] text-xs mt-4 opacity-70 flex items-center justify-center gap-1">
      <Headphones size={13} strokeWidth={1.8} />
      {isSpeaking ? 'ශ්‍රවණය කරයි...' : 'ස්පර්ශ කර නැවත අසන්න'}
    </p>
  </div>
);

// ── Word Choice Button ────────────────────────────────────────────────────────

const CHOICE_STYLE = {
  idle:    'bg-white/90 border-[#A8D5BA] text-[#1A4A2A] hover:border-[#52B788] hover:bg-[#E8F8EF]',
  correct: 'bg-[#52B788] border-[#2D9A5A] text-white ring-4 ring-[#A8D5BA]',
  wrong:   'bg-[#FF6B6B] border-[#CC3333] text-white ring-4 ring-[#FFB3B3]',
};

const WordChoice = ({ item, cardState, onSelect, disabled }) => (
  <motion.button
    className={`relative w-full rounded-3xl border-4 shadow-md px-4 py-5
                flex items-center justify-center select-none
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                transition-colors duration-150
                ${CHOICE_STYLE[cardState]}`}
    onClick={() => !disabled && onSelect(item.id)}
    whileHover={!disabled ? { scale: 1.05, y: -3 } : {}}
    whileTap={!disabled ? { scale: 0.91 } : {}}
    animate={
      cardState === 'wrong'
        ? { x: [-8, 8, -6, 6, -3, 3, 0] }
        : cardState === 'correct'
        ? { scale: [1, 1.08, 1] }
        : {}
    }
    transition={
      cardState === 'wrong'   ? { duration: 0.42 } :
      cardState === 'correct' ? { duration: 0.38 } :
      { type: 'spring', stiffness: 280, damping: 18 }
    }
    aria-label={item.word}
    disabled={disabled && cardState === 'idle'}
  >
    <span
      className="font-black leading-none"
      style={{ fontSize: '46px', fontFamily: 'Poppins, Arial, sans-serif' }}
    >
      {item.word}
    </span>

    {cardState === 'correct' && (
      <motion.div
        className="absolute top-2 right-2"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 320 }}
      >
        <Check size={22} strokeWidth={3} className="text-white drop-shadow" />
      </motion.div>
    )}
    {cardState === 'wrong' && (
      <motion.div
        className="absolute top-2 right-2"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
      >
        <X size={22} strokeWidth={3} className="text-white drop-shadow" />
      </motion.div>
    )}
  </motion.button>
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
        {total} ප්‍රශ්නයෙන් <strong className="text-[#1A4A2A]">{score}</strong>ක් නිවැරදි
      </p>

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.9 }}
        animate={{ opacity: 1, y: [0, -7, 0], scale: 1 }}
        transition={{ opacity: { duration: 0.35 }, scale: { type: 'spring', stiffness: 220 },
                      y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        className="relative w-full max-w-[260px] mx-auto -mt-1 mb-1"
      >
        <img
          src={lionScoreboardImg}
          alt="ලකුණු පුවරුව අල්ලාගෙන සිටින සිංහයා"
          className="block w-full h-auto drop-shadow-xl"
        />
        <div
          className="absolute left-[15%] right-[15%] top-[49%] h-[20%]
                     flex items-center justify-center gap-1 font-black text-[#1A4A2A]"
          style={{ textShadow: '0 2px 0 rgba(255,255,255,0.7)' }}
          aria-label={`ලකුණු ${score} / ${total}`}
        >
          <span className="text-5xl leading-none">{score}</span>
          <span className="text-2xl leading-none text-[#2D6A4A]">/ {total}</span>
        </div>
      </motion.div>

      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span key={i}
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}>
            <Star size={36} strokeWidth={1.5}
              className={i < stars ? 'text-[#FFD166] fill-[#FFD166]' : 'text-[#A8D5BA]'} />
          </motion.span>
        ))}
      </div>

      <div className="inline-flex items-center justify-center rounded-full bg-[#52B788]
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
 * TwoLetterWordMatch
 * System speaks a 2-letter Sinhala word; child picks the matching Sinhala text.
 * Reuses TWO_LETTER_WORDS + TWO_LETTER_LEVELS from twoLetterData.js.
 */
const TwoLetterWordMatch = () => {
  const navigate            = useNavigate();
  const { replay, stop: stopInstruction } = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  const questions = useMemo(() => {
    const raw = TWO_LETTER_LEVELS[level] ?? TWO_LETTER_LEVELS[1];
    return raw.map(q => ({ ...q, shuffledChoices: shuffle(q.choices) }));
  }, [level]);

  const [qIndex,     setQIndex]     = useState(0);
  const [phase,      setPhase]      = useState('intro'); // intro|speaking|choosing|correct|wrong|finished
  const [selectedId, setSelectedId] = useState(null);
  const [score,      setScore]      = useState(0);
  useDyslexiaGameSession({ gameKey: 'two-letter-word-match', level, totalQuestions: questions.length, started: phase !== 'intro', finished: phase === 'finished', score });
  const speakingRef = useRef(false);
  const startedRef  = useRef(false);

  const q           = questions[qIndex];
  const correctItem = TWO_LETTER_WORDS[q.wordId];
  const choiceItems = q.shuffledChoices.map(id => TWO_LETTER_WORDS[id]);

  // grid: 3 choices → single row of 3; 4 choices → 2×2
  const gridCols = choiceItems.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';

  // ── Speak on new question ────────────────────────────────────────────────
  const doSpeak = useCallback(() => {
    if (speakingRef.current) return;
    stopInstruction();
    speakingRef.current = true;
    setPhase('speaking');
    speakWord(correctItem.word, WORD_AUDIO[q.wordId] ?? null, () => {
      speakingRef.current = false;
      setPhase(p => p === 'speaking' ? 'choosing' : p);
    });
  }, [correctItem.word, q.wordId, stopInstruction]);

  useEffect(() => {
    if (!startedRef.current) { setSelectedId(null); return; }
    speakingRef.current = false;
    setSelectedId(null);
    doSpeak();
  }, [qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-advance after correct ───────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'correct') return;
    const t = setTimeout(() => {
      if (qIndex + 1 >= questions.length) setPhase('finished');
      else { setQIndex(i => i + 1); setPhase('speaking'); }
    }, 1600);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-reset after wrong ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'wrong') return;
    const t = setTimeout(() => { setSelectedId(null); setPhase('choosing'); }, 950);
    return () => clearTimeout(t);
  }, [phase]);

  const handleSelect = useCallback((id) => {
    if (phase !== 'choosing') return;
    setSelectedId(id);
    if (id === q.wordId) { setScore(s => s + 1); playCorrect(); setPhase('correct'); }
    else                 { playWrong(); setPhase('wrong'); }
  }, [phase, q.wordId]);

  const getCardState = (id) => {
    if (selectedId === id)                      return id === q.wordId ? 'correct' : 'wrong';
    if (phase === 'correct' && id === q.wordId) return 'correct';
    return 'idle';
  };

  const handleStart = () => {
    stopInstruction();
    startedRef.current = true;
    speakingRef.current = false;
    doSpeak();
  };

  const handleRetry = () => {
    startedRef.current = false;
    setQIndex(0); setScore(0); setSelectedId(null); setPhase('intro');
  };

  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CelebrationCones active={phase === 'correct'} />
      {/* Nature deco */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <Sun     size={50} className="absolute top-4  right-8   opacity-35 text-[#F7A84A]" strokeWidth={1.2} />
        <Cloud   size={34} className="absolute top-3  left-10   opacity-20 text-[#2D6A4A]" strokeWidth={1.2} />
        <Leaf    size={28} className="absolute bottom-6 left-4  opacity-30 text-[#2D6A4A]" strokeWidth={1.2} />
        <Flower2 size={26} className="absolute bottom-6 right-4 opacity-25 text-[#FF9A9A]" strokeWidth={1.2} />
        <Leaf    size={20} className="absolute top-1/2 left-2   opacity-15 text-[#2D6A4A] rotate-45" strokeWidth={1.2} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dyslexia')}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                       flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#2D6A4A] font-semibold text-sm flex items-center justify-center gap-1">
              <Headphones size={14} strokeWidth={2} /> කෙටි වචන ශ්‍රවණය
            </p>
            {phase !== 'finished' && phase !== 'intro' && (
              <p className="text-[#1A4A2A] font-black text-sm">
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
          <div className="mb-5 h-3 rounded-full bg-white/50 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#BDE0FE]"
              animate={{ width: `${((qIndex + (phase === 'correct' ? 1 : 0)) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Intro / Finished / Game */}
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
              icon={Headphones}
              title="කෙටි වචන ශ්‍රවණය"
              instruction="ශබ්දය හොඳින් අසා, ශ්‍රවණය කළ වචනය ස්පර්ශ කරන්න!"
              onStart={handleStart}
            />
          </AnimatePresence>
        ) : (
          <>
            {/* Listen card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`listen-${qIndex}`}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3 }}
              >
                <ListenCard onSpeak={doSpeak} isSpeaking={phase === 'speaking'} />
              </motion.div>
            </AnimatePresence>

            {/* Status label */}
            <p className="text-center text-[#2D6A4A] font-semibold text-sm mt-4 mb-3
                          flex items-center justify-center gap-2">
              {phase === 'speaking' ? (
                <><span className="w-2 h-2 rounded-full bg-[#4AA8D8] animate-pulse inline-block" /> ශ්‍රවණය කරයි...</>
              ) : phase === 'correct' ? (
                <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> නිවැරදිම!</>
              ) : (
                <>නිවැරදි වචනය ස්පර්ශ කරන්න</>
              )}
            </p>

            {/* Word text choices */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`choices-${qIndex}`}
                className={`grid ${gridCols} gap-4`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {choiceItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <WordChoice
                      item={item}
                      cardState={getCardState(item.id)}
                      onSelect={handleSelect}
                      disabled={phase !== 'choosing'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default TwoLetterWordMatch;
