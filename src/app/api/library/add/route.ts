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

    let addedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;

    for (const song of songs) {
      try {
        // Step 1: Check if song exists in songs table, if not create it
        const { data: existingSong, error: upsertError } = await supabaseAdmin
          .from('songs')
          .upsert({
            youtube_id: song.youtube_id,
            youtube_url: song.youtube_url,
            title: song.title || 'Unknown Title',
            artist: song.artist || 'Unknown Artist',
            duration: song.duration || '0:00',
            thumbnail_url: song.thumbnail_url || '',
            view_count: song.view_count || 0,
            upload_date: song.upload_date || new Date().toISOString(),
            channel_name: song.channel_name || 'Unknown Channel',
            total_downloads: 0
          }, { 
            onConflict: 'youtube_id',
            ignoreDuplicates: false 
          })
          .select('id')
          .single();

        if (upsertError || !existingSong) {
          console.error('Error upserting song:', upsertError);
          failedCount++;
          continue;
        }

        const songId = existingSong.id;

        // Step 2: Check if user already has this song in library
        const { data: existingUserSong, error: userSongCheckError } = await supabaseAdmin
          .from('user_songs')
          .select('id')
          .eq('user_id', userId)
          .eq('song_id', songId)
          .single();

        if (userSongCheckError && userSongCheckError.code !== 'PGRST116') {
          console.error('Error checking user song:', userSongCheckError);
          failedCount++;
          continue;
        }

        // Step 3: If user doesn't have this song, add to library
        if (!existingUserSong) {
          const { error: insertUserSongError } = await supabaseAdmin
            .from('user_songs')
            .insert({
              user_id: userId,
              song_id: songId
            });

          if (insertUserSongError) {
            console.error('Error adding song to user library:', insertUserSongError);
            failedCount++;
            continue;
          }

          addedCount++;
        } else {
          duplicateCount++;
        }

      } catch (error) {
        console.error('Error processing song:', error);
        failedCount++;
      }
    }

    console.log(`Successfully processed all songs: ${addedCount} added, ${duplicateCount} duplicates, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      message: `Added ${addedCount} song${addedCount === 1 ? '' : 's'} to your library${duplicateCount > 0 ? `, ${duplicateCount} already existed` : ''}${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
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

    // Get pagination and search parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // Build query with JOIN to get song details
    let query = supabaseAdmin
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
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Add search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`songs.title.ilike.%${searchTerm}%,songs.artist.ilike.%${searchTerm}%,songs.channel_name.ilike.%${searchTerm}%`);
    }

    // Execute query with pagination
    const { data: userSongs, error: fetchError, count } = await query
      .order('added_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching library:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch library' },
        { status: 500 }
      );
    }

    // Flatten the data structure for the frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const songs = userSongs?.map((userSong: any) => ({
      id: userSong.id,
      user_id: userSong.user_id,
      song_id: userSong.song_id,
      added_at: userSong.added_at,
      // Flatten song details
      youtube_id: userSong.songs.youtube_id,
      youtube_url: userSong.songs.youtube_url,
      title: userSong.songs.title,
      artist: userSong.songs.artist,
      duration: userSong.songs.duration,
      thumbnail_url: userSong.songs.thumbnail_url,
      view_count: userSong.songs.view_count,
      upload_date: userSong.songs.upload_date,
      channel_name: userSong.songs.channel_name
    })) || [];

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