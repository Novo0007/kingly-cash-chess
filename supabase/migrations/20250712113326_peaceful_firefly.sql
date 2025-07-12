/*
  # Tournament System Database Schema

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `title` (text, tournament name)
      - `description` (text, optional description)
      - `game_type` (text, type of game)
      - `entry_fee` (numeric, cost to join)
      - `prize_amount` (numeric, winner prize)
      - `max_participants` (integer, maximum players)
      - `current_participants` (integer, current player count)
      - `start_time` (timestamptz, when tournament starts)
      - `end_time` (timestamptz, when tournament ends)
      - `registration_deadline` (timestamptz, optional registration cutoff)
      - `status` (text, tournament status)
      - `winner_id` (uuid, winner reference)
      - `winner_score` (numeric, winning score)
      - `total_prize_pool` (numeric, total prize money)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, creator reference)

    - `tournament_participants`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `username` (text, participant username)
      - `joined_at` (timestamptz, when they joined)
      - `entry_fee_paid` (numeric, amount paid)

    - `tournament_scores`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `score` (numeric, player score)
      - `game_data` (jsonb, optional game state)
      - `game_reference_id` (uuid, optional game reference)
      - `submitted_at` (timestamptz, when score was submitted)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view tournaments
    - Add policies for creators to manage tournaments
    - Add policies for participants to join and submit scores

  3. Functions
    - `join_tournament` function for joining tournaments
    - `submit_tournament_score` function for submitting scores
    - `update_tournament_status` function for status management
</*/

-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    game_type TEXT NOT NULL,
    entry_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    prize_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_participants INTEGER NOT NULL DEFAULT 2,
    current_participants INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    winner_id UUID,
    winner_score NUMERIC(10,2),
    total_prize_pool NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL,
    user_id UUID NOT NULL,
    username TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    entry_fee_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
    UNIQUE(tournament_id, user_id)
);

