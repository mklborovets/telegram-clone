import { Platform } from 'react-native';

export type SocketEventHandler = (data: any) => void;

interface OutboxItem {
  type: string;
  data: Record<string, any>;
}

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<SocketEventHandler>> = new Map();
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;
  private serverUrl: string;

  private pingInterval: any = null;
  private pongTimeout: any = null;
  private readonly PING_INTERVAL_MS = 25000;
  private readonly PONG_TIMEOUT_MS = 10000;

  private outbox: OutboxItem[] = [];
  private readonly MAX_OUTBOX_SIZE = 100;

  constructor() {
    this.serverUrl =
      Platform.OS === 'android'
        ? 'ws://10.0.2.2:3000'
        : 'ws://localhost:3000';
  }

  public setServerUrl(url: string) {
    this.serverUrl = url;
    if (this.ws) {
      this.disconnect();
      this.connect();
    }
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.emitLocal('connected', { timestamp: new Date().toISOString() });
        this.startHeartbeat();
        this.flushOutbox();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type) {
            if (payload.type === 'pong') {
              this.handlePong();
              return;
            }
            this.emitLocal(payload.type, payload);
          }
        } catch {}
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.emitLocal('disconnected', {});
        this.ws = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.emitLocal('error', {});
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ws!.send(JSON.stringify({ type: 'ping' }));
        this.pongTimeout = setTimeout(() => {
          if (this.ws) {
            this.ws.close();
          }
        }, this.PONG_TIMEOUT_MS);
      }
    }, this.PING_INTERVAL_MS);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private handlePong() {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  private flushOutbox() {
    while (this.outbox.length > 0 && this.isConnected()) {
      const item = this.outbox.shift();
      if (item) {
        this.ws!.send(JSON.stringify({ type: item.type, ...item.data }));
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isExplicitlyClosed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  public send(type: string, data: Record<string, any> = {}) {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify({ type, ...data }));
    } else {
      if (type !== 'ping' && type !== 'pong') {
        if (type === 'typing' && !data.isTyping) {
          return;
        }
        if (this.outbox.length >= this.MAX_OUTBOX_SIZE) {
          this.outbox.shift();
        }
        this.outbox.push({ type, data });
      }
    }
  }

  public on(event: string, handler: SocketEventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  public off(event: string, handler: SocketEventHandler) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  private emitLocal(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch {}
      });
    }
  }

  public isConnected(): boolean {
    return Boolean(this.ws && this.ws.readyState === WebSocket.OPEN);
  }
}

export const socketClient = new SocketClient();
