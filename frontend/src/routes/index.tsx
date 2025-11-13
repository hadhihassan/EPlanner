import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';

const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const EventDetails = lazy(() => import('../pages/Events/EventDetails'));
const CalendarView = lazy(() => import('../pages/Dashboard/CalendarView'));
const NotificationsPanel = lazy(() => import('../pages/Notifications/NotificationsPanel'));

const routes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  
  // Public routes (only for non-authenticated users)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Login />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <AuthLayout>
          <Register />
        </AuthLayout>
      </PublicRoute>
    ),
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'calendar', element: <CalendarView /> },
      { path: 'events/:id', element: <EventDetails /> },
      { path: 'notifications', element: <NotificationsPanel /> },
    ],
  },

  // Fallback route
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export default routes;