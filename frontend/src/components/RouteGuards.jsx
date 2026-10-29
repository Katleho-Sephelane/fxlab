import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NexoraLogo from './NexoraLogo';

export function AuthLoadingScreen({ label = 'Verifying secure session...' }) {
  return (
    <div className="auth-loading-screen" role="status" aria-live="polite">
      <div className="auth-loading-card">
        <NexoraLogo size={42} showWordmark={true} />
        <div className="spinner-ring" aria-hidden="true" />
        <p className="auth-loading-text">{label}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
