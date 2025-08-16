# MP3 Ninja Database Setup

## 🚀 Current Status: New Database Architecture

**IMPORTANT**: This documentation reflects the new database design separating Library and Downloads functionality.

### New Schema Overview
- **User Library**: Saved/bookmarked songs for later access
- **User Downloads**: Actual MP3 files with download metadata
- **Simplified Architecture**: No complex many-to-many relationships

## 🗄️ Database Architecture

### Core Tables Design

#### Users Table (Existing - ✅ Implemented)
```sql
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  display_name TEXT,
  username TEXT UNIQUE,           -- Auto-generated from email
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_at TIMESTAMP,
  banned_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### User Library Table (🔄 New - To Be Implemented)
```sql
user_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT NOT NULL,
  artist TEXT,                    -- Channel name or extracted artist
  duration TEXT,                  -- "3:45" format
  thumbnail_url TEXT,
  view_count BIGINT,
  upload_date TIMESTAMP,
  channel_name TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, youtube_id)     -- Prevent duplicate library entries
)
```

#### User Downloads Table (🔄 New - To Be Implemented)
```sql
user_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT NOT NULL,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  file_path TEXT,                 -- Path to actual MP3 file
  file_size BIGINT,              -- File size in bytes
  download_quality TEXT,          -- '128kbps', '320kbps', etc.
  downloaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, youtube_id)     -- One download per user per song
)
```

## 🔄 Migration Plan: From Current to New Schema

### Current State (What Exists Now)
- ✅ `users` table with authentication
- ✅ `songs` table (normalized, will be deprecated)
- ✅ `user_downloads` table (currently used as library, will be repurposed)
- ✅ RLS policies and security

### Migration Steps (To Be Executed)

#### Step 1: Create New Library Table
```sql
-- Create user_library table for saved songs
CREATE TABLE user_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT NOT NULL,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  view_count BIGINT,
  upload_date TIMESTAMP,
  channel_name TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, youtube_id)
);
```

#### Step 2: Migrate Existing Data
```sql
-- Move existing user_downloads to user_library
-- (Current user_downloads is actually acting as library)
INSERT INTO user_library (user_id, youtube_id, youtube_url, title, artist, duration, thumbnail_url, added_at)
SELECT 
  ud.user_id,
  s.youtube_id,
  s.youtube_url,
  s.title,
  s.artist,
  s.duration,
  s.thumbnail_url,
  ud.downloaded_at
FROM user_downloads ud
JOIN songs s ON s.id = ud.song_id;
```

#### Step 3: Recreate Downloads Table
```sql
-- Drop and recreate user_downloads for actual MP3 files
DROP TABLE user_downloads;

CREATE TABLE user_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT NOT NULL,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  file_path TEXT,
  file_size BIGINT,
  download_quality TEXT,
  downloaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, youtube_id)
);
```

#### Step 4: Remove Old Tables
```sql
-- Remove normalized songs table (no longer needed)
DROP TABLE songs;
```

## 🚦 Quick Setup Instructions

### 1. Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vgkaiaqhmvoqfbsgityo` 
3. Navigate to **SQL Editor** in the left sidebar

### 2. Current Setup (For New Projects)
Execute these scripts **in order**:

#### Step 1: Create Core Schema
```sql
-- Copy and paste the contents of 01_initial_schema.sql
-- This creates: users, songs, user_downloads, admin_actions, friendships tables
-- Note: This is the OLD schema - will be updated soon
```

#### Step 2: Set Up Security Policies  
```sql
-- Copy and paste the contents of 02_row_level_security.sql  
-- This adds RLS policies and auto-user creation trigger
```

#### Step 6: Enable Auto-Username Generation (RECOMMENDED!)
```sql
-- Copy and paste the contents of 06_auto_username_generation.sql
-- This auto-generates usernames from email prefixes on first login
-- Examples: john.doe@gmail.com → johndoe, test@example.com → test
```

## 📋 User Flow Examples

### Search → Library → Download Flow
```sql
-- 1. User searches for "lofi hip hop" (YouTube API call)
-- 2. User clicks "Add to Library" on a video
INSERT INTO user_library (user_id, youtube_id, title, artist, duration, thumbnail_url)
VALUES ($user_id, 'dQw4w9WgXcQ', 'Lofi Hip Hop Study Mix', 'ChillVibes Channel', '2:30:45', 'https://img.youtube.com/...');

-- 3. Later, user browses their library
SELECT * FROM user_library WHERE user_id = $user_id ORDER BY added_at DESC;

-- 4. User decides to download a song from library
INSERT INTO user_downloads (user_id, youtube_id, title, artist, file_path, file_size, download_quality)
VALUES ($user_id, 'dQw4w9WgXcQ', 'Lofi Hip Hop Study Mix', 'ChillVibes Channel', '/downloads/lofi_mix.mp3', 125829120, '320kbps');
```

### Library Management Queries
```sql
-- Check if song already in library
SELECT EXISTS(
  SELECT 1 FROM user_library 
  WHERE user_id = $user_id AND youtube_id = $youtube_id
);

-- Get library with pagination
SELECT * FROM user_library 
WHERE user_id = $user_id 
ORDER BY added_at DESC 
LIMIT 20 OFFSET $offset;

-- Search within user's library
SELECT * FROM user_library 
WHERE user_id = $user_id 
AND (title ILIKE '%query%' OR artist ILIKE '%query%')
ORDER BY added_at DESC;

-- Remove from library
DELETE FROM user_library 
WHERE user_id = $user_id AND youtube_id = $youtube_id;
```

