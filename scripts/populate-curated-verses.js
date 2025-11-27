/**
 * Script to populate curated_verses table with meaningful categorized verses
 * 
 * To use this script:
 * 1. Make sure your curated_verses table has these columns:
 *    - id (primary key)
 *    - verse_id (foreign key to bible_verses.id)
 *    - category (text)
 *    - subcategory (text, optional)
 *    - relevance_score (integer, 1-10)
 *    - created_at (timestamp)
 * 
 * 2. Run this in your Supabase SQL editor or modify for your preferred method
 */

// Example curated verses organized by category
// You'll need to replace the verse_ids with actual IDs from your bible_verses table

const curatedVerses = [
  // LOVE
  { category: 'love', verse_reference: '1 John 4:8', relevance_score: 10 },
  { category: 'love', verse_reference: 'John 3:16', relevance_score: 10 },
  { category: 'love', verse_reference: '1 Corinthians 13:4-7', relevance_score: 9 },
  { category: 'love', verse_reference: 'Romans 8:38-39', relevance_score: 9 },
  
  // STRENGTH  
  { category: 'strength', verse_reference: 'Philippians 4:13', relevance_score: 10 },
  { category: 'strength', verse_reference: 'Isaiah 40:31', relevance_score: 9 },
  { category: 'strength', verse_reference: '2 Corinthians 12:9', relevance_score: 9 },
  { category: 'strength', verse_reference: 'Joshua 1:9', relevance_score: 8 },
  
  // DISAPPOINTMENT
  { category: 'disappointment', verse_reference: 'Romans 8:28', relevance_score: 10 },
  { category: 'disappointment', verse_reference: 'Jeremiah 29:11', relevance_score: 9 },
  { category: 'disappointment', verse_reference: 'Psalm 34:18', relevance_score: 8 },
  { category: 'disappointment', verse_reference: 'Isaiah 55:8-9', relevance_score: 8 },
  
  // HOPE
  { category: 'hope', verse_reference: 'Jeremiah 29:11', relevance_score: 10 },
  { category: 'hope', verse_reference: 'Romans 15:13', relevance_score: 9 },
  { category: 'hope', verse_reference: 'Psalm 42:11', relevance_score: 8 },
  { category: 'hope', verse_reference: 'Lamentations 3:22-23', relevance_score: 8 },
  
  // PEACE
  { category: 'peace', verse_reference: 'John 14:27', relevance_score: 10 },
  { category: 'peace', verse_reference: 'Philippians 4:7', relevance_score: 9 },
  { category: 'peace', verse_reference: 'Isaiah 26:3', relevance_score: 8 },
  { category: 'peace', verse_reference: 'Matthew 11:28', relevance_score: 8 },
  
  // GUIDANCE
  { category: 'guidance', verse_reference: 'Proverbs 3:5-6', relevance_score: 10 },
  { category: 'guidance', verse_reference: 'Psalm 119:105', relevance_score: 9 },
  { category: 'guidance', verse_reference: 'James 1:5', relevance_score: 8 },
  { category: 'guidance', verse_reference: 'Psalm 32:8', relevance_score: 8 },
  
  // FAITH
  { category: 'faith', verse_reference: 'Hebrews 11:1', relevance_score: 10 },
  { category: 'faith', verse_reference: 'Romans 10:17', relevance_score: 9 },
  { category: 'faith', verse_reference: 'Mark 9:23', relevance_score: 8 },
  { category: 'faith', verse_reference: 'Matthew 17:20', relevance_score: 8 },
  
  // FORGIVENESS
  { category: 'forgiveness', verse_reference: '1 John 1:9', relevance_score: 10 },
  { category: 'forgiveness', verse_reference: 'Ephesians 4:32', relevance_score: 9 },
  { category: 'forgiveness', verse_reference: 'Matthew 6:14-15', relevance_score: 8 },
  { category: 'forgiveness', verse_reference: 'Colossians 3:13', relevance_score: 8 },
  
  // COMFORT
  { category: 'comfort', verse_reference: '2 Corinthians 1:3-4', relevance_score: 10 },
  { category: 'comfort', verse_reference: 'Psalm 23:4', relevance_score: 9 },
  { category: 'comfort', verse_reference: 'Matthew 5:4', relevance_score: 8 },
  { category: 'comfort', verse_reference: 'Revelation 21:4', relevance_score: 8 },
  
  // COURAGE
  { category: 'courage', verse_reference: 'Joshua 1:9', relevance_score: 10 },
  { category: 'courage', verse_reference: 'Deuteronomy 31:6', relevance_score: 9 },
  { category: 'courage', verse_reference: '1 Chronicles 28:20', relevance_score: 8 },
  { category: 'courage', verse_reference: 'Psalm 27:14', relevance_score: 8 },
];

console.log(`
-- SQL to populate curated_verses table
-- Run this in your Supabase SQL editor

-- First, you need to find the actual verse IDs from your bible_verses table
-- This is an example query to find verse IDs:

SELECT id, book_name, chapter, verse, text 
FROM bible_verses 
WHERE (book_name = 'John' AND chapter = 3 AND verse = 16)
   OR (book_name = 'Philippians' AND chapter = 4 AND verse = 13)
   OR (book_name = '1 John' AND chapter = 4 AND verse = 8)
-- Add more conditions for other verses you want to curate

-- Then insert into curated_verses table:
-- INSERT INTO curated_verses (verse_id, category, relevance_score)
-- VALUES 
--   (1234, 'love', 10),  -- Replace 1234 with actual verse ID for John 3:16
--   (5678, 'strength', 10), -- Replace 5678 with actual verse ID for Philippians 4:13
--   -- Add more rows...
`);

// Alternative: JavaScript function to help generate the SQL
function generateCuratedVersesSQL() {
  return `
-- Step 1: Create curated_verses table if it doesn't exist
CREATE TABLE IF NOT EXISTS curated_verses (
  id SERIAL PRIMARY KEY,
  verse_id INTEGER REFERENCES bible_verses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  relevance_score INTEGER DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_curated_verses_category ON curated_verses(category);
CREATE INDEX IF NOT EXISTS idx_curated_verses_verse_id ON curated_verses(verse_id);

-- Step 3: Sample data insertion (you'll need to update verse_ids)
-- Use this as a template and replace with actual verse IDs from your database
INSERT INTO curated_verses (verse_id, category, relevance_score) VALUES
  -- You need to run queries like this to get the actual verse IDs:
  -- SELECT id FROM bible_verses WHERE book_name = 'John' AND chapter = 3 AND verse = 16;
  
  -- Example entries (replace verse_id values with real IDs):
  (1, 'love', 10),        -- John 3:16
  (2, 'strength', 10),    -- Philippians 4:13  
  (3, 'hope', 10),        -- Jeremiah 29:11
  (4, 'peace', 10),       -- John 14:27
  (5, 'guidance', 10);    -- Proverbs 3:5-6

-- Step 4: Verify the data
SELECT 
  cv.category,
  bv.book_name,
  bv.chapter,
  bv.verse,
  bv.text,
  cv.relevance_score
FROM curated_verses cv
JOIN bible_verses bv ON cv.verse_id = bv.id
ORDER BY cv.category, cv.relevance_score DESC;
`;
}

console.log(generateCuratedVersesSQL());

module.exports = {
  curatedVerses,
  generateCuratedVersesSQL
};