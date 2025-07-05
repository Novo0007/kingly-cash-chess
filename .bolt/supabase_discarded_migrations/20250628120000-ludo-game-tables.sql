-- Create table for ludo games
CREATE TABLE public.ludo_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_name TEXT,
  game_status TEXT NOT NULL DEFAULT 'waiting' CHECK (game_status IN ('waiting', 'active', 'completed', 'cancelled')),
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  prize_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_players INTEGER NOT NULL DEFAULT 1,
  max_players INTEGER NOT NULL DEFAULT 4,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  player1_id UUID NOT NULL REFERENCES auth.users(id),
  player2_id UUID REFERENCES auth.users(id),
  player3_id UUID REFERENCES auth.users(id),
  player4_id UUID REFERENCES auth.users(id),
  winner_id UUID REFERENCES auth.users(id),
  current_turn TEXT DEFAULT 'red' CHECK (current_turn IN ('red', 'blue', 'green', 'yellow')),
  game_state JSONB DEFAULT '{}',
  is_friend_challenge BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for ludo moves (for move history and real-time updates)
CREATE TABLE public.ludo_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.ludo_games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id),
  move_data JSONB NOT NULL,
  move_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for ludo games
ALTER TABLE public.ludo_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ludo_moves ENABLE ROW LEVEL SECURITY;

-- Create policies for ludo games
CREATE POLICY "Users can view games they are part of" 
  ON public.ludo_games 
  FOR SELECT 
  USING (auth.uid() IN (player1_id, player2_id, player3_id, player4_id) OR game_status = 'waiting');

CREATE POLICY "Users can create games" 
  ON public.ludo_games 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update games they are part of" 
  ON public.ludo_games 
  FOR UPDATE 
  USING (auth.uid() IN (player1_id, player2_id, player3_id, player4_id));

-- Create policies for ludo moves
CREATE POLICY "Users can view moves from games they are part of" 
  ON public.ludo_moves 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.ludo_games 
    WHERE id = game_id 
    AND auth.uid() IN (player1_id, player2_id, player3_id, player4_id)
  ));

CREATE POLICY "Users can create moves in games they are part of" 
  ON public.ludo_moves 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id AND EXISTS (
    SELECT 1 FROM public.ludo_games 
    WHERE id = game_id 
    AND auth.uid() IN (player1_id, player2_id, player3_id, player4_id)
  ));

-- Enable realtime for both tables
ALTER TABLE public.ludo_games REPLICA IDENTITY FULL;
ALTER TABLE public.ludo_moves REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ludo_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ludo_moves;

-- Update game_invitations table to support ludo
ALTER TABLE public.game_invitations ADD COLUMN IF NOT EXISTS ludo_game_id UUID REFERENCES public.ludo_games(id);

-- Create indexes for performance
CREATE INDEX idx_ludo_games_status ON public.ludo_games(game_status);
CREATE INDEX idx_ludo_games_created_at ON public.ludo_games(created_at);
CREATE INDEX idx_ludo_games_players ON public.ludo_games(player1_id, player2_id, player3_id, player4_id);
CREATE INDEX idx_ludo_moves_game_id ON public.ludo_moves(game_id);
CREATE INDEX idx_ludo_moves_created_at ON public.ludo_moves(created_at);
