-- Create tournaments system for 3-hour tournaments with entry fees and prizes
-- Entry fee: 5 INR, Prize: 50 INR for highest score

-- Tournament status enum
CREATE TYPE public.tournament_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');

-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('chess', 'ludo', 'maze', 'game2048', 'math', 'wordsearch')),
    entry_fee DECIMAL(10,2) DEFAULT 5.00 NOT NULL,
    prize_amount DECIMAL(10,2) DEFAULT 50.00 NOT NULL,
    max_participants INTEGER DEFAULT 1000,
    current_participants INTEGER DEFAULT 0,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    status tournament_status DEFAULT 'upcoming',
    winner_id UUID REFERENCES public.profiles(id),
    winner_score INTEGER,
    total_prize_pool DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    entry_fee_paid DECIMAL(10,2) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    best_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    last_game_at TIMESTAMPTZ,
    is_disqualified BOOLEAN DEFAULT false,
    UNIQUE(tournament_id, user_id)
);

-- Create tournament_scores table for tracking all scores during tournament
CREATE TABLE IF NOT EXISTS public.tournament_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.tournament_participants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    game_data JSONB, -- Store game-specific data (moves, time, difficulty, etc.)
    achieved_at TIMESTAMPTZ DEFAULT now(),
    game_reference_id UUID, -- Reference to original game score table
    INDEX(tournament_id, score DESC),
    INDEX(tournament_id, user_id, achieved_at)
);

