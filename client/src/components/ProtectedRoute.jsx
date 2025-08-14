// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // We select both isLoading and isAuthenticated from the Redux state.
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // The key insight: if we're not authenticated, redirect to login.
  // This works both on initial load (if no token) and after a failed login attempt.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we've passed the check, it means isAuthenticated is true. Render the children.
  return children;
}

export default ProtectedRoute;