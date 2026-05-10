import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia-balloon-game.css';

// Object image imports (adjust paths as needed)
import imgBaloon from '../../../assets/images/dyscalculiaimages/baloon.png';
import imgBall from '../../../assets/images/dyscalculiaimages/ball.png';
import imgApple from '../../../assets/images/dyscalculiaimages/apple.png';
import imgCar from '../../../assets/images/dyscalculiaimages/car.png';
import imgFlower from '../../../assets/images/dyscalculiaimages/flower.png';
import imgHeart from '../../../assets/images/dyscalculiaimages/heart.png';
import imgMoon from '../../../assets/images/dyscalculiaimages/moon.png';
import imgRocket from '../../../assets/images/dyscalculiaimages/rocket.png';
import imgSun from '../../../assets/images/dyscalculiaimages/sun.png';
import imgLion from '../../../assets/images/dyscalculiaimages/lion.png';
import imgJellyfish from '../../../assets/images/dyscalculiaimages/jelyfish.png';
import imgSippi from '../../../assets/images/dyscalculiaimages/sippi.png';
import imgStarfish from '../../../assets/images/dyscalculiaimages/starfish.png';

// Audio imports
import number0Audio from '../../../assets/audio/dyscalculia/number-0.mp3';
import number1Audio from '../../../assets/audio/dyscalculia/number-1.mp3';
import number2Audio from '../../../assets/audio/dyscalculia/number-2.mp3';
import number3Audio from '../../../assets/audio/dyscalculia/number-3.mp3';
import number4Audio from '../../../assets/audio/dyscalculia/number-4.mp3';
import number5Audio from '../../../assets/audio/dyscalculia/number-5.mp3';
import number6Audio from '../../../assets/audio/dyscalculia/number-6.mp3';
import number7Audio from '../../../assets/audio/dyscalculia/number-7.mp3';
import number8Audio from '../../../assets/audio/dyscalculia/number-8.mp3';
import number9Audio from '../../../assets/audio/dyscalculia/number-9.mp3';
import number10Audio from '../../../assets/audio/dyscalculia/number-10.mp3';

const audioMap = {
  0: number0Audio, 1: number1Audio, 2: number2Audio, 3: number3Audio,
  4: number4Audio, 5: number5Audio, 6: number6Audio, 7: number7Audio,
  8: number8Audio, 9: number9Audio, 10: number10Audio,
};

const BALLOON_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const OBJECT_CATEGORIES = [
  { src: imgBaloon, label: 'balloon' },
  { src: imgBall, label: 'ball' },
  { src: imgApple, label: 'apple' },
  { src: imgCar, label: 'car' },
  { src: imgFlower, label: 'flower' },
  { src: imgHeart, label: 'heart' },
  { src: imgJellyfish, label: 'jellyfish' },
  { src: imgLion, label: 'lion' },
  { src: imgMoon, label: 'moon' },
  { src: imgRocket, label: 'rocket' },
  { src: imgSippi, label: 'sippi' },
  { src: imgStarfish, label: 'starfish' },
  { src: imgSun, label: 'sun' },
];

// Helper functions
const getEngagementMode = () => 'default';
const getMotivationalMessageSi = ({ correct }) => {
  return correct ? '🎉 ලස්සනයි! නිවැරදියි! 🎉' : '🌟 උත්සාහ කරන්න! නැවත උත්සාහ කරමු! 🌟';
};

const ChildFeedbackOverlay = ({ open, correct, message, onDone }) => {
  if (!open) return null;
  return (
    <div className={`feedback-overlay ${correct ? 'success' : 'wrong'}`}>
      <div className="feedback-card">
        <div className="feedback-emoji">{correct ? '🎈✨🎉' : '🌱💪🎈'}</div>
        <div className="feedback-message">{message}</div>
        <div className="feedback-progress-bar">
          <div className="progress-fill" />
        </div>
      </div>
    </div>
  );
};

