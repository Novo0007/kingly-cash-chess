-- Create enum types for the chess platform
CREATE TYPE public.game_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');
CREATE TYPE public.game_result AS ENUM ('white_wins', 'black_wins', 'draw', 'abandoned');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'game_entry', 'game_winning', 'refund');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  chess_rating INTEGER DEFAULT 1200,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- User wallet system
CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  locked_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Transaction history
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chess games table
CREATE TABLE public.chess_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  white_player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  black_player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  prize_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  game_status game_status DEFAULT 'waiting',
  game_result game_result,
  winner_id UUID REFERENCES auth.users(id),
  board_state TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  move_history TEXT[] DEFAULT '{}',
  current_turn TEXT DEFAULT 'white',
  time_control INTEGER DEFAULT 600, -- 10 minutes in seconds
  white_time_remaining INTEGER DEFAULT 600,
  black_time_remaining INTEGER DEFAULT 600,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend system
CREATE TABLE public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Game invitations
CREATE TABLE public.game_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES chess_games(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  entry_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chess games
CREATE POLICY "Users can view games they participate in" ON public.chess_games FOR SELECT 
  USING (auth.uid() = white_player_id OR auth.uid() = black_player_id OR game_status = 'waiting');
CREATE POLICY "Users can create games" ON public.chess_games FOR INSERT WITH CHECK (auth.uid() = white_player_id);
CREATE POLICY "Users can update games they participate in" ON public.chess_games FOR UPDATE 
  USING (auth.uid() = white_player_id OR auth.uid() = black_player_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships" ON public.friendships FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can create friendship requests" ON public.friendships FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendship status" ON public.friendships FOR UPDATE 
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- RLS Policies for game invitations
CREATE POLICY "Users can view invitations sent to them or by them" ON public.game_invitations FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create invitations" ON public.game_invitations FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update invitation responses" ON public.game_invitations FOR UPDATE 
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- Function to create wallet when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile and wallet
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_chess_games_updated_at BEFORE UPDATE ON public.chess_games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();