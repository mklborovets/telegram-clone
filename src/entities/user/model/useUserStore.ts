import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../../../shared/lib/storage';
import { cleanPhoneDigits } from '../../../shared/lib/phone';
import { IUserProfile } from './types';

export const DEMO_ACCOUNTS: IUserProfile[] = [
  {
    id: 'user-demo-alex',
    name: 'Alex Romanov',
    username: 'alex_rn',
    phone: '+380 98 123 45 67',
    bio: 'Mobile architect & open source contributor',
    avatarUrl: '',
  },
  {
    id: 'user-demo-sarah',
    name: 'Sarah Jenkins',
    username: 's_jenkins',
    phone: '+380 50 987 65 43',
    bio: 'Product Designer @ Telegram Team',
    avatarUrl: '',
  },
  {
    id: 'user-demo-elena',
    name: 'Elena Rostova',
    username: 'elena_r',
    phone: '+380 50 111 22 33',
    bio: 'Frontend engineer & open source enthusiast',
    avatarUrl: '',
  },
  {
    id: 'user-demo-michael',
    name: 'Michael Chen',
    username: 'mchen_dev',
    phone: '+1 415 890 12 34',
    bio: 'Backend & Infrastructure Engineer @ TechCorp',
    avatarUrl: '',
  },
  {
    id: 'user-demo-durov',
    name: 'Pavel Durov',
    username: 'durov',
    phone: '+971 50 123 45 67',
    bio: 'Building Telegram & TON',
    avatarUrl: '',
  },
];

export const RESERVED_USERNAMES = [
  'telegram',
  'admin',
  'support',
  'service',
  'durov',
  'channel',
  'group',
  'help',
];

export interface UserState {
  profile: IUserProfile;
  isAuthenticated: boolean;
  accounts: IUserProfile[];
  login: (profile?: Partial<IUserProfile>) => void;
  logout: () => void;
  updateProfile: (data: Partial<IUserProfile>) => void;
  setAvatarUrl: (url: string) => void;
  findAccountByPhone: (phone: string) => IUserProfile | undefined;
  isUsernameTaken: (username: string, excludeUserId?: string) => boolean;
  registerAccount: (profile: IUserProfile) => void;
  loginAsDemo: (demoId?: string) => void;
}

export const emptyProfile: IUserProfile = {
  id: '',
  name: '',
  username: '',
  phone: '',
  bio: '',
  avatarUrl: '',
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: emptyProfile,
      isAuthenticated: false,
      accounts: DEMO_ACCOUNTS,

      findAccountByPhone: (phone: string) => {
        const cleanTarget = cleanPhoneDigits(phone);
        if (!cleanTarget) return undefined;
        return get().accounts.find(
          (acc) => cleanPhoneDigits(acc.phone) === cleanTarget
        );
      },

      isUsernameTaken: (username: string, excludeUserId?: string) => {
        const clean = username.replace(/^@/, '').trim().toLowerCase();
        if (!clean) return false;
        if (RESERVED_USERNAMES.includes(clean)) {
          return true;
        }
        return get().accounts.some(
          (acc) =>
            acc.id !== excludeUserId &&
            (acc.username || '').replace(/^@/, '').trim().toLowerCase() === clean
        );
      },

      registerAccount: (newProfile: IUserProfile) => {
        set((state) => {
          const cleanPhone = cleanPhoneDigits(newProfile.phone);
          const filtered = state.accounts.filter(
            (acc) => cleanPhoneDigits(acc.phone) !== cleanPhone && acc.id !== newProfile.id
          );
          return {
            accounts: [...filtered, newProfile],
            profile: newProfile,
            isAuthenticated: true,
          };
        });
      },

      loginAsDemo: (demoId = 'user-demo-alex') => {
        const demoUser =
          DEMO_ACCOUNTS.find((a) => a.id === demoId) || DEMO_ACCOUNTS[0];
        set({
          profile: demoUser,
          isAuthenticated: true,
        });
      },

      login: (newProfile) =>
        set((state) => {
          const profileToSet = newProfile
            ? { ...emptyProfile, ...newProfile }
            : emptyProfile;
          const cleanPhone = cleanPhoneDigits(profileToSet.phone);
          const existingIdx = state.accounts.findIndex(
            (a) => cleanPhoneDigits(a.phone) === cleanPhone
          );
          const updatedAccounts =
            existingIdx >= 0
              ? state.accounts.map((a, idx) =>
                  idx === existingIdx ? profileToSet : a
                )
              : cleanPhone
              ? [...state.accounts, profileToSet]
              : state.accounts;

          return {
            isAuthenticated: true,
            profile: profileToSet,
            accounts: updatedAccounts,
          };
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          profile: emptyProfile,
        }),

      updateProfile: (data) =>
        set((state) => {
          const nextProfile = {
            ...state.profile,
            ...data,
          };
          const cleanPhone = cleanPhoneDigits(nextProfile.phone);
          const updatedAccounts = state.accounts.map((acc) =>
            cleanPhoneDigits(acc.phone) === cleanPhone || acc.id === nextProfile.id
              ? nextProfile
              : acc
          );
          return {
            profile: nextProfile,
            accounts: updatedAccounts,
          };
        }),

      setAvatarUrl: (url) =>
        set((state) => {
          const nextProfile = {
            ...state.profile,
            avatarUrl: url,
          };
          const cleanPhone = cleanPhoneDigits(nextProfile.phone);
          const updatedAccounts = state.accounts.map((acc) =>
            cleanPhoneDigits(acc.phone) === cleanPhone || acc.id === nextProfile.id
              ? nextProfile
              : acc
          );
          return {
            profile: nextProfile,
            accounts: updatedAccounts,
          };
        }),
    }),
    {
      name: 'tg_user_profile',
      version: 5,
      storage: createJSONStorage(() => safeAsyncStorage),
      migrate: (persistedState: any, _version: number) => {
        const existingAccounts = Array.isArray(persistedState?.accounts)
          ? persistedState.accounts
          : DEMO_ACCOUNTS;

        const mergedAccounts = [...DEMO_ACCOUNTS];
        for (const acc of existingAccounts) {
          if (
            !mergedAccounts.some(
              (m) =>
                m.id === acc.id ||
                (Boolean(acc.phone) && cleanPhoneDigits(m.phone) === cleanPhoneDigits(acc.phone))
            )
          ) {
            mergedAccounts.push(acc);
          }
        }

        return {
          ...persistedState,
          accounts: mergedAccounts,
          profile: persistedState?.profile || emptyProfile,
          isAuthenticated: Boolean(persistedState?.isAuthenticated),
        };
      },
    }
  )
);
