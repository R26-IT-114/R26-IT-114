import { createPortal } from 'react-dom';
import AccuracyStars from './AccuracyStars';

const TracingPredictionResult = ({ result, correct, onNext }) => {
  if (!result) return null;
  const predicted = result.predictedNumber ?? result.predicted_digit ?? '—';

  const resultCard = (
    <div className={`dc-tracing-result ${correct ? 'is-correct' : 'is-incorrect'}`} aria-live='polite'>
      <p><strong>හඳුනාගත් අංකය:</strong> {predicted}</p>
      <AccuracyStars confidence={result.confidence} />
      <p className='dc-tracing-feedback'>
        {correct ? '🎉 ඉතා හොඳයි! අංකය නිවැරදිව හඳුනා ගත්තා.' : '🐚 නැවත උත්සාහ කරමු. ඔබට පුළුවන්!'}
      </p>
      {correct && onNext && (
        <button type='button' className='dg-ctl-btn dc-result-next-btn' onClick={onNext}>
          ඊළඟ අංකය තෝරන්න <span>Next →</span>
        </button>
      )}
    </div>
  );

  if (!correct || typeof document === 'undefined') return resultCard;

  return createPortal(
    <div className='dc-reward-modal' role='dialog' aria-modal='true' aria-label='නිවැරදි පිළිතුර සඳහා ත්‍යාගය'>
      <div className='dc-reward-confetti' aria-hidden='true'>✨ ⭐ 🎉 ⭐ ✨</div>
      {resultCard}
    </div>,
    document.body
  );
};

export default TracingPredictionResult;
