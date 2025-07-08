-- Create Word Search game tables for multiplayer word search with coin system

-- Create word_search_games table for multiplayer game sessions
CREATE TABLE IF NOT EXISTS public.word_search_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_name TEXT,
    game_state JSONB NOT NULL DEFAULT '{}',
    game_status TEXT NOT NULL DEFAULT 'waiting' CHECK (game_status IN ('waiting', 'active', 'completed', 'cancelled')),
    player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player3_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player4_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    max_players INTEGER NOT NULL DEFAULT 2 CHECK (max_players BETWEEN 2 AND 4),
    current_players INTEGER NOT NULL DEFAULT 1,
    entry_fee INTEGER NOT NULL DEFAULT 10, -- in coins
    prize_pool INTEGER NOT NULL DEFAULT 0, -- total coins to be won
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    grid_size INTEGER NOT NULL DEFAULT 15 CHECK (grid_size BETWEEN 10 AND 20),
    word_count INTEGER NOT NULL DEFAULT 10 CHECK (word_count BETWEEN 5 AND 20),
    time_limit INTEGER NOT NULL DEFAULT 300, -- in seconds (5 minutes default)
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create word_search_scores table for tracking individual game scores and leaderboards
CREATE TABLE IF NOT EXISTS public.word_search_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    game_id UUID REFERENCES public.word_search_games(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    words_found INTEGER NOT NULL DEFAULT 0,
    total_words INTEGER NOT NULL,
    time_taken INTEGER NOT NULL, -- in seconds
    hints_used INTEGER NOT NULL DEFAULT 0,
    coins_spent INTEGER NOT NULL DEFAULT 0, -- coins spent on hints
    coins_won INTEGER NOT NULL DEFAULT 0, -- coins won from the game
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    game_mode TEXT NOT NULL CHECK (game_mode IN ('solo', 'multiplayer', 'practice')),
    grid_size INTEGER NOT NULL,
    is_solo_game BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create word_search_moves table for tracking individual word finds in multiplayer games
CREATE TABLE IF NOT EXISTS public.word_search_moves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES public.word_search_games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_found TEXT NOT NULL,
    start_position JSONB NOT NULL, -- {row: number, col: number}
    end_position JSONB NOT NULL, -- {row: number, col: number}
    direction TEXT NOT NULL, -- 'horizontal', 'vertical', 'diagonal'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create word_search_hints table for tracking hint usage
CREATE TABLE IF NOT EXISTS public.word_search_hints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.word_search_games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hint_type TEXT NOT NULL CHECK (hint_type IN ('letter_highlight', 'word_location', 'direction_hint')),
    word_target TEXT NOT NULL,
    coins_spent INTEGER NOT NULL DEFAULT 5,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create word_search_coins table for coin transactions specific to word search
CREATE TABLE IF NOT EXISTS public.word_search_coins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'game_entry', 'hint_purchase', 'game_reward', 'daily_bonus')),
    amount INTEGER NOT NULL, -- positive for credits, negative for debits
    balance_after INTEGER NOT NULL,
    game_id UUID REFERENCES public.word_search_games(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_word_search_games_creator_id ON public.word_search_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_word_search_games_status ON public.word_search_games(game_status);
CREATE INDEX IF NOT EXISTS idx_word_search_games_difficulty ON public.word_search_games(difficulty);
CREATE INDEX IF NOT EXISTS idx_word_search_games_created_at ON public.word_search_games(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_word_search_scores_user_id ON public.word_search_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_game_id ON public.word_search_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_difficulty ON public.word_search_scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_game_mode ON public.word_search_scores(game_mode);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_score ON public.word_search_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_completed_at ON public.word_search_scores(completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_word_search_moves_game_id ON public.word_search_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_word_search_moves_user_id ON public.word_search_moves(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_moves_timestamp ON public.word_search_moves(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_word_search_hints_user_id ON public.word_search_hints(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_hints_game_id ON public.word_search_hints(game_id);

CREATE INDEX IF NOT EXISTS idx_word_search_coins_user_id ON public.word_search_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_coins_transaction_type ON public.word_search_coins(transaction_type);
CREATE INDEX IF NOT EXISTS idx_word_search_coins_created_at ON public.word_search_coins(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.word_search_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_search_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_search_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_search_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_search_coins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for word_search_games
DROP POLICY IF EXISTS "Users can create word search games" ON public.word_search_games;
CREATE POLICY "Users can create word search games" ON public.word_search_games
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can view word search games" ON public.word_search_games;
CREATE POLICY "Users can view word search games" ON public.word_search_games
    FOR SELECT USING (
        game_status = 'waiting' OR 
        auth.uid() IN (creator_id, player1_id, player2_id, player3_id, player4_id)
    );

DROP POLICY IF EXISTS "Users can update their word search games" ON public.word_search_games;
CREATE POLICY "Users can update their word search games" ON public.word_search_games
    FOR UPDATE USING (
        auth.uid() IN (creator_id, player1_id, player2_id, player3_id, player4_id)
    );

-- Create RLS policies for word_search_scores
DROP POLICY IF EXISTS "Users can insert their own word search scores" ON public.word_search_scores;
CREATE POLICY "Users can insert their own word search scores" ON public.word_search_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own word search scores" ON public.word_search_scores;
CREATE POLICY "Users can view their own word search scores" ON public.word_search_scores
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view leaderboard word search scores" ON public.word_search_scores;
CREATE POLICY "Users can view leaderboard word search scores" ON public.word_search_scores
    FOR SELECT USING (true);

-- Create RLS policies for word_search_moves
DROP POLICY IF EXISTS "Users can insert their own word search moves" ON public.word_search_moves;
CREATE POLICY "Users can insert their own word search moves" ON public.word_search_moves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view word search moves for their games" ON public.word_search_moves;
CREATE POLICY "Users can view word search moves for their games" ON public.word_search_moves
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.word_search_games 
            WHERE id = game_id 
            AND auth.uid() IN (creator_id, player1_id, player2_id, player3_id, player4_id)
        )
    );

-- Create RLS policies for word_search_hints
DROP POLICY IF EXISTS "Users can insert their own word search hints" ON public.word_search_hints;
CREATE POLICY "Users can insert their own word search hints" ON public.word_search_hints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own word search hints" ON public.word_search_hints;
CREATE POLICY "Users can view their own word search hints" ON public.word_search_hints
    FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for word_search_coins
DROP POLICY IF EXISTS "Users can insert their own word search coin transactions" ON public.word_search_coins;
CREATE POLICY "Users can insert their own word search coin transactions" ON public.word_search_coins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own word search coin transactions" ON public.word_search_coins;
CREATE POLICY "Users can view their own word search coin transactions" ON public.word_search_coins
    FOR SELECT USING (auth.uid() = user_id);
