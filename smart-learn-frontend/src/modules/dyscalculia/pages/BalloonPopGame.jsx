import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDyscalculiaFlow } from '../context/DyscalculiaFlowContext';
import { saveGameSession } from '../utils/dyscalculiaProgress';
import BackButton from '../../../components/common/BackButton';
import '../styles/dyscalculia-balloon-game.css';
import '../styles/dyscalculia-child-feedback.css';

import ChildFeedbackOverlay from '../components/ChildFeedbackOverlay';
import { getEngagementMode, MODE, getMotivationalMessageSi } from '../utils/childEngagement';


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
  0: number0Audio,
  1: number1Audio,
  2: number2Audio,
  3: number3Audio,
  4: number4Audio,
  5: number5Audio,
  6: number6Audio,
  7: number7Audio,
  8: number8Audio,
  9: number9Audio,
  10: number10Audio,
};

const BALLOON_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const OBJECTS = ['⭐', '🍎', '🍬', '🐠', '🧸', '⚽', '🍌', '🍇'];

const BalloonPopGame = () => {
  const navigate = useNavigate();
  const { markLearningGameComplete } = useDyscalculiaFlow();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [engagementMode, setEngagementMode] = useState(MODE.DEFAULT);

  const [gameStarted, setGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);

  const playNumberAudio = useCallback(async (number) => {
    try {
      const audio = new Audio(audioMap[number]);
      await audio.play();
    } catch {
      // Fallback to speech synthesis
      const utterance = new SpeechSynthesisUtterance(number.toString());


      utterance.lang = 'si-LK';
      speechSynthesis.speak(utterance);
    }
  }, []);

  const playPositiveSound = useCallback(async () => {
    // Keep existing audio system (lightweight positive chime)
    try {
      const audio = new Audio(audioMap[5] || number5Audio);
      await audio.play();
    } catch {
      // ignore
    }
  }, []);


  const playRetrySound = useCallback(async () => {
    // Gentle retry sound fallback
    try {
      const audio = new Audio(audioMap[1] || number1Audio);
      await audio.play();
    } catch {
      // ignore
    }
  }, []);


  const getSinhalaNumberText = useCallback((n) => {
    // Simple mapping (game targets are 1..10)
    const map = {
      0: 'හිස්',
      1: 'එක',
      2: 'දෙක',
      3: 'තුන',
      4: 'හතර',
      5: 'පහ',
      6: 'හය',
      7: 'හත',
      8: 'අට',
      9: 'නවය',
      10: 'දහය',
    };
    return map[n] || n.toString();
  }, []);

  const generateTarget = useCallback(() => {
    const targetNumber = Math.floor(Math.random() * 10) + 1; // 1..10
    return {
      targetNumber,
      targetText: getSinhalaNumberText(targetNumber),
    };
  }, [getSinhalaNumberText]);

  const generateNonOverlappingPositions = useCallback((count) => {
    const positions = [];
    const maxAttempts = 500;
    let attempts = 0;

    while (positions.length < count && attempts < maxAttempts) {
      attempts += 1;

      // keep balloons apart; coordinates tuned for existing CSS layout
      const x = Math.random() * 80 + 10; // 10% to 90%
      const y = Math.random() * 58 + 18; // 18% to 76%

      const tooClose = positions.some((pos) => Math.hypot(pos.x - x, pos.y - y) < 14);
      if (!tooClose) positions.push({ x, y });
    }

    // Fallback (in rare cases). If we couldn't place all without collisions,
    // return whatever we got; UI still renders.
    return positions;
  }, []);

  const pickObjectsForCount = useCallback((count) => {
    // Create an object list of length `count` without using written digits.
    // Shuffle from OBJECTS and repeat as needed.
    const result = [];
    while (result.length < count) {
      const obj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
      result.push(obj);
    }
    return result;
  }, []);

  // Generate balloons so exactly one balloon contains the correct quantity.
  // Each balloon shows a group of objects (stars/fruits/candies/etc.)
  // count == quantity.
  const generateBalloonsForTarget = useCallback((targetNumber) => {
    const balloonCount = 6;
    const positions = generateNonOverlappingPositions(balloonCount);

    const correctIndex = Math.floor(Math.random() * balloonCount);

    const newBalloons = [];
    let wrongIndex = 0;

    for (let i = 0; i < balloonCount; i++) {
      if (!positions[i]) break;

      const quantity = i === correctIndex
        ? targetNumber
        : (() => {
            // generate wrong quantity distinct from target
            // keep within 1..10 range for consistent counting
            let q;
            do {
              const delta = Math.floor(Math.random() * 6) + 1; // 1..6
              q = Math.random() > 0.5 ? targetNumber + delta : targetNumber - delta;
            } while (q <= 0 || q > 10 || q === targetNumber);
            wrongIndex += 1;
            return q;
          })();

      newBalloons.push({
        id: i === correctIndex ? 'correct' : `wrong-${wrongIndex}`,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        quantity,
        objects: pickObjectsForCount(quantity),
        x: positions[i].x,
        y: positions[i].y,
        isCorrect: i === correctIndex,
      });
    }

    return newBalloons;
  }, [generateNonOverlappingPositions, pickObjectsForCount]);

  const startGame = useCallback(() => {
    setGameStarted(true);

    // engagement mode: respect reduced-motion; calm mode can be added later
    setEngagementMode(getEngagementMode({ explicitMode: MODE.DEFAULT }));

    const q = generateTarget();
    setCurrentQuestion(q);

    setBalloons(generateBalloonsForTarget(q.targetNumber));
    setQuestionStartTime(Date.now());

    // speak target number
    playNumberAudio(q.targetNumber);
  }, [generateTarget, generateBalloonsForTarget, playNumberAudio]);


  const handleBalloonClick = useCallback(
    (balloon) => {
      if (showFeedback || !currentQuestion) return;

      setShowFeedback(true);
      setShake(false);

      const responseTimeMs = questionStartTime ? Date.now() - questionStartTime : 0;
      const updatedResponseTimes = [...responseTimes, responseTimeMs];
      setResponseTimes(updatedResponseTimes);

      const correct = balloon.isCorrect;
      const nextScore = correct ? score + 10 : score;

      // Adaptive emotional copy (soft encouragement on incorrect)
      const severityLevel = 'Mild';
      const weakCount = 0;

      const msg = getMotivationalMessageSi({
        correct,
        severityLevel,
        streak: 0,
        weakCount,
      });


      setFeedbackType(correct ? 'success' : 'wrong');
      setFeedbackMessage(msg);

      const { showConfetti, showShake } = (() => {
        // local mini-variant based on reduced-motion
        const reduced = engagementMode === MODE.REDUCED_MOTION;
        return {
          showConfetti: correct && !reduced,
          showShake: !correct && !reduced,
        };
      })();


      if (correct) {
        setScore(nextScore);
        setShowConfetti(showConfetti);
        if (showConfetti) setTimeout(() => setShowConfetti(false), engagementMode === MODE.REDUCED_MOTION ? 1200 : 2000);

        playPositiveSound();
      } else {
        setShake(showShake);
        playRetrySound();
      }


      // Save game session data
      saveGameSession({
        gameType: 'balloon-pop-quantity',
        playedAt: new Date().toISOString(),
        targetNumber: currentQuestion.targetNumber,
        correct,
        attempts: 1,
        responseTime: responseTimeMs,
        completed: true,
      });

      const reduced = engagementMode === MODE.REDUCED_MOTION;
      const transitionDelay = reduced ? 1400 : 2000;

      setTimeout(() => {
        const nextQuestionCount = questionCount + 1;
        setShowFeedback(false);
        setShake(false);
        setQuestionCount(nextQuestionCount);

        if (nextQuestionCount >= 10) {
          const averageResponseTimeMs = updatedResponseTimes.length
            ? updatedResponseTimes.reduce((sum, value) => sum + value, 0) / updatedResponseTimes.length
            : responseTimeMs;

          markLearningGameComplete({
            activityId: 'balloon-pop',
            accuracy: nextScore / 100,
            averageResponseTimeMs,
          });

          navigate('/dyscalculia/dashboard');
        } else {
          const newQ = generateTarget();
          setCurrentQuestion(newQ);
          setBalloons(generateBalloonsForTarget(newQ.targetNumber));
          setQuestionStartTime(Date.now());

          playNumberAudio(newQ.targetNumber);
        }
      }, transitionDelay);

    },
    [
      showFeedback,
      currentQuestion,
      questionStartTime,
      responseTimes,
      score,
      questionCount,
      navigate,
      markLearningGameComplete,
      generateTarget,
      generateBalloonsForTarget,
      playNumberAudio,
      playPositiveSound,
      playRetrySound,
      engagementMode,
      feedbackMessage,
      feedbackType,
    ]
  );


  const renderedBalloons = useMemo(() => {
    return balloons.map((balloon) => (
      <button
        key={balloon.id}
        className={`balloon balloon-${balloon.color} ${showFeedback ? 'paused' : ''} ${shake && !balloon.isCorrect ? 'shaking' : ''}`}
        style={{
          left: `${balloon.x}%`,
          top: `${balloon.y}%`,
        }}
        onClick={() => handleBalloonClick(balloon)}
        aria-label={`Balloon group quantity ${balloon.quantity}`}
      >
        <span className="balloon-objects" aria-hidden="true">
          {balloon.objects.map((obj, idx) => (
            <span key={`${balloon.id}-${idx}`} className="balloon-obj">
              {obj}
            </span>
          ))}
        </span>
      </button>
    ));
  }, [balloons, showFeedback, handleBalloonClick, shake]);

  return (
    <div className="balloon-pop-game">
      <BackButton onClick={() => navigate('/dyscalculia')} />

      {!gameStarted ? (
        <div className="game-intro">
          <h1>බුබුළු පොප් කරමු 🎈</h1>
          <p>සංඛ්‍යාවක් (පහ, හතර, හය...) කියන විට එම QUANTITY එක ඇති බුබුළු තෝරන්න!</p>
          <button className="start-button" onClick={startGame}>
            ආරම්භ කරන්න
          </button>
        </div>
      ) : (
        <>
          <div className="game-header">
            <div className="question-display">
              <h2 className="target-number">{currentQuestion?.targetNumber}</h2>
              <div className="target-sinhala">{currentQuestion?.targetText}</div>
            </div>
            <div className="score-display">ලකුණු: {score}</div>
          </div>

          <div className="balloon-container">{renderedBalloons}</div>

          <ChildFeedbackOverlay
            open={showFeedback}
            correct={feedbackType === 'success'}
            mode={engagementMode}
            message={feedbackMessage}
            onDone={() => {
              // keep auto-close behavior handled by timer; close overlay immediately if user taps
              setShowFeedback(false);
            }}
          />


          {showConfetti && (
            <div className="confetti-container">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'][
                      Math.floor(Math.random() * 6)
                    ],
                  }}
                />
              ))}
            </div>
          )}

          {/* sparkle burst can be done with CSS on the success overlay container */}
        </>
      )}
    </div>
  );
};

export default BalloonPopGame;

