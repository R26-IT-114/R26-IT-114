import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import seaOddOneOutData from '../data/seaOddOneOutData';
import { useProgress } from '../context/ProgressContext';
import { adaptOddOneOutConfig } from '../utils/adaptiveDifficulty';
import seaOddVoiceInstructionLevel1 from '../assets/wenas_eka_clean.mp3';
import seaOddVoiceInstructionLevel2 from '../assets/lokupodi.mp3';

const GAME_ID = 'sea-odd-one-out';

const gradientBg =
  'linear-gradient(180deg, #A5F3FC 0%, #38BDF8 42%, #0369A1 100%)';

const shuffleOrder = (items = [0, 1, 2, 3]) => {
  const order = [...items];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const SeaBackdrop = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}
    aria-hidden='true'
  >
    <motion.div
      style={{
        position: 'absolute',
        top: -120,
        left: '50%',
        width: 380,
        height: 380,
        borderRadius: '50%',
        transform: 'translateX(-50%)',
        background:
          'radial-gradient(circle, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0) 70%)',
      }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />

    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`bubble-${i}`}
        style={{
          position: 'absolute',
          left: `${6 + i * 8}%`,
          bottom: '-10%',
          width: 8 + (i % 4) * 4,
          height: 8 + (i % 4) * 4,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.38)',
          border: '1px solid rgba(255,255,255,0.55)',
        }}
        animate={{ y: [0, -760], opacity: [0, 0.8, 0] }}
        transition={{
          duration: 7 + (i % 4),
          delay: i * 0.35,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    ))}

    <motion.div
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
      animate={{ x: [0, -70, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox='0 0 400 100' width='300%' height='100%' preserveAspectRatio='none'>
        <path
          d='M0 54 Q50 20 100 54 T200 54 T300 54 T400 54 L400 100 L0 100 Z'
          fill='rgba(255,255,255,0.22)'
        />
      </svg>
    </motion.div>
  </div>
);

const VoiceIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5' />
    <path d='M15.5 8.5a5 5 0 0 1 0 7' />
    <path d='M18.5 6a9 9 0 0 1 0 12' />
  </svg>
);

const SeaOddOneOut = ({ level = 1 }) => {
  const { initializeGame, completeLevel, updateLevelProgress, getAdaptiveProfile, recordAdaptiveResult } = useProgress();
  const adaptiveConfig = adaptOddOneOutConfig(getAdaptiveProfile(GAME_ID));
  const currentLevel = Number(level) === 2 ? 2 : 1;
  const instructionAudioSrc = currentLevel === 2
    ? seaOddVoiceInstructionLevel2
    : seaOddVoiceInstructionLevel1;
  const levelTwoRounds = useMemo(
    () =>
      seaOddOneOutData.map((item, index) => ({
        name: item.name,
        image: item.images?.[0],
        target: index % 2 === 0 ? 'big' : 'small',
      })),
    [],
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [cardOrder, setCardOrder] = useState([0, 1, 2, 3]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [instructionPlaying, setInstructionPlaying] = useState(false);
  const instructionAudioRef = useRef(null);

  const currentQuestion =
    currentLevel === 1 ? seaOddOneOutData[currentRound] : levelTwoRounds[currentRound];
  const totalRounds = currentLevel === 1 ? seaOddOneOutData.length : levelTwoRounds.length;

  useEffect(() => {
    initializeGame(GAME_ID);
  }, [initializeGame]);

  useEffect(() => {
    const audio = instructionAudioRef.current;
    if (!audio) return undefined;

    const handleEnded = () => setInstructionPlaying(false);
    const handlePause = () => setInstructionPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const buildCardOrder = (question) => {
    const allIndexes = question.images.map((_, index) => index);
    if (adaptiveConfig.visibleChoices >= allIndexes.length) {
      return shuffleOrder(allIndexes);
    }

    const duplicateIndexes = allIndexes.filter((index) => index !== question.oddIndex);
    return shuffleOrder([
      question.oddIndex,
      ...duplicateIndexes.slice(0, adaptiveConfig.visibleChoices - 1),
    ]);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentRound(0);
    if (currentLevel === 1) {
      setCardOrder(buildCardOrder(seaOddOneOutData[0]));
    } else {
      setCardOrder(shuffleOrder([0, 1]));
    }
    setSelected(null);
    setScore(0);
    setWrongAttempts(0);
    setCombo(0);
    setShowResult(false);
    setFeedback(null);
    setShowHint(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentRound(0);
    setCardOrder(currentLevel === 1 ? [0, 1, 2, 3] : [0, 1]);
    setSelected(null);
    setScore(0);
    setWrongAttempts(0);
    setCombo(0);
    setShowResult(false);
    setFeedback(null);
    setShowHint(false);
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;

    setSelected(idx);

    const isCorrect =
      currentLevel === 1
        ? idx === currentQuestion.oddIndex
        : (currentQuestion.target === 'big' ? idx === 0 : idx === 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const nextScore = score + 1;
      setScore(nextScore);
      setCombo((prev) => prev + 1);
      setShowHint(false);

      setTimeout(() => {
        if (currentRound === totalRounds - 1) {
          const totalAttempts = nextScore + wrongAttempts;
          const accuracy = totalAttempts > 0
            ? Math.round((nextScore / totalAttempts) * 100)
            : 0;
          const stats = {
            correct: nextScore,
            total: totalRounds,
            accuracy,
            wrongAttempts,
            mistakes: wrongAttempts,
            totalAttempts,
            combo,
            level: currentLevel,
            mode: currentLevel === 1 ? 'odd-one-out' : 'big-small',
          };
          completeLevel(GAME_ID, currentLevel, stats);
          updateLevelProgress(GAME_ID, currentLevel, 100, stats);
          recordAdaptiveResult(GAME_ID, stats);
          setShowResult(true);
          setGameStarted(false);
        } else {
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          if (currentLevel === 1) {
            setCardOrder(buildCardOrder(seaOddOneOutData[nextRound]));
          } else {
            setCardOrder(shuffleOrder([0, 1]));
          }
          setSelected(null);
          setFeedback(null);
        }
      }, 1200);
    } else {
      const nextWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(nextWrongAttempts);
      setCombo(0);
      setShowHint(nextWrongAttempts >= adaptiveConfig.hintAfterMistakes);

      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 1200);
    }
  };

  const totalAttempts = score + wrongAttempts;
  const accuracy = totalAttempts > 0
    ? Math.round((score / totalAttempts) * 100)
    : 0;
  const progressPercent =
    ((currentRound + (gameStarted ? 1 : 0)) / totalRounds) * 100;

  const getAccuracyLevel = () => {
    if (accuracy >= 90) return '🌟 විශිෂ්ටයි!';
    if (accuracy >= 70) return '👍 හොඳයි!';
    if (accuracy >= 50) return '🙂 තව උත්සාහ කරන්න!';
    return '💪 පුහුණු වෙමු!';
  };

  const handleVoiceInstruction = async () => {
    const audio = instructionAudioRef.current;
    if (!audio) return;

    if (instructionPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setInstructionPlaying(false);
      return;
    }

    try {
      audio.currentTime = 0;
      await audio.play();
      setInstructionPlaying(true);
    } catch {
      setInstructionPlaying(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: gradientBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'Baloo 2, Nunito, Arial',
        position: 'relative',
        overflow: 'hidden',
      }}instructionAudioSrc
    >
      <SeaBackdrop />
      <audio ref={instructionAudioRef} src={instructionAudioSrc} preload='auto' />
      <button
        type='button'
        onClick={handleVoiceInstruction}
        title='උපදෙස් අසන්න'
        aria-label={instructionPlaying ? 'Stop instructions' : 'Play instructions'}
        style={{
          position: 'fixed',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 80,
          width: 56,
          height: 56,
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          background: instructionPlaying
            ? 'linear-gradient(135deg,#DC2626 0%, #EF4444 100%)'
            : 'linear-gradient(135deg,#0284C7 0%, #0EA5E9 100%)',
          boxShadow: '0 10px 24px rgba(2,132,199,0.45)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <VoiceIcon size={24} color='white' />
      </button>

      {/* START SCREEN */}
      {!gameStarted && !showResult && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: 50,
            borderRadius: 40,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '3px solid rgba(255,255,255,0.4)',
            zIndex: 2,
            maxWidth: 720,
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 82 }}
          >
            🐟
          </motion.div>

          <h1 style={{ fontSize: 50, color: '#ffffff', marginTop: 6 }}>වෙනස් එක සොයන්න</h1>

          <p style={{ fontSize: 24, fontWeight: 700, color: '#ECFEFF' }}>
            {currentLevel === 1
              ? adaptiveConfig.titleHint
              : 'මෙම මට්ටමේ ලොකු හෝ පොඩි පින්තූරය තෝරාගන්න'}
          </p>

          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            style={{
              fontSize: 26,
              padding: '18px 46px',
              borderRadius: 28,
              border: 'none',
              background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
              color: '#fff',
              fontWeight: 'bold',
              marginTop: 18,
              boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
          >
            ▶️ ආරම්භ කරන්න
          </motion.button>
        </motion.div>
      )}

      {/* GAME SCREEN */}
      {gameStarted && !showResult && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: 30,
            borderRadius: 40,
            width: '90%',
            maxWidth: 900,
            border: '3px solid rgba(255,255,255,0.38)',
            backdropFilter: 'blur(8px)',
            zIndex: 2,
          }}
        >
          <div
            style={{
              height: 12,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <motion.div
              style={{
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #10B981 0%, #22D3EE 100%)',
              }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>

          {/* SCORE */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#fff',
              fontSize: 20,
              marginBottom: 20,
              fontWeight: 'bold',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <div>⭐ ලකුණු: {score}</div>
            <div>🔥 Combo: {combo}</div>
            <div>
              🎮 {currentRound + 1} / {totalRounds}
            </div>
          </div>

          <h2
            style={{
              textAlign: 'center',
              color: '#ffffff',
              fontSize: 32,
              marginBottom: 20,
            }}
          >
            {currentLevel === 1
              ? '👀 වෙනස් එක හොයන්න'
              : currentQuestion?.target === 'big'
                ? '🔍 ලොකු පින්තූරය තෝරන්න'
                : '🔍 පොඩි පින්තූරය තෝරන්න'}
          </h2>

          {/* CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: currentLevel === 1
                ? cardOrder.length <= 3
                  ? 'repeat(3, 1fr)'
                  : 'repeat(2, 1fr)'
                : 'repeat(2, 1fr)',
              gap: 20,
            }}
          >
              {cardOrder.map((idx, slot) => {
              const image = currentLevel === 1
                ? currentQuestion.images?.[idx]
                : currentQuestion.image;

              const isOdd = currentLevel === 1
                ? idx === currentQuestion.oddIndex
                : false;
              const imageSize = currentLevel === 1
                ? adaptiveConfig.imageSize
                : idx === 0
                  ? 170
                  : 100;

              return (
                <motion.div
                  key={`slot-${slot}`}
                  onClick={() => handleSelect(idx)}
                  whileHover={selected === null ? { scale: 1.05, y: -5 } : {}}
                  whileTap={selected === null ? { scale: 0.97 } : {}}
                  style={{
                    background: '#fff',
                    borderRadius: 30,
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    border:
                      selected === idx
                        ? feedback === 'correct'
                          ? '5px solid #22C55E'
                          : '5px solid #EF4444'
                        : '4px solid #ffffff',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.16)',
                    outline: showHint && isOdd ? '5px solid rgba(250,204,21,0.85)' : 'none',
                    opacity: selected !== null && selected !== idx ? 0.5 : 1,
                  }}
                >
                  {/* IMAGE */}
                  <img
                    src={image}
                    alt=''
                    style={{
                      width: imageSize,
                      height: imageSize,
                      objectFit: 'contain',

                      transform: isOdd ? `scale(${adaptiveConfig.oddScale})` : 'none',

                      transition: '0.3s',
                    }}
                  />

                  {/* FEEDBACK */}
                  {selected === idx && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 30,
                      }}
                    >
                      {feedback === 'correct'
                        ? '✅'
                        : '❌'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {feedback === 'wrong' && (
            <div
              style={{
                marginTop: 18,
                textAlign: 'center',
                color: '#FEE2E2',
                fontSize: 26,
                fontWeight: 'bold',
              }}
            >
              {showHint
                ? currentLevel === 1
                  ? 'ඉඟිය: හැරුණු හෝ වෙනස් හැඩය ඇති පින්තූරය බලන්න'
                  : currentQuestion?.target === 'big'
                    ? 'ඉඟිය: ලොකුම පින්තූරය තෝරන්න'
                    : 'ඉඟිය: පොඩිම පින්තූරය තෝරන්න'
                : 'නැවත උත්සාහ කරන්න'}
            </div>
          )}
        </motion.div>
      )}

      {/* RESULT SCREEN */}
      {showResult && (
        <motion.div
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          style={{
            background: 'rgba(255,255,255,0.25)',
            padding: 64,
            borderRadius: 48,
            textAlign: 'center',
            border: '3px solid rgba(255,255,255,0.4)',
            zIndex: 2,
            maxWidth: 860,
            width: '92%',
            boxShadow: '0 22px 44px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontSize: 126, lineHeight: 1 }}>🏆</div>

          <h1 style={{ fontSize: 62, marginTop: 12, marginBottom: 16 }}>ප්‍රතිඵලය</h1>

          <h2 style={{ fontSize: 50, marginBottom: 20 }}>
            ⭐ ලකුණු: {score} /{' '}
            {totalRounds}
          </h2>

          {/* 🎯 ACCURACY CARD */}
          <div
            style={{
              marginTop: 20,
              background: '#fff',
              padding: 34,
              borderRadius: 28,
              border: '3px solid #E0F2FE',
            }}
          >
            <h3 style={{ fontSize: 42, marginBottom: 12 }}>🎯 සාර්ථකත්ව මට්ටම</h3>

            <p style={{ fontSize: 36, fontWeight: 'bold' }}>
              {accuracy}% - {getAccuracyLevel()}
            </p>

            <p style={{ fontSize: 28, marginTop: 14, fontWeight: 700 }}>
              හරි උත්සාහ: {score} | වැරදි උත්සාහ: {wrongAttempts}
            </p>

            <p style={{ fontSize: 28, marginTop: 10, fontWeight: 700 }}>
              හොඳම Combo: {combo}
            </p>
          </div>

          <button
            onClick={resetGame}
            style={{
              marginTop: 30,
              padding: '20px 34px',
              fontSize: 32,
              borderRadius: 26,
              border: 'none',
              background: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 14px 28px rgba(0,0,0,0.22)',
            }}
          >
            🔄 නැවත ක්‍රීඩා කරන්න
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SeaOddOneOut;