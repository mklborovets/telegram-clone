import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../../../shared/lib/storage';
import { socketClient } from '../../../shared/lib/socket/socketClient';
import { useUserStore } from '../../user';
import { IMessage } from './types';
import { initialMessages } from './mockData';
import { useChatStore, IChat } from '../../chat';

export const createDefaultMessagesForUser = (userName = 'User'): Record<string, IMessage[]> => ({
  'chat-saved': [
    {
      id: `msg-saved-${Date.now()}`,
      chatId: 'chat-saved',
      text: 'Forward messages here to save them. Send media or documents to store them in the cloud.',
      createdAt: new Date().toISOString(),
      isMe: true,
      senderId: 'me',
      isRead: true,
    },
  ],
  'chat-telegram-service': [
    {
      id: `msg-service-${Date.now()}`,
      chatId: 'chat-telegram-service',
      text: `Welcome to Telegram, ${userName}! Send messages, create groups, and enjoy cloud sync.`,
      createdAt: new Date().toISOString(),
      isMe: false,
      senderId: 'service',
      isRead: false,
    },
  ],
});

interface MessageState {
  currentUserId: string;
  messages: Record<string, IMessage[]>;
  userMessagesMap: Record<string, Record<string, IMessage[]>>;
  setUserSession: (userId: string, userName?: string) => void;
  clearUserSession: () => void;
  addMessage: (
    chatId: string,
    text: string,
    isMe?: boolean,
    mediaType?: 'photo' | 'file',
    mediaUri?: string,
    fileName?: string,
    fileSize?: string
  ) => IMessage;
  receiveMessage: (message: IMessage) => void;
  receiveIncomingMessage: (payload: {
    id: string;
    chatId: string;
    text: string;
    createdAt: string;
    mediaType?: 'photo' | 'file';
    mediaUri?: string;
    fileName?: string;
    fileSize?: string;
    senderId: string;
    senderName?: string;
    senderAvatar?: string;
  }) => void;
  editMessage: (chatId: string, messageId: string, newText: string) => void;
  applyRemoteEdit: (chatId: string, messageId: string, newText: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  applyRemoteDelete: (chatId: string, messageId: string) => void;
  getMessagesByChatId: (chatId: string) => IMessage[];
  markAsRead: (chatId: string) => void;
  toggleRead: (chatId: string) => void;
}

const syncUserMessages = (
  state: MessageState,
  messages: Record<string, IMessage[]>
) => {
  const currentUserId = state.currentUserId;
  if (!currentUserId) {
    return { messages };
  }
  return {
    messages,
    userMessagesMap: {
      ...state.userMessagesMap,
      [currentUserId]: messages,
    },
  };
};

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      currentUserId: '',
      messages: {},
      userMessagesMap: {
        'user-demo-alex': initialMessages,
      },

      setUserSession: (userId: string, userName?: string) => {
        set((state) => {
          if (!userId) {
            if (!state.currentUserId && Object.keys(state.messages).length === 0) {
              return state;
            }
            return {
              currentUserId: '',
              messages: {},
            };
          }

          if (state.currentUserId === userId && Object.keys(state.messages).length > 0) {
            return state;
          }

          const existingMessages = state.userMessagesMap?.[userId];
          let messagesForUser: Record<string, IMessage[]>;

          if (existingMessages !== undefined) {
            messagesForUser = existingMessages;
          } else if (userId === 'user-demo-alex') {
            messagesForUser = initialMessages;
          } else {
            messagesForUser = createDefaultMessagesForUser(userName);
          }

          return {
            currentUserId: userId,
            messages: messagesForUser,
            userMessagesMap: {
              ...state.userMessagesMap,
              [userId]: messagesForUser,
            },
          };
        });
      },

