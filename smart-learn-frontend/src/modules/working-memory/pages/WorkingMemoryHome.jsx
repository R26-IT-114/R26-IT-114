import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import HomePage from "../components/HomePage";
import instructionAudio from "../assets/1_clean.mp3";
import { ProgressProvider, useProgress } from "../context/ProgressContext";
import RewardOverlay from "../components/RewardOverlay";
import StarRewardSystem from "../components/StarRewardSystem";
import SequenceRecallGame from "./SequenceRecallGame";
import MemoryMatchGame from "./MemoryMatchGame";
import NBackGame from "./NBackGame";
import ColorMemoryGame from "./ColorMemoryGame";
import VideoStoryGame from "./VideoStoryGame";
import PuzzleGame from "./PuzzleGame";
import SeaOddOneOut from "./SeaOddOneOut";
import MemoryShapeRecallGame from "./MemoryShapeRecallGame";

/* -------- Stars helper -------- */
const starsFromResult = (result) => {
  const acc = result?.accuracy ?? null;
  if (acc !== null) return acc >= 90 ? 3 : acc >= 60 ? 2 : 1;
  return (result?.passed || result?.nextLevel) ? 2 : 1;
};

const playHomePartySound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    const start = context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const noteStart = start + index * 0.14;

      oscillator.type = index === notes.length - 1 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.32);
    });

    window.setTimeout(() => context.close().catch(() => {}), 1300);
  } catch {
    // Celebration remains visual if Web Audio is unavailable.
  }
};

const HomePartyEffect = ({ celebration, onComplete }) => {
  useEffect(() => {
    if (!celebration) return undefined;

    const colors = ['#F59E0B', '#22C55E', '#0EA5E9', '#EC4899', '#A855F7'];
    playHomePartySound();
    confetti({ particleCount: 110, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 110, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors });
    const shower = window.setTimeout(() => {
      confetti({ particleCount: 140, spread: 130, origin: { y: 0.15 }, colors });
    }, 450);
    const finish = window.setTimeout(onComplete, 1800);

    return () => {
      window.clearTimeout(shower);
      window.clearTimeout(finish);
    };
  }, [celebration, onComplete]);

  return null;
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
  const [pendingReward, setPendingReward] = useState(null);
  const [homeCelebration, setHomeCelebration] = useState(null);
  const [gameRunKey, setGameRunKey] = useState(0);
  const earnedStarsRef = useRef(0);
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
    setGameRunKey((value) => value + 1);
    navigate(`/working-memory/${gameId}/${level}`);
  };

  const handleStarCountChange = useCallback((count) => {
    earnedStarsRef.current = count;
  }, []);

  const handleComplete = useCallback((result) => {
    const stars    = starsFromResult(result);
    const accuracy = result?.accuracy ?? null;
    const completedLevel = Math.min(3, Math.max(1, Number(result?.level ?? selectedLevel) || 1));

    if (result?.passed) {
      setHomeCelebration({
        level: completedLevel,
        accuracy: Number.isFinite(Number(accuracy)) ? Math.round(Number(accuracy)) : null,
      });
    }

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

    setPendingReward({
      stars,
      result: { ...result, accuracy },
      earnedStars: earnedStarsRef.current,
      doNav,
    });
  }, [navigate, selectedGame, selectedLevel]);

  const handleRewardDismiss = () => {
    const nav = pendingReward?.doNav;
    setPendingReward(null);
    if (nav) nav();
  };

  const handleRewardReplay = () => {
    setPendingReward(null);
    setGameRunKey((value) => value + 1);
  };

  const handleHomePartyComplete = useCallback(() => {
    setHomeCelebration(null);
  }, []);

  const handleBack = () => {
    setSelectedGame(null);
    navigate('/working-memory');
  };

  // Compute main content
  let gameContent;

  if (selectedGame === "sequence-recall") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="අනුක්‍රම මතක ක්‍රීඩාව">
        <SequenceRecallGame key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "matching-pairs") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="කාඩ් ක්‍රීඩාව">
        <MemoryMatchGame key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "n-back") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="N-Back ක්‍රීඩාව">
        <NBackGame key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "color-memory") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="වර්ණ | අංක | අකුරු මතකය">
        <ColorMemoryGame key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "video-story") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="වනාන්තර කතාව">
        <VideoStoryGame key={gameRunKey} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "puzzle-game") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="මතක ප්‍රහේලිකාව">
        <PuzzleGame key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "sea-odd-one-out") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="වෙනස් එක සොයමු">
        <SeaOddOneOut key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
      </GameWrapper>
    );
  } else if (selectedGame === "memory-shape-recall") {
    gameContent = (
      <GameWrapper onBack={handleBack} title="Memory Shape Recall">
        <MemoryShapeRecallGame key={`${selectedLevel}-${gameRunKey}`} level={selectedLevel} onComplete={handleComplete} />
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

      <StarRewardSystem
        sessionKey={selectedGame ? `${selectedGame}-${selectedLevel}-${gameRunKey}` : null}
        onCountChange={handleStarCountChange}
      />

      {/* Advanced reward overlay — shown after every game completion */}
      <RewardOverlay
        show={pendingReward !== null}
        stars={pendingReward?.stars ?? 2}
        result={pendingReward?.result ?? {}}
        earnedStars={pendingReward?.earnedStars ?? 0}
        onDismiss={handleRewardDismiss}
        onReplay={handleRewardReplay}
      />

      <HomePartyEffect
        celebration={!selectedGame && !pendingReward ? homeCelebration : null}
        onComplete={handleHomePartyComplete}
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
