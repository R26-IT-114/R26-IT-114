import { getGameLevels, LEVELS } from './gameLevelProgress';

export const DYSCALCULIA_GAMES = [
  { statKey: 'TracingNumbers', levelKey: 'NumberTracingGame', title: 'අංක ලිවීම (0-9)', subtitle: 'Number Tracing (0-9)', icon: '🐚', route: '/dyscalculia/number-tracing', color: '#159957', colorEnd: '#35d477' },
  { statKey: 'NumberListeningGame', levelKey: 'NumberListeningGame', title: 'අහලා තෝරන්න', subtitle: 'Number Listening', icon: '🐋', route: '/dyscalculia/listening-game', color: '#e7702d', colorEnd: '#ffad1f' },
  { statKey: 'NumberSortingGame', levelKey: 'NumberSortingGame', title: 'අනුපිළිවෙලට', subtitle: 'Number Sorting', icon: '🐠', route: '/dyscalculia/number-sorting', color: '#339392', colorEnd: '#16bfe1' },
  { statKey: 'BalloonPopGame', levelKey: 'BalloonPopGame', title: 'නිවැරදි බැලුනය පොප් කරමු', subtitle: 'Balloon Pop', icon: '🫧', route: '/dyscalculia/balloon-pop', color: '#7542bf', colorEnd: '#c139ef' },
  { statKey: 'SymbolDetectiveGame', levelKey: 'SymbolDetectiveGame', title: 'සංකේත හඳුනමු', subtitle: 'Symbol Detective 🔍', icon: '🦀', route: '/dyscalculia/symbol-detective', color: '#c93255', colorEnd: '#f34e72' },
  { statKey: 'NumberMatchingGame', levelKey: 'NumberMatchingGame', title: 'අංකයට ගැළපෙන ප්‍රමාණය', subtitle: 'Number Matching', icon: '🐙', route: '/dyscalculia/number-matching', color: '#216ab8', colorEnd: '#25b8db' },
];

const EMPTY_STATS = { attempts: 0, correct: 0, lastPlayed: null };
const ADAPTIVE_GAMES = [
  { id: 'adaptive-number-find', gameKey: 'number-find', statKey: 'AdaptiveNumberFindGame', title: 'අලුත් අංක සෙවීම', subtitle: 'දෙන අංකය ඉක්මනින් සොයා තෝරන්න', icon: '🔎' },
  { id: 'adaptive-count-match', gameKey: 'count-match', statKey: 'AdaptiveCountMatchGame', title: 'අලුත් ගණන් ගැළපීම', subtitle: 'ප්‍රමාණයට ගැළපෙන අංකය තෝරන්න', icon: '🧮' },
  { id: 'adaptive-number-order', gameKey: 'number-order', statKey: 'AdaptiveNumberOrderGame', title: 'අලුත් අංක පෙළ', subtitle: 'හිස් තැනට එන ඊළඟ අංකය හඳුනාගන්න', icon: '➡️' },
  { id: 'adaptive-quick-compare', gameKey: 'quick-compare', statKey: 'AdaptiveQuickCompareGame', title: 'අලුත් ඉක්මන් තේරීම', subtitle: 'අංකය ඉක්මනින් හඳුනාගෙන තෝරන්න', icon: '⚡' },
];
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const getProgressStats = (progress, statKey) => {
  const stats = progress?.gameStats?.[statKey] || EMPTY_STATS;
  const attempts = Number(stats.attempts) || 0;
  const correct = Number(stats.correct) || 0;
  return {
    attempts,
    correct,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    lastPlayed: stats.lastPlayed || null,
  };
};

