import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { matchingImages } from '../utils/matchingImages';
import { useProgress } from '../context/ProgressContext';

const GAME_ID = 'image-matcher';
const CARD_SIZE = 164;

const LEVELS = {
  1: { pairs: 4, title: 'මට්ටම 1', subtitle: 'පින්තූර 4ක් ගැලපීම', color: '#0EA5E9' },
  2: { pairs: 5, title: 'මට්ටම 2', subtitle: 'පින්තූර 5ක් ගැලපීම', color: '#0284C7' },
  3: { pairs: 6, title: 'මට්ටම 3', subtitle: 'පින්තූර 6ක් ගැලපීම', color: '#0369A1' },
};

const shuffle = (items) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const SparkIcon = ({ size = 20, color = '#F59E0B' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2.1' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d='M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8' />
  </svg>
);

const CheckIcon = ({ size = 20, color = '#16A34A' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <polyline points='20 6 9 17 4 12' />
  </svg>
);

const RetryIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <polyline points='1 4 1 10 7 10' />
    <path d='M3.6 15a9 9 0 1 0 .4-5' />
  </svg>
);

const HomeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
    <path d='M9 22V12h6v10' />
  </svg>
);

const TrophyIcon = ({ size = 56, color = '#F59E0B' }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <path d='M7 4h10v5a5 5 0 0 1-10 0V4z' />
    <path d='M17 5h2a2 2 0 0 1 2 2 4 4 0 0 1-4 4' />
    <path d='M7 5H5a2 2 0 0 0-2 2 4 4 0 0 0 4 4' />
    <path d='M12 14v6' />
    <path d='M8 21h8' />
  </svg>
);

