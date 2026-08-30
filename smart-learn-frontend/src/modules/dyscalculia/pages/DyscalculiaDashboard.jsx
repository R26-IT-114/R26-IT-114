import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import { getActivityTimeline, getDyscalculiaProgress, getNumberRecognitionProgress, getOverallStats, getWeakAreas } from '../utils/dyscalculiaProgress';
import { getGameLevels, LEVELS } from '../utils/gameLevelProgress';
import crabMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/crab-shell.png';
import dolphinMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/dolphin-jump.png';
import turtleMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/turtle-star.png';
import '../styles/dyscalculia-dashboard.css';

const LEVEL_LABELS = { easy: 'පහසු', medium: 'මධ්‍යම', hard: 'අමාරු' };
const GAMES = [
  { statKey: 'TracingNumbers', levelKey: 'NumberTracingGame', title: 'අංක ලියන්න ඉගෙන ගමු', subtitle: 'Number Tracing', icon: '🐚', route: '/dyscalculia/number-tracing', color: '#159957', colorEnd: '#35d477' },
  { statKey: 'NumberListeningGame', levelKey: 'NumberListeningGame', title: 'අහලා නිවැරදි අංකය තෝරමු', subtitle: 'Number Listening', icon: '🐋', route: '/dyscalculia/listening-game', color: '#e7702d', colorEnd: '#ffad1f' },
  { statKey: 'NumberSortingGame', levelKey: 'NumberSortingGame', title: 'අංක අනුපිළිවෙලට සකසමු', subtitle: 'Number Sorting', icon: '🐠', route: '/dyscalculia/number-sorting', color: '#339392', colorEnd: '#16bfe1' },
  { statKey: 'BalloonPopGame', levelKey: 'BalloonPopGame', title: 'නිවැරදි බැලුනය පොප් කරමු', subtitle: 'Balloon Pop', icon: '🫧', route: '/dyscalculia/balloon-pop', color: '#7542bf', colorEnd: '#c139ef' },
  { statKey: 'SymbolDetectiveGame', levelKey: 'SymbolDetectiveGame', title: 'ගණිත සංකේත හඳුනා ගනිමු', subtitle: 'Symbol Detective', icon: '🦀', route: '/dyscalculia/symbol-detective', color: '#c93255', colorEnd: '#f34e72' },
  { statKey: 'NumberMatchingGame', levelKey: 'NumberMatchingGame', title: 'අංකයට ගැළපෙන ප්‍රමාණය සොයමු', subtitle: 'Number Matching', icon: '🐙', route: '/dyscalculia/number-matching', color: '#216ab8', colorEnd: '#25b8db' },
];
const EMPTY_STATS = { attempts: 0, correct: 0 };

const formatActivity = (activity) => {
  const game = GAMES.find(({ statKey }) => activity.activity.includes(statKey));
  return `${game?.title || 'අංක ක්‍රීඩාව'} — ${activity.activity.includes('Correct') ? 'නිවැරදි පිළිතුරක්' : 'පුහුණු වීමක්'}`;
};

const DyscalculiaDashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const loadProgress = useCallback(() => setProgress(getDyscalculiaProgress()), []);

  useEffect(() => {
    loadProgress();
    window.addEventListener('focus', loadProgress);
    window.addEventListener('storage', loadProgress);
    return () => {
      window.removeEventListener('focus', loadProgress);
      window.removeEventListener('storage', loadProgress);
    };
  }, [loadProgress]);

  const dashboardGames = useMemo(() => GAMES.map((game) => {
    const stats = progress?.gameStats?.[game.statKey] || EMPTY_STATS;
    const attempts = Number(stats.attempts) || 0;
    const correct = Number(stats.correct) || 0;
    const levels = getGameLevels(game.levelKey);
    return { ...game, attempts, correct, accuracy: attempts ? Math.round((correct / attempts) * 100) : 0, levels, completedLevels: LEVELS.filter((level) => levels[level]?.completed).length };
  }), [progress]);

  if (!progress) return <main className="dys-dashboard"><div className="dashboard-loading"><div className="loading-spinner" /><p>ප්‍රගතිය සූදානම් කරමින්...</p></div></main>;

  const overall = getOverallStats(progress);
  const numberProgress = getNumberRecognitionProgress(progress);
  const weakAreas = getWeakAreas(progress);
  const timeline = getActivityTimeline(progress).slice(0, 5);
  const completedLevels = dashboardGames.reduce((sum, game) => sum + game.completedLevels, 0);

  return (
    <main className="dys-dashboard adventure-land">
      <AdventureBackdrop station="progress-garden" message="ඔබේ අංක ගමනේ ප්‍රගතිය බලමු! 🌟" />
      <DyscalculiaBackButton to="/dyscalculia" variant="aqua" />
      <div className="dashboard-animal-friends" aria-hidden="true">
        <div className="dashboard-animal dashboard-animal--turtle"><span className="dashboard-animal__sparkle">✨</span><img src={turtleMascot} alt="" /></div>
        <div className="dashboard-animal dashboard-animal--dolphin"><span className="dashboard-animal__bubble">○</span><img src={dolphinMascot} alt="" /></div>
        <div className="dashboard-animal dashboard-animal--crab"><span className="dashboard-animal__sparkle">⭐</span><img src={crabMascot} alt="" /></div>
      </div>
      <div className="dys-dashboard__content">
        <header className="dys-dashboard__hero">
          <div><p className="dys-dashboard__eyebrow">🏝️ BEACH NUMBER ADVENTURE</p><h1>වෙරළේ අංක යාත්‍රාව</h1><p>සෙල්ලම් කරමින් අංක ලෝකයේ ඉදිරියට යමු!</p></div>
          <div className="dys-dashboard__hero-art" aria-hidden="true">🐢<span>⭐</span></div>
        </header>

        <section className="dashboard-summary" aria-label="සමස්ත ප්‍රගතිය">
          <article><span>🎮</span><strong>{overall.totalGames}</strong><small>ක්‍රීඩා වාර</small></article>
          <article><span>✅</span><strong>{overall.totalCorrect}</strong><small>නිවැරදි පිළිතුරු</small></article>
          <article><span>🎯</span><strong>{overall.accuracy}%</strong><small>නිවැරදිකම</small></article>
          <article><span>⭐</span><strong>{overall.starsEarned}</strong><small>ලැබුණු තරු</small></article>
          <article><span>🏆</span><strong>{completedLevels}/18</strong><small>සම්පූර්ණ මට්ටම්</small></article>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-section-title"><div><p>MY LEARNING JOURNEY</p><h2>ඔබේ ක්‍රීඩාව තෝරන්න</h2></div><button type="button" onClick={() => navigate('/dyscalculia')}>සියලු ක්‍රීඩා →</button></div>
          <div className="dashboard-game-grid">
            {dashboardGames.map((game, index) => (
              <article className="dashboard-game-card" key={game.statKey} style={{ '--game-color': game.color, '--game-color-end': game.colorEnd }}>
                <span className="dashboard-game-card__number">{index + 1}</span>
                <div className="dashboard-game-card__top"><span className="dashboard-game-card__icon">{game.icon}</span><div><h3>{game.title}</h3><p>{game.subtitle}</p></div><strong>{game.accuracy}%</strong></div>
                <div className="dashboard-game-card__bar" aria-label={`නිවැරදිකම ${game.accuracy}%`}><span style={{ width: `${game.accuracy}%` }} /></div>
                <div className="dashboard-game-card__stats"><span><b>{game.attempts}</b> උත්සාහ</span><span><b>{game.correct}</b> නිවැරදි</span><span><b>{game.completedLevels}/3</b> මට්ටම්</span></div>
                <div className="dashboard-levels" aria-label="ක්‍රීඩා මට්ටම්">{LEVELS.map((level) => { const state = game.levels[level]; return <span key={level} className={state.completed ? 'is-complete' : state.unlocked ? 'is-open' : 'is-locked'}>{state.completed ? '✓' : state.unlocked ? '●' : '🔒'} {LEVEL_LABELS[level]}</span>; })}</div>
                <button className="dashboard-game-card__play" type="button" onClick={() => navigate(game.route)} aria-label={`${game.title} අරඹන්න`}><span>▶</span></button>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-detail-grid">
          <section className="dashboard-panel dashboard-number-panel">
            <div className="dashboard-section-title"><div><p>NUMBER MASTERY</p><h2>අංක ප්‍රගතිය</h2></div></div>
            <div className="dashboard-number-grid">{Object.entries(numberProgress).map(([number, accuracy]) => <div className="dashboard-number" key={number}><strong>{number}</strong><span><i style={{ height: `${accuracy}%` }} /></span><small>{accuracy}%</small></div>)}</div>
            {weakAreas.length > 0 && <p className="dashboard-practice-tip">💡 තව පුහුණු වෙමු: <b>{weakAreas.join(', ')}</b></p>}
          </section>
          <section className="dashboard-panel dashboard-activity-panel">
            <div className="dashboard-section-title"><div><p>RECENT ACTIVITY</p><h2>මෑත ක්‍රියාකාරකම්</h2></div></div>
            {timeline.length ? <div className="dashboard-activity-list">{timeline.map((activity, index) => <div key={`${activity.time}-${index}`}><span>🎮</span><p><b>{formatActivity(activity)}</b><small>{activity.time}</small></p></div>)}</div> : <div className="dashboard-empty"><span>🌊</span><p>තවම ක්‍රීඩාවක් කරලා නැහැ.</p><button type="button" onClick={() => navigate('/dyscalculia')}>පළමු ක්‍රීඩාව අරඹන්න</button></div>}
          </section>
        </div>
      </div>
    </main>
  );
};

export default DyscalculiaDashboard;
