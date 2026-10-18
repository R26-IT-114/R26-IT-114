import { createPortal } from 'react-dom';

const TracingLevelComplete = ({ level, averageAccuracy, onNext }) => {
  const rewardCard = <section className='dc-level-complete' role='status'>
    <span className="dc-feedback-sign" aria-hidden="true">✓</span>
    <h2>මට්ටම සම්පූර්ණයි!</h2>
    <p>{level.charAt(0).toUpperCase() + level.slice(1)} මට්ටම සම්පූර්ණයි</p>
    <strong>Great job!</strong>
    <small>සාමාන්‍ය ලිවීමේ නිරවද්‍යතාව: {averageAccuracy}%</small>
    <button type='button' className='dg-ctl-btn dc-level-next-btn' onClick={onNext}>
      ඊළඟට <span>Next →</span>
    </button>
  </section>;

  if (typeof document === 'undefined') return rewardCard;
  return createPortal(
    <div className='dc-reward-modal' role='dialog' aria-modal='true' aria-label='මට්ටම සම්පූර්ණ කිරීමේ ත්‍යාගය'>
      {rewardCard}
    </div>,
    document.body
  );
};

export default TracingLevelComplete;
