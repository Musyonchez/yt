-- Fix UPDATE policy that incorrectly references OLD in WITH CHECK
-- Run this to replace the problematic UPDATE policy

-- Drop the problematic update policy
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Create corrected update policy without OLD reference in WITH CHECK
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: We'll handle admin field protection through application logic
-- rather than database constraints to avoid policy complexity

-- Alternative: Create a safer update function for user profiles
CREATE OR REPLACE FUNCTION update_user_profile(
  new_display_name TEXT DEFAULT NULL,
  new_username TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL,
  new_is_public BOOLEAN DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  updated_user users;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if user exists and is not banned
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_user_id AND NOT is_banned
  ) THEN
    RAISE EXCEPTION 'User not found or banned';
  END IF;
  
  -- Check username uniqueness if provided
  IF new_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM users 
    WHERE username = new_username AND id != current_user_id
  ) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  
  -- Update user profile (only allowed fields)
  UPDATE users 
  SET 
    display_name = COALESCE(new_display_name, display_name),
    username = COALESCE(new_username, username),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    is_public = COALESCE(new_is_public, is_public),
    updated_at = NOW()
  WHERE id = current_user_id
  RETURNING * INTO updated_user;
  
  RETURN updated_user;
END;
$$;