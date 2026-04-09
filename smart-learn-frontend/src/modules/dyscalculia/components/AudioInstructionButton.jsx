const AudioInstructionButton = ({ onClick, label = 'Sinhala Audio' }) => {
  return (
    <button type='button' className='dys-btn dys-btn-audio' onClick={onClick}>
      🔊 {label}
    </button>
  );
};

export default AudioInstructionButton;
