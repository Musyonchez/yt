# MP3 Ninja - YouTube Music Platform

## Project Overview
Professional SaaS-grade YouTube MP3 platform with social features. Multi-user application with Google authentication, personal library system, and music discovery features.

## 🚀 Current Implementation Status

### ✅ Completed Features
- **Authentication System**: Supabase + Google OAuth with user profiles
- **User Management**: Admin panel, ban/unban capabilities, profile system
- **Landing Page**: Professional SaaS-grade interface with MP3 Ninja branding
- **Navigation**: Authentication-aware navbar with profile dropdown
- **Custom 404**: Ninja-themed error page with helpful navigation
- **Database Foundation**: RLS policies, auto-user creation, username generation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **🆕 Search System**: Complete three-method search implementation
  - Text search: 25 results via YouTube Data API v3
  - Video URL: Direct video metadata extraction
  - Playlist URL: yt-dlp subprocess for all playlist types (including Mix/Radio)
  - Professional UI with bulk selection and preview links
  - Hybrid API approach for optimal performance and coverage
- **🆕 Library System**: Complete personal music collection functionality
  - Add to Library: Individual songs and bulk playlist imports
  - Smart Filtering: Real-time filtering of search results to hide already-saved songs
  - Duplicate Detection: Automatic prevention of re-adding existing songs
  - Performance Optimized: Parallel API calls with video ID-only queries
  - REST API: Complete endpoints for library management and filtering

### 🔄 In Development
- **Library Management UI**: Dedicated library page for viewing and organizing saved songs

### ❌ Planned Features
- **Download System**: Actual MP3 file processing and device downloads
- **Social Features**: Friend system, music discovery, activity feeds
- **Advanced UI**: Dark mode, advanced filtering, playlist management

## 🎯 Core Architecture

### Database Design - Library vs Downloads Separation ✅

**Philosophy**: Separate "saved songs" (library) from "downloaded files" (downloads)

**Implementation**: Unified `user_songs` table with `group_type` field for flexibility

```sql
-- Unified User Songs Table (IMPLEMENTED)
user_songs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  youtube_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT,
  artist TEXT,
  duration TEXT,
  thumbnail_url TEXT,
  view_count BIGINT,
  upload_date TIMESTAMP,
  channel_name TEXT,
  group_type TEXT, -- 'library', 'downloaded', 'favorites', 'playlist_1', etc.
  status TEXT, -- 'saved', 'downloaded', 'deleted'
  added_at TIMESTAMP DEFAULT NOW(),
  downloaded_at TIMESTAMP,
  download_url TEXT, -- S3/storage URL for downloaded file
  file_size BIGINT,
  UNIQUE(user_id, youtube_id, group_type)
)

-- Benefits of Unified Approach:
-- ✅ Flexible grouping (library, downloads, custom playlists)
-- ✅ Efficient duplicate detection across all groups
-- ✅ Single table for all user music data
-- ✅ Easy migration from library to downloads
-- ✅ Support for future features (favorites, playlists, etc.)
```

### 🔌 Current API Endpoints

#### Search API
```
POST /api/search
Body: { query: string, type?: 'video'|'playlist'|'text', userId?: string }
Response: { type, results: VideoInfo[], playlistInfo?, pageInfo? }
Features: Real-time library filtering, hybrid YouTube API + yt-dlp
```

#### Library API
```
POST /api/library/add
Body: { songs: VideoInfo[], userId: string }
Response: { success, message, added_count, duplicate_count, failed_count }
Features: Bulk operations, duplicate detection, comprehensive stats

GET /api/library/add?userId=string&page=1&limit=20
Response: { songs: UserSong[], pagination }
Features: Paginated library retrieval

GET /api/library/video-ids?userId=string
Response: { video_ids: string[] }
Features: Fast lookup for search result filtering
```

#### Testing API
```
POST /api/test-ytdlp
Body: { url: string }
Response: { success, result: YtDlpOutput[] }
Features: Test yt-dlp subprocess functionality
```

```sql
-- Existing: User Profiles
users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### User Flow Design
1. **Search** → Find YouTube content (3 search methods)
2. **Add to Library** → Save song metadata for later access
3. **Browse Library** → Manage personal collection
4. **Download** → Convert to MP3 and save actual file

## 🔍 Search Functionality (In Development)

### Three Search Methods

#### 1. Video URL Search
```typescript
// Single YouTube video processing
Input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
Output: Single video result with metadata
Supports: youtube.com, youtu.be, m.youtube.com
```

#### 2. Playlist URL Search
```typescript
// YouTube playlist expansion
Input: "https://www.youtube.com/playlist?list=PLExample"
Output: Paginated list of all playlist videos
Features: Playlist info + individual video cards
```

#### 3. Word/Text Search
```typescript
// YouTube Data API v3 integration
Input: "lofi hip hop study music"
Output: Relevant YouTube search results
Features: Filtering, sorting, search suggestions
```

### Search Results Interface
```typescript
interface SearchResult {
  youtube_id: string;
  youtube_url: string;
  title: string;
  artist: string;          // Channel name or extracted artist
  duration: string;        // "3:45" format
  thumbnail_url: string;
  view_count: number;
  upload_date: string;
  channel_name: string;
}

