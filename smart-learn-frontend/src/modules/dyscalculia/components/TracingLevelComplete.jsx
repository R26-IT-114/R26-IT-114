const TracingLevelComplete = ({ level, averageAccuracy, onNext }) => (
  <section className='dc-level-complete' role='status'>
    <span className='dc-level-complete-wave' aria-hidden='true'>🌊</span>
    <h2>Level Complete!</h2>
    <p>{level.charAt(0).toUpperCase() + level.slice(1)} මට්ටම සම්පූර්ණයි</p>
    <div className='dc-level-reward-stars' aria-label='3 game reward stars'>⭐⭐⭐</div>
    <strong>Great job!</strong>
    <small>සාමාන්‍ය ලිවීමේ නිරවද්‍යතාව: {averageAccuracy}%</small>
    <button type='button' className='dg-ctl-btn dc-level-next-btn' onClick={onNext}>
      ඊළඟට <span>Next →</span>
    </button>
  </section>
);

export default TracingLevelComplete;
