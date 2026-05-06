import { useNavigate } from 'react-router-dom';
import '../styles/dyscalculia.css';

const DyscalculiaHome = () => {
	const navigate = useNavigate();

	return (
		<main className='dys-shell'>
			<section className='dys-card hero-card'>
				<p className='dys-chip'>Smart Learn+ Dyscalculia</p>
				<h1 className='dys-title'>Fun Math Journey</h1>
				<p className='dys-subtitle'>
					Play, listen, tap, and learn with child-friendly number games built for confidence.
				</p>

				<div className='dys-hero-icons'>🎈 🔢 ⭐ 🍎</div>
				<p className='dys-status-pill'>4 activity types | quick 2-3 min rounds</p>

				<div className='dys-hero-actions'>
					<button
						type='button'
						className='dys-btn dys-btn-primary'
						onClick={() => navigate('/dyscalculia/assessment')}
					>
						Start Assessment
					</button>
					<button
						type='button'
						className='dys-btn dys-btn-secondary'
						onClick={() => navigate('/dyscalculia/progress-dashboard')}
					>
						View Progress
					</button>
				</div>
			</section>
		</main>
	);
};

export default DyscalculiaHome;
