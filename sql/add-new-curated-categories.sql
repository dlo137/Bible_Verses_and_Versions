-- Add 150+ curated verses across new categories: hope, struggle, addiction, family, work, desperation, and anger
-- This script uses the existing find_verse_id function from create-curated-verses.sql

-- ============================================
-- HOPE VERSES (25 verses)
-- ============================================

-- Hope in God's promises
INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Jeremiah', 29, 11), 'hope', 1
WHERE find_verse_id('Jeremiah', 29, 11) IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM curated_verses WHERE verse_id = find_verse_id('Jeremiah', 29, 11) AND category = 'hope'
);

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 15, 13), 'hope', 2
WHERE find_verse_id('Romans', 15, 13) IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM curated_verses WHERE verse_id = find_verse_id('Romans', 15, 13) AND category = 'hope'
);

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 147, 11), 'hope', 3
WHERE find_verse_id('Psalm', 147, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Lamentations', 3, 22), 'hope', 4
WHERE find_verse_id('Lamentations', 3, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Lamentations', 3, 23), 'hope', 5
WHERE find_verse_id('Lamentations', 3, 23) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 42, 5), 'hope', 6
WHERE find_verse_id('Psalm', 42, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 130, 5), 'hope', 7
WHERE find_verse_id('Psalm', 130, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Hebrews', 11, 1), 'hope', 8
WHERE find_verse_id('Hebrews', 11, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 33, 18), 'hope', 9
WHERE find_verse_id('Psalm', 33, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 5, 5), 'hope', 10
WHERE find_verse_id('Romans', 5, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 62, 5), 'hope', 11
WHERE find_verse_id('Psalm', 62, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 40, 31), 'hope', 12
WHERE find_verse_id('Isaiah', 40, 31) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 71, 5), 'hope', 13
WHERE find_verse_id('Psalm', 71, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 1, 3), 'hope', 14
WHERE find_verse_id('1 Peter', 1, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 23, 18), 'hope', 15
WHERE find_verse_id('Proverbs', 23, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Hebrews', 6, 19), 'hope', 16
WHERE find_verse_id('Hebrews', 6, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 31, 24), 'hope', 17
WHERE find_verse_id('Psalm', 31, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 24), 'hope', 18
WHERE find_verse_id('Romans', 8, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 39, 7), 'hope', 19
WHERE find_verse_id('Psalm', 39, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 1, 27), 'hope', 20
WHERE find_verse_id('Colossians', 1, 27) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Titus', 2, 13), 'hope', 21
WHERE find_verse_id('Titus', 2, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 12, 12), 'hope', 22
WHERE find_verse_id('Romans', 12, 12) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Thessalonians', 5, 8), 'hope', 23
WHERE find_verse_id('1 Thessalonians', 5, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 146, 5), 'hope', 24
WHERE find_verse_id('Psalm', 146, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 5, 4), 'hope', 25
WHERE find_verse_id('Romans', 5, 4) IS NOT NULL;

-- ============================================
-- STRUGGLE VERSES (25 verses)
-- ============================================

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 28), 'struggle', 1
WHERE find_verse_id('Romans', 8, 28) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 12, 9), 'struggle', 2
WHERE find_verse_id('2 Corinthians', 12, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 1, 2), 'struggle', 3
WHERE find_verse_id('James', 1, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 1, 3), 'struggle', 4
WHERE find_verse_id('James', 1, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 5, 3), 'struggle', 5
WHERE find_verse_id('Romans', 5, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 4, 17), 'struggle', 6
WHERE find_verse_id('2 Corinthians', 4, 17) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 34, 19), 'struggle', 7
WHERE find_verse_id('Psalm', 34, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('John', 16, 33), 'struggle', 8
WHERE find_verse_id('John', 16, 33) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 41, 10), 'struggle', 9
WHERE find_verse_id('Isaiah', 41, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 46, 1), 'struggle', 10
WHERE find_verse_id('Psalm', 46, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Philippians', 4, 13), 'struggle', 11
WHERE find_verse_id('Philippians', 4, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 55, 22), 'struggle', 12
WHERE find_verse_id('Psalm', 55, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 5, 7), 'struggle', 13
WHERE find_verse_id('1 Peter', 5, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 11, 28), 'struggle', 14
WHERE find_verse_id('Matthew', 11, 28) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Deuteronomy', 31, 8), 'struggle', 15
WHERE find_verse_id('Deuteronomy', 31, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 73, 26), 'struggle', 16
WHERE find_verse_id('Psalm', 73, 26) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Nahum', 1, 7), 'struggle', 17
WHERE find_verse_id('Nahum', 1, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 27, 1), 'struggle', 18
WHERE find_verse_id('Psalm', 27, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 43, 2), 'struggle', 19
WHERE find_verse_id('Isaiah', 43, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 18), 'struggle', 20
WHERE find_verse_id('Romans', 8, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 50, 15), 'struggle', 21
WHERE find_verse_id('Psalm', 50, 15) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 4, 8), 'struggle', 22
WHERE find_verse_id('2 Corinthians', 4, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 4, 9), 'struggle', 23
WHERE find_verse_id('2 Corinthians', 4, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Hebrews', 12, 11), 'struggle', 24
WHERE find_verse_id('Hebrews', 12, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 8, 37), 'struggle', 25
WHERE find_verse_id('Romans', 8, 37) IS NOT NULL;

-- ============================================
-- ADDICTION VERSES (25 verses)
-- ============================================

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 10, 13), 'addiction', 1
WHERE find_verse_id('1 Corinthians', 10, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 6, 14), 'addiction', 2
WHERE find_verse_id('Romans', 6, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Corinthians', 5, 17), 'addiction', 3
WHERE find_verse_id('2 Corinthians', 5, 17) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('John', 8, 36), 'addiction', 4
WHERE find_verse_id('John', 8, 36) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 12, 2), 'addiction', 5
WHERE find_verse_id('Romans', 12, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Galatians', 5, 1), 'addiction', 6
WHERE find_verse_id('Galatians', 5, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 6, 12), 'addiction', 7
WHERE find_verse_id('1 Corinthians', 6, 12) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 20, 1), 'addiction', 8
WHERE find_verse_id('Proverbs', 20, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 5, 18), 'addiction', 9
WHERE find_verse_id('Ephesians', 5, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 6, 12), 'addiction', 10
WHERE find_verse_id('Romans', 6, 12) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 5, 8), 'addiction', 11
WHERE find_verse_id('1 Peter', 5, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 1, 14), 'addiction', 12
WHERE find_verse_id('James', 1, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 13, 14), 'addiction', 13
WHERE find_verse_id('Romans', 13, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Galatians', 5, 16), 'addiction', 14
WHERE find_verse_id('Galatians', 5, 16) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 6, 19), 'addiction', 15
WHERE find_verse_id('1 Corinthians', 6, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 6, 20), 'addiction', 16
WHERE find_verse_id('1 Corinthians', 6, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 119, 133), 'addiction', 17
WHERE find_verse_id('Psalm', 119, 133) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 5, 22), 'addiction', 18
WHERE find_verse_id('Proverbs', 5, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Peter', 2, 19), 'addiction', 19
WHERE find_verse_id('2 Peter', 2, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 6, 22), 'addiction', 20
WHERE find_verse_id('Romans', 6, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Philippians', 3, 13), 'addiction', 21
WHERE find_verse_id('Philippians', 3, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Philippians', 3, 14), 'addiction', 22
WHERE find_verse_id('Philippians', 3, 14) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Titus', 2, 12), 'addiction', 23
WHERE find_verse_id('Titus', 2, 12) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 4, 7), 'addiction', 24
WHERE find_verse_id('James', 4, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 51, 10), 'addiction', 25
WHERE find_verse_id('Psalm', 51, 10) IS NOT NULL;

-- ============================================
-- FAMILY VERSES (25 verses)
-- ============================================

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Joshua', 24, 15), 'family', 1
WHERE find_verse_id('Joshua', 24, 15) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 22, 6), 'family', 2
WHERE find_verse_id('Proverbs', 22, 6) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 6, 4), 'family', 3
WHERE find_verse_id('Ephesians', 6, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 20), 'family', 4
WHERE find_verse_id('Colossians', 3, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 6, 1), 'family', 5
WHERE find_verse_id('Ephesians', 6, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 6, 2), 'family', 6
WHERE find_verse_id('Ephesians', 6, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 17, 6), 'family', 7
WHERE find_verse_id('Proverbs', 17, 6) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 21), 'family', 8
WHERE find_verse_id('Colossians', 3, 21) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Timothy', 5, 8), 'family', 9
WHERE find_verse_id('1 Timothy', 5, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 127, 3), 'family', 10
WHERE find_verse_id('Psalm', 127, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 31, 28), 'family', 11
WHERE find_verse_id('Proverbs', 31, 28) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Genesis', 2, 24), 'family', 12
WHERE find_verse_id('Genesis', 2, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 5, 25), 'family', 13
WHERE find_verse_id('Ephesians', 5, 25) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Peter', 3, 7), 'family', 14
WHERE find_verse_id('1 Peter', 3, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 18, 22), 'family', 15
WHERE find_verse_id('Proverbs', 18, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 4, 9), 'family', 16
WHERE find_verse_id('Ecclesiastes', 4, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 4, 10), 'family', 17
WHERE find_verse_id('Ecclesiastes', 4, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Mark', 10, 9), 'family', 18
WHERE find_verse_id('Mark', 10, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 15, 1), 'family', 19
WHERE find_verse_id('Proverbs', 15, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 12, 4), 'family', 20
WHERE find_verse_id('Proverbs', 12, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 13, 4), 'family', 21
WHERE find_verse_id('1 Corinthians', 13, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Malachi', 2, 16), 'family', 22
WHERE find_verse_id('Malachi', 2, 16) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 13, 24), 'family', 23
WHERE find_verse_id('Proverbs', 13, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('3 John', 1, 4), 'family', 24
WHERE find_verse_id('3 John', 1, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Deuteronomy', 6, 7), 'family', 25
WHERE find_verse_id('Deuteronomy', 6, 7) IS NOT NULL;

-- ============================================
-- WORK VERSES (25 verses)
-- ============================================

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 23), 'work', 1
WHERE find_verse_id('Colossians', 3, 23) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 24), 'work', 2
WHERE find_verse_id('Colossians', 3, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 16, 3), 'work', 3
WHERE find_verse_id('Proverbs', 16, 3) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Corinthians', 10, 31), 'work', 4
WHERE find_verse_id('1 Corinthians', 10, 31) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 14, 23), 'work', 5
WHERE find_verse_id('Proverbs', 14, 23) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 13, 4), 'work', 6
WHERE find_verse_id('Proverbs', 13, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 9, 10), 'work', 7
WHERE find_verse_id('Ecclesiastes', 9, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 12, 11), 'work', 8
WHERE find_verse_id('Proverbs', 12, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('2 Thessalonians', 3, 10), 'work', 9
WHERE find_verse_id('2 Thessalonians', 3, 10) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 21, 5), 'work', 10
WHERE find_verse_id('Proverbs', 21, 5) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 10, 4), 'work', 11
WHERE find_verse_id('Proverbs', 10, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Timothy', 5, 18), 'work', 12
WHERE find_verse_id('1 Timothy', 5, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 22, 29), 'work', 13
WHERE find_verse_id('Proverbs', 22, 29) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 5, 16), 'work', 14
WHERE find_verse_id('Matthew', 5, 16) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 6, 7), 'work', 15
WHERE find_verse_id('Ephesians', 6, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Thessalonians', 4, 11), 'work', 16
WHERE find_verse_id('1 Thessalonians', 4, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 18, 9), 'work', 17
WHERE find_verse_id('Proverbs', 18, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 6, 6), 'work', 18
WHERE find_verse_id('Proverbs', 6, 6) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 6, 7), 'work', 19
WHERE find_verse_id('Proverbs', 6, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 6, 8), 'work', 20
WHERE find_verse_id('Proverbs', 6, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Genesis', 2, 15), 'work', 21
WHERE find_verse_id('Genesis', 2, 15) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 27, 18), 'work', 22
WHERE find_verse_id('Proverbs', 27, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Luke', 10, 7), 'work', 23
WHERE find_verse_id('Luke', 10, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 16, 26), 'work', 24
WHERE find_verse_id('Proverbs', 16, 26) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 5, 12), 'work', 25
WHERE find_verse_id('Ecclesiastes', 5, 12) IS NOT NULL;

