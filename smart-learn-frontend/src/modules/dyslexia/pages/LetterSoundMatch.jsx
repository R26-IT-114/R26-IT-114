import { useState, useEffect, useCallback, useMemo } from 'react';

import FloatingJungleAnimals from '../components/FloatingJungleAnimals';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LETTER_SOUND_LEVELS, ITEMS } from '../data/letterSoundData';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Speak text via Web Speech API with Chrome-compatible fixes */
const speak = (text) => {
  const synth = window.speechSynthesis;
  if (!synth) return;

  // Chrome freeze fix — resume if paused
  if (synth.paused) synth.resume();
  synth.cancel();

  // Chrome race condition fix — must delay after cancel()
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.volume = 1;
    u.rate   = 0.72;
    u.pitch  = 1.1;

    // Prefer si-LK voice; fall back to any available voice
    const voices  = synth.getVoices();
    const sinhala = voices.find(v => v.lang === 'si-LK' || v.lang.startsWith('si'));
    if (sinhala) {
      u.voice = sinhala;
      u.lang  = 'si-LK';
    } else {
      // No Sinhala voice — let browser use default TTS
      u.lang = 'si-LK'; // hint even without a matching voice
    }

    synth.speak(u);
  }, 120);
};

/** Fisher-Yates shuffle — returns a new array */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── ChoiceCard ────────────────────────────────────────────────────────────────

const BORDER = {
  idle:    'border-white/70',
  correct: 'border-[#52B788] ring-4 ring-[#A8D5BA]',
  wrong:   'border-[#FF6B6B] ring-4 ring-[#FFB3B3]',
};

const ChoiceCard = ({ item, cardState, onSelect, disabled }) => (
  <motion.button
    className={`relative rounded-3xl overflow-hidden border-4 bg-white/85 shadow-lg w-full text-left select-none
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD166]
                ${BORDER[cardState]}`}
    onClick={() => !disabled && onSelect(item.id)}
    whileHover={!disabled ? { scale: 1.05, y: -3 } : {}}
    whileTap={!disabled ? { scale: 0.94 } : {}}
    animate={cardState === 'wrong' ? { x: [-7, 7, -5, 5, -3, 3, 0] } : {}}
    transition={cardState === 'wrong' ? { duration: 0.45 } : { type: 'spring', stiffness: 280 }}
    aria-label={item.name}
    aria-pressed={cardState !== 'idle'}
    disabled={disabled && cardState === 'idle'}
  >
    {/* Image */}
    <div className="aspect-square w-full overflow-hidden bg-[#F0FAF4]">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>

    {/* Name label — hidden so child must rely on image only */}
    <div className="py-2 px-1 text-center">
      <span
        className="text-[#1A4A2A] font-bold leading-snug opacity-0 select-none pointer-events-none"
        style={{ fontSize: 'clamp(13px, 3vw, 16px)' }}
        aria-hidden="true"
      >
        {item.name}
      </span>
    </div>

    {/* Correct overlay */}
    {cardState === 'correct' && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#A8D5BA]/50 rounded-3xl"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="text-5xl drop-shadow-md">✅</span>
      </motion.div>
    )}

    {/* Wrong overlay */}
    {cardState === 'wrong' && (
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#FF6B6B]/35 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-5xl drop-shadow-md">❌</span>
      </motion.div>
    )}
  </motion.button>
);

// ── ResultsScreen ─────────────────────────────────────────────────────────────

