import { useMemo } from 'react';

const journeyLevels = [
  {
    key: 'number-recognition',
    label: 'Number Recognition',
    title: 'අංක හඳුනාගැනීම',
    route: 'number/0',
    icon: '🔢',
  },

  {
    key: 'tracing',
    label: 'Tracing',
    title: 'අදින්න/Tracing',
    route: 'review',
    icon: '✏️',
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
  // Light heuristic based on existing stats without changing saving.
  // Each level yields 0-3 stars.
  if (!progress) return 0;

  if (key === 'number-recognition') {
    const best = Object.values(accMap).reduce((m, v) => (v.attempts ? Math.max(m, Math.round((v.correct / v.attempts) * 100)) : m), 0);
    if (best >= 85) return 3;
    if (best >= 60) return 2;
    return best > 0 ? 1 : 0;
  }
  if (key === 'sorting') return Math.min(3, Math.round((progress.gameStats?.NumberSortingGame?.correct ?? 0) / 5));
  if (key === 'listening') return Math.min(3, Math.round((progress.gameStats?.NumberListeningGame?.correct ?? 0) / 5));
  if (key === 'tracing') return Math.min(3, Math.round((progress.gameStats?.TracingNumbers?.correct ?? 0) / 5));
  return 0;
};

const LearningJourney = ({ progress, navigate }) => {
  const completed = useMemo(() => {
    const p = progress;
    const overall = p?.overallStats;
    if (!p || !overall) return new Set();

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
    return journeyLevels[journeyLevels.length - 1]?.key;
  }, [completed]);

  return (
    <section className="dg-journey">
      <div className="dg-journey-top">
        <div className="dg-journey-title">Learning Journey</div>
        <div className="dg-journey-subtitle">Completed → current → locked</div>
      </div>

      <div className="dg-journey-map" aria-hidden="true" />

      <div className="dg-journey-levels">
        {journeyLevels.map((lvl, idx) => {
          const isCompleted = completed.has(lvl.key);
          const isCurrent = lvl.key === currentKey;
          const isLocked = !isCompleted && !isCurrent;

          const stars = getCompletionStars({ progress, key: lvl.key });

          return (
            <button
              key={lvl.key}
              type="button"
              className={`dg-journey-card ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${isLocked ? 'is-locked' : ''}`}
              onClick={() => {
                if (isLocked) return;
                // navigate expects route relative to /dyscalculia
                navigate(`/dyscalculia/${lvl.route}`);
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
                {'⭐'.repeat(stars)}
                {stars < 3 ? <span className="dg-journey-star-dim">{'⭐'.repeat(3 - stars)}</span> : null}
              </div>
              {isLocked ? <div className="dg-journey-locked">Locked</div> : isCurrent ? <div className="dg-journey-current">Let’s go!</div> : <div className="dg-journey-done">Done 🎉</div>}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default LearningJourney;

