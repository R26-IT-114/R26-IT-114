import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useProgress } from "../context/ProgressContext";

/* ---------------- VOICE ---------------- */
const speakSinhala = (item) => {
  const map = {
    "🍎": "ඇපල්",
    "🍌": "කෙසෙල්",
    "🍇": "මිදි",
    "🍊": "දොඩම්",
    "🍓": "ස්ට්‍රෝබෙරි",
    "🥕": "කැරට්",
    "🥬": "ගෝවා",
    "🍆": "වම්බටු",
    "🌽": "ඉරිඟු",
    "🥔": "අල",
    "🚗": "කාර්",
    "🚌": "බස්",
    "🚲": "බයිසිකලය",
    "✈️": "ගුවන් යානය",
    "🚑": "ඇම්බියුලන්ස්",
  };

  const utterance = new SpeechSynthesisUtterance(map[item] || "හරි");
  utterance.lang = "si-LK";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
};

/* ---------------- LEVEL CONFIG (5 levels) ---------------- */
const LEVEL_CONFIG = [
  { id: 1, name: "පලතුරු", items: ["🍎", "🍌", "🍇", "🍊", "🍓"], seqLen: 2, rounds: 3, speed: 700 },
  { id: 2, name: "එළවළු", items: ["🥕", "🥬", "🍆", "🌽", "🥔"], seqLen: 3, rounds: 3, speed: 650 },
  { id: 3, name: "වාහන", items: ["🚗", "🚌", "🚲", "✈️", "🚑"], seqLen: 3, rounds: 4, speed: 600 },
  { id: 4, name: "මිශ්‍ර පලතුරු/එළවළු", items: ["🍎", "🍌", "🥕", "🥬", "🍓", "🌽"], seqLen: 4, rounds: 4, speed: 550 },
  { id: 5, name: "මිශ්‍ර සියලු", items: ["🍎","🍌","🍇","🍊","🍓","🥕","🥬","🍆","🌽","🥔","🚗","🚌","🚲"], seqLen: 5, rounds: 5, speed: 500 },
];

/* ---------------- SOUND (simple beeps) ---------------- */
const playBeep = (type = "correct") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type === "correct" ? "sine" : "triangle";
    o.frequency.value = type === "correct" ? 880 : 220;
    g.gain.value = 0.001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    setTimeout(() => { o.stop(); ctx.close(); }, 300);
  } catch {
    // ignore audio errors
  }
};

/* ---------------- CONFETTI ---------------- */
const fireConfetti = () => {
  confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
};

/* ---------------- MAIN COMPONENT ---------------- */
const SequenceRecallGame = ({ level = 1, onComplete = null, gameId = "sequence-recall" }) => {
  const cfg = LEVEL_CONFIG[Math.max(0, Math.min(LEVEL_CONFIG.length - 1, level - 1))];
  const { initializeGame, completeLevel } = useProgress();

  const [roundIndex, setRoundIndex] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [showing, setShowing] = useState(false);
  const [inputIndex, setInputIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [times, setTimes] = useState([]);
  const startTsRef = useRef(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    initializeGame(gameId);
    startNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const randomSequence = () => {
    const seq = [];
    const pool = cfg.items;
    for (let i = 0; i < cfg.seqLen; i++) {
      seq.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return seq;
  };

  const startNewRound = () => {
    setMessage("");
    setInputIndex(0);
    const seq = randomSequence();
    setSequence(seq);
    setShowing(true);
    // reveal sequence
    seq.forEach((it, i) => {
      setTimeout(() => {
        setMessage(it);
        playBeep("correct");
      }, i * cfg.speed);
    });
    // after show
    setTimeout(() => {
      setShowing(false);
      setMessage("");
      startTsRef.current = Date.now();
    }, cfg.seqLen * cfg.speed + 250);
  };

  const handlePick = (item) => {
    if (showing) return;
    const expected = sequence[inputIndex];
    attemptRef.current += 1;

    if (item === expected) {
      playBeep("correct");
      speakSinhala(item);
      const next = inputIndex + 1;
      setInputIndex(next);

      if (next >= sequence.length) {
        // round complete
        const took = Date.now() - startTsRef.current;
        setTimes((t) => [...t, took]);
        const nextRound = roundIndex + 1;
        if (nextRound >= cfg.rounds) {
          // level complete
          fireConfetti();
          playBeep("correct");
          const stats = computeStats([...times, took], attemptRef.current);
          // save stats to progress
          completeLevel(gameId, level, stats);
          if (onComplete) onComplete(level, stats);
        } else {
          setRoundIndex(nextRound);
          setTimeout(() => startNewRound(), 700);
        }
      }
    } else {
      // wrong
      playBeep("wrong");
      const utter = new SpeechSynthesisUtterance("නැවත උත්සාහ කරන්න");
      utter.lang = "si-LK";
      speechSynthesis.speak(utter);
      // allow retry for same round but count attempt
    }
  };

  const computeStats = (timesArr, attempts) => {
    const total = timesArr.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / timesArr.length);
    const best = Math.min(...timesArr);
    const accuracy = Math.round((cfg.seqLen * cfg.rounds) / attempts * 100);
    const stats = { attempts, avgTimeMs: avg, bestTimeMs: best, times: timesArr, accuracy };
    return stats;
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-start py-8 px-4">
      <div className="w-full max-w-xl bg-white/80 rounded-2xl p-6 shadow-lg text-center">
        <h1 className="text-2xl font-extrabold">🐰 අනුක්‍රම මතක ක්‍රීඩාව</h1>
        <h2 className="text-lg mt-2">{cfg.name} — Level {level}</h2>
        <p className="mt-1 text-sm text-gray-700">Round {roundIndex + 1} / {cfg.rounds}</p>

        <div className="mt-6 h-36 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showing ? (
              <motion.div key={message || 'show'} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-6xl">
                {message}
              </motion.div>
            ) : (
              <motion.div key={`blank-${roundIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-6xl">
                {sequence.map((it, i) => (
                  <span key={i} className={`mx-1 text-3xl ${i < inputIndex ? 'opacity-100' : 'opacity-40'}`}>{it}</span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 grid grid-cols-5 gap-3 justify-center">
          {cfg.items.map((it, i) => (
            <motion.button whileTap={{ scale: 0.95 }} key={i} onClick={() => handlePick(it)} className="bg-white shadow-md rounded-full p-3 text-3xl">
              {it}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={() => { setRoundIndex(0); startNewRound(); }} className="btn-secondary">🔁 Restart Round</button>
          <div className="text-sm text-gray-600">Tip: Watch closely, then tap the items in the same order.</div>
        </div>
      </div>
    </div>
  );
};

export default SequenceRecallGame;
