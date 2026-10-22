import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { CheckCheck, Mail } from 'lucide-react-native';
import { IChat, useChatStore } from '../../../entities/chat';
import { useMessageStore } from '../../../entities/message';
import { theme } from '../../../shared/config/theme';

export interface MarkReadChatActionProps {
  chat: IChat;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const MarkReadChatAction: React.FC<MarkReadChatActionProps> = ({
  chat,
  onClose,
  style,
}) => {
  const toggleChatRead = useChatStore((state) => state.toggleRead);
  const toggleMessageRead = useMessageStore((state) => state.toggleRead);

  const isUnread = chat.unreadCount > 0;

  const handlePress = () => {
    toggleChatRead(chat.id);
    toggleMessageRead(chat.id);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isUnread ? (
        <CheckCheck size={22} color={theme.colors.white} />
      ) : (
        <Mail size={22} color={theme.colors.white} />
      )}
      <Text style={styles.label}>{isUnread ? 'Read' : 'Unread'}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    width: 76,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: theme.colors.white,
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
