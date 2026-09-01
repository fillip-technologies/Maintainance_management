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

  // While true, we're verifying a stored token against the API. Routes must not
  // render yet, or an unverified session would flash the dashboard before the
  // redirect. If there's no token at all, there's nothing to verify.
  const [bootstrapping, setBootstrapping] = useState(() => !!apiClient.getAccessToken());

  // On startup, validate any stored token by calling /auth/me. A token merely
  // sitting in localStorage is NOT proof of a live session — it can be expired
  // or revoked. apiClient.request() auto-rotates via the refresh token on
  // TOKEN_INVALID and only clears auth when the server rejects the refresh too.
  useEffect(() => {
    let cancelled = false;

    async function verifyStoredSession() {
      if (!apiClient.getAccessToken()) {
        setBootstrapping(false);
        return;
      }
      try {
        // Validation signal only — /auth/me returns just id/role/clientId, so we
        // restore the full user (name, zoneId) from localStorage, not from here.
        await apiClient.getMe();
        if (cancelled) return;

        const stored = localStorage.getItem(USER_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          socketClient.connect();
        } else {
          // Token is valid but we lost the user record — force a fresh login.
          apiClient.clearAuth();
        }
      } catch {
        // Expired/revoked token (refresh also failed) → no valid session.
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
