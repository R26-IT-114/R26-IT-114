import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

// ─── Color Definitions ────────────────────────────────────────────────────────
const COLORS = {
  red:    { label: "රතු",       bg: "bg-red-500",    light: "bg-red-100",    border: "border-red-400"    },
  blue:   { label: "නිල්",      bg: "bg-blue-500",   light: "bg-blue-100",   border: "border-blue-400"   },
  green:  { label: "කොළ",      bg: "bg-green-500",  light: "bg-green-100",  border: "border-green-400"  },
  yellow: { label: "කහ",       bg: "bg-yellow-400", light: "bg-yellow-100", border: "border-yellow-400" },
  orange: { label: "තැඹිලි",   bg: "bg-orange-500", light: "bg-orange-100", border: "border-orange-400" },
  purple: { label: "දම්",       bg: "bg-purple-500", light: "bg-purple-100", border: "border-purple-400" },
  pink:   { label: "රෝස",      bg: "bg-pink-500",   light: "bg-pink-100",   border: "border-pink-400"   },
  teal:   { label: "කොළ-නිල්", bg: "bg-teal-500",   light: "bg-teal-100",   border: "border-teal-400"   },
};

// ─── Level Configuration ──────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: "පළමු පිය", difficulty: "ආරම්භක", difficultyColor: "bg-green-400 text-white", emoji: "🟢", seqLen: 2, rounds: 2, speed: 2000, colorKeys: ["red","blue","green","yellow"], displayBg: "from-green-50 via-yellow-50 to-lime-50", borderColor: "border-green-300", hint: "2 වර්ණ — ඔබ දැකීමෙන් පසු ටැප් කරන්න!" },
  { id: 2, name: "රංගීන් ගමන", difficulty: "පහසු", difficultyColor: "bg-yellow-400 text-gray-900", emoji: "🌈", seqLen: 2, rounds: 3, speed: 1800, colorKeys: ["red","blue","green","yellow","orange"], displayBg: "from-yellow-50 via-orange-50 to-yellow-100", borderColor: "border-yellow-300", hint: "2 වර්ණ — 5 choices — හොඳ!" },
  { id: 3, name: "වර්ණ මතකය", difficulty: "මද්‍යම", difficultyColor: "bg-orange-400 text-white", emoji: "🎨", seqLen: 3, rounds: 3, speed: 1500, colorKeys: ["red","blue","green","yellow","orange","purple"], displayBg: "from-orange-50 via-pink-50 to-yellow-50", borderColor: "border-orange-300", hint: "3 වර්ණ — ඉක්මනින් මතක රඳවා ගන්න!" },
  { id: 4, name: "දීප්ත ශ්‍රේණිය", difficulty: "අපහසු", difficultyColor: "bg-red-400 text-white", emoji: "💡", seqLen: 4, rounds: 4, speed: 1200, colorKeys: ["red","blue","green","yellow","orange","purple","pink"], displayBg: "from-red-50 via-pink-50 to-orange-50", borderColor: "border-red-300", hint: "4 වර්ණ — ශ්‍රේෂ්ඨ ශ්‍රේණිය!" },
  { id: 5, name: "ශූර වර්ණ", difficulty: "කුසලතා", difficultyColor: "bg-purple-500 text-white", emoji: "🌟", seqLen: 5, rounds: 5, speed: 1000, colorKeys: ["red","blue","green","yellow","orange","purple","pink","teal"], displayBg: "from-purple-50 via-blue-50 to-pink-50", borderColor: "border-purple-300", hint: "5 වර්ණ — ශූරයා ඔබ! 🌟" },
];

// ─── Audio & Effects ──────────────────────────────────────────────────────────
const speakSinhala = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "si-LK";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

const playBeep = (type = "correct") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === "correct" ? "sine" : "triangle";
    osc.frequency.value = type === "correct" ? 880 : 220;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(0);
    gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    setTimeout(() => { osc.stop(); ctx.close(); }, 300);
  } catch { /* ignore */ }
};

const playLevelUpSound = () => {
  try { new Audio("/level-up.mp3").play(); } catch { /* ignore */ }
};

