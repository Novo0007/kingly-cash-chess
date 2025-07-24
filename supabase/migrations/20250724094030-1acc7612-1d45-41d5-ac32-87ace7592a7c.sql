-- Create tournaments table
CREATE TABLE public.tournaments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    game_type TEXT NOT NULL,
    entry_fee NUMERIC NOT NULL DEFAULT 0,
    prize_amount NUMERIC NOT NULL DEFAULT 0,
    max_participants INTEGER NOT NULL DEFAULT 100,
    current_participants INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    winner_id UUID,
    winner_score NUMERIC,
    total_prize_pool NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    entry_fee_paid NUMERIC NOT NULL DEFAULT 0,
    UNIQUE(tournament_id, user_id)
);

-- Create tournament scores table
CREATE TABLE public.tournament_scores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL DEFAULT 0,
    game_data JSONB DEFAULT '{}',
    game_reference_id UUID,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_best_score BOOLEAN NOT NULL DEFAULT false
);

-- Create tournament rewards table
CREATE TABLE public.tournament_rewards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    reward_amount NUMERIC NOT NULL DEFAULT 0,
    claimed BOOLEAN NOT NULL DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments" 
ON public.tournaments FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tournaments" 
ON public.tournaments FOR ALL 
USING (is_admin());

-- RLS Policies for tournament participants
CREATE POLICY "Users can view tournament participants" 
ON public.tournament_participants FOR SELECT 
USING (true);

CREATE POLICY "Users can join tournaments" 
ON public.tournament_participants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage participants" 
ON public.tournament_participants FOR ALL 
USING (is_admin());

-- RLS Policies for tournament scores
CREATE POLICY "Users can view tournament scores" 
ON public.tournament_scores FOR SELECT 
USING (true);

CREATE POLICY "Users can submit their own scores" 
ON public.tournament_scores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scores" 
ON public.tournament_scores FOR ALL 
USING (is_admin());

-- RLS Policies for tournament rewards
CREATE POLICY "Users can view their own rewards" 
ON public.tournament_rewards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim their own rewards" 
ON public.tournament_rewards FOR UPDATE 
USING (auth.uid() = user_id AND NOT claimed);

CREATE POLICY "Admins can manage all rewards" 
ON public.tournament_rewards FOR ALL 
USING (is_admin());

