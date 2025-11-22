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
}

// Generate background image URLs based on count
// Images should be named 1.jpg, 2.jpg, 3.jpg, etc. in the bucket
export function getBackgroundImages(count: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    `${supabaseUrl}/storage/v1/object/public/background-images/${i + 1}.jpg`
  );
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
