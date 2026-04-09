import { Link } from 'react-router-dom';

const NotFound = () => {
	return (
		<main className='page-shell'>
			<section className='container auth-wrap'>
				<div className='card'>
					<h1 className='page-title'>404 | Page Not Found</h1>
					<p className='page-subtitle'>The page you requested does not exist.</p>
					<div className='stack-sm'>
						<Link className='btn-primary' to='/'>
							Back to Home
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
};

export default NotFound;
