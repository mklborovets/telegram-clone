import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useChatStore, sortChats, IChat } from '../../../entities/chat';
import { ChatList } from '../../../widgets/chat-list';
import { IconButton } from '../../../shared/ui/icon-button';
import { theme } from '../../../shared/config/theme';

export interface ArchivePageProps {
  onBack: () => void;
  onOpenChat: (chat: IChat) => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({
  onBack,
  onOpenChat,
}) => {
  const chats = useChatStore((state) => state.chats);

  const archivedChats = useMemo(() => {
    return sortChats(chats.filter((c) => c.isArchived));
  }, [chats]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton size={40} onPress={onBack}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </IconButton>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Archived Chats</Text>
            <Text style={styles.headerSubtitle}>
              {archivedChats.length} {archivedChats.length === 1 ? 'chat' : 'chats'}
            </Text>
          </View>
        </View>
      </View>

      <ChatList
        chats={archivedChats}
        onChatPress={onOpenChat}
        emptyText="No archived chats"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 18,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