      clearUserSession: () => {
        set({
          currentUserId: '',
          messages: {},
        });
      },

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
        const currentProfile = useUserStore.getState().profile;
        const currentUserId = currentProfile.id || get().currentUserId || 'user-me';
        const senderId = isMe ? currentUserId : 'remote-user';
        const newMessage: IMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          chatId,
          text: text.trim(),
          createdAt: timestamp,
          isMe,
          senderId,
          isRead: isMe,
          mediaType,
          mediaUri,
          fileName,
          fileSize,
        };

        set((state) => {
          const chatMessages = state.messages[chatId] || [];
          const nextMessages = {
            ...state.messages,
            [chatId]: [...chatMessages, newMessage],
          };
          return syncUserMessages(state, nextMessages);
        });

        useChatStore
          .getState()
          .updateLastMessage(chatId, newMessage.text, timestamp, isMe, mediaType);

        const currentChat = useChatStore.getState().chats.find((c) => c.id === chatId);
        const allAccounts = useUserStore.getState().accounts;
        const recipient = allAccounts.find(
          (acc) =>
            acc.id !== currentUserId &&
            (chatId.includes(acc.id) ||
              (currentChat && currentChat.isPersonal && acc.name.toLowerCase() === currentChat.title.toLowerCase()))
        );
        const recipientId = recipient ? recipient.id : undefined;

        if (recipientId) {
          const recipientChats = useChatStore.getState().userChatsMap[recipientId] || [];
          const existingRecipientChat = recipientChats.find(
            (c) =>
              c.id === `direct-${currentUserId}` ||
              c.id.includes(currentUserId) ||
              c.title.toLowerCase() === currentProfile.name.toLowerCase()
          );
          const recipientChatId = existingRecipientChat
            ? existingRecipientChat.id
            : `direct-${currentUserId}`;

          const updatedRecipientChat: IChat = existingRecipientChat
            ? {
                ...existingRecipientChat,
                lastMessage: newMessage.text || (mediaType ? 'Media message' : ''),
                lastMessageTime: timestamp,
                unreadCount: (existingRecipientChat.unreadCount || 0) + 1,
                lastMessageSenderMe: false,
                lastMessageRead: false,
                lastMessageMediaType: mediaType,
              }
            : {
                id: recipientChatId,
                title: currentProfile.name || 'Telegram User',
                avatarUrl: currentProfile.avatarUrl || '',
                lastMessage: newMessage.text || (mediaType ? 'Media message' : ''),
                lastMessageTime: timestamp,
                unreadCount: 1,
                isPinned: false,
                isArchived: false,
                isPersonal: true,
                isOnline: true,
                lastMessageSenderMe: false,
                lastMessageRead: false,
                lastMessageMediaType: mediaType,
                folderIds: ['personal'],
              };

          useChatStore.setState((s) => {
            const userChats = s.userChatsMap[recipientId] || [];
            const filtered = userChats.filter((c) => c.id !== recipientChatId);
            return {
              userChatsMap: {
                ...s.userChatsMap,
                [recipientId]: [updatedRecipientChat, ...filtered],
              },
            };
          });

          const incomingMsgForRecipient: IMessage = {
            ...newMessage,
            chatId: recipientChatId,
            isMe: false,
            senderId: currentUserId,
            isRead: false,
          };

          set((s) => {
            const allRecipientMessages = s.userMessagesMap[recipientId] || {};
            const chatMsgs = allRecipientMessages[recipientChatId] || [];
            return {
              userMessagesMap: {
                ...s.userMessagesMap,
                [recipientId]: {
                  ...allRecipientMessages,
                  [recipientChatId]: [...chatMsgs, incomingMsgForRecipient],
                },
              },
            };
          });
        }

        if (isMe) {
          socketClient.send('send_message', {
            message: newMessage,
            senderId: currentUserId,
            senderName: currentProfile.name,
            senderAvatar: currentProfile.avatarUrl,
            recipientId,
          });
        }

        return newMessage;
      },

      receiveIncomingMessage: (payload) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId || payload.senderId === currentUserId) {
          return;
        }

        const chatStore = useChatStore.getState();
        let targetChat = chatStore.chats.find(
          (c) =>
            c.id === payload.chatId ||
            c.id === `direct-${payload.senderId}` ||
            c.id.includes(payload.senderId) ||
            (payload.senderName && c.isPersonal && c.title.toLowerCase() === payload.senderName.toLowerCase())
        );

        const targetChatId = targetChat ? targetChat.id : `direct-${payload.senderId}`;

        if (!targetChat) {
          const newChat: IChat = {
            id: targetChatId,
            title: payload.senderName || 'Telegram User',
            avatarUrl: payload.senderAvatar || '',
            lastMessage: payload.text || (payload.mediaType ? 'Media message' : ''),
            lastMessageTime: payload.createdAt,
            unreadCount: 1,
            isPinned: false,
            isArchived: false,
            isPersonal: true,
            isOnline: true,
            lastMessageSenderMe: false,
            lastMessageRead: false,
            lastMessageMediaType: payload.mediaType,
            folderIds: ['personal'],
          };
          useChatStore.setState((s) => {
            const nextChats = [newChat, ...s.chats.filter((c) => c.id !== targetChatId)];
            const userChats = s.userChatsMap[currentUserId] || [];
            return {
              chats: nextChats,
              userChatsMap: {
                ...s.userChatsMap,
                [currentUserId]: [newChat, ...userChats.filter((c) => c.id !== targetChatId)],
              },
            };
          });
        } else {
          chatStore.updateLastMessage(
            targetChat.id,
            payload.text,
            payload.createdAt,
            false,
            payload.mediaType
          );
        }

        const incomingMsg: IMessage = {
          id: payload.id,
          chatId: targetChatId,
          text: payload.text,
          createdAt: payload.createdAt,
          isMe: false,
          senderId: payload.senderId,
          isRead: false,
          mediaType: payload.mediaType,
          mediaUri: payload.mediaUri,
          fileName: payload.fileName,
          fileSize: payload.fileSize,
        };

        set((state) => {
          const chatMessages = state.messages[targetChatId] || [];
          if (chatMessages.some((m) => m.id === incomingMsg.id)) {
            return state;
          }
          const nextMessages = {
            ...state.messages,
            [targetChatId]: [...chatMessages, incomingMsg],
          };
          return syncUserMessages(state, nextMessages);
        });
      },

      receiveMessage: (message: IMessage) => {
        set((state) => {
          const chatMessages = state.messages[message.chatId] || [];
          if (chatMessages.some((m) => m.id === message.id)) {
            return state;
          }
          const nextMessages = {
            ...state.messages,
            [message.chatId]: [...chatMessages, message],
          };
          return syncUserMessages(state, nextMessages);
        });

        useChatStore
          .getState()
          .updateLastMessage(
            message.chatId,
            message.text,
            message.createdAt,
            message.isMe,
            message.mediaType
          );
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

          const nextMessages = {
            ...state.messages,
            [chatId]: updatedMessages,
          };
          return syncUserMessages(state, nextMessages);
        });

        socketClient.send('edit_message', {
          chatId,
          messageId,
          newText: trimmed,
          editedAt: new Date().toISOString(),
        });
      },

      applyRemoteEdit: (chatId: string, messageId: string, newText: string) => {
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

          const nextMessages = {
            ...state.messages,
            [chatId]: updatedMessages,
          };
          return syncUserMessages(state, nextMessages);
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

          const nextMessages = {
            ...state.messages,
            [chatId]: updatedMessages,
          };
          return syncUserMessages(state, nextMessages);
        });

        socketClient.send('delete_message', {
          chatId,
          messageId,
        });
      },

      applyRemoteDelete: (chatId: string, messageId: string) => {
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

          const nextMessages = {
            ...state.messages,
            [chatId]: updatedMessages,
          };
          return syncUserMessages(state, nextMessages);
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
          const nextMessages = {
            ...state.messages,
            [chatId]: chatMessages.map((msg) =>
              msg.isRead ? msg : { ...msg, isRead: true }
            ),
          };
          return syncUserMessages(state, nextMessages);
        });

        socketClient.send('read_messages', {
          chatId,
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
            const nextMessages = {
              ...state.messages,
              [chatId]: chatMessages.map((msg) =>
                msg.isRead ? msg : { ...msg, isRead: true }
              ),
            };
            return syncUserMessages(state, nextMessages);
          }
          const lastIndex = chatMessages.length - 1;
          const nextMessages = {
            ...state.messages,
            [chatId]: chatMessages.map((msg, index) =>
              index === lastIndex && !msg.isMe
                ? { ...msg, isRead: false }
                : msg
            ),
          };
          return syncUserMessages(state, nextMessages);
        });
      },
    }),
    {
      name: 'telegram-messages-storage',
      version: 3,
      storage: createJSONStorage(() => safeAsyncStorage),
      migrate: (persistedState: any, _version: number) => {
        const userMessagesMap = persistedState?.userMessagesMap || {
          'user-demo-alex': initialMessages,
        };
        const currentUserId = persistedState?.currentUserId || '';

        let messages = persistedState?.messages || {};
        if (!currentUserId || currentUserId !== 'user-demo-alex') {
          if (currentUserId && userMessagesMap[currentUserId]) {
            messages = userMessagesMap[currentUserId];
          } else if (currentUserId) {
            messages = createDefaultMessagesForUser('User');
          } else {
            messages = {};
          }
        }

        return {
          ...persistedState,
          currentUserId,
          messages,
          userMessagesMap,
        };
      },
      partialize: (state) => ({
        messages: state.messages,
        currentUserId: state.currentUserId,
        userMessagesMap: state.userMessagesMap,
      }),
    }
  )
);

useUserStore.subscribe((userState) => {
  const currentMsgUserId = useMessageStore.getState().currentUserId;
  if (userState.isAuthenticated && userState.profile.id) {
    if (currentMsgUserId !== userState.profile.id) {
      useMessageStore
        .getState()
        .setUserSession(userState.profile.id, userState.profile.name);
    }
  } else if (!userState.isAuthenticated && currentMsgUserId) {
    useMessageStore.getState().clearUserSession();
  }
});
