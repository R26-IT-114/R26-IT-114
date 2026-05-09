import React from 'react';

const StreakBadge = ({ streak = 0 }) => {
  return (
    <div className="dg-streak-badge" aria-label="Current streak">
      <span className="dg-streak-emoji" aria-hidden="true">🔥</span>
      <span className="dg-streak-value">{streak}</span>
      <span className="dg-streak-label">Streak</span>
    </div>
  );
};

export default StreakBadge;

