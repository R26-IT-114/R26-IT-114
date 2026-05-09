import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThreeLetterWordsGame.css';
import imgPahana  from '../../../assets/images/pahana.png';
import imgWataya  from '../../../assets/images/wataya.png';
import imgSarama  from '../../../assets/images/sarama.png';
import imgBasaya  from '../../../assets/images/basaya.png';
import imgWayasa  from '../../../assets/images/wayasa.png';
import imgAhasa   from '../../../assets/images/ahasa.jpg';
import imgMahatha from '../../../assets/images/mahatha.png';
import audioAhasa from '../../../assets/audio/ahasa.wav';
import audioBasaya from '../../../assets/audio/basaya.wav';
import audioWayasa from '../../../assets/audio/wayasa.wav';

const WORDS = [
  { text: 'බසය', pronunciation: 'basaya',  image: imgBasaya, audio: audioBasaya },
  { text: 'අහස', pronunciation: 'ahasa',   image: imgAhasa, audio: audioAhasa }, 
  { text: 'වයස', pronunciation: 'wayasa',  image: imgWayasa, audio: audioWayasa },
  { text: 'පහන', pronunciation: 'pahana',  image: imgPahana  },
  { text: 'වටය', pronunciation: 'wataya',  image: imgWataya  },
  { text: 'සරම', pronunciation: 'sarama',  image: imgSarama  },
  { text: 'මහත', pronunciation: 'mahatha', image: imgMahatha },
];


const speakWord = (word) => {
  if (!window.speechSynthesis) return;
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

const ThreeLetterWordsGame = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [completedWords, setCompletedWords] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  const currentWord = WORDS[currentIndex];

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

  const hasDrawnEnough = (minPixels = 700) => {
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
    if (hasDrawnEnough(700)) {
      setSuccess(true);
      setShowRetry(false);
      playSuccessSound();
      if (!completedWords.includes(currentIndex)) {
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
  };

  if (gameFinished) {
    return (
      <div className="three-letter-game">
        <div className="game-complete-card">
          <div className="complete-emoji">🎉✨🏆✨🎉</div>
          <h2>නියමයි! අකුරු තුනේ වචන සියල්ලම ලිව්වා!</h2>
          <p>තරු තුනක් හිමි වේ ⭐⭐⭐</p>
          <button className="game-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🔙 මුල් පිටුවට</button>
          <button className="game-reset-btn" onClick={resetGame}>🔄 නැවත පුහුණු වන්න</button>
        </div>
      </div>
    );
  }

  return (
    <div className="three-letter-game">
      <div className="word-game-header">
        <button className="back-home-btn" onClick={() => navigate('/dysgraphia/word-game')}>🏠 මුල් පිටුව</button>
        <div className="progress-badge">
          📖 {currentIndex + 1} / {WORDS.length}
        </div>
      </div>

      <div className="game-main-grid">
        <div className="word-card">
          <div className="word-sinhala">{currentWord.text}</div>
          {/* <div className="word-meaning">({currentWord.meaning})</div> */}
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
              😢 තව ටිකක් පැහැදිලිව ලියන්න. නැවත උත්සාහ කරන්න!
            </div>
          )}
        </div>

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
            <button className="check-btn" onClick={handleCheck}>✅ පරීක්ෂා කරන්න</button>
          </div>
          {success && currentIndex + 1 < WORDS.length && (
            <button className="next-btn" onClick={nextWord}>✨ ඊළඟ වචනය ✨</button>
          )}
          {success && currentIndex + 1 === WORDS.length && (
            <button className="next-btn" onClick={nextWord}>🏁 අවසන් කරන්න</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreeLetterWordsGame;