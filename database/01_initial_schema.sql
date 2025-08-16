-- MP3 Ninja Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (custom user data linked to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_at TIMESTAMP WITH TIME ZONE,
  banned_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table (normalized - no duplication)
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_url TEXT UNIQUE NOT NULL,
  youtube_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  view_count BIGINT DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Downloads (many-to-many relationship)
CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_id) -- Prevent duplicate downloads per user
);

-- Admin actions log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'ban', 'unban', 'delete', 'promote'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friendships (social feature)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  -- Prevent self-friendship
  CHECK (user_id != friend_id)
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at for users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment song download count
CREATE OR REPLACE FUNCTION increment_song_downloads()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE songs 
    SET total_downloads = total_downloads + 1 
    WHERE id = NEW.song_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-increment download count when user downloads song
CREATE TRIGGER increment_downloads_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW 
  EXECUTE FUNCTION increment_song_downloads();

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_songs_youtube_id ON songs(youtube_id);
CREATE INDEX idx_songs_title_search ON songs USING gin(to_tsvector('english', title || ' ' || COALESCE(artist, '')));
CREATE INDEX idx_user_downloads_user_id ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_song_id ON user_downloads(song_id);
CREATE INDEX idx_user_downloads_downloaded_at ON user_downloads(downloaded_at DESC);
CREATE INDEX idx_friendships_user_friend ON friendships(user_id, friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target_user_id ON admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);