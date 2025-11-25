import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Plans() {
  const router = useRouter();

  // Cathedral music state
  const [cathedralSongs, setCathedralSongs] = useState<{ name: string; url: string }[]>([]);
  const [currentCathedralIndex, setCurrentCathedralIndex] = useState(0);
  const [cathedralUrl, setCathedralUrl] = useState('');
  const cathedralPlayer = useAudioPlayer(cathedralUrl);

  // Load cathedral music from AsyncStorage on mount
  useEffect(() => {
    loadCathedralMusic();
  }, []);

  const loadCathedralMusic = async () => {
    try {
      const cathedralData = await AsyncStorage.getItem('cathedralMusic');
      if (cathedralData) {
        const { songs, currentIndex } = JSON.parse(cathedralData);
        console.log('Continuing cathedral music on plans screen:', songs);

        setCathedralSongs(songs);
        setCurrentCathedralIndex(currentIndex);
        setCathedralUrl(songs[currentIndex].url);
      }
    } catch (error) {
      console.error('Error loading cathedral music on plans screen:', error);
    }
  };

  // Auto-play when cathedral URL is set
  useEffect(() => {
    if (cathedralUrl && cathedralPlayer) {
      setTimeout(() => {
        cathedralPlayer.play();
      }, 100);
    }
  }, [cathedralUrl, cathedralPlayer]);

  // Listen for song end and play next song
  useEffect(() => {
    if (!cathedralPlayer) return;

    const checkPlaybackStatus = setInterval(() => {
      if (cathedralPlayer.playing === false && cathedralPlayer.duration > 0 &&
          Math.abs(cathedralPlayer.currentTime - cathedralPlayer.duration) < 1) {
        playNextCathedralSong();
      }
    }, 1000);

    return () => clearInterval(checkPlaybackStatus);
  }, [cathedralPlayer, currentCathedralIndex, cathedralSongs]);

  const playNextCathedralSong = () => {
    if (cathedralSongs.length === 0) return;

    const nextIndex = currentCathedralIndex < cathedralSongs.length - 1
      ? currentCathedralIndex + 1
      : 0;

    setCurrentCathedralIndex(nextIndex);
    setCathedralUrl(cathedralSongs[nextIndex].url);
  };

  const handlePurchase = async () => {
    // Save cathedral music state before navigating
    if (cathedralSongs.length > 0) {
      // Stop the player before navigating
      if (cathedralPlayer) {
        try {
          cathedralPlayer.pause();
        } catch (error) {
          console.log('Error pausing cathedral player:', error);
        }
      }

      await AsyncStorage.setItem('cathedralMusic', JSON.stringify({
        songs: cathedralSongs,
        currentIndex: currentCathedralIndex,
      }));
    }

    // Navigate to main app after purchase
    router.push('/(tabs)/verses');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/onboarding/onboarding-bg2.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Title */}
          <Text style={styles.appTitle}>Bible for Beginners</Text>
          <Text style={styles.subtitle}>We'll remind you before your trial ends</Text>

          {/* Timeline Section */}
          <View style={styles.timelineContainer}>

            {/* Today */}
            <View style={styles.timelineItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-open-outline" size={18} color="#1A1A1A" />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.timelineTitle}>Today</Text>
                <Text style={styles.timelineDesc}>
                  Unlock full access to Bible for{'\n'}Beginners and start your journey.
                </Text>
              </View>
            </View>

            {/* In 2 Days */}
            <View style={styles.timelineItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={18} color="#1A1A1A" />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.timelineTitle}>In 2 Days</Text>
                <Text style={styles.timelineDesc}>
                  We'll send a reminder before your{'\n'}trial ends.
                </Text>
              </View>
            </View>

            {/* In 3 Days */}
            <View style={styles.timelineItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="cash-outline" size={18} color="#1A1A1A" />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.timelineTitle}>In 3 Days</Text>
                <Text style={styles.timelineDescWhite}>
                  Your subscription will begin unless{'\n'}you cancel before.
                </Text>
              </View>
            </View>

          </View>

          {/* Pricing Card */}
          <View style={styles.card}>
            <View style={styles.freeTrialBadge}>
              <Text style={styles.freeTrialText}>FREE TRIAL</Text>
            </View>
            <View style={styles.planRow}>
              <View style={styles.selectedCircle}>
                <View style={styles.selectedCircleInner} />
              </View>
              <View style={styles.planLeftColumn}>
                <Text style={styles.planTitle}>Try It Free</Text>
              </View>
              <Text style={styles.planPrice}>$9.99/month</Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Bottom Text */}
          <Text style={styles.cancelText}>No commitment. Cancel anytime.</Text>

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaButton} onPress={handlePurchase}>
            <Text style={styles.ctaButtonText}>Try for FREE</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topSection: {
    width: '100%',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 75,
    marginBottom: 6,
  },
  subtitle: {
    color: '#5A5A5A',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 40,
  },
  timelineContainer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
    width: '100%',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flexShrink: 1,
  },
  timelineTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineDesc: {
    color: '#5A5A5A',
    fontSize: 14,
    lineHeight: 20,
  },
  timelineDescWhite: {
    color: '#3A3A3A',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 18,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  freeTrialBadge: {
    paddingVertical: 2,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 8,
  },
  freeTrialText: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 4,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  planLeftColumn: {
    flexDirection: 'column',
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  planPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  planSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    marginTop: 2,
  },
  cancelText: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    minWidth: '85%',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 4,
  },
});
