import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../../../shared/lib/storage';
import { IMessage } from './types';
import { initialMessages } from './mockData';
import { useChatStore } from '../../chat';

interface MessageState {
  messages: Record<string, IMessage[]>;
  addMessage: (
    chatId: string,
    text: string,
    isMe?: boolean,
    mediaType?: 'photo' | 'file',
    mediaUri?: string,
    fileName?: string,
    fileSize?: string
  ) => IMessage;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  getMessagesByChatId: (chatId: string) => IMessage[];
  markAsRead: (chatId: string) => void;
  toggleRead: (chatId: string) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: initialMessages,

      addMessage: (
        chatId: string,
        text: string,
        isMe = true,
        mediaType,
        mediaUri,
        fileName,
        fileSize
      ) => {
        const timestamp = new Date().toISOString();
        const newMessage: IMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          chatId,
          text: text.trim(),
          createdAt: timestamp,
          isMe,
          isRead: isMe,
          mediaType,
          mediaUri,
          fileName,
          fileSize,
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

        useChatStore
          .getState()
          .updateLastMessage(chatId, newMessage.text, timestamp, isMe, mediaType);

        return newMessage;
      },

      editMessage: (chatId: string, messageId: string, newText: string) => {
        const trimmed = newText.trim();
        set((state) => {
          const chatMessages = state.messages[chatId] || [];
          const updatedMessages = chatMessages.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: trimmed,
                isEdited: true,
              };
            }
            return msg;
          });

          const lastMsg = updatedMessages[updatedMessages.length - 1];
          if (lastMsg && lastMsg.id === messageId) {
            useChatStore
              .getState()
              .updateLastMessage(
                chatId,
                trimmed,
                lastMsg.createdAt,
                lastMsg.isMe,
                lastMsg.mediaType
              );
          }

          return {
            messages: {
              ...state.messages,
              [chatId]: updatedMessages,
            },
          };
        });
      },

      deleteMessage: (chatId: string, messageId: string) => {
        set((state) => {
          const chatMessages = state.messages[chatId] || [];
          const updatedMessages = chatMessages.filter((msg) => msg.id !== messageId);

          const lastMsg = updatedMessages[updatedMessages.length - 1];
          if (lastMsg) {
            useChatStore
              .getState()
              .updateLastMessage(
                chatId,
                lastMsg.text,
                lastMsg.createdAt,
                lastMsg.isMe,
                lastMsg.mediaType
              );
          } else {
            useChatStore
              .getState()
              .updateLastMessage(chatId, '', new Date().toISOString(), true);
          }

          return {
            messages: {
              ...state.messages,
              [chatId]: updatedMessages,
            },
          };
        });
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
          }
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
        });
      },
    }),
    {
      name: 'telegram-messages-storage',
      version: 2,
      storage: createJSONStorage(() => safeAsyncStorage),
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            messages: initialMessages,
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        messages: state.messages,
      }),
    }
  )
);
