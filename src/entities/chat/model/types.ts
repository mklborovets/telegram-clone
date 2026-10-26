export interface IChat {
  id: string;
  title: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isPersonal: boolean;
  isOnline?: boolean;
  lastMessageSenderMe?: boolean;
  lastMessageRead?: boolean;
  pinnedAt?: number;
  folderIds?: string[];
  lastMessageMediaType?: 'photo' | 'file';
  participantId?: string;
}

export type ChatCategory = 'all' | 'personal' | 'archive';

export interface IChatFolder {
  id: string;
  title: string;
  chatIds?: string[];
  isSystem?: boolean;
}
