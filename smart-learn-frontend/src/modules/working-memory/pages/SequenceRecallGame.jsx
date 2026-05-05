import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

const LEVELS = [
  {
    id: 1,
    name: "Fruits",
    difficulty: "ආරම්ප්‍රමබක",
    difficultyColor: "bg-green-400 text-white",
    emoji: "🍎",
    items: ["🍎", "🍌", "🍇"],
    seqLen: 1,
    rounds: 3,
    speed: 1600,
    displayBg: "from-green-50 via-yellow-50 to-lime-50",
    borderColor: "border-green-300",
    hint: "පලතුර බලන්න තපා ක්ලික් කරන්න!",
  },
  {
    id: 2,
    name: "More Fruits",
    difficulty: "පහසු",
    difficultyColor: "bg-yellow-400 text-gray-900",
    emoji: "🍓",
    items: ["🍎", "🍌", "🍇", "🍓", "🍊"],
    seqLen: 2,
    rounds: 3,
    speed: 1600,
    displayBg: "from-yellow-50 via-orange-50 to-yellow-100",
    borderColor: "border-yellow-300",
    hint: "පලතුර් 2ක් ක්‍රමයට මතක තබා ගන්න!",
  },
  {
    id: 3,
    name: "Fruits & Animals",
    difficulty: "මද්‍යම",
    difficultyColor: "bg-orange-400 text-white",
    emoji: "🐶",
    items: ["🍎", "🍌", "🍇", "🐶", "🐱", "🐸"],
    seqLen: 3,
    rounds: 4,
    speed: 1500,
    displayBg: "from-orange-50 via-pink-50 to-yellow-50",
    borderColor: "border-orange-300",
    hint: "පලතුර් සහ අල ලකුනු — 3ක් මතක තබා ගන්න!",
  },
  {
    id: 4,
    name: "Animals & Vehicles",
    difficulty: "අපහසු",
    difficultyColor: "bg-red-400 text-white",
    emoji: "🚗",
    items: ["🐶", "🐱", "🐸", "🐰", "🚗", "🚌", "✈️", "🚂"],
    seqLen: 4,
    rounds: 4,
    speed: 1400,
    displayBg: "from-red-50 via-pink-50 to-orange-50",
    borderColor: "border-red-300",
    hint: "අල ලකුනු සහ ගමන වාහන — 4ක් මතක තබා ගන්න!",
  },
  {
    id: 5,
    name: "All Mixed",
    difficulty: "කුසලතා",
    difficultyColor: "bg-purple-500 text-white",
    emoji: "🌟",
    items: ["🍎", "🍌", "🐶", "🐱", "🚗", "✈️", "🚂", "A", "B", "C"],
    seqLen: 5,
    rounds: 5,
    speed: 1300,
    displayBg: "from-purple-50 via-blue-50 to-pink-50",
    borderColor: "border-purple-300",
    hint: "හෙලක්‍ගන් මිශ්‍ර — 5ක් මතක තබා ගන්න! අපී ජයග්රාහකයක්!",
  },
];

const ITEM_SPEECH = {
  "🍎": "ඇපල්",
  "🍌": "කෙසෙල්",
  "🍇": "මිදි",
  "🍓": "ස්ට්‍රෝබෙරි",
  "🍊": "දොඩම්",
  "🚗": "කාර්",
  "🚌": "බස්",
  "🚂": "දුම්රිය",
  "✈️": "ගුවන් යානය",
  "🔴": "රතු",
  "🟢": "කොළ",
  "🔵": "නිල්",
  A: "A",
  B: "B",
  C: "C",
  "🐶": "බල්ලා",
  "🐱": "පූසා",
  "🐸": "ගෙම්බා",
  "🐰": "හාවා",
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
  confetti({ particleCount: 150, spread: 140, origin: { y: 0.6 } });
};

const BUTTON_COLORS = [
  "bg-red-400 hover:bg-red-500 text-white border-b-4 border-red-600",
  "bg-orange-400 hover:bg-orange-500 text-white border-b-4 border-orange-600",
  "bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-b-4 border-yellow-600",
  "bg-green-400 hover:bg-green-500 text-white border-b-4 border-green-600",
  "bg-blue-400 hover:bg-blue-500 text-white border-b-4 border-blue-600",
  "bg-purple-400 hover:bg-purple-500 text-white border-b-4 border-purple-600",
  "bg-pink-400 hover:bg-pink-500 text-white border-b-4 border-pink-600",
  "bg-teal-400 hover:bg-teal-500 text-white border-b-4 border-teal-600",
  "bg-indigo-400 hover:bg-indigo-500 text-white border-b-4 border-indigo-600",
];

