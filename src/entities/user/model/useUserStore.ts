import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../../../shared/lib/storage';
import { IUserProfile } from './types';

export interface UserState {
  profile: IUserProfile;
  isAuthenticated: boolean;
  login: (profile?: Partial<IUserProfile>) => void;
  logout: () => void;
  updateProfile: (data: Partial<IUserProfile>) => void;
  setAvatarUrl: (url: string) => void;
}

const defaultProfile: IUserProfile = {
  id: 'user-me',
  name: 'Alex Romanov',
  username: 'alex_rn',
  phone: '+380 98 123 45 67',
  bio: 'Mobile architect & open source contributor',
  avatarUrl: '',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      isAuthenticated: false,

      login: (newProfile) =>
        set((state) => ({
          isAuthenticated: true,
          profile: newProfile
            ? {
                ...state.profile,
                ...newProfile,
              }
            : state.profile,
        })),

      logout: () =>
        set({
          isAuthenticated: false,
        }),

      updateProfile: (data) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...data,
          },
        })),

      setAvatarUrl: (url) =>
        set((state) => ({
          profile: {
            ...state.profile,
            avatarUrl: url,
          },
        })),
    }),
    {
      name: 'tg_user_profile',
      storage: createJSONStorage(() => safeAsyncStorage),
    }
  )
);
