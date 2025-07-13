-- Add level system support to math_scores table

-- Add new columns for level system
ALTER TABLE math_scores 
ADD COLUMN IF NOT EXISTS level_number integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS elimination_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS level_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS final_accuracy decimal(5,4) DEFAULT 0.0000;

-- Create index for level-based queries
CREATE INDEX IF NOT EXISTS idx_math_scores_level_number ON math_scores(level_number);
CREATE INDEX IF NOT EXISTS idx_math_scores_elimination_mode ON math_scores(elimination_mode);
CREATE INDEX IF NOT EXISTS idx_math_scores_level_completed ON math_scores(level_completed);

-- Create a separate table for level progress tracking
CREATE TABLE IF NOT EXISTS math_level_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level integer DEFAULT 1,
    highest_level_reached integer DEFAULT 1,
    total_score bigint DEFAULT 0,
    total_questions_answered integer DEFAULT 0,
    total_correct_answers integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    levels_completed integer[] DEFAULT '{}',
    overall_accuracy decimal(5,4) DEFAULT 0.0000,
    rank_title text DEFAULT 'Novice',
    last_played_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    UNIQUE(user_id)
);

-- Create indexes for math_level_progress
CREATE INDEX IF NOT EXISTS idx_math_level_progress_user_id ON math_level_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_math_level_progress_current_level ON math_level_progress(current_level);
CREATE INDEX IF NOT EXISTS idx_math_level_progress_highest_level ON math_level_progress(highest_level_reached);
CREATE INDEX IF NOT EXISTS idx_math_level_progress_total_score ON math_level_progress(total_score);

-- Enable RLS (Row Level Security)
ALTER TABLE math_level_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for math_level_progress
CREATE POLICY "Users can view their own level progress" ON math_level_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level progress" ON math_level_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own level progress" ON math_level_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own level progress" ON math_level_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for level leaderboard
CREATE OR REPLACE VIEW math_level_leaderboard AS
SELECT 
    user_id,
    (SELECT username FROM math_scores WHERE math_scores.user_id = mlp.user_id LIMIT 1) as username,
    current_level,
    highest_level_reached,
    total_score,
    overall_accuracy,
    longest_streak,
    array_length(levels_completed, 1) as completed_levels_count,
    rank_title,
    last_played_at,
    RANK() OVER (ORDER BY highest_level_reached DESC, total_score DESC, overall_accuracy DESC) as rank
FROM math_level_progress mlp
WHERE total_questions_answered > 0
ORDER BY rank;

-- Create a function to update level progress
CREATE OR REPLACE FUNCTION update_math_level_progress(
    p_user_id uuid,
    p_current_level integer,
    p_highest_level integer,
    p_score_delta bigint,
    p_questions_delta integer,
    p_correct_delta integer,
    p_new_streak integer,
    p_max_streak integer,
    p_completed_levels integer[],
    p_rank_title text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_accuracy decimal(5,4);
BEGIN
    -- Calculate new accuracy
    WITH current_stats AS (
        SELECT 
            COALESCE(total_questions_answered, 0) + p_questions_delta as total_q,
            COALESCE(total_correct_answers, 0) + p_correct_delta as total_c
        FROM math_level_progress 
        WHERE user_id = p_user_id
    )
    SELECT 
        CASE 
            WHEN total_q > 0 THEN ROUND((total_c::decimal / total_q::decimal), 4)
            ELSE 0.0000
        END INTO new_accuracy
    FROM current_stats;

    -- Insert or update level progress
    INSERT INTO math_level_progress (
        user_id,
        current_level,
        highest_level_reached,
        total_score,
        total_questions_answered,
        total_correct_answers,
        current_streak,
        longest_streak,
        levels_completed,
        overall_accuracy,
        rank_title,
        last_played_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_current_level,
        p_highest_level,
        p_score_delta,
        p_questions_delta,
        p_correct_delta,
        p_new_streak,
        p_max_streak,
        p_completed_levels,
        new_accuracy,
        p_rank_title,
        now(),
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_level = GREATEST(math_level_progress.current_level, p_current_level),
        highest_level_reached = GREATEST(math_level_progress.highest_level_reached, p_highest_level),
        total_score = math_level_progress.total_score + p_score_delta,
        total_questions_answered = math_level_progress.total_questions_answered + p_questions_delta,
        total_correct_answers = math_level_progress.total_correct_answers + p_correct_delta,
        current_streak = p_new_streak,
        longest_streak = GREATEST(math_level_progress.longest_streak, p_max_streak),
        levels_completed = p_completed_levels,
        overall_accuracy = new_accuracy,
        rank_title = p_rank_title,
        last_played_at = now(),
        updated_at = now();
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_math_level_progress TO authenticated;
GRANT SELECT ON math_level_leaderboard TO authenticated;

-- Add comments
COMMENT ON TABLE math_level_progress IS 'Tracks individual user progress through the 99-level math challenge system';
COMMENT ON VIEW math_level_leaderboard IS 'Leaderboard view showing user rankings based on level progress and performance';
COMMENT ON FUNCTION update_math_level_progress IS 'Updates user level progress with new game results';
