import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import CorrectAnswerCelebration from '../components/CorrectAnswerCelebration';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Check, X, Volume2, Star, RotateCcw, Home,
  ArrowLeft, ArrowRight, Lightbulb, Sun, Cloud, Leaf, Flower2,
} from 'lucide-react';
import liImage from '../../../assets/images/background/li.png';
import lionScoreboardImg from '../../../assets/images/two-letter-word-match-lion-scoreboard.png';
import treeImage from '../../../assets/images/2letters/tree.jpg';
import riverImage from '../../../assets/images/2letters/river.jpg';
import yellowImage from '../../../assets/images/2letters/yellow.png';
import fiveImage from '../../../assets/images/2letters/five.jpg';
import sixImage from '../../../assets/images/2letters/six.jpg';
import sevenImage from '../../../assets/images/2letters/seven.jpg';
import footImage from '../../../assets/images/2letters/foot.png';
import soilImage from '../../../assets/images/2letters/soil.jpg';

// ── Two-letter word data (image + word + letter breakdown) ────────────────────

const ALL_WORDS = [
  { id: 'gas',  display: 'ගස',  hint: 'ග · ස', image: treeImage   },
  { id: 'gang', display: 'ගඟ',  hint: 'ග · ඟ', image: riverImage  },
  { id: 'kaha', display: 'කහ',  hint: 'ක · හ', image: yellowImage },
  { id: 'paha', display: 'පහ',  hint: 'ප · හ', image: fiveImage   },
  { id: 'haya', display: 'හය',  hint: 'හ · ය', image: sixImage    },
  { id: 'hath', display: 'හත',  hint: 'හ · ත', image: sevenImage  },
  { id: 'paya', display: 'පය',  hint: 'ප · ය', image: footImage   },
  { id: 'pasa', display: 'පස',  hint: 'ප · ස', image: soilImage   },
];

const LEVEL_WORDS = {
  1: ['gas',  'kaha', 'haya', 'pasa'],
  2: ['gang', 'paha', 'hath', 'paya', 'gas'],
  3: ['gas',  'gang', 'kaha', 'paha', 'haya', 'hath', 'paya', 'pasa'],
};

const MAX_ATTEMPTS = 2;
const MAX_LEVEL = 3;

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
    // Sound effects are optional when Web Audio is unavailable.
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
    // Sound effects are optional when Web Audio is unavailable.
  }
};

// ── TTS ───────────────────────────────────────────────────────────────────────

const speakWord = (word) => {
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (synth.paused) synth.resume();
  synth.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'si-LK'; u.rate = 0.55; u.pitch = 1.05; u.volume = 1;
    synth.speak(u);
  }, 120);
};

// ── SpeechRecognition ─────────────────────────────────────────────────────────

const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
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
      src={liImage}
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
// ── Mic Button ────────────────────────────────────────────────────────────────

