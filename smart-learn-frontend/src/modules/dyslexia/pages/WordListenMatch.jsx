import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import yahanaAudio  from '../../../assets/voice/word-listen-yahana.mp3';
import pahanaAudio  from '../../../assets/voice/word-listen-pahana.mp3';
import ahasaAudio   from '../../../assets/voice/word-listen-ahasa.mp3';
import nayanaAudio  from '../../../assets/voice/word-listen-nayana.mp3';
import kadayaAudio  from '../../../assets/voice/word-listen-kadaya.mp3';
import kasayaAudio  from '../../../assets/voice/word-listen-kasaya-enhanced.wav';
import panahaAudio  from '../../../assets/voice/word-listen-panaha-enhanced.wav';
import introImg     from '../../../assets/images/background/hearele.png';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import CorrectAnswerCelebration from '../components/CorrectAnswerCelebration';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Check, X, ArrowLeft, RotateCcw, Home,
  Star, Sun, Cloud, Leaf, Flower2, Headphones,
} from 'lucide-react';
import { WORDS_MAP, WORD_IMAGE_LEVELS } from '../data/wordImageData';
import pandaScoreboardImg from '../../../assets/images/word-listen-match-panda-scoreboard.png';

// ── Word → audio file map ─────────────────────────────────────────────────────
const WORD_AUDIO = {
  bed:   yahanaAudio,
  lamp:  pahanaAudio,
  sky:   ahasaAudio,
  eyes:  nayanaAudio,
  nose:  kadayaAudio,
  rope:  kasayaAudio,
  fifty: panahaAudio,
};

// ── TTS ───────────────────────────────────────────────────────────────────────

const speakWithTTS = (word, cb) => {
    const synth = window.speechSynthesis;
    if (!synth) { cb?.(); return; }
    if (synth.paused) synth.resume();
    synth.cancel();
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'si-LK'; u.rate = 0.55; u.pitch = 1.05; u.volume = 1;
      const sinhalaVoice = synth.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith('si'));
      if (sinhalaVoice) u.voice = sinhalaVoice;
      u.onend = () => cb?.();
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

// ── Listen Prompt Card ────────────────────────────────────────────────────────

