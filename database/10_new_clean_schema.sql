-- MP3 Ninja - New Clean Database Schema
-- Run this AFTER running 09_cleanup_tables.sql
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Songs table (normalized, no duplicates)
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_id TEXT UNIQUE NOT NULL,
  youtube_url TEXT,
  title TEXT,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  view_count BIGINT DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE,
  channel_name TEXT,
  total_downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Songs table (library relationships only)
CREATE TABLE user_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_id) -- Prevent duplicate library entries
);

-- 3. User Downloads table (download relationships only)
CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, song_id) -- Prevent duplicate downloads
);

-- Create indexes for performance
CREATE INDEX idx_songs_youtube_id ON songs(youtube_id);
CREATE INDEX idx_songs_title_search ON songs USING gin(to_tsvector('english', title || ' ' || COALESCE(artist, '') || ' ' || COALESCE(channel_name, '')));
CREATE INDEX idx_user_songs_user_id ON user_songs(user_id);
CREATE INDEX idx_user_songs_song_id ON user_songs(song_id);
CREATE INDEX idx_user_songs_added_at ON user_songs(added_at DESC);
CREATE INDEX idx_user_downloads_user_id ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_song_id ON user_downloads(song_id);
CREATE INDEX idx_user_downloads_downloaded_at ON user_downloads(downloaded_at DESC);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for songs table (public read, admin write)
CREATE POLICY "Anyone can view songs" ON songs
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage songs" ON songs
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_songs table (users can only see their own library)
CREATE POLICY "Users can view their own library" ON user_songs
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can add to their own library" ON user_songs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can remove from their own library" ON user_songs
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- RLS Policies for user_downloads table (users can only see their own downloads)
CREATE POLICY "Users can view their own downloads" ON user_downloads
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can add their own downloads" ON user_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can remove their own downloads" ON user_downloads
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Function to increment total_downloads when a user downloads a song
CREATE OR REPLACE FUNCTION increment_song_downloads()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE songs 
    SET total_downloads = total_downloads + 1 
    WHERE id = NEW.song_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-increment download count
CREATE TRIGGER increment_downloads_trigger
  AFTER INSERT ON user_downloads
  FOR EACH ROW 
  EXECUTE FUNCTION increment_song_downloads();