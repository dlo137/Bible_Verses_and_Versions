-- Add more curated verses to prevent repetition
-- This will significantly expand your curated verses collection

-- LOVE verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 13, 4), 'love', 4
WHERE find_verse_id('1 Corinthians', 13, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 13, 7), 'love', 5
WHERE find_verse_id('1 Corinthians', 13, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 13, 13), 'love', 6
WHERE find_verse_id('1 Corinthians', 13, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('John', 13, 34), 'love', 7
WHERE find_verse_id('John', 13, 34) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 39), 'love', 8
WHERE find_verse_id('Romans', 8, 39) IS NOT NULL;

-- STRENGTH verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 46, 1), 'strength', 4
WHERE find_verse_id('Psalm', 46, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Joshua', 1, 9), 'strength', 5
WHERE find_verse_id('Joshua', 1, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 6, 10), 'strength', 6
WHERE find_verse_id('Ephesians', 6, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Nehemiah', 8, 10), 'strength', 7
WHERE find_verse_id('Nehemiah', 8, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 28, 7), 'strength', 8
WHERE find_verse_id('Psalm', 28, 7) IS NOT NULL;

-- HOPE verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 42, 11), 'hope', 3
WHERE find_verse_id('Psalm', 42, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Lamentations', 3, 22), 'hope', 4
WHERE find_verse_id('Lamentations', 3, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 130, 5), 'hope', 5
WHERE find_verse_id('Psalm', 130, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 1, 3), 'hope', 6
WHERE find_verse_id('1 Peter', 1, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 5, 5), 'hope', 7
WHERE find_verse_id('Romans', 5, 5) IS NOT NULL;

-- PEACE verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 26, 3), 'peace', 3
WHERE find_verse_id('Isaiah', 26, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 5, 1), 'peace', 4
WHERE find_verse_id('Romans', 5, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Thessalonians', 3, 16), 'peace', 5
WHERE find_verse_id('2 Thessalonians', 3, 16) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 4, 8), 'peace', 6
WHERE find_verse_id('Psalm', 4, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 54, 10), 'peace', 7
WHERE find_verse_id('Isaiah', 54, 10) IS NOT NULL;

-- GUIDANCE verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 32, 8), 'guidance', 3
WHERE find_verse_id('Psalm', 32, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 30, 21), 'guidance', 4
WHERE find_verse_id('Isaiah', 30, 21) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 25, 9), 'guidance', 5
WHERE find_verse_id('Psalm', 25, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 16, 9), 'guidance', 6
WHERE find_verse_id('Proverbs', 16, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('John', 16, 13), 'guidance', 7
WHERE find_verse_id('John', 16, 13) IS NOT NULL;

-- FAITH verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Mark', 11, 22), 'faith', 3
WHERE find_verse_id('Mark', 11, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 5, 7), 'faith', 4
WHERE find_verse_id('2 Corinthians', 5, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 17, 20), 'faith', 5
WHERE find_verse_id('Matthew', 17, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 2, 8), 'faith', 6
WHERE find_verse_id('Ephesians', 2, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Habakkuk', 2, 4), 'faith', 7
WHERE find_verse_id('Habakkuk', 2, 4) IS NOT NULL;

-- FORGIVENESS verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 6, 14), 'forgiveness', 3
WHERE find_verse_id('Matthew', 6, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 13), 'forgiveness', 4
WHERE find_verse_id('Colossians', 3, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 1, 18), 'forgiveness', 5
WHERE find_verse_id('Isaiah', 1, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 103, 12), 'forgiveness', 6
WHERE find_verse_id('Psalm', 103, 12) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Acts', 3, 19), 'forgiveness', 7
WHERE find_verse_id('Acts', 3, 19) IS NOT NULL;

-- COMFORT verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 5, 4), 'comfort', 3
WHERE find_verse_id('Matthew', 5, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 40, 1), 'comfort', 4
WHERE find_verse_id('Isaiah', 40, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Revelation', 21, 4), 'comfort', 5
WHERE find_verse_id('Revelation', 21, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 147, 3), 'comfort', 6
WHERE find_verse_id('Psalm', 147, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('John', 14, 1), 'comfort', 7
WHERE find_verse_id('John', 14, 1) IS NOT NULL;

-- COURAGE verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 27, 14), 'courage', 3
WHERE find_verse_id('Psalm', 27, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 16, 13), 'courage', 4
WHERE find_verse_id('1 Corinthians', 16, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Timothy', 1, 7), 'courage', 5
WHERE find_verse_id('2 Timothy', 1, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 41, 10), 'courage', 6
WHERE find_verse_id('Isaiah', 41, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 31, 24), 'courage', 7
WHERE find_verse_id('Psalm', 31, 24) IS NOT NULL;

-- DISAPPOINTMENT verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 61, 3), 'disappointment', 3
WHERE find_verse_id('Isaiah', 61, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 147, 3), 'disappointment', 4
WHERE find_verse_id('Psalm', 147, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 4, 8), 'disappointment', 5
WHERE find_verse_id('2 Corinthians', 4, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 30, 5), 'disappointment', 6
WHERE find_verse_id('Psalm', 30, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 18), 'disappointment', 7
WHERE find_verse_id('Romans', 8, 18) IS NOT NULL;

-- WISDOM verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 2, 6), 'wisdom', 3
WHERE find_verse_id('Proverbs', 2, 6) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 7, 12), 'wisdom', 4
WHERE find_verse_id('Ecclesiastes', 7, 12) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 27, 17), 'wisdom', 5
WHERE find_verse_id('Proverbs', 27, 17) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 16), 'wisdom', 6
WHERE find_verse_id('Colossians', 3, 16) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 111, 10), 'wisdom', 7
WHERE find_verse_id('Psalm', 111, 10) IS NOT NULL;

