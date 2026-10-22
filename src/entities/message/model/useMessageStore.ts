import { create } from 'zustand';
import { IMessage } from './types';
import { initialMessages } from './mockData';
import { useChatStore } from '../../chat';

interface MessageState {
  messages: Record<string, IMessage[]>;
  addMessage: (chatId: string, text: string, isMe?: boolean) => IMessage;
  getMessagesByChatId: (chatId: string) => IMessage[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
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
}));
