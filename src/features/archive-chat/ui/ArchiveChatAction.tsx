import React from 'react';
import { StyleSheet, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Archive, ArchiveRestore } from 'lucide-react-native';
import { IChat, useChatStore } from '../../../entities/chat';
import { theme } from '../../../shared/config/theme';

export interface ArchiveChatActionProps {
  chat: IChat;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ArchiveChatAction: React.FC<ArchiveChatActionProps> = ({
  chat,
  onClose,
  style,
}) => {
  const toggleArchive = useChatStore((state) => state.toggleArchive);

  const handlePress = () => {
    toggleArchive(chat.id);
    if (onClose) {
      onClose();
    }
  };

  const isArchived = chat.isArchived;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isArchived ? (
        <ArchiveRestore size={22} color={theme.colors.white} />
      ) : (
        <Archive size={22} color={theme.colors.white} />
      )}
      <Text style={styles.label}>{isArchived ? 'Unarchive' : 'Archive'}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    width: 72,
    backgroundColor: theme.colors.archive,
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
