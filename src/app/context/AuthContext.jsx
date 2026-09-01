import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY
} from '../api/apiClient';
import { socketClient } from '../api/socketClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read stored user from localStorage session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      const token = apiClient.getAccessToken();
      if (stored && token) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [zoneDescendants, setZoneDescendants] = useState([]);
  const [zoneAncestors, setZoneAncestors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Connect realtime socket on startup if authenticated
  useEffect(() => {
    if (currentUser && apiClient.getAccessToken()) {
      socketClient.connect();
    }
  }, [currentUser]);

  const isAuthenticated = !!currentUser && !!apiClient.getAccessToken();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isClientAdmin = currentUser?.role === 'client_admin' || currentUser?.role === 'zone_incharge';

  // Login handler connected directly to your database API
  const login = async (email, password) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Direct call to backend http://localhost:3000/api/v1/auth/login
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
      console.error('[AuthContext] Login error from database API:', err);
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
        zoneDescendants,
        zoneAncestors,
        login,
        logout,
        loading
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