-- GRATITUDE verses (additional)
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 17), 'gratitude', 3
WHERE find_verse_id('Colossians', 3, 17) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 5, 20), 'gratitude', 4
WHERE find_verse_id('Ephesians', 5, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 107, 1), 'gratitude', 5
WHERE find_verse_id('Psalm', 107, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Chronicles', 16, 34), 'gratitude', 6
WHERE find_verse_id('1 Chronicles', 16, 34) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 95, 2), 'gratitude', 7
WHERE find_verse_id('Psalm', 95, 2) IS NOT NULL;

-- Add the missing categories with verses

-- HEALING verses
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Jeremiah', 17, 14), 'healing', 1
WHERE find_verse_id('Jeremiah', 17, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 103, 3), 'healing', 2
WHERE find_verse_id('Psalm', 103, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 53, 5), 'healing', 3
WHERE find_verse_id('Isaiah', 53, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 5, 15), 'healing', 4
WHERE find_verse_id('James', 5, 15) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 147, 3), 'healing', 5
WHERE find_verse_id('Psalm', 147, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 2, 24), 'healing', 6
WHERE find_verse_id('1 Peter', 2, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Malachi', 4, 2), 'healing', 7
WHERE find_verse_id('Malachi', 4, 2) IS NOT NULL;

-- PROTECTION verses
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 91, 1), 'protection', 1
WHERE find_verse_id('Psalm', 91, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 91, 2), 'protection', 2
WHERE find_verse_id('Psalm', 91, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 91, 11), 'protection', 3
WHERE find_verse_id('Psalm', 91, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 18, 10), 'protection', 4
WHERE find_verse_id('Proverbs', 18, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Thessalonians', 3, 3), 'protection', 5
WHERE find_verse_id('2 Thessalonians', 3, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 121, 7), 'protection', 6
WHERE find_verse_id('Psalm', 121, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 34, 7), 'protection', 7
WHERE find_verse_id('Psalm', 34, 7) IS NOT NULL;

-- PURPOSE verses
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Jeremiah', 29, 11), 'purpose', 1
WHERE find_verse_id('Jeremiah', 29, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 28), 'purpose', 2
WHERE find_verse_id('Romans', 8, 28) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 2, 10), 'purpose', 3
WHERE find_verse_id('Ephesians', 2, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 19, 21), 'purpose', 4
WHERE find_verse_id('Proverbs', 19, 21) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 138, 8), 'purpose', 5
WHERE find_verse_id('Psalm', 138, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 4, 10), 'purpose', 6
WHERE find_verse_id('1 Peter', 4, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 3, 1), 'purpose', 7
WHERE find_verse_id('Ecclesiastes', 3, 1) IS NOT NULL;

-- Verify the expanded collection
SELECT 
  cv.category,
  COUNT(*) as verse_count
FROM curated_verses cv
GROUP BY cv.category
ORDER BY cv.category;

-- Show total count
SELECT COUNT(*) as total_curated_verses FROM curated_verses;