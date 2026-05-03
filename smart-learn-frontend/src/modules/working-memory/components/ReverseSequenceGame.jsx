import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

// Simplified 3-level design for young children
const LEVELS = [
  { id: 1, name: "Mirror - Easy", items: ["🍎", "🍌", "🍇"], seqLen: 3, rounds: 2, speed: 1000, itemSize: "7xl" },
  { id: 2, name: "Mirror - Medium", items: ["🍎", "🍌", "🍇", "🔴", "🟢"], seqLen: 4, rounds: 2, speed: 800, itemSize: "5xl" },
  { id: 3, name: "Mirror - Hard", items: ["🍎", "🍌", "🍇", "🔴", "🟢", "🚗"], seqLen: 4, rounds: 3, speed: 700, itemSize: "5xl" },
];

const ITEM_SPEECH = {
  "🍎": "ඇපල්",
  "🍌": "කෙසෙල්",
  "🍇": "මිදි",
  "🚗": "කාර්",
  "🚌": "බස්",
  "✈️": "ගුවන් යානය",
  "🔴": "රතු",
  "🟢": "කොළ",
  "🔵": "නිල්",
  A: "A",
  B: "B",
  C: "C",
  "🐶": "බල්ලා",
  "🐱": "පූසා",
};

const speakSinhala = (item) => {
  const utterance = new SpeechSynthesisUtterance(ITEM_SPEECH[item] || "හරි");
  utterance.lang = "si-LK";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const playBeep = (type = "correct") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type === "correct" ? "sine" : "triangle";
    oscillator.frequency.value = type === "correct" ? 880 : 220;
    gain.gain.value = 0.001;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(0);
    gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, 300);
  } catch {
    // ignore audio errors
  }
};

const playLevelUpSound = () => {
  try {
    const audio = new Audio("/level-up.mp3");
    audio.volume = 1;
    audio.play();
  } catch {
    // ignore audio errors
  }
};

const fireConfetti = () => {
  confetti({ particleCount: 100, spread: 120, origin: { y: 0.6 } });
};

