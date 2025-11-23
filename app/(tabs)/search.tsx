import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';
import { supabase, BibleVerse } from '../../lib/supabase';
import { useFavorites } from '../../context/FavoritesContext';

const CATEGORIES = [
  'Love', 'Anxiety',
  'Strength', 'Forgiveness',
  'Purpose', 'Faith',
  'Healing', 'Addiction',
  'Stress', 'Hope',
  'Peace', 'Grief',
  'Courage', 'Wisdom',
  'Patience', 'Gratitude',
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

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
                <View key={verse.id} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultReference}>
                      {verse.book_name} {verse.chapter}:{verse.verse}
                    </Text>
                    <TouchableOpacity
                      style={styles.saveIconButton}
                      onPress={() => toggleFavorite(verse)}
                    >
                      <Ionicons
                        name={isFavorite(verse.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite(verse.id) ? "#E74C3C" : "#C9A227"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.resultText} numberOfLines={3}>
                    {verse.text}
                  </Text>
                </View>
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
  saveIconButton: {
    padding: 4,
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
