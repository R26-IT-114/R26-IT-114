const DysgraphiaRewardBox = ({ totalStars = 0, rewardPulse = false }) => (
  <div className='dg-reward-box' aria-label='Reward box'>
    <div className='dg-reward-trophy'>🏆</div>
    <div className='dg-reward-stars-icon'>⭐</div>
    <div className={`dg-reward-count${rewardPulse ? ' dg-reward-pulse' : ''}`}>{totalStars}</div>
    <div className='dg-reward-label'>Stars</div>
  </div>
);

export default DysgraphiaRewardBox;
