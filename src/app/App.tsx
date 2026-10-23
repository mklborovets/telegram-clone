import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureProvider } from './providers/GestureProvider';
import { RootNavigator } from './navigation/RootNavigator';
import { useSocketSync } from '../shared/lib/socket';
import { theme } from '../shared/config/theme';

export const App: React.FC = () => {
  useSocketSync();

  return (
    <GestureProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <RootNavigator />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
});

export default App;
