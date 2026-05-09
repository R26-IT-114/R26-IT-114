const STORAGE_KEY = 'smartlearn_dyscalculia_progress';

// Initialize progress data structure
const initializeProgress = () => ({
  sessions: [],
  overallStats: {
    totalGames: 0,
    totalCorrect: 0,
    totalAttempts: 0,
    starsEarned: 0,
    levelsCompleted: 0
  },
  numberStats: {
    '0': { attempts: 0, correct: 0 },
    '1': { attempts: 0, correct: 0 },
    '2': { attempts: 0, correct: 0 },
    '3': { attempts: 0, correct: 0 },
    '4': { attempts: 0, correct: 0 },
    '5': { attempts: 0, correct: 0 },
    '6': { attempts: 0, correct: 0 },
    '7': { attempts: 0, correct: 0 },
    '8': { attempts: 0, correct: 0 },
    '9': { attempts: 0, correct: 0 }
  },
  gameStats: {
    'NumberListeningGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'BalloonPopGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'NumberSortingGame': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null },
    'TracingNumbers': { attempts: 0, correct: 0, wrong: 0, lastPlayed: null }
  },
  rewards: {
    stars: 0,
    badges: [],
    streak: 0,
    lastActivity: null
  }
});

// Get progress data from localStorage
export const getDyscalculiaProgress = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initializeProgress();
  } catch (error) {
    console.error('Error loading progress:', error);
    return initializeProgress();
  }
};

// Save progress data to localStorage
export const saveDyscalculiaProgress = (progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

const GAME_TYPE_ALIASES = {
  NumberListeningGame: 'NumberListeningGame',
  'Number Listening Game': 'NumberListeningGame',
  BalloonPopGame: 'BalloonPopGame',
  'Balloon Pop Game': 'BalloonPopGame',
  NumberSortingGame: 'NumberSortingGame',
  'Number Sorting Game': 'NumberSortingGame',
  TracingNumbers: 'TracingNumbers',
  'Number Tracing Game': 'TracingNumbers'
};

// Save game session data
export const saveGameSession = (sessionData) => {
  const progress = getDyscalculiaProgress();
  const normalizedGameType = GAME_TYPE_ALIASES[sessionData.gameType] || sessionData.gameType;

  // Add session to sessions array
  progress.sessions.push({
    ...sessionData,
    gameType: normalizedGameType,
    playedAt: new Date().toISOString()
  });

  // Update overall stats
  progress.overallStats.totalGames += 1;
  progress.overallStats.totalAttempts += sessionData.attempts || 1;
  if (sessionData.correct) {
    progress.overallStats.totalCorrect += 1;
  }
  if (sessionData.completed) {
    progress.overallStats.levelsCompleted += 1;
  }

  // Update number stats
  if (sessionData.targetNumber !== undefined) {
    const num = sessionData.targetNumber.toString();
    if (progress.numberStats[num]) {
      progress.numberStats[num].attempts += 1;
      if (sessionData.correct) {
        progress.numberStats[num].correct += 1;
      }
    }
  }

  // Update game stats
  if (progress.gameStats[sessionData.gameType]) {
    const gameStat = progress.gameStats[sessionData.gameType];
    gameStat.attempts += 1;
    if (sessionData.correct) {
      gameStat.correct += 1;
    } else {
      gameStat.wrong += 1;
    }
    gameStat.lastPlayed = new Date().toISOString();
  }

  // Update rewards
  if (sessionData.correct) {
    progress.rewards.stars += 1;
    progress.rewards.streak += 1;
  } else {
    progress.rewards.streak = 0;
  }
  progress.rewards.lastActivity = new Date().toISOString();

  // Add badges based on achievements
  if (progress.overallStats.totalCorrect >= 10 && !progress.rewards.badges.includes('First Steps')) {
    progress.rewards.badges.push('First Steps');
  }
  if (progress.rewards.streak >= 5 && !progress.rewards.badges.includes('Streak Master')) {
    progress.rewards.badges.push('Streak Master');
  }

  saveDyscalculiaProgress(progress);
  return progress;
};

// Get overall stats for dashboard
export const getOverallStats = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const accuracy = p.overallStats.totalAttempts > 0
    ? Math.round((p.overallStats.totalCorrect / p.overallStats.totalAttempts) * 100)
    : 0;

  return {
    totalGames: p.overallStats.totalGames,
    totalCorrect: p.overallStats.totalCorrect,
    accuracy,
    starsEarned: p.rewards.stars,
    levelsCompleted: p.overallStats.levelsCompleted
  };
};

// Get number recognition progress
export const getNumberRecognitionProgress = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const result = {};

  for (let i = 0; i <= 9; i++) {
    const num = i.toString();
    const stats = p.numberStats[num];
    result[num] = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  }

  return result;
};

// Get game performance stats
export const getGamePerformance = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const result = {};

  Object.entries(p.gameStats).forEach(([gameType, stats]) => {
    const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
    const lastPlayed = stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never';

    result[gameType] = {
      attempts: stats.attempts,
      correct: stats.correct,
      wrong: stats.wrong,
      accuracy,
      lastPlayed
    };
  });

  return result;
};

// Detect weak areas (numbers with < 70% accuracy and > 5 attempts)
export const getWeakAreas = (progress) => {
  const numberProgress = getNumberRecognitionProgress(progress);
  return Object.entries(numberProgress)
    .filter(([num, accuracy]) => accuracy < 70 && progress.numberStats[num].attempts > 5)
    .map(([num]) => num);
};

// Get activity timeline (recent sessions)
export const getActivityTimeline = (progress) => {
  const p = progress || getDyscalculiaProgress();
  return p.sessions
    .slice(-20)
    .reverse()
    .map(session => ({
      activity: `Played ${session.gameType} - ${session.correct ? 'Correct' : 'Incorrect'}`,
      time: new Date(session.playedAt).toLocaleString()
    }));
};

// Get rewards data
export const getRewards = (progress) => {
  const p = progress || getDyscalculiaProgress();
  const messages = [
    'ඉහළට යන්න! ඔබේ ප්‍රගතිය අසාමාන්‍යයි!',
    'ඔබේ උත්සාහයට ස්තුතියි! තවත් ඉගෙන ගන්න!',
    'අංක රාජ්‍යයේ රජු වීමට මාර්ගයේ සිටිනවා!',
    'ඔබේ දැනුම වැඩි වෙමින් පවතිනවා!'
  ];

  return {
    stars: p.rewards.stars,
    badges: p.rewards.badges,
    streak: p.rewards.streak,
    message: messages[Math.floor(Math.random() * messages.length)]
  };
};

// Reset progress (for testing or restart)
export const resetProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};