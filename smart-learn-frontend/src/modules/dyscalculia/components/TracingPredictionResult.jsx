import { useCallback, useEffect, useRef } from 'react';
import AccuracyStars from './AccuracyStars';
import RewardArtwork from './RewardArtwork';
import RewardDialog from './RewardDialog';
import rewardTrophy from '../../working-memory/assets/reward-trophy-cartoon-v2.png';
import '../styles/game-result-card.css';

const FEEDBACK_DELAY_MS = 1800;

const TracingPredictionResult = ({ result, correct, onNext, onRetry }) => {
  const nextRef = useRef(onNext);
  const completedResultRef = useRef(null);
  const timerRef = useRef(null);
  nextRef.current = onNext;

  const continueOnce = useCallback(() => {
    if (!result || !correct || completedResultRef.current === result || !nextRef.current) return;
    completedResultRef.current = result;
    window.clearTimeout(timerRef.current);
    nextRef.current();
  }, [result, correct]);

  useEffect(() => {
    if (!result) completedResultRef.current = null;
    if (!result || !correct) return undefined;
    timerRef.current = window.setTimeout(continueOnce, FEEDBACK_DELAY_MS);
    return () => window.clearTimeout(timerRef.current);
  }, [result, correct, continueOnce]);

  if (!result) return null;
  const predicted = result.predictedNumber ?? result.predicted_digit ?? '—';
  const summary = <div className="dc-tracing-celebration__summary">
    <p><strong>ඔයා ලියූ අංකය:</strong> <b className="dc-tracing-celebration__number">{predicted}</b></p>
    <AccuracyStars confidence={result.confidence} />
    <p className="dc-tracing-feedback">{correct ? 'ඔයා හරිම දක්ෂයි!' : 'බය වෙන්න එපා. පුහුණු වෙලා ආයෙත් උත්සාහ කරමු!'}</p>
    {correct && <p className="dc-reward-earned">⭐ ලැබුණු තරු 3</p>}
  </div>;
  const resultCard = <div className={`dc-tracing-result ${correct ? 'is-correct dc-tracing-celebration' : 'is-incorrect'}`} aria-live={correct ? undefined : 'polite'}>
    <header className="dc-tracing-celebration__header">
      {correct ? <img className="dc-tracing-celebration__trophy" src={rewardTrophy} alt="" aria-hidden="true" draggable={false} /> : <span className="dc-reward-feedback-icon" aria-hidden="true">↻</span>}
      <h2 className="dc-reward-heading">{correct ? 'අපූරුයි! අංකය හරි!' : 'අපි ආයෙත් ලියමු!'}</h2>
    </header>
    {correct ? <div className="dc-tracing-celebration__layout"><RewardArtwork value={3} label="ලැබුණු තරු" />{summary}</div> : summary}
    {correct && onNext && <>
      <p className="dc-reward-countdown">අපි තව අංකයක් ලියමු…</p>
      <div className="dc-reward-actions"><button type="button" className="dc-reward-action dc-reward-action--primary" onClick={continueOnce}>තව අංකයක් ලියමු →</button></div>
    </>}
    {!correct && onRetry && <button type="button" className="dc-reward-action" onClick={onRetry}>↻ නැවත ලියමු</button>}
  </div>;

  return correct ? <RewardDialog label="අංකය නිවැරදියි. ඔයාට තරු 3 ක් ලැබුණා!">{resultCard}</RewardDialog> : resultCard;
};

export default TracingPredictionResult;
