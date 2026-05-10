import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import React, { useState, useRef, useEffect } from 'react';

/* ─── Cheerful chime ─────────────────────────────────────────────────────── */
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.30, ctx.currentTime);
    master.connect(ctx.destination);
    [
      { freq: 783.99,  delay: 0.00, dur: 0.12 },
      { freq: 987.77,  delay: 0.10, dur: 0.12 },
      { freq: 1174.66, delay: 0.20, dur: 0.12 },
      { freq: 1567.98, delay: 0.30, dur: 0.32 },
    ].forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      osc.connect(g); g.connect(master);
      const t = ctx.currentTime + delay + 0.02;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur + 0.02);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch (_) {}
}
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, ArrowLeft, Star, Trophy, RotateCcw, Home,
  ChevronRight, BookOpen, CheckCircle, XCircle, AlertCircle, Headphones,
} from 'lucide-react';
import hearEleImg from '../../../assets/images/background/hearele.png';
import cowImg     from '../../../assets/images/animals/cow.jpg';
import theroImg   from '../../../assets/images/2letters/thero.jpg';
import lionImg    from '../../../assets/images/background/lion.png';
import penImg     from '../../../assets/images/animals/pen.png';
import noseImg    from '../../../assets/images/3letters/nose.jpg';
import crowImg    from '../../../assets/images/animals/crow.jpg';
import eleImg     from '../../../assets/images/background/ele.png';
import monkImg    from '../../../assets/images/background/monk.png';
import lampImg    from '../../../assets/images/3letters/lamp.jpg';
import peacockImg from '../../../assets/images/background/peocock.png';
import ballImg    from '../../../assets/images/animals/ball.jpg';
import dynoImg    from '../../../assets/images/background/dyno.png';
import gaAudio    from '../../../assets/voice/ga.wav';
import yaAudio    from '../../../assets/voice/ya.wav';
import saAudio    from '../../../assets/voice/sa.wav';
import paAudio    from '../../../assets/voice/pa.mp3';
import naAudio    from '../../../assets/voice/na.wav';
import thaAudio   from '../../../assets/voice/tha.wav';
import kaAudio    from '../../../assets/voice/ka.wav';
import aAudio     from '../../../assets/voice/a.wav';
import uAudio     from '../../../assets/voice/u.wav';
import raAudio    from '../../../assets/voice/ra.wav';
import daAudio    from '../../../assets/voice/da.wav';
import taAudio    from '../../../assets/voice/ta.wav';
import maAudio    from '../../../assets/voice/ma.wav';
import baAudio    from '../../../assets/voice/ba.wav';

/* ─── Background ─────────────────────────────────────────────────────────── */
function GameBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, #0f4c81 0%, #1a6a4f 55%, #52b788 100%)' }} />
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
          style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: '#fff',
                   top: `${Math.random() * 50}%`, left: `${Math.random() * 100}%` }} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div key={`leaf-${i}`}
          animate={{ y: ['0vh', '105vh'], x: [0, Math.sin(i) * 30, 0], rotate: [0, 360] }}
          transition={{ duration: 10 + i * 1.5, repeat: Infinity, delay: i * 1.5, ease: 'linear' }}
          style={{ position: 'absolute', top: '-5%', left: `${12 + i * 16}%`,
                   width: 10, height: 10, borderRadius: '50%', background: '#4ade80', opacity: 0.5 }} />
      ))}
    </div>
  );
}

/* ─── Confetti ─────────────────────────────────────────────────────────────── */
function ConfettiBurst({ active }) {
  if (!active) return null;
  const COLORS = ['#fbbf24', '#f472b6', '#4ade80', '#60a5fa', '#c084fc', '#fb923c'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {Array.from({ length: 28 }, (_, i) => (
        <motion.div key={i}
          initial={{ x: '50vw', y: '40vh', scale: 0, opacity: 1 }}
          animate={{ x: `${Math.random() * 100}vw`, y: `${-10 - Math.random() * 60}vh`,
                     scale: [0, 1.3, 0.8], opacity: [1, 1, 0] }}
          transition={{ duration: 1.2 + Math.random() * 0.6, delay: Math.random() * 0.25 }}
          style={{ position: 'absolute', width: 12, height: 12,
                   borderRadius: Math.random() > 0.5 ? '50%' : 3,
                   background: COLORS[i % COLORS.length] }} />
      ))}
    </div>
  );
}

