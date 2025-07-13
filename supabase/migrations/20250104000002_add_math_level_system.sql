-- Create Math Level System tables
-- This migration adds support for the 99-level math puzzles system

-- Math user progress table
CREATE TABLE math_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1,
    highest_level_reached INTEGER DEFAULT 1,
    total_score BIGINT DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Math level completions
CREATE TABLE math_level_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    questions_answered INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    accuracy DECIMAL(5,4) NOT NULL,
    time_taken INTEGER NOT NULL, -- in seconds
    points_multiplier DECIMAL(5,2) NOT NULL,
    final_score INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, level_number)
);

-- Math game sessions (for detailed tracking)
CREATE TABLE math_game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    eliminated BOOLEAN DEFAULT FALSE,
    elimination_reason TEXT,
    completed BOOLEAN DEFAULT FALSE,
    game_data JSONB -- Store question details, timings, etc.
);

-- Math leaderboard view (materialized for performance)
CREATE MATERIALIZED VIEW math_leaderboard AS
SELECT 
    u.id as user_id,
    p.email as username,
    mp.current_level,
    mp.highest_level_reached,
    mp.total_score,
    mp.total_questions_answered,
    mp.total_correct_answers,
    mp.streak,
    mp.longest_streak,
    CASE 
        WHEN mp.total_questions_answered > 0 
        THEN ROUND((mp.total_correct_answers::decimal / mp.total_questions_answered::decimal) * 100, 2)
        ELSE 0 
    END as accuracy_percentage,
    (SELECT COUNT(*) FROM math_level_completions mlc WHERE mlc.user_id = u.id) as levels_completed,
    ROW_NUMBER() OVER (ORDER BY mp.total_score DESC, mp.highest_level_reached DESC, mp.longest_streak DESC) as rank
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN math_user_progress mp ON u.id = mp.user_id
ORDER BY rank;

-- Create indexes for performance
CREATE INDEX idx_math_user_progress_user_id ON math_user_progress(user_id);
CREATE INDEX idx_math_user_progress_total_score ON math_user_progress(total_score DESC);
CREATE INDEX idx_math_user_progress_highest_level ON math_user_progress(highest_level_reached DESC);
CREATE INDEX idx_math_level_completions_user_level ON math_level_completions(user_id, level_number);
CREATE INDEX idx_math_level_completions_completed_at ON math_level_completions(completed_at DESC);
CREATE INDEX idx_math_game_sessions_user_id ON math_game_sessions(user_id);
CREATE INDEX idx_math_game_sessions_level ON math_game_sessions(level_number);
CREATE INDEX idx_math_game_sessions_start_time ON math_game_sessions(start_time DESC);

-- RLS (Row Level Security) policies
ALTER TABLE math_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_level_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_game_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own math progress" ON math_user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own math completions" ON math_level_completions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own math sessions" ON math_game_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Public read access to leaderboard (anonymized)
CREATE POLICY "Public can view math leaderboard" ON math_leaderboard
    FOR SELECT USING (true);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update trigger for math_user_progress
CREATE TRIGGER update_math_user_progress_updated_at 
    BEFORE UPDATE ON math_user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to refresh math leaderboard
CREATE OR REPLACE FUNCTION refresh_math_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW math_leaderboard;
END;
$$ language 'plpgsql';

-- Function to get user's math leaderboard rank
CREATE OR REPLACE FUNCTION get_user_math_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM math_leaderboard
    WHERE user_id = target_user_id;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ language 'plpgsql';

