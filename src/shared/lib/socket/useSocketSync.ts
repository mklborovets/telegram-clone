import { useEffect, useState } from 'react';
import { socketClient } from './socketClient';
import { useUserStore } from '../../../entities/user';
import { useMessageStore } from '../../../entities/message';

export const useSocketSync = () => {
  const profile = useUserStore((state) => state.profile);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const [isConnected, setIsConnected] = useState(socketClient.isConnected());

  useEffect(() => {
    if (!isAuthenticated) {
      socketClient.disconnect();
      return;
    }

    socketClient.connect();

    const handleConnected = () => {
      setIsConnected(true);
      socketClient.send('auth', { user: profile });
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (data: any) => {
      if (data && data.message) {
        const currentUserId = useUserStore.getState().profile.id;
        if (data.recipientId && data.recipientId !== currentUserId) {
          return;
        }
        const isFromMe = data.senderId === currentUserId || data.message.senderId === currentUserId;
        if (isFromMe) {
          return;
        }
        useMessageStore.getState().receiveIncomingMessage({
          ...data.message,
          senderId: data.senderId || data.message.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
        });
      }
    };

    const handleSyncMessages = (data: any) => {
      if (data && Array.isArray(data.messages)) {
        const currentUserId = useUserStore.getState().profile.id;
        for (const item of data.messages) {
          if (item && item.message) {
            const isFromMe = item.senderId === currentUserId || item.message.senderId === currentUserId;
            if (!isFromMe) {
              useMessageStore.getState().receiveIncomingMessage({
                ...item.message,
                senderId: item.senderId || item.message.senderId,
                senderName: item.senderName,
                senderAvatar: item.senderAvatar,
              });
            }
          }
        }
      }
    };

    const handleMessageEdited = (data: any) => {
      if (data && data.chatId && data.messageId && data.newText) {
        useMessageStore.getState().applyRemoteEdit(data.chatId, data.messageId, data.newText);
      }
    };

    const handleMessageDeleted = (data: any) => {
      if (data && data.chatId && data.messageId) {
        useMessageStore.getState().applyRemoteDelete(data.chatId, data.messageId);
      }
    };

    socketClient.on('connected', handleConnected);
    socketClient.on('disconnected', handleDisconnected);
    socketClient.on('new_message', handleNewMessage);
    socketClient.on('sync_messages', handleSyncMessages);
    socketClient.on('message_edited', handleMessageEdited);
    socketClient.on('message_deleted', handleMessageDeleted);

    if (socketClient.isConnected()) {
      handleConnected();
    }

    return () => {
      socketClient.off('connected', handleConnected);
      socketClient.off('disconnected', handleDisconnected);
      socketClient.off('new_message', handleNewMessage);
      socketClient.off('sync_messages', handleSyncMessages);
      socketClient.off('message_edited', handleMessageEdited);
      socketClient.off('message_deleted', handleMessageDeleted);
    };
  }, [isAuthenticated, profile]);

  return { isConnected };
};
