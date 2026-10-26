import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { CustomButton } from '../../../../shared/ui/custom-button';
import { theme } from '../../../../shared/config/theme';

export interface CodeStepProps {
  onBack: () => void;
  phoneText: string;
  existingUserName?: string;
  verificationCode: string;
  onCodeChange: (text: string) => void;
  onFillDemoCode: () => void;
  onSubmit: () => void;
}

export const CodeStep: React.FC<CodeStepProps> = ({
  onBack,
  phoneText,
  existingUserName,
  verificationCode,
  onCodeChange,
  onFillDemoCode,
  onSubmit,
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
        <Text style={styles.stepTitle}>Verification Code</Text>
        <Text style={styles.stepSubtitle}>
          {existingUserName
            ? `Welcome back, ${existingUserName}!`
            : "We've sent an SMS with an activation code to your phone:"}
        </Text>
        <Text style={styles.highlightPhone}>{phoneText}</Text>
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
        onChangeText={onCodeChange}
        autoFocus
      />

      <Pressable style={styles.demoFillCodeButton} onPress={onFillDemoCode}>
        <Sparkles size={16} color={theme.colors.primary} style={styles.demoCodeIcon} />
        <Text style={styles.demoFillCodeText}>
          Demo code: 12345 (Tap to fill)
        </Text>
      </Pressable>

      <View style={styles.stepActionWrapper}>
        <CustomButton
          title="Next"
          onPress={onSubmit}
          disabled={verificationCode.length < 5}
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
  highlightPhone: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 6,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  pinBox: {
    width: 52,
    height: 60,
    borderRadius: 14,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.divider,
  },
  pinBoxCurrent: {
    borderColor: theme.colors.primary,
  },
  pinBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 136, 204, 0.04)',
  },
  pinChar: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
  },
  demoFillCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 136, 204, 0.08)',
    alignSelf: 'center',
    marginBottom: 32,
  },
  demoCodeIcon: {
    marginRight: 6,
  },
  demoFillCodeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  stepActionWrapper: {
    alignItems: 'center',
  },
  stepActionButton: {
    width: '100%',
  },
});
