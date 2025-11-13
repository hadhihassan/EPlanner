// components/auth/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import LoadingSpinner from '../ui/Spinner';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  console.log(isAuthenticated, loading);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner  />
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;