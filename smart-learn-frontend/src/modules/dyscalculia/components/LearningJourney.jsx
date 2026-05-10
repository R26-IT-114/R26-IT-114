import { useMemo } from 'react';

const journeyLevels = [
  {
    key: 'number-learning-tracing',
    label: 'Number Learning & Tracing',
    title: 'අංක 0–9 ඉගෙනීම හා tracing',
    route: 'number-tracing',
    icon: '✏️',
  },
  {
    key: 'number-memory-write',
    label: 'Memory Writing & Evaluation',
    title: 'මතකයෙන් ලියන පුහුණුව (AI)',
    route: 'number-memory-write',
    icon: '🧠',
  },

  {
    key: 'sorting',
    label: 'Sorting',
    title: 'අනුපිළිවෙලට',
    route: 'number-sorting',
    icon: '🧩',
  },
  {
    key: 'listening',
    label: 'Listening',
    title: 'අහලා තෝරන්න',
    route: 'listening-game',
    icon: '🎧',
  },
];

const getCompletionStars = ({ progress, key }) => {
  const accMap = progress?.numberStats || {};
  if (!progress) return 0;

  if (key === 'number-recognition') {
    const best = Object.values(accMap).reduce((m, v) => (v.attempts ? Math.max(m, Math.round((v.correct / v.attempts) * 100)) : m), 0);
    if (best >= 85) return 3;
    if (best >= 60) return 2;
    return best > 0 ? 1 : 0;
  }
  if (key === 'sorting') return Math.min(3, Math.round((progress.gameStats?.NumberSortingGame?.correct ?? 0) / 5));
  if (key === 'listening') return Math.min(3, Math.round((progress.gameStats?.NumberListeningGame?.correct ?? 0) / 5));
  if (key === 'number-learning-tracing') {
    return Math.min(3, Math.round(((progress.gameStats?.TracingNumbersLearning?.correct ?? 0) / 5)));
  }
  if (key === 'number-memory-write') {
    return Math.min(3, Math.round(((progress.gameStats?.NumberMemoryWriting?.correct ?? 0) / 5)));
  }
  return 0;
};


const LearningJourney = ({ progress, navigate }) => {
  const completed = useMemo(() => {
    const p = progress;
    if (!p) return new Set();

    const set = new Set();
    const starsFor = (k) => getCompletionStars({ progress: p, key: k });

    journeyLevels.forEach((lvl) => {
      if (starsFor(lvl.key) >= 2) set.add(lvl.key);
    });
    return set;
  }, [progress]);

  const currentKey = useMemo(() => {
    for (const lvl of journeyLevels) {
      if (!completed.has(lvl.key)) return lvl.key;
    }
    return journeyLevels[0]?.key;
  }, [completed]);

  // FIXED: Proper lock logic - levels must be completed in order
  const getIsLocked = (key, completedSet) => {
    const index = journeyLevels.findIndex(l => l.key === key);
    if (index === 0) return false; // First level always unlocked
    return !completedSet.has(journeyLevels[index - 1].key);
  };

  return (
    <section className="dg-journey">
      <div className="dg-journey-top">
        <div className="dg-journey-title">Learning Journey</div>
        <div className="dg-journey-subtitle">Complete levels to unlock next!</div>
      </div>

      <div className="dg-journey-map" aria-hidden="true" />

      <div className="dg-journey-levels">
        {journeyLevels.map((lvl, idx) => {
          const isCompleted = completed.has(lvl.key);
          const isCurrent = lvl.key === currentKey;
          const isLocked = getIsLocked(lvl.key, completed);

          const stars = getCompletionStars({ progress, key: lvl.key });

          return (
            <button
              key={lvl.key}
              type="button"
              className={`dg-journey-card ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${isLocked ? 'is-locked' : ''}`}
              onClick={() => {
                if (!isLocked) {
                  navigate(`/dyscalculia/${lvl.route}`);
                }
              }}
              disabled={isLocked}
              aria-label={`${lvl.label} ${isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}`}
            >
              <div className="dg-journey-card-top">
                <div className="dg-journey-icon" aria-hidden="true">
                  {lvl.icon}
                </div>
                <div className="dg-journey-index">{idx + 1}</div>
              </div>
              <div className="dg-journey-card-title">{lvl.title}</div>
              <div className="dg-journey-stars" aria-label={`Stars: ${stars} of 3`}>
                {Array.from({ length: stars }, () => '⭐').join('')}
                {stars < 3 ? <span className="dg-journey-star-dim">{Array.from({ length: 3 - stars }, () => '⭐').join('')}</span> : null}




              </div>
              {isCompleted ? (
                <div className="dg-journey-done">Done 🎉</div>
              ) : isCurrent ? (
                <div className="dg-journey-current">&lsquo;Let&apos;s go!&rsquo;</div>

              ) : (
                <div className="dg-journey-locked">Locked 🔒</div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default LearningJourney;