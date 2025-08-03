# YouTube Audio Download Manager

A Flask web application for downloading YouTube audio from playlists and search queries using yt-dlp, with a modern Tailwind CSS interface.

## Features

- 🎵 Download audio from YouTube playlists and individual videos
- 🔍 Search YouTube by name/artist with pagination and lazy loading
- 📋 Queue management system with pause/resume functionality
- 📊 Real-time download progress tracking
- 🎯 Selective video downloading from playlists
- 📁 Organized file management with JSON tracking
- ⚡ Concurrent downloads (3-4 simultaneous)
- 📱 Responsive Tailwind CSS interface

## Project Structure

```
yt/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── downloads/            # Downloaded audio files (MP3)
├── data/
│   ├── downloaded.json   # Track completed downloads (URLs)
│   └── queue.json        # Download queue (URLs)
├── static/
│   ├── css/
│   │   └── tailwind.css  # Tailwind CSS
│   └── js/
│       ├── main.js       # Main JavaScript functionality
│       ├── search.js     # Search and pagination logic
│       ├── queue.js      # Queue management
│       └── progress.js   # Download progress tracking
├── templates/
│   ├── base.html         # Base template with Tailwind
│   ├── index.html        # Main dashboard
│   ├── search.html       # YouTube search page
│   ├── playlist.html     # Playlist viewer
│   └── queue.html        # Download queue management
└── utils/
    ├── __init__.py
    ├── youtube.py        # YouTube API interactions (yt-dlp)
    ├── downloader.py     # Download manager with progress
    └── json_manager.py   # JSON file operations
```

## Implementation Process

### Phase 1: Core Setup
1. **Environment Setup**
   - Create virtual environment
   - Install Flask, yt-dlp, threading libraries
   - Set up Tailwind CSS (CDN or build process)
   - Create basic project structure

2. **JSON Data Management**
   - `utils/json_manager.py`: Handle downloaded.json and queue.json
   - Functions: add_to_queue(), remove_from_queue(), mark_downloaded()
   - Thread-safe file operations

### Phase 2: YouTube Integration
1. **YouTube Service (`utils/youtube.py`)**
   - Search functionality: get_search_results(query, page=1, per_page=15)
   - Playlist parsing: get_playlist_videos(url)
   - Video metadata extraction: get_video_info(url)
   - Return format: {title, thumbnail, duration, channel, url, video_id}

2. **Download Manager (`utils/downloader.py`)**
   - Concurrent download handler (3-4 workers)
   - Progress tracking with websockets/SSE
   - Pause/resume functionality
   - Auto-remove from queue after completion
   - MP3 conversion with yt-dlp options

### Phase 3: Flask Backend
1. **Routes Structure**
   ```python
   @app.route('/')                    # Dashboard
   @app.route('/search')              # Search page
   @app.route('/api/search')          # AJAX search API
   @app.route('/playlist')            # Playlist viewer
   @app.route('/api/playlist')        # Playlist data API
   @app.route('/queue')               # Queue management
   @app.route('/api/queue/add')       # Add to queue
   @app.route('/api/queue/remove')    # Remove from queue
   @app.route('/api/download/start')  # Start downloads
   @app.route('/api/download/pause')  # Pause downloads
   @app.route('/progress')            # SSE progress stream
   ```

2. **API Endpoints**
   - RESTful design for queue management
   - Server-Sent Events for real-time progress
   - Error handling and validation

### Phase 4: Frontend Development
1. **Base Template (`templates/base.html`)**
   - Tailwind CSS integration
   - Navigation bar
   - Common JavaScript includes
   - Responsive design framework

2. **Dashboard (`templates/index.html`)**
   - URL input for playlists/videos
   - Quick stats (downloaded count, queue size)
   - Recent downloads display
   - Queue status overview

3. **Search Page (`templates/search.html`)**
   - Search input with real-time suggestions
   - Results grid with thumbnails
   - Pagination controls (15 per page, up to 45 results)
   - Lazy loading implementation
   - Add to queue buttons

4. **Playlist Viewer (`templates/playlist.html`)**
   - Display all playlist videos
   - Thumbnail grid layout
   - Bulk selection controls
   - Video metadata display
   - Batch add to queue

