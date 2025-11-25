import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import { supabase, BibleVerse } from '../../lib/supabase';
import { useFavorites } from '../../context/FavoritesContext';

// Get a consistent random short verse for today based on date
const getDailyVerse = async (): Promise<BibleVerse | null> => {
  try {
    // Use today's date as a seed for consistent daily verse
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    // Fetch short verses only (under 120 characters to fit in 2 lines)
    const { data: shortVerses, error } = await supabase
      .from('bible_verses')
      .select('*')
      .lt('text', 'z'.repeat(120)) // Approximate filter for short text
      .order('id', { ascending: true });

    if (error || !shortVerses) {
      console.error('Error fetching verses:', error);
      return null;
    }

    // Filter to only verses with text under 120 characters
    const filteredVerses = shortVerses.filter(v => v.text.length <= 120);

    if (filteredVerses.length === 0) return null;

    // Generate a consistent index based on the date
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % filteredVerses.length;

    return filteredVerses[index];
  } catch (err) {
    console.error('Error fetching daily verse:', err);
    return null;
  }
};

const CATEGORIES = [
  'Love', 'Anxiety',
  'Strength', 'Forgiveness',
  'Purpose', 'Faith',
  'Healing', 'Addiction',
  'Stress', 'Hope',
  'Peace', 'Grief',
  'Courage', 'Wisdom',
];

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Navigate to Bible screen with highlighted verse
  const navigateToVerse = (verse: BibleVerse) => {
    router.push({
      pathname: '/(tabs)/bible',
      params: {
        book: verse.book_name,
        chapter: verse.chapter.toString(),
        verse: verse.verse.toString(),
        highlight: verse.verse.toString(),
      },
    });
  };

  // Fetch verse of the day on mount
  useEffect(() => {
    getDailyVerse().then(setDailyVerse);
  }, []);

  // Search function using ilike for keyword matching across multiple fields
  const searchVerses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Check if query contains chapter:verse format (e.g., "22:2" or "John 3:16")
      const chapterVerseMatch = query.match(/(\d+):(\d+)/);

      let data, error;

      if (chapterVerseMatch) {
        const chapter = parseInt(chapterVerseMatch[1], 10);
        const verse = parseInt(chapterVerseMatch[2], 10);

        // Extract potential book name (text before the chapter:verse)
        const bookPart = query.replace(/\d+:\d+/, '').trim();

        if (bookPart) {
          // Search with book name + chapter + verse (e.g., "John 3:16")
          ({ data, error } = await supabase
            .from('bible_verses')
            .select('*')
            .ilike('book_name', `%${bookPart}%`)
            .eq('chapter', chapter)
            .eq('verse', verse)
            .limit(20));
        } else {
          // Search with just chapter:verse (e.g., "3:16")
          ({ data, error } = await supabase
            .from('bible_verses')
            .select('*')
            .eq('chapter', chapter)
            .eq('verse', verse)
            .limit(20));
        }
      } else {
        // Regular search across text, book_name, chapter, and verse
        ({ data, error } = await supabase
          .from('bible_verses')
          .select('*')
          .or(`text.ilike.%${query}%,book_name.ilike.%${query}%,chapter.eq.${!isNaN(Number(query)) ? query : -1},verse.eq.${!isNaN(Number(query)) ? query : -1}`)
          .limit(20));
      }

      if (error) {
        console.error('Search error:', error);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Reset hasSubmitted if user clears the search
    if (!text.trim()) {
      setHasSubmitted(false);
    }
    // Simple debounce - search after user stops typing
    const timeoutId = setTimeout(() => {
      searchVerses(text);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  // Handle submit (when user presses enter)
  const handleSubmit = () => {
    if (searchQuery.trim()) {
      setHasSubmitted(true);
      searchVerses(searchQuery);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSearchQuery(category);
    setHasSubmitted(true);
    searchVerses(category);
  };

  // Handle like button press - toggles favorite (like count updated in FavoritesContext)
  const handleLikePress = async (verse: BibleVerse) => {
    const wasLiked = isFavorite(verse.id);

    // Toggle favorite (this also updates like count in database)
    await toggleFavorite(verse);

    // Update local results with new count
    setResults(prevResults =>
      prevResults.map(v =>
        v.id === verse.id
          ? { ...v, like_count: wasLiked ? Math.max(0, (v.like_count || 1) - 1) : (v.like_count || 0) + 1 }
          : v
      )
    );
  };

  // Check if we should show results (search is focused OR user has submitted a search)
  const showResults = (isSearchFocused || hasSubmitted) && (searchQuery.trim() !== '' || results.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#5A5A5A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search verses..."
            placeholderTextColor="#5A5A5A"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              // Delay hiding results so user can tap on them
              setTimeout(() => setIsSearchFocused(false), 200);
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setResults([]);
                setHasSubmitted(false);
                setIsSearchFocused(false);
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#5A5A5A" />
            </TouchableOpacity>
          )}
        </View>

        {showResults ? (
          // Search Results View
          <ScrollView
            style={styles.categoriesScrollView}
            contentContainerStyle={styles.categoriesContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            ) : results.length > 0 ? (
              results.map((verse) => (
                <TouchableOpacity
                  key={verse.id}
                  style={styles.resultItem}
                  onPress={() => navigateToVerse(verse)}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultReference}>
                      {verse.book_name} {verse.chapter}:{verse.verse}
                    </Text>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleLikePress(verse);
                      }}
                    >
                      <Ionicons
                        name={isFavorite(verse.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite(verse.id) ? "#E74C3C" : "#C9A227"}
                      />
                      <Text style={styles.likeCount}>
                        {verse.like_count || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.resultText} numberOfLines={3}>
                    {verse.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : searchQuery.trim() !== '' ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No verses found for "{searchQuery}"</Text>
              </View>
            ) : null}
          </ScrollView>
        ) : (
          // Categories View
          <ScrollView
            style={styles.categoriesScrollView}
            contentContainerStyle={styles.categoriesContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Verse of the Day */}
            <View style={styles.verseOfDayItem}>
              <Text style={styles.verseOfDayTitle}>Verse of the Day</Text>
              {dailyVerse ? (
                <>
                  <Text style={styles.verseOfDayText}>
                    "{dailyVerse.text}"
                  </Text>
                  <Text style={styles.verseOfDayReference}>
                    {dailyVerse.book_name} {dailyVerse.chapter}:{dailyVerse.verse}
                  </Text>
                </>
              ) : (
                <ActivityIndicator size="small" color="#FFFFFF" />
              )}
            </View>

            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      <BottomNav />
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
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  categoriesScrollView: {
    flex: 1,
    width: '100%',
    marginTop: 24,
  },
  categoriesContainer: {
    paddingBottom: 100,
  },
  verseOfDayItem: {
    width: '100%',
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  verseOfDayTitle: {
    fontSize: 12,
    color: '#C9A227',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  verseOfDayText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 8,
  },
  verseOfDayReference: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  resultItem: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    color: '#C9A227',
    fontWeight: '600',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    gap: 4,
  },
  likeCount: {
    fontSize: 14,
    color: '#C9A227',
    fontWeight: '500',
  },
  resultText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
