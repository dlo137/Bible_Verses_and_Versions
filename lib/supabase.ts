import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://etfhutmmkoxbjjaxbotv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Zmh1dG1ta294YmpqYXhib3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NzE4MjgsImV4cCI6MjA3OTM0NzgyOH0.TU1vQrwLhrY4ACl6KlYtD3UnVgtVS1Xnc3W3Ruk7cl0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BibleVerse {
  id: number;
  chapter: number;
  verse: number;
  text: string;
  translation_id: number;
  book_id: number;
  book_name: string;
  created_at: string;
  like_count: number;
}

export interface CuratedVerse {
  id: number;
  verse_id: number;
  category: string;
  subcategory?: string;
  relevance_score: number;
  created_at: string;
  // Joined fields from bible_verses
  verse?: BibleVerse;
}

export type VerseCategory = 
  | 'love'
  | 'strength' 
  | 'disappointment'
  | 'hope'
  | 'peace'
  | 'guidance'
  | 'faith'
  | 'forgiveness'
  | 'comfort'
  | 'courage'
  | 'gratitude'
  | 'wisdom'
  | 'healing'
  | 'protection'
  | 'purpose';

export const VERSE_CATEGORIES: { value: VerseCategory; label: string; description: string }[] = [
  { value: 'love', label: 'Love', description: 'God\'s love, self-love, loving others' },
  { value: 'strength', label: 'Strength', description: 'Finding inner strength and perseverance' },
  { value: 'disappointment', label: 'Disappointment', description: 'Dealing with setbacks and unmet expectations' },
  { value: 'hope', label: 'Hope', description: 'Finding hope in difficult times' },
  { value: 'peace', label: 'Peace', description: 'Inner peace and tranquility' },
  { value: 'guidance', label: 'Guidance', description: 'Seeking direction and wisdom' },
  { value: 'faith', label: 'Faith', description: 'Strengthening and growing faith' },
  { value: 'forgiveness', label: 'Forgiveness', description: 'Forgiving others and receiving forgiveness' },
  { value: 'comfort', label: 'Comfort', description: 'Finding comfort in times of sorrow' },
  { value: 'courage', label: 'Courage', description: 'Finding courage to face challenges' },
  { value: 'gratitude', label: 'Gratitude', description: 'Expressing thankfulness and appreciation' },
  { value: 'wisdom', label: 'Wisdom', description: 'Seeking godly wisdom and understanding' },
  { value: 'healing', label: 'Healing', description: 'Physical, emotional, and spiritual healing' },
  { value: 'protection', label: 'Protection', description: 'God\'s protection and safety' },
  { value: 'purpose', label: 'Purpose', description: 'Finding your calling and purpose' }
];

// Update like count for a verse
export async function updateLikeCount(verseId: number, increment: boolean): Promise<number | null> {
  // First get current count
  const { data: current, error: fetchError } = await supabase
    .from('bible_verses')
    .select('like_count')
    .eq('id', verseId)
    .single();

  if (fetchError) {
    console.error('Error fetching like count:', fetchError);
    return null;
  }

  const currentCount = current?.like_count || 0;
  const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);

  // Update the count
  const { error: updateError } = await supabase
    .from('bible_verses')
    .update({ like_count: newCount })
    .eq('id', verseId);

  if (updateError) {
    console.error('Error updating like count:', updateError);
    return null;
  }

  return newCount;
}

// Generate background image URLs based on count
// Images should be named 1.jpg, 2.jpg, 3.jpg, etc. in the bucket
export function getBackgroundImages(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    `${supabaseUrl}/storage/v1/object/public/background-images/${i + 1}.jpg`
  );
}

// Get audio files from bible_songs bucket
export async function getBibleSongs(): Promise<{ name: string; url: string }[]> {
  const { data, error } = await supabase.storage.from('bible_songs').list('', {
    limit: 100,
    offset: 0,
  });

  if (error) {
    console.error('Error fetching songs from Supabase:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('No files found in bible_songs bucket');
    return [];
  }

  console.log('All files in bucket:', data.map(f => f.name));

  const songs = data
    .filter(file => file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav'))
    .map(file => ({
      name: file.name.replace(/\.(mp3|m4a|wav)$/, ''),
      url: `${supabaseUrl}/storage/v1/object/public/bible_songs/${file.name}`,
    }));

  console.log('Filtered songs:', songs);
  return songs;
}

export async function getRandomVerse(): Promise<BibleVerse | null> {
  // Get a random verse from the table
  const { data, error } = await supabase
    .from('bible_verses')
    .select('*')
    .limit(1)
    .order('id', { ascending: false })
    .then(async (result) => {
      if (result.error) return result;
      // Get count and fetch random
      const { count } = await supabase
        .from('bible_verses')
        .select('*', { count: 'exact', head: true });

      if (count) {
        const randomOffset = Math.floor(Math.random() * count);
        return supabase
          .from('bible_verses')
          .select('*')
          .range(randomOffset, randomOffset)
          .single();
      }
      return result;
    });

  if (error) {
    console.error('Error fetching verse:', error);
    return null;
  }

  return data;
}

// Get curated verses by category
export async function getCuratedVersesByCategory(category: VerseCategory): Promise<BibleVerse[]> {
  const { data, error } = await supabase
    .from('curated_verses')
    .select(`
      *,
      verse:bible_verses!inner(*)
    `)
    .eq('category', category)
    .order('relevance_score', { ascending: false })
    .limit(20); // Get top 20 most relevant verses

  if (error) {
    console.error('Error fetching curated verses:', error);
    return [];
  }

  // Extract the verse data from the joined results
  return data.map(item => item.verse as BibleVerse);
}

// Get a random curated verse from a specific category
export async function getRandomCuratedVerse(category: VerseCategory): Promise<BibleVerse | null> {
  const verses = await getCuratedVersesByCategory(category);
  
  if (verses.length === 0) {
    console.warn(`No curated verses found for category: ${category}`);
    // Fallback to random verse if no curated verses exist
    return getRandomVerse();
  }

  const randomIndex = Math.floor(Math.random() * verses.length);
  return verses[randomIndex];
}

// Get all available categories that have curated verses
export async function getAvailableCategories(): Promise<VerseCategory[]> {
  const { data, error } = await supabase
    .from('curated_verses')
    .select('category')
    .order('category');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Return unique categories
  const uniqueCategories = [...new Set(data.map(item => item.category))] as VerseCategory[];
  return uniqueCategories;
}
