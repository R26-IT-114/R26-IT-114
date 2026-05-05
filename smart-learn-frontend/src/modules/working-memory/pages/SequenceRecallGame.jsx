import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

const LEVELS = [
  { id: 1, name: "Fruits", items: ["🍎", "🍌", "🍇"], seqLen: 3, rounds: 3, speed: 800 },
  { id: 2, name: "Fruits + Vehicles", items: ["🍎", "🍌", "🍇", "🚗", "🚌"], seqLen: 4, rounds: 3, speed: 750 },
  { id: 3, name: "Fruits + Letters", items: ["🍎", "A", "🍌", "B", "🍇", "C"], seqLen: 4, rounds: 4, speed: 700 },
  { id: 4, name: "Fruits + Colors + Vehicles", items: ["🍎", "🔴", "🟢", "🔵", "🚗", "✈️"], seqLen: 5, rounds: 4, speed: 650 },
  { id: 5, name: "All Mixed", items: ["🍎", "🍌", "🍇", "🔴", "🟢", "🚗", "🚌", "🐶", "🐱"], seqLen: 6, rounds: 5, speed: 500 },
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
      className="h-3 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-green-500 transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4 md:flex md:gap-6">
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
                    <div className="font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-500">Level {item.id}</div>
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
        <div className="rounded-3xl bg-white/90 p-6 text-center shadow-xl backdrop-blur">
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
          <h1 className="text-3xl font-extrabold text-gray-900">🐰 අනුක්‍රම මතකය</h1>
          <p className="mt-2 text-lg font-semibold text-gray-700">
            {cfg.name} · Level {level}
          </p>
          <p className="mt-1 text-sm text-gray-500">Round {Math.min(roundIndex + 1, cfg.rounds)} / {cfg.rounds}</p>

          <div className="mt-6 flex h-40 items-center justify-center rounded-3xl bg-gradient-to-r from-yellow-100 via-pink-100 to-blue-100 shadow-inner">
            <AnimatePresence mode="wait">
              {showing ? (
                <motion.div
                  key={message || "show"}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-7xl"
                >
                  {message}
                </motion.div>
              ) : (
                <motion.div
                  key={`blank-${roundIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-6xl"
                >
                  {sequence.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className={`mx-1 text-3xl transition-opacity ${index < inputIndex ? "opacity-100" : "opacity-30"}`}
                    >
                      {item}
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {levelComplete ? (
            <div className="mt-6 rounded-3xl bg-green-50 p-5 shadow-inner">
              <div className="text-2xl font-extrabold text-green-700">🎉 සුබ පැතුම්!</div>
              <div className="mt-2 text-lg font-semibold text-gray-700">Level complete</div>
              <div className="mt-4 text-2xl font-bold text-gray-900">Accuracy: {accuracy}%</div>
              <div className="mt-2"><Stars accuracy={accuracy} /></div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setLevel((value) => Math.min(LEVELS.length, value + 1))}
                  className="rounded-full bg-yellow-400 px-6 py-3 text-lg font-extrabold text-gray-900 shadow-lg"
                >
                  Next Level 🚀
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={resetRoundState}
                  className="rounded-full bg-white px-6 py-3 text-lg font-bold text-gray-700 shadow-md"
                >
                  Play Again
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {cfg.items.map((item, index) => (
                  <motion.button
                    key={`${item}-${index}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePick(item)}
                    className="rounded-3xl bg-white p-5 text-4xl shadow-lg transition-transform hover:shadow-xl"
                  >
                    {item}
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={resetRoundState}
                  className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white shadow-lg"
                >
                  🔁 නැවත
                </button>
                <div className="text-sm font-medium text-gray-600">Watch, remember, tap in order.</div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SequenceRecallGame;