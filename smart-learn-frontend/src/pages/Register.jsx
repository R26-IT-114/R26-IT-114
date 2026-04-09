import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
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

const Register = () => {
	const navigate = useNavigate();
	const { register, loginWithGoogle, isAuthLoading, isAuthenticated } = useAuth();
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		password: '',
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [info, setInfo] = useState('');
	const [rememberMe, setRememberMe] = useState(true);
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
					setError(redirectError?.message || 'Google sign-up failed after redirect. Please try again.');
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
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setSuccess('');
		setInfo('');
		setIsSubmitting(true);

		try {
			await register(formData.email, formData.password, rememberMe);
			setSuccess('Registration successful. Redirecting to modules...');
			navigate('/modules');
		} catch (registerError) {
			setError(registerError?.message || 'Registration failed. Please try again with a valid email/password.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogleSignup = async () => {
		setError('');
		setSuccess('');
		setInfo('');
		setIsGoogleSubmitting(true);

		try {
			const googleUser = await loginWithGoogle(rememberMe);

			if (googleUser) {
				setSuccess('Google account connected. Redirecting to modules...');
				navigate('/modules');
				return;
			}

			setInfo('Redirecting to Google sign-up...');
		} catch (googleError) {
			setError(googleError?.message || 'Google sign-up failed. Please try again.');
		} finally {
			setIsGoogleSubmitting(false);
		}
	};

	return (
		<main className='page-shell'>
			<section className='container auth-wrap'>
				<div className='card'>
					<h1 className='page-title'>Register</h1>
					<p className='page-subtitle'>Create an account to track learning progress.</p>

					<form className='auth-form' onSubmit={handleSubmit}>
						<label htmlFor='fullName'>
							Full Name
							<input
								autoComplete='name'
								id='fullName'
								name='fullName'
								onChange={handleChange}
								placeholder='Student name'
								required
								type='text'
								value={formData.fullName}
							/>
						</label>

						<label htmlFor='registerEmail'>
							Email
							<input
								autoComplete='email'
								id='registerEmail'
								name='email'
								onChange={handleChange}
								placeholder='you@example.com'
								required
								type='email'
								value={formData.email}
							/>
						</label>

						<label htmlFor='registerPassword'>
							Password
							<input
								autoComplete='new-password'
								id='registerPassword'
								name='password'
								onChange={handleChange}
								placeholder='Create password'
								required
								type='password'
								value={formData.password}
							/>
						</label>

						<label className='checkbox-row' htmlFor='registerRememberMe'>
							<input
								checked={rememberMe}
								id='registerRememberMe'
								onChange={(event) => setRememberMe(event.target.checked)}
								type='checkbox'
							/>
							<span>Keep me signed in</span>
						</label>

						{error ? <p className='form-error'>{error}</p> : null}
						{success ? <p className='form-success'>{success}</p> : null}
						{info ? <p className='form-success'>{info}</p> : null}

						<button className='btn-primary' disabled={isSubmitting || isAuthLoading} type='submit'>
							Create Account
						</button>

						<div className='auth-divider'>
							<span>or</span>
						</div>

						<button
							className='btn-secondary'
							disabled={isGoogleSubmitting || isAuthLoading}
							onClick={handleGoogleSignup}
							type='button'
						>
							<GoogleIcon />
							Continue with Google
						</button>
					</form>
				</div>
			</section>
		</main>
	);
};

export default Register;
