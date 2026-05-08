import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, ArrowLeft, RotateCcw, ChevronRight,
  Home, Star, Trophy, BookOpen, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import { sinhalaLetters } from '../utils/sinhalaLetters';

/* ─── Background ─────────────────────────────────────────────────────────── */
function GameBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, #0f4c81 0%, #1a6a4f 55%, #52b788 100%)' }} />
      {Array.from({ length: 22 }, (_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
          style={{ position: 'absolute', width: Math.random() > 0.5 ? 3 : 2,
                   height: Math.random() > 0.5 ? 3 : 2, borderRadius: '50%', background: '#fff',
                   top: `${Math.random() * 50}%`, left: `${Math.random() * 100}%` }} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div key={`leaf-${i}`}
          animate={{ y: ['0vh', '105vh'], x: [0, Math.sin(i) * 35, 0], rotate: [0, 360] }}
          transition={{ duration: 9 + i * 1.5, repeat: Infinity, delay: i * 1.2, ease: 'linear' }}
          style={{ position: 'absolute', top: '-5%', left: `${10 + i * 14}%`,
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
      {Array.from({ length: 24 }, (_, i) => (
        <motion.div key={i}
          initial={{ x: '50vw', y: '40vh', scale: 0, opacity: 1 }}
          animate={{ x: `${Math.random() * 100}vw`, y: `${-10 - Math.random() * 60}vh`,
                     scale: [0, 1.3, 0.8], opacity: [1, 1, 0] }}
          transition={{ duration: 1.2 + Math.random() * 0.6, delay: Math.random() * 0.2 }}
          style={{ position: 'absolute', width: 12, height: 12,
                   borderRadius: Math.random() > 0.5 ? '50%' : 3,
                   background: COLORS[i % COLORS.length] }} />
      ))}
    </div>
  );
}

/* ─── Letter Box ─────────────────────────────────────────────────────────── */
function LetterBox({ letter, anim }) {
  return (
    <motion.div
      animate={
        anim === 'celebrate'
          ? { scale: [1, 1.28, 0.92, 1.1, 1], rotate: [0, 8, -5, 3, 0] }
          : anim === 'wrong'
          ? { x: [0, -14, 14, -10, 10, 0] }
          : { scale: 1, rotate: 0, x: 0 }
      }
      transition={{ duration: anim ? 0.5 : 0.2 }}
      style={{
        width: 170, height: 170, borderRadius: 36, margin: '0 auto 24px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: '5px solid rgba(255,255,255,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 104, fontWeight: 900, color: '#1a3a2a',
        boxShadow: '0 8px 0 rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.22)',
        fontFamily: "'Noto Sans Sinhala', 'Noto Serif Sinhala', sans-serif",
        userSelect: 'none', letterSpacing: '0.02em',
      }}
    >
      {letter}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const LetterPronunciation = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const celebrationTimer = useRef(null);

  const [gameStarted,     setGameStarted]     = useState(false);
  const [gameFinished,    setGameFinished]     = useState(false);
  const [currentIndex,    setCurrentIndex]     = useState(0);
  const [score,           setScore]            = useState(0);
  const [listening,       setListening]        = useState(false);
  const [feedback,        setFeedback]         = useState('');
  const [feedbackType,    setFeedbackType]     = useState('info');
  const [showCelebration, setShowCelebration]  = useState(false);
  const [isCorrect,       setIsCorrect]        = useState(null);
  const [recognized,      setRecognized]       = useState('');
  const [letterAnim,      setLetterAnim]       = useState('');

  const FONT = "'Nunito', 'Noto Sans Sinhala', sans-serif";

  /* Speech API init */
  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback('ඔබගේ බ්‍රවුසරය ශබ්ද ස්වීකරණ සඳහා සහාය නොදක්වයි');
      setFeedbackType('bad');
      return;
    }
    const r = new SpeechRecognition();
    r.lang = 'en-US'; r.continuous = false; r.interimResults = false; r.maxAlternatives = 1;

    r.onstart  = () => { setListening(true); setFeedback('ඉඩ ගන අසන්න...'); setFeedbackType('info'); setRecognized(''); };
    r.onresult = (e) => {
      if (e.results?.length > 0) {
        const t = e.results[0][0].transcript.toLowerCase().trim();
        setRecognized(t);
        checkPronunciation(t);
      }
    };
    r.onerror = (e) => {
      setListening(false);
      const msgs = {
        'no-speech':     'ශබ්ගයක් ඇසුනේ නෑ! නැවතත් කතා කරන්න!',
        'network':       'ජාල සම්බන්ධතාවයේ ගැටලුවක්',
        'not-allowed':   'මයික්‍රෝෆෝනය අවසර දෙන්න!',
        'audio-capture': 'මයික්‍රෝෆෝනය සොයාගත නොහැකිය',
      };
      setFeedback(msgs[e.error] || 'ශබ්ද ඇසීමේ දෝෂය');
      setFeedbackType('bad');
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    return () => recognitionRef.current?.abort();
  }, []); // eslint-disable-line

  const checkPronunciation = (transcript) => {
    const letter = sinhalaLetters[currentIndex];
    const isMatch = letter.accepted.some((a) => {
      const t = transcript.toLowerCase().trim();
      const ac = a.toLowerCase().trim();
      return t === ac || t.includes(ac) || ac.includes(t) || t.startsWith(ac) || ac.startsWith(t);
    });
    if (isMatch) {
      setIsCorrect(true); setScore(p => p + 1);
      setFeedback('හරිම හොඳයි! ගොඩාක් හොඳයි!'); setFeedbackType('good');
      setLetterAnim('celebrate'); setShowCelebration(true);
      celebrationTimer.current = setTimeout(() => {
        setShowCelebration(false); setLetterAnim(''); moveToNextLetter();
      }, 1600);
    } else {
      setIsCorrect(false);
      setFeedback('නැහැ! නැවතත් උත්සාහ කරන්න!'); setFeedbackType('bad');
      setLetterAnim('wrong'); setTimeout(() => setLetterAnim(''), 500);
    }
  };

  const moveToNextLetter = () => {
    setIsCorrect(null); setRecognized(''); setFeedback('');
    if (currentIndex < sinhalaLetters.length - 1) setCurrentIndex(p => p + 1);
    else setGameFinished(true);
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) recognitionRef.current.start();
  };

  const skipLetter = () => {
    setIsCorrect(null); setRecognized(''); setFeedback(''); setLetterAnim('');
    if (currentIndex < sinhalaLetters.length - 1) setCurrentIndex(p => p + 1);
    else setGameFinished(true);
  };

  const resetGame = () => {
    setGameStarted(false); setGameFinished(false); setCurrentIndex(0); setScore(0);
    setFeedback(''); setFeedbackType('info'); setRecognized('');
    setIsCorrect(null); setLetterAnim(''); setShowCelebration(false);
  };

  const accuracy = Math.round((score / sinhalaLetters.length) * 100);
  const progress = (currentIndex / sinhalaLetters.length) * 100;

  const getGrade = () => {
    if (accuracy === 100) return 'ඉතා හොඳයි!';
    if (accuracy >= 87)  return 'ඉතා හොඳයි!';
    if (accuracy >= 75)  return 'හොඳයි!';
    return 'නැවතත් උත්සාහ කරමු!';
  };

  const feedbackCfg = {
    good: { bg: 'rgba(52,211,153,0.22)', border: '#34d399', icon: <CheckCircle size={20} style={{ color: '#4ade80', flexShrink: 0 }} /> },
    bad:  { bg: 'rgba(248,113,113,0.22)', border: '#f87171', icon: <XCircle    size={20} style={{ color: '#f87171', flexShrink: 0 }} /> },
    info: { bg: 'rgba(96,165,250,0.22)',  border: '#60a5fa', icon: <AlertCircle size={20} style={{ color: '#93c5fd', flexShrink: 0 }} /> },
  };

  /* ══════════ START SCREEN ══════════ */
  if (!gameStarted) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, overflowX: 'hidden' }}>
      <GameBg />
      <FloatingJungleAnimals />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, padding: '0 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
                      borderRadius: 40, padding: '48px 36px', textAlign: 'center',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 28px 64px rgba(0,0,0,0.28)' }}>
          <motion.div
            animate={{ rotate: [-8, 8, -8], y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 110, height: 110, borderRadius: 32, margin: '0 auto 28px',
                     background: 'linear-gradient(135deg, #f472b6, #a855f7)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     boxShadow: '0 10px 32px rgba(168,85,247,0.5)' }}>
            <Mic size={54} style={{ color: '#fff' }} strokeWidth={1.8} />
          </motion.div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 12,
                       textShadow: '0 2px 12px rgba(0,0,0,0.45)', fontFamily: FONT, lineHeight: 1.2 }}>
            අකුරු කියමු!
          </h1>
          
          <div style={{ background: 'rgba(255,255,255,0.16)', borderRadius: 22,
                        padding: '16px 20px', marginBottom: 30, border: '2px solid rgba(255,255,255,0.28)' }}>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.92)', fontWeight: 700, margin: 0,
                        fontFamily: "'Noto Sans Sinhala', sans-serif", lineHeight: 1.75 }}>
              අකුරක් දකිනවිට, ඒ අකුර සිංහලෙන් කියමු!
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => setGameStarted(true)}
            style={{ width: '100%', padding: '20px 32px', borderRadius: 22,
                     background: 'linear-gradient(135deg, #f472b6, #a855f7)',
                     color: '#fff', border: 'none', cursor: 'pointer',
                     fontSize: 22, fontWeight: 900, fontFamily: FONT,
                     boxShadow: '0 8px 28px rgba(168,85,247,0.5)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Mic size={26} strokeWidth={2} /> ගේම් ආරම්භ කරන්න!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  /* ══════════ RESULT SCREEN ══════════ */
  if (gameFinished) return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, overflowX: 'hidden' }}>
      <GameBg />
      <FloatingJungleAnimals />
      <ConfettiBurst active />
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460, padding: '0 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
                      borderRadius: 40, padding: '48px 36px', textAlign: 'center',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 28px 64px rgba(0,0,0,0.28)' }}>
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Trophy size={80} style={{ color: '#fbbf24', filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.6))' }} />
          </motion.div>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fbbf24', margin: '16px 0 10px',
                       fontFamily: FONT, textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
            ඔබේ ලකුණු
          </h2>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', margin: '10px 0',
                        textShadow: '0 2px 16px rgba(0,0,0,0.3)', fontFamily: FONT }}>
            {score}
            <span style={{ fontSize: 34, color: 'rgba(255,255,255,0.55)' }}> / {sinhalaLetters.length}</span>
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
                        padding: '16px 20px', marginBottom: 30, border: '2px solid rgba(255,255,255,0.28)' }}>
            <p style={{ fontSize: 19, color: '#fff', fontWeight: 800, margin: 0,
                        fontFamily: "'Noto Sans Sinhala', sans-serif", lineHeight: 1.7 }}>
              {getGrade()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={resetGame}
              style={{ padding: '16px 30px', borderRadius: 20, fontSize: 18, fontWeight: 800,
                       background: 'linear-gradient(135deg, #f472b6, #a855f7)',
                       color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT,
                       boxShadow: '0 4px 20px rgba(168,85,247,0.45)',
                       display: 'flex', alignItems: 'center', gap: 10 }}>
              <RotateCcw size={20} /> නැවතත් ක්‍රීඩා කරන්න
            </motion.button>
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => navigate('/dyslexia')}
              style={{ padding: '16px 30px', borderRadius: 20, fontSize: 18, fontWeight: 800,
                       background: 'rgba(255,255,255,0.2)',
                       color: '#fff', border: '2px solid rgba(255,255,255,0.45)', cursor: 'pointer',
                       fontFamily: "'Noto Sans Sinhala', sans-serif",
                       display: 'flex', alignItems: 'center', gap: 10 }}>
              <Home size={20} /> නිවාස
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  /* ══════════ GAME SCREEN ══════════ */
  const currentLetter = sinhalaLetters[currentIndex];
  const fc = feedbackCfg[feedbackType] ?? feedbackCfg.info;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex',
                  flexDirection: 'column', alignItems: 'center',
                  fontFamily: FONT, overflowX: 'hidden', paddingBottom: 24 }}>
      <GameBg />
      <FloatingJungleAnimals />
      <ConfettiBurst active={showCelebration} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 540,
                    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 0' }}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dyslexia')}
          style={{ background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.4)',
                   borderRadius: 16, padding: '10px 16px', color: '#fff', cursor: 'pointer',
                   backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} strokeWidth={2} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0,
                       textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                       display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={24} strokeWidth={2} /> අකුරු කියමු!
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 600 }}>
            {currentIndex + 1} / {sinhalaLetters.length} &nbsp;·&nbsp; ලකුණු: {score}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 540, padding: '10px 20px' }}>
        <div style={{ height: 12, borderRadius: 8, background: 'rgba(255,255,255,0.2)' }}>
          <motion.div animate={{ width: `${progress}%` }}
            style={{ height: '100%', borderRadius: 8,
                     background: 'linear-gradient(90deg, #f472b6, #a855f7)' }} />
        </div>
      </div>

      {/* Main Card */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 540, padding: '4px 20px' }}>
        <motion.div key={currentIndex}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(18px)',
                   borderRadius: 40, padding: '36px 28px', textAlign: 'center',
                   border: '2px solid rgba(255,255,255,0.32)',
                   boxShadow: '0 20px 52px rgba(0,0,0,0.22)' }}>

          <LetterBox letter={currentLetter.letter} anim={letterAnim} />

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.88)', fontWeight: 700, marginBottom: 22,
                      fontFamily: "'Noto Sans Sinhala', sans-serif", lineHeight: 1.6 }}>
            ඉහත අකුර ශබ්ද කරන්න!
          </p>

          {/* Mic Button */}
          <motion.button
            whileHover={!listening ? { scale: 1.07 } : {}}
            whileTap={!listening ? { scale: 0.93 } : {}}
            onClick={startListening}
            disabled={listening || showCelebration}
            style={{ width: 130, height: 130, borderRadius: '50%', margin: '0 auto 18px',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     background: listening
                       ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                       : 'linear-gradient(135deg, #f472b6, #a855f7)',
                     border: 'none', cursor: listening ? 'default' : 'pointer',
                     boxShadow: listening
                       ? '0 8px 32px rgba(96,165,250,0.45)'
                       : '0 8px 32px rgba(168,85,247,0.45)',
                     position: 'relative' }}>
            {listening && (
              <>
                <motion.div animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                           background: 'rgba(96,165,250,0.4)' }} />
                <motion.div animate={{ scale: [1, 2.4], opacity: [0.4, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut', delay: 0.32 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                           background: 'rgba(96,165,250,0.25)' }} />
              </>
            )}
            <Mic size={52} style={{ color: '#fff', zIndex: 1 }} strokeWidth={1.8} />
          </motion.button>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', marginBottom: 18, fontWeight: 600 }}>
            {listening ? 'ඇහෙනවා...' : 'ස්පර්ශ කර කතා කරන්න'}
          </p>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: fc.bg, border: `2px solid ${fc.border}`, borderRadius: 18,
                         padding: '14px 18px', marginBottom: 14,
                         display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                {fc.icon}
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff',
                               fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
                  {feedback}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {recognized && !showCelebration && (
            <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 16,
                          padding: '10px 16px', marginBottom: 14,
                          fontSize: 16, color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
              ඔබ කිව්වේ: <strong>"{recognized}"</strong>
            </div>
          )}

          {isCorrect === false && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={() => { setIsCorrect(null); setFeedback(''); setRecognized(''); startListening(); }}
                style={{ padding: '14px 26px', borderRadius: 18, fontSize: 17, fontWeight: 800,
                         background: 'linear-gradient(135deg, #fb923c, #f43f5e)',
                         color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT,
                         display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCcw size={18} /> නැවතත් කියන්න
              </motion.button>
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={skipLetter}
                style={{ padding: '14px 26px', borderRadius: 18, fontSize: 17, fontWeight: 800,
                         background: 'linear-gradient(135deg, #34d399, #06b6d4)',
                         color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT,
                         display: 'flex', alignItems: 'center', gap: 8 }}>
                <ChevronRight size={18} /> ඉදිරි අකුර
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, marginTop: 16,
                    fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.88)',
                    background: 'rgba(255,255,255,0.13)', borderRadius: 16,
                    padding: '10px 20px', backdropFilter: 'blur(8px)',
                    fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
        ඔබට පුළුවන්! ඔබ ශූරයෙකු!
      </div>
    </div>
  );
};

export default LetterPronunciation;
