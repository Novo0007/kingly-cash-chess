-- Create Hangman scores table
CREATE TABLE IF NOT EXISTS hangman_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    level_number INTEGER NOT NULL DEFAULT 1,
    word TEXT NOT NULL,
    category TEXT NOT NULL,
    guessed_letters TEXT[] NOT NULL DEFAULT '{}',
    wrong_guesses INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER NOT NULL DEFAULT 0, -- Time in seconds
    points_earned INTEGER NOT NULL DEFAULT 0,
    is_perfect BOOLEAN NOT NULL DEFAULT FALSE, -- No wrong guesses and no hints
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    hints_used INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Hangman progress table
CREATE TABLE IF NOT EXISTS hangman_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1,
    total_levels_completed INTEGER NOT NULL DEFAULT 0,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    total_wrong_guesses INTEGER NOT NULL DEFAULT 0,
    total_time_played INTEGER NOT NULL DEFAULT 0, -- Total time in seconds
    highest_level_reached INTEGER NOT NULL DEFAULT 1,
    words_guessed INTEGER NOT NULL DEFAULT 0,
    perfect_games INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create Hangman levels table (predefined levels with words)
CREATE TABLE IF NOT EXISTS hangman_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_number INTEGER NOT NULL,
    word TEXT NOT NULL,
    category TEXT NOT NULL,
    hint TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    max_wrong_guesses INTEGER NOT NULL DEFAULT 6,
    points_reward INTEGER NOT NULL DEFAULT 20,
    time_limit INTEGER, -- Time limit in seconds (optional)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(level_number, difficulty)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hangman_scores_user_id ON hangman_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_hangman_scores_points ON hangman_scores(points_earned DESC);
