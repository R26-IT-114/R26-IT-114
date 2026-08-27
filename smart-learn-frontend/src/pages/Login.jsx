import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import useDyslexia from '../modules/dyslexia/hooks/useDyslexia';
import { completeGoogleRedirectLogin } from '../services/firebaseAuth';

const GoogleIcon = () => (
	<svg aria-hidden='true' className='google-icon' viewBox='0 0 24 24'>
		<path
			fill='#EA4335'
			d='M12 11.2v2.9h6.6c-.3 1.7-2.1 5-6.6 5-4 0-7.2-3.3-7.2-7.3S8 4.5 12 4.5c2.3 0 3.8 1 4.7 1.8l2.6-2.5C17.6 2.2 15.1 1 12 1 6.5 1 2 5.5 2 11s4.5 10 10 10c5.7 0 9.5-4 9.5-9.7 0-.7-.1-1.3-.2-1.8H12z'
		/>
		<path fill='#4285F4' d='M4.5 7.3l3 2.2C8.3 7.4 10 6 12 6c1.2 0 2.4.4 3.3 1.2l2.5-2.5C16.2 3.3 14.2 2.5 12 2.5c-3.4 0-6.4 2-7.5 4.8z' />
		<path fill='#FBBC05' d='M12 21c2.9 0 5.4-1 7.1-2.8l-3.3-2.7c-.9.6-2 1-3.8 1-4.5 0-6.3-3.3-6.6-5l-3.1 2.4C3.5 18.2 7.3 21 12 21z' />
		<path fill='#34A853' d='M4.4 13.5c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1L1.3 6.9C.5 8.4 0 9.9 0 11.4c0 1.5.4 3 1.2 4.5l3.2-2.4z' />
	</svg>
);



const validateField = (name, value) => {
	if (name === 'email') {
		if (!value.trim()) return 'මන්දිය ඇද්දරසය අළදන්‍ය.';
		if (!/\S+@\S+\.\S+/.test(value)) return 'වලකු මන්දිය ඇද්දරසයක් ඇත්ත෪ණු කරන්න.';
	}

	if (name === 'password') {
		if (!value.trim()) return 'උපයෝකේ වටකින්න අළදන්‍ය.';
		if (value.length < 6) return 'වටකින්න අකුරු 6ක්කට විශ෍යට ඪුකු හිට යුතු.';
	}

	return '';
};

