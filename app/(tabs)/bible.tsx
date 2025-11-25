import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import { supabase, BibleVerse } from '../../lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bible books in order with chapter counts
const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
];

// Bible version data
const ENGLISH_VERSIONS = [
  { code: 'KJV', name: 'King James Version' },
  { code: 'ASV', name: 'American Standard Version' },
];

export default function Bible() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get book/chapter/verse from navigation params, default to Genesis 1:1
  const selectedBook = (params.book as string) || 'Genesis';
  const selectedChapter = (params.chapter as string) || '1';
  const selectedVerse = (params.verse as string) || '1';
  const highlightVerse = params.highlight as string | undefined;

  const [selectedVersion, setSelectedVersion] = useState('ASV');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTextSizeModalVisible, setIsTextSizeModalVisible] = useState(false);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textSizeSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const textSizeFadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Store verse positions for scrolling
  const versePositions = useRef<{ [key: string]: number }>({});

  // Load verses when book/chapter/version changes
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchVerses(selectedBook, parseInt(selectedChapter, 10), selectedVersion);
    }
  }, [selectedBook, selectedChapter, selectedVersion]);

  // Scroll to highlighted verse after verses load
  useEffect(() => {
    if (highlightVerse && verses.length > 0 && !isLoading) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        const position = versePositions.current[highlightVerse];
        if (position !== undefined && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: position - 100, animated: true });
        }
      }, 300);
    }
  }, [highlightVerse, verses, isLoading]);

  // Fetch verses from Supabase
  const fetchVerses = async (book: string, chapter: number, version: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_name', book)
        .eq('chapter', chapter)
        .eq('translation_id', version)
        .order('verse', { ascending: true });

      if (error) {
        console.error('Error fetching verses:', error);
        setVerses([]);
      } else {
        setVerses(data || []);
      }
    } catch (err) {
      console.error('Error fetching verses:', err);
      setVerses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to book selection flow
  const openBookChapterSelector = () => {
    router.push('/(tabs)/ChooseBook' as any);
  };

  // Get current book info
  const getCurrentBookIndex = () => BIBLE_BOOKS.findIndex(b => b.name === selectedBook);
  const getCurrentBook = () => BIBLE_BOOKS[getCurrentBookIndex()] || BIBLE_BOOKS[0];

  // Navigate to previous chapter
  const goToPreviousChapter = () => {
    const currentChapter = parseInt(selectedChapter, 10);
    const currentBookIndex = getCurrentBookIndex();

    if (currentChapter > 1) {
      // Go to previous chapter in same book
      router.setParams({
        book: selectedBook,
        chapter: (currentChapter - 1).toString(),
        verse: '1'
      });
    } else if (currentBookIndex > 0) {
      // Go to last chapter of previous book
      const previousBook = BIBLE_BOOKS[currentBookIndex - 1];
      router.setParams({
        book: previousBook.name,
        chapter: previousBook.chapters.toString(),
        verse: '1'
      });
    }
    // If at Genesis 1, do nothing (beginning of Bible)
  };

  // Navigate to next chapter
  const goToNextChapter = () => {
    const currentChapter = parseInt(selectedChapter, 10);
    const currentBookIndex = getCurrentBookIndex();
    const currentBook = getCurrentBook();

    if (currentChapter < currentBook.chapters) {
      // Go to next chapter in same book
      router.setParams({
        book: selectedBook,
        chapter: (currentChapter + 1).toString(),
        verse: '1'
      });
    } else if (currentBookIndex < BIBLE_BOOKS.length - 1) {
      // Go to first chapter of next book
      const nextBook = BIBLE_BOOKS[currentBookIndex + 1];
      router.setParams({
        book: nextBook.name,
        chapter: '1',
        verse: '1'
      });
    }
    // If at Revelation 22, do nothing (end of Bible)
  };

  const openModal = () => {
    setIsModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
    });
  };

  const selectVersion = (code: string) => {
    setSelectedVersion(code);
  };

  // Text size modal functions
  const openTextSizeModal = () => {
    setIsTextSizeModalVisible(true);
    Animated.parallel([
      Animated.spring(textSizeSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(textSizeFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeTextSizeModal = () => {
    Animated.parallel([
      Animated.timing(textSizeSlideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(textSizeFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsTextSizeModalVisible(false);
    });
  };

  const FONT_SIZES = [14, 16, 18, 20, 22, 24];

  const VersionItem = ({ code, name, isLast = false }: { code: string; name: string; isLast?: boolean }) => (
    <TouchableOpacity
      style={[styles.versionItem, !isLast && styles.versionItemBorder]}
      onPress={() => selectVersion(code)}
      activeOpacity={0.6}
    >
      <View style={styles.versionInfo}>
        <Text style={styles.versionCode}>{code}</Text>
        <Text style={styles.versionName}>{name}</Text>
      </View>
      {selectedVersion === code && (
        <Ionicons name="checkmark" size={22} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          {/* Translation Selector */}
          <TouchableOpacity style={styles.pillButton} onPress={openModal}>
            <Text style={styles.pillButtonText}>{selectedVersion}</Text>
            <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Book/Chapter Selector */}
          <TouchableOpacity style={styles.pillButton} onPress={openBookChapterSelector}>
            <Text style={styles.pillButtonText}>
              {`${selectedBook} ${selectedChapter}`}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Text Size Button */}
          <TouchableOpacity style={styles.iconButton} onPress={openTextSizeModal}>
            <Text style={styles.textSizeIcon}>Aa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bible Text Section */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.textScrollView}
        contentContainerStyle={styles.textScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A1A1A" />
          </View>
        ) : verses.length > 0 ? (
          verses.map((verse) => {
            const isHighlighted = highlightVerse && verse.verse.toString() === highlightVerse;
            return (
              <View
                key={verse.id}
                onLayout={(event) => {
                  versePositions.current[verse.verse.toString()] = event.nativeEvent.layout.y;
                }}
              >
                <Text
                  style={[
                    styles.verseContainer,
                    isHighlighted && styles.highlightedVerse,
                  ]}
                >
                  <Text style={styles.verseNumber}>{verse.verse} </Text>
                  <Text style={[styles.verseText, { fontSize }]}>{verse.text} </Text>
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No verses found
            </Text>
          </View>
        )}
        {/* Bottom padding for nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Chapter Navigation Arrows */}
      <View style={styles.chapterNavContainer}>
        <TouchableOpacity
          style={styles.chapterNavButton}
          onPress={goToPreviousChapter}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.chapterNavButton}
          onPress={goToNextChapter}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <BottomNav />

      {/* Translation Selector Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet */}
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Title */}
            <Text style={styles.sheetTitle}>Select a Bible Version</Text>

            {/* Content */}
            <ScrollView
              style={styles.sheetScrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* English Versions */}
              <Text style={styles.sectionLabel}>English Versions:</Text>
              <View style={styles.sectionDivider} />
              <View style={styles.versionList}>
                {ENGLISH_VERSIONS.map((version, index) => (
                  <VersionItem
                    key={version.code}
                    code={version.code}
                    name={version.name}
                    isLast={index === ENGLISH_VERSIONS.length - 1}
                  />
                ))}
              </View>

            </ScrollView>

            {/* OK Button */}
            <TouchableOpacity style={styles.okButton} onPress={closeModal}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Text Size Modal */}
      <Modal
        visible={isTextSizeModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeTextSizeModal}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeTextSizeModal}>
            <Animated.View style={[styles.modalBackdrop, { opacity: textSizeFadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet */}
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: textSizeSlideAnim }] }
            ]}
          >
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Title */}
            <Text style={styles.sheetTitle}>Text Size</Text>

            {/* Font Size Options */}
            <View style={styles.fontSizeContainer}>
              {FONT_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeButton,
                    fontSize === size && styles.fontSizeButtonActive,
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text
                    style={[
                      styles.fontSizeButtonText,
                      fontSize === size && styles.fontSizeButtonTextActive,
                      { fontSize: size - 4 },
                    ]}
                  >
                    Aa
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* OK Button */}
            <TouchableOpacity style={styles.okButton} onPress={closeTextSizeModal}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Top Bar
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  iconButton: {
    padding: 8,
  },
  textSizeIcon: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
  },

  // Bible Text
  textScrollView: {
    flex: 1,
  },
  textScrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  verseContainer: {
    marginBottom: 8,
  },
  highlightedVerse: {
    backgroundColor: '#FFF59D',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9A9A',
    lineHeight: 28,
  },
  verseText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1A1A1A',
    lineHeight: 28,
    fontFamily: 'Georgia',
  },
  bottomSpacer: {
    height: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 24,
  },
  chapterNavContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  chapterNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DEDEDE',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  sheetScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionLabelMargin: {
    marginTop: 24,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginBottom: 4,
  },
  versionList: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  versionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  versionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  versionCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    width: 50,
  },
  versionName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6A6A6A',
    flex: 1,
  },
  okButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  fontSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fontSizeButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  fontSizeButtonText: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  fontSizeButtonTextActive: {
    color: '#FFFFFF',
  },
});