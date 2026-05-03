import React from "react";
import { motion } from "framer-motion";
import { useProgress } from "../context/ProgressContext";
import { useNavigate } from "react-router-dom";

const games = [
  { id: "sequence-recall", title: "🧠 අනුක්‍රම මතක ක්‍රීඩාව", levels: 5 },
  { id: "reverse-sequence", title: "🔄 පසුපස අනුක්‍රම මතකය", levels: 5 },
  { id: "n-back", title: "🎯 N-Back ක්‍රීඩාව", levels: 3 },
  { id: "memory-match", title: "🧩 කාඩ් යුගල සොයන්න", levels: 5 },
  { id: "instruction-follow", title: "📝 උපදෙස් මතක තබා ගැනීම", levels: 5 },
  { id: "missing-item", title: "❓ අතුරුදහන් දේ සොයන්න", levels: 5 },
  { id: "timed-recall", title: "⏱️ වේගවත් මතක ක්‍රීඩාව", levels: 5 },
  { id: "sorting-memory", title: "🔀 අනුපිළිවෙල සකස් කිරීම", levels: 5 },
  { id: "sound-sequence", title: "🎵 ශබ්ද අනුක්‍රම මතකය", levels: 5 },
  { id: "adaptive-puzzle", title: "🧩 බුද්ධිමත් Puzzle ක්‍රීඩාව", levels: 5 },
];

const HomePage = ({ onGameSelect }) => {
  const { getUnlockedLevels, getCurrentLevel, isLevelCompleted, getLevelProgress } = useProgress();
  const navigate = useNavigate();

  const getUnlockedLevel = (id) => {
    const unlocked = getUnlockedLevels(id);
    return Array.isArray(unlocked) && unlocked.length ? Math.max(...unlocked) : 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 px-4 py-8 flex flex-col items-center">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          🎮 Brain Training Hub
        </h1>
        <p className="text-sm text-gray-600 mt-2 max-w-xl">
          ඔබගේ මතකය, අවධානය සහ බුද්ධිය වැඩිදියුණු කරගන්න ක්‍රීඩා තෝරන්න
        </p>
      </div>

      {/* GAME GRID */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {games.map((game) => {
          const unlocked = getUnlockedLevel(game.id);
          const currentLevel = getCurrentLevel(game.id);
          const levels = Array.from({ length: game.levels }, (_, i) => i + 1);

          return (
            <div key={game.id} className="bg-white/70 rounded-2xl shadow-md p-5">

              <h2 className="font-bold mb-4">{game.title}</h2>

              <div className="flex flex-col items-center gap-3">
                {levels.map((lvl) => {
                  const isUnlocked = lvl <= unlocked;
                  const isCompleted = isLevelCompleted(game.id, lvl);
                  const isCurrent = lvl === currentLevel && !isCompleted;
                  const levelProgress = getLevelProgress(game.id, lvl);

                  return (
                    <motion.div
                      key={lvl}
                      onClick={() => {
                        if (!isUnlocked) return;
                        if (onGameSelect) return onGameSelect(game.id, lvl);
                        navigate(`/working-memory/${game.id}/${lvl}`);
                      }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-bold
                      ${
                        !isUnlocked
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isCompleted
                            ? "bg-green-500 text-white cursor-pointer"
                            : isCurrent
                              ? "bg-yellow-400 text-white ring-4 ring-yellow-200 cursor-pointer"
                              : "bg-sky-500 text-white cursor-pointer"
                      }`}
                      title={
                        !isUnlocked
                          ? "Locked"
                          : isCompleted
                            ? `Completed · ${levelProgress}%`
                            : isCurrent
                              ? `Current · ${levelProgress}%`
                              : `Level ${lvl}`
                      }
                    >
                      {!isUnlocked ? "🔒" : isCompleted ? "✅" : isCurrent ? "🟡" : lvl}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;