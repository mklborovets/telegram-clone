import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Pin, PinOff } from 'lucide-react-native';
import { IChat, useChatStore } from '../../../entities/chat';
import { theme } from '../../../shared/config/theme';

export interface PinChatActionProps {
  chat: IChat;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PinChatAction: React.FC<PinChatActionProps> = ({
  chat,
  onClose,
  style,
}) => {
  const togglePin = useChatStore((state) => state.togglePin);

  const handlePress = () => {
    togglePin(chat.id);
    if (onClose) {
      onClose();
    }
  };

  const isPinned = chat.isPinned;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isPinned ? (
        <PinOff size={22} color={theme.colors.white} />
      ) : (
        <Pin size={22} color={theme.colors.white} />
      )}
      <Text style={styles.label}>{isPinned ? 'Unpin' : 'Pin'}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    width: 72,
    backgroundColor: theme.colors.pin,
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
