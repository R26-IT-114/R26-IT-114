import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { matchingImages } from '../utils/matchingImages';
import { useProgress } from '../context/ProgressContext';

const GAME_ID = 'image-matcher';

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

    {[
      { left: '10%', size: 12, duration: 7, delay: 0 },
      { left: '32%', size: 10, duration: 9, delay: 1.5 },
      { left: '55%', size: 15, duration: 8, delay: 0.8 },
      { left: '77%', size: 11, duration: 10, delay: 2.2 },
      { left: '90%', size: 14, duration: 7.6, delay: 1.1 },
    ].map((bubble, index) => (
      <motion.div
        key={`bubble-${index}`}
        className='absolute rounded-full'
        style={{
          left: bubble.left,
          bottom: '4%',
          width: bubble.size,
          height: bubble.size,
          background: 'rgba(255,255,255,0.36)',
          border: '1px solid rgba(255,255,255,0.55)',
        }}
        animate={{ y: [0, -560], opacity: [0, 0.75, 0.35, 0] }}
        transition={{ duration: bubble.duration, delay: bubble.delay, repeat: Infinity, ease: 'easeOut' }}
      />
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
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
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
    setSelectedLeft(null);
    setSelectedRight(null);
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
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatches([]);
    setScore(0);
    setMoves(0);
    setMessage('වම් පසින් පින්තූරයක් තෝරන්න');
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

  const handleLeftClick = (index) => {
    if (gameFinished || matches.includes(`left-${index}`)) return;
    setSelectedLeft(index);
    setSelectedRight(null);
    setMessage('දකුණු පසින් ගැලපෙන පින්තූරය තෝරන්න');
  };

  const handleRightClick = (index) => {
    if (gameFinished || matches.includes(`right-${index}`)) return;

    if (selectedLeft === null) {
      setMessage('පළමුව වම් පසින් පින්තූරයක් තෝරන්න');
      return;
    }

    const isMatch = leftAnimals[selectedLeft]?.id === rightAnimals[index]?.id;

    if (isMatch) {
      playSound('success');
      const newMatches = [...matches, `left-${selectedLeft}`, `right-${index}`];
      const newPairs = [...matchedPairs, { left: selectedLeft, right: index }];
      const nextScore = score + 1;
      const nextMoves = moves + 1;
      const progress = Math.round((nextScore / config.pairs) * 100);

      setMatches(newMatches);
      setMatchedPairs(newPairs);
      setScore(nextScore);
      setMoves(nextMoves);
      setMessage('හරි ගැලපීමක්!');
      setShowCelebration(true);
      setSelectedLeft(null);
      setSelectedRight(null);

      requestAnimationFrame(() => {
        buildConnectionLines(newPairs);
      });

      updateLevelProgress(GAME_ID, safeLevel, progress, { score: nextScore, moves: nextMoves, totalPairs: config.pairs });

      setTimeout(() => {
        if (newPairs.length === config.pairs) {
          const accuracy = Math.round((config.pairs / Math.max(nextMoves, config.pairs)) * 100);
          setGameFinished(true);
          setShowCelebration(true);
          completeLevel(GAME_ID, safeLevel, {
            score: nextScore,
            totalPairs: config.pairs,
            moves: nextMoves,
            accuracy,
          });
        } else {
          setShowCelebration(false);
          setMessage('තවත් එකක් සොයන්න');
        }
      }, 700);
    } else {
      playSound('error');
      setMessage('මෙය ගැලපෙන්නේ නැහැ. නැවත උත්සාහ කරන්න');
      setSelectedRight(index);
      setMoves((prev) => prev + 1);

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setMessage('වම් පසින් පින්තූරයක් තෝරන්න');
      }, 900);
    }
  };

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
    setSelectedLeft(null);
    setSelectedRight(null);
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

          <h1 style={{ fontSize: '44px', margin: '16px 0 12px 0', color: '#0F172A', fontWeight: 900, lineHeight: 1.18 }}>
            මුහුදු තේමාවෙන් පින්තූර ගැලපීම
          </h1>

          <p style={{ fontSize: '20px', color: '#0F766E', margin: '0 0 12px 0', fontWeight: 800 }}>
            {config.subtitle}
          </p>

          <p style={{ fontSize: '16px', color: '#475569', margin: '0 0 34px 0', lineHeight: 1.6, fontWeight: 600 }}>
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
              fontSize: '22px',
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
    const accuracy = Math.round((score / config.pairs) * 100);
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
          <h2 style={{ fontSize: '42px', color: '#0F172A', margin: '0 0 12px 0', fontWeight: 900 }}>මට්ටම සාර්ථකයි</h2>
          <p style={{ fontSize: '19px', color: '#475569', margin: '0 0 26px 0', fontWeight: 600 }}>ඔබට පින්තූර ගැලපීම ඉතා හොඳින් කළා.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '24px 0' }}>
            <div style={{ background: '#E0F2FE', borderRadius: '16px', padding: '18px', color: '#075985' }}>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>{score}/{config.pairs}</div>
              <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 700 }}>ලකුණු</div>
            </div>
            <div style={{ background: '#DCFCE7', borderRadius: '16px', padding: '18px', color: '#166534' }}>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>{accuracy}%</div>
              <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 700 }}>නිරවද්යතාව</div>
            </div>
            <div style={{ background: '#FEF3C7', borderRadius: '16px', padding: '18px', color: '#92400E' }}>
              <div style={{ fontSize: '28px', fontWeight: 900 }}>{moves}</div>
              <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 700 }}>උත්සාහ</div>
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
                fontSize: '16px',
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
                fontSize: '16px',
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
                fontSize: '16px',
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
        <h1 style={{ color: 'white', fontSize: '40px', margin: '0 0 10px 0', fontWeight: 900, textShadow: '0 3px 10px rgba(0,0,0,0.2)' }}>
          පින්තූර ගැලපීම
        </h1>

        <div style={{ background: 'rgba(255,255,255,0.3)', height: '14px', borderRadius: '14px', overflow: 'hidden', margin: '0 auto 12px auto', maxWidth: '360px', border: '2px solid rgba(255,255,255,0.85)' }}>
          <div style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #14B8A6 100%)', height: '100%', width: `${(score / config.pairs) * 100}%`, transition: 'width 0.35s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: 'white', fontWeight: 800, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '999px' }}>ලකුණු: {score}/{config.pairs}</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '999px' }}>උත්සාහ: {moves}</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '999px' }}>{config.title}</div>
        </div>
      </div>

      <div
        ref={boardRef}
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '22px',
          padding: '24px',
          background: 'rgba(255,255,255,0.22)',
          borderRadius: '30px',
          border: '4px solid rgba(255,255,255,0.45)',
          backdropFilter: 'blur(12px)',
          alignItems: 'center',
          justifyContent: 'center',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparkIcon size={16} color='white' />
            වම් පස
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {leftAnimals.map((animal, index) => {
              const isMatched = matches.includes(`left-${index}`);
              const isSelected = selectedLeft === index;
              return (
                <button
                  type='button'
                  key={`left-${animal.id}-${index}`}
                  ref={(el) => {
                    leftRefs.current[index] = el;
                  }}
                  onClick={() => handleLeftClick(index)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '138px',
                    height: '138px',
                    padding: '10px',
                    borderRadius: '24px',
                    background: isMatched
                      ? 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 100%)'
                      : isSelected
                        ? 'white'
                        : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
                    border: isMatched
                      ? '3px solid white'
                      : isSelected
                        ? '4px solid #0EA5E9'
                        : '3px solid white',
                    cursor: isMatched ? 'default' : 'pointer',
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
                  <img src={animal.image} alt={animal.label} style={{ width: '84px', height: '84px', objectFit: 'contain', opacity: isMatched ? 0.4 : 1 }} />
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SparkIcon size={16} color='white' />
            දකුණු පස
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {rightAnimals.map((animal, index) => {
              const isMatched = matches.includes(`right-${index}`);
              const isSelected = selectedRight === index;
              return (
                <button
                  type='button'
                  key={`right-${animal.id}-${index}`}
                  ref={(el) => {
                    rightRefs.current[index] = el;
                  }}
                  onClick={() => handleRightClick(index)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '138px',
                    height: '138px',
                    padding: '10px',
                    borderRadius: '24px',
                    background: isMatched
                      ? 'linear-gradient(135deg, #86EFAC 0%, #4ADE80 100%)'
                      : isSelected
                        ? 'white'
                        : 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)',
                    border: isMatched
                      ? '3px solid white'
                      : isSelected
                        ? '4px solid #0EA5E9'
                        : '3px solid white',
                    cursor: isMatched ? 'default' : 'pointer',
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
                  <img src={animal.image} alt={animal.label} style={{ width: '84px', height: '84px', objectFit: 'contain', opacity: isMatched ? 0.4 : 1 }} />
                </button>
              );
            })}
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
            fontSize: '28px',
            fontWeight: 900,
            color: 'white',
            textShadow: '0 3px 10px rgba(0,0,0,0.28)',
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
            fontSize: '15px',
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
