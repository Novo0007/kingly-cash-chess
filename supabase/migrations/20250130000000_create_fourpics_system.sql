-- Create 4 Pics 1 Word system tables

-- Table for storing levels
CREATE TABLE fourpics_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE,
    word TEXT NOT NULL,
    image_urls TEXT[] NOT NULL, -- Array of 4 image URLs
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    hint_letter_cost INTEGER DEFAULT 10,
    hint_image_cost INTEGER DEFAULT 15,
    hint_word_cost INTEGER DEFAULT 25,
    coins_reward INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user scores and progress
CREATE TABLE fourpics_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    level_id UUID NOT NULL REFERENCES fourpics_levels(id),
    level_number INTEGER NOT NULL,
    word TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    hints_used JSON DEFAULT '[]', -- Array of hint types used
    time_taken INTEGER, -- Time in seconds
    coins_spent INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (level_id) REFERENCES fourpics_levels(id) ON DELETE CASCADE
);

-- Table for user overall progress
CREATE TABLE fourpics_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    current_level INTEGER DEFAULT 1,
    total_levels_completed INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0,
    total_coins_spent INTEGER DEFAULT 0,
    total_hints_used INTEGER DEFAULT 0,
    total_time_played INTEGER DEFAULT 0, -- Total time in seconds
    highest_level_reached INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for coin transactions related to 4 Pics 1 Word
CREATE TABLE fourpics_coin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    level_id UUID REFERENCES fourpics_levels(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('hint_purchase', 'level_completion', 'level_unlock')),
    hint_type TEXT CHECK (hint_type IN ('letter', 'image', 'word')),
    amount INTEGER NOT NULL, -- Positive for earning, negative for spending
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fourpics_levels_level_number ON fourpics_levels(level_number);
CREATE INDEX idx_fourpics_levels_difficulty ON fourpics_levels(difficulty);
CREATE INDEX idx_fourpics_scores_user_id ON fourpics_scores(user_id);
CREATE INDEX idx_fourpics_scores_level_number ON fourpics_scores(level_number);
CREATE INDEX idx_fourpics_progress_user_id ON fourpics_progress(user_id);
CREATE INDEX idx_fourpics_coin_transactions_user_id ON fourpics_coin_transactions(user_id);

-- Insert initial levels (first 10 levels for demo)
INSERT INTO fourpics_levels (level_number, word, image_urls, difficulty, coins_reward) VALUES
(1, 'APPLE', ARRAY[
    'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=300&h=300&fit=crop'
], 'easy', 5),

(2, 'WATER', ARRAY[
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1615578240292-b988dc6e73ce?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop'
], 'easy', 5),

(3, 'HOUSE', ARRAY[
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=300&fit=crop'
], 'easy', 5),

(4, 'FLOWER', ARRAY[
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop'
], 'easy', 5),

(5, 'OCEAN', ARRAY[
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1492104066294-2e51727c1ea8?w=300&h=300&fit=crop'
], 'medium', 10),

(6, 'MOUNTAIN', ARRAY[
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1464822759844-d150e4e29019?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop'
], 'medium', 10),

(7, 'FOREST', ARRAY[
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1519640760746-95d1211e9c61?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=300&fit=crop'
], 'medium', 10),

(8, 'RAINBOW', ARRAY[
    'https://images.unsplash.com/photo-1515036551567-a3307f0b56fd?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1492104066294-2e51727c1ea8?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
], 'hard', 15),

(9, 'BUTTERFLY', ARRAY[
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop'
], 'hard', 15),

(10, 'SUNFLOWER', ARRAY[
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1515036551567-a3307f0b56fd?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop'
], 'hard', 15);

-- Enable Row Level Security
ALTER TABLE fourpics_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE fourpics_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fourpics_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE fourpics_coin_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fourpics_levels (everyone can read levels)
CREATE POLICY "Everyone can view levels" ON fourpics_levels FOR SELECT USING (true);

-- RLS Policies for fourpics_scores (users can only see their own scores)
CREATE POLICY "Users can view own scores" ON fourpics_scores FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY "Users can insert own scores" ON fourpics_scores FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "Users can update own scores" ON fourpics_scores FOR UPDATE USING (auth.uid()::uuid = user_id);

-- RLS Policies for fourpics_progress (users can only see their own progress)
CREATE POLICY "Users can view own progress" ON fourpics_progress FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY "Users can insert own progress" ON fourpics_progress FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "Users can update own progress" ON fourpics_progress FOR UPDATE USING (auth.uid()::uuid = user_id);

