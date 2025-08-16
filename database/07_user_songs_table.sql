-- MP3 Ninja - User Songs Table (Library + Downloads)
-- Unified approach with group_type for better flexibility
-- Run this in your Supabase SQL Editor

-- Create the unified user_songs table
CREATE TABLE user_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  view_count BIGINT,
  upload_date TIMESTAMP WITH TIME ZONE,
  channel_name TEXT,
  group_type TEXT NOT NULL, -- 'library', 'downloaded', 'favorites', 'playlist_1', etc.
  status TEXT DEFAULT 'saved', -- 'saved', 'downloaded', 'deleted'
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  download_url TEXT, -- S3/storage URL for downloaded file
  file_size BIGINT,
  
  -- Prevent duplicate songs per user per group
  UNIQUE(user_id, youtube_id, group_type),
  
  -- Ensure valid group_type and status
  CHECK (group_type IN ('library', 'downloaded', 'favorites')),
  CHECK (status IN ('saved', 'downloaded', 'deleted'))
);

-- Indexes for performance
CREATE INDEX idx_user_songs_user_id ON user_songs(user_id);
CREATE INDEX idx_user_songs_youtube_id ON user_songs(youtube_id);
CREATE INDEX idx_user_songs_group_type ON user_songs(group_type);
CREATE INDEX idx_user_songs_status ON user_songs(status);
CREATE INDEX idx_user_songs_user_group ON user_songs(user_id, group_type);
CREATE INDEX idx_user_songs_added_at ON user_songs(added_at DESC);
CREATE INDEX idx_user_songs_search ON user_songs USING gin(to_tsvector('english', title || ' ' || COALESCE(artist, '') || ' ' || COALESCE(channel_name, '')));

-- Row Level Security policies
ALTER TABLE user_songs ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own songs
CREATE POLICY "Users can view their own songs" ON user_songs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own songs" ON user_songs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs" ON user_songs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs" ON user_songs
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policy for moderation
CREATE POLICY "Admins can view all songs" ON user_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );