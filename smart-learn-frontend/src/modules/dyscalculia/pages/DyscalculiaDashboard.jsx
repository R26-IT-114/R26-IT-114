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

const COPY = {
  si: {
    switchLanguage: 'English Medium', loading: 'ප්‍රගතිය සූදානම් කරමින්...', backdrop: 'ඔබේ අංක ගමනේ ප්‍රගතිය බලමු! 🌟', eyebrow: '🏝️ වෙරළේ අංක වික්‍රමය', title: 'වෙරළේ අංක යාත්‍රාව', subtitle: 'සෙල්ලම් කරමින් අංක ලෝකයේ ඉදිරියට යමු!',
    summary: 'සමස්ත ප්‍රගතිය', gamesPlayed: 'ක්‍රීඩා වාර', correctAnswers: 'නිවැරදි පිළිතුරු', accuracy: 'නිවැරදිකම', stars: 'ලැබුණු තරු', completedLevels: 'සම්පූර්ණ මට්ටම්', journey: 'මගේ ඉගෙනුම් ගමන', chooseGame: 'ඔබේ ක්‍රීඩාව තෝරන්න', allGames: 'සියලු ක්‍රීඩා →', attempts: 'උත්සාහ', correct: 'නිවැරදි', levels: 'මට්ටම්', gameLevels: 'ක්‍රීඩා මට්ටම්', start: 'අරඹන්න',
    levelLabels: LEVEL_LABELS, numberMastery: 'අංක දැනුම', numberProgress: 'අංක ප්‍රගතිය', practiceMore: 'තව පුහුණු වෙමු:', recentActivity: 'මෑත ක්‍රියාකාරකම්', noActivity: 'තවම ක්‍රීඩාවක් කරලා නැහැ.', firstGame: 'පළමු ක්‍රීඩාව අරඹන්න', gameTitles: DYSCALCULIA_GAMES.map((game) => game.title), activityGame: 'අංක ක්‍රීඩාව', correctActivity: 'නිවැරදි පිළිතුරක්', practiceActivity: 'පුහුණු වීමක්',
  },
  en: {
    switchLanguage: 'සිංහල මාධ්‍යය', loading: 'Preparing your progress...', backdrop: 'Let’s see your number-journey progress! 🌟', eyebrow: '🏝️ BEACH NUMBER ADVENTURE', title: 'Beach Number Voyage', subtitle: 'Play and move forward through the world of numbers!',
    summary: 'Overall progress', gamesPlayed: 'Games played', correctAnswers: 'Correct answers', accuracy: 'Accuracy', stars: 'Stars earned', completedLevels: 'Levels completed', journey: 'MY LEARNING JOURNEY', chooseGame: 'Choose your game', allGames: 'All games →', attempts: 'Attempts', correct: 'Correct', levels: 'Levels', gameLevels: 'Game levels', start: 'Start',
    levelLabels: { easy: 'Easy', medium: 'Medium', hard: 'Hard' }, numberMastery: 'NUMBER MASTERY', numberProgress: 'Number progress', practiceMore: 'Practise more:', recentActivity: 'Recent activity', noActivity: 'No games played yet.', firstGame: 'Start your first game', gameTitles: ['Learn to trace numbers', 'Listen and choose the correct number', 'Arrange numbers in order', 'Pop the correct balloon', 'Identify mathematical symbols', 'Match numbers with quantities'], activityGame: 'Number game', correctActivity: 'Correct answer', practiceActivity: 'Practice attempt',
  },
};

const formatActivity = (activity, copy, language) => {
  const game = DYSCALCULIA_GAMES.find(({ statKey }) => activity.activity.includes(statKey));
  const gameIndex = DYSCALCULIA_GAMES.findIndex(({ statKey }) => statKey === game?.statKey);
  const gameTitle = language === 'en' ? copy.gameTitles[gameIndex] : game?.title;
  return `${gameTitle || copy.activityGame} — ${activity.activity.includes('Correct') ? copy.correctActivity : copy.practiceActivity}`;
};

const DyscalculiaDashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [language, setLanguage] = useState('si');
  const copy = COPY[language];
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

  if (!progress) return <main className="dys-dashboard"><div className="dashboard-loading"><div className="loading-spinner" /><p>{copy.loading}</p></div></main>;

  const overall = getOverallStats(progress);
  const numberProgress = getNumberRecognitionProgress(progress);
  const weakAreas = getWeakAreas(progress);
  const timeline = getActivityTimeline(progress).slice(0, 5);
  const completedLevels = dashboardGames.reduce((sum, game) => sum + game.completedLevels, 0);
  const recommendedGames = getFocusedAdaptiveGames({ games: dashboardGames, progress, weakAreas, limit: 10 });
  const latestRecommendedGame = recommendedGames[0] || null;

  return (
    <main className="dys-dashboard adventure-land">
      <AdventureBackdrop station="progress-garden" message={copy.backdrop} />
      <DyscalculiaBackButton to="/dyscalculia" variant="aqua" />
      <button type="button" className="fixed right-4 top-24 z-[110] rounded-full border-2 border-white/90 bg-white px-5 py-3 text-sm font-black text-sky-800 shadow-[0_7px_0_rgba(30,64,175,.25)] transition hover:-translate-y-1 sm:right-8 sm:top-8" onClick={() => setLanguage((current) => current === 'si' ? 'en' : 'si')}>{copy.switchLanguage}</button>
      <div className="dashboard-animal-friends" aria-hidden="true">
        <div className="dashboard-animal dashboard-animal--turtle"><span className="dashboard-animal__sparkle">✨</span><img src={turtleMascot} alt="" /></div>
        <div className="dashboard-animal dashboard-animal--dolphin"><span className="dashboard-animal__bubble">○</span><img src={dolphinMascot} alt="" /></div>
        <div className="dashboard-animal dashboard-animal--crab"><span className="dashboard-animal__sparkle">⭐</span><img src={crabMascot} alt="" /></div>
      </div>
      <div className="dys-dashboard__content">
        <header className="dys-dashboard__hero">
          <div><p className="dys-dashboard__eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
          <div className="dys-dashboard__hero-art" aria-hidden="true">🐢<span>⭐</span></div>
        </header>

        <section className="dashboard-summary" aria-label={copy.summary}>
          <article><span>🎮</span><strong>{overall.totalGames}</strong><small>{copy.gamesPlayed}</small></article>
          <article><span>✅</span><strong>{overall.totalCorrect}</strong><small>{copy.correctAnswers}</small></article>
          <article><span>🎯</span><strong>{overall.accuracy}%</strong><small>{copy.accuracy}</small></article>
          <article><span>⭐</span><strong>{overall.starsEarned}</strong><small>{copy.stars}</small></article>
          <article><span>🏆</span><strong>{completedLevels}/18</strong><small>{copy.completedLevels}</small></article>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-section-title"><div><p>{copy.journey}</p><h2>{copy.chooseGame}</h2></div><button type="button" onClick={() => navigate('/dyscalculia')}>{copy.allGames}</button></div>
          <div className="dashboard-game-grid">
            {dashboardGames.map((game, index) => (
              <article className="dashboard-game-card" key={game.statKey} style={{ '--game-color': game.color, '--game-color-end': game.colorEnd }}>
                <span className="dashboard-game-card__number">{index + 1}</span>
                <div className="dashboard-game-card__top"><span className="dashboard-game-card__icon">{game.icon}</span><div><h3>{copy.gameTitles[index] || game.title}</h3><p>{game.subtitle}</p></div><strong>{game.accuracy}%</strong></div>
                <div className="dashboard-game-card__bar" aria-label={`${copy.accuracy} ${game.accuracy}%`}><span style={{ width: `${game.accuracy}%` }} /></div>
                <div className="dashboard-game-card__stats"><span><b>{game.attempts}</b> {copy.attempts}</span><span><b>{game.correct}</b> {copy.correct}</span><span><b>{game.completedLevels}/3</b> {copy.levels}</span></div>
                <div className="dashboard-levels" aria-label={copy.gameLevels}>{LEVELS.map((level) => { const state = game.levels[level]; return <span key={level} className={state.completed ? 'is-complete' : state.unlocked ? 'is-open' : 'is-locked'}>{state.completed ? '✓' : state.unlocked ? '●' : '🔒'} {copy.levelLabels[level]}</span>; })}</div>
                <button className="dashboard-game-card__play" type="button" onClick={() => navigate(game.route)} aria-label={`${copy.gameTitles[index] || game.title} ${copy.start}`}><span>▶</span></button>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-detail-grid">
          <section className="dashboard-panel dashboard-number-panel">
            <div className="dashboard-section-title"><div><p>{copy.numberMastery}</p><h2>{copy.numberProgress}</h2></div></div>
            <div className="dashboard-number-grid">{Object.entries(numberProgress).map(([number, accuracy]) => <div className="dashboard-number" key={number}><strong>{number}</strong><span><i style={{ height: `${accuracy}%` }} /></span><small>{accuracy}%</small></div>)}</div>
            {weakAreas.length > 0 && <p className="dashboard-practice-tip">💡 {copy.practiceMore} <b>{weakAreas.join(', ')}</b></p>}
          </section>
          <section className="dashboard-panel dashboard-activity-panel">
            <div className="dashboard-section-title"><div><p>{copy.recentActivity.toUpperCase()}</p><h2>{copy.recentActivity}</h2></div></div>
            {timeline.length ? <div className="dashboard-activity-list">{timeline.map((activity, index) => <div key={`${activity.time}-${index}`}><span>🎮</span><p><b>{formatActivity(activity, copy, language)}</b><small>{activity.time}</small></p></div>)}</div> : <div className="dashboard-empty"><span>🌊</span><p>{copy.noActivity}</p><button type="button" onClick={() => navigate('/dyscalculia')}>{copy.firstGame}</button></div>}
          </section>
        </div>

        <section className="dashboard-panel dashboard-recommend-panel">
          <div className="dashboard-section-title"><div><p>BEST FIT FOR YOU</p><h2>🎮 මේ ප්‍රගතියට ගැළපෙන ක්‍රීඩා</h2></div>{latestRecommendedGame && <button type="button" onClick={() => navigate(latestRecommendedGame.route)}>අලුත්ම ක්‍රීඩාවට →</button>}</div>
          {recommendedGames.length ? <div className="adaptive-fit-grid dashboard-fit-grid">{recommendedGames.map((game, index) => <article className={index === 0 ? 'adaptive-fit-card is-best' : 'adaptive-fit-card'} key={game.id}><span>{game.icon}</span><div><h3>{game.title}</h3><p>{game.reason}</p><small>{game.attempts} උත්සාහ · {game.accuracy}% නිවැරදිකම</small></div><button type="button" onClick={() => navigate(game.route)}>{index === 0 ? 'අලුත්ම ක්‍රීඩාවට' : 'පටන් ගමු'}</button></article>)}</div> : <p className="dashboard-insight-empty">නව නිර්දේශයක් සූදානම් කරමින්... 🌊</p>}
        </section>

        <section className="dashboard-panel dashboard-activity-panel dashboard-activity-panel--wide">
          <div className="dashboard-section-title"><div><p>RECENT ACTIVITY</p><h2>🕒 මෑත ක්‍රියාකාරකම්</h2></div></div>
          {timeline.length ? <div className="dashboard-activity-list">{timeline.map((activity, index) => <div key={`${activity.time}-${index}`}><span>🎮</span><p><b>{formatActivity(activity, copy, language)}</b><small>{activity.time}</small></p></div>)}</div> : <div className="dashboard-empty"><span>🌊</span><p>{copy.noActivity}</p><button type="button" onClick={() => navigate('/dyscalculia')}>{copy.firstGame}</button></div>}
          <div className="dashboard-footer-actions"><button type="button" onClick={() => navigate('/dyscalculia')}>ක්‍රීඩාවක් තෝරන්න</button><button type="button" onClick={loadProgress}>ප්‍රගතිය අලුත් කරන්න</button></div>
          </section>
      </div>
    </main>
  );
};

export default DyscalculiaDashboard;
