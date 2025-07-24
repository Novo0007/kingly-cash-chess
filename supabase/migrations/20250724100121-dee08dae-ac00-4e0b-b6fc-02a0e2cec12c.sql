-- Create game2048_scores table
CREATE TABLE public.game2048_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  moves INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'classic',
  board_size INTEGER NOT NULL DEFAULT 4,
  target_reached INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game2048_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own scores" 
ON public.game2048_scores 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can view scores for leaderboard" 
ON public.game2048_scores 
FOR SELECT 
USING (true);

-- Create fourpics_levels table
CREATE TABLE public.fourpics_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  word TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty INTEGER NOT NULL DEFAULT 1,
  coins_reward INTEGER NOT NULL DEFAULT 10,
  hint_letter_cost INTEGER NOT NULL DEFAULT 5,
  hint_image_cost INTEGER NOT NULL DEFAULT 8,
  hint_word_cost INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fourpics_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for fourpics_levels
CREATE POLICY "Anyone can view levels" 
ON public.fourpics_levels 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage levels" 
ON public.fourpics_levels 
FOR ALL 
USING (is_admin());

-- Create fourpics_scores table
CREATE TABLE public.fourpics_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level_id UUID NOT NULL REFERENCES public.fourpics_levels(id),
  level_number INTEGER NOT NULL,
  word TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  hints_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_taken INTEGER NOT NULL DEFAULT 0,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fourpics_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for fourpics_scores
CREATE POLICY "Users can insert their own scores" 
ON public.fourpics_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scores" 
ON public.fourpics_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores" 
ON public.fourpics_scores 
FOR SELECT 
USING (is_admin());

-- Create fourpics_coin_transactions table
CREATE TABLE public.fourpics_coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level_id UUID REFERENCES public.fourpics_levels(id),
  transaction_type TEXT NOT NULL,
  hint_type TEXT,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fourpics_coin_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for fourpics_coin_transactions
CREATE POLICY "Users can insert their own transactions" 
ON public.fourpics_coin_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" 
ON public.fourpics_coin_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.fourpics_coin_transactions 
FOR SELECT 
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_game2048_scores_updated_at
BEFORE UPDATE ON public.game2048_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fourpics_levels_updated_at
BEFORE UPDATE ON public.fourpics_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();