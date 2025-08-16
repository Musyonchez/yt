/**
 * YouTube Data API v3 integration
 * Fetches real YouTube data instead of mock data
 */

import { google } from 'googleapis';
import { VideoInfo } from './youtube';

const youtube = google.youtube('v3');

interface YouTubeApiResponse {
  results: VideoInfo[];
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
  nextPageToken?: string;
}

interface PlaylistResponse extends YouTubeApiResponse {
  playlistInfo: {
    title: string;
    description?: string;
    video_count: number;
  };
}

/**
 * Search YouTube videos using the Data API v3
 */
export async function searchYouTubeVideos(
  query: string, 
  maxResults: number = 10
): Promise<YouTubeApiResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured. Add YOUTUBE_API_KEY to environment variables.');
  }

  try {
    const response = await youtube.search.list({
      key: apiKey,
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults,
      order: 'relevance',
      videoCategoryId: '10', // Music category
    });

    if (!response.data.items) {
      return { results: [] };
    }

    // Get video details for duration and view count
    const videoIds = response.data.items.map(item => item.id?.videoId).filter(Boolean);
    const videoDetails = await getVideoDetails(videoIds as string[]);

    const results: VideoInfo[] = response.data.items.map(item => {
      const snippet = item.snippet!;
      const videoId = item.id?.videoId!;
      const details = videoDetails.find(v => v.youtube_id === videoId);
      
      return {
        youtube_id: videoId,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        title: snippet.title || 'Unknown Title',
        artist: snippet.channelTitle || 'Unknown Channel',
        duration: details?.duration || 'Unknown',
        thumbnail_url: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        view_count: details?.view_count || 0,
        upload_date: snippet.publishedAt || new Date().toISOString(),
        channel_name: snippet.channelTitle || 'Unknown Channel'
      };
    });

    return {
      results,
      pageInfo: {
        totalResults: response.data.pageInfo?.totalResults || 0,
        resultsPerPage: response.data.pageInfo?.resultsPerPage || maxResults
      },
      nextPageToken: response.data.nextPageToken || undefined
    };

  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error(`YouTube search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get YouTube video details by ID
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<VideoInfo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId]
    });

    const video = response.data.items?.[0];
    if (!video) {
      return null;
    }

    const snippet = video.snippet!;
    const contentDetails = video.contentDetails!;
    const statistics = video.statistics!;

    return {
      youtube_id: videoId,
      youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
      title: snippet.title || 'Unknown Title',
      artist: snippet.channelTitle || 'Unknown Channel',
      duration: parseDuration(contentDetails.duration || ''),
      thumbnail_url: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
      view_count: parseInt(statistics.viewCount || '0'),
      upload_date: snippet.publishedAt || new Date().toISOString(),
      channel_name: snippet.channelTitle || 'Unknown Channel'
    };

  } catch (error) {
    console.error('YouTube video info error:', error);
    throw new Error(`Failed to get video info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get YouTube playlist videos
 */
export async function getYouTubePlaylistVideos(playlistId: string): Promise<PlaylistResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Get playlist info
    const playlistResponse = await youtube.playlists.list({
      key: apiKey,
      part: ['snippet', 'contentDetails'],
      id: [playlistId]
    });

    const playlist = playlistResponse.data.items?.[0];
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    // Get playlist items
    const itemsResponse = await youtube.playlistItems.list({
      key: apiKey,
      part: ['snippet'],
      playlistId: playlistId,
      maxResults: 50 // Limit to 50 videos for now
    });

    if (!itemsResponse.data.items) {
      return {
        results: [],
        playlistInfo: {
          title: playlist.snippet?.title || 'Unknown Playlist',
          description: playlist.snippet?.description,
          video_count: 0
        }
      };
    }

    // Get video details for all videos in playlist
    const videoIds = itemsResponse.data.items
      .map(item => item.snippet?.resourceId?.videoId)
      .filter(Boolean) as string[];

    const videoDetails = await getVideoDetails(videoIds);

    const results: VideoInfo[] = itemsResponse.data.items.map(item => {
      const snippet = item.snippet!;
      const videoId = snippet.resourceId?.videoId!;
      const details = videoDetails.find(v => v.youtube_id === videoId);
      
      return {
        youtube_id: videoId,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        title: snippet.title || 'Unknown Title',
        artist: snippet.videoOwnerChannelTitle || snippet.channelTitle || 'Unknown Channel',
        duration: details?.duration || 'Unknown',
        thumbnail_url: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        view_count: details?.view_count || 0,
        upload_date: snippet.publishedAt || new Date().toISOString(),
        channel_name: snippet.videoOwnerChannelTitle || snippet.channelTitle || 'Unknown Channel'
      };
    });

    return {
      results,
      playlistInfo: {
        title: playlist.snippet?.title || 'Unknown Playlist',
        description: playlist.snippet?.description,
        video_count: results.length
      }
    };

  } catch (error) {
    console.error('YouTube playlist error:', error);
    throw new Error(`Failed to get playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get detailed video information for multiple videos
 */
async function getVideoDetails(videoIds: string[]): Promise<VideoInfo[]> {
  if (videoIds.length === 0) return [];

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await youtube.videos.list({
      key: apiKey,
      part: ['contentDetails', 'statistics'],
      id: videoIds
    });

    return response.data.items?.map(video => ({
      youtube_id: video.id!,
      duration: parseDuration(video.contentDetails?.duration || ''),
      view_count: parseInt(video.statistics?.viewCount || '0'),
      youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
      title: '', // Will be filled by calling function
      artist: '',
      thumbnail_url: '',
      upload_date: '',
      channel_name: ''
    })) || [];

  } catch (error) {
    console.error('Error getting video details:', error);
    return [];
  }
}

/**
 * Parse YouTube duration format (PT4M13S) to readable format (4:13)
 */
function parseDuration(duration: string): string {
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