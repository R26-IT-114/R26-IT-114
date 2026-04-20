import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const modules = [
	{
		title: 'Dyscalculia',
		description: 'Numeracy support tasks and adaptive arithmetic practice.',
		path: '/dyscalculia',
		icon: '🔢',
		color: '#3b82f6',
		bgGradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #06b6d4 100%)',
	},
	{
		title: 'Dysgraphia',
		description: 'Writing and fine-motor focused interactive exercises.',
		path: '/dysgraphia',
		icon: '✏️',
		color: '#f59e0b',
		bgGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
	},
	{
		title: 'Dyslexia',
		description: 'Reading, phonics, and language comprehension activities.',
		path: '/dyslexia',
		icon: '📖',
		color: '#10b981',
		bgGradient: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)',
	},
	{
		title: 'Working Memory',
		description: 'Short-term memory strengthening and recall training.',
		path: '/working-memory',
		icon: '🧠',
		color: '#8b5cf6',
		bgGradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)',
	},
];

const ModuleSelection = () => {
	const { user } = useAuth();
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	return (
		<main className='page-shell'>
			<section className='container'>
				<div className='modules-hero'>
					<p className='modules-kicker'>Adaptive Learning Paths</p>
					<h1 className='page-title'>Choose Your Module</h1>
					{canManageRecommendations ? (
						<Link className='btn-secondary modules-admin-btn' to='/admin/recommendations'>
							⚙️ Manage Recommendations
						</Link>
					) : null}
				</div>

				<div className='modules-grid'>
					{modules.map((module) => (
						<Link
							className='module-card-enhanced'
							key={module.path}
							to={module.path}
							style={{ '--module-bg': module.bgGradient }}
						>
							<div className='module-card-bg-layer' />
							<div className='module-card-icon'>{module.icon}</div>
							<div className='module-card-content'>
								<h3>{module.title}</h3>
								<p>{module.description}</p>
							</div>
							<span className='module-card-arrow'>→</span>
						</Link>
					))}
				</div>
			</section>
		</main>
	);
};

export default ModuleSelection;
