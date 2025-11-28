import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import { useFavorites } from '../../context/FavoritesContext';

export default function Favorites() {
  const router = useRouter();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>{favorites.length} saved verses</Text>
      </View>

      {/* Content */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyText}>No saved verses yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on verses to save them here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {favorites.map((verse) => (
            <TouchableOpacity
              key={verse.id}
              style={styles.card}
              onPress={() => {
                // Navigate to verses screen with this verse
                router.push({
                  pathname: '/(tabs)/verses',
                  params: {
                    verseId: verse.id.toString(),
                    verseText: verse.text,
                    bookName: verse.book_name,
                    chapter: verse.chapter.toString(),
                    verse: verse.verse.toString(),
                  },
                });
              }}
              activeOpacity={0.8}
            >
              {/* Heart Icon */}
              <TouchableOpacity
                style={styles.heartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  removeFavorite(verse.id);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="heart" size={24} color="#E74C3C" />
              </TouchableOpacity>

              {/* Verse Text */}
              <Text style={styles.verseText} numberOfLines={4}>
                "{verse.text}"
              </Text>

              {/* Reference */}
              <Text style={styles.verseReference}>
                {verse.book_name} {verse.chapter}:{verse.verse}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 1)',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 12,
  },
  verseText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 12,
    paddingRight: 30,
  },
  verseReference: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A227',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 120,
  },
});
