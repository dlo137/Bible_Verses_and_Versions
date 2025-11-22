import { Tabs } from 'expo-router';
import { NavProvider } from '../../context/NavContext';

export default function TabLayout() {
  return (
    <NavProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tabs.Screen name="verses" options={{ title: 'Verses' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="bible" options={{ title: 'Bible' }} />
        <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </NavProvider>
  );
}
