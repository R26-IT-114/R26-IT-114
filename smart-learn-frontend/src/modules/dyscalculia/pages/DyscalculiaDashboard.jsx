import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DyscalculiaBackButton from '../components/DyscalculiaBackButton';
import { AdventureBackdrop } from '../components/NumberAdventureLand';
import { getActivityTimeline, getDyscalculiaProgress, getNumberRecognitionProgress, getOverallStats, getWeakAreas } from '../utils/dyscalculiaProgress';
import { LEVELS } from '../utils/gameLevelProgress';
import { buildAdaptiveDashboardGames, DYSCALCULIA_GAMES, getFocusedAdaptiveGames } from '../utils/adaptiveGameRecommendations';
import crabMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/crab-shell.png';
import dolphinMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/dolphin-jump.png';
import turtleMascot from '../../../assets/images/dyscalculiaimages/dashboard-animals/turtle-star.png';
import '../styles/dyscalculia-dashboard.css';

const LEVEL_LABELS = { easy: 'පහසු', medium: 'මධ්‍යම', hard: 'අමාරු' };

const formatActivity = (activity) => {
  const game = DYSCALCULIA_GAMES.find(({ statKey }) => activity.activity.includes(statKey));
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

  const dashboardGames = useMemo(() => buildAdaptiveDashboardGames(progress), [progress]);

  if (!progress) return <main className="dys-dashboard"><div className="dashboard-loading"><div className="loading-spinner" /><p>ප්‍රගතිය සූදානම් කරමින්...</p></div></main>;

  const overall = getOverallStats(progress);
  const numberProgress = getNumberRecognitionProgress(progress);
  const weakAreas = getWeakAreas(progress);
  const timeline = getActivityTimeline(progress).slice(0, 5);
  const completedLevels = dashboardGames.reduce((sum, game) => sum + game.completedLevels, 0);
  const totalTrackableLevels = dashboardGames.filter((game) => game.levels).length * LEVELS.length;
  const practicedGames = dashboardGames.filter((game) => game.attempts > 0);
  const strongGames = practicedGames.filter((game) => game.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy);
  const practiceGames = practicedGames.filter((game) => game.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
  const recommendedGames = getFocusedAdaptiveGames({ games: dashboardGames, progress, weakAreas, limit: 10 });
  const latestRecommendedGame = recommendedGames[0] || null;

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
          <article><span>🏆</span><strong>{completedLevels}/{totalTrackableLevels}</strong><small>සම්පූර්ණ මට්ටම්</small></article>
        </section>

        <section className="dashboard-panel dashboard-learning-panel">
          <div className="dashboard-section-title"><div><p>NUMBER LEARNING</p><h2>🔢 මං ඉගෙන ගන්න අංක</h2></div></div>
          <div className="dashboard-learning-grid">
            {Object.entries(numberProgress).map(([number, accuracy]) => {
              const needsPractice = weakAreas.map(String).includes(String(number));
              const status = accuracy >= 70 ? 'is-strong' : needsPractice || accuracy > 0 ? 'needs-practice' : 'not-started';
              return <article className={`dashboard-learning-card ${status}`} key={number}><div><strong>{number}</strong><span>{accuracy >= 70 ? 'සුපිරි වැඩක්!' : accuracy > 0 ? 'තව පුහුණු වෙමු' : 'පටන් ගමු'}</span></div><div className="dashboard-learning-progress"><i style={{ width: `${accuracy}%` }} /></div><small><b>{accuracy}%</b> නිවැරදිකම</small></article>;
            })}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-section-title"><div><p>MY LEARNING JOURNEY</p><h2>ඔබේ ක්‍රීඩාව තෝරන්න</h2></div><button type="button" onClick={() => navigate('/dyscalculia')}>සියලු ක්‍රීඩා →</button></div>
          <div className="dashboard-game-grid">
            {dashboardGames.map((game, index) => (
              <article className="dashboard-game-card" key={game.statKey} style={{ '--game-color': game.color, '--game-color-end': game.colorEnd }}>
                <span className="dashboard-game-card__number">{index + 1}</span>
                <div className="dashboard-game-card__top"><span className="dashboard-game-card__icon">{game.icon}</span><div><h3>{game.title}</h3><p>{game.subtitle}</p></div><strong>{game.accuracy}%</strong></div>
                <div className="dashboard-game-card__bar" aria-label={`නිවැරදිකම ${game.accuracy}%`}><span style={{ width: `${game.accuracy}%` }} /></div>
                <div className="dashboard-game-card__stats"><span><b>{game.attempts}</b> උත්සාහ</span><span><b>{game.correct}</b> නිවැරදි</span>{game.levels ? <span><b>{game.completedLevels}/3</b> මට්ටම්</span> : <span><b>●</b> තනි ක්‍රියාකාරකම</span>}</div>
                {game.levels ? <div className="dashboard-levels" aria-label="ක්‍රීඩා මට්ටම්">{LEVELS.map((level) => { const state = game.levels[level]; return <span key={level} className={state.completed ? 'is-complete' : state.unlocked ? 'is-open' : 'is-locked'}>{state.completed ? '✓' : state.unlocked ? '●' : '🔒'} {LEVEL_LABELS[level]}</span>; })}</div> : <div className="dashboard-levels dashboard-levels--single"><span className={game.attempts ? 'is-complete' : 'is-open'}>{game.attempts ? '✓ පුහුණු කළා' : '● ආරම්භ කරන්න'}</span></div>}
                <button className="dashboard-game-card__play" type="button" onClick={() => navigate(game.route)} aria-label={`${game.title} අරඹන්න`}><span>▶</span></button>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-insight-grid">
          <section className="dashboard-panel dashboard-insight-panel dashboard-insight-panel--practice">
            <div className="dashboard-section-title"><div><p>KEEP PRACTISING</p><h2>🌱 තව පුහුණු වෙන්න ඕන දේවල්</h2></div></div>
            {practiceGames.length || weakAreas.length ? <div className="dashboard-insight-list">{practiceGames.map((game) => <button type="button" key={game.statKey} onClick={() => navigate(game.route)}><span>{game.icon}</span><b>{game.title}</b><small>{game.accuracy}% · පුහුණු වෙමු →</small></button>)}{weakAreas.length > 0 && <p>🔢 තව පුහුණු කළ යුතු අංක: <b>{weakAreas.join(', ')}</b></p>}</div> : <div className="dashboard-insight-empty">දැනට අමාරු කොටස් නැහැ. නියමයි! 🎉</div>}
          </section>
          <section className="dashboard-panel dashboard-insight-panel dashboard-insight-panel--strong">
            <div className="dashboard-section-title"><div><p>MY STRENGTHS</p><h2>🌈 මම හොඳට කරන දේවල්</h2></div></div>
            {strongGames.length ? <div className="dashboard-strong-list">{strongGames.slice(0, 5).map((game) => <p key={game.statKey}><span>{game.icon}</span><b>{game.title}</b><strong>{game.accuracy}% ⭐</strong></p>)}</div> : <div className="dashboard-insight-empty">පුහුණු වෙනකොට ඔබේ ජයග්‍රහණ මෙතන පෙන්වයි.</div>}
          </section>
        </div>

        <section className="dashboard-panel dashboard-recommend-panel">
          <div className="dashboard-section-title"><div><p>BEST FIT FOR YOU</p><h2>🎮 මේ ප්‍රගතියට ගැළපෙන ක්‍රීඩා</h2></div>{latestRecommendedGame && <button type="button" onClick={() => navigate(latestRecommendedGame.route)}>අලුත්ම ක්‍රීඩාවට →</button>}</div>
          {recommendedGames.length ? <div className="adaptive-fit-grid dashboard-fit-grid">{recommendedGames.map((game, index) => <article className={index === 0 ? 'adaptive-fit-card is-best' : 'adaptive-fit-card'} key={game.id}><span>{game.icon}</span><div><h3>{game.title}</h3><p>{game.reason}</p><small>{game.attempts} උත්සාහ · {game.accuracy}% නිවැරදිකම</small></div><button type="button" onClick={() => navigate(game.route)}>{index === 0 ? 'අලුත්ම ක්‍රීඩාවට' : 'පටන් ගමු'}</button></article>)}</div> : <p className="dashboard-insight-empty">නව නිර්දේශයක් සූදානම් කරමින්... 🌊</p>}
        </section>

        <section className="dashboard-panel dashboard-activity-panel dashboard-activity-panel--wide">
          <div className="dashboard-section-title"><div><p>RECENT ACTIVITY</p><h2>🕒 මෑත ක්‍රියාකාරකම්</h2></div></div>
          {timeline.length ? <div className="dashboard-activity-list">{timeline.map((activity, index) => <div key={`${activity.time}-${index}`}><span>🎮</span><p><b>{formatActivity(activity)}</b><small>{activity.time}</small></p></div>)}</div> : <div className="dashboard-empty"><span>🌊</span><p>තවම ක්‍රීඩාවක් කරලා නැහැ.</p><button type="button" onClick={() => navigate('/dyscalculia')}>පළමු ක්‍රීඩාව අරඹන්න</button></div>}
          <div className="dashboard-footer-actions"><button type="button" onClick={() => navigate('/dyscalculia')}>ක්‍රීඩාවක් තෝරන්න</button><button type="button" onClick={loadProgress}>ප්‍රගතිය අලුත් කරන්න</button></div>
          </section>
      </div>
    </main>
  );
};

export default DyscalculiaDashboard;
