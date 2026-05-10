import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TwoLetterWordsGame.css';
import imgYata from '../../../assets/images/yata.png';
import imgUla from '../../../assets/images/ula.png';
import imgRata from '../../../assets/images/rata.png';
import imgBata from '../../../assets/images/bata.png';
import imgGasa from '../../../assets/images/gasa.png';
import imgDara from '../../../assets/images/dhara.png';
import imgMala from '../../../assets/images/mala.png';
import imgMama from '../../../assets/images/mama.png';
import introWordAudio from '../../../assets/audio/word.mp3';
import audioBata from '../../../assets/audio/bata.wav';
import audioGasa from '../../../assets/audio/gasa.wav';
import audioDara from '../../../assets/audio/dara.wav';
import audioMala from '../../../assets/audio/mala.wav';

// Import reward components
import DysgraphiaRewardBox from '../components/DysgraphiaRewardBox';
import { useDysgraphiaRewards } from '../hooks/useDysgraphiaRewards';

// ========== Word list (2‑letter Sinhala words) ==========
const WORDS = [
  { text: 'බට', pronunciation: 'bata', image: imgBata, audio: audioBata }, 
  { text: 'ගස', pronunciation: 'gasa', image: imgGasa, audio: audioGasa },
  { text: 'දර', pronunciation: 'dara', image: imgDara, audio: audioDara },
  { text: 'මල', pronunciation: 'mala', image: imgMala, audio: audioMala }, 
  { text: 'යට', pronunciation: 'yata' , image: imgYata },
  { text: 'උල', pronunciation: 'ula', image: imgUla },
  { text: 'රට', pronunciation: 'rata', image: imgRata },
  { text: 'මම', pronunciation: 'mama', image: imgMama },
];

// ========== Helper: speak word using Web Speech API ==========
const speakWord = (word) => {
  if (!window.speechSynthesis) {
    alert("Your browser doesn't support speech synthesis.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'si-LK';
  utterance.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const playWordAudio = (word) => {
  if (word.audio) {
    const clip = new Audio(word.audio);
    clip.play().catch(() => {
      speakWord(word.text);
    });
    return;
  }
  speakWord(word.text);
};

// ========== Sound effects ==========
const playSuccessSound = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
    osc.start(audioCtx.currentTime + i * 0.1);
    osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
  });
};

const playErrorSound = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 300;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.3);
};

const TwoLetterWordsGame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [completedWords, setCompletedWords] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const introAudioRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  // Reward system
  const { totalStars, rewardPulse, awardStars } = useDysgraphiaRewards();
  const rewardedWordRef = useRef(false);

  const currentWord = WORDS[currentIndex];

  const playIntroAudio = () => {
    if (!introAudioRef.current) {
      introAudioRef.current = new Audio(introWordAudio);
      introAudioRef.current.volume = 0.9;
    }

    const audio = introAudioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    playIntroAudio();

    return () => {
      const audio = introAudioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#5c51d4';
    ctx.lineWidth = 8;
    ctxRef.current = ctx;
    clearCanvas();
  }, [currentIndex]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSuccess(false);
    setShowRetry(false);
  };

  // Drawing handlers
  const startDrawing = (e) => {
    const pos = getCanvasPos(e);
    if (!pos) return;
    isDrawing.current = true;
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const pos = getCanvasPos(e);
    if (!pos) return;
    const ctx = ctxRef.current;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Check if they drew enough pixels
  const hasDrawnEnough = (minPixels = 500) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let drawnPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 100) drawnPixels++;
    }
    return drawnPixels > minPixels;
  };

  const handleCheck = () => {
    if (hasDrawnEnough(600)) {
      setSuccess(true);
      setShowRetry(false);
      playSuccessSound();

      // Award star only once per word
      if (!completedWords.includes(currentIndex) && !rewardedWordRef.current) {
        awardStars(1);
        rewardedWordRef.current = true;
        const newCompleted = [...completedWords, currentIndex];
        setCompletedWords(newCompleted);
        if (newCompleted.length === WORDS.length) {
          setGameFinished(true);
        }
      } else if (!completedWords.includes(currentIndex)) {
        // Still mark as completed if star already awarded (defensive)
        const newCompleted = [...completedWords, currentIndex];
        setCompletedWords(newCompleted);
        if (newCompleted.length === WORDS.length) {
          setGameFinished(true);
        }
      }
    } else {
      setShowRetry(true);
      setSuccess(false);
      playErrorSound();
    }
  };

  const nextWord = () => {
    if (currentIndex + 1 < WORDS.length) {
      setCurrentIndex(currentIndex + 1);
      setSuccess(false);
      setShowRetry(false);
      rewardedWordRef.current = false; // reset for new word
    } else {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setCompletedWords([]);
    setGameFinished(false);
    setSuccess(false);
    setShowRetry(false);
    rewardedWordRef.current = false;
  };

  if (gameFinished) {
    return (
      <div className="word-game-container">
        <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
        <div className="game-complete-card">
          <div className="complete-emoji">🎉✨🏆✨🎉</div>
          <h2>අපූරුයි! ඔබ සියලු වචන සම්පූර්ණ කළා!</h2>
          <p>ඔබට තරු 3ක් හිමි වේ ⭐⭐⭐</p>
          <button className="game-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🔙 මුල් පිටුවට</button>
          <button className="game-reset-btn" onClick={resetGame}>🔄 නැවත පුහුණු වන්න</button>
        </div>
      </div>
    );
  }

  return (
    <div className="word-game-container">
      <DysgraphiaRewardBox totalStars={totalStars} rewardPulse={rewardPulse} />
      <div className="word-game-header">
        <button className="back-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🏠 මුල් පිටුව</button>
        <div className="progress-badge">
          📖 {currentIndex + 1} / {WORDS.length}
        </div>
        <button className="audio-btn" onClick={playIntroAudio}>
          🔊 උපදෙස් අහන්න
        </button>
      </div>

      <div className="game-main-grid">
        {/* Left: Word display & audio */}
        <div className="word-card">
          <div className="word-sinhala">{currentWord.text}</div>
          <button className="audio-btn" onClick={() => playWordAudio(currentWord)}>
            🔊 අහන්න
          </button>
          {currentWord.image && (
            <div className="word-image-wrap">
              <img
                className="word-image"
                src={currentWord.image}
                alt={currentWord.text}
                loading="lazy"
              />
            </div>
          )}
          {success && (
            <div className="success-stars">
              <span>⭐</span><span>⭐</span><span>⭐</span>
              <div className="success-message">නියමයි! 🎉</div>
            </div>
          )}
          {showRetry && (
            <div className="retry-message">
              තව ටිකක් හොඳට ලියන්න. නැවත උත්සාහ කරන්න!
            </div>
          )}
        </div>

        {/* Right: Drawing area */}
        <div className="drawing-card">
          <h3>✏️ මෙතන ලියන්න</h3>
          <canvas
            ref={canvasRef}
            className="word-drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="drawing-buttons">
            <button className="clear-btn" onClick={clearCanvas}>🗑️ මකන්න</button>
            <button className="check-btn" onClick={handleCheck}> පරීක්ෂා කරන්න</button>
          </div>
          {success && currentIndex + 1 < WORDS.length && (
            <button className="next-btn" onClick={nextWord}> ඊළඟ වචනය </button>
          )}
          {success && currentIndex + 1 === WORDS.length && (
            <button className="next-btn" onClick={nextWord}>අවසන් කරන්න</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoLetterWordsGame;