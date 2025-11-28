import { View, Text, StyleSheet, Animated, PanResponder, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { getRandomVerse, BibleVerse, getBibleSongs, getRandomCuratedVerse, VerseCategory } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { useNav } from '../../context/NavContext';
import { useAudio } from '../../context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import RatingModal from '../../components/RatingModal';
import { incrementVerseViewCount, shouldShowRatingPrompt, markRatingPromptShown, markUserRated } from '../../utils/ratingPrompt';

export default function Verses() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { backgroundImages, setIsButtonVisible, isButtonVisible, isNavVisible, toggleNav, setIsNavVisible, animateBgChange, setCurrentVerse: setNavCurrentVerse } = useNav();
  const { songs, setSongs, currentSongIndex, isPlaying, bar1Anim, bar2Anim, bar3Anim, player, playSong } = useAudio();

  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
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

  // Fetch initial verse on mount or when params change
  useEffect(() => {
    // Check if a verse was passed via route params (from favorites)
    if (params.verseId && params.verseText && params.bookName && params.chapter && params.verse) {
      const verseFromParams: BibleVerse = {
        id: parseInt(params.verseId as string, 10),
        text: params.verseText as string,
        book_name: params.bookName as string,
        chapter: parseInt(params.chapter as string, 10),
        verse: parseInt(params.verse as string, 10),
        translation_id: 1, // Default value
        book_id: 1, // Default value
        created_at: new Date().toISOString(),
        like_count: 0,
      };
      setCurrentVerse(verseFromParams);
      setNavCurrentVerse(verseFromParams);
      setIsLoading(false);
    } else {
      // No params, fetch a random verse
      fetchNewVerse();
    }
  }, [params.verseId]);

  // Load songs separately to ensure it always runs on mount
  useEffect(() => {
    // Debug: Check initial state
    console.log('[Verses Mount] Songs length:', songs.length, 'Current index:', currentSongIndex, 'Is playing:', isPlaying);
    loadSongs();
  }, []);

  // Auto-play when songs are loaded for the first time
  useEffect(() => {
    // Only auto-play if songs just loaded and nothing is playing
    if (songs.length > 0 && currentSongIndex === null && !isPlaying) {
      console.log('[Auto-play Effect] Songs loaded, starting random song');
      const randomIndex = Math.floor(Math.random() * songs.length);
      setTimeout(() => {
        console.log('[Auto-play Effect] Playing song at index:', randomIndex);
        playSong(randomIndex);
      }, 100);
    }
  }, [songs.length]);


  // Load songs from Supabase and start playing
  const loadSongs = async () => {
    console.log('[loadSongs] Called. Songs:', songs.length, 'Index:', currentSongIndex, 'Playing:', isPlaying);

    // If songs already loaded and playing, don't do anything
    if (songs.length > 0 && currentSongIndex !== null && isPlaying) {
      console.log('[loadSongs] Songs already playing, returning');
      return;
    }

    // If songs loaded but not playing (e.g., direct navigation to verses screen), start playing random
    if (songs.length > 0 && (currentSongIndex === null || !isPlaying)) {
      console.log('[loadSongs] Songs loaded but not playing, starting random');
      const randomIndex = Math.floor(Math.random() * songs.length);
      playSong(randomIndex);
      return;
    }

    // Load all songs from Supabase bucket (only if not loaded yet)
    console.log('[loadSongs] Loading songs from Supabase...');
    const songList = await getBibleSongs();
    console.log('[loadSongs] Loaded', songList.length, 'songs from Supabase');

    if (songList.length === 0) {
      console.log('[loadSongs] No songs found, returning');
      return;
    }

    setSongs(songList);
    console.log('[loadSongs] Set songs in context, will play via useEffect');
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



  // Track recently shown verses to avoid repetition
  const recentVerses = useRef<number[]>([]);

  const fetchNewVerse = async () => {
    // Get random curated verse from any category, avoiding recent ones
    const allCategories: VerseCategory[] = ['love', 'strength', 'disappointment', 'hope', 'peace', 'guidance', 'faith', 'forgiveness', 'comfort', 'courage', 'gratitude', 'wisdom', 'healing', 'protection', 'purpose'];
    
    let verse: BibleVerse | null = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Try to get a verse that hasn't been shown recently
    while (!verse && attempts < maxAttempts) {
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      const candidateVerse = await getRandomCuratedVerse(randomCategory);
      
      if (candidateVerse && !recentVerses.current.includes(candidateVerse.id)) {
        verse = candidateVerse;

        // Track this verse as recently shown
        recentVerses.current.push(candidateVerse.id);

        // Keep only the last 20 verses in memory to avoid repetition
        if (recentVerses.current.length > 20) {
          recentVerses.current.shift();
        }
        break;
      }
      attempts++;
    }

    // If we couldn't find a non-recent verse after maxAttempts, just get any verse
    if (!verse) {
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      verse = await getRandomCuratedVerse(randomCategory);
    }
    
    if (verse) {
      setCurrentVerse(verse);
      setNavCurrentVerse(verse);
    }
    setIsLoading(false);
  };



  // Run fade-in sequence on mount
  useEffect(() => {
    setTimeout(() => {
      // Sequence: verse -> reference -> + button -> audio UI
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

        // Then fade in the audio UI after + button appears
        setTimeout(() => {
          Animated.timing(audioUIFadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }).start();
        }, 300);
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

    // Don't fade out audio - keep music playing continuously

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

    // Increment verse view count and check if we should show rating prompt
    await incrementVerseViewCount();

    const shouldShow = await shouldShowRatingPrompt();
    if (shouldShow) {
      // Delay showing the modal slightly so animations complete first
      setTimeout(() => {
        setShowRatingModal(true);
      }, 1500);
    }

    // Now run the fade-in animation for the new content
    // Sequence: verse -> reference -> + button -> audio UI
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
      // Show + button after verse and reference
      setIsButtonVisible(true);

      // Then fade in audio UI after + button appears
      setTimeout(() => {
        Animated.timing(audioUIFadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start();
      }, 300);
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

  // Handle rating modal actions
  const handleRate = async () => {
    await markUserRated();
    await markRatingPromptShown();
    setShowRatingModal(false);
  };

  const handleDismissRating = async () => {
    await markRatingPromptShown();
    setShowRatingModal(false);
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onRate={handleRate}
        onDismiss={handleDismissRating}
      />

      {/* Audio Player - Top Right */}
      {songs.length > 0 && currentSongIndex !== null && (
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
                "I can do all things through Christ who strengthens me."
              </Animated.Text>
              <Animated.Text style={[styles.verseReference, { opacity: referenceFadeAnim }]}>
                Philippians 4:13
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
    color: '#1A1A1A',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: '#5A5A5A',
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
