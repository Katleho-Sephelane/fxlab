import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, setCsrfToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await apiRequest('/auth/me', { method: 'GET' });
      setUser(data.user || null);
    } catch (err) {
      setUser(null);
      // 401 is expected when the visitor is not signed in
      if (err.status !== 401) {
        setAuthError(err.message);
      }
      // Ensure a CSRF token cookie is initialized for subsequent login/register forms
      try {
        await apiRequest('/auth/csrf', { method: 'GET' });
      } catch (_ignore) {
        // Ignore if backend is offline during initial check
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const register = async ({ name, email, password, confirmPassword }) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password, confirmPassword },
    });
    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    setUser(data.user);
    return data;
  };

  const login = async ({ email, password }) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', body: {} });
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    register,
    login,
    logout,
    refreshSession: checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