export const getPlayedTimestamp = (game) => {
  const timestamp = Date.parse(game.lastPlayed || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const buildAdaptiveDashboardGames = (progress) => {
  return DYSCALCULIA_GAMES.map((game) => {
    const stats = progress?.gameStats?.[game.statKey] || EMPTY_STATS;
    const attempts = Number(stats.attempts) || 0;
    const correct = Number(stats.correct) || 0;
    const levels = game.levelKey ? getGameLevels(game.levelKey) : null;

    return {
      ...game,
      attempts,
      correct,
      lastPlayed: stats.lastPlayed || null,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      levels,
      completedLevels: levels ? LEVELS.filter((level) => levels[level]?.completed).length : 0,
    };
  });
};

export const getAdaptiveGameQueue = (games) => {
  const unplayedGames = games.filter((game) => game.attempts === 0);
  const practicedGames = games.filter((game) => game.attempts > 0);
  const practiceQueue = [...practicedGames].sort(
    (a, b) => a.accuracy - b.accuracy || getPlayedTimestamp(a) - getPlayedTimestamp(b)
  );

  if (!unplayedGames.length) return practiceQueue;

  const latestPlayedGameIndex = games.reduce((latestIndex, game, index) => {
    const latest = latestIndex >= 0 ? getPlayedTimestamp(games[latestIndex]) : 0;
    const current = getPlayedTimestamp(game);
    return current > latest ? index : latestIndex;
  }, -1);

  if (latestPlayedGameIndex < 0) return [...unplayedGames, ...practiceQueue];

  const nextUnplayedGames = games
    .slice(latestPlayedGameIndex + 1)
    .filter((game) => game.attempts === 0);
  const earlierUnplayedGames = games
    .slice(0, latestPlayedGameIndex + 1)
    .filter((game) => game.attempts === 0);

  return [...nextUnplayedGames, ...earlierUnplayedGames, ...practiceQueue];
};

export const getAdaptiveNextGame = (games) => getAdaptiveGameQueue(games)[0] || null;

export const getFocusedAdaptiveGames = ({ games, progress = null, weakAreas = [], limit = DIGITS.length }) => {
  const focused = [];
  const seen = new Set();
  const add = (item) => {
    if (!item || seen.has(item.id)) return;
    focused.push(item);
    seen.add(item.id);
  };
  const weakNumbers = weakAreas.map(String);
  const numberStats = progress?.numberStats || {};
  const targetNumbers = [
    ...weakNumbers,
    ...DIGITS.filter((digit) => !weakNumbers.includes(digit)),
  ];
  const withAdaptiveStats = (adaptiveGame, target, reason) => {
    const adaptiveStats = getProgressStats(progress, adaptiveGame.statKey);
    const digitStats = numberStats[target] || EMPTY_STATS;
    const digitAttempts = Number(digitStats.attempts) || 0;
    const digitCorrect = Number(digitStats.correct) || 0;
    const digitAccuracy = digitAttempts ? Math.round((digitCorrect / digitAttempts) * 100) : adaptiveStats.accuracy;
    return {
      ...adaptiveGame,
      id: `${adaptiveGame.id}-${target}`,
      title: `අංක ${target} - ${adaptiveGame.title}`,
      subtitle: `${adaptiveGame.subtitle} · අංක ${target}`,
      attempts: digitAttempts || adaptiveStats.attempts,
      correct: digitCorrect || adaptiveStats.correct,
      accuracy: digitAccuracy,
      route: `/dyscalculia/adaptive/${adaptiveGame.gameKey}?target=${target}`,
      reason,
      completedLevels: 0,
    };
  };

  targetNumbers.forEach((number, index) => {
    const adaptiveGame = ADAPTIVE_GAMES[index % ADAPTIVE_GAMES.length];
    add(withAdaptiveStats(
      adaptiveGame,
      number,
      weakNumbers.length
        ? `අංක ${number} සඳහා තෝරාගත් අලුත් adaptive ක්‍රීඩාව.`
        : `ඔබේ ඊළඟ පියවරට අංක ${number} සමඟ ආරම්භ කරන අලුත් ක්‍රීඩාවක්.`
    ));
  });

  return focused.slice(0, limit);
};
