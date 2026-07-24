import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressTracking } from '../hooks/useProgressTracking';
import '../styles/dysgraphia-common.css';
import '../styles/dysgraphia-home.css';
import '../styles/dysgraphia-progress-dashboard.css';

// ──────────────────────────────────────────────────────
// Progress Bar Component
// ──────────────────────────────────────────────────────
const ProgressBar = ({ completed, total, label }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="progress-item">
      <div className="progress-label">
        <span className="label-text">{label}</span>
        <span className="label-count">{completed}/{total}</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress-percentage">{Math.round(percentage)}%</div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Stat Card Component
// ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, unit = '' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {value}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Module Progress Section
// ──────────────────────────────────────────────────────
const ModuleProgressSection = ({ title, items, icon }) => {
  return (
    <div className="module-section">
      <h3 className="module-title">
        <span className="module-icon">{icon}</span>
        {title}
      </h3>
      <div className="module-items">
        {items.map((item, idx) => (
          <ProgressBar
            key={idx}
            completed={item.completed}
            total={item.total}
            label={item.label}
          />
        ))}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Main Progress Dashboard
// ──────────────────────────────────────────────────────
const ProgressDashboard = () => {
  const navigate = useNavigate();
  const { progress, getStats, achievements, recentSessions, loading, error } = useProgressTracking();
  const stats = getStats();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('si-LK', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shapeItems = [
    {
      label: progress.shapes.name,
      completed: progress.shapes.completed,
      total: progress.shapes.total,
    },
  ];

  const letterItems = [
    {
      label: progress.letters.level1.name,
      completed: progress.letters.level1.completed,
      total: progress.letters.level1.total,
    },
    {
      label: progress.letters.level2.name,
      completed: progress.letters.level2.completed,
      total: progress.letters.level2.total,
    },
    {
      label: progress.letters.level3.name,
      completed: progress.letters.level3.completed,
      total: progress.letters.level3.total,
    },
  ];

  const wordItems = [
    {
      label: progress.words.twoLetters.name,
      completed: progress.words.twoLetters.completed,
      total: progress.words.twoLetters.total,
    },
    {
      label: progress.words.threeLetters.name,
      completed: progress.words.threeLetters.completed,
      total: progress.words.threeLetters.total,
    },
  ];

  if (loading) {
    return (
      <div className="progress-dashboard">
        <div className="dashboard-header">
          <button className="back-button" onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}>
            ← ආපසු
          </button>
          <h1 className="dashboard-title">📊 සෙවුම් පුවරුව</h1>
        </div>
        <div className="no-activity">
          <p>දත්ත ලබා ගනිමින්...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <button className="back-button" onClick={() => navigate('/dysgraphia', { state: { suppressAutoAudio: true } })}>
          ← ආපසු
        </button>
        <h1 className="dashboard-title">📊 සෙවුම් පුවරුව</h1>
      </div>

      {/* Overall Stats Cards */}
      <div className="stats-grid">
        <StatCard icon="⭐" label="එකතු තරු" value={stats.totalStars} />
        <StatCard icon="🎮" label="සම්පූර්ණ කළ සැසි" value={stats.sessionsCompleted} />
        <StatCard icon="⏱️" label="කාලය ගත" value={stats.totalMinutesSpent} unit=" මිනිත්තු" />
        <StatCard icon="✅" label="අයිතම සම්පූර්ණ" value={stats.totalItemsCompleted} />
      </div>

      {error && (
        <div className="retry-message">
          සේවාදායක දත්ත ලබා ගන්න බැරි වුණා. පිටුව නැවත උත්සාහ කරන්න.
        </div>
      )}

      {/* Last Session Info */}
      <div className="last-session-card">
        <span className="last-session-icon">📅</span>
        <div>
          <div className="last-session-label">අවසාන සැසිය</div>
          <div className="last-session-value">
            {stats.lastSessionDate ? formatDate(stats.lastSessionDate) : 'තවම ආරම්භ නොවිණි'}
          </div>
        </div>
      </div>

      <ModuleProgressSection
        title="හැඩතල පුහුණුව"
        items={shapeItems}
        icon="🔷"
      />

      {/* Letter Learning Progress */}
      <ModuleProgressSection
        title="අකුරු ඉගෙනීම"
        items={letterItems}
        icon="✍️"
      />

      {/* Word Games Progress */}
      <ModuleProgressSection
        title="වචන ලිවීම"
        items={wordItems}
        icon="📝"
      />

      {/* Overall Progress Section */}
      <div className="overall-progress-section">
        <h3 className="section-title">📈 සමස්ත දියුණුව</h3>
        <div className="overall-stats-grid">
          <div className="overall-stat">
            <div className="overall-stat-title">හැඩතල පිහිටුවීම</div>
            <div className="overall-progress">
              <div className="overall-bar">
                <div
                  className="overall-fill word-fill"
                  style={{
                    width: `${stats.shapeCompletion}%`,
                  }}
                />
              </div>
              <span className="overall-text">{stats.shapeCompletion}%</span>
            </div>
          </div>

          <div className="overall-stat">
            <div className="overall-stat-title">අකුරු පිහිටුවීම</div>
            <div className="overall-progress">
              <div className="overall-bar">
                <div
                  className="overall-fill letter-fill"
                  style={{
                    width: `${
                      (stats.letterCompletion.level1 +
                        stats.letterCompletion.level2 +
                        stats.letterCompletion.level3) /
                      3
                    }%`,
                  }}
                />
              </div>
              <span className="overall-text">
                {Math.round(
                  (stats.letterCompletion.level1 +
                    stats.letterCompletion.level2 +
                    stats.letterCompletion.level3) /
                    3
                )}
                %
              </span>
            </div>
          </div>

          <div className="overall-stat">
            <div className="overall-stat-title">වචන ලිවීම පිහිටුවීම</div>
            <div className="overall-progress">
              <div className="overall-bar">
                <div
                  className="overall-fill word-fill"
                  style={{
                    width: `${
                      (stats.wordCompletion.twoLetters + stats.wordCompletion.threeLetters) / 2
                    }%`,
                  }}
                />
              </div>
              <span className="overall-text">
                {Math.round(
                  (stats.wordCompletion.twoLetters + stats.wordCompletion.threeLetters) / 2
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <h3 className="section-title">🏅 ජයගැයුම්</h3>
        {achievements.length > 0 ? (
          <div className="achievements-grid">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="achievement-badge">
                <div className="achievement-emoji">🏅</div>
                <div className="achievement-label">{achievement.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-achievements">
            <p>තවම ජයගැයුම් නැත. ඉගෙනීම දිගටම කරන්න! 🚀</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3 className="section-title">📋 ඉතා මෑතකාලීන ක්‍රියාකාරකම</h3>
        {recentSessions.length > 0 ? (
          <div className="activity-list">
            {recentSessions.map((session, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-info">
                  <span className="activity-module">{session.module}</span>
                  <span className="activity-date">{formatDate(session.date)}</span>
                </div>
                <div className="activity-stats">
                  <span className="activity-stat">
                    ⭐ {session.starsEarned}
                  </span>
                  <span className="activity-stat">
                    ✅ {session.itemsCompleted} අයිතම
                  </span>
                  <span className="activity-stat">
                    ⏱️ {session.duration}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-activity">
            <p>තවම ක්‍රියාකාරකම් නැත. ඉතින් ඉගෙනීම ආරම්භ කරන්න! 🎮</p>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="quick-actions">
        <button className="action-btn letter-btn" onClick={() => navigate('/dysgraphia?view=letters')}>
          ✍️ අකුරු ඉගෙනීමට
        </button>
        <button className="action-btn word-btn" onClick={() => navigate('/dysgraphia/word-game')}>
          📝 වචන ගේමට
        </button>
      </div>
    </div>
  );
};

export default ProgressDashboard;
