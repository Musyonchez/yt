import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  extractVideoId, 
  extractPlaylistId, 
  determineSearchType,
  sanitizeSearchInput
} from '@/lib/youtube';
import {
  searchYouTubeVideos,
  getYouTubeVideoInfo
} from '@/lib/youtube-api';
import { getPlaylistWithYtDlp } from '@/lib/ytdlp';
import { VideoInfo } from '@/lib/youtube';

/**
 * Get user's library video IDs for filtering search results
 */
async function getUserLibraryVideoIds(userId: string): Promise<string[]> {
  try {
    const { data: songs, error } = await supabaseAdmin
      .from('user_songs')
      .select('youtube_id')
      .eq('user_id', userId)
      .eq('group_type', 'library')
      .eq('status', 'saved');

    if (error) {
      console.error('Error fetching library video IDs:', error);
      return [];
    }

    return songs?.map(song => song.youtube_id) || [];
  } catch (error) {
    console.error('Error in getUserLibraryVideoIds:', error);
    return [];
  }
}

/**
 * Filter out videos that are already in user's library
 */
function filterLibraryDuplicates(results: VideoInfo[], libraryVideoIds: string[]): VideoInfo[] {
  if (libraryVideoIds.length === 0) return results;
  
  const librarySet = new Set(libraryVideoIds);
  return results.filter(video => !librarySet.has(video.youtube_id));
}

export async function POST(request: NextRequest) {
  try {
    const { query, type, userId } = await request.json();

    console.log('Search API called with:', { query, type, userId });

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const sanitizedQuery = sanitizeSearchInput(query);
    const searchType = type || determineSearchType(sanitizedQuery);

    console.log('Determined search type:', searchType, 'for query:', sanitizedQuery);

    // Check if YouTube API key is configured
    if (!process.env.YOUTUBE_API_KEY) {
      console.error('YouTube API key not configured');
      return NextResponse.json(
        { error: 'YouTube API not configured. Please add YOUTUBE_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    console.log('YouTube API key found, proceeding with search...');

    // Get user's library video IDs for filtering (if provided)
    const libraryPromise = userId ? getUserLibraryVideoIds(userId) : Promise.resolve([]);

    let searchResultsPromise: Promise<NextResponse>;
    switch (searchType) {
      case 'video':
        searchResultsPromise = handleVideoSearch(sanitizedQuery);
        break;
      case 'playlist':
        searchResultsPromise = handlePlaylistSearch(sanitizedQuery);
        break;
      case 'text':
        searchResultsPromise = handleTextSearch(sanitizedQuery);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        );
    }

    // Wait for both search results and library data
    const [searchResponse, libraryVideoIds] = await Promise.all([
      searchResultsPromise,
      libraryPromise
    ]);

    // If search failed, return the error response
    if (!searchResponse.ok) {
      return searchResponse;
    }

    // Filter out library duplicates if user is authenticated
    if (userId && libraryVideoIds.length > 0) {
      const searchData = await searchResponse.json();
      if (searchData.results) {
        const originalCount = searchData.results.length;
        searchData.results = filterLibraryDuplicates(searchData.results, libraryVideoIds);
        const filteredCount = searchData.results.length;
        
        console.log(`Filtered ${originalCount - filteredCount} library duplicates, showing ${filteredCount} new results`);
      }
      
      return NextResponse.json(searchData);
    }

    return searchResponse;
    
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
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
    const videoInfo = await getYouTubeVideoInfo(videoId);
    
    if (!videoInfo) {
      return NextResponse.json(
        { error: 'Video not found or unavailable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      type: 'video',
      results: [videoInfo]
    });
  } catch (error) {
    console.error('Video search error:', error);
    
    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'YouTube API not configured. Please add YOUTUBE_API_KEY to environment variables.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch video information' },
      { status: 500 }
    );
  }
}

async function handlePlaylistSearch(url: string): Promise<NextResponse> {
  const playlistId = extractPlaylistId(url);
  
  console.log('Playlist search - URL:', url, 'Extracted ID:', playlistId);
  
  if (!playlistId) {
    return NextResponse.json(
      { error: 'Invalid YouTube playlist URL' },
      { status: 400 }
    );
  }

  try {
    console.log('Using yt-dlp for playlist:', playlistId);
    const playlistData = await getPlaylistWithYtDlp(url, 50);
    console.log('yt-dlp response:', `${playlistData.results.length} videos extracted`);

    return NextResponse.json({
      type: 'playlist',
      playlistInfo: playlistData.playlistInfo,
      results: playlistData.results
    });
  } catch (error) {
    console.error('Playlist search error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    
    return NextResponse.json(
      { error: `Failed to fetch playlist information: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}


async function handleTextSearch(query: string): Promise<NextResponse> {
  try {
    const searchResults = await searchYouTubeVideos(query, 25);

    return NextResponse.json({
      type: 'text',
      query: query,
      results: searchResults.results,
      pageInfo: searchResults.pageInfo
    });
  } catch (error) {
    console.error('Text search error:', error);
    
    // Check if it's an API key issue
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'YouTube API not configured. Please add YOUTUBE_API_KEY to environment variables.' },
        { status: 500 }
      );
    }
    
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