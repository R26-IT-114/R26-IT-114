import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import seaOddOneOutData from '../data/seaOddOneOutData';
import { useProgress } from '../context/ProgressContext';
import useResponsive from '../hooks/useResponsive';
import { adaptOddOneOutConfig } from '../utils/adaptiveDifficulty';
import seaOddVoiceInstructionLevel1 from '../assets/wenas_eka_clean.mp3';
import seaOddVoiceInstructionLevel2 from '../assets/lokupodi.mp3';
import detectiveCrabLevelBoard from '../assets/detective-crab-level-board.png';
import { awardStar } from '../components/StarRewardSystem';
import { AnimatedSeaBg } from './SequenceRecallGame';

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

const VoiceIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5' />
    <path d='M15.5 8.5a5 5 0 0 1 0 7' />
    <path d='M18.5 6a9 9 0 0 1 0 12' />
  </svg>
);

const SeaOddOneOut = ({ level = 1, onComplete = null }) => {
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
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [instructionPlaying, setInstructionPlaying] = useState(false);
  const instructionAudioRef = useRef(null);

  // Dashboard response-time tracking
  const answerStartTimeRef = useRef(null);
  const responseTimesRef = useRef([]);

  const currentQuestion =
    currentLevel === 1 ? seaOddOneOutData[currentRound] : levelTwoRounds[currentRound];
  const totalRounds = currentLevel === 1 ? seaOddOneOutData.length : levelTwoRounds.length;

  useEffect(() => {
    initializeGame(GAME_ID);
  }, [initializeGame]);

  const { isMobile } = useResponsive();

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
    setFeedback(null);
    setShowHint(false);

    // Reset response-time history and start timing the first attempt
    responseTimesRef.current = [];
    answerStartTimeRef.current = Date.now();
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;

    // Record how long the child took for this attempt
    if (answerStartTimeRef.current) {
      const responseMs = Date.now() - answerStartTimeRef.current;
      responseTimesRef.current.push(responseMs);
      answerStartTimeRef.current = null;
    }

    setSelected(idx);

    const isCorrect =
      currentLevel === 1
        ? idx === currentQuestion.oddIndex
        : (currentQuestion.target === 'big' ? idx === 0 : idx === 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      awardStar();
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
          const averageResponseMs =
            responseTimesRef.current.length > 0
              ? Math.round(
                  responseTimesRef.current.reduce(
                    (sum, time) => sum + time,
                    0,
                  ) / responseTimesRef.current.length,
                )
              : null;

          const stats = {
            correct: nextScore,
            total: totalRounds,
            accuracy,
            wrongAttempts,
            mistakes: wrongAttempts,
            totalAttempts,
            attempts: totalAttempts,
            averageResponseMs,
            combo,
            level: currentLevel,
            mode: currentLevel === 1 ? 'odd-one-out' : 'big-small',
          };
          completeLevel(GAME_ID, currentLevel, stats);
          updateLevelProgress(GAME_ID, currentLevel, 100, stats);
          recordAdaptiveResult(GAME_ID, stats);
          if (onComplete) {
            onComplete({
              ...stats,
              passed: true,
              nextLevel: currentLevel === 1 ? 2 : null,
            });
          } else {
            setGameStarted(false);
          }
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

          // Start timing the next round
          answerStartTimeRef.current = Date.now();
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

        // Same question is retried, so start a new attempt timer
        answerStartTimeRef.current = Date.now();
      }, 1200);
    }
  };

  const progressPercent =
    ((currentRound + (gameStarted ? 1 : 0)) / totalRounds) * 100;

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
      }}
    >
      <AnimatedSeaBg />
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
      {!gameStarted && (
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: 'min(100%, 980px)',
            maxHeight: 'calc(100vh - 40px)',
            background: 'rgba(255,255,255,0.94)',
            padding: isMobile ? '12px 12px 84px' : 22,
            borderRadius: 32,
            backdropFilter: 'blur(18px)',
            border: '3px solid rgba(255,255,255,0.7)',
            boxShadow: '0 24px 64px rgba(3,105,161,0.28)',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(290px, 0.9fr) minmax(0, 1.1fr)',
            alignItems: 'center',
            gap: isMobile ? 8 : 22,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minHeight: 0 }}>
            {!isMobile && (
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', right: -2, top: 4, zIndex: 3,
                  maxWidth: 155, padding: '9px 12px', borderRadius: '18px 18px 18px 4px',
                  background: '#fff', border: '2px solid #67E8F9', color: '#0E7490',
                  fontSize: 14, fontWeight: 900, textAlign: 'center', boxShadow: '0 8px 20px rgba(8,145,178,0.18)',
                }}
              >
                හායි යාළුවා! වෙනස් එක සොයමුද?
              </motion.div>
            )}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'relative', width: isMobile ? 155 : 365, maxWidth: '100%' }}
            >
              <img
                src={detectiveCrabLevelBoard}
                alt={`රහස් පරීක්ෂක කකුළු යාළුවා මට්ටම ${currentLevel} පුවරුව අල්ලාගෙන සිටී`}
                style={{ display: 'block', width: '100%', maxHeight: isMobile ? '30vh' : 'calc(100vh - 86px)', objectFit: 'contain' }}
              />
              <div style={{ position: 'absolute', left: '13%', right: '13%', top: isMobile ? '44%' : '46%', bottom: isMobile ? '25%' : '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
                <span style={{ color: '#0F766E', fontSize: isMobile ? 9 : 17, fontWeight: 900 }}>මට්ටම</span>
                <span style={{ color: '#0369A1', fontSize: isMobile ? 30 : 58, fontWeight: 1000, lineHeight: 1 }}>{currentLevel}</span>
                <span style={{ color: '#334155', fontSize: isMobile ? 9 : 19, fontWeight: 900, lineHeight: 1.1, marginTop: isMobile ? 2 : 5, whiteSpace: 'nowrap' }}>
                  {currentLevel === 1 ? 'වෙනස් එක' : isMobile ? 'ලොකු / පොඩි' : 'ලොකු හෝ පොඩි එක සොයමු'}
                </span>
              </div>
            </motion.div>
          </div>

          <div style={{ display: 'flex', minWidth: 0, flexDirection: 'column', justifyContent: 'center', gap: isMobile ? 12 : 22, textAlign: 'center' }}>
            <div style={{ padding: isMobile ? 14 : 20, borderRadius: 24, background: 'linear-gradient(135deg,#ECFEFF,#CFFAFE)', border: '3px solid #67E8F9', boxShadow: '0 10px 24px rgba(8,145,178,0.14)' }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 25 : 38, lineHeight: 1.15, color: '#0E7490', fontWeight: 1000 }}>
                {currentLevel === 1 ? 'වෙනස් එක හොයමු!' : 'ලොකු හෝ පොඩි එක තෝරමු!'}
              </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 7 : 12, fontSize: isMobile ? 12 : 17, lineHeight: 1.35, fontWeight: 1000, color: '#334155' }}>
              {(currentLevel === 1
                ? ['👀 1. හොඳින් බලන්න', '🔎 2. වෙනස් එක හොයන්න', '👆 3. එය තට්ටු කරන්න']
                : ['👀 1. හොඳින් බලන්න', '🔎 2. ලොකු / පොඩි එක හොයන්න', '👆 3. එය තට්ටු කරන්න']
              ).map((text, index) => (
                <div key={text} style={{ display: 'flex', minHeight: isMobile ? 76 : 112, alignItems: 'center', justifyContent: 'center', padding: isMobile ? 8 : 16, borderRadius: isMobile ? 16 : 22, background: ['#E0F2FE','#EDE9FE','#D1FAE5'][index], border: `3px solid ${['#7DD3FC','#C4B5FD','#6EE7B7'][index]}`, boxShadow: '0 8px 18px rgba(15,23,42,0.08)' }}>{text}</div>
              ))}
            </div>

            <motion.button onClick={startGame} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              style={{ position: isMobile ? 'fixed' : 'static', left: isMobile ? 16 : 'auto', right: isMobile ? 16 : 'auto', bottom: isMobile ? 12 : 'auto', zIndex: 30, width: isMobile ? 'auto' : '100%', minHeight: isMobile ? 58 : 72, fontSize: isMobile ? 20 : 26, padding: '14px 24px', borderRadius: 999, border: '4px solid rgba(255,255,255,0.92)', background: 'linear-gradient(135deg,#F97316 0%,#F59E0B 38%,#06B6D4 100%)', color: '#fff', fontWeight: 1000, boxShadow: '0 16px 34px rgba(8,145,178,0.4)', cursor: 'pointer' }}>
              🎮 සෙල්ලම් කරමු!
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* GAME SCREEN */}
      {gameStarted && (
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
                      transform: isOdd && currentQuestion.oddTransform
                        ? currentQuestion.oddTransform
                        : 'none',
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
                  ? 'ඉඟිය: අනෙක් තුනට වඩා වෙනස් සත්වයා හෝ හැරුණු පින්තූරය බලන්න'
                  : currentQuestion?.target === 'big'
                    ? 'ඉඟිය: ලොකුම පින්තූරය තෝරන්න'
                    : 'ඉඟිය: පොඩිම පින්තූරය තෝරන්න'
                : 'නැවත උත්සාහ කරන්න'}
            </div>
          )}
        </motion.div>
      )}

    </div>
  );
};

export default SeaOddOneOut;
