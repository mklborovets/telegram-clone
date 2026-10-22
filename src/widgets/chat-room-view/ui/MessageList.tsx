import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { IMessage } from '../../../entities/message';
import { MessageBubble } from '../../../entities/message';
import { theme } from '../../../shared/config/theme';

export interface MessageListProps {
  messages: IMessage[];
  onMessageLongPress?: (message: IMessage) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onMessageLongPress,
  style,
  contentContainerStyle,
}) => {
  const invertedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

  const renderItem = ({ item }: { item: IMessage }) => {
    return (
      <MessageBubble
        message={item}
        onLongPress={onMessageLongPress}
      />
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyBadge}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      inverted={messages.length > 0}
      data={invertedMessages}
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
    backgroundColor: '#E4ECF2',
  },
  contentContainer: {
    paddingVertical: theme.spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    transform: [{ scaleY: 1 }],
  },
  emptyBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.subtitle,
    color: theme.colors.white,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
});
