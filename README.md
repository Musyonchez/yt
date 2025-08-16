# YouTube MP3 Download Platform - Technical Specification

## Project Overview
Multi-user YouTube MP3 download platform with social features, built on Next.js + Supabase. Users can search YouTube, download MP3s directly to device, and discover music through friends.

## Core Architecture

### Database Design (Supabase)

#### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  google_id TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Songs Table (Normalized - No Duplication)
```sql
songs (
  id UUID PRIMARY KEY,
  youtube_url TEXT UNIQUE,
  youtube_id TEXT UNIQUE,
  title TEXT,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  view_count BIGINT,
  total_downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP
)
```

#### User Downloads (Many-to-Many Relationship)
```sql
user_downloads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  song_id UUID REFERENCES songs(id),
  downloaded_at TIMESTAMP,
  UNIQUE(user_id, song_id) -- Prevent duplicate downloads per user
)
```

#### Friendships (Optional Social Feature)
```sql
friendships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  friend_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP,
  UNIQUE(user_id, friend_id)
)
```

### Authentication
- **Google OAuth** via Next-Auth
- Automatic user creation on first login
- Session management
- Cross-device authentication

### File Storage Strategy
- **NO cloud storage** for MP3 files
- **Direct download** to user's device
- **Metadata only** in database for deduplication
- Zero storage costs

## Key Features

### Core Functionality
1. **YouTube Search**: Search with real-time filtering against user's downloads
2. **Playlist Support**: Parse YouTube playlist URLs, bulk filtering
3. **Direct Downloads**: MP3 conversion streams directly to device
4. **Duplicate Prevention**: Visual indicators for already downloaded songs
5. **Cross-Device Sync**: Download metadata syncs across devices

### Social Features
1. **Friend System**: Add friends, see their activity
2. **Popular Songs**: Leaderboard of most downloaded songs
3. **Music Discovery**: "Friends who downloaded this song"
4. **Song Statistics**: Total downloads, trending songs
5. **Activity Feed**: See what friends are downloading
6. **Audio Previews**: Up to 4-minute preview streaming (prevents abuse while allowing full song experience)

### User Experience
1. **Mobile-First**: PWA with offline capability
2. **Real-Time Updates**: Live download progress
3. **Professional UI**: Tailwind CSS, loading states
4. **Search History**: Remember previous searches
5. **Download Queue**: Batch downloads with progress tracking

## Technical Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Components** for reusable UI

### Backend
- **Supabase** for database and real-time features
- **Next.js API Routes** for server-side logic
- **yt-dlp** for YouTube downloading
- **FFmpeg** for MP3 conversion

### Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "next-auth": "^5.x",
    "@next-auth/supabase-adapter": "^2.x",
    "youtubei.js": "^9.x",
    "node-yt-dlp": "^1.x",
    "fluent-ffmpeg": "^2.x",
    "ws": "^8.x"
  }
}
```

## Database Benefits (Normalized Design)

### Storage Efficiency
- One song = one row (regardless of download count)
- 1000 users download same song = 1 song row + 1000 relationship rows
- Massive metadata savings compared to duplicated approach

### Query Examples

#### Check if user already downloaded
```sql
SELECT EXISTS(
  SELECT 1 FROM user_downloads 
  WHERE user_id = $user_id AND song_id = $song_id
);
```

#### Get user's download history
```sql
SELECT s.*, ud.downloaded_at
FROM songs s
JOIN user_downloads ud ON ud.song_id = s.id
WHERE ud.user_id = $user_id
ORDER BY ud.downloaded_at DESC;
```

#### Find popular songs
```sql
SELECT s.title, s.artist, COUNT(ud.user_id) as download_count
FROM songs s
JOIN user_downloads ud ON ud.song_id = s.id
GROUP BY s.id
ORDER BY download_count DESC
LIMIT 50;
```

#### Music discovery (friends' downloads I haven't got)
```sql
SELECT DISTINCT s.*, COUNT(ud.user_id) as friend_count
FROM songs s
JOIN user_downloads ud ON ud.song_id = s.id
JOIN friendships f ON (f.friend_id = ud.user_id)
WHERE f.user_id = $current_user_id
AND f.status = 'accepted'
AND s.id NOT IN (
  SELECT song_id FROM user_downloads WHERE user_id = $current_user_id
)
GROUP BY s.id
ORDER BY friend_count DESC;
```

## App Structure

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── search/page.tsx             # YouTube search
│   ├── library/page.tsx            # User's downloads
│   ├── discover/page.tsx           # Popular & friend activity
│   ├── friends/page.tsx            # Friend management
│   ├── login/page.tsx              # Authentication
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── search/route.ts         # YouTube search
│       ├── download/route.ts       # Download processing
│       ├── songs/route.ts          # Song metadata
│       └── friends/route.ts        # Friend operations
├── components/
│   ├── Auth/
│   │   ├── LoginButton.tsx
│   │   ├── UserProfile.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Search/
│   │   ├── SearchBox.tsx
│   │   ├── SearchResults.tsx
│   │   └── PlaylistInput.tsx
│   ├── Library/
│   │   ├── DownloadHistory.tsx
│   │   ├── SongCard.tsx
│   │   └── DownloadQueue.tsx
│   ├── Social/
│   │   ├── FriendsList.tsx
│   │   ├── PopularSongs.tsx
│   │   └── ActivityFeed.tsx
│   └── UI/
│       ├── LoadingSpinner.tsx
│       ├── ProgressBar.tsx
│       └── Toast.tsx
├── lib/
│   ├── supabase.ts                 # Database client
│   ├── auth.ts                     # Authentication config
│   ├── youtube.ts                  # YouTube API wrapper
│   ├── downloader.ts               # Download processing
│   └── types.ts                    # TypeScript definitions
└── utils/
    ├── validation.ts               # Input validation
    ├── helpers.ts                  # Utility functions
    └── constants.ts                # App constants
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Users can only see their own downloads
CREATE POLICY "users_own_downloads" ON user_downloads
  FOR ALL USING (auth.uid() = user_id);

-- Songs are publicly readable
CREATE POLICY "songs_public_read" ON songs
  FOR SELECT USING (true);

-- Users can only add songs they're downloading
CREATE POLICY "users_add_songs" ON songs
  FOR INSERT WITH CHECK (true);
```

