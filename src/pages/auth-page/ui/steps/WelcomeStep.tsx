import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Send, Zap, Shield, Cloud, Lock, Sparkles } from 'lucide-react-native';
import { CustomButton } from '../../../../shared/ui/custom-button';
import { theme } from '../../../../shared/config/theme';

export interface WelcomeStepProps {
  onStart: () => void;
  onDemoLogin: (demoId?: string) => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onStart,
  onDemoLogin,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
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
          <View style={[styles.featureIconBadge, styles.badgeFast]}>
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
          <View style={[styles.featureIconBadge, styles.badgeSecure]}>
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
          <View style={[styles.featureIconBadge, styles.badgeCloud]}>
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
          <View style={[styles.featureIconBadge, styles.badgeFree]}>
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

      <View style={styles.footer}>
        <CustomButton
          title="Start Messaging"
          onPress={onStart}
          style={styles.startButton}
        />

        <Pressable
          style={styles.demoButton}
          onPress={() => onDemoLogin('user-demo-alex')}
        >
          <Sparkles size={16} color={theme.colors.primary} style={styles.demoIcon} />
          <Text style={styles.demoButtonText}>Demo Account (Alex Romanov)</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  hero: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
    marginRight: 4,
    marginTop: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  appTagline: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  featuresList: {
    gap: 16,
    marginVertical: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeFast: {
    backgroundColor: 'rgba(0, 136, 204, 0.12)',
  },
  badgeSecure: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeCloud: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  badgeFree: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  featureDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontSize: 13,
  },
  footer: {
    gap: 12,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 136, 204, 0.08)',
  },
  demoIcon: {
    marginRight: 6,
  },
  demoButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
