import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../../components/common/BackButton';
import ChildFeedbackOverlay from '../components/ChildFeedbackOverlay';
import { getEngagementMode, MODE, getMotivationalMessageSi } from '../utils/childEngagement';

// Import CSS file
import '../styles/dyscalculia-balloon-game.css';

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
const OBJECTS = ['⭐', '🍎', '🍬', '🐠', '🧸', '⚽', '🍌', '🍇'];

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
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeBalloonId, setShakeBalloonId] = useState(null);
  const [engagementMode, setEngagementMode] = useState(MODE.DEFAULT);

  // Play number audio
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

  // Play success sound
  const playSuccessSound = useCallback(() => {
    try {
      const audio = new Audio(audioMap[5]);
      audio.play().catch(() => {});
    } catch {}
  }, []);

  // Play wrong sound
  const playWrongSound = useCallback(() => {
    try {
      const audio = new Audio(audioMap[1]);
      audio.play().catch(() => {});
    } catch {}
  }, []);

  // Get Sinhala number text
  const getSinhalaNumberText = useCallback((n) => {
    const map = {
      1: 'එක', 2: 'දෙක', 3: 'තුන', 4: 'හතර',
      5: 'පහ', 6: 'හය', 7: 'හත', 8: 'අට',
      9: 'නවය', 10: 'දහය'
    };
    return map[n] || n.toString();
  }, []);

  // Generate target number
  const generateTarget = useCallback(() => {
    const targetNumber = Math.floor(Math.random() * 10) + 1;
    return { targetNumber, targetText: getSinhalaNumberText(targetNumber) };
  }, [getSinhalaNumberText]);

  // Generate balloon positions
  const generatePositions = useCallback((count) => {
    const positions = [];
    const isMobile = window.innerWidth < 768;
    const cols = isMobile ? 2 : 3;
    const rows = Math.ceil(count / cols);
    
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col + 0.5) * (100 / cols) + (Math.random() * 10 - 5);
      const y = (row + 0.5) * (70 / rows) + 15;
      positions.push({ 
        x: Math.min(90, Math.max(5, x)), 
        y: Math.min(85, Math.max(10, y)) 
      });
    }
    return positions;
  }, []);

  // Pick random objects
  const pickObjects = useCallback((count) => {
    const result = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
      result.push(obj);
    }
    return result;
  }, []);

  // Generate balloons
  const generateBalloons = useCallback((targetNumber) => {
    const balloonCount = 6;
    const positions = generatePositions(balloonCount);
    const correctIndex = Math.floor(Math.random() * balloonCount);
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
        objects: pickObjects(quantity),
        x: positions[i]?.x || 20 + (i * 15),
        y: positions[i]?.y || 30 + (i * 10),
        isCorrect: i === correctIndex,
      });
    }
    return newBalloons;
  }, [generatePositions, pickObjects]);

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setQuestionCount(0);
    setEngagementMode(getEngagementMode({ explicitMode: MODE.DEFAULT }));
    
    const q = generateTarget();
    setCurrentQuestion(q);
    setBalloons(generateBalloons(q.targetNumber));
    setQuestionStartTime(Date.now());
    setTimeout(() => playNumberAudio(q.targetNumber), 500);
  }, [generateTarget, generateBalloons, playNumberAudio]);

  // Handle balloon click
  const handleBalloonClick = useCallback((balloon) => {
    if (showFeedback || !currentQuestion) return;

    const correct = balloon.isCorrect;

    setShowFeedback(true);

    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      setFeedbackType('success');
      setFeedbackMessage(getMotivationalMessageSi({ correct: true, severityLevel: 'Mild', streak: 0, weakCount: 0 }));
      setShowConfetti(true);
      playSuccessSound();
      setTimeout(() => setShowConfetti(false), 1500);
      
      localStorage.setItem('game_balloon_stars', '3');
      localStorage.setItem('balloon_score', newScore);
    } else {
      setFeedbackType('wrong');
      setFeedbackMessage(getMotivationalMessageSi({ correct: false, severityLevel: 'Mild', streak: 0, weakCount: 0 }));
      setShakeBalloonId(balloon.id);
      playWrongSound();
      setTimeout(() => setShakeBalloonId(null), 500);
    }

    setTimeout(() => {
      const nextCount = questionCount + 1;
      setShowFeedback(false);
      
      if (nextCount >= 5) {
        setGameStarted(false);
      } else {
        const newQ = generateTarget();
        setCurrentQuestion(newQ);
        setBalloons(generateBalloons(newQ.targetNumber));
        setQuestionStartTime(Date.now());
        setQuestionCount(nextCount);
        setTimeout(() => playNumberAudio(newQ.targetNumber), 300);
      }
    }, 2000);
  }, [showFeedback, currentQuestion, score, questionCount, playSuccessSound, playWrongSound, generateTarget, generateBalloons, playNumberAudio]);

  // Render balloons
  const renderedBalloons = useMemo(() => {
    return balloons.map((balloon) => (
      <button
        key={balloon.id}
        className={`balloon balloon-${balloon.color} ${showFeedback ? 'paused' : ''} ${shakeBalloonId === balloon.id ? 'shaking' : ''}`}
        style={{
          left: `${balloon.x}%`,
          top: `${balloon.y}%`,
        }}
        onClick={() => handleBalloonClick(balloon)}
        disabled={showFeedback}
        aria-label={`Balloon with ${balloon.quantity} objects`}
      >
        <div className="balloon-objects">
          {balloon.objects.slice(0, 8).map((obj, idx) => (
            <span key={idx} className="balloon-obj">{obj}</span>
          ))}
          {balloon.objects.length > 8 && <span className="balloon-more">+{balloon.objects.length - 8}</span>}
        </div>
      </button>
    ));
  }, [balloons, showFeedback, shakeBalloonId, handleBalloonClick]);

  return (
    <div className="balloon-pop-game">
      <BackButton onClick={() => navigate('/dyscalculia')} />

      {!gameStarted ? (
        <div className="game-intro">
          <div className="intro-card">
            <div className="intro-icon">🎈</div>
            <h1>බුබුළු පොප් කරමු!</h1>
            <p>අංකයක් ඇසෙනු ඇත. එම ප්‍රමාණයේ වස්තූන් ඇති බුබුල තෝරන්න!</p>
            <div className="intro-example">
              <span>🔊 "පහ"</span>
              <span>→</span>
              <span>{'⭐'.repeat(5)}</span>
            </div>
            {score > 0 && (
              <div className="final-score">
                🎉 ඔබගේ ලකුණු: {score} 🎉
              </div>
            )}
            <button className="start-button" onClick={startGame}>
              {score > 0 ? 'නැවත ආරම්භ කරන්න 🚀' : 'ආරම්භ කරන්න 🚀'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="game-header">
            <div className="question-display">
              <div className="target-number">{currentQuestion?.targetNumber}</div>
              <div className="target-sinhala">{currentQuestion?.targetText}</div>
              <button 
                className="replay-audio" 
                onClick={() => playNumberAudio(currentQuestion?.targetNumber)}
              >
                🔊
              </button>
            </div>
            <div className="score-display">
              🏆 {score}
            </div>
            <div className="question-counter">
              {questionCount + 1}/5
            </div>
          </div>

          <div className="balloon-container">
            {renderedBalloons}
          </div>

          <ChildFeedbackOverlay
            open={showFeedback}
            correct={feedbackType === 'success'}
            mode={engagementMode}
            message={feedbackMessage}
            onDone={() => setShowFeedback(false)}
          />

          {showConfetti && (
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="confetti-piece" 
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][i % 5]
                  }} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BalloonPopGame;
