import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

export interface RemoteUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  bio?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export const apiClient = {
  async auth(user: Partial<RemoteUser> & { id: string }): Promise<RemoteUser | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async searchUsers(query = ''): Promise<RemoteUser[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/users?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.users || [];
    } catch {
      return [];
    }
  },

  async getUser(id: string): Promise<RemoteUser | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(id)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async getMessages(chatId: string): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/messages/${encodeURIComponent(chatId)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.messages || [];
    } catch {
      return [];
    }
  },
};
