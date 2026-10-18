export default function GameResultCard({ correct, total, accuracy, stars = 0, rewardStars = stars, message, onRetry, onLevels, onNext, nextLabel = 'ඊළඟ මට්ටම →' }) {
  const earned = Math.max(0, Math.min(3, Math.round(stars)));
  return <section className="dc-game-result" aria-label="ක්‍රීඩා ප්‍රතිඵල">
    <span className="dc-game-result__icon" aria-hidden="true">🏆</span>
    <h1>හොඳින් කළා!</h1>
    {message && <p>{message}</p>}
    <div className="dc-game-result__stars" aria-label={`තරු ${earned} / 3`}>
      {[0, 1, 2].map((i) => <span key={i} className={i < earned ? 'is-earned' : ''} aria-hidden="true">★</span>)}
    </div>
    <div className="dc-game-result__stats">
      <div><strong>{correct} / {total}</strong><span>නිවැරදි පිළිතුරු</span></div>
      <div><strong>{accuracy ?? Math.round((correct / Math.max(1, total)) * 100)}%</strong><span>නිවැරදිතාව</span></div>
    </div>
    <p className="dc-game-result__reward">⭐ {rewardStars} ලැබුණු තරු</p>
    <div className="dc-game-result__actions">
      {onNext && <button type="button" className="dc-ui-button dc-ui-button--primary" onClick={onNext}>{nextLabel}</button>}
      <button type="button" className="dc-ui-button" onClick={onRetry}>↻ නැවත උත්සාහ කරන්න</button>
      <button type="button" className="dc-ui-button" onClick={onLevels}>මට්ටම් තෝරන්න</button>
    </div>
  </section>;
}
