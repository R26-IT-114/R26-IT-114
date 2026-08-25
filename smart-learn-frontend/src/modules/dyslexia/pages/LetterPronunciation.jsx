import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import InstructionButton from '../components/InstructionButton';
import useInstructionAudio from '../../../hooks/useInstructionAudio';
import useDyslexiaGameSession from '../hooks/useDyslexiaGameSession';
import React, { useState, useRef, useEffect } from 'react';
import letterKidImg from '../../../assets/images/background/gira1.png';
import giraffeScoreboardImg from '../../../assets/images/letter-listening-giraffe-scoreboard.png';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Mic,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Home,
  Star,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { sinhalaLetters } from '../utils/sinhalaLetters';

/* ─────────────────────────────────────────────────────────────
   CHEERFUL CHIME
───────────────────────────────────────────────────────────── */
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.30, ctx.currentTime);
    master.connect(ctx.destination);

    [
      { freq: 783.99, delay: 0.00, dur: 0.12 },
      { freq: 987.77, delay: 0.10, dur: 0.12 },
      { freq: 1174.66, delay: 0.20, dur: 0.12 },
      { freq: 1567.98, delay: 0.30, dur: 0.32 },
    ].forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(g);
      g.connect(master);

      const t = ctx.currentTime + delay + 0.02;

      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.start(t);
      osc.stop(t + dur + 0.02);
    });

    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────────────────────────── */
