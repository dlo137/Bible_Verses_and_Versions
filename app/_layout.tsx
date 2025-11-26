import { Stack } from 'expo-router';
import { FavoritesProvider } from '../context/FavoritesContext';
import { AudioProvider } from '../context/AudioContext';

export default function RootLayout() {
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
