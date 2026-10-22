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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Phone,
  Video,
  Bell,
  Search,
  MoreVertical,
  Share2,
  Trash2,
  Users,
} from 'lucide-react-native';
import { IChat, useChatStore } from '../../../entities/chat';
import { useMessageStore } from '../../../entities/message';
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
  chatId: string;
  onBack: () => void;
}

const mockGroupMembers: ProfileMemberItem[] = [
  {
    id: 'mem-1',
    name: 'Alex Romanov',
    username: 'alex_rn',
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

const fallbackPhotos: ProfileMediaItem[] = [
  {
    id: 'fb-p-1',
    uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  },
  {
    id: 'fb-p-2',
    uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
  },
  {
    id: 'fb-p-3',
    uri: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
  },
  {
    id: 'fb-p-4',
    uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  },
];

const fallbackFiles: ProfileFileItem[] = [
  {
    id: 'fb-f-1',
    name: 'Architecture_Spec_2026.pdf',
    size: '2.4 MB',
    date: 'Oct 22, 2026',
  },
  {
    id: 'fb-f-2',
    name: 'Design_System_Spec.pdf',
    size: '1.8 MB',
    date: 'Oct 21, 2026',
  },
  {
    id: 'fb-f-3',
    name: 'API_Documentation_v2.json',
    size: '420 KB',
    date: 'Oct 19, 2026',
  },
];

const fallbackLinks: ProfileLinkItem[] = [
  {
    id: 'fb-l-1',
    title: 'React Native Official Documentation',
    url: 'https://reactnative.dev',
  },
  {
    id: 'fb-l-2',
    title: 'Software Mansion Reanimated 4',
    url: 'https://docs.swmansion.com/react-native-reanimated',
  },
  {
    id: 'fb-l-3',
    title: 'React 19 Hooks and Architecture',
    url: 'https://react.dev/reference/react',
  },
];

export const ChatProfilePage: React.FC<ChatProfilePageProps> = ({
  chatId,
  onBack,
}) => {
  const chat = useChatStore((state) => state.chats.find((c) => c.id === chatId));
  const messages = useMessageStore((state) => state.messages[chatId] || []);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const isGroup = !chat?.isPersonal;

  const chatPhotos = useMemo<ProfileMediaItem[]>(() => {
    const list: ProfileMediaItem[] = [];
    messages.forEach((m) => {
      if (m.mediaType === 'photo' && m.mediaUri) {
        list.push({ id: m.id, uri: m.mediaUri });
      }
    });
    if (list.length === 0) {
      return fallbackPhotos;
    }
    return list;
  }, [messages]);

  const chatFiles = useMemo<ProfileFileItem[]>(() => {
    const list: ProfileFileItem[] = [];
    messages.forEach((m) => {
      if (m.mediaType === 'file' && m.fileName) {
        list.push({
          id: m.id,
          name: m.fileName,
          size: m.fileSize || '1.5 MB',
          date: 'Recently',
        });
      }
    });
    if (list.length === 0) {
      return fallbackFiles;
    }
    return list;
  }, [messages]);

  if (!chat) {
    return null;
  }

  const handleAction = (label: string) => {
    Alert.alert(label, `${label} action triggered for ${chat.title}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            name={chat.title}
            avatarUrl={chat.avatarUrl}
            size={96}
            isOnline={chat.isOnline}
          />
          <Text style={styles.heroTitle}>{chat.title}</Text>
          <Text style={styles.heroSubtitle}>
            {isGroup
              ? '4 members, 2 online'
              : chat.isOnline
              ? 'online'
              : 'last seen recently'}
          </Text>

          <View style={styles.actionRow}>
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

          {!isGroup ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>+1 (555) 234-5678</Text>
                <Text style={styles.infoLabel}>Mobile</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  @{chat.title.toLowerCase().replace(/\s+/g, '_')}
                </Text>
                <Text style={styles.infoLabel}>Username</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  Mobile Engineer & Open Source Developer. Focused on React Native 60 FPS interactions.
                </Text>
                <Text style={styles.infoLabel}>Bio</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  Official workspace for mobile architecture, release schedules and native UI components.
                </Text>
                <Text style={styles.infoLabel}>Description</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  https://t.me/{chat.title.toLowerCase().replace(/\s+/g, '_')}
                </Text>
                <Text style={styles.infoLabel}>Invite Link</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />
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
          links={fallbackLinks}
          members={isGroup ? mockGroupMembers : undefined}
          isGroup={isGroup}
        />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 24,
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
