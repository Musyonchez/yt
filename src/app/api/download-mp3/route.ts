import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface DownloadMP3Request {
  songId: string;
  userId: string;
}

interface DownloadMP3Response {
  success: boolean;
  message: string;
  download_url?: string;
  file_name?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<DownloadMP3Response>> {
  try {
    const { songId, userId }: DownloadMP3Request = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID required' },
        { status: 401 }
      );
    }
    
    if (!songId) {
      return NextResponse.json(
        { success: false, message: 'Song ID required' },
        { status: 400 }
      );
    }

    console.log(`Processing MP3 download for song ${songId}, user ${userId}`);

    // Get song details from user's library
    const { data: userSong, error: fetchError } = await supabaseAdmin
      .from('user_songs')
      .select(`
        id,
        user_id,
        song_id,
        songs!inner (
          id,
          youtube_id,
          youtube_url,
          title,
          artist,
          duration
        )
      `)
      .eq('user_id', userId)
      .eq('id', songId)
      .single();

    if (fetchError || !userSong) {
      console.error('Error fetching song:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Song not found in your library' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const song = (userSong as any).songs;
    const youtubeUrl = song.youtube_url;
    const sanitizedTitle = song.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    const fileName = `${sanitizedTitle}_${song.youtube_id}.mp3`;
    const outputPath = path.join(process.cwd(), 'public', 'downloads', fileName);

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log('File already exists, serving existing file');
      
      // Update database to mark as downloaded
      await supabaseAdmin
        .from('user_downloads')
        .upsert({
          user_id: userId,
          song_id: song.id,
          downloaded_at: new Date().toISOString()
        }, { onConflict: 'user_id,song_id' });

      return NextResponse.json({
        success: true,
        message: 'File ready for download',
        download_url: `/downloads/${fileName}`,
        file_name: fileName
      });
    }

    // Use yt-dlp to download and convert to MP3
    const ytdlpPath = path.join(process.cwd(), 'ytdlp_env', 'bin', 'yt-dlp');
    const command = [
      ytdlpPath,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '192K',
      '--output', outputPath.replace('.mp3', '.%(ext)s'),
      '--no-playlist',
      '--embed-metadata',
      `"${youtubeUrl}"`
    ].join(' ');

    console.log('Executing yt-dlp command:', command);

    // Execute yt-dlp command
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000 // 5 minutes timeout
    });

    console.log('yt-dlp stdout:', stdout);
    if (stderr) {
      console.log('yt-dlp stderr:', stderr);
    }

    // Check if the file was created
    if (!fs.existsSync(outputPath)) {
      console.error('MP3 file was not created');
      return NextResponse.json(
        { success: false, message: 'Failed to generate MP3 file' },
        { status: 500 }
      );
    }

    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeBytes = stats.size;

    // Update database to mark as downloaded
    await supabaseAdmin
      .from('user_downloads')
      .upsert({
        user_id: userId,
        song_id: song.id,
        downloaded_at: new Date().toISOString()
      }, { onConflict: 'user_id,song_id' });

    console.log(`MP3 file created successfully: ${fileName} (${fileSizeBytes} bytes)`);

    return NextResponse.json({
      success: true,
      message: 'MP3 file generated and ready for download',
      download_url: `/downloads/${fileName}`,
      file_name: fileName
    });

  } catch (error) {
    console.error('MP3 download error:', error);
    
    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { success: false, message: 'Download timeout - video may be too long or unavailable' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error during MP3 generation' },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'MP3 download API is running',
    endpoints: {
      POST: '/api/download-mp3 - Generate and download MP3 with { songId: string, userId: string }',
    },
    note: 'Uses yt-dlp to generate actual MP3 files'
  });
}