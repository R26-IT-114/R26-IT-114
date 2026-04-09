import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { initObservability } from './services/observability';
import './styles/global.css';

initObservability();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
