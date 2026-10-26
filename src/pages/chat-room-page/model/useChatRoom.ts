import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore, IChat } from '../../../entities/chat';
import { useMessageStore, IMessage } from '../../../entities/message';
import { copyToClipboard } from '../../../shared/lib/clipboard';

const EMPTY_MESSAGES: IMessage[] = [];

export interface UseChatRoomReturn {
  chat: IChat | undefined;
  messages: IMessage[];
  selectedMessage: IMessage | null;
  editingMessage: IMessage | null;
  toastMessage: string | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  setEditingMessage: (msg: IMessage | null) => void;
  handleMessageLongPress: (msg: IMessage) => void;
  handleStartEdit: () => void;
  handleDelete: () => void;
  handleCopy: () => void;
}

export function useChatRoom(chatId: string): UseChatRoomReturn {
  const chat = useChatStore((state) =>
    state.chats.find((c) => c.id === chatId)
  );

  const messages = useMessageStore(
    (state) => state.messages[chatId] || EMPTY_MESSAGES
  );
  const deleteMessage = useMessageStore((state) => state.deleteMessage);

  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (chatId) {
      useMessageStore.getState().fetchRemoteMessages(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      useChatStore.getState().markAsRead(chatId);
      useMessageStore.getState().markAsRead(chatId);
    }
  }, [chatId, messages.length]);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  const handleMessageLongPress = useCallback((msg: IMessage) => {
    setSelectedMessage(msg);
  }, []);

  const handleStartEdit = useCallback(() => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setSelectedMessage(null);
    }
  }, [selectedMessage]);

  const handleDelete = useCallback(() => {
    if (selectedMessage) {
      deleteMessage(chatId, selectedMessage.id);
      setSelectedMessage(null);
    }
  }, [chatId, deleteMessage, selectedMessage]);

  const handleCopy = useCallback(() => {
    if (selectedMessage) {
      const textToCopy = selectedMessage.text || selectedMessage.fileName || '';
      if (textToCopy) {
        copyToClipboard(textToCopy);
        showToast('Text copied to clipboard');
      }
      setSelectedMessage(null);
    }
  }, [selectedMessage, showToast]);

  return {
    chat,
    messages,
    selectedMessage,
    editingMessage,
    toastMessage,
    setSelectedMessage,
    setEditingMessage,
    handleMessageLongPress,
    handleStartEdit,
    handleDelete,
    handleCopy,
  };
}
