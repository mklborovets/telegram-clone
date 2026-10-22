import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMessage } from './types';
import { initialMessages } from './mockData';
import { useChatStore } from '../../chat';

interface MessageState {
  messages: Record<string, IMessage[]>;
  addMessage: (chatId: string, text: string, isMe?: boolean) => IMessage;
  getMessagesByChatId: (chatId: string) => IMessage[];
  markAsRead: (chatId: string) => void;
  toggleRead: (chatId: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
  messages: initialMessages,

  addMessage: (chatId: string, text: string, isMe = true) => {
    const timestamp = new Date().toISOString();
    const newMessage: IMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      chatId,
      text: text.trim(),
      createdAt: timestamp,
      isMe,
      isRead: isMe,
    };

    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      return {
        messages: {
          ...state.messages,
          [chatId]: [...chatMessages, newMessage],
        },
      };
    });

    useChatStore.getState().updateLastMessage(chatId, newMessage.text, timestamp, isMe);

    return newMessage;
  },

  getMessagesByChatId: (chatId: string) => {
    return get().messages[chatId] || [];
  },

  markAsRead: (chatId: string) => {
    set((state) => {
      const chatMessages = state.messages[chatId];
      if (!chatMessages) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((msg) =>
            msg.isRead ? msg : { ...msg, isRead: true }
          ),
        },
      };
    });
  },

  toggleRead: (chatId: string) => {
    set((state) => {
      const chatMessages = state.messages[chatId];
      if (!chatMessages || chatMessages.length === 0) {
        return state;
      }
      const hasUnread = chatMessages.some((msg) => !msg.isMe && !msg.isRead);
      if (hasUnread) {
        return {
          messages: {
            ...state.messages,
            [chatId]: chatMessages.map((msg) =>
              msg.isRead ? msg : { ...msg, isRead: true }
            ),
          },
        };
      } else {
        const lastIndex = chatMessages.length - 1;
        return {
          messages: {
            ...state.messages,
            [chatId]: chatMessages.map((msg, index) =>
              index === lastIndex && !msg.isMe
                ? { ...msg, isRead: false }
                : msg
            ),
          },
        };
      }
    });
  },
    }),
    {
      name: 'telegram-messages-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