const Login = () => {
	const navigate = useNavigate();
	const { login, loginWithGoogle, isAuthLoading, isAuthenticated } = useAuth();
 const { data: dyslexiaOverview } = useDyslexia();
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
	const [touched, setTouched] = useState({ email: false, password: false });
	const [rememberMe, setRememberMe] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [info, setInfo] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/modules');
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		let mounted = true;

		const finalizeGoogleRedirect = async () => {
			try {
				const redirectedUser = await completeGoogleRedirectLogin();

				if (redirectedUser && mounted) {
					navigate('/modules');
				}
			} catch (redirectError) {
				if (mounted) {
					setError(redirectError?.message || 'Google sign-in failed after redirect. Please try again.');
				}
			}
		};

		finalizeGoogleRedirect();

		return () => {
			mounted = false;
		};
	}, [navigate]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
		setFieldErrors((current) => ({ ...current, [name]: validateField(name, value) }));
	};

	const handleBlur = (event) => {
		const { name, value } = event.target;
		setTouched((current) => ({ ...current, [name]: true }));
		setFieldErrors((current) => ({ ...current, [name]: validateField(name, value) }));
	};

	const validateForm = () => {
		const nextErrors = {
			email: validateField('email', formData.email),
			password: validateField('password', formData.password),
		};

		setFieldErrors(nextErrors);
		setTouched({ email: true, password: true });

		return !nextErrors.email && !nextErrors.password;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setInfo('');

		if (!validateForm()) {
			setError('හිහිට් කරන ලද ගැටලු කොටස් හිදා ගන්න්න්. පිළිසෙන්නට පීරසීමට ආදාල කරන්න.');
			return;
		}

		setIsSubmitting(true);

		try {
			await login(formData.email, formData.password, rememberMe);
			navigate('/modules');
		} catch (loginError) {
			setError(loginError?.message || 'පිළිසීම අසාර්තක් විය. ඔබේ විශවාසයතේ ගිනුම් හිදා කරන්න.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogleLogin = async () => {
		setError('');
		setInfo('');
		setIsGoogleSubmitting(true);

		try {
			const googleUser = await loginWithGoogle(rememberMe);

			if (googleUser) {
				navigate('/modules');
				return;
			}

			setInfo('ගූගල් සිග්න්-ඉන් වෙත හරවනු...');
		} catch (googleError) {
			setError(googleError?.message || 'ගූගල් සිග්න්-ඉන් අසාර්තක් විය. පීරසීමට ආදාල කරන්න.');
		} finally {
			setIsGoogleSubmitting(false);
		}
	};

	return (
		<div style={{
			minHeight: '100vh',
			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '20px',
			position: 'relative',
			overflow: 'hidden',
			fontFamily: "'Nunito', 'Poppins', Arial, sans-serif",
		}}>
			{/* Background floating elements */}
			{[
				{ emoji: '🌿', top: '8%', left: '3%', size: 55, dur: 5, delay: 0 },
				{ emoji: '⭐', top: '15%', right: '5%', size: 48, dur: 4, delay: 1 },
				{ emoji: '🍃', top: '50%', left: '2%', size: 42, dur: 6, delay: 2 },
				{ emoji: '🌸', bottom: '20%', right: '4%', size: 50, dur: 5, delay: 0.5 },
				{ emoji: '🦋', bottom: '10%', left: '8%', size: 60, dur: 4.5, delay: 1.5 },
				{ emoji: '✨', top: '30%', right: '12%', size: 36, dur: 3.5, delay: 0.8 },
				{ emoji: '🌟', top: '70%', left: '5%', size: 44, dur: 5.5, delay: 2.5 },
			].map(({ emoji, size, dur, delay, ...pos }) => (
				<motion.div
					key={emoji + JSON.stringify(pos)}
					animate={{ y: [0, -16, 0] }}
					transition={{ duration: dur, repeat: Infinity, delay, ease: 'easeInOut' }}
					style={{ position: 'absolute', fontSize: size, opacity: 0.22, pointerEvents: 'none', userSelect: 'none', ...pos }}
				>
					{emoji}
				</motion.div>
			))}

			{/* Glowing background blobs */}
			<div style={{ position: 'absolute', top: '5%', left: '20%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', filter: 'blur(70px)', pointerEvents: 'none' }} />
			<div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,220,100,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

			{/* Main card */}
			<motion.div
				initial={{ opacity: 0, y: 40, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				style={{
					background: 'rgba(255,255,255,0.15)',
					backdropFilter: 'blur(24px)',
					border: '1.5px solid rgba(255,255,255,0.35)',
					borderRadius: 32,
					width: '100%',
					maxWidth: 920,
					display: 'flex',
					overflow: 'hidden',
					boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
				}}
			>
				{/* ── Left panel (illustration) ── */}
				<div style={{
					flex: 1,
					background: 'linear-gradient(160deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)',
					padding: '56px 40px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					textAlign: 'center',
					position: 'relative',
					overflow: 'hidden',
				}}
				className="login-left-panel"
				>
					{/* Mascot */}
					<motion.div
						animate={{ y: [0, -12, 0] }}
						transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
						style={{ fontSize: 100, marginBottom: 16, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))' }}
					>
						🦁
					</motion.div>

					{/* Companion animals */}
					<div style={{ position: 'absolute', top: '15%', left: '10%' }}>
						<motion.span animate={{ rotate: [0, 15, -10, 0], y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} style={{ fontSize: 36, display: 'block' }}>🦜</motion.span>
					</div>
					<div style={{ position: 'absolute', top: '20%', right: '8%' }}>
						<motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} style={{ fontSize: 32, display: 'block' }}>🦊</motion.span>
					</div>
					<div style={{ position: 'absolute', bottom: '20%', left: '8%' }}>
						<motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.8 }} style={{ fontSize: 34, display: 'block' }}>🐢</motion.span>
					</div>

					<h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.8rem', marginBottom: 12, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
					අපගේ පැරණිතම ලෝකයට සාදරයෙන් පිළිගනිමු! 👋
					</h2>
					<p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 260, marginBottom: 32 }}>
						සිත්ගන්නාසුළු ක්‍රීඩා සහ අධ්‍යාපනික ක්‍රියාකාරකම් සමඟ ඉගෙනීම තවත් විනෝදජනක කරමු.
					</p>

					<div style={{
						width: '100%',
						maxWidth: 280,
						marginBottom: 24,
						padding: '12px 14px',
						borderRadius: 18,
						background: 'rgba(255,255,255,0.16)',
						border: '1px solid rgba(255,255,255,0.25)',
						backdropFilter: 'blur(8px)',
						textAlign: 'left',
						color: '#fff',
					}}>
						<div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9, marginBottom: 4 }}>
							Live backend check
						</div>
						<div style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.45 }}>
							{dyslexiaOverview
								? `${dyslexiaOverview.title} is connected`
								: 'Connecting to the dyslexia backend...'}
						</div>
						{dyslexiaOverview && (
							<div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: 4, opacity: 0.9 }}>
								{dyslexiaOverview.totalSections} sections · {dyslexiaOverview.totalGames} games
							</div>
						)}
					</div>

					{/* Feature badges */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 260 }}>
						{[
						{ emoji: '🎮', text: 'ඉගෙනුම් ඒකක 4ක්' },
						{ emoji: '⭐', text: 'ප්‍රගතිය යොත්කරණය' },
						{ emoji: '🔒', text: 'ආරක්ෂිත පරිසරය' },
						].map(({ emoji, text }) => (
							<div key={text} style={{
								background: 'rgba(255,255,255,0.18)',
								backdropFilter: 'blur(8px)',
								border: '1px solid rgba(255,255,255,0.3)',
								borderRadius: 50,
								padding: '8px 20px',
								color: '#fff',
								fontWeight: 700,
								fontSize: '0.85rem',
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}>
								{emoji} {text}
							</div>
						))}
					</div>
				</div>

				{/* ── Right panel (form) ── */}
				<div style={{
					flex: 1,
					background: 'rgba(255,255,255,0.95)',
					padding: '56px 44px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				}}>
					<div style={{ marginBottom: 32 }}>
					<h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a2e', marginBottom: 8 }}>පිළිසඳහන් වෙමු 🔑</h1>
					<p style={{ color: '#6b7280', fontSize: '0.95rem' }}>ඔබේ පුද්ගලික ගිණුමට පහසුවෙන් හා ආරක්ෂිතව ප්‍රවේශ වන්න</p>
					</div>

					{/* Google button */}
					<motion.button
						whileHover={{ scale: 1.02, y: -2 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleGoogleLogin}
						disabled={isGoogleSubmitting || isAuthLoading}
						type='button'
						style={{
							width: '100%',
							padding: '14px 24px',
							borderRadius: 14,
							border: '2px solid #e5e7eb',
							background: isGoogleSubmitting ? '#f9fafb' : '#fff',
							cursor: isGoogleSubmitting ? 'wait' : 'pointer',
							fontWeight: 800,
							fontSize: '1rem',
							color: '#1a1a2e',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 10,
							marginBottom: 24,
							boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
							transition: 'all 0.2s',
						}}
					>
						<GoogleIcon />
						{isGoogleSubmitting ? 'හරවනු...' : 'Google සමඟ පිවිසෙන්න'}
					</motion.button>

					<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
						<span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>නැතිනම් ඔබගේ විස්තර ඇතුළත් කරන්න</span>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
					</div>

					<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
						{/* Email */}
						<div>
							<label htmlFor='email' style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: '0.9rem', marginBottom: 6 }}>
									ඊමේල් ලිපිනය
							</label>
							<input
								autoComplete='email'
								id='email'
								name='email'
								onBlur={handleBlur}
								onChange={handleChange}
								placeholder='example@gmail.com'
								required
								type='email'
								value={formData.email}
								style={{
									width: '100%',
									padding: '12px 16px',
									borderRadius: 12,
									border: `2px solid ${fieldErrors.email && touched.email ? '#ef4444' : '#e5e7eb'}`,
									fontSize: '1rem',
									outline: 'none',
									boxSizing: 'border-box',
									transition: 'border-color 0.2s',
									fontFamily: 'inherit',
								}}
							/>
							<AnimatePresence>
								{fieldErrors.email && touched.email && (
									<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>
										{fieldErrors.email}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						{/* Password */}
						<div>
							<label htmlFor='password' style={{ display: 'block', fontWeight: 700, color: '#374151', fontSize: '0.9rem', marginBottom: 6 }}>
									මුරපදය
							</label>
							<div style={{ position: 'relative' }}>
								<input
									autoComplete='current-password'
									id='password'
									name='password'
									onBlur={handleBlur}
									onChange={handleChange}
									placeholder='ඔබගේ මුරපදය ඇතුළත් කරන්න'
									required
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
									style={{
										width: '100%',
										padding: '12px 52px 12px 16px',
										borderRadius: 12,
										border: `2px solid ${fieldErrors.password && touched.password ? '#ef4444' : '#e5e7eb'}`,
										fontSize: '1rem',
										outline: 'none',
										boxSizing: 'border-box',
										fontFamily: 'inherit',
									}}
								/>
								<button
									onClick={() => setShowPassword((c) => !c)}
									type='button'
									style={{
										position: 'absolute',
										right: 12,
										top: '50%',
										transform: 'translateY(-50%)',
										background: 'none',
										border: 'none',
										cursor: 'pointer',
										color: '#9ca3af',
										fontWeight: 700,
										fontSize: '0.8rem',
									}}
								>
									{showPassword ? 'හචා කරන්න' : 'පළයසෙන්න'}
								</button>
							</div>
							<AnimatePresence>
								{fieldErrors.password && touched.password && (
									<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4, fontWeight: 600 }}>
										{fieldErrors.password}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						{/* Remember me + Forgot password link */}
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<label htmlFor='rememberMe' style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', color: '#374151', fontWeight: 600 }}>
								<input
									checked={rememberMe}
									id='rememberMe'
									onChange={(e) => setRememberMe(e.target.checked)}
									type='checkbox'
									style={{ accentColor: '#7C3AED', width: 16, height: 16 }}
								/>
								මාව මතක තබා ගන්න
							</label>
							<Link to='/forgot-password' style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
								මුරපදය අමතකද?
							</Link>
						</div>

						{/* Register link */}
						<div style={{ textAlign: 'center', marginTop: 12 }}>
							<span style={{ color: '#6b7280', fontSize: '0.9rem' }}>ගිණුම් එකක් නැද්ද? </span>
							<Link to='/register' style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
								ගිනුම්ක් තිබේද?
							</Link>
						</div>

						{/* Alerts */}
						<AnimatePresence>
							{error && (
								<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
									style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 16px', color: '#991B1B', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
								>
									⚠️ {error}
								</motion.div>
							)}
							{info && (
								<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
									style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, padding: '12px 16px', color: '#166534', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
								>
									✅ {info}
								</motion.div>
							)}
						</AnimatePresence>

						{/* Submit */}
						<motion.button
							whileHover={{ scale: 1.02, y: -2 }}
							whileTap={{ scale: 0.98 }}
							disabled={isSubmitting || isAuthLoading}
							type='submit'
							style={{
								width: '100%',
								padding: '14px 24px',
								borderRadius: 14,
								border: 'none',
								background: isSubmitting ? '#a78bfa' : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
								color: '#fff',
								fontWeight: 900,
								fontSize: '1.05rem',
								cursor: isSubmitting ? 'wait' : 'pointer',
								boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 8,
								fontFamily: 'inherit',
							}}
						>
							{isSubmitting ? '⏳ පිළිසෙන්නී...' : '🚀 පිළිසෙන්න'}
						</motion.button>
					</form>

					<p style={{ marginTop: 20, textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.5 }}>
					පිවිසීමෙන් ඔබ අපගේ සේවා කොන්දේසි සහ පෞද්ගලිකත්ව ප්‍රතිපත්තියට එකඟ වේ.
					</p>
				</div>
			</motion.div>

			{/* Responsive: hide left panel on small screens */}
			<style>{`
				@media (max-width: 640px) {
					.login-left-panel { display: none !important; }
				}
			`}</style>
		</div>
	);
};

export default Login;
