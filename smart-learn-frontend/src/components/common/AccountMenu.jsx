import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../styles/navbar-account-menu.css';


const AccountMenu = () => {
	const navigate = useNavigate();
	const { logout, isAuthLoading, user } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleToggle = () => setIsOpen((v) => !v);

	const handleDashboard = () => {
		setIsOpen(false);
		navigate('/dyscalculia/dashboard');
	};

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			navigate('/login');
		} finally {
			setIsLoggingOut(false);
			setIsOpen(false);
		}
	};

	return (
		<div className='auth-panel'>
			<button
				type='button'
				className='account-chip account-chip--menu'
				aria-haspopup='menu'
				aria-expanded={isOpen}
				onClick={handleToggle}
			>
				{user?.photoURL ? (
					<img alt='Profile avatar' className='account-photo' src={user.photoURL} />
				) : (
					<div className='account-avatar'>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</div>
				)}
				<span className='account-label'>ගිණුම</span>
				<span className='account-caret' aria-hidden='true'>▾</span>
			</button>

			{isOpen && (
				<div className='account-dropdown' role='menu'>
					<button type='button' role='menuitem' className='account-dropdown-item' onClick={handleDashboard}>
						Dashboard / Progress
					</button>
					<div className='account-dropdown-divider' role='separator' />
					<button
						type='button'
						role='menuitem'
						className='account-dropdown-item account-dropdown-item--danger'
						disabled={isLoggingOut || isAuthLoading}
						onClick={handleLogout}
					>
						{isLoggingOut ? 'ඉවත් වෙමින්...' : 'ඉවත් වන්න'}
					</button>

				</div>
			)}
		</div>
	);
};

export default AccountMenu;

