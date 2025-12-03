import { Stack } from 'expo-router';
import { FavoritesProvider } from '../context/FavoritesContext';
import { AudioProvider } from '../context/AudioContext';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Add any pre-loading logic here (fonts, assets, etc.)
        // Simulate minimum loading time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add any other initialization logic here
        // For example: await Font.loadAsync({...})

      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide the splash screen when app is ready
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    // Show loading indicator while app is initializing
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DAA520" />
      </View>
    );
  }

  return (
    <AudioProvider>
      <FavoritesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="plans/index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </FavoritesProvider>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
