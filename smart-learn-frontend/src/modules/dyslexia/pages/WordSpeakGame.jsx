import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import CorrectAnswerCelebration from '../components/CorrectAnswerCelebration';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import introImg from '../../../assets/images/background/monk.png';
import pandaScoreboardImg from '../../../assets/images/word-listen-match-panda-scoreboard.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Check, X, Volume2, Star, RotateCcw, Home,
  ArrowLeft, AlertTriangle, Lightbulb, Sun, Cloud, Leaf, Flower2,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const ALL_WORDS = [
  { id: 'bed',   english: 'bed',   display: 'යහන',  hint: 'ය · හ · න', image: '/src/assets/images/3letters/bed.jpg'   },
  { id: 'lamp',  english: 'lamp',  display: 'පහන',  hint: 'ප · හ · න', image: '/src/assets/images/3letters/lamp.jpg'  },
  { id: 'nose',  english: 'nose',  display: 'නහය',  hint: 'න · හ · ය', image: '/src/assets/images/3letters/nose.jpg'  },
  { id: 'rope',  english: 'rope',  display: 'කසය',  hint: 'ක · ස · ය', image: '/src/assets/images/3letters/rope.png'  },
  { id: 'fifty', english: 'fifty', display: 'පනහ',  hint: 'ප · න · හ', image: '/src/assets/images/3letters/fifty.jpg' },
  { id: 'sky',   english: 'sky',   display: 'ගඟන',  hint: 'ග · ඟ · න', image: '/src/assets/images/3letters/sky.jpg'   },
  { id: 'eyes',  english: 'eyes',  display: 'නයන',  hint: 'න · ය · න', image: '/src/assets/images/3letters/eyes.jpg'  },
];

const LEVEL_WORDS = {
  1: ['bed',  'lamp',  'nose', 'sky'],
  2: ['rope', 'eyes',  'bed',  'lamp', 'nose'],
  3: ['bed',  'lamp',  'nose', 'rope', 'fifty', 'sky', 'eyes'],
};

const MAX_ATTEMPTS = 3;

// ── Audio (Web Audio API) ─────────────────────────────────────────────────────

