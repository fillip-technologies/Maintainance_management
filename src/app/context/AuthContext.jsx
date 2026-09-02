import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY
} from '../api/apiClient';
import { socketClient } from '../api/socketClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [zoneDescendants, setZoneDescendants] = useState([]);
  const [zoneAncestors, setZoneAncestors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bootstrapping, setBootstrapping] = useState(() => !!apiClient.getAccessToken());

  useEffect(() => {
    let cancelled = false;

    async function verifyStoredSession() {
      if (!apiClient.getAccessToken()) {
        setBootstrapping(false);
        return;
      }
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          socketClient.connect();
        } else {
          apiClient.clearAuth();
        }
      } catch {
        if (!cancelled) apiClient.clearAuth();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    verifyStoredSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticated = !!currentUser && !!apiClient.getAccessToken();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  // client_admin ONLY — a zone_incharge is a zone officer, not a client admin,
  // and must not inherit client-admin affordances.
  const isClientAdmin = currentUser?.role === 'client_admin';
  const isZoneOfficer = currentUser?.role === 'zone_incharge' || currentUser?.role === 'zone_staff';

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Direct call to backend http://localhost:3000/api/v1/auth/login
      const response = await apiClient.login(normalizedEmail, password);
      
      if (response && response.success && response.data) {
        const { accessToken, refreshToken, user, zoneDescendants = [], zoneAncestors = [] } = response.data;
        apiClient.setTokens(accessToken, refreshToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        setCurrentUser(user);
        setZoneDescendants(zoneDescendants);
        setZoneAncestors(zoneAncestors);
        socketClient.connect();
        return { success: true, user };
      }
      throw new Error(response?.message || 'Login failed. Please check your credentials.');
    } catch (err) {
      console.error('[AuthContext] Login error:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // ignore
    } finally {
      socketClient.disconnect();
      apiClient.clearAuth();
      setCurrentUser(null);
      setZoneDescendants([]);
      setZoneAncestors([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || null,
        isAuthenticated,
        isSuperAdmin,
        isClientAdmin,
        isZoneOfficer,
        zoneDescendants,
        zoneAncestors,
        login,
        logout,
        loading,
        bootstrapping
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