### Privacy Controls
- Private/public library settings
- Selective friend sharing
- Block/unblock users
- Data export capabilities
- Account deletion

## Migration Plan

### Phase 1: Core Setup
1. Initialize Supabase project
2. Set up Google OAuth
3. Create database schema
4. Implement basic authentication

### Phase 2: Basic Downloads
1. YouTube search integration
2. Download to device functionality
3. Basic UI components
4. Duplicate prevention

### Phase 3: Social Features
1. Friend system
2. Popular songs
3. Music discovery
4. Activity feeds

### Phase 4: Advanced Features
1. PWA capabilities
2. Offline functionality
3. Advanced search filters
4. Playlist management

## Audio Preview System

### Preview Strategy
- **Duration Limit**: Maximum 4 minutes per preview (prevents abuse, allows full song experience)
- **Smart Streaming**: Stream audio directly without storing full files
- **Quality**: Reasonable quality for preview purposes (128kbps)
- **Anti-Abuse**: Rate limiting, user session tracking

### Technical Implementation
```sql
-- Add to songs table
ALTER TABLE songs ADD COLUMN preview_available BOOLEAN DEFAULT false;
ALTER TABLE songs ADD COLUMN preview_duration INTEGER; -- actual duration in seconds

-- Preview sessions tracking (anti-abuse)
CREATE TABLE preview_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  song_id UUID REFERENCES songs(id),
  duration_played INTEGER, -- seconds played
  created_at TIMESTAMP,
  UNIQUE(user_id, song_id, DATE(created_at)) -- One session per song per day
);
```

### Preview Components
- **Stream Player**: Direct audio streaming (no download)
- **Progress Control**: Seek within the 4-minute limit
- **Quality Toggle**: 128kbps for preview, full quality for download
- **Session Management**: Track preview usage to prevent abuse

## Questions to Resolve

1. **YouTube API Limits**: How to handle rate limits for search?
2. **Download Processing**: Server-side conversion vs client-side?
3. **Real-time Updates**: WebSocket vs Supabase Realtime?
4. **Friend Discovery**: Email invites vs username search?
5. **Playlist Size Limits**: Max songs per playlist download?
6. **Mobile App**: Web app vs native mobile app?
7. **Content Moderation**: How to handle inappropriate content?
8. **Performance**: Caching strategy for popular songs?
9. **Preview Abuse Prevention**: Daily limits per user? Session timeouts?
10. **Legal Considerations**: Copyright implications of 4-minute previews?
11. **Bandwidth Costs**: Preview streaming costs vs full downloads?

## Success Metrics

### User Engagement
- Daily active users
- Songs downloaded per user
- Friend connections made
- Search-to-download conversion rate

### Technical Performance
- Download success rate
- Average download time
- API response times
- Database query performance
- Preview streaming quality and buffering
- Server resource usage (preview vs download costs)

### Social Features
- Friend activity engagement
- Popular songs discovery rate
- Collaborative playlist usage
- Cross-device usage patterns
- Preview-to-download conversion rate

## Additional Considerations

### Legal & Compliance
- **Copyright**: 4-minute previews may need legal review
- **DMCA**: Takedown request handling system
- **Terms of Service**: Clear usage guidelines for previews
- **Regional Restrictions**: Geo-blocking for certain content

### Scalability Concerns
- **Preview Bandwidth**: Streaming costs vs storage costs analysis
- **CDN Strategy**: Global content delivery for previews
- **Server Load**: Preview generation vs on-demand streaming
- **Database Growth**: User sessions and preview data retention

### User Privacy
- **Listening History**: What preview data do we store?
- **Analytics**: User behavior tracking (anonymized)
- **Data Retention**: How long to keep preview session data
- **GDPR Compliance**: Right to deletion, data export

### Technical Edge Cases
- **Offline Mode**: What happens to previews offline?
- **Network Issues**: Graceful degradation for poor connections
- **Audio Formats**: Compatibility across devices
- **Age-Restricted Content**: YouTube age verification handling
- **Private/Unlisted Videos**: Access permission handling

### Future Features to Consider
- **Lyrics Integration**: Real-time lyrics during preview
- **Audio Analysis**: BPM, genre, mood detection
- **Smart Playlists**: Auto-generated based on preview behavior
- **Social Sharing**: Share specific timestamp moments
- **Voice Search**: "Find me upbeat songs like..."
- **Offline Sync**: Download previews for offline discovery