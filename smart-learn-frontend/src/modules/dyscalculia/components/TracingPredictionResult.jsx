import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AccuracyStars from './AccuracyStars';
import { triggerDyscalculiaReward } from './DyscalculiaRewardBurst';

const TracingPredictionResult = ({ result, correct, onNext }) => {
  const [rewardPhase, setRewardPhase] = useState('popup');

  useEffect(() => {
    if (!result || !correct) {
      setRewardPhase('popup');
      return undefined;
    }

    setRewardPhase('popup');
    const closePopupTimer = window.setTimeout(() => {
      setRewardPhase('collecting');
      triggerDyscalculiaReward();
    }, 1500);
    const showNextTimer = window.setTimeout(() => setRewardPhase('next'), 2750);

    return () => {
      window.clearTimeout(closePopupTimer);
      window.clearTimeout(showNextTimer);
    };
  }, [result, correct]);

  if (!result) return null;
  const predicted = result.predictedNumber ?? result.predicted_digit ?? '—';

  const resultCard = (showNext = false) => (
    <div className={`dc-tracing-result ${correct ? 'is-correct' : 'is-incorrect'}`} aria-live='polite'>
      <p><strong>හඳුනාගත් අංකය:</strong> {predicted}</p>
      <AccuracyStars confidence={result.confidence} />
      <p className='dc-tracing-feedback'>
        {correct ? '🎉 ඉතා හොඳයි! අංකය නිවැරදිව හඳුනා ගත්තා.' : '🐚 නැවත උත්සාහ කරමු. ඔබට පුළුවන්!'}
      </p>
      {correct && onNext && showNext && (
        <button type='button' className='dg-ctl-btn dc-result-next-btn' onClick={onNext}>
          ඊළඟ අංකය තෝරන්න <span>Next →</span>
        </button>
      )}
    </div>
  );

  if (!correct) return resultCard();
  if (typeof document === 'undefined') return resultCard(true);

  if (rewardPhase === 'collecting') return null;

  if (rewardPhase === 'next') {
    return onNext ? (
      <div className='dc-tracing-next-action' aria-live='polite'>
        <button type='button' className='dg-ctl-btn dc-result-next-btn' onClick={onNext}>
          ඊළඟ අංකය තෝරන්න <span>Next →</span>
        </button>
      </div>
    ) : null;
  }

  return createPortal(
    <div className='dc-reward-modal' role='dialog' aria-modal='true' aria-label='නිවැරදි පිළිතුර සඳහා ත්‍යාගය'>
      <div className='dc-reward-confetti' aria-hidden='true'>✨ ⭐ 🎉 ⭐ ✨</div>
      {resultCard()}
    </div>,
    document.body
  );
};

export default TracingPredictionResult;
