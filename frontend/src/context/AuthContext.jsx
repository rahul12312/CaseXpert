import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../lib/api.js';
import { API_BASE_URL } from '../config/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // ── On mount: restore session from localStorage ──
  useEffect(() => {
    const roles = ['admin', 'lawyer', 'client', 'user'];
    let foundAuth = null;
    let foundRole = null;

    for (const r of roles) {
      const stored = localStorage.getItem(`casexpert_auth_${r}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.token && parsed.user) {
            foundAuth = parsed;
            foundRole = r;
            break;
          }
        } catch (_) {}
      }
    }

    // Fallback to legacy key if exists
    if (!foundAuth) {
      const oldStored = localStorage.getItem('casexpert_auth');
      if (oldStored) {
        try {
          const parsed = JSON.parse(oldStored);
          if (parsed.token && parsed.user) {
            foundAuth = parsed;
            const role = parsed.user.role || parsed.user.user_type || 'user';
            foundRole = role === 'client' ? 'user' : role;
            localStorage.setItem(`casexpert_auth_${foundRole}`, oldStored);
            localStorage.removeItem('casexpert_auth');
          }
        } catch (_) {}
      }
    }

    if (foundAuth) {
      setToken(foundAuth.token);
      setUser(foundAuth.user);
      setAuthToken(foundAuth.token);
    }
    setInitializing(false);
  }, []);

  // ── Cross-tab sync via storage events ──
  // When another tab logs out, only affect THIS tab if it's the same role.
  // This ensures: Lawyer in Tab B stays logged in when Client logs out in Tab A.
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (!event.key || !event.key.startsWith('casexpert_auth_')) return;

      const changedRole = event.key.replace('casexpert_auth_', '');

      setUser(currentUser => {
        if (!currentUser) return currentUser; // Already logged out in this tab

        const currentRole = currentUser.role || currentUser.user_type || 'user';
        const normalizedCurrentRole = currentRole === 'client' ? 'user' : currentRole;

        // Only react if it's THIS tab's user role that was affected
        if (normalizedCurrentRole !== changedRole) {
          // A different role's key changed — this tab is completely unaffected
          return currentUser;
        }

        if (event.newValue === null) {
          // This role's key was deleted in another tab → log out this tab too
          setToken(null);
          setAuthToken(null);
          return null;
        } else {
          // Another tab updated this role's session → sync it
          try {
            const parsed = JSON.parse(event.newValue);
            if (parsed.token && parsed.user) {
              setToken(parsed.token);
              setAuthToken(parsed.token);
              return parsed.user;
            }
          } catch (_) {}
        }
        return currentUser;
      });
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Handle token expiry (401) dispatched by api.js interceptor ──
  useEffect(() => {
    const handleUnauthorized = (event) => {
      const { expiredToken } = event.detail || {};
      setUser(currentUser => {
        if (!currentUser) return currentUser;
        // Only log out if the expired token matches THIS tab's current token
        setToken(currentToken => {
          if (currentToken && currentToken === expiredToken) {
            setAuthToken(null);
            // Redirect to login after state is cleared
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login?expired=true';
            }
            return null;
          }
          return currentToken;
        });
        return currentUser;
      });
    };

    window.addEventListener('casexpert:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('casexpert:unauthorized', handleUnauthorized);
  }, []);

  // ── Persist session to localStorage when user/token state changes ──
  useEffect(() => {
    if (!initializing) {
      if (token && user) {
        const userRole = user.role || user.user_type || 'user';
        const roleKey = userRole === 'client' ? 'user' : userRole;
        localStorage.setItem(`casexpert_auth_${roleKey}`, JSON.stringify({ user, token }));
      }
    }
  }, [user, token, initializing]);

  // ── Sync token to axios defaults ──
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    const userRole = data.user.role || data.user.user_type || 'user';
    const roleKey = userRole === 'client' ? 'user' : userRole;

    setUser(data.user);
    setToken(data.token);

    // Write to localStorage immediately (ensures storage event fires for other tabs)
    localStorage.setItem(`casexpert_auth_${roleKey}`, JSON.stringify({
      user: data.user,
      token: data.token
    }));

    return data.user;
  };

  // Step 1 — send OTP to email (does NOT create session)
  const sendOTP = async payload => {
    const { data } = await api.post('/auth/send-otp', payload);
    return data; // { success, message, email }
  };

  // Step 2 — verify OTP, activate account, auto-login
  const verifyOTP = async (email, otp, extraPayload = {}) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp, ...extraPayload });
    if (data.token && data.user) {
      const userRole = data.user.role || data.user.user_type || 'user';
      const roleKey = userRole === 'client' ? 'user' : userRole;
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(`casexpert_auth_${roleKey}`, JSON.stringify({ user: data.user, token: data.token }));
    }
    return data;
  };

  // Resend OTP to same email
  const resendOTP = async (email) => {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  };

  // Legacy register (kept for backward compat)
  const register = async payload => {
    const { data } = await api.post('/auth/register', payload);
    return data.user;
  };

  const logout = (targetRole = null) => {
    let roleToClear = targetRole;

    if (!roleToClear && user) {
      const userRole = user.role || user.user_type || 'user';
      roleToClear = userRole === 'client' ? 'user' : userRole;
    }

    if (roleToClear) {
      // Only remove THIS user's role key — other role sessions remain intact
      localStorage.removeItem(`casexpert_auth_${roleToClear}`);
    } else {
      // Fallback: clear all if role is unknown
      ['admin', 'lawyer', 'user', 'client'].forEach(r =>
        localStorage.removeItem(`casexpert_auth_${r}`)
      );
    }

    // Remove legacy key too
    localStorage.removeItem('casexpert_auth');

    // Clear React state for this tab only
    setUser(null);
    setToken(null);
  };

  const switchRole = (newRole) => {
    const roleKey = newRole === 'client' ? 'user' : newRole;
    const stored = localStorage.getItem(`casexpert_auth_${roleKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
        setAuthToken(parsed.token);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const isLawyer = () => user?.role === 'lawyer' || user?.user_type === 'lawyer';
  const isClient = () =>
    user?.role === 'client' || user?.user_type === 'client' || user?.role === 'user';
  const isAdmin = () => user?.role === 'admin' || user?.user_type === 'admin';
  const getUserRole = () => user?.role || user?.user_type || null;

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    sendOTP,
    verifyOTP,
    resendOTP,
    logout,
    updateUser,
    switchRole,
    isLawyer,
    isClient,
    isAdmin,
    getUserRole,
    role: getUserRole(),
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
