import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { getDyscalculiaProgress, getOverallStats, getNumberRecognitionProgress, getGamePerformance, getWeakAreas, getActivityTimeline, getRewards } from '../utils/dyscalculiaProgress';
import '../styles/dyscalculia-dashboard.css';

const GAME_LABELS = {
  NumberListeningGame: 'Listening Game',
  BalloonPopGame: 'Balloon Pop',
  NumberSortingGame: 'Number Sorting',
  TracingNumbers: 'Tracing Numbers',
};

const DyscalculiaDashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await getDyscalculiaProgress();
        setProgress(data);
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  if (loading) {
    return (
      <main className="dg-shell">
        <div className="dashboard-loading" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true" />
          <p>Loading your progress...</p>
        </div>
      </main>
    );
  }

  const overallStats = getOverallStats(progress);
  const numberProgress = getNumberRecognitionProgress(progress);

  const gamePerformance = getGamePerformance(progress);
  const weakAreas = getWeakAreas(progress);
  const timeline = getActivityTimeline(progress);
  const rewards = getRewards(progress);

  const floatingStars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => {
        const left = `${Math.random() * 100}%`;
        const top = `${Math.random() * 100}%`;
        const animationDelay = `${Math.random() * 3}s`;
        return (
          <div
            key={i}
            className="floating-star"
            style={{ left, top, animationDelay }}
          >
            ⭐
          </div>
        );
      }),
    []
  );


  return (
    <main className="dg-shell">
      {/* Floating stars background */}
      <div className="dashboard-stars" aria-hidden="true">
        {floatingStars}
      </div>

      <div className="dashboard-tent" aria-hidden="true" />

      <section className="dashboard-header">
        <button
          type="button"
          className="dg-home-btn dc-back-button"
          onClick={() => navigate('/dyscalculia')}
          aria-label="Back to Dyscalculia Home"
        >
          ←
        </button>
        <h1 className="dashboard-title">ඔබේ ප්‍රගතිය</h1>
        <p className="dashboard-subtitle">අංක ඉගෙනීමේ යාත්‍රාවේ ප්‍රගතිය නරඹන්න!</p>
      </section>

      {/* Overall Progress Card */}
      <section className="dashboard-section">
        <div className="progress-card overall-card" role="region" aria-label="සමස්ත ප්‍රගතිය">
          <h2>සමස්ත ප්‍රගතිය</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{overallStats.totalGames}</span>
              <span className="stat-label">ක්‍රීඩා ලෙදර් වූ</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{overallStats.totalCorrect}</span>
              <span className="stat-label">නිවැරදි පිළිතුරු</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{overallStats.accuracy}%</span>
              <span className="stat-label">නිවැරදිකම</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{overallStats.starsEarned}</span>
              <span className="stat-label">තරු ලබාගත්තා</span>
            </div>
          </div>
        </div>
      </section>

      {/* Number Recognition Progress */}
      <section className="dashboard-section">
        <div className="progress-card numbers-card" role="region" aria-label="අංක හඳුනාගැනීමේ ප්‍රගතිය">
          <h2>අංක හඳුනාගැනීමේ ප්‍රගතිය</h2>
          <div className="numbers-grid">
            {Object.entries(numberProgress).map(([number, accuracy]) => (
              <div key={number} className="number-progress-item">
                <div className="number-display">{number}</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${accuracy}%` }}
                  ></div>
                </div>
                <span className="progress-percent">{accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Performance */}
      <section className="dashboard-section">
        <div className="progress-card games-card" role="region" aria-label="ක්‍රීඩා ක්‍රියාකාරකම්">
          <h2>ක්‍රීඩා ක්‍රියාකාරකම්</h2>
          <div className="games-list">
            {Object.entries(gamePerformance).map(([gameType, stats]) => (
              <div key={gameType} className="game-item">
                <h3>{GAME_LABELS[gameType] || gameType}</h3>
                <div className="game-stats">
                  <span>උත්සාහයන්: {stats.attempts}</span>
                  <span>නිවැරදි: {stats.correct}</span>
                  <span>වැරදි: {stats.wrong}</span>
                  <span>නිවැරදිකම: {stats.accuracy}%</span>
                  <span>අවසන් වරට: {stats.lastPlayed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <section className="dashboard-section">
          <div className="progress-card weak-areas-card" role="region" aria-label="වැඩිදුර දැඩි පුහුණුව අවශ්‍ය අංක">
            <h2>වැඩිදුර දැඩි පුහුණුව අවශ්‍ය අංක</h2>
            <p>{weakAreas.join(', ')}</p>
          </div>
        </section>
      )}

      {/* Activity Timeline */}
      <section className="dashboard-section">
        <div className="progress-card timeline-card" role="region" aria-label="මෑත ක්‍රියාකාරකම්">
          <h2>මෑත ක්‍රියාකාරකම්</h2>
          <div className="timeline-list">
            {timeline.slice(0, 10).map((activity, index) => (
              <div key={index} className="timeline-item">
                <span className="activity-icon">🎮</span>
                <span className="activity-text">{activity.activity}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="dashboard-section">
        <div className="progress-card rewards-card" role="region" aria-label="ප්‍රසාදයන් සහ තරු">
          <h2>ප්‍රසාදයන් සහ තරු</h2>
          <div className="rewards-content">
            <div className="stars-display">
              {'⭐'.repeat(Math.min(rewards.stars, 20))}
            </div>
            <div className="badges-list">
              {rewards.badges.map((badge, index) => (
                <span key={index} className="badge">{badge}</span>
              ))}
            </div>
            <p className="motivational-message">{rewards.message}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DyscalculiaDashboard;
