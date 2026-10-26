import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from 'react-native';
import { Menu, FolderPlus, Pencil } from 'lucide-react-native';
import {
  filterChatsByFolder,
  IChat,
} from '../../../entities/chat';
import { IUserProfile } from '../../../entities/user';
import { useChatStore } from '../../../entities/chat';
import { ChatList } from '../../../widgets/chat-list';
import { SwipeableTabs } from '../../../widgets/swipeable-tabs';
import { IconButton } from '../../../shared/ui/icon-button';
import { SearchBar } from '../../../shared/ui/search-bar';
import { theme } from '../../../shared/config/theme';
import { useChatListState } from '../model/useChatListState';
import { GlobalSearchResults } from './GlobalSearchResults';
import { NewFolderModal } from './NewFolderModal';

export interface ChatListPageProps {
  onOpenChat: (chat: IChat) => void;
  onOpenArchive?: () => void;
  onOpenDrawer?: () => void;
  onOpenFolderManager?: () => void;
  onOpenUserProfile?: (user: IUserProfile) => void;
}

export const ChatListPage: React.FC<ChatListPageProps> = ({
  onOpenChat,
  onOpenArchive,
  onOpenDrawer,
  onOpenFolderManager,
  onOpenUserProfile,
}) => {
  const {
    chats,
    folders,
    archivedChats,
    tabs,
    activeIndex,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    isSearching,
    globalUsers,
    matchingChats,
    handleDismissKeyboard,
    handleClearSearch,
    handleCancelSearch,
    handleTabChange,
    handleCreateFolder,
    filterBySearch,
  } = useChatListState();

  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);

  const handleOpenChat = useCallback((chat: IChat) => {
    handleDismissKeyboard();
    onOpenChat(chat);
  }, [handleDismissKeyboard, onOpenChat]);

  const handleOpenArchive = useCallback(() => {
    handleDismissKeyboard();
    if (onOpenArchive) {
      onOpenArchive();
    }
  }, [handleDismissKeyboard, onOpenArchive]);

  const handleSelectUser = useCallback(
    (user: IUserProfile) => {
      handleDismissKeyboard();
      if (onOpenUserProfile) {
        onOpenUserProfile(user);
      } else {
        const targetChat = useChatStore.getState().getOrCreateDirectChat(user);
        onOpenChat(targetChat);
      }
    },
    [handleDismissKeyboard, onOpenChat, onOpenUserProfile]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            size={40}
            onPress={() => {
              handleDismissKeyboard();
              if (onOpenDrawer) {
                onOpenDrawer();
              }
            }}
          >
            <Menu size={24} color={theme.colors.text} />
          </IconButton>
          <Text style={styles.headerTitle}>Telegram</Text>
        </View>

        <View style={styles.headerRight}>
          <IconButton
            size={40}
            onPress={() => {
              handleDismissKeyboard();
              if (onOpenFolderManager) {
                onOpenFolderManager();
              } else {
                setIsFolderModalVisible(true);
              }
            }}
          >
            <FolderPlus size={22} color={theme.colors.text} />
          </IconButton>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onClear={handleClearSearch}
          onCancel={handleCancelSearch}
          showCancelButton={isSearchFocused || searchQuery.length > 0}
          placeholder="Search chats or messages"
          onSubmitEditing={handleDismissKeyboard}
        />
      </View>

      {isSearching ? (
        <GlobalSearchResults
          searchQuery={searchQuery}
          globalUsers={globalUsers}
          matchingChats={matchingChats}
          onSelectUser={handleSelectUser}
          onOpenChat={handleOpenChat}
          onDismissKeyboard={handleDismissKeyboard}
        />
      ) : (
        <>
          <SwipeableTabs
            tabs={tabs}
            activeIndex={activeIndex}
            onTabChange={handleTabChange}
            renderTabContent={(tab) => {
              const folder = folders.find((f) => f.id === tab.id);
              const rawFolderChats = folder ? filterChatsByFolder(chats, folder) : [];
              const folderChats = filterBySearch(rawFolderChats);
              const isAllFolder = tab.id === 'all';
              const showArchive = isAllFolder && !searchQuery.trim();

              return (
                <ChatList
                  chats={folderChats}
                  archivedChats={showArchive ? archivedChats : []}
                  showArchiveCard={showArchive}
                  onOpenArchive={handleOpenArchive}
                  onChatPress={handleOpenChat}
                  onScrollBeginDrag={handleDismissKeyboard}
                  emptyText={
                    searchQuery.trim()
                      ? `No chats found for "${searchQuery.trim()}"`
                      : 'No chats found'
                  }
                />
              );
            }}
          />

          <Pressable
            style={styles.fab}
            onPress={() => searchInputRef.current?.focus()}
            hitSlop={8}
          >
            <Pencil size={24} color={theme.colors.white} />
          </Pressable>
        </>
      )}

      <NewFolderModal
        visible={isFolderModalVisible}
        onClose={() => setIsFolderModalVisible(false)}
        onCreate={(title) => {
          handleCreateFolder(title);
          setIsFolderModalVisible(false);
        }}
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 20,
    lineHeight: 26,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
