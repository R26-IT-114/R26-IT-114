import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logos/logo without back.png';
import useAuth from '../../hooks/useAuth';
import BackButton from './BackButton';

const Navbar = () => {
	const navigate = useNavigate();
	const { isAuthenticated, isAuthLoading, logout, user } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			navigate('/login');
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<header className='app-navbar'>
			<div className='container app-navbar-inner'>
				<BackButton />
				
				<Link className='brand-link' to='/'>
					<img alt='Smart Learn logo' className='brand-logo' src={logo} />
				</Link>

				<nav className='app-nav'>
					<div className='nav-links'>
						<NavLink className='nav-link' to='/'>
							මුල් පිටුව
						</NavLink>
						<NavLink className='nav-link' to='/modules'>
							මොඩියුල
						</NavLink>
					</div>
				</nav>

				<div className='app-nav-right'>
					{isAuthenticated ? (
						<div className='auth-panel'>
							<div className='account-chip'>
								{user?.photoURL ? (
									<img alt='Profile avatar' className='account-photo' src={user.photoURL} />
								) : (
									<div className='account-avatar'>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</div>
								)}
								<span className='account-label'>ගිණුම</span>
							</div>

							<button className='nav-logout' disabled={isLoggingOut || isAuthLoading} onClick={handleLogout} type='button'>
								{isLoggingOut ? 'ඉවත් වෙමින්...' : 'ඉවත් වන්න'}
							</button>
						</div>
					) : (
						<div className='auth-actions'>
							<NavLink className='auth-link' to='/login'>
								ගිණුම
							</NavLink>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Navbar;
