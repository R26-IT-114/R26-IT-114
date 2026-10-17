import starImage from '../../../assets/images/dysgraphia/star.png';

const LetterEvaluationFeedback = ({ result }) => {
  if (!result) return null;

  if (!result.isCorrect) {
    return (
      <div className='dg-letter-evaluation dg-letter-evaluation-wrong' role='status'>
        ❌ නැවත උත්සාහ කරන්න!
      </div>
    );
  }

  const starsEarned = Math.max(1, Math.min(3, Number(result.starsEarned) || 1));

  return (
    <div className='dg-letter-evaluation dg-letter-evaluation-correct' role='status'>
      <div>🎉 හොඳයි! අක්ෂරය නිවැරදියි!</div>
      <div className='dg-earned-stars' aria-label={`තරු ${starsEarned}ක් ලැබුණා`}>
        {Array.from({ length: starsEarned }, (_, index) => (
          <img
            key={index}
            className='dg-earned-star'
            src={starImage}
            alt='තරුව'
            style={{ '--dg-star-delay': `${index * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LetterEvaluationFeedback;