const ListenCard = ({ onSpeak, isSpeaking }) => (
  <div className="bg-white/88 backdrop-blur-sm rounded-[32px] shadow-xl
                  border-4 border-[#A8D5BA] p-6 text-center">
    <p className="text-[#2D6A4A] font-semibold text-base mb-5">
      ශබ්දය අසා නිවැරදි වචනය තෝරන්න
    </p>

    {/* Big speaker button */}
    <motion.button
      onClick={onSpeak}
      disabled={isSpeaking}
      className={`relative mx-auto w-28 h-28 rounded-full flex items-center justify-center shadow-lg
                  border-4 border-white/80
                  ${isSpeaking
                    ? 'bg-[#BDE0FE] cursor-default'
                    : 'bg-gradient-to-br from-[#52B788] to-[#A8D5BA] hover:scale-105 active:scale-95'}
                  transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]`}
      whileHover={!isSpeaking ? { scale: 1.08 } : {}}
      whileTap={!isSpeaking ? { scale: 0.92 } : {}}
      aria-label="Tap to hear the word"
    >
      {/* Ripple while speaking */}
      {isSpeaking && (
        <>
          <motion.div
            className="absolute w-28 h-28 rounded-full bg-[#BDE0FE]/60"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute w-28 h-28 rounded-full bg-[#BDE0FE]/35"
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
  idle:    'border-white/60 bg-white/85 text-[#1A4A2A] hover:bg-white/95 hover:scale-[1.03] active:scale-95',
  correct: 'border-[#52B788] ring-4 ring-[#A8D5BA]/70 bg-[#E8F8EF] text-[#1A4A2A]',
  wrong:   'border-[#FF6B6B] ring-4 ring-[#FFB3B3]/70 bg-[#FFF0EF] text-[#7A1A1A]',
};

const WordChoice = ({ item, state, onSelect, disabled }) => (
  <motion.button
    onClick={() => !disabled && onSelect(item.id)}
    disabled={disabled && state === 'idle'}
    className={`w-full rounded-3xl border-4 shadow-md py-5 px-4
                text-center font-black transition-all
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                ${CHOICE_STYLE[state]}`}
    style={{ fontSize: '40px', fontFamily: 'Poppins, Arial, sans-serif', lineHeight: 1.3 }}
    animate={state === 'wrong' ? { x: [-8, 8, -6, 6, -3, 3, 0] } : state === 'correct' ? { scale: [1, 1.06, 1] } : {}}
    transition={
      state === 'wrong'   ? { duration: 0.42 } :
      state === 'correct' ? { duration: 0.35 } :
      { type: 'spring', stiffness: 280, damping: 18 }
    }
    aria-label={item.word}
    aria-pressed={state !== 'idle'}
  >
    <span className="relative">
      {item.word}
      {state === 'correct' && (
        <span className="absolute -right-8 top-0">
          <Check size={22} className="text-[#52B788]" strokeWidth={3} />
        </span>
      )}
      {state === 'wrong' && (
        <span className="absolute -right-8 top-0">
          <X size={22} className="text-[#FF6B6B]" strokeWidth={3} />
        </span>
      )}
    </span>
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
        <img src={pandaScoreboardImg} alt="ලකුණු පුවරුව අල්ලාගෙන සිටින පැන්ඩා"
          className="block w-full h-auto drop-shadow-xl" />
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

      <div className="flex justify-center gap-2 mb-4" aria-label={`${stars} stars`}>
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

const WordListenMatch = () => {
  const navigate            = useNavigate();
  const { replay, stop: stopInstruction } = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  // Build question list (with shuffled choices) once per level
  const questions = useMemo(() => {
    const raw = WORD_IMAGE_LEVELS[level] ?? WORD_IMAGE_LEVELS[1];
    return raw.map(q => ({ ...q, shuffledChoices: shuffle(q.choices) }));
  }, [level]);

  const [qIndex,     setQIndex]     = useState(0);
  const [phase,      setPhase]      = useState('intro'); // intro|speaking|choosing|correct|wrong|finished
  const [selectedId, setSelectedId] = useState(null);
  const [score,      setScore]      = useState(0);
  useDyslexiaGameSession({ gameKey: 'word-listen-match', level, totalQuestions: questions.length, started: phase !== 'intro', finished: phase === 'finished', score });
  const speakingRef  = useRef(false);
  const startedRef   = useRef(false);
  const audioContextRef = useRef(null);
  const wordSourceRef = useRef(null);
  const audioBufferCacheRef = useRef(new Map());
  const playbackTokenRef = useRef(0);

  const q           = questions[qIndex];
  const correctItem = WORDS_MAP[q.wordId];
  const choiceItems = q.shuffledChoices.map(id => WORDS_MAP[id]);

  const finishSpeaking = useCallback(() => {
    speakingRef.current = false;
    setPhase(p => p === 'speaking' ? 'choosing' : p);
  }, []);

  const stopCurrentWord = useCallback(() => {
    playbackTokenRef.current += 1;
    if (wordSourceRef.current) {
      wordSourceRef.current.onended = null;
      try { wordSourceRef.current.stop(); } catch { /* already stopped */ }
      wordSourceRef.current.disconnect();
      wordSourceRef.current = null;
    }
    window.speechSynthesis?.cancel();
    speakingRef.current = false;
  }, []);

  // ── Speak on new question ────────────────────────────────────────────────
  const doSpeak = useCallback(async () => {
    if (speakingRef.current) return;
    stopInstruction();
    speakingRef.current = true;
    setPhase('speaking');
    const audioFile = WORD_AUDIO[q.wordId] ?? null;
    const playbackToken = ++playbackTokenRef.current;

    if (!audioFile) {
      speakWithTTS(correctItem.word, finishSpeaking);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio is unavailable');
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContextClass();
      }
      const context = audioContextRef.current;
      if (context.state === 'suspended') await context.resume();

      let buffer = audioBufferCacheRef.current.get(audioFile);
      if (!buffer) {
        const response = await fetch(audioFile);
        if (!response.ok) throw new Error(`Audio request failed: ${response.status}`);
        buffer = await context.decodeAudioData(await response.arrayBuffer());
        audioBufferCacheRef.current.set(audioFile, buffer);
      }
      if (playbackToken !== playbackTokenRef.current) return;

      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      gain.gain.value = 1;
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        if (playbackToken !== playbackTokenRef.current) return;
        wordSourceRef.current = null;
        finishSpeaking();
      };
      wordSourceRef.current = source;
      source.start(0);
    } catch {
      if (playbackToken === playbackTokenRef.current) {
        speakWithTTS(correctItem.word, finishSpeaking);
      }
    }
  }, [correctItem.word, finishSpeaking, q.wordId, stopInstruction]);

  useEffect(() => () => {
    stopCurrentWord();
    audioContextRef.current?.close().catch(() => {});
  }, [stopCurrentWord]);

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
      if (qIndex + 1 >= questions.length) {
        setPhase('finished');
      } else {
        setQIndex(i => i + 1);
        setPhase('speaking');
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-reset after wrong ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'wrong') return;
    const t = setTimeout(() => {
      setSelectedId(null);
      setPhase('choosing');
    }, 900);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Answer handler ───────────────────────────────────────────────────────
  const handleSelect = useCallback((id) => {
    if (phase !== 'choosing') return;
    setSelectedId(id);
    if (id === q.wordId) {
      setScore(s => s + 1);
      playCorrect();
      setPhase('correct');
    } else {
      playWrong();
      setPhase('wrong');
    }
  }, [phase, q.wordId]);

  const getCardState = (id) => {
    if (selectedId === id)                       return id === q.wordId ? 'correct' : 'wrong';
    if (phase === 'correct' && id === q.wordId)  return 'correct';
    return 'idle';
  };

  const handleStart = () => {
    stopInstruction();
    startedRef.current = true;
    speakingRef.current = false;
    doSpeak();
  };

  const handleRetry = () => {
    stopCurrentWord();
    stopInstruction();
    speakingRef.current = false;
    startedRef.current = false;
    setQIndex(0); setScore(0); setSelectedId(null); setPhase('intro');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CorrectAnswerCelebration active={phase === 'correct'} />
      {/* Decorations */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <Sun     size={50} className="absolute top-4  right-8    opacity-35 text-[#F7A84A]" strokeWidth={1.2} />
        <Cloud   size={34} className="absolute top-3  left-10   opacity-20 text-[#2D6A4A]" strokeWidth={1.2} />
        <Leaf    size={28} className="absolute bottom-6 left-4   opacity-30 text-[#2D6A4A]" strokeWidth={1.2} />
        <Flower2 size={26} className="absolute bottom-6 right-4  opacity-25 text-[#FF9A9A]" strokeWidth={1.2} />
        <Leaf    size={20} className="absolute top-1/2 left-2    opacity-15 text-[#2D6A4A] rotate-45" strokeWidth={1.2} />
      </div>

      <div className="relative z-10 max-w-sm mx-auto px-4 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { stopCurrentWord(); stopInstruction(); navigate('/dyslexia'); }}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                       flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#2D6A4A] font-semibold text-sm flex items-center justify-center gap-1">
              <Headphones size={14} strokeWidth={2} /> ශබ්ද - වචන ගැළපීම
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
            onHome={() => { stopCurrentWord(); stopInstruction(); navigate('/dyslexia'); }}
          />
        ) : phase === 'intro' ? (
          <AnimatePresence mode="wait">
            <IntroCard
              key="intro"
              title="ශබ්ද - වචන ගැළපීම"
              instruction="ශබ්දය හොඳින් අසා, ශ්‍රවණය කළ වචනය ස්පර්ශ කරන්න!"
              level={level}
              total={questions.length}
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
                className="relative"
              >
                <ListenCard
                  onSpeak={doSpeak}
                  isSpeaking={phase === 'speaking'}
                />
              </motion.div>
            </AnimatePresence>

            {/* Instruction */}
            <p className="text-center text-[#2D6A4A] font-semibold text-sm mt-4 mb-3
                          flex items-center justify-center gap-2">
              {phase === 'speaking' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#4AA8D8] animate-pulse inline-block" />
                  ශ්‍රවණය කරයි...
                </>
              ) : phase === 'correct' ? (
                <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> නිවැරදිම!</>
              ) : (
                <>නිවැරදි වචනය තෝරන්න</>
              )}
            </p>

            {/* Word choices */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`choices-${qIndex}`}
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {choiceItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <WordChoice
                      item={item}
                      state={getCardState(item.id)}
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

export default WordListenMatch;
