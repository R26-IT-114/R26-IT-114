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
					Play, listen, tap, and learn with child-friendly number games.
				</p>

				<div className='dys-hero-icons'>🎈 🔢 ⭐ 🍎</div>

				<button
					type='button'
					className='dys-btn dys-btn-primary'
					onClick={() => navigate('/dyscalculia/assessment')}
				>
					Start Assessment
				</button>
			</section>
		</main>
	);
};

export default DyscalculiaHome;
