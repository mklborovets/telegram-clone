import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { ArrowLeft, ChevronDown, Phone } from 'lucide-react-native';
import { CustomButton } from '../../../../shared/ui/custom-button';
import { theme } from '../../../../shared/config/theme';
import { CountryItem } from '../../model/countries';

export interface PhoneStepProps {
  onBack: () => void;
  selectedCountry: CountryItem;
  onOpenCountryModal: () => void;
  phoneNumber: string;
  onPhoneChange: (text: string) => void;
  syncContacts: boolean;
  onToggleSyncContacts: (val: boolean) => void;
  onSubmit: () => void;
  isValid: boolean;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({
  onBack,
  selectedCountry,
  onOpenCountryModal,
  phoneNumber,
  onPhoneChange,
  syncContacts,
  onToggleSyncContacts,
  onSubmit,
  isValid,
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
        <View style={styles.stepBadge}>
          <Phone size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.stepTitle}>Your Phone</Text>
        <Text style={styles.stepSubtitle}>
          Please confirm your country code and enter your phone number.
        </Text>
      </View>

      <Pressable style={styles.countrySelector} onPress={onOpenCountryModal}>
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
          placeholder={selectedCountry.format.replace(/#/g, '-')}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={onPhoneChange}
          maxLength={selectedCountry.format.length + 2}
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
          onValueChange={onToggleSyncContacts}
          trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
          thumbColor={theme.colors.white}
        />
      </View>

      <View style={styles.stepActionWrapper}>
        <CustomButton
          title="Continue"
          onPress={onSubmit}
          disabled={!isValid}
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
    marginBottom: 32,
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
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  countryCodeBadge: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  codePrefixBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  codePrefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  phoneNumberInput: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  switchDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  stepActionWrapper: {
    alignItems: 'center',
  },
  stepActionButton: {
    width: '100%',
  },
});