const ProgressBar = ({ percent }) => (
  <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
    <div
      className="h-5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-green-500 transition-all duration-500"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const LevelDot = ({ level, state, onClick }) => {
  const className =
    state === "locked"
      ? "bg-gray-200 text-gray-400 border-b-4 border-gray-300"
      : state === "completed"
        ? "bg-green-400 text-white border-b-4 border-green-600"
        : "bg-yellow-400 text-yellow-900 border-b-4 border-yellow-600 ring-4 ring-yellow-200";

  return (
    <motion.button
      whileHover={{ scale: state === "locked" ? 1 : 1.08 }}
      whileTap={{ scale: state === "locked" ? 1 : 0.92 }}
      onClick={onClick}
      className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold shadow-lg ${className}`}
      aria-label={`Level ${level}`}
    >
      {state === "locked" ? "🔒" : state === "completed" ? "⭐" : level}
    </motion.button>
  );
};

const Stars = ({ accuracy }) => {
  const count = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  return <div className="text-4xl">{Array.from({ length: count }, (_, i) => <span key={i}>⭐</span>)}</div>;
};

const FinalSummaryPopup = ({ levelStats, onClose }) => {
  const totalAccuracy = Math.round(
    levelStats.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / levelStats.length
  );
  const overallStars = totalAccuracy >= 90 ? 3 : totalAccuracy >= 70 ? 2 : totalAccuracy >= 50 ? 1 : 0;
  const performanceMsg =
    totalAccuracy >= 90
      ? { text: "කෙස් කරනා! අපී ගලම්!", color: "text-green-600", bg: "from-green-100 to-lime-100" }
      : totalAccuracy >= 70
        ? { text: "පෑරෙො කරනා! අපී ඀නා කල්!", color: "text-blue-600", bg: "from-blue-100 to-cyan-100" }
        : totalAccuracy >= 50
          ? { text: "නැවත කරන්න! ඉකියනු වෙදියට යන්නා!", color: "text-orange-600", bg: "from-orange-100 to-yellow-100" }
          : { text: "පෑරට කරන්න! ගේන්න වෙදියට යන්නා!", color: "text-red-600", bg: "from-red-100 to-pink-100" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.7, y: 60 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-6xl">🏆</div>
          <h2 className="mt-3 text-3xl font-extrabold text-purple-700">හේලා ආරම්ප්‍රම ගෙවෙනැරේ!</h2>
          <p className="mt-1 text-lg font-bold text-orange-500">සල්ලා ලඞ්ක ළකා පසු කරා ගත්තා! 🌟</p>
          <div className={`mt-4 rounded-2xl bg-gradient-to-r ${performanceMsg.bg} p-4`}>
            <div className={`text-2xl font-extrabold ${performanceMsg.color}`}>{performanceMsg.text}</div>
            <div className="mt-2 text-5xl font-extrabold text-gray-900">{totalAccuracy}%</div>
            <div className="mt-1 text-sm font-semibold text-gray-500">සමග නිවැරදිය</div>
            <div className="mt-2 text-4xl">{Array.from({ length: overallStars }, (_, i) => <span key={i}>⭐</span>)}</div>
          </div>
          <div className="mt-4 space-y-2">
            {levelStats.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-2 text-sm font-bold">
                <span className="flex items-center gap-1">
                  <span>{LEVELS[i].emoji}</span>
                  <span className="text-gray-700">{LEVELS[i].name}</span>
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${LEVELS[i].difficultyColor}`}>{LEVELS[i].difficulty}</span>
                </span>
                <span className="text-purple-700">{s.accuracy ?? 0}%</span>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-yellow-400 border-b-4 border-yellow-600 py-4 text-xl font-extrabold text-gray-900 shadow-lg"
          >
            🔁 නැවතත කෙලියන්න
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const SequenceRecallGame = ({ level: providedLevel = 1, initialLevel, onComplete = null, gameId = "sequence-recall" }) => {
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
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [allLevelStats, setAllLevelStats] = useState([]);

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
    if (level === LEVELS.length) {
      const updatedStats = LEVELS.map((l) => {
        if (l.id === level) return stats;
        return getLevelStats(gameId, l.id) || { accuracy: 0 };
      });
      setAllLevelStats(updatedStats);
      setTimeout(() => setShowFinalSummary(true), 1800);
    }
  };

  const handlePick = (item) => {
    if (showing || levelComplete) return;

    setAttempts((value) => value + 1);
    const expected = sequence[inputIndex];

    if (item === expected) {
      playBeep("correct");
      speakSinhala(item);
      setCorrectTaps((value) => value + 1);
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
        const timeoutId = setTimeout(() => startNewRound(), 700);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-200 p-4 md:flex md:gap-6">
      <AnimatePresence>
        {showFinalSummary && (
          <FinalSummaryPopup
            levelStats={allLevelStats}
            onClose={() => {
              setShowFinalSummary(false);
              setLevel(1);
              resetRoundState();
            }}
          />
        )}
      </AnimatePresence>
      <aside className="mb-6 flex items-start gap-3 overflow-x-auto md:mb-0 md:min-w-[210px] md:flex-col md:overflow-visible">
        {LEVELS.map((item) => {
          const unlocked = isLevelUnlocked(gameId, item.id);
          const completed = isLevelCompleted(gameId, item.id);
          const isCurrent = item.id === level;
          const state = !unlocked ? "locked" : completed ? "completed" : isCurrent ? "current" : "unlocked";
          return (
            <div key={item.id} className="flex min-w-[170px] items-center gap-3 md:min-w-0 md:flex-col md:items-start">
              <LevelDot level={item.id} state={state} onClick={() => unlocked && setLevel(item.id)} />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-800">{item.emoji} {item.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${item.difficultyColor}`}>
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-gray-500">
                    {state === "locked" ? "🔒" : state === "completed" ? "✅" : isCurrent ? "🟡" : ""}
                  </div>
                </div>
                <div className="mt-2 w-full min-w-[120px] md:w-36">
                  <ProgressBar percent={getLevelProgress(gameId, item.id)} />
                </div>
              </div>
            </div>
          );
        })}
      </aside>

      <main className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl bg-white p-6 text-center shadow-2xl">
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-yellow-50 p-4 shadow-inner">
            <div className="flex items-center justify-between gap-3 text-left">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Progress Tracking</div>
                <div className="text-sm font-semibold text-gray-800">{progressLabel}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Accuracy</div>
                <div className="text-sm font-extrabold text-gray-800">{accuracy}%</div>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar percent={currentProgress} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold text-gray-600">
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">Attempts<br />{attempts}</div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">Correct<br />{correctTaps}</div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">Done<br />{roundIndex}</div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-purple-700 drop-shadow">🐰 අනුක්‍රම මතකය 🌟</h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-2xl">{cfg.emoji}</span>
            <span className="text-xl font-extrabold text-orange-500">{cfg.name}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold shadow ${cfg.difficultyColor}`}>
              {cfg.difficulty}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-500 italic">{cfg.hint}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {Array.from({ length: cfg.rounds }, (_, i) => (
              <span key={i} className={`text-2xl transition-all ${i < roundIndex ? "opacity-100" : "opacity-30"}`}>⭐</span>
            ))}
          </div>

          <div className={`mt-6 flex h-52 items-center justify-center rounded-3xl border-4 border-dashed ${cfg.borderColor} bg-gradient-to-r ${cfg.displayBg} shadow-inner`}>
            <AnimatePresence mode="wait">
              {showing ? (
                <motion.div
                  key={message || "show"}
                  initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1.1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="text-8xl drop-shadow-lg"
                >
                  {message}
                </motion.div>
              ) : (
                <motion.div
                  key={`blank-${roundIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap items-center justify-center gap-2"
                >
                  {sequence.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className={`text-4xl transition-all duration-300 ${index < inputIndex ? "opacity-100 scale-110" : "opacity-25"}`}
                    >
                      {item}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {levelComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-3xl bg-gradient-to-br from-green-100 via-yellow-50 to-pink-100 p-6 shadow-inner border-4 border-yellow-300"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <div className="mt-2 inline-block rounded-2xl bg-green-500 px-6 py-2 text-2xl font-extrabold text-white shadow-md">
                ඩෙරෙන්න සමග් කරට ජයගත්තා!
              </div>
              <div className="mt-1 text-xl font-bold text-orange-500">Level {level} — {cfg.name} 🏆</div>
              <div className="mt-4 text-2xl font-extrabold text-purple-700">{accuracy}% නිවැරදි!</div>
              <div className="mt-2"><Stars accuracy={accuracy} /></div>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setLevel((value) => Math.min(LEVELS.length, value + 1))}
                  className="rounded-full bg-yellow-400 border-b-4 border-yellow-600 px-8 py-4 text-xl font-extrabold text-gray-900 shadow-lg"
                >
                  ඊළඟ Level 🚀
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={resetRoundState}
                  className="rounded-full bg-pink-400 border-b-4 border-pink-600 px-8 py-4 text-xl font-bold text-white shadow-lg"
                >
                  🔁 නැවත
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              <p className="mt-4 text-base font-bold text-purple-600">👇 හරි ගෙඩිය click කරන්න!</p>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {cfg.items.map((item, index) => (
                  <motion.button
                    key={`${item}-${index}`}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.9, y: 0 }}
                    onClick={() => handlePick(item)}
                    className={`rounded-3xl p-5 text-4xl shadow-lg transition-all ${BUTTON_COLORS[index % BUTTON_COLORS.length]}`}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={resetRoundState}
                  className="rounded-full bg-pink-400 border-b-4 border-pink-600 px-6 py-3 text-lg font-bold text-white shadow-lg"
                >
                  🔁 නැවත
                </motion.button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};


export default SequenceRecallGame;