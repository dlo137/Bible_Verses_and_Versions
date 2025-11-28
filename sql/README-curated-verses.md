# Curated Verses SQL Scripts

This directory contains SQL scripts for managing curated Bible verses across different categories.

## Overview

The curated verses feature allows you to organize Bible verses by meaningful categories to help users find relevant scriptures for their current life situations.

## Files

### `create-curated-verses.sql`
Initial setup script that:
- Creates the `curated_verses` table
- Creates the `find_verse_id()` helper function
- Adds sample verses for initial categories

### `add-new-curated-categories.sql`
Comprehensive script adding **175 verses** across 7 new categories:
- **Hope** (25 verses) - Finding hope in difficult times
- **Struggle** (25 verses) - Overcoming trials and hardships
- **Addiction** (25 verses) - Breaking free from bondage
- **Family** (25 verses) - Building strong family relationships
- **Work** (25 verses) - Honoring God through work
- **Desperation** (25 verses) - Crying out to God
- **Anger** (25 verses) - Managing anger and finding peace

## How to Run the Scripts

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/etfhutmmkoxbjjaxbotv
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `add-new-curated-categories.sql`
5. Paste into the query editor
6. Click "Run" to execute

### Option 2: Using Local Supabase CLI

If you have Supabase CLI installed locally:

```bash
# Apply the migration
npx supabase db execute --file sql/add-new-curated-categories.sql --db-url "your-database-url"
```

### Option 3: Direct PostgreSQL Connection

If you have direct access to your PostgreSQL database:

```bash
psql -h your-host -U your-user -d your-database -f sql/add-new-curated-categories.sql
```

## Verifying the Data

After running the script, you can verify the verses were added by running this query in the SQL Editor:

```sql
SELECT
  category,
  COUNT(*) as verse_count
FROM curated_verses
WHERE category IN ('hope', 'struggle', 'addiction', 'family', 'work', 'desperation', 'anger')
GROUP BY category
ORDER BY category;
```

You should see approximately 25 verses per category.

## Category Details

### Hope (25 verses)
Verses about God's promises, waiting on the Lord, and finding hope in difficult times.
- Jeremiah 29:11, Romans 15:13, Psalm 42:5, Lamentations 3:22-23, and more

### Struggle (25 verses)
Verses about persevering through trials, God's strength in weakness, and overcoming hardships.
- Romans 8:28, 2 Corinthians 12:9, James 1:2-3, John 16:33, and more

### Addiction (25 verses)
Verses about freedom from bondage, breaking chains, renewing the mind, and self-control.
- 1 Corinthians 10:13, Romans 6:14, 2 Corinthians 5:17, John 8:36, and more

### Family (25 verses)
Verses about marriage, parenting, honoring parents, and godly family relationships.
- Joshua 24:15, Proverbs 22:6, Ephesians 6:1-4, Colossians 3:20-21, and more

### Work (25 verses)
Verses about working unto the Lord, diligence, integrity, and honoring God through work.
- Colossians 3:23-24, Proverbs 16:3, 1 Corinthians 10:31, Ecclesiastes 9:10, and more

### Desperation (25 verses)
Verses for crying out to God, finding Him in desperate times, and being rescued from the pit.
- Psalm 34:18, Psalm 46:1, Psalm 18:6, Lamentations 3:55-56, and more

### Anger (25 verses)
Verses about controlling anger, being slow to anger, and finding peace.
- Ephesians 4:26-27, James 1:19-20, Proverbs 15:1, Proverbs 29:11, and more

## Database Schema

```sql
CREATE TABLE curated_verses (
  id SERIAL PRIMARY KEY,
  verse_id INTEGER REFERENCES bible_verses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  sort_index INTEGER,
  relevance_score INTEGER DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## TypeScript Integration

The categories are already defined in `lib/supabase.ts`:

```typescript
export type VerseCategory =
  | 'love' | 'strength' | 'disappointment' | 'hope'
  | 'peace' | 'guidance' | 'faith' | 'forgiveness'
  | 'comfort' | 'courage' | 'gratitude' | 'wisdom'
  | 'healing' | 'protection' | 'purpose'
  | 'struggle' | 'addiction' | 'family'
  | 'work' | 'desperation' | 'anger';
```

## Notes

- Each verse is inserted with a `sort_index` to maintain a consistent order
- The script uses `WHERE NOT EXISTS` checks to prevent duplicate insertions
- If a verse reference doesn't exist in your bible_verses table, it will be skipped (returns NULL from find_verse_id)
- The script is safe to run multiple times - it won't create duplicates

## Troubleshooting

**Issue**: "function find_verse_id does not exist"
**Solution**: Run `create-curated-verses.sql` first to create the helper function

**Issue**: "No verses are being inserted"
**Solution**: Verify that the bible_verses table has data and that book names match exactly (e.g., "1 John" not "1John")

**Issue**: "Some verses are missing"
**Solution**: Check if those specific verse references exist in your bible_verses table with the exact book name, chapter, and verse numbers

## Support

For questions or issues, please open an issue in the GitHub repository.