const ResultsScreen = ({ score, total, level, onRetry, onHome }) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
  const emoji = stars === 3 ? '🏆' : stars === 2 ? '🌟' : '💪';
  const msg   = stars === 3 ? 'සුපිරිම!' : stars === 2 ? 'හොඳයි!' : 'හොඳ උත්සාහයක්';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white/88 backdrop-blur-sm rounded-[32px] p-8 shadow-2xl text-center max-w-xs w-full mx-auto mt-4"
    >
      <motion.div
        className="text-6xl mb-3"
        animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
        transition={{ duration: 0.8, delay: 0.3 }}
        aria-hidden="true"
      >
        {emoji}
      </motion.div>

      <h2 className="text-[#1A4A2A] text-3xl font-black mb-1">{msg}</h2>
      <p className="text-[#2D6A4A] text-lg mb-5">
        {total} ප්‍රශ්නයෙන් <strong>{score}</strong> ක් නිවැරදි
      </p>

      {/* Stars */}
      <div className="flex justify-center gap-3 mb-6 text-4xl" aria-label={`${stars} stars`}>
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}
          >
            {i < stars ? '⭐' : '☆'}
          </motion.span>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-2xl bg-[#A8D5BA] text-[#1A3A2A] font-bold text-base
                     border-2 border-[#7CB89A] hover:scale-105 active:scale-95 transition-transform"
        >
          🔄 නැවත
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3 rounded-2xl bg-[#BDE0FE] text-[#1A3060] font-bold text-base
                     border-2 border-[#8EC8FF] hover:scale-105 active:scale-95 transition-transform"
        >
          🏠 නිවස
        </button>
      </div>
    </motion.div>
  );
};

// ── LetterSoundMatch (main) ───────────────────────────────────────────────────

const LetterSoundMatch = () => {
  const navigate = useNavigate();
  const { state: locState } = useLocation();
  const level = locState?.level ?? 1;

  // Resolve questions and shuffle choices once per question
  const rawQuestions = useMemo(
    () => LETTER_SOUND_LEVELS[level] ?? LETTER_SOUND_LEVELS[1],
    [level]
  );
  const questions = useMemo(
    () => rawQuestions.map((q) => ({ ...q, shuffledChoices: shuffle(q.choices) })),
    [rawQuestions]
  );

  const [qIndex,     setQIndex]     = useState(0);
  const [phase,      setPhase]      = useState('playing'); // 'playing'|'correct'|'wrong'|'finished'
  const [selectedId, setSelectedId] = useState(null);
  const [score,      setScore]      = useState(0);

  const q            = questions[qIndex];
  const choiceItems  = useMemo(() => q.shuffledChoices.map((id) => ITEMS[id]), [q]);
  const gridCols     = choiceItems.length <= 3 ? 'grid-cols-3' : 'grid-cols-2';

  // ── Speak letter on new question
  // Voices load asynchronously in Chrome; wait for voiceschanged if list is empty
  useEffect(() => {
    if (phase !== 'playing') return;
    let t;
    const doSpeak = () => { t = setTimeout(() => speak(q.letter), 400); };

    const synth = window.speechSynthesis;
    if (!synth) return;

    if (synth.getVoices().length > 0) {
      doSpeak();
    } else {
      // Voices not yet loaded — wait for them, then speak
      const onVoicesChanged = () => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        doSpeak();
      };
      synth.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        clearTimeout(t);
      };
    }
    return () => clearTimeout(t);
  }, [qIndex]); // intentionally only on index change

  // ── Handle a choice tap
  const handleSelect = useCallback(
    (id) => {
      if (phase !== 'playing') return;
      setSelectedId(id);

      if (id === q.correctId) {
        setPhase('correct');
        setScore((s) => s + 1);
        setTimeout(() => {
          if (qIndex + 1 >= questions.length) {
            setPhase('finished');
          } else {
            setQIndex((i) => i + 1);
            setSelectedId(null);
            setPhase('playing');
          }
        }, 1300);
      } else {
        setPhase('wrong');
        setTimeout(() => {
          setSelectedId(null);
          setPhase('playing');
        }, 900);
      }
    },
    [phase, q, qIndex, questions.length]
  );

  // ── Retry
  const handleRetry = () => {
    setQIndex(0);
    setScore(0);
    setSelectedId(null);
    setPhase('playing');
  };

  // ── Determine each card's visual state
  const getCardState = (id) => {
    if (selectedId === id)         return id === q.correctId ? 'correct' : 'wrong';
    if (phase === 'correct' && id === q.correctId) return 'correct';
    return 'idle';
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main
      className="min-h-screen relative overflow-hidden font-[Poppins,Arial,sans-serif]"
      style={{ background: 'linear-gradient(170deg, #C5EDD6 0%, #E6F4EA 35%, #E8F4FD 65%, #C8E0FB 100%)' }}
    >
      <FloatingJungleAnimals />
      {/* Static decorations */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-4 right-8  text-5xl opacity-55">☀️</div>
        <div className="absolute top-3 left-10  text-4xl opacity-35">☁️</div>
        <div className="absolute bottom-5 left-4  text-3xl opacity-45">🌿</div>
        <div className="absolute bottom-5 right-4 text-3xl opacity-45">🌸</div>
        <div className="absolute top-1/2 left-2  text-2xl opacity-25">🍃</div>
        <div className="absolute top-1/3 right-2 text-2xl opacity-25">🌱</div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">

        {/* ── Top bar: back / level info / score ── */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('/dyslexia')}
            className="w-11 h-11 rounded-2xl bg-white/70 border-2 border-[#A8D5BA] text-[#1A4A2A]
                       font-bold text-xl flex items-center justify-center
                       hover:scale-105 active:scale-95 transition-transform"
            aria-label="Back to home"
          >
            ←
          </button>

          <div className="text-center">
            <p className="text-[#2D6A4A] font-semibold text-sm">
              🎧 ශබ්ද - රූප ගැළපීම
            </p>
            <p className="text-[#1A4A2A] font-black text-base">
              {phase !== 'finished'
                ? `ප්‍රශ්නය ${qIndex + 1} / ${questions.length}  ·  මට්ටම ${level}`
                : '✓ ඉවරයි!'}
            </p>
          </div>

          {/* Score badge */}
          <div
            className="w-11 h-11 rounded-2xl bg-[#FFD166]/85 border-2 border-[#E6B800]
                       flex items-center justify-center"
            aria-label={`Score: ${score}`}
          >
            <span className="text-[#4A3000] font-black text-base">{score}</span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {phase !== 'finished' && (
          <div className="mb-5 h-3 rounded-full bg-white/50 overflow-hidden" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#74C69D]"
              animate={{
                width: `${((qIndex + (phase === 'correct' ? 1 : 0)) / questions.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* ── Finished screen ── */}
        {phase === 'finished' ? (
          <ResultsScreen
            score={score}
            total={questions.length}
            level={level}
            onRetry={handleRetry}
            onHome={() => navigate('/dyslexia')}
          />
        ) : (
          <>
            {/* ── Audio prompt card ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`letter-${qIndex}`}
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.35 }}
                className="mb-5"
              >
                <div
                  className="bg-white/85 backdrop-blur-sm rounded-[28px] p-6 shadow-xl
                             border-4 border-[#A8D5BA] text-center"
                >
                  <p className="text-[#2D6A4A] font-semibold text-base mb-5 leading-snug">
                    🎧 ශබ්දය අසා නිවැරදි රූපය තෝරන්න 👇
                  </p>

                  {/* Big audio button — no letter shown */}
                  <motion.button
                    onClick={() => speak(q.letter)}
                    className="inline-flex flex-col items-center gap-2
                               bg-gradient-to-br from-[#52B788] to-[#74C69D]
                               rounded-full w-28 h-28 shadow-xl border-4 border-[#3A9A6C]
                               justify-center focus-visible:outline-none
                               focus-visible:ring-4 focus-visible:ring-[#FFD166]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={phase === 'playing' ? { boxShadow: [
                      '0 0 0 0px rgba(82,183,136,0.5)',
                      '0 0 0 14px rgba(82,183,136,0)',
                    ]} : {}}
                    transition={phase === 'playing' ? { duration: 1.2, repeat: Infinity, ease: 'easeOut' } : {}}
                    aria-label="Tap to hear the letter sound"
                    disabled={phase !== 'playing'}
                  >
                    <span className="text-5xl">🔊</span>
                  </motion.button>

                  <p className="text-[#52B788] text-sm mt-4 opacity-80">
                    👆 ස්පර්ශ කර නැවත ශබ්දය අසන්න
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── Choice grid ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`choices-${qIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`grid ${gridCols} gap-3`}
              >
                {choiceItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <ChoiceCard
                      item={item}
                      cardState={getCardState(item.id)}
                      onSelect={handleSelect}
                      disabled={phase !== 'playing'}
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

export default LetterSoundMatch;