import { io } from 'socket.io-client';
import { TOKEN_STORAGE_KEY } from './apiClient';

// ─────────────────────────────────────────────
// SOCKET.IO CLIENT — Realtime events
// ─────────────────────────────────────────────
// Handshake: io(SOCKET_URL, { auth: { token: accessToken } })
//
// Server auto-joins rooms based on role:
//   super_admin  → 'platform:all'
//   client scope → 'client:<clientId>'
//   zone scope   → 'zone:<zoneId>'
//
// Events emitted by server:
//   'issue:created'   payload: { issue }
//   'issue:updated'   payload: { issue }
//   'log:submitted'   payload: { log, device }
// ─────────────────────────────────────────────

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketClient {
  constructor() {
    this._socket = null;
    this._listeners = {}; // eventName → Set<callback>
  }

  /** Connect and authenticate. Call once after successful login. */
  connect() {
    if (this._socket?.connected) return;

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      console.warn('[SocketClient] No access token — skipping connection.');
      return;
    }

    this._socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 30000,
      timeout: 10000
    });

    this._socket.on('connect', () => {
      console.info(`[SocketClient] Connected — id: ${this._socket.id}`);
      // Re-subscribe buffered listeners after reconnect
      Object.entries(this._listeners).forEach(([event, cbs]) => {
        cbs.forEach((cb) => this._socket.on(event, cb));
      });
    });

    this._socket.on('connect_error', (err) => {
      // Backend offline — silently ignore in dev
      console.warn('[SocketClient] Connection error (backend may be offline):', err.message);
    });

    this._socket.on('disconnect', (reason) => {
      console.info('[SocketClient] Disconnected:', reason);
    });
  }

  /** Disconnect and clean up all listeners. Call on logout. */
  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
      this._listeners = {};
    }
  }

  /**
   * Subscribe to a server event.
   * Returns an unsubscribe function for easy cleanup in useEffect return.
   *
   * @example
   * const unsub = socketClient.on('issue:created', (payload) => { ... });
   * return () => unsub();
   */
  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = new Set();
    this._listeners[event].add(callback);
    if (this._socket?.connected) {
      this._socket.on(event, callback);
    }
    return () => this.off(event, callback);
  }

  /** Unsubscribe a specific callback from an event. */
  off(event, callback) {
    this._listeners[event]?.delete(callback);
    this._socket?.off(event, callback);
  }

  get isConnected() {
    return this._socket?.connected ?? false;
  }
}

// Singleton — import this across the app
export const socketClient = new SocketClient();
export default socketClient;
