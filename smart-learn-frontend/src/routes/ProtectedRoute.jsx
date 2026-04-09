import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isAuthLoading, user } = useAuth();

  if (isAuthLoading) {
    return <div className='page-shell'>Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to='/404' replace />;
  }

  return children;
};

export default ProtectedRoute;
