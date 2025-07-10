/*
  # Add coins_won column to word_search_scores table

  1. Changes
    - Add `coins_won` column to `word_search_scores` table
    - Set default value to 0
    - Make it non-nullable with default

  This fixes the error where the application expects a `coins_won` column
  that doesn't exist in the current database schema.
*/

-- Add the missing coins_won column to word_search_scores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'word_search_scores' AND column_name = 'coins_won'
  ) THEN
    ALTER TABLE word_search_scores ADD COLUMN coins_won integer DEFAULT 0 NOT NULL;
  END IF;
END $$;