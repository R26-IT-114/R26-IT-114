import React, { useState, useEffect } from 'react';

const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];

const MemoryTask = () => {
  const [sequence, setSequence] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeIndex, setActiveIndex] = useState(null);
  const [message, setMessage] = useState("Start කරන්න");
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const first = Math.floor(Math.random() * 4);
    const newSeq = [first];
    setSequence(newSeq);
    showSequence(newSeq);
  };

  const showSequence = (seq) => {
    setMessage("👀 බලන්න");

    const speed = level < 3 ? 900 : level < 5 ? 700 : 500;

    seq.forEach((num, i) => {
      setTimeout(() => {
        setActiveIndex(num);
        setTimeout(() => setActiveIndex(null), speed);
      }, i * speed);
    });

    setTimeout(() => {
      setMessage("👉 දැන් කරන්න");
      setUserIndex(0);
    }, seq.length * speed + 300);
  };

  const handleClick = (index) => {
    if (message !== "👉 දැන් කරන්න") return;

    // ❌ WRONG
    if (sequence[userIndex] !== index) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setMessage("❌ අයෙත් උත්සාහ කරන්න");

      if (newMistakes >= 2) {
        setLevel(Math.max(1, level - 1)); // easy mode
        setMistakes(0);
      }

      startGame();
      return;
    }

    // ✅ CORRECT STEP
    const nextIndex = userIndex + 1;
    setUserIndex(nextIndex);
    setMistakes(0);

    // ✅ FINISH LEVEL
    if (nextIndex === sequence.length) {
      setMessage("🎉 හරි!");

      const newColor = Math.floor(Math.random() * 4);
      const newSeq = [...sequence, newColor];

      setTimeout(() => {
        setSequence(newSeq);
        setLevel(level + 1);
        showSequence(newSeq);
      }, 800);
    }
  };

  const progress = (userIndex / sequence.length) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Level {level}</h2>
      <p>{message}</p>

      {/* Progress Bar */}
      <div style={{
        width: '80%',
        height: '15px',
        background: '#ddd',
        margin: '10px auto',
        borderRadius: '10px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#6BCB77',
          borderRadius: '10px',
          transition: '0.3s'
        }}></div>
      </div>

      {/* Color Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {colors.map((color, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: '100px',
              height: '100px',
              margin: '10px',
              borderRadius: '20px',
              backgroundColor: color,
              cursor: 'pointer',
              transform: activeIndex === i ? 'scale(1.3)' : 'scale(1)',
              transition: '0.2s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default MemoryTask;