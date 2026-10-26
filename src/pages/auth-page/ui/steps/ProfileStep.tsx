import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { Avatar } from '../../../../shared/ui/avatar';
import { CustomButton } from '../../../../shared/ui/custom-button';
import { theme } from '../../../../shared/config/theme';

export interface ProfileStepProps {
  onBack: () => void;
  avatarUri: string;
  onPickAvatar: () => void;
  firstName: string;
  onFirstNameChange: (text: string) => void;
  lastName: string;
  onLastNameChange: (text: string) => void;
  username: string;
  onUsernameChange: (text: string) => void;
  bio: string;
  onBioChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ProfileStep: React.FC<ProfileStepProps> = ({
  onBack,
  avatarUri,
  onPickAvatar,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  username,
  onUsernameChange,
  bio,
  onBioChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <ScrollView
      style={styles.stepScroll}
      contentContainerStyle={styles.stepContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.stepHeader}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={styles.stepTitleSection}>
        <Text style={styles.stepTitle}>Profile Info</Text>
        <Text style={styles.stepSubtitle}>
          Enter your name and add a profile photo.
        </Text>
      </View>

      <View style={styles.avatarPickerContainer}>
        <Pressable style={styles.avatarPicker} onPress={onPickAvatar}>
          <Avatar
            name={firstName || 'User'}
            avatarUrl={avatarUri}
            size={100}
          />
          <View style={styles.cameraIconBadge}>
            <Camera size={20} color={theme.colors.white} />
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Tap to choose photo</Text>
      </View>

      <View style={styles.inputCard}>
        <View style={styles.inputField}>
          <Text style={styles.fieldLabel}>First Name (required)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Alex"
            placeholderTextColor={theme.colors.textMuted}
            value={firstName}
            onChangeText={onFirstNameChange}
            autoFocus
          />
        </View>

        <View style={styles.inputDivider} />

        <View style={styles.inputField}>
          <Text style={styles.fieldLabel}>Last Name (optional)</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="e.g. Romanov"
            placeholderTextColor={theme.colors.textMuted}
            value={lastName}
            onChangeText={onLastNameChange}
          />
        </View>

        <View style={styles.inputDivider} />

        <View style={styles.inputField}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="@username"
            placeholderTextColor={theme.colors.textMuted}
            value={username}
            onChangeText={onUsernameChange}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputDivider} />

        <View style={styles.inputField}>
          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.fieldInput, styles.bioInput]}
            placeholder="A few words about you..."
            placeholderTextColor={theme.colors.textMuted}
            value={bio}
            onChangeText={onBioChange}
            multiline
          />
        </View>
      </View>

      <View style={styles.stepActionWrapper}>
        <CustomButton
          title={isSubmitting ? 'Registering...' : 'Complete Registration'}
          onPress={onSubmit}
          disabled={!firstName.trim() || isSubmitting}
          style={styles.stepActionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  stepScroll: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepHeader: {
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  avatarPickerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPicker: {
    position: 'relative',
    marginBottom: 8,
  },
  cameraIconBadge: {
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
  avatarHint: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    marginBottom: 32,
    overflow: 'hidden',
  },
  inputField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  bioInput: {
    height: 60,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    marginLeft: 16,
  },
  stepActionWrapper: {
    alignItems: 'center',
  },
  stepActionButton: {
    width: '100%',
  },
});
