import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TextInput, Keyboard } from 'react-native';
import {
  useChatStore,
  filterChatsByFolder,
  sortChats,
  IChat,
} from '../../../entities/chat';
import { useUserStore, IUserProfile } from '../../../entities/user';
import { apiClient } from '../../../shared/api/apiClient';

export function useChatListState() {
  const chats = useChatStore((state) => state.chats);
  const folders = useChatStore((state) => state.folders);
  const activeFolderId = useChatStore((state) => state.activeFolderId);
  const setActiveFolderId = useChatStore((state) => state.setActiveFolderId);
  const createFolder = useChatStore((state) => state.createFolder);
  const accounts = useUserStore((state) => state.accounts);
  const currentProfile = useUserStore((state) => state.profile);

  const searchInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IUserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setRemoteUsers([]);
      return;
    }

    let isMounted = true;
    setIsSearchingUsers(true);

    apiClient
      .searchUsers(q)
      .then((users) => {
        if (!isMounted) return;
        const mapped: IUserProfile[] = users.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          phone: u.phone,
          bio: u.bio || '',
          avatarUrl: u.avatarUrl,
        }));
        setRemoteUsers(mapped);
      })
      .finally(() => {
        if (isMounted) {
          setIsSearchingUsers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

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
    setRemoteUsers([]);
  }, []);

  const handleCancelSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setRemoteUsers([]);
    setIsSearchFocused(false);
    handleDismissKeyboard();
  }, [handleDismissKeyboard]);

  const handleTabChange = useCallback((index: number) => {
    handleDismissKeyboard();
    if (folders[index]) {
      setActiveFolderId(folders[index].id);
    }
  }, [folders, handleDismissKeyboard, setActiveFolderId]);

  const handleCreateFolder = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const newId = createFolder(trimmed);
    setActiveFolderId(newId);
  }, [createFolder, setActiveFolderId]);

  const isSearching = searchQuery.trim().length > 0;

  const globalUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const cleanQ = q.replace(/^@/, '');

    const localMatched = accounts.filter((acc) => {
      if (acc.id === currentProfile.id) return false;
      if (!cleanQ) return true;
      const cleanUsername = (acc.username || '').replace(/^@/, '').toLowerCase();
      const matchUsername = cleanUsername.includes(cleanQ);
      const matchName = (acc.name || '').toLowerCase().includes(cleanQ);
      return matchUsername || matchName;
    });

    const seenIds = new Set(localMatched.map((u) => u.id));
    seenIds.add(currentProfile.id);

    const merged = [...localMatched];
    for (const remote of remoteUsers) {
      if (!seenIds.has(remote.id)) {
        seenIds.add(remote.id);
        merged.push(remote);
      }
    }

    return merged;
  }, [searchQuery, accounts, currentProfile.id, remoteUsers]);

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

  const filterBySearch = useCallback((chatList: IChat[]) => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return chatList;
    return chatList.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  return {
    chats,
    folders,
    archivedChats,
    tabs,
    activeIndex,
    activeFolderId,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    isSearching,
    isSearchingUsers,
    globalUsers,
    matchingChats,
    handleDismissKeyboard,
    handleClearSearch,
    handleCancelSearch,
    handleTabChange,
    handleCreateFolder,
    filterBySearch,
  };
}
