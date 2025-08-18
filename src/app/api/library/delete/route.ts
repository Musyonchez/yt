import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface DeleteFromLibraryRequest {
  songIds: string[];
  userId: string;
}

interface DeleteFromLibraryResponse {
  success: boolean;
  message: string;
  deleted_count: number;
  failed_count: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<DeleteFromLibraryResponse>> {
  try {
    const { songIds, userId }: DeleteFromLibraryRequest = await request.json();
    
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

    console.log(`Deleting ${songIds.length} songs from library for user ${userId}`);

    // Delete songs from user's library
    const { data: deletedSongs, error: deleteError } = await supabaseAdmin
      .from('user_songs')
      .delete()
      .eq('user_id', userId)
      .in('id', songIds)
      .select('id');

    if (deleteError) {
      console.error('Error deleting songs:', deleteError);
      return NextResponse.json(
        { success: false, message: 'Failed to delete songs from library', deleted_count: 0, failed_count: songIds.length },
        { status: 500 }
      );
    }

    const deletedCount = deletedSongs?.length || 0;
    const failedCount = songIds.length - deletedCount;

    console.log(`Successfully deleted ${deletedCount} songs from library`);

    return NextResponse.json({
      success: true,
      message: `Removed ${deletedCount} song${deletedCount === 1 ? '' : 's'} from your library${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      deleted_count: deletedCount,
      failed_count: failedCount
    });

  } catch (error) {
    console.error('Library delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', deleted_count: 0, failed_count: 0 },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'Library delete API is running',
    endpoints: {
      POST: '/api/library/delete - Delete songs with { songIds: string[], userId: string }',
    }
  });
}