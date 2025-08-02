-- Drop maze, 2048, and ludo game tables
DROP TABLE IF EXISTS public.maze_scores CASCADE;
DROP TABLE IF EXISTS public.game2048_scores CASCADE;
DROP TABLE IF EXISTS public.ludo_moves CASCADE;
DROP TABLE IF EXISTS public.ludo_games CASCADE;

-- Create unified global ranking system that sums high scores from all remaining games per user
CREATE OR REPLACE VIEW public.global_rankings AS
WITH user_game_scores AS (
  -- Math scores
  SELECT 
    user_id,
    username,
    'math' as game_type,
    MAX(score) as high_score
  FROM public.math_scores
  GROUP BY user_id, username
  
  UNION ALL
  
  -- Memory scores
  SELECT 
    user_id,
    username,
    'memory' as game_type,
    MAX(score) as high_score
  FROM public.memory_scores
  GROUP BY user_id, username
  
  UNION ALL
  
  -- Chess scores (using chess_rating from profiles)
  SELECT 
    p.id as user_id,
    p.username,
    'chess' as game_type,
    COALESCE(p.chess_rating, 1200) as high_score
  FROM public.profiles p
  WHERE p.chess_rating IS NOT NULL
  
  UNION ALL
  
  -- Word search scores (from fourpics_scores)
  SELECT 
    user_id,
    'Anonymous' as username,
    'word_search' as game_type,
    SUM(coins_earned) as high_score
  FROM public.fourpics_scores
  GROUP BY user_id
),
user_totals AS (
  SELECT 
    user_id,
    COALESCE(MAX(username), 'Anonymous') as username,
    SUM(high_score) as total_score,
    COUNT(DISTINCT game_type) as games_played
  FROM user_game_scores
  GROUP BY user_id
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY total_score DESC, games_played DESC) as rank,
  user_id,
  username,
  total_score,
  games_played
FROM user_totals
WHERE total_score > 0
ORDER BY total_score DESC, games_played DESC;