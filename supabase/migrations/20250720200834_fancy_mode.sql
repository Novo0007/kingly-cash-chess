/*
  # Create tournaments table

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text, tournament name)
      - `description` (text, tournament description)
      - `game_type` (text, type of game - chess, ludo, etc.)
      - `entry_fee` (numeric, entry fee amount)
      - `prize_pool` (numeric, total prize pool)
      - `max_participants` (integer, maximum number of participants)
      - `current_participants` (integer, current number of participants)
      - `status` (text, tournament status)
      - `start_time` (timestamp, when tournament starts)
      - `end_time` (timestamp, when tournament ends)
      - `created_by` (uuid, creator user id)
      - `winner_id` (uuid, winner user id)
      - `rules` (jsonb, tournament rules and settings)
      - `bracket_data` (jsonb, tournament bracket information)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tournaments` table
    - Add policies for viewing and managing tournaments
*/

CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  game_type text NOT NULL DEFAULT 'chess',
  entry_fee numeric(10,2) NOT NULL DEFAULT 0.00,
  prize_pool numeric(10,2) NOT NULL DEFAULT 0.00,
  max_participants integer NOT NULL DEFAULT 16,
  current_participants integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming',
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  created_by uuid NOT NULL,
  winner_id uuid,
  rules jsonb DEFAULT '{}',
  bracket_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE tournaments ADD CONSTRAINT tournaments_status_check 
  CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled'));

ALTER TABLE tournaments ADD CONSTRAINT tournaments_game_type_check 
  CHECK (game_type IN ('chess', 'ludo', 'word_search', 'math', 'maze', 'hangman', 'fourpics', 'game2048'));

ALTER TABLE tournaments ADD CONSTRAINT tournaments_max_participants_check 
  CHECK (max_participants >= 2 AND max_participants <= 64);

ALTER TABLE tournaments ADD CONSTRAINT tournaments_current_participants_check 
  CHECK (current_participants >= 0 AND current_participants <= max_participants);

-- Add foreign key constraints
ALTER TABLE tournaments ADD CONSTRAINT tournaments_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE tournaments ADD CONSTRAINT tournaments_winner_id_fkey 
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament creators can update their tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all tournaments"
  ON tournaments
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game_type ON tournaments(game_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_by ON tournaments(created_by);

-- Create updated_at trigger
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();