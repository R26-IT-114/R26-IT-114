import { Link, NavLink } from 'react-router-dom';

import logo from '../../assets/logos/logo without back.png';
import useAuth from '../../hooks/useAuth';
import BackButton from './BackButton';
import AccountMenu from './AccountMenu';

const Navbar = () => {
	const { isAuthenticated } = useAuth();


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
						<AccountMenu />
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
