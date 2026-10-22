import { create } from 'zustand';
import { IChat, ChatCategory } from './types';
import { initialChats } from './mockData';

interface ChatState {
  chats: IChat[];
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  deleteChat: (id: string) => void;
  updateLastMessage: (id: string, text: string, time?: string, isMe?: boolean) => void;
  markAsRead: (id: string) => void;
}

export const sortChats = (chats: IChat[]): IChat[] => {
  return [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isPinned && b.isPinned) {
      return (b.pinnedAt || 0) - (a.pinnedAt || 0);
    }
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });
};

export const filterChatsByCategory = (chats: IChat[], category: ChatCategory): IChat[] => {
  const filtered = chats.filter((chat) => {
    if (category === 'archive') {
      return chat.isArchived;
    }
    if (chat.isArchived) {
      return false;
    }
    if (category === 'personal') {
      return chat.isPersonal;
    }
    return true;
  });
  return sortChats(filtered);
};

export const useChatStore = create<ChatState>((set) => ({
  chats: initialChats,

  togglePin: (id: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          const nextPinned = !chat.isPinned;
          return {
            ...chat,
            isPinned: nextPinned,
            pinnedAt: nextPinned ? Date.now() : undefined,
          };
        }
        return chat;
      }),
    }));
  },

  toggleArchive: (id: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          const nextArchived = !chat.isArchived;
          return {
            ...chat,
            isArchived: nextArchived,
            isPinned: nextArchived ? false : chat.isPinned,
          };
        }
        return chat;
      }),
    }));
  },

  deleteChat: (id: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== id),
    }));
  },

  updateLastMessage: (id: string, text: string, time?: string, isMe = true) => {
    const timestamp = time || new Date().toISOString();
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          return {
            ...chat,
            lastMessage: text,
            lastMessageTime: timestamp,
            lastMessageSenderMe: isMe,
            lastMessageRead: true,
          };
        }
        return chat;
      }),
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          return {
            ...chat,
            unreadCount: 0,
          };
        }
        return chat;
      }),
    }));
  },
}));
