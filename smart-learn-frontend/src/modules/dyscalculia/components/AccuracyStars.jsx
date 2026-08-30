import { accuracyStarsFromConfidence, normalizeConfidencePercent } from '../utils/numberTracingProgress';

const AccuracyStars = ({ confidence, label = 'ලිවීමේ නිරවද්‍යතාව' }) => {
  const percent = normalizeConfidencePercent(confidence);
  const stars = accuracyStarsFromConfidence(confidence);

  if (percent === null || stars === null) return null;

  return (
    <section className='dc-accuracy-card' aria-label={`${label}: ${percent}%, ${stars} out of 5 stars`}>
      <strong>🎯 {label}</strong>
      <span className='dc-accuracy-stars' aria-hidden='true'>
        <span className='dc-accuracy-stars-filled'>{'★'.repeat(stars)}</span>
        <span className='dc-accuracy-stars-empty'>{'☆'.repeat(5 - stars)}</span>
      </span>
      <b>{percent}%</b>
    </section>
  );
};

export default AccuracyStars;
