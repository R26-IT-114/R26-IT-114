import { Link } from 'react-router-dom';
import logo from '../assets/images/smart-learn-logo.svg';
import useAuth from '../hooks/useAuth';

const homeModules = [
	{ title: 'ඩයිස්කැල්කියුලියා', description: 'අංක සංස්කෘතිය සහ ගණිතමය විශ්වාසය.', path: '/dyscalculia' },
	{ title: 'ඩයිස්ග්‍රැෆියා', description: 'ලිවීමේ ප්‍රවාහය සහ සිංහල-මෝටර් පුහුණුව.', path: '/dysgraphia' },
	{ title: 'ඩයිස්ලෙක්සියා', description: 'කියවීමේ ප්‍රවිණත්වය සහ ෆොනික්ස් සහාය.', path: '/dyslexia' },
	{ title: 'වර්කිං මෙමරි', description: 'සිහිපත් කිරීම සහ අවධාරණය පුහුණු ක්‍රීඩා.', path: '/working-memory' },
];

const Home = () => {
	const { user, isAuthenticated } = useAuth();
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	return (
		<main className='page-shell'>
			<section className='container home-auth-gate'>
				<div className='home-auth-gate__content'>
					<p className='home-kicker'>මෙහි ආරම්භ කරන්න</p>
					<h2 className='home-auth-gate__title'>ඉදිරියට යාම සඳහා පළමුව ලොගින් වන්න</h2>
					<p className='home-auth-gate__subtitle'>
						ඔබගේ පුද්ගලික ඉගෙනුම් සැලසුම අගුළු කිරීම සඳහා සයින් ඉන් කරන්න. ලොගින් වූ පසු, ඔබට සියලු මොඩියුල විස්තර සහ ප්‍රගතිය සමඟ ඉදිරියට යාමට හැකියි.
					</p>
				</div>
				<div className='home-auth-gate__actions'>
					{isAuthenticated ? (
						<>
							<Link className='btn-primary' to='/modules'>
								මොඩියුල වෙත යන්න
							</Link>
							<span className='home-auth-gate__badge'>ඔබ ලොගින් වී ඇත</span>
						</>
					) : (
						<>
							<Link className='btn-primary' to='/login'>
								ලොගින් වන්න
							</Link>
							<Link className='btn-secondary' to='/register'>
								ගිණුමක් සාදන්න
							</Link>
						</>
					)}
				</div>
			</section>

			<section className='container home-hero'>
				<div className='home-hero-copy'>
					<p className='home-kicker'>අන්තර්ගත ඉගෙනුම් වේලම්බුව</p>
					<h1 className='page-title'>ස්මාර්ට් ලර්න්</h1>
					<p className='page-subtitle'>
						ඩයිස්කැල්කියුලියා, ඩයිස්ග්‍රැෆියා, ඩයිස්ලෙක්සියා සහ වර්කිං මෙමරි වැනි නියුරෝඩිවෙලොප්මෙන්ටල් ලර්නිං නීඩ්ස් සඳහා අනුවර්තනය කරන සහායක මොඩියුල සමඟ.
					</p>
					<div className='home-cta-row'>
						<Link className='btn-primary' to='/modules'>
							{isAuthenticated ? 'මොඩියුල විවෘත කරන්න' : 'ඉගෙනුම් ආරම්භ කරන්න'}
						</Link>
						{canManageRecommendations ? (
							<Link className='btn-secondary' to='/admin/recommendations'>
								නිර්දේශයන් කළමනා කරන්න
							</Link>
						) : null}
					</div>
					<div className='home-pill-row'>
						<span className='home-pill'>පුද්ගලික ප්‍රවාහය</span>
						<span className='home-pill'>ක්ෂණික සැසි</span>
						<span className='home-pill'>ප්‍රගතිය පුහුණු</span>
					</div>
				</div>

				<aside className='home-hero-panel'>
					<img alt='Smart Learn app logo' className='hero-logo home-hero-logo' src={logo} />
					<div className='home-stat-grid'>
						<article className='home-stat-card'>
							<p>4</p>
							<span>ඉගෙනුම් මොඩියුල</span>
						</article>
						<article className='home-stat-card'>
							<p>අනුවර්තනය</p>
							<span>කටයුතු රූටිං</span>
						</article>
						<article className='home-stat-card'>
							<p>තත්කාලීන</p>
							<span>ප්‍රගතිය ලුහුබඳිනවා</span>
						</article>
						<article className='home-stat-card'>
							<p>පවුලේ +</p>
							<span>ගුරුවරයාට සුදුසු</span>
						</article>
					</div>
				</aside>
			</section>

			<section className='container'>
				<div className='home-module-strip'>
					<div className='home-module-head'>
						<h2>මොඩියුල සොයා බලන්න</h2>
						<p>ඔබගේ වත්මන් ප්‍රගතියෙන් ඉදිරියට යාම සඳහා කෙනෙකු තෝරා ගන්න.</p>
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
