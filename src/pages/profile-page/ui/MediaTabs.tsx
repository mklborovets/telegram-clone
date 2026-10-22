import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Linking,
  useWindowDimensions,
  Alert,
} from 'react-native';
import {
  FileText,
  Link2,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/avatar';
import { theme } from '../../../shared/config/theme';

export interface ProfileMediaItem {
  id: string;
  uri: string;
}

export interface ProfileFileItem {
  id: string;
  name: string;
  size: string;
  date: string;
}

export interface ProfileLinkItem {
  id: string;
  title: string;
  url: string;
}

export interface ProfileMemberItem {
  id: string;
  name: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  isOnline?: boolean;
  avatarUrl?: string;
}

export interface MediaTabsProps {
  photos: ProfileMediaItem[];
  files: ProfileFileItem[];
  links: ProfileLinkItem[];
  members?: ProfileMemberItem[];
  isGroup?: boolean;
}

type TabType = 'media' | 'files' | 'links' | 'members';

export const MediaTabs: React.FC<MediaTabsProps> = ({
  photos,
  files,
  links,
  members = [],
  isGroup = false,
}) => {
  const { width } = useWindowDimensions();
  const photoSize = (width - 6) / 3;

  const [activeTab, setActiveTab] = useState<TabType>('media');

  const tabs: Array<{ id: TabType; label: string; count: number }> = [
    { id: 'media', label: 'Media', count: photos.length },
    { id: 'files', label: 'Files', count: files.length },
    { id: 'links', label: 'Links', count: links.length },
  ];

  if (isGroup && members.length > 0) {
    tabs.unshift({ id: 'members', label: 'Members', count: members.length });
  }

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Link', url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive && styles.countTextActive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
              {isActive ? <View style={styles.indicator} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'media' ? (
          <View style={styles.mediaGrid}>
            {photos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No shared media</Text>
              </View>
            ) : (
              photos.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.photoItem, { width: photoSize, height: photoSize }]}
                  onPress={() => Alert.alert('Photo', 'Full-resolution image preview')}
                >
                  <Image source={{ uri: item.uri }} style={styles.photoImage} />
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {activeTab === 'files' ? (
          <View style={styles.filesList}>
            {files.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No shared files</Text>
              </View>
            ) : (
              files.map((file) => (
                <Pressable
                  key={file.id}
                  style={styles.fileRow}
                  onPress={() => Alert.alert('File', `${file.name} (${file.size})`)}
                >
                  <View style={styles.fileIconWrapper}>
                    <FileText size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {file.size} • {file.date}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {activeTab === 'links' ? (
          <View style={styles.linksList}>
            {links.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No shared links</Text>
              </View>
            ) : (
              links.map((link) => (
                <Pressable
                  key={link.id}
                  style={styles.linkRow}
                  onPress={() => handleOpenLink(link.url)}
                >
                  <View style={styles.linkIconWrapper}>
                    <Link2 size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.linkInfo}>
                    <Text style={styles.linkTitle} numberOfLines={1}>
                      {link.title}
                    </Text>
                    <Text style={styles.linkUrl} numberOfLines={1}>
                      {link.url}
                    </Text>
                  </View>
                  <ExternalLink size={16} color={theme.colors.textMuted} />
                </Pressable>
              ))
            )}
          </View>
        ) : null}

        {activeTab === 'members' ? (
          <View style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <Avatar
                  name={member.name}
                  avatarUrl={member.avatarUrl}
                  size={44}
                  isOnline={member.isOnline}
                />
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {member.name}
                    </Text>
                    {member.role === 'owner' ? (
                      <View style={styles.roleBadge}>
                        <ShieldCheck size={12} color={theme.colors.primary} />
                        <Text style={styles.roleText}>owner</Text>
                      </View>
                    ) : member.role === 'admin' ? (
                      <View style={styles.roleBadge}>
                        <UserCheck size={12} color={theme.colors.success} />
                        <Text style={styles.roleText}>admin</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.memberStatus}>
                    {member.isOnline ? 'online' : `@${member.username}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginTop: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    position: 'relative',
  },
  tabButtonActive: {},
  tabLabel: {
    ...theme.typography.caption,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  countBadgeActive: {
    backgroundColor: '#E7F2FA',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  countTextActive: {
    color: theme.colors.primary,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  contentContainer: {
    minHeight: 220,
    paddingBottom: 24,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  photoItem: {
    backgroundColor: '#E5E7EB',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  filesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  fileIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E7F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...theme.typography.body,
    fontWeight: '600',
    fontSize: 15,
    color: theme.colors.text,
  },
  fileMeta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  linksList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  linkIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7F2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
    marginRight: 8,
  },
  linkTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    fontSize: 15,
    color: theme.colors.text,
  },
  linkUrl: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginTop: 2,
  },
  membersList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    ...theme.typography.body,
    fontWeight: '600',
    fontSize: 15,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  memberStatus: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
});