// Result Actions
- "Add to Library" (primary action)
- "Already in Library" (disabled state with checkmark)
- Preview thumbnail (YouTube embed on click)
- Bulk selection for multiple additions
```

## 🛠 Technical Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React 19** for UI components

### Backend & Database
- **Supabase** for database, auth, and real-time features
- **PostgreSQL** with Row Level Security (RLS)
- **Google OAuth** for authentication
- **Next.js API Routes** for server logic

### Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.55.0",
    "next": "15.4.6",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page ✅
│   ├── login/page.tsx              # Google OAuth login ✅
│   ├── search/page.tsx             # YouTube search (planned)
│   ├── library/page.tsx            # User's saved songs (planned)
│   ├── dashboard/page.tsx          # Download history (planned)
│   ├── not-found.tsx               # Custom 404 page ✅
│   └── api/
│       ├── search/route.ts         # Search processing (planned)
│       └── library/route.ts        # Library management (planned)
├── components/
│   ├── AuthProvider.tsx            # Auth context ✅
│   ├── Navbar.tsx                  # Navigation ✅
│   ├── Footer.tsx                  # Footer ✅
│   └── ThemeProvider.tsx           # Theme management ✅
├── lib/
│   ├── supabase.ts                 # Database client ✅
│   ├── auth.ts                     # Auth functions ✅
│   └── youtube.ts                  # YouTube integration (planned)
└── database/
    ├── README.md                   # Setup instructions ✅
    ├── 01_initial_schema.sql       # Core tables ✅
    ├── 02_row_level_security.sql   # RLS policies ✅
    └── 06_auto_username_generation.sql ✅
```

## 🔐 Security & Privacy

### Authentication (Implemented)
- **Google OAuth** via Supabase Auth
- **Row Level Security** on all database tables
- **User isolation** - users only see their own data
- **Admin controls** - secure admin panel access

### Data Protection
- **HTTPS** for all communications
- **Input validation** on all user inputs
- **Rate limiting** for API endpoints
- **Secure file handling** for downloads

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Google OAuth credentials

### Installation
```bash
# Clone repository
git clone https://github.com/Musyonchez/yt.git
cd yt

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Google OAuth credentials

# Run development server
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run SQL migrations in order:
   ```bash
   # In Supabase SQL Editor
   database/01_initial_schema.sql
   database/02_row_level_security.sql
   database/06_auto_username_generation.sql
   ```
3. Configure Google OAuth in Supabase Auth settings

## 📊 Performance Targets

### Load Times
- Page load: < 2 seconds
- Time to interactive: < 3 seconds
- Search results: < 500ms

### User Experience
- Mobile-first responsive design
- Professional loading states
- Clear error messages
- Smooth transitions

## 🎨 Design Philosophy

### Brand Identity
- **Ninja Theme**: Fast, efficient, stealthy
- **Professional Aesthetic**: SaaS-grade quality
- **Color Palette**: Black, white, gray with accent colors
- **Typography**: Clean, modern sans-serif fonts

### UI/UX Standards
- **Card-based layouts** for content organization
- **Generous whitespace** for clean appearance
- **Consistent iconography** throughout interface
- **Clear visual hierarchy** with proper headings
- **Hover effects** and smooth animations

## 🔄 Development Workflow

### Current Sprint: Search Implementation
1. **YouTube URL parsing** and validation
2. **Search results display** component
3. **"Add to Library"** functionality
4. **Database integration** for library management

### Next Sprint: Library Management
1. **Library page** with saved songs
2. **Song organization** and management
3. **Search within library** functionality
4. **Bulk operations** for library management

### Future Sprints
1. **Download system** with MP3 processing
2. **Social features** and friend system
3. **Advanced search** with filters and sorting
4. **PWA capabilities** for mobile

## 📈 Success Metrics

### User Engagement
- Search-to-library conversion rate
- Daily active users
- Library size per user
- Feature adoption rates

### Technical Performance
- API response times
- Search success rates
- Database query performance
- Page load speeds

## 🤝 Contributing

1. Create feature branch from `main`
2. Follow TypeScript and ESLint standards
3. Test on multiple devices
4. Update documentation
5. Submit pull request

## 📄 License

This project is for educational and personal use. Respect YouTube's Terms of Service and copyright laws.

---

**MP3 Ninja** - Fast, efficient, and precise music platform with ninja-like stealth and reliability.