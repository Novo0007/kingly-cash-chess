-- Create weekly ranking badges table
CREATE TABLE public.weekly_ranking_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 3),
  badge_type TEXT NOT NULL CHECK (badge_type IN ('gold', 'silver', 'bronze')),
  game_type TEXT NOT NULL DEFAULT 'word_search',
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start, game_type)
);

-- Enable RLS
ALTER TABLE public.weekly_ranking_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly ranking badges
CREATE POLICY "Users can view all badges" ON public.weekly_ranking_badges
FOR SELECT USING (true);

CREATE POLICY "System can insert badges" ON public.weekly_ranking_badges
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update badges" ON public.weekly_ranking_badges
FOR UPDATE USING (true);

-- Create index for efficient queries
CREATE INDEX idx_weekly_badges_week_game ON public.weekly_ranking_badges(week_start, game_type);
CREATE INDEX idx_weekly_badges_user ON public.weekly_ranking_badges(user_id);

-- Add weekly leaderboard view for highest score per player
CREATE OR REPLACE VIEW public.weekly_leaderboard AS
WITH weekly_scores AS (
  SELECT 
    user_id,
    username,
    MAX(score) as highest_score,
    difficulty,
    completed_at,
    DATE_TRUNC('week', completed_at) as week_start
  FROM word_search_scores 
  WHERE completed_at >= DATE_TRUNC('week', CURRENT_DATE)
  GROUP BY user_id, username, difficulty, completed_at, DATE_TRUNC('week', completed_at)
)
SELECT 
  user_id,
  username,
  highest_score as score,
  difficulty,
  completed_at,
  week_start,
  ROW_NUMBER() OVER (ORDER BY highest_score DESC) as rank
FROM weekly_scores
ORDER BY highest_score DESC;