-- Function to join tournament
CREATE OR REPLACE FUNCTION public.join_tournament(
    tournament_id_param UUID,
    user_id_param UUID,
    username_param TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_record public.tournaments;
    entry_fee_amount NUMERIC;
    user_wallet public.wallets;
    result JSON;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record FROM public.tournaments WHERE id = tournament_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check if tournament is accepting participants
    IF tournament_record.status != 'upcoming' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament registration is closed');
    END IF;
    
    -- Check if tournament is full
    IF tournament_record.current_participants >= tournament_record.max_participants THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is full');
    END IF;
    
    -- Check registration deadline
    IF tournament_record.registration_deadline IS NOT NULL AND now() > tournament_record.registration_deadline THEN
        RETURN json_build_object('success', false, 'error', 'Registration deadline has passed');
    END IF;
    
    -- Get user's wallet
    SELECT * INTO user_wallet FROM public.wallets WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Wallet not found');
    END IF;
    
    -- Check if user has enough balance
    entry_fee_amount := tournament_record.entry_fee;
    IF user_wallet.balance < entry_fee_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient balance');
    END IF;
    
    -- Deduct entry fee from wallet
    IF entry_fee_amount > 0 THEN
        UPDATE public.wallets 
        SET balance = balance - entry_fee_amount,
            updated_at = now()
        WHERE user_id = user_id_param;
        
        -- Record transaction
        INSERT INTO public.transactions (
            user_id, amount, transaction_type, description, status
        ) VALUES (
            user_id_param, -entry_fee_amount, 'game_entry', 
            'Tournament entry fee: ' || tournament_record.title, 'completed'
        );
    END IF;
    
    -- Add participant
    INSERT INTO public.tournament_participants (
        tournament_id, user_id, username, entry_fee_paid
    ) VALUES (
        tournament_id_param, user_id_param, username_param, entry_fee_amount
    );
    
    -- Update tournament participant count
    UPDATE public.tournaments 
    SET current_participants = current_participants + 1,
        total_prize_pool = total_prize_pool + entry_fee_amount,
        updated_at = now()
    WHERE id = tournament_id_param;
    
    RETURN json_build_object(
        'success', true,
        'participant_id', (SELECT id FROM public.tournament_participants WHERE tournament_id = tournament_id_param AND user_id = user_id_param),
        'entry_fee_paid', entry_fee_amount
    );
END;
$$;

-- Function to submit tournament score
CREATE OR REPLACE FUNCTION public.submit_tournament_score(
    tournament_id_param UUID,
    user_id_param UUID,
    score_param NUMERIC,
    game_data_param JSONB DEFAULT NULL,
    game_reference_id_param UUID DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tournament_record public.tournaments;
    participant_exists BOOLEAN;
    current_best_score NUMERIC;
    is_new_best BOOLEAN := false;
    result JSON;
BEGIN
    -- Get tournament details
    SELECT * INTO tournament_record FROM public.tournaments WHERE id = tournament_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Tournament not found');
    END IF;
    
    -- Check if tournament is active
    IF tournament_record.status != 'active' THEN
        RETURN json_build_object('success', false, 'error', 'Tournament is not active');
    END IF;
    
    -- Check if user is a participant
    SELECT EXISTS(
        SELECT 1 FROM public.tournament_participants 
        WHERE tournament_id = tournament_id_param AND user_id = user_id_param
    ) INTO participant_exists;
    
    IF NOT participant_exists THEN
        RETURN json_build_object('success', false, 'error', 'User is not a participant in this tournament');
    END IF;
    
    -- Get current best score
    SELECT MAX(score) INTO current_best_score 
    FROM public.tournament_scores 
    WHERE tournament_id = tournament_id_param AND user_id = user_id_param;
    
    -- Check if this is a new best score
    IF current_best_score IS NULL OR score_param > current_best_score THEN
        is_new_best := true;
        
        -- Mark previous scores as not best
        UPDATE public.tournament_scores 
        SET is_best_score = false 
        WHERE tournament_id = tournament_id_param AND user_id = user_id_param;
    END IF;
    
    -- Insert new score
    INSERT INTO public.tournament_scores (
        tournament_id, user_id, score, game_data, game_reference_id, is_best_score
    ) VALUES (
        tournament_id_param, user_id_param, score_param, game_data_param, game_reference_id_param, is_new_best
    );
    
    RETURN json_build_object(
        'success', true,
        'score_id', (SELECT id FROM public.tournament_scores WHERE tournament_id = tournament_id_param AND user_id = user_id_param ORDER BY submitted_at DESC LIMIT 1),
        'is_new_best', is_new_best,
        'current_best', COALESCE(GREATEST(current_best_score, score_param), score_param)
    );
END;
$$;

-- Function to claim tournament reward
CREATE OR REPLACE FUNCTION public.claim_tournament_reward(
    reward_id_param UUID,
    user_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reward_record public.tournament_rewards;
    result JSON;
BEGIN
    -- Get reward details
    SELECT * INTO reward_record FROM public.tournament_rewards 
    WHERE id = reward_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Reward not found');
    END IF;
    
    -- Check if already claimed
    IF reward_record.claimed THEN
        RETURN json_build_object('success', false, 'error', 'Reward already claimed');
    END IF;
    
    -- Add reward to wallet
    UPDATE public.wallets 
    SET balance = balance + reward_record.reward_amount,
        updated_at = now()
    WHERE user_id = user_id_param;
    
    -- Mark reward as claimed
    UPDATE public.tournament_rewards 
    SET claimed = true,
        claimed_at = now()
    WHERE id = reward_id_param;
    
    -- Record transaction
    INSERT INTO public.transactions (
        user_id, amount, transaction_type, description, status
    ) VALUES (
        user_id_param, reward_record.reward_amount, 'tournament_reward', 
        'Tournament reward claimed', 'completed'
    );
    
    RETURN json_build_object(
        'success', true,
        'amount_claimed', reward_record.reward_amount
    );
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON public.tournaments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_game_type ON public.tournaments(game_type);
CREATE INDEX idx_tournaments_start_time ON public.tournaments(start_time);
CREATE INDEX idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user_id ON public.tournament_participants(user_id);
CREATE INDEX idx_tournament_scores_tournament_id ON public.tournament_scores(tournament_id);
CREATE INDEX idx_tournament_scores_user_id ON public.tournament_scores(user_id);
CREATE INDEX idx_tournament_rewards_user_id ON public.tournament_rewards(user_id);
CREATE INDEX idx_tournament_rewards_claimed ON public.tournament_rewards(claimed);