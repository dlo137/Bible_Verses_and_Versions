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
