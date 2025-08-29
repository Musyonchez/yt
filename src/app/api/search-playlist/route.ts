import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { playlistUrl } = await request.json();
    
    if (!playlistUrl || typeof playlistUrl !== 'string' || playlistUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'Playlist URL is required' },
        { status: 400 }
      );
    }

    // Basic YouTube playlist URL validation
    const playlistRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(playlist\?list=|watch\?.*&list=)|youtu\.be\/.*\?list=)([a-zA-Z0-9_-]+)/;
    if (!playlistRegex.test(playlistUrl.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube playlist URL' },
        { status: 400 }
      );
    }

    const results = await processPlaylist(playlistUrl.trim());
    
    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      playlistUrl: playlistUrl.trim()
    });

  } catch (error) {
    console.error('Playlist Processing API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process playlist. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

interface VideoResult {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  duration_string: string;
  view_count: number;
  upload_date: string;
  thumbnail: string;
  webpage_url: string;
  description: string;
}

async function processPlaylist(playlistUrl: string): Promise<VideoResult[]> {
  return new Promise((resolve, reject) => {
    const ytdlpProcess = spawn('yt-dlp', [
      playlistUrl,
      '--dump-json',
      '--no-warnings',
      '--flat-playlist',
      '--skip-download'
    ]);

    let stdout = '';
    let stderr = '';

    ytdlpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytdlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytdlpProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('yt-dlp stderr:', stderr);
        reject(new Error(`yt-dlp process exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        // Parse JSON lines from yt-dlp output
        const lines = stdout.trim().split('\n').filter(line => line.trim());
        const results = lines.map(line => {
          try {
            const data = JSON.parse(line) as Record<string, unknown>;
            
            // Handle flat playlist format
            const thumbnail = Array.isArray(data.thumbnails) && data.thumbnails.length > 0 
              ? String(data.thumbnails[0].url || '') 
              : '';
            
            return {
              id: String(data.id || ''),
              title: String(data.title || 'Unknown Title'),
              uploader: String(data.uploader || data.channel || 'Unknown Channel'),
              duration: Number(data.duration || 0),
              duration_string: String(data.duration_string || 'Unknown'),
              view_count: Number(data.view_count || 0),
              upload_date: String(data.upload_date || ''),
              thumbnail: thumbnail,
              webpage_url: String(data.webpage_url || data.url || ''),
              description: String(data.description || '')
            };
          } catch (parseError) {
            console.error('Failed to parse JSON line:', line, parseError);
            return null;
          }
        }).filter((result): result is VideoResult => result !== null); // Remove null entries

        resolve(results);
      } catch (parseError) {
        console.error('Failed to parse yt-dlp output:', parseError);
        reject(new Error('Failed to parse playlist results'));
      }
    });

    ytdlpProcess.on('error', (error) => {
      console.error('yt-dlp spawn error:', error);
      if (error.message.includes('ENOENT') || error.message.includes('spawn yt-dlp')) {
        reject(new Error('yt-dlp is not installed or not available in PATH. Please install yt-dlp: pip install yt-dlp'));
      } else {
        reject(new Error(`Failed to start yt-dlp: ${error.message}`));
      }
    });

    // Set timeout for the process (90 seconds for playlists as they can be large)
    setTimeout(() => {
      ytdlpProcess.kill();
      reject(new Error('Playlist processing timed out. Please try again with a smaller playlist.'));
    }, 90000);
  });
}