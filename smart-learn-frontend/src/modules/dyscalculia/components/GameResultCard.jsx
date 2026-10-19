import { useEffect, useId, useRef } from 'react';
import RewardArtwork from './RewardArtwork';
import trophy from '../../working-memory/assets/reward-trophy-cartoon-v2.png';
import rewardStar from '../../working-memory/assets/reward-star-cartoon-v2.png';
import '../styles/game-result-card.css';

const boundedNumber = (value, maximum = Number.MAX_SAFE_INTEGER) => (
  Number.isFinite(Number(value)) ? Math.max(0, Math.min(maximum, Math.round(Number(value)))) : 0
);

export default function GameResultCard({ correct, total, accuracy, stars = 0, rewardStars = stars, attempts, wrongAnswers, durationSeconds, message, onRetry, onLevels, onNext, onJourney, nextLabel = 'ඊළඟ මට්ටම →' }) {
  const headingId = useId();
  const headingRef = useRef(null);
  const questionCount = boundedNumber(total);
  const correctCount = boundedNumber(correct, questionCount);
  const percent = boundedNumber(accuracy ?? (correctCount / Math.max(1, questionCount) * 100), 100);
  const earned = correctCount > 0 ? boundedNumber(stars, 3) : 0;
  const rewards = boundedNumber(rewardStars);
  const encouragement = correctCount === questionCount && questionCount > 0
    ? 'අපූරුයි! ඔක්කොම හරි!'
    : correctCount > 0 ? 'හොඳ උත්සාහයක්!' : 'ආයෙත් උත්සාහ කරමු!';
  const hasDuration = durationSeconds != null && Number.isFinite(Number(durationSeconds)) && Number(durationSeconds) >= 0;

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, []);

  return <section className="dc-game-result dc-result-card dc-ocean-celebration" aria-labelledby={headingId}>
    <div className="dc-celebration-mascot"><RewardArtwork value={rewards} /></div>
    <div className="dc-celebration-summary">
      <header className="dc-celebration-heading">
        <p className="dc-celebration-kicker">🐚 අපේ අංක ගමන</p>
        <img className="dc-celebration-trophy" src={trophy} alt="" aria-hidden="true" />
        <div className="dc-game-result__stars" role="img" aria-label={`තරු 3 න් ${earned} ක්`}>
          {[0, 1, 2].map((i) => <span key={i} className={i < earned ? 'is-earned' : ''} aria-hidden="true"><img src={rewardStar} alt="" /></span>)}
        </div>
        <h1 id={headingId} ref={headingRef} tabIndex={-1}>{encouragement}</h1>
        <p className="dc-result-card__encouragement">{correctCount === questionCount && questionCount > 0 ? 'ඔයා හරිම දක්ෂයි. තවත් සෙල්ලම් කරමු!' : 'පුහුණු වෙන හැම වාරයකම ඔයා තවත් දක්ෂ වෙනවා!'}</p>
        <p className="dc-celebration-accuracy"><span aria-hidden="true">✓</span> {percent}% නිවැරදි</p>
      </header>
      <div className="dc-game-result__stats">
        <div><span className="dc-result-stat-icon" aria-hidden="true">✓</span><strong>{correctCount} / {questionCount}</strong><span>හරි පිළිතුරු</span></div>
        {attempts != null
          ? <div><span className="dc-result-stat-icon" aria-hidden="true">🎯</span><strong>{boundedNumber(attempts)}</strong><span>උත්සාහ කළ වාර</span></div>
          : <div><span className="dc-result-stat-icon" aria-hidden="true">🎯</span><strong>{percent}%</strong><span>නිවැරදි ප්‍රතිශතය</span></div>}
        {wrongAnswers != null && <div><span className="dc-result-stat-icon" aria-hidden="true">🌱</span><strong>{boundedNumber(wrongAnswers)}</strong><span>නැවත උත්සාහ කළ වාර</span></div>}
        {hasDuration && <div><span className="dc-result-stat-icon" aria-hidden="true">⏱</span><strong>{Number(durationSeconds).toFixed(1)}<small> තත්.</small></strong><span>සෙල්ලම් කළ කාලය</span></div>}
      </div>
      {message && <p className="dc-result-card__message">{message}</p>}
      <p className="dc-game-result__reward">⭐ {rewards} ලැබුණු තරු</p>
    </div>
    <div className="dc-game-result__actions">
      {onNext && <button type="button" className="dc-ui-button dc-ui-button--primary" onClick={onNext}>{nextLabel}</button>}
      {onRetry && <button type="button" className="dc-ui-button" onClick={onRetry}>↻ නැවත උත්සාහ කරන්න</button>}
      {onLevels && <button type="button" className="dc-ui-button" onClick={onLevels}>මට්ටම් තෝරන්න</button>}
      {onJourney
        ? <button type="button" className="dc-ui-button dc-result-card__journey" onClick={onJourney}>මගේ ඉගෙනුම් ගමනට යමු</button>
        : <a className="dc-ui-button dc-result-card__journey" href="/dyscalculia/dashboard">මගේ ඉගෙනුම් ගමනට යමු</a>}
    </div>
  </section>;
}