-- Function to get top N math users
CREATE OR REPLACE FUNCTION get_top_math_users(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    current_level INTEGER,
    highest_level_reached INTEGER,
    total_score BIGINT,
    total_questions_answered INTEGER,
    total_correct_answers INTEGER,
    streak INTEGER,
    longest_streak INTEGER,
    accuracy_percentage NUMERIC,
    levels_completed BIGINT,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM math_leaderboard
    LIMIT limit_count;
END;
$$ language 'plpgsql';

-- Function to initialize math progress for a user
CREATE OR REPLACE FUNCTION initialize_math_progress(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    progress_id UUID;
BEGIN
    -- Insert user progress if it doesn't exist
    INSERT INTO math_user_progress (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO progress_id;
    
    -- If no ID returned, get the existing one
    IF progress_id IS NULL THEN
        SELECT id INTO progress_id 
        FROM math_user_progress 
        WHERE user_id = target_user_id;
    END IF;
    
    RETURN progress_id;
END;
$$ language 'plpgsql';

-- Function to complete a math level
CREATE OR REPLACE FUNCTION complete_math_level(
    target_user_id UUID,
    level_num INTEGER,
    level_score INTEGER,
    questions_count INTEGER,
    correct_count INTEGER,
    time_seconds INTEGER,
    multiplier DECIMAL(5,2)
)
RETURNS BOOLEAN AS $$
DECLARE
    final_score INTEGER;
    level_accuracy DECIMAL(5,4);
    current_progress RECORD;
    elimination_mode BOOLEAN;
    accuracy_required DECIMAL(5,4);
BEGIN
    -- Calculate final score and accuracy
    final_score := FLOOR(level_score * multiplier);
    level_accuracy := correct_count::decimal / questions_count::decimal;
    elimination_mode := level_num > 20;
    accuracy_required := CASE WHEN elimination_mode THEN 1.0 ELSE 0.6 END;
    
    -- Check if level requirements are met
    IF level_accuracy < accuracy_required THEN
        RETURN FALSE;
    END IF;
    
    -- Get current progress
    SELECT * INTO current_progress 
    FROM math_user_progress 
    WHERE user_id = target_user_id;
    
    -- If no progress exists, initialize it
    IF NOT FOUND THEN
        PERFORM initialize_math_progress(target_user_id);
        SELECT * INTO current_progress 
        FROM math_user_progress 
        WHERE user_id = target_user_id;
    END IF;
    
    -- Insert or update level completion
    INSERT INTO math_level_completions (
        user_id, level_number, score, questions_answered, correct_answers, 
        accuracy, time_taken, points_multiplier, final_score
    ) VALUES (
        target_user_id, level_num, level_score, questions_count, correct_count,
        level_accuracy, time_seconds, multiplier, final_score
    ) ON CONFLICT (user_id, level_number) DO UPDATE SET
        score = EXCLUDED.score,
        questions_answered = EXCLUDED.questions_answered,
        correct_answers = EXCLUDED.correct_answers,
        accuracy = EXCLUDED.accuracy,
        time_taken = EXCLUDED.time_taken,
        points_multiplier = EXCLUDED.points_multiplier,
        final_score = EXCLUDED.final_score,
        completed_at = timezone('utc'::text, now());
    
    -- Update user progress
    UPDATE math_user_progress SET
        total_score = total_score + final_score,
        total_questions_answered = total_questions_answered + questions_count,
        total_correct_answers = total_correct_answers + correct_count,
        streak = CASE WHEN level_accuracy = 1.0 THEN streak + 1 ELSE 0 END,
        longest_streak = CASE 
            WHEN level_accuracy = 1.0 AND streak + 1 > longest_streak 
            THEN streak + 1 
            ELSE longest_streak 
        END,
        highest_level_reached = CASE 
            WHEN level_num >= highest_level_reached 
            THEN LEAST(99, level_num + 1)
            ELSE highest_level_reached 
        END,
        current_level = CASE 
            WHEN level_num >= current_level 
            THEN LEAST(99, level_num + 1)
            ELSE current_level 
        END,
        last_played_at = timezone('utc'::text, now())
    WHERE user_id = target_user_id;
    
    RETURN TRUE;
END;
$$ language 'plpgsql';

-- Function to start a math game session
CREATE OR REPLACE FUNCTION start_math_session(
    target_user_id UUID,
    level_num INTEGER
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO math_game_sessions (user_id, level_number)
    VALUES (target_user_id, level_num)
    RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$ language 'plpgsql';

-- Function to end a math game session
CREATE OR REPLACE FUNCTION end_math_session(
    session_uuid UUID,
    questions_count INTEGER,
    correct_count INTEGER,
    session_score INTEGER,
    was_eliminated BOOLEAN DEFAULT FALSE,
    elimination_reason TEXT DEFAULT NULL,
    session_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE math_game_sessions SET
        end_time = timezone('utc'::text, now()),
        questions_answered = questions_count,
        correct_answers = correct_count,
        score = session_score,
        eliminated = was_eliminated,
        elimination_reason = elimination_reason,
        completed = NOT was_eliminated,
        game_data = session_data
    WHERE id = session_uuid;
    
    RETURN FOUND;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT SELECT ON math_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_math_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_math_rank(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_math_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_math_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_math_level(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION start_math_session(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION end_math_session(UUID, INTEGER, INTEGER, INTEGER, BOOLEAN, TEXT, JSONB) TO authenticated;
