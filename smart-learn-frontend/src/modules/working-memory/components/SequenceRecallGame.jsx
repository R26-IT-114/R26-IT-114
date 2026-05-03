import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

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

/* ---------------- GAME DATA ---------------- */
const LEVELS = [
  { name: "පලතුරු", items: ["🍎", "🍌", "🍇", "🍊", "🍓"] },
  { name: "එළවළු", items: ["🥕", "🥬", "🍆", "🌽", "🥔"] },
  { name: "වාහන", items: ["🚗", "🚌", "🚲", "✈️", "🚑"] },
];

/* ---------------- MAIN GAME ---------------- */
const SequenceRecallGame = () => {
  const [level, setLevel] = useState(0);
  const [currentItem, setCurrentItem] = useState("");
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);

  const [bunnyJump, setBunnyJump] = useState(false);
  const [dropAnim, setDropAnim] = useState(null);

  const [levelUp, setLevelUp] = useState(false);

  const currentLevel = LEVELS[level];

  /* ---------------- SOUND ---------------- */
  const playLevelUpSound = () => {
    const audio = new Audio("/level-up.mp3");
    audio.play();
  };

  /* ---------------- CONFETTI ---------------- */
  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  /* ---------------- NEW ROUND ---------------- */
  useEffect(() => {
    nextItem();
  }, [level]);

  const nextItem = () => {
    const random =
      currentLevel.items[
        Math.floor(Math.random() * currentLevel.items.length)
      ];
    setCurrentItem(random);
  };

  /* ---------------- DROP ---------------- */
  const handleDrop = (item) => {
    if (item === currentItem) {
      speakSinhala(item);

      setBunnyJump(true);
      setDropAnim(item);
      setStars((prev) => prev + 1);

      setTimeout(() => setBunnyJump(false), 600);
      setTimeout(() => setDropAnim(null), 600);

      const nextRound = round + 1;

      if (nextRound >= 5) {
        setStars(0);
        setRound(0);

        if (level < LEVELS.length - 1) {
          setLevelUp(true);
          playLevelUpSound();
          fireConfetti();

          setTimeout(() => {
            setLevelUp(false);
            setLevel(level + 1);
          }, 1800);
        } else {
          fireConfetti();
          alert("🏆 ඔබ ජයග්‍රාහකයෙක්!");
        }
      } else {
        setRound(nextRound);
        nextItem();
      }
    } else {
      const utterance = new SpeechSynthesisUtterance("නැවත උත්සාහ කරන්න");
      utterance.lang = "si-LK";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center">

      {/* CONTENT */}
      <div className="flex flex-col items-center text-center px-4">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          🐰 මතක ක්‍රීඩාව
        </h1>

        <h2 className="text-base sm:text-lg md:text-xl mt-2 text-white">
          {currentLevel.name} - Level {level + 1}
        </h2>

        <div className="text-2xl sm:text-3xl mt-2">
          {"⭐".repeat(stars)}
        </div>

        <p className="mt-2 text-white text-sm sm:text-base">
          Round: {round + 1} / 5
        </p>

        {/* CURRENT ITEM */}
        <motion.div
          key={currentItem}
          animate={{ scale: [1, 1.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl mt-6"
        >
          {currentItem}
        </motion.div>

        {/* DRAG ITEMS */}
        <div className="flex gap-3 mt-8 flex-wrap justify-center max-w-[95%]">
          {currentLevel.items.map((item, i) => (
            <motion.div
              key={i}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("item", item)}
              className="text-3xl sm:text-4xl md:text-5xl bg-white p-3 rounded-full shadow-lg cursor-grab active:scale-95"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>

      {/* DROP ANIMATION */}
      <AnimatePresence>
        {dropAnim && (
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute text-5xl z-20"
          >
            {dropAnim}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEVEL UP ANIMATION */}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], rotate: [0, 10, -10, 0] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <div className="bg-yellow-300 px-6 py-4 rounded-2xl text-2xl sm:text-3xl font-bold shadow-xl">
              🎉 LEVEL UP!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BUNNY */}
      <motion.div
        animate={bunnyJump ? { y: [0, -25, 0] } : { y: 0 }}
        className="absolute bottom-[3%] left-[6%] text-5xl sm:text-6xl md:text-7xl"
      >
        🐰
      </motion.div>

      {/* BASKET */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e.dataTransfer.getData("item"))}
        className="absolute bottom-[8%] left-1/2 transform -translate-x-1/2 text-6xl sm:text-7xl md:text-8xl"
      >
        🧺
      </div>
    </div>
  );
};

export default SequenceRecallGame;