import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/smart-learn-logo.svg';
import useAuth from '../../hooks/useAuth';
import { DEFAULT_RECOMMENDATIONS, fetchUserRecommendations } from '../../services/firebaseUserProfile';

const Navbar = () => {
	const navigate = useNavigate();
	const { isAuthenticated, isAuthLoading, logout, user } = useAuth();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

	const recommended = useMemo(() => recommendations.slice(0, 2), [recommendations]);
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	useEffect(() => {
		let mounted = true;

		const loadRecommendations = async () => {
			if (!isAuthenticated || !user?.id) {
				if (mounted) setRecommendations([]);
				return;
			}

			setIsRecommendationsLoading(true);

			try {
				const firestoreRecommendations = await fetchUserRecommendations(user.id);

				if (!mounted) return;

				if (firestoreRecommendations.length > 0) {
					setRecommendations(firestoreRecommendations);
					return;
				}

				setRecommendations(DEFAULT_RECOMMENDATIONS);
			} catch {
				if (mounted) {
					setRecommendations(DEFAULT_RECOMMENDATIONS);
				}
			} finally {
				if (mounted) {
					setIsRecommendationsLoading(false);
				}
			}
		};

		loadRecommendations();

		return () => {
			mounted = false;
		};
	}, [isAuthenticated, user?.id]);

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
						{canManageRecommendations ? (
							<NavLink className='nav-link' to='/admin/recommendations'>
								Recommendations Admin
							</NavLink>
						) : null}
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
								<div className='account-meta'>
									<strong>{user?.name || 'Smart Learn User'}</strong>
									<span>{user?.email || 'Signed in'}</span>
									<small className='account-role'>{user?.role || 'student'}</small>
								</div>
							</div>

							<div className='recommend-strip'>
								<p>Recommended for you</p>
								{isRecommendationsLoading ? <span className='recommend-state'>Loading...</span> : null}
								{!isRecommendationsLoading && recommended.length === 0 ? (
									<span className='recommend-state recommend-state--empty'>No recommendations yet.</span>
								) : null}
								{!isRecommendationsLoading && recommended.length > 0 ? (
									<div className='recommend-list'>
										{recommended.map((item) => (
											<Link className='recommend-item' key={item.path} to={item.path}>
												{item.label}
											</Link>
										))}
									</div>
								) : null}
							</div>

							<button className='nav-logout' disabled={isLoggingOut || isAuthLoading} onClick={handleLogout} type='button'>
								{isLoggingOut ? 'Signing out...' : 'Logout'}
							</button>
						</div>
					) : (
						<div className='auth-actions'>
							<NavLink className='auth-link' to='/login'>
								Login
							</NavLink>
							<NavLink className='auth-link auth-link--primary' to='/register'>
								Register
							</NavLink>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Navbar;
