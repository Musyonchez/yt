import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { VideoInfo } from '@/lib/youtube';

interface AddToLibraryRequest {
  songs: VideoInfo[];
  userId: string; // We'll pass this from the client
}

interface AddToLibraryResponse {
  success: boolean;
  message: string;
  added_count: number;
  duplicate_count: number;
  failed_count: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<AddToLibraryResponse>> {
  try {
    const { songs, userId }: AddToLibraryRequest = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID required', added_count: 0, duplicate_count: 0, failed_count: 0 },
        { status: 401 }
      );
    }
    
    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No songs provided', added_count: 0, duplicate_count: 0, failed_count: 0 },
        { status: 400 }
      );
    }

    console.log(`Adding ${songs.length} songs to library for user ${userId}`);

    // Check for existing songs in user's library
    const videoIds = songs.map(song => song.youtube_id);
    const { data: existingSongs, error: checkError } = await supabaseAdmin
      .from('user_songs')
      .select('youtube_id')
      .eq('user_id', userId)
      .eq('group_type', 'library')
      .in('youtube_id', videoIds);

    if (checkError) {
      console.error('Error checking existing songs:', checkError);
      return NextResponse.json(
        { success: false, message: 'Database error while checking duplicates', added_count: 0, duplicate_count: 0, failed_count: 0 },
        { status: 500 }
      );
    }

    const existingVideoIds = new Set(existingSongs?.map(song => song.youtube_id) || []);
    const newSongs = songs.filter(song => !existingVideoIds.has(song.youtube_id));
    const duplicateCount = songs.length - newSongs.length;

    console.log(`Found ${duplicateCount} duplicates, adding ${newSongs.length} new songs`);

    if (newSongs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All songs are already in your library',
        added_count: 0,
        duplicate_count: duplicateCount,
        failed_count: 0
      });
    }

    // Prepare songs for insertion
    const songsToInsert = newSongs.map(song => ({
      user_id: userId,
      youtube_id: song.youtube_id,
      youtube_url: song.youtube_url,
      title: song.title || 'Unknown Title',
      artist: song.artist || 'Unknown Artist',
      duration: song.duration || '0:00',
      thumbnail_url: song.thumbnail_url || '',
      view_count: song.view_count || 0,
      upload_date: song.upload_date || new Date().toISOString(),
      channel_name: song.channel_name || 'Unknown Channel',
      group_type: 'library',
      status: 'saved',
      added_at: new Date().toISOString()
    }));

    // Insert new songs
    const { data: insertedSongs, error: insertError } = await supabaseAdmin
      .from('user_songs')
      .insert(songsToInsert)
      .select('youtube_id');

    if (insertError) {
      console.error('Error inserting songs:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to add songs to library', added_count: 0, duplicate_count: duplicateCount, failed_count: newSongs.length },
        { status: 500 }
      );
    }

    const addedCount = insertedSongs?.length || 0;
    const failedCount = newSongs.length - addedCount;

    console.log(`Successfully added ${addedCount} songs to library`);

    return NextResponse.json({
      success: true,
      message: `Added ${addedCount} song${addedCount === 1 ? '' : 's'} to your library${duplicateCount > 0 ? `, ${duplicateCount} already existed` : ''}`,
      added_count: addedCount,
      duplicate_count: duplicateCount,
      failed_count: failedCount
    });

  } catch (error) {
    console.error('Library add error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', added_count: 0, duplicate_count: 0, failed_count: 0 },
      { status: 500 }
    );
  }
}

// GET method to retrieve user's library
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user's library
    const { data: songs, error: fetchError, count } = await supabaseAdmin
      .from('user_songs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('group_type', 'library')
      .eq('status', 'saved')
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching library:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch library' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      songs: songs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}