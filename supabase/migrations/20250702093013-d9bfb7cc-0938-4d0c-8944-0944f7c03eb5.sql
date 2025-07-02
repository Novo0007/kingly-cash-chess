
-- Fix SQL injection vulnerabilities in database functions
CREATE OR REPLACE FUNCTION public.increment(table_name text, row_id uuid, column_name text, increment_value integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    allowed_tables text[] := ARRAY['profiles', 'wallets', 'chess_games', 'ludo_games'];
    allowed_columns text[] := ARRAY['games_played', 'games_won', 'chess_rating', 'balance', 'locked_balance'];
BEGIN
    -- Validate table name
    IF table_name != ANY(allowed_tables) THEN
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;
    
    -- Validate column name
    IF column_name != ANY(allowed_columns) THEN
        RAISE EXCEPTION 'Invalid column name: %', column_name;
    END IF;
    
    -- Execute the update with proper validation
    EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE id = $2', 
        table_name, column_name, column_name)
    USING increment_value, row_id;
END;
$$;

-- Fix SQL injection in increment_decimal function
CREATE OR REPLACE FUNCTION public.increment_decimal(table_name text, row_id uuid, column_name text, increment_value numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    allowed_tables text[] := ARRAY['wallets', 'profiles'];
    allowed_columns text[] := ARRAY['balance', 'locked_balance', 'total_earnings'];
BEGIN
    -- Validate table name
    IF table_name != ANY(allowed_tables) THEN
        RAISE EXCEPTION 'Invalid table name: %', table_name;
    END IF;
    
    -- Validate column name
    IF column_name != ANY(allowed_columns) THEN
        RAISE EXCEPTION 'Invalid column name: %', column_name;
    END IF;
    
    -- Execute the update with proper validation
    IF table_name = 'wallets' THEN
        EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE user_id = $2', 
            table_name, column_name, column_name)
        USING increment_value, row_id;
    ELSE
        EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE id = $2', 
            table_name, column_name, column_name)
        USING increment_value, row_id;
    END IF;
END;
$$;

-- Add comprehensive admin policies for missing tables
CREATE POLICY "Admins can delete admin users" ON public.admin_users
FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can delete chess games" ON public.chess_games  
FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can delete ludo games" ON public.ludo_games
FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can delete transactions" ON public.transactions
FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can delete wallets" ON public.wallets
FOR DELETE USING (public.is_admin());

-- Add admin policies for friendships table
CREATE POLICY "Admins can view all friendships" ON public.friendships
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all friendships" ON public.friendships  
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete friendships" ON public.friendships
FOR DELETE USING (public.is_admin());

-- Add admin policies for game invitations
CREATE POLICY "Admins can view all game invitations" ON public.game_invitations
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all game invitations" ON public.game_invitations
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete game invitations" ON public.game_invitations  
FOR DELETE USING (public.is_admin());

-- Strengthen is_admin function with better security
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_is_admin BOOLEAN := FALSE;
BEGIN
    -- Get email from current user if not provided
    IF user_email IS NULL THEN
        SELECT email INTO user_email 
        FROM auth.users 
        WHERE id = auth.uid();
    END IF;
    
    -- Return false if no email found
    IF user_email IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is an active admin
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE email = user_email 
        AND is_active = true
        AND (role = 'admin' OR role = 'super_admin')
    ) INTO user_is_admin;
    
    RETURN user_is_admin;
END;
$$;

-- Create function to validate admin invitation permissions
CREATE OR REPLACE FUNCTION public.can_invite_admins(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql  
SECURITY DEFINER
STABLE
AS $$
DECLARE
    can_invite BOOLEAN := FALSE;
    user_permissions JSONB;
    user_role TEXT;
BEGIN
    -- Get email from current user if not provided
    IF user_email IS NULL THEN
        SELECT email INTO user_email 
        FROM auth.users 
        WHERE id = auth.uid();
    END IF;
    
    -- Return false if no email found
    IF user_email IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get user permissions and role
    SELECT permissions, role INTO user_permissions, user_role
    FROM public.admin_users 
    WHERE email = user_email 
    AND is_active = true;
    
    -- Super admins can always invite
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check invite_admins permission
    IF user_permissions IS NOT NULL AND (user_permissions->>'invite_admins')::boolean = true THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;
