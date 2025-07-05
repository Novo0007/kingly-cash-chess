
-- Add foreign key constraint from transactions to profiles
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from wallets to profiles  
ALTER TABLE public.wallets 
ADD CONSTRAINT fk_wallets_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from profiles to auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_id 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
