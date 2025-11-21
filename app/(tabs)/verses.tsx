import { View, Text, StyleSheet, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Verses() {
  const [showTabs, setShowTabs] = useState(false);
  const [isTabsVisible, setIsTabsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(100)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const toggleTabs = () => {
    if (showTabs) {
      // Hide tabs - slide top to bottom (0.5s)
      setShowTabs(false);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setIsTabsVisible(false));
    } else {
      // Show tabs - slide bottom to top (0.5s)
      setShowTabs(true);
      setIsTabsVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/onboarding/onboarding-bg2.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        {/* Verse Display */}
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>
            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
          </Text>
          <Text style={styles.verseReference}>Jeremiah 29:11</Text>
        </View>

        {/* Bottom Navigation */}
        {isTabsVisible && (
          <Animated.View
            style={[
              styles.tabBar,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity style={styles.tabItem}>
              <Ionicons name="book-outline" size={24} color="#1A1A1A" />
              <Text style={styles.tabLabel}>Verses</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Ionicons name="search-outline" size={24} color="#1A1A1A" />
              <Text style={styles.tabLabel}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Ionicons name="book" size={24} color="#1A1A1A" />
              <Text style={styles.tabLabel}>Bible</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Ionicons name="heart-outline" size={24} color="#1A1A1A" />
              <Text style={styles.tabLabel}>Favorites</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Ionicons name="person-outline" size={24} color="#1A1A1A" />
              <Text style={styles.tabLabel}>Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Cross Button - animates with nav */}
        <Animated.View
          style={[
            styles.crossButtonContainer,
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
          <TouchableOpacity style={styles.crossButton} onPress={toggleTabs}>
            <Ionicons name={showTabs ? "close" : "add"} size={32} color="#1A1A1A" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 120,
  },
  verseContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  verseText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5A5A5A',
    textAlign: 'center',
    letterSpacing: 1,
  },
  crossButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 40,
  },
  crossButton: {
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
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingBottom: 30,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: '#1A1A1A',
    marginTop: 4,
    letterSpacing: 0.5,
  },
});
