export interface IMessage {
  id: string;
  chatId: string;
  text: string;
  createdAt: string;
  isMe: boolean;
  isRead?: boolean;
  isEdited?: boolean;
  mediaType?: 'photo' | 'file';
  mediaUri?: string;
  fileName?: string;
  fileSize?: string;
}
