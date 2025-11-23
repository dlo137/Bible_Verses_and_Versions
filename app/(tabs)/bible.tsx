import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import { supabase, BibleVerse } from '../../lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bible version data
const ENGLISH_VERSIONS = [
  { code: 'KJV', name: 'King James Version' },
  { code: 'ASV', name: 'American Standard Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'NIV', name: 'New International Version' },
  { code: 'HCSB', name: 'Holman Christian Standard Bible' },
  { code: 'NLT', name: 'New Living Translation' },
];

export default function Bible() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get book/chapter/verse from navigation params
  const selectedBook = params.book as string | undefined;
  const selectedChapter = params.chapter as string | undefined;
  const selectedVerse = params.verse as string | undefined;

  const [selectedVersion, setSelectedVersion] = useState('ASV');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load verses when book/chapter changes
  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchVerses(selectedBook, parseInt(selectedChapter, 10));
    }
  }, [selectedBook, selectedChapter]);

  // Fetch verses from Supabase
  const fetchVerses = async (book: string, chapter: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_name', book)
        .eq('chapter', chapter)
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

  // Navigate to previous chapter
  const goToPreviousChapter = () => {
    if (selectedBook && selectedChapter) {
      const currentChapter = parseInt(selectedChapter, 10);
      if (currentChapter > 1) {
        router.setParams({
          book: selectedBook,
          chapter: (currentChapter - 1).toString(),
          verse: '1'
        });
      }
    }
  };

  // Navigate to next chapter
  const goToNextChapter = () => {
    if (selectedBook && selectedChapter) {
      const currentChapter = parseInt(selectedChapter, 10);
      // Navigate to next chapter (you may want to add max chapter validation later)
      router.setParams({
        book: selectedBook,
        chapter: (currentChapter + 1).toString(),
        verse: '1'
      });
    }
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
              {selectedBook ? `${selectedBook} ${selectedChapter}` : '1 Samuel 30'}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Right Icons */}
          <View style={styles.topBarIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.textSizeIcon}>Aa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bible Text Section */}
      <ScrollView
        style={styles.textScrollView}
        contentContainerStyle={styles.textScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A1A1A" />
          </View>
        ) : verses.length > 0 ? (
          verses.map((verse) => (
            <Text key={verse.id} style={styles.verseContainer}>
              <Text style={styles.verseNumber}>{verse.verse} </Text>
              <Text style={styles.verseText}>{verse.text} </Text>
            </Text>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedBook ? 'No verses found' : 'Select a book and chapter to start reading'}
            </Text>
          </View>
        )}
        {/* Bottom padding for nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Chapter Navigation Arrows */}
      {selectedBook && selectedChapter && (
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
      )}

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
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
});
