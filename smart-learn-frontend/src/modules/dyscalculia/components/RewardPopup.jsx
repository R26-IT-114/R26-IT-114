const RewardPopup = ({ open, stars = 3, badge = 'Math Explorer', onClose }) => {
  if (!open) return null;

  return (
    <div className='dys-reward-overlay'>
      <div className='dys-reward-card'>
        <h3>Great Job!</h3>
        <p className='dys-stars'>{'⭐'.repeat(Math.max(1, stars))}</p>
        <p>You earned: {badge}</p>
        <button type='button' className='dys-btn dys-btn-primary' onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;
