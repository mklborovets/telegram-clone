import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../../../shared/lib/storage';
import { IUserProfile } from './types';

interface UserState {
  profile: IUserProfile;
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
