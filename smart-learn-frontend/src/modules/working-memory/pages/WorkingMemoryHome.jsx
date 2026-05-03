import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import HomePage from "../components/HomePage";
import { ProgressProvider, useProgress } from "../context/ProgressContext";
import SequenceRecallGame from "../components/SequenceRecallGame";
import ReverseSequenceGame from "../components/ReverseSequenceGame";
import MemoryMatchGame from "../components/MemoryMatchGame";

/* -------- GAME WRAPPER -------- */
const GameWrapper = ({ onBack, children, title = "" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50">

      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center px-4 py-3">

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-pink-500 text-white"
          >
            ← ආපසු
          </motion.button>

          <h2 className="flex-1 text-center font-bold text-gray-800">
            {title}
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 py-6">{children}</div>
    </div>
  );
};

/* -------- MAIN CONTENT -------- */
const WorkingMemoryHomeContent = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const { completeLevel } = useProgress();
  const navigate = useNavigate();

  const handleGameSelect = (gameId, level) => {
    setSelectedGame(gameId);
    setSelectedLevel(level);
    // navigate to the game route so URL reflects selection
    try {
      navigate(`/working-memory/${gameId}/${level}`);
    } catch (e) {}
  };

  const handleComplete = () => {
    // parent will handle progress (SequenceRecallGame now reports stats)
    alert("🎉 Level Completed!");
    setSelectedGame(null);
  };

  const handleBack = () => {
    setSelectedGame(null);
    try { navigate('/working-memory'); } catch (e) {}
  };

  if (selectedGame === "sequence-recall") {
    return (
      <GameWrapper onBack={handleBack} title="අනුක්‍රම මතක ක්‍රීඩාව">
        <SequenceRecallGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  }

  if (selectedGame === "reverse-sequence") {
    return (
      <GameWrapper onBack={handleBack} title="පසුපස අනුක්‍රම මතකය">
        <ReverseSequenceGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  }

  if (selectedGame === "matching-pairs") {
    return (
      <GameWrapper onBack={handleBack} title="කාඩ් ක්‍රීඩාව">
        <MemoryMatchGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  }

  return <HomePage onGameSelect={handleGameSelect} />;
};

/* -------- ROOT -------- */
const WorkingMemoryHome = () => {
  return (
    <ProgressProvider>
      <WorkingMemoryHomeContent />
    </ProgressProvider>
  );
};

export default WorkingMemoryHome;