const ChoiceButton = ({ children, selected, onClick, disabled }) => {
  return (
    <button
      type='button'
      className={`dys-choice ${selected ? 'is-selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ChoiceButton;