const BalloonPopGame = () => {
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeBalloonId, setShakeBalloonId] = useState(null);
  const [poppedCircleId, setPoppedCircleId] = useState(null);
  const [showStarReward, setShowStarReward] = useState(false);

  // Audio handlers
  const playNumberAudio = useCallback(async (number) => {
    try {
      const audio = new Audio(audioMap[number]);
      await audio.play();
    } catch {
      const utterance = new SpeechSynthesisUtterance(number.toString());
      utterance.lang = 'si-LK';
      speechSynthesis.speak(utterance);
    }
  }, []);

  const playExplosionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
      setTimeout(() => ctx.close().catch(() => {}), 260);
    } catch {}
  }, []);

  const getSinhalaNumberText = useCallback((n) => {
    const map = {
      1: 'එක', 2: 'දෙක', 3: 'තුන', 4: 'හතර',
      5: 'පහ', 6: 'හය', 7: 'හත', 8: 'අට',
      9: 'නවය', 10: 'දහය'
    };
    return map[n] || n.toString();
  }, []);

  const generateTarget = useCallback(() => {
    const targetNumber = Math.floor(Math.random() * 10) + 1;
    return { targetNumber, targetText: getSinhalaNumberText(targetNumber) };
  }, [getSinhalaNumberText]);

  const generatePositions = useCallback((count) => {
    const positions = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isSmall = width < 520;
    const isLandscape = width > height && height < 620;
    const cols = isLandscape ? 3 : isMobile ? 2 : 3;
    const startY = isLandscape ? 8 : isSmall ? 11 : isMobile ? 12 : 14;
    const verticalGap = isLandscape ? 26 : isSmall ? 30 : isMobile ? 34 : 39;
    const horizontalNoise = isSmall ? 2.4 : 3.2;
    const verticalNoise = isSmall ? 1.8 : 2.2;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = (col + 0.5) * (100 / cols);
      let x = baseX + (Math.random() * horizontalNoise * 2 - horizontalNoise);
      let y = startY + row * verticalGap + (Math.random() * verticalNoise * 2 - verticalNoise);
      x = Math.min(96, Math.max(4, x));
      y = Math.min(isLandscape ? 82 : 89, Math.max(7, y));
      positions.push({ x, y });
    }

    return positions;
  }, []);

  const pickObjectImages = useCallback((count) => {
    const shuffled = [...OBJECT_CATEGORIES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, []);

  const generateBalloons = useCallback((targetNumber) => {
    const balloonCount = 5;
    const positions = generatePositions(balloonCount);
    const correctIndex = Math.floor(Math.random() * balloonCount);
    const selectedCategories = pickObjectImages(balloonCount);
    const newBalloons = [];
    for (let i = 0; i < balloonCount; i++) {
      let quantity;
      if (i === correctIndex) {
        quantity = targetNumber;
      } else {
        let q;
        do {
          const offset = Math.floor(Math.random() * 4) + 1;
          q = Math.random() > 0.5 ? targetNumber + offset : targetNumber - offset;
        } while (q <= 0 || q > 10 || q === targetNumber);
        quantity = q;
      }
      newBalloons.push({
        id: i,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        quantity,
        objSrc: selectedCategories[i].src,
        objLabel: selectedCategories[i].label,
        x: positions[i]?.x || 20 + i * 15,
        y: positions[i]?.y || 30 + i * 10,
        isCorrect: i === correctIndex,
      });
    }
    return newBalloons;
  }, [generatePositions, pickObjectImages]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setQuestionCount(0);
    const q = generateTarget();
    setCurrentQuestion(q);
    setBalloons(generateBalloons(q.targetNumber));
    setShowConfetti(false);
    setPoppedCircleId(null);
    setTimeout(() => playNumberAudio(q.targetNumber), 400);
  }, [generateTarget, generateBalloons, playNumberAudio]);

  const handleBalloonClick = useCallback((balloon) => {
    if (showFeedback || !currentQuestion) return;
    const correct = balloon.isCorrect;
    setShowFeedback(true);
    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      setPoppedCircleId(balloon.id);
      setFeedbackType('success');
      setFeedbackMessage(getMotivationalMessageSi({ correct: true }));
      setShowConfetti(true);
      setShowStarReward(true);
      playExplosionSound();
      setTimeout(() => setShowConfetti(false), 1500);
      setTimeout(() => setShowStarReward(false), 1200);
      localStorage.setItem('game_balloon_stars', '3');
      localStorage.setItem('balloon_score', newScore);
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage(getMotivationalMessageSi({ correct: false }));
      setShakeBalloonId(balloon.id);
      setPoppedCircleId(null);
      setTimeout(() => setShakeBalloonId(null), 500);
    }
    setTimeout(() => {
      const nextCount = questionCount + 1;
      setShowFeedback(false);
      if (nextCount >= 5) {
        setGameStarted(false);
        setPoppedCircleId(null);
      } else {
        const newQ = generateTarget();
        setCurrentQuestion(newQ);
        setBalloons(generateBalloons(newQ.targetNumber));
        setQuestionCount(nextCount);
        setPoppedCircleId(null);
        setShowStarReward(false);
        setTimeout(() => playNumberAudio(newQ.targetNumber), 300);
      }
    }, 1800);
  }, [showFeedback, currentQuestion, score, questionCount, playExplosionSound, generateTarget, generateBalloons, playNumberAudio]);

  const renderedBalloons = useMemo(() => {
    return balloons.map((balloon) => (
      <button
        key={balloon.id}
        className={`math-circle circle-${balloon.color} ${showFeedback ? 'paused' : ''} ${shakeBalloonId === balloon.id ? 'shaking' : ''} ${poppedCircleId === balloon.id ? 'popped' : ''}`}
        style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
        onClick={() => handleBalloonClick(balloon)}
        disabled={showFeedback}
        aria-label={`Balloon with ${balloon.quantity} ${balloon.objLabel}s`}
      >
        <div className="circle-objects">
          {Array.from({ length: balloon.quantity }).map((_, idx) => (
            <img key={idx} src={balloon.objSrc} alt={balloon.objLabel} className="circle-obj-img" draggable={false} />
          ))}
        </div>
      </button>
    ));
  }, [balloons, showFeedback, shakeBalloonId, poppedCircleId, handleBalloonClick]);

  return (
    <div className="balloon-pop-game">
      <button className="child-back-button" onClick={() => navigate('/dyscalculia')}>
        ⬅️ පසුපස
      </button>

      {!gameStarted ? (
        <div className="game-intro">
          <div className="intro-card">
            <div className="intro-icon">🎈🎉🐘</div>
            <h1>බුබුළු පොප් ක්‍රීඩාව</h1>
            <p>🔊 අංකය අහන්න, <strong>නිවැරදි ප්‍රමාණයේ වස්තු</strong> ඇති බුබුල තෝරන්න!</p>
            <div className="intro-example">
              <span>🎵 "හතර"</span>
              <span>→</span>
              <span>🐱🐱🐱🐱</span>
            </div>
            {score > 0 && (
              <div className="final-score">
                🌟 ඔයාගේ ලකුණු: {score} 🌟
              </div>
            )}
            <button className="start-button" onClick={startGame}>
              {score > 0 ? '🚀 නැවත ආරම්භ කරන්න 🚀' : '🎈 ක්‍රීඩාව ආරම්භ කරන්න 🎈'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="game-header">
            <div className="question-display">
              <div className="target-badge">
                <span className="target-number">{currentQuestion?.targetNumber}</span>
                <span className="target-sinhala">{currentQuestion?.targetText}</span>
              </div>
              <button className="replay-audio" onClick={() => playNumberAudio(currentQuestion?.targetNumber)}>
                🔊 නැවත අහන්න
              </button>
            </div>
            <div className="score-display">🏆 {score}</div>
            <div className="question-counter">📋 {questionCount + 1}/5</div>
          </div>

          <div className="balloon-container">
            {renderedBalloons}
          </div>

          <ChildFeedbackOverlay
            open={showFeedback}
            correct={feedbackType === 'success'}
            mode="default"
            message={feedbackMessage}
            onDone={() => setShowFeedback(false)}
          />

          {showStarReward && (
            <div className="star-reward-overlay" aria-hidden="true">
              <div className="star-reward-core">⭐</div>
              <span className="star-reward s1">⭐</span>
              <span className="star-reward s2">✨</span>
              <span className="star-reward s3">⭐</span>
              <span className="star-reward s4">✨</span>
              <span className="star-reward s5">⭐</span>
              <span className="star-reward s6">✨</span>
            </div>
          )}

          {showConfetti && (
            <div className="confetti-container">
              {[...Array(60)].map((_, i) => (
                <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.4}s`, backgroundColor: ['#FFB347', '#FF6B6B', '#4ECDC4', '#FFE66D', '#C44569'][i % 5] }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BalloonPopGame;