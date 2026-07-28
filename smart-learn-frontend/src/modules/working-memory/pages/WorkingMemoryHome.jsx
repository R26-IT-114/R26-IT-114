import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import HomePage from "../components/HomePage";
import instructionAudio from "../assets/1_clean.mp3";
import { ProgressProvider, useProgress } from "../context/ProgressContext";
import RewardOverlay from "../components/RewardOverlay";
import SequenceRecallGame from "./SequenceRecallGame";
import MemoryMatchGame from "./MemoryMatchGame";
import NBackGame from "./NBackGame";
import ColorMemoryGame from "./ColorMemoryGame";
import VideoStoryGame from "./VideoStoryGame";
import PuzzleGame from "./PuzzleGame";
import SeaOddOneOut from "./SeaOddOneOut";

/* -------- Stars helper -------- */
const starsFromResult = (result) => {
  const acc = result?.accuracy ?? null;
  if (acc !== null) return acc >= 90 ? 3 : acc >= 60 ? 2 : 1;
  return (result?.passed || result?.nextLevel) ? 2 : 1;
};

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
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [pendingReward, setPendingReward] = useState(null); // { stars, accuracy, doNav }
  const audioRef = useRef(null);
  const params = useParams();
  useProgress();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.game) {
      setSelectedGame(params.game);
    }
    if (params.level) {
      const levelNumber = Number(params.level);
      setSelectedLevel(Number.isNaN(levelNumber) ? 1 : Math.max(1, levelNumber));
    }
  }, [params.game, params.level]);

  const handleVoiceInstruction = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const handleGameSelect = (gameId, level) => {
    setSelectedGame(gameId);
    setSelectedLevel(level);
    navigate(`/working-memory/${gameId}/${level}`);
  };

  const handleComplete = (result) => {
    const stars    = starsFromResult(result);
    const accuracy = result?.accuracy ?? null;

    const doNav = () => {
      if (result?.nextLevel) {
        const next = result.nextLevel;
        setSelectedLevel(next);
        navigate(`/working-memory/${selectedGame}/${next}`);
      } else {
        setSelectedGame(null);
        navigate('/working-memory');
      }
    };

    setPendingReward({ stars, accuracy, doNav });
  };

  const handleRewardDismiss = () => {
    const nav = pendingReward?.doNav;
    setPendingReward(null);
    if (nav) nav();
  };

  const handleBack = () => {
    setSelectedGame(null);
    navigate('/working-memory');
  };

  // Compute main content
  let gameContent;

  if (selectedGame === "sequence-recall") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="අනුක්‍රම මතක ක්‍රීඩාව">
        <SequenceRecallGame key={selectedLevel} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "matching-pairs") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="කාඩ් ක්‍රීඩාව">
        <MemoryMatchGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "n-back") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="N-Back ක්‍රීඩාව">
        <NBackGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "color-memory") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="වර්ණ | අංක | අකුරු මතකය">
        <ColorMemoryGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "video-story") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="වනාන්තර කතාව">
        <VideoStoryGame onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "puzzle-game") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="මතක ප්‍රහේලිකාව">
        <PuzzleGame level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "sea-odd-one-out") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="වෙනස් එක සොයමු">
        <SeaOddOneOut key={selectedLevel} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else {
    gameContent = (
      <>
        <audio
          ref={audioRef}
          src={instructionAudio}
          onEnded={() => setAudioPlaying(false)}
        />

        {/* Floating voice instruction button */}
        <button
          type="button"
          onClick={handleVoiceInstruction}
          title="උපදෙස් අසන්න (Listen to instructions)"
          aria-label={audioPlaying ? "Stop instructions" : "Play instructions"}
          style={{
            position: 'fixed',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            border: '3px solid #fff',
            background: audioPlaying
              ? 'linear-gradient(135deg,#EF4444,#F87171)'
              : 'linear-gradient(135deg,#7C3AED,#A78BFA)',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: audioPlaying
              ? '0 0 0 6px rgba(239,68,68,0.25), 0 8px 24px rgba(0,0,0,0.22)'
              : '0 4px 18px rgba(124,58,237,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '0.1rem',
            transition: 'background 0.25s, box-shadow 0.25s',
            animation: audioPlaying ? 'wm-pulse-ring 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{audioPlaying ? '⏹' : '🔊'}</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.03em', lineHeight: 1.1, textAlign: 'center' }}>
            {audioPlaying ? 'නවත්වන්න' : 'උපදෙස්'}
          </span>
        </button>

        <style>{`
          @keyframes wm-pulse-ring {
            0%   { box-shadow: 0 0 0 0   rgba(239,68,68,0.45), 0 8px 24px rgba(0,0,0,0.22); }
            70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0),    0 8px 24px rgba(0,0,0,0.22); }
            100% { box-shadow: 0 0 0 0   rgba(239,68,68,0),    0 8px 24px rgba(0,0,0,0.22); }
          }
        `}</style>

        <HomePage onGameSelect={handleGameSelect} />
      </>
    );
  }

  return (
    <>
      {gameContent}

      {/* Advanced reward overlay — shown after every game completion */}
      <RewardOverlay
        show={pendingReward !== null}
        stars={pendingReward?.stars ?? 2}
        accuracy={pendingReward?.accuracy ?? null}
        onDismiss={handleRewardDismiss}
      />
    </>
  );
};

/* -------- ROOT -------- */
const WorkingMemoryHome = () => {
  const { user } = useAuth();
  return (
    <ProgressProvider userId={user?.id ?? null}>
      <WorkingMemoryHomeContent />
    </ProgressProvider>
  );
};

export default WorkingMemoryHome;