import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';

const modules = [
	{
		title: 'ඩිස්ලෙක්සියා',
		description: 'කියවීම, ශබ්ද හා අකුරු-ශබ්ද ක්‍රීඩා',
		path: '/dyslexia',
		emoji: '📚',
		bg: 'linear-gradient(135deg, #52B788 0%, #74C69D 50%, #95D5B2 100%)',
		accent: '#52B788',
		badge: '🌟 එකටම ජනප්‍රිය',
		activities: 'ක්‍රියාකාරකම් 12',
		level: 'ප්‍රාරම්භික → උන්නත්',
	},
	{
		title: 'ඩිස්කැල්කුලියා',
		description: 'සංඛ්‍යා ක්‍රීඩා, ගැනීම් හා ගණිත ප්‍රහේලිකා',
		path: '/dyscalculia',
		emoji: '🔢',
		bg: 'linear-gradient(135deg, #F77F00 0%, #FCA311 50%, #FFD166 100%)',
		accent: '#F77F00',
		badge: '🔥 විනෝදජනකම',
		activities: 'ක්‍රියාකාරකම් 15',
		level: 'ප්‍රාරම්භික → උන්නත්',
	},
	{
		title: 'ඩිස්ග්‍රැෆියා',
		description: 'ලිවීම, ඇඳීම හා සියුම් මෝටර් ක්‍රියාකාරකම්',
		path: '/dysgraphia',
		emoji: '✏️',
		bg: 'linear-gradient(135deg, #E63946 0%, #F4A261 50%, #FFB347 100%)',
		accent: '#E63946',
		badge: '🎨 නිර්මාණශීලී',
		activities: 'ක්‍රියාකාරකම් 10',
		level: 'ප්‍රාරම්භික → මද්යම',
	},
	{
		title: 'වැඩකරන මතකය',
		description: 'අවධානය, ඇල්ම හා මතක ශිල්පීය ක්‍රීඩා',
		path: '/working-memory',
		emoji: '🧠',
		bg: 'linear-gradient(135deg, #4361EE 0%, #4CC9F0 50%, #7BCEEA 100%)',
		accent: '#4361EE',
		badge: '💡 බුද්ධිමත්',
		activities: 'ක්‍රියාකාරකම් 8',
		level: 'සියලු පැලි',
	},
];

