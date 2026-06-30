import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role || user?.user_type;

  // Handle legacy requireAdmin prop
  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Handle new allowedRoles prop
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect based on user role
    if (userRole === 'lawyer') {
      return <Navigate to="/lawyer/dashboard" replace />;
    } else {
      return <Navigate to="/assistant" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
