import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(role);

  // Redirect to unauthorized page if role doesn't match
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute;