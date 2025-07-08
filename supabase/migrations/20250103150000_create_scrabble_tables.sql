-- Create Scrabble games table
CREATE TABLE IF NOT EXISTS public.scrabble_games (
    id TEXT PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_name TEXT,
    game_state JSONB,
    game_status TEXT NOT NULL DEFAULT 'waiting' CHECK (game_status IN ('waiting', 'active', 'completed', 'cancelled')),
    player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player3_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player4_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_players INTEGER NOT NULL DEFAULT 1,
    max_players INTEGER NOT NULL DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 4),
    entry_fee INTEGER NOT NULL DEFAULT 0,
    prize_amount INTEGER NOT NULL DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_friend_challenge BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Scrabble moves table
CREATE TABLE IF NOT EXISTS public.scrabble_moves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES public.scrabble_games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    move_number INTEGER NOT NULL,
    move_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user coins table
CREATE TABLE IF NOT EXISTS public.user_coins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    coins INTEGER NOT NULL DEFAULT 1000,
    total_earned INTEGER NOT NULL DEFAULT 1000,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create coin transactions table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('game_entry', 'game_winning', 'purchase', 'reward')),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Scrabble scores table
CREATE TABLE IF NOT EXISTS public.scrabble_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES public.scrabble_games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    is_winner BOOLEAN NOT NULL DEFAULT false,
    coins_won INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scrabble_games_status ON public.scrabble_games(game_status);
CREATE INDEX IF NOT EXISTS idx_scrabble_games_creator ON public.scrabble_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_scrabble_games_created_at ON public.scrabble_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrabble_moves_game_id ON public.scrabble_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_scrabble_moves_player_id ON public.scrabble_moves(player_id);
CREATE INDEX IF NOT EXISTS idx_user_coins_user_id ON public.user_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrabble_scores_user_id ON public.scrabble_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scrabble_scores_game_id ON public.scrabble_scores(game_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.scrabble_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrabble_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrabble_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scrabble_games
DROP POLICY IF EXISTS "Users can view scrabble games they participate in" ON public.scrabble_games;
CREATE POLICY "Users can view scrabble games they participate in" ON public.scrabble_games
    FOR SELECT USING (
        auth.uid() = creator_id OR 
        auth.uid() = player1_id OR 
        auth.uid() = player2_id OR 
        auth.uid() = player3_id OR 
        auth.uid() = player4_id OR
        game_status = 'waiting'
    );

DROP POLICY IF EXISTS "Users can create scrabble games" ON public.scrabble_games;
CREATE POLICY "Users can create scrabble games" ON public.scrabble_games
    FOR INSERT WITH CHECK (auth.uid() = creator_id AND auth.uid() = player1_id);

DROP POLICY IF EXISTS "Game participants can update scrabble games" ON public.scrabble_games;
CREATE POLICY "Game participants can update scrabble games" ON public.scrabble_games
    FOR UPDATE USING (
        auth.uid() = creator_id OR 
        auth.uid() = player1_id OR 
        auth.uid() = player2_id OR 
        auth.uid() = player3_id OR 
        auth.uid() = player4_id
    );

-- RLS Policies for scrabble_moves
DROP POLICY IF EXISTS "Users can view moves from their games" ON public.scrabble_moves;
CREATE POLICY "Users can view moves from their games" ON public.scrabble_moves
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.scrabble_games 
            WHERE id = game_id AND (
                auth.uid() = creator_id OR 
                auth.uid() = player1_id OR 
                auth.uid() = player2_id OR 
                auth.uid() = player3_id OR 
                auth.uid() = player4_id
            )
        )
    );

DROP POLICY IF EXISTS "Users can insert their own moves" ON public.scrabble_moves;
CREATE POLICY "Users can insert their own moves" ON public.scrabble_moves
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- RLS Policies for user_coins
DROP POLICY IF EXISTS "Users can view their own coins" ON public.user_coins;
CREATE POLICY "Users can view their own coins" ON public.user_coins
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own coin record" ON public.user_coins;
CREATE POLICY "Users can insert their own coin record" ON public.user_coins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own coins" ON public.user_coins;
CREATE POLICY "Users can update their own coins" ON public.user_coins
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for coin_transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.coin_transactions;
CREATE POLICY "Users can view their own transactions" ON public.coin_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert transactions" ON public.coin_transactions;
CREATE POLICY "System can insert transactions" ON public.coin_transactions
    FOR INSERT WITH CHECK (true); -- Allow system to insert transactions

-- RLS Policies for scrabble_scores
DROP POLICY IF EXISTS "Users can view scores from their games" ON public.scrabble_scores;
CREATE POLICY "Users can view scores from their games" ON public.scrabble_scores
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.scrabble_games 
            WHERE id = game_id AND (
                auth.uid() = creator_id OR 
                auth.uid() = player1_id OR 
                auth.uid() = player2_id OR 
                auth.uid() = player3_id OR 
                auth.uid() = player4_id
            )
        )
    );

DROP POLICY IF EXISTS "System can insert scores" ON public.scrabble_scores;
CREATE POLICY "System can insert scores" ON public.scrabble_scores
    FOR INSERT WITH CHECK (true); -- Allow system to insert scores

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_scrabble_games_updated_at ON public.scrabble_games;
CREATE TRIGGER update_scrabble_games_updated_at 
    BEFORE UPDATE ON public.scrabble_games 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_coins_updated_at ON public.user_coins;
CREATE TRIGGER update_user_coins_updated_at 
    BEFORE UPDATE ON public.user_coins 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.scrabble_games TO anon, authenticated;
GRANT ALL ON public.scrabble_moves TO anon, authenticated;
GRANT ALL ON public.user_coins TO anon, authenticated;
GRANT ALL ON public.coin_transactions TO anon, authenticated;
GRANT ALL ON public.scrabble_scores TO anon, authenticated;

-- Insert some starter data for testing (optional)
-- Users will get 1000 free coins when they first play
