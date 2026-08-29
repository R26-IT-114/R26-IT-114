import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import gasaAudio   from '../../../assets/voice/gasa.wav';
import gangaAudio  from '../../../assets/voice/ganga.wav';
import kahaAudio   from '../../../assets/voice/kaha.wav';
import pahaAudio   from '../../../assets/voice/paha.wav';
import hayaAudio   from '../../../assets/voice/haya.wav';
import hathaAudio  from '../../../assets/voice/hatha.wav';
import payaAudio   from '../../../assets/voice/paya.wav';
import pasaAudio   from '../../../assets/voice/pasa.wav';
import yahanaAudio from '../../../assets/voice/yahana.wav';
import pahanaAudio from '../../../assets/voice/pahana.wav';
import kasayaAudio from '../../../assets/voice/word-listen-kasaya-enhanced.wav';
import panahaAudio from '../../../assets/voice/word-listen-panaha-enhanced.wav';
import gaganaAudio from '../../../assets/voice/gagana.wav';
import nayanaAudio from '../../../assets/voice/nayana.wav';
import introImg    from '../../../assets/images/background/mon.png';
import monkeyScoreboardImg from '../../../assets/images/first-letter-monkey-scoreboard.png';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import CorrectAnswerCelebration from '../components/CorrectAnswerCelebration';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Check, X, ArrowLeft, RotateCcw, Home,
  Star, Sun, Cloud, Leaf, Flower2, Headphones, BookOpen,
} from 'lucide-react';
import { FL_WORDS, FL_LEVELS } from '../data/firstLetterData';

// ── Word → audio file map ─────────────────────────────────────────────────────
const WORD_AUDIO = {
  gas:   gasaAudio,
  gang:  gangaAudio,
  kaha:  kahaAudio,
  paha:  pahaAudio,
  haya:  hayaAudio,
  hath:  hathaAudio,
  paya:  payaAudio,
  pasa:  pasaAudio,
  yahan: yahanaAudio,
  pahan: pahanaAudio,
  nahay: null,
  kasay: kasayaAudio,
  panah: panahaAudio,
  gagan: gaganaAudio,
  nayan: nayanaAudio,
};

// ── TTS ───────────────────────────────────────────────────────────────────────