const ModuleSelection = () => {
	const { user } = useAuth();
	const canManageRecommendations = user?.role === 'therapist' || user?.role === 'admin';

	return (
		<div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0f0c29, #302b63, #24243e)', fontFamily: "'Nunito', 'Poppins', Arial, sans-serif", position: 'relative', overflow: 'hidden' }}>

			{/* Starfield background */}
			{[...Array(20)].map((_, i) => (
				<motion.div
					key={i}
					animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
					transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
					style={{
						position: 'absolute',
						width: 3 + (i % 3) * 2,
						height: 3 + (i % 3) * 2,
						borderRadius: '50%',
						background: '#fff',
						top: `${5 + (i * 4.5) % 90}%`,
						left: `${3 + (i * 5.1) % 94}%`,
						pointerEvents: 'none',
					}}
				/>
			))}

			{/* Floating emoji elements */}
			{[
				{ emoji: '🌙', top: '5%', right: '8%', size: 50, dur: 4 },
				{ emoji: '⭐', top: '12%', left: '6%', size: 42, dur: 5, delay: 1 },
				{ emoji: '🌟', bottom: '25%', right: '5%', size: 48, dur: 4.5, delay: 2 },
				{ emoji: '✨', bottom: '15%', left: '4%', size: 40, dur: 3.5, delay: 0.5 },
				{ emoji: '🎮', top: '45%', left: '2%', size: 44, dur: 5, delay: 1.5 },
			].map(({ emoji, size, dur, delay = 0, ...pos }) => (
				<motion.div key={emoji} animate={{ y: [0, -14, 0] }} transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
					style={{ position: 'absolute', fontSize: size, opacity: 0.25, pointerEvents: 'none', userSelect: 'none', ...pos }}
				>
					{emoji}
				</motion.div>
			))}

			<div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 80px', position: 'relative', zIndex: 1 }}>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7 }}
					style={{ textAlign: 'center', marginBottom: 60 }}
				>
					<motion.div
						animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
						transition={{ duration: 3, repeat: Infinity }}
						style={{ fontSize: 80, marginBottom: 16, display: 'inline-block', filter: 'drop-shadow(0 8px 20px rgba(255,255,255,0.2))' }}
					>
						🗺️
					</motion.div>
					<h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: 12, textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
						ඔබේ වික්‍රමාන්විතය තෝරන්න!
					</h1>
					<p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', maxWidth: 520, margin: '0 auto 28px' }}>
						ඉගෙනීමේ ලෝකයක් තෝරන්න සෑම ඒකකයක්ම් විශේෂ නිර්මාණය කළා. ඔබටම ආයේ ඉගෙනීමේ ජය ගන්න්!
					</p>

					{/* User greeting */}
					{user?.displayName && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.4 }}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 10,
								background: 'rgba(255,255,255,0.12)',
								backdropFilter: 'blur(12px)',
								border: '1.5px solid rgba(255,255,255,0.25)',
								borderRadius: 50,
								padding: '10px 24px',
								color: '#fff',
								fontWeight: 800,
								fontSize: '1rem',
								marginBottom: 16,
							}}
						>
							👋 ඄යූ, {user.displayName.split(' ')[0]}! ඉගෙනෙන්නට සිදුම්ක්ද?
						</motion.div>
					)}

					{/* XP / Stars / Streak row */}
					<div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
						{[
					{ emoji: '⚡', label: 'අද එක්ස්පි', value: '0' },
					{ emoji: '⭐', label: 'තරු', value: '0' },
					{ emoji: '🔥', label: 'දින ගණන වුරුම', value: '1' },
						].map(({ emoji, label, value }) => (
							<div key={label} style={{
								background: 'rgba(255,255,255,0.1)',
								backdropFilter: 'blur(8px)',
								border: '1px solid rgba(255,255,255,0.2)',
								borderRadius: 16,
								padding: '10px 20px',
								color: '#fff',
								textAlign: 'center',
								minWidth: 90,
							}}>
								<div style={{ fontSize: 24 }}>{emoji}</div>
								<div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{value}</div>
								<div style={{ fontSize: '0.75rem', opacity: 0.75 }}>{label}</div>
							</div>
						))}
					</div>
				</motion.div>

				{/* Module cards */}
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28, marginBottom: 48 }}>
					{modules.map(({ title, description, path, emoji, bg, accent, badge, activities, level }, i) => (
						<motion.div
							key={path}
							initial={{ opacity: 0, y: 50, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 200, damping: 18 }}
							whileHover={{ y: -12, scale: 1.03 }}
						>
							<Link to={path} style={{ textDecoration: 'none', display: 'block' }}>
								<div style={{
									background: bg,
									borderRadius: 28,
									padding: '36px 28px',
									color: '#fff',
									position: 'relative',
									overflow: 'hidden',
									boxShadow: `0 16px 50px ${accent}55`,
									minHeight: 300,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
								}}>
									{/* Shine overlay */}
									<div style={{ position: 'absolute', top: 0, left: '-40%', width: '80%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', transform: 'skewX(-15deg)', pointerEvents: 'none' }} />

									{/* Badge */}
									<div style={{
										position: 'absolute',
										top: 16,
										right: 16,
										background: 'rgba(0,0,0,0.25)',
										backdropFilter: 'blur(8px)',
										borderRadius: 50,
										padding: '4px 12px',
										fontSize: '0.72rem',
										fontWeight: 800,
										border: '1px solid rgba(255,255,255,0.25)',
									}}>
										{badge}
									</div>

									{/* Top content */}
									<div>
										<div style={{ fontSize: 72, marginBottom: 16, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))', display: 'inline-block' }}>
											{emoji}
										</div>
										<h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: 8 }}>{title}</h2>
										<p style={{ opacity: 0.92, fontSize: '0.95rem', lineHeight: 1.5, marginBottom: 20 }}>{description}</p>
									</div>

									{/* Stats */}
									<div>
										<div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
											<span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 50, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>🎯 {activities}</span>
											<span style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 50, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>📊 {level}</span>
										</div>

										{/* Progress bar (placeholder) */}
										<div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 50, height: 8, marginBottom: 16, overflow: 'hidden' }}>
											<div style={{ width: '0%', height: '100%', background: 'rgba(255,255,255,0.7)', borderRadius: 50 }} />
										</div>

										{/* Play button */}
										<motion.div
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											style={{
												background: 'rgba(255,255,255,0.25)',
												backdropFilter: 'blur(8px)',
												border: '2px solid rgba(255,255,255,0.45)',
												borderRadius: 50,
												padding: '12px 28px',
												fontWeight: 900,
												fontSize: '1rem',
												display: 'inline-flex',
												alignItems: 'center',
												gap: 8,
											}}
										>
											▶ දෙන් සෙල්ලම් කරන්න
										</motion.div>
									</div>
								</div>
							</Link>
						</motion.div>
					))}
				</div>

				{/* Admin link */}
				{canManageRecommendations && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8 }}
						style={{ textAlign: 'center' }}
					>
						<Link to='/admin/recommendations' style={{ textDecoration: 'none' }}>
							<motion.div
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.97 }}
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 10,
									background: 'rgba(255,255,255,0.1)',
									backdropFilter: 'blur(12px)',
									border: '1.5px solid rgba(255,255,255,0.25)',
									borderRadius: 50,
									padding: '12px 32px',
									color: '#fff',
									fontWeight: 800,
									fontSize: '0.95rem',
								}}
							>
								⚙️ ප්‍රතිපලන ප්‍රවේශය හිලිවිය කරන්න
							</motion.div>
						</Link>
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default ModuleSelection;