function GameBg() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div className="dyslexia-game-responsive"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(160deg, #0f4c81 0%, #1a6a4f 55%, #52b788 100%)',
        }}
      />

      {/* Stars */}
      {Array.from({ length: 22 }, (_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
          style={{
            position: 'absolute',
            width: Math.random() > 0.5 ? 3 : 2,
            height: Math.random() > 0.5 ? 3 : 2,
            borderRadius: '50%',
            background: '#fff',
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Floating Leaves */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`leaf-${i}`}
          animate={{
            y: ['0vh', '105vh'],
            x: [0, Math.sin(i) * 35, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 9 + i * 1.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            top: '-5%',
            left: `${10 + i * 14}%`,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#4ade80',
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONFETTI
───────────────────────────────────────────────────────────── */
function ConfettiBurst({ active }) {
  if (!active) return null;

  const COLORS = [
    '#fbbf24',
    '#f472b6',
    '#4ade80',
    '#60a5fa',
    '#c084fc',
    '#fb923c',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {Array.from({ length: 24 }, (_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50vw',
            y: '40vh',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${-10 - Math.random() * 60}vh`,
            scale: [0, 1.3, 0.8],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.6,
            delay: Math.random() * 0.2,
          }}
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: Math.random() > 0.5 ? '50%' : 3,
            background: COLORS[i % COLORS.length],
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LETTER BOX
───────────────────────────────────────────────────────────── */
function LetterBox({ letter, anim }) {
  return (
    <motion.div
      animate={
        anim === 'celebrate'
          ? {
              scale: [1, 1.28, 0.92, 1.1, 1],
              rotate: [0, 8, -5, 3, 0],
            }
          : anim === 'wrong'
          ? {
              x: [0, -14, 14, -10, 10, 0],
            }
          : {
              scale: 1,
              rotate: 0,
              x: 0,
            }
      }
      transition={{ duration: anim ? 0.5 : 0.2 }}
      style={{
        width: 200,
        height: 200,
        borderRadius: 40,
        margin: '0 auto 28px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: '6px solid rgba(255,255,255,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 120,
        fontWeight: 900,
        color: '#1a3a2a',
        boxShadow:
          '0 8px 0 rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.22)',
        fontFamily:
          "'Noto Sans Sinhala', 'Noto Serif Sinhala', sans-serif",
        userSelect: 'none',
      }}
    >
      {letter}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
const LetterPronunciation = () => {
  const navigate = useNavigate();
  const { replay } = useInstructionAudio();

  const recognitionRef = useRef(null);
  const celebrationTimer = useRef(null);
  const listeningTimerRef = useRef(null);
  const currentIndexRef = useRef(0);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('info');

  const [showCelebration, setShowCelebration] = useState(false);

  const [isCorrect, setIsCorrect] = useState(null);


  const [letterAnim, setLetterAnim] = useState('');
  useDyslexiaGameSession({ gameKey: 'letter-pronunciation', totalQuestions: sinhalaLetters.length, started: gameStarted, finished: gameFinished, score });

  const FONT = "'Nunito', 'Noto Sans Sinhala', sans-serif";

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  /* Speech Recognition */
  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setFeedback('ඔබගේ බ්‍රවුසරය සහාය නොදක්වයි');
      setFeedbackType('bad');
      return;
    }

    const r = new SpeechRecognition();

    r.lang = 'si-LK';
    r.continuous = true;
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart = () => {
      setListening(true);
      setFeedback('ඇහෙනවා...');
      setFeedbackType('info');
    };

    r.onresult = (e) => {
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
        listeningTimerRef.current = null;
      }
      if (e.results?.length > 0) {
        const t = e.results[0][0].transcript.toLowerCase().trim();

        checkPronunciation(t);
        r.stop();
      }
    };

    r.onerror = (event) => {
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
        listeningTimerRef.current = null;
      }
      setListening(false);
      setFeedback(event.error === 'not-allowed'
        ? 'මයික්‍රෆෝනයට අවසර දෙන්න.'
        : 'හඬ ඇසුණේ නැහැ. නැවත කියන්න.');
      setFeedbackType('bad');
    };

    r.onend = () => {
      if (listeningTimerRef.current) {
        clearTimeout(listeningTimerRef.current);
        listeningTimerRef.current = null;
      }
      setListening(false);
    };

    recognitionRef.current = r;
    setSpeechSupported(true);

    return () => {
      r.abort();
      if (recognitionRef.current === r) recognitionRef.current = null;
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
      if (listeningTimerRef.current) clearTimeout(listeningTimerRef.current);
    };
  }, []);

  const checkPronunciation = (transcript) => {
    const letter = sinhalaLetters[currentIndexRef.current];
    const normalizedTranscript = String(transcript)
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '');

    const isMatch = [letter.letter, ...letter.accepted].some((answer) => {
      const normalizedAnswer = String(answer)
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '');

      if (!normalizedAnswer) return false;
      if (normalizedTranscript === normalizedAnswer) return true;

      // Sinhala recognition may return phrases such as "ක අකුර".
      // Do not use partial matching for one-letter Latin aliases like k/g/p.
      const isSingleLatinAlias = /^[a-z]$/i.test(normalizedAnswer);
      return !isSingleLatinAlias && normalizedTranscript.includes(normalizedAnswer);
    });

    if (isMatch) {
      setIsCorrect(true);

      setScore((p) => p + 1);

      setFeedback('හරිම හොඳයි!');
      setFeedbackType('good');

      playChime();

      setLetterAnim('celebrate');

      setShowCelebration(true);

      celebrationTimer.current = setTimeout(() => {
        setShowCelebration(false);
        setLetterAnim('');

        moveToNextLetter();
      }, 1600);
    } else {
      setIsCorrect(false);

      setFeedback('නැවත කියන්න!');
      setFeedbackType('bad');

      setLetterAnim('wrong');

      setTimeout(() => setLetterAnim(''), 500);
    }
  };

  const moveToNextLetter = () => {
    setIsCorrect(null);
    setFeedback('');

    setCurrentIndex((previous) => {
      if (previous < sinhalaLetters.length - 1) return previous + 1;
      setGameFinished(true);
      return previous;
    });
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setFeedback('');
      setIsCorrect(null);
      try {
        recognitionRef.current.start();
        listeningTimerRef.current = setTimeout(() => {
          recognitionRef.current?.abort();
          listeningTimerRef.current = null;
          setListening(false);
          setFeedback('හඬ ඇසුණේ නැහැ. නැවත කියන්න.');
          setFeedbackType('bad');
        }, 20000);
      } catch (_) {
        setListening(false);
        setFeedback('මයික්‍රෆෝනය නැවත ඔබන්න.');
        setFeedbackType('bad');
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameFinished(false);

    setCurrentIndex(0);
    setScore(0);

    setFeedback('');
    setIsCorrect(null);
    setLetterAnim('');
    setShowCelebration(false);
  };

  /* RESULT SCREEN */
  if (gameFinished) {
    return (
      <div className="dyslexia-game-responsive"
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <GameBg />
        <FloatingJungleAnimals />
        <ConfettiBurst active />

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 480,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(18px)',
              borderRadius: 40,
              padding: '50px 36px',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: 38,
                color: '#fbbf24',
                fontWeight: 900,
                margin: '0 0 4px',
              }}
            >
              ඔබේ ලකුණු
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
              transition={{ opacity: { duration: 0.35 }, scale: { type: 'spring', stiffness: 220 },
                            y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
              style={{ position: 'relative', width: 'min(100%, 300px)', margin: '0 auto 4px' }}
            >
              <img
                src={giraffeScoreboardImg}
                alt="ලකුණු පුවරුව අල්ලාගෙන සිටින ජිරාෆ්"
                style={{ width: '100%', height: 'auto', display: 'block',
                         filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.28))' }}
              />
              <div
                style={{ position: 'absolute', left: '15%', right: '15%', top: '49%', height: '20%',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                         fontFamily: FONT, color: '#1A4A2A', fontWeight: 900,
                         textShadow: '0 2px 0 rgba(255,255,255,0.7)' }}
                aria-label={`ලකුණු ${score} / ${sinhalaLetters.length}`}
              >
                <span style={{ fontSize: 54, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 28, lineHeight: 1, color: '#2D6A4A' }}>/ {sinhalaLetters.length}</span>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              style={{
                marginTop: 24,
                padding: '18px 34px',
                borderRadius: 22,
                border: 'none',
                background:
                  'linear-gradient(135deg, #f472b6, #a855f7)',
                color: '#fff',
                fontSize: 22,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              නැවත ක්‍රීඩා කරන්න
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dyslexia')}
              style={{
                display: 'block',
                margin: '16px auto 0',
                padding: '18px 34px',
                borderRadius: 22,
                border: 'none',
                background:
                  'linear-gradient(135deg, #34d399, #0ea5e9)',
                color: '#fff',
                fontSize: 22,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              🏠 මුල් පිටුවට
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  /* START SCREEN */
  if (!gameStarted) {
    return (
      <>
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <GameBg />
        <FloatingJungleAnimals />

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: 460,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(18px)',
              borderRadius: 40,
              padding: '48px 36px',
              textAlign: 'center',
            }}
          >
            <motion.img
              src={letterKidImg}
              alt="Dora"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                width: 180,
                height: 180,
                objectFit: 'contain',
                margin: '0 auto 24px',
                display: 'block',
              }}
            />

            <h1
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 16,
              }}
            >
              අකුරු කියමු!
            </h1>

            <p
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 700,
                lineHeight: 1.7,
              }}
            >
              අකුර ශබ්ද කරමු!
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameStarted(true)}
              style={{
                width: '100%',
                marginTop: 30,
                padding: '20px 30px',
                borderRadius: 24,
                border: 'none',
                background:
                  'linear-gradient(135deg, #f472b6, #a855f7)',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              ▶ ආරම්භ කරන්න
            </motion.button>
          </div>
        </div>
      </div>

      <InstructionButton onReplay={replay} />
      </>
    );
  }

  /* GAME SCREEN */
  const currentLetter = sinhalaLetters[currentIndex];

  return (
    <div className="dyslexia-game-responsive"
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: FONT,
        paddingBottom: 30,
      }}
    >
      <GameBg />
      <FloatingJungleAnimals />
      <ConfettiBurst active={showCelebration} />

      {/* HEADER */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 560,
          padding: '18px 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <button
          onClick={() => navigate('/dyslexia')}
          style={{
            border: 'none',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 18,
            padding: 14,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={28} />
        </button>

        <div>
          <h1
            style={{
              fontSize: 32,
              color: '#fff',
              fontWeight: 900,
              margin: 0,
            }}
          >
            අකුරු කියමු!
          </h1>

          <p
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              fontWeight: 700,
            }}
          >
            {currentIndex + 1} / {sinhalaLetters.length}
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 560,
          padding: 20,
        }}
      >
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(18px)',
            borderRadius: 42,
            padding: '40px 30px',
            textAlign: 'center',
          }}
        >
          {/* IMAGE */}
          <motion.img
            src={letterKidImg}
            alt="Character"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              width: 160,
              height: 160,
              objectFit: 'contain',
              margin: '0 auto 24px',
              display: 'block',
            }}
          />

          {/* LETTER */}
          <LetterBox
            letter={currentLetter.letter}
            anim={letterAnim}
          />

          {/* TEXT */}
          <p
            style={{
              fontSize: 24,
              color: '#fff',
              fontWeight: 800,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            ඉහත අකුර ශබ්ද කරන්න!
          </p>

          {/* MIC */}
          <motion.button
            whileHover={!listening ? { scale: 1.07 } : {}}
            whileTap={!listening ? { scale: 0.93 } : {}}
            onClick={startListening}
            disabled={!speechSupported || listening || showCelebration}
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              margin: '0 auto 24px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, #f472b6, #a855f7)',
              boxShadow:
                '0 10px 34px rgba(168,85,247,0.5)',
            }}
          >
            <Mic
              size={64}
              style={{ color: '#fff' }}
            />
          </motion.button>

          {/* STATUS */}
          <p
            style={{
              fontSize: 22,
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {listening ? 'ඇහෙනවා...' : 'කතා කරන්න'}
          </p>

          {/* FEEDBACK */}
          {feedback && (
            <div
              style={{
                marginTop: 20,
                background:
                  feedbackType === 'good'
                    ? 'rgba(52,211,153,0.22)'
                    : 'rgba(248,113,113,0.22)',
                border:
                  feedbackType === 'good'
                    ? '2px solid #34d399'
                    : '2px solid #f87171',
                borderRadius: 20,
                padding: '16px 20px',
                color: '#fff',
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {feedback}
            </div>
          )}

          {/* BUTTONS */}
          {isCorrect === false && (
            <div
              style={{
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
                marginTop: 24,
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={startListening}
                style={{
                  padding: '16px 28px',
                  borderRadius: 20,
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #fb923c, #f43f5e)',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                නැවත කියන්න
              </button>

              <button
                onClick={moveToNextLetter}
                style={{
                  padding: '16px 28px',
                  borderRadius: 20,
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #34d399, #06b6d4)',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ඉදිරියට
              </button>
            </div>
          )}
        </motion.div>
      </div>
      <InstructionButton onReplay={replay} />
    </div>
  );
};

export default LetterPronunciation;
