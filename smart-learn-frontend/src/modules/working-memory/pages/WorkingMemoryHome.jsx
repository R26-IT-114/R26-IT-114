import React, { useState } from 'react';
import MemoryTask from '../components/MemoryTask';
import MemoryMatchGame from '../components/MemoryMatchGame';

const WorkingMemoryHome = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>🧠 Memory Games</h1>

      {!selectedGame && (
        <div>
          <p>Game එකක් තෝරන්න</p>

          <button onClick={() => setSelectedGame('sequence')} style={btn}>
            🎮 Color Memory Game
          </button>

          <button onClick={() => setSelectedGame('match')} style={btn}>
            🧩 Matching Game
          </button>
        </div>
      )}

      {selectedGame && (
        <button onClick={() => setSelectedGame(null)} style={backBtn}>
          🔙 Back
        </button>
      )}

      {selectedGame === 'sequence' && <MemoryTask />}
      {selectedGame === 'match' && <MemoryMatchGame />}
    </div>
  );
};

const btn = {
  padding: '15px',
  margin: '10px',
  borderRadius: '10px',
  background: '#4CAF50',
  color: 'white',
  border: 'none'
};

const backBtn = {
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '10px',
  background: '#FF6B6B',
  color: 'white',
  border: 'none'
};

export default WorkingMemoryHome;