const DysgraphiaRewardBox = ({ totalStars = 0, rewardPulse = false }) => {
  const totalGems = Math.floor(totalStars / 20);

  return (
    <div className='dg-reward-box' aria-label='Reward box'>
      <div className='dg-reward-trophy'>🏆</div>
      <div className='dg-reward-metrics'>
        <div className='dg-reward-metric'>
          <div className='dg-reward-icon'>⭐</div>
          <div className={`dg-reward-count${rewardPulse ? ' dg-reward-pulse' : ''}`}>{totalStars}</div>
          <div className='dg-reward-label'>Stars</div>
        </div>
        <div className='dg-reward-divider' aria-hidden='true' />
        <div className='dg-reward-metric'>
          <div className='dg-reward-icon'>💎</div>
          <div className='dg-reward-count dg-reward-count--gem'>{totalGems}</div>
          <div className='dg-reward-label'>Gems</div>
        </div>
      </div>
    </div>
  );
};

export default DysgraphiaRewardBox;
