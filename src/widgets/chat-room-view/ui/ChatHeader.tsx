import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { IChat } from '../../../entities/chat';
import { Avatar } from '../../../shared/ui/avatar';
import { IconButton } from '../../../shared/ui/icon-button';
import { theme } from '../../../shared/config/theme';

export interface ChatHeaderProps {
  chat: IChat;
  onBack: () => void;
  onHeaderPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBack,
  onHeaderPress,
  style,
}) => {
  const isOnline = chat.isOnline;

  return (
    <View style={[styles.container, style]}>
      <IconButton onPress={onBack} size={40} style={styles.backButton}>
        <ArrowLeft size={24} color={theme.colors.primary} />
      </IconButton>

      <Pressable
        onPress={onHeaderPress}
        style={({ pressed }) => [
          styles.profileContainer,
          pressed && styles.pressed,
        ]}
      >
        <Avatar
          name={chat.title}
          avatarUrl={chat.avatarUrl}
          isOnline={chat.isOnline}
          size={40}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {chat.title}
          </Text>
          <Text
            style={[
              styles.status,
              isOnline ? styles.statusOnline : styles.statusOffline,
            ]}
          >
            {isOnline ? 'online' : 'last seen recently'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    paddingHorizontal: theme.spacing.xs,
  },
  backButton: {
    marginRight: 4,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: theme.borderRadius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  textContainer: {
    flex: 1,
    marginLeft: theme.spacing.sm + 2,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.title,
    fontSize: 16,
    lineHeight: 20,
    color: theme.colors.text,
  },
  status: {
    ...theme.typography.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  statusOnline: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  statusOffline: {
    color: theme.colors.textMuted,
  },
});
