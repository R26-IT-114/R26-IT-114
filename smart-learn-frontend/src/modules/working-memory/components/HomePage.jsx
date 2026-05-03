import React from "react";
import { motion } from "framer-motion";
import { useProgress } from "../context/ProgressContext";

const HomePage = ({ onGameSelect }) => {
  const { progress } = useProgress();

  const unlocked = progress?.["sequence-recall"]?.level1 || 1;
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex flex-col items-center py-10">

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-10 text-gray-800">
        🧠 අනුක්‍රම මතක ක්‍රීඩාව
      </h1>

      {/* LEVEL PATH */}
      <div className="flex flex-col items-center gap-10">

        {levels.map((lvl, index) => {
          const isUnlocked = lvl <= unlocked;

          return (
            <div key={lvl} className="flex flex-col items-center">

              {/* LINE */}
              {index !== 0 && (
                <div className="w-1 h-10 bg-green-300"></div>
              )}

              {/* CIRCLE */}
              <motion.div
                whileHover={isUnlocked ? { scale: 1.1 } : {}}
                whileTap={isUnlocked ? { scale: 0.9 } : {}}
                animate={isUnlocked ? { y: [0, -5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                onClick={() =>
                  isUnlocked && onGameSelect("sequence-recall", lvl)
                }
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl shadow-lg
                ${
                  isUnlocked
                    ? "bg-green-400 text-white cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isUnlocked ? "⭐" : "🔒"}
              </motion.div>

              {/* LABEL */}
              <p className="mt-2 text-sm font-semibold text-gray-700">
                Level {lvl}
              </p>
            </div>
          );
        })}
      </div>

      {/* INFO CARD */}
      <div className="mt-12 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md text-center max-w-sm">
        <h2 className="text-lg font-bold mb-2">
          🧠 මතකය වර්ධනය කරන්න
        </h2>
        <p className="text-sm text-gray-600">
          තරුවෙන් තරුවට යමින් ඔබේ මතකය ශක්තිමත් කරගන්න!
        </p>
      </div>
    </div>
  );
};

export default HomePage;