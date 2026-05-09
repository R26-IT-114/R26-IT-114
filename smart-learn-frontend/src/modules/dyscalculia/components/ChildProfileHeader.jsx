import { useMemo } from 'react';
import TicketsStrip from './TicketsStrip';

import { getDyscalculiaProgress } from '../utils/dyscalculiaProgress';

const defaultChildName = 'පුංචි ශිෂ්‍යයා';

const ChildProfileHeader = ({ progress, onGoDashboard }) => {
  const p = progress || getDyscalculiaProgress();

  const { stars, streak, badges } = useMemo(() => {
    return p?.rewards || { stars: 0, streak: 0, badges: [] };
  }, [p]);

  const levelBadge = useMemo(() => {
    const total = (p?.overallStats?.totalGames ?? 0) + (p?.overallStats?.totalCorrect ?? 0);
    if (total >= 40 || stars >= 30) return 'Explorer 🌟';
    if (total >= 20 || stars >= 15) return 'Learner 🚀';
    return 'Starter 🎯';
  }, [p, stars]);

  const tickets = useMemo(() => {
    // Simple mapping without breaking progress logic.
    return Math.floor((stars || 0) / 3);
  }, [stars]);

  return (
    <section className="dg-profile-header">
      <div className="dg-profile-left">
        <div className="dg-avatar" aria-hidden="true">
          <span className="dg-avatar-emoji">🧒</span>
        </div>
      </div>

      <div className="dg-profile-mid">
        <div className="dg-profile-name">{defaultChildName}</div>
        <div className="dg-profile-badge-row">
          <span className="dg-level-badge">{levelBadge}</span>
          {badges?.length ? (
            <span className="dg-profile-small">🏅 {badges[0]}</span>
          ) : (
            <span className="dg-profile-small">✨ New journey</span>
          )}
        </div>

        <div className="dg-profile-stats-row">
          <div className="dg-profile-stat">
            <div className="dg-profile-stat-num">{stars}</div>
            <div className="dg-profile-stat-label">Stars</div>
          </div>
          <div className="dg-profile-stat">
            <div className="dg-profile-stat-num">{streak}</div>
            <div className="dg-profile-stat-label">Streak</div>
          </div>
        </div>
      </div>

      <div className="dg-profile-right">
        <TicketsStrip tickets={tickets} />
        <button type="button" className="dg-profile-dashboard-btn" onClick={onGoDashboard}>
          📈 Learning Progress Center
        </button>
      </div>
    </section>
  );
};

export default ChildProfileHeader;

