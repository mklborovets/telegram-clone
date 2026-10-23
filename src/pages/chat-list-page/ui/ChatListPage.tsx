import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  type TextInputInstance,
  Pressable,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Menu, Search, FolderPlus, Pencil, X } from 'lucide-react-native';
import {
  useChatStore,
  filterChatsByFolder,
  sortChats,
  IChat,
  ChatRow,
} from '../../../entities/chat';
import { useUserStore, IUserProfile } from '../../../entities/user';
import { Avatar } from '../../../shared/ui/avatar';
import { ChatList } from '../../../widgets/chat-list';
import { SwipeableTabs } from '../../../widgets/swipeable-tabs';
import { IconButton } from '../../../shared/ui/icon-button';
import { CustomButton } from '../../../shared/ui/custom-button';
import { theme } from '../../../shared/config/theme';

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
  const chats = useChatStore((state) => state.chats);
  const folders = useChatStore((state) => state.folders);
  const activeFolderId = useChatStore((state) => state.activeFolderId);
  const setActiveFolderId = useChatStore((state) => state.setActiveFolderId);
  const createFolder = useChatStore((state) => state.createFolder);
  const accounts = useUserStore((state) => state.accounts);
  const currentProfile = useUserStore((state) => state.profile);

  const searchInputRef = useRef<TextInputInstance>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const archivedChats = useMemo(() => {
    return sortChats(chats.filter((c) => c.isArchived));
  }, [chats]);

  const tabs = useMemo(() => {
    return folders.map((folder) => {
      const folderChats = filterChatsByFolder(chats, folder);
      const unreadTotal = folderChats.reduce(
        (sum, chat) => sum + (chat.unreadCount || 0),
        0
      );
      return {
        id: folder.id,
        title: folder.title,
        badge: unreadTotal,
      };
    });
  }, [folders, chats]);

  const activeIndex = useMemo(() => {
    const idx = folders.findIndex((f) => f.id === activeFolderId);
    return idx >= 0 ? idx : 0;
  }, [folders, activeFolderId]);

  const handleDismissKeyboard = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const handleCancelSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    handleDismissKeyboard();
  }, [handleDismissKeyboard]);

  const handleTabChange = useCallback((index: number) => {
    handleDismissKeyboard();
    if (folders[index]) {
      setActiveFolderId(folders[index].id);
    }
  }, [folders, handleDismissKeyboard, setActiveFolderId]);

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

  const handleCreateFolder = () => {
    const trimmed = newFolderTitle.trim();
    if (!trimmed) return;
    const newId = createFolder(trimmed);
    setActiveFolderId(newId);
    setNewFolderTitle('');
    setIsFolderModalVisible(false);
  };

  const isSearching = searchQuery.trim().length > 0;

  const globalUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const cleanQ = q.replace(/^@/, '');
    if (!cleanQ) {
      return accounts.filter((acc) => acc.id !== currentProfile.id);
    }
    return accounts.filter((acc) => {
      if (acc.id === currentProfile.id) return false;
      const cleanUsername = acc.username.replace(/^@/, '').toLowerCase();
      const matchUsername = cleanUsername.includes(cleanQ);
      const matchName = acc.name.toLowerCase().includes(cleanQ);
      return matchUsername || matchName;
    });
  }, [searchQuery, accounts, currentProfile.id]);

  const matchingChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const cleanQ = q.replace(/^@/, '');
    return chats.filter((c) => {
      if (c.isArchived) return false;
      return (
        c.title.toLowerCase().includes(cleanQ) ||
        c.lastMessage.toLowerCase().includes(cleanQ)
      );
    });
  }, [searchQuery, chats]);

  const handleSelectUser = useCallback(
    (user: IUserProfile) => {
      handleDismissKeyboard();
      if (onOpenUserProfile) {
        onOpenUserProfile(user);
      }
    },
    [handleDismissKeyboard, onOpenUserProfile]
  );

  const filterBySearch = useCallback((chatList: IChat[]) => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return chatList;
    return chatList.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

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
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search chats or messages"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={handleDismissKeyboard}
            />
            {searchQuery.length > 0 ? (
              <Pressable
                onPress={handleClearSearch}
                hitSlop={8}
                style={styles.clearSearchButton}
              >
                <X size={16} color={theme.colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {isSearchFocused || searchQuery.length > 0 ? (
            <Pressable
              onPress={handleCancelSearch}
              hitSlop={8}
              style={styles.cancelSearchButton}
            >
              <Text style={styles.cancelSearchText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {isSearching ? (
        <ScrollView
          style={styles.searchResultsContainer}
          contentContainerStyle={styles.searchResultsContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={handleDismissKeyboard}
        >
          {searchQuery.trim().startsWith('@') ? (
            <>
              {globalUsers.length > 0 && (
                <>
                  <View style={styles.searchSectionHeader}>
                    <Text style={styles.searchSectionTitle}>GLOBAL SEARCH</Text>
                  </View>
                  {globalUsers.map((user) => (
                    <Pressable
                      key={user.id}
                      style={({ pressed }) => [
                        styles.userResultRow,
                        pressed && styles.rowPressed,
                      ]}
                      onPress={() => handleSelectUser(user)}
                    >
                      <Avatar
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        size={48}
                        isOnline={true}
                      />
                      <View style={styles.userResultInfo}>
                        <View style={styles.userResultTop}>
                          <Text style={styles.userResultName} numberOfLines={1}>
                            {user.name}
                          </Text>
                          <Text style={styles.userResultStatus}>online</Text>
                        </View>
                        <Text style={styles.userResultTag} numberOfLines={1}>
                          @{user.username.replace(/^@/, '')}
                          {user.bio ? `  •  ${user.bio}` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </>
              )}

              {matchingChats.length > 0 && (
                <>
                  <View style={styles.searchSectionHeader}>
                    <Text style={styles.searchSectionTitle}>CHATS</Text>
                  </View>
                  {matchingChats.map((chat) => (
                    <ChatRow
                      key={chat.id}
                      chat={chat}
                      onPress={handleOpenChat}
                    />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {matchingChats.length > 0 && (
                <>
                  <View style={styles.searchSectionHeader}>
                    <Text style={styles.searchSectionTitle}>CHATS</Text>
                  </View>
                  {matchingChats.map((chat) => (
                    <ChatRow
                      key={chat.id}
                      chat={chat}
                      onPress={handleOpenChat}
                    />
                  ))}
                </>
              )}

              {globalUsers.length > 0 && (
                <>
                  <View style={styles.searchSectionHeader}>
                    <Text style={styles.searchSectionTitle}>GLOBAL SEARCH</Text>
                  </View>
                  {globalUsers.map((user) => (
                    <Pressable
                      key={user.id}
                      style={({ pressed }) => [
                        styles.userResultRow,
                        pressed && styles.rowPressed,
                      ]}
                      onPress={() => handleSelectUser(user)}
                    >
                      <Avatar
                        name={user.name}
                        avatarUrl={user.avatarUrl}
                        size={48}
                        isOnline={true}
                      />
                      <View style={styles.userResultInfo}>
                        <View style={styles.userResultTop}>
                          <Text style={styles.userResultName} numberOfLines={1}>
                            {user.name}
                          </Text>
                          <Text style={styles.userResultStatus}>online</Text>
                        </View>
                        <Text style={styles.userResultTag} numberOfLines={1}>
                          @{user.username.replace(/^@/, '')}
                          {user.bio ? `  •  ${user.bio}` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </>
              )}
            </>
          )}

          {globalUsers.length === 0 && matchingChats.length === 0 && (
            <View style={styles.searchEmptyContainer}>
              <Search size={44} color={theme.colors.textMuted} />
              <Text style={styles.searchEmptyTitle}>No Results Found</Text>
              <Text style={styles.searchEmptySubtitle}>
                No chats or users matching "{searchQuery.trim()}". Try searching with @username.
              </Text>
            </View>
          )}
        </ScrollView>
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
              return (
                <ChatList
                  chats={folderChats}
                  archivedChats={tab.id === 'all' && !searchQuery.trim() && !debouncedQuery.trim() ? archivedChats : []}
                  showArchiveCard={tab.id === 'all' && !searchQuery.trim() && !debouncedQuery.trim()}
                  onOpenArchive={handleOpenArchive}
                  onChatPress={handleOpenChat}
                  onScrollBeginDrag={handleDismissKeyboard}
                  emptyText={
                    debouncedQuery.trim()
                      ? `No chats found for "${debouncedQuery.trim()}"`
                      : 'No chats found'
                  }
                />
              );
            }}
          />

          <Pressable style={styles.fab}>
            <Pencil size={24} color={theme.colors.white} />
          </Pressable>
        </>
      )}

      <Modal
        visible={isFolderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFolderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Folder</Text>
              <IconButton
                size={32}
                onPress={() => setIsFolderModalVisible(false)}
              >
                <X size={20} color={theme.colors.textMuted} />
              </IconButton>
            </View>

            <TextInput
              value={newFolderTitle}
              onChangeText={setNewFolderTitle}
              placeholder="Folder Name"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.modalInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                variant="ghost"
                onPress={() => setIsFolderModalVisible(false)}
                style={styles.modalButton}
              />
              <CustomButton
                title="Create"
                variant="primary"
                onPress={handleCreateFolder}
                disabled={!newFolderTitle.trim()}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: theme.colors.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.text,
  },
  clearSearchButton: {
    padding: 4,
  },
  cancelSearchButton: {
    marginLeft: theme.spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cancelSearchText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 80,
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchResultsContent: {
    paddingBottom: 40,
  },
  searchSectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  searchSectionTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowPressed: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  userResultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  userResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userResultName: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  userResultStatus: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  userResultTag: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  searchEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  searchEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  searchEmptySubtitle: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
