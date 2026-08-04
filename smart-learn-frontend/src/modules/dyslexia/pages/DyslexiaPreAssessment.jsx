/**
 * DyslexiaPreAssessment
 *
 * 7-question pre-assessment:
 *   Q1-Q3  — Letter identification (see letter, pick matching picture)
 *   Q4-Q5  — Two-letter word (hear word audio, pick matching picture)
 *   Q6-Q7  — Three-letter word (hear word audio, pick matching picture)
 *
 * On completion, scores are saved via useDyslexiaProgress and the child
 * is navigated to /dyslexia with sections unlocked accordingly.
 */

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Star, ArrowRight, RotateCcw } from 'lucide-react';

import AnimatedJungleBackground from '../components/AnimatedJungleBackground';
import useDyslexiaProgress from '../hooks/useDyslexiaProgress';

// ── Assets ──────────────────────────────────────────────────────────────────

// Letter audio (for Q1-Q3: play the letter sound)
import gaAudio  from '../../../assets/voice/ga.wav';
import kaAudio  from '../../../assets/voice/ka.wav';
import paAudio  from '../../../assets/voice/pa.mp3';

// Two-letter word audio (Q4-Q5)
import gasaAudio from '../../../assets/voice/gasa.wav';
import kahaAudio from '../../../assets/voice/kaha.wav';

// Three-letter word audio (Q6-Q7)
import yahanaAudio from '../../../assets/voice/yahana.wav';
import pahanaAudio from '../../../assets/voice/pahana.wav';

// Images for letter questions (show letter → pick picture that starts with that letter)
const treeImg   = '/src/assets/images/2letters/tree.jpg';
const yellowImg = '/src/assets/images/2letters/yellow.png';
const fiveImg   = '/src/assets/images/2letters/five.jpg';
const sevenImg  = '/src/assets/images/2letters/seven.jpg';
const soilImg   = '/src/assets/images/2letters/soil.jpg';
const sixImg    = '/src/assets/images/2letters/six.jpg';

// Images for two-letter word questions
const riverImg  = '/src/assets/images/2letters/river.jpg';
const footImg   = '/src/assets/images/2letters/foot.png';

// Images for three-letter word questions
const bedImg    = '/src/assets/images/3letters/bed.jpg';
const lampImg   = '/src/assets/images/3letters/lamp.jpg';
const noseImg   = '/src/assets/images/3letters/nose.jpg';
const ropeImg   = '/src/assets/images/3letters/rope.png';
const eyesImg   = '/src/assets/images/3letters/eyes.jpg';

// ── Question definitions ─────────────────────────────────────────────────────

/**
 * type: 'letter' → show the letter, play its sound on demand, child picks picture
 * type: 'word'   → play word audio on demand, child picks matching picture
 *
 * choices: [{ id, image, label }]
 * correctId: id of correct choice
 */
