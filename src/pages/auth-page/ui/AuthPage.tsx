import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  ArrowLeft,
  ChevronDown,
  Camera,
  Zap,
  Shield,
  Cloud,
  Lock,
  Sparkles,
  Phone,
} from 'lucide-react-native';
import { useUserStore, IUserProfile } from '../../../entities/user';
import { Avatar } from '../../../shared/ui/avatar';
import { CustomButton } from '../../../shared/ui/custom-button';
import { pickImageFromGallery } from '../../../shared/lib/mediaPicker';
import { theme } from '../../../shared/config/theme';
import { COUNTRIES, CountryItem } from '../model/countries';
import { CountryPickerModal } from './CountryPickerModal';

type AuthStep = 'welcome' | 'phone' | 'code' | 'profile';

export const AuthPage: React.FC = () => {
  const login = useUserStore((state) => state.login);

  const [step, setStep] = useState<AuthStep>('welcome');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [syncContacts, setSyncContacts] = useState(true);

  const [verificationCode, setVerificationCode] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState('');

  const handlePickAvatar = async () => {
    const picked = await pickImageFromGallery();
    if (picked && picked.uri) {
      setAvatarUri(picked.uri);
    }
  };

  const handleQuickDemoSignIn = () => {
    login({
      id: 'user-me',
      name: 'Alex Romanov',
      username: 'alex_rn',
      phone: '+380 98 123 45 67',
      bio: 'Mobile architect & open source contributor',
      avatarUrl: '',
    });
  };

  const handlePhoneSubmit = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 5) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setStep('code');
  };

  const handleCodeChange = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 5);
    setVerificationCode(clean);
    if (clean.length === 5) {
      setTimeout(() => {
        setStep('profile');
      }, 300);
    }
  };

  const handleFillDemoCode = () => {
    setVerificationCode('12345');
    setTimeout(() => {
      setStep('profile');
    }, 300);
  };

  const handleProfileSubmit = () => {
    const trimmedFirst = firstName.trim();
    if (!trimmedFirst) {
      Alert.alert('Required Field', 'Please enter your first name.');
      return;
    }

    const trimmedLast = lastName.trim();
    const fullName = trimmedLast ? `${trimmedFirst} ${trimmedLast}` : trimmedFirst;
    const cleanUser = username.replace('@', '').trim() || trimmedFirst.toLowerCase().replace(/\s+/g, '_');
    const fullPhone = `${selectedCountry.code} ${phoneNumber.trim()}`;

    const newProfile: IUserProfile = {
      id: `user-${Date.now()}`,
      name: fullName,
      username: cleanUser,
      phone: fullPhone || '+380 98 123 45 67',
      bio: bio.trim() || 'Hey there! I am using Telegram.',
      avatarUrl: avatarUri,
    };

    login(newProfile);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step === 'welcome' && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeHero}>
              <View style={styles.logoCircle}>
                <View style={styles.logoPlane}>
                  <Send size={44} color={theme.colors.white} />
                </View>
              </View>

              <Text style={styles.appName}>Telegram</Text>
              <Text style={styles.appTagline}>
                The world's fastest messaging app.{'\n'}It is free and secure.
              </Text>
            </View>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBadge, { backgroundColor: 'rgba(0, 136, 204, 0.12)' }]}>
                  <Zap size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Fast</Text>
                  <Text style={styles.featureDesc}>
                    Telegram delivers messages faster than any other app.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Shield size={20} color="#10B981" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Secure</Text>
                  <Text style={styles.featureDesc}>
                    Telegram keeps your messages safe from hacker attacks.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBadge, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                  <Cloud size={20} color="#8B5CF6" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Cloud-Based</Text>
                  <Text style={styles.featureDesc}>
                    Seamless synchronization across all your active devices.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Lock size={20} color="#F59E0B" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Free & Private</Text>
                  <Text style={styles.featureDesc}>
                    No ads, no subscriptions, forever free with high privacy.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.welcomeFooter}>
              <CustomButton
                title="Start Messaging"
                onPress={() => setStep('phone')}
                style={styles.startButton}
              />

              <Pressable
                style={styles.demoButton}
                onPress={handleQuickDemoSignIn}
              >
                <Sparkles size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.demoButtonText}>Quick Demo Sign In</Text>
              </Pressable>
            </View>
          </View>
        )}

        {step === 'phone' && (
          <ScrollView
            style={styles.stepScroll}
            contentContainerStyle={styles.stepContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepHeader}>
              <Pressable style={styles.backBtn} onPress={() => setStep('welcome')}>
                <ArrowLeft size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.stepTitleSection}>
              <View style={styles.stepBadge}>
                <Phone size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.stepTitle}>Your Phone</Text>
              <Text style={styles.stepSubtitle}>
                Please confirm your country code and enter your phone number.
              </Text>
            </View>

            <Pressable
              style={styles.countrySelector}
              onPress={() => setIsCountryModalOpen(true)}
            >
              <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryName}>{selectedCountry.name}</Text>
              <Text style={styles.countryCodeBadge}>{selectedCountry.code}</Text>
              <ChevronDown size={18} color={theme.colors.textMuted} />
            </Pressable>

            <View style={styles.phoneInputRow}>
              <View style={styles.codePrefixBox}>
                <Text style={styles.codePrefixText}>{selectedCountry.code}</Text>
              </View>
              <TextInput
                style={styles.phoneNumberInput}
                placeholder="-- --- ----"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                autoFocus
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Sync Contacts</Text>
                <Text style={styles.switchDesc}>
                  Automatically add friends from your phonebook
                </Text>
              </View>
              <Switch
                value={syncContacts}
                onValueChange={setSyncContacts}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.stepActionWrapper}>
              <CustomButton
                title="Continue"
                onPress={handlePhoneSubmit}
                disabled={phoneNumber.replace(/\D/g, '').length < 5}
                style={styles.stepActionButton}
              />
            </View>
          </ScrollView>
        )}

        {step === 'code' && (
          <ScrollView
            style={styles.stepScroll}
            contentContainerStyle={styles.stepContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepHeader}>
              <Pressable style={styles.backBtn} onPress={() => setStep('phone')}>
                <ArrowLeft size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.stepTitleSection}>
              <Text style={styles.stepTitle}>Verification Code</Text>
              <Text style={styles.stepSubtitle}>
                We've sent an SMS with an activation code to your phone:
              </Text>
              <Text style={styles.highlightPhone}>
                {selectedCountry.code} {phoneNumber}
              </Text>
            </View>

            <View style={styles.pinBoxesContainer}>
              {[0, 1, 2, 3, 4].map((index) => {
                const char = verificationCode[index] || '';
                const isCurrent = verificationCode.length === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinBox,
                      isCurrent && styles.pinBoxCurrent,
                      Boolean(char) && styles.pinBoxFilled,
                    ]}
                  >
                    <Text style={styles.pinChar}>{char}</Text>
                  </View>
                );
              })}
            </View>

            <TextInput
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={5}
              value={verificationCode}
              onChangeText={handleCodeChange}
              autoFocus
            />

            <Pressable
              style={styles.demoFillCodeButton}
              onPress={handleFillDemoCode}
            >
              <Sparkles size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.demoFillCodeText}>
                Demo code: 12345 (Tap to fill)
              </Text>
            </Pressable>

            <View style={styles.stepActionWrapper}>
              <CustomButton
                title="Next"
                onPress={() => {
                  if (verificationCode.length === 5) {
                    setStep('profile');
                  } else {
                    Alert.alert('Verification', 'Please enter the 5-digit code.');
                  }
                }}
                disabled={verificationCode.length < 5}
                style={styles.stepActionButton}
              />
            </View>
          </ScrollView>
        )}

        {step === 'profile' && (
          <ScrollView
            style={styles.stepScroll}
            contentContainerStyle={styles.stepContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepHeader}>
              <Pressable style={styles.backBtn} onPress={() => setStep('code')}>
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
              <Pressable style={styles.avatarPicker} onPress={handlePickAvatar}>
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
                  onChangeText={setFirstName}
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
                  onChangeText={setLastName}
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
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputDivider} />

              <View style={styles.inputField}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 60 }]}
                  placeholder="A few words about you..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                />
              </View>
            </View>

            <View style={styles.stepActionWrapper}>
              <CustomButton
                title="Complete Registration"
                onPress={handleProfileSubmit}
                disabled={!firstName.trim()}
                style={styles.stepActionButton}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={isCountryModalOpen}
        selectedCountry={selectedCountry}
        onSelect={(country) => {
          setSelectedCountry(country);
          setIsCountryModalOpen(false);
        }}
        onClose={() => setIsCountryModalOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  welcomeHero: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoPlane: {
    transform: [{ translateX: -3 }, { translateY: -2 }],
  },
  appName: {
    ...theme.typography.title,
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  appTagline: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresList: {
    marginVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  welcomeFooter: {
    width: '100%',
    paddingBottom: 8,
  },
  startButton: {
    width: '100%',
    marginBottom: 10,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  demoButtonText: {
    ...theme.typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  stepScroll: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepHeader: {
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitleSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  stepBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    ...theme.typography.title,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  highlightPhone: {
    ...theme.typography.title,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 6,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  countryName: {
    flex: 1,
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  countryCodeBadge: {
    ...theme.typography.caption,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  codePrefixBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codePrefixText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  phoneNumberInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.typography.body,
    fontSize: 17,
    color: theme.colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  switchDesc: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 24,
  },
  pinBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxCurrent: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  pinBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 136, 204, 0.05)',
  },
  pinChar: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0.01,
    width: 1,
    height: 1,
  },
  demoFillCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 136, 204, 0.08)',
    borderRadius: 10,
    marginBottom: 24,
  },
  demoFillCodeText: {
    ...theme.typography.caption,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  avatarPickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPicker: {
    position: 'relative',
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
    fontSize: 13,
    color: theme.colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  inputCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  inputField: {
    paddingVertical: 10,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldInput: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 4,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  stepActionWrapper: {
    width: '100%',
  },
  stepActionButton: {
    width: '100%',
  },
});
