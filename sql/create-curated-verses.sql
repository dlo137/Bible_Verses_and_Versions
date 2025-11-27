-- Create curated_verses table
CREATE TABLE IF NOT EXISTS curated_verses (
  id SERIAL PRIMARY KEY,
  verse_id INTEGER REFERENCES bible_verses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  relevance_score INTEGER DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_curated_verses_category ON curated_verses(category);
CREATE INDEX IF NOT EXISTS idx_curated_verses_verse_id ON curated_verses(verse_id);

-- Helper function to find verses by reference
CREATE OR REPLACE FUNCTION find_verse_id(book_name_param TEXT, chapter_param INTEGER, verse_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  verse_id INTEGER;
BEGIN
  SELECT id INTO verse_id
  FROM bible_verses
  WHERE book_name = book_name_param 
    AND chapter = chapter_param 
    AND verse = verse_param
  LIMIT 1;
  
  RETURN verse_id;
END;
$$ LANGUAGE plpgsql;

-- Sample curated verses with popular, meaningful scriptures
-- You can run these individually or all at once

-- LOVE verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('John', 3, 16), 'love', 10
WHERE find_verse_id('John', 3, 16) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('1 John', 4, 8), 'love', 10
WHERE find_verse_id('1 John', 4, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Romans', 8, 38), 'love', 9
WHERE find_verse_id('Romans', 8, 38) IS NOT NULL;

-- STRENGTH verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Philippians', 4, 13), 'strength', 10
WHERE find_verse_id('Philippians', 4, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Isaiah', 40, 31), 'strength', 9
WHERE find_verse_id('Isaiah', 40, 31) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('2 Corinthians', 12, 9), 'strength', 9
WHERE find_verse_id('2 Corinthians', 12, 9) IS NOT NULL;

-- HOPE verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Jeremiah', 29, 11), 'hope', 10
WHERE find_verse_id('Jeremiah', 29, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Romans', 15, 13), 'hope', 9
WHERE find_verse_id('Romans', 15, 13) IS NOT NULL;

-- PEACE verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('John', 14, 27), 'peace', 10
WHERE find_verse_id('John', 14, 27) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Philippians', 4, 7), 'peace', 9
WHERE find_verse_id('Philippians', 4, 7) IS NOT NULL;

-- GUIDANCE verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Proverbs', 3, 5), 'guidance', 10
WHERE find_verse_id('Proverbs', 3, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Psalm', 119, 105), 'guidance', 9
WHERE find_verse_id('Psalm', 119, 105) IS NOT NULL;

-- FAITH verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Hebrews', 11, 1), 'faith', 10
WHERE find_verse_id('Hebrews', 11, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Romans', 10, 17), 'faith', 9
WHERE find_verse_id('Romans', 10, 17) IS NOT NULL;

-- FORGIVENESS verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('1 John', 1, 9), 'forgiveness', 10
WHERE find_verse_id('1 John', 1, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Ephesians', 4, 32), 'forgiveness', 9
WHERE find_verse_id('Ephesians', 4, 32) IS NOT NULL;

-- COMFORT verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('2 Corinthians', 1, 3), 'comfort', 10
WHERE find_verse_id('2 Corinthians', 1, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Psalm', 23, 4), 'comfort', 9
WHERE find_verse_id('Psalm', 23, 4) IS NOT NULL;

-- COURAGE verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Joshua', 1, 9), 'courage', 10
WHERE find_verse_id('Joshua', 1, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Deuteronomy', 31, 6), 'courage', 9
WHERE find_verse_id('Deuteronomy', 31, 6) IS NOT NULL;

-- DISAPPOINTMENT verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Romans', 8, 28), 'disappointment', 10
WHERE find_verse_id('Romans', 8, 28) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Psalm', 34, 18), 'disappointment', 8
WHERE find_verse_id('Psalm', 34, 18) IS NOT NULL;

-- WISDOM verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('James', 1, 5), 'wisdom', 10
WHERE find_verse_id('James', 1, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Proverbs', 9, 10), 'wisdom', 9
WHERE find_verse_id('Proverbs', 9, 10) IS NOT NULL;

-- GRATITUDE verses
INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('1 Thessalonians', 5, 18), 'gratitude', 10
WHERE find_verse_id('1 Thessalonians', 5, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, relevance_score)
SELECT find_verse_id('Psalm', 100, 4), 'gratitude', 9
WHERE find_verse_id('Psalm', 100, 4) IS NOT NULL;

-- Verify the inserted data
SELECT 
  cv.category,
  COUNT(*) as verse_count,
  AVG(cv.relevance_score) as avg_relevance
FROM curated_verses cv
GROUP BY cv.category
ORDER BY cv.category;

-- View sample curated verses
SELECT 
  cv.category,
  bv.book_name || ' ' || bv.chapter || ':' || bv.verse as reference,
  LEFT(bv.text, 100) || '...' as text_preview,
  cv.relevance_score
FROM curated_verses cv
JOIN bible_verses bv ON cv.verse_id = bv.id
ORDER BY cv.category, cv.relevance_score DESC
LIMIT 20;