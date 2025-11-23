import { Tabs } from 'expo-router';
import { NavProvider } from '../../context/NavContext';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNav } from '../../context/NavContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function TabsWithBackground() {
  const { currentBgImage, bgFadeAnim } = useNav();

  return (
    <View style={styles.container}>
      {/* Persistent background image across all tabs */}
      <Animated.Image
        source={{ uri: currentBgImage }}
        style={[styles.backgroundImage, { opacity: bgFadeAnim }]}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen name="verses" options={{ title: 'Verses' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="bible" options={{ title: 'Bible' }} />
        <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="ChooseBook" options={{ title: 'Choose Book', href: null }} />
        <Tabs.Screen name="ChooseChapter" options={{ title: 'Choose Chapter', href: null }} />
        <Tabs.Screen name="ChooseVerse" options={{ title: 'Choose Verse', href: null }} />
      </Tabs>
    </View>
  );
}

export default function TabLayout() {
  return (
    <NavProvider>
      <TabsWithBackground />
    </NavProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
