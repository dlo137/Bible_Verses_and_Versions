-- Update find_verse_id function to return only ASV translation (translation_id = 1)
-- This ensures all curated verses use the ASV translation consistently

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
    AND translation_id = 1  -- ASV translation only
  LIMIT 1;

  RETURN verse_id;
END;
$$ LANGUAGE plpgsql;

-- Verify the function update
SELECT 'Function updated successfully. Now only ASV verses (translation_id = 1) will be used for curated verses.' AS status;

-- Optional: Check if there are any existing curated verses that point to non-ASV translations
-- This query will show you if you need to re-run the curated verses insertion scripts
SELECT
  cv.id,
  cv.category,
  cv.sort_index,
  bv.book_name,
  bv.chapter,
  bv.verse,
  bv.translation_id,
  CASE
    WHEN bv.translation_id = 1 THEN 'ASV ✓'
    ELSE 'NOT ASV - needs update ⚠'
  END as translation_status
FROM curated_verses cv
JOIN bible_verses bv ON cv.verse_id = bv.id
WHERE bv.translation_id != 1
ORDER BY cv.category, cv.sort_index;

-- If the query above returns rows, you should delete those curated verses and re-insert them
-- using the updated find_verse_id() function which now only returns ASV verses