### Download Management Queries
```sql
-- Get user's downloaded files
SELECT * FROM user_downloads 
WHERE user_id = $user_id 
ORDER BY downloaded_at DESC;

-- Check download status
SELECT 
  ul.*,
  CASE WHEN ud.id IS NOT NULL THEN true ELSE false END as is_downloaded
FROM user_library ul
LEFT JOIN user_downloads ud ON ul.user_id = ud.user_id AND ul.youtube_id = ud.youtube_id
WHERE ul.user_id = $user_id;

-- Get download statistics
SELECT 
  COUNT(*) as total_library_songs,
  COUNT(ud.id) as total_downloads,
  SUM(ud.file_size) as total_download_size
FROM user_library ul
LEFT JOIN user_downloads ud ON ul.user_id = ud.user_id AND ul.youtube_id = ud.youtube_id
WHERE ul.user_id = $user_id;
```

## 🔒 Security & RLS Policies

### Library Table Policies (To Be Added)
```sql
-- Enable RLS
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Users can only see their own library
CREATE POLICY "users_own_library" ON user_library
  FOR ALL USING (auth.uid() = user_id);

-- Admins can see all libraries
CREATE POLICY "admins_view_all_libraries" ON user_library
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );
```

### Downloads Table Policies (To Be Added)
```sql
-- Enable RLS
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;

-- Users can only see their own downloads
CREATE POLICY "users_own_downloads" ON user_downloads
  FOR ALL USING (auth.uid() = user_id);

-- Admins can see all downloads
CREATE POLICY "admins_view_all_downloads" ON user_downloads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true AND NOT is_banned
    )
  );
```

## 🎯 Performance Optimizations

### Indexes (To Be Added)
```sql
-- Library table indexes
CREATE INDEX idx_user_library_user_id ON user_library(user_id);
CREATE INDEX idx_user_library_youtube_id ON user_library(youtube_id);
CREATE INDEX idx_user_library_added_at ON user_library(added_at DESC);
CREATE INDEX idx_user_library_search ON user_library USING gin(to_tsvector('english', title || ' ' || COALESCE(artist, '')));

-- Downloads table indexes
CREATE INDEX idx_user_downloads_user_id ON user_downloads(user_id);
CREATE INDEX idx_user_downloads_youtube_id ON user_downloads(youtube_id);
CREATE INDEX idx_user_downloads_downloaded_at ON user_downloads(downloaded_at DESC);
CREATE INDEX idx_user_downloads_file_size ON user_downloads(file_size);
```

## 🧪 Verify Setup
After running the scripts, verify the tables exist:
```sql
-- Check current tables (old schema)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'songs', 'user_downloads', 'admin_actions', 'friendships');

-- Check new tables (after migration)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_library', 'user_downloads', 'admin_actions', 'friendships');
```

## 🚀 Test Authentication
1. Start your Next.js dev server: `npm run dev`
2. Navigate to `/login`
3. Sign in with Google
4. Check Supabase **Authentication > Users** - you should see the new user
5. Check **Table Editor > users** - you should see the custom user record

## 🚨 Troubleshooting

### Common Issues

#### Error: "Could not find table 'public.users'"
- Make sure you ran `01_initial_schema.sql` first
- Check that the script executed without errors
- Verify tables exist in Supabase Table Editor

#### Google OAuth Not Working
1. Configure Google OAuth in Supabase Auth settings
2. Add your domain to authorized origins
3. Set redirect URL to: `http://localhost:3000/auth/callback`

#### RLS Policy Issues
- Current RLS policies work with existing schema
- New policies will be needed after migration to new schema
- Restart your Next.js app after applying database changes

## 🛣️ Next Steps

### Immediate (Current Sprint)
1. ✅ **Authentication System** - Complete
2. ✅ **User Management** - Complete  
3. 🔄 **Search Implementation** - In Progress
   - Video URL parsing
   - Playlist URL parsing
   - Word/text search
   - Search results display

### Upcoming (Next Sprint)
4. 🔲 **Database Migration** - Implement new schema
   - Create `user_library` table
   - Migrate existing data
   - Update `user_downloads` table
   - Add new RLS policies

5. 🔲 **Library Management** - User interface
   - Library page with saved songs
   - Add/remove from library
   - Search within library
   - Organization features

### Future Development
6. 🔲 **Download System** - MP3 processing
   - YouTube to MP3 conversion
   - File management
   - Download queue
   - Progress tracking

7. 🔲 **Social Features** - Community aspects
   - Friend system
   - Music discovery
   - Activity feeds
   - Popular songs

8. 🔲 **Advanced Features** - Enhanced experience
   - Dark mode
   - PWA capabilities
   - Offline functionality
   - Advanced search filters

## 📊 Implementation Priority

### High Priority (Search Sprint)
- YouTube URL validation and parsing
- Search results interface
- "Add to Library" functionality
- Basic library viewing

### Medium Priority (Library Sprint)
- Database schema migration
- Library management interface
- Search within library
- Bulk operations

### Low Priority (Future Sprints)
- Actual MP3 downloads
- Social features
- Advanced UI enhancements
- Performance optimizations

---

**Note**: This database architecture represents the target state. Current implementation uses the old normalized schema, which will be migrated during the library implementation phase.