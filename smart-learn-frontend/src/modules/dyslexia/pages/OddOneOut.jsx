import React, { useState } from 'react';
import imageOddOneData from '../data/imageOddOneData';
import FloatingJungleAnimals from '../components/FloatingJungleAnimals';

const gradientBg = 'linear-gradient(135deg, #00D9FF 0%, #00CC99 100%)';
const cardGradient = 'linear-gradient(135deg, #FFB800 0%, #FF6B9D 100%)';

const OddOneOut = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const startGame = () => {
    setGameStarted(true);
    setCurrentRound(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setFeedback(null);
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === imageOddOneData[currentRound].oddIndex;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(score + 1);
    setTimeout(() => {
      if (currentRound === imageOddOneData.length - 1) {
        setShowResult(true);
        setGameStarted(false);
      } else {
        setCurrentRound(currentRound + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1200);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentRound(0);
    setScore(0);
    setShowResult(false);
    setSelected(null);
    setFeedback(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: gradientBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <FloatingJungleAnimals />
      {!gameStarted && !showResult && (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 24 }}>වෙනස් පින්තූරය සොයන්න</h1>
          <p style={{ fontSize: 22, marginBottom: 32 }}>ඉදිරිපත් කරන ලද රූප අතර වෙනස් රූපය තෝරන්න!</p>
          <button onClick={startGame} style={{ fontSize: 24, padding: '18px 48px', borderRadius: 30, background: cardGradient, color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', cursor: 'pointer', transition: 'transform 0.2s' }}>ආරම්භ කරන්න</button>
        </div>
      )}
      {gameStarted && !showResult && (
        <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 32, padding: 36, boxShadow: '0 8px 32px rgba(0,0,0,0.13)', minWidth: 380, textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 32, marginBottom: 18 }}>{imageOddOneData[currentRound].name}</h2>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', margin: '30px 0' }}>
            {imageOddOneData[currentRound].images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 22,
                  background: cardGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: selected === idx ? (feedback === 'correct' ? '0 0 0 6px #00D966' : '0 0 0 6px #FF4D4F') : '0 4px 16px rgba(0,0,0,0.13)',
                  border: selected === idx ? (feedback === 'correct' ? '4px solid #00D966' : '4px solid #FF4D4F') : '4px solid transparent',
                  cursor: selected === null ? 'pointer' : 'default',
                  opacity: selected !== null && selected !== idx ? 0.5 : 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <img src={img} alt='' style={{ width: 60, height: 60, objectFit: 'contain', filter: selected === idx && feedback === 'correct' ? 'drop-shadow(0 0 8px #00D966)' : '' }} />
                {selected === idx && feedback === 'correct' && (
                  <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 32, color: '#00D966', fontWeight: 900 }}>✓</span>
                )}
                {selected === idx && feedback === 'wrong' && (
                  <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 32, color: '#FF4D4F', fontWeight: 900 }}>✗</span>
                )}
              </div>
            ))}
          </div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 18 }}> raund එක {currentRound + 1} / {imageOddOneData.length}</div>
        </div>
      )}
      {showResult && (
        <div style={{ textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.13)', borderRadius: 32, padding: 40, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
          <h2 style={{ fontSize: 38, fontWeight: 900, marginBottom: 18 }}>ප්‍රතිඵලය</h2>
          <div style={{ fontSize: 28, marginBottom: 18 }}>🏆 ලකුණු: {score} / {imageOddOneData.length}</div>
          <button onClick={resetGame} style={{ fontSize: 22, padding: '14px 38px', borderRadius: 28, background: cardGradient, color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', cursor: 'pointer', marginTop: 18 }}>නැවත ක්‍රීඩා කරන්න</button>
        </div>
      )}
    </div>
  );
};

export default OddOneOut;