/* ─── Two-level letter data ─── */
const LEVEL_DATA = {
  1: [
    { id: 'ග', letter: 'ග', word: 'ගවයා',   img: cowImg,     sound: 'ga',  audio: gaAudio   },
    { id: 'හ', letter: 'හ', word: 'සඟ',   img: theroImg,   sound: 'ha',  audio: null      },
    { id: 'ය', letter: 'ය', word: 'යතුර',   img: null,       sound: 'ya',  audio: yaAudio   },
    { id: 'ස', letter: 'ස', word: 'සිංහ',   img: lionImg,    sound: 'sa',  audio: saAudio   },
    { id: 'ප', letter: 'ප', word: 'පස',    img: null,        sound: 'pa',  audio: paAudio   },
    { id: 'න', letter: 'න', word: 'නාසය',   img: noseImg,    sound: 'na',  audio: naAudio   },
    { id: 'ත', letter: 'ත', word: 'තාරකා',  img: null,       sound: 'tha', audio: thaAudio  },
    { id: 'ක', letter: 'ක', word: 'කපුටා',   img: crowImg,    sound: 'ka',  audio: kaAudio   },
    { id: 'අ', letter: 'අ', word: 'අලියා',    img: eleImg,     sound: 'ah',  audio: aAudio    },
  ],
  2: [
    { id: 'උ', letter: 'උ', word: 'ඌරා',    img: null,       sound: 'oo',  audio: uAudio    },
    { id: 'ර', letter: 'ර', word: 'රිළාවා', img: monkImg,    sound: 'ra',  audio: raAudio   },
    { id: 'ද', letter: 'ද', word: 'දිය',    img: null,       sound: 'dha', audio: daAudio   },
    { id: 'ට', letter: 'ට', word: 'ටිකිරි', img: null,       sound: 'ta',  audio: taAudio   },
    { id: 'ල', letter: 'ල', word: 'ලාම්පු', img: lampImg,    sound: 'la',  audio: null      },
    { id: 'ම', letter: 'ම', word: 'මල',  img: peacockImg, sound: 'ma',  audio: maAudio   },
    { id: 'බ', letter: 'බ', word: 'බට',    img: ballImg,    sound: 'ba',  audio: baAudio   },
    { id: 'ඩ', letter: 'ඩ', word: 'ඩයනා',  img: dynoImg,    sound: 'da',  audio: null      },
    { id: 'ඉ', letter: 'ඉ', word: 'ඉර',     img: null,       sound: 'ee',  audio: null      },
  ],
};

const FONT      = "'Nunito', 'Noto Sans Sinhala', sans-serif";
const SINHALA_F = "'Noto Sans Sinhala', 'Noto Serif Sinhala', sans-serif";

