import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../../../shared/lib/storage';
import { useUserStore } from '../../user';
import { IChat, IChatFolder, ChatCategory } from './types';
import { initialChats, initialFolders } from './mockData';

export const defaultCleanUserFolders: IChatFolder[] = [
  {
    id: 'all',
    title: 'All Chats',
    isSystem: true,
  },
  {
    id: 'personal',
    title: 'Personal',
    isSystem: true,
  },
];

export const createDefaultChatsForUser = (userName = 'User'): IChat[] => [
  {
    id: 'chat-saved',
    title: 'Saved Messages',
    avatarUrl: '',
    lastMessage: 'Your cloud storage for messages and media',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isPinned: true,
    isArchived: false,
    isPersonal: true,
    isOnline: true,
    lastMessageSenderMe: true,
    lastMessageRead: true,
    lastMessageMediaType: 'file',
    pinnedAt: Date.now(),
    folderIds: ['personal'],
  },
  {
    id: 'chat-telegram-service',
    title: 'Telegram Service',
    avatarUrl: '',
    lastMessage: `Welcome to Telegram, ${userName}! Send messages, create groups, and enjoy cloud sync.`,
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    isPinned: false,
    isArchived: false,
    isPersonal: false,
    isOnline: true,
    lastMessageSenderMe: false,
    lastMessageRead: false,
    folderIds: [],
  },
];

interface ChatState {
  currentUserId: string;
  chats: IChat[];
  folders: IChatFolder[];
  activeFolderId: string;
  isArchiveHidden: boolean;
  userChatsMap: Record<string, IChat[]>;
  userFoldersMap: Record<string, IChatFolder[]>;
  setUserSession: (userId: string, userName?: string) => void;
  clearUserSession: () => void;
  getOrCreateDirectChat: (targetUser: { id: string; name: string; username?: string; avatarUrl?: string }) => IChat;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  deleteChat: (id: string) => void;
  updateLastMessage: (id: string, text: string, time?: string, isMe?: boolean, mediaType?: 'photo' | 'file') => void;
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  setArchiveHidden: (hidden: boolean) => void;
  createFolder: (title: string, chatIds?: string[]) => string;
  deleteFolder: (folderId: string) => void;
  updateFolder: (folderId: string, title: string, chatIds?: string[]) => void;
  addChatToFolder: (folderId: string, chatId: string) => void;
  removeChatFromFolder: (folderId: string, chatId: string) => void;
  reorderFolders: (folders: IChatFolder[]) => void;
  setActiveFolderId: (folderId: string) => void;
}

export const sortChats = (chats: IChat[]): IChat[] => {
  return [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isPinned && b.isPinned) {
      return (b.pinnedAt || 0) - (a.pinnedAt || 0);
    }
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });
};

export const filterChatsByCategory = (chats: IChat[], category: ChatCategory): IChat[] => {
  const filtered = chats.filter((chat) => {
    if (category === 'archive') {
      return chat.isArchived;
    }
    if (chat.isArchived) {
      return false;
    }
    if (category === 'personal') {
      return chat.isPersonal;
    }
    return true;
  });
  return sortChats(filtered);
};

export const getArchivedChats = (chats: IChat[]): IChat[] => {
  return sortChats(chats.filter((c) => c.isArchived));
};

export const filterChatsByFolder = (
  chats: IChat[],
  folder: IChatFolder
): IChat[] => {
  const filtered = chats.filter((chat) => {
    if (chat.isArchived) {
      return false;
    }
    if (folder.id === 'all') {
      return true;
    }
    if (folder.id === 'personal') {
      return chat.isPersonal;
    }
    return (
      Boolean(folder.chatIds?.includes(chat.id)) ||
      Boolean(chat.folderIds?.includes(folder.id))
    );
  });
  return sortChats(filtered);
};

