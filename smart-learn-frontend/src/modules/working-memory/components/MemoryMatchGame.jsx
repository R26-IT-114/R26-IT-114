import React, { useState, useEffect } from 'react';

const emojis = ['🍎', '🐶', '🚗', '🌟'];

const MemoryMatchGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [message, setMessage] = useState("👀 බලන්න");

  useEffect(() => {
    startGame();
  }, []);

  const startGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji
      }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
  };

  const handleClick = (card) => {
    if (flipped.length === 2 || flipped.includes(card.id)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;

      if (cards[a].emoji === cards[b].emoji) {
        setMessage("🎉 හරි!");
        setMatched([...matched, cards[a].emoji]);
        setFlipped([]);
      } else {
        setMessage("❌ අයෙත් උත්සාහ කරන්න");
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Matching Game</h2>
      <p>{message}</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 80px)',
        justifyContent: 'center',
        gap: '10px'
      }}>
        {cards.map((card) => {
          const show = flipped.includes(card.id) || matched.includes(card.emoji);

          return (
            <div
              key={card.id}
              onClick={() => handleClick(card)}
              style={{
                width: '80px',
                height: '80px',
                background: '#4D96FF',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {show ? card.emoji : '❓'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryMatchGame;