import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface DeleteDownloadsRequest {
  songIds: string[];
  userId: string;
}

interface DeleteDownloadsResponse {
  success: boolean;
  message: string;
  deleted_count: number;
  failed_count: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<DeleteDownloadsResponse>> {
  try {
    const { songIds, userId }: DeleteDownloadsRequest = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID required', deleted_count: 0, failed_count: 0 },
        { status: 401 }
      );
    }
    
    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No song IDs provided', deleted_count: 0, failed_count: 0 },
        { status: 400 }
      );
    }

    console.log(`Deleting ${songIds.length} downloads for user ${userId}`);

    // Delete downloads from user's downloads table
    // Note: songIds here are user_songs.id, so we need to find the corresponding downloads
    const { data: userSongs, error: fetchError } = await supabaseAdmin
      .from('user_songs')
      .select('song_id')
      .eq('user_id', userId)
      .in('id', songIds);

    if (fetchError || !userSongs) {
      console.error('Error fetching user songs:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Failed to find songs', deleted_count: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const actualSongIds = userSongs.map(us => us.song_id);

    // Delete from user_downloads table
    const { data: deletedDownloads, error: deleteError } = await supabaseAdmin
      .from('user_downloads')
      .delete()
      .eq('user_id', userId)
      .in('song_id', actualSongIds)
      .select('id');

    if (deleteError) {
      console.error('Error deleting downloads:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete downloads', deleted_count: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const deletedCount = deletedDownloads?.length || 0;
    const failedCount = songIds.length - deletedCount;

    console.log(`Successfully deleted ${deletedCount} downloads`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} download${deletedCount === 1 ? '' : 's'}${failedCount > 0 ? `, ${failedCount} not found` : ''}`,
      deleted_count: deletedCount,
      failed_count: failedCount
    });

  } catch (error) {
    console.error('Downloads delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', deleted_count: 0, failed_count: 0 },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'Downloads delete API is running',
    endpoints: {
      POST: '/api/downloads/delete - Delete downloads with { songIds: string[], userId: string }',
    }
  });
}