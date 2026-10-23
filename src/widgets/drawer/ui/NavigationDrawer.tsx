import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Switch,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  User,
  Folder,
  Bookmark,
  Settings,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/avatar';
import { ConfirmModal } from '../../../shared/ui/confirm-modal';
import { theme } from '../../../shared/config/theme';
import { useUserStore } from '../../../entities/user';

export interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFolderManager: () => void;
  onOpenSavedMessages: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenFolderManager,
  onOpenSavedMessages,
  onOpenProfile,
  onOpenSettings,
}) => {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.82, 320);

  const profile = useUserStore((state) => state.profile);
  const logout = useUserStore((state) => state.logout);

  const [visible, setVisible] = useState(isOpen);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const translateX = useSharedValue(-drawerWidth);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      translateX.value = withSpring(0, {
        damping: 28,
        stiffness: 240,
        overshootClamping: true,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateX.value = withTiming(-drawerWidth, { duration: 240 }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
        }
      });
    }
  }, [isOpen, drawerWidth]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawerContent,
          { width: drawerWidth },
          animatedDrawerStyle,
        ]}
      >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Avatar
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                size={64}
                isOnline
              />
              <Pressable
                style={styles.themeToggle}
                onPress={() => setIsDarkMode(!isDarkMode)}
              >
                <Moon size={22} color={theme.colors.white} />
              </Pressable>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {profile.name || 'Telegram User'}
              </Text>
              {Boolean(profile.phone) && (
                <Text style={styles.userPhone}>{profile.phone}</Text>
              )}
              {Boolean(profile.username) && (
                <Text style={styles.userHandle}>@{profile.username}</Text>
              )}
            </View>
          </View>

          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onOpenProfile) onOpenProfile();
              }}
            >
              <View style={styles.menuItemIcon}>
                <User size={22} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.menuItemTitle}>My Profile</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenFolderManager();
              }}
            >
              <View style={styles.menuItemIcon}>
                <Folder size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuItemTitle}>Chat Folders</Text>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenSavedMessages();
              }}
            >
              <View style={styles.menuItemIcon}>
                <Bookmark size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuItemTitle}>Saved Messages</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onClose();
                if (onOpenSettings) onOpenSettings();
              }}
            >
              <View style={styles.menuItemIcon}>
                <Settings size={22} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.menuItemTitle}>Settings</Text>
            </Pressable>

            <View style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <Moon size={22} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.menuItemTitle}>Night Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <Pressable style={styles.menuItem} onPress={onClose}>
              <View style={styles.menuItemIcon}>
                <Shield size={22} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.menuItemTitle}>Privacy and Security</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={onClose}>
              <View style={styles.menuItemIcon}>
                <HelpCircle size={22} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.menuItemTitle}>Telegram Features</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemIcon}>
                <LogOut size={22} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemTitle, { color: '#EF4444' }]}>Log Out</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerVersion}>Telegram Clone v2.4.0</Text>
            <Text style={styles.footerCredits}>Built with React Native & FSD</Text>
          </View>
        </Animated.View>

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
            onClose();
            logout();
          }}
          onCancel={() => setIsLogoutModalVisible(false)}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  drawerContent: {
    height: '100%',
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  userInfo: {
    marginTop: 4,
  },
  userName: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  userPhone: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '400',
  },
  userHandle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  menuItemIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTitle: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 8,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    alignItems: 'center',
  },
  footerVersion: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  footerCredits: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