/* ═══════════════════════════════════════════════════════════ */
const LetterListening = () => {
  const navigate = useNavigate();
  const { replay } = useInstructionAudio();
  const synthesisRef = useRef(null);

  const [level,         setLevel]         = useState(1);
  const [gameStarted,   setGameStarted]   = useState(false);
  const [gameFinished,  setGameFinished]  = useState(false);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [score,         setScore]         = useState(0);
  const [feedback,      setFeedback]      = useState('');
  const [feedbackType,  setFeedbackType]  = useState('info');
  const [isCorrect,     setIsCorrect]     = useState(null);
  const [options,       setOptions]       = useState([]);
  const [correctLetter, setCorrectLetter] = useState(null);
  const [pronouncing,   setPronouncing]   = useState(false);
  const [selectedId,    setSelectedId]    = useState(null);
  const [showConf,      setShowConf]      = useState(false);
  const [hasPlayed,     setHasPlayed]     = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synthesisRef.current = synth;
    return () => synthesisRef.current?.cancel();
  }, []);

  const generateOptions = (idx, lvl) => {
    const letters = LEVEL_DATA[lvl != null ? lvl : level];
    const correct = letters[idx];
    let opts = [correct];
    while (opts.length < 4) {
      const r = letters[Math.floor(Math.random() * letters.length)];
      if (!opts.find(o => o.id === r.id)) opts.push(r);
    }
    opts = opts.sort(() => Math.random() - 0.5);
    setOptions(opts);
    setCorrectLetter(correct);
    setHasPlayed(false);
  };

  const pronounceLetter = () => {
    if (pronouncing) return;
    const letter = LEVEL_DATA[level][currentIndex];
    setPronouncing(true);
    setFeedback('ශබ්දය අසන්න!');
    setFeedbackType('info');

    const useTTS = () => {
      if (!synthesisRef.current) { setPronouncing(false); return; }
      const utt = new SpeechSynthesisUtterance();
      utt.text = letter.sound; utt.lang = 'en-US'; utt.rate = 0.75; utt.pitch = 1.1; utt.volume = 1;
      utt.onend   = () => { setPronouncing(false); setHasPlayed(true); setFeedback(''); };
      utt.onerror = () => { setPronouncing(false); setFeedback('ශබ්ද දෝෂය'); setFeedbackType('bad'); };
      if (synthesisRef.current.speaking) synthesisRef.current.cancel();
      synthesisRef.current.speak(utt);
    };

    if (letter.audio) {
      const audioEl = new Audio(letter.audio);
      audioEl.onended = () => { setPronouncing(false); setHasPlayed(true); setFeedback(''); };
      audioEl.onerror = () => useTTS();
      audioEl.play().catch(() => useTTS());
    } else {
      useTTS();
    }
  };

  const handleSelect = (opt) => {
    if (isCorrect !== null || pronouncing) return;
    setSelectedId(opt.id);
    const match = opt.id === correctLetter.id;
    if (match) {
      setIsCorrect(true); setScore(p => p + 1);
      setFeedback('හරිම හොඳයි! නිවැරදි!'); setFeedbackType('good');
      playChime();
      setShowConf(true);
      setTimeout(() => { setShowConf(false); advance(); }, 1700);
    } else {
      setIsCorrect(false);
      setFeedback(`ආයෙත් බලන්න! නිවැරදි: "${correctLetter.letter}"`); setFeedbackType('bad');
    }
  };

  const advance = () => {
    setIsCorrect(null); setSelectedId(null); setFeedback('');
    const letters = LEVEL_DATA[level];
    if (currentIndex < letters.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      generateOptions(next, level);
    } else {
      setGameFinished(true);
    }
  };

  const levelLetters = LEVEL_DATA[level];
  const accuracy = Math.round((score / levelLetters.length) * 100);

  const getGrade = () => {
    if (accuracy === 100) return 'ඉතා හොඳයි!';
    if (accuracy >= 87)  return 'ඉතා හොඳයි!';
    if (accuracy >= 75)  return 'හොඳයි! නැවතත් කරන්න!';
    return 'නැවතත් උත්සාහ කරමු!';
  };

  const resetGame = (newLevel) => {
    if (newLevel != null) setLevel(newLevel);
    setGameStarted(false); setGameFinished(false);
    setCurrentIndex(0); setScore(0);
    setFeedback(''); setFeedbackType('info');
    setSelectedId(null); setIsCorrect(null);
    setOptions([]); setShowConf(false);
  };

  const progress = (currentIndex / levelLetters.length) * 100;

  const getOptionStyle = (opt) => {
    const base = {
      width: '100%', aspectRatio: '1', borderRadius: 24, border: '4px solid',
      fontSize: 72, fontWeight: 900, cursor: 'pointer', outline: 'none',
      transition: 'transform 0.15s, box-shadow 0.15s',
      fontFamily: SINHALA_F, lineHeight: 1.1, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    };
    if (isCorrect !== null) {
      if (selectedId === opt.id && isCorrect) return { ...base,
        background: 'linear-gradient(135deg, #bbf7d0, #4ade80)', borderColor: '#22c55e',
        color: '#14532d', boxShadow: '0 5px 0 #16a34a', cursor: 'not-allowed' };
      if (selectedId === opt.id && !isCorrect) return { ...base,
        background: 'linear-gradient(135deg, #fecaca, #f87171)', borderColor: '#ef4444',
        color: '#7f1d1d', boxShadow: '0 5px 0 #dc2626', cursor: 'not-allowed' };
      if (!isCorrect && opt.id === correctLetter?.id) return { ...base,
        background: 'linear-gradient(135deg, #bbf7d0, #4ade80)', borderColor: '#22c55e',
        color: '#14532d', boxShadow: '0 5px 0 #16a34a', cursor: 'not-allowed' };
      return { ...base, background: 'linear-gradient(135deg, #fef9c3, #fde68a)',
        borderColor: '#fde68a', color: '#92400e', boxShadow: '0 5px 0 #fbbf24', cursor: 'not-allowed', opacity: 0.6 };
    }
    return { ...base, background: 'linear-gradient(135deg, #fef9c3, #fde68a)',
      borderColor: '#fde68a', color: '#92400e',
      boxShadow: '0 5px 0 #fbbf24, 0 10px 20px rgba(0,0,0,0.08)',
      opacity: hasPlayed ? 1 : 0.55 };
  };

  const feedbackCfg = {
    good: { bg: 'rgba(52,211,153,0.22)', border: '#34d399', icon: <CheckCircle size={20} style={{ color: '#4ade80', flexShrink: 0 }} /> },
    bad:  { bg: 'rgba(248,113,113,0.22)', border: '#f87171', icon: <XCircle    size={20} style={{ color: '#f87171', flexShrink: 0 }} /> },
    info: { bg: 'rgba(96,165,250,0.22)',  border: '#60a5fa', icon: <AlertCircle size={20} style={{ color: '#93c5fd', flexShrink: 0 }} /> },
  };

  /* ══════════ START SCREEN ══════════ */
  if (!gameStarted) return (
    <>
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, overflowX: 'hidden', padding: '20px 16px' }}>
      <GameBg />
      <FloatingJungleAnimals />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
                      borderRadius: 40, padding: '40px 32px', textAlign: 'center',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 28px 64px rgba(0,0,0,0.28)' }}>
          <motion.img src={hearEleImg} alt="Hearing Elephant"
            animate={{ rotate: [-4, 4, -4], y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 150, height: 150, objectFit: 'contain', display: 'block',
                     margin: '0 auto 16px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.22))' }} />
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8,
                       textShadow: '0 2px 12px rgba(0,0,0,0.45)', fontFamily: FONT }}>
            අකුරු ඇහෙනවාද?
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.88)', marginBottom: 20,
                      fontFamily: SINHALA_F, fontWeight: 600, lineHeight: 1.6 }}>
            ශබ්දය අහලා නිවැරදි අකුර තෝරා ගන්න!
          </p>
          <div style={{ background: 'rgba(255,255,255,0.16)', borderRadius: 22,
                        padding: '14px 18px', marginBottom: 24, border: '2px solid rgba(255,255,255,0.28)' }}>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.92)', fontWeight: 700, margin: 0,
                        fontFamily: SINHALA_F, lineHeight: 1.75, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Volume2 size={18} /> ශබ්ද බොත්තම ස්පර්ශ කර, නිවැරදි අකුර තෝරන්න!
            </p>
          </div>
          {/* Level selector */}
          <p style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: 10, fontFamily: FONT }}>
            මට්ටම තෝරන්න:
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 18 }}>
            {[1, 2].map(l => (
              <motion.button key={l} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
                onClick={() => setLevel(l)}
                style={{ padding: '10px 24px', borderRadius: 20, fontWeight: 800, fontSize: 16,
                         border: level === l ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.4)',
                         background: level === l ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.12)',
                         color: '#fff', cursor: 'pointer', fontFamily: FONT }}>
                {l === 1 ? 'මට්ටම 1' : 'මට්ටම 2'}
              </motion.button>
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 24,
                      fontFamily: SINHALA_F, letterSpacing: 4 }}>
            {level === 1 ? 'ග හ ය ස ප න ත ක අ' : 'උ ර ද ට ල ම බ ඩ ඉ'}
          </p>
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => { setGameStarted(true); generateOptions(0, level); }}
            style={{ width: '100%', padding: '20px 32px', borderRadius: 22,
                     background: 'linear-gradient(135deg, #4ade80, #06b6d4)',
                     color: '#fff', border: 'none', cursor: 'pointer',
                     fontSize: 22, fontWeight: 900, fontFamily: FONT,
                     boxShadow: '0 8px 28px rgba(6,182,212,0.45)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Headphones size={26} strokeWidth={2} /> ගේම් ආරම්භ කරන්න!
          </motion.button>
        </div>
      </motion.div>
    </div>
    <InstructionButton onReplay={replay} />
    </>
  );

  /* ══════════ RESULT SCREEN ══════════ */
  if (gameFinished) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, overflowX: 'hidden', padding: '20px 16px' }}>
      <GameBg />
      <FloatingJungleAnimals />
      <ConfettiBurst active />
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
                      borderRadius: 40, padding: '48px 36px', textAlign: 'center',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 28px 64px rgba(0,0,0,0.28)' }}>
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Trophy size={80} style={{ color: '#fbbf24', filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.6))' }} />
          </motion.div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fbbf24', margin: '16px 0 10px', fontFamily: FONT }}>
            ඔබේ ලකුණු!
          </h2>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', margin: '10px 0', fontFamily: FONT }}>
            {score}
            <span style={{ fontSize: 34, color: 'rgba(255,255,255,0.55)' }}> / {levelLetters.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: Math.max(1, Math.round(accuracy / 20)) }).map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.12 * i, type: 'spring', stiffness: 320 }}>
                <Star size={32} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
              </motion.div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 22,
                        padding: '16px 20px', marginBottom: 28, border: '2px solid rgba(255,255,255,0.28)' }}>
            <p style={{ fontSize: 19, color: '#fff', fontWeight: 800, margin: 0,
                        fontFamily: SINHALA_F, lineHeight: 1.7 }}>
              {getGrade()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => resetGame()}
              style={{ padding: '16px 26px', borderRadius: 20, fontSize: 17, fontWeight: 800,
                       background: 'linear-gradient(135deg, #4ade80, #06b6d4)',
                       color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT,
                       display: 'flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={18} /> නැවතත් සෙල්ලම් කරන්න
            </motion.button>
            {level === 1 && accuracy >= 50 && (
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => resetGame(2)}
                style={{ padding: '16px 26px', borderRadius: 20, fontSize: 17, fontWeight: 800,
                         background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                         color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT,
                         display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={18} /> මට්ටම 2 ට යමු!
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => navigate('/dyslexia')}
              style={{ padding: '16px 26px', borderRadius: 20, fontSize: 17, fontWeight: 800,
                       background: 'rgba(255,255,255,0.2)', color: '#fff',
                       border: '2px solid rgba(255,255,255,0.45)', cursor: 'pointer',
                       fontFamily: SINHALA_F, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Home size={18} /> නිවාස
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  /* ══════════ GAME SCREEN ══════════ */
  const fc = feedbackCfg[feedbackType] ?? feedbackCfg.info;
  const currentLetterData = LEVEL_DATA[level][currentIndex];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex',
                  flexDirection: 'column', alignItems: 'center',
                  fontFamily: FONT, overflowX: 'hidden', paddingBottom: 24 }}>
      <GameBg />
      <FloatingJungleAnimals />
      <ConfettiBurst active={showConf} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 560,
                    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 0' }}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dyslexia')}
          style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.4)',
                   borderRadius: 16, padding: '10px 16px', color: '#fff', cursor: 'pointer',
                   backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} strokeWidth={2} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0,
                       textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                       display: 'flex', alignItems: 'center', gap: 8 }}>
            <Headphones size={22} /> අකුරු ඇහෙනවාද?
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 600 }}>
            {currentIndex + 1} / {levelLetters.length} &nbsp;·&nbsp; ලකුණු: {score}
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 12,
                      padding: '6px 14px', fontSize: 14, fontWeight: 700, color: '#fff' }}>
          <Star size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#fbbf24', fill: '#fbbf24' }} /> {score}/{levelLetters.length}
        </div>
      </div>

      {/* Progress */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 560, padding: '10px 20px' }}>
        <div style={{ height: 12, borderRadius: 8, background: 'rgba(255,255,255,0.2)' }}>
          <motion.div animate={{ width: `${progress}%` }}
            style={{ height: '100%', borderRadius: 8, background: 'linear-gradient(90deg, #4ade80, #06b6d4)' }} />
        </div>
      </div>

      {/* Main Card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 560, padding: '4px 20px' }}>
        <motion.div key={currentIndex} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
                   borderRadius: 40, padding: '32px 24px', textAlign: 'center',
                   border: '2px solid rgba(255,255,255,0.32)',
                   boxShadow: '0 20px 52px rgba(0,0,0,0.22)' }}>

          {/* Image / word */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
            {currentLetterData.img
              ? <img src={currentLetterData.img} alt={currentLetterData.word}
                  style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 24,
                           border: '4px solid rgba(255,255,255,0.5)',
                           boxShadow: '0 8px 24px rgba(0,0,0,0.22)' }} />
              : <div style={{ width: 120, height: 120, borderRadius: 24, border: '4px solid rgba(255,255,255,0.5)',
                              background: 'rgba(255,255,255,0.22)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 52, fontFamily: SINHALA_F, fontWeight: 900, color: '#fff',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.22)' }}>
                  {currentLetterData.word}
                </div>
            }
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 10,
                           fontFamily: SINHALA_F, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {currentLetterData.word}
            </span>
          </div>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.88)', fontWeight: 700, marginBottom: 18,
                      fontFamily: SINHALA_F, lineHeight: 1.6 }}>
            ශබ්දය අහලා නිවැරදි අකුර තෝරන්න!
          </p>

          {/* Speak button */}
          <motion.button
            whileHover={!pronouncing ? { scale: 1.06 } : {}}
            whileTap={!pronouncing ? { scale: 0.94 } : {}}
            onClick={pronounceLetter} disabled={pronouncing}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                     padding: '16px 36px', borderRadius: 99, marginBottom: 18,
                     background: pronouncing
                       ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                       : 'linear-gradient(135deg, #4ade80, #06b6d4)',
                     color: '#fff', border: 'none', cursor: pronouncing ? 'not-allowed' : 'pointer',
                     fontSize: 19, fontWeight: 800, fontFamily: FONT,
                     boxShadow: '0 5px 0 rgba(0,0,0,0.2), 0 10px 24px rgba(0,0,0,0.1)' }}>
            <Volume2 size={24} strokeWidth={2} />
            {pronouncing ? 'අසන්න...' : 'ශබ්දය ඇහෙනවා'}
          </motion.button>

          {/* Nudge */}
          {!hasPlayed && !feedback && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 15, fontWeight: 700, color: '#fff',
                          background: 'rgba(251,191,36,0.25)', border: '2px solid rgba(251,191,36,0.6)',
                          borderRadius: 14, padding: '10px 14px', marginBottom: 14,
                          fontFamily: SINHALA_F, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Volume2 size={16} /> පළමුව ශබ්දය අහන්න!
              </motion.div>
            </AnimatePresence>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: fc.bg, border: `2px solid ${fc.border}`, borderRadius: 18,
                         padding: '12px 16px', marginBottom: 16,
                         display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                {fc.icon}
                <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: SINHALA_F }}>
                  {feedback}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '8px 0 16px' }}>
            {options.map((opt, i) => (
              <motion.button key={opt.id}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.06 * i, type: 'spring', stiffness: 280 }}
                whileHover={isCorrect === null && hasPlayed ? { scale: 1.06, y: -4 } : {}}
                whileTap={isCorrect === null && hasPlayed ? { scale: 0.95 } : {}}
                onClick={() => hasPlayed && handleSelect(opt)}
                title={!hasPlayed ? 'පළමුව ශබ්දය අහන්න!' : ''}
                style={getOptionStyle(opt)}
              >
                {opt.letter}
              </motion.button>
            ))}
          </div>

          {/* Skip after wrong */}
          {isCorrect === false && (
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={advance}
              style={{ padding: '14px 28px', borderRadius: 18, fontSize: 17, fontWeight: 800,
                       background: 'linear-gradient(135deg, #34d399, #06b6d4)',
                       color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT,
                       display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <ChevronRight size={18} /> ඉදිරි ප්‍රශ්නය
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Tip strip */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: 16,
                    fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)',
                    background: 'rgba(255,255,255,0.13)', borderRadius: 16,
                    padding: '10px 20px', backdropFilter: 'blur(8px)',
                    fontFamily: SINHALA_F }}>
        හොඳට අහලා තෝරන්න! ඔබට පුළුවන්!
      </div>
      <InstructionButton onReplay={replay} />
    </div>
  );
};

export default LetterListening;