5. **Queue Management (`templates/queue.html`)**
   - Current queue display
   - Progress bars for active downloads
   - Remove/reorder functionality
   - Start/pause controls
   - Download statistics

### Phase 5: JavaScript Functionality
1. **Main App (`static/js/main.js`)**
   - Application initialization
   - WebSocket/SSE connection management
   - Global state management
   - Utility functions

2. **Search Logic (`static/js/search.js`)**
   - AJAX search requests
   - Pagination handling
   - Lazy loading implementation
   - Result rendering
   - Add to queue functionality

3. **Queue Management (`static/js/queue.js`)**
   - Queue display updates
   - Add/remove operations
   - Bulk operations
   - Local storage for temporary data

4. **Progress Tracking (`static/js/progress.js`)**
   - Real-time progress updates
   - Download status display
   - Error handling
   - Completion notifications

### Phase 6: Advanced Features
1. **Performance Optimization**
   - Adaptive concurrent downloads based on bandwidth
   - Thumbnail caching
   - Search result caching
   - Lazy loading optimization

2. **Error Handling**
   - Network error recovery
   - Invalid URL handling
   - Download failure retry logic
   - User feedback system

3. **UI/UX Enhancements**
   - Loading states and spinners
   - Toast notifications
   - Keyboard shortcuts
   - Mobile responsiveness

## Technical Specifications

### YouTube Integration
- **Library**: yt-dlp (more reliable than youtube-dl)
- **Audio Format**: MP3, 128kbps
- **Metadata**: Extract title, thumbnail, duration, channel
- **Error Handling**: Invalid URLs, geo-restrictions, deleted videos

### Download System
- **Concurrent Downloads**: 3-4 simultaneous (configurable)
- **Progress Tracking**: Real-time percentage and speed
- **Queue System**: FIFO with pause/resume capability
- **File Naming**: Sanitized titles with fallback to video ID

### Data Storage
```json
// downloaded.json
{
  "downloads": [
    "https://www.youtube.com/watch?v=VIDEO_ID",
    "https://www.youtube.com/watch?v=ANOTHER_ID"
  ],
  "last_updated": "2024-01-01T12:00:00Z"
}

// queue.json
{
  "queue": [
    "https://www.youtube.com/watch?v=QUEUED_ID",
    "https://www.youtube.com/watch?v=ANOTHER_QUEUED"
  ],
  "last_updated": "2024-01-01T12:00:00Z"
}
```

### API Response Format
```json
// Search Results
{
  "results": [
    {
      "title": "Song Title",
      "thumbnail": "https://img.youtube.com/vi/ID/maxresdefault.jpg",
      "duration": "3:45",
      "channel": "Artist Name",
      "url": "https://www.youtube.com/watch?v=ID",
      "video_id": "ID"
    }
  ],
  "page": 1,
  "total_pages": 3,
  "has_more": true
}
```

## Development Workflow

1. **Setup Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Create Directory Structure**
   ```bash
   mkdir -p downloads data static/{css,js} templates utils
   touch data/{downloaded.json,queue.json}
   ```

3. **Initialize JSON Files**
   ```bash
   echo '{"downloads":[],"last_updated":""}' > data/downloaded.json
   echo '{"queue":[],"last_updated":""}' > data/queue.json
   ```

4. **Development Order**
   - Core utilities (json_manager.py)
   - YouTube integration (youtube.py)
   - Basic Flask routes
   - Frontend templates
   - JavaScript functionality
   - Download manager
   - Progress tracking
   - Testing and optimization

## Key Features Implementation

### Lazy Loading Search Results
- Load first 15 results immediately
- Load next 15 when user scrolls to bottom
- Maximum 45 results (3 pages)
- Intersection Observer API for smooth loading

### Download Progress Tracking
- Server-Sent Events for real-time updates
- Progress percentage, speed, ETA
- Multiple download progress simultaneously
- WebSocket fallback for older browsers

### Queue Management
- Thread-safe queue operations
- Pause/resume all downloads
- Individual item removal
- Automatic cleanup after completion

### Playlist Handling
- Parse playlist URL to extract all video URLs
- Display video thumbnails and metadata
- Selective downloading with checkboxes
- Bulk add to queue functionality

This structure provides a scalable, maintainable solution for your YouTube audio downloading needs with a modern web interface.