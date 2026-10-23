import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Pencil, Copy, Trash2 } from 'lucide-react-native';
import { useChatStore } from '../../../entities/chat';
import { useMessageStore, IMessage } from '../../../entities/message';
import { ChatHeader, MessageList } from '../../../widgets/chat-room-view';
import { SendMessageBar } from '../../../features/send-message';
import { CustomButton } from '../../../shared/ui/custom-button';
import { theme } from '../../../shared/config/theme';
import { copyToClipboard } from '../../../shared/lib/clipboard';

export interface ChatRoomPageProps {
  chatId: string;
  onBack: () => void;
  onOpenProfile?: () => void;
}

const EMPTY_MESSAGES: IMessage[] = [];

interface ChatRoomUIState {
  selectedMessage: IMessage | null;
  editingMessage: IMessage | null;
  toastMessage: string | null;
}

export const ChatRoomPage: React.FC<ChatRoomPageProps> = ({
  chatId,
  onBack,
  onOpenProfile,
}) => {
  const chat = useChatStore((state) =>
    state.chats.find((c) => c.id === chatId)
  );
  const messages = useMessageStore(
    (state) => state.messages[chatId] || EMPTY_MESSAGES
  );
  const deleteMessage = useMessageStore((state) => state.deleteMessage);

  const [uiState, setUiState] = useState<ChatRoomUIState>({
    selectedMessage: null,
    editingMessage: null,
    toastMessage: null,
  });

  const { selectedMessage, editingMessage, toastMessage } = uiState;

  const keyboard = useAnimatedKeyboard({ isStatusBarTranslucentAndroid: true });

  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (chatId) {
      useChatStore.getState().markAsRead(chatId);
      useMessageStore.getState().markAsRead(chatId);
    }
  }, [chatId, messages.length]);

  if (!chat) {
    return null;
  }

  const setSelectedMessage = (msg: IMessage | null) => {
    setUiState((prev) => ({ ...prev, selectedMessage: msg }));
  };

  const setEditingMessage = (msg: IMessage | null) => {
    setUiState((prev) => ({ ...prev, editingMessage: msg }));
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setUiState((prev) => ({ ...prev, toastMessage: message }));
    toastTimerRef.current = setTimeout(() => {
      setUiState((prev) => ({ ...prev, toastMessage: null }));
    }, 2000);
  };

  const handleMessageLongPress = (msg: IMessage) => {
    setSelectedMessage(msg);
  };

  const handleStartEdit = () => {
    if (selectedMessage) {
      const msgToEdit = selectedMessage;
      setUiState((prev) => ({
        ...prev,
        selectedMessage: null,
        editingMessage: msgToEdit,
      }));
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      deleteMessage(chatId, selectedMessage.id);
      setSelectedMessage(null);
    }
  };

  const handleCopy = () => {
    if (selectedMessage) {
      const textToCopy = selectedMessage.text || selectedMessage.fileName || '';
      if (textToCopy) {
        copyToClipboard(textToCopy);
        showToast('Text copied to clipboard');
      }
      setSelectedMessage(null);
    }
  };

  return (
    <View style={styles.container}>
      <ChatHeader chat={chat} onBack={onBack} onHeaderPress={onOpenProfile} />
      <Animated.View style={[styles.chatContent, keyboardAnimatedStyle]}>
        <MessageList
          messages={messages}
          onMessageLongPress={handleMessageLongPress}
        />
        <SendMessageBar
          chatId={chatId}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </Animated.View>

      <Modal
        visible={Boolean(selectedMessage)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedMessage(null)}
          />
          <View style={styles.modalCard}>
            {selectedMessage?.text ? (
              <Text style={styles.modalMessagePreview} numberOfLines={2}>
                "{selectedMessage.text}"
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              {selectedMessage?.isMe ? (
                <Pressable
                  style={styles.modalActionItem}
                  onPress={handleStartEdit}
                >
                  <Pencil size={20} color={theme.colors.primary} />
                  <Text style={styles.modalActionText}>Edit</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={styles.modalActionItem}
                onPress={handleCopy}
              >
                <Copy size={20} color={theme.colors.text} />
                <Text style={styles.modalActionText}>Copy Text</Text>
              </Pressable>

              <Pressable
                style={[styles.modalActionItem, styles.modalActionItemDestructive]}
                onPress={handleDelete}
              >
                <Trash2 size={20} color={theme.colors.danger} />
                <Text
                  style={[
                    styles.modalActionText,
                    styles.modalActionTextDestructive,
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
            </View>

            <CustomButton
              title="Cancel"
              variant="secondary"
              onPress={() => setSelectedMessage(null)}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {toastMessage ? (
        <View style={styles.toastContainer} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4ECF2',
  },
  chatContent: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.88)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalMessagePreview: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalActions: {
    width: '100%',
    marginBottom: 12,
  },
  modalActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
  },
  modalActionItemDestructive: {
    marginTop: 2,
  },
  modalActionText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 14,
    color: theme.colors.text,
  },
  modalActionTextDestructive: {
    color: theme.colors.danger,
  },
  cancelButton: {
    width: '100%',
    height: 44,
  },
});
