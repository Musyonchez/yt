import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface DownloadFromLibraryRequest {
  songIds: string[];
  userId: string;
}

interface DownloadFromLibraryResponse {
  success: boolean;
  message: string;
  downloaded_count: number;
  already_downloaded_count: number;
  failed_count: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<DownloadFromLibraryResponse>> {
  try {
    const { songIds, userId }: DownloadFromLibraryRequest = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID required', downloaded_count: 0, already_downloaded_count: 0, failed_count: 0 },
        { status: 401 }
      );
    }
    
    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No song IDs provided', downloaded_count: 0, already_downloaded_count: 0, failed_count: 0 },
        { status: 400 }
      );
    }

    console.log(`Processing download for ${songIds.length} songs for user ${userId}`);

    // Get the songs from user's library with song details
    const { data: librarySongs, error: fetchError } = await supabaseAdmin
      .from('user_songs')
      .select(`
        id,
        user_id,
        song_id,
        added_at,
        songs!inner (
          id,
          youtube_id,
          youtube_url,
          title,
          artist,
          duration,
          thumbnail_url,
          view_count,
          upload_date,
          channel_name
        )
      `)
      .eq('user_id', userId)
      .in('id', songIds);

    if (fetchError) {
      console.error('Error fetching library songs:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch songs from library', downloaded_count: 0, already_downloaded_count: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    if (!librarySongs || librarySongs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid songs found in library', downloaded_count: 0, already_downloaded_count: 0, failed_count: songIds.length },
        { status: 404 }
      );
    }

    // Check for existing downloads in user_downloads table
    const { data: existingDownloads, error: checkError } = await supabaseAdmin
      .from('user_downloads')
      .select('song_id')
      .eq('user_id', userId)
      .in('song_id', librarySongs.map(song => song.song_id));

    if (checkError) {
      console.error('Error checking existing downloads:', checkError);
      return NextResponse.json(
        { success: false, message: 'Database error while checking downloads', downloaded_count: 0, already_downloaded_count: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const existingSongIds = new Set(existingDownloads?.map(download => download.song_id) || []);
    const songsToDownload = librarySongs.filter(song => !existingSongIds.has(song.song_id));
    const alreadyDownloadedCount = librarySongs.length - songsToDownload.length;

    console.log(`Found ${alreadyDownloadedCount} already downloaded, processing ${songsToDownload.length} new downloads`);

    if (songsToDownload.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All songs are already downloaded',
        downloaded_count: 0,
        already_downloaded_count: alreadyDownloadedCount,
        failed_count: 0
      });
    }

    // Create download entries for user_downloads table
    const downloadEntries = songsToDownload.map(userSong => ({
      user_id: userId,
      song_id: userSong.song_id,
      downloaded_at: new Date().toISOString()
    }));

    // Insert download entries into user_downloads
    const { data: insertedDownloads, error: insertError } = await supabaseAdmin
      .from('user_downloads')
      .insert(downloadEntries)
      .select('song_id');

    if (insertError) {
      console.error('Error inserting downloads:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to process downloads', downloaded_count: 0, already_downloaded_count: alreadyDownloadedCount, failed_count: songsToDownload.length },
        { status: 500 }
      );
    }

    const downloadedCount = insertedDownloads?.length || 0;
    const failedCount = songsToDownload.length - downloadedCount;

    console.log(`Successfully processed ${downloadedCount} downloads`);

    // TODO: In a real implementation, here you would:
    // 1. Queue the songs for actual MP3 processing using yt-dlp
    // 2. Upload processed files to cloud storage (S3, etc.)
    // 3. Update the download_url and file_size fields
    // 4. Send progress updates via WebSocket or Server-Sent Events

    return NextResponse.json({
      success: true,
      message: `Downloaded ${downloadedCount} song${downloadedCount === 1 ? '' : 's'}${alreadyDownloadedCount > 0 ? `, ${alreadyDownloadedCount} already downloaded` : ''}${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      downloaded_count: downloadedCount,
      already_downloaded_count: alreadyDownloadedCount,
      failed_count: failedCount
    });

  } catch (error) {
    console.error('Download processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', downloaded_count: 0, already_downloaded_count: 0, failed_count: 0 },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'Library download API is running',
    endpoints: {
      POST: '/api/library/download - Process downloads with { songIds: string[], userId: string }',
    },
    note: 'This endpoint simulates MP3 processing. In production, it would queue actual yt-dlp jobs.'
  });
}