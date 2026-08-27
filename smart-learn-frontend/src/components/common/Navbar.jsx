import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CircleUserRound, Grid3X3, House, LogOut, X, LayoutDashboard } from 'lucide-react';
import logo from '../../assets/images/logo without back.png';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, isAuthLoading, logout, user } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const displayName = user?.name || user?.displayName || user?.email || 'User';

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			setIsSidebarOpen(false);
			navigate('/login');
		} finally {
			setIsLoggingOut(false);
		}
	};

	useEffect(() => {
		if (!isSidebarOpen) return;

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				setIsSidebarOpen(false);
			}
		};

		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleEscape);

		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleEscape);
		};
	}, [isSidebarOpen]);

	useEffect(() => {
		setIsSidebarOpen(false);
	}, [location.pathname]);

	return (
		<header className='app-navbar'>
			<div className='container app-navbar-inner'>
				<Link className='brand-link' to='/'>
					<img alt='Smart Learn logo' className='brand-logo' src={logo} />
				</Link>

				<button
					aria-label='Open menu'
					aria-controls='main-sidebar-menu'
					aria-expanded={isSidebarOpen}
					className={`nav-toggle${isSidebarOpen ? ' open' : ''}`}
					onClick={() => setIsSidebarOpen((prev) => !prev)}
					type='button'
				>
					<span className='nav-toggle-icon' aria-hidden='true'>☰</span>
				</button>

				<div className='app-nav-spacer' />
			</div>

				<button
					aria-hidden={!isSidebarOpen}
					aria-label='Close menu overlay'
					className={`sidebar-overlay${isSidebarOpen ? ' open' : ''}`}
					onClick={() => setIsSidebarOpen(false)}
					type='button'
				/>

				<aside aria-label='Main menu' className={`sidebar-drawer${isSidebarOpen ? ' open' : ''}`} id='main-sidebar-menu'>
					<div className='sidebar-header'>
						<span>Menu</span>
						<button aria-label='Close menu' className='sidebar-close' onClick={() => setIsSidebarOpen(false)} type='button'>
							<X size={18} aria-hidden='true' />
						</button>
					</div>

					{isAuthenticated && (
						<div className='sidebar-user'>
							{user?.photoURL ? (
								<img alt='Profile avatar' className='sidebar-user-photo' src={user.photoURL} />
							) : (
								<div className='sidebar-user-avatar'>
									<CircleUserRound size={18} aria-hidden='true' />
								</div>
							)}
							<div className='sidebar-user-meta'>
								<strong>{displayName}</strong>
								<span>Logged in</span>
							</div>
						</div>
					)}

					<nav className='sidebar-nav'>
						<NavLink
							aria-label='මුල් පිටුව'
							className='sidebar-nav-link'
							title='මුල් පිටුව'
							to='/'
						>
							<House size={20} aria-hidden='true' />
							<span className='sidebar-nav-label'>මුල් පිටුව</span>
						</NavLink>
						<NavLink
							aria-label='මොඩියුල'
							className='sidebar-nav-link'
							title='මොඩියුල'
							to='/modules'
						>
							<Grid3X3 size={20} aria-hidden='true' />
							<span className='sidebar-nav-label'>මොඩියුල</span>
						</NavLink>
						{isAuthenticated && (
							<NavLink
								aria-label='Dyslexia Dashboard'
								className='sidebar-nav-link'
								title='Dyslexia Dashboard'
								to='/dyslexia-dashboard'
							>
								<LayoutDashboard size={20} aria-hidden='true' />
								<span className='sidebar-nav-label'>Dyslexia Dashboard</span>
							</NavLink>
						)}
					</nav>

					{isAuthenticated && (
						<button
							className='sidebar-logout'
							disabled={isLoggingOut || isAuthLoading}
							onClick={handleLogout}
							type='button'
						>
							<LogOut size={16} aria-hidden='true' />
							<span>{isLoggingOut ? 'ඉවත් වෙමින්...' : 'ඉවත් වන්න'}</span>
						</button>
					)}
				</aside>
		</header>
	);
};

export default Navbar;
