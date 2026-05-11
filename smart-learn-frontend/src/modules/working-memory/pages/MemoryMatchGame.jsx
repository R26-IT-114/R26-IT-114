import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const emojis = ['🍎', '🐶', '🚗', '🌟'];

const MemoryMatchGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [message, setMessage] = useState("👀 බලන්න");
  const [wrongCount, setWrongCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

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
    setWrongCount(0);
    setShowHint(false);
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
        const newWrong = wrongCount + 1;
        setWrongCount(newWrong);
        if (newWrong >= 4) setShowHint(true);
        setMessage("❌ අයෙත් උත්සාහ කරන්න");
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Matching Game</h2>
      <p>{message}</p>

      {/* Hint banner — shown after 4 wrong flips */}
      <AnimatePresence>
        {showHint && (
          <motion.div key="match-hint" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ background:"#FEF9C3", border:"2px solid #FDE047", borderRadius:16,
                     padding:"12px 20px", margin:"10px auto", maxWidth:400,
                     display:"flex", alignItems:"center", gap:10, color:"#92400E", fontWeight:700 }}>
            <span style={{ fontSize:26 }}>💡</span>
            <div style={{ textAlign:"left" }}>
              <p style={{ margin:0, fontSize:"1rem" }}>ඉඟිය: ඇමිල්ල කාඩ් ස්ථානය හිත ගාව ලාගන්න!</p>
              <p style={{ margin:"4px 0 0", fontSize:"0.85rem", fontWeight:600 }}>
                ගත්ත කාඩ් ලකුනු ලා, ජෝඩු කිරීමෙන් ජය ගන්න.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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