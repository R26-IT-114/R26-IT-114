import { Link } from 'react-router-dom';
import logo from '../assets/images/smart-learn-logo.svg';
import useAuth from '../hooks/useAuth';

const Home = () => {
	const { user, isAuthenticated } = useAuth();
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	return (
		<main className='page-shell'>
			<section className='container hero'>
				<img alt='Smart Learn app logo' className='hero-logo' src={logo} />
				<h1 className='page-title'>Smart Learn</h1>
				<p className='page-subtitle'>
					Adaptive support platform for neurodevelopmental learning disorders with
					specialized modules for dyscalculia, dysgraphia, dyslexia, and working
					memory.
				</p>
				<div className='stack-sm'>
					<Link className='btn-primary' to='/modules'>
						{isAuthenticated ? 'Open Modules' : 'Start Learning'}
					</Link>
					{canManageRecommendations ? (
						<Link className='btn-secondary stack-inline-action' to='/admin/recommendations'>
							Manage Recommendations
						</Link>
					) : null}
				</div>
			</section>
		</main>
	);
};

export default Home;
