-- Fix for infinite recursion in RLS policies
-- Run this to replace the problematic policies

-- First, drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create corrected policies that avoid recursion

-- 1. Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can read public profiles (but avoid self-reference in admin check)
CREATE POLICY "users_select_public" ON users
  FOR SELECT USING (
    is_public = true 
    AND NOT is_banned 
    AND auth.uid() != id  -- Don't use this policy for own profile
  );

-- 3. Users can insert their own profile (for initial creation)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Users can update their own profile (but not admin fields)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND OLD.is_admin = NEW.is_admin  -- Cannot change admin status
    AND OLD.is_banned = NEW.is_banned  -- Cannot change banned status
  );

-- 5. Special policy for service role (used by triggers and functions)
CREATE POLICY "service_role_access" ON users
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- 6. Bypass RLS for admin operations (simpler approach)
-- Admins will use service functions instead of direct table access

-- Alternative: Create a function for admin access that bypasses RLS
CREATE OR REPLACE FUNCTION get_user_for_admin(target_user_id UUID)
RETURNS SETOF users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_id UUID;
  is_admin_user BOOLEAN;
BEGIN
  -- Get the calling user
  calling_user_id := auth.uid();
  
  -- Check if calling user is admin (with RLS disabled for this check)
  SELECT u.is_admin INTO is_admin_user 
  FROM users u 
  WHERE u.id = calling_user_id;
  
  -- If admin, return the requested user
  IF is_admin_user = true THEN
    RETURN QUERY 
    SELECT * FROM users WHERE id = target_user_id;
  ELSE
    -- Not admin, return nothing
    RETURN;
  END IF;
END;
$$;

-- Function for admin to update any user
CREATE OR REPLACE FUNCTION admin_update_user(
  target_user_id UUID,
  new_is_admin BOOLEAN DEFAULT NULL,
  new_is_banned BOOLEAN DEFAULT NULL,
  new_banned_reason TEXT DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calling_user_id UUID;
  is_admin_user BOOLEAN;
  updated_user users;
BEGIN
  -- Get the calling user
  calling_user_id := auth.uid();
  
  -- Check if calling user is admin
  SELECT u.is_admin INTO is_admin_user 
  FROM users u 
  WHERE u.id = calling_user_id AND NOT u.is_banned;
  
  -- Only proceed if caller is admin
  IF is_admin_user != true THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update the target user
  UPDATE users 
  SET 
    is_admin = COALESCE(new_is_admin, is_admin),
    is_banned = COALESCE(new_is_banned, is_banned),
    banned_reason = CASE 
      WHEN new_is_banned = true THEN COALESCE(new_banned_reason, banned_reason)
      WHEN new_is_banned = false THEN NULL
      ELSE banned_reason
    END,
    banned_at = CASE 
      WHEN new_is_banned = true THEN NOW()
      WHEN new_is_banned = false THEN NULL
      ELSE banned_at
    END,
    updated_at = NOW()
  WHERE id = target_user_id
  RETURNING * INTO updated_user;
  
  -- Log the admin action
  INSERT INTO admin_actions (admin_id, target_user_id, action_type, reason)
  VALUES (
    calling_user_id, 
    target_user_id, 
    CASE 
      WHEN new_is_banned = true THEN 'ban'
      WHEN new_is_banned = false THEN 'unban'
      WHEN new_is_admin = true THEN 'promote'
      WHEN new_is_admin = false THEN 'demote'
      ELSE 'update'
    END,
    new_banned_reason
  );
  
  RETURN updated_user;
END;
$$;