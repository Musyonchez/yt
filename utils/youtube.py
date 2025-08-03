"""
YouTube Service
Handles YouTube API interactions using yt-dlp for searching and extracting video information.
"""

import yt_dlp
import re
from typing import Dict, List, Any, Optional
import logging
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger(__name__)

class YouTubeService:
    """Service for YouTube video search and metadata extraction using yt-dlp."""
    
    def __init__(self) -> None:
        """Initialize YouTube service with yt-dlp configuration."""
        self.ydl_opts_search = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'default_search': 'ytsearch',
        }
        
        self.ydl_opts_info = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
    
    def search_videos(self, query: str, page: int = 1, per_page: int = 15) -> Dict[str, Any]:
        """
        Search YouTube videos by query with pagination.
        
        Args:
            query: Search query string
            page: Page number (1-based)
            per_page: Results per page (max 15 for lazy loading)
            
        Returns:
            Dictionary with search results and pagination info
        """
        try:
            # Calculate total results to fetch (up to 45 max as per requirements)
            max_results = min(45, page * per_page)
            search_query = f"ytsearch{max_results}:{query}"
            
            with yt_dlp.YoutubeDL(self.ydl_opts_search) as ydl:
                logger.info(f"Searching YouTube: {query} (page {page})")
                search_results = ydl.extract_info(search_query, download=False)
                
                if not search_results or 'entries' not in search_results:
                    return self._empty_search_result(page)
                
                entries = search_results['entries']
                
                # Calculate pagination
                total_results = len(entries)
                start_idx = (page - 1) * per_page
                end_idx = min(start_idx + per_page, total_results)
                
                # Get page entries
                page_entries = entries[start_idx:end_idx]
                
                # Format results
                formatted_results = []
                for entry in page_entries:
                    if entry:  # Skip None entries
                        video_info = self._format_video_info(entry)
                        if video_info:
                            formatted_results.append(video_info)
                
                return {
                    'results': formatted_results,
                    'page': page,
                    'per_page': per_page,
                    'total_results': total_results,
                    'total_pages': (total_results + per_page - 1) // per_page,
                    'has_more': end_idx < total_results and end_idx < 45
                }
                
        except Exception as e:
            logger.error(f"Search error for query '{query}': {e}")
            return self._empty_search_result(page, error=str(e))
    
    def get_playlist_videos(self, playlist_url: str) -> List[Dict[str, Any]]:
        """
        Extract all videos from a YouTube playlist.
        
        Args:
            playlist_url: YouTube playlist URL
            
        Returns:
            List of video information dictionaries
        """
        try:
            logger.info(f"Extracting playlist: {playlist_url}")
            
            with yt_dlp.YoutubeDL(self.ydl_opts_search) as ydl:
                playlist_info = ydl.extract_info(playlist_url, download=False)
                
                if not playlist_info or 'entries' not in playlist_info:
                    logger.error("No playlist entries found")
                    return []
                
                videos = []
                for entry in playlist_info['entries']:
                    if entry:  # Skip None entries
                        video_info = self._format_video_info(entry)
                        if video_info:
                            videos.append(video_info)
                
                logger.info(f"Found {len(videos)} videos in playlist")
                return videos
                
        except Exception as e:
            logger.error(f"Playlist extraction error: {e}")
            return []
    
    def get_video_info(self, video_url: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a single video.
        
        Args:
            video_url: YouTube video URL
            
        Returns:
            Video information dictionary or None if failed
        """
        try:
            logger.info(f"Getting video info: {video_url}")
            
            with yt_dlp.YoutubeDL(self.ydl_opts_info) as ydl:
                video_info = ydl.extract_info(video_url, download=False)
                
                if not video_info:
                    return None
                
                return self._format_video_info(video_info, detailed=True)
                
        except Exception as e:
            logger.error(f"Video info error for {video_url}: {e}")
            return None
    
    def _format_video_info(self, entry: Dict[str, Any], detailed: bool = False) -> Optional[Dict[str, Any]]:
        """
        Format video information into standardized structure.
        
        Args:
            entry: Raw video entry from yt-dlp
            detailed: Whether to include detailed information
            
        Returns:
            Formatted video information or None if invalid
        """
        try:
            if not entry or not entry.get('id'):
                return None
            
            video_id = entry['id']
            title = entry.get('title', 'Unknown Title')
            channel = entry.get('uploader', entry.get('channel', 'Unknown Channel'))
            
            # Format duration
            duration = self._format_duration(entry.get('duration'))
            
            # Generate thumbnail URL
            thumbnail = self._get_best_thumbnail(entry.get('thumbnails', []))
            
            # Generate video URL
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            result = {
                'title': title,
                'thumbnail': thumbnail,
                'duration': duration,
                'channel': channel,
                'url': video_url,
                'video_id': video_id
            }
            
            # Add detailed information if requested
            if detailed:
                result.update({
                    'description': entry.get('description', ''),
                    'view_count': entry.get('view_count', 0),
                    'upload_date': entry.get('upload_date', ''),
                    'like_count': entry.get('like_count', 0),
                    'comment_count': entry.get('comment_count', 0)
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error formatting video info: {e}")
            return None
    
    def _format_duration(self, duration_seconds: Optional[int]) -> str:
        """
        Format duration from seconds to MM:SS or HH:MM:SS.
        
        Args:
            duration_seconds: Duration in seconds
            
        Returns:
            Formatted duration string
        """
        if not duration_seconds or duration_seconds <= 0:
            return "Unknown"
        
        try:
            hours = duration_seconds // 3600
            minutes = (duration_seconds % 3600) // 60
            seconds = duration_seconds % 60
            
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
                
        except Exception:
            return "Unknown"
    
    def _get_best_thumbnail(self, thumbnails: List[Dict[str, Any]]) -> str:
        """
        Get the best quality thumbnail URL.
        
        Args:
            thumbnails: List of thumbnail dictionaries from yt-dlp
            
        Returns:
            Best thumbnail URL or default
        """
        if not thumbnails:
            return "https://img.youtube.com/vi/default/maxresdefault.jpg"
        
        try:
            # Sort by preference: maxresdefault > hqdefault > mqdefault > default
            preferred_ids = ['maxresdefault', 'hqdefault', 'mqdefault', 'default']
            
            for preferred_id in preferred_ids:
                for thumb in thumbnails:
                    if thumb.get('id') == preferred_id and thumb.get('url'):
                        return thumb['url']
            
            # If no preferred thumbnail found, return the first available
            for thumb in thumbnails:
                if thumb.get('url'):
                    return thumb['url']
            
            # Fallback to default
            return "https://img.youtube.com/vi/default/maxresdefault.jpg"
            
        except Exception:
            return "https://img.youtube.com/vi/default/maxresdefault.jpg"
    
    def _empty_search_result(self, page: int, error: Optional[str] = None) -> Dict[str, Any]:
        """
        Return empty search result structure.
        
        Args:
            page: Current page number
            error: Optional error message
            
        Returns:
            Empty search result dictionary
        """
        result = {
            'results': [],
            'page': page,
            'per_page': 15,
            'total_results': 0,
            'total_pages': 0,
            'has_more': False
        }
        
        if error:
            result['error'] = error
        
        return result
    
    def is_valid_youtube_url(self, url: str) -> bool:
        """
        Validate if URL is a valid YouTube video or playlist URL.
        
        Args:
            url: URL to validate
            
        Returns:
            True if valid YouTube URL
        """
        try:
            parsed = urlparse(url)
            
            # Check domain
            if parsed.netloc not in ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com']:
                return False
            
            # YouTube video patterns
            if parsed.netloc == 'youtu.be':
                return bool(parsed.path and len(parsed.path) > 1)
            
            if 'youtube.com' in parsed.netloc:
                query_params = parse_qs(parsed.query)
                # Video URL
                if 'watch' in parsed.path and 'v' in query_params:
                    return True
                # Playlist URL
                if 'playlist' in parsed.path and 'list' in query_params:
                    return True
                # Channel or other valid YouTube URLs
                if any(path in parsed.path for path in ['/c/', '/channel/', '/user/', '/@']):
                    return True
            
            return False
            
        except Exception:
            return False
    
    def extract_video_id(self, url: str) -> Optional[str]:
        """
        Extract video ID from YouTube URL.
        
        Args:
            url: YouTube video URL
            
        Returns:
            Video ID or None if not found
        """
        try:
            # Handle youtu.be URLs
            if 'youtu.be' in url:
                return url.split('youtu.be/')[-1].split('?')[0]
            
            # Handle youtube.com URLs
            if 'youtube.com' in url:
                parsed = urlparse(url)
                query_params = parse_qs(parsed.query)
                if 'v' in query_params:
                    return query_params['v'][0]
            
            return None
            
        except Exception:
            return None