const ProgressBar = ({ percent }) => (
  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
    <div
      className="h-3 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 transition-all duration-300"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const LevelDot = ({ level, state, onClick }) => {
  const className =
    state === "locked"
      ? "bg-gray-300 text-gray-500"
      : state === "completed"
        ? "bg-green-500 text-white"
        : "bg-yellow-300 text-yellow-900 ring-4 ring-yellow-100";

  return (
    <motion.button
      whileTap={{ scale: state === "locked" ? 1 : 0.96 }}
      onClick={onClick}
      className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold shadow-md ${className}`}
      aria-label={`Level ${level}`}
    >
      {state === "locked" ? "🔒" : state === "completed" ? "✔" : level}
    </motion.button>
  );
};

const Stars = ({ accuracy }) => {
  const count = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  return <div className="text-4xl">{Array.from({ length: count }, (_, i) => <span key={i}>⭐</span>)}</div>;
};

const ReverseSequenceGame = ({ level: providedLevel = 1, initialLevel, onComplete = null, gameId = "reverse-sequence" }) => {
  const startLevel = initialLevel ?? providedLevel;
  const {
    initializeGame,
    isLevelUnlocked,
    isLevelCompleted,
    completeLevel,
    updateLevelProgress,
    getLevelProgress,
    getLevelStats,
  } = useProgress();

  const [level, setLevel] = useState(startLevel);
  const cfg = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level - 1))];

  const [roundIndex, setRoundIndex] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [showing, setShowing] = useState(false);
  const [inputIndex, setInputIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [times, setTimes] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  const startTsRef = useRef(null);
  const timeoutRefs = useRef([]);

  useEffect(() => {
    initializeGame(gameId);
    resetRoundState();
    return () => {
      timeoutRefs.current.forEach((id) => clearTimeout(id));
      timeoutRefs.current = [];
      speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useEffect(() => {
    const percent = Math.round((roundIndex / cfg.rounds) * 100);
    updateLevelProgress(gameId, level, percent, { attempts, correctTaps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, attempts, correctTaps, level]);

  const resetRoundState = () => {
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];
    setRoundIndex(0);
    setSequence([]);
    setShowing(false);
    setInputIndex(0);
    setMessage("");
    setTimes([]);
    setAttempts(0);
    setCorrectTaps(0);
    setLevelComplete(false);
    startNewRound();
  };

  const randomSequence = () => {
    const seq = [];
    for (let i = 0; i < cfg.seqLen; i += 1) {
      seq.push(cfg.items[Math.floor(Math.random() * cfg.items.length)]);
    }
    return seq;
  };

  const startNewRound = () => {
    setMessage("");
    setInputIndex(0);
    const seq = randomSequence();
    setSequence(seq);
    setShowing(true);

    const instruction = new SpeechSynthesisUtterance("මෙය මතක තබා ගන්න");
    instruction.lang = "si-LK";
    speechSynthesis.cancel();
    speechSynthesis.speak(instruction);

    seq.forEach((item, index) => {
      const timeoutId = setTimeout(() => {
        setMessage(item);
        playBeep("correct");
        speakSinhala(item);
      }, index * cfg.speed);
      timeoutRefs.current.push(timeoutId);
    });

    const revealTimeout = setTimeout(() => {
      setShowing(false);
      setMessage("");
      startTsRef.current = Date.now();
    }, cfg.seqLen * cfg.speed + 300);
    timeoutRefs.current.push(revealTimeout);
  };

  const computeStats = (timesArr, totalAttempts, totalCorrect) => {
    const total = timesArr.reduce((sum, value) => sum + value, 0);
    const avg = timesArr.length ? Math.round(total / timesArr.length) : 0;
    const best = timesArr.length ? Math.min(...timesArr) : 0;
    const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    return {
      attempts: totalAttempts,
      correctTaps: totalCorrect,
      accuracy,
      avgTimeMs: avg,
      bestTimeMs: best,
      times: timesArr,
    };
  };

  const finishLevel = (nextTimes, totalAttempts, totalCorrect) => {
    const stats = computeStats(nextTimes, totalAttempts, totalCorrect);
    setLevelComplete(true);
    fireConfetti();
    playLevelUpSound();
    completeLevel(gameId, level, stats);
    updateLevelProgress(gameId, level, 100, stats);
    if (onComplete) onComplete(level, stats);
  };

  const handlePick = (item) => {
    if (showing || levelComplete) return;

    setAttempts((value) => value + 1);
    const reversedSequence = [...sequence].reverse();
    const expected = reversedSequence[inputIndex];

    if (item === expected) {
      playBeep("correct");
      speakSinhala(item);
      setCorrectTaps((value) => value + 1);
      
      // Celebrate correct tap with bounce effect
      confetti({
        particleCount: 20,
        spread: 60,
        origin: { y: 0.6 },
      });

      const nextInput = inputIndex + 1;
      setInputIndex(nextInput);

      if (nextInput >= sequence.length) {
        const took = Date.now() - startTsRef.current;
        const nextTimes = [...times, took];
        setTimes(nextTimes);
        const nextRound = roundIndex + 1;

        if (nextRound >= cfg.rounds) {
          finishLevel(nextTimes, attempts + 1, correctTaps + 1);
          return;
        }

        setRoundIndex(nextRound);
        const timeoutId = setTimeout(() => startNewRound(), 500);
        timeoutRefs.current.push(timeoutId);
      }
    } else {
      playBeep("wrong");
      const utterance = new SpeechSynthesisUtterance("නැවත උත්සාහ කරන්න");
      utterance.lang = "si-LK";
      speechSynthesis.speak(utterance);
    }
  };

  const currentProgress = getLevelProgress(gameId, level);
  const stats = getLevelStats(gameId, level) || {};
  const accuracy = stats.accuracy ?? Math.round((correctTaps / Math.max(attempts, 1)) * 100);
  const progressLabel = `${Math.min(roundIndex, cfg.rounds)} / ${cfg.rounds} rounds`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4 md:flex md:gap-6">
      {/* Simplified Sidebar - Only 3 Levels */}
      <aside className="mb-6 flex items-center gap-3 overflow-x-auto md:mb-0 md:flex-col md:gap-4 md:min-w-[80px]">
        {LEVELS.map((item) => {
          const unlocked = isLevelUnlocked(gameId, item.id);
          const completed = isLevelCompleted(gameId, item.id);
          const isCurrent = item.id === level;
          const state = !unlocked ? "locked" : completed ? "completed" : isCurrent ? "current" : "unlocked";
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: state === "locked" ? 1 : 0.9 }}
              onClick={() => unlocked && setLevel(item.id)}
              className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold shadow-lg transition-all ${
                state === "locked"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : state === "completed"
                    ? "bg-green-500 text-white"
                    : state === "current"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white ring-4 ring-purple-200"
                      : "bg-purple-200 text-purple-700 hover:bg-purple-300"
              }`}
            >
              {state === "locked" ? "🔒" : state === "completed" ? "✅" : item.id}
            </motion.button>
          );
        })}
      </aside>

      <main className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl bg-white/95 p-6 text-center shadow-2xl backdrop-blur">
          {/* Title & Level Info */}
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            🪞 Mirror Memory
          </h1>
          <p className="mt-2 text-lg font-bold text-gray-700">{cfg.name}</p>
          <p className="mt-1 text-sm text-gray-500">Watch the order. Tap backwards! 🔄</p>

          {/* Simple Progress Bar */}
          <div className="mt-5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 shadow-inner">
            <div className="flex justify-between items-center text-sm font-bold text-gray-700 mb-2">
              <span>Round {Math.min(roundIndex + 1, cfg.rounds)} of {cfg.rounds}</span>
              <span>✅ {correctTaps} correct</span>
            </div>
            <ProgressBar percent={currentProgress} />
          </div>

          {/* Big, Fun Display Area */}
          <div className="mt-8 flex h-48 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 shadow-inner">
            <AnimatePresence mode="wait">
              {showing ? (
                <motion.div
                  key={message || "show"}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`text-${cfg.itemSize} font-bold`}
                >
                  {message}
                </motion.div>
              ) : (
                <motion.div
                  key={`sequence-${roundIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  {sequence.map((item, index) => (
                    <motion.span
                      key={`${item}-${index}`}
                      animate={{
                        opacity: index < inputIndex ? 0.3 : 1,
                        scale: index < inputIndex ? 0.8 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="text-4xl"
                    >
                      {item}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {levelComplete ? (
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-yellow-100 to-orange-100 p-6 shadow-inner border-4 border-yellow-300">
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-2xl font-extrabold text-yellow-800">Great job!</div>
              <div className="mt-3 text-lg font-bold text-gray-700">Accuracy: {accuracy}%</div>
              <div className="mt-4"><Stars accuracy={accuracy} /></div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {level < LEVELS.length ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setLevel((value) => Math.min(LEVELS.length, value + 1))}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-lg font-extrabold text-white shadow-xl"
                  >
                    Next Level 🚀
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={resetRoundState}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-lg font-extrabold text-white shadow-xl"
                  >
                    Play Again 🔁
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={resetRoundState}
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-purple-600 shadow-lg border-2 border-purple-300"
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              {/* Item Buttons - Large & Clickable */}
              <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 max-w-md mx-auto">
                {cfg.items.map((item, index) => (
                  <motion.button
                    key={`${item}-${index}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePick(item)}
                    className="rounded-2xl bg-gradient-to-br from-white to-purple-50 p-4 text-5xl shadow-lg transition-all hover:shadow-2xl border-2 border-purple-200"
                  >
                    {item}
                  </motion.button>
                ))}
              </div>

              {/* Restart Button */}
              <div className="mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetRoundState}
                  className="rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 px-6 py-3 font-bold text-white shadow-lg"
                >
                  🔁 Restart
                </motion.button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReverseSequenceGame;