-- ============================================
-- DESPERATION VERSES (25 verses)
-- ============================================

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 34, 18), 'desperation', 1
WHERE find_verse_id('Psalm', 34, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 46, 1), 'desperation', 2
WHERE find_verse_id('Psalm', 46, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 18, 6), 'desperation', 3
WHERE find_verse_id('Psalm', 18, 6) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 120, 1), 'desperation', 4
WHERE find_verse_id('Psalm', 120, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 40, 1), 'desperation', 5
WHERE find_verse_id('Psalm', 40, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 40, 2), 'desperation', 6
WHERE find_verse_id('Psalm', 40, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Lamentations', 3, 55), 'desperation', 7
WHERE find_verse_id('Lamentations', 3, 55) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Lamentations', 3, 56), 'desperation', 8
WHERE find_verse_id('Lamentations', 3, 56) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 61, 1), 'desperation', 9
WHERE find_verse_id('Psalm', 61, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 61, 2), 'desperation', 10
WHERE find_verse_id('Psalm', 61, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 86, 7), 'desperation', 11
WHERE find_verse_id('Psalm', 86, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 102, 1), 'desperation', 12
WHERE find_verse_id('Psalm', 102, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 102, 2), 'desperation', 13
WHERE find_verse_id('Psalm', 102, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 130, 1), 'desperation', 14
WHERE find_verse_id('Psalm', 130, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 130, 2), 'desperation', 15
WHERE find_verse_id('Psalm', 130, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Isaiah', 41, 13), 'desperation', 16
WHERE find_verse_id('Isaiah', 41, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 107, 13), 'desperation', 17
WHERE find_verse_id('Psalm', 107, 13) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 107, 19), 'desperation', 18
WHERE find_verse_id('Psalm', 107, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 107, 20), 'desperation', 19
WHERE find_verse_id('Psalm', 107, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 69, 1), 'desperation', 20
WHERE find_verse_id('Psalm', 69, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 69, 2), 'desperation', 21
WHERE find_verse_id('Psalm', 69, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 142, 1), 'desperation', 22
WHERE find_verse_id('Psalm', 142, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Jonah', 2, 2), 'desperation', 23
WHERE find_verse_id('Jonah', 2, 2) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 11, 28), 'desperation', 24
WHERE find_verse_id('Matthew', 11, 28) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 91, 15), 'desperation', 25
WHERE find_verse_id('Psalm', 91, 15) IS NOT NULL;

