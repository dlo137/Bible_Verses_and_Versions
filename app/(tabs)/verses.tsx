import { View, Text, StyleSheet, Animated, PanResponder, ActivityIndicator, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { getRandomVerse, BibleVerse, getBibleSongs, getRandomCuratedVerse, getAvailableCategories, VerseCategory, VERSE_CATEGORIES } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { useNav } from '../../context/NavContext';
import { useAudio } from '../../context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Verses() {
  const router = useRouter();
  const { backgroundImages, setIsButtonVisible, isButtonVisible, isNavVisible, toggleNav, setIsNavVisible, animateBgChange, setCurrentVerse: setNavCurrentVerse } = useNav();
  const { songs, setSongs, currentSongIndex, isPlaying, bar1Anim, bar2Anim, bar3Anim, player, playSong } = useAudio();

  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<VerseCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<VerseCategory[]>([]);
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
    console.log('Verses: Component mounted', {
      songsLength: songs.length,
      currentSongIndex,
      isPlaying
    });
    fetchNewVerse();
    loadSongs();
    loadAvailableCategories();
  }, []);

  // Debug: Log when song info changes
  useEffect(() => {
    console.log('Verses: Song state changed', {
      songsLength: songs.length,
      currentSongIndex,
      currentSong: currentSongIndex !== null ? songs[currentSongIndex]?.name : 'none',
      isPlaying
    });
  }, [songs, currentSongIndex, isPlaying]);

  // Load songs from Supabase and start playing
  const loadSongs = async () => {
    console.log('Verses: loadSongs called', {
      songsLength: songs.length,
      currentSongIndex,
      isPlaying
    });

    // If songs already loaded and playing, don't do anything
    if (songs.length > 0 && currentSongIndex !== null) {
      console.log('Verses: Songs already loaded and playing, keeping current song');
      return;
    }

    // If songs loaded but not playing (e.g., direct navigation to verses screen), start playing random
    if (songs.length > 0 && currentSongIndex === null) {
      console.log('Verses: Songs loaded but not playing, starting random song');
      const randomIndex = Math.floor(Math.random() * songs.length);
      playSong(randomIndex);
      return;
    }

    // Load all songs from Supabase bucket (only if not loaded yet)
    console.log('Verses: Loading songs from Supabase');
    const songList = await getBibleSongs();
    console.log('Verses: Loaded songs from Supabase:', songList);

    if (songList.length === 0) {
      console.error('Verses: No songs found in Supabase bucket');
      return;
    }

    setSongs(songList);

    // Wait for songs to be set in context before playing
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * songList.length);
      console.log('Verses: Playing random song at index:', randomIndex);
      playSong(randomIndex);
    }, 200);
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

  // Load available categories from database
  const loadAvailableCategories = async () => {
    const categories = await getAvailableCategories();
    setAvailableCategories(categories);
  };

  const fetchNewVerse = async () => {
    let verse: BibleVerse | null = null;
    
    if (selectedCategory) {
      // Get curated verse from selected category
      verse = await getRandomCuratedVerse(selectedCategory);
    } else {
      // Get random verse from all verses
      verse = await getRandomVerse();
    }
    
    if (verse) {
      setCurrentVerse(verse);
      setNavCurrentVerse(verse);
    }
    setIsLoading(false);
  };

  // Handle category selection
  const handleCategorySelect = (category: VerseCategory | null) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
    setIsLoading(true);
    
    // Fetch new verse with selected category
    setTimeout(async () => {
      await fetchNewVerse();
    }, 100);
  };

  // Toggle category modal
  const toggleCategoryModal = () => {
    setShowCategoryModal(!showCategoryModal);
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

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Category Selection Button */}
      <TouchableOpacity style={styles.categoryButton} onPress={toggleCategoryModal}>
        <Ionicons name="options-outline" size={20} color="#5A5A5A" />
        <Text style={styles.categoryButtonText}>
          {selectedCategory ? VERSE_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'Category' : 'All Verses'}
        </Text>
      </TouchableOpacity>

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

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#5A5A5A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
              {/* All Verses Option */}
              <TouchableOpacity 
                style={[
                  styles.categoryItem, 
                  selectedCategory === null && styles.selectedCategoryItem
                ]}
                onPress={() => handleCategorySelect(null)}
              >
                <View style={styles.categoryItemContent}>
                  <Text style={[
                    styles.categoryItemTitle,
                    selectedCategory === null && styles.selectedCategoryTitle
                  ]}>
                    All Verses
                  </Text>
                  <Text style={styles.categoryItemDescription}>
                    Random verses from the entire Bible
                  </Text>
                </View>
                {selectedCategory === null && (
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>

              {/* Category Options */}
              {VERSE_CATEGORIES.map((category) => (
                <TouchableOpacity 
                  key={category.value}
                  style={[
                    styles.categoryItem, 
                    selectedCategory === category.value && styles.selectedCategoryItem
                  ]}
                  onPress={() => handleCategorySelect(category.value)}
                >
                  <View style={styles.categoryItemContent}>
                    <Text style={[
                      styles.categoryItemTitle,
                      selectedCategory === category.value && styles.selectedCategoryTitle
                    ]}>
                      {category.label}
                    </Text>
                    <Text style={styles.categoryItemDescription}>
                      {category.description}
                    </Text>
                  </View>
                  {selectedCategory === category.value && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  categoryButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A5A5A',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  categoryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#F8F9FA',
  },
  selectedCategoryItem: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  categoryItemContent: {
    flex: 1,
  },
  categoryItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  selectedCategoryTitle: {
    color: '#2E7D32',
  },
  categoryItemDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
});
