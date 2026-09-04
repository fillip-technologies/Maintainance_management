import { io } from 'socket.io-client';
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './apiClient';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const API_BASE  = import.meta.env.VITE_API_BASE_URL  || 'http://localhost:3000/api/v1';

class SocketClient {
  constructor() {
    this._socket = null;
    this._listeners = {}; // eventName → Set<callback>
    this._refreshing = false;
  }

  connect() {
    if (this._socket?.connected) return;

    if (!localStorage.getItem(TOKEN_STORAGE_KEY)) {
      console.warn('[SocketClient] No access token — skipping connection.');
      return;
    }

    this._socket = io(SOCKET_URL, {
      // Function form: re-read token from storage on every (re)connect attempt so
      // a refreshed access token is always used instead of the stale one captured
      // at the time connect() was first called.
      auth: (cb) => cb({ token: localStorage.getItem(TOKEN_STORAGE_KEY) }),
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      timeout: 20000,
    });

    this._socket.on('connect', () => {
      console.info(`[SocketClient] Connected — id: ${this._socket.id}`);
      // Sync buffered listeners — deduplicated via off+on so reconnects never
      // double-up (Socket.IO v4 reuses the same socket object across reconnects,
      // so listeners registered in previous connect events are still attached).
      this._syncListeners();
    });

    this._socket.on('connect_error', async (err) => {
      if (err.message === 'Unauthorized' && !this._refreshing) {
        // Access token rejected — try refreshing so the next reconnect attempt
        // picks up a valid token (auth function reads from localStorage).
        this._refreshing = true;
        try {
          const rt = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
          if (rt) {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: rt }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.data?.accessToken) {
              localStorage.setItem(TOKEN_STORAGE_KEY, data.data.accessToken);
              if (data.data.refreshToken)
                localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.data.refreshToken);
              // Socket.IO will auto-retry; the auth function will pick up the new token.
            }
          }
        } catch { /* silent — network may be down */ }
        finally { this._refreshing = false; }
        return;
      }
      console.warn('[SocketClient] Connection error:', err.message);
    });

    this._socket.on('disconnect', (reason) => {
      console.info('[SocketClient] Disconnected:', reason);
    });

    this._socket.on('error', (payload) => {
      console.warn('[SocketClient] Server error:', payload?.message ?? payload);
    });
  }

  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
      this._listeners = {};
    }
  }

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = new Set();
    this._listeners[event].add(callback);
    if (this._socket?.connected) {
      this._socket.off(event, callback); // prevent duplicates if already attached
      this._socket.on(event, callback);
    }
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this._listeners[event]?.delete(callback);
    this._socket?.off(event, callback);
  }

  get isConnected() {
    return this._socket?.connected ?? false;
  }

  _syncListeners() {
    for (const [event, cbs] of Object.entries(this._listeners)) {
      for (const cb of cbs) {
        this._socket.off(event, cb); // remove first to prevent duplicate firings
        this._socket.on(event, cb);
      }
    }
  }
}

export const socketClient = new SocketClient();
export default socketClient;
