/*
  # Create Tournament System

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
      - `winner_id` (uuid, optional winner reference)
      - `winner_score` (numeric, optional winning score)
      - `total_prize_pool` (numeric, total prize money)
      - `created_by` (uuid, optional creator reference)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tournament_participants`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key to tournaments)
      - `user_id` (uuid, foreign key to users)
      - `username` (text, participant username)
      - `joined_at` (timestamptz, when user joined)
      - `entry_fee_paid` (numeric, amount paid to join)

    - `tournament_scores`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key to tournaments)
      - `user_id` (uuid, foreign key to users)
      - `score` (numeric, player's score)
      - `game_data` (jsonb, optional game-specific data)
      - `game_reference_id` (uuid, optional reference to specific game)
      - `submitted_at` (timestamptz, when score was submitted)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view tournaments
    - Add policies for users to manage their own participation and scores

  3. Functions
    - `join_tournament`: Handle tournament registration
    - `submit_tournament_score`: Handle score submission
*/

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  game_type text NOT NULL,
  entry_fee numeric(10,2) NOT NULL DEFAULT 0,
  prize_amount numeric(10,2) NOT NULL DEFAULT 0,
  max_participants integer NOT NULL DEFAULT 100,
  current_participants integer NOT NULL DEFAULT 0,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  registration_deadline timestamptz,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  winner_id uuid REFERENCES users(id),
  winner_score numeric(10,2),
  total_prize_pool numeric(10,2) NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  entry_fee_paid numeric(10,2) NOT NULL DEFAULT 0,
  UNIQUE(tournament_id, user_id)
);

-- Create tournament_scores table
CREATE TABLE IF NOT EXISTS tournament_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score numeric(10,2) NOT NULL,
  game_data jsonb,
  game_reference_id uuid,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_scores ENABLE ROW LEVEL SECURITY;

-- Policies for tournaments table
CREATE POLICY "Users can view all tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tournaments"
  ON tournaments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policies for tournament_participants table
CREATE POLICY "Users can view tournament participants"
  ON tournament_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage participants"
  ON tournament_participants
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policies for tournament_scores table
CREATE POLICY "Users can view tournament scores"
  ON tournament_scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit their own scores"
  ON tournament_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage scores"
  ON tournament_scores
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Function to join tournament
CREATE OR REPLACE FUNCTION join_tournament(
  tournament_id_param uuid,
  user_id_param uuid,
  username_param text
) RETURNS jsonb AS $$
DECLARE
  tournament_record tournaments%ROWTYPE;
  entry_fee_amount numeric(10,2);
  user_wallet_balance numeric(10,2);
  participant_id uuid;
BEGIN
  -- Get tournament details
  SELECT * INTO tournament_record
  FROM tournaments
  WHERE id = tournament_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament not found');
  END IF;

  -- Check if tournament is accepting registrations
  IF tournament_record.status != 'upcoming' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament registration is closed');
  END IF;

  -- Check if tournament is full
  IF tournament_record.current_participants >= tournament_record.max_participants THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament is full');
  END IF;

  -- Check if user is already registered
  IF EXISTS (
    SELECT 1 FROM tournament_participants
    WHERE tournament_id = tournament_id_param AND user_id = user_id_param
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already registered for this tournament');
  END IF;

  entry_fee_amount := tournament_record.entry_fee;

  -- Check wallet balance if entry fee is required
  IF entry_fee_amount > 0 THEN
    SELECT balance INTO user_wallet_balance
    FROM wallets
    WHERE user_id = user_id_param;

    IF user_wallet_balance IS NULL OR user_wallet_balance < entry_fee_amount THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient wallet balance');
    END IF;

    -- Deduct entry fee from wallet
    UPDATE wallets
    SET balance = balance - entry_fee_amount,
        updated_at = now()
    WHERE user_id = user_id_param;

    -- Record transaction
    INSERT INTO transactions (user_id, transaction_type, amount, status, description)
    VALUES (user_id_param, 'game_entry', -entry_fee_amount, 'completed', 'Tournament entry fee: ' || tournament_record.title);
  END IF;

  -- Add participant
  INSERT INTO tournament_participants (tournament_id, user_id, username, entry_fee_paid)
  VALUES (tournament_id_param, user_id_param, username_param, entry_fee_amount)
  RETURNING id INTO participant_id;

  -- Update tournament participant count and prize pool
  UPDATE tournaments
  SET current_participants = current_participants + 1,
      total_prize_pool = total_prize_pool + entry_fee_amount,
      updated_at = now()
  WHERE id = tournament_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'participant_id', participant_id,
    'entry_fee_paid', entry_fee_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit tournament score
CREATE OR REPLACE FUNCTION submit_tournament_score(
  tournament_id_param uuid,
  user_id_param uuid,
  score_param numeric,
  game_data_param jsonb DEFAULT NULL,
  game_reference_id_param uuid DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  tournament_record tournaments%ROWTYPE;
  existing_best_score numeric(10,2);
  score_id uuid;
  is_new_best boolean := false;
BEGIN
  -- Get tournament details
  SELECT * INTO tournament_record
  FROM tournaments
  WHERE id = tournament_id_param;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament not found');
  END IF;

  -- Check if user is registered for tournament
  IF NOT EXISTS (
    SELECT 1 FROM tournament_participants
    WHERE tournament_id = tournament_id_param AND user_id = user_id_param
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not registered for this tournament');
  END IF;

  -- Check if tournament is active
  IF tournament_record.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tournament is not active');
  END IF;

  -- Get existing best score
  SELECT MAX(score) INTO existing_best_score
  FROM tournament_scores
  WHERE tournament_id = tournament_id_param AND user_id = user_id_param;

  -- Check if this is a new best score
  IF existing_best_score IS NULL OR score_param > existing_best_score THEN
    is_new_best := true;
  END IF;

  -- Insert new score
  INSERT INTO tournament_scores (tournament_id, user_id, score, game_data, game_reference_id)
  VALUES (tournament_id_param, user_id_param, score_param, game_data_param, game_reference_id_param)
  RETURNING id INTO score_id;

  RETURN jsonb_build_object(
    'success', true,
    'score_id', score_id,
    'is_new_best', is_new_best,
    'current_best', COALESCE(GREATEST(existing_best_score, score_param), score_param)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON tournaments(game_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_tournament_id ON tournament_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_user_id ON tournament_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_score ON tournament_scores(score DESC);

-- Insert sample tournaments for testing
INSERT INTO tournaments (title, description, game_type, entry_fee, prize_amount, max_participants, start_time, end_time, total_prize_pool, status)
VALUES 
  ('Chess Championship', 'Weekly chess tournament with cash prizes', 'chess', 5.00, 50.00, 20, now() + interval '1 hour', now() + interval '4 hours', 0.00, 'upcoming'),
  ('Ludo Masters', 'Fast-paced ludo tournament', 'ludo', 5.00, 50.00, 16, now() + interval '2 hours', now() + interval '5 hours', 0.00, 'upcoming'),
  ('Math Challenge', 'Test your mathematical skills', 'math', 5.00, 50.00, 50, now() + interval '30 minutes', now() + interval '3.5 hours', 0.00, 'upcoming');