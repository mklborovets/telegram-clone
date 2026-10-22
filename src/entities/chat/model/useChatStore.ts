import { create } from 'zustand';
import { IChat, IChatFolder, ChatCategory } from './types';
import { initialChats, initialFolders } from './mockData';

interface ChatState {
  chats: IChat[];
  folders: IChatFolder[];
  activeFolderId: string;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  deleteChat: (id: string) => void;
  updateLastMessage: (id: string, text: string, time?: string, isMe?: boolean) => void;
  markAsRead: (id: string) => void;
  createFolder: (title: string, chatIds?: string[]) => string;
  deleteFolder: (folderId: string) => void;
  updateFolder: (folderId: string, title: string, chatIds?: string[]) => void;
  addChatToFolder: (folderId: string, chatId: string) => void;
  removeChatFromFolder: (folderId: string, chatId: string) => void;
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

export const filterChatsByFolder = (
  chats: IChat[],
  folder: IChatFolder
): IChat[] => {
  const filtered = chats.filter((chat) => {
    if (folder.id === 'archive') {
      return chat.isArchived;
    }
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

export const useChatStore = create<ChatState>((set) => ({
  chats: initialChats,
  folders: initialFolders,
  activeFolderId: 'all',

  togglePin: (id: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          const nextPinned = !chat.isPinned;
          return {
            ...chat,
            isPinned: nextPinned,
            pinnedAt: nextPinned ? Date.now() : undefined,
          };
        }
        return chat;
      }),
    }));
  },

  toggleArchive: (id: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          const nextArchived = !chat.isArchived;
          return {
            ...chat,
            isArchived: nextArchived,
            isPinned: nextArchived ? false : chat.isPinned,
          };
        }
        return chat;
      }),
    }));
  },

  deleteChat: (id: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== id),
      folders: state.folders.map((folder) => ({
        ...folder,
        chatIds: folder.chatIds?.filter((chatId) => chatId !== id),
      })),
    }));
  },

  updateLastMessage: (id: string, text: string, time?: string, isMe = true) => {
    const timestamp = time || new Date().toISOString();
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          return {
            ...chat,
            lastMessage: text,
            lastMessageTime: timestamp,
            lastMessageSenderMe: isMe,
            lastMessageRead: true,
          };
        }
        return chat;
      }),
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id === id) {
          return {
            ...chat,
            unreadCount: 0,
          };
        }
        return chat;
      }),
    }));
  },

  createFolder: (title: string, chatIds: string[] = []) => {
    const id = `folder-${Date.now()}`;
    const newFolder: IChatFolder = {
      id,
      title,
      chatIds,
      isSystem: false,
    };
    set((state) => ({
      folders: [...state.folders, newFolder],
      chats: state.chats.map((chat) => {
        if (chatIds.includes(chat.id)) {
          return {
            ...chat,
            folderIds: [...(chat.folderIds || []), id],
          };
        }
        return chat;
      }),
    }));
    return id;
  },

  deleteFolder: (folderId: string) => {
    set((state) => {
      const folderToDelete = state.folders.find((f) => f.id === folderId);
      if (folderToDelete?.isSystem) {
        return state;
      }
      return {
        folders: state.folders.filter((f) => f.id !== folderId),
        activeFolderId:
          state.activeFolderId === folderId ? 'all' : state.activeFolderId,
        chats: state.chats.map((chat) => ({
          ...chat,
          folderIds: chat.folderIds?.filter((fId) => fId !== folderId),
        })),
      };
    });
  },

  updateFolder: (folderId: string, title: string, chatIds?: string[]) => {
    set((state) => ({
      folders: state.folders.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            title,
            chatIds: chatIds !== undefined ? chatIds : folder.chatIds,
          };
        }
        return folder;
      }),
    }));
  },

  addChatToFolder: (folderId: string, chatId: string) => {
    set((state) => ({
      folders: state.folders.map((folder) => {
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
      }),
      chats: state.chats.map((chat) => {
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
      }),
    }));
  },

  removeChatFromFolder: (folderId: string, chatId: string) => {
    set((state) => ({
      folders: state.folders.map((folder) => {
        if (folder.id === folderId) {
          return {
            ...folder,
            chatIds: folder.chatIds?.filter((id) => id !== chatId),
          };
        }
        return folder;
      }),
      chats: state.chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            folderIds: chat.folderIds?.filter((id) => id !== folderId),
          };
        }
        return chat;
      }),
    }));
  },

  setActiveFolderId: (folderId: string) => {
    set({ activeFolderId: folderId });
  },
}));
