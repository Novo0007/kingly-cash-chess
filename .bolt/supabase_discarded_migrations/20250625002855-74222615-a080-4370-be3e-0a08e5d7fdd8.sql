
-- Create table for dots and boxes games
CREATE TABLE public.dots_and_boxes_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL,
  player2_id UUID NULL,
  entry_fee NUMERIC NOT NULL DEFAULT 0.00,
  prize_amount NUMERIC NOT NULL DEFAULT 0.00,
  game_status TEXT NOT NULL DEFAULT 'waiting',
  game_name TEXT,
  current_player TEXT NOT NULL DEFAULT 'player1',
  horizontal_lines JSONB NOT NULL DEFAULT '[]',
  vertical_lines JSONB NOT NULL DEFAULT '[]',
  boxes JSONB NOT NULL DEFAULT '[]',
  scores JSONB NOT NULL DEFAULT '{"player1": 0, "player2": 0}',
  winner_id UUID NULL,
  is_friend_challenge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for dots and boxes moves (for move history and real-time updates)
CREATE TABLE public.dots_and_boxes_moves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.dots_and_boxes_games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  move_type TEXT NOT NULL, -- 'horizontal' or 'vertical'
  move_row INTEGER NOT NULL,
  move_col INTEGER NOT NULL,
  boxes_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for dots and boxes games
ALTER TABLE public.dots_and_boxes_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dots_and_boxes_moves ENABLE ROW LEVEL SECURITY;

-- Create policies for dots and boxes games
CREATE POLICY "Users can view games they are part of" 
  ON public.dots_and_boxes_games 
  FOR SELECT 
  USING (auth.uid() = player1_id OR auth.uid() = player2_id OR game_status = 'waiting');

CREATE POLICY "Users can create games" 
  ON public.dots_and_boxes_games 
  FOR INSERT 
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update games they are part of" 
  ON public.dots_and_boxes_games 
  FOR UPDATE 
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Create policies for dots and boxes moves
CREATE POLICY "Users can view moves from games they are part of" 
  ON public.dots_and_boxes_moves 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.dots_and_boxes_games 
    WHERE id = game_id 
    AND (auth.uid() = player1_id OR auth.uid() = player2_id)
  ));

CREATE POLICY "Users can create moves in games they are part of" 
  ON public.dots_and_boxes_moves 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id AND EXISTS (
    SELECT 1 FROM public.dots_and_boxes_games 
    WHERE id = game_id 
    AND (auth.uid() = player1_id OR auth.uid() = player2_id)
    AND game_status = 'active'
  ));

-- Enable realtime for both tables
ALTER TABLE public.dots_and_boxes_games REPLICA IDENTITY FULL;
ALTER TABLE public.dots_and_boxes_moves REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.dots_and_boxes_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dots_and_boxes_moves;

-- Update game_invitations table to support dots and boxes
ALTER TABLE public.game_invitations ADD COLUMN game_type TEXT DEFAULT 'chess';