-- Create tournament_scores table
CREATE TABLE IF NOT EXISTS public.tournament_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL,
    user_id UUID NOT NULL,
    score NUMERIC(10,2) NOT NULL,
    game_data JSONB,
    game_reference_id UUID,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tournament_id, user_id)
);

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournaments_winner_id_fkey'
    ) THEN
        ALTER TABLE tournaments ADD CONSTRAINT tournaments_winner_id_fkey 
        FOREIGN KEY (winner_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournaments_created_by_fkey'
    ) THEN
        ALTER TABLE tournaments ADD CONSTRAINT tournaments_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournament_participants_tournament_id_fkey'
    ) THEN
        ALTER TABLE tournament_participants ADD CONSTRAINT tournament_participants_tournament_id_fkey 
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournament_participants_user_id_fkey'
    ) THEN
        ALTER TABLE tournament_participants ADD CONSTRAINT tournament_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournament_scores_tournament_id_fkey'
    ) THEN
        ALTER TABLE tournament_scores ADD CONSTRAINT tournament_scores_tournament_id_fkey 
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tournament_scores_user_id_fkey'
    ) THEN
        ALTER TABLE tournament_scores ADD CONSTRAINT tournament_scores_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON public.tournaments(game_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON public.tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON public.tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_tournament_id ON public.tournament_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_user_id ON public.tournament_scores(user_id);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tournaments
CREATE POLICY "Allow authenticated users to view tournaments" ON public.tournaments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow tournament creators to insert" ON public.tournaments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow tournament creators to update" ON public.tournaments
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Allow tournament creators to delete" ON public.tournaments
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for tournament_participants
CREATE POLICY "Allow users to view tournament participants" ON public.tournament_participants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to join tournaments" ON public.tournament_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tournament_scores
CREATE POLICY "Allow users to view tournament scores" ON public.tournament_scores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to submit their own scores" ON public.tournament_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own scores" ON public.tournament_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Create join_tournament function
CREATE OR REPLACE FUNCTION join_tournament(
    tournament_id_param UUID,
    user_id_param UUID,
    username_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_record RECORD;
    entry_fee_amount NUMERIC;
    user_wallet_balance NUMERIC;
    result JSON;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record 
    FROM tournaments 
    WHERE id = tournament_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check if tournament is accepting registrations
    IF tournament_record.status != 'upcoming' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is not accepting registrations');
    END IF;
    
    -- Check if tournament is full
    IF tournament_record.current_participants >= tournament_record.max_participants THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is full');
    END IF;
    
    -- Check if user is already registered
    IF EXISTS (
        SELECT 1 FROM tournament_participants 
        WHERE tournament_id = tournament_id_param AND user_id = user_id_param
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Already registered for this tournament');
    END IF;
    
    entry_fee_amount := tournament_record.entry_fee;
    
    -- Check wallet balance if entry fee is required
    IF entry_fee_amount > 0 THEN
        SELECT balance INTO user_wallet_balance 
        FROM wallets 
        WHERE user_id = user_id_param;
        
        IF user_wallet_balance IS NULL OR user_wallet_balance < entry_fee_amount THEN
            RETURN json_build_object('success', false, 'error', 'Insufficient wallet balance');
        END IF;
        
        -- Deduct entry fee from wallet
        UPDATE wallets 
        SET balance = balance - entry_fee_amount,
            updated_at = now()
        WHERE user_id = user_id_param;
        
        -- Record transaction
        INSERT INTO transactions (user_id, transaction_type, amount, description, status)
        VALUES (user_id_param, 'game_entry', -entry_fee_amount, 
                'Tournament entry fee: ' || tournament_record.title, 'completed');
    END IF;
    
    -- Add participant
    INSERT INTO tournament_participants (tournament_id, user_id, username, entry_fee_paid)
    VALUES (tournament_id_param, user_id_param, username_param, entry_fee_amount);
    
    -- Update tournament participant count and prize pool
    UPDATE tournaments 
    SET current_participants = current_participants + 1,
        total_prize_pool = total_prize_pool + entry_fee_amount,
        updated_at = now()
    WHERE id = tournament_id_param;
    
    RETURN json_build_object(
        'success', true, 
        'participant_id', (SELECT id FROM tournament_participants WHERE tournament_id = tournament_id_param AND user_id = user_id_param),
        'entry_fee_paid', entry_fee_amount
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create submit_tournament_score function
CREATE OR REPLACE FUNCTION submit_tournament_score(
    tournament_id_param UUID,
    user_id_param UUID,
    score_param NUMERIC,
    game_data_param JSONB DEFAULT NULL,
    game_reference_id_param UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_record RECORD;
    existing_score NUMERIC;
    score_id UUID;
    is_new_best BOOLEAN := false;
    result JSON;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record 
    FROM tournaments 
    WHERE id = tournament_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check if tournament is active
    IF tournament_record.status != 'active' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is not active');
    END IF;
    
    -- Check if user is registered
    IF NOT EXISTS (
        SELECT 1 FROM tournament_participants 
        WHERE tournament_id = tournament_id_param AND user_id = user_id_param
    ) THEN
        RETURN json_build_object('success', false, 'error', 'User not registered for this tournament');
    END IF;
    
    -- Check existing score
    SELECT score INTO existing_score 
    FROM tournament_scores 
    WHERE tournament_id = tournament_id_param AND user_id = user_id_param;
    
    IF existing_score IS NULL OR score_param > existing_score THEN
        is_new_best := true;
        
        -- Insert or update score
        INSERT INTO tournament_scores (tournament_id, user_id, score, game_data, game_reference_id)
        VALUES (tournament_id_param, user_id_param, score_param, game_data_param, game_reference_id_param)
        ON CONFLICT (tournament_id, user_id) 
        DO UPDATE SET 
            score = score_param,
            game_data = game_data_param,
            game_reference_id = game_reference_id_param,
            submitted_at = now()
        RETURNING id INTO score_id;
    ELSE
        score_id := (SELECT id FROM tournament_scores WHERE tournament_id = tournament_id_param AND user_id = user_id_param);
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'score_id', score_id,
        'is_new_best', is_new_best,
        'current_best', COALESCE(existing_score, score_param)
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create update_tournament_status function
CREATE OR REPLACE FUNCTION update_tournament_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update tournaments to active status
    UPDATE tournaments 
    SET status = 'active', updated_at = now()
    WHERE status = 'upcoming' 
    AND start_time <= now();
    
    -- Update tournaments to completed status
    UPDATE tournaments 
    SET status = 'completed', updated_at = now()
    WHERE status = 'active' 
    AND end_time <= now();
    
    -- Update winners for completed tournaments
    UPDATE tournaments 
    SET winner_id = subquery.user_id,
        winner_score = subquery.max_score,
        updated_at = now()
    FROM (
        SELECT DISTINCT ON (ts.tournament_id) 
            ts.tournament_id, 
            ts.user_id, 
            ts.score as max_score
        FROM tournament_scores ts
        INNER JOIN tournaments t ON t.id = ts.tournament_id
        WHERE t.status = 'completed' AND t.winner_id IS NULL
        ORDER BY ts.tournament_id, ts.score DESC, ts.submitted_at ASC
    ) subquery
    WHERE tournaments.id = subquery.tournament_id;
    
END;
$$;

-- Insert sample tournaments for testing
INSERT INTO tournaments (
    title, description, game_type, entry_fee, prize_amount, max_participants,
    start_time, end_time, status, total_prize_pool, created_by
) VALUES 
(
    'Word Search Championship',
    'Compete in the ultimate word search challenge!',
    'wordsearch',
    5.00,
    50.00,
    20,
    now() + interval '1 hour',
    now() + interval '4 hours',
    'upcoming',
    0,
    (SELECT id FROM users LIMIT 1)
),
(
    'Math Masters Tournament',
    'Test your mathematical skills against other players',
    'math',
    10.00,
    100.00,
    16,
    now() + interval '2 hours',
    now() + interval '5 hours',
    'upcoming',
    0,
    (SELECT id FROM users LIMIT 1)
),
(
    'Chess Grand Prix',
    'Strategic chess tournament for all skill levels',
    'chess',
    15.00,
    150.00,
    12,
    now() + interval '3 hours',
    now() + interval '6 hours',
    'upcoming',
    0,
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT DO NOTHING;