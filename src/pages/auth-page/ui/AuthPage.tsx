import React from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthFlow } from '../model/useAuthFlow';
import { WelcomeStep, PhoneStep, CodeStep, ProfileStep } from './steps';
import { CountryPickerModal } from './CountryPickerModal';
import { cleanPhoneDigits, isPhoneValid } from '../../../shared/lib/phone';
import { theme } from '../../../shared/config/theme';

export const AuthPage: React.FC = () => {
  const {
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
  } = useAuthFlow();

  const isPhoneValidNumber = isPhoneValid(
    cleanPhoneDigits(phoneNumber),
    selectedCountry.code
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step === 'welcome' && (
          <WelcomeStep
            onStart={() => setStep('phone')}
            onDemoLogin={handleDemoLogin}
          />
        )}

        {step === 'phone' && (
          <PhoneStep
            onBack={() => setStep('welcome')}
            selectedCountry={selectedCountry}
            onOpenCountryModal={() => setIsCountryModalOpen(true)}
            phoneNumber={phoneNumber}
            onPhoneChange={handlePhoneChange}
            syncContacts={syncContacts}
            onToggleSyncContacts={setSyncContacts}
            onSubmit={handlePhoneSubmit}
            isValid={isPhoneValidNumber}
          />
        )}

        {step === 'code' && (
          <CodeStep
            onBack={() => setStep('phone')}
            phoneText={`${selectedCountry.code} ${phoneNumber}`}
            existingUserName={existingAccount?.name}
            verificationCode={verificationCode}
            onCodeChange={handleCodeChange}
            onFillDemoCode={handleFillDemoCode}
            onSubmit={() => handleCodeSubmit(verificationCode)}
          />
        )}

        {step === 'profile' && (
          <ProfileStep
            onBack={() => setStep('code')}
            avatarUri={avatarUri}
            onPickAvatar={handlePickAvatar}
            firstName={firstName}
            onFirstNameChange={setFirstName}
            lastName={lastName}
            onLastNameChange={setLastName}
            username={username}
            onUsernameChange={setUsername}
            bio={bio}
            onBioChange={setBio}
            onSubmit={handleProfileSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={isCountryModalOpen}
        selectedCountry={selectedCountry}
        onSelect={handleSelectCountry}
        onClose={() => setIsCountryModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
});
