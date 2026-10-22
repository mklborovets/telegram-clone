import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { LinearTransition, FadeOut } from 'react-native-reanimated';
import { IChat } from '../../../entities/chat';
import { ChatRow } from '../../../entities/chat';
import { SwipeableRow } from '../../../shared/ui/swipeable-row';
import { PinChatAction } from '../../../features/pin-chat';
import { ArchiveChatAction } from '../../../features/archive-chat';
import { DeleteChatAction } from '../../../features/delete-chat';
import { MarkReadChatAction } from '../../../features/mark-read-chat';
import { theme } from '../../../shared/config/theme';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList as new () => FlatList<IChat>);

export interface ChatListProps {
  chats: IChat[];
  onChatPress?: (chat: IChat) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  emptyText?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatPress,
  style,
  contentContainerStyle,
  emptyText = 'No chats found',
}) => {
  const renderItem = useCallback(
    ({ item }: { item: IChat }) => {
      return (
        <Animated.View
          layout={LinearTransition.springify().damping(32).stiffness(240).overshootClamping(1)}
          exiting={FadeOut.duration(200)}
          style={styles.itemWrapper}
        >
          <SwipeableRow
            rightActionsWidth={216}
            leftActionsWidth={76}
            renderLeftActions={(close) => (
              <View style={styles.actionsRow}>
                <MarkReadChatAction chat={item} onClose={close} />
              </View>
            )}
            renderRightActions={(close) => (
              <View style={styles.actionsRow}>
                <PinChatAction chat={item} onClose={close} />
                <ArchiveChatAction chat={item} onClose={close} />
                <DeleteChatAction chat={item} onClose={close} />
              </View>
            )}
          >
            <ChatRow chat={item} onPress={onChatPress} />
          </SwipeableRow>
        </Animated.View>
      );
    },
    [onChatPress]
  );

  const renderEmpty = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{emptyText}</Text>
        <Text style={styles.emptySubtitle}>
          Swipe on any chat to pin, archive or delete
        </Text>
      </View>
    );
  }, [emptyText]);

  return (
    <AnimatedFlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  itemWrapper: {
    backgroundColor: theme.colors.card,
  },
  actionsRow: {
    flexDirection: 'row',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 60,
  },
  emptyTitle: {
    ...theme.typography.title,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  emptySubtitle: {
    ...theme.typography.subtitle,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
