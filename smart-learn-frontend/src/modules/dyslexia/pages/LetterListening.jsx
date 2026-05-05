import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sinhalaLetters } from '../utils/sinhalaLetters';

/* ─── Global Styles ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Baloo 2', cursive; }

    .ll-page {
      min-height: 100vh;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 16px;
      overflow: hidden;
    }

    /* Bubbles background */
    .bubbles-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
    .bubble {
      position: absolute; border-radius: 50%; opacity: 0.55;
      animation: riseUp linear infinite;
    }

    /* Card */
    .ll-card {
      background: #fff;
      border-radius: 32px;
      padding: 32px 28px;
      width: 100%; max-width: 560px;
      position: relative; z-index: 2;
      box-shadow: 0 8px 0 #fbbf24, 0 16px 40px rgba(0,0,0,0.15);
      border: 4px solid #fde68a;
      text-align: center;
    }

    /* Mascot */
    .ll-mascot {
      font-size: 60px; display: block; line-height: 1;
      animation: mascotWiggle 2s ease-in-out infinite;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.12));
      margin-bottom: 6px;
    }

    /* Speak button */
    .speak-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      padding: 18px 36px; border-radius: 99px;
      border: 4px solid rgba(255,255,255,0.7);
      font-family: 'Baloo 2', cursive; font-size: 20px; font-weight: 800;
      color: #fff; cursor: pointer; outline: none;
      transition: transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 5px 0 rgba(0,0,0,0.2), 0 10px 24px rgba(0,0,0,0.1);
      text-shadow: 0 1px 3px rgba(0,0,0,0.2);
      margin-bottom: 24px;
    }
    .speak-btn.idle      { background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%); }
    .speak-btn.speaking  { background: linear-gradient(135deg, #a1a1aa 0%, #71717a 100%); cursor: not-allowed; animation: speakPulse 0.8s ease-in-out infinite; }
    .speak-btn:hover:not(.speaking) { transform: translateY(-3px) scale(1.05); }
    .speak-btn:active:not(.speaking) { transform: translateY(2px) scale(0.97); box-shadow: 0 2px 0 rgba(0,0,0,0.2); }

    /* Letter option buttons */
    .options-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
      margin: 8px 0 20px;
    }
    .option-btn {
      padding: 20px 10px; border-radius: 24px;
      border: 4px solid #fde68a;
      font-family: 'Baloo 2', cursive; font-size: 68px; font-weight: 800;
      color: #92400e; cursor: pointer; outline: none;
      background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
      box-shadow: 0 5px 0 #fbbf24, 0 10px 20px rgba(0,0,0,0.08);
      transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
      line-height: 1.1;
      animation: optionPop 0.35s cubic-bezier(.36,1.56,.64,1) backwards;
    }
    .option-btn:nth-child(1) { animation-delay: 0.05s; }
    .option-btn:nth-child(2) { animation-delay: 0.12s; }
    .option-btn:nth-child(3) { animation-delay: 0.19s; }
    .option-btn:nth-child(4) { animation-delay: 0.26s; }

    .option-btn:hover:not(.disabled) { transform: translateY(-4px) scale(1.06); box-shadow: 0 9px 0 #fbbf24, 0 16px 28px rgba(0,0,0,0.12); }
    .option-btn:active:not(.disabled) { transform: translateY(2px); box-shadow: 0 2px 0 #fbbf24; }
    .option-btn.disabled { cursor: not-allowed; }

    .option-btn.correct {
      background: linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%) !important;
      border-color: #22c55e; color: #14532d;
      box-shadow: 0 5px 0 #16a34a, 0 0 0 4px #bbf7d0 !important;
      animation: correctBounce 0.5s cubic-bezier(.36,1.56,.64,1) forwards !important;
    }
    .option-btn.wrong {
      background: linear-gradient(135deg, #fecaca 0%, #f87171 100%) !important;
      border-color: #ef4444; color: #7f1d1d;
      box-shadow: 0 5px 0 #dc2626 !important;
      animation: wrongShake 0.4s ease forwards !important;
    }
    .option-btn.reveal {
      background: linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%) !important;
      border-color: #22c55e; color: #14532d;
      box-shadow: 0 5px 0 #16a34a !important;
      animation: revealPulse 0.6s ease forwards !important;
    }

    /* Progress bar */
    .ll-progress-wrap {
      background: #fef9c3; border-radius: 99px; height: 18px;
      width: 100%; max-width: 560px; margin-bottom: 14px; z-index: 2;
      border: 2px solid #fde68a; overflow: hidden;
    }
    .ll-progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, #4ade80 0%, #06b6d4 100%);
      transition: width 0.5s cubic-bezier(.4,0,.2,1);
    }

    /* Score row */
    .ll-score-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 22px; font-weight: 800; color: #a16207; z-index: 2;
    }

    /* Feedback bubble */
    .ll-feedback {
      border-radius: 18px; padding: 12px 16px; margin: 0 0 14px;
      font-size: 18px; font-weight: 700; border: 3px solid;
      animation: popIn 0.3s cubic-bezier(.36,1.56,.64,1);
    }
    .ll-feedback.good  { background: #d1fae5; border-color: #34d399; color: #065f46; }
    .ll-feedback.bad   { background: #fee2e2; border-color: #f87171; color: #991b1b; }
    .ll-feedback.info  { background: #fef9c3; border-color: #fbbf24; color: #78350f; }

    /* Confetti */
    .conf-piece {
      position: fixed; width: 11px; height: 11px; border-radius: 3px;
      pointer-events: none; z-index: 999;
      animation: confettiFall 1.3s ease-in forwards;
    }

    /* Buttons (generic) */
    .ll-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 26px; border-radius: 20px;
      border: 3px solid rgba(255,255,255,0.6);
      font-family: 'Baloo 2', cursive; font-size: 17px; font-weight: 700;
      color: #fff; cursor: pointer; outline: none;
      box-shadow: 0 4px 0 rgba(0,0,0,0.18);
      transition: transform 0.15s, box-shadow 0.15s;
      text-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .ll-btn:hover  { transform: translateY(-2px) scale(1.04); }
    .ll-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,0.18); }
    .ll-btn-skip  { background: linear-gradient(135deg, #34d399 0%, #06b6d4 100%); }
    .ll-btn-play  { background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%); }
    .ll-btn-home  { background: linear-gradient(135deg, #34d399 0%, #06b6d4 100%); }
    .ll-btn-start { background: linear-gradient(135deg, #4ade80 0%, #06b6d4 100%); font-size: 22px; padding: 18px 40px; }

    /* Result */
    .ll-result-emoji { font-size: 80px; display: block; animation: mascotWiggle 1.5s ease-in-out infinite; }
    .ll-result-score { font-size: 52px; font-weight: 800; background: linear-gradient(135deg,#4ade80,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

    /* Sound wave icon */
    .sound-wave { display: inline-flex; align-items: flex-end; gap: 3px; height: 22px; }
    .sound-wave span {
      display: block; width: 4px; background: currentColor; border-radius: 2px;
      animation: soundBar 0.6s ease-in-out infinite alternate;
    }
    .sound-wave span:nth-child(1) { height: 8px;  animation-delay: 0s; }
    .sound-wave span:nth-child(2) { height: 16px; animation-delay: 0.1s; }
    .sound-wave span:nth-child(3) { height: 22px; animation-delay: 0.2s; }
    .sound-wave span:nth-child(4) { height: 14px; animation-delay: 0.3s; }
    .sound-wave span:nth-child(5) { height: 8px;  animation-delay: 0.4s; }

    /* ── Keyframes ── */
    @keyframes riseUp {
      0%   { transform: translateY(105vh) scale(0.8); opacity: 0; }
      10%  { opacity: 0.55; }
      90%  { opacity: 0.55; }
      100% { transform: translateY(-10vh) scale(1.1); opacity: 0; }
    }
    @keyframes mascotWiggle {
      0%,100% { transform: rotate(-4deg) translateY(0); }
      50%      { transform: rotate(4deg) translateY(-8px); }
    }
    @keyframes speakPulse {
      0%,100% { box-shadow: 0 5px 0 rgba(0,0,0,0.2), 0 0 0 0 rgba(6,182,212,0.5); }
      50%      { box-shadow: 0 5px 0 rgba(0,0,0,0.2), 0 0 0 14px rgba(6,182,212,0); }
    }
    @keyframes optionPop {
      0%   { transform: scale(0.6) translateY(20px); opacity: 0; }
      100% { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes correctBounce {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.2) rotate(5deg); }
      70%  { transform: scale(0.93) rotate(-3deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes wrongShake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-10px); }
      40%     { transform: translateX(10px); }
      60%     { transform: translateX(-8px); }
      80%     { transform: translateX(8px); }
    }
    @keyframes revealPulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    @keyframes popIn {
      0%   { transform: scale(0.7); opacity: 0; }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes confettiFall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(65vh) rotate(720deg); opacity: 0; }
    }
    @keyframes soundBar {
      from { transform: scaleY(0.4); }
      to   { transform: scaleY(1); }
    }
  `}</style>
);

/* ─── Bubble background ─── */
const BUBBLE_COLORS = ['#fbbf24','#f472b6','#4ade80','#60a5fa','#c084fc','#fb923c','#34d399'];
const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  size: 10 + Math.random() * 18,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 9}s`,
  duration: `${7 + Math.random() * 8}s`,
  color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
}));
const BubblesBg = () => (
  <div className="bubbles-bg" aria-hidden="true">
    {BUBBLES.map(b => (
      <div key={b.id} className="bubble" style={{
        width: b.size, height: b.size, left: b.left, bottom: '-30px',
        background: b.color, animationDuration: b.duration, animationDelay: b.delay,
      }} />
    ))}
  </div>
);

/* ─── Confetti burst ─── */
const CONF = ['#f472b6','#fbbf24','#34d399','#60a5fa','#c084fc','#fb923c'];
const ConfettiBurst = ({ active }) => {
  if (!active) return null;
  return Array.from({ length: 28 }, (_, i) => (
    <div key={i} className="conf-piece" style={{
      left: `${15 + Math.random() * 70}%`,
      top:  `${5  + Math.random() * 45}%`,
      background: CONF[i % CONF.length],
      animationDelay: `${Math.random() * 0.35}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      borderRadius: Math.random() > 0.5 ? '50%' : '3px',
    }} />
  ));
};

/* ─── Sound wave icon ─── */
const SoundWave = () => (
  <span className="sound-wave">
    {[1,2,3,4,5].map(i => <span key={i} />)}
  </span>
);

/* ─── Mascots cycling ─── */
const MASCOTS = ['🐸','🐨','🦊','🐻','🦁','🐯','🐧','🦋','🐬','🦄','🐙','🐼'];

/* ═══════════════════════════════════════════════════════════ */
const LetterListening = () => {
  const navigate = useNavigate();
  const synthesisRef = useRef(null);

  const [gameStarted,    setGameStarted]    = useState(false);
  const [gameFinished,   setGameFinished]   = useState(false);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [score,          setScore]          = useState(0);
  const [feedback,       setFeedback]       = useState('');
  const [feedbackType,   setFeedbackType]   = useState('info');
  const [isCorrect,      setIsCorrect]      = useState(null);
  const [options,        setOptions]        = useState([]);
  const [correctLetter,  setCorrectLetter]  = useState(null);
  const [pronouncing,    setPronouncing]    = useState(false);
  const [selectedId,     setSelectedId]     = useState(null);
  const [showConf,       setShowConf]       = useState(false);
  const [hasPlayed,      setHasPlayed]      = useState(false); // nudge to press play first

  /* Init speech synthesis */
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synthesisRef.current = synth;
    return () => synthesisRef.current?.cancel();
  }, []);

  /* Generate 4 options */
  const generateOptions = (idx) => {
    const correct = sinhalaLetters[idx];
    let opts = [correct];
    while (opts.length < 4) {
      const r = sinhalaLetters[Math.floor(Math.random() * sinhalaLetters.length)];
      if (!opts.find(o => o.id === r.id)) opts.push(r);
    }
    opts = opts.sort(() => Math.random() - 0.5);
    setOptions(opts);
    setCorrectLetter(correct);
    setHasPlayed(false);
  };

  /* Pronounce */
  const pronounceLetter = () => {
    if (!synthesisRef.current || pronouncing) return;
    const letter = sinhalaLetters[currentIndex];
    const utt = new SpeechSynthesisUtterance();
    utt.text   = letter.accepted[0] || 'ka';
    utt.lang   = 'en-US';
    utt.rate   = 0.75;
    utt.pitch  = 1.1;
    utt.volume = 1;
    utt.onstart = () => { setPronouncing(true); setFeedback('🔊 අසන්න!'); setFeedbackType('info'); };
    utt.onend   = () => { setPronouncing(false); setHasPlayed(true); setFeedback(''); };
    utt.onerror = () => { setPronouncing(false); setFeedback('❌ ශබ්ද දෝෂය'); setFeedbackType('bad'); };
    if (synthesisRef.current.speaking) synthesisRef.current.cancel();
    synthesisRef.current.speak(utt);
  };

  /* Handle option tap */
  const handleSelect = (opt) => {
    if (isCorrect !== null || pronouncing) return;
    setSelectedId(opt.id);
    const match = opt.id === correctLetter.id;

    if (match) {
      setIsCorrect(true);
      setScore(p => p + 1);
      setFeedback('🎉 හරිම හොඳයි! නිවැරදි!');
      setFeedbackType('good');
      setShowConf(true);
      setTimeout(() => {
        setShowConf(false);
        advance();
      }, 1700);
    } else {
      setIsCorrect(false);
      setFeedback(`😮 ආයෙත් බලන්න! නිවැරදි එක "${correctLetter.letter}"`);
      setFeedbackType('bad');
    }
  };

  const advance = () => {
    setIsCorrect(null);
    setSelectedId(null);
    setFeedback('');
    if (currentIndex < sinhalaLetters.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      generateOptions(next);
    } else {
      setGameFinished(true);
    }
  };

  const accuracy = Math.round((score / sinhalaLetters.length) * 100);
  const getGrade = () => {
    if (accuracy === 100) return { emoji: '🏆', msg: 'නිවැරදිම! ඔබ ශූරයා!' };
    if (accuracy >= 87)  return { emoji: '🌟', msg: 'හොඳ! ඔබ ගොඩ දක්ෂ ය!' };
    if (accuracy >= 75)  return { emoji: '⭐', msg: 'හොඳ උත්සාහය! නැවතත් කරන්න!' };
    return { emoji: '💪', msg: 'ගොඩ හොඳ! ආයෙත් ගමු!' };
  };

  const resetGame = () => {
    setGameStarted(false); setGameFinished(false);
    setCurrentIndex(0); setScore(0);
    setFeedback(''); setFeedbackType('info');
    setSelectedId(null); setIsCorrect(null);
    setOptions([]); setShowConf(false);
  };

  const progress = (currentIndex / sinhalaLetters.length) * 100;
  const mascot   = MASCOTS[currentIndex % MASCOTS.length];

  /* ── option class helper ── */
  const optClass = (opt) => {
    let c = 'option-btn';
    if (isCorrect !== null) c += ' disabled';
    if (selectedId === opt.id) {
      c += isCorrect ? ' correct' : ' wrong';
    } else if (isCorrect === false && opt.id === correctLetter?.id) {
      c += ' reveal';
    }
    return c;
  };

  const startBg  = 'linear-gradient(160deg, #dbeafe 0%, #d1fae5 50%, #fce7f3 100%)';
  const gameBg   = 'linear-gradient(160deg, #fef9c3 0%, #d1fae5 50%, #dbeafe 100%)';
  const resultBg = 'linear-gradient(160deg, #fce7f3 0%, #fef9c3 50%, #d1fae5 100%)';

  /* ══════════ START ══════════ */
  if (!gameStarted) return (
    <>
      <GlobalStyles />
      <div className="ll-page" style={{ background: startBg }}>
        <BubblesBg />
        <div className="ll-card">
          <span className="ll-mascot">🦋</span>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#0369a1', marginBottom: 6 }}>
            අකුරු ඇහෙනවාද?
          </h1>
          <p style={{ fontSize: 16, color: '#78716c', fontWeight: 600, marginBottom: 14 }}>
            ශබ්දය අහලා නිවැරදි අකුර තෝරා ගන්න!
          </p>
          <div style={{ fontSize: 36, margin: '10px 0 16px', letterSpacing: 8 }}>👂 🔊 🎯</div>
          <div style={{ background: '#dbeafe', border: '2px solid #93c5fd', borderRadius: 14,
                        padding: '10px 14px', marginBottom: 22, fontSize: 14, fontWeight: 600, color: '#1e40af' }}>
            👉 🔊 බොත්තම 누르ා ශබ්දය අහලා,<br />නිවැරදි අකුර තෝරන්න!
          </div>
          <button className="ll-btn ll-btn-start" onClick={() => {
            setGameStarted(true);
            generateOptions(0);
          }}>
            🚀 ගේම් ආරම්භ කරන්න!
          </button>
        </div>
      </div>
    </>
  );

  /* ══════════ RESULTS ══════════ */
  if (gameFinished) {
    const grade = getGrade();
    return (
      <>
        <GlobalStyles />
        <div className="ll-page" style={{ background: resultBg }}>
          <BubblesBg />
          <ConfettiBurst active />
          <div className="ll-card">
            <span className="ll-result-emoji">{grade.emoji}</span>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#be185d', margin: '12px 0 8px' }}>
              ඔබේ ලකුණු!
            </h2>
            <div className="ll-result-score">{score} / {sinhalaLetters.length}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#16a34a', margin: '6px 0 8px' }}>
              නිවැරදි: {accuracy}%
            </div>
            <div style={{ fontSize: 26, margin: '4px 0 14px', letterSpacing: 3 }}>
              {Array.from({ length: Math.max(1, Math.round(accuracy / 20)) }).map((_, i) => <span key={i}>⭐</span>)}
            </div>
            <p style={{ fontSize: 15, color: '#78716c', fontWeight: 700, marginBottom: 24,
                        background: '#fef9c3', borderRadius: 14, padding: '10px 14px', border: '2px solid #fbbf24' }}>
              {grade.msg}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="ll-btn ll-btn-play" onClick={resetGame}>🔄 නැවතත් ක්‍රීඩා කරන්න</button>
              <button className="ll-btn ll-btn-home" onClick={() => navigate('/dyslexia')}>🏠 ගෙදරට යන්න</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════ GAME ══════════ */
  return (
    <>
      <GlobalStyles />
      <div className="ll-page" style={{ background: gameBg }}>
        <BubblesBg />
        <ConfettiBurst active={showConf} />

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      width: '100%', maxWidth: 560, marginBottom: 12, zIndex: 2 }}>
          <div className="ll-score-row">⭐ <span>{score}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a16207' }}>/ {sinhalaLetters.length}</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0369a1',
                        background: '#dbeafe', borderRadius: 12, padding: '5px 14px', border: '2px solid #93c5fd' }}>
            {currentIndex + 1} / {sinhalaLetters.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="ll-progress-wrap" style={{ zIndex: 2 }}>
          <div className="ll-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Card */}
        <div className="ll-card" style={{ marginTop: 12 }}>
          <span className="ll-mascot">{mascot}</span>

          <p style={{ fontSize: 16, fontWeight: 700, color: '#78716c', marginBottom: 14 }}>
            ශබ්දය අහලා නිවැරදි අකුර තෝරන්න!
          </p>

          {/* Speak button */}
          <button
            className={`speak-btn ${pronouncing ? 'speaking' : 'idle'}`}
            onClick={pronounceLetter}
            disabled={pronouncing}
          >
            {pronouncing
              ? <><SoundWave /> අසන්න...</>
              : <><span style={{ fontSize: 24 }}>🔊</span> ශබ්දය ඇහෙන්න</>
            }
          </button>

          {/* Nudge if not played yet */}
          {!hasPlayed && !feedback && (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e',
                          background: '#fef9c3', border: '2px solid #fbbf24',
                          borderRadius: 12, padding: '8px 12px', marginBottom: 12,
                          animation: 'popIn 0.3s ease' }}>
              👆 පළමුව 🔊 ශබ්දය ඇහෙන්න!
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`ll-feedback ${feedbackType}`}>{feedback}</div>
          )}

          {/* Options grid */}
          <div className="options-grid">
            {options.map(opt => (
              <button
                key={opt.id}
                className={optClass(opt)}
                onClick={() => hasPlayed && handleSelect(opt)}
                style={{ opacity: hasPlayed || isCorrect !== null ? 1 : 0.5 }}
                title={!hasPlayed ? 'පළමුව ශබ්දය ඇහෙන්න!' : ''}
              >
                {opt.letter}
              </button>
            ))}
          </div>

          {/* Skip after wrong */}
          {isCorrect === false && (
            <button className="ll-btn ll-btn-skip" onClick={advance} style={{ marginTop: 6 }}>
              ⏭️ ඉදිරි ප්‍රශ්නය
            </button>
          )}
        </div>

        {/* Encouragement */}
        <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: '#0369a1',
                      background: 'rgba(255,255,255,0.75)', borderRadius: 12,
                      padding: '7px 16px', zIndex: 2, backdropFilter: 'blur(6px)' }}>
          👂 හොඳට අහලා තෝරන්න! ඔබට පුළුවන්! 🌟
        </div>
      </div>
    </>
  );
};

export default LetterListening;
