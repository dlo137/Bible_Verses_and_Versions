import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 5;
const ITEM_MARGIN = 12;
const ITEM_SIZE = (SCREEN_WIDTH - 48 - (ITEM_MARGIN * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

// Generate chapters 1-31 (can be dynamic based on book)
const CHAPTERS = Array.from({ length: 31 }, (_, i) => i + 1);

type TabType = 'book' | 'chapter' | 'verse';

export default function ChooseChapter() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const book = params.book as string || 'Genesis';

  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const activeTab: TabType = 'chapter';

  const handleBack = () => {
    router.push('/(tabs)/bible' as any);
  };

  const handleNext = () => {
    if (selectedChapter) {
      router.push({
        pathname: '/(tabs)/ChooseVerse',
        params: { book, chapter: selectedChapter.toString() }
      } as any);
    }
  };

  const renderTab = (label: string, tab: TabType) => {
    const isActive = activeTab === tab;
    const isPast = tab === 'book';
    return (
      <View style={styles.tabItem}>
        <Text style={[
          styles.tabText,
          isActive && styles.tabTextActive,
          isPast && styles.tabTextPast
        ]}>
          {label}
        </Text>
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
        <Text style={styles.headerTitle}>Choose a chapter</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTab('Book', 'book')}
        {renderTab('Chapter', 'chapter')}
        {renderTab('Verse', 'verse')}
      </View>

      {/* Selected Book Display */}
      <View style={styles.selectionBadge}>
        <Text style={styles.selectionBadgeText}>{book}</Text>
      </View>

      {/* Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {CHAPTERS.map((chapter) => {
          const isSelected = selectedChapter === chapter;
          return (
            <TouchableOpacity
              key={chapter}
              style={[styles.gridItem, isSelected && styles.gridItemSelected]}
              onPress={() => setSelectedChapter(chapter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                {chapter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, !selectedChapter && styles.fabDisabled]}
        onPress={handleNext}
        disabled={!selectedChapter}
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
  tabTextPast: {
    color: '#8A8A8A',
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

  // Selection Badge
  selectionBadge: {
    alignSelf: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  selectionBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
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
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridItemSelected: {
    borderColor: '#004C80',
    backgroundColor: 'rgba(0, 76, 128, 0.04)',
  },
  gridItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  gridItemTextSelected: {
    color: '#004C80',
    fontWeight: '700',
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
