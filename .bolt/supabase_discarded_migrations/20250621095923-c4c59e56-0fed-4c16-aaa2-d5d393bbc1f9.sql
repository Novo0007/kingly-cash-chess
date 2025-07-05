
-- Add game_name column to chess_games table
ALTER TABLE public.chess_games 
ADD COLUMN game_name TEXT;

-- Set a default value for existing games
UPDATE public.chess_games 
SET game_name = 'Chess Game #' || EXTRACT(EPOCH FROM created_at)::INTEGER 
WHERE game_name IS NULL;