const SeaBackdrop = () => (
  <div className='absolute inset-0 overflow-hidden pointer-events-none' aria-hidden='true'>
    <motion.div
      className='absolute -top-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full'
      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 70%)' }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.95, 0.55] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div
      className='absolute top-1/4 left-0 right-0 h-40 opacity-20'
      style={{ background: 'linear-gradient(180deg, rgba(2,132,199,0.08) 0%, transparent 100%)' }}
      animate={{ y: [-20, 20, -20] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div
      className='absolute -left-1/3 top-1/3 w-96 h-96 rounded-full'
      style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)' }}
      animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div
      className='absolute -right-1/4 bottom-1/4 w-80 h-80 rounded-full'
      style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }}
      animate={{ x: [0, -50, 0], y: [0, -50, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div className='absolute bottom-0 left-0 right-0 h-24' animate={{ x: [0, -70, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
      <svg viewBox='0 0 400 100' width='300%' height='100%' preserveAspectRatio='none' aria-hidden='true'>
        <path d='M0 55 Q50 22 100 55 T200 55 T300 55 T400 55 L400 100 L0 100 Z' fill='rgba(8,145,178,0.18)' />
      </svg>
    </motion.div>

    <motion.div className='absolute bottom-0 left-0 right-0 h-20' animate={{ x: [0, 52, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
      <svg viewBox='0 0 400 100' width='300%' height='100%' preserveAspectRatio='none' aria-hidden='true'>
        <path d='M0 50 Q50 72 100 50 T200 50 T300 50 T400 50 L400 100 L0 100 Z' fill='rgba(15,118,110,0.16)' />
      </svg>
    </motion.div>

    <motion.div className='absolute bottom-0 left-0 right-0 h-16' animate={{ x: [0, -100, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
      <svg viewBox='0 0 400 80' width='300%' height='100%' preserveAspectRatio='none' aria-hidden='true'>
        <path d='M0 40 Q25 10 50 40 T100 40 T150 40 T200 40 T250 40 T300 40 T350 40 T400 40 L400 80 L0 80 Z' fill='rgba(6,182,212,0.12)' />
      </svg>
    </motion.div>

    {[
      { left: '10%', size: 12, duration: 7, delay: 0, depth: 'top' },
      { left: '32%', size: 10, duration: 9, delay: 1.5, depth: 'top' },
      { left: '55%', size: 15, duration: 8, delay: 0.8, depth: 'mid' },
      { left: '77%', size: 11, duration: 10, delay: 2.2, depth: 'mid' },
      { left: '90%', size: 14, duration: 7.6, delay: 1.1, depth: 'deep' },
      { left: '15%', size: 8, duration: 6, delay: 0.5, depth: 'deep' },
      { left: '65%', size: 9, duration: 8.5, delay: 2, depth: 'top' },
      { left: '40%', size: 13, duration: 9.5, delay: 1.2, depth: 'mid' },
    ].map((bubble, index) => (
      <motion.div
        key={`bubble-${index}`}
        className='absolute rounded-full'
        style={{
          left: bubble.left,
          bottom: bubble.depth === 'top' ? '10%' : bubble.depth === 'mid' ? '3%' : '-2%',
          width: bubble.size,
          height: bubble.size,
          background: bubble.depth === 'deep'
            ? 'rgba(255,255,255,0.2)'
            : bubble.depth === 'mid'
              ? 'rgba(255,255,255,0.3)'
              : 'rgba(255,255,255,0.4)',
          border: `1px solid ${bubble.depth === 'deep' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.55)'}`,
          boxShadow: `inset 0 2px 4px rgba(255,255,255,${bubble.depth === 'deep' ? '0.2' : '0.4'})`,
        }}
        animate={{ y: [0, -600], opacity: [0, 0.75, 0.35, 0], x: [-2, 2, -2] }}
        transition={{ duration: bubble.duration, delay: bubble.delay, repeat: Infinity, ease: 'easeOut' }}
      />
    ))}

    {[
      { top: '20%', left: '10%', delay: 0, duration: 20 },
      { top: '40%', right: '5%', delay: 2, duration: 24 },
      { top: '60%', left: '15%', delay: 4, duration: 22 },
      { top: '35%', right: '20%', delay: 1, duration: 26 },
    ].map((seaweed, index) => (
      <motion.div
        key={`seaweed-${index}`}
        className='absolute opacity-30'
        style={{
          top: seaweed.top,
          left: seaweed.left,
          right: seaweed.right,
          width: '4px',
          height: '120px',
          background: 'linear-gradient(180deg, rgba(34,197,94,0.4) 0%, rgba(34,197,94,0.1) 100%)',
          borderRadius: '50%',
        }}
        animate={{ x: [0, 8, -4, 6, 0], rotateZ: [-2, 2, -3, 1, 0] }}
        transition={{ duration: seaweed.duration, delay: seaweed.delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}

    {[
      { top: '25%', left: '5%', delay: 0, duration: 18 },
      { top: '45%', right: '8%', delay: 1.5, duration: 20 },
      { top: '55%', left: '20%', delay: 3, duration: 22 },
    ].map((fish, index) => (
      <motion.div
        key={`fish-${index}`}
        className='absolute text-2xl opacity-40'
        style={{
          top: fish.top,
          left: fish.left,
          right: fish.right,
        }}
        animate={{ x: fish.left ? [0, 80] : [0, -80], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: fish.duration, delay: fish.delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        ≈
      </motion.div>
    ))}
  </div>
);

const getCenterPoint = (element, container) => {
  if (!element || !container) return null;
  const er = element.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  return {
    x: er.left - cr.left + er.width / 2,
    y: er.top - cr.top + er.height / 2,
  };
};

const ImageMatcherGame = ({ level = 1, onComplete }) => {
  const safeLevel = LEVELS[level] ? level : 1;
  const config = LEVELS[safeLevel];
  const { initializeGame: initializeProgress, completeLevel, updateLevelProgress } = useProgress();

  const [leftAnimals, setLeftAnimals] = useState([]);
  const [rightAnimals, setRightAnimals] = useState([]);
  const [dropLeft, setDropLeft] = useState(null);
  const [dropRight, setDropRight] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [connectionLines, setConnectionLines] = useState([]);

  const boardRef = useRef(null);
  const leftRefs = useRef([]);
  const rightRefs = useRef([]);

  const pairPool = useMemo(() => shuffle(matchingImages).slice(0, config.pairs), [config.pairs]);

  useEffect(() => {
    initializeProgress(GAME_ID);
  }, [initializeProgress]);

  useEffect(() => {
    setGameStarted(false);
    setGameFinished(false);
    setMessage('');
    setDropLeft(null);
    setDropRight(null);
    setActiveDrag(null);
    setIsChecking(false);
    setMatches([]);
    setScore(0);
    setMoves(0);
    setShowCelebration(false);
    setMatchedPairs([]);
    setConnectionLines([]);
    updateLevelProgress(GAME_ID, safeLevel, 0, { score: 0, moves: 0, totalPairs: config.pairs });
    // Reset only when level changes; do not depend on context function identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeLevel, config.pairs]);

  const buildConnectionLines = (pairs) => {
    if (!boardRef.current) return;
    const lines = pairs
      .map((pair) => {
        const leftPoint = getCenterPoint(leftRefs.current[pair.left], boardRef.current);
        const rightPoint = getCenterPoint(rightRefs.current[pair.right], boardRef.current);
        if (!leftPoint || !rightPoint) return null;
        return {
          leftX: leftPoint.x,
          leftY: leftPoint.y,
          rightX: rightPoint.x,
          rightY: rightPoint.y,
        };
      })
      .filter(Boolean);

    setConnectionLines(lines);
  };

  const initializeGame = () => {
    const shuffledLeft = shuffle(pairPool);
    const shuffledRight = shuffle(pairPool);

    setLeftAnimals(shuffledLeft);
    setRightAnimals(shuffledRight);
    setDropLeft(null);
    setDropRight(null);
    setActiveDrag(null);
    setIsChecking(false);
    setMatches([]);
    setScore(0);
    setMoves(0);
    setMessage('වම් පසින් පින්තූරයක් තෝරලා, දකුණු පසින් එකම පින්තූරය හොයන්න.');
    setGameStarted(true);
    setGameFinished(false);
    setShowCelebration(false);
    setMatchedPairs([]);
    setConnectionLines([]);
    updateLevelProgress(GAME_ID, safeLevel, 0, { score: 0, moves: 0, totalPairs: config.pairs });
  };

  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'success') {
        oscillator.frequency.value = 760;
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === 'error') {
        oscillator.frequency.value = 340;
        gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.14);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.14);
      }
    } catch {
      // Ignore audio failures on unsupported environments.
    }
  };

  const handleDragStart = (event, side, index) => {
    if (isChecking || gameFinished || matches.includes(`${side}-${index}`)) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `${side}:${index}`);
    setActiveDrag({ side, index });
    setMessage(side === 'left' ? 'වම් පස රූපය වම් කොටුවට දාන්න' : 'දකුණු පස රූපය දකුණු කොටුවට දාන්න');
  };

  const handleDragEnd = () => {
    setActiveDrag(null);
  };

  const handleDropZone = (event, targetSide) => {
    event.preventDefault();
    if (!activeDrag || isChecking || gameFinished) return;
    if (activeDrag.side !== targetSide) {
      setMessage('වම් රූපය වම් කොටුවටත් දකුණු රූපය දකුණු කොටුවටත් දාන්න');
      return;
    }

    if (targetSide === 'left') {
      setDropLeft(activeDrag.index);
      setMessage('දැන් දකුණු රූපය දකුණු කොටුවට දාන්න');
    } else {
      setDropRight(activeDrag.index);
      setMessage('දැන් වම් රූපය වම් කොටුවට දාන්න');
    }

    setActiveDrag(null);
  };

  useEffect(() => {
    if (dropLeft === null || dropRight === null || isChecking || gameFinished) return;

    setIsChecking(true);
    const nextMoves = moves + 1;
    const isMatch = leftAnimals[dropLeft]?.id === rightAnimals[dropRight]?.id;
    setMoves(nextMoves);

    if (isMatch) {
      playSound('success');
      const newMatches = [...matches, `left-${dropLeft}`, `right-${dropRight}`];
      const newPairs = [...matchedPairs, { left: dropLeft, right: dropRight }];
      const nextScore = score + 1;
      const progress = Math.round((nextScore / config.pairs) * 100);

      setMatches(newMatches);
      setMatchedPairs(newPairs);
      setScore(nextScore);
      setMessage('හරි ගැලපීමක්! කොටු දෙක නැවත හිස් වුණා');
      setShowCelebration(true);

      requestAnimationFrame(() => {
        buildConnectionLines(newPairs);
      });

      updateLevelProgress(GAME_ID, safeLevel, progress, { score: nextScore, moves: nextMoves, totalPairs: config.pairs });

      setTimeout(() => {
        setDropLeft(null);
        setDropRight(null);
        setIsChecking(false);
        if (newPairs.length === config.pairs) {
          const rightAnswers = nextScore;
          const wrongAttempts = Math.max(nextMoves - rightAnswers, 0);
          const totalAttempts = rightAnswers + wrongAttempts;
          const accuracy = Math.round((rightAnswers / Math.max(totalAttempts, 1)) * 100);
          setGameFinished(true);
          setShowCelebration(true);
          completeLevel(GAME_ID, safeLevel, {
            score: nextScore,
            rightAnswers,
            wrongAttempts,
            totalAttempts,
            totalQuestions: config.pairs,
            totalPairs: config.pairs,
            moves: nextMoves,
            accuracy,
          });
        } else {
          setShowCelebration(false);
          setMessage('තවත් ගැලපීමක් කරන්න');
        }
      }, 800);
    } else {
      playSound('error');
      setMessage('ගැලපීම වැරදී. කොටු දෙක නැවත හිස් වුණා');

      setTimeout(() => {
        setDropLeft(null);
        setDropRight(null);
        setIsChecking(false);
        setMessage('වම් කොටුවට වම් රූපයක් දාන්න');
      }, 900);
    }
  }, [
    dropLeft,
    dropRight,
    isChecking,
    gameFinished,
    moves,
    leftAnimals,
    rightAnimals,
    matches,
    matchedPairs,
    score,
    config.pairs,
    safeLevel,
    completeLevel,
    updateLevelProgress,
  ]);

  const handlePlayAgain = () => {
    initializeGame();
  };

  const handleGoHome = () => {
    if (onComplete) {
      onComplete({ goHome: true });
      return;
    }

    setGameStarted(false);
    setGameFinished(false);
    setLeftAnimals([]);
    setRightAnimals([]);
    setMatches([]);
    setScore(0);
    setMoves(0);
    setMessage('');
    setDropLeft(null);
    setDropRight(null);
    setActiveDrag(null);
    setIsChecking(false);
  };

  const handleNext = () => {
    if (!onComplete) return;

    if (safeLevel < 3) {
      onComplete({ nextLevel: safeLevel + 1 });
      return;
    }

    onComplete({ completed: true });
  };

  if (!gameStarted) {
    return (
      <main
        className='page-shell'
        style={{
          background: 'linear-gradient(180deg, #A5F3FC 0%, #67E8F9 40%, #22D3EE 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SeaBackdrop />
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative z-10'
          style={{
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '38px',
            padding: '52px 42px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '4px solid rgba(14,116,144,0.25)',
            maxWidth: '660px',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderRadius: '999px', background: '#E0F2FE', color: '#0369A1', fontWeight: 800, fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <SparkIcon size={16} color='#0369A1' />
            {config.title}
          </div>

          <h1 style={{ fontSize: '52px', margin: '16px 0 12px 0', color: '#0C4A6E', fontWeight: 900, lineHeight: 1.15 }}>
            පින්තූර ගලපමු ද?
          </h1>

          <p style={{ fontSize: '24px', color: '#0E7490', margin: '0 0 12px 0', fontWeight: 900 }}>
            {config.subtitle}
          </p>

          <p style={{ fontSize: '19px', color: '#334155', margin: '0 0 34px 0', lineHeight: 1.6, fontWeight: 700 }}>
            වම් පසින් පින්තූරයක් තෝරලා, දකුණු පසින් එකම පින්තූරය හොයන්න. සියල්ල ගැලපුවාම මට්ටම සම්පූර්ණ වේ.
          </p>

          <button
            type='button'
            onClick={initializeGame}
            style={{
              background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '28px',
              padding: '16px 54px',
              fontSize: '28px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 10px 26px rgba(2,132,199,0.35)',
            }}
          >
            ආරම්භ කරන්න
          </button>
        </motion.div>
      </main>
    );
  }

  if (gameFinished) {
    const rightAnswers = score;
    const totalQuestions = config.pairs;
    const wrongAttempts = Math.max(moves - rightAnswers, 0);
    const totalAttempts = rightAnswers + wrongAttempts;
    const accuracy = Math.round((rightAnswers / Math.max(totalAttempts, 1)) * 100);
    const completionRate = Math.round((rightAnswers / Math.max(totalQuestions, 1)) * 100);
    const accuracyLevel = accuracy >= 90
      ? { label: 'විශිෂ්ට මට්ටම', bg: '#DCFCE7', color: '#166534' }
      : accuracy >= 75
        ? { label: 'හොඳ මට්ටම', bg: '#DBEAFE', color: '#1D4ED8' }
        : accuracy >= 60
          ? { label: 'සරිලන මට්ටම', bg: '#FEF3C7', color: '#92400E' }
          : { label: 'තවත් පුහුණුව අවශ්‍යයි', bg: '#FEE2E2', color: '#991B1B' };
    return (
      <main
        className='page-shell'
        style={{
          background: 'linear-gradient(180deg, #A5F3FC 0%, #67E8F9 40%, #22D3EE 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SeaBackdrop />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='relative z-10'
          style={{
            background: 'rgba(255,255,255,0.94)',
            borderRadius: '30px',
            padding: '48px 38px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            border: '4px solid rgba(14,116,144,0.24)',
            maxWidth: '680px',
          }}
        >
          <div style={{ marginBottom: '14px' }}><TrophyIcon /></div>
          <h2 style={{ fontSize: '48px', color: '#0C4A6E', margin: '0 0 12px 0', fontWeight: 900 }}>මට්ටම සාර්ථකයි</h2>
          <div
            style={{
              display: 'inline-block',
              padding: '10px 18px',
              borderRadius: '999px',
              background: accuracyLevel.bg,
              color: accuracyLevel.color,
              fontSize: '20px',
              fontWeight: 900,
              marginBottom: '14px',
              border: `2px solid ${accuracyLevel.color}`,
            }}
          >
            නිරවද්‍යතා මට්ටම: {accuracyLevel.label}
          </div>
          <p style={{ fontSize: '18px', color: '#1E293B', margin: '0 0 16px 0', fontWeight: 800 }}>
            නිවැරදි: {rightAnswers} | වැරදි උත්සාහ: {wrongAttempts} | ප්‍රශ්න: {totalQuestions}
          </p>
          <p style={{ fontSize: '24px', color: '#0F766E', margin: '0 0 26px 0', fontWeight: 700 }}>ඔබට පින්තූර ගැලපීම ඉතා හොඳින් කළා.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '24px 0' }}>
            <div style={{ background: '#E0F2FE', borderRadius: '16px', padding: '18px', color: '#075985' }}>
              <div style={{ fontSize: '34px', fontWeight: 900 }}>{score}/{config.pairs}</div>
              <div style={{ fontSize: '16px', marginTop: '4px', fontWeight: 800 }}>ලකුණු</div>
            </div>
            <div style={{ background: '#DCFCE7', borderRadius: '16px', padding: '18px', color: '#166534' }}>
              <div style={{ fontSize: '34px', fontWeight: 900 }}>{accuracy}%</div>
              <div style={{ fontSize: '16px', marginTop: '4px', fontWeight: 800 }}>නිරවද්යතාව (නිවැරදි/සියලු උත්සාහ)</div>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: '16px', padding: '18px', color: '#92400E' }}>
              <div style={{ fontSize: '34px', fontWeight: 900 }}>{completionRate}%</div>
              <div style={{ fontSize: '16px', marginTop: '4px', fontWeight: 800 }}>ප්‍රශ්න සම්පූර්ණය</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
            <button
              type='button'
              onClick={handlePlayAgain}
              style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 24px',
                fontSize: '19px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RetryIcon size={16} color='white' />
              නැවත ක්‍රීඩා කරන්න
            </button>

            <button
              type='button'
              onClick={handleNext}
              style={{
                background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 24px',
                fontSize: '19px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckIcon size={16} color='white' />
              {safeLevel < 3 ? 'ඊළඟ මට්ටම' : 'සම්පූර්ණයි'}
            </button>

            <button
              type='button'
              onClick={handleGoHome}
              style={{
                background: 'white',
                color: '#0F766E',
                border: '2px solid #0F766E',
                borderRadius: '14px',
                padding: '12px 20px',
                fontSize: '19px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <HomeIcon size={16} color='#0F766E' />
              මුල් පිටුව
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className='page-shell'
      style={{
        background: 'linear-gradient(180deg, #A5F3FC 0%, #67E8F9 40%, #22D3EE 100%)',
        minHeight: '100vh',
        padding: '22px 14px 42px 14px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <SeaBackdrop />

      <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
        <h1 style={{ color: '#FEFCE8', fontSize: '48px', margin: '0 0 10px 0', fontWeight: 900, textShadow: '0 4px 12px rgba(7,89,133,0.45)' }}>
          පින්තූර ගැලපීම
        </h1>

        <div style={{ background: 'rgba(255,255,255,0.3)', height: '14px', borderRadius: '14px', overflow: 'hidden', margin: '0 auto 12px auto', maxWidth: '360px', border: '2px solid rgba(255,255,255,0.85)' }}>
          <div style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #14B8A6 100%)', height: '100%', width: `${(score / config.pairs) * 100}%`, transition: 'width 0.35s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: '#0B1324', fontWeight: 900, flexWrap: 'wrap', fontSize: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 16px', borderRadius: '999px', border: '2px solid #BAE6FD' }}>ලකුණු: {score}/{config.pairs}</div>
          <div style={{ background: 'rgba(236,253,245,0.96)', padding: '10px 16px', borderRadius: '999px', border: '2px solid #99F6E4' }}>උත්සාහ: {moves}</div>
          <div style={{ background: 'rgba(254,249,195,0.96)', padding: '10px 16px', borderRadius: '999px', border: '2px solid #FDE68A' }}>{config.title}</div>
        </div>
      </div>

      <div
        ref={boardRef}
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          padding: '24px',
          background: 'rgba(255,255,255,0.22)',
          borderRadius: '30px',
          border: '4px solid rgba(255,255,255,0.45)',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {connectionLines.map((line, index) => (
            <line
              key={`line-${index}`}
              x1={line.leftX}
              y1={line.leftY}
              x2={line.rightX}
              y2={line.rightY}
              stroke='rgba(20,184,166,0.8)'
              strokeWidth='4'
              strokeLinecap='round'
            />
          ))}
        </svg>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px', marginBottom: '22px' }}>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDropZone(event, 'left')}
            style={{
              minHeight: '124px',
              borderRadius: '22px',
              border: `3px dashed ${activeDrag?.side === 'left' ? '#0EA5E9' : 'rgba(255,255,255,0.85)'}`,
              background: 'rgba(255,255,255,0.62)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '10px',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#075985', marginBottom: '6px' }}>වම් පස කොටුව</div>
            {dropLeft === null ? (
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F766E', textAlign: 'center' }}>වම් පසින් රූපයක් drag & drop කරන්න</div>
            ) : (
              <img src={leftAnimals[dropLeft]?.image} alt={leftAnimals[dropLeft]?.label} style={{ width: '88px', height: '88px', objectFit: 'contain' }} />
            )}
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDropZone(event, 'right')}
            style={{
              minHeight: '124px',
              borderRadius: '22px',
              border: `3px dashed ${activeDrag?.side === 'right' ? '#0EA5E9' : 'rgba(255,255,255,0.85)'}`,
              background: 'rgba(255,255,255,0.62)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: '10px',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#075985', marginBottom: '6px' }}>දකුණු පස කොටුව</div>
            {dropRight === null ? (
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F766E', textAlign: 'center' }}>දකුණු පසින් රූපයක් drag & drop කරන්න</div>
            ) : (
              <img src={rightAnimals[dropRight]?.image} alt={rightAnimals[dropRight]?.label} style={{ width: '88px', height: '88px', objectFit: 'contain' }} />
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#FEF9C3', textShadow: '0 3px 8px rgba(12,74,110,0.45)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparkIcon size={16} color='white' />
            වම් පස
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {leftAnimals.map((animal, index) => {
              const isMatched = matches.includes(`left-${index}`);
              const isSelected = dropLeft === index;
              return (
                <button
                  type='button'
                  key={`left-${animal.id}-${index}`}
                  draggable={!isMatched && !isChecking}
                  onDragStart={(event) => handleDragStart(event, 'left', index)}
                  onDragEnd={handleDragEnd}
                  ref={(el) => {
                    leftRefs.current[index] = el;
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: `${CARD_SIZE}px`,
                    height: `${CARD_SIZE}px`,
                    padding: '10px',
                    borderRadius: '24px',
                    background: isMatched
                      ? 'linear-gradient(135deg, #86EFAC 0%, #22C55E 100%)'
                      : isSelected
                        ? 'white'
                        : 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
                    border: isMatched
                      ? '3px solid white'
                      : isSelected
                        ? '4px solid #0EA5E9'
                        : '3px solid white',
                    cursor: isMatched ? 'default' : 'grab',
                    transition: 'all 0.25s ease',
                    opacity: isMatched ? 0.72 : 1,
                    boxShadow: isSelected ? '0 12px 28px rgba(14,116,144,0.35)' : '0 6px 16px rgba(0,0,0,0.15)',
                    position: 'relative',
                  }}
                >
                  {isMatched && (
                    <div style={{ position: 'absolute', right: '8px', top: '8px', background: 'white', borderRadius: '999px', padding: '3px' }}>
                      <CheckIcon size={14} color='#16A34A' />
                    </div>
                  )}
                  <img src={animal.image} alt={animal.label} style={{ width: '108px', height: '108px', objectFit: 'contain', opacity: isMatched ? 0.45 : 1 }} />
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#CCFBF1', textShadow: '0 3px 8px rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparkIcon size={16} color='white' />
            දකුණු පස
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {rightAnimals.map((animal, index) => {
              const isMatched = matches.includes(`right-${index}`);
              const isSelected = dropRight === index;
              return (
                <button
                  type='button'
                  key={`right-${animal.id}-${index}`}
                  draggable={!isMatched && !isChecking}
                  onDragStart={(event) => handleDragStart(event, 'right', index)}
                  onDragEnd={handleDragEnd}
                  ref={(el) => {
                    rightRefs.current[index] = el;
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: `${CARD_SIZE}px`,
                    height: `${CARD_SIZE}px`,
                    padding: '10px',
                    borderRadius: '24px',
                    background: isMatched
                      ? 'linear-gradient(135deg, #86EFAC 0%, #22C55E 100%)'
                      : isSelected
                        ? 'white'
                        : 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 100%)',
                    border: isMatched
                      ? '3px solid white'
                      : isSelected
                        ? '4px solid #0EA5E9'
                        : '3px solid white',
                    cursor: isMatched ? 'default' : 'grab',
                    transition: 'all 0.25s ease',
                    opacity: isMatched ? 0.72 : 1,
                    boxShadow: isSelected ? '0 12px 28px rgba(15,118,110,0.35)' : '0 6px 16px rgba(0,0,0,0.15)',
                    position: 'relative',
                  }}
                >
                  {isMatched && (
                    <div style={{ position: 'absolute', right: '8px', top: '8px', background: 'white', borderRadius: '999px', padding: '3px' }}>
                      <CheckIcon size={14} color='#16A34A' />
                    </div>
                  )}
                  <img src={animal.image} alt={animal.label} style={{ width: '108px', height: '108px', objectFit: 'contain', opacity: isMatched ? 0.45 : 1 }} />
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, scale: showCelebration ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.35 }}
          style={{
            textAlign: 'center',
            marginTop: '18px',
            fontSize: '36px',
            fontWeight: 900,
            color: '#FEF9C3',
            textShadow: '0 3px 12px rgba(12,74,110,0.55)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {message}
        </motion.div>
      )}

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <button
          type='button'
          onClick={handleGoHome}
          style={{
            background: 'rgba(255,255,255,0.9)',
            color: '#0F766E',
            border: '2px solid #0F766E',
            borderRadius: '999px',
            padding: '10px 18px',
            fontSize: '18px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <HomeIcon size={16} color='#0F766E' />
          මුල් පිටුව
        </button>
      </div>
    </main>
  );
};

export default ImageMatcherGame;
