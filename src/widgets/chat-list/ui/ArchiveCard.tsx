import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { LinearTransition, FadeOut } from 'react-native-reanimated';
import { Archive } from 'lucide-react-native';
import { IChat } from '../../../entities/chat';
import { ActionModal } from '../../../shared/ui/action-modal';
import { theme } from '../../../shared/config/theme';
import { formatChatTimestamp } from '../../../shared/lib/formatTime';

export interface ArchiveCardProps {
  archivedChats: IChat[];
  onPress: () => void;
  onHide?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({
  archivedChats,
  onPress,
  onHide,
  style,
}) => {
  const [isHideModalVisible, setIsHideModalVisible] = useState(false);

  if (archivedChats.length === 0) {
    return null;
  }

  const latestChat = archivedChats[0];
  const totalUnread = archivedChats.reduce(
    (sum, chat) => sum + (chat.unreadCount || 0),
    0
  );

  const handleLongPress = () => {
    setIsHideModalVisible(true);
  };

  const handleConfirmHide = () => {
    setIsHideModalVisible(false);
    if (onHide) {
      onHide();
    }
  };

  return (
    <>
      <Animated.View
        layout={LinearTransition.springify().damping(30).stiffness(240).overshootClamping(1)}
        exiting={FadeOut.duration(200)}
      >
        <Pressable
          onPress={onPress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          style={({ pressed }) => [
            styles.container,
            pressed && styles.pressed,
            style,
          ]}
        >
          <View style={styles.content}>
            <View style={styles.archiveAvatar}>
              <Archive size={24} color={theme.colors.white} />
            </View>

            <View style={styles.textContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>
                  Archived Chats
                </Text>

                {latestChat ? (
                  <Text
                    style={[
                      styles.time,
                      totalUnread > 0 && styles.timeActive,
                    ]}
                  >
                    {formatChatTimestamp(latestChat.lastMessageTime)}
                  </Text>
                ) : null}
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {latestChat
                    ? `${latestChat.title}: ${latestChat.lastMessage}`
                    : `${archivedChats.length} chats`}
                </Text>

                {totalUnread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCountText}>
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.divider} />
        </Pressable>
      </Animated.View>

      <ActionModal
        visible={isHideModalVisible}
        onClose={() => setIsHideModalVisible(false)}
        title="Hide Archive"
        message="Hide Archived Chats from your main chat list? You can pull down on the list at any time to restore it."
        icon={<Archive size={28} color={theme.colors.danger} />}
        iconBackgroundColor="rgba(255, 59, 48, 0.12)"
        confirmText="Hide"
        confirmVariant="danger"
        cancelText="Cancel"
        onConfirm={handleConfirmHide}
      />
    </>
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
  archiveAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7E8B99',
    alignItems: 'center',
    justifyContent: 'center',
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
  subtitle: {
    ...theme.typography.subtitle,
    flex: 1,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  unreadBadge: {
    backgroundColor: '#8E8E93',
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
