import { Link } from 'react-router-dom';
import logo from '../assets/images/smart-learn-logo.svg';
import useAuth from '../hooks/useAuth';

const FEATURE_CARDS = [
  {
    title: "වනාන්තර කතාව",
    subtitle: "Jungle Story",
    description: "Watch a jungle video in 2 parts and answer Sinhala comprehension questions. Builds working memory & listening skills for ages 6–8.",
    emoji: "🌿",
    href: "/working-memory",
    gradient: "linear-gradient(135deg,#059669,#10B981)",
    badge: "නව ක්‍රීඩාව",
    badgeColor: "#F59E0B",
  },
  {
    title: "අනුක්‍රම මතකය",
    subtitle: "Sequence Recall",
    description: "Remember and repeat sequences of fruit, animal, and vehicle images. 3 progressive levels to challenge working memory.",
    emoji: "🧠",
    href: "/working-memory",
    gradient: "linear-gradient(135deg,#0284C7,#0EA5E9)",
    badge: null,
  },
  {
    title: "වර්ණ | අංක | අකුරු",
    subtitle: "Color · Number · Letter Memory",
    description: "Flashcard-based recall game using colors, numbers, and letters in Sinhala. Fun and engaging for young learners.",
    emoji: "🎨",
    href: "/working-memory",
    gradient: "linear-gradient(135deg,#EC4899,#F472B6)",
    badge: null,
  },
];

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

			{/* Featured games section */}
			<section style={{ maxWidth: 900, margin: '0 auto 3rem', padding: '0 1.5rem' }}>
				<h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem', textAlign: 'center' }}>
					Featured Games — Working Memory
				</h2>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
					{FEATURE_CARDS.map((card) => (
						<Link
							key={card.title}
							to={card.href}
							style={{
								display: 'flex', flexDirection: 'column', gap: '0.85rem',
								borderRadius: '1.5rem', padding: '1.75rem 1.5rem',
								background: card.gradient, color: 'white',
								boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
								textDecoration: 'none', position: 'relative', overflow: 'hidden',
								transition: 'transform 0.18s, box-shadow 0.18s',
							}}
							onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 44px rgba(0,0,0,0.20)'; }}
							onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.14)'; }}
						>
							{card.badge && (
								<span style={{
									position: 'absolute', top: '0.9rem', right: '0.9rem',
									background: card.badgeColor, color: '#1e293b',
									fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.7rem',
									borderRadius: '9999px', boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
								}}>
									{card.badge}
								</span>
							)}
							<span style={{ fontSize: '2.6rem', lineHeight: 1 }}>{card.emoji}</span>
							<div>
								<p style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{card.title}</p>
								<p style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.82, margin: '0.15rem 0 0' }}>{card.subtitle}</p>
							</div>
							<p style={{ fontSize: '0.92rem', opacity: 0.90, lineHeight: 1.55, margin: 0, flex: 1 }}>
								{card.description}
							</p>
							<span style={{
								alignSelf: 'flex-start', background: 'rgba(255,255,255,0.22)',
								border: '2px solid rgba(255,255,255,0.55)',
								padding: '0.45rem 1.2rem', borderRadius: '9999px',
								fontSize: '0.92rem', fontWeight: 700,
							}}>
								ක්‍රීඩා කරමු →
							</span>
						</Link>
					))}
				</div>
			</section>
		</main>
	);
};

export default Home;

