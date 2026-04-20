import { Link } from 'react-router-dom';
import logo from '../assets/images/smart-learn-logo.svg';
import useAuth from '../hooks/useAuth';

const homeModules = [
	{ title: 'Dyscalculia', description: 'Number sense and arithmetic confidence.', path: '/dyscalculia' },
	{ title: 'Dysgraphia', description: 'Writing flow and fine-motor practice.', path: '/dysgraphia' },
	{ title: 'Dyslexia', description: 'Reading fluency and phonics support.', path: '/dyslexia' },
	{ title: 'Working Memory', description: 'Recall and focus training games.', path: '/working-memory' },
];

const Home = () => {
	const { user, isAuthenticated } = useAuth();
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	return (
		<main className='page-shell'>
			<section className='container home-hero'>
				<div className='home-hero-copy'>
					<p className='home-kicker'>Inclusive Learning Platform</p>
					<h1 className='page-title'>Smart Learn</h1>
					<p className='page-subtitle'>
						Adaptive support for neurodevelopmental learning needs with guided modules
						for dyscalculia, dysgraphia, dyslexia, and working memory.
					</p>
					<div className='home-cta-row'>
						<Link className='btn-primary' to='/modules'>
							{isAuthenticated ? 'Open Modules' : 'Start Learning'}
						</Link>
						{canManageRecommendations ? (
							<Link className='btn-secondary' to='/admin/recommendations'>
								Manage Recommendations
							</Link>
						) : null}
					</div>
					<div className='home-pill-row'>
						<span className='home-pill'>Personalized Flow</span>
						<span className='home-pill'>Quick Sessions</span>
						<span className='home-pill'>Progress Insights</span>
					</div>
				</div>

				<aside className='home-hero-panel'>
					<img alt='Smart Learn app logo' className='hero-logo home-hero-logo' src={logo} />
					<div className='home-stat-grid'>
						<article className='home-stat-card'>
							<p>4</p>
							<span>Learning Modules</span>
						</article>
						<article className='home-stat-card'>
							<p>Adaptive</p>
							<span>Difficulty Routing</span>
						</article>
						<article className='home-stat-card'>
							<p>Realtime</p>
							<span>Progress Tracking</span>
						</article>
						<article className='home-stat-card'>
							<p>Family +</p>
							<span>Teacher Friendly</span>
						</article>
					</div>
				</aside>
			</section>

			<section className='container'>
				<div className='home-module-strip'>
					<div className='home-module-head'>
						<h2>Explore Modules</h2>
						<p>Pick a focused path and continue from your current progress.</p>
					</div>
					<div className='home-module-grid'>
						{homeModules.map((module) => (
							<Link className='home-module-card' key={module.path} to={module.path}>
								<h3>{module.title}</h3>
								<p>{module.description}</p>
							</Link>
						))}
					</div>
				</div>
			</section>
		</main>
	);
};

export default Home;