const syncUserState = (
  state: ChatState,
  partial: { chats?: IChat[]; folders?: IChatFolder[]; activeFolderId?: string }
) => {
  const currentUserId = state.currentUserId;
  const nextChats = partial.chats ?? state.chats;
  const nextFolders = partial.folders ?? state.folders;

  if (!currentUserId) {
    return { ...partial };
  }

  return {
    ...partial,
    userChatsMap: {
      ...state.userChatsMap,
      [currentUserId]: nextChats,
    },
    userFoldersMap: {
      ...state.userFoldersMap,
      [currentUserId]: nextFolders,
    },
  };
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentUserId: '',
      chats: [],
      folders: defaultCleanUserFolders,
      activeFolderId: 'all',
      isArchiveHidden: false,
      userChatsMap: {
        'user-demo-alex': initialChats,
      },
      userFoldersMap: {
        'user-demo-alex': initialFolders,
      },

      setArchiveHidden: (hidden: boolean) => set({ isArchiveHidden: hidden }),

      setUserSession: (userId: string, userName?: string) => {
        set((state) => {
          if (!userId) {
            if (!state.currentUserId && state.chats.length === 0) {
              return state;
            }
            return {
              currentUserId: '',
              chats: [],
              folders: defaultCleanUserFolders,
            };
          }

          if (state.currentUserId === userId && state.chats.length > 0) {
            return state;
          }

          const existingUserChats = state.userChatsMap?.[userId];
          const existingUserFolders = state.userFoldersMap?.[userId];

          let chatsForUser: IChat[];
          let foldersForUser: IChatFolder[];

          if (existingUserChats !== undefined) {
            chatsForUser = existingUserChats;
            foldersForUser = existingUserFolders || defaultCleanUserFolders;
          } else if (userId === 'user-demo-alex') {
            chatsForUser = initialChats;
            foldersForUser = initialFolders;
          } else {
            chatsForUser = createDefaultChatsForUser(userName);
            foldersForUser = defaultCleanUserFolders;
          }

          return {
            currentUserId: userId,
            chats: chatsForUser,
            folders: foldersForUser,
            userChatsMap: {
              ...state.userChatsMap,
              [userId]: chatsForUser,
            },
            userFoldersMap: {
              ...state.userFoldersMap,
              [userId]: foldersForUser,
            },
          };
        });
      },

      clearUserSession: () => {
        set({
          currentUserId: '',
          chats: [],
          folders: defaultCleanUserFolders,
        });
      },

      getOrCreateDirectChat: (targetUser) => {
        const state = get();
        const existingChat = state.chats.find(
          (c) =>
            c.id === `direct-${targetUser.id}` ||
            (c.isPersonal && c.title.toLowerCase() === targetUser.name.toLowerCase())
        );
        if (existingChat) {
          return existingChat;
        }

        const newDirectChat: IChat = {
          id: `direct-${targetUser.id}`,
          title: targetUser.name,
          avatarUrl: targetUser.avatarUrl || '',
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isPersonal: true,
          isOnline: true,
          lastMessageSenderMe: true,
          lastMessageRead: true,
          folderIds: ['personal'],
        };

        const nextChats = [newDirectChat, ...state.chats];
        set((s) => syncUserState(s, { chats: nextChats }));
        return newDirectChat;
      },

      togglePin: (id: string) => {
        set((state) => {
          const nextChats = state.chats.map((chat) => {
            if (chat.id === id) {
              const nextPinned = !chat.isPinned;
              return {
                ...chat,
                isPinned: nextPinned,
                pinnedAt: nextPinned ? Date.now() : undefined,
              };
            }
            return chat;
          });
          return syncUserState(state, { chats: nextChats });
        });
      },

      toggleArchive: (id: string) => {
        set((state) => {
          const nextChats = state.chats.map((chat) => {
            if (chat.id === id) {
              const nextArchived = !chat.isArchived;
              return {
                ...chat,
                isArchived: nextArchived,
                isPinned: nextArchived ? false : chat.isPinned,
              };
            }
            return chat;
          });
          return syncUserState(state, { chats: nextChats });
        });
      },

      deleteChat: (id: string) => {
        set((state) => {
          const nextChats = state.chats.filter((chat) => chat.id !== id);
          const nextFolders = state.folders.map((folder) => ({
            ...folder,
            chatIds: folder.chatIds?.filter((chatId) => chatId !== id),
          }));
          return syncUserState(state, { chats: nextChats, folders: nextFolders });
        });
      },

      updateLastMessage: (id: string, text: string, time?: string, isMe = true, mediaType?: 'photo' | 'file') => {
        const timestamp = time || new Date().toISOString();
        set((state) => {
          const nextChats = state.chats.map((chat) => {
            if (chat.id === id) {
              return {
                ...chat,
                lastMessage: text,
                lastMessageTime: timestamp,
                lastMessageSenderMe: isMe,
                lastMessageRead: isMe,
                lastMessageMediaType: mediaType,
                unreadCount: isMe ? chat.unreadCount : (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          });
          return syncUserState(state, { chats: nextChats });
        });
      },

      markAsRead: (id: string) => {
        set((state) => {
          const nextChats = state.chats.map((chat) => {
            if (chat.id === id) {
              return {
                ...chat,
                unreadCount: 0,
              };
            }
            return chat;
          });
          return syncUserState(state, { chats: nextChats });
        });
      },

      toggleRead: (id: string) => {
        set((state) => {
          const nextChats = state.chats.map((chat) => {
            if (chat.id === id) {
              const wasUnread = chat.unreadCount > 0;
              return {
                ...chat,
                unreadCount: wasUnread ? 0 : 1,
                lastMessageRead: wasUnread,
              };
            }
            return chat;
          });
          return syncUserState(state, { chats: nextChats });
        });
      },

      createFolder: (title: string, chatIds: string[] = []) => {
        const id = `folder-${Date.now()}`;
        const newFolder: IChatFolder = {
          id,
          title,
          chatIds,
          isSystem: false,
        };
        set((state) => {
          const nextFolders = [...state.folders, newFolder];
          const nextChats = state.chats.map((chat) => {
            if (chatIds.includes(chat.id)) {
              return {
                ...chat,
                folderIds: [...(chat.folderIds || []), id],
              };
            }
            return chat;
          });
          return syncUserState(state, { folders: nextFolders, chats: nextChats });
        });
        return id;
      },

      deleteFolder: (folderId: string) => {
        set((state) => {
          const folderToDelete = state.folders.find((f) => f.id === folderId);
          if (folderToDelete?.isSystem) {
            return state;
          }
          const nextFolders = state.folders.filter((f) => f.id !== folderId);
          const nextChats = state.chats.map((chat) => ({
            ...chat,
            folderIds: chat.folderIds?.filter((fId) => fId !== folderId),
          }));
          const nextActiveFolderId = state.activeFolderId === folderId ? 'all' : state.activeFolderId;
          return syncUserState(state, {
            folders: nextFolders,
            chats: nextChats,
            activeFolderId: nextActiveFolderId,
          });
        });
      },

      updateFolder: (folderId: string, title: string, chatIds?: string[]) => {
        set((state) => {
          const nextFolders = state.folders.map((folder) => {
            if (folder.id === folderId) {
              return {
                ...folder,
                title,
                chatIds: chatIds !== undefined ? chatIds : folder.chatIds,
              };
            }
            return folder;
          });
          return syncUserState(state, { folders: nextFolders });
        });
      },

      addChatToFolder: (folderId: string, chatId: string) => {
        set((state) => {
          const nextFolders = state.folders.map((folder) => {
            if (folder.id === folderId) {
              const currentChatIds = folder.chatIds || [];
              if (!currentChatIds.includes(chatId)) {
                return {
                  ...folder,
                  chatIds: [...currentChatIds, chatId],
                };
              }
            }
            return folder;
          });
          const nextChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              const currentFolders = chat.folderIds || [];
              if (!currentFolders.includes(folderId)) {
                return {
                  ...chat,
                  folderIds: [...currentFolders, folderId],
                };
              }
            }
            return chat;
          });
          return syncUserState(state, { folders: nextFolders, chats: nextChats });
        });
      },

      removeChatFromFolder: (folderId: string, chatId: string) => {
        set((state) => {
          const nextFolders = state.folders.map((folder) => {
            if (folder.id === folderId) {
              return {
                ...folder,
                chatIds: folder.chatIds?.filter((id) => id !== chatId),
              };
            }
            return folder;
          });
          const nextChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                folderIds: chat.folderIds?.filter((id) => id !== folderId),
              };
            }
            return chat;
          });
          return syncUserState(state, { folders: nextFolders, chats: nextChats });
        });
      },

      reorderFolders: (newFolders: IChatFolder[]) => {
        set((state) => syncUserState(state, { folders: newFolders }));
      },

      setActiveFolderId: (folderId: string) => {
        set({ activeFolderId: folderId });
      },
    }),
    {
      name: 'telegram-chats-storage',
      version: 4,
      storage: createJSONStorage(() => safeAsyncStorage),
      migrate: (persistedState: any, _version: number) => {
        const userChatsMap = persistedState?.userChatsMap || {
          'user-demo-alex': initialChats,
        };
        const userFoldersMap = persistedState?.userFoldersMap || {
          'user-demo-alex': initialFolders,
        };
        const currentUserId = persistedState?.currentUserId || '';

        let chats = persistedState?.chats || [];
        let folders = persistedState?.folders || defaultCleanUserFolders;

        if (!currentUserId || currentUserId !== 'user-demo-alex') {
          if (currentUserId && userChatsMap[currentUserId]) {
            chats = userChatsMap[currentUserId];
            folders = (userFoldersMap[currentUserId] || defaultCleanUserFolders).filter((f: any) => f.id !== 'work');
          } else if (currentUserId) {
            chats = createDefaultChatsForUser('User');
            folders = defaultCleanUserFolders;
          } else {
            chats = [];
            folders = defaultCleanUserFolders;
          }
        }

        return {
          ...persistedState,
          currentUserId,
          chats,
          folders,
          userChatsMap,
          userFoldersMap,
        };
      },
      partialize: (state) => ({
        chats: state.chats,
        folders: state.folders,
        activeFolderId: state.activeFolderId,
        isArchiveHidden: state.isArchiveHidden,
        currentUserId: state.currentUserId,
        userChatsMap: state.userChatsMap,
        userFoldersMap: state.userFoldersMap,
      }),
    }
  )
);

useUserStore.subscribe((userState) => {
  const currentChatUserId = useChatStore.getState().currentUserId;
  if (userState.isAuthenticated && userState.profile.id) {
    if (currentChatUserId !== userState.profile.id) {
      useChatStore
        .getState()
        .setUserSession(userState.profile.id, userState.profile.name);
    }
  } else if (!userState.isAuthenticated && currentChatUserId) {
    useChatStore.getState().clearUserSession();
  }
});
