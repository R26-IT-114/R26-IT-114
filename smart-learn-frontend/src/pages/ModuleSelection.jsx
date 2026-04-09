import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const modules = [
	{
		title: 'Dyscalculia',
		description: 'Numeracy support tasks and adaptive arithmetic practice.',
		path: '/dyscalculia',
	},
	{
		title: 'Dysgraphia',
		description: 'Writing and fine-motor focused interactive exercises.',
		path: '/dysgraphia',
	},
	{
		title: 'Dyslexia',
		description: 'Reading, phonics, and language comprehension activities.',
		path: '/dyslexia',
	},
	{
		title: 'Working Memory',
		description: 'Short-term memory strengthening and recall training.',
		path: '/working-memory',
	},
];

const ModuleSelection = () => {
	const { user } = useAuth();
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	return (
		<main className='page-shell'>
			<section className='container'>
				<div className='hero'>
					<h1 className='page-title'>Choose a Learning Module</h1>
					<p className='page-subtitle'>
						Each module is tuned to a specific learning need and works smoothly
						across mobile and tablet screens.
					</p>
					{canManageRecommendations ? (
						<div className='stack-sm'>
							<Link className='btn-secondary' to='/admin/recommendations'>
								Open Recommendations Admin
							</Link>
						</div>
					) : null}
				</div>

				<div className='grid grid-cols-4'>
					{modules.map((module) => (
						<Link className='card module-card' key={module.path} to={module.path}>
							<h3>{module.title}</h3>
							<p>{module.description}</p>
						</Link>
					))}
				</div>
			</section>
		</main>
	);
};

export default ModuleSelection;
