import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();
    
    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!youtubeRegex.test(videoUrl.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube video URL' },
        { status: 400 }
      );
    }

    const result = await processVideo(videoUrl.trim());
    
    return NextResponse.json({
      success: true,
      result,
      videoUrl: videoUrl.trim()
    });

  } catch (error) {
    console.error('Video Processing API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process video. Please try again.',
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

async function processVideo(videoUrl: string): Promise<VideoResult | null> {
  return new Promise((resolve, reject) => {
    const ytdlpProcess = spawn('yt-dlp', [
      videoUrl,
      '--dump-json',
      '--no-warnings',
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
        // Parse JSON output from yt-dlp
        const lines = stdout.trim().split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          resolve(null);
          return;
        }

        // Take the first (and should be only) line for single video
        const data = JSON.parse(lines[0]) as Record<string, unknown>;
        
        // Extract thumbnail URL
        const thumbnail = Array.isArray(data.thumbnails) && data.thumbnails.length > 0 
          ? String(data.thumbnails[data.thumbnails.length - 1]?.url || '') 
          : '';
        
        const result: VideoResult = {
          id: String(data.id || ''),
          title: String(data.title || 'Unknown Title'),
          uploader: String(data.uploader || data.channel || 'Unknown Channel'),
          duration: Number(data.duration || 0),
          duration_string: String(data.duration_string || 'Unknown'),
          view_count: Number(data.view_count || 0),
          upload_date: String(data.upload_date || ''),
          thumbnail: thumbnail,
          webpage_url: String(data.webpage_url || data.url || videoUrl),
          description: String(data.description || '')
        };

        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse yt-dlp output:', parseError);
        reject(new Error('Failed to parse video information'));
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

    // Set timeout for the process (30 seconds)
    setTimeout(() => {
      ytdlpProcess.kill();
      reject(new Error('Video processing timed out. Please try again.'));
    }, 30000);
  });
}