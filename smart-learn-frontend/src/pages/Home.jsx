
import logo from '../assets/images/smart-learn-logo.svg';
import useAuth from '../hooks/useAuth';
import { motion } from 'framer-motion';
import childFriendlyImage from '../assets/images/child-friendly.svg';

const homeModules = [
	{ title: 'ඩයිස්කැල්කියුලියා', description: 'අංක සංස්කෘතිය සහ ගණිතමය විශ්වාසය.', path: '/dyscalculia' },
	{ title: 'ඩයිස්ග්‍රැෆියා', description: 'ලිවීමේ ප්‍රවාහය සහ සිංහල-මෝටර් පුහුණුව.', path: '/dysgraphia' },
	{ title: 'ඩයිස්ලෙක්සියා', description: 'කියවීමේ ප්‍රවිණත්වය සහ ෆොනික්ස් සහාය.', path: '/dyslexia' },
	{ title: 'වර්කිං මෙමරි', description: 'සිහිපත් කිරීම සහ අවධාරණය පුහුණු ක්‍රීඩා.', path: '/working-memory' },
];

const Home = () => {
	const { isAuthenticated } = useAuth();



	return (
		<main className='page-shell'>
			<section className='container home-auth-gate'>
				<div className='home-auth-gate__content'>
					<motion.p className='home-kicker' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
						මෙහි ආරම්භ කරන්න
					</motion.p>
					<motion.h2 className='home-auth-gate__title' initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
						ඉදිරියට යාම සඳහා පළමුව ලොගින් වන්න
					</motion.h2>
					<motion.p className='home-auth-gate__subtitle' initial={{ x: 100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
						ඔබගේ පුද්ගලික ඉගෙනුම් සැලසුම අගුළු කිරීම සඳහා සයින් ඉන් කරන්න. ලොගින් වූ පසු, ඔබට සියලු මොඩියුල විස්තර සහ ප්‍රගතිය සමඟ ඉදිරියට යාමට හැකියි.
					</motion.p>
				</div>
				<div className='home-auth-gate__actions'>
					{isAuthenticated ? (
						<>
							<motion.Link className='btn-primary' to='/modules' whileHover={{ scale: 1.1 }}>
								මොඩියුල වෙත යන්න
							</motion.Link>
							<span className='home-auth-gate__badge'>ඔබ ලොගින් වී ඇත</span>
						</>
					) : (
						<>
							<motion.Link className='btn-primary' to='/login' whileHover={{ scale: 1.1 }}>
								ලොගින් වන්න
							</motion.Link>
							<motion.Link className='btn-secondary' to='/register' whileHover={{ scale: 1.1 }}>
								ගිණුමක් සාදන්න
							</motion.Link>
						</>
					)}
				</div>
			</section>

			<section className='container home-hero'>
				<div className='home-hero-copy'>
					<motion.p className='home-kicker' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
						අන්තර්ගත ඉගෙනුම් වේලම්බුව
					</motion.p>
					<motion.h1 className='page-title' initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
						ස්මාර්ට් ලර්න්
					</motion.h1>
					<motion.p className='page-subtitle' initial={{ y: 50 }} animate={{ y: 0 }} transition={{ duration: 1 }}>
						ඩයිස්කැල්කියුලියා, ඩයිස්ග්‍රැෆියා, ඩයිස්ලෙක්සියා සහ වර්කිං මෙමරි වැනි නියුරෝඩිවෙලොප්මෙන්ටල් ලර්නිං නීඩ්ස් සඳහා අනුවර්තනය කරන සහායක මොඩියුල සමඟ.
					</motion.p>
					<img src={childFriendlyImage} alt='Child-friendly illustration' className='home-hero-image' />
				</div>

				<aside className='home-hero-panel'>
					<motion.img alt='Smart Learn app logo' className='hero-logo home-hero-logo' src={logo} initial={{ rotate: -10 }} animate={{ rotate: 0 }} transition={{ duration: 1 }} />
					<div className='home-stat-grid'>
						<motion.article className='home-stat-card' whileHover={{ scale: 1.1 }}>
							<p>4</p>
							<span>ඉගෙනුම් මොඩියුල</span>
						</motion.article>
						<motion.article className='home-stat-card' whileHover={{ scale: 1.1 }}>
							<p>අනුවර්තනය</p>
							<span>කටයුතු රූටිං</span>
						</motion.article>
						<motion.article className='home-stat-card' whileHover={{ scale: 1.1 }}>
							<p>තත්කාලීන</p>
							<span>ප්‍රගතිය ලුහුබඳිනවා</span>
						</motion.article>
						<motion.article className='home-stat-card' whileHover={{ scale: 1.1 }}>
							<p>පවුලේ +</p>
							<span>ගුරුවරයාට සුදුසු</span>
						</motion.article>
					</div>
				</aside>
			</section>

			<section className='container'>
				<div className='home-module-strip'>
					<div className='home-module-head'>
						<motion.h2 initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
							මොඩියුල සොයා බලන්න
						</motion.h2>
						<motion.p initial={{ x: 100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
							ඔබගේ වත්මන් ප්‍රගතියෙන් ඉදිරියට යාම සඳහා කෙනෙකු තෝරා ගන්න.
						</motion.p>
					</div>
					<div className='home-module-grid'>
						{homeModules.map((module) => (
							<motion.Link className='home-module-card' key={module.path} to={module.path} whileHover={{ scale: 1.05 }}>
								<h3>{module.title}</h3>
								<p>{module.description}</p>
							</motion.Link>
						))}
					</div>
				</div>
			</section>
		</main>
	);
};

export default Home;
