import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Don't show back button on home page
	if (location.pathname === '/') {
		return null;
	}

	const handleBack = () => {
		// Try to go back in history, if not possible go to home
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate('/');
		}
	};

	return (
		<button
			className='back-button'
			onClick={handleBack}
			type='button'
			title='Go back to previous page'
			aria-label='Go back'
		>
			<span className='back-arrow'>←</span>
			<span className='back-label'>Back</span>
		</button>
	);
};

export default BackButton;
