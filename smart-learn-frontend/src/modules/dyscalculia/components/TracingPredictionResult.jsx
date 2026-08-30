import AccuracyStars from './AccuracyStars';

const TracingPredictionResult = ({ result, correct, onNext }) => {
  if (!result) return null;
  const predicted = result.predictedNumber ?? result.predicted_digit ?? '—';

  return (
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
};

export default TracingPredictionResult;
