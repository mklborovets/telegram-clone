import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Phone,
  Video,
  Bell,
  Search,
  MoreVertical,
  MessageSquare,
} from 'lucide-react-native';
import { IChat, useChatStore } from '../../../entities/chat';
import { useMessageStore, IMessage } from '../../../entities/message';
import { IUserProfile } from '../../../entities/user';
import { Avatar } from '../../../shared/ui/avatar';
import { IconButton } from '../../../shared/ui/icon-button';
import { theme } from '../../../shared/config/theme';
import {
  MediaTabs,
  ProfileMediaItem,
  ProfileFileItem,
  ProfileLinkItem,
  ProfileMemberItem,
} from './MediaTabs';

export interface ChatProfilePageProps {
  chatId?: string;
  userProfile?: IUserProfile | null;
  onBack: () => void;
  onOpenChat?: (chat: IChat) => void;
}

const mockGroupMembers: ProfileMemberItem[] = [
  {
    id: 'mem-1',
    name: 'Alexander Wright',
    username: 'a_wright',
    role: 'owner',
    isOnline: true,
  },
  {
    id: 'mem-2',
    name: 'Sarah Jenkins',
    username: 's_jenkins',
    role: 'admin',
    isOnline: true,
  },
  {
    id: 'mem-3',
    name: 'Michael Chen',
    username: 'mchen_dev',
    role: 'member',
    isOnline: false,
  },
  {
    id: 'mem-4',
    name: 'Elena Rostova',
    username: 'elena_r',
    role: 'member',
    isOnline: false,
  },
];

const EMPTY_MESSAGES: IMessage[] = [];

