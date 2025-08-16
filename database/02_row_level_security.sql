-- Row Level Security (RLS) Policies for MP3 Ninja
-- Run this AFTER running 01_initial_schema.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can read their own profile and public profiles
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (is_public = true AND NOT is_banned);

-- Users can update their own profile (except admin/banned fields)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from modifying admin/banned status
    is_admin = (SELECT is_admin FROM users WHERE id = auth.uid()) AND
    is_banned = (SELECT is_banned FROM users WHERE id = auth.uid())
  );

-- Users can insert their own profile (auto-created on signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can see and modify all users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );

-- Songs table policies
-- Songs are publicly readable
CREATE POLICY "Songs are publicly readable" ON songs
  FOR SELECT USING (true);

-- Authenticated users can add songs
CREATE POLICY "Authenticated users can add songs" ON songs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can modify songs
CREATE POLICY "Admins can modify songs" ON songs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );

-- User Downloads table policies
-- Users can see their own downloads
CREATE POLICY "Users can view own downloads" ON user_downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own downloads
CREATE POLICY "Users can add own downloads" ON user_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own downloads
CREATE POLICY "Users can delete own downloads" ON user_downloads
  FOR DELETE USING (auth.uid() = user_id);

-- Friends can see each other's downloads (if profile is public)
CREATE POLICY "Friends can view public downloads" ON user_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN friendships f ON (f.user_id = auth.uid() AND f.friend_id = user_downloads.user_id)
      WHERE u.id = user_downloads.user_id 
      AND u.is_public = true 
      AND f.status = 'accepted'
    )
  );

-- Admins can see all downloads
CREATE POLICY "Admins can view all downloads" ON user_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );

-- Admin Actions table policies
-- Only admins can see admin actions
CREATE POLICY "Admins can view admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );

-- Friendships table policies
-- Users can see friendships involving them
CREATE POLICY "Users can view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY "Users can create friendship requests" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friendships involving them (accept, block)
CREATE POLICY "Users can update own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete friendships involving them
CREATE POLICY "Users can delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Admins can see all friendships
CREATE POLICY "Admins can view all friendships" ON friendships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, google_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;