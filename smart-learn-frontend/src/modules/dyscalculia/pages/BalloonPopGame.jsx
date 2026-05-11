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
  return correct ? 'ලස්සනයි! නිවැරදියි!' : 'උත්සාහ කරන්න! නැවත උත්සාහ කරමු!';
};

const ChildFeedbackOverlay = ({ open, correct, message, onDone }) => {
  if (!open) return null;
  if (correct) return null;
  return (
    <div className={`feedback-overlay ${correct ? 'success' : 'wrong'}`}>
      <div className="feedback-card">
        <div className="text-sm font-black uppercase tracking-[0.25em] text-amber-500">
          {correct ? 'Correct' : 'Try Again'}
        </div>
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

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(760, ctx.currentTime + 0.06);
      gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.26);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.06);
      osc2.stop(ctx.currentTime + 0.28);

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
      setTimeout(() => setShowStarReward(false), 1600);
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
    <div className="balloon-pop-game relative min-h-screen overflow-hidden bg-slate-100">

      <button className="child-back-button relative z-10 transition-transform duration-150 hover:scale-105" onClick={() => navigate('/dyscalculia')}>
        ← පසුපස
      </button>

      {!gameStarted ? (
        <div className="game-intro relative z-10">
          <div className="intro-card w-full max-w-4xl rounded-[2.5rem] border border-white/70 bg-white/70 p-0 text-center shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl ring-1 ring-amber-200/60">
            <div className="rounded-[2.4rem] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,237,0.9))] px-8 py-10 md:px-12 md:py-12 lg:px-16">
              <div className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-full border border-amber-200/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-amber-600 shadow-sm">
                <span className="block h-2.5 w-2.5 rounded-full bg-amber-400" />
                Balloon Pop
                <span className="block h-2.5 w-2.5 rounded-full bg-sky-400" />
              </div>

              <div className="mx-auto mb-7 grid max-w-sm grid-cols-3 gap-3">
                {[imgBaloon, imgApple, imgLion].map((src, index) => (
                  <div key={index} className="flex aspect-square items-center justify-center rounded-3xl border border-white/80 bg-white/80 shadow-[0_16px_30px_rgba(251,191,36,0.12)] backdrop-blur">
                    <img src={src} alt="game preview" className="h-16 w-16 object-contain md:h-20 md:w-20" draggable={false} />
                  </div>
                ))}
              </div>

              <h1 className="bg-[linear-gradient(135deg,#ea580c_0%,#f43f5e_48%,#2563eb_100%)] bg-clip-text text-[clamp(2rem,5vw,3.25rem)] font-black tracking-tight text-transparent">
                බුබුළු පොප් ක්‍රීඩාව
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-slate-700 md:text-lg">
                අංකය අහන්න. ඉන්පසු <strong className="font-black text-slate-900">නිවැරදි ප්‍රමාණයේ වස්තු</strong> ඇති බුබුල තෝරන්න.
              </p>

              {/* <div className="mt-8 rounded-[2rem] border border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.9),rgba(255,255,255,0.8))] p-4 shadow-inner shadow-amber-100/70">
                <div className="grid gap-3 text-left md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.22em] text-amber-500">උදාහරණය</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">&quot;හතර&quot;</div>
                  </div>
                  <div className="justify-self-center text-2xl font-black text-slate-400">→</div>
                  <div className="flex items-center justify-center gap-2 md:justify-end">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-100 bg-white shadow-sm md:h-14 md:w-14">
                        <img src={imgApple} alt="example object" className="h-7 w-7 object-contain md:h-8 md:w-8" draggable={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div> */}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-600">
                <div className="rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2">අහන්න</div>
                <div className="rounded-full border border-rose-100 bg-rose-50/80 px-4 py-2">ගණන් කරන්න</div>
                <div className="rounded-full border border-emerald-100 bg-emerald-50/80 px-4 py-2">නිවැරදි බුබුල තෝරන්න</div>
              </div>

              {score > 0 && (
                <div className="final-score mt-6 rounded-full border border-amber-200/80 bg-amber-100/90 px-5 py-3 text-lg font-black text-amber-900 shadow-sm animate-pulse">
                  ඔයාගේ ලකුණු: {score}
                </div>
              )}

              <button className="start-button mt-8 w-full rounded-full bg-[linear-gradient(135deg,#f97316_0%,#fb7185_52%,#ef4444_100%)] px-6 py-4 text-lg font-black tracking-wide text-white shadow-[0_16px_32px_rgba(244,63,94,0.28)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_22px_38px_rgba(244,63,94,0.35)]" onClick={startGame}>
                {score > 0 ? 'නැවත ආරම්භ කරන්න' : 'ක්‍රීඩාව ආරම්භ කරන්න'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="game-stage-layout relative z-10">
            <aside className="question-panel ring-4 ring-cyan-100/80 shadow-xl shadow-cyan-200/30">
              <div className="question-panel-title text-violet-700">අද අංකය</div>
              <div className="target-badge target-badge-large shadow-lg">
                <span className="target-number target-number-large">{currentQuestion?.targetNumber}</span>
                <span className="target-sinhala target-sinhala-large">{currentQuestion?.targetText}</span>
              </div>
              <button className="replay-audio replay-audio-large transition-transform duration-150 hover:scale-105" onClick={() => playNumberAudio(currentQuestion?.targetNumber)}>
                නැවත අහන්න
              </button>

              <div className="question-panel-stats">
                <div className="score-display shadow-md">ලකුණු {score}</div>
                <div className="question-counter shadow-md">ප්‍රශ්න {questionCount + 1}/5</div>
              </div>
            </aside>

            <section className="balloon-stage rounded-3xl border-2 border-white/50 bg-white/20 p-2 shadow-xl backdrop-blur-[1px]" aria-label="balloon play area">
              <div className="balloon-container">
                {renderedBalloons}
              </div>
            </section>
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
              <div className="star-reward-center-glow">✨</div>
              <span className="star-reward s1">⭐</span>
              <span className="star-reward s2">✨</span>
              <span className="star-reward s3">⭐</span>
              <span className="star-reward s4">✨</span>
              <span className="star-reward s5">⭐</span>
              <span className="star-reward s6">✨</span>
              <span className="star-reward s7">⭐</span>
              <span className="star-reward s8">✨</span>
              <span className="star-reward s9">⭐</span>
              <span className="star-reward s10">✨</span>
            </div>
          )}

          {showConfetti && (
            <div className="confetti-container pointer-events-none">
              {[...Array(60)].map((_, i) => (
                <div key={i} className="confetti-piece rounded-sm" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.4}s`, backgroundColor: ['#FFB347', '#FF6B6B', '#4ECDC4', '#FFE66D', '#C44569'][i % 5] }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BalloonPopGame;