-- Create tournament_transactions table for financial tracking
CREATE TABLE IF NOT EXISTS public.tournament_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('entry_fee', 'prize_payout', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_reference VARCHAR(100), -- Razorpay payment ID or similar
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON public.tournaments(game_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON public.tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_end_time ON public.tournaments(end_time);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON public.tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_best_score ON public.tournament_participants(tournament_id, best_score DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_scores_tournament_id ON public.tournament_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_user_id ON public.tournament_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_score ON public.tournament_scores(tournament_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_achieved_at ON public.tournament_scores(achieved_at DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_transactions_tournament_id ON public.tournament_transactions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_transactions_user_id ON public.tournament_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_transactions_type ON public.tournament_transactions(transaction_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view active tournaments" ON public.tournaments
    FOR SELECT USING (status IN ('upcoming', 'active'));

CREATE POLICY "Anyone can view completed tournaments" ON public.tournaments
    FOR SELECT USING (status = 'completed');

-- RLS Policies for tournament_participants
CREATE POLICY "Users can view tournament participants" ON public.tournament_participants
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own participation" ON public.tournament_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tournament_scores
CREATE POLICY "Users can view tournament scores" ON public.tournament_scores
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own scores" ON public.tournament_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tournament_transactions
CREATE POLICY "Users can view their own transactions" ON public.tournament_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_tournaments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tournaments_updated_at
    BEFORE UPDATE ON public.tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_tournaments_updated_at();

-- Function to automatically update tournament status based on time
CREATE OR REPLACE FUNCTION update_tournament_status()
RETURNS void AS $$
BEGIN
    -- Update upcoming tournaments to active when start time is reached
    UPDATE public.tournaments 
    SET status = 'active'
    WHERE status = 'upcoming' 
    AND start_time <= now();
    
    -- Update active tournaments to completed when end time is reached
    UPDATE public.tournaments 
    SET status = 'completed'
    WHERE status = 'active' 
    AND end_time <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to join a tournament (handles entry fee and validation)
CREATE OR REPLACE FUNCTION join_tournament(
    tournament_id_param UUID,
    user_id_param UUID,
    username_param VARCHAR(50)
)
RETURNS JSON AS $$
DECLARE
    tournament_record RECORD;
    user_wallet RECORD;
    entry_fee_amount DECIMAL(10,2);
    participant_id UUID;
    result JSON;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record 
    FROM public.tournaments 
    WHERE id = tournament_id_param;
    
    IF tournament_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check tournament status and timing
    IF tournament_record.status != 'upcoming' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is not accepting registrations');
    END IF;
    
    IF tournament_record.registration_deadline IS NOT NULL AND tournament_record.registration_deadline < now() THEN
        RETURN json_build_object('success', false, 'error', 'Registration deadline has passed');
    END IF;
    
    -- Check if user is already registered
    IF EXISTS (SELECT 1 FROM public.tournament_participants WHERE tournament_id = tournament_id_param AND user_id = user_id_param) THEN
        RETURN json_build_object('success', false, 'error', 'Already registered for this tournament');
    END IF;
    
    -- Check max participants
    IF tournament_record.current_participants >= tournament_record.max_participants THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is full');
    END IF;
    
    -- Get user wallet
    SELECT * INTO user_wallet 
    FROM public.wallets 
    WHERE user_id = user_id_param;
    
    IF user_wallet IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Wallet not found');
    END IF;
    
    entry_fee_amount := tournament_record.entry_fee;
    
    -- Check if user has sufficient balance
    IF user_wallet.balance < entry_fee_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient balance');
    END IF;
    
    -- Start transaction
    BEGIN
        -- Deduct entry fee from wallet
        UPDATE public.wallets 
        SET balance = balance - entry_fee_amount,
            updated_at = now()
        WHERE user_id = user_id_param;
        
        -- Add user to tournament
        INSERT INTO public.tournament_participants (tournament_id, user_id, username, entry_fee_paid)
        VALUES (tournament_id_param, user_id_param, username_param, entry_fee_amount)
        RETURNING id INTO participant_id;
        
        -- Update tournament participant count and prize pool
        UPDATE public.tournaments 
        SET current_participants = current_participants + 1,
            total_prize_pool = total_prize_pool + entry_fee_amount,
            updated_at = now()
        WHERE id = tournament_id_param;
        
        -- Record transaction
        INSERT INTO public.tournament_transactions (tournament_id, user_id, transaction_type, amount, status, processed_at)
        VALUES (tournament_id_param, user_id_param, 'entry_fee', entry_fee_amount, 'completed', now());
        
        result := json_build_object(
            'success', true, 
            'participant_id', participant_id,
            'entry_fee_paid', entry_fee_amount
        );
        
        RETURN result;
        
    EXCEPTION WHEN OTHERS THEN
        -- Rollback will happen automatically
        RETURN json_build_object('success', false, 'error', 'Transaction failed: ' || SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a tournament score
CREATE OR REPLACE FUNCTION submit_tournament_score(
    tournament_id_param UUID,
    user_id_param UUID,
    score_param INTEGER,
    game_data_param JSONB DEFAULT NULL,
    game_reference_id_param UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    tournament_record RECORD;
    participant_record RECORD;
    score_id UUID;
    is_new_best BOOLEAN := false;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record 
    FROM public.tournaments 
    WHERE id = tournament_id_param;
    
    IF tournament_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check if tournament is active
    IF tournament_record.status != 'active' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is not active');
    END IF;
    
    -- Check if user is registered
    SELECT * INTO participant_record 
    FROM public.tournament_participants 
    WHERE tournament_id = tournament_id_param AND user_id = user_id_param;
    
    IF participant_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Not registered for this tournament');
    END IF;
    
    -- Check if user is disqualified
    IF participant_record.is_disqualified THEN
        RETURN json_build_object('success', false, 'error', 'User is disqualified from this tournament');
    END IF;
    
    -- Insert the score
    INSERT INTO public.tournament_scores (tournament_id, participant_id, user_id, score, game_data, game_reference_id)
    VALUES (tournament_id_param, participant_record.id, user_id_param, score_param, game_data_param, game_reference_id_param)
    RETURNING id INTO score_id;
    
    -- Update participant's best score if this is better
    IF score_param > participant_record.best_score THEN
        UPDATE public.tournament_participants
        SET best_score = score_param,
            last_game_at = now(),
            games_played = games_played + 1
        WHERE id = participant_record.id;
        
        is_new_best := true;
    ELSE
        UPDATE public.tournament_participants
        SET last_game_at = now(),
            games_played = games_played + 1
        WHERE id = participant_record.id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'score_id', score_id,
        'is_new_best', is_new_best,
        'current_best', GREATEST(score_param, participant_record.best_score)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to determine tournament winner and distribute prizes
CREATE OR REPLACE FUNCTION finalize_tournament(tournament_id_param UUID)
RETURNS JSON AS $$
DECLARE
    tournament_record RECORD;
    winner_record RECORD;
    prize_amount DECIMAL(10,2);
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record 
    FROM public.tournaments 
    WHERE id = tournament_id_param;
    
    IF tournament_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check if tournament is completed
    IF tournament_record.status != 'completed' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is not completed yet');
    END IF;
    
    -- Find the winner (highest score)
    SELECT tp.user_id, tp.username, tp.best_score
    INTO winner_record
    FROM public.tournament_participants tp
    WHERE tp.tournament_id = tournament_id_param
    AND tp.is_disqualified = false
    ORDER BY tp.best_score DESC, tp.last_game_at ASC
    LIMIT 1;
    
    IF winner_record IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'No eligible winner found');
    END IF;
    
    prize_amount := tournament_record.prize_amount;
    
    BEGIN
        -- Update tournament with winner
        UPDATE public.tournaments
        SET winner_id = winner_record.user_id,
            winner_score = winner_record.best_score,
            updated_at = now()
        WHERE id = tournament_id_param;
        
        -- Add prize to winner's wallet
        UPDATE public.wallets
        SET balance = balance + prize_amount,
            updated_at = now()
        WHERE user_id = winner_record.user_id;
        
        -- Record prize transaction
        INSERT INTO public.tournament_transactions (tournament_id, user_id, transaction_type, amount, status, processed_at)
        VALUES (tournament_id_param, winner_record.user_id, 'prize_payout', prize_amount, 'completed', now());
        
        RETURN json_build_object(
            'success', true,
            'winner_id', winner_record.user_id,
            'winner_username', winner_record.username,
            'winner_score', winner_record.best_score,
            'prize_amount', prize_amount
        );
        
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Failed to finalize tournament: ' || SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for tournament leaderboards
CREATE OR REPLACE VIEW public.tournament_leaderboard AS
SELECT 
    tp.tournament_id,
    tp.user_id,
    tp.username,
    tp.best_score,
    tp.games_played,
    tp.joined_at,
    tp.last_game_at,
    ROW_NUMBER() OVER (PARTITION BY tp.tournament_id ORDER BY tp.best_score DESC, tp.last_game_at ASC) as rank,
    t.title as tournament_title,
    t.game_type,
    t.status as tournament_status,
    t.prize_amount,
    t.end_time
FROM public.tournament_participants tp
JOIN public.tournaments t ON tp.tournament_id = t.id
WHERE tp.is_disqualified = false
ORDER BY tp.tournament_id, tp.best_score DESC, tp.last_game_at ASC;

-- Grant necessary permissions
GRANT ALL ON public.tournaments TO authenticated;
GRANT ALL ON public.tournament_participants TO authenticated;
GRANT ALL ON public.tournament_scores TO authenticated;
GRANT ALL ON public.tournament_transactions TO authenticated;
GRANT SELECT ON public.tournament_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION join_tournament(UUID, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_tournament_score(UUID, UUID, INTEGER, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION finalize_tournament(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tournament_status() TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert a sample tournament for testing
INSERT INTO public.tournaments (
    title, 
    description, 
    game_type, 
    entry_fee, 
    prize_amount, 
    max_participants,
    start_time, 
    end_time,
    registration_deadline,
    status
) VALUES (
    '2048 Master Tournament',
    'Compete for the highest score in 2048! Entry fee: ₹5, Winner gets ₹50',
    'game2048',
    5.00,
    50.00,
    100,
    now() + interval '1 hour',
    now() + interval '4 hours',
    now() + interval '30 minutes',
    'upcoming'
);
