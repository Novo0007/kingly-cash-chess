-- Create maze_scores table for tracking maze game scores and leaderboards
CREATE TABLE IF NOT EXISTS public.maze_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL, -- Time in milliseconds
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    maze_size INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maze_scores_user_id ON public.maze_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_maze_scores_difficulty ON public.maze_scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_maze_scores_score ON public.maze_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_maze_scores_completed_at ON public.maze_scores(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_maze_scores_difficulty_score ON public.maze_scores(difficulty, score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.maze_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can insert their own scores
CREATE POLICY "Users can insert their own maze scores" ON public.maze_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own scores
CREATE POLICY "Users can view their own maze scores" ON public.maze_scores
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view all scores for leaderboard (without user_id filter)
CREATE POLICY "Users can view leaderboard maze scores" ON public.maze_scores
    FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_maze_scores_updated_at
    BEFORE UPDATE ON public.maze_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.maze_scores TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
