import { Component } from 'react';
import { logTelemetryError } from '../../services/telemetry';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // save details locally so user can retry without losing info
    this.setState({ error, errorInfo });
    logTelemetryError('react-error-boundary', error, {
      componentStack: errorInfo?.componentStack || '',
    });
    // keep the original console error for developer debugging
    // eslint-disable-next-line no-console
    console.error('Captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    // use assign so SPA state resets cleanly
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className='page-shell'>
          <section className='container auth-wrap'>
            <div className='card'>
              <h1 className='page-title'>Something went wrong</h1>
              <p className='page-subtitle'>
                We captured this error for diagnostics. You can try reloading, retry rendering, or go back home.
              </p>
              <div className='error-boundary-actions' style={{ display: 'flex', gap: 12 }}>
                <button className='btn-primary' onClick={this.handleReload} type='button'>
                  Reload app
                </button>
                <button className='btn-primary' onClick={this.handleRetry} type='button'>
                  Try again
                </button>
                <button className='btn-secondary' onClick={this.handleGoHome} type='button'>
                  Go to home
                </button>
              </div>
              {this.state.error && (
                <details style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
                  <summary>Technical details</summary>
                  {this.state.error?.toString()}
                  <div>{this.state.errorInfo?.componentStack}</div>
                </details>
              )}
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
