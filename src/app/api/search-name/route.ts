import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json();
    
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search term is required' },
        { status: 400 }
      );
    }

    const results = await searchYouTube(searchTerm.trim());
    
    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      searchTerm: searchTerm.trim()
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search videos. Please try again.',
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

async function searchYouTube(searchTerm: string): Promise<VideoResult[]> {
  return new Promise((resolve, reject) => {
    const ytdlpProcess = spawn('yt-dlp', [
      `ytsearch50:${searchTerm}`,
      '--dump-json',
      '--no-warnings',
      '--no-playlist'
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
            return {
              id: String(data.id || ''),
              title: String(data.title || 'Unknown Title'),
              uploader: String(data.uploader || 'Unknown Channel'),
              duration: Number(data.duration || 0),
              duration_string: String(data.duration_string || 'Unknown'),
              view_count: Number(data.view_count || 0),
              upload_date: String(data.upload_date || ''),
              thumbnail: String(data.thumbnail || ''),
              webpage_url: String(data.webpage_url || ''),
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
        reject(new Error('Failed to parse search results'));
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
      reject(new Error('Search timed out. Please try again.'));
    }, 30000);
  });
}