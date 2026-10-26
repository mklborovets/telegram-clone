import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import {
  Camera,
  Pencil,
  Bookmark,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useUserStore } from '../../../entities/user';
import { Avatar } from '../../../shared/ui/avatar';
import { IconButton } from '../../../shared/ui/icon-button';
import { ScreenHeader } from '../../../shared/ui/screen-header';
import { CustomButton } from '../../../shared/ui/custom-button';
import { ConfirmModal } from '../../../shared/ui/confirm-modal';
import { pickImageFromGallery } from '../../../shared/lib/mediaPicker';
import { isValidInternationalPhone } from '../../../shared/lib/phone';
import { theme } from '../../../shared/config/theme';

export interface MyProfilePageProps {
  onBack: () => void;
  onOpenSavedMessages?: () => void;
}

export const MyProfilePage: React.FC<MyProfilePageProps> = ({
  onBack,
  onOpenSavedMessages,
}) => {
  const profile = useUserStore((state) => state.profile);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);
  const logout = useUserStore((state) => state.logout);
  const isUsernameTaken = useUserStore((state) => state.isUsernameTaken);

  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);

  const handleStartEdit = () => {
    setName(profile.name);
    setUsername(profile.username);
    setPhone(profile.phone);
    setBio(profile.bio);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (!isValidInternationalPhone(trimmedPhone)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid international phone number starting with + (e.g. +380 98 123 45 67).'
      );
      return;
    }

    const cleanUser = username.trim().replace(/^@/, '');
    if (cleanUser && cleanUser.toLowerCase() !== profile.username.toLowerCase()) {
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(cleanUser)) {
        Alert.alert(
          'Invalid Username',
          'Username must be between 3 and 32 characters and contain only letters, numbers, and underscores.'
        );
        return;
      }
      if (isUsernameTaken(cleanUser, profile.id)) {
        Alert.alert(
          'Username Taken',
          `The username @${cleanUser} is already in use. Please choose another username.`
        );
        return;
      }
    }

    updateProfile({
      name: trimmedName,
      username: cleanUser,
      phone: trimmedPhone,
      bio: bio.trim(),
    });

    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const handleChangePhoto = async () => {
    const result = await pickImageFromGallery();
    if (result && result.uri) {
      setAvatarUrl(result.uri);
      Alert.alert('Success', 'Profile photo updated!');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isEditing ? 'Edit Profile' : 'My Profile'}
        onBack={onBack}
        rightElement={
          isEditing ? (
            <Pressable onPress={handleSave} style={styles.doneButton} hitSlop={8}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : (
            <IconButton size={40} onPress={handleStartEdit}>
              <Pencil size={20} color={theme.colors.primary} />
            </IconButton>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              name={profile.name || 'User'}
              avatarUrl={profile.avatarUrl}
              size={100}
            />
            <Pressable
              style={styles.cameraBadge}
              onPress={handleChangePhoto}
              hitSlop={6}
            >
              <Camera size={18} color={theme.colors.white} />
            </Pressable>
          </View>

          {Boolean(profile.name) && (
            <Text style={styles.profileNameText}>{profile.name}</Text>
          )}
          <Text style={styles.profileStatusText}>online</Text>

          <Pressable style={styles.changePhotoButton} onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </Pressable>
        </View>

        {isEditing ? (
          <View style={styles.editSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="First and Last name"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                value={phone}
                onChangeText={(val) => {
                  const cleaned = val.replace(/[^\d+\s()-]/g, '');
                  setPhone(cleaned);
                }}
                placeholder="+380 98 123 45 67"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>USERNAME</Text>
              <View style={styles.usernameInputRow}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  value={username}
                  onChangeText={(val) => setUsername(val.replace(/^@/, ''))}
                  placeholder="username"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  style={[styles.textInput, styles.usernameInput]}
                />
              </View>
              <Text style={styles.inputHint}>
                You can choose a username on Telegram. People will be able to find
                you by this username without needing your phone number.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>BIO</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="A few words about yourself"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
                style={[styles.textInput, styles.bioInput]}
              />
              <Text style={styles.inputHint}>
                Any details such as age, occupation or city.
              </Text>
            </View>

            <View style={styles.saveButtonWrapper}>
              <CustomButton
                title="Save Changes"
                onPress={handleSave}
                variant="primary"
                style={styles.fullWidthButton}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>ACCOUNT</Text>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoValue,
                    !profile.phone && styles.emptyValueText,
                  ]}
                >
                  {profile.phone || 'None'}
                </Text>
                <Text style={styles.infoLabel}>Tap to change phone number</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoValue,
                    !profile.username && styles.emptyValueText,
                  ]}
                >
                  {profile.username ? `@${profile.username}` : 'None'}
                </Text>
                <Text style={styles.infoLabel}>Username</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoValue,
                    !profile.bio && styles.emptyValueText,
                  ]}
                >
                  {profile.bio || 'Add a few words about yourself'}
                </Text>
                <Text style={styles.infoLabel}>Bio</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardHeader}>SETTINGS & TOOLS</Text>

              <Pressable
                style={styles.menuRow}
                onPress={() => {
                  onBack();
                  if (onOpenSavedMessages) {
                    setTimeout(() => {
                      onOpenSavedMessages();
                    }, 120);
                  }
                }}
              >
                <View style={styles.menuIconWrapper}>
                  <Bookmark size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuRowTitle}>Saved Messages</Text>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuRow}
                onPress={() => Alert.alert('Notifications', 'Notification settings')}
              >
                <View style={styles.menuIconWrapper}>
                  <Bell size={20} color="#F59E0B" />
                </View>
                <Text style={styles.menuRowTitle}>Notifications and Sounds</Text>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={styles.menuRow}
                onPress={() => Alert.alert('Privacy', 'Privacy and security')}
              >
                <View style={styles.menuIconWrapper}>
                  <Shield size={20} color="#10B981" />
                </View>
                <Text style={styles.menuRowTitle}>Privacy and Security</Text>
                <ChevronRight size={18} color={theme.colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.editButtonWrapper}>
              <CustomButton
                title="Edit Profile"
                onPress={handleStartEdit}
                variant="secondary"
                style={styles.fullWidthButton}
              />

              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={18} color="#EF4444" style={styles.logoutIcon} />
                <Text style={styles.logoutText}>Log Out</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        visible={isLogoutModalVisible}
        title="Log Out"
        message="Are you sure you want to log out of Telegram? You will need to verify your phone number again."
        confirmText="Log Out"
        cancelText="Cancel"
        icon={<LogOut size={26} color="#EF4444" />}
        isDestructive
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          onBack();
          logout();
        }}
        onCancel={() => setIsLogoutModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F7',
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  doneText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changePhotoText: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  editSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  usernameInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 14,
  },
  atSymbol: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  usernameInput: {
    flex: 1,
    borderWidth: 0,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6,
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  saveButtonWrapper: {
    marginTop: 12,
  },
  card: {
    backgroundColor: theme.colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardHeader: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  infoRow: {
    paddingVertical: 8,
  },
  infoValue: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  emptyValueText: {
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
  profileNameText: {
    ...theme.typography.title,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 12,
  },
  profileStatusText: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  infoLabel: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuRowTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginVertical: 4,
  },
  editButtonWrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
  },
  logoutText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  logoutIcon: {
    marginRight: 8,
  },
  fullWidthButton: {
    width: '100%',
  },
});
