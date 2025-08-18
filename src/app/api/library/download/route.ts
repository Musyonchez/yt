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

    // Get the songs from user's library
    const { data: librarySongs, error: fetchError } = await supabaseAdmin
      .from('user_songs')
      .select('*')
      .eq('user_id', userId)
      .eq('group_type', 'library')
      .eq('status', 'saved')
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

    // Check for existing downloads (same songs but with group_type = 'downloaded')
    const { data: existingDownloads, error: checkError } = await supabaseAdmin
      .from('user_songs')
      .select('youtube_id')
      .eq('user_id', userId)
      .eq('group_type', 'downloaded')
      .in('youtube_id', librarySongs.map(song => song.youtube_id));

    if (checkError) {
      console.error('Error checking existing downloads:', checkError);
      return NextResponse.json(
        { success: false, message: 'Database error while checking downloads', downloaded_count: 0, already_downloaded_count: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const existingSongIds = new Set(existingDownloads?.map(download => download.song_id) || []);
    const songsToDownload = librarySongs.filter(song => !existingSongIds.has(song.id));
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

    // First, insert songs into the songs table if they don't exist
    const songsData = songsToDownload.map(song => ({
      youtube_url: song.youtube_url,
      youtube_id: song.youtube_id,
      title: song.title,
      artist: song.artist || 'Unknown Artist',
      duration: song.duration || '0:00',
      thumbnail_url: song.thumbnail_url || '',
      view_count: song.view_count || 0,
      total_downloads: 0
    }));

    // Upsert songs (insert if not exists, ignore if exists)
    const { data: upsertedSongs, error: songsError } = await supabaseAdmin
      .from('songs')
      .upsert(songsData, { onConflict: 'youtube_id', ignoreDuplicates: true })
      .select('id, youtube_id');

    if (songsError) {
      console.error('Error upserting songs:', songsError);
      return NextResponse.json(
        { success: false, message: 'Failed to process songs', downloaded_count: 0, already_downloaded_count: alreadyDownloadedCount, failed_count: songsToDownload.length },
        { status: 500 }
      );
    }

    // Get the song IDs for the downloads
    const { data: existingSongs, error: fetchSongsError } = await supabaseAdmin
      .from('songs')
      .select('id, youtube_id')
      .in('youtube_id', songsToDownload.map(song => song.youtube_id));

    if (fetchSongsError || !existingSongs) {
      console.error('Error fetching songs for downloads:', fetchSongsError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch songs for download', downloaded_count: 0, already_downloaded_count: alreadyDownloadedCount, failed_count: songsToDownload.length },
        { status: 500 }
      );
    }

    // Create download entries for user_downloads table
    const downloadEntries = existingSongs.map(song => ({
      user_id: userId,
      song_id: song.id,
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