const playCorrect = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
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
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sawtooth'; osc.frequency.value = 200;
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.42);
  } catch {
    return;
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
// ── Sub-components ────────────────────────────────────────────────────────────

const MicButton = ({ phase, onClick }) => {
  const isListening = phase === 'listening';
  const isCorrect   = phase === 'correct';
  const isWrong     = phase === 'wrong';

  const bg = isListening
    ? 'bg-[#FF6B6B]'
    : isCorrect
    ? 'bg-[#52B788]'
    : isWrong
    ? 'bg-[#FFD166]'
    : 'bg-gradient-to-br from-[#A8D5BA] to-[#52B788]';

  const IconEl = isCorrect ? Check : isWrong ? X : Mic;
  const iconColor = (isListening || isCorrect || isWrong) ? 'text-white' : 'text-[#1A4A2A]';

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
          <motion.div
            className="absolute inset-0 rounded-full bg-[#FF6B6B]/40"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-[#FF6B6B]/25"
            animate={{ scale: [1, 2.1], opacity: [0.5, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </>
      )}
      <IconEl size={38} className={`z-10 ${iconColor}`} strokeWidth={isCorrect || isWrong ? 2.5 : 2} />
    </motion.button>
  );
};

const WordCard = ({ word, onSpeak }) => (
  <div className="bg-white/88 backdrop-blur-sm rounded-[32px] shadow-xl
                  border-4 border-[#A8D5BA] overflow-hidden">
    <div className="w-full h-52 sm:h-56 bg-white flex items-center justify-center overflow-hidden">
      <img
        src={word.image}
        alt={word.display}
        className="block w-full h-full object-contain p-3 sm:p-4"
        draggable={false}
      />
    </div>

    <div className="p-4 text-center">
      <motion.button
        onClick={onSpeak}
        className="text-[#1A4A2A] font-black tracking-widest
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD166]"
        style={{ fontSize: '52px', fontFamily: 'Poppins, Arial, sans-serif', lineHeight: 1.2 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`Word: ${word.english}, tap to hear`}
      >
        {word.display}
      </motion.button>

      <p className="text-[#52B788] font-semibold text-lg tracking-[0.2em] mt-1">
        {word.hint}
      </p>

      <p className="text-[#2D6A4A] text-xs mt-2 opacity-70 flex items-center justify-center gap-1">
        <Volume2 size={13} /> ස්පර්ශ කර ශබ්දය අසන්න
      </p>
    </div>
  </div>
);

const AttemptDots = ({ attempts, max }) => (
  <div className="flex gap-2 justify-center mt-3" aria-label={`Attempt ${attempts} of ${max}`}>
    {Array.from({ length: max }, (_, i) => (
      <div
        key={i}
        className={`w-3 h-3 rounded-full transition-colors duration-300
          ${i < attempts ? 'bg-[#FF6B6B]' : 'bg-[#A8D5BA]/60'}`}
      />
    ))}
  </div>
);

const FeedbackBanner = ({ phase, heard, targetWord }) => {
  if (phase === 'idle' || phase === 'listening') return null;

  const configs = {
    correct: {
      bg:      'bg-[#E8F8EF] border-[#52B788]',
      icon:    <Check size={20} className="text-[#52B788]" strokeWidth={2.5} />,
      text:    'හරියටම හරි! ඉතා හොඳයි!',
      sub:     null,
    },
    wrong: {
      bg:      'bg-[#FFF3CD] border-[#FFD166]',
      icon:    <X size={20} className="text-[#B45309]" strokeWidth={2.5} />,
      text:    `"${heard || '...'}" — නැවත උත්සාහ කරන්න`,
      sub:     null,
    },
    reveal: {
      bg:      'bg-[#FFF0EF] border-[#FF9A9A]',
      icon:    <Lightbulb size={20} className="text-[#E25C00]" strokeWidth={2} />,
      text:    `නිවැරදි ශබ්දය: "${targetWord}"`,
      sub:     'නිවැරදි ශබ්දය ඇසෙනු ඇත',
    },
  };

  const c = configs[phase];
  if (!c) return null;

  return (
    <motion.div
      key={phase + heard}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
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
        වචන {total}න් <strong className="text-[#1A4A2A]">{score}</strong>ක් නිවැරදිව කිව්වා
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

      <div className="flex justify-center gap-2 mb-4" aria-label={`${stars} stars out of 3`}>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}
          >
            <Star
              size={36}
              strokeWidth={1.5}
              className={i < stars ? 'text-[#FFD166] fill-[#FFD166]' : 'text-[#A8D5BA]'}
            />
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
          className="px-5 py-3 rounded-2xl bg-[#A8D5BA] text-[#1A3A2A] font-bold text-sm
                     border-2 border-[#7CB89A] hover:scale-105 active:scale-95 transition-transform
                     flex items-center gap-2"
        >
          <RotateCcw size={16} strokeWidth={2} /> නැවත
        </button>
        <button
          onClick={onHome}
          className="px-5 py-3 rounded-2xl bg-[#BDE0FE] text-[#1A3060] font-bold text-sm
                     border-2 border-[#8EC8FF] hover:scale-105 active:scale-95 transition-transform
                     flex items-center gap-2"
        >
          <Home size={16} strokeWidth={2} /> නිවස
        </button>
      </div>
    </motion.div>
  );
};

// ── Main game component ───────────────────────────────────────────────────────

const WordSpeakGame = () => {
  const navigate            = useNavigate();
  const { replay }          = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  const words = useMemo(
    () => (LEVEL_WORDS[level] ?? LEVEL_WORDS[1]).map(id => ALL_WORDS.find(w => w.id === id)),
    [level]
  );

  const [wIndex,   setWIndex]   = useState(0);
  const [phase,    setPhase]    = useState('intro');
  const [attempts, setAttempts] = useState(0);
  const [heard,    setHeard]    = useState('');
  const [score,    setScore]    = useState(0);
  useDyslexiaGameSession({ gameKey: 'word-speak', level, totalQuestions: words.length, started: phase !== 'intro', finished: phase === 'finished', score });

  const recogRef   = useRef(null);
  const startedRef = useRef(false);
  const word       = words[wIndex];

  useEffect(() => () => { recogRef.current?.abort(); }, []);

  useEffect(() => {
    if (!startedRef.current) return;
    if (phase === 'idle') speakWord(words[wIndex].display);
  }, [wIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'correct') {
      const t = setTimeout(() => advance(), 2500);
      return () => clearTimeout(t);
    }
    if (phase === 'reveal') {
      speakWord(word.display);
      const t = setTimeout(() => advance(), 4000);
      return () => clearTimeout(t);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    if (wIndex + 1 >= words.length) {
      setPhase('finished');
    } else {
      setWIndex(i => i + 1);
      setAttempts(0);
      setHeard('');
      setPhase('idle');
    }
  }, [wIndex, words.length]);

  const startListening = useCallback(() => {
    if (!SR) return;
    if (phase !== 'idle' && phase !== 'wrong') return;

    recogRef.current?.abort();

    const recog = new SR();
    recogRef.current = recog;
    recog.lang = 'si-LK';
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 5;

    setPhase('listening');
    setHeard('');

    recog.onresult = (e) => {
      const transcripts = [];
      for (let i = 0; i < e.results[0].length; i++) {
        transcripts.push(e.results[0][i].transcript.trim());
      }
      const target  = word.display;
      const isMatch = transcripts.some(t =>
        t === target ||
        t.includes(target) ||
        target.includes(t) ||
        [...target].every(ch => t.includes(ch))
      );

      setHeard(transcripts[0] || '');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (isMatch) {
        setScore(s => s + 1);
        playCorrect();
        setPhase('correct');
      } else if (newAttempts >= MAX_ATTEMPTS) {
        playWrong();
        setPhase('reveal');
      } else {
        playWrong();
        setPhase('wrong');
      }
    };

    recog.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') {
        setPhase('idle');
      } else {
        setPhase('wrong');
        setHeard('(ශබ්දය හඳුනාගත නොහැකිය)');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setTimeout(() => setPhase('reveal'), 400);
        }
      }
    };

    recog.onend = () => {
      if (phase === 'listening') setPhase(p => p === 'listening' ? 'idle' : p);
    };

    recog.start();

    setTimeout(() => {
      if (recogRef.current === recog) {
        recog.abort();
        setPhase(p => p === 'listening' ? 'idle' : p);
      }
    }, 15000);
  }, [phase, word, attempts]);

  const handleMicTap = () => {
    if (phase === 'wrong' || phase === 'idle') startListening();
  };

  const handleStart = () => {
    recogRef.current?.abort();
    startedRef.current = true;
    setPhase('idle');
    speakWord(words[wIndex].display);
  };

  const handleRetry = () => {
    recogRef.current?.abort();
    startedRef.current = false;
    setWIndex(0);
    setScore(0);
    setAttempts(0);
    setHeard('');
    setPhase('intro');
  };

  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CorrectAnswerCelebration active={phase === 'correct'} />
      {/* Minimalistic nature decorations */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden text-[#2D6A4A]/20">
        <Sun    size={52} className="absolute top-4  right-8  opacity-40 text-[#F7A84A]" strokeWidth={1.2} />
        <Cloud  size={36} className="absolute top-3  left-10  opacity-25"                strokeWidth={1.2} />
        <Leaf   size={30} className="absolute bottom-6 left-4  opacity-35"               strokeWidth={1.2} />
        <Flower2 size={28} className="absolute bottom-6 right-4 opacity-30 text-[#FF9A9A]" strokeWidth={1.2} />
        <Leaf   size={22} className="absolute top-1/2 left-2   opacity-15 rotate-45"    strokeWidth={1.2} />
        <Leaf   size={20} className="absolute top-1/3 right-2  opacity-15 -rotate-30"   strokeWidth={1.2} />
      </div>

      <div className="relative z-10 max-w-sm mx-auto px-4 py-8">

        {/* No SpeechRecognition warning */}
        {!SR && (
          <div className="bg-[#FFF3CD] border-2 border-[#FFD166] rounded-2xl p-4 mb-4 text-sm text-[#4A3000]">
            <p className="flex items-center gap-2 font-semibold justify-center">
              <AlertTriangle size={16} strokeWidth={2} />
              ඔබගේ බ්‍රවුසරය කථන හඳුනාගැනීමට සහාය නොදක්වයි.
            </p>
            <p className="text-center mt-1 opacity-80">Chrome හෝ Edge භාවිත කරන්න.</p>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { recogRef.current?.abort(); navigate('/dyslexia'); }}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                       flex items-center justify-center
                       hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#2D6A4A] font-semibold text-sm flex items-center justify-center gap-1">
              <Mic size={14} strokeWidth={2} /> වචන කියමු
            </p>
            {phase !== 'finished' && phase !== 'intro' && (
              <p className="text-[#1A4A2A] font-black text-sm">
                {wIndex + 1} / {words.length} · මට්ටම {level}
              </p>
            )}
          </div>

          <div
            className="w-11 h-11 rounded-2xl bg-[#FFD166]/85 border-2 border-[#E6B800]
                       flex items-center justify-center"
            aria-label={`Score ${score}`}
          >
            <span className="text-[#4A3000] font-black text-base">{score}</span>
          </div>
        </div>

        {/* Progress bar */}
        {phase !== 'finished' && phase !== 'intro' && (
          <div className="mb-5 h-3 rounded-full bg-white/50 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#A8D5BA]"
              animate={{ width: `${((wIndex + (phase === 'correct' ? 1 : 0)) / words.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Intro / Finished / Game */}
        {phase === 'finished' ? (
          <ResultsScreen
            score={score}
            total={words.length}
            onRetry={handleRetry}
            onHome={() => navigate('/dyslexia')}
          />
        ) : phase === 'intro' ? (
          <AnimatePresence mode="wait">
            <IntroCard
              key="intro"
              title="වචන කියමු"
              instruction="රූපය දෙස බලා, වචනය ශබ්ද නඟා කියා මයික්‍රෆෝනය ස්පර්ශ කරන්න!"
              level={level}
              total={words.length}
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

            {/* Instruction */}
            <p className="text-center text-[#2D6A4A] font-semibold text-base mt-5 mb-3 flex items-center justify-center gap-2">
              {phase === 'listening' ? (
                <><span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse inline-block" /> ශ්‍රවණය කරයි...</>
              ) : phase === 'correct' ? (
                <><Check size={18} className="text-[#52B788]" strokeWidth={2.5} /> හරියටම හරි!</>
              ) : phase === 'reveal' ? (
                <><Lightbulb size={18} className="text-[#E25C00]" strokeWidth={2} /> නිවැරදි ශබ්දය ඇසෙනු ඇත</>
              ) : attempts > 0 ? (
                <><Mic size={18} strokeWidth={2} /> නැවත උත්සාහ කරන්න</>
              ) : (
                <><Mic size={18} strokeWidth={2} /> මයික්‍රෆෝනය ස්පර්ශ කර වචනය කියන්න</>
              )}
            </p>

            {/* Mic button */}
            <div className="flex flex-col items-center gap-2">
              <MicButton phase={phase} onClick={handleMicTap} />
              <AttemptDots attempts={attempts} max={MAX_ATTEMPTS} />
            </div>

            {/* Feedback banner */}
            <AnimatePresence>
              <FeedbackBanner
                key={phase + heard}
                phase={phase}
                heard={heard}
                targetWord={word.display}
              />
            </AnimatePresence>
          </>
        )}
      </div>
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default WordSpeakGame;
