
-- Add the missing column for friend challenges
ALTER TABLE chess_games ADD COLUMN IF NOT EXISTS is_friend_challenge BOOLEAN DEFAULT FALSE;