const QUESTIONS = [
  // ── Letters (Q1-Q3) ────────────────────────────────────────────────────────
  {
    id: 'q1',
    type: 'letter',
    instruction: 'මේ අකුරෙන් පටන් ගන්නේ කුමක්ද?',
    display: 'ග',
    audio: gaAudio,
    correctId: 'tree',
    choices: [
      { id: 'tree',   image: treeImg,   label: 'ගස'  },
      { id: 'five',   image: fiveImg,   label: 'පහ'  },
      { id: 'yellow', image: yellowImg, label: 'කහ'  },
    ],
  },
  {
    id: 'q2',
    type: 'letter',
    instruction: 'මේ අකුරෙන් පටන් ගන්නේ කුමක්ද?',
    display: 'ක',
    audio: kaAudio,
    correctId: 'yellow',
    choices: [
      { id: 'yellow', image: yellowImg, label: 'කහ'  },
      { id: 'soil',   image: soilImg,   label: 'පස'  },
      { id: 'six',    image: sixImg,    label: 'හය'  },
    ],
  },
  {
    id: 'q3',
    type: 'letter',
    instruction: 'මේ අකුරෙන් පටන් ගන්නේ කුමක්ද?',
    display: 'ප',
    audio: paAudio,
    correctId: 'five',
    choices: [
      { id: 'five',  image: fiveImg,  label: 'පහ' },
      { id: 'tree',  image: treeImg,  label: 'ගස' },
      { id: 'seven', image: sevenImg, label: 'හත' },
    ],
  },
  // ── Two-letter words (Q4-Q5) ───────────────────────────────────────────────
  {
    id: 'q4',
    type: 'word',
    instruction: 'ඇසෙන වචනයට ගැළැපෙන පිංතූරය තෝරන්න.',
    display: 'ගස',
    audio: gasaAudio,
    correctId: 'tree',
    choices: [
      { id: 'tree',  image: treeImg,  label: 'ගස' },
      { id: 'river', image: riverImg, label: 'ගඟ' },
      { id: 'five',  image: fiveImg,  label: 'පහ' },
    ],
  },
  {
    id: 'q5',
    type: 'word',
    instruction: 'ඇසෙන වචනයට ගැළැපෙන පිංතූරය තෝරන්න.',
    display: 'කහ',
    audio: kahaAudio,
    correctId: 'yellow',
    choices: [
      { id: 'yellow', image: yellowImg, label: 'කහ' },
      { id: 'foot',   image: footImg,   label: 'පය' },
      { id: 'seven',  image: sevenImg,  label: 'හත' },
    ],
  },
  // ── Three-letter words (Q6-Q7) ─────────────────────────────────────────────
  {
    id: 'q6',
    type: 'word',
    instruction: 'ඇසෙන වචනයට ගැළැපෙන පිංතූරය තෝරන්න.',
    display: 'යහන',
    audio: yahanaAudio,
    correctId: 'bed',
    choices: [
      { id: 'bed',  image: bedImg,  label: 'යහන' },
      { id: 'lamp', image: lampImg, label: 'පහන' },
      { id: 'nose', image: noseImg, label: 'කඩය' },
    ],
  },
  {
    id: 'q7',
    type: 'word',
    instruction: 'ඇසෙන වචනයට ගැළැපෙන පිංතූරය තෝරන්න.',
    display: 'පහන',
    audio: pahanaAudio,
    correctId: 'lamp',
    choices: [
      { id: 'lamp', image: lampImg, label: 'පහන' },
      { id: 'rope', image: ropeImg, label: 'කසය' },
      { id: 'eyes', image: eyesImg, label: 'නයන' },
    ],
  },
];

const TOTAL = QUESTIONS.length;
const LETTER_IDS  = ['q1', 'q2', 'q3'];
const TWO_LETTER_IDS   = ['q4', 'q5'];
const THREE_LETTER_IDS = ['q6', 'q7'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function playChime(success) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.28, ctx.currentTime);
    master.connect(ctx.destination);

    const notes = success
      ? [{ f: 523, d: 0.00 }, { f: 659, d: 0.12 }, { f: 784, d: 0.24 }]
      : [{ f: 330, d: 0.00 }, { f: 262, d: 0.18 }];

    notes.forEach(({ f, d }) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(g);
      g.connect(master);
      const t = ctx.currentTime + d + 0.02;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.32);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch (_) {}
}

// ── Sub-components ───────────────────────────────────────────────────────────

const ProgressBar = ({ current, total }) => (
  <div className="w-full max-w-md mx-auto mb-6">
    <div className="flex justify-between text-white/80 text-sm font-semibold mb-1 px-1">
      <span>ප්‍රශ්නය {current} / {total}</span>
      <span>{Math.round((current / total) * 100)}%</span>
    </div>
    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #34d399, #059669)' }}
        initial={{ width: 0 }}
        animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  </div>
);

const AudioButton = ({ audio, label }) => {
  const ref = useRef(null);
  const play = useCallback(() => {
    if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; }
    const a = new Audio(audio);
    ref.current = a;
    a.play().catch(() => {});
  }, [audio]);

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={play}
      aria-label={label || 'Play audio'}
      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/90 shadow-lg
                 text-green-800 font-bold text-base
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
    >
      <Volume2 size={22} />
      <span>ශබ්දය අසන්න</span>
    </motion.button>
  );
};

