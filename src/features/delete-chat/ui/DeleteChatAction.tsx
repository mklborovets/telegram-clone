import React from 'react';
import { StyleSheet, Text, Pressable, Alert, StyleProp, ViewStyle } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { IChat, useChatStore } from '../../../entities/chat';
import { theme } from '../../../shared/config/theme';

export interface DeleteChatActionProps {
  chat: IChat;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const DeleteChatAction: React.FC<DeleteChatActionProps> = ({
  chat,
  onClose,
  style,
}) => {
  const deleteChat = useChatStore((state) => state.deleteChat);

  const handlePress = () => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete the chat with "${chat.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            if (onClose) {
              onClose();
            }
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteChat(chat.id);
            if (onClose) {
              onClose();
            }
          },
        },
      ]
    );
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
      <Trash2 size={22} color={theme.colors.white} />
      <Text style={styles.label}>Delete</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    width: 72,
    backgroundColor: theme.colors.danger,
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
