import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useRef, useEffect } from 'react';
import { useNav } from '../context/NavContext';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isNavVisible, toggleNav } = useNav();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isNavVisible ? 0 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: isNavVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isNavVisible]);

  const tabs = [
    { name: 'Verses', route: '/(tabs)/verses', icon: 'book-outline' as const },
    { name: 'Search', route: '/(tabs)/search', icon: 'search-outline' as const },
    { name: 'Bible', route: '/(tabs)/bible', icon: 'book' as const },
    { name: 'Favorites', route: '/(tabs)/favorites', icon: 'heart-outline' as const },
    { name: 'Profile', route: '/(tabs)/profile', icon: 'person-outline' as const },
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <Animated.View style={[styles.tabBar, { transform: [{ translateY: slideAnim }] }]}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.route || pathname === tab.route.replace('/(tabs)', '');
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
            >
              <Ionicons
                name={tab.icon}
                size={24}
                color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Toggle Button */}
      <Animated.View
        style={[
          styles.toggleButtonContainer,
          {
            transform: [{
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -60]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity style={styles.toggleButton} onPress={toggleNav}>
          <Ionicons name={isNavVisible ? "close" : "add"} size={32} color="#1A1A1A" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    paddingVertical: 12,
    paddingBottom: 30,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  toggleButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 40,
  },
  toggleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
