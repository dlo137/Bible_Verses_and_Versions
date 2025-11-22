import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { getRandomVerse, BibleVerse } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { useNav } from '../../context/NavContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Verses() {
  const { currentBgImage, setCurrentBgIndex, backgroundImages } = useNav();
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recentBgIndices = useRef<number[]>([]);
  const currentBgIndexRef = useRef(0);

  // Fade-in animations
  const verseFadeAnim = useRef(new Animated.Value(0)).current;
  const referenceFadeAnim = useRef(new Animated.Value(0)).current;
  const bgFadeAnim = useRef(new Animated.Value(1)).current;

  // Fetch initial verse on mount
  useEffect(() => {
    fetchNewVerse();
  }, []);

  const fetchNewVerse = async () => {
    const verse = await getRandomVerse();
    if (verse) {
      setCurrentVerse(verse);
    }
    setIsLoading(false);
  };

  // Run fade-in sequence on mount
  useEffect(() => {
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(verseFadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(referenceFadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
  }, []);

  const runFadeInAnimation = (delay: number = 0) => {
    // Reset all animations
    verseFadeAnim.setValue(0);
    referenceFadeAnim.setValue(0);

    // Run sequential fade-in: verse -> reference
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(verseFadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(referenceFadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Fade out background
    Animated.timing(bgFadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(async () => {
      // Change background index randomly, avoiding recent images
      const getNewBgIndex = () => {
        const availableIndices = Array.from({ length: backgroundImages.length }, (_, i) => i)
          .filter(i => !recentBgIndices.current.includes(i));

        // If all images are in recent history, pick any random one except current
        if (availableIndices.length === 0) {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * backgroundImages.length);
          } while (newIndex === currentBgIndexRef.current && backgroundImages.length > 1);
          return newIndex;
        }

        return availableIndices[Math.floor(Math.random() * availableIndices.length)];
      };

      const newIndex = getNewBgIndex();
      recentBgIndices.current.push(newIndex);
      if (recentBgIndices.current.length > 10) {
        recentBgIndices.current.shift();
      }
      currentBgIndexRef.current = newIndex;
      setCurrentBgIndex(newIndex);
      // Fetch new verse
      await fetchNewVerse();
      // Fade in new background
      Animated.timing(bgFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
    runFadeInAnimation(3000);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50;
        if (gestureState.dx > swipeThreshold) {
          handleSwipe('right');
        } else if (gestureState.dx < -swipeThreshold) {
          handleSwipe('left');
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: currentBgImage }}
        style={[styles.backgroundImage, { opacity: bgFadeAnim }]}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.content} {...panResponder.panHandlers}>
        {/* Verse Display */}
        <View style={styles.verseContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1A1A1A" />
          ) : currentVerse ? (
            <>
              <Animated.Text style={[styles.verseText, { opacity: verseFadeAnim }]}>
                "{currentVerse.text}"
              </Animated.Text>
              <Animated.Text style={[styles.verseReference, { opacity: referenceFadeAnim }]}>
                {currentVerse.book_name} {currentVerse.chapter}:{currentVerse.verse}
              </Animated.Text>
            </>
          ) : (
            <>
              <Animated.Text style={[styles.verseText, { opacity: verseFadeAnim }]}>
                "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."
              </Animated.Text>
              <Animated.Text style={[styles.verseReference, { opacity: referenceFadeAnim }]}>
                Jeremiah 29:11
              </Animated.Text>
            </>
          )}
        </View>

        <BottomNav />
      </View>
    </View>
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
});
