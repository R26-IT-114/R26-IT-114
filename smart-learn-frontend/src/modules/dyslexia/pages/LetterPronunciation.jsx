
import FloatingJungleAnimals from '../components/FloatingJungleAnimals';import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sinhalaLetters } from '../utils/sinhalaLetters';

/* ─── Inline styles as a style tag injected once ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body { font-family: 'Baloo 2', cursive; }

    /* Floating stars background */
    .stars-bg {
      position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
    }
    .star {
      position: absolute;
      border-radius: 50%;
      opacity: 0.6;
      animation: floatStar linear infinite;
    }

    /* Page wrapper */
    .page {
      min-height: 100vh;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      overflow: hidden;
      z-index: 1;
    }

    /* Card */
    .card {
      background: #fff;
      border-radius: 32px;
      padding: 36px 32px;
      width: 100%;
      max-width: 520px;
      position: relative;
      z-index: 2;
      box-shadow: 0 8px 0 #c084fc, 0 16px 40px rgba(0,0,0,0.18);
      border: 4px solid #f0abfc;
      text-align: center;
    }

    /* Mascot */
    .mascot {
      font-size: 64px;
      display: block;
      animation: mascotBob 2.5s ease-in-out infinite;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
      margin-bottom: 8px;
      line-height: 1;
    }

    /* Letter box */
    .letter-box {
      width: 160px; height: 160px;
      margin: 0 auto 20px;
      border-radius: 28px;
      background: linear-gradient(135deg, #fef08a 0%, #fde68a 100%);
      border: 5px solid #fbbf24;
      display: flex; align-items: center; justify-content: center;
      font-size: 96px;
      font-weight: 800;
      color: #be185d;
      box-shadow: 0 6px 0 #f59e0b, 0 12px 24px rgba(0,0,0,0.12);
      transition: transform 0.15s;
      position: relative;
    }
    .letter-box.celebrate {
      animation: letterPop 0.5s cubic-bezier(.36,1.56,.64,1) forwards;
    }
    .letter-box.wrong {
      animation: letterShake 0.4s ease forwards;
    }

    /* Progress bar */
    .progress-wrap {
      background: #fce7f3;
      border-radius: 99px;
      height: 18px;
      width: 100%;
      margin-bottom: 20px;
      border: 2px solid #f9a8d4;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, #f472b6 0%, #c084fc 100%);
      transition: width 0.5s cubic-bezier(.4,0,.2,1);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 20px;
      border: 3px solid rgba(255,255,255,0.6);
      font-family: 'Baloo 2', cursive;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 0 rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.1);
      outline: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .btn:active { transform: translateY(3px) scale(0.97); box-shadow: 0 1px 0 rgba(0,0,0,0.18); }
    .btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.04); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    .btn-mic   { background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); }
    .btn-retry { background: linear-gradient(135deg, #fb923c 0%, #f43f5e 100%); }
    .btn-skip  { background: linear-gradient(135deg, #34d399 0%, #06b6d4 100%); }
    .btn-start { background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); font-size: 22px; padding: 18px 40px; }
    .btn-play  { background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); }
    .btn-home  { background: linear-gradient(135deg, #34d399 0%, #06b6d4 100%); }

    /* Feedback bubble */
    .feedback-bubble {
      border-radius: 18px;
      padding: 14px 18px;
      margin: 14px 0;
      font-size: 20px;
      font-weight: 700;
      border: 3px solid;
      animation: popIn 0.3s cubic-bezier(.36,1.56,.64,1);
    }
    .feedback-bubble.good  { background: #d1fae5; border-color: #34d399; color: #065f46; }
    .feedback-bubble.bad   { background: #fee2e2; border-color: #f87171; color: #991b1b; }
    .feedback-bubble.info  { background: #ede9fe; border-color: #c084fc; color: #5b21b6; }

    /* Score stars row */
    .score-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 22px; font-weight: 700; color: #be185d;
    }

    /* Confetti pieces */
    .confetti-piece {
      position: fixed;
      width: 12px; height: 12px;
      border-radius: 3px;
      pointer-events: none;
      z-index: 999;
      animation: confettiFall 1.2s ease-in forwards;
    }

    /* Result card extras */
    .result-emoji { font-size: 80px; animation: mascotBob 1.5s ease-in-out infinite; display: block; }
    .result-score { font-size: 52px; font-weight: 800; background: linear-gradient(135deg,#f472b6,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .result-pct   { font-size: 28px; font-weight: 700; color: #34d399; }

    /* Listening pulse ring */
    .mic-ring {
      display: inline-block;
      border-radius: 99px;
      animation: micPulse 1s ease-in-out infinite;
    }

    /* Heading styles */
    .game-title { font-size: 28px; font-weight: 800; color: #be185d; margin-bottom: 4px; }
    .hint-text  { font-size: 16px; color: #78716c; margin-bottom: 18px; font-weight: 600; }
    .heard-text { font-size: 14px; color: #92400e; background:#fef3c7; border-radius:10px; padding:8px 12px; margin-top:8px; font-style: italic; }

    /* ── Animations ── */
    @keyframes floatStar {
      0%   { transform: translateY(110vh) rotate(0deg); opacity: 0; }
      10%  { opacity: 0.6; }
      90%  { opacity: 0.6; }
      100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
    }
    @keyframes mascotBob {
      0%,100% { transform: translateY(0) rotate(-3deg); }
      50%      { transform: translateY(-10px) rotate(3deg); }
    }
    @keyframes letterPop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.22) rotate(6deg); }
      70%  { transform: scale(0.92) rotate(-4deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes letterShake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-10px); }
      40%     { transform: translateX(10px); }
      60%     { transform: translateX(-8px); }
      80%     { transform: translateX(8px); }
    }
    @keyframes popIn {
      0%   { transform: scale(0.7); opacity: 0; }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes confettiFall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(60vh) rotate(720deg); opacity: 0; }
    }
    @keyframes micPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(244,114,182,0.5); }
      50%      { box-shadow: 0 0 0 14px rgba(244,114,182,0); }
    }
  `}</style>
);

/* ─── Floating stars background ─── */
const STAR_COLORS = ['#fbbf24','#f472b6','#c084fc','#34d399','#60a5fa','#fb923c'];
const STARS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 8 + Math.random() * 14,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${6 + Math.random() * 8}s`,
  color: STAR_COLORS[i % STAR_COLORS.length],
}));

const StarsBg = () => (
  <div className="stars-bg" aria-hidden="true">
    {STARS.map(s => (
      <div key={s.id} className="star" style={{
        width: s.size, height: s.size,
        left: s.left, bottom: '-20px',
        background: s.color,
        animationDuration: s.duration,
        animationDelay: s.delay,
      }} />
    ))}
  </div>
);

/* ─── Confetti burst ─── */
const CONF_COLORS = ['#f472b6','#fbbf24','#34d399','#60a5fa','#c084fc','#fb923c'];
const ConfettiBurst = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${20 + Math.random() * 60}%`,
    top: `${10 + Math.random() * 40}%`,
    color: CONF_COLORS[i % CONF_COLORS.length],
    delay: `${Math.random() * 0.3}s`,
    rotate: `${Math.random() * 360}deg`,
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: p.left, top: p.top,
          background: p.color,
          animationDelay: p.delay,
          transform: `rotate(${p.rotate})`,
        }} />
      ))}
    </>
  );
};

/* ─── Mascots per letter index (cycles) ─── */
const MASCOTS = ['🐻','🐸','🦊','🐨','🐼','🦁','🐯','🐧','🦋','🐬','🦄','🐙'];

/* ═══════════════════════════════════════════════════════════ */
const LetterPronunciation = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const celebrationTimer = useRef(null);

  const [gameStarted,   setGameStarted]   = useState(false);
  const [gameFinished,  setGameFinished]  = useState(false);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [score,         setScore]         = useState(0);
  const [listening,     setListening]     = useState(false);
  const [feedback,      setFeedback]      = useState('');
  const [feedbackType,  setFeedbackType]  = useState('info'); // good | bad | info
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCorrect,     setIsCorrect]     = useState(null);
  const [recognized,    setRecognized]    = useState('');
  const [letterAnim,    setLetterAnim]    = useState(''); // 'celebrate' | 'wrong' | ''

  /* Speech API init */
  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback('❌ ඔබගේ බ්‍රවුසරය ශබ්ද ස්වීකරණ සඳහා සහාය නොදක්වයි');
      setFeedbackType('bad');
      return;
    }
    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.continuous = false;
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart  = () => { setListening(true); setFeedback('🎤 ඉඩ ගන අසන්න...'); setFeedbackType('info'); setRecognized(''); };
    r.onresult = (e) => {
      if (e.results?.length > 0) {
        const t = e.results[0][0].transcript.toLowerCase().trim();
        setRecognized(t);
        checkPronunciation(t);
      }
    };
    r.onerror  = (e) => {
      setListening(false);
      const msgs = {
        'no-speech':      '😅 ශබ්ගයක් ඇසුනේ නෑ! නැවතත් කතා කරන්න!',
        'network':        '📶 ජාල සංයෝජනය බලන්න',
        'not-allowed':    '🎤 මයික්‍රෝෆෝනය අවසර දෙන්න!',
        'audio-capture':  '🎙️ මයික්‍රෝෆෝනය සොයාගත නොහැකිය',
      };
      setFeedback(msgs[e.error] || '❌ ශබ්ද ස්වීකරණ දෝෂය');
      setFeedbackType('bad');
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    return () => recognitionRef.current?.abort();
  }, []);

  const checkPronunciation = (transcript) => {
    const letter = sinhalaLetters[currentIndex];
    const isMatch = letter.accepted.some((a) => {
      const t = transcript.toLowerCase().trim();
      const ac = a.toLowerCase().trim();
      return t === ac || t.includes(ac) || ac.includes(t) || t.startsWith(ac) || ac.startsWith(t);
    });

    if (isMatch) {
      setIsCorrect(true);
      setScore(p => p + 1);
      setFeedback('🎉 හරිම හොඳයි! ගොඩාක් හොඳයි!');
      setFeedbackType('good');
      setLetterAnim('celebrate');
      setShowCelebration(true);
      celebrationTimer.current = setTimeout(() => {
        setShowCelebration(false);
        setLetterAnim('');
        moveToNextLetter();
      }, 1600);
    } else {
      setIsCorrect(false);
      setFeedback(`😮 නැහැ! නැවතත් උත්සාහ කරන්න!`);
      setFeedbackType('bad');
      setLetterAnim('wrong');
      setTimeout(() => setLetterAnim(''), 500);
    }
  };

  const moveToNextLetter = () => {
    setIsCorrect(null);
    setRecognized('');
    setFeedback('');
    if (currentIndex < sinhalaLetters.length - 1) {
      setCurrentIndex(p => p + 1);
    } else {
      setGameFinished(true);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
    }
  };

  const skipLetter = () => {
    setIsCorrect(null);
    setRecognized('');
    setFeedback('');
    setLetterAnim('');
    if (currentIndex < sinhalaLetters.length - 1) {
      setCurrentIndex(p => p + 1);
    } else {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setFeedback('');
    setFeedbackType('info');
    setRecognized('');
    setIsCorrect(null);
    setLetterAnim('');
    setShowCelebration(false);
  };

  const accuracy = Math.round((score / sinhalaLetters.length) * 100);
  const getGrade = () => {
    if (accuracy === 100) return { emoji: '🏆', msg: 'ඔබ සුපිරිම ය! ශූරයා ඔබ!' };
    if (accuracy >= 87)  return { emoji: '🌟', msg: 'හොඳ! ඔබ දක්ෂ ය!' };
    if (accuracy >= 75)  return { emoji: '⭐', msg: 'හොඳ උත්සාහය! ගොඩ දෙයක් ඉගෙනගත්තා!' };
    return { emoji: '💪', msg: 'නැවතත් ක්‍රීඩා කර ලකුණු ලබාගන්න!' };
  };

  /* ── BG gradient by screen ── */
  const startBg  = 'linear-gradient(160deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)';
  const gameBg   = 'linear-gradient(160deg, #d1fae5 0%, #dbeafe 50%, #fce7f3 100%)';
  const resultBg = 'linear-gradient(160deg, #fef9c3 0%, #fce7f3 50%, #ede9fe 100%)';

  const mascot = MASCOTS[currentIndex % MASCOTS.length];

  /* ══════════════════════════ START SCREEN ══════════════════════════ */
  if (!gameStarted) return (
    <>
      <GlobalStyles />
      <div className="page" style={{ background: startBg }}>
        <StarsBg />
        <FloatingJungleAnimals />
        <div className="card" style={{ maxWidth: 460 }}>
          <span className="mascot">🦁</span>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#be185d', marginBottom: 6 }}>
            අකුරු කියමු!
          </h1>
          <p style={{ fontSize: 17, color: '#78716c', fontWeight: 600, marginBottom: 8 }}>
            සිංහල අකුරු කතා කරන ක්‍රීඩාව
          </p>
          <div style={{ fontSize: 40, margin: '16px 0', letterSpacing: 6 }}>
            🎤 📣 🎊
          </div>
          <p style={{ fontSize: 15, color: '#a16207', background: '#fef9c3', borderRadius: 14,
                      padding: '10px 14px', marginBottom: 24, fontWeight: 600, border: '2px solid #fbbf24' }}>
            👉 අකුරක් දකිනවිට, ඒ අකුර සිංහලෙන් කතා කරන්න!
          </p>
          <button className="btn btn-start" onClick={() => setGameStarted(true)}>
            🚀 ගේම් ආරම්භ කරන්න!
          </button>
        </div>
      </div>
    </>
  );

  /* ══════════════════════════ RESULT SCREEN ══════════════════════════ */
  if (gameFinished) {
    const grade = getGrade();
    return (
      <>
        <GlobalStyles />
        <div className="page" style={{ background: resultBg }}>
          <StarsBg />
        <FloatingJungleAnimals />
          <ConfettiBurst active />
          <div className="card" style={{ maxWidth: 460 }}>
            <span className="result-emoji">{grade.emoji}</span>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#be185d', margin: '12px 0 6px' }}>
              ඔබේ ලකුණු
            </h2>
            <div className="result-score">{score} / {sinhalaLetters.length}</div>
            <div className="result-pct" style={{ margin: '6px 0 4px' }}>නිවැරදි: {accuracy}%</div>

            {/* Stars row */}
            <div style={{ fontSize: 28, margin: '6px 0 14px', letterSpacing: 4 }}>
              {Array.from({ length: Math.round(accuracy / 20) }).map((_, i) => <span key={i}>⭐</span>)}
            </div>

            <p style={{ fontSize: 16, color: '#78716c', fontWeight: 700, marginBottom: 24,
                        background: '#fce7f3', borderRadius: 14, padding: '10px 14px', border: '2px solid #f9a8d4' }}>
              {grade.msg}
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-play" onClick={resetGame}>
                🔄 නැවතත් ක්‍රීඩා කරන්න
              </button>
              <button className="btn btn-home" onClick={() => navigate('/dyslexia')}>
                🏠 ගෙදරට යන්න
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════ GAME SCREEN ══════════════════════════ */
  const currentLetter = sinhalaLetters[currentIndex];
  const progress = ((currentIndex) / sinhalaLetters.length) * 100;

  return (
    <>
      <GlobalStyles />
      <div className="page" style={{ background: gameBg }}>
        <StarsBg />
        <FloatingJungleAnimals />
        <ConfettiBurst active={showCelebration} />

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          width: '100%', maxWidth: 520, marginBottom: 16, zIndex: 2,
        }}>
          <div className="score-row">
            ⭐ <span>{score}</span>
            <span style={{ fontSize: 14, color: '#be185d', fontWeight: 600 }}>
              / {sinhalaLetters.length}
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed',
                        background: '#ede9fe', borderRadius: 12, padding: '6px 14px',
                        border: '2px solid #c4b5fd' }}>
            {currentIndex + 1} / {sinhalaLetters.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-wrap" style={{ maxWidth: 520, width: '100%', marginBottom: 16, zIndex: 2 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Main card */}
        <div className="card">
          {/* Mascot */}
          <span className="mascot">{mascot}</span>

          {/* Letter box */}
          <div className={`letter-box ${letterAnim}`}>
            {currentLetter.letter}
          </div>

          <p className="hint-text">👆 ඉහත අකුර ශබ්ද කරන්න!</p>

          {/* Mic button */}
          <div style={{ marginBottom: 16 }}>
            {listening ? (
              <div className="mic-ring">
                <button className="btn btn-mic" disabled style={{ fontSize: 20, padding: '16px 36px' }}>
                  🎤 ඇහෙනවා...
                </button>
              </div>
            ) : (
              <button className="btn btn-mic" onClick={startListening}
                      style={{ fontSize: 20, padding: '16px 36px' }}>
                🎤 කතා කරන්න!
              </button>
            )}
          </div>

          {/* Feedback bubble */}
          {feedback && (
            <div className={`feedback-bubble ${feedbackType}`}>
              {feedback}
            </div>
          )}

          {/* What was heard */}
          {recognized && !showCelebration && (
            <div className="heard-text">
              👂 ඔබ කිව්වේ: <strong>"{recognized}"</strong>
            </div>
          )}

          {/* Retry / Skip buttons */}
          {isCorrect === false && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center',
                          flexWrap: 'wrap', marginTop: 18 }}>
              <button className="btn btn-retry" onClick={() => {
                setIsCorrect(null);
                setFeedback('');
                setRecognized('');
                startListening();
              }}>
                🔄 නැවතත් කියන්න
              </button>
              <button className="btn btn-skip" onClick={skipLetter}>
                ⏭️ ඉදිරි අකුර
              </button>
            </div>
          )}
        </div>

        {/* Encouragement strip */}
        <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: '#7c3aed',
                      background: 'rgba(255,255,255,0.7)', borderRadius: 12,
                      padding: '8px 16px', zIndex: 2, backdropFilter: 'blur(8px)' }}>
          💡 ඔබට පුළුවන්! ඔබ ශූරයෙකු! 🌟
        </div>
      </div>
    </>
  );
};

export default LetterPronunciation;