const MicButton = ({ phase, onClick }) => {
  const isListening = phase === 'listening';
  const isCorrect   = phase === 'correct';
  const isWrong     = phase === 'wrong';

  const bg = isListening ? 'bg-[#FF6B6B]'
           : isCorrect   ? 'bg-[#52B788]'
           : isWrong     ? 'bg-[#FFD166]'
           : 'bg-gradient-to-br from-[#A8D5BA] to-[#52B788]';

  const IconEl   = isCorrect ? Check : isWrong ? X : Mic;
  const iconClr  = (isListening || isCorrect || isWrong) ? 'text-white' : 'text-[#1A4A2A]';

  return (
    <motion.button
      onClick={onClick}
      disabled={isListening || isCorrect}
      className={`relative w-24 h-24 rounded-full ${bg} shadow-xl
                  border-4 border-white/70 flex items-center justify-center
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                  disabled:cursor-default`}
      whileHover={!isListening && !isCorrect ? { scale: 1.1 } : {}}
      whileTap={!isListening && !isCorrect ? { scale: 0.9 } : {}}
      aria-label={isListening ? 'Listening' : 'Tap to speak'}
    >
      {isListening && (
        <>
          <motion.div className="absolute inset-0 rounded-full bg-[#FF6B6B]/40"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }} />
          <motion.div className="absolute inset-0 rounded-full bg-[#FF6B6B]/25"
            animate={{ scale: [1, 2.1], opacity: [0.5, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut', delay: 0.3 }} />
        </>
      )}
      <IconEl size={38} className={`z-10 ${iconClr}`} strokeWidth={isCorrect || isWrong ? 2.5 : 2} />
    </motion.button>
  );
};

// ── Word Display Card ─────────────────────────────────────────────────────────

const WordCard = ({ word, onSpeak }) => (
  <div className="bg-white/88 backdrop-blur-sm rounded-[32px] shadow-xl
                  border-4 border-[#A8D5BA] overflow-hidden">
    {/* Image */}
    <div className="relative w-full aspect-[4/3] bg-[#F4FBF6] flex items-center justify-center p-3 sm:p-4">
      <img
        src={word.image}
        alt={word.display}
        className="block w-full h-full object-contain object-center rounded-2xl"
        draggable={false}
      />
    </div>

    {/* Word + hint */}
    <div className="p-5 text-center">
      <motion.button
        onClick={onSpeak}
        className="text-[#1A4A2A] font-black tracking-widest
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD166]"
        style={{ fontSize: '64px', fontFamily: 'Poppins, Arial, sans-serif', lineHeight: 1.1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Word: ${word.display}, tap to hear`}
      >
        {word.display}
      </motion.button>

      <p className="text-[#52B788] font-semibold text-xl tracking-[0.3em] mt-2">
        {word.hint}
      </p>

    </div>
  </div>
);

// ── Attempt Dots ──────────────────────────────────────────────────────────────

const AttemptDots = ({ attempts, max }) => (
  <div className="flex gap-2 justify-center mt-3">
    {Array.from({ length: max }, (_, i) => (
      <div key={i}
        className={`w-3 h-3 rounded-full transition-colors duration-300
          ${i < attempts ? 'bg-[#FF6B6B]' : 'bg-[#A8D5BA]/60'}`} />
    ))}
  </div>
);

// ── Feedback Banner ───────────────────────────────────────────────────────────

const FeedbackBanner = ({ phase, heard, targetWord }) => {
  if (phase === 'idle' || phase === 'listening') return null;

  const configs = {
    correct: {
      bg:   'bg-[#E8F8EF] border-[#52B788]',
      icon: <Check size={20} className="text-[#52B788]" strokeWidth={2.5} />,
      text: 'නිවැරදිම! ඉතා හොඳයි!',
      sub:  null,
    },
    wrong: {
      bg:   'bg-[#FFF3CD] border-[#FFD166]',
      icon: <X size={20} className="text-[#B45309]" strokeWidth={2.5} />,
      text: `"${heard || '...'}" — නැවත උත්සාහ කරන්න`,
      sub:  null,
    },
    reveal: {
      bg:   'bg-[#FFF0EF] border-[#FF9A9A]',
      icon: <Lightbulb size={20} className="text-[#E25C00]" strokeWidth={2} />,
      text: `නිවැරදි ශබ්දය: "${targetWord}"`,
      sub:  'නිවැරදි ශබ්දය ඇසෙනු ඇත',
    },
  };

  const c = configs[phase];
  if (!c) return null;

  return (
    <motion.div
      key={phase + heard}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`rounded-[22px] p-4 text-center border-4 shadow-lg mt-4 ${c.bg}`}
    >
      <p className="text-[#1A4A2A] font-bold text-base flex items-center justify-center gap-2">
        {c.icon} {c.text}
      </p>
      {c.sub && (
        <p className="text-[#2D6A4A] text-sm mt-1 flex items-center justify-center gap-1">
          <Volume2 size={13} /> {c.sub}
        </p>
      )}
    </motion.div>
  );
};

// ── Results Screen ────────────────────────────────────────────────────────────

const ResultsScreen = ({ score, total, onRetry, onHome, onNext }) => {
  const pct   = total ? Math.round((score / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white/88 backdrop-blur-sm rounded-[36px] p-8 shadow-2xl
                 text-center max-w-xs w-full mx-auto mt-4"
    >
      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">ඉවරයි!</h2>
      <p className="text-[#2D6A4A] font-semibold text-base mb-2">
        {total} වචනයෙන් <strong className="text-[#1A4A2A]">{score}</strong>ක් නිවැරදිව කීවා
      </p>

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.9 }}
        animate={{ opacity: 1, y: [0, -7, 0], scale: 1 }}
        transition={{ opacity: { duration: 0.35 }, scale: { type: 'spring', stiffness: 220 },
                      y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        className="relative w-full max-w-[260px] mx-auto -mt-1 mb-1"
      >
        <img src={lionScoreboardImg} alt="ලකුණු පුවරුව අල්ලාගෙන සිටින සිංහයා"
          className="block w-full h-auto drop-shadow-xl" />
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

      <div className="flex flex-wrap gap-3 justify-center">
        {onNext && (
          <button onClick={onNext}
            className="px-5 py-3 rounded-2xl bg-[#FFD166] text-[#4A3000] font-bold text-sm
                       border-2 border-[#E6B800] hover:scale-105 active:scale-95 transition-transform
                       flex items-center gap-2">
            ඊළඟ මට්ටම <ArrowRight size={16} strokeWidth={2} />
          </button>
        )}
        <button onClick={onRetry}
          className="px-5 py-3 rounded-2xl bg-[#A8D5BA] text-[#1A3A2A] font-bold text-sm
                     border-2 border-[#7CB89A] hover:scale-105 active:scale-95 transition-transform
                     flex items-center gap-2">
          <RotateCcw size={16} strokeWidth={2} /> නැවත
        </button>
        <button onClick={onHome}
          className="px-5 py-3 rounded-2xl bg-[#BDE0FE] text-[#1A3060] font-bold text-sm
                     border-2 border-[#8EC8FF] hover:scale-105 active:scale-95 transition-transform
                     flex items-center gap-2">
          <Home size={16} strokeWidth={2} /> නිවස
        </button>
      </div>
    </motion.div>
  );
};

// ── No-SR warning ─────────────────────────────────────────────────────────────

const NoSRBanner = () => (
  <div className="bg-[#FFF3CD] border-4 border-[#FFD166] rounded-[24px] p-5 text-center shadow-lg mt-4">
    <p className="text-[#7A3A00] font-bold text-sm">
      ඔබේ browser හි SpeechRecognition සහාය නැත.
      Chrome හෝ Edge browser භාවිතා කරන්න.
    </p>
  </div>
);

// ── Main Game ─────────────────────────────────────────────────────────────────

const TwoLetterSpeakGame = () => {
  const navigate            = useNavigate();
  const { replay }          = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = Number(locState?.level) || 1;

  const words = useMemo(
    () => (LEVEL_WORDS[level] ?? LEVEL_WORDS[1]).map(id => ALL_WORDS.find(w => w.id === id)),
    [level]
  );

  const [wIndex,   setWIndex]   = useState(0);
  const [phase,    setPhase]    = useState('intro'); // intro|idle|listening|correct|wrong|reveal|finished
  const [attempts, setAttempts] = useState(0);
  const [heard,    setHeard]    = useState('');
  const [score,    setScore]    = useState(0);
  useDyslexiaGameSession({ gameKey: 'two-letter-speak', level, totalQuestions: words.length, started: phase !== 'intro', finished: phase === 'finished', score });

  const recogRef = useRef(null);
  const recognitionRunRef = useRef(0);
  const listeningTimeoutRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const startedRef = useRef(false);
  const word = words[wIndex];

  // Cleanup on unmount
  useEffect(() => () => {
    recognitionRunRef.current += 1;
    recogRef.current?.abort();
    window.speechSynthesis?.cancel();
    clearTimeout(listeningTimeoutRef.current);
    clearTimeout(advanceTimeoutRef.current);
  }, []);

  // Speak word when question changes
  useEffect(() => {
    if (!startedRef.current) return;
    if (phase === 'idle') speakWord(word.display);
  }, [wIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    recognitionRunRef.current += 1;
    recogRef.current?.abort();
    clearTimeout(listeningTimeoutRef.current);
    clearTimeout(advanceTimeoutRef.current);
    if (wIndex + 1 >= words.length) {
      setPhase('finished');
    } else {
      setWIndex(i => i + 1);
      setAttempts(0);
      setHeard('');
      setPhase('idle');
    }
  }, [wIndex, words.length]);

  // Auto-advance after correct / reveal
  useEffect(() => {
    if (phase === 'correct') {
      advanceTimeoutRef.current = setTimeout(() => advance(), 2500);
      return () => clearTimeout(advanceTimeoutRef.current);
    }
    if (phase === 'reveal') {
      speakWord(word.display);
      advanceTimeoutRef.current = setTimeout(() => advance(), 4000);
      return () => clearTimeout(advanceTimeoutRef.current);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (!SR) return;
    if (phase !== 'idle' && phase !== 'wrong') return;

    recognitionRunRef.current += 1;
    const runId = recognitionRunRef.current;
    recogRef.current?.abort();
    window.speechSynthesis?.cancel();
    clearTimeout(listeningTimeoutRef.current);

    const recog = new SR();
    recogRef.current = recog;
    recog.lang = 'si-LK';
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 5;

    setPhase('listening');
    setHeard('');

    let settled = false;
    const finishAttempt = ({ transcript = '', matched = false, countAttempt = true } = {}) => {
      if (settled || recognitionRunRef.current !== runId) return;
      settled = true;
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
      recogRef.current = null;

      const newAttempts = attempts + (countAttempt ? 1 : 0);
      if (countAttempt) setAttempts(newAttempts);
      setHeard(transcript);

      if (matched) {
        setScore((current) => current + 1);
        playCorrect();
        setPhase('correct');
      } else {
        playWrong();
        setPhase(newAttempts >= MAX_ATTEMPTS ? 'reveal' : 'wrong');
      }
    };

    // 15-second timeout
    listeningTimeoutRef.current = setTimeout(() => {
      if (settled || recognitionRunRef.current !== runId) return;
      finishAttempt({ transcript: '(කාලය අවසන්)' });
      recog.abort();
    }, 15000);

    recog.onresult = (e) => {
      if (settled || recognitionRunRef.current !== runId) return;
      const transcripts = Array.from({ length: e.results[0].length }, (_, i) =>
        e.results[0][i].transcript.trim()
      );

      const target = word.display;
      // Generous match: exact / contains / char-by-char
      const isMatch = transcripts.some(t =>
        t === target ||
        t.includes(target) ||
        target.includes(t) ||
        [...target].every(ch => t.includes(ch))
      );

      finishAttempt({ transcript: transcripts[0] || '', matched: isMatch });
    };

    recog.onerror = (e) => {
      if (settled || recognitionRunRef.current !== runId || e.error === 'aborted') return;
      const message = e.error === 'not-allowed' || e.error === 'service-not-allowed'
        ? '(මයික්‍රෆෝන අවසරය අවශ්‍යයි)'
        : e.error === 'no-speech'
          ? '(හඬ ඇසුණේ නැත)'
          : '(හඬ හඳුනාගත නොහැක)';
      finishAttempt({
        transcript: message,
        countAttempt: e.error !== 'not-allowed' && e.error !== 'service-not-allowed',
      });
    };

    recog.onend = () => {
      if (!settled && recognitionRunRef.current === runId) {
        finishAttempt({ transcript: '(හඬ ඇසුණේ නැත)' });
      }
    };

    try {
      recog.start();
    } catch {
      finishAttempt({ transcript: '(මයික්‍රෆෝනය ආරම්භ කළ නොහැක)', countAttempt: false });
    }
  }, [phase, attempts, word]);

  const handleStart = () => {
    startedRef.current = true;
    setPhase('idle');
    speakWord(word.display);
  };

  const handleRetry = () => {
    recognitionRunRef.current += 1;
    recogRef.current?.abort();
    clearTimeout(listeningTimeoutRef.current);
    clearTimeout(advanceTimeoutRef.current);
    startedRef.current = false;
    setWIndex(0); setScore(0); setAttempts(0); setHeard(''); setPhase('intro');
  };

  const goToNextLevel = useCallback(() => {
    if (level >= MAX_LEVEL) return;
    recognitionRunRef.current += 1;
    recogRef.current?.abort();
    clearTimeout(listeningTimeoutRef.current);
    clearTimeout(advanceTimeoutRef.current);
    startedRef.current = false;
    setWIndex(0);
    setScore(0);
    setAttempts(0);
    setHeard('');
    setPhase('intro');
    navigate('/dyslexia/two-letter-speak', { state: { level: level + 1 } });
  }, [level, navigate]);

  // A perfect completion continues automatically. If a word still failed
  // after both attempts, the results card offers the next-level button instead.
  useEffect(() => {
    if (phase !== 'finished' || score !== words.length || level >= MAX_LEVEL) return;
    const timer = setTimeout(goToNextLevel, 2200);
    return () => clearTimeout(timer);
  }, [phase, score, words.length, level, goToNextLevel]);

  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CorrectAnswerCelebration active={phase === 'correct'} />
      {/* Nature deco */}
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
            onClick={() => { recogRef.current?.abort(); navigate('/dyslexia'); }}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                       flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#2D6A4A] font-semibold text-sm flex items-center justify-center gap-1">
              <Mic size={14} strokeWidth={2} /> කෙටි වචන කියමු
            </p>
            {phase !== 'finished' && phase !== 'intro' && (
              <p className="text-[#1A4A2A] font-black text-sm">
                {wIndex + 1} / {words.length} · මට්ටම {level}
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
              animate={{ width: `${((wIndex + (phase === 'correct' ? 1 : 0)) / words.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {phase === 'finished' ? (
          <ResultsScreen
            score={score} total={words.length}
            onRetry={handleRetry}
            onHome={() => { recogRef.current?.abort(); navigate('/dyslexia'); }}
            onNext={score < words.length && level < MAX_LEVEL ? goToNextLevel : null}
          />
        ) : phase === 'intro' ? (
          <AnimatePresence mode="wait">
            <IntroCard
              key="intro"
              icon={Mic}
              title="කෙටි වචන කියමු"
              instruction="රුපය දේස බලා, වචනය ශබ්ද නගා කියා මයික්‍රොෆොනය ස්පර්ශ කරන්න!"
              onStart={handleStart}
            />
          </AnimatePresence>
        ) : (
          <>
            {/* Word card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`word-${wIndex}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <WordCard word={word} onSpeak={() => speakWord(word.display)} />
              </motion.div>
            </AnimatePresence>

            {/* Attempt dots */}
            <AttemptDots attempts={attempts} max={MAX_ATTEMPTS} />

            {/* Instruction label */}
            <p className="text-center text-[#2D6A4A] font-semibold text-sm mt-4 mb-1
                          flex items-center justify-center gap-2">
              {phase === 'listening'
                ? <><span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse inline-block" /> ශ්‍රවණය කරයි...</>
                : phase === 'correct'
                ? <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> නිවැරදිම!</>
                : <>යතා ශබ්ද නගා කියන්න, පසුව <Mic size={14} className="inline" /> ස්පර්ශ කරන්න</>
              }
            </p>

            {/* Mic button */}
            <div className="flex justify-center mt-3">
              {SR ? (
                <MicButton phase={phase} onClick={startListening} />
              ) : (
                <NoSRBanner />
              )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              <FeedbackBanner phase={phase} heard={heard} targetWord={word.display} />
            </AnimatePresence>
          </>
        )}
      </div>
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default TwoLetterSpeakGame;
