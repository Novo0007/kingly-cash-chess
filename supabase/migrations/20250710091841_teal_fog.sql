/*
  # Create Word Search Game Tables

  1. New Tables
    - `word_search_games`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references users)
      - `game_name` (text)
      - `game_state` (jsonb)
      - `game_status` (text with check constraint)
      - `player1_id` through `player4_id` (uuid, references users)
      - `winner_id` (uuid, references users)
      - `max_players` (integer, 2-4)
      - `current_players` (integer, default 1)
      - `entry_fee` (integer, default 10)
      - `prize_pool` (integer, default 0)
      - `difficulty` (text with check constraint)
      - `grid_size` (integer, 10-20)
      - `word_count` (integer, 5-20)
      - `time_limit` (integer, default 300)
      - `started_at`, `completed_at`, `created_at`, `updated_at` (timestamps)

    - `word_search_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `username` (text)
      - `game_id` (uuid, references word_search_games, nullable)
      - `score` (integer, default 0)
      - `words_found` (integer, default 0)
      - `total_words` (integer)
      - `time_taken` (integer)
      - `hints_used` (integer, default 0)
      - `coins_spent` (integer, default 0)
      - `coins_won` (integer, default 0)
      - `difficulty` (text with check constraint)
      - `game_mode` (text with check constraint)
      - `grid_size` (integer)
      - `is_solo_game` (boolean, default true)
      - `completed_at`, `created_at`, `updated_at` (timestamps)

    - `word_search_moves`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references word_search_games)
      - `user_id` (uuid, references users)
      - `word_found` (text)
      - `start_position` (jsonb)
      - `end_position` (jsonb)
      - `direction` (text)
      - `timestamp`, `created_at` (timestamps)

    - `word_search_hints`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references word_search_games, nullable)
      - `user_id` (uuid, references users)
      - `hint_type` (text with check constraint)
      - `word_target` (text)
      - `coins_spent` (integer, default 5)
      - `used_at`, `created_at` (timestamps)

    - `word_search_coins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `transaction_type` (text with check constraint)
      - `amount` (integer)
      - `balance_after` (integer)
      - `game_id` (uuid, references word_search_games, nullable)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for game participants to view/update games
    - Add indexes for performance
*/

-- Create word_search_games table
CREATE TABLE IF NOT EXISTS word_search_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_name text,
  game_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  game_status text NOT NULL DEFAULT 'waiting',
  player1_id uuid REFERENCES users(id) ON DELETE CASCADE,
  player2_id uuid REFERENCES users(id) ON DELETE CASCADE,
  player3_id uuid REFERENCES users(id) ON DELETE CASCADE,
  player4_id uuid REFERENCES users(id) ON DELETE CASCADE,
  winner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  max_players integer NOT NULL DEFAULT 2,
  current_players integer NOT NULL DEFAULT 1,
  entry_fee integer NOT NULL DEFAULT 10,
  prize_pool integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'medium',
  grid_size integer NOT NULL DEFAULT 15,
  word_count integer NOT NULL DEFAULT 10,
  time_limit integer NOT NULL DEFAULT 300,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT word_search_games_game_status_check 
    CHECK (game_status = ANY (ARRAY['waiting'::text, 'active'::text, 'completed'::text, 'cancelled'::text])),
  CONSTRAINT word_search_games_difficulty_check 
    CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  CONSTRAINT word_search_games_max_players_check 
    CHECK (max_players >= 2 AND max_players <= 4),
  CONSTRAINT word_search_games_grid_size_check 
    CHECK (grid_size >= 10 AND grid_size <= 20),
  CONSTRAINT word_search_games_word_count_check 
    CHECK (word_count >= 5 AND word_count <= 20)
);

-- Create word_search_scores table
CREATE TABLE IF NOT EXISTS word_search_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  game_id uuid REFERENCES word_search_games(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  words_found integer NOT NULL DEFAULT 0,
  total_words integer NOT NULL,
  time_taken integer NOT NULL,
  hints_used integer NOT NULL DEFAULT 0,
  coins_spent integer NOT NULL DEFAULT 0,
  coins_won integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL,
  game_mode text NOT NULL,
  grid_size integer NOT NULL,
  is_solo_game boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT word_search_scores_difficulty_check 
    CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  CONSTRAINT word_search_scores_game_mode_check 
    CHECK (game_mode = ANY (ARRAY['solo'::text, 'multiplayer'::text, 'practice'::text]))
);

