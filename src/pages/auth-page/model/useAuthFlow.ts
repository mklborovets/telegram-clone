import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useUserStore, IUserProfile } from '../../../entities/user';
import { apiClient } from '../../../shared/api/apiClient';
import { pickImageFromGallery } from '../../../shared/lib/mediaPicker';
import {
  cleanPhoneDigits,
  formatPhoneByPattern,
  getExpectedPhoneLength,
  isPhoneValid,
} from '../../../shared/lib/phone';
import { COUNTRIES, CountryItem } from './countries';

export type AuthStep = 'welcome' | 'phone' | 'code' | 'profile';

export function useAuthFlow() {
  const login = useUserStore((state) => state.login);
  const registerAccount = useUserStore((state) => state.registerAccount);
  const findAccountByPhone = useUserStore((state) => state.findAccountByPhone);
  const isUsernameTaken = useUserStore((state) => state.isUsernameTaken);
  const loginAsDemo = useUserStore((state) => state.loginAsDemo);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullPhone = `${selectedCountry.code} ${phoneNumber.trim()}`.trim();
  const existingAccount = findAccountByPhone(fullPhone);

  const handlePickAvatar = useCallback(async () => {
    const picked = await pickImageFromGallery();
    if (picked && picked.uri) {
      setAvatarUri(picked.uri);
    }
  }, []);

  const handlePhoneChange = useCallback(
    (text: string) => {
      const rawDigits = cleanPhoneDigits(text);
      const { max } = getExpectedPhoneLength(selectedCountry.code);
      const clamped = rawDigits.slice(0, max);
      const formatted = formatPhoneByPattern(clamped, selectedCountry.format);
      setPhoneNumber(formatted);
    },
    [selectedCountry]
  );

  const handlePhoneSubmit = useCallback(() => {
    const digits = cleanPhoneDigits(phoneNumber);
    if (!isPhoneValid(digits, selectedCountry.code)) {
      const { min } = getExpectedPhoneLength(selectedCountry.code);
      Alert.alert(
        'Invalid Phone Number',
        `Please enter a valid phone number for ${selectedCountry.name} (${min} digits).`
      );
      return;
    }
    setStep('code');
  }, [phoneNumber, selectedCountry]);

  const handleCodeSubmit = useCallback(
    async (codeToVerify: string) => {
      if (codeToVerify.length < 5) {
        Alert.alert('Verification', 'Please enter the 5-digit code.');
        return;
      }
      const targetAccount = findAccountByPhone(fullPhone);
      if (targetAccount) {
        login(targetAccount);
        apiClient.auth(targetAccount).catch(() => {});
        return;
      }
      setStep('profile');
    },
    [findAccountByPhone, fullPhone, login]
  );

  const handleCodeChange = useCallback(
    (text: string) => {
      const clean = text.replace(/\D/g, '').slice(0, 5);
      setVerificationCode(clean);
      if (clean.length === 5) {
        setTimeout(() => {
          handleCodeSubmit(clean);
        }, 300);
      }
    },
    [handleCodeSubmit]
  );

  const handleFillDemoCode = useCallback(() => {
    setVerificationCode('12345');
    setTimeout(() => {
      handleCodeSubmit('12345');
    }, 300);
  }, [handleCodeSubmit]);

  const handleProfileSubmit = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    if (!trimmedFirst) {
      Alert.alert('Required Field', 'Please enter your first name.');
      return;
    }

    const cleanUser = username.replace(/^@/, '').trim();
    if (cleanUser) {
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(cleanUser)) {
        Alert.alert(
          'Invalid Username',
          'Username must be between 3 and 32 characters and contain only letters, numbers, and underscores.'
        );
        return;
      }
      if (isUsernameTaken(cleanUser)) {
        Alert.alert(
          'Username Taken',
          `The username @${cleanUser} is already in use. Please choose another username.`
        );
        return;
      }
    }

    const trimmedLast = lastName.trim();
    const fullName = trimmedLast ? `${trimmedFirst} ${trimmedLast}` : trimmedFirst;

    const newProfile: IUserProfile = {
      id: `user-${Date.now()}`,
      name: fullName,
      username: cleanUser,
      phone: fullPhone,
      bio: bio.trim(),
      avatarUrl: avatarUri,
    };

    setIsSubmitting(true);
    try {
      registerAccount(newProfile);
      await apiClient.auth(newProfile);
    } catch {
      registerAccount(newProfile);
    } finally {
      setIsSubmitting(false);
    }
  }, [avatarUri, bio, firstName, fullPhone, isUsernameTaken, lastName, registerAccount, username]);

  const handleDemoLogin = useCallback(
    async (demoId = 'user-demo-alex') => {
      loginAsDemo(demoId);
      const user = useUserStore.getState().profile;
      if (user && user.id) {
        apiClient.auth(user).catch(() => {});
      }
    },
    [loginAsDemo]
  );

  const handleSelectCountry = useCallback(
    (country: CountryItem) => {
      setSelectedCountry(country);
      setIsCountryModalOpen(false);
      const rawDigits = cleanPhoneDigits(phoneNumber);
      const { max } = getExpectedPhoneLength(country.code);
      const clamped = rawDigits.slice(0, max);
      const formatted = formatPhoneByPattern(clamped, country.format);
      setPhoneNumber(formatted);
    },
    [phoneNumber]
  );

  return {
    step,
    setStep,
    selectedCountry,
    isCountryModalOpen,
    setIsCountryModalOpen,
    phoneNumber,
    syncContacts,
    setSyncContacts,
    verificationCode,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    username,
    setUsername,
    bio,
    setBio,
    avatarUri,
    fullPhone,
    existingAccount,
    isSubmitting,
    handlePickAvatar,
    handlePhoneChange,
    handlePhoneSubmit,
    handleCodeChange,
    handleCodeSubmit,
    handleFillDemoCode,
    handleProfileSubmit,
    handleDemoLogin,
    handleSelectCountry,
  };
}
