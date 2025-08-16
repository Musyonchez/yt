import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promisify } from 'util';

/**
 * Test API endpoint to verify yt-dlp subprocess execution
 * This endpoint tests if we can call yt-dlp from Node.js to handle 
 * auto-generated playlists that YouTube Data API cannot access
 */

interface YtDlpOutput {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  view_count: number;
  upload_date: string;
  thumbnail: string;
  webpage_url: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Testing yt-dlp with URL:', url);

    // Test if yt-dlp is available
    const ytdlpResult = await runYtDlp(url);
    
    return NextResponse.json({
      success: true,
      message: 'yt-dlp subprocess test successful',
      url: url,
      result: ytdlpResult
    });

  } catch (error) {
    console.error('yt-dlp test error:', error);
    return NextResponse.json(
      { 
        error: `yt-dlp test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      },
      { status: 500 }
    );
  }
}

/**
 * Run yt-dlp as subprocess to extract playlist/video information
 */
async function runYtDlp(url: string): Promise<YtDlpOutput[]> {
  return new Promise((resolve, reject) => {
    // Use the virtual environment's yt-dlp
    const ytdlpPath = '/home/musyonchez/Code/yt/ytdlp_env/bin/yt-dlp';
    
    // Extract video information in JSON format
    // For playlists, limit to first 10 videos for testing
    const args = [
      '--flat-playlist',
      '--dump-single-json',
      '--playlist-end', '10',
      url
    ];

    console.log('Running:', ytdlpPath, args.join(' '));

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
      console.log('yt-dlp stderr:', stderr);
      
      if (code !== 0) {
        reject(new Error(`yt-dlp failed with exit code ${code}: ${stderr}`));
        return;
      }

      try {
        // Parse JSON output - single JSON object containing playlist or video data
        const data = JSON.parse(stdout.trim());
        const results: YtDlpOutput[] = [];
        
        if (data._type === 'playlist' && data.entries) {
          // Handle playlist
          for (const entry of data.entries) {
            results.push({
              id: entry.id || '',
              title: entry.title || 'Unknown Title',
              uploader: entry.uploader || entry.channel || 'Unknown Uploader',
              duration: entry.duration || 0,
              view_count: entry.view_count || 0,
              upload_date: entry.upload_date || '',
              thumbnail: entry.thumbnails?.[0]?.url || '',
              webpage_url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`
            });
          }
        } else {
          // Handle single video
          results.push({
            id: data.id || '',
            title: data.title || 'Unknown Title',
            uploader: data.uploader || data.channel || 'Unknown Uploader',
            duration: data.duration || 0,
            view_count: data.view_count || 0,
            upload_date: data.upload_date || '',
            thumbnail: data.thumbnail || data.thumbnails?.[0]?.url || '',
            webpage_url: data.webpage_url || `https://www.youtube.com/watch?v=${data.id}`
          });
        }

        console.log(`Successfully parsed ${results.length} videos`);
        resolve(results);
        
      } catch (error) {
        reject(new Error(`Failed to parse yt-dlp output: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    ytdlp.on('error', (error) => {
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      ytdlp.kill();
      reject(new Error('yt-dlp operation timed out'));
    }, 30000); // 30 second timeout
  });
}

// GET method for testing endpoint info
export async function GET() {
  return NextResponse.json({
    status: 'yt-dlp test endpoint is running',
    description: 'POST with { url } to test yt-dlp subprocess execution',
    note: 'This endpoint tests if yt-dlp can handle auto-generated playlists that YouTube Data API cannot access'
  });
}