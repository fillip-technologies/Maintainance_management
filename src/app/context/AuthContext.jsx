import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, {
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY
} from '../api/apiClient';
import { getLocalUsers } from '../api/usersApi';
import { socketClient } from '../api/socketClient';

// Demo fallback users matching backend schema when testing offline
export const DEMO_USERS = {
  'admin@fixly.io': {
    user: {
      id: 'usr_super_01',
      name: 'Alex Morrison',
      email: 'admin@fixly.io',
      role: 'super_admin',
      companyId: 'comp_fixly_hq',
      clientId: null,
      zoneId: null
    },
    accessToken: 'mock_jwt_access_superadmin',
    refreshToken: 'mock_refresh_hex_superadmin_9f3c2b1a',
    zoneDescendants: [],
    zoneAncestors: []
  },
  'client@apexestates.com': {
    user: {
      id: 'usr_client_02',
      name: 'David Miller',
      email: 'client@apexestates.com',
      role: 'client_admin',
      companyId: null,
      clientId: 'client_apex_001',
      facilityName: 'Apex Tech Tower - Campus A',
      zoneId: 'zone_apex_01',
      zoneName: 'North Wing - Floor 1-4'
    },
    accessToken: 'mock_jwt_access_clientadmin',
    refreshToken: 'mock_refresh_hex_clientadmin_7a2d4f8e',
    zoneDescendants: [
      { id: 'zone_apex_01', name: 'Apex Tech Tower - Campus A', parentZoneId: null, status: 'active', depth: 0 }
    ],
    zoneAncestors: [
      { id: 'zone_apex_01', name: 'Apex Tech Tower - Campus A', depth: 0 }
    ]
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read stored user or fallback
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          const isSuper = parsed.role === 'super_admin' || parsed.email === 'admin@fixly.io';
          const demo = isSuper ? DEMO_USERS['admin@fixly.io'] : DEMO_USERS['client@apexestates.com'];
          if (!apiClient.getAccessToken()) {
            apiClient.setTokens(demo.accessToken, demo.refreshToken);
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    
    // Default initial user session for development
    const defaultUser = DEMO_USERS['admin@fixly.io'];
    apiClient.setTokens(defaultUser.accessToken, defaultUser.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser.user));
    return defaultUser.user;
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

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Attempt real API call to backend http://localhost:3000/api/v1/auth/login
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
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      console.warn('[AuthContext] Backend login attempt fallback:', err.message);

      // 2. Check if credentials match static demo profiles
      if (DEMO_USERS[normalizedEmail]) {
        const demoData = DEMO_USERS[normalizedEmail];
        apiClient.setTokens(demoData.accessToken, demoData.refreshToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoData.user));
        setCurrentUser(demoData.user);
        setZoneDescendants(demoData.zoneDescendants);
        setZoneAncestors(demoData.zoneAncestors);
        socketClient.connect();
        return { success: true, user: demoData.user, isDemo: true };
      }

      // 3. Check if user was created via UI in local user store
      try {
        const localUsers = getLocalUsers();
        const foundUser = localUsers.find(
          (u) => u.email === normalizedEmail && u.accountStatus !== 'removed'
        );

        if (foundUser) {
          const isSuper = foundUser.role === 'super_admin';
          const token = isSuper ? 'mock_jwt_access_superadmin' : 'mock_jwt_access_clientadmin';
          const refresh = isSuper ? 'mock_refresh_hex_superadmin_9f3c2b1a' : 'mock_refresh_hex_clientadmin_7a2d4f8e';

          apiClient.setTokens(token, refresh);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
          setCurrentUser(foundUser);
          socketClient.connect();
          return { success: true, user: foundUser, isLocal: true };
        }
      } catch (e) {
        console.error(e);
      }

      // 4. Fallback for any email in dev if password is valid
      if (password && password.trim().length >= 6) {
        const isSuper = normalizedEmail.includes('admin@fixly') || normalizedEmail.includes('superadmin');
        const generatedUser = {
          id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
          name: normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email: normalizedEmail,
          role: isSuper ? 'super_admin' : 'client_admin',
          accountStatus: 'active',
          facilityName: 'Apex Tech Tower - Campus A',
          createdAt: new Date().toISOString()
        };

        const token = isSuper ? 'mock_jwt_access_superadmin' : 'mock_jwt_access_clientadmin';
        const refresh = isSuper ? 'mock_refresh_hex_superadmin_9f3c2b1a' : 'mock_refresh_hex_clientadmin_7a2d4f8e';

        apiClient.setTokens(token, refresh);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(generatedUser));
        setCurrentUser(generatedUser);
        socketClient.connect();
        return { success: true, user: generatedUser, isFallback: true };
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

  // Fast demo switcher
  const switchDemoRole = async (role) => {
    const email = role === 'super_admin' ? 'admin@fixly.io' : 'client@apexestates.com';
    return login(email, 'Password123!');
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
        switchDemoRole,
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
