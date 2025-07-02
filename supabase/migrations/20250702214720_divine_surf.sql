/*
  # Fix game invitations profiles relationships

  1. New Foreign Key Constraints
    - Add foreign key from `game_invitations.from_user_id` to `profiles.id`
    - Add foreign key from `game_invitations.to_user_id` to `profiles.id`
  
  2. Security
    - Enable RLS on `game_invitations` table
    - Add policies for users to manage their own invitations
  
  3. Changes
    - This fixes the Supabase query error when trying to join game_invitations with profiles
    - Allows the frontend to use `to_user:profiles(*)` and `from_user:profiles(*)` syntax
*/

-- Add foreign key constraints to link game_invitations with profiles
DO $$
BEGIN
  -- Add foreign key for from_user_id to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_invitations_from_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE game_invitations 
    ADD CONSTRAINT game_invitations_from_user_id_profiles_fkey 
    FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for to_user_id to profiles  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_invitations_to_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE game_invitations 
    ADD CONSTRAINT game_invitations_to_user_id_profiles_fkey 
    FOREIGN KEY (to_user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on game_invitations if not already enabled
ALTER TABLE game_invitations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for game_invitations if they don't exist
DO $$
BEGIN
  -- Policy for users to view invitations sent to them or by them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'game_invitations' 
    AND policyname = 'Users can view invitations sent to them or by them'
  ) THEN
    CREATE POLICY "Users can view invitations sent to them or by them"
      ON game_invitations
      FOR SELECT
      TO public
      USING ((auth.uid() = from_user_id) OR (auth.uid() = to_user_id));
  END IF;

  -- Policy for users to create invitations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'game_invitations' 
    AND policyname = 'Users can create invitations'
  ) THEN
    CREATE POLICY "Users can create invitations"
      ON game_invitations
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = from_user_id);
  END IF;

  -- Policy for users to update invitation responses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'game_invitations' 
    AND policyname = 'Users can update invitation responses'
  ) THEN
    CREATE POLICY "Users can update invitation responses"
      ON game_invitations
      FOR UPDATE
      TO public
      USING ((auth.uid() = to_user_id) OR (auth.uid() = from_user_id));
  END IF;

  -- Policy for admins to manage all invitations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'game_invitations' 
    AND policyname = 'Admins can manage all invitations'
  ) THEN
    CREATE POLICY "Admins can manage all invitations"
      ON game_invitations
      FOR ALL
      TO public
      USING (is_admin());
  END IF;
END $$;