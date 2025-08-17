import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET endpoint to retrieve user's library video IDs for filtering search results
 * Returns only the youtube_id array for performance
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { video_ids: [] }, // Return empty array for unauthenticated users
        { status: 200 }
      );
    }

    // Get only youtube_id from user's library for performance
    const { data: songs, error: fetchError } = await supabaseAdmin
      .from('user_songs')
      .select('youtube_id')
      .eq('user_id', userId)
      .eq('group_type', 'library')
      .eq('status', 'saved');

    if (fetchError) {
      console.error('Error fetching library video IDs:', fetchError);
      return NextResponse.json(
        { video_ids: [] },
        { status: 200 } // Return empty array on error to not break search
      );
    }

    const videoIds = songs?.map(song => song.youtube_id) || [];
    
    return NextResponse.json({
      video_ids: videoIds
    });

  } catch (error) {
    console.error('Library video IDs fetch error:', error);
    return NextResponse.json(
      { video_ids: [] },
      { status: 200 } // Return empty array on error to not break search
    );
  }
}