-- Create word_search_moves table
CREATE TABLE IF NOT EXISTS word_search_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES word_search_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_found text NOT NULL,
  start_position jsonb NOT NULL,
  end_position jsonb NOT NULL,
  direction text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create word_search_hints table
CREATE TABLE IF NOT EXISTS word_search_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES word_search_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hint_type text NOT NULL,
  word_target text NOT NULL,
  coins_spent integer NOT NULL DEFAULT 5,
  used_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT word_search_hints_hint_type_check 
    CHECK (hint_type = ANY (ARRAY['letter_highlight'::text, 'word_location'::text, 'direction_hint'::text]))
);

-- Create word_search_coins table
CREATE TABLE IF NOT EXISTS word_search_coins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  game_id uuid REFERENCES word_search_games(id) ON DELETE SET NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT word_search_coins_transaction_type_check 
    CHECK (transaction_type = ANY (ARRAY['purchase'::text, 'game_entry'::text, 'hint_purchase'::text, 'game_reward'::text, 'daily_bonus'::text]))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_word_search_games_status ON word_search_games(game_status);
CREATE INDEX IF NOT EXISTS idx_word_search_games_creator_id ON word_search_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_word_search_games_created_at ON word_search_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_word_search_games_difficulty ON word_search_games(difficulty);

CREATE INDEX IF NOT EXISTS idx_word_search_scores_user_id ON word_search_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_game_id ON word_search_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_score ON word_search_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_completed_at ON word_search_scores(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_difficulty ON word_search_scores(difficulty);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_game_mode ON word_search_scores(game_mode);

CREATE INDEX IF NOT EXISTS idx_word_search_moves_game_id ON word_search_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_word_search_moves_user_id ON word_search_moves(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_moves_timestamp ON word_search_moves(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_word_search_hints_game_id ON word_search_hints(game_id);
CREATE INDEX IF NOT EXISTS idx_word_search_hints_user_id ON word_search_hints(user_id);

CREATE INDEX IF NOT EXISTS idx_word_search_coins_user_id ON word_search_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_word_search_coins_created_at ON word_search_coins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_word_search_coins_transaction_type ON word_search_coins(transaction_type);

-- Enable Row Level Security
ALTER TABLE word_search_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_search_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_search_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_search_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_search_coins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_search_games
CREATE POLICY "Users can create word search games" ON word_search_games
  FOR INSERT TO public
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view word search games" ON word_search_games
  FOR SELECT TO public
  USING (
    game_status = 'waiting' OR 
    auth.uid() = creator_id OR 
    auth.uid() = player1_id OR 
    auth.uid() = player2_id OR 
    auth.uid() = player3_id OR 
    auth.uid() = player4_id
  );

CREATE POLICY "Users can update their word search games" ON word_search_games
  FOR UPDATE TO public
  USING (
    auth.uid() = creator_id OR 
    auth.uid() = player1_id OR 
    auth.uid() = player2_id OR 
    auth.uid() = player3_id OR 
    auth.uid() = player4_id
  );

-- RLS Policies for word_search_scores
CREATE POLICY "Users can insert their own word search scores" ON word_search_scores
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own word search scores" ON word_search_scores
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard word search scores" ON word_search_scores
  FOR SELECT TO public
  USING (true);

-- RLS Policies for word_search_moves
CREATE POLICY "Users can insert their own word search moves" ON word_search_moves
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view word search moves for their games" ON word_search_moves
  FOR SELECT TO public
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM word_search_games 
      WHERE word_search_games.id = word_search_moves.game_id 
      AND (
        auth.uid() = word_search_games.creator_id OR 
        auth.uid() = word_search_games.player1_id OR 
        auth.uid() = word_search_games.player2_id OR 
        auth.uid() = word_search_games.player3_id OR 
        auth.uid() = word_search_games.player4_id
      )
    )
  );

-- RLS Policies for word_search_hints
CREATE POLICY "Users can insert their own word search hints" ON word_search_hints
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own word search hints" ON word_search_hints
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- RLS Policies for word_search_coins
CREATE POLICY "Users can insert their own word search coin transactions" ON word_search_coins
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own word search coin transactions" ON word_search_coins
  FOR SELECT TO public
  USING (auth.uid() = user_id);