-- ============================================
-- ANGER VERSES (25 verses)
-- ============================================

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 4, 26), 'anger', 1
WHERE find_verse_id('Ephesians', 4, 26) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 4, 27), 'anger', 2
WHERE find_verse_id('Ephesians', 4, 27) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 1, 19), 'anger', 3
WHERE find_verse_id('James', 1, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('James', 1, 20), 'anger', 4
WHERE find_verse_id('James', 1, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 15, 1), 'anger', 5
WHERE find_verse_id('Proverbs', 15, 1) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 29, 11), 'anger', 6
WHERE find_verse_id('Proverbs', 29, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 14, 29), 'anger', 7
WHERE find_verse_id('Proverbs', 14, 29) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 16, 32), 'anger', 8
WHERE find_verse_id('Proverbs', 16, 32) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 19, 11), 'anger', 9
WHERE find_verse_id('Proverbs', 19, 11) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ecclesiastes', 7, 9), 'anger', 10
WHERE find_verse_id('Ecclesiastes', 7, 9) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Colossians', 3, 8), 'anger', 11
WHERE find_verse_id('Colossians', 3, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 37, 8), 'anger', 12
WHERE find_verse_id('Psalm', 37, 8) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 22, 24), 'anger', 13
WHERE find_verse_id('Proverbs', 22, 24) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 22, 25), 'anger', 14
WHERE find_verse_id('Proverbs', 22, 25) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 29, 22), 'anger', 15
WHERE find_verse_id('Proverbs', 29, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 15, 18), 'anger', 16
WHERE find_verse_id('Proverbs', 15, 18) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Matthew', 5, 22), 'anger', 17
WHERE find_verse_id('Matthew', 5, 22) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Titus', 1, 7), 'anger', 18
WHERE find_verse_id('Titus', 1, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Proverbs', 21, 19), 'anger', 19
WHERE find_verse_id('Proverbs', 21, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Genesis', 4, 7), 'anger', 20
WHERE find_verse_id('Genesis', 4, 7) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Psalm', 4, 4), 'anger', 21
WHERE find_verse_id('Psalm', 4, 4) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Romans', 12, 19), 'anger', 22
WHERE find_verse_id('Romans', 12, 19) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Ephesians', 4, 31), 'anger', 23
WHERE find_verse_id('Ephesians', 4, 31) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('Galatians', 5, 20), 'anger', 24
WHERE find_verse_id('Galatians', 5, 20) IS NOT NULL;

INSERT INTO curated_verses (verse_id, category, sort_index)
SELECT find_verse_id('1 Timothy', 2, 8), 'anger', 25
WHERE find_verse_id('1 Timothy', 2, 8) IS NOT NULL;

-- ============================================
-- Summary Query
-- ============================================
-- Show counts per category
SELECT
  category,
  COUNT(*) as verse_count
FROM curated_verses
WHERE category IN ('hope', 'struggle', 'addiction', 'family', 'work', 'desperation', 'anger')
GROUP BY category
ORDER BY category;
