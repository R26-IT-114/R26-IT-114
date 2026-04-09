import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import logo from '../assets/images/smart-learn-logo.svg';
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

const ShieldIcon = () => (
	<svg aria-hidden='true' className='feature-icon' viewBox='0 0 24 24'>
		<path fill='currentColor' d='M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3zm0 4.1L7 8v3c0 3.7 2.3 7.1 5 8.6 2.7-1.5 5-4.9 5-8.6V8l-5-1.9z' />
	</svg>
);

const SparkIcon = () => (
	<svg aria-hidden='true' className='feature-icon' viewBox='0 0 24 24'>
		<path fill='currentColor' d='M11 2l1.4 4.6L17 8l-4.6 1.4L11 14l-1.4-4.6L5 8l4.6-1.4L11 2zm7 7l.9 2.8L22 13l-3.1.9L18 17l-.9-3.1L14 13l3.1-.9L18 9z' />
	</svg>
);

const BrainIcon = () => (
	<svg aria-hidden='true' className='feature-icon' viewBox='0 0 24 24'>
		<path fill='currentColor' d='M10 3a4 4 0 0 0-4 4v1.2A3.8 3.8 0 0 0 4 12c0 1.7.8 3.2 2 4.1V17a4 4 0 0 0 4 4h1v-2h-1a2 2 0 0 1-2-2v-1.2c-.6-.6-1-1.4-1-2.3 0-1.2.7-2.3 1.8-2.8L10 9.5V7a2 2 0 1 1 4 0v2.5l1.2.2c1.1.5 1.8 1.6 1.8 2.8 0 .9-.4 1.7-1 2.3V17a2 2 0 0 1-2 2h-1v2h1a4 4 0 0 0 4-4v-1a4.8 4.8 0 0 0 2-4c0-2.5-1.7-4.7-4-5.4V7a4 4 0 0 0-4-4h-2z' />
	</svg>
);

const features = [
	{
		title: 'Adaptive learning modules',
		description: 'Move into dyscalculia, dysgraphia, dyslexia, or working-memory support instantly.',
		icon: BrainIcon,
	},
	{
		title: 'Real Google account access',
		description: 'Sign in with Firebase and keep your learning history tied to a real account.',
		icon: SparkIcon,
	},
	{
		title: 'Protected and trackable',
		description: 'Session state and login events are recorded securely for the project dashboard.',
		icon: ShieldIcon,
	},
];

const validateField = (name, value) => {
	if (name === 'email') {
		if (!value.trim()) return 'Email is required.';
		if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address.';
	}

	if (name === 'password') {
		if (!value.trim()) return 'Password is required.';
		if (value.length < 6) return 'Password must be at least 6 characters.';
	}

	return '';
};

const Login = () => {
	const navigate = useNavigate();
	const { login, loginWithGoogle, isAuthLoading, isAuthenticated } = useAuth();
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
			setError('Please fix the highlighted fields before signing in.');
			return;
		}

		setIsSubmitting(true);

		try {
			await login(formData.email, formData.password, rememberMe);
			navigate('/modules');
		} catch (loginError) {
			setError(loginError?.message || 'Login failed. Please verify your credentials and try again.');
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

			setInfo('Redirecting to Google sign-in...');
		} catch (googleError) {
			setError(googleError?.message || 'Google sign-in failed. Please try again.');
		} finally {
			setIsGoogleSubmitting(false);
		}
	};

	return (
		<main className='page-shell login-page'>
			<section className='container login-layout'>
				<aside className='login-brand card'>
					<div className='login-brand-top'>
						<img alt='Smart Learn logo' className='login-logo' src={logo} />
						<span className='brand-pill'>Adaptive Learning Platform</span>
					</div>

					<h1 className='login-heading'>Access your learning dashboard</h1>
					<p className='login-subtitle'>
						Continue with Google or email to resume your personalized Smart Learn journey across all four modules.
					</p>

					<div className='feature-list'>
						{features.map(({ title, description, icon: Icon }) => (
							<div className='feature-item' key={title}>
								<div className='feature-mark'>
									<Icon />
								</div>
								<div>
									<h2>{title}</h2>
									<p>{description}</p>
								</div>
							</div>
						))}
					</div>

					<div className='login-metrics'>
						<div>
							<strong>4</strong>
							<span>modules</span>
						</div>
						<div>
							<strong>1</strong>
							<span>dashboard</span>
						</div>
						<div>
							<strong>Google</strong>
							<span>sign-in</span>
						</div>
					</div>
				</aside>

				<section className='login-panel card'>
					<div className='auth-panel-header'>
						<h2>Sign in</h2>
						<p>Secure access for students, therapists, and admins.</p>
					</div>

					<form className='auth-form auth-form--dense' onSubmit={handleSubmit}>
						<label htmlFor='email'>
							Email address
							<span className='field-hint'>Use the email linked to your Smart Learn account.</span>
							<div className={`field-shell ${fieldErrors.email && touched.email ? 'field-shell--error' : ''}`}>
								<input
									autoComplete='email'
									id='email'
									name='email'
									onBlur={handleBlur}
									onChange={handleChange}
									placeholder='you@example.com'
									required
									type='email'
									value={formData.email}
								/>
							</div>
							{fieldErrors.email && touched.email ? <span className='field-error'>{fieldErrors.email}</span> : null}
						</label>

						<label htmlFor='password'>
							Password
							<span className='field-hint'>Use your account password or sign in with Google instead.</span>
							<div className={`password-field ${fieldErrors.password && touched.password ? 'field-shell--error' : ''}`}>
								<input
									autoComplete='current-password'
									id='password'
									name='password'
									onBlur={handleBlur}
									onChange={handleChange}
									placeholder='Enter password'
									required
									type={showPassword ? 'text' : 'password'}
									value={formData.password}
								/>
								<button
									className='password-toggle'
									onClick={() => setShowPassword((current) => !current)}
									type='button'
								>
									{showPassword ? 'Hide' : 'Show'}
								</button>
							</div>
							{fieldErrors.password && touched.password ? <span className='field-error'>{fieldErrors.password}</span> : null}
						</label>

						<div className='auth-meta-row'>
							<label className='checkbox-row' htmlFor='rememberMe'>
								<input
									checked={rememberMe}
									id='rememberMe'
									onChange={(event) => setRememberMe(event.target.checked)}
									type='checkbox'
								/>
								<span>Keep me signed in</span>
							</label>

							<Link className='link-muted' to='/register'>
								Need an account?
							</Link>
						</div>

						{error ? <p className='form-error'>{error}</p> : null}
						{info ? <p className='form-success'>{info}</p> : null}

						<button className='btn-primary' disabled={isSubmitting || isAuthLoading} type='submit'>
							Sign In
						</button>

						<div className='auth-divider'>
							<span>or</span>
						</div>

						<button
							className='btn-secondary'
							disabled={isGoogleSubmitting || isAuthLoading}
							onClick={handleGoogleLogin}
							type='button'
						>
							<GoogleIcon />
							Continue with Google
						</button>

						<p className='auth-note'>
							By signing in, you agree to use Smart Learn for educational progress tracking and adaptive learning support.
						</p>
					</form>
				</section>
			</section>
		</main>
	);
};

export default Login;
