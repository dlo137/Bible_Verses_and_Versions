import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_MARGIN = 8;
const ITEM_WIDTH = (SCREEN_WIDTH - 48 - (ITEM_MARGIN * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

type TabType = 'book' | 'chapter' | 'verse';

export default function ChooseBook() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const activeTab: TabType = 'book';

  const handleBack = () => {
    router.push('/(tabs)/bible' as any);
  };

  const handleNext = () => {
    if (selectedBook) {
      router.push({
        pathname: '/(tabs)/ChooseChapter',
        params: { book: selectedBook }
      } as any);
    }
  };

  const renderTab = (label: string, tab: TabType) => {
    const isActive = activeTab === tab;
    return (
      <View style={styles.tabItem}>
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
        {isActive && <View style={styles.tabUnderline} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a book</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTab('Book', 'book')}
        {renderTab('Chapter', 'chapter')}
        {renderTab('Verse', 'verse')}
      </View>

      {/* Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {BIBLE_BOOKS.map((book) => {
          const isSelected = selectedBook === book;
          return (
            <TouchableOpacity
              key={book}
              style={[styles.gridItem, isSelected && styles.gridItemSelected]}
              onPress={() => setSelectedBook(book)}
              activeOpacity={0.7}
            >
              <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                {book}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, !selectedBook && styles.fabDisabled]}
        onPress={handleNext}
        disabled={!selectedBook}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 1.5,
  },

  // Grid
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingBottom: 100,
    gap: ITEM_MARGIN,
  },
  gridItem: {
    width: ITEM_WIDTH,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridItemSelected: {
    borderColor: '#004C80',
    backgroundColor: 'rgba(0, 76, 128, 0.04)',
  },
  gridItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  gridItemTextSelected: {
    color: '#004C80',
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#003B5C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: '#A0A0A0',
  },
});
