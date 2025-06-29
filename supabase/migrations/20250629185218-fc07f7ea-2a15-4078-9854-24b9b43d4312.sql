
-- Create admin_users table to track invited admin users
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB DEFAULT '{"payments": true, "withdrawals": true, "users": true, "games": true, "full_access": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
CREATE POLICY "Admins can view all admin users" ON public.admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

CREATE POLICY "Admins can insert new admin users" ON public.admin_users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

CREATE POLICY "Admins can update admin users" ON public.admin_users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au 
    WHERE au.user_id = auth.uid() AND au.is_active = true
  )
);

-- Insert the initial admin user
INSERT INTO public.admin_users (email, role, permissions) 
VALUES (
  'mynameisjyotirmoy@gmail.com', 
  'super_admin',
  '{"payments": true, "withdrawals": true, "users": true, "games": true, "full_access": true, "invite_admins": true}'::jsonb
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF user_email IS NULL THEN
    user_email := (SELECT email FROM auth.users WHERE id = auth.uid());
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email AND is_active = true
  );
END;
$$;

-- Create policies for admin access to other tables
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin());

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.is_admin());

-- Allow admins to view all wallets
CREATE POLICY "Admins can view all wallets" ON public.wallets
FOR SELECT USING (public.is_admin());

-- Allow admins to update all wallets
CREATE POLICY "Admins can update all wallets" ON public.wallets
FOR UPDATE USING (public.is_admin());

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING (public.is_admin());

-- Allow admins to update all transactions
CREATE POLICY "Admins can update all transactions" ON public.transactions
FOR UPDATE USING (public.is_admin());

-- Allow admins to view all chess games
CREATE POLICY "Admins can view all chess games" ON public.chess_games
FOR SELECT USING (public.is_admin());

-- Allow admins to update all chess games
CREATE POLICY "Admins can update all chess games" ON public.chess_games
FOR UPDATE USING (public.is_admin());

-- Allow admins to view all ludo games
CREATE POLICY "Admins can view all ludo games" ON public.ludo_games
FOR SELECT USING (public.is_admin());

-- Allow admins to update all ludo games
CREATE POLICY "Admins can update all ludo games" ON public.ludo_games
FOR UPDATE USING (public.is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
