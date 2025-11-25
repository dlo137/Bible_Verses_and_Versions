import { View, Text, StyleSheet, Animated, PanResponder, ActivityIndicator, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { getRandomVerse, BibleVerse, getBibleSongs } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { useNav } from '../../context/NavContext';
import { useAudio } from '../../context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Verses() {
  const router = useRouter();
  const { backgroundImages, setIsButtonVisible, isButtonVisible, isNavVisible, toggleNav, setIsNavVisible, animateBgChange, setCurrentVerse: setNavCurrentVerse } = useNav();
  const { songs, setSongs, currentSongIndex, isPlaying, bar1Anim, bar2Anim, bar3Anim, player, playSong, initializeCathedralMusic } = useAudio();

  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recentBgIndices = useRef<number[]>([]);
  const currentBgIndexRef = useRef(0);

  const audioFadeAnim = useRef(new Animated.Value(0)).current;
  const audioUIFadeAnim = useRef(new Animated.Value(0)).current; // Fade for song name and bars UI

  // Fade-in animations
  const verseFadeAnim = useRef(new Animated.Value(0)).current;
  const referenceFadeAnim = useRef(new Animated.Value(0)).current;

  // Refs for avoiding stale closures in callbacks
  const setIsNavVisibleRef = useRef(setIsNavVisible);
  useEffect(() => {
    setIsNavVisibleRef.current = setIsNavVisible;
  }, [setIsNavVisible]);

  // Fetch initial verse on mount
  useEffect(() => {
    fetchNewVerse();
    loadSongs();
  }, []);

  // Load songs from Supabase and start playing
  const loadSongs = async () => {
    if (songs.length > 0) return; // Already loaded

    // Check if coming from onboarding with cathedral music
    try {
      const cathedralData = await AsyncStorage.getItem('cathedralMusic');
      if (cathedralData) {
        const { songs: cathedralSongs, currentIndex } = JSON.parse(cathedralData);
        console.log('Continuing cathedral music from onboarding:', cathedralSongs);

        // Initialize cathedral music in AudioContext
        initializeCathedralMusic(cathedralSongs, currentIndex);

        // Clear the storage so it doesn't replay on next visit
        await AsyncStorage.removeItem('cathedralMusic');
        return;
      }
    } catch (error) {
      console.error('Error loading cathedral music:', error);
    }

    // Load regular songs if no cathedral music
    const songList = await getBibleSongs();
    console.log('Loaded songs:', songList);
    setSongs(songList);
    if (songList.length > 0) {
      const randomIndex = Math.floor(Math.random() * songList.length);
      playSong(randomIndex);
    }
  };

  // Auto-play fade in audio volume when playing starts
  useEffect(() => {
    if (isPlaying && player) {
      // Set volume to 0 initially
      player.volume = 0;

      // Fade in audio volume over 2 seconds
      Animated.timing(audioFadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }
  }, [isPlaying]);

  // Update player volume based on fade animation
  useEffect(() => {
    const listenerId = audioFadeAnim.addListener(({ value }) => {
      if (player) {
        player.volume = value;
      }
    });

    return () => {
      audioFadeAnim.removeListener(listenerId);
    };
  }, [player]);

  // Navigate to songs screen
  const navigateToSongs = () => {
    router.push('/(tabs)/songs');
  };

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
      Animated.parallel([
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
        ]),
        // Fade in audio UI at the same time
        Animated.timing(audioUIFadeAnim, {
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
    // Immediately hide everything including the nav bar
    verseFadeAnim.setValue(0);
    referenceFadeAnim.setValue(0);
    audioUIFadeAnim.setValue(0); // Hide audio UI
    setIsButtonVisible(false);
    // Use ref to ensure we're calling the latest setIsNavVisible
    setIsNavVisibleRef.current(false);

    // Fade out audio
    Animated.timing(audioFadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();

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

    // Now run the fade-in animation for the new content and audio
    Animated.parallel([
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
      ]),
      // Fade in audio volume
      Animated.timing(audioFadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
      // Fade in audio UI (song name and bars)
      Animated.timing(audioUIFadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsButtonVisible(true);
    });
  };

  // Use refs to hold latest function references for PanResponder
  const handleSwipeRef = useRef(handleSwipe);
  const isButtonVisibleRef = useRef(isButtonVisible);
  const isNavVisibleRef = useRef(isNavVisible);

  // Keep refs updated
  useEffect(() => {
    handleSwipeRef.current = handleSwipe;
  }, [handleSwipe]);

  useEffect(() => {
    isButtonVisibleRef.current = isButtonVisible;
  }, [isButtonVisible]);

  useEffect(() => {
    isNavVisibleRef.current = isNavVisible;
  }, [isNavVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50;
        const tapThreshold = 10;

        // Check if it's a tap (minimal movement)
        if (Math.abs(gestureState.dx) < tapThreshold && Math.abs(gestureState.dy) < tapThreshold) {
          // Handle tap inline using refs
          if (isButtonVisibleRef.current) {
            toggleNav();
          } else {
            setIsButtonVisible(true);
          }
        } else if (gestureState.dx > swipeThreshold) {
          handleSwipeRef.current('right');
        } else if (gestureState.dx < -swipeThreshold) {
          handleSwipeRef.current('left');
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Audio Player - Top Right */}
      {songs.length > 0 && (
        <Animated.View style={[styles.audioPlayerContainer, { opacity: audioUIFadeAnim }]}>
          <TouchableOpacity style={styles.audioPlayerTouchable} onPress={navigateToSongs}>
            <Text style={styles.songName} numberOfLines={1}>
              {songs[currentSongIndex]?.name || 'Loading...'}
            </Text>
            {isPlaying ? (
              <View style={styles.audioBars}>
              <Animated.View
                style={[
                  styles.audioBar,
                  {
                    transform: [{
                      scaleY: bar1Anim
                    }]
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.audioBar,
                  {
                    transform: [{
                      scaleY: bar2Anim
                    }]
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.audioBar,
                  {
                    transform: [{
                      scaleY: bar3Anim
                    }]
                  }
                ]}
              />
            </View>
          ) : (
            <Ionicons name="play" size={18} color="#FFFFFF" style={styles.playIcon} />
          )}
          </TouchableOpacity>
        </Animated.View>
      )}

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
  audioPlayerContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  audioPlayerTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  songName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  audioBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 16,
  },
  audioBar: {
    width: 3,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  playIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
