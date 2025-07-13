-- Create CodeMaster system tables
-- This migration adds comprehensive support for CodeMaster with coins, achievements, and progress tracking

-- User progress table for CodeLearn
CREATE TABLE codelearn_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    available_coins INTEGER DEFAULT 0,
    coins_spent INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    completed_lessons INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in minutes
    last_active_date DATE DEFAULT CURRENT_DATE,
    daily_goal_xp INTEGER DEFAULT 100,
    today_xp INTEGER DEFAULT 0,
    daily_goal_coins INTEGER DEFAULT 50,
    today_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Language-specific progress
CREATE TABLE codelearn_language_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language_id TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    completed_units INTEGER DEFAULT 0,
    total_units INTEGER DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    accuracy DECIMAL(5,4) DEFAULT 0.0, -- 0.0 to 1.0
    current_unit TEXT,
    time_spent INTEGER DEFAULT 0, -- in minutes
    start_date DATE DEFAULT CURRENT_DATE,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, language_id)
);

-- User achievements
CREATE TABLE codelearn_user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('streak', 'completion', 'accuracy', 'speed', 'exploration', 'milestone')),
    xp_reward INTEGER NOT NULL,
    coin_reward INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Coin transactions
CREATE TABLE codelearn_coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty')),
    amount INTEGER NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('lesson', 'exercise', 'achievement', 'daily_bonus', 'purchase', 'hint', 'skip')),
    source_id TEXT NOT NULL,
    description TEXT NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Learning sessions
CREATE TABLE codelearn_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    language_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    accuracy DECIMAL(5,4) DEFAULT 0.0,
    xp_earned INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    hints_used INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Exercise results within sessions
CREATE TABLE codelearn_exercise_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES codelearn_sessions(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    attempts INTEGER DEFAULT 1,
    hints_used INTEGER DEFAULT 0,
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Leaderboard view (materialized for performance)
CREATE MATERIALIZED VIEW codelearn_leaderboard AS
SELECT 
    u.id as user_id,
    p.email as username,
    pr.total_xp,
    pr.total_coins,
    pr.level,
    pr.current_streak,
    pr.completed_lessons,
    COALESCE(AVG(lp.accuracy), 0) as overall_accuracy,
    ROW_NUMBER() OVER (ORDER BY pr.total_xp DESC, pr.total_coins DESC, pr.current_streak DESC) as rank
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN codelearn_user_progress pr ON u.id = pr.user_id
LEFT JOIN codelearn_language_progress lp ON u.id = lp.user_id
GROUP BY u.id, p.email, pr.total_xp, pr.total_coins, pr.level, pr.current_streak, pr.completed_lessons
ORDER BY rank;

-- Create indexes for performance
CREATE INDEX idx_codelearn_user_progress_user_id ON codelearn_user_progress(user_id);
CREATE INDEX idx_codelearn_language_progress_user_language ON codelearn_language_progress(user_id, language_id);
CREATE INDEX idx_codelearn_achievements_user_id ON codelearn_user_achievements(user_id);
CREATE INDEX idx_codelearn_achievements_unlocked ON codelearn_user_achievements(user_id, is_unlocked);
CREATE INDEX idx_codelearn_transactions_user_id ON codelearn_coin_transactions(user_id);
CREATE INDEX idx_codelearn_transactions_created ON codelearn_coin_transactions(created_at DESC);
CREATE INDEX idx_codelearn_sessions_user_id ON codelearn_sessions(user_id);
CREATE INDEX idx_codelearn_sessions_language ON codelearn_sessions(language_id);
CREATE INDEX idx_codelearn_sessions_created ON codelearn_sessions(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE codelearn_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE codelearn_language_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE codelearn_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE codelearn_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE codelearn_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE codelearn_exercise_results ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own progress" ON codelearn_user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own language progress" ON codelearn_language_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON codelearn_user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON codelearn_coin_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON codelearn_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exercise results" ON codelearn_exercise_results
    FOR ALL USING (auth.uid() = (SELECT user_id FROM codelearn_sessions WHERE id = session_id));

-- Public read access to leaderboard (anonymized)
CREATE POLICY "Public can view leaderboard" ON codelearn_leaderboard
    FOR SELECT USING (true);

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_codelearn_user_progress_updated_at 
    BEFORE UPDATE ON codelearn_user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_codelearn_language_progress_updated_at 
    BEFORE UPDATE ON codelearn_language_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_codelearn_user_achievements_updated_at 
    BEFORE UPDATE ON codelearn_user_achievements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_codelearn_sessions_updated_at 
    BEFORE UPDATE ON codelearn_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to refresh leaderboard (call this periodically or after major updates)
CREATE OR REPLACE FUNCTION refresh_codelearn_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW codelearn_leaderboard;
END;
$$ language 'plpgsql';

-- Function to get user's leaderboard rank
CREATE OR REPLACE FUNCTION get_user_leaderboard_rank(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM codelearn_leaderboard
    WHERE user_id = target_user_id;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ language 'plpgsql';

-- Function to get top N users from leaderboard
CREATE OR REPLACE FUNCTION get_top_codelearn_users(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    total_xp INTEGER,
    total_coins INTEGER,
    level INTEGER,
    current_streak INTEGER,
    completed_lessons INTEGER,
    overall_accuracy DECIMAL,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM codelearn_leaderboard
    LIMIT limit_count;
END;
$$ language 'plpgsql';

-- Function to initialize user progress (called when user first uses CodeLearn)
CREATE OR REPLACE FUNCTION initialize_codelearn_user(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    progress_id UUID;
BEGIN
    -- Insert user progress if it doesn't exist
    INSERT INTO codelearn_user_progress (user_id)
    VALUES (target_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING id INTO progress_id;
    
    -- Initialize default achievements
    INSERT INTO codelearn_user_achievements (
        user_id, achievement_id, title, description, icon, category, 
        xp_reward, coin_reward, max_progress
    ) VALUES 
    (target_user_id, 'first-lesson', 'First Steps', 'Complete your first lesson', '🎯', 'milestone', 50, 25, 1),
    (target_user_id, 'streak-3', 'Getting Consistent', 'Maintain a 3-day streak', '🔥', 'streak', 100, 50, 3),
    (target_user_id, 'streak-7', 'Week Warrior', 'Maintain a 7-day streak', '⚡', 'streak', 250, 100, 7),
    (target_user_id, 'perfectionist', 'Perfectionist', 'Complete 10 lessons with 100% accuracy', '💯', 'accuracy', 300, 150, 10),
    (target_user_id, 'speed-demon', 'Speed Demon', 'Complete 5 lessons in under 3 minutes each', '💨', 'speed', 200, 75, 5),
    (target_user_id, 'explorer', 'Explorer', 'Try 3 different programming languages', '🗺️', 'exploration', 400, 200, 3),
    (target_user_id, 'unit-master', 'Unit Master', 'Complete an entire unit', '🏆', 'completion', 500, 250, 1),
    (target_user_id, 'coin-collector', 'Coin Collector', 'Earn 1000 coins total', '🪙', 'milestone', 300, 100, 1000),
    (target_user_id, 'big-spender', 'Big Spender', 'Spend 500 coins in the shop', '💰', 'milestone', 250, 150, 500)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    RETURN progress_id;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT SELECT ON codelearn_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_codelearn_leaderboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_leaderboard_rank(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_codelearn_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_codelearn_user(UUID) TO authenticated;
