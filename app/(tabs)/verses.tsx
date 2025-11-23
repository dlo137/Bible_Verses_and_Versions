import { View, Text, StyleSheet, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { getRandomVerse, BibleVerse } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { useNav } from '../../context/NavContext';

export default function Verses() {
  const { setCurrentBgIndex, backgroundImages, setIsButtonVisible, setIsNavVisible, animateBgChange, setCurrentVerse: setNavCurrentVerse } = useNav();
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recentBgIndices = useRef<number[]>([]);
  const currentBgIndexRef = useRef(0);

  // Fade-in animations
  const verseFadeAnim = useRef(new Animated.Value(0)).current;
  const referenceFadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch initial verse on mount
  useEffect(() => {
    fetchNewVerse();
  }, []);

  const fetchNewVerse = async () => {
    const verse = await getRandomVerse();
    if (verse) {
      setCurrentVerse(verse);
      setNavCurrentVerse(verse);
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
      ]).start(() => {
        // Show the + button after verse and reference have faded in
        setIsButtonVisible(true);
      });
    }, 800);
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Immediately hide everything
    verseFadeAnim.setValue(0);
    referenceFadeAnim.setValue(0);
    setIsButtonVisible(false);
    setIsNavVisible(false);

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

    // Animate background change and fetch new verse
    await animateBgChange(newIndex);
    await fetchNewVerse();

    // Now run the fade-in animation for the new content
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
    ]).start(() => {
      setIsButtonVisible(true);
    });
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
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.content}>
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
    backgroundColor: 'transparent',
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
