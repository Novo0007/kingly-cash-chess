-- Create math_scores table for tracking Math Brain Puzzles game scores and leaderboards
CREATE TABLE IF NOT EXISTS public.math_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    game_mode TEXT NOT NULL CHECK (game_mode IN ('practice', 'timed', 'endless')),
    max_streak INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    skips_used INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_math_scores_user_id ON public.math_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_math_scores_difficulty ON public.math_scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_math_scores_game_mode ON public.math_scores(game_mode);
CREATE INDEX IF NOT EXISTS idx_math_scores_score ON public.math_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_math_scores_completed_at ON public.math_scores(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_scores_difficulty_mode_score ON public.math_scores(difficulty, game_mode, score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.math_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can insert their own math scores" ON public.math_scores;
CREATE POLICY "Users can insert their own math scores" ON public.math_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own math scores" ON public.math_scores;
CREATE POLICY "Users can view their own math scores" ON public.math_scores
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view leaderboard math scores" ON public.math_scores;
CREATE POLICY "Users can view leaderboard math scores" ON public.math_scores
    FOR SELECT USING (true);
