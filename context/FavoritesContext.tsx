import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BibleVerse } from '../lib/supabase';

const FAVORITES_KEY = '@bible_favorites';

export interface FavoriteVerse {
  id: number;
  text: string;
  book_name: string;
  chapter: number;
  verse: number;
  savedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteVerse[];
  addFavorite: (verse: BibleVerse) => Promise<void>;
  removeFavorite: (verseId: number) => Promise<void>;
  isFavorite: (verseId: number) => boolean;
  toggleFavorite: (verse: BibleVerse) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteVerse[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = async (verse: BibleVerse) => {
    const favoriteVerse: FavoriteVerse = {
      id: verse.id,
      text: verse.text,
      book_name: verse.book_name,
      chapter: verse.chapter,
      verse: verse.verse,
      savedAt: new Date().toISOString(),
    };
    const newFavorites = [favoriteVerse, ...favorites];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (verseId: number) => {
    const newFavorites = favorites.filter(fav => fav.id !== verseId);
    await saveFavorites(newFavorites);
  };

  const isFavorite = (verseId: number) => {
    return favorites.some(fav => fav.id === verseId);
  };

  const toggleFavorite = async (verse: BibleVerse) => {
    if (isFavorite(verse.id)) {
      await removeFavorite(verse.id);
    } else {
      await addFavorite(verse);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
