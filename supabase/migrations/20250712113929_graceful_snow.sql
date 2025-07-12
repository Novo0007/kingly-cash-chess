/*
  # Create Tournament System

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `game_type` (text)
      - `entry_fee` (numeric)
      - `prize_amount` (numeric)
      - `max_participants` (integer)
      - `current_participants` (integer)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `registration_deadline` (timestamptz, nullable)
      - `status` (text with enum constraint)
      - `winner_id` (uuid, nullable)
      - `winner_score` (numeric, nullable)
      - `total_prize_pool` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, nullable)

    - `tournament_participants`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `username` (text)
      - `joined_at` (timestamptz)
      - `entry_fee_paid` (numeric)

    - `tournament_scores`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `score` (numeric)
      - `game_data` (jsonb, nullable)
      - `game_reference_id` (text, nullable)
      - `submitted_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view tournaments
    - Add policies for users to manage their own participation

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
  status text NOT NULL DEFAULT 'upcoming',
  winner_id uuid,
  winner_score numeric(10,2),
  total_prize_pool numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  CONSTRAINT tournaments_status_check CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  CONSTRAINT tournaments_game_type_check CHECK (game_type IN ('chess', 'ludo', 'maze', 'game2048', 'math', 'wordsearch')),
  CONSTRAINT tournaments_dates_check CHECK (end_time > start_time)
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
  game_reference_id text,
  submitted_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments
CREATE POLICY "Anyone can view tournaments"
  ON tournaments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create policies for tournament_participants
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

-- Create policies for tournament_scores
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON tournaments(game_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_tournament_id ON tournament_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_scores_user_id ON tournament_scores(user_id);

-- Create function to join tournament
CREATE OR REPLACE FUNCTION join_tournament(
  tournament_id_param uuid,
  user_id_param uuid,
  username_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record tournaments%ROWTYPE;
  participant_id uuid;
  entry_fee_amount numeric(10,2);
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

  -- Insert participant
  INSERT INTO tournament_participants (tournament_id, user_id, username, entry_fee_paid)
  VALUES (tournament_id_param, user_id_param, username_param, entry_fee_amount)
  RETURNING id INTO participant_id;

  -- Update tournament participant count
  UPDATE tournaments
  SET current_participants = current_participants + 1,
      total_prize_pool = total_prize_pool + entry_fee_amount
  WHERE id = tournament_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'participant_id', participant_id,
    'entry_fee_paid', entry_fee_amount
  );
END;
$$;

-- Create function to submit tournament score
CREATE OR REPLACE FUNCTION submit_tournament_score(
  tournament_id_param uuid,
  user_id_param uuid,
  score_param numeric,
  game_data_param jsonb DEFAULT NULL,
  game_reference_id_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record tournaments%ROWTYPE;
  score_id uuid;
  current_best_score numeric(10,2);
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

  -- Get current best score
  SELECT COALESCE(MAX(score), 0) INTO current_best_score
  FROM tournament_scores
  WHERE tournament_id = tournament_id_param AND user_id = user_id_param;

  -- Check if this is a new best score
  IF score_param > current_best_score THEN
    is_new_best := true;
  END IF;

  -- Insert score
  INSERT INTO tournament_scores (tournament_id, user_id, score, game_data, game_reference_id)
  VALUES (tournament_id_param, user_id_param, score_param, game_data_param, game_reference_id_param)
  RETURNING id INTO score_id;

  RETURN jsonb_build_object(
    'success', true,
    'score_id', score_id,
    'is_new_best', is_new_best,
    'current_best', GREATEST(current_best_score, score_param)
  );
END;
$$;

-- Insert sample tournaments for testing
INSERT INTO tournaments (
  title,
  description,
  game_type,
  entry_fee,
  prize_amount,
  max_participants,
  start_time,
  end_time,
  registration_deadline,
  status,
  total_prize_pool
) VALUES 
(
  'Chess Championship',
  'Weekly chess tournament with exciting prizes',
  'chess',
  5.00,
  50.00,
  20,
  now() + interval '1 hour',
  now() + interval '4 hours',
  now() + interval '30 minutes',
  'upcoming',
  0.00
),
(
  'Math Challenge',
  'Test your mathematical skills',
  'math',
  5.00,
  50.00,
  15,
  now() + interval '2 hours',
  now() + interval '5 hours',
  now() + interval '1 hour',
  'upcoming',
  0.00
),
(
  'Word Search Masters',
  'Find words faster than your opponents',
  'wordsearch',
  5.00,
  50.00,
  25,
  now() + interval '3 hours',
  now() + interval '6 hours',
  now() + interval '2 hours',
  'upcoming',
  0.00
);