-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('chess', 'math', 'wordsearch', 'codelearn', 'hangman', 'akinator', 'memory', 'fourpics')),
  event_type TEXT NOT NULL CHECK (event_type IN ('tournament', 'challenge', 'special', 'community')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 500,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  first_prize DECIMAL(10,2) DEFAULT 0,
  second_prize DECIMAL(10,2) DEFAULT 0,
  third_prize DECIMAL(10,2) DEFAULT 0,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event participants table
CREATE TABLE public.event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  entry_fee_paid DECIMAL(10,2) DEFAULT 0,
  best_score DECIMAL(10,2) DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, user_id)
);

-- Create event scores table for tracking all attempts
CREATE TABLE public.event_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL,
  game_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event rewards table for winners
CREATE TABLE public.event_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rewards ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (is_admin());

-- Event participants policies
CREATE POLICY "Users can join events" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view event participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Users can update their participation" ON public.event_participants FOR UPDATE USING (auth.uid() = user_id);

-- Event scores policies
CREATE POLICY "Users can submit their scores" ON public.event_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view event scores" ON public.event_scores FOR SELECT USING (true);

-- Event rewards policies
CREATE POLICY "Users can view their rewards" ON public.event_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim their rewards" ON public.event_rewards FOR UPDATE USING (auth.uid() = user_id AND NOT claimed);
CREATE POLICY "Admins can manage all rewards" ON public.event_rewards FOR ALL USING (is_admin());

-- Create function to join an event
CREATE OR REPLACE FUNCTION public.join_event(event_id_param UUID, user_id_param UUID, username_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_record public.events;
    current_participants INTEGER;
    user_wallet public.wallets;
    result JSON;
BEGIN
    -- Get event details
    SELECT * INTO event_record FROM public.events WHERE id = event_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Event not found');
    END IF;
    
    -- Check if event is accepting participants
    IF event_record.status != 'upcoming' AND event_record.status != 'live' THEN
        RETURN json_build_object('success', false, 'error', 'Event registration is closed');
    END IF;
    
    -- Check if event has started (for live events)
    IF event_record.status = 'live' AND now() > event_record.end_date THEN
        RETURN json_build_object('success', false, 'error', 'Event has ended');
    END IF;
    
    -- Check participant limit
    SELECT COUNT(*) INTO current_participants FROM public.event_participants WHERE event_id = event_id_param;
    IF current_participants >= event_record.max_participants THEN
        RETURN json_build_object('success', false, 'error', 'Event is full');
    END IF;
    
    -- Check if user already joined
    IF EXISTS (SELECT 1 FROM public.event_participants WHERE event_id = event_id_param AND user_id = user_id_param) THEN
        RETURN json_build_object('success', false, 'error', 'Already joined this event');
    END IF;
    
    -- Get user's wallet if entry fee required
    IF event_record.entry_fee > 0 THEN
        SELECT * INTO user_wallet FROM public.wallets WHERE user_id = user_id_param;
        
        IF NOT FOUND THEN
            RETURN json_build_object('success', false, 'error', 'Wallet not found');
        END IF;
        
        IF user_wallet.balance < event_record.entry_fee THEN
            RETURN json_build_object('success', false, 'error', 'Insufficient balance');
        END IF;
        
        -- Deduct entry fee
        UPDATE public.wallets 
        SET balance = balance - event_record.entry_fee, updated_at = now()
        WHERE user_id = user_id_param;
        
        -- Record transaction
        INSERT INTO public.transactions (user_id, amount, transaction_type, description, status)
        VALUES (user_id_param, -event_record.entry_fee, 'game_entry', 'Event entry fee: ' || event_record.title, 'completed');
    END IF;
    
    -- Add participant
    INSERT INTO public.event_participants (event_id, user_id, username, entry_fee_paid)
    VALUES (event_id_param, user_id_param, username_param, event_record.entry_fee);
    
    RETURN json_build_object('success', true, 'entry_fee_paid', event_record.entry_fee);
END;
$$;

-- Create function to submit event score
CREATE OR REPLACE FUNCTION public.submit_event_score(event_id_param UUID, user_id_param UUID, score_param DECIMAL, game_data_param JSONB DEFAULT '{}')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_record public.events;
    participant_record public.event_participants;
    is_new_best BOOLEAN := false;
    result JSON;
BEGIN
    -- Get event details
    SELECT * INTO event_record FROM public.events WHERE id = event_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Event not found');
    END IF;
    
    -- Check if event is active
    IF event_record.status != 'live' THEN
        RETURN json_build_object('success', false, 'error', 'Event is not active');
    END IF;
    
    -- Check if event has ended
    IF now() > event_record.end_date THEN
        RETURN json_build_object('success', false, 'error', 'Event has ended');
    END IF;
    
    -- Check if user is a participant
    SELECT * INTO participant_record FROM public.event_participants 
    WHERE event_id = event_id_param AND user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User is not a participant in this event');
    END IF;
    
    -- Check if this is a new best score
    IF score_param > participant_record.best_score THEN
        is_new_best := true;
        
        -- Update participant's best score
        UPDATE public.event_participants
        SET best_score = score_param,
            total_attempts = total_attempts + 1,
            last_attempt_at = now()
        WHERE event_id = event_id_param AND user_id = user_id_param;
    ELSE
        -- Just update attempt count
        UPDATE public.event_participants
        SET total_attempts = total_attempts + 1,
            last_attempt_at = now()
        WHERE event_id = event_id_param AND user_id = user_id_param;
    END IF;
    
    -- Insert score record
    INSERT INTO public.event_scores (event_id, user_id, score, game_data)
    VALUES (event_id_param, user_id_param, score_param, game_data_param);
    
    RETURN json_build_object(
        'success', true,
        'is_new_best', is_new_best,
        'current_best', GREATEST(participant_record.best_score, score_param)
    );
END;
$$;

-- Create function to claim event reward
CREATE OR REPLACE FUNCTION public.claim_event_reward(reward_id_param UUID, user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    reward_record public.event_rewards;
    result JSON;
BEGIN
    -- Get reward details
    SELECT * INTO reward_record FROM public.event_rewards 
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
    SET balance = balance + reward_record.reward_amount, updated_at = now()
    WHERE user_id = user_id_param;
    
    -- Mark reward as claimed
    UPDATE public.event_rewards 
    SET claimed = true, claimed_at = now()
    WHERE id = reward_id_param;
    
    -- Record transaction
    INSERT INTO public.transactions (user_id, amount, transaction_type, description, status)
    VALUES (user_id_param, reward_record.reward_amount, 'tournament_reward', 'Event reward claimed', 'completed');
    
    RETURN json_build_object('success', true, 'amount_claimed', reward_record.reward_amount);
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_game_type ON public.events(game_type);
CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX idx_event_scores_event_id ON public.event_scores(event_id);
CREATE INDEX idx_event_rewards_user_id ON public.event_rewards(user_id);

-- Enable realtime
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_participants REPLICA IDENTITY FULL;
ALTER TABLE public.event_scores REPLICA IDENTITY FULL;
ALTER TABLE public.event_rewards REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rewards;