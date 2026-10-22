import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Pin, CheckCheck, Check } from 'lucide-react-native';
import { IChat } from '../model/types';
import { Avatar } from '../../../shared/ui/avatar';
import { theme } from '../../../shared/config/theme';
import { formatChatTimestamp } from '../../../shared/lib/formatTime';

export interface ChatRowProps {
  chat: IChat;
  onPress?: (chat: IChat) => void;
  style?: StyleProp<ViewStyle>;
}

export const ChatRow: React.FC<ChatRowProps> = ({ chat, onPress, style }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(chat);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        <Avatar
          name={chat.title}
          avatarUrl={chat.avatarUrl}
          isOnline={chat.isOnline}
          size={52}
        />

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {chat.title}
            </Text>

            <View style={styles.metaContainer}>
              {chat.lastMessageSenderMe ? (
                chat.lastMessageRead ? (
                  <CheckCheck
                    size={16}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                ) : (
                  <Check
                    size={16}
                    color={theme.colors.textMuted}
                    style={styles.checkIcon}
                  />
                )
              ) : null}

              <Text
                style={[
                  styles.time,
                  chat.unreadCount > 0 && styles.timeActive,
                ]}
              >
                {formatChatTimestamp(chat.lastMessageTime)}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage}
            </Text>

            <View style={styles.badgeContainer}>
              {chat.isPinned ? (
                <Pin
                  size={15}
                  color={theme.colors.textMuted}
                  style={styles.pinIcon}
                />
              ) : null}

              {chat.unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCountText}>
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...theme.typography.title,
    flex: 1,
    marginRight: theme.spacing.sm,
    color: theme.colors.text,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 2,
  },
  time: {
    ...theme.typography.time,
    color: theme.colors.textSecondary,
  },
  timeActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    ...theme.typography.subtitle,
    flex: 1,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginRight: 4,
    transform: [{ rotate: '45deg' }],
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 11,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginLeft: 52 + theme.spacing.lg + theme.spacing.md,
  },
});
