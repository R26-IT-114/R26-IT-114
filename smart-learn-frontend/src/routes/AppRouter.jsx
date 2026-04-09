import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import {
  dyscalculiaRoutes,
  dysgraphiaRoutes,
  dyslexiaRoutes,
  workingMemoryRoutes,
} from '../modules';
import ProtectedRoute from './ProtectedRoute';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ModuleSelection = lazy(() => import('../pages/ModuleSelection'));
const AdminRecommendations = lazy(() => import('../pages/AdminRecommendations'));
const NotFound = lazy(() => import('../pages/NotFound'));

const withSuspense = (element) => <Suspense fallback={<div className='page-shell'>Loading page...</div>}>{element}</Suspense>;

const MODULE_ACCESS = {
  dyscalculia: ['student', 'therapist', 'admin'],
  dysgraphia: ['student', 'therapist', 'admin'],
  dyslexia: ['student', 'therapist', 'admin'],
  'working-memory': ['student', 'therapist', 'admin'],
};

const withRoleGuard = (routes = []) => {
  return routes.map((route) => ({
    ...route,
    element: (
      <ProtectedRoute allowedRoles={MODULE_ACCESS[route.path] || []}>
        {withSuspense(route.element)}
      </ProtectedRoute>
    ),
  }));
};

const AppRouter = () => {
  const routes = [
    { path: '/', element: withSuspense(<Home />) },
    { path: '/login', element: withSuspense(<Login />) },
    { path: '/register', element: withSuspense(<Register />) },
    {
      path: '/modules',
      element: (
        <ProtectedRoute allowedRoles={['student', 'therapist', 'admin']}>
          {withSuspense(<ModuleSelection />)}
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/recommendations',
      element: (
        <ProtectedRoute allowedRoles={['therapist', 'admin']}>
          {withSuspense(<AdminRecommendations />)}
        </ProtectedRoute>
      ),
    },
    ...withRoleGuard(dyscalculiaRoutes),
    ...withRoleGuard(dysgraphiaRoutes),
    ...withRoleGuard(dyslexiaRoutes),
    ...withRoleGuard(workingMemoryRoutes),
    { path: '/404', element: withSuspense(<NotFound />) },
    { path: '*', element: <Navigate to='/404' replace /> },
  ];

  return useRoutes(routes);
};

export default AppRouter;