-- RLS Policies for fourpics_coin_transactions (users can only see their own transactions)
CREATE POLICY "Users can view own transactions" ON fourpics_coin_transactions FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY "Users can insert own transactions" ON fourpics_coin_transactions FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

-- Create functions for game logic

-- Function to get user progress, creating if doesn't exist
CREATE OR REPLACE FUNCTION get_fourpics_progress(user_id_param UUID)
RETURNS fourpics_progress AS $$
DECLARE
    user_progress fourpics_progress;
BEGIN
    SELECT * INTO user_progress FROM fourpics_progress WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        INSERT INTO fourpics_progress (user_id) VALUES (user_id_param) RETURNING * INTO user_progress;
    END IF;
    
    RETURN user_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a level and update progress
CREATE OR REPLACE FUNCTION complete_fourpics_level(
    user_id_param UUID,
    level_id_param UUID,
    level_number_param INTEGER,
    word_param TEXT,
    attempts_param INTEGER,
    hints_used_param JSON,
    time_taken_param INTEGER,
    coins_spent_param INTEGER
)
RETURNS JSON AS $$
DECLARE
    level_data fourpics_levels;
    progress_data fourpics_progress;
    coins_earned INTEGER := 0;
    result JSON;
BEGIN
    -- Get level data
    SELECT * INTO level_data FROM fourpics_levels WHERE id = level_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Level not found');
    END IF;
    
    -- Calculate coins earned (based on performance)
    coins_earned := level_data.coins_reward;
    
    -- Bonus for completing without hints
    IF hints_used_param = '[]'::json THEN
        coins_earned := coins_earned + 5;
    END IF;
    
    -- Insert score record
    INSERT INTO fourpics_scores (
        user_id, level_id, level_number, word, attempts, hints_used,
        time_taken, coins_spent, coins_earned
    ) VALUES (
        user_id_param, level_id_param, level_number_param, word_param,
        attempts_param, hints_used_param, time_taken_param, coins_spent_param, coins_earned
    );
    
    -- Update user progress
    INSERT INTO fourpics_progress (user_id) VALUES (user_id_param) 
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE fourpics_progress SET
        current_level = GREATEST(current_level, level_number_param + 1),
        total_levels_completed = total_levels_completed + 1,
        total_coins_earned = total_coins_earned + coins_earned,
        total_coins_spent = total_coins_spent + coins_spent_param,
        total_hints_used = total_hints_used + (hints_used_param::jsonb ? 'length' | 0),
        total_time_played = total_time_played + time_taken_param,
        highest_level_reached = GREATEST(highest_level_reached, level_number_param),
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Record coin transaction for level completion
    INSERT INTO fourpics_coin_transactions (
        user_id, level_id, transaction_type, amount, description
    ) VALUES (
        user_id_param, level_id_param, 'level_completion', coins_earned,
        'Completed level ' || level_number_param || ': ' || word_param
    );
    
    RETURN json_build_object(
        'success', true,
        'coins_earned', coins_earned,
        'next_level', level_number_param + 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use hint and deduct coins
CREATE OR REPLACE FUNCTION use_fourpics_hint(
    user_id_param UUID,
    level_id_param UUID,
    hint_type_param TEXT
)
RETURNS JSON AS $$
DECLARE
    level_data fourpics_levels;
    user_coins INTEGER;
    hint_cost INTEGER;
    result JSON;
BEGIN
    -- Get level data
    SELECT * INTO level_data FROM fourpics_levels WHERE id = level_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Level not found');
    END IF;
    
    -- Determine hint cost
    CASE hint_type_param
        WHEN 'letter' THEN hint_cost := level_data.hint_letter_cost;
        WHEN 'image' THEN hint_cost := level_data.hint_image_cost;
        WHEN 'word' THEN hint_cost := level_data.hint_word_cost;
        ELSE RETURN json_build_object('success', false, 'error', 'Invalid hint type');
    END CASE;
    
    -- Check user's coin balance (assuming integration with existing wallet system)
    -- This would integrate with your existing coin/wallet system
    
    -- Record hint usage transaction
    INSERT INTO fourpics_coin_transactions (
        user_id, level_id, transaction_type, hint_type, amount, description
    ) VALUES (
        user_id_param, level_id_param, 'hint_purchase', hint_type_param, -hint_cost,
        'Used ' || hint_type_param || ' hint for level ' || level_data.level_number
    );
    
    RETURN json_build_object(
        'success', true,
        'hint_cost', hint_cost,
        'hint_type', hint_type_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