const speakWithTTS = (word, cb) => {
  const synth = window.speechSynthesis;
  if (!synth) { cb?.(); return; }
  if (synth.paused) synth.resume();
  synth.cancel();
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'si-LK';
    utterance.rate = 0.55;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    const sinhalaVoice = synth.getVoices().find((voice) =>
      voice.lang?.toLowerCase().startsWith('si')
    );
    if (sinhalaVoice) utterance.voice = sinhalaVoice;
    utterance.onend = () => cb?.();
    utterance.onerror = () => cb?.();
    synth.speak(utterance);
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
    className="dyslexia-game-intro-card bg-white/90 backdrop-blur-sm rounded-[36px] shadow-2xl overflow-hidden max-w-xs w-full mx-auto mt-4"
  >
    <div className="w-full h-44 bg-[#E8F8EF] flex items-center justify-center overflow-hidden">
      <motion.img
        src={introImg}
        alt="පළමු අකුර ක්‍රීඩාවේ හඳුන්වාදීම"
        draggable={false}
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="block w-full h-full object-contain p-3 drop-shadow-xl"
      />
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

// ── Listen + Word Card ────────────────────────────────────────────────────────

const ListenCard = ({ onSpeak, isSpeaking }) => (
  <div className="bg-white/88 backdrop-blur-sm rounded-[32px] shadow-xl
                  border-4 border-[#A8D5BA] p-6 text-center">

    <p className="text-[#2D6A4A] font-semibold text-sm mb-4 flex items-center justify-center gap-1">
      <BookOpen size={14} strokeWidth={1.8} />
      ශබ්දය අසා <strong>පළමු අකුර</strong> තෝරන්න
    </p>

    {/* Speaker button */}
    <motion.button
      onClick={onSpeak}
      disabled={isSpeaking}
      className={`relative mx-auto w-24 h-24 rounded-full flex items-center justify-center
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
          <motion.div className="absolute inset-0 rounded-full bg-[#BDE0FE]/60"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut' }} />
          <motion.div className="absolute inset-0 rounded-full bg-[#BDE0FE]/35"
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut', delay: 0.28 }} />
        </>
      )}
      <Volume2 size={40} className={`z-10 ${isSpeaking ? 'text-[#1A4A8A]' : 'text-[#1A4A2A]'}`} strokeWidth={1.6} />
    </motion.button>

    <p className="text-[#2D6A4A] text-xs mt-3 opacity-70 flex items-center justify-center gap-1">
      <Headphones size={13} strokeWidth={1.8} />
      {isSpeaking ? 'ශ්‍රවණය කරයි...' : 'ස්පර්ශ කර නැවත අසන්න'}
    </p>
  </div>
);

// ── Letter Choice button ──────────────────────────────────────────────────────

const LETTER_STYLE = {
  idle:    'bg-white/90 border-[#A8D5BA] text-[#1A4A2A] hover:border-[#52B788] hover:bg-[#E8F8EF]',
  correct: 'bg-[#52B788] border-[#2D9A5A] text-white ring-4 ring-[#A8D5BA]',
  wrong:   'bg-[#FF6B6B] border-[#CC3333] text-white ring-4 ring-[#FFB3B3]',
};

const LetterChoice = ({ letter, cardState, onSelect, disabled }) => (
  <motion.button
    className={`relative w-full rounded-3xl border-4 shadow-md
                flex items-center justify-center select-none
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                transition-colors duration-150
                ${LETTER_STYLE[cardState]}`}
    style={{ minHeight: '88px' }}
    onClick={() => !disabled && onSelect(letter)}
    whileHover={!disabled ? { scale: 1.06, y: -3 } : {}}
    whileTap={!disabled ? { scale: 0.90 } : {}}
    animate={
      cardState === 'wrong'
        ? { x: [-8, 8, -6, 6, -3, 3, 0] }
        : cardState === 'correct'
        ? { scale: [1, 1.1, 1] }
        : {}
    }
    transition={
      cardState === 'wrong'   ? { duration: 0.42 } :
      cardState === 'correct' ? { duration: 0.38 } :
      { type: 'spring', stiffness: 280, damping: 18 }
    }
    aria-label={letter}
    disabled={disabled && cardState === 'idle'}
  >
    <span
      className="font-black leading-none"
      style={{ fontSize: '42px', fontFamily: 'Poppins, Arial, sans-serif' }}
    >
      {letter}
    </span>

    {cardState === 'correct' && (
      <motion.div
        className="absolute top-1.5 right-1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 320 }}
      >
        <Check size={20} strokeWidth={3} className="text-white drop-shadow" />
      </motion.div>
    )}

    {cardState === 'wrong' && (
      <motion.div
        className="absolute top-1.5 right-1.5"
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

const FirstLetterGame = () => {
  const navigate            = useNavigate();
  const { replay, stop: stopInstruction } = useInstructionAudio();
  const { state: locState } = useLocation();
  const level               = locState?.level ?? 1;

  const questions = useMemo(() => {
    const raw = FL_LEVELS[level] ?? FL_LEVELS[1];
    return raw.map(q => ({ ...q, shuffledChoices: shuffle(q.choices) }));
  }, [level]);

  const [qIndex,     setQIndex]     = useState(0);
  const [phase,      setPhase]      = useState('intro'); // intro|speaking|choosing|correct|wrong|finished
  const [selected,   setSelected]   = useState(null);   // the letter string that was tapped
  const [score,      setScore]      = useState(0);
  useDyslexiaGameSession({ gameKey: 'first-letter', level, totalQuestions: questions.length, started: phase !== 'intro', finished: phase === 'finished', score });
  const speakingRef  = useRef(false);
  const startedRef   = useRef(false);
  const audioContextRef = useRef(null);
  const wordSourceRef = useRef(null);
  const audioBufferCacheRef = useRef(new Map());
  const playbackTokenRef = useRef(0);

  const q           = questions[qIndex];
  const correctItem = FL_WORDS[q.wordId];
  const gridCols    = q.shuffledChoices.length <= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2';

  // ── Speak on new question ─────────────────────────────────────────────────
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
    if (!startedRef.current) { setSelected(null); return; }
    speakingRef.current = false;
    setSelected(null);
    doSpeak();
  }, [qIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-advance after correct ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'correct') return;
    const t = setTimeout(() => {
      if (qIndex + 1 >= questions.length) setPhase('finished');
      else { setQIndex(i => i + 1); setPhase('speaking'); }
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-reset after wrong ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'wrong') return;
    const t = setTimeout(() => { setSelected(null); setPhase('choosing'); }, 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleSelect = useCallback((letter) => {
    if (phase !== 'choosing') return;
    setSelected(letter);
    if (letter === correctItem.firstLetter) {
      setScore(s => s + 1);
      playCorrect();
      setPhase('correct');
    } else {
      playWrong();
      setPhase('wrong');
    }
  }, [phase, correctItem.firstLetter]);

  const getCardState = (letter) => {
    if (selected === letter)                                  return letter === correctItem.firstLetter ? 'correct' : 'wrong';
    if (phase === 'correct' && letter === correctItem.firstLetter) return 'correct';
    return 'idle';
  };

  const handleStart = () => {
    stopInstruction();
    stopCurrentWord();
    startedRef.current = true;
    doSpeak();
  };

  const handleRetry = () => {
    stopCurrentWord();
    startedRef.current = false;
    setQIndex(0); setScore(0); setSelected(null); setPhase('intro');
  };

  return (
    <main
      className="dyslexia-game-responsive min-h-screen relative overflow-x-hidden overflow-y-auto font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      <CorrectAnswerCelebration active={false} />
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
            onClick={() => { stopCurrentWord(); navigate('/dyslexia'); }}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                       flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="text-center">
            <p className="text-[#2D6A4A] font-semibold text-sm flex items-center justify-center gap-1">
              <BookOpen size={14} strokeWidth={2} /> පළමු අකුර හඳුනාගනිමු
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
              title="පළමු අකුර හඳුනාගනිමු"
              instruction="ශබ්දය හොඳින් අසා, වචනයේ පළමු අකුර ස්පර්ශ කරන්න!"
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
              >
                <ListenCard
                  onSpeak={doSpeak}
                  isSpeaking={phase === 'speaking'}
                />
              </motion.div>
            </AnimatePresence>

            {/* Status label */}
            <p className="text-center text-[#2D6A4A] font-semibold text-sm mt-4 mb-3
                          flex items-center justify-center gap-2">
              {phase === 'speaking' ? (
                <><span className="w-2 h-2 rounded-full bg-[#4AA8D8] animate-pulse inline-block" /> ශ්‍රවණය කරයි...</>
              ) : phase === 'correct' ? (
                <><Check size={16} className="text-[#52B788]" strokeWidth={2.5} /> හරියටම හරි! පළමු අකුර: <strong className="text-[#1A7A3A]">{correctItem.firstLetter}</strong></>
              ) : (
                <>වචනයේ <strong>පළමු අකුර</strong> ස්පර්ශ කරන්න</>
              )}
            </p>

            {/* Letter choices */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`choices-${qIndex}`}
                className={`grid ${gridCols} gap-4`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {q.shuffledChoices.map((letter, i) => (
                  <motion.div
                    key={letter}
                    className={q.shuffledChoices.length === 3 && i === 2
                      ? 'col-span-2 sm:col-span-1 w-[calc(50%_-_0.5rem)] sm:w-full justify-self-center'
                      : 'w-full'}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <LetterChoice
                      letter={letter}
                      cardState={getCardState(letter)}
                      onSelect={handleSelect}
                      disabled={phase !== 'choosing'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Hint: word length badge */}
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 bg-white/60 border border-[#A8D5BA]
                               rounded-full px-4 py-1.5 text-[#2D6A4A] text-xs font-semibold">
                <Leaf size={12} strokeWidth={2} />
                {correctItem.len === 2 ? 'අකුරු දෙකක වචනයක්' : 'අකුරු තුනක වචනයක්'}
              </span>
            </div>
          </>
        )}
      </div>
      <InstructionButton onReplay={replay} />
    </main>
  );
};

export default FirstLetterGame;
