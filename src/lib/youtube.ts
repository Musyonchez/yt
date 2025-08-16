/**
 * YouTube URL parsing and validation utilities
 */

export interface VideoInfo {
  youtube_id: string;
  youtube_url: string;
  title?: string;
  artist?: string;
  duration?: string;
  thumbnail_url?: string;
  view_count?: number;
  upload_date?: string;
  channel_name?: string;
}

export interface PlaylistInfo {
  playlist_id: string;
  playlist_url: string;
  title?: string;
  description?: string;
  video_count?: number;
  videos: VideoInfo[];
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  // Remove whitespace and convert to lowercase for consistency
  url = url.trim();

  // Regular expressions for different YouTube URL formats
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // m.youtube.com/watch?v=VIDEO_ID
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtube.com/watch?v=VIDEO_ID&other_params
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Check if the string is already a video ID (11 characters, alphanumeric + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Extract YouTube playlist ID from various URL formats
 */
export function extractPlaylistId(url: string): string | null {
  // Remove whitespace
  url = url.trim();

  // Regular expressions for playlist URLs
  const patterns = [
    // youtube.com/playlist?list=PLAYLIST_ID
    /(?:youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/,
    // youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
    /(?:youtube\.com\/watch\?.*list=)([a-zA-Z0-9_-]+)/,
    // m.youtube.com/playlist?list=PLAYLIST_ID
    /(?:m\.youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate YouTube video URL
 */
export function isValidVideoUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * Validate YouTube playlist URL
 */
export function isValidPlaylistUrl(url: string): boolean {
  return extractPlaylistId(url) !== null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Generate clean YouTube URL from video ID
 */
export function getCleanVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Generate clean YouTube playlist URL from playlist ID
 */
export function getCleanPlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

/**
 * Parse video duration from YouTube API format (PT1H2M3S) to readable format
 */
export function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Format view count to readable format (1.2M, 543K, etc.)
 */
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
}

/**
 * Determine search type from input string
 */
export function determineSearchType(input: string): 'video' | 'playlist' | 'text' {
  if (isValidVideoUrl(input)) {
    return 'video';
  } else if (isValidPlaylistUrl(input)) {
    return 'playlist';
  } else {
    return 'text';
  }
}

/**
 * Validate and sanitize search input
 */
export function sanitizeSearchInput(input: string): string {
  return input.trim().substring(0, 500); // Limit length for safety
}

/**
 * Check if URL is a valid YouTube domain
 */
export function isYouTubeDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validDomains = [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be'
    ];
    return validDomains.includes(urlObj.hostname);
  } catch {
    return false;
  }
}