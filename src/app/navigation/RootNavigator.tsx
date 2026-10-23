import React from 'react';
import { useUserStore } from '../../entities/user';
import { AuthPage } from '../../pages/auth-page';
import { MainNavigator } from './MainNavigator';

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <MainNavigator />;
};
