import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/smart-learn-logo.svg';
import useAuth from '../../hooks/useAuth';

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
				<Link className='brand-link' to='/'>
					<img alt='Smart Learn logo' className='brand-logo' src={logo} />
				</Link>

				<nav className='app-nav'>
					<div className='nav-links'>
						<NavLink className='nav-link' to='/'>
							Home
						</NavLink>
						<NavLink className='nav-link' to='/modules'>
							Modules
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
								<span className='account-label'>Account</span>
							</div>

							<button className='nav-logout' disabled={isLoggingOut || isAuthLoading} onClick={handleLogout} type='button'>
								{isLoggingOut ? 'Signing out...' : 'Logout'}
							</button>
						</div>
					) : (
						<div className='auth-actions'>
							<NavLink className='auth-link' to='/login'>
								Account
							</NavLink>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Navbar;
