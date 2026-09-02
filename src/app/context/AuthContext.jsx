import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY
} from '../api/apiClient';
import { socketClient } from '../api/socketClient';

export const DEMO_CLIENT_ADMIN = {
  user: {
    id: 'usr_client_02',
    name: 'David Miller',
    email: 'client@apexestates.com',
    role: 'client_admin',
    facilityName: 'Apex Tech Tower - Campus A',
    companyName: 'Apex Commercial Estates Ltd.',
    clientId: 'client_apex_001',
    zoneName: 'Entire Facility'
  },
  accessToken: 'mock_jwt_access_clientadmin_token',
  refreshToken: 'mock_refresh_hex_clientadmin_7a2d4f8e',
  zoneDescendants: [
    { id: 'zone_apex_01', name: 'Apex Tech Tower - Campus A', parentZoneId: null, status: 'active', depth: 0 }
  ],
  zoneAncestors: [
    { id: 'zone_apex_01', name: 'Apex Tech Tower - Campus A', depth: 0 }
  ]
};

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
  const isClientAdmin = currentUser?.role === 'client_admin' || currentUser?.role === 'zone_incharge';

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
      console.warn('[AuthContext] Backend login error, checking demo credentials fallback:', err.message);

      // 2. Demo Client Admin fallback credentials
      if (
        normalizedEmail === 'client@apexestates.com' ||
        normalizedEmail === 'clientadmin@fixly.io' ||
        normalizedEmail === 'client@fixly.io'
      ) {
        const demo = DEMO_CLIENT_ADMIN;
        apiClient.setTokens(demo.accessToken, demo.refreshToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demo.user));
        setCurrentUser(demo.user);
        setZoneDescendants(demo.zoneDescendants);
        setZoneAncestors(demo.zoneAncestors);
        socketClient.connect();
        return { success: true, user: demo.user, isDemo: true };
      }

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
