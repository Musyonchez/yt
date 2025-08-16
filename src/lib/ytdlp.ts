/**
 * yt-dlp subprocess integration for playlist handling
 * Used specifically for playlists (including auto-generated ones that YouTube Data API can't handle)
 */

import { spawn } from 'child_process';
import { VideoInfo } from './youtube';

interface YtDlpPlaylistResponse {
  results: VideoInfo[];
  playlistInfo: {
    title: string;
    description?: string;
    video_count: number;
  };
}

/**
 * Extract playlist videos using yt-dlp subprocess
 * This handles all playlist types including auto-generated Mix/Radio playlists
 */
export async function getPlaylistWithYtDlp(url: string, maxResults: number = 50): Promise<YtDlpPlaylistResponse> {
  return new Promise((resolve, reject) => {
    const ytdlpPath = '/home/musyonchez/Code/yt/ytdlp_env/bin/yt-dlp';
    
    const args = [
      '--flat-playlist',
      '--dump-single-json',
      '--playlist-end', maxResults.toString(),
      url
    ];

    console.log('Running yt-dlp for playlist:', ytdlpPath, args.join(' '));

    const ytdlp = spawn(ytdlpPath, args);
    
    let stdout = '';
    let stderr = '';

    ytdlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlp.on('close', (code) => {
      console.log('yt-dlp exit code:', code);
      
      if (code !== 0) {
        console.error('yt-dlp stderr:', stderr);
        reject(new Error(`yt-dlp failed with exit code ${code}: ${stderr}`));
        return;
      }

      try {
        const data = JSON.parse(stdout.trim());
        const results: VideoInfo[] = [];
        
        if (data._type === 'playlist' && data.entries) {
          // Handle playlist
          for (const entry of data.entries) {
            // Skip unavailable videos
            if (!entry.id || entry.title === '[Unavailable]') continue;
            
            results.push({
              youtube_id: entry.id,
              youtube_url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
              title: entry.title || 'Unknown Title',
              artist: entry.uploader || entry.channel || 'Unknown Channel',
              duration: formatDuration(entry.duration || 0),
              thumbnail_url: getBestThumbnail(entry.thumbnails),
              view_count: entry.view_count || 0,
              upload_date: entry.upload_date || new Date().toISOString(),
              channel_name: entry.uploader || entry.channel || 'Unknown Channel'
            });
          }
          
          const playlistInfo = {
            title: data.title || 'Unknown Playlist',
            description: data.description || undefined,
            video_count: results.length
          };
          
          console.log(`Successfully extracted ${results.length} videos from playlist`);
          resolve({ results, playlistInfo });
          
        } else {
          reject(new Error('Invalid playlist data received from yt-dlp'));
        }
        
      } catch (error) {
        console.error('Failed to parse yt-dlp output:', error);
        reject(new Error(`Failed to parse yt-dlp output: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    ytdlp.on('error', (error) => {
      console.error('Failed to spawn yt-dlp:', error);
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      ytdlp.kill();
      reject(new Error('yt-dlp operation timed out'));
    }, 60000); // 60 second timeout for playlists
  });
}

/**
 * Get the best quality thumbnail from yt-dlp thumbnails array
 */
function getBestThumbnail(thumbnails: { url: string; width?: number; height?: number }[]): string {
  if (!thumbnails || thumbnails.length === 0) return '';
  
  // Prefer medium quality thumbnails, fall back to any available
  const preferred = thumbnails.find(t => t.width && t.width >= 300 && t.width <= 500);
  return preferred?.url || thumbnails[thumbnails.length - 1]?.url || '';
}

/**
 * Format duration from seconds to readable format (MM:SS or H:MM:SS)
 */
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}