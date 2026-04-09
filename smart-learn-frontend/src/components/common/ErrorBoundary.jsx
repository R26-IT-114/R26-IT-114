import { Component } from 'react';
import { Link } from 'react-router-dom';
import { logTelemetryError } from '../../services/telemetry';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logTelemetryError('react-error-boundary', error, {
      componentStack: errorInfo?.componentStack || '',
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className='page-shell'>
          <section className='container auth-wrap'>
            <div className='card'>
              <h1 className='page-title'>Something went wrong</h1>
              <p className='page-subtitle'>
                We captured this error for diagnostics. Try reloading or go back home.
              </p>
              <div className='error-boundary-actions'>
                <button className='btn-primary' onClick={this.handleReload} type='button'>
                  Reload app
                </button>
                <Link className='btn-secondary' to='/'>
                  Go to home
                </Link>
              </div>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
