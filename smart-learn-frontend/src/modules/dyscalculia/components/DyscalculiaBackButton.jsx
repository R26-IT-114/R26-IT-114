import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const DyscalculiaBackButton = ({
  onClick,
  to,
  variant = 'aqua',
  label = 'ආපසු',
  ariaLabel = 'Dyscalculia activities වෙත ආපසු යන්න',
  className = '',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  const button = (
    <button
      type='button'
      className={`dc-ocean-back-button dc-ocean-back-button--${variant} ${className}`}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <span className='dc-ocean-back-button__arrow' aria-hidden='true'>←</span>
      <span>{label}</span>
    </button>
  );

  // Render at document level so transformed/padded game containers cannot
  // change the button's viewport position.
  return typeof document === 'undefined' ? button : createPortal(button, document.body);
};

export default DyscalculiaBackButton;
