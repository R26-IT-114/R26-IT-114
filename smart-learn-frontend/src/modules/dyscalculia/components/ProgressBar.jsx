const ProgressBar = ({ value = 0 }) => {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className='dys-progress'>
      <div className='dys-progress-fill' style={{ width: `${clamped * 100}%` }} />
    </div>
  );
};

export default ProgressBar;