export const ChatProfilePage: React.FC<ChatProfilePageProps> = ({
  chatId,
  userProfile,
  onBack,
  onOpenChat,
}) => {
  const allChats = useChatStore((state) => state.chats);
  const getOrCreateDirectChat = useChatStore((state) => state.getOrCreateDirectChat);
  const chat = chatId ? allChats.find((c) => c.id === chatId) : undefined;
  const messages = useMessageStore((state) => (chatId && state.messages[chatId] ? state.messages[chatId] : EMPTY_MESSAGES));

  const title = chat?.title || userProfile?.name || 'User Info';
  const avatarUrl = chat?.avatarUrl || userProfile?.avatarUrl || '';
  const isOnline = chat ? chat.isOnline : true;
  const isGroup = Boolean(chat && !chat.isPersonal);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSendMessage = () => {
    let targetChat: IChat;
    if (userProfile) {
      targetChat = getOrCreateDirectChat(userProfile);
    } else if (chat) {
      targetChat = chat;
    } else {
      return;
    }
    if (onOpenChat) {
      onOpenChat(targetChat);
    } else {
      onBack();
    }
  };

  const chatPhotos = useMemo<ProfileMediaItem[]>(() => {
    const list: ProfileMediaItem[] = [];
    messages.forEach((m) => {
      if (m.mediaType === 'photo' && m.mediaUri) {
        list.push({ id: m.id, uri: m.mediaUri });
      }
    });
    return list;
  }, [messages]);

  const chatFiles = useMemo<ProfileFileItem[]>(() => {
    const list: ProfileFileItem[] = [];
    messages.forEach((m) => {
      if (m.mediaType === 'file' && m.fileName) {
        const dateObj = new Date(m.createdAt);
        const formattedDate = isNaN(dateObj.getTime())
          ? 'Recently'
          : dateObj.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
        list.push({
          id: m.id,
          name: m.fileName,
          size: m.fileSize || '1.5 MB',
          date: formattedDate,
        });
      }
    });
    return list;
  }, [messages]);

  const chatLinks = useMemo<ProfileLinkItem[]>(() => {
    const list: ProfileLinkItem[] = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    messages.forEach((m) => {
      if (m.text) {
        const matches = m.text.match(urlRegex);
        if (matches) {
          matches.forEach((url, i) => {
            const cleanDomain = url
              .replace(/^https?:\/\/(www\.)?/, '')
              .split('/')[0];
            list.push({
              id: `${m.id}-link-${i}`,
              title: cleanDomain || 'Web Link',
              url,
            });
          });
        }
      }
    });
    return list;
  }, [messages]);

  const details = useMemo(() => {
    if (userProfile) {
      return {
        phone: userProfile.phone || '',
        username: userProfile.username ? userProfile.username.replace(/^@/, '') : '',
        description: userProfile.bio || 'Telegram contact.',
        inviteLink: '',
      };
    }

    if (!chat) {
      return {
        phone: '',
        username: '',
        description: '',
        inviteLink: '',
      };
    }

    if (!chat.isPersonal) {
      return {
        phone: '',
        username: chat.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        description:
          chat.id === 'chat-3'
            ? 'Official workspace for mobile architecture, release schedules and native UI components.'
            : 'Official product updates and release changelogs.',
        inviteLink: `https://t.me/${chat.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      };
    }

    if (chat.id === 'chat-1' || chat.title.toLowerCase().includes('saved')) {
      return {
        phone: '',
        username: '',
        description:
          'Forward messages here to save them. Send media and files to store them in your personal cloud storage.',
        inviteLink: '',
      };
    }

    if (chat.title.includes('Sarah')) {
      return {
        phone: '+1 (555) 234-5678',
        username: 'sarah_jenkins',
        description:
          'Senior Product Designer. Passionate about design systems and micro-interactions.',
        inviteLink: '',
      };
    }

    if (chat.title.includes('Elena')) {
      return {
        phone: '+380 50 987 65 43',
        username: 'elena_rostova',
        description:
          'Frontend engineer & open source enthusiast. Exploring React 19 architecture.',
        inviteLink: '',
      };
    }

    if (chat.title.includes('Michael')) {
      return {
        phone: '+1 (415) 890-1234',
        username: 'michael_chen',
        description:
          'Backend & Infrastructure Engineer @ TechCorp. Distributed systems & GraphQL.',
        inviteLink: '',
      };
    }

    return {
      phone: '+380 95 123 45 67',
      username: chat.title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      description: 'Telegram contact.',
      inviteLink: '',
    };
  }, [chat, userProfile]);

  if (!chat && !userProfile) {
    return null;
  }

  const handleAction = (label: string) => {
    Alert.alert(label, `${label} action triggered for ${title}`);
  };

  const handleSelectMember = (member: ProfileMemberItem) => {
    const memberChat = allChats.find(
      (c) =>
        c.title.toLowerCase().includes(member.name.toLowerCase()) ||
        member.name.toLowerCase().includes(c.title.toLowerCase())
    );
    if (memberChat && onOpenChat) {
      onBack();
      setTimeout(() => {
        onOpenChat(memberChat);
      }, 100);
    } else {
      Alert.alert(member.name, `@${member.username}\nRole: ${member.role}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton size={40} onPress={onBack}>
          <ArrowLeft size={22} color={theme.colors.text} />
        </IconButton>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isGroup ? 'Group Info' : 'User Info'}
        </Text>
        <IconButton size={40} onPress={() => handleAction('More options')}>
          <MoreVertical size={20} color={theme.colors.text} />
        </IconButton>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHero}>
          <Avatar
            name={title}
            avatarUrl={avatarUrl}
            size={96}
            isOnline={isOnline}
          />
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>
            {isGroup
              ? '4 members, 2 online'
              : isOnline
              ? 'online'
              : 'last seen recently'}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionButton}
              onPress={handleSendMessage}
            >
              <View style={styles.actionIconWrapper}>
                <MessageSquare size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Message</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleAction('Voice Call')}
            >
              <View style={styles.actionIconWrapper}>
                <Phone size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Call</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleAction('Video Call')}
            >
              <View style={styles.actionIconWrapper}>
                <Video size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Video</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <View style={styles.actionIconWrapper}>
                <Bell
                  size={20}
                  color={
                    notificationsEnabled
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                />
              </View>
              <Text style={styles.actionText}>
                {notificationsEnabled ? 'Mute' : 'Unmute'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleAction('Search in chat')}
            >
              <View style={styles.actionIconWrapper}>
                <Search size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>Search</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>INFO</Text>

          {details.phone ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{details.phone}</Text>
                <Text style={styles.infoLabel}>Mobile</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          {details.username ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>@{details.username}</Text>
                <Text style={styles.infoLabel}>Username</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          {details.description ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{details.description}</Text>
                <Text style={styles.infoLabel}>
                  {isGroup ? 'Description' : 'Bio'}
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          {details.inviteLink ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>{details.inviteLink}</Text>
                <Text style={styles.infoLabel}>Invite Link</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <MediaTabs
          photos={chatPhotos}
          files={chatFiles}
          links={chatLinks}
          members={isGroup ? mockGroupMembers : undefined}
          isGroup={isGroup}
          onSelectMember={handleSelectMember}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F7',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    ...theme.typography.title,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHero: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingTop: 24,
    paddingBottom: 16,
  },
  heroTitle: {
    ...theme.typography.title,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  heroSubtitle: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E7F2FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.white,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeader: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  infoRow: {
    paddingVertical: 8,
  },
  infoValue: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  infoLabel: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginVertical: 4,
  },
});
