import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface DeleteCompletelyRequest {
  songIds: string[];
  userId: string;
}

interface DeleteCompletelyResponse {
  success: boolean;
  message: string;
  library_deleted: number;
  downloads_deleted: number;
  failed_count: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<DeleteCompletelyResponse>> {
  try {
    const { songIds, userId }: DeleteCompletelyRequest = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID required', library_deleted: 0, downloads_deleted: 0, failed_count: 0 },
        { status: 401 }
      );
    }
    
    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No song IDs provided', library_deleted: 0, downloads_deleted: 0, failed_count: 0 },
        { status: 400 }
      );
    }

    console.log(`Deleting ${songIds.length} songs completely for user ${userId}`);

    // Get the actual song_ids from user_songs table
    const { data: userSongs, error: fetchError } = await supabaseAdmin
      .from('user_songs')
      .select('song_id')
      .eq('user_id', userId)
      .in('id', songIds);

    if (fetchError || !userSongs) {
      console.error('Error fetching user songs:', fetchError);
      return NextResponse.json(
        { success: false, message: 'Failed to find songs', library_deleted: 0, downloads_deleted: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const actualSongIds = userSongs.map(us => us.song_id);

    // Delete from user_downloads first
    const { data: deletedDownloads, error: downloadDeleteError } = await supabaseAdmin
      .from('user_downloads')
      .delete()
      .eq('user_id', userId)
      .in('song_id', actualSongIds)
      .select('id');

    if (downloadDeleteError) {
      console.error('Error deleting downloads:', downloadDeleteError);
    }

    // Delete from user_songs (library)
    const { data: deletedLibrary, error: libraryDeleteError } = await supabaseAdmin
      .from('user_songs')
      .delete()
      .eq('user_id', userId)
      .in('id', songIds)
      .select('id');

    if (libraryDeleteError) {
      console.error('Error deleting from library:', libraryDeleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete from library', library_deleted: 0, downloads_deleted: deletedDownloads?.length || 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const libraryDeleted = deletedLibrary?.length || 0;
    const downloadsDeleted = deletedDownloads?.length || 0;
    const failedCount = songIds.length - libraryDeleted;

    console.log(`Successfully deleted ${libraryDeleted} from library and ${downloadsDeleted} downloads`);

    return NextResponse.json({
      success: true,
      message: `Completely removed ${libraryDeleted} song${libraryDeleted === 1 ? '' : 's'} (${downloadsDeleted} download${downloadsDeleted === 1 ? '' : 's'} also deleted)${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      library_deleted: libraryDeleted,
      downloads_deleted: downloadsDeleted,
      failed_count: failedCount
    });

  } catch (error) {
    console.error('Complete delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', library_deleted: 0, downloads_deleted: 0, failed_count: 0 },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'Complete song delete API is running',
    endpoints: {
      POST: '/api/user/delete-song - Delete completely with { songIds: string[], userId: string }',
    },
    note: 'Deletes from both user_songs (library) and user_downloads tables'
  });
}