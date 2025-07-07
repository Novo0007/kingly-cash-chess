-- Create game2048_scores table for tracking 2048 game scores and leaderboards
CREATE TABLE IF NOT EXISTS public.game2048_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    moves INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('classic', 'challenge', 'expert')),
    board_size INTEGER NOT NULL,
    target_reached INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game2048_scores_user_id ON public.game2048_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game2048_scores_difficulty ON public.game2048_scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_game2048_scores_score ON public.game2048_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game2048_scores_completed_at ON public.game2048_scores(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_game2048_scores_difficulty_score ON public.game2048_scores(difficulty, score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.game2048_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can insert their own 2048 scores" ON public.game2048_scores;
CREATE POLICY "Users can insert their own 2048 scores" ON public.game2048_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own 2048 scores" ON public.game2048_scores;
CREATE POLICY "Users can view their own 2048 scores" ON public.game2048_scores
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view leaderboard 2048 scores" ON public.game2048_scores;
CREATE POLICY "Users can view leaderboard 2048 scores" ON public.game2048_scores
    FOR SELECT USING (true);
