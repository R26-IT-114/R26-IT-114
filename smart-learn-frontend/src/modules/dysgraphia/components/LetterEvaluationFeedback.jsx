const LetterEvaluationFeedback = ({ result }) => {
  if (!result || result.isCorrect) return null;

  return (
    <div className='dg-letter-evaluation dg-letter-evaluation-wrong' role='status'>
      ❌ නැවත උත්සාහ කරන්න!
    </div>
  );
};

export default LetterEvaluationFeedback;