CREATE INDEX IF NOT EXISTS idx_hangman_scores_completed_at ON hangman_scores(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_hangman_scores_difficulty ON hangman_scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_hangman_scores_perfect ON hangman_scores(is_perfect);

CREATE INDEX IF NOT EXISTS idx_hangman_progress_user_id ON hangman_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hangman_progress_points ON hangman_progress(total_points_earned DESC);
CREATE INDEX IF NOT EXISTS idx_hangman_progress_level ON hangman_progress(current_level DESC);

CREATE INDEX IF NOT EXISTS idx_hangman_levels_difficulty ON hangman_levels(difficulty);
CREATE INDEX IF NOT EXISTS idx_hangman_levels_category ON hangman_levels(category);
CREATE INDEX IF NOT EXISTS idx_hangman_levels_level_number ON hangman_levels(level_number);

-- Enable Row Level Security (RLS)
ALTER TABLE hangman_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE hangman_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hangman_levels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hangman_scores
CREATE POLICY "Users can view all hangman scores" 
    ON hangman_scores FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own hangman scores" 
    ON hangman_scores FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hangman scores" 
    ON hangman_scores FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hangman scores" 
    ON hangman_scores FOR DELETE 
    USING (auth.uid() = user_id);

-- Create RLS policies for hangman_progress
CREATE POLICY "Users can view all hangman progress" 
    ON hangman_progress FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own hangman progress" 
    ON hangman_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hangman progress" 
    ON hangman_progress FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hangman progress" 
    ON hangman_progress FOR DELETE 
    USING (auth.uid() = user_id);

-- Create RLS policies for hangman_levels (read-only for users)
CREATE POLICY "Everyone can view hangman levels" 
    ON hangman_levels FOR SELECT 
    USING (true);

-- Only allow admins to modify levels (you can adjust this based on your admin system)
CREATE POLICY "Only admins can modify hangman levels" 
    ON hangman_levels FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

-- Insert sample Hangman levels
INSERT INTO hangman_levels (level_number, word, category, hint, difficulty, max_wrong_guesses, points_reward, time_limit) VALUES
-- Easy levels (4-6 letters)
(1, 'CAT', 'animals', 'A common household pet that meows', 'easy', 8, 10, 180),
(2, 'DOG', 'animals', 'Man''s best friend that barks', 'easy', 8, 10, 180),
(3, 'SUN', 'nature', 'The bright star that lights our day', 'easy', 8, 10, 180),
(4, 'TREE', 'nature', 'Tall plant with leaves and branches', 'easy', 8, 10, 180),
(5, 'BOOK', 'objects', 'You read this to learn or for fun', 'easy', 8, 10, 180),
(6, 'APPLE', 'fruits', 'Red or green fruit that grows on trees', 'easy', 8, 10, 180),
(7, 'WATER', 'nature', 'Clear liquid essential for life', 'easy', 8, 10, 180),
(8, 'HOUSE', 'objects', 'Place where people live', 'easy', 8, 10, 180),
(9, 'CHAIR', 'objects', 'Furniture you sit on', 'easy', 8, 10, 180),
(10, 'HAPPY', 'emotions', 'Feeling of joy and contentment', 'easy', 8, 10, 180),

-- Medium levels (5-8 letters)
(1, 'TIGER', 'animals', 'Large striped wild cat', 'medium', 6, 20, 120),
(2, 'PLANET', 'space', 'Large celestial body orbiting a star', 'medium', 6, 20, 120),
(3, 'GUITAR', 'music', 'Six-stringed musical instrument', 'medium', 6, 20, 120),
(4, 'ORANGE', 'fruits', 'Citrus fruit rich in vitamin C', 'medium', 6, 20, 120),
(5, 'PURPLE', 'colors', 'Color made by mixing red and blue', 'medium', 6, 20, 120),
(6, 'FRANCE', 'countries', 'European country famous for the Eiffel Tower', 'medium', 6, 20, 120),
(7, 'BANANA', 'fruits', 'Yellow curved tropical fruit', 'medium', 6, 20, 120),
(8, 'SOCCER', 'sports', 'Popular sport played with feet and a ball', 'medium', 6, 20, 120),
(9, 'WINTER', 'seasons', 'Cold season with snow and ice', 'medium', 6, 20, 120),
(10, 'FRIEND', 'people', 'Someone you like and trust', 'medium', 6, 20, 120),

-- Hard levels (7-12 letters)
(1, 'ELEPHANT', 'animals', 'Largest land mammal with a trunk', 'hard', 5, 30, 90),
(2, 'BUTTERFLY', 'animals', 'Colorful insect that transforms from caterpillar', 'hard', 5, 30, 90),
(3, 'PINEAPPLE', 'fruits', 'Tropical fruit with spiky exterior', 'hard', 5, 30, 90),
(4, 'TURQUOISE', 'colors', 'Blue-green color like tropical waters', 'hard', 5, 30, 90),
(5, 'SWITZERLAND', 'countries', 'Alpine country famous for chocolate and watches', 'hard', 5, 30, 90),
(6, 'BASKETBALL', 'sports', 'Sport played with hoops and bouncing ball', 'hard', 5, 30, 90),
(7, 'HURRICANE', 'weather', 'Powerful tropical storm with rotating winds', 'hard', 5, 30, 90),
(8, 'RHINOCEROS', 'animals', 'Large mammal with one or two horns', 'hard', 5, 30, 90),
(9, 'WATERMELON', 'fruits', 'Large green fruit with red flesh inside', 'hard', 5, 30, 90),
(10, 'ADVENTURE', 'activities', 'Exciting and possibly dangerous experience', 'hard', 5, 30, 90)
ON CONFLICT (level_number, difficulty) DO NOTHING;

-- Create function to update hangman progress
CREATE OR REPLACE FUNCTION update_hangman_progress(
    p_user_id UUID,
    p_points_earned INTEGER,
    p_wrong_guesses INTEGER,
    p_time_taken INTEGER,
    p_is_perfect BOOLEAN,
    p_level_number INTEGER
) RETURNS hangman_progress AS $$
DECLARE
    progress_record hangman_progress;
BEGIN
    -- Insert or update user progress
    INSERT INTO hangman_progress (
        user_id,
        current_level,
        total_levels_completed,
        total_points_earned,
        total_wrong_guesses,
        total_time_played,
        highest_level_reached,
        words_guessed,
        perfect_games,
        games_played,
        best_score,
        updated_at
    ) VALUES (
        p_user_id,
        GREATEST(p_level_number, 1),
        1,
        p_points_earned,
        p_wrong_guesses,
        p_time_taken,
        p_level_number,
        1,
        CASE WHEN p_is_perfect THEN 1 ELSE 0 END,
        1,
        p_points_earned,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_levels_completed = hangman_progress.total_levels_completed + 1,
        total_points_earned = hangman_progress.total_points_earned + p_points_earned,
        total_wrong_guesses = hangman_progress.total_wrong_guesses + p_wrong_guesses,
        total_time_played = hangman_progress.total_time_played + p_time_taken,
        highest_level_reached = GREATEST(hangman_progress.highest_level_reached, p_level_number),
        words_guessed = hangman_progress.words_guessed + 1,
        perfect_games = hangman_progress.perfect_games + CASE WHEN p_is_perfect THEN 1 ELSE 0 END,
        games_played = hangman_progress.games_played + 1,
        best_score = GREATEST(hangman_progress.best_score, p_points_earned),
        current_level = CASE 
            WHEN p_level_number >= hangman_progress.current_level THEN p_level_number + 1
            ELSE hangman_progress.current_level
        END,
        updated_at = NOW()
    RETURNING * INTO progress_record;

    RETURN progress_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get hangman leaderboard
CREATE OR REPLACE FUNCTION get_hangman_leaderboard(
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    username TEXT,
    total_points INTEGER,
    games_played INTEGER,
    perfect_games INTEGER,
    win_rate NUMERIC,
    avg_score NUMERIC,
    best_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hp.user_id::TEXT as username, -- You might want to join with user_profiles for actual username
        hp.total_points_earned,
        hp.games_played,
        hp.perfect_games,
        CASE 
            WHEN hp.games_played > 0 THEN 
                ROUND((hp.total_levels_completed::NUMERIC / hp.games_played::NUMERIC) * 100, 1)
            ELSE 0
        END as win_rate,
        CASE 
            WHEN hp.games_played > 0 THEN 
                ROUND(hp.total_points_earned::NUMERIC / hp.games_played::NUMERIC, 1)
            ELSE 0
        END as avg_score,
        hp.best_score
    FROM hangman_progress hp
    ORDER BY hp.total_points_earned DESC, hp.perfect_games DESC, hp.best_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent hangman games
CREATE OR REPLACE FUNCTION get_recent_hangman_games(
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    username TEXT,
    word TEXT,
    category TEXT,
    difficulty TEXT,
    points_earned INTEGER,
    time_taken INTEGER,
    wrong_guesses INTEGER,
    is_perfect BOOLEAN,
    completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hs.username,
        hs.word,
        hs.category,
        hs.difficulty,
        hs.points_earned,
        hs.time_taken,
        hs.wrong_guesses,
        hs.is_perfect,
        hs.completed_at
    FROM hangman_scores hs
    ORDER BY hs.completed_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON hangman_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hangman_progress TO authenticated;
GRANT SELECT ON hangman_levels TO authenticated;
GRANT EXECUTE ON FUNCTION update_hangman_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_hangman_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_hangman_games TO authenticated;