const ChoiceCard = ({ choice, selected, correct, revealed, onSelect }) => {
  let border = 'border-white/30';
  let bg     = 'bg-white/90';
  let ring   = '';

  if (revealed && choice.id === correct) {
    border = 'border-green-400';
    bg     = 'bg-green-100';
    ring   = 'ring-4 ring-green-400';
  } else if (revealed && choice.id === selected && choice.id !== correct) {
    border = 'border-red-400';
    bg     = 'bg-red-100';
    ring   = 'ring-4 ring-red-400';
  } else if (!revealed && choice.id === selected) {
    border = 'border-blue-400';
    ring   = 'ring-4 ring-blue-300';
  }

  return (
    <motion.button
      whileHover={!revealed ? { scale: 1.06, y: -3 } : {}}
      whileTap={!revealed ? { scale: 0.94 } : {}}
      onClick={() => !revealed && onSelect(choice.id)}
      disabled={revealed}
      aria-label={choice.label}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 shadow-md
                  cursor-pointer transition-colors duration-150
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60
                  ${bg} ${border} ${ring}`}
    >
      <img
        src={choice.image}
        alt={choice.label}
        className="w-24 h-24 object-cover rounded-xl"
        onError={(e) => { e.target.style.background = '#ddd'; e.target.alt = choice.label; }}
      />
      <span className="text-lg font-black text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {choice.label}
      </span>
    </motion.button>
  );
};

// ── Result Screen ─────────────────────────────────────────────────────────────

const ResultScreen = ({ scores, unlockedCount, onContinue, onRetake }) => {
  const total = scores.letters + scores.twoLetter + scores.threeLetter;
  const percent = Math.round((total / TOTAL) * 100);

  const gradeColor = percent >= 70 ? '#34d399' : percent >= 40 ? '#fbbf24' : '#f87171';
  const gradeText  = percent >= 70 ? 'ඉතා හොඳයි! 🌟' : percent >= 40 ? 'හොඳයි! 😊' : 'අභ්‍යාස කරමු! 💪';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center"
    >
      <div className="text-5xl mb-3">🎉</div>
      <h2
        className="text-3xl font-black mb-1"
        style={{ fontFamily: 'Poppins, sans-serif', color: gradeColor }}
      >
        {gradeText}
      </h2>
      <p className="text-gray-600 font-semibold mb-5 text-base">
        ඔබ {total}/{TOTAL} ලකුණු ලැබුවා!
      </p>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'අකුරු', score: scores.letters,    max: 3 },
          { label: '2-අකුරු', score: scores.twoLetter,  max: 2 },
          { label: '3-අකුරු', score: scores.threeLetter, max: 2 },
        ].map(({ label, score, max }) => (
          <div key={label} className="bg-green-50 rounded-2xl p-3">
            <div className="text-2xl font-black text-green-700">{score}/{max}</div>
            <div className="text-xs font-semibold text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Unlocked info */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6">
        <p className="text-blue-800 font-bold text-sm">
          🔓 ක්‍රීඩා {unlockedCount}ක් විවෘත විය!
        </p>
        <p className="text-blue-600 text-xs mt-1">
          සෑම කාණ්ඩයකදීම සම්පූර්ණ ලකුණු ලබා ගත් ක්‍රීඩා විවෘත වේ.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                     bg-gradient-to-r from-green-500 to-emerald-600
                     text-white font-black text-lg shadow-lg
                     focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400"
        >
          <span>ක්‍රීඩා වෙත යන්න</span>
          <ArrowRight size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
          onClick={onRetake}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-2xl
                     bg-white border-2 border-gray-200
                     text-gray-600 font-bold text-sm shadow
                     focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-300"
        >
          <RotateCcw size={16} />
          <span>නැවත කරන්න</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const DyslexiaPreAssessment = () => {
  const navigate = useNavigate();
  const { completeAssessment, resetAssessment } = useDyslexiaProgress();

  const [step, setStep]     = useState(0);         // 0-based question index
  const [answers, setAnswers] = useState({});       // { qId: choiceId }
  const [selected, setSelected] = useState(null);  // currently selected choice
  const [revealed, setRevealed] = useState(false);  // answer revealed?
  const [done, setDone]     = useState(false);
  const [finalScores, setFinalScores] = useState(null);
  const [unlockedCount, setUnlockedCount] = useState(0);

  const question = QUESTIONS[step];

  const handleSelect = useCallback((choiceId) => {
    if (revealed) return;
    setSelected(choiceId);
  }, [revealed]);

  const handleConfirm = useCallback(() => {
    if (!selected || revealed) return;
    const isCorrect = selected === question.correctId;
    playChime(isCorrect);
    setRevealed(true);
    setAnswers(prev => ({ ...prev, [question.id]: selected }));
  }, [selected, revealed, question]);

  const handleNext = useCallback(() => {
    if (step + 1 < TOTAL) {
      setStep(s => s + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      // Calculate scores
      const allAnswers = { ...answers, [question.id]: selected };
      const letterScore = LETTER_IDS.filter(id => allAnswers[id] === QUESTIONS.find(q => q.id === id).correctId).length;
      const twoLetterScore = TWO_LETTER_IDS.filter(id => allAnswers[id] === QUESTIONS.find(q => q.id === id).correctId).length;
      const threeLetterScore = THREE_LETTER_IDS.filter(id => allAnswers[id] === QUESTIONS.find(q => q.id === id).correctId).length;

      const scores = { letters: letterScore, twoLetter: twoLetterScore, threeLetter: threeLetterScore };
      const unlocked = completeAssessment(scores);
      setFinalScores(scores);
      setUnlockedCount(unlocked.length);
      setDone(true);
    }
  }, [step, answers, selected, question, completeAssessment]);

  const handleRetake = useCallback(() => {
    resetAssessment();
    setStep(0);
    setAnswers({});
    setSelected(null);
    setRevealed(false);
    setDone(false);
    setFinalScores(null);
  }, [resetAssessment]);

  const handleContinue = useCallback(() => {
    navigate('/dyslexia');
  }, [navigate]);

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ fontFamily: 'Poppins, Arial, sans-serif' }}
    >
      <AnimatedJungleBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1
            className="font-black drop-shadow-lg"
            style={{
              fontSize: '2.2rem',
              color: '#FFFFFF',
              textShadow: '0 3px 14px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
            }}
          >
            ආරම්භක පරීක්ෂාව
          </h1>
          <p className="text-white/80 text-sm font-semibold mt-1">
            ඔබේ දැනුම පෙන්වන්න!
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultScreen
                scores={finalScores}
                unlockedCount={unlockedCount}
                onContinue={handleContinue}
                onRetake={handleRetake}
              />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressBar current={step + 1} total={TOTAL} />

              {/* Question Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
                {/* Question type badge */}
                <div className="flex justify-center mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{
                      background: question.type === 'letter'
                        ? 'linear-gradient(135deg, #0D3B6E, #1A6FA8)'
                        : step < 5
                          ? 'linear-gradient(135deg, #6B2D00, #B05020)'
                          : 'linear-gradient(135deg, #1A3A5C, #2D5C8A)',
                    }}
                  >
                    {question.type === 'letter' ? '📝 අකුරු' : step < 5 ? '🔤 2-අකුරු වචන' : '📖 3-අකුරු වචන'}
                  </span>
                </div>

                {/* Instruction */}
                <p className="text-center text-gray-700 font-bold text-base mb-4">
                  {question.instruction}
                </p>

                {/* Display letter/word + audio */}
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div
                    className="w-28 h-28 rounded-3xl flex items-center justify-center
                               text-white font-black shadow-lg border-4 border-white/30"
                    style={{
                      fontSize: question.type === 'letter' ? '4.5rem' : '2.4rem',
                      background: question.type === 'letter'
                        ? 'linear-gradient(135deg, #0D3B6E, #4AA8D8)'
                        : step < 5
                          ? 'linear-gradient(135deg, #6B2D00, #E07A20)'
                          : 'linear-gradient(135deg, #1A3A5C, #4A80B8)',
                    }}
                  >
                    {question.display}
                  </div>
                  <AudioButton audio={question.audio} label={`Play ${question.display}`} />
                </div>

                {/* Choices */}
                <div className={`grid gap-4 ${question.choices.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {question.choices.map(choice => (
                    <ChoiceCard
                      key={choice.id}
                      choice={choice}
                      selected={selected}
                      correct={question.correctId}
                      revealed={revealed}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>

                {/* Feedback + action buttons */}
                <div className="mt-5 flex flex-col items-center gap-3">
                  {revealed && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`font-black text-lg ${selected === question.correctId ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {selected === question.correctId ? '✅ නිවැරදියි!' : '❌ නිවැරදි පිළිතුර: ' + question.choices.find(c => c.id === question.correctId)?.label}
                    </motion.p>
                  )}

                  {!revealed ? (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirm}
                      disabled={!selected}
                      className="px-8 py-3 rounded-2xl font-black text-lg text-white shadow-lg
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-400
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 transition-opacity duration-150"
                      style={{ background: selected ? 'linear-gradient(135deg, #059669, #34d399)' : '#9ca3af' }}
                    >
                      තහවුරු කරන්න
                    </motion.button>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-lg text-white shadow-lg
                                 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
                      style={{ background: 'linear-gradient(135deg, #1A6FA8, #4AA8D8)' }}
                    >
                      <span>{step + 1 < TOTAL ? 'ඊළඟ ප්‍රශ්නය' : 'ප්‍රතිඵල බලන්න'}</span>
                      <ArrowRight size={20} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default DyslexiaPreAssessment;