const fireConfetti = () => {
  confetti({ particleCount: 150, spread: 140, origin: { y: 0.6 } });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const ProgressBar = ({ percent }) => (
  <div className="h-5 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
    <div className="h-5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 transition-all duration-500" style={{ width: `${percent}%` }} />
  </div>
);

const LevelDot = ({ level, state, onClick }) => {
  const className = state === "locked" ? "bg-gray-200 text-gray-400 border-b-4 border-gray-300 cursor-not-allowed" : state === "completed" ? "bg-green-400 text-white border-b-4 border-green-600" : "bg-yellow-400 text-yellow-900 border-b-4 border-yellow-600 ring-4 ring-yellow-200";
  return (
    <motion.button whileHover={{ scale: state === "locked" ? 1 : 1.08 }} whileTap={{ scale: state === "locked" ? 1 : 0.92 }} onClick={onClick} className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-extrabold shadow-lg ${className}`} aria-label={`Level ${level}`}>
      {state === "locked" ? "🔒" : state === "completed" ? "⭐" : level}
    </motion.button>
  );
};

const Stars = ({ accuracy }) => {
  const count = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
  return <div className="text-4xl">{Array.from({ length: count }, (_, i) => <span key={i}>⭐</span>)}</div>;
};

const FinalSummaryPopup = ({ levelStats, onClose }) => {
  const totalAccuracy = Math.round(levelStats.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / levelStats.length);
  const overallStars = totalAccuracy >= 90 ? 3 : totalAccuracy >= 70 ? 2 : totalAccuracy >= 50 ? 1 : 0;
  const msg = totalAccuracy >= 90 ? { text: "සාර්ථකයි! ශූරයා ඔබ! 🏆", color: "text-green-600", bg: "from-green-100 to-lime-100" } : totalAccuracy >= 70 ? { text: "ඉතා හොඳයි! 💪", color: "text-blue-600", bg: "from-blue-100 to-cyan-100" } : totalAccuracy >= 50 ? { text: "හොඳයි! නැවත උත්සාහ කරන්න! 🌟", color: "text-orange-600", bg: "from-orange-100 to-yellow-100" } : { text: "නැවත පුහුණු වන්න! 🎯", color: "text-red-600", bg: "from-red-100 to-pink-100" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.7, y: 60 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 60 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl">🏆</div>
          <h2 className="mt-3 text-3xl font-extrabold text-purple-700">සියලු Levels ජය ගත්තා!</h2>
          <p className="mt-1 text-lg font-bold text-orange-500">වර්ණ මතකය ශූරයා! 🎨</p>
          <div className={`mt-4 rounded-2xl bg-gradient-to-r ${msg.bg} p-4`}>
            <div className={`text-2xl font-extrabold ${msg.color}`}>{msg.text}</div>
            <div className="mt-2 text-5xl font-extrabold text-gray-900">{totalAccuracy}%</div>
            <div className="mt-1 text-sm font-semibold text-gray-500">සමස්ත නිවැරදිය</div>
            <div className="mt-2 text-4xl">{Array.from({ length: overallStars }, (_, i) => <span key={i}>⭐</span>)}</div>
          </div>
          <div className="mt-4 space-y-2">
            {levelStats.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-2 text-sm font-bold">
                <span className="flex items-center gap-2"><span>{LEVELS[i].emoji}</span><span className="text-gray-700">{LEVELS[i].name}</span><span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${LEVELS[i].difficultyColor}`}>{LEVELS[i].difficulty}</span></span>
                <span className="text-purple-700">{s.accuracy ?? 0}%</span>
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="mt-6 w-full rounded-full bg-yellow-400 border-b-4 border-yellow-600 py-4 text-xl font-extrabold text-gray-900 shadow-lg">🔁 නැවතත් කෙළිය හැකිය</motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Game Component ──────────────────────────────────────────────────────
const ColorMemoryGame = ({ level: providedLevel = 1, initialLevel, onComplete = null, gameId = "reverse-sequence" }) => {
  const startLevel = initialLevel ?? providedLevel;
  const { initializeGame, isLevelUnlocked, isLevelCompleted, completeLevel, updateLevelProgress, getLevelProgress, getLevelStats } = useProgress();

  const [level, setLevel] = useState(startLevel);
  const cfg = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level - 1))];

  const [phase, setPhase] = useState("waiting");
  const [sequence, setSequence] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(-1);
  const [userInput, setUserInput] = useState([]);
  const [roundWin, setRoundWin] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctTaps, setCorrectTaps] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [allLevelStats, setAllLevelStats] = useState([]);
  const [times, setTimes] = useState([]);

  const startTsRef = useRef(null);
  const timeoutRefs = useRef([]);

  const clearAllTimeouts = () => { timeoutRefs.current.forEach(clearTimeout); timeoutRefs.current = []; };
  const addTimeout = (fn, delay) => { const id = setTimeout(fn, delay); timeoutRefs.current.push(id); };

  useEffect(() => {
    initializeGame(gameId);
    resetGame();
    return () => { clearAllTimeouts(); speechSynthesis.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useEffect(() => {
    const percent = Math.round((roundIndex / cfg.rounds) * 100);
    updateLevelProgress(gameId, level, percent, { attempts, correctTaps });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, attempts, correctTaps, level]);

  const buildSequence = () => Array.from({ length: cfg.seqLen }, () => cfg.colorKeys[Math.floor(Math.random() * cfg.colorKeys.length)]);

  const startNewRound = () => {
    clearAllTimeouts();
    setUserInput([]);
    setWrongFlash(false);
    setRoundWin(false);
    const seq = buildSequence();
    setSequence(seq);
    setPhase("preview");
    setPreviewIdx(-1);
    speakSinhala("මතක තබා ගන්න");
    const stepDuration = cfg.speed + 300;
    seq.forEach((colorKey, idx) => {
      addTimeout(() => { setPreviewIdx(idx); playBeep("correct"); speakSinhala(COLORS[colorKey].label); }, 400 + idx * stepDuration);
    });
    addTimeout(() => { setPreviewIdx(-1); setPhase("input"); startTsRef.current = Date.now(); speakSinhala("දැන් ටැප් කරන්න"); }, 400 + seq.length * stepDuration + 500);
  };

  const resetGame = () => {
    clearAllTimeouts();
    setPhase("waiting"); setSequence([]); setPreviewIdx(-1); setUserInput([]); setRoundWin(false);
    setWrongFlash(false); setRoundIndex(0); setAttempts(0); setCorrectTaps(0); setLevelComplete(false); setTimes([]);
    addTimeout(() => startNewRound(), 600);
  };

  const computeStats = (timesArr, totalAttempts, totalCorrect) => {
    const avg = timesArr.length ? Math.round(timesArr.reduce((s, v) => s + v, 0) / timesArr.length) : 0;
    const best = timesArr.length ? Math.min(...timesArr) : 0;
    const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    return { attempts: totalAttempts, correctTaps: totalCorrect, accuracy, avgTimeMs: avg, bestTimeMs: best };
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
      const updatedStats = LEVELS.map((l) => l.id === level ? stats : (getLevelStats(gameId, l.id) || { accuracy: 0 }));
      setAllLevelStats(updatedStats);
      addTimeout(() => setShowFinalSummary(true), 1800);
    }
  };

  const handleColorPick = (colorKey) => {
    if (phase !== "input" || levelComplete || roundWin) return;
    const expected = sequence[userInput.length];
    setAttempts((v) => v + 1);
    if (colorKey === expected) {
      playBeep("correct");
      speakSinhala(COLORS[colorKey].label);
      const newInput = [...userInput, colorKey];
      setUserInput(newInput);
      setCorrectTaps((v) => v + 1);
      if (newInput.length === sequence.length) {
        const took = Date.now() - startTsRef.current;
        const nextTimes = [...times, took];
        setTimes(nextTimes);
        const nextRound = roundIndex + 1;
        if (nextRound >= cfg.rounds) {
          finishLevel(nextTimes, attempts + 1, correctTaps + 1);
        } else {
          setRoundWin(true);
          addTimeout(() => { setRoundWin(false); setRoundIndex(nextRound); startNewRound(); }, 1000);
        }
      }
    } else {
      playBeep("wrong");
      setWrongFlash(true);
      speakSinhala("නැවත උත්සාහ කරන්න");
      addTimeout(() => setWrongFlash(false), 700);
    }
  };

  const currentProgress = getLevelProgress(gameId, level);
  const savedStats = getLevelStats(gameId, level) || {};
  const accuracy = savedStats.accuracy ?? Math.round((correctTaps / Math.max(attempts, 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-yellow-100 to-blue-200 p-4 md:flex md:gap-6">
      <AnimatePresence>
        {showFinalSummary && (
          <FinalSummaryPopup levelStats={allLevelStats} onClose={() => { setShowFinalSummary(false); setLevel(1); }} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
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
                    <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${item.difficultyColor}`}>{item.difficulty}</span>
                  </div>
                  <div className="text-xs text-gray-500">{state === "locked" ? "🔒" : state === "completed" ? "✅" : isCurrent ? "🟡" : ""}</div>
                </div>
                <div className="mt-2 w-full min-w-[120px] md:w-36"><ProgressBar percent={getLevelProgress(gameId, item.id)} /></div>
              </div>
            </div>
          );
        })}
      </aside>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl bg-white p-6 text-center shadow-2xl">

          {/* Progress tracking */}
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-yellow-50 p-4 shadow-inner">
            <div className="flex items-center justify-between text-left">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500">ප්‍රගතිය</div>
                <div className="text-sm font-semibold text-gray-800">{Math.min(roundIndex, cfg.rounds)} / {cfg.rounds} වට</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wide text-gray-500">නිවැරදිතා</div>
                <div className="text-sm font-extrabold text-gray-800">{accuracy}%</div>
              </div>
            </div>
            <div className="mt-3"><ProgressBar percent={currentProgress} /></div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold text-gray-600">
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">උත්සාහ<br />{attempts}</div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">නිවැරදි<br />{correctTaps}</div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">සිදු<br />{roundIndex}</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-purple-700 drop-shadow">🎨 වර්ණ මතකය 🌈</h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-2xl">{cfg.emoji}</span>
            <span className="text-xl font-extrabold text-orange-500">{cfg.name}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold shadow ${cfg.difficultyColor}`}>{cfg.difficulty}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-500 italic">{cfg.hint}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {Array.from({ length: cfg.rounds }, (_, i) => (
              <span key={i} className={`text-2xl transition-all ${i < roundIndex ? "opacity-100" : "opacity-30"}`}>⭐</span>
            ))}
          </div>

          {/* WAITING phase */}
          {phase === "waiting" && !levelComplete && (
            <div className={`mt-6 flex h-56 items-center justify-center rounded-3xl border-4 border-dashed ${cfg.borderColor} bg-gradient-to-r ${cfg.displayBg}`}>
              <span className="text-6xl animate-bounce">🎨</span>
            </div>
          )}

          {/* PREVIEW phase: one big ball at a time */}
          {phase === "preview" && (
            <div className={`mt-6 flex h-56 flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed ${cfg.borderColor} bg-gradient-to-r ${cfg.displayBg} shadow-inner`}>
              <div className="text-sm font-bold text-gray-500 tracking-wide">
                {previewIdx >= 0 ? `${previewIdx + 1} / ${cfg.seqLen}` : "…"} — 👀 මතක තබා ගන්න!
              </div>
              <AnimatePresence mode="wait">
                {previewIdx >= 0 && sequence[previewIdx] ? (
                  <motion.div
                    key={`ball-${previewIdx}`}
                    initial={{ scale: 0.1, opacity: 0, rotate: -30 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.6, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className={`h-32 w-32 rounded-full ${COLORS[sequence[previewIdx]].bg} border-8 border-white shadow-2xl`}
                  />
                ) : (
                  <motion.div key="empty-ball" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} className="h-32 w-32 rounded-full border-8 border-dashed border-gray-300 bg-gray-100" />
                )}
              </AnimatePresence>
              {previewIdx >= 0 && sequence[previewIdx] && (
                <motion.div key={`lbl-${previewIdx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-extrabold text-gray-700">
                  {COLORS[sequence[previewIdx]].label}
                </motion.div>
              )}
            </div>
          )}

          {/* INPUT phase */}
          {phase === "input" && !levelComplete && (
            <>
              <AnimatePresence>
                {roundWin && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="mt-6 rounded-2xl bg-green-100 border-2 border-green-300 py-4 text-2xl font-extrabold text-green-700">
                    ✅ නිවැරදි! ඊළඟ වටය! 🎉
                  </motion.div>
                )}
              </AnimatePresence>

              {!roundWin && (
                <>
                  {/* Answer boxes */}
                  <motion.div
                    animate={wrongFlash ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`mt-6 flex items-center justify-center gap-4 rounded-3xl border-4 border-dashed ${cfg.borderColor} bg-gradient-to-r ${cfg.displayBg} p-6 shadow-inner`}
                  >
                    {sequence.map((_, idx) => {
                      const filled = idx < userInput.length;
                      const isNext = idx === userInput.length;
                      const colorKey = filled ? userInput[idx] : null;
                      return (
                        <motion.div
                          key={idx}
                          animate={filled ? { scale: [1, 1.25, 1] } : isNext ? { scale: [1, 1.06, 1] } : {}}
                          transition={{ duration: 0.35, repeat: isNext && !filled ? Infinity : 0, repeatDelay: 1.2 }}
                          className={`h-16 w-16 rounded-full border-4 shadow-lg transition-colors duration-300 ${filled ? `${COLORS[colorKey].bg} border-white` : isNext ? "border-dashed border-gray-400 bg-white" : "border-dashed border-gray-200 bg-gray-50"}`}
                        />
                      );
                    })}
                  </motion.div>

                  <p className="mt-3 text-sm font-bold text-purple-600">
                    👇 <span className="text-orange-500 font-extrabold">{userInput.length + 1}</span> වන වර්ණය ටැප් කරන්න!
                  </p>

                  <AnimatePresence>
                    {wrongFlash && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 text-sm font-bold text-red-500">
                        නැවත උත්සාහ කරන්න! 🔄
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Color palette */}
                  <div className="mt-5 flex flex-wrap justify-center gap-4">
                    {cfg.colorKeys.map((colorKey) => (
                      <motion.button
                        key={colorKey}
                        whileHover={{ scale: 1.18, y: -6 }}
                        whileTap={{ scale: 0.85, y: 2 }}
                        onClick={() => handleColorPick(colorKey)}
                        className={`flex h-20 w-20 flex-col items-center justify-center rounded-full ${COLORS[colorKey].bg} border-4 border-white shadow-xl`}
                        aria-label={COLORS[colorKey].label}
                      >
                        <span className="text-xs font-extrabold text-white drop-shadow-md">{COLORS[colorKey].label}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-5">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetGame} className="rounded-full bg-gray-100 border-b-4 border-gray-300 px-6 py-3 text-sm font-bold text-gray-600 shadow">
                      🔁 නැවත ආරම්භ කරන්න
                    </motion.button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Level Complete */}
          {levelComplete && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-3xl bg-gradient-to-br from-green-100 via-yellow-50 to-pink-100 p-6 shadow-inner border-4 border-yellow-300">
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.5 }} className="text-5xl">🎉</motion.div>
              <div className="mt-2 inline-block rounded-2xl bg-green-500 px-6 py-2 text-2xl font-extrabold text-white shadow-md">Level ජය ගත්තා!</div>
              <div className="mt-1 text-xl font-bold text-orange-500">Level {level} — {cfg.name} 🏆</div>
              <div className="mt-4 text-2xl font-extrabold text-purple-700">{accuracy}% නිවැරදි!</div>
              <div className="mt-2"><Stars accuracy={accuracy} /></div>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {level < LEVELS.length && (
                  <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setLevel((v) => Math.min(LEVELS.length, v + 1))} className="rounded-full bg-yellow-400 border-b-4 border-yellow-600 px-8 py-4 text-xl font-extrabold text-gray-900 shadow-lg">ඊළඟ Level 🚀</motion.button>
                )}
                <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={resetGame} className="rounded-full bg-pink-400 border-b-4 border-pink-600 px-8 py-4 text-xl font-bold text-white shadow-lg">🔁 නැවත</motion.button>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ColorMemoryGame;
