import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import introImg from '../../../assets/images/background/gira.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Check, X, ArrowLeft, RotateCcw, Home,
  Star, Sun, Cloud, Leaf, Flower2, ImageIcon,
} from 'lucide-react';
import { WORDS_MAP, WORD_IMAGE_LEVELS } from '../data/wordImageData';

// ── TTS ───────────────────────────────────────────────────────────────────────

const speakWord = (word, cb) => {
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
// ── Intro Card ─────────────────────────────────────────────────────────────────

const IntroCard = ({ title, instruction, level, total, onStart }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.88, y: -20 }}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    className="bg-white/90 backdrop-blur-sm rounded-[36px] shadow-2xl overflow-hidden max-w-xs w-full mx-auto mt-4"
  >
    <div className="w-full overflow-hidden" style={{ height: '160px' }}>
      <img src={introImg} alt="" className="w-full h-full object-cover" draggable={false} />
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
// ── Image + Speaker card ──────────────────────────────────────────────────────

const ImageCard = ({ item, onSpeak, isSpeaking }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-[32px] shadow-xl
                  border-4 border-[#A8D5BA] overflow-hidden">
    {/* Image */}
    <div className="aspect-video w-full overflow-hidden bg-[#F0FAF4]">
      <img
        src={item.image}
        alt="?"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>

    {/* Speaker row */}
    <div className="flex items-center justify-between px-5 py-3">
      <p className="text-[#2D6A4A] font-semibold text-sm flex items-center gap-1.5">
        <ImageIcon size={14} strokeWidth={1.8} />
        රූපය දෙස බලා <strong>වචනය</strong> තෝරන්න
      </p>

      <motion.button
        onClick={onSpeak}
        disabled={isSpeaking}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center
                    border-3 border-white/80 shadow-md
                    ${isSpeaking
                      ? 'bg-[#BDE0FE] cursor-default'
                      : 'bg-gradient-to-br from-[#52B788] to-[#A8D5BA] hover:scale-110'}
                    transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]`}
        whileTap={!isSpeaking ? { scale: 0.88 } : {}}
        aria-label="Hear word"
      >
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-[#BDE0FE]/60"
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <Volume2 size={22} className={`z-10 ${isSpeaking ? 'text-[#1A4A8A]' : 'text-[#1A4A2A]'}`} strokeWidth={1.8} />
      </motion.button>
    </div>
  </div>
);

// ── Word text choice button ───────────────────────────────────────────────────

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
    whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
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
    disabled={disabled && cardState === 'idle'}
    aria-label={item.word}
  >
    <span
      className="font-black leading-none"
      style={{ fontSize: '38px', fontFamily: 'Poppins, Arial, sans-serif' }}
    >
      {item.word}
    </span>

    {cardState === 'correct' && (
      <motion.div
        className="absolute top-2 right-2"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 320 }}
      >
        <Check size={20} strokeWidth={3} className="text-white drop-shadow" />
      </motion.div>
    )}
    {cardState === 'wrong' && (
      <motion.div
        className="absolute top-2 right-2"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
      >
        <X size={20} strokeWidth={3} className="text-white drop-shadow" />
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
      <motion.div
        className="flex justify-center mb-3"
        animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        <ImageIcon size={56} className="text-[#52B788]" strokeWidth={1.4} />
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

      <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-[#A8D5BA] to-[#52B788]
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
 * WordPickGame
 * Child sees an IMAGE and hears the word pronounced → must tap the correct Sinhala text.
 */
const WordPickGame = () => {
  const navigate            = useNavigate();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  const questions = useMemo(() => {
    const raw = WORD_IMAGE_LEVELS[level] ?? WORD_IMAGE_LEVELS[1];
    return raw.map(q => ({ ...q, shuffledChoices: shuffle(q.choices) }));
  }, [level]);

  const [qIndex,     setQIndex]     = useState(0);
  const [phase,      setPhase]      = useState('intro'); // intro|speaking|choosing|correct|wrong|finished
  const [selectedId, setSelectedId] = useState(null);
  const [score,      setScore]      = useState(0);
  const speakingRef = useRef(false);
  const startedRef  = useRef(false);

  const q           = questions[qIndex];
  const correctItem = WORDS_MAP[q.wordId];
  const choiceItems = q.shuffledChoices.map(id => WORDS_MAP[id]);
  const gridCols    = choiceItems.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';

  // ── Speak on new question ────────────────────────────────────────────────
  const doSpeak = useCallback(() => {
    if (speakingRef.current) return;
    speakingRef.current = true;
    setPhase('speaking');
    speakWord(correctItem.word, () => {
      speakingRef.current = false;
      setPhase(p => p === 'speaking' ? 'choosing' : p);
    });
  }, [correctItem.word]);

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
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-reset after wrong ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'wrong') return;
    const t = setTimeout(() => { setSelectedId(null); setPhase('choosing'); }, 1000);
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
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <Sun     size={50} className="absolute top-4  right-8   opacity-35 text-[#F7A84A]" strokeWidth={1.2} />
        <Cloud   size={34} className="absolute top-3  left-10   opacity-20 text-[#2D6A4A]" strokeWidth={1.2} />
        <Leaf    size={28} className="absolute bottom-6 left-4  opacity-30 text-[#2D6A4A]" strokeWidth={1.2} />
        <Flower2 size={26} className="absolute bottom-6 right-4 opacity-25 text-[#FF9A9A]" strokeWidth={1.2} />
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
              <ImageIcon size={14} strokeWidth={2} /> රූපයෙන් වචනය
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
              title="රූපය්න් වචනය"
              instruction="රූපය හොඳින් බලා, ශ්‍රවණය කළ වචනය ස්පර්ශ කරන්න!"
              level={level}
              total={questions.length}
              onStart={handleStart}
            />
          </AnimatePresence>
        ) : (
          <>
            {/* Image + speaker card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${qIndex}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3 }}
              >
                <ImageCard
                  item={correctItem}
                  onSpeak={doSpeak}
                  isSpeaking={phase === 'speaking'}
                />
              </motion.div>
            </AnimatePresence>

            {/* Status */}
            <p className="text-center text-[#2D6A4A] font-semibold text-sm mt-4 mb-3
                          flex items-center justify-center gap-2">
              {phase === 'speaking' ? (
                <><span className="w-2 h-2 rounded-full bg-[#4AA8D8] animate-pulse inline-block" /> ශ්‍රවණය කරයි...</>
              ) : phase === 'correct' ? (
                <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> නිවැරදිම!</>
              ) : (
                <>නිවැරදි <strong>වචනය</strong> ස්පර්ශ කරන්න</>
              )}
            </p>

            {/* Word text choices */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`choices-${qIndex}`}
                className={`grid ${gridCols} gap-3`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {choiceItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
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
    </main>
  );
};

export default WordPickGame;
