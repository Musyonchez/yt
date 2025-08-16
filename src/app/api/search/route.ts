import { NextRequest, NextResponse } from 'next/server';
import { 
  extractVideoId, 
  extractPlaylistId, 
  determineSearchType,
  sanitizeSearchInput,
  getThumbnailUrl,
  getCleanVideoUrl,
  VideoInfo 
} from '@/lib/youtube';

export async function POST(request: NextRequest) {
  try {
    const { query, type } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const sanitizedQuery = sanitizeSearchInput(query);
    const searchType = type || determineSearchType(sanitizedQuery);

    switch (searchType) {
      case 'video':
        return await handleVideoSearch(sanitizedQuery);
      case 'playlist':
        return await handlePlaylistSearch(sanitizedQuery);
      case 'text':
        return await handleTextSearch(sanitizedQuery);
      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleVideoSearch(url: string): Promise<NextResponse> {
  const videoId = extractVideoId(url);
  
  if (!videoId) {
    return NextResponse.json(
      { error: 'Invalid YouTube video URL' },
      { status: 400 }
    );
  }

  try {
    // TODO: Replace with actual YouTube API call
    // For now, return mock data based on video ID
    const mockVideo: VideoInfo = {
      youtube_id: videoId,
      youtube_url: getCleanVideoUrl(videoId),
      title: 'Sample Video Title',
      artist: 'Sample Artist',
      duration: '3:45',
      thumbnail_url: getThumbnailUrl(videoId),
      view_count: 1234567,
      upload_date: new Date().toISOString(),
      channel_name: 'Sample Channel'
    };

    return NextResponse.json({
      type: 'video',
      results: [mockVideo]
    });
  } catch (error) {
    console.error('Video search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}

async function handlePlaylistSearch(url: string): Promise<NextResponse> {
  const playlistId = extractPlaylistId(url);
  
  if (!playlistId) {
    return NextResponse.json(
      { error: 'Invalid YouTube playlist URL' },
      { status: 400 }
    );
  }

  try {
    // TODO: Replace with actual YouTube API call
    // For now, return mock playlist data
    const mockVideos: VideoInfo[] = [
      {
        youtube_id: 'dQw4w9WgXcQ',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        duration: '3:33',
        thumbnail_url: getThumbnailUrl('dQw4w9WgXcQ'),
        view_count: 1000000000,
        upload_date: '2009-10-25T00:00:00Z',
        channel_name: 'RickAstleyVEVO'
      },
      {
        youtube_id: 'L_jWHffIx5E',
        youtube_url: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
        title: 'Smells Like Teen Spirit',
        artist: 'Nirvana',
        duration: '5:01',
        thumbnail_url: getThumbnailUrl('L_jWHffIx5E'),
        view_count: 500000000,
        upload_date: '2012-02-01T00:00:00Z',
        channel_name: 'NirvanaVEVO'
      },
      {
        youtube_id: 'fJ9rUzIMcZQ',
        youtube_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        duration: '5:55',
        thumbnail_url: getThumbnailUrl('fJ9rUzIMcZQ'),
        view_count: 800000000,
        upload_date: '2011-05-15T00:00:00Z',
        channel_name: 'QueenOfficial'
      }
    ];

    return NextResponse.json({
      type: 'playlist',
      playlistInfo: {
        title: 'Sample Playlist',
        video_count: mockVideos.length
      },
      results: mockVideos
    });
  } catch (error) {
    console.error('Playlist search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist information' },
      { status: 500 }
    );
  }
}

async function handleTextSearch(query: string): Promise<NextResponse> {
  try {
    // TODO: Replace with actual YouTube API call
    // For now, return mock search results
    const mockResults: VideoInfo[] = [
      {
        youtube_id: 'dQw4w9WgXcQ',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: `Search Result for "${query}" - Song 1`,
        artist: 'Artist 1',
        duration: '3:33',
        thumbnail_url: getThumbnailUrl('dQw4w9WgXcQ'),
        view_count: 1000000,
        upload_date: new Date().toISOString(),
        channel_name: 'Music Channel 1'
      },
      {
        youtube_id: 'L_jWHffIx5E',
        youtube_url: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
        title: `Another result for "${query}" - Song 2`,
        artist: 'Artist 2',
        duration: '4:12',
        thumbnail_url: getThumbnailUrl('L_jWHffIx5E'),
        view_count: 2500000,
        upload_date: new Date().toISOString(),
        channel_name: 'Music Channel 2'
      },
      {
        youtube_id: 'fJ9rUzIMcZQ',
        youtube_url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        title: `Third result for "${query}" - Song 3`,
        artist: 'Artist 3',
        duration: '2:58',
        thumbnail_url: getThumbnailUrl('fJ9rUzIMcZQ'),
        view_count: 750000,
        upload_date: new Date().toISOString(),
        channel_name: 'Music Channel 3'
      }
    ];

    return NextResponse.json({
      type: 'text',
      query: query,
      results: mockResults
    });
  } catch (error) {
    console.error('Text search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'Search API is running',
    endpoints: {
      POST: '/api/search - Perform search with { query, type? }',
      supportedTypes: ['video', 'playlist', 'text', 'auto-detect']
    }
  });
}