-- Fix RLS policies for user_songs table to allow service role operations
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own songs" ON user_songs;
DROP POLICY IF EXISTS "Users can insert their own songs" ON user_songs;
DROP POLICY IF EXISTS "Users can update their own songs" ON user_songs;
DROP POLICY IF EXISTS "Users can delete their own songs" ON user_songs;
DROP POLICY IF EXISTS "Admins can view all songs" ON user_songs;

-- Create new policies that work with both authenticated users and service role
CREATE POLICY "Users can view their own songs" ON user_songs
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can insert their own songs" ON user_songs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can update their own songs" ON user_songs
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete their own songs" ON user_songs
  FOR DELETE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Admin policy for moderation
CREATE POLICY "Admins can view all songs" ON user_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    ) OR auth.role() = 'service_role'
  );