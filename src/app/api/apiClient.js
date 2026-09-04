// Centralized API Client matching Maintenance Management API Specification (v1)

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const TOKEN_STORAGE_KEY = 'fixly_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'fixly_refresh_token';
export const USER_STORAGE_KEY = 'fixly_user_data';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.isRefreshing = false;
  }

  getAccessToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  clearAuth() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAccessToken();

    // For multipart/form-data requests (file uploads), omit Content-Type so the
    // browser sets it automatically with the correct boundary string.
    const headers = {
      ...(options._multipart ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Status 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const resData = await response.json().catch(() => ({}));

      // Handle 401 — try token refresh first, then give up and force login
      if (response.status === 401 && !options._retry) {
        options._retry = true;
        const newAccessToken = await this.handleTokenRefresh();
        if (newAccessToken) {
          headers.Authorization = `Bearer ${newAccessToken}`;
          return this.request(endpoint, { ...options, headers });
        }
        // Refresh failed or no refresh token — session is dead, kick to login
        this.clearAuth();
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const error = new Error(resData.message || 'API request failed');
        error.code = resData.code || 'HTTP_ERROR';
        error.status = response.status;
        error.details = resData.details || [];
        throw error;
      }

      return resData;
    } catch (err) {
      // Do NOT clear auth on network error (e.g. backend offline in dev)
      throw err;
    }
  }

  async handleTokenRefresh() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return data.data.accessToken;
      } else if (res.status === 401 && data.code === 'REFRESH_INVALID') {
        // Only clear auth if the server explicitly rejected the refresh token as invalid/revoked
        this.clearAuth();
        return null;
      }
    } catch (e) {
      // Network error or backend offline — preserve existing tokens
      return null;
    }
    return null;
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password })
    });
  }

  async logout() {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        });
      }
    } finally {
      this.clearAuth();
    }
  }

  async getMe() {
    return this.request('/auth/me', { method: 'GET' });
  }
}

export const apiClient = new ApiClient(BASE_URL);
export default apiClient;
