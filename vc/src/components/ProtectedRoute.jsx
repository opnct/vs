import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // If there is no authenticated user object, strictly prevent access.
  if (!user) {
    // Replace current history entry with login to prevent "back button" bypasses.
    // Pass the attempted location in state so we can theoretically return them there later.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user passes the check, render the intended secure component
  return children;
}