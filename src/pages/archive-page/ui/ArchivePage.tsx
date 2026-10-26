import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useChatStore, sortChats, IChat } from '../../../entities/chat';
import { ChatList } from '../../../widgets/chat-list';
import { ScreenHeader } from '../../../shared/ui/screen-header';
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
      <ScreenHeader
        title="Archived Chats"
        subtitle={`${archivedChats.length} ${archivedChats.length === 1 ? 'chat' : 'chats'}`}
        onBack={onBack}
      